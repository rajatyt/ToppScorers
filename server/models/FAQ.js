import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema({
  question: {
    en: { type: String, required: true },
    hi: { type: String, required: true }
  },
  answer: {
    en: { type: String, required: true },
    hi: { type: String, required: true }
  },
  order: { type: Number, default: 0 },
  isVisible: { type: Boolean, default: true }
}, { timestamps: true });

const FAQ = mongoose.model('FAQ', faqSchema);
export default FAQ;
