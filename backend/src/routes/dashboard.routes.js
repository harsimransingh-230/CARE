import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { assertFarmRole } from '../middleware/farmAccess.js';
import Buffalo from '../models/Buffalo.js';
import Pregnancy from '../models/Pregnancy.js';
import Vaccination from '../models/Vaccination.js';
import MedicalRecord from '../models/MedicalRecord.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { httpError } from '../utils/httpError.js';

const router = Router();
router.use(protect);

router.get('/', asyncHandler(async (req, res) => {
  const { farmId } = req.query;
  if (!farmId) throw httpError(400, 'farmId is required.');
  await assertFarmRole(req.user, farmId);
  const now = new Date();
  const in30Days = new Date(now);
  in30Days.setDate(now.getDate() + 30);
  const activePregnancyStatuses = ['pending_confirmation', 'confirmed'];

  const [totalBuffaloes, activeBuffaloes, pregnantBuffaloes, expectedDeliveries, dueSoon, overdue, scheduled, recentBuffaloes, recentVaccinations, recentMedical] = await Promise.all([
    Buffalo.countDocuments({ farmId }),
    Buffalo.countDocuments({ farmId, isActive: true }),
    Pregnancy.countDocuments({ farmId, status: 'confirmed' }),
    Pregnancy.countDocuments({ farmId, status: { $in: activePregnancyStatuses }, expectedDeliveryDate: { $gte: now, $lte: in30Days } }),
    Vaccination.countDocuments({ farmId, nextDueDate: { $gte: now, $lte: in30Days } }),
    Vaccination.countDocuments({ farmId, nextDueDate: { $lt: now } }),
    Vaccination.countDocuments({ farmId, nextDueDate: { $ne: null } }),
    Buffalo.find({ farmId }).sort({ createdAt: -1 }).limit(5).select('tagNumber name breed isActive createdAt'),
    Vaccination.find({ farmId }).populate('buffaloId', 'name tagNumber').sort({ createdAt: -1 }).limit(4),
    MedicalRecord.find({ farmId }).populate('buffaloId', 'name tagNumber').sort({ createdAt: -1 }).limit(4)
  ]);

  const activities = [
    ...recentVaccinations.map((item) => ({ id: `v-${item._id}`, type: 'vaccination', title: `${item.vaccineName} recorded`, subject: item.buffaloId ? `${item.buffaloId.name} · ${item.buffaloId.tagNumber}` : 'Buffalo', date: item.createdAt })),
    ...recentMedical.map((item) => ({ id: `m-${item._id}`, type: 'medical', title: `Medical record: ${item.diagnosis}`, subject: item.buffaloId ? `${item.buffaloId.name} · ${item.buffaloId.tagNumber}` : 'Buffalo', date: item.createdAt }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);

  res.json({
    summary: { totalBuffaloes, activeBuffaloes, pregnantBuffaloes, expectedDeliveries, vaccinationsDueSoon: dueSoon, vaccinationsOverdue: overdue, scheduledVaccinations: scheduled },
    vaccinationBreakdown: { upToDate: Math.max(0, scheduled - dueSoon - overdue), dueSoon, overdue },
    recentBuffaloes,
    activities
  });
}));

export default router;
