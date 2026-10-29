import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import TeacherProfile from '../models/TeacherProfile.js';
import StudentProfile from '../models/StudentProfile.js';
import User from '../models/User.js';
import Block from '../models/Block.js';
import ConnectionRequest from '../models/ConnectionRequest.js';
import ProfileViewLog from '../models/ProfileViewLog.js';
import SystemSetting from '../models/SystemSetting.js';
import { authenticate, optionalAuth, authorize } from '../middleware/auth.js';
import { directoryLimiter, profileViewLimiter } from '../middleware/rateLimiter.js';
import { serializeProfile } from '../utils/serializeProfile.js';
import { validateUniquePhone } from '../utils/identityValidator.js';
import { checkAndNotifyPhoneChange } from '../utils/notifyAdminOnPhoneChange.js';

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
    cb(null, `teacher-${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
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

// Multer setup for verification documents (Images & PDFs up to 10MB)
const docUpload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const dir = 'uploads/';
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: function (req, file, cb) {
      cb(null, `doc-${req.user._id}-${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images (JPG, PNG) and PDF documents are allowed'));
    }
  }
});

// GET /api/teachers - List with strict role enforcement, search & filters
router.get('/', directoryLimiter, optionalAuth, async (req, res) => {
  try {
    const {
      search,
      subject,
      exam,
      city,
      area,
      teachingMode,
      feeMin,
      feeMax,
      experienceMin,
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

    // Role enforcement: Teachers cannot browse teachers list
    if (req.user && req.user.role === 'teacher') {
      return res.status(403).json({
        message: 'As a teacher, you have access to the Find Students directory. The Teachers directory is reserved for students and institutes.',
        redirectTo: '/students'
      });
    }

    // Base query: approved teachers, not paused
    let query = {
      approvalStatus: 'approved',
      'privacy.pauseProfile': { $ne: true }
    };

    // Filter out blocked users if user is authenticated
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

    // Search query across jobId, name, subjects, exams, bio, city, area
    if (search && search.trim()) {
      const reg = new RegExp(search.trim(), 'i');
      const matchingUsers = await User.find({ name: reg }).select('_id');
      const matchingUserIds = matchingUsers.map(u => u._id);

      query.$or = [
        { jobId: reg },
        ...(matchingUserIds.length > 0 ? [{ userId: { $in: matchingUserIds } }] : []),
        { subjects: { $in: [reg] } },
        { exams: { $in: [reg] } },
        { bio: reg },
        { 'location.city': reg },
        { area: reg }
      ];
    }

    if (subject && subject.trim()) {
      query.subjects = { $in: [new RegExp(subject.trim(), 'i')] };
    }
    if (exam && exam.trim()) {
      query.exams = { $in: [new RegExp(exam.trim(), 'i')] };
    }
    if (city && city.trim()) {
      query['location.city'] = new RegExp(city.trim(), 'i');
    }
    if (area && area.trim()) {
      query.area = new RegExp(area.trim(), 'i');
    }
    if (teachingMode && teachingMode !== 'all') {
      query.$or = [
        { teachingMode },
        { teachingMode: 'all' }
      ];
    }
    if (experienceMin) {
      query.experience = { $gte: Number(experienceMin) };
    }
    if (feeMin || feeMax) {
      query['fee.amount'] = {};
      if (feeMin) query['fee.amount'].$gte = Number(feeMin);
      if (feeMax) query['fee.amount'].$lte = Number(feeMax);
    }

    // Sort order
    let sortObj = { createdAt: -1 };
    if (sort === 'most_experienced') sortObj = { experience: -1 };
    else if (sort === 'highest_rated') sortObj = { rating: -1 };
    else if (sort === 'fee_low') sortObj = { 'fee.amount': 1 };
    else if (sort === 'fee_high') sortObj = { 'fee.amount': -1 };

    const parsedPage = Math.max(1, parseInt(page) || 1);
    const parsedLimit = Math.min(50, Math.max(1, parseInt(limit) || 9));
    const skip = (parsedPage - 1) * parsedLimit;

    const [teachers, total] = await Promise.all([
      TeacherProfile.find(query)
        .populate('userId', 'name email phone avatar role isMinor')
        .sort(sortObj)
        .skip(skip)
        .limit(parsedLimit)
        .lean(),
      TeacherProfile.countDocuments(query)
    ]);

    // Viewer coordinates for distance
    let viewerCoords = null;
    let userConnections = new Map();
    if (req.user) {
      if (req.user.role === 'student') {
        const studentProf = await StudentProfile.findOne({ userId: req.user._id }).select('coordinates');
        if (studentProf?.coordinates?.lat) viewerCoords = studentProf.coordinates;
      }
      // Bulk fetch connection status
      const teacherUserIds = teachers.map(t => t.userId?._id).filter(Boolean);
      const connections = await ConnectionRequest.find({
        $or: [
          { fromUserId: req.user._id, toUserId: { $in: teacherUserIds } },
          { fromUserId: { $in: teacherUserIds }, toUserId: req.user._id }
        ]
      });
      connections.forEach(c => {
        const otherId = c.fromUserId.toString() === req.user._id.toString()
          ? c.toUserId.toString()
          : c.fromUserId.toString();
        userConnections.set(otherId, c.status);
      });
    }

    // Serialize each teacher profile
    const serialized = teachers
      .filter(t => t.userId && t.userId.name)
      .map(t => {
        const connStatus = userConnections.get(t.userId._id.toString()) || null;
        return serializeProfile(t, req.user, connStatus, viewerCoords);
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

// GET /api/teachers/verification - Get verification status and details for logged-in teacher
router.get('/verification', authenticate, authorize('teacher'), async (req, res) => {
  try {
    let profile = await TeacherProfile.findOne({ userId: req.user._id }).populate('userId', 'name email phone avatar');
    if (!profile) {
      profile = await TeacherProfile.create({ userId: req.user._id });
      profile = await TeacherProfile.findById(profile._id).populate('userId', 'name email phone avatar');
    }

    res.json({
      verificationStatus: profile.verificationStatus || 'unverified',
      isVerified: profile.isVerified || false,
      rejectionReason: profile.rejectionReason || '',
      verificationSubmittedAt: profile.verificationSubmittedAt,
      verifiedAt: profile.verifiedAt,
      verificationPhone: profile.verificationPhone || profile.userId?.phone || req.user.phone || '',
      preferredCallingTime: profile.preferredCallingTime || 'Anytime',
      govtId: profile.govtId || {},
      degreeDetails: profile.degreeDetails || {},
      certificationDetails: profile.certificationDetails || {},
      instituteDetails: profile.instituteDetails || {},
      referenceContact: profile.referenceContact || {},
      teachingPhilosophy: profile.teachingPhilosophy || '',
      bio: profile.bio || '',
      demoVideoUrl: profile.demoVideoUrl || '',
      experience: profile.experience || 0,
      subjects: profile.subjects || [],
      exams: profile.exams || [],
      board: profile.board || 'ICSE',
      teachingMode: profile.teachingMode || 'HOME',
      feeAmount: profile.fee?.amount ?? 3000,
      feePeriod: profile.fee?.period || 'monthly',
      preferredTime: profile.preferredTime || 'After 4',
      daysPerWeek: profile.daysPerWeek || '6 days a week',
      tutorGender: profile.tutorGender || 'Any',
      studentGender: profile.studentGender || 'Female',
      city: profile.location?.city || 'Prayagraj',
      area: profile.area || '',
      pincode: profile.location?.pincode || ''
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/teachers/me/verification alias
router.get('/me/verification', authenticate, authorize('teacher'), async (req, res) => {
  try {
    let profile = await TeacherProfile.findOne({ userId: req.user._id }).populate('userId', 'name email phone avatar');
    if (!profile) {
      profile = await TeacherProfile.create({ userId: req.user._id });
      profile = await TeacherProfile.findById(profile._id).populate('userId', 'name email phone avatar');
    }

    res.json({
      verificationStatus: profile.verificationStatus || 'unverified',
      isVerified: profile.isVerified || false,
      rejectionReason: profile.rejectionReason || '',
      verificationSubmittedAt: profile.verificationSubmittedAt,
      verifiedAt: profile.verifiedAt,
      verificationPhone: profile.verificationPhone || profile.userId?.phone || req.user.phone || '',
      preferredCallingTime: profile.preferredCallingTime || 'Anytime',
      govtId: profile.govtId || {},
      degreeDetails: profile.degreeDetails || {},
      certificationDetails: profile.certificationDetails || {},
      instituteDetails: profile.instituteDetails || {},
      referenceContact: profile.referenceContact || {},
      teachingPhilosophy: profile.teachingPhilosophy || '',
      bio: profile.bio || '',
      demoVideoUrl: profile.demoVideoUrl || '',
      experience: profile.experience || 0,
      subjects: profile.subjects || [],
      exams: profile.exams || [],
      board: profile.board || 'ICSE',
      teachingMode: profile.teachingMode || 'HOME',
      feeAmount: profile.fee?.amount ?? 3000,
      feePeriod: profile.fee?.period || 'monthly',
      preferredTime: profile.preferredTime || 'After 4',
      daysPerWeek: profile.daysPerWeek || '6 days a week',
      tutorGender: profile.tutorGender || 'Any',
      studentGender: profile.studentGender || 'Female',
      city: profile.location?.city || 'Prayagraj',
      area: profile.area || '',
      pincode: profile.location?.pincode || ''
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/teachers/verification - Submit verification documents and details
router.post(
  '/verification',
  authenticate,
  authorize('teacher'),
  docUpload.fields([
    { name: 'govtIdDoc', maxCount: 1 },
    { name: 'degreeDoc', maxCount: 1 },
    { name: 'certificationDoc', maxCount: 1 },
    { name: 'instituteDoc', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      let profile = await TeacherProfile.findOne({ userId: req.user._id });
      if (!profile) {
        profile = await TeacherProfile.create({ userId: req.user._id });
      }

      // Handle file uploads if present
      if (req.files) {
        if (req.files.govtIdDoc && req.files.govtIdDoc[0]) {
          profile.govtId.documentUrl = `/uploads/${req.files.govtIdDoc[0].filename}`;
        }
        if (req.files.degreeDoc && req.files.degreeDoc[0]) {
          profile.degreeDetails.degreeDocumentUrl = `/uploads/${req.files.degreeDoc[0].filename}`;
        }
        if (req.files.certificationDoc && req.files.certificationDoc[0]) {
          profile.certificationDetails.certificateDocumentUrl = `/uploads/${req.files.certificationDoc[0].filename}`;
        }
        if (req.files.instituteDoc && req.files.instituteDoc[0]) {
          profile.instituteDetails.instituteDocumentUrl = `/uploads/${req.files.instituteDoc[0].filename}`;
        }
      }

      // Handle text fields
      const {
        idType, idNumber,
        verificationPhone, preferredCallingTime,
        highestDegree, university, yearOfPassing,
        certificationName, rollOrCertNumber,
        currentOrPastInstitute, designation,
        referenceName, referenceRelation, referencePhone, referenceEmail,
        teachingPhilosophy, bio, demoVideoUrl, experience,
        subjects, exams,
        board, teachingMode, feeAmount, feePeriod,
        preferredTime, daysPerWeek, tutorGender, studentGender,
        city, area, pincode
      } = req.body;

      // Identity
      if (idType !== undefined) profile.govtId.idType = idType;
      if (idNumber !== undefined) profile.govtId.idNumber = idNumber;

      // Verification & Coordination Phone
      if (verificationPhone !== undefined && verificationPhone.trim()) {
        const phoneValidation = await validateUniquePhone(verificationPhone, req.user._id, true);
        if (!phoneValidation.isValid) {
          return res.status(400).json({ message: phoneValidation.message });
        }
        profile.verificationPhone = phoneValidation.phone;
        await User.findByIdAndUpdate(profile.userId, { phone: phoneValidation.phone });
      }
      if (preferredCallingTime !== undefined) {
        profile.preferredCallingTime = preferredCallingTime;
      }

      // Degree
      if (highestDegree !== undefined) profile.degreeDetails.highestDegree = highestDegree;
      if (university !== undefined) profile.degreeDetails.university = university;
      if (yearOfPassing !== undefined) profile.degreeDetails.yearOfPassing = yearOfPassing;

      // Certification
      if (certificationName !== undefined) profile.certificationDetails.certificationName = certificationName;
      if (rollOrCertNumber !== undefined) profile.certificationDetails.rollOrCertNumber = rollOrCertNumber;

      // Institute
      if (currentOrPastInstitute !== undefined) profile.instituteDetails.currentOrPastInstitute = currentOrPastInstitute;
      if (designation !== undefined) profile.instituteDetails.designation = designation;

      // Reference
      if (referenceName !== undefined) profile.referenceContact.name = referenceName;
      if (referenceRelation !== undefined) profile.referenceContact.relation = referenceRelation;
      if (referencePhone !== undefined) profile.referenceContact.phone = referencePhone;
      if (referenceEmail !== undefined) profile.referenceContact.email = referenceEmail;

      // Teaching Philosophy & Bio
      if (teachingPhilosophy !== undefined) profile.teachingPhilosophy = teachingPhilosophy;
      if (bio !== undefined) profile.bio = bio;
      if (demoVideoUrl !== undefined) profile.demoVideoUrl = demoVideoUrl;
      if (experience !== undefined && experience !== '') profile.experience = Number(experience) || profile.experience;

      if (subjects) {
        profile.subjects = Array.isArray(subjects) ? subjects : subjects.split(',').map(s => s.trim()).filter(Boolean);
      }
      if (exams) {
        profile.exams = Array.isArray(exams) ? exams : exams.split(',').map(e => e.trim()).filter(Boolean);
      }
      if (board) profile.board = board;
      if (teachingMode) profile.teachingMode = teachingMode;
      if (feeAmount !== undefined && feeAmount !== '') {
        if (!profile.fee) profile.fee = {};
        profile.fee.amount = Number(feeAmount) || 3000;
      }
      if (feePeriod) {
        if (!profile.fee) profile.fee = {};
        profile.fee.period = feePeriod;
      }
      if (preferredTime) profile.preferredTime = preferredTime;
      if (daysPerWeek) profile.daysPerWeek = daysPerWeek;
      if (tutorGender) profile.tutorGender = tutorGender;
      if (studentGender) profile.studentGender = studentGender;
      if (city || area || pincode) {
        if (!profile.location) profile.location = {};
        if (city) profile.location.city = city;
        if (pincode) profile.location.pincode = pincode;
        if (area) profile.area = area;
      }

      // Set status to pending review only when teacher submits verification details
      profile.verificationStatus = 'pending';
      profile.verificationSubmittedAt = new Date();
      profile.viewedByAdmin = false; // Alert admin queue that verification has been submitted
      profile.rejectionReason = ''; // Clear previous rejection reason

      await profile.save();

      res.json({
        message: 'Your verification details have been submitted successfully. Our team will review within 24–48 hours.',
        verificationStatus: profile.verificationStatus,
        profile
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// POST /api/teachers/verification/skip - Skip verification for now
router.post('/verification/skip', authenticate, authorize('teacher'), async (req, res) => {
  try {
    let profile = await TeacherProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = await TeacherProfile.create({ userId: req.user._id });
    }

    // Skipping prompt allows user to browse without blocking; profile remains unverified until submitted
    if (profile.verificationStatus !== 'verified') {
      if (!profile.verificationStatus) {
        profile.verificationStatus = 'unverified';
      }
      profile.isVerified = false;
      await profile.save();
    }

    res.json({
      message: 'Verification prompt skipped for this session. Complete your verification anytime to unlock student outreach.',
      verificationStatus: profile.verificationStatus,
      approvalStatus: profile.approvalStatus
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/teachers/:id - Full teacher profile with privacy rules
router.get('/:id', profileViewLimiter, optionalAuth, async (req, res) => {
  try {
    const profile = await TeacherProfile.findById(req.params.id)
      .populate('userId', 'name email phone avatar role isMinor parentGuardianConsent dateOfBirth');
    
    if (!profile || !profile.userId) {
      return res.status(404).json({ message: 'Teacher profile not found' });
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

    // Check connection status
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

      if (req.user.role === 'student') {
        const sProf = await StudentProfile.findOne({ userId: req.user._id }).select('coordinates');
        if (sProf?.coordinates?.lat) viewerCoords = sProf.coordinates;
      }
    }

    const serialized = serializeProfile(profile, req.user, connectionStatus, viewerCoords);

    // Audit logging: If sensitive contact/address fields were revealed to another user, log it
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

// PUT /api/teachers/profile - Update teacher profile (teacher only)
router.put('/profile', authenticate, authorize('teacher'), async (req, res) => {
  try {
    const { name, phone, ...updateData } = req.body;
    delete updateData.userId;
    delete updateData.isVerified;
    delete updateData.approvalStatus;
    delete updateData.verificationStatus;

    const oldPhone = req.user.phone || '';
    let phoneChanged = false;
    let newPhoneVal = '';

    if (phone !== undefined && phone.trim()) {
      const phoneValidation = await validateUniquePhone(phone, req.user._id, false);
      if (!phoneValidation.isValid) {
        return res.status(400).json({ message: phoneValidation.message });
      }
      if (oldPhone && oldPhone !== phoneValidation.phone) {
        phoneChanged = true;
        newPhoneVal = phoneValidation.phone;
      }
      await User.findByIdAndUpdate(req.user._id, {
        ...(name && { name }),
        phone: phoneValidation.phone
      });
      updateData.verificationPhone = phoneValidation.phone;
    } else if (name) {
      await User.findByIdAndUpdate(req.user._id, { name });
    }

    const profile = await TeacherProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone avatar role');

    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    if (phoneChanged && newPhoneVal) {
      await checkAndNotifyPhoneChange({ user: profile.userId || req.user, oldPhone, newPhone: newPhoneVal }).catch(err => {
        console.error('Failed to notify admin on teacher phone change:', err);
      });
    }
    res.json(serializeProfile(profile, req.user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/teachers/privacy - Update privacy toggles
router.patch('/privacy', authenticate, authorize('teacher'), async (req, res) => {
  try {
    const { showPhone, showFullAddress, pauseProfile } = req.body;
    const profile = await TeacherProfile.findOne({ userId: req.user._id });
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

// POST /api/teachers/profile/photo - Upload profile photo
router.post('/profile/photo', authenticate, authorize('teacher'), upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const photoUrl = `/uploads/${req.file.filename}`;
    await TeacherProfile.findOneAndUpdate(
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
