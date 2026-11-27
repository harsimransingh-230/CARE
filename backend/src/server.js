import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = Number(process.env.PORT) || 5000;

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET must be set in backend/.env and contain at least 32 characters.');
  process.exit(1);
}

try {
  await connectDB();
  app.listen(PORT, () => console.log(`BuffaloCare API running at http://localhost:${PORT}`));
} catch (error) {
  console.error('Server startup failed:', error.message);
  process.exit(1);
}
