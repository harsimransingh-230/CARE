import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema({
  farmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true, index: true },
  buffaloId: { type: mongoose.Schema.Types.ObjectId, ref: 'Buffalo', required: true, index: true },
  visitDate: { type: Date, required: true },
  diagnosis: { type: String, required: true, trim: true, maxlength: 500 },
  treatment: { type: String, trim: true, maxlength: 2000, default: '' },
  veterinarian: { type: String, trim: true, maxlength: 120, default: '' },
  followUpDate: { type: Date, default: null },
  notes: { type: String, trim: true, maxlength: 2000, default: '' }
}, { timestamps: true });

export default mongoose.model('MedicalRecord', medicalRecordSchema);
