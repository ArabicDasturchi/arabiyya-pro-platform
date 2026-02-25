import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';

// Import models
import User from './models/User.js';
import Order from './models/Order.js';
import jwt from 'jsonwebtoken';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import levelRoutes from './routes/levels.js';
import lessonRoutes from './routes/lessons.js';
import testRoutes from './routes/tests.js';
import certificateRoutes from './routes/certificates.js';
import aiRoutes from './routes/ai.js';
import adminRoutes from './routes/admin.js';
import submissionRoutes from './routes/submissions.js';
import uploadRoutes from './routes/upload.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: false, // Cloudinary URLlarni yuklashga ruxsat
}));
app.use(compression());
app.use(morgan('dev'));
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/levels', levelRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/upload', uploadRoutes);

// Root & Health
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));
app.get('/', (req, res) => res.json({ message: 'Arabiyya Pro API is running' }));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: 'Serverda xatolik yuz berdi' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});