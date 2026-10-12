import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

import connectDB from './config/db.js';

// Route imports
import authRoutes from './routes/auth.js';
import teacherRoutes from './routes/teachers.js';
import studentRoutes from './routes/students.js';
import connectionRoutes from './routes/connections.js';
import reportRoutes from './routes/reports.js';
import blockRoutes from './routes/blocks.js';
import savedRoutes from './routes/saved.js';
import adminRoutes from './routes/admin.js';
import widgetRoutes from './routes/widgets.js';
import faqRoutes from './routes/faqs.js';
import queryRoutes from './routes/queries.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(express.json());
// Handle JSON syntax errors gracefully (400 instead of 500)
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: 'Malformed JSON payload provided' });
  }
  next(err);
});
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root / Health check endpoints
app.get(['/', '/api'], (req, res) => {
  res.json({
    status: 'healthy',
    message: 'ToppScorers API is running',
    version: '2.0.0',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    endpoints: {
      auth: '/api/auth',
      teachers: '/api/teachers',
      students: '/api/students',
      connections: '/api/connections',
      reports: '/api/reports',
      blocks: '/api/blocks',
      saved: '/api/saved',
      admin: '/api/admin',
      widgets: '/api/widgets',
      faqs: '/api/faqs',
      queries: '/api/queries'
    }
  });
});

// Database connection readiness check for API calls
app.use('/api', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Database not connected. Please add your MongoDB Atlas URI to server/.env.'
    });
  }
  next();
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/blocks', blockRoutes);
app.use('/api/saved', savedRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/widgets', widgetRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/queries', queryRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
