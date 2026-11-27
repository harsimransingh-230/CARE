import { Router } from 'express';
import mongoose from 'mongoose';
import Farm from '../models/Farm.js';
import User from '../models/User.js';
import Buffalo from '../models/Buffalo.js';
import Pregnancy from '../models/Pregnancy.js';
import Vaccination from '../models/Vaccination.js';
import MedicalRecord from '../models/MedicalRecord.js';
import { protect } from '../middleware/auth.js';
import { assertFarmRole } from '../middleware/farmAccess.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { httpError } from '../utils/httpError.js';

const router = Router();
router.use(protect);

router.get('/', asyncHandler(async (req, res) => {
  const filter = req.user.platformRole === 'superadmin' ? {} : { 'members.userId': req.user._id };
  const farms = await Farm.find(filter).sort({ createdAt: -1 }).populate('ownerId', 'name email');
  res.json({ farms });
}));

router.post('/', asyncHandler(async (req, res) => {
  const { farmName, address, phone } = req.body;
  if (!farmName?.trim()) throw httpError(400, 'Farm name is required.');
  const farm = await Farm.create({
    farmName: farmName.trim(), address: address || '', phone: phone || '', ownerId: req.user._id,
    members: [{ userId: req.user._id, role: 'owner' }]
  });
  res.status(201).json({ farm });
}));

router.get('/:farmId', asyncHandler(async (req, res) => {
  await assertFarmRole(req.user, req.params.farmId);
  const farm = await Farm.findById(req.params.farmId).populate('ownerId', 'name email').populate('members.userId', 'name email');
  if (!farm) throw httpError(404, 'Farm not found.');
  res.json({ farm });
}));

router.patch('/:farmId', asyncHandler(async (req, res) => {
  await assertFarmRole(req.user, req.params.farmId, ['owner']);
  const allowed = ['farmName', 'address', 'phone'];
  const updates = {};
  for (const key of allowed) if (req.body[key] !== undefined) updates[key] = req.body[key];
  if (updates.farmName !== undefined && !updates.farmName.trim()) throw httpError(400, 'Farm name cannot be empty.');
  const farm = await Farm.findByIdAndUpdate(req.params.farmId, updates, { new: true, runValidators: true });
  if (!farm) throw httpError(404, 'Farm not found.');
  res.json({ farm });
}));

router.delete('/:farmId', asyncHandler(async (req, res) => {
  await assertFarmRole(req.user, req.params.farmId, ['owner']);
  await Promise.all([
    Buffalo.deleteMany({ farmId: req.params.farmId }),
    Pregnancy.deleteMany({ farmId: req.params.farmId }),
    Vaccination.deleteMany({ farmId: req.params.farmId }),
    MedicalRecord.deleteMany({ farmId: req.params.farmId })
  ]);
  await Farm.findByIdAndDelete(req.params.farmId);
  res.json({ message: 'Farm and its associated records were permanently deleted.' });
}));

router.post('/:farmId/members', asyncHandler(async (req, res) => {
  await assertFarmRole(req.user, req.params.farmId, ['owner']);
  const { email, role } = req.body;
  if (!email || !['manager', 'vet'].includes(role)) throw httpError(400, 'A registered email and manager/vet role are required.');
  const memberUser = await User.findOne({ email: email.trim().toLowerCase(), isActive: true });
  if (!memberUser) throw httpError(404, 'No active BuffaloCare account was found for that email. Ask them to register first.');
  const farm = await Farm.findById(req.params.farmId);
  const exists = farm.members.some((member) => member.userId.toString() === memberUser._id.toString());
  if (exists) throw httpError(409, 'This user is already a member of the farm.');
  farm.members.push({ userId: memberUser._id, role });
  await farm.save();
  res.status(201).json({ message: 'Farm member added.', farm: await Farm.findById(farm._id).populate('members.userId', 'name email') });
}));

router.delete('/:farmId/members/:userId', asyncHandler(async (req, res) => {
  await assertFarmRole(req.user, req.params.farmId, ['owner']);
  if (!mongoose.isValidObjectId(req.params.userId)) throw httpError(400, 'Invalid user ID.');
  const farm = await Farm.findById(req.params.farmId);
  if (!farm) throw httpError(404, 'Farm not found.');
  if (farm.ownerId.toString() === req.params.userId) throw httpError(400, 'The farm owner cannot be removed.');
  farm.members = farm.members.filter((member) => member.userId.toString() !== req.params.userId);
  await farm.save();
  res.json({ message: 'Farm member removed.' });
}));

export default router;
