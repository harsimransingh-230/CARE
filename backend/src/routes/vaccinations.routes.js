import { Router } from 'express';
import mongoose from 'mongoose';
import Vaccination from '../models/Vaccination.js';
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
  const vaccinations = await Vaccination.find({ farmId }).populate('buffaloId', 'name tagNumber').sort({ vaccinationDate: -1 });
  res.json({ vaccinations });
}));

router.post('/', asyncHandler(async (req, res) => {
  const { farmId, buffaloId, vaccineName, vaccinationDate, nextDueDate, batchNumber, veterinarian, notes } = req.body;
  if (!farmId || !buffaloId || !vaccineName?.trim() || !vaccinationDate) throw httpError(400, 'Farm, buffalo, vaccine name and vaccination date are required.');
  await assertFarmRole(req.user, farmId, ['owner', 'manager', 'vet']);
  const buffalo = await Buffalo.findOne({ _id: buffaloId, farmId });
  if (!buffalo) throw httpError(404, 'Buffalo not found in this farm.');
  const vaccination = await Vaccination.create({ farmId, buffaloId, vaccineName, vaccinationDate, nextDueDate: nextDueDate || null, batchNumber, veterinarian, notes });
  res.status(201).json({ vaccination: await vaccination.populate('buffaloId', 'name tagNumber') });
}));

router.patch('/:id', asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw httpError(400, 'Invalid vaccination ID.');
  const vaccination = await Vaccination.findById(req.params.id);
  if (!vaccination) throw httpError(404, 'Vaccination record not found.');
  await assertFarmRole(req.user, vaccination.farmId, ['owner', 'manager', 'vet']);
  ['vaccineName', 'vaccinationDate', 'nextDueDate', 'batchNumber', 'veterinarian', 'notes'].forEach((field) => {
    if (req.body[field] !== undefined) vaccination[field] = req.body[field] || null;
  });
  await vaccination.save();
  res.json({ vaccination: await vaccination.populate('buffaloId', 'name tagNumber') });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw httpError(400, 'Invalid vaccination ID.');
  const vaccination = await Vaccination.findById(req.params.id);
  if (!vaccination) throw httpError(404, 'Vaccination record not found.');
  await assertFarmRole(req.user, vaccination.farmId, ['owner', 'manager']);
  await vaccination.deleteOne();
  res.json({ message: 'Vaccination record deleted.' });
}));

export default router;
