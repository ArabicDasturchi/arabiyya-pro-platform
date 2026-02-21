import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Ensure uploads directory exists with full path
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        // Safe filename with timestamp
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `kitob-${Date.now()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 200 * 1024 * 1024 }, // Limit increased to 200MB
    fileFilter(req, file, cb) {
        const filetypes = /pdf/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        // More flexible mimetype check
        const mimetype = filetypes.test(file.mimetype) || file.mimetype === 'application/octet-stream';

        if (extname) {
            return cb(null, true);
        } else {
            cb(new Error('Faqat PDF (.pdf) formatidagi fayllarni yuklash mumkin!'));
        }
    }
}).single('file');

// @route   POST /api/upload
router.post('/', [authMiddleware, adminMiddleware], (req, res) => {
    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            console.error('Multer Error:', err);
            return res.status(400).json({ success: false, message: `Fayl yuklashda xatolik (Multer): ${err.message}` });
        } else if (err) {
            console.error('Upload Error:', err);
            return res.status(400).json({ success: false, message: err.message });
        }

        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'Filingiz serverga yetib kelmadi. Iltimos, qayta urinib ko\'ring.' });
            }

            // Detect protocol (http or https)
            const protocol = req.headers['x-forwarded-proto'] || req.protocol;
            const fileUrl = `${protocol}://${req.get('host')}/uploads/${req.file.filename}`;

            console.log('File uploaded successfully:', fileUrl);
            res.json({
                success: true,
                fileUrl
            });
        } catch (error) {
            console.error('Server catch error:', error);
            res.status(500).json({ success: false, message: 'Serverda ichki xatolik yuz berdi.' });
        }
    });
});

export default router;
