import mongoose from 'mongoose';

const vaccinationSchema = new mongoose.Schema({
  farmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true, index: true },
  buffaloId: { type: mongoose.Schema.Types.ObjectId, ref: 'Buffalo', required: true, index: true },
  vaccineName: { type: String, required: true, trim: true, maxlength: 120 },
  vaccinationDate: { type: Date, required: true },
  nextDueDate: { type: Date, default: null },
  batchNumber: { type: String, trim: true, maxlength: 100, default: '' },
  veterinarian: { type: String, trim: true, maxlength: 120, default: '' },
  notes: { type: String, trim: true, maxlength: 2000, default: '' }
}, { timestamps: true });

vaccinationSchema.index({ farmId: 1, nextDueDate: 1 });
export default mongoose.model('Vaccination', vaccinationSchema);
