import mongoose from 'mongoose';

const profileViewLogSchema = new mongoose.Schema({
  viewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  viewedFields: [{ type: String }], // 'phone', 'fullAddress', 'profile'
  ipAddress: { type: String, default: '' },
  userAgent: { type: String, default: '' }
}, { timestamps: true });

profileViewLogSchema.index({ targetId: 1, createdAt: -1 });
profileViewLogSchema.index({ viewerId: 1, targetId: 1 });

const ProfileViewLog = mongoose.model('ProfileViewLog', profileViewLogSchema);
export default ProfileViewLog;
