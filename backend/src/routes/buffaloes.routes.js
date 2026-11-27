import { Router } from 'express';
import mongoose from 'mongoose';
import Buffalo from '../models/Buffalo.js';
import { protect } from '../middleware/auth.js';
import { assertFarmRole } from '../middleware/farmAccess.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { httpError } from '../utils/httpError.js';

const router = Router();
router.use(protect);

router.get('/', asyncHandler(async (req, res) => {
  const { farmId, search = '', status = 'all' } = req.query;
  if (!farmId) throw httpError(400, 'farmId is required.');
  await assertFarmRole(req.user, farmId);
  const filter = { farmId };
  if (search.trim()) filter.$or = [
    { name: { $regex: search.trim(), $options: 'i' } },
    { tagNumber: { $regex: search.trim(), $options: 'i' } },
    { breed: { $regex: search.trim(), $options: 'i' } }
  ];
  if (status === 'active') filter.isActive = true;
  if (status === 'inactive') filter.isActive = false;
  const buffaloes = await Buffalo.find(filter).sort({ createdAt: -1 });
  res.json({ buffaloes });
}));

router.post('/', asyncHandler(async (req, res) => {
  const { farmId, tagNumber, name, breed, sex, dateOfBirth, notes } = req.body;
  if (!farmId || !tagNumber?.trim() || !name?.trim()) throw httpError(400, 'farmId, tag number and buffalo name are required.');
  await assertFarmRole(req.user, farmId, ['owner', 'manager']);
  const buffalo = await Buffalo.create({ farmId, tagNumber, name, breed, sex, dateOfBirth: dateOfBirth || null, notes });
  res.status(201).json({ buffalo });
}));

router.patch('/:id', asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw httpError(400, 'Invalid buffalo ID.');
  const buffalo = await Buffalo.findById(req.params.id);
  if (!buffalo) throw httpError(404, 'Buffalo not found.');
  await assertFarmRole(req.user, buffalo.farmId, ['owner', 'manager']);
  const fields = ['tagNumber', 'name', 'breed', 'sex', 'dateOfBirth', 'notes', 'isActive'];
  fields.forEach((field) => { if (req.body[field] !== undefined) buffalo[field] = req.body[field]; });
  await buffalo.save();
  res.json({ buffalo });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw httpError(400, 'Invalid buffalo ID.');
  const buffalo = await Buffalo.findById(req.params.id);
  if (!buffalo) throw httpError(404, 'Buffalo not found.');
  await assertFarmRole(req.user, buffalo.farmId, ['owner', 'manager']);
  buffalo.isActive = false;
  await buffalo.save();
  res.json({ message: 'Buffalo archived. Its medical history has been preserved.' });
}));

export default router;
