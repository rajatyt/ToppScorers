import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, default: '' },
  passwordHash: { type: String, required: false },
  role: { type: String, enum: ['student', 'teacher', 'admin'], required: true },
  googleId: { type: String },
  isGoogleAuth: { type: Boolean, default: false },
  avatar: { type: String },
  language: { type: String, default: 'en' },
  isActive: { type: Boolean, default: true },
  dateOfBirth: { type: Date },
  parentGuardianConsent: { type: Boolean, default: false },
  consentGiven: { type: Boolean, default: true },
  consentTimestamp: { type: Date, default: Date.now },
  accountDeletionRequested: { type: Date, default: null },
  resetPasswordToken: { type: String, default: null, index: true },
  resetPasswordExpires: { type: Date, default: null }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

userSchema.virtual('isMinor').get(function () {
  if (!this.dateOfBirth) return false;
  const ageDifMs = Date.now() - new Date(this.dateOfBirth).getTime();
  const ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970) < 18;
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash') || !this.passwordHash) return next();
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.passwordHash) return false;
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

const User = mongoose.model('User', userSchema);
export default User;
