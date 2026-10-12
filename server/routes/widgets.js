import express from 'express';
import WidgetConfig from '../models/WidgetConfig.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// GET /api/widgets - Public
router.get('/', async (req, res) => {
  try {
    const widgets = await WidgetConfig.find().sort('order');
    res.json(widgets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/widgets - Protected (admin)
// Accepts array: [{ sectionKey, order, isVisible }]
router.put('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const updates = req.body;
    if (!Array.isArray(updates)) return res.status(400).json({ message: 'Expected an array' });

    const validUpdates = updates.filter(u => u && u.sectionKey);
    const promises = validUpdates.map(update => 
      WidgetConfig.findOneAndUpdate(
        { sectionKey: update.sectionKey },
        { $set: { order: update.order, isVisible: update.isVisible } },
        { new: true, upsert: true }
      )
    );
    
    const results = await Promise.all(promises);
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
