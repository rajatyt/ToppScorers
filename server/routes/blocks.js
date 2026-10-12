import express from 'express';
import Block from '../models/Block.js';
import User from '../models/User.js';
import ConnectionRequest from '../models/ConnectionRequest.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// POST /api/blocks - Block a user
router.post('/', async (req, res) => {
  try {
    const { targetUserId } = req.body;
    const blockerId = req.user._id;

    if (!targetUserId) {
      return res.status(400).json({ message: 'Target user ID is required' });
    }

    if (targetUserId.toString() === blockerId.toString()) {
      return res.status(400).json({ message: 'Cannot block yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User to block not found' });
    }

    // Upsert block
    await Block.findOneAndUpdate(
      { blockerId, blockedId: targetUserId },
      { blockerId, blockedId: targetUserId },
      { upsert: true, new: true }
    );

    // Cancel any active/pending connection requests between them
    await ConnectionRequest.deleteMany({
      $or: [
        { fromUserId: blockerId, toUserId: targetUserId },
        { fromUserId: targetUserId, toUserId: blockerId }
      ]
    });

    res.json({ message: 'User blocked successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/blocks/:targetUserId - Unblock a user
router.delete('/:targetUserId', async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const blockerId = req.user._id;

    await Block.findOneAndDelete({ blockerId, blockedId: targetUserId });
    res.json({ message: 'User unblocked successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/blocks - List blocked users
router.get('/', async (req, res) => {
  try {
    const blockerId = req.user._id;
    const blocks = await Block.find({ blockerId })
      .populate('blockedId', 'name avatar role email')
      .sort({ createdAt: -1 });

    res.json(blocks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
