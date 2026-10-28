import mongoose from 'mongoose';

const adminNotificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['phone_change', 'profile_update', 'general'],
    default: 'phone_change',
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  userName: { type: String, default: '' },
  userEmail: { type: String, default: '' },
  role: { type: String, enum: ['teacher', 'student'], required: true },
  jobId: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  oldPhone: { type: String, default: '' },
  newPhone: { type: String, default: '' },
  notes: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved'],
    default: 'pending',
    index: true
  },
  viewedByAdmin: { type: Boolean, default: false, index: true }
}, {
  timestamps: true
});

adminNotificationSchema.index({ status: 1, createdAt: -1 });

const AdminNotification = mongoose.model('AdminNotification', adminNotificationSchema);
export default AdminNotification;
