import mongoose from 'mongoose';

const conversationMessageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['user', 'admin'], required: true },
  senderName: { type: String, default: '' },
  senderRole: { type: String, default: '' },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const querySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  jobId: { type: String, default: '', index: true },
  name: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  role: { type: String, enum: ['teacher', 'student'], required: true },
  
  subject: { type: String, required: true, trim: true },
  category: { 
    type: String, 
    enum: ['commission_payment', 'tuition_issue', 'profile_verification', 'account_login', 'technical', 'general'], 
    default: 'general' 
  },
  message: { type: String, required: true, trim: true },
  
  status: { 
    type: String, 
    enum: ['open', 'in_progress', 'resolved', 'closed'], 
    default: 'open',
    index: true 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'], 
    default: 'medium' 
  },

  // Conversation thread
  conversation: [conversationMessageSchema],

  // Summary / Latest Admin Response
  adminResponse: { type: String, default: '' },
  respondedAt: { type: Date, default: null },
  respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  resolutionNotes: { type: String, default: '' },

  // Notification tracking: userViewed is false when admin replies; adminViewed is false when user creates/replies
  userViewed: { type: Boolean, default: true },
  adminViewed: { type: Boolean, default: false }
}, { timestamps: true });

querySchema.index({ status: 1, createdAt: -1 });
querySchema.index({ userId: 1, createdAt: -1 });

const Query = mongoose.model('Query', querySchema);
export default Query;
