import express from 'express';
import SavedProfile from '../models/SavedProfile.js';
import TeacherProfile from '../models/TeacherProfile.js';
import StudentProfile from '../models/StudentProfile.js';
import { authenticate } from '../middleware/auth.js';
import { serializeProfile } from '../utils/serializeProfile.js';

const router = express.Router();

router.use(authenticate);

// POST /api/saved/toggle - Toggle save/shortlist status
router.post('/toggle', async (req, res) => {
  try {
    const { profileId, profileType, targetUserId } = req.body;
    const userId = req.user._id;

    if (!profileId || !profileType || !targetUserId) {
      return res.status(400).json({ message: 'profileId, profileType, and targetUserId are required' });
    }

    const existing = await SavedProfile.findOne({ userId, targetUserId });
    if (existing) {
      await existing.deleteOne();
      return res.json({ message: 'Profile removed from saved list', isSaved: false });
    }

    const saved = await SavedProfile.create({
      userId,
      targetUserId,
      profileId,
      profileType
    });

    res.status(201).json({ message: 'Profile saved successfully', isSaved: true, saved });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/saved/ids - Quick list of saved profile IDs for button states
router.get('/ids', async (req, res) => {
  try {
    const userId = req.user._id;
    const saved = await SavedProfile.find({ userId }).select('profileId targetUserId');
    res.json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/saved - Full list of saved profiles
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id;
    const savedList = await SavedProfile.find({ userId }).sort({ createdAt: -1 });

    const results = await Promise.all(savedList.map(async (item) => {
      let profileDoc = null;
      if (item.profileType === 'teacher') {
        profileDoc = await TeacherProfile.findById(item.profileId).populate('userId', 'name avatar role email phone isMinor');
      } else {
        profileDoc = await StudentProfile.findById(item.profileId).populate('userId', 'name avatar role email phone isMinor');
      }

      if (!profileDoc) return null;
      const serialized = serializeProfile(profileDoc, req.user, null);
      return {
        _id: item._id,
        profileType: item.profileType,
        profile: serialized,
        savedAt: item.createdAt
      };
    }));

    res.json(results.filter(Boolean));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
