import express from 'express';
import User from '../models/User.js';
import TeacherProfile from '../models/TeacherProfile.js';
import StudentProfile from '../models/StudentProfile.js';
import ActiveSession from '../models/ActiveSession.js';
import Report from '../models/Report.js';
import Block from '../models/Block.js';
import ProfileViewLog from '../models/ProfileViewLog.js';
import ConnectionRequest from '../models/ConnectionRequest.js';
import SavedProfile from '../models/SavedProfile.js';
import SystemSetting from '../models/SystemSetting.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateUniqueEmail, validateUniquePhone } from '../utils/identityValidator.js';
import { generateTeacherJobId, generateStudentJobId } from '../utils/jobIdHelper.js';
import Query from '../models/Query.js';

const router = express.Router();

// All routes require admin role
router.use(authenticate, authorize('admin'));

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }
    const users = await User.find(query).select('-passwordHash').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/users/:id
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });

    let profile = null;
    if (user.role === 'teacher') profile = await TeacherProfile.findOne({ userId: user._id });
    else if (user.role === 'student') profile = await StudentProfile.findOne({ userId: user._id });

    res.json({ user, profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/admin/users-purge - Permanently remove all non-admin previous user accounts
router.delete('/users-purge', async (req, res) => {
  try {
    const nonAdminUsers = await User.find({ role: { $ne: 'admin' } });
    const userIds = nonAdminUsers.map(u => u._id);

    await TeacherProfile.deleteMany({ userId: { $in: userIds } });
    await StudentProfile.deleteMany({ userId: { $in: userIds } });
    await ActiveSession.deleteMany({ userId: { $in: userIds } });
    await ConnectionRequest.deleteMany({
      $or: [{ fromUserId: { $in: userIds } }, { toUserId: { $in: userIds } }]
    });
    await SavedProfile.deleteMany({
      $or: [{ userId: { $in: userIds } }, { targetUserId: { $in: userIds } }]
    });
    await Report.deleteMany({
      $or: [{ reporterId: { $in: userIds } }, { targetId: { $in: userIds } }]
    });
    await Block.deleteMany({
      $or: [{ blockerId: { $in: userIds } }, { blockedId: { $in: userIds } }]
    });
    await ProfileViewLog.deleteMany({
      $or: [{ viewerId: { $in: userIds } }, { targetId: { $in: userIds } }]
    });
    const deleteResult = await User.deleteMany({ role: { $ne: 'admin' } });

    res.json({
      message: `Successfully removed ${deleteResult.deletedCount} previous user accounts. Only administrator accounts remain.`,
      deletedCount: deleteResult.deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Administrator accounts cannot be deleted directly.' });
    }

    const userId = user._id;
    await TeacherProfile.deleteMany({ userId });
    await StudentProfile.deleteMany({ userId });
    await ActiveSession.deleteMany({ userId });
    await ConnectionRequest.deleteMany({
      $or: [{ fromUserId: userId }, { toUserId: userId }]
    });
    await SavedProfile.deleteMany({
      $or: [{ userId }, { targetUserId: userId }]
    });
    await Report.deleteMany({
      $or: [{ reporterId: userId }, { targetId: userId }]
    });
    await Block.deleteMany({
      $or: [{ blockerId: userId }, { blockedId: userId }]
    });
    await ProfileViewLog.deleteMany({
      $or: [{ viewerId: userId }, { targetId: userId }]
    });
    await Query.deleteMany({ userId });
    await user.deleteOne();

    res.json({ message: 'User and all associated data deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/admin/users/:id/role - Change or promote user role
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['student', 'teacher', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: `Role updated to ${role}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/sessions
router.get('/sessions', async (req, res) => {
  try {
    const filter = {};
    if (req.query.userId) {
      filter.userId = req.query.userId;
    }
    const sessions = await ActiveSession.find(filter)
      .populate('userId', 'name email role')
      .sort({ lastActive: -1 })
      .limit(100);
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/admin/sessions/:id - Revoke single session
router.delete('/sessions/:id', async (req, res) => {
  try {
    const session = await ActiveSession.findByIdAndDelete(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    res.json({ message: 'Session revoked successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/admin/users/:userId/sessions - Revoke all sessions for a specific user
router.delete('/users/:userId/sessions', async (req, res) => {
  try {
    const result = await ActiveSession.deleteMany({ userId: req.params.userId });
    res.json({ 
      message: `Revoked ${result.deletedCount} session(s) for user`, 
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/teachers
router.get('/teachers', async (req, res) => {
  try {
    const teachers = await TeacherProfile.find()
      .populate('userId', 'name email phone createdAt isActive role dateOfBirth isMinor')
      .sort({ createdAt: -1 });
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/students
router.get('/students', async (req, res) => {
  try {
    const students = await StudentProfile.find()
      .populate('userId', 'name email phone createdAt isActive role dateOfBirth isMinor parentGuardianConsent')
      .sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/admin/teachers/:id/status - Approve/Reject/Suspend/Pending
router.patch('/teachers/:id/status', async (req, res) => {
  try {
    const { status } = req.body; // 'approved' | 'rejected' | 'suspended' | 'pending'
    const profile = await TeacherProfile.findById(req.params.id);
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    profile.approvalStatus = status;
    if (status === 'approved') {
      profile.isVerified = true;
      profile.verificationStatus = 'verified';
      profile.verifiedAt = new Date();
    } else if (status === 'pending') {
      profile.isVerified = false;
      profile.verificationStatus = 'pending';
    } else if (status === 'rejected') {
      profile.isVerified = false;
      profile.verificationStatus = 'rejected';
    }
    await profile.save();

    res.json({ message: `Teacher profile status set to ${status}`, profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/admin/students/:id/status - Approve/Reject/Suspend
router.patch('/students/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const profile = await StudentProfile.findById(req.params.id);
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    profile.approvalStatus = status;
    await profile.save();

    res.json({ message: `Student profile status set to ${status}`, profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/admin/teachers/:id
router.put('/teachers/:id', async (req, res) => {
  try {
    const { name, email, phone, ...profileData } = req.body;
    const profile = await TeacherProfile.findById(req.params.id);
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    let updateEmail = undefined;
    let updatePhone = undefined;

    if (email && email.trim()) {
      const emailValidation = await validateUniqueEmail(email, profile.userId);
      if (!emailValidation.isValid) {
        return res.status(400).json({ message: emailValidation.message });
      }
      updateEmail = emailValidation.email;
    }

    if (phone !== undefined) {
      if (phone && phone.trim()) {
        const phoneValidation = await validateUniquePhone(phone, profile.userId, false);
        if (!phoneValidation.isValid) {
          return res.status(400).json({ message: phoneValidation.message });
        }
        updatePhone = phoneValidation.phone;
        profile.verificationPhone = phoneValidation.phone;
      } else {
        updatePhone = '';
      }
    }

    if (profile.userId && (name || updateEmail || updatePhone !== undefined)) {
      await User.findByIdAndUpdate(profile.userId, {
        ...(name && { name }),
        ...(updateEmail && { email: updateEmail }),
        ...(updatePhone !== undefined && { phone: updatePhone })
      });
    }

    Object.assign(profile, profileData);
    await profile.save();
    const updated = await TeacherProfile.findById(profile._id).populate('userId', 'name email phone createdAt isActive role');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/admin/students/:id
router.put('/students/:id', async (req, res) => {
  try {
    const { name, email, phone, ...profileData } = req.body;
    const profile = await StudentProfile.findById(req.params.id);
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    let updateEmail = undefined;
    let updatePhone = undefined;

    if (email && email.trim()) {
      const emailValidation = await validateUniqueEmail(email, profile.userId);
      if (!emailValidation.isValid) {
        return res.status(400).json({ message: emailValidation.message });
      }
      updateEmail = emailValidation.email;
    }

    if (phone !== undefined) {
      if (phone && phone.trim()) {
        const phoneValidation = await validateUniquePhone(phone, profile.userId, false);
        if (!phoneValidation.isValid) {
          return res.status(400).json({ message: phoneValidation.message });
        }
        updatePhone = phoneValidation.phone;
      } else {
        updatePhone = '';
      }
    }

    if (profile.userId && (name || updateEmail || updatePhone !== undefined)) {
      await User.findByIdAndUpdate(profile.userId, {
        ...(name && { name }),
        ...(updateEmail && { email: updateEmail }),
        ...(updatePhone !== undefined && { phone: updatePhone })
      });
    }

    Object.assign(profile, profileData);
    await profile.save();
    const updated = await StudentProfile.findById(profile._id).populate('userId', 'name email phone createdAt isActive role');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/admin/teachers (Create new user + profile manually)
router.post('/teachers', async (req, res) => {
  try {
    const { name, email, phone, password, ...profileData } = req.body;
    const emailValidation = await validateUniqueEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({ message: emailValidation.message });
    }

    let validatedPhone = '';
    if (phone && phone.trim()) {
      const phoneValidation = await validateUniquePhone(phone, null, false);
      if (!phoneValidation.isValid) {
        return res.status(400).json({ message: phoneValidation.message });
      }
      validatedPhone = phoneValidation.phone;
    }

    const user = await User.create({
      name,
      email: emailValidation.email,
      phone: validatedPhone,
      passwordHash: password || 'tempPass123!',
      role: 'teacher'
    });
    const jobId = await generateTeacherJobId();
    const profile = await TeacherProfile.create({
      userId: user._id,
      jobId,
      approvalStatus: 'approved',
      verificationPhone: validatedPhone,
      ...profileData
    });
    res.status(201).json({ user, profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/admin/students (Create new user + profile manually)
router.post('/students', async (req, res) => {
  try {
    const { name, email, phone, password, ...profileData } = req.body;
    const emailValidation = await validateUniqueEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({ message: emailValidation.message });
    }

    let validatedPhone = '';
    if (phone && phone.trim()) {
      const phoneValidation = await validateUniquePhone(phone, null, false);
      if (!phoneValidation.isValid) {
        return res.status(400).json({ message: phoneValidation.message });
      }
      validatedPhone = phoneValidation.phone;
    }

    const user = await User.create({
      name,
      email: emailValidation.email,
      phone: validatedPhone,
      passwordHash: password || 'tempPass123!',
      role: 'student'
    });
    const jobId = await generateStudentJobId();
    const profile = await StudentProfile.create({
      userId: user._id,
      jobId,
      approvalStatus: 'approved',
      ...profileData
    });
    res.status(201).json({ user, profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/admin/teachers/:id
router.delete('/teachers/:id', async (req, res) => {
  try {
    const profile = await TeacherProfile.findById(req.params.id);
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    
    const userId = profile.userId;
    if (userId) {
      await User.findByIdAndDelete(userId);
      await ActiveSession.deleteMany({ userId });
      await ConnectionRequest.deleteMany({ $or: [{ fromUserId: userId }, { toUserId: userId }] });
      await SavedProfile.deleteMany({ $or: [{ userId }, { targetUserId: userId }] });
      await Report.deleteMany({ $or: [{ reporterId: userId }, { targetId: userId }] });
      await Block.deleteMany({ $or: [{ blockerId: userId }, { blockedId: userId }] });
      await ProfileViewLog.deleteMany({ $or: [{ viewerId: userId }, { targetId: userId }] });
      await Query.deleteMany({ userId });
    }
    await profile.deleteOne();
    res.json({ message: 'Teacher and associated user account permanently deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/admin/students/:id
router.delete('/students/:id', async (req, res) => {
  try {
    const profile = await StudentProfile.findById(req.params.id);
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    
    const userId = profile.userId;
    if (userId) {
      await User.findByIdAndDelete(userId);
      await ActiveSession.deleteMany({ userId });
      await ConnectionRequest.deleteMany({ $or: [{ fromUserId: userId }, { toUserId: userId }] });
      await SavedProfile.deleteMany({ $or: [{ userId }, { targetUserId: userId }] });
      await Report.deleteMany({ $or: [{ reporterId: userId }, { targetId: userId }] });
      await Block.deleteMany({ $or: [{ blockerId: userId }, { blockedId: userId }] });
      await ProfileViewLog.deleteMany({ $or: [{ viewerId: userId }, { targetId: userId }] });
      await Query.deleteMany({ userId });
    }
    await profile.deleteOne();
    res.json({ message: 'Student and associated user account permanently deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/reports - View submitted reports
router.get('/reports', async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reporterId', 'name email role')
      .populate('targetId', 'name email role')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/admin/reports/:id - Review/dismiss report
router.patch('/reports/:id', async (req, res) => {
  try {
    const { status } = req.body; // 'reviewed' | 'dismissed'
    const report = await Report.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json({ message: `Report marked as ${status}`, report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/blocks - View all block actions
router.get('/blocks', async (req, res) => {
  try {
    const blocks = await Block.find()
      .populate('blockerId', 'name email role')
      .populate('blockedId', 'name email role')
      .sort({ createdAt: -1 });
    res.json(blocks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/profile-views - Address & Phone view audit logs
router.get('/profile-views', async (req, res) => {
  try {
    const logs = await ProfileViewLog.find()
      .populate('viewerId', 'name email role')
      .populate('targetId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/settings - Read system settings (guest directory visibility, etc.)
router.get('/settings', async (req, res) => {
  try {
    let guestSetting = await SystemSetting.findOne({ key: 'guestDirectoryVisible' });
    if (!guestSetting) {
      guestSetting = await SystemSetting.create({
        key: 'guestDirectoryVisible',
        value: true,
        description: 'Allow guests (non-logged-in users) to view preview directory'
      });
    }
    res.json({ guestDirectoryVisible: guestSetting.value });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/admin/settings - Update system settings
router.put('/settings', async (req, res) => {
  try {
    const { guestDirectoryVisible } = req.body;
    if (guestDirectoryVisible !== undefined) {
      await SystemSetting.findOneAndUpdate(
        { key: 'guestDirectoryVisible' },
        { value: Boolean(guestDirectoryVisible) },
        { upsert: true }
      );
    }
    res.json({ message: 'Settings updated successfully', settings: { guestDirectoryVisible } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// TEACHER VERIFICATION QUEUE ENDPOINTS
// ==========================================

// GET /api/admin/verifications - Get list of teachers in verification queue
router.get('/verifications', async (req, res) => {
  try {
    const { status = 'pending', search } = req.query;
    let query = {};

    if (status && status !== 'all') {
      if (status === 'pending') {
        query = {
          $or: [
            { verificationStatus: 'pending' },
            { approvalStatus: 'pending', isVerified: false },
            { verificationStatus: 'unverified', isVerified: false }
          ]
        };
      } else if (status === 'verified') {
        query = {
          $or: [
            { verificationStatus: 'verified' },
            { isVerified: true }
          ]
        };
      } else if (status === 'rejected') {
        query = {
          $or: [
            { verificationStatus: 'rejected' },
            { approvalStatus: 'rejected' }
          ]
        };
      } else {
        query.verificationStatus = status;
      }
    }

    const sortOrder = status === 'pending' 
      ? { createdAt: -1, verificationSubmittedAt: -1 }
      : { updatedAt: -1 };

    let teachers = await TeacherProfile.find(query)
      .populate('userId', 'name email phone avatar createdAt isActive')
      .sort(sortOrder);

    if (search && search.trim()) {
      const reg = new RegExp(search.trim(), 'i');
      teachers = teachers.filter(t => 
        (t.userId && (reg.test(t.userId.name) || reg.test(t.userId.email) || reg.test(t.userId.phone))) ||
        (t.verificationPhone && reg.test(t.verificationPhone)) ||
        (t.subjects && t.subjects.some(s => reg.test(s))) ||
        (t.degreeDetails && (reg.test(t.degreeDetails.highestDegree) || reg.test(t.degreeDetails.university)))
      );
    }

    // Return counts along with list
    const pendingCount = await TeacherProfile.countDocuments({
      $or: [
        { verificationStatus: 'pending' },
        { approvalStatus: 'pending', isVerified: false },
        { verificationStatus: 'unverified', isVerified: false }
      ]
    });
    const verifiedCount = await TeacherProfile.countDocuments({
      $or: [
        { verificationStatus: 'verified' },
        { isVerified: true }
      ]
    });
    const rejectedCount = await TeacherProfile.countDocuments({
      $or: [
        { verificationStatus: 'rejected' },
        { approvalStatus: 'rejected' }
      ]
    });
    const unverifiedCount = await TeacherProfile.countDocuments({
      verificationStatus: 'unverified',
      approvalStatus: { $ne: 'pending' },
      isVerified: false
    });

    res.json({
      counts: {
        pending: pendingCount,
        verified: verifiedCount,
        rejected: rejectedCount,
        unverified: unverifiedCount,
        total: pendingCount + verifiedCount + rejectedCount + unverifiedCount
      },
      teachers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/admin/verifications/:id/approve - Approve teacher verification and grant Verified badge
router.patch('/verifications/:id/approve', async (req, res) => {
  try {
    const profile = await TeacherProfile.findById(req.params.id).populate('userId', 'name email phone');
    if (!profile) return res.status(404).json({ message: 'Teacher profile not found' });

    profile.isVerified = true;
    profile.verificationStatus = 'verified';
    profile.approvalStatus = 'approved';
    profile.verifiedAt = new Date();
    profile.rejectionReason = '';
    if (req.body.notes !== undefined) {
      profile.adminVerificationNotes = req.body.notes;
    }

    await profile.save();
    res.json({
      message: `Teacher ${profile.userId?.name || ''} approved and granted Verified badge!`,
      profile
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/admin/verifications/:id/reject - Reject teacher verification with reason
router.patch('/verifications/:id/reject', async (req, res) => {
  try {
    const { reason, notes } = req.body;
    const profile = await TeacherProfile.findById(req.params.id).populate('userId', 'name email phone');
    if (!profile) return res.status(404).json({ message: 'Teacher profile not found' });

    profile.isVerified = false;
    profile.verificationStatus = 'rejected';
    profile.approvalStatus = 'rejected';
    profile.rejectionReason = reason || 'Your submitted verification documents could not be verified. Please review credentials and resubmit.';
    if (notes !== undefined) {
      profile.adminVerificationNotes = notes;
    }

    await profile.save();
    res.json({
      message: `Teacher verification marked as rejected. Reason: ${profile.rejectionReason}`,
      profile
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/admin/verifications/:id/notes - Update admin call/verification notes
router.patch('/verifications/:id/notes', async (req, res) => {
  try {
    const { notes } = req.body;
    const profile = await TeacherProfile.findByIdAndUpdate(
      req.params.id,
      { adminVerificationNotes: notes || '' },
      { new: true }
    ).populate('userId', 'name email phone');

    if (!profile) return res.status(404).json({ message: 'Teacher profile not found' });
    res.json({ message: 'Verification notes updated', profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// STUDENT / PARENT VERIFICATION QUEUE ENDPOINTS
// ==========================================

// GET /api/admin/student-verifications - Get list of students/parents in verification queue
router.get('/student-verifications', async (req, res) => {
  try {
    const { status = 'pending', search } = req.query;
    let query = {};

    if (status && status !== 'all') {
      if (status === 'pending') {
        query = {
          $or: [
            { verificationStatus: 'pending' },
            { contactVerified: true, isVerified: false },
            { verificationStatus: 'unverified', isVerified: false, verificationPhone: { $exists: true, $ne: '' } }
          ]
        };
      } else if (status === 'verified') {
        query = {
          $or: [
            { verificationStatus: 'verified' },
            { isVerified: true }
          ]
        };
      } else if (status === 'rejected') {
        query = { verificationStatus: 'rejected' };
      } else {
        query.verificationStatus = status;
      }
    }

    const sortOrder = status === 'pending'
      ? { verificationSubmittedAt: -1, createdAt: -1 }
      : { updatedAt: -1 };

    let students = await StudentProfile.find(query)
      .populate('userId', 'name email phone avatar createdAt isActive')
      .sort(sortOrder);

    if (search && search.trim()) {
      const reg = new RegExp(search.trim(), 'i');
      students = students.filter(s =>
        (s.userId && (reg.test(s.userId.name) || reg.test(s.userId.email) || reg.test(s.userId.phone))) ||
        (s.verificationPhone && reg.test(s.verificationPhone)) ||
        (s.verificationEmail && reg.test(s.verificationEmail)) ||
        (s.jobId && reg.test(s.jobId)) ||
        (s.classOrExam && reg.test(s.classOrExam)) ||
        (s.area && reg.test(s.area)) ||
        (s.location?.city && reg.test(s.location.city)) ||
        (s.subjectsNeeded && s.subjectsNeeded.some(sub => reg.test(sub)))
      );
    }

    // Counts
    const pendingCount = await StudentProfile.countDocuments({
      $or: [
        { verificationStatus: 'pending' },
        { contactVerified: true, isVerified: false },
        { verificationStatus: 'unverified', isVerified: false, verificationPhone: { $exists: true, $ne: '' } }
      ]
    });
    const verifiedCount = await StudentProfile.countDocuments({
      $or: [
        { verificationStatus: 'verified' },
        { isVerified: true }
      ]
    });
    const rejectedCount = await StudentProfile.countDocuments({
      verificationStatus: 'rejected'
    });
    const totalCount = await StudentProfile.countDocuments();

    res.json({
      counts: {
        pending: pendingCount,
        verified: verifiedCount,
        rejected: rejectedCount,
        total: totalCount
      },
      students
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/admin/student-verifications/:id/approve - Approve student verification
router.patch('/student-verifications/:id/approve', async (req, res) => {
  try {
    const profile = await StudentProfile.findById(req.params.id).populate('userId', 'name email phone');
    if (!profile) return res.status(404).json({ message: 'Student profile not found' });

    profile.isVerified = true;
    profile.verificationStatus = 'verified';
    profile.contactVerified = true;
    profile.verifiedAt = new Date();
    profile.rejectionReason = '';
    if (req.body.notes !== undefined) {
      profile.adminVerificationNotes = req.body.notes;
    }

    await profile.save();
    res.json({
      message: `Student/Parent ${profile.userId?.name || ''} approved and verified!`,
      profile
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/admin/student-verifications/:id/reject - Reject student verification
router.patch('/student-verifications/:id/reject', async (req, res) => {
  try {
    const { reason, notes } = req.body;
    const profile = await StudentProfile.findById(req.params.id).populate('userId', 'name email phone');
    if (!profile) return res.status(404).json({ message: 'Student profile not found' });

    profile.isVerified = false;
    profile.verificationStatus = 'rejected';
    profile.rejectionReason = reason || 'Could not verify contact details over phone/email. Please update details.';
    if (notes !== undefined) {
      profile.adminVerificationNotes = notes;
    }

    await profile.save();
    res.json({
      message: `Student verification marked as rejected. Reason: ${profile.rejectionReason}`,
      profile
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/admin/student-verifications/:id/notes - Update admin verification notes for student
router.patch('/student-verifications/:id/notes', async (req, res) => {
  try {
    const { notes } = req.body;
    const profile = await StudentProfile.findByIdAndUpdate(
      req.params.id,
      { adminVerificationNotes: notes || '' },
      { new: true }
    ).populate('userId', 'name email phone');

    if (!profile) return res.status(404).json({ message: 'Student profile not found' });
    res.json({ message: 'Verification notes updated', profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// CONNECTION LEADS & MATCHMAKING ENDPOINTS
// ==========================================

// GET /api/admin/connections - Fetch all connection requests for manual matchmaking
router.get('/connections', async (req, res) => {
  try {
    const { leadStatus, status, commissionStatus, search, district, direction } = req.query;

    let query = {};
    if (leadStatus && leadStatus !== 'all') {
      query.adminLeadStatus = leadStatus;
    }
    if (status && status !== 'all') {
      query.status = status;
    }
    if (commissionStatus && commissionStatus !== 'all') {
      query.commissionStatus = commissionStatus;
    }

    const requests = await ConnectionRequest.find(query)
      .populate('fromUserId', 'name email phone avatar role isActive dateOfBirth')
      .populate('toUserId', 'name email phone avatar role isActive dateOfBirth')
      .sort({ createdAt: -1 })
      .lean();

    // Enrich both parties with full profile details
    let enriched = await Promise.all(requests.map(async (reqItem) => {
      let fromProfile = null;
      let toProfile = null;

      if (reqItem.fromUserId) {
        if (reqItem.fromUserId.role === 'teacher') {
          fromProfile = await TeacherProfile.findOne({ userId: reqItem.fromUserId._id })
            .select('jobId subjects experience fee location area fullAddress verificationPhone isVerified verificationStatus board preferredTime daysPerWeek degreeDetails teachingMode')
            .lean();
        } else if (reqItem.fromUserId.role === 'student') {
          fromProfile = await StudentProfile.findOne({ userId: reqItem.fromUserId._id })
            .select('jobId subjectsNeeded classOrExam budget location area fullAddress preferredTiming preferences')
            .lean();
        }
      }

      if (reqItem.toUserId) {
        if (reqItem.toUserId.role === 'teacher') {
          toProfile = await TeacherProfile.findOne({ userId: reqItem.toUserId._id })
            .select('jobId subjects experience fee location area fullAddress verificationPhone isVerified verificationStatus board preferredTime daysPerWeek degreeDetails teachingMode')
            .lean();
        } else if (reqItem.toUserId.role === 'student') {
          toProfile = await StudentProfile.findOne({ userId: reqItem.toUserId._id })
            .select('jobId subjectsNeeded classOrExam budget location area fullAddress preferredTiming preferences')
            .lean();
        }
      }

      return {
        ...reqItem,
        fromProfile,
        toProfile
      };
    }));

    // Filter by direction / match type if specified
    if (direction && direction !== 'all') {
      if (direction === 'student_to_teacher_accepted') {
        enriched = enriched.filter(item => 
          item.status === 'accepted' && 
          item.fromUserId?.role === 'student' && 
          item.toUserId?.role === 'teacher'
        );
      } else if (direction === 'teacher_to_student_accepted') {
        enriched = enriched.filter(item => 
          item.status === 'accepted' && 
          item.fromUserId?.role === 'teacher' && 
          item.toUserId?.role === 'student'
        );
      } else if (direction === 'student_to_teacher') {
        enriched = enriched.filter(item => 
          item.fromUserId?.role === 'student' && 
          item.toUserId?.role === 'teacher'
        );
      } else if (direction === 'teacher_to_student') {
        enriched = enriched.filter(item => 
          item.fromUserId?.role === 'teacher' && 
          item.toUserId?.role === 'student'
        );
      }
    }

    // Filter by district if specified
    if (district && district !== 'all') {
      enriched = enriched.filter(item => {
        const fromDistrict = item.fromProfile?.location?.city || '';
        const toDistrict = item.toProfile?.location?.city || '';
        return (
          fromDistrict.toLowerCase() === district.toLowerCase() ||
          toDistrict.toLowerCase() === district.toLowerCase()
        );
      });
    }

    // Filter by search query if specified
    if (search && search.trim()) {
      const reg = new RegExp(search.trim(), 'i');
      enriched = enriched.filter(item => {
        const fromName = item.fromUserId?.name || '';
        const fromEmail = item.fromUserId?.email || '';
        const fromPhone = item.fromUserId?.phone || item.fromProfile?.verificationPhone || '';
        const fromJobId = item.fromProfile?.jobId || '';
        const toName = item.toUserId?.name || '';
        const toEmail = item.toUserId?.email || '';
        const toPhone = item.toUserId?.phone || item.toProfile?.verificationPhone || '';
        const toJobId = item.toProfile?.jobId || '';
        const notes = item.adminNotes || '';
        const message = item.message || '';
        const fromArea = item.fromProfile?.area || '';
        const toArea = item.toProfile?.area || '';

        return (
          reg.test(fromName) ||
          reg.test(fromEmail) ||
          reg.test(fromPhone) ||
          reg.test(fromJobId) ||
          reg.test(toName) ||
          reg.test(toEmail) ||
          reg.test(toPhone) ||
          reg.test(toJobId) ||
          reg.test(notes) ||
          reg.test(message) ||
          reg.test(fromArea) ||
          reg.test(toArea)
        );
      });
    }

    // Aggregate statistics across all requests
    const allRequests = await ConnectionRequest.find()
      .populate('fromUserId', 'role')
      .populate('toUserId', 'role')
      .lean();

    const studentToTeacherAccepted = allRequests.filter(r => 
      r.status === 'accepted' && 
      r.fromUserId?.role === 'student' && 
      r.toUserId?.role === 'teacher'
    ).length;

    const teacherToStudentAccepted = allRequests.filter(r => 
      r.status === 'accepted' && 
      r.fromUserId?.role === 'teacher' && 
      r.toUserId?.role === 'student'
    ).length;

    const totalAccepted = allRequests.filter(r => r.status === 'accepted').length;

    const metrics = {
      totalRequests: allRequests.length,
      studentToTeacherAccepted,
      teacherToStudentAccepted,
      totalAccepted,
      newLeads: allRequests.filter(r => (r.adminLeadStatus || 'new') === 'new').length,
      inProgress: allRequests.filter(r => ['contacted_sender', 'contacted_target', 'both_contacted'].includes(r.adminLeadStatus)).length,
      dealsFinalized: allRequests.filter(r => ['deal_finalized', 'commission_received'].includes(r.adminLeadStatus)).length,
      totalCommissionExpected: allRequests.reduce((sum, r) => sum + (Number(r.commissionExpected) || 0), 0),
      totalCommissionReceived: allRequests.reduce((sum, r) => sum + (Number(r.commissionReceived) || 0), 0)
    };

    res.json({
      metrics,
      connections: enriched
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/admin/connections/:id - Update admin matchmaking & commission status
router.patch('/connections/:id', async (req, res) => {
  try {
    const {
      adminLeadStatus,
      tuitionFee,
      commissionExpected,
      commissionReceived,
      commissionStatus,
      adminNotes,
      status
    } = req.body;

    const request = await ConnectionRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Connection request not found' });
    }

    if (adminLeadStatus !== undefined) {
      request.adminLeadStatus = adminLeadStatus;
      if (['contacted_sender', 'contacted_target', 'both_contacted'].includes(adminLeadStatus)) {
        request.lastContactedAt = new Date();
      }
      if (['deal_finalized', 'commission_received'].includes(adminLeadStatus)) {
        if (!request.dealFinalizedAt) request.dealFinalizedAt = new Date();
      }
    }

    if (tuitionFee !== undefined) request.tuitionFee = Number(tuitionFee) || 0;
    if (commissionExpected !== undefined) request.commissionExpected = Number(commissionExpected) || 0;
    if (commissionReceived !== undefined) request.commissionReceived = Number(commissionReceived) || 0;
    if (commissionStatus !== undefined) request.commissionStatus = commissionStatus;
    if (adminNotes !== undefined) request.adminNotes = adminNotes;
    if (status !== undefined) request.status = status;

    await request.save();

    const populated = await ConnectionRequest.findById(request._id)
      .populate('fromUserId', 'name email phone avatar role isActive')
      .populate('toUserId', 'name email phone avatar role isActive')
      .lean();

    let fromProfile = null;
    let toProfile = null;
    if (populated.fromUserId) {
      if (populated.fromUserId.role === 'teacher') {
        fromProfile = await TeacherProfile.findOne({ userId: populated.fromUserId._id }).lean();
      } else if (populated.fromUserId.role === 'student') {
        fromProfile = await StudentProfile.findOne({ userId: populated.fromUserId._id }).lean();
      }
    }
    if (populated.toUserId) {
      if (populated.toUserId.role === 'teacher') {
        toProfile = await TeacherProfile.findOne({ userId: populated.toUserId._id }).lean();
      } else if (populated.toUserId.role === 'student') {
        toProfile = await StudentProfile.findOne({ userId: populated.toUserId._id }).lean();
      }
    }

    res.json({
      message: 'Connection lead updated successfully',
      connection: {
        ...populated,
        fromProfile,
        toProfile
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/admin/connections/:id - Delete connection record
router.delete('/connections/:id', async (req, res) => {
  try {
    const deleted = await ConnectionRequest.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Connection request not found' });
    }
    res.json({ message: 'Connection request removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// ADMIN NOTIFICATION BADGE COUNTS
// ==========================================

// GET /api/admin/unread-counts - Get unviewed counts for Connections, Verifications, Reports, and Queries
router.get('/unread-counts', async (req, res) => {
  try {
    const [connectionsCount, teacherVerificationsCount, studentVerificationsCount, reportsCount, queriesCount] = await Promise.all([
      ConnectionRequest.countDocuments({ viewedByAdmin: false }),
      TeacherProfile.countDocuments({
        viewedByAdmin: false,
        $or: [
          { verificationStatus: 'pending' },
          { approvalStatus: 'pending', isVerified: false },
          { verificationStatus: 'unverified', isVerified: false }
        ]
      }),
      StudentProfile.countDocuments({
        viewedByAdmin: false,
        $or: [
          { verificationStatus: 'pending' },
          { contactVerified: true, isVerified: false }
        ]
      }),
      Report.countDocuments({ viewedByAdmin: false, status: 'pending' }),
      Query.countDocuments({ adminViewed: false })
    ]);

    const verificationsCount = teacherVerificationsCount + studentVerificationsCount;
    const total = connectionsCount + verificationsCount + reportsCount + queriesCount;

    res.json({
      connections: connectionsCount,
      verifications: verificationsCount,
      reports: reportsCount,
      queries: queriesCount,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/admin/mark-viewed - Mark an admin section viewed (clears the badge instantly)
router.post('/mark-viewed', async (req, res) => {
  try {
    const { section } = req.body; // 'connections' | 'verifications' | 'reports' | 'queries' | 'all'

    if (section === 'connections') {
      await ConnectionRequest.updateMany({ viewedByAdmin: false }, { $set: { viewedByAdmin: true } });
    } else if (section === 'verifications') {
      await Promise.all([
        TeacherProfile.updateMany({ viewedByAdmin: false }, { $set: { viewedByAdmin: true } }),
        StudentProfile.updateMany({ viewedByAdmin: false }, { $set: { viewedByAdmin: true } })
      ]);
    } else if (section === 'reports') {
      await Report.updateMany({ viewedByAdmin: false }, { $set: { viewedByAdmin: true } });
    } else if (section === 'queries') {
      await Query.updateMany({ adminViewed: false }, { $set: { adminViewed: true } });
    } else if (section === 'all') {
      await Promise.all([
        ConnectionRequest.updateMany({ viewedByAdmin: false }, { $set: { viewedByAdmin: true } }),
        TeacherProfile.updateMany({ viewedByAdmin: false }, { $set: { viewedByAdmin: true } }),
        StudentProfile.updateMany({ viewedByAdmin: false }, { $set: { viewedByAdmin: true } }),
        Report.updateMany({ viewedByAdmin: false }, { $set: { viewedByAdmin: true } }),
        Query.updateMany({ adminViewed: false }, { $set: { adminViewed: true } })
      ]);
    }

    res.json({ message: `Admin section ${section || 'all'} marked as viewed` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
