import mongoose from 'mongoose';

const widgetConfigSchema = new mongoose.Schema({
  sectionKey: { 
    type: String, 
    required: true, 
    unique: true,
    enum: ['hero', 'coverage', 'whyTeacherHunt', 'calculator', 'whatsapp', 'faqs']
  },
  label: { type: String },
  order: { type: Number, required: true },
  isVisible: { type: Boolean, default: true }
}, { timestamps: true });

const WidgetConfig = mongoose.model('WidgetConfig', widgetConfigSchema);
export default WidgetConfig;
