import express from 'express';
import ConnectionRequest from '../models/ConnectionRequest.js';
import User from '../models/User.js';
import TeacherProfile from '../models/TeacherProfile.js';
import StudentProfile from '../models/StudentProfile.js';
import Block from '../models/Block.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// POST /api/connections - Send connection request
router.post('/', async (req, res) => {
  try {
    const { toUserId, message } = req.body;
    const fromUserId = req.user._id;

    if (!toUserId) {
      return res.status(400).json({ message: 'Target user ID is required' });
    }

    if (toUserId.toString() === fromUserId.toString()) {
      return res.status(400).json({ message: 'Cannot send connection request to yourself' });
    }

    const targetUser = await User.findById(toUserId);
    if (!targetUser || !targetUser.isActive) {
      return res.status(404).json({ message: 'Target user not found or inactive' });
    }

    // Role Rule: Teachers must be verified before initiating connection requests to students
    if (req.user.role === 'teacher' && targetUser.role === 'student') {
      const teacherProf = await TeacherProfile.findOne({ userId: fromUserId });
      if (!teacherProf || !teacherProf.isVerified || teacherProf.verificationStatus !== 'verified') {
        const vStatus = teacherProf?.verificationStatus || 'unverified';
        return res.status(403).json({
          message: vStatus === 'pending'
            ? 'Your verification is currently under review by our team. You cannot send connection requests to students until your documents are approved.'
            : vStatus === 'rejected'
            ? `Your verification was not approved: "${teacherProf?.rejectionReason || 'Please resubmit valid credentials'}". Update your documents to contact students.`
            : 'Verification Required: Only verified teachers can send connection requests to students. Complete teacher verification to unlock student outreach.',
          verificationRequired: true,
          verificationStatus: vStatus,
          rejectionReason: teacherProf?.rejectionReason || ''
        });
      }
    }

    // Check if either user has blocked the other
    const block = await Block.findOne({
      $or: [
        { blockerId: fromUserId, blockedId: toUserId },
        { blockerId: toUserId, blockedId: fromUserId }
      ]
    });
    if (block) {
      return res.status(403).json({ message: 'Unable to connect with this user' });
    }

    // Check existing request
    const existing = await ConnectionRequest.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId }
      ]
    });

    if (existing) {
      if (existing.status === 'accepted') {
        return res.status(400).json({ message: 'You are already connected with this user', request: existing });
      }
      if (existing.status === 'pending') {
        return res.status(400).json({ message: 'A connection request is already pending', request: existing });
      }
      // If declined, update to pending with new message
      existing.fromUserId = fromUserId;
      existing.toUserId = toUserId;
      existing.message = message || 'Hi, I would like to connect with you regarding tuition on ToppScorers.';
      existing.status = 'pending';
      existing.viewedByToUser = false;
      existing.viewedByFromUser = true;
      existing.viewedByAdmin = false;
      await existing.save();
      return res.json({ message: 'Connection request sent successfully', request: existing });
    }

    const newRequest = await ConnectionRequest.create({
      fromUserId,
      toUserId,
      message: message || 'Hi, I would like to connect with you regarding tuition on ToppScorers.',
      status: 'pending',
      viewedByToUser: false,
      viewedByFromUser: true,
      viewedByAdmin: false
    });

    res.status(201).json({ message: 'Connection request sent successfully', request: newRequest });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/connections - Get requests (incoming, outgoing, accepted)
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id;
    const { type = 'all' } = req.query;

    let query = {};
    if (type === 'incoming') {
      query = { toUserId: userId, status: 'pending' };
    } else if (type === 'outgoing') {
      query = { fromUserId: userId, status: 'pending' };
    } else if (type === 'accepted') {
      query = {
        $or: [{ fromUserId: userId }, { toUserId: userId }],
        status: 'accepted'
      };
    } else {
      query = {
        $or: [{ fromUserId: userId }, { toUserId: userId }]
      };
    }

    const requests = await ConnectionRequest.find(query)
      .populate('fromUserId', 'name email avatar role isMinor')
      .populate('toUserId', 'name email avatar role isMinor')
      .sort({ updatedAt: -1 })
      .lean();

    // Attach profile summary to each user in request
    const enriched = await Promise.all(requests.map(async (reqItem) => {
      const isIncoming = reqItem.toUserId?._id?.toString() === userId.toString();
      const otherUser = isIncoming ? reqItem.fromUserId : reqItem.toUserId;

      let otherProfile = null;
      if (otherUser) {
        if (otherUser.role === 'teacher') {
          otherProfile = await TeacherProfile.findOne({ userId: otherUser._id }).select('subjects experience location rating fullAddress');
        } else if (otherUser.role === 'student') {
          otherProfile = await StudentProfile.findOne({ userId: otherUser._id }).select('subjectsNeeded classOrExam location fullAddress');
        }
      }

      return {
        ...reqItem,
        isIncoming,
        otherUser,
        otherProfile
      };
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/connections/status/:targetUserId - Check connection status
router.get('/status/:targetUserId', async (req, res) => {
  try {
    const userId = req.user._id;
    const { targetUserId } = req.params;

    const request = await ConnectionRequest.findOne({
      $or: [
        { fromUserId: userId, toUserId: targetUserId },
        { fromUserId: targetUserId, toUserId: userId }
      ]
    });

    if (!request) {
      return res.json({ status: 'none', request: null });
    }

    const isSender = request.fromUserId.toString() === userId.toString();
    res.json({
      status: request.status,
      isSender,
      request
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/connections/:id - Accept or decline request
router.patch('/:id', async (req, res) => {
  try {
    const { action } = req.body; // 'accept' or 'decline'
    const userId = req.user._id;

    if (!['accept', 'decline'].includes(action)) {
      return res.status(400).json({ message: "Action must be 'accept' or 'decline'" });
    }

    const request = await ConnectionRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Connection request not found' });
    }

    // Only recipient can accept or decline
    if (request.toUserId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Only the recipient can accept or decline this request' });
    }

    request.status = action === 'accept' ? 'accepted' : 'declined';
    request.viewedByFromUser = false; // Notify initiator that their request was accepted/declined
    request.viewedByToUser = true;   // Recipient just performed the action
    request.viewedByAdmin = false;   // Notify admin of the update
    await request.save();

    res.json({
      message: `Connection request ${request.status}`,
      request
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/connections/unread-counts - Get WhatsApp/Instagram style unread badge counts
router.get('/unread-counts', async (req, res) => {
  try {
    const userId = req.user._id;

    // Incoming unread: requests sent to this user that are pending and unviewed
    const incomingCount = await ConnectionRequest.countDocuments({
      toUserId: userId,
      status: 'pending',
      viewedByToUser: false
    });

    // Outgoing/Sent unread: requests sent by this user that were declined or updated and unviewed
    const sentCount = await ConnectionRequest.countDocuments({
      fromUserId: userId,
      status: 'declined',
      viewedByFromUser: false
    });

    // Connected unread: accepted connections involving this user that have not been viewed yet
    const acceptedCount = await ConnectionRequest.countDocuments({
      status: 'accepted',
      $or: [
        { fromUserId: userId, viewedByFromUser: false },
        { toUserId: userId, viewedByToUser: false }
      ]
    });

    const total = incomingCount + sentCount + acceptedCount;

    res.json({
      incoming: incomingCount,
      sent: sentCount,
      accepted: acceptedCount,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/connections/mark-viewed - Instantly clear notification count when a section is opened
router.post('/mark-viewed', async (req, res) => {
  try {
    const userId = req.user._id;
    const { type } = req.body; // 'incoming' | 'outgoing' | 'sent' | 'accepted' | 'all'

    if (type === 'incoming') {
      await ConnectionRequest.updateMany(
        { toUserId: userId, status: 'pending', viewedByToUser: false },
        { $set: { viewedByToUser: true } }
      );
    } else if (type === 'outgoing' || type === 'sent') {
      await ConnectionRequest.updateMany(
        { fromUserId: userId, viewedByFromUser: false },
        { $set: { viewedByFromUser: true } }
      );
    } else if (type === 'accepted' || type === 'connected') {
      await ConnectionRequest.updateMany(
        { fromUserId: userId, status: 'accepted', viewedByFromUser: false },
        { $set: { viewedByFromUser: true } }
      );
      await ConnectionRequest.updateMany(
        { toUserId: userId, status: 'accepted', viewedByToUser: false },
        { $set: { viewedByToUser: true } }
      );
    } else if (type === 'all') {
      await ConnectionRequest.updateMany(
        { toUserId: userId, viewedByToUser: false },
        { $set: { viewedByToUser: true } }
      );
      await ConnectionRequest.updateMany(
        { fromUserId: userId, viewedByFromUser: false },
        { $set: { viewedByFromUser: true } }
      );
    }

    res.json({ message: `Section ${type || 'all'} marked as viewed` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
