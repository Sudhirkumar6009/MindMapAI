import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import extractRoutes from './routes/extract.js';
import uploadRoutes from './routes/upload.js';
import refineRoutes from './routes/refine.js';
import authRoutes from './routes/auth.js';
import historyRoutes from './routes/history.js';

dotenv.config();

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/extract', extractRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/refine', refineRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
