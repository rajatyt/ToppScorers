import express from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import TeacherProfile from '../models/TeacherProfile.js';
import StudentProfile from '../models/StudentProfile.js';
import ActiveSession from '../models/ActiveSession.js';
import ConnectionRequest from '../models/ConnectionRequest.js';
import ProfileViewLog from '../models/ProfileViewLog.js';
import SavedProfile from '../models/SavedProfile.js';
import { authenticate } from '../middleware/auth.js';
import { serializeProfile } from '../utils/serializeProfile.js';
import { 
  createSessionAndTokens, 
  clearAuthCookies, 
  verifyAndReissueAccessToken,
  createAdminSessionAndTokens,
  clearAdminCookies
} from '../utils/tokenService.js';
import crypto from 'crypto';
import { validateUniqueEmail, validateUniquePhone } from '../utils/identityValidator.js';
import { generateTeacherJobId, generateStudentJobId } from '../utils/jobIdHelper.js';
import { forgotPasswordLimiter } from '../middleware/rateLimiter.js';
import { sendPasswordResetEmail } from '../utils/emailService.js';

const router = express.Router();

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      role,
      dateOfBirth,
      parentGuardianConsent,
      consentGiven,
      city,
      area
    } = req.body;
    
    if (!['student', 'teacher'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be student or teacher.' });
    }

    if (consentGiven === false) {
      return res.status(400).json({ message: 'You must accept the terms and consent to data processing under DPDP Act 2023.' });
    }

    const emailValidation = await validateUniqueEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({ message: emailValidation.message });
    }

    let validatedPhone = '';
    if (phone && phone.trim()) {
      const phoneValidation = await validateUniquePhone(phone, null, true);
      if (!phoneValidation.isValid) {
        return res.status(400).json({ message: phoneValidation.message });
      }
      validatedPhone = phoneValidation.phone;
    }

    const user = await User.create({
      name,
      email: emailValidation.email,
      phone: validatedPhone,
      passwordHash: password,
      role,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      parentGuardianConsent: Boolean(parentGuardianConsent),
      consentGiven: true,
      consentTimestamp: new Date()
    });

    let profile;
    const initialCity = city ? city.trim() : '';
    const initialArea = area ? area.trim() : '';

    if (role === 'teacher') {
      const jobId = await generateTeacherJobId();
      profile = await TeacherProfile.create({ 
        userId: user._id,
        jobId,
        location: { city: initialCity },
        area: initialArea,
        approvalStatus: 'pending',
        verificationStatus: 'pending',
        isVerified: false
      });
    } else {
      const jobId = await generateStudentJobId();
      profile = await StudentProfile.create({ 
        userId: user._id,
        jobId,
        location: { city: initialCity },
        area: initialArea
      });
    }

    const { accessToken } = await createSessionAndTokens(user, req, res);

    const userWithoutPassword = await User.findById(user._id).select('-passwordHash');
    res.status(201).json({ user: userWithoutPassword, profile, token: accessToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated or deleted. Please contact support.' });
    }

    const { accessToken } = await createSessionAndTokens(user, req, res);

    const userWithoutPassword = await User.findById(user._id).select('-passwordHash');
    let profile = null;
    if (user.role === 'teacher') profile = await TeacherProfile.findOne({ userId: user._id });
    else if (user.role === 'student') profile = await StudentProfile.findOne({ userId: user._id });

    res.json({ user: userWithoutPassword, profile, token: accessToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', forgotPasswordLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    // Standardized response message to prevent account enumeration
    const genericSuccessMsg = 'If an account exists with that email address, a password reset link has been dispatched.';

    if (!user) {
      return res.json({ message: genericSuccessMsg });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'This account is deactivated or suspended. Please contact support.' });
    }

    // Generate cryptographically secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Token expires in 15 minutes
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

    const emailResult = await sendPasswordResetEmail({
      toEmail: user.email,
      userName: user.name,
      resetUrl,
      clientUrl
    });

    const responsePayload = {
      message: genericSuccessMsg
    };

    // Include devResetUrl in non-production environments to streamline testing
    if (process.env.NODE_ENV !== 'production' || emailResult.devMode) {
      responsePayload.devResetUrl = resetUrl;
    }

    return res.json(responsePayload);
  } catch (error) {
    console.error('[Auth] forgot-password error:', error);
    res.status(500).json({ message: 'Unable to process password reset request at this time' });
  }
});

// POST /api/auth/verify-reset-token
router.post('/verify-reset-token', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ valid: false, message: 'Reset token is required' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ valid: false, message: 'Password reset link is invalid or has expired.' });
    }

    // Obfuscate email for UI preview (e.g., r***t@gmail.com)
    const emailParts = user.email.split('@');
    const namePart = emailParts[0];
    const domainPart = emailParts[1];
    const maskedName = namePart.length <= 2 
      ? namePart[0] + '***' 
      : namePart[0] + '***' + namePart[namePart.length - 1];
    const maskedEmail = `${maskedName}@${domainPart}`;

    return res.json({ valid: true, maskedEmail });
  } catch (error) {
    res.status(500).json({ valid: false, message: error.message });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset link is invalid or has expired.' });
    }

    // Set new password (pre-save hook will hash it with bcrypt)
    user.passwordHash = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Security best practice: invalidate active sessions
    await ActiveSession.deleteMany({ userId: user._id });

    return res.json({ message: 'Password has been reset successfully. You may now sign in with your new password.' });
  } catch (error) {
    console.error('[Auth] reset-password error:', error);
    res.status(500).json({ message: error.message || 'Failed to reset password' });
  }
});

// POST /api/auth/google
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google', async (req, res) => {
  try {
    const { credential, role, consentGiven, city, area } = req.body;
    if (!credential) {
      return res.status(400).json({ message: 'Google credential token is required' });
    }

    let payload = null;
    try {
      if (process.env.GOOGLE_CLIENT_ID) {
        const ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
      } else {
        payload = jwt.decode(credential);
      }
    } catch (verifyErr) {
      payload = jwt.decode(credential);
    }

    if (!payload || !payload.email) {
      return res.status(400).json({ message: 'Failed to verify Google credential token' });
    }

    const { email, name, picture, sub: googleId } = payload;
    let user = await User.findOne({ email: email.toLowerCase() });

    // Existing user: sign in
    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        user.isGoogleAuth = true;
        if (!user.avatar && picture) user.avatar = picture;
        await user.save();
      }

      let profile = null;
      if (user.role === 'teacher') profile = await TeacherProfile.findOne({ userId: user._id });
      else if (user.role === 'student') profile = await StudentProfile.findOne({ userId: user._id });

      // If existing user provided city/area now (or needed location), update their profile
      if (city && area && profile) {
        profile.location = profile.location || {};
        profile.location.city = city.trim();
        profile.area = area.trim();
        await profile.save();
      }

      // If user profile has no location and none was submitted in this request, ask for location
      if (profile && (!profile.location?.city || !profile.area)) {
        return res.status(200).json({
          needsLocation: true,
          isNewUser: false,
          role: user.role,
          name: user.name,
          email: user.email,
          picture: user.avatar || picture,
          message: 'District and area setup required'
        });
      }

      const { accessToken } = await createSessionAndTokens(user, req, res);
      const userWithoutPassword = await User.findById(user._id).select('-passwordHash');
      return res.json({ user: userWithoutPassword, profile, token: accessToken });
    }

    // New user without role or location (District & Area required)
    if (!role || !['student', 'teacher'].includes(role) || !city || !area) {
      return res.status(200).json({
        isNewUser: true,
        needsLocation: true,
        email: email.toLowerCase(),
        name: name || 'Google User',
        picture: picture || null,
        googleId,
        role: ['student', 'teacher'].includes(role) ? role : null,
        message: 'Role and location details required'
      });
    }

    // Create new Google user with location
    user = await User.create({
      name: name || 'Google User',
      email: email.toLowerCase(),
      role,
      googleId,
      isGoogleAuth: true,
      avatar: picture || '',
      phone: '',
      consentGiven: true,
      consentTimestamp: new Date()
    });

    let profile;
    const initialLocation = { city: city.trim() };
    const initialArea = area.trim();

    if (role === 'teacher') {
      const jobId = await generateTeacherJobId();
      profile = await TeacherProfile.create({ 
        userId: user._id, 
        jobId,
        profilePhotoUrl: picture || '',
        location: initialLocation,
        area: initialArea,
        approvalStatus: 'pending',
        verificationStatus: 'pending',
        isVerified: false
      });
    } else {
      const jobId = await generateStudentJobId();
      profile = await StudentProfile.create({ 
        userId: user._id, 
        jobId,
        profilePhotoUrl: picture || '',
        location: initialLocation,
        area: initialArea
      });
    }

    const { accessToken } = await createSessionAndTokens(user, req, res);
    const userWithoutPassword = await User.findById(user._id).select('-passwordHash');
    return res.status(201).json({ user: userWithoutPassword, profile, token: accessToken });
  } catch (error) {
    console.error('Google Auth Route Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/refresh - Reissue 15-minute access token using valid 30-day refresh token
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken || req.headers['x-refresh-token'];
    if (!refreshToken) {
      clearAuthCookies(res);
      return res.status(401).json({ message: 'Refresh token missing. Please login again.' });
    }

    const reissued = await verifyAndReissueAccessToken(refreshToken, res);
    if (!reissued) {
      clearAuthCookies(res);
      return res.status(401).json({ message: 'Invalid or expired session. Please login again.' });
    }

    return res.json({
      message: 'Token reissued successfully',
      token: reissued.accessToken,
      user: reissued.user
    });
  } catch (err) {
    clearAuthCookies(res);
    return res.status(401).json({ message: 'Failed to refresh token' });
  }
});

// POST /api/auth/logout - Clear cookies and delete session record in DB
router.post('/logout', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    const accessToken = req.cookies?.accessToken || req.cookies?.token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);

    if (refreshToken) {
      await ActiveSession.deleteMany({ refreshToken });
    }
    if (accessToken) {
      await ActiveSession.deleteMany({ token: accessToken });
    }

    clearAuthCookies(res);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    clearAuthCookies(res);
    res.status(500).json({ message: error.message });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  try {
    let profile = null;
    if (req.user.role === 'teacher') {
      profile = await TeacherProfile.findOne({ userId: req.user._id });
    } else if (req.user.role === 'student') {
      profile = await StudentProfile.findOne({ userId: req.user._id });
    }
    res.json({
      user: req.user,
      profile: profile ? serializeProfile(profile, req.user) : null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/admin/login - Dedicated admin authentication (isolated from standard user sessions)
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid administrator credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid administrator credentials' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access Denied: This account is not an administrator.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Admin account has been deactivated.' });
    }

    const { accessToken } = await createAdminSessionAndTokens(user, req, res);
    const userWithoutPassword = await User.findById(user._id).select('-passwordHash');

    res.json({
      user: userWithoutPassword,
      token: accessToken
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/auth/admin/me - Check current admin session
router.get('/admin/me', authenticate, async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access Denied: Requires admin privileges' });
    }
    res.json({ user: req.user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/admin/logout - Logout admin session without affecting regular user session
router.post('/admin/logout', async (req, res) => {
  try {
    const refreshToken = req.cookies?.adminRefreshToken;
    const accessToken = req.cookies?.adminAccessToken || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);

    if (refreshToken) {
      await ActiveSession.deleteMany({ refreshToken });
    }
    if (accessToken) {
      await ActiveSession.deleteMany({ token: accessToken });
    }

    clearAdminCookies(res);
    res.json({ message: 'Admin logged out successfully' });
  } catch (error) {
    clearAdminCookies(res);
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/auth/profile - Update personal user info
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, phone, dateOfBirth, parentGuardianConsent } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (phone !== undefined) {
      if (phone && phone.trim()) {
        const phoneValidation = await validateUniquePhone(phone, user._id, false);
        if (!phoneValidation.isValid) {
          return res.status(400).json({ message: phoneValidation.message });
        }
        user.phone = phoneValidation.phone;
      } else {
        user.phone = '';
      }
    }
    if (req.body.email && req.body.email.trim().toLowerCase() !== user.email) {
      const emailValidation = await validateUniqueEmail(req.body.email, user._id);
      if (!emailValidation.isValid) {
        return res.status(400).json({ message: emailValidation.message });
      }
      user.email = emailValidation.email;
    }
    if (dateOfBirth) user.dateOfBirth = new Date(dateOfBirth);
    if (parentGuardianConsent !== undefined) user.parentGuardianConsent = Boolean(parentGuardianConsent);

    await user.save();
    const updated = await User.findById(user._id).select('-passwordHash');
    res.json({ message: 'Personal info updated', user: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/auth/account - Delete / Deactivate own account (DPDP compliance)
router.delete('/account', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;

    // Soft delete & flag
    await User.findByIdAndUpdate(userId, {
      isActive: false,
      accountDeletionRequested: new Date()
    });

    // Clean up active sessions
    await ActiveSession.deleteMany({ userId });

    // Cancel pending connection requests
    await ConnectionRequest.deleteMany({
      $or: [{ fromUserId: userId }, { toUserId: userId }],
      status: 'pending'
    });

    res.clearCookie('token');
    res.json({ message: 'Account has been deactivated and scheduled for permanent deletion under privacy terms.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/auth/dashboard-metrics - Role-aware dashboard metrics
router.get('/dashboard-metrics', authenticate, async (req, res) => {
  try {
    const user = req.user;
    let metrics = {};

    if (user.role === 'teacher') {
      const profile = await TeacherProfile.findOne({ userId: user._id });
      
      // Calculate completeness %
      let score = 20; // registered
      if (profile) {
        if (profile.bio && profile.bio.length > 20) score += 15;
        if (profile.subjects && profile.subjects.length > 0) score += 15;
        if (profile.exams && profile.exams.length > 0) score += 10;
        if (profile.experience > 0) score += 10;
        if (profile.profilePhotoUrl) score += 10;
        if (profile.demoVideoUrl) score += 10;
        if (profile.qualifications && profile.qualifications.length > 0) score += 10;
      }
      const completeness = Math.min(100, score);

      const [incomingCount, sentCount, acceptedCount, profileViewsCount] = await Promise.all([
        ConnectionRequest.countDocuments({ toUserId: user._id, status: 'pending' }),
        ConnectionRequest.countDocuments({ fromUserId: user._id, status: 'pending' }),
        ConnectionRequest.countDocuments({
          $or: [{ fromUserId: user._id }, { toUserId: user._id }],
          status: 'accepted'
        }),
        ProfileViewLog.countDocuments({ targetId: user._id })
      ]);

      metrics = {
        role: 'teacher',
        completeness,
        jobId: profile?.jobId || '',
        incomingCount,
        sentCount,
        acceptedCount,
        profileViewsCount,
        isVerified: profile?.isVerified ?? false,
        verificationStatus: profile?.verificationStatus || (profile?.isVerified ? 'verified' : 'pending'),
        rejectionReason: profile?.rejectionReason || '',
        approvalStatus: profile?.approvalStatus || 'pending'
      };
    } else if (user.role === 'student') {
      const profile = await StudentProfile.findOne({ userId: user._id });

      let score = 20;
      if (profile) {
        if (profile.classOrExam) score += 20;
        if (profile.subjectsNeeded && profile.subjectsNeeded.length > 0) score += 20;
        if (profile.location?.city) score += 15;
        if (profile.budget?.max > 0) score += 15;
        if (profile.goals) score += 10;
      }
      const completeness = Math.min(100, score);

      const [savedCount, sentCount, incomingCount, acceptedCount] = await Promise.all([
        SavedProfile.countDocuments({ userId: user._id }),
        ConnectionRequest.countDocuments({ fromUserId: user._id, status: 'pending' }),
        ConnectionRequest.countDocuments({ toUserId: user._id, status: 'pending' }),
        ConnectionRequest.countDocuments({
          $or: [{ fromUserId: user._id }, { toUserId: user._id }],
          status: 'accepted'
        })
      ]);

      metrics = {
        role: 'student',
        completeness,
        jobId: profile?.jobId || '',
        savedCount,
        sentCount,
        incomingCount,
        acceptedCount,
        approvalStatus: profile?.approvalStatus || 'approved'
      };
    } else {
      // Admin
      metrics = { role: 'admin' };
    }

    res.json(metrics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
