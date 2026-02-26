import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';

// Load environment variables — birinchi bo'lishi kerak!
dotenv.config();

// Import models
import User from './models/User.js';
// Order routes ga ko'chirildi
import { authMiddleware } from './middleware/auth.js';
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
import downloadRoutes from './routes/download.js';
import purchaseRoutes from './routes/purchase.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Uploads papkasi
const uploadsPath = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

// CORS — barcha qurilmalar (smartfon, noutbuk, planshet)
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Disposition', 'Content-Length'],
};
app.use(cors(corsOptions));

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Static fayllar — PDF kitoblar (smartfon va noutbukda ishlaydi)
// MUHIM: Fayllarni himoya qilish uchun middleware qo'shamiz
app.use('/uploads', authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ success: false, message: 'Tizimga kiring' });

    // Admin barchasini ko'ra oladi
    if (user.role === 'admin') return next();

    // Fayl nomidan levelId ni aniqlashga harakat qilamiz (agar fayl nomi daraja bilan boshlansa)
    // Masalan: "A1_lesson1.pdf" yoki "ALPHABET_guide.pdf"
    const fileName = path.basename(req.path);
    const levels = ['ALPHABET', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const fileLevel = levels.find(l => fileName.startsWith(l));

    if (fileLevel) {
      if (fileLevel === 'ALPHABET' || (user.purchasedLevels && user.purchasedLevels.includes(fileLevel))) {
        return next();
      } else {
        return res.status(403).json({ success: false, message: 'Bu darajani sotib olmagansiz' });
      }
    }

    // Agar daraja aniqlanmasa, default ruxsat beramiz (masalan, user avatar yoki umumiy fayllar)
    next();
  } catch (error) {
    next();
  }
}, express.static(uploadsPath));

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
app.use('/api/download', downloadRoutes);
app.use('/api/purchase', purchaseRoutes);

// Root & Health
app.get('/api/health', (req, res) => res.json({ status: 'OK', time: new Date().toISOString() }));
app.get('/api/test', (req, res) => res.json({
  success: true,
  message: 'Backend muvaffaqiyatli yangilandi (v2)',
  timestamp: new Date().toISOString()
}));
app.get('/', (req, res) => res.json({ message: 'Arabiyya Pro API is running' }));

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// Global Error
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: 'Serverda xatolik yuz berdi' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});