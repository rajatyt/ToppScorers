import mongoose from 'mongoose';

const connectionRequestSchema = new mongoose.Schema({
  fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, default: 'Hi, I would like to connect with you regarding tuition/teaching on ToppScorers.' },
  status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
  // Admin Lead & Commission Management
  adminLeadStatus: {
    type: String,
    enum: ['new', 'contacted_sender', 'contacted_target', 'both_contacted', 'deal_finalized', 'commission_received', 'closed_declined'],
    default: 'new'
  },
  tuitionFee: { type: Number, default: 0 },
  commissionExpected: { type: Number, default: 0 },
  commissionReceived: { type: Number, default: 0 },
  commissionStatus: {
    type: String,
    enum: ['pending', 'partially_paid', 'paid_in_full', 'waived', 'lost'],
    default: 'pending'
  },
  adminNotes: { type: String, default: '' },
  lastContactedAt: { type: Date, default: null },
  dealFinalizedAt: { type: Date, default: null },
  // Notification viewed tracking
  viewedByToUser: { type: Boolean, default: false },
  viewedByFromUser: { type: Boolean, default: true },
  viewedByAdmin: { type: Boolean, default: false }
}, { timestamps: true });

connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });
connectionRequestSchema.index({ toUserId: 1, status: 1 });
connectionRequestSchema.index({ toUserId: 1, viewedByToUser: 1 });
connectionRequestSchema.index({ fromUserId: 1, viewedByFromUser: 1 });
connectionRequestSchema.index({ viewedByAdmin: 1 });
connectionRequestSchema.index({ adminLeadStatus: 1, createdAt: -1 });

const ConnectionRequest = mongoose.model('ConnectionRequest', connectionRequestSchema);
export default ConnectionRequest;
