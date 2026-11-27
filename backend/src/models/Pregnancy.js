import mongoose from 'mongoose';

const pregnancySchema = new mongoose.Schema({
  farmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true, index: true },
  buffaloId: { type: mongoose.Schema.Types.ObjectId, ref: 'Buffalo', required: true, index: true },
  inseminationDate: { type: Date, required: true },
  confirmationDate: { type: Date, default: null },
  gestationDays: { type: Number, min: 250, max: 380, default: 310 },
  expectedDeliveryDate: { type: Date, required: true },
  actualDeliveryDate: { type: Date, default: null },
  status: { type: String, enum: ['pending_confirmation', 'confirmed', 'delivered', 'not_pregnant'], default: 'pending_confirmation' },
  notes: { type: String, trim: true, maxlength: 2000, default: '' }
}, { timestamps: true });

export default mongoose.model('Pregnancy', pregnancySchema);
