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
import Report from '../models/Report.js';
import Block from '../models/Block.js';
import Query from '../models/Query.js';
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
import { 
  validateUniqueEmail, 
  validateUniquePhone,
  validatePasswordStrength,
  cleanAndValidateName,
  sanitizeString
} from '../utils/identityValidator.js';
import { generateTeacherJobId, generateStudentJobId } from '../utils/jobIdHelper.js';
import { 
  forgotPasswordLimiter, 
  authLimiter, 
  signupLimiter, 
  adminAuthLimiter 
} from '../middleware/rateLimiter.js';
import { sendPasswordResetEmail } from '../utils/emailService.js';

const router = express.Router();

// POST /api/auth/signup - Clean, validate, and create account
router.post('/signup', signupLimiter, async (req, res) => {
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

    const errors = {};
    
    // 1. Role validation
    if (!['student', 'teacher'].includes(role)) {
      errors.role = 'Please select a valid role (Student or Teacher).';
    }

    // 2. Consent validation
    if (consentGiven === false || consentGiven === undefined) {
      errors.consentGiven = 'You must accept the terms and consent to data processing under DPDP Act 2023.';
    }

    // 3. Name validation & cleaning
    const nameValidation = cleanAndValidateName(name);
    if (!nameValidation.isValid) {
      errors.name = nameValidation.message;
    }

    // 4. Email validation & uniqueness
    const emailValidation = await validateUniqueEmail(email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.message;
    }

    // 5. Password strength validation
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.message;
    }

    // 6. Phone validation & uniqueness (required for teachers, optional for students)
    let validatedPhone = '';
    const isPhoneRequired = role === 'teacher';
    if (phone && phone.trim()) {
      const phoneValidation = await validateUniquePhone(phone, null, isPhoneRequired);
      if (!phoneValidation.isValid) {
        errors.phone = phoneValidation.message;
      } else {
        validatedPhone = phoneValidation.phone;
      }
    } else if (isPhoneRequired) {
      errors.phone = 'Mobile phone number is required for teacher registration.';
    }

    // 7. Location validation
    const initialCity = sanitizeString(city, 80);
    const initialArea = sanitizeString(area, 80);
    if (!initialCity) {
      errors.district = 'Please select your District.';
    }
    if (!initialArea) {
      errors.area = 'Please select your Area / Locality.';
    }

    // If any validation errors exist, return structured field errors
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        message: Object.values(errors)[0] || 'Please fix the highlighted fields.',
        errors
      });
    }

    // Create user with sanitized fields
    const user = await User.create({
      name: nameValidation.name,
      email: emailValidation.email,
      phone: validatedPhone,
      passwordHash: password, // Pre-save hook hashes with 12 rounds of bcrypt
      role,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      parentGuardianConsent: Boolean(parentGuardianConsent),
      consentGiven: true,
      consentTimestamp: new Date(),
      failedLoginAttempts: 0
    });

    let profile;
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
    console.error('Signup error:', error);
    res.status(500).json({ message: error.message || 'Server error occurred during registration' });
  }
});

// POST /api/auth/login - Rate-limited, brute-force protected, account lockout enabled
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    const errors = {};
    if (!email || !email.trim()) {
      errors.email = 'Please enter your registered email address.';
    }
    if (!password) {
      errors.password = 'Please enter your password.';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        message: 'Please provide both email and password.',
        errors
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({ 
        message: 'No account found with this email address.',
        errors: { email: 'Account does not exist. Check your email or sign up.' }
      });
    }

    // 1. Check if account is temporarily locked
    if (user.isLocked) {
      const remainingMs = new Date(user.lockUntil).getTime() - Date.now();
      const remainingMinutes = Math.max(1, Math.ceil(remainingMs / (60 * 1000)));
      return res.status(403).json({
        message: `Account is temporarily locked due to 5 consecutive failed login attempts. Please try again in ${remainingMinutes} minute(s) or reset your password.`,
        isLocked: true,
        lockRemainingMinutes: remainingMinutes,
        errors: { password: `Account locked. Try again in ${remainingMinutes}m.` }
      });
    }

    // 2. Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Increment failed attempts and check if threshold reached
      await user.incLoginAttempts();
      const updatedUser = await User.findById(user._id);

      if (updatedUser.isLocked) {
        return res.status(403).json({
          message: 'Account has been temporarily locked for 15 minutes due to 5 consecutive failed login attempts.',
          isLocked: true,
          lockRemainingMinutes: 15,
          errors: { password: 'Account locked for 15 minutes due to repeated failed attempts.' }
        });
      }

      const attemptsUsed = updatedUser.failedLoginAttempts || 1;
      const remainingAttempts = Math.max(0, 5 - attemptsUsed);

      return res.status(400).json({ 
        message: `Invalid password. You have ${remainingAttempts} attempt(s) remaining before account lockout.`,
        errors: { password: `Incorrect password (${remainingAttempts} attempts remaining)` }
      });
    }

    // 3. Reset failed login attempts on successful password verification
    if (user.failedLoginAttempts > 0 || user.lockUntil) {
      await user.resetLoginAttempts();
    }

    if (!user.isActive) {
      return res.status(403).json({ 
        message: 'Your account is deactivated. Please contact support.',
        errors: { email: 'Account is deactivated.' }
      });
    }

    const { accessToken } = await createSessionAndTokens(user, req, res);

    const userWithoutPassword = await User.findById(user._id).select('-passwordHash');
    let profile = null;
    if (user.role === 'teacher') profile = await TeacherProfile.findOne({ userId: user._id });
    else if (user.role === 'student') profile = await StudentProfile.findOne({ userId: user._id });

    res.json({
      user: userWithoutPassword,
      profile: profile ? serializeProfile(profile, userWithoutPassword) : null,
      token: accessToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message || 'Server error during login' });
  }
});

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

    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ message: passwordValidation.message });
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
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '1024664791682-3g3ii0da3tg3fmsk8p9gc3i4pstcecos.apps.googleusercontent.com';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

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

// POST /api/auth/admin/login - Dedicated admin authentication (rate-limited, brute-force protected)
router.post('/admin/login', adminAuthLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user || user.role !== 'admin') {
      return res.status(400).json({ message: 'Invalid administrator credentials' });
    }

    if (user.isLocked) {
      const remainingMs = new Date(user.lockUntil).getTime() - Date.now();
      const remainingMinutes = Math.max(1, Math.ceil(remainingMs / (60 * 1000)));
      return res.status(403).json({
        message: `Admin account is temporarily locked due to repeated failed attempts. Please try again in ${remainingMinutes} minute(s).`,
        isLocked: true,
        lockRemainingMinutes: remainingMinutes
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incLoginAttempts();
      const updatedUser = await User.findById(user._id);

      if (updatedUser.isLocked) {
        return res.status(403).json({
          message: 'Admin account has been temporarily locked for 15 minutes due to 5 consecutive failed login attempts.',
          isLocked: true,
          lockRemainingMinutes: 15
        });
      }

      const remaining = Math.max(0, 5 - (updatedUser.failedLoginAttempts || 0));
      return res.status(400).json({ 
        message: `Invalid administrator credentials. ${remaining} attempt(s) remaining before lockout.`
      });
    }

    // Reset attempts on successful login
    if (user.failedLoginAttempts > 0 || user.lockUntil) {
      await user.resetLoginAttempts();
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

    if (name) {
      const nameValidation = cleanAndValidateName(name);
      if (!nameValidation.isValid) {
        return res.status(400).json({ message: nameValidation.message });
      }
      user.name = nameValidation.name;
    }
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

// DELETE /api/auth/account - Permanently delete own account and all associated data
router.delete('/account', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;

    // Prevent deleting admin account via this route
    if (req.user.role === 'admin') {
      return res.status(403).json({ message: 'Admin accounts cannot be deleted from user settings.' });
    }

    // 1. Delete associated profile (Teacher or Student)
    await TeacherProfile.deleteMany({ userId });
    await StudentProfile.deleteMany({ userId });

    // 2. Clean up all active sessions
    await ActiveSession.deleteMany({ userId });

    // 3. Remove all connection requests (incoming and outgoing)
    await ConnectionRequest.deleteMany({
      $or: [{ fromUserId: userId }, { toUserId: userId }]
    });

    // 4. Remove saved profiles and bookmarks
    await SavedProfile.deleteMany({
      $or: [{ userId }, { targetUserId: userId }]
    });

    // 5. Remove submitted and received reports
    await Report.deleteMany({
      $or: [{ reporterId: userId }, { targetId: userId }]
    });

    // 6. Remove blocks
    await Block.deleteMany({
      $or: [{ blockerId: userId }, { blockedId: userId }]
    });

    // 7. Remove profile view logs
    await ProfileViewLog.deleteMany({
      $or: [{ viewerId: userId }, { targetId: userId }]
    });

    // 8. Remove queries/support tickets
    await Query.deleteMany({ userId });

    // 9. Permanently delete the user record
    await User.findByIdAndDelete(userId);

    // 10. Clear authentication cookies
    clearAuthCookies(res);

    res.json({ message: 'Your account and all associated data have been permanently deleted.' });
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
