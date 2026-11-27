import { Router } from 'express';
import mongoose from 'mongoose';
import Pregnancy from '../models/Pregnancy.js';
import Buffalo from '../models/Buffalo.js';
import { protect } from '../middleware/auth.js';
import { assertFarmRole } from '../middleware/farmAccess.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { httpError } from '../utils/httpError.js';

const router = Router();
router.use(protect);

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + Number(days));
  return result;
}

router.get('/', asyncHandler(async (req, res) => {
  const { farmId, status } = req.query;
  if (!farmId) throw httpError(400, 'farmId is required.');
  await assertFarmRole(req.user, farmId);
  const filter = { farmId };
  if (status && status !== 'all') filter.status = status;
  const pregnancies = await Pregnancy.find(filter).populate('buffaloId', 'name tagNumber breed').sort({ expectedDeliveryDate: 1 });
  res.json({ pregnancies });
}));

router.post('/', asyncHandler(async (req, res) => {
  const { farmId, buffaloId, inseminationDate, confirmationDate, actualDeliveryDate, gestationDays = 310, status = 'pending_confirmation', notes } = req.body;
  if (!farmId || !buffaloId || !inseminationDate) throw httpError(400, 'Farm, buffalo and insemination date are required.');
  await assertFarmRole(req.user, farmId, ['owner', 'manager', 'vet']);
  const buffalo = await Buffalo.findOne({ _id: buffaloId, farmId, isActive: true });
  if (!buffalo) throw httpError(404, 'Active buffalo not found in this farm.');
  if (buffalo.sex !== 'female') throw httpError(400, 'Pregnancy records can only be created for female buffaloes.');
  const days = Number(gestationDays);
  if (!Number.isInteger(days) || days < 250 || days > 380) throw httpError(400, 'Gestation days must be between 250 and 380.');
  const aiDate = new Date(inseminationDate);
  if (Number.isNaN(aiDate.getTime())) throw httpError(400, 'Invalid insemination date.');
  const pregnancy = await Pregnancy.create({
    farmId, buffaloId, inseminationDate: aiDate, confirmationDate: confirmationDate || null, actualDeliveryDate: actualDeliveryDate || null,
    gestationDays: days, expectedDeliveryDate: addDays(aiDate, days), status, notes
  });
  res.status(201).json({ pregnancy: await pregnancy.populate('buffaloId', 'name tagNumber breed') });
}));

router.patch('/:id', asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw httpError(400, 'Invalid pregnancy ID.');
  const pregnancy = await Pregnancy.findById(req.params.id);
  if (!pregnancy) throw httpError(404, 'Pregnancy record not found.');
  await assertFarmRole(req.user, pregnancy.farmId, ['owner', 'manager', 'vet']);
  const editable = ['confirmationDate', 'status', 'actualDeliveryDate', 'notes', 'gestationDays', 'inseminationDate'];
  editable.forEach((field) => { if (req.body[field] !== undefined) pregnancy[field] = req.body[field] || null; });
  if (req.body.gestationDays !== undefined || req.body.inseminationDate !== undefined) {
    const days = Number(pregnancy.gestationDays);
    if (!Number.isInteger(days) || days < 250 || days > 380) throw httpError(400, 'Gestation days must be between 250 and 380.');
    pregnancy.expectedDeliveryDate = addDays(pregnancy.inseminationDate, days);
  }
  await pregnancy.save();
  res.json({ pregnancy: await pregnancy.populate('buffaloId', 'name tagNumber breed') });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw httpError(400, 'Invalid pregnancy ID.');
  const pregnancy = await Pregnancy.findById(req.params.id);
  if (!pregnancy) throw httpError(404, 'Pregnancy record not found.');
  await assertFarmRole(req.user, pregnancy.farmId, ['owner', 'manager']);
  await pregnancy.deleteOne();
  res.json({ message: 'Pregnancy record deleted.' });
}));

export default router;
