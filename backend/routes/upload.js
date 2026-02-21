import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer storage
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `book-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
    fileFilter(req, file, cb) {
        const filetypes = /pdf/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Faqat PDF fayllar yuklash mumkin!'));
        }
    }
});

// @route   POST /api/upload
// @desc    Upload PDF file
router.post('/', [authMiddleware, adminMiddleware], (req, res) => {
    upload.single('file')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            return res.status(400).json({ success: false, message: `Yuklashda xatolik: ${err.message}` });
        } else if (err) {
            // An unknown error occurred when uploading.
            return res.status(400).json({ success: false, message: err.message });
        }

        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'Fayl tanlanmadi' });
            }

            // Return full URL
            // Handle proxy protocol (https on Render/Production)
            const protocol = req.headers['x-forwarded-proto'] || req.protocol;
            const fileUrl = `${protocol}://${req.get('host')}/uploads/${req.file.filename}`;

            res.json({
                success: true,
                fileUrl
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Server xatosi' });
        }
    });
});

export default router;
