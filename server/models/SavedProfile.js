import mongoose from 'mongoose';

const savedProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  profileId: { type: mongoose.Schema.Types.ObjectId, required: true },
  profileType: { type: String, enum: ['teacher', 'student'], required: true }
}, { timestamps: true });

savedProfileSchema.index({ userId: 1, targetUserId: 1 }, { unique: true });

const SavedProfile = mongoose.model('SavedProfile', savedProfileSchema);
export default SavedProfile;
