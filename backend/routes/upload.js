import express from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import path from 'path';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Backblaze B2 — S3-compatible client
const s3 = new S3Client({
    endpoint: `https://${process.env.B2_ENDPOINT}`,
    region: process.env.B2_BUCKET_REGION || 'us-west-004',
    credentials: {
        accessKeyId: process.env.B2_KEY_ID,
        secretAccessKey: process.env.B2_APPLICATION_KEY
    },
    // B2 uchun kerakli sozlamalar
    forcePathStyle: false
});

// Multer + Backblaze B2 storage (ACL YO'Q — bucket allaqachon public)
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.B2_BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        // ACL o'chirildi — B2 uni qo'llamaydi, bucket public qilingan
        key: function (req, file, cb) {
            const ext = path.extname(file.originalname).toLowerCase();
            const filename = `books/kitob-${Date.now()}${ext}`;
            cb(null, filename);
        }
    }),
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
            console.error('Multer Error:', err);
            return res.status(400).json({ success: false, message: `Fayl yuklashda xatolik: ${err.message}` });
        } else if (err) {
            console.error('Upload Error:', err);
            return res.status(400).json({ success: false, message: err.message });
        }

        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Fayl serverga yetib kelmadi. Iltimos, qayta urinib ko\'ring.'
                });
            }

            // Backblaze B2 public URL — bucket public bo'lganda ushbu format ishlaydi
            // Format: https://{bucket}.s3.{region}.backblazeb2.com/{key}
            const region = process.env.B2_BUCKET_REGION || 'us-west-004';
            const bucket = process.env.B2_BUCKET_NAME;
            const key = req.file.key; // multer-s3 bu fieldni to'ldiradi
            const fileUrl = `https://${bucket}.s3.${region}.backblazeb2.com/${key}`;

            console.log('✅ Fayl Backblaze B2-ga yuklandi:', fileUrl);
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
