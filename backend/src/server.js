import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import extractRoutes from './routes/extract.js';
import uploadRoutes from './routes/upload.js';
import refineRoutes from './routes/refine.js';
import authRoutes from './routes/auth.js';
import historyRoutes from './routes/history.js';
import githubRoutes from './routes/github.js';
import dashboardRoutes from './routes/dashboard.js';
import settingsRoutes from './routes/settings.js';
import profileRoutes from './routes/profile.js';
import graphsRoutes from './routes/graphs.js';

dotenv.config();

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Auth & User Management
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Core Features
app.use('/api/history', historyRoutes);
app.use('/api/graphs', graphsRoutes);
app.use('/api/extract', extractRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/refine', refineRoutes);
app.use('/api/github', githubRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`\n🚀 MindMap AI Server running on port ${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
  console.log('');
});
