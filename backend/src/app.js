import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import authRoutes from './routes/auth.routes.js';
import farmRoutes from './routes/farms.routes.js';
import buffaloRoutes from './routes/buffaloes.routes.js';
import pregnancyRoutes from './routes/pregnancies.routes.js';
import vaccinationRoutes from './routes/vaccinations.routes.js';
import medicalRoutes from './routes/medical.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import reminderRoutes from './routes/reminders.routes.js';

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: 'draft-7', legacyHeaders: false }));

app.get('/api/health', (_req, res) => res.json({ success: true, message: 'BuffaloCare API is running.' }));
app.use('/api/auth', authRoutes);
app.use('/api/farms', farmRoutes);
app.use('/api/buffaloes', buffaloRoutes);
app.use('/api/pregnancies', pregnancyRoutes);
app.use('/api/vaccinations', vaccinationRoutes);
app.use('/api/medical-records', medicalRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reminders', reminderRoutes);

app.use((_req, res) => res.status(404).json({ message: 'API route not found.' }));
app.use((error, _req, res, _next) => {
  if (error.code === 11000) return res.status(409).json({ message: 'A record with this unique value already exists.' });
  if (error.name === 'ValidationError') return res.status(400).json({ message: error.message });
  if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid record identifier or field value.' });
  const status = error.status || 500;
  if (status >= 500) console.error(error);
  res.status(status).json({ message: error.message || 'Something went wrong.' });
});

export default app;
