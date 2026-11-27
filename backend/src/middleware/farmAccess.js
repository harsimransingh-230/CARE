import mongoose from 'mongoose';
import Farm from '../models/Farm.js';
import { httpError } from '../utils/httpError.js';

export async function getFarmRole(user, farmId) {
  if (!mongoose.isValidObjectId(farmId)) throw httpError(400, 'A valid farmId is required.');
  if (user.platformRole === 'superadmin') return 'superadmin';
  const farm = await Farm.findOne({ _id: farmId, 'members.userId': user._id });
  if (!farm) throw httpError(403, 'You do not have access to this farm.');
  return farm.members.find((member) => member.userId.toString() === user._id.toString())?.role;
}

export async function assertFarmRole(user, farmId, allowedRoles = ['owner', 'manager', 'vet']) {
  const role = await getFarmRole(user, farmId);
  if (role === 'superadmin' || allowedRoles.includes(role)) return role;
  throw httpError(403, 'You do not have permission to perform this action.');
}

export function requireFarmId(req) {
  const farmId = req.params.farmId || req.body.farmId || req.query.farmId;
  if (!farmId) throw httpError(400, 'farmId is required.');
  return farmId;
}
