import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import StudentProfile from '../models/StudentProfile.js';
import TeacherProfile from '../models/TeacherProfile.js';
import User from '../models/User.js';
import Block from '../models/Block.js';
import ConnectionRequest from '../models/ConnectionRequest.js';
import ProfileViewLog from '../models/ProfileViewLog.js';
import SystemSetting from '../models/SystemSetting.js';
import { authenticate, optionalAuth, authorize } from '../middleware/auth.js';
import { directoryLimiter, profileViewLimiter } from '../middleware/rateLimiter.js';
import { serializeProfile } from '../utils/serializeProfile.js';
import { validateUniquePhone } from '../utils/identityValidator.js';

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, `student-${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images are allowed'));
  }
});

// GET /api/students - List students (Teacher-only + Admin, or Guest preview)
router.get('/', directoryLimiter, optionalAuth, async (req, res) => {
  try {
    const {
      search,
      subject,
      classOrExam,
      city,
      area,
      mode,
      budgetMax,
      sort = 'newest',
      page = 1,
      limit = 9
    } = req.query;

    // Check system setting for guest directory visibility
    if (!req.user) {
      const guestSetting = await SystemSetting.findOne({ key: 'guestDirectoryVisible' });
      if (guestSetting && guestSetting.value === false) {
        return res.status(401).json({
          message: 'Guest directory viewing is disabled by administrator. Please log in to continue.',
          guestLocked: true
        });
      }
    }

    // Role enforcement: Students cannot browse students list
    if (req.user && req.user.role === 'student') {
      return res.status(403).json({
        message: 'As a student, you have access to the Find Teachers directory. The Students directory is reserved for teachers and tutors.',
        redirectTo: '/teachers'
      });
    }

    // Base query: approved students, not paused
    let query = {
      approvalStatus: 'approved',
      'privacy.pauseProfile': { $ne: true }
    };

    // Filter out blocked users if authenticated
    if (req.user) {
      const blockedRecords = await Block.find({
        $or: [{ blockerId: req.user._id }, { blockedId: req.user._id }]
      });
      const blockedUserIds = blockedRecords.map(b =>
        b.blockerId.toString() === req.user._id.toString() ? b.blockedId : b.blockerId
      );
      if (blockedUserIds.length > 0) {
        query.userId = { $nin: blockedUserIds };
      }
    }

    // Search query across jobId, student name, subjectsNeeded, classOrExam, goals, city, area
    if (search && search.trim()) {
      const reg = new RegExp(search.trim(), 'i');
      const matchingUsers = await User.find({ name: reg }).select('_id');
      const matchingUserIds = matchingUsers.map(u => u._id);

      query.$or = [
        { jobId: reg },
        ...(matchingUserIds.length > 0 ? [{ userId: { $in: matchingUserIds } }] : []),
        { subjectsNeeded: { $in: [reg] } },
        { classOrExam: reg },
        { classLevel: reg },
        { goals: reg },
        { 'location.city': reg },
        { area: reg }
      ];
    }

    if (subject && subject.trim()) {
      query.subjectsNeeded = { $in: [new RegExp(subject.trim(), 'i')] };
    }
    if (classOrExam && classOrExam.trim()) {
      const classReg = new RegExp(classOrExam.trim(), 'i');
      query.$or = [{ classOrExam: classReg }, { classLevel: classReg }];
    }
    if (city && city.trim()) {
      query['location.city'] = new RegExp(city.trim(), 'i');
    }
    if (area && area.trim()) {
      query.area = new RegExp(area.trim(), 'i');
    }
    if (mode && mode !== 'both') {
      query.$or = [
        { 'preferences.mode': mode },
        { 'preferences.mode': 'both' }
      ];
    }
    if (budgetMax) {
      query['budget.max'] = { $lte: Number(budgetMax) };
    }

    // Sort order
    let sortObj = { createdAt: -1 };
    if (sort === 'budget_high') sortObj = { 'budget.max': -1 };
    else if (sort === 'budget_low') sortObj = { 'budget.max': 1 };

    const parsedPage = Math.max(1, parseInt(page) || 1);
    const parsedLimit = Math.min(50, Math.max(1, parseInt(limit) || 9));
    const skip = (parsedPage - 1) * parsedLimit;

    const [students, total] = await Promise.all([
      StudentProfile.find(query)
        .populate('userId', 'name email phone avatar role isMinor parentGuardianConsent dateOfBirth')
        .sort(sortObj)
        .skip(skip)
        .limit(parsedLimit)
        .lean(),
      StudentProfile.countDocuments(query)
    ]);

    // Viewer coordinates
    let viewerCoords = null;
    let userConnections = new Map();
    if (req.user) {
      if (req.user.role === 'teacher') {
        const teacherProf = await TeacherProfile.findOne({ userId: req.user._id }).select('coordinates');
        if (teacherProf?.coordinates?.lat) viewerCoords = teacherProf.coordinates;
      }

      const studentUserIds = students.map(s => s.userId?._id).filter(Boolean);
      const connections = await ConnectionRequest.find({
        $or: [
          { fromUserId: req.user._id, toUserId: { $in: studentUserIds } },
          { fromUserId: { $in: studentUserIds }, toUserId: req.user._id }
        ]
      });
      connections.forEach(c => {
        const otherId = c.fromUserId.toString() === req.user._id.toString()
          ? c.toUserId.toString()
          : c.fromUserId.toString();
        userConnections.set(otherId, c.status);
      });
    }

    // Serialize profiles
    const serialized = students
      .filter(s => s.userId && s.userId.name)
      .map(s => {
        const connStatus = userConnections.get(s.userId._id.toString()) || null;
        return serializeProfile(s, req.user, connStatus, viewerCoords);
      });

    res.json({
      data: serialized,
      total,
      page: parsedPage,
      pages: Math.ceil(total / parsedLimit) || 1,
      isGuest: !req.user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/students/:id - Full student profile with privacy rules
router.get('/:id', profileViewLimiter, optionalAuth, async (req, res) => {
  try {
    const profile = await StudentProfile.findById(req.params.id)
      .populate('userId', 'name email phone avatar role isMinor parentGuardianConsent dateOfBirth');

    if (!profile || !profile.userId) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    // Check blocks
    if (req.user) {
      const isBlocked = await Block.findOne({
        $or: [
          { blockerId: req.user._id, blockedId: profile.userId._id },
          { blockerId: profile.userId._id, blockedId: req.user._id }
        ]
      });
      if (isBlocked) {
        return res.status(404).json({ message: 'Profile unavailable' });
      }
    }

    let connectionStatus = null;
    let viewerCoords = null;
    if (req.user) {
      const conn = await ConnectionRequest.findOne({
        $or: [
          { fromUserId: req.user._id, toUserId: profile.userId._id },
          { fromUserId: profile.userId._id, toUserId: req.user._id }
        ]
      });
      if (conn) connectionStatus = conn.status;

      if (req.user.role === 'teacher') {
        const tProf = await TeacherProfile.findOne({ userId: req.user._id }).select('coordinates');
        if (tProf?.coordinates?.lat) viewerCoords = tProf.coordinates;
      }
    }

    const serialized = serializeProfile(profile, req.user, connectionStatus, viewerCoords);

    // Audit logging for address or phone access
    if (req.user && req.user._id.toString() !== profile.userId._id.toString() && req.user.role !== 'admin') {
      const viewed = [];
      if (serialized.hasFullPhoneAccess) viewed.push('phone');
      if (serialized.hasFullAddressAccess) viewed.push('fullAddress');
      viewed.push('profile');

      await ProfileViewLog.create({
        viewerId: req.user._id,
        targetId: profile.userId._id,
        viewedFields: viewed,
        ipAddress: req.ip || '',
        userAgent: req.headers['user-agent'] || ''
      });
    }

    res.json(serialized);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/students/profile - Update student profile (student only)
router.put('/profile', authenticate, authorize('student'), async (req, res) => {
  try {
    const { name, phone, ...updateData } = req.body;
    delete updateData.userId;
    delete updateData.approvalStatus;

    if (phone !== undefined && phone.trim()) {
      const phoneValidation = await validateUniquePhone(phone, req.user._id, false);
      if (!phoneValidation.isValid) {
        return res.status(400).json({ message: phoneValidation.message });
      }
      await User.findByIdAndUpdate(req.user._id, {
        ...(name && { name }),
        phone: phoneValidation.phone
      });
    } else if (name) {
      await User.findByIdAndUpdate(req.user._id, { name });
    }

    const profile = await StudentProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone avatar role');

    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(serializeProfile(profile, req.user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/students/privacy - Update privacy toggles
router.patch('/privacy', authenticate, authorize('student'), async (req, res) => {
  try {
    const { showPhone, showFullAddress, pauseProfile } = req.body;
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    if (showPhone !== undefined) profile.privacy.showPhone = Boolean(showPhone);
    if (showFullAddress !== undefined) profile.privacy.showFullAddress = Boolean(showFullAddress);
    if (pauseProfile !== undefined) profile.privacy.pauseProfile = Boolean(pauseProfile);

    await profile.save();
    res.json({ message: 'Privacy settings updated successfully', privacy: profile.privacy });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/students/profile/photo - Upload student photo
router.post('/profile/photo', authenticate, authorize('student'), upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const photoUrl = `/uploads/${req.file.filename}`;
    await StudentProfile.findOneAndUpdate(
      { userId: req.user._id },
      { profilePhotoUrl: photoUrl }
    );
    await User.findByIdAndUpdate(req.user._id, { avatar: photoUrl });
    res.json({ message: 'Photo uploaded successfully', profilePhotoUrl: photoUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
