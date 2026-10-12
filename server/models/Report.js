import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { 
    type: String, 
    required: true,
    enum: ['inappropriate_content', 'spam_or_fraud', 'fake_profile', 'harassment', 'other'] 
  },
  description: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'reviewed', 'dismissed'], default: 'pending' }
}, { timestamps: true });

reportSchema.index({ targetId: 1, status: 1 });

const Report = mongoose.model('Report', reportSchema);
export default Report;
