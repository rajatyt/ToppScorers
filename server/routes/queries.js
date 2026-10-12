import express from 'express';
import Query from '../models/Query.js';
import User from '../models/User.js';
import TeacherProfile from '../models/TeacherProfile.js';
import StudentProfile from '../models/StudentProfile.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// ==========================================
// USER ROUTES (Students & Teachers)
// ==========================================

// POST /api/queries - Create a new doubt or issue
router.post('/', authenticate, async (req, res) => {
  try {
    const { subject, category, message, priority } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ message: 'Subject and message are required' });
    }

    // Resolve user's Job ID & profile phone if not on user
    let jobId = '';
    let phone = req.user.phone || '';

    if (req.user.role === 'teacher') {
      const profile = await TeacherProfile.findOne({ userId: req.user._id });
      if (profile) {
        jobId = profile.jobId || '';
        if (!phone) phone = profile.verificationPhone || '';
      }
    } else if (req.user.role === 'student') {
      const profile = await StudentProfile.findOne({ userId: req.user._id });
      if (profile) {
        jobId = profile.jobId || '';
      }
    }

    const query = await Query.create({
      userId: req.user._id,
      jobId,
      name: req.user.name,
      email: req.user.email,
      phone,
      role: req.user.role,
      subject: subject.trim(),
      category: category || 'general',
      message: message.trim(),
      priority: priority || 'medium',
      status: 'open',
      conversation: [
        {
          sender: 'user',
          senderName: req.user.name,
          senderRole: req.user.role,
          message: message.trim(),
          timestamp: new Date()
        }
      ],
      userViewed: true,
      adminViewed: false
    });

    res.status(201).json({
      message: 'Your query has been submitted to admin support. You will receive a response shortly.',
      query
    });
  } catch (err) {
    console.error('Error creating query:', err);
    res.status(500).json({ message: 'Failed to submit query', error: err.message });
  }
});

// GET /api/queries - Get current user's queries
router.get('/', authenticate, async (req, res) => {
  try {
    const queries = await Query.find({ userId: req.user._id }).sort({ updatedAt: -1 });
    res.json(queries);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch queries', error: err.message });
  }
});

// GET /api/queries/unread-count - Unread admin responses for logged-in user
router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const unreadCount = await Query.countDocuments({
      userId: req.user._id,
      userViewed: false,
      adminResponse: { $exists: true, $ne: '' }
    });
    res.json({ unread: unreadCount });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get unread count' });
  }
});

// POST /api/queries/mark-viewed - User marks all their queries as viewed
router.post('/mark-viewed', authenticate, async (req, res) => {
  try {
    await Query.updateMany({ userId: req.user._id, userViewed: false }, { userViewed: true });
    res.json({ message: 'Queries marked as viewed' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark as viewed' });
  }
});

// GET /api/queries/:id - Get specific query details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const query = await Query.findById(req.params.id);
    if (!query) {
      return res.status(404).json({ message: 'Query not found' });
    }
    if (query.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // If viewed by owner, mark userViewed = true
    if (query.userId.toString() === req.user._id.toString() && !query.userViewed) {
      query.userViewed = true;
      await query.save();
    }

    res.json(query);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch query', error: err.message });
  }
});

// POST /api/queries/:id/reply - User sends follow-up response
router.post('/:id/reply', authenticate, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Reply message cannot be empty' });
    }

    const query = await Query.findById(req.params.id);
    if (!query) {
      return res.status(404).json({ message: 'Query not found' });
    }
    if (query.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    query.conversation.push({
      sender: 'user',
      senderName: req.user.name,
      senderRole: req.user.role,
      message: message.trim(),
      timestamp: new Date()
    });

    query.adminViewed = false;
    query.userViewed = true;
    if (query.status === 'resolved' || query.status === 'closed') {
      query.status = 'open';
    }

    await query.save();
    res.json({ message: 'Reply submitted successfully', query });
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit reply', error: err.message });
  }
});

// POST /api/queries/:id/mark-resolved - User marks query as resolved
router.post('/:id/mark-resolved', authenticate, async (req, res) => {
  try {
    const query = await Query.findById(req.params.id);
    if (!query) {
      return res.status(404).json({ message: 'Query not found' });
    }
    if (query.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    query.status = 'resolved';
    query.userViewed = true;
    await query.save();

    res.json({ message: 'Query marked as resolved', query });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update status', error: err.message });
  }
});

// ==========================================
// ADMIN ROUTES (Dedicated Super Admin)
// ==========================================

// GET /api/queries/admin/all - Get all queries with filters & search
router.get('/admin/all', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { status, category, role, search, page = 1, limit = 25 } = req.query;

    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (category && category !== 'all') filter.category = category;
    if (role && role !== 'all') filter.role = role;

    if (search && search.trim()) {
      const reg = new RegExp(search.trim(), 'i');
      filter.$or = [
        { jobId: reg },
        { name: reg },
        { email: reg },
        { phone: reg },
        { subject: reg },
        { message: reg }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [queries, total] = await Promise.all([
      Query.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Query.countDocuments(filter)
    ]);

    res.json({
      queries,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum)
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch admin queries', error: err.message });
  }
});

// GET /api/queries/admin/stats - Overview counts for admin badge and dashboards
router.get('/admin/stats', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [total, open, inProgress, resolved, unread] = await Promise.all([
      Query.countDocuments(),
      Query.countDocuments({ status: 'open' }),
      Query.countDocuments({ status: 'in_progress' }),
      Query.countDocuments({ status: 'resolved' }),
      Query.countDocuments({ adminViewed: false })
    ]);

    res.json({
      total,
      open,
      inProgress,
      resolved,
      unread
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats', error: err.message });
  }
});

// POST /api/queries/admin/mark-viewed - Mark all admin unread queries as viewed
router.post('/admin/mark-viewed', authenticate, authorize('admin'), async (req, res) => {
  try {
    await Query.updateMany({ adminViewed: false }, { adminViewed: true });
    res.json({ message: 'Admin queries marked as viewed' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark as viewed' });
  }
});

// GET /api/queries/admin/:id - Get query details for admin & mark viewed
router.get('/admin/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const query = await Query.findById(req.params.id);
    if (!query) {
      return res.status(404).json({ message: 'Query not found' });
    }

    if (!query.adminViewed) {
      query.adminViewed = true;
      await query.save();
    }

    res.json(query);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch query', error: err.message });
  }
});

// POST /api/queries/admin/:id/reply - Admin responds to a query
router.post('/admin/:id/reply', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { message, status, resolutionNotes } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Response message cannot be empty' });
    }

    const query = await Query.findById(req.params.id);
    if (!query) {
      return res.status(404).json({ message: 'Query not found' });
    }

    // Append response to conversation thread
    query.conversation.push({
      sender: 'admin',
      senderName: req.user.name || 'Admin Support',
      senderRole: 'admin',
      message: message.trim(),
      timestamp: new Date()
    });

    query.adminResponse = message.trim();
    query.respondedAt = new Date();
    query.respondedBy = req.user._id;

    if (status) {
      query.status = status;
    } else if (query.status === 'open') {
      query.status = 'in_progress';
    }

    if (resolutionNotes) {
      query.resolutionNotes = resolutionNotes.trim();
    }

    query.adminViewed = true;
    query.userViewed = false; // Triggers instant notification count on user side!

    await query.save();

    res.json({
      message: 'Response sent to user successfully',
      query
    });
  } catch (err) {
    console.error('Error responding to query:', err);
    res.status(500).json({ message: 'Failed to send response', error: err.message });
  }
});

// PATCH /api/queries/admin/:id/status - Update query status or priority
router.patch('/admin/:id/status', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { status, priority, resolutionNotes } = req.body;
    const query = await Query.findById(req.params.id);
    if (!query) {
      return res.status(404).json({ message: 'Query not found' });
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (resolutionNotes !== undefined) query.resolutionNotes = resolutionNotes;

    await query.save();
    res.json({ message: 'Query status updated', query });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update status', error: err.message });
  }
});

// DELETE /api/queries/admin/:id - Admin deletes query
router.delete('/admin/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const query = await Query.findByIdAndDelete(req.params.id);
    if (!query) {
      return res.status(404).json({ message: 'Query not found' });
    }
    res.json({ message: 'Query deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete query', error: err.message });
  }
});

export default router;
