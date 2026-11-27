import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Farm from '../models/Farm.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { httpError } from '../utils/httpError.js';

const router = Router();

function setAuthCookie(res, userId) {
  const token = jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
  res.cookie(process.env.COOKIE_NAME || 'buffalocare_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, platformRole: user.platformRole };
}

router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password, farmName, address, phone } = req.body;
  if (!name?.trim() || !email?.trim() || !password || !farmName?.trim()) {
    throw httpError(400, 'Name, email, password and first farm name are required.');
  }
  if (password.length < 8) throw httpError(400, 'Password must contain at least 8 characters.');
  const normalizedEmail = email.trim().toLowerCase();
  if (await User.exists({ email: normalizedEmail })) throw httpError(409, 'An account with this email already exists.');

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash });
  try {
    const farm = await Farm.create({
      farmName: farmName.trim(), ownerId: user._id, address: address || '', phone: phone || '',
      members: [{ userId: user._id, role: 'owner' }]
    });
    setAuthCookie(res, user._id);
    res.status(201).json({ user: publicUser(user), firstFarmId: farm._id });
  } catch (error) {
    await User.findByIdAndDelete(user._id);
    throw error;
  }
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw httpError(400, 'Email and password are required.');
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw httpError(401, 'Email or password is incorrect.');
  if (!user.isActive) throw httpError(403, 'This account has been disabled.');
  setAuthCookie(res, user._id);
  res.json({ user: publicUser(user) });
}));

router.post('/logout', (req, res) => {
  res.clearCookie(process.env.COOKIE_NAME || 'buffalocare_token', {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax'
  });
  res.json({ message: 'Logged out successfully.' });
});

router.get('/me', protect, asyncHandler(async (req, res) => {
  res.json({ user: publicUser(req.user) });
}));

// Optional one-time bootstrap endpoint. Configure ADMIN_SETUP_KEY in .env before using it.
router.post('/bootstrap-admin', asyncHandler(async (req, res) => {
  const setupKey = process.env.ADMIN_SETUP_KEY;
  if (!setupKey || req.headers['x-admin-setup-key'] !== setupKey) throw httpError(404, 'Not found.');
  if (await User.exists({ platformRole: 'superadmin' })) throw httpError(409, 'A platform administrator already exists.');
  const { name, email, password } = req.body;
  if (!name?.trim() || !email?.trim() || !password || password.length < 12) {
    throw httpError(400, 'Name, email and a password of at least 12 characters are required.');
  }
  if (await User.exists({ email: email.trim().toLowerCase() })) throw httpError(409, 'That email is already registered.');
  const user = await User.create({
    name: name.trim(), email: email.trim().toLowerCase(),
    passwordHash: await bcrypt.hash(password, 12), platformRole: 'superadmin'
  });
  res.status(201).json({ user: publicUser(user) });
}));

export default router;
