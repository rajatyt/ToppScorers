import mongoose from 'mongoose';
import './User.js';

const teacherProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  jobId: { type: String, unique: true, sparse: true, index: true },
  subjects: [{ type: String }],
  exams: [{ type: String }],
  qualifications: [{ type: String }],
  certifications: [{ type: String }],
  experience: { type: Number, default: 0 },
  demoVideoUrl: { type: String, default: '' },
  profilePhotoUrl: { type: String, default: '' },
  verifiedResults: [{
    studentName: String,
    exam: String,
    rank: String,
    year: Number
  }],
  ranks: [{
    exam: String,
    rank: String,
    year: Number
  }],
  bio: { type: String, default: '' },
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
  fee: {
    amount: { type: Number, default: 3000 },
    period: { type: String, enum: ['hourly', 'monthly', 'per_session'], default: 'monthly' }
  },
  teachingMode: { type: String, default: 'home' },
  availability: { type: String, default: 'Flexible (Morning / Evening)' },

  // Requirement Details
  board: { type: String, default: 'ICSE' },
  preferredTime: { type: String, default: 'After 4' },
  daysPerWeek: { type: String, default: '6 days a week' },
  tutorGender: { type: String, default: 'Any' },
  studentGender: { type: String, default: 'Female' },
  rating: { type: Number, default: 4.8 },
  approvalStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'suspended'], 
    default: 'pending' 
  },
  isVerified: { type: Boolean, default: false },
  verificationStatus: {
    type: String,
    enum: ['unverified', 'pending', 'verified', 'rejected'],
    default: 'unverified'
  },
  rejectionReason: { type: String, default: '' },
  adminVerificationNotes: { type: String, default: '' },
  verificationSubmittedAt: { type: Date, default: null },
  verifiedAt: { type: Date, default: null },
  viewedByAdmin: { type: Boolean, default: true },

  // Verification & Physical Tuition Coordination Contact
  verificationPhone: { type: String, default: '' },
  preferredCallingTime: { type: String, default: 'Anytime' },

  // Verification Documents & Details
  govtId: {
    idType: { type: String, default: '' }, // 'aadhaar' | 'pan' | 'voter_id' | 'driving_license' | 'na'
    idNumber: { type: String, default: '' },
    documentUrl: { type: String, default: '' }
  },
  degreeDetails: {
    highestDegree: { type: String, default: '' },
    university: { type: String, default: '' },
    yearOfPassing: { type: String, default: '' },
    degreeDocumentUrl: { type: String, default: '' }
  },
  certificationDetails: {
    certificationName: { type: String, default: '' }, // 'B.Ed' | 'CTET' | 'TET' | 'NET' | 'SET' | 'NA'
    rollOrCertNumber: { type: String, default: '' },
    certificateDocumentUrl: { type: String, default: '' }
  },
  instituteDetails: {
    currentOrPastInstitute: { type: String, default: '' },
    designation: { type: String, default: '' },
    instituteDocumentUrl: { type: String, default: '' }
  },
  referenceContact: {
    name: { type: String, default: '' },
    relation: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' }
  },
  teachingPhilosophy: { type: String, default: '' },

  isAvailable: { type: Boolean, default: true },
  privacy: {
    showPhone: { type: Boolean, default: false },
    showFullAddress: { type: Boolean, default: false },
    pauseProfile: { type: Boolean, default: false }
  }
}, { timestamps: true });

teacherProfileSchema.pre('save', async function (next) {
  if (!this.jobId) {
    try {
      const count = await this.constructor.countDocuments({ jobId: { $exists: true, $ne: '' } });
      let nextNum = 1001 + count;
      let candidate = `JOB-T${nextNum}`;
      while (await this.constructor.findOne({ jobId: candidate })) {
        nextNum++;
        candidate = `JOB-T${nextNum}`;
      }
      this.jobId = candidate;
    } catch (err) {
      console.error('Error generating teacher jobId in pre-save:', err);
    }
  }
  next();
});

teacherProfileSchema.index({ 'location.city': 1, approvalStatus: 1 });
teacherProfileSchema.index({ subjects: 1 });
teacherProfileSchema.index({ exams: 1 });

const TeacherProfile = mongoose.model('TeacherProfile', teacherProfileSchema);
export default TeacherProfile;

