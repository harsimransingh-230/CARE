import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['owner', 'manager', 'vet'], required: true },
  addedAt: { type: Date, default: Date.now }
}, { _id: false });

const farmSchema = new mongoose.Schema({
  farmName: { type: String, required: true, trim: true, maxlength: 120 },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  address: { type: String, trim: true, maxlength: 300, default: '' },
  phone: { type: String, trim: true, maxlength: 30, default: '' },
  members: { type: [memberSchema], default: [] }
}, { timestamps: true });

farmSchema.index({ 'members.userId': 1 });
export default mongoose.model('Farm', farmSchema);
