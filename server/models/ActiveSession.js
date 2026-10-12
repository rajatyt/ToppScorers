import mongoose from 'mongoose';

const activeSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String }, // Access token or legacy token
  refreshToken: { type: String },
  device: { type: String },
  userAgent: { type: String },
  ip: { type: String },
  isValid: { type: Boolean, default: true },
  lastActive: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Auto-expire sessions after 30 days of inactivity
activeSessionSchema.index({ lastActive: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });
activeSessionSchema.index({ userId: 1 });
activeSessionSchema.index({ refreshToken: 1 });

const ActiveSession = mongoose.model('ActiveSession', activeSessionSchema);
export default ActiveSession;
