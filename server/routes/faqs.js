import express from 'express';
import FAQ from '../models/FAQ.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// GET /api/faqs - Public
router.get('/', async (req, res) => {
  try {
    const faqs = await FAQ.find({ isVisible: true }).sort('order');
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/faqs/all - Admin
router.get('/all', authenticate, authorize('admin'), async (req, res) => {
  try {
    const faqs = await FAQ.find().sort('order');
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/faqs - Admin
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const faq = await FAQ.create(req.body);
    res.status(201).json(faq);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/faqs/:id - Admin
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!faq) return res.status(404).json({ message: 'FAQ not found' });
    res.json(faq);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/faqs/:id - Admin
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);
    if (!faq) return res.status(404).json({ message: 'FAQ not found' });
    res.json({ message: 'FAQ deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
