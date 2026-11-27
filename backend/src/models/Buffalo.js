import mongoose from 'mongoose';

const buffaloSchema = new mongoose.Schema({
  farmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true, index: true },
  tagNumber: { type: String, required: true, trim: true, uppercase: true },
  name: { type: String, required: true, trim: true, maxlength: 80 },
  breed: { type: String, trim: true, default: '' },
  sex: { type: String, enum: ['female', 'male'], default: 'female' },
  dateOfBirth: { type: Date, default: null },
  notes: { type: String, trim: true, maxlength: 2000, default: '' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

buffaloSchema.index({ farmId: 1, tagNumber: 1 }, { unique: true });
export default mongoose.model('Buffalo', buffaloSchema);
