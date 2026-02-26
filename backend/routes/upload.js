import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Uploads papkasini yaratish
const uploadsPath = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
}

// Disk storage — oddiy va ishonchli
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsPath),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        // levelId ni query'dan olamiz, masalan: /api/upload?levelId=A1
        const levelId = req.query.levelId || 'GENERAL';
        cb(null, `${levelId}-${Date.now()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 200 * 1024 * 1024 }, // 200MB
    fileFilter(req, file, cb) {
        if (file.originalname.toLowerCase().endsWith('.pdf')) {
            cb(null, true);
        } else {
            cb(new Error('Faqat PDF (.pdf) formatidagi fayllarni yuklash mumkin!'));
        }
    }
}).single('file');

// @route POST /api/upload
router.post('/', [authMiddleware, adminMiddleware], (req, res) => {
    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ success: false, message: `Fayl yuklashda xatolik: ${err.message}` });
        } else if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Fayl serverga kelmadi.' });
        }

        // To'liq absolyut URL — smartfon va noutbukda ham ishlaydi
        const BACKEND = process.env.BACKEND_URL || 'https://arabiyya-pro-backend.onrender.com';
        const fileUrl = `${BACKEND}/uploads/${req.file.filename}`;

        console.log('✅ Fayl yuklandi:', fileUrl);
        res.json({ success: true, fileUrl });
    });
});

export default router;
