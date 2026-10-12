import mongoose from 'mongoose';
import './User.js';

const studentProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  jobId: { type: String, unique: true, sparse: true, index: true },
  classOrExam: { type: String, default: '' },
  classLevel: { type: String, default: '' },
  subjectsNeeded: [{ type: String }],
  goals: { type: String, default: '' },
  preferredTiming: { type: String, default: 'Evening' },
  fullAddress: { type: String, default: '' },
  area: { type: String, default: '' },
  location: {
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' }
  },
  coordinates: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null }
  },
  budget: {
    min: { type: Number, default: 1000 },
    max: { type: Number, default: 5000 },
    period: { type: String, enum: ['monthly', 'hourly', 'per_session'], default: 'monthly' }
  },
  preferences: {
    mode: { type: String, enum: ['online', 'offline', 'home', 'institute', 'both', 'all', ''], default: 'both' },
    gender: { type: String, default: '' },
    experienceMin: { type: Number, default: 0 }
  },
  profilePhotoUrl: { type: String, default: '' },
  approvalStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'suspended'], 
    default: 'approved' 
  },
  privacy: {
    showPhone: { type: Boolean, default: false },
    showFullAddress: { type: Boolean, default: false },
    pauseProfile: { type: Boolean, default: false }
  }
}, { timestamps: true });

studentProfileSchema.pre('save', async function (next) {
  if (!this.jobId) {
    try {
      const count = await this.constructor.countDocuments({ jobId: { $exists: true, $ne: '' } });
      let nextNum = 1001 + count;
      let candidate = `JOB-S${nextNum}`;
      while (await this.constructor.findOne({ jobId: candidate })) {
        nextNum++;
        candidate = `JOB-S${nextNum}`;
      }
      this.jobId = candidate;
    } catch (err) {
      console.error('Error generating student jobId in pre-save:', err);
    }
  }
  next();
});

studentProfileSchema.index({ 'location.city': 1, approvalStatus: 1 });
studentProfileSchema.index({ subjectsNeeded: 1 });
studentProfileSchema.index({ classOrExam: 1 });

const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);
export default StudentProfile;
