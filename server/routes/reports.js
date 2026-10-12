import express from 'express';
import Report from '../models/Report.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// POST /api/reports - Report a profile
router.post('/', async (req, res) => {
  try {
    const { targetId, reason, description } = req.body;
    const reporterId = req.user._id;

    if (!targetId || !reason) {
      return res.status(400).json({ message: 'Target user ID and reason are required' });
    }

    if (targetId.toString() === reporterId.toString()) {
      return res.status(400).json({ message: 'Cannot report yourself' });
    }

    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User to report not found' });
    }

    const report = await Report.create({
      reporterId,
      targetId,
      reason,
      description: description || '',
      status: 'pending'
    });

    res.status(201).json({ message: 'Report submitted successfully for admin review', report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
