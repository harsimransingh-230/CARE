import { Router } from 'express';
import mongoose from 'mongoose';
import MedicalRecord from '../models/MedicalRecord.js';
import Buffalo from '../models/Buffalo.js';
import { protect } from '../middleware/auth.js';
import { assertFarmRole } from '../middleware/farmAccess.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { httpError } from '../utils/httpError.js';

const router = Router();
router.use(protect);

router.get('/', asyncHandler(async (req, res) => {
  const { farmId } = req.query;
  if (!farmId) throw httpError(400, 'farmId is required.');
  await assertFarmRole(req.user, farmId);
  const records = await MedicalRecord.find({ farmId }).populate('buffaloId', 'name tagNumber').sort({ visitDate: -1 });
  res.json({ records });
}));

router.post('/', asyncHandler(async (req, res) => {
  const { farmId, buffaloId, visitDate, diagnosis, treatment, veterinarian, followUpDate, notes } = req.body;
  if (!farmId || !buffaloId || !visitDate || !diagnosis?.trim()) throw httpError(400, 'Farm, buffalo, visit date and diagnosis are required.');
  await assertFarmRole(req.user, farmId, ['owner', 'manager', 'vet']);
  if (!await Buffalo.exists({ _id: buffaloId, farmId })) throw httpError(404, 'Buffalo not found in this farm.');
  const record = await MedicalRecord.create({ farmId, buffaloId, visitDate, diagnosis, treatment, veterinarian, followUpDate: followUpDate || null, notes });
  res.status(201).json({ record: await record.populate('buffaloId', 'name tagNumber') });
}));

router.patch('/:id', asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw httpError(400, 'Invalid medical record ID.');
  const record = await MedicalRecord.findById(req.params.id);
  if (!record) throw httpError(404, 'Medical record not found.');
  await assertFarmRole(req.user, record.farmId, ['owner', 'manager', 'vet']);
  ['visitDate', 'diagnosis', 'treatment', 'veterinarian', 'followUpDate', 'notes'].forEach((field) => {
    if (req.body[field] !== undefined) record[field] = req.body[field] || null;
  });
  await record.save();
  res.json({ record: await record.populate('buffaloId', 'name tagNumber') });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw httpError(400, 'Invalid medical record ID.');
  const record = await MedicalRecord.findById(req.params.id);
  if (!record) throw httpError(404, 'Medical record not found.');
  await assertFarmRole(req.user, record.farmId, ['owner', 'manager']);
  await record.deleteOne();
  res.json({ message: 'Medical record deleted.' });
}));

export default router;
