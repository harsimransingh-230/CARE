import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { assertFarmRole } from '../middleware/farmAccess.js';
import Pregnancy from '../models/Pregnancy.js';
import Vaccination from '../models/Vaccination.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { httpError } from '../utils/httpError.js';

const router = Router();
router.use(protect);

router.get('/', asyncHandler(async (req, res) => {
  const { farmId } = req.query;
  if (!farmId) throw httpError(400, 'farmId is required.');
  await assertFarmRole(req.user, farmId);
  const now = new Date();
  const horizon = new Date(now);
  horizon.setDate(now.getDate() + 45);
  const [vaccinations, pregnancies] = await Promise.all([
    Vaccination.find({ farmId, nextDueDate: { $ne: null, $lte: horizon } }).populate('buffaloId', 'name tagNumber').sort({ nextDueDate: 1 }),
    Pregnancy.find({ farmId, status: { $in: ['pending_confirmation', 'confirmed'] }, expectedDeliveryDate: { $gte: now, $lte: horizon } }).populate('buffaloId', 'name tagNumber').sort({ expectedDeliveryDate: 1 })
  ]);

  const reminders = [
    ...vaccinations.map((item) => ({
      id: `vaccination-${item._id}`, type: 'vaccination', title: `${item.vaccineName} due`,
      buffalo: item.buffaloId ? `${item.buffaloId.name} · ${item.buffaloId.tagNumber}` : 'Buffalo',
      date: item.nextDueDate, status: item.nextDueDate < now ? 'overdue' : 'upcoming'
    })),
    ...pregnancies.map((item) => ({
      id: `delivery-${item._id}`, type: 'delivery', title: 'Expected delivery',
      buffalo: item.buffaloId ? `${item.buffaloId.name} · ${item.buffaloId.tagNumber}` : 'Buffalo',
      date: item.expectedDeliveryDate, status: 'upcoming'
    }))
  ].sort((a, b) => new Date(a.date) - new Date(b.date));
  res.json({ reminders });
}));

export default router;
