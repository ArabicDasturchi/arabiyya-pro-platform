import express from 'express';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

const s3 = new S3Client({
    endpoint: `https://${process.env.B2_ENDPOINT}`,
    region: process.env.B2_BUCKET_REGION || 'us-east-005',
    credentials: {
        accessKeyId: process.env.B2_KEY_ID,
        secretAccessKey: process.env.B2_APPLICATION_KEY
    }
});

// Foydalanuvchi "Yuklab Olish" ni bossanda — fayl to'g'ridan-to'g'ri brauzerga uzatiladi
// Vaqt chekovi yo'q, URL ko'rinmaydi, bucket private qoladi
// @route GET /api/download?key=books/kitob-xxx.pdf
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { key } = req.query;

        if (!key) {
            return res.status(400).json({ success: false, message: 'Fayl kaliti ko\'rsatilmadi.' });
        }

        // Agar to'liq URL kelsa — key ajratib olamiz
        let fileKey = key;
        if (key.startsWith('http')) {
            const url = new URL(key);
            fileKey = url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname;
        }

        // Fayl nomini key dan ajratamiz
        const fileName = fileKey.split('/').pop() || 'darslik.pdf';

        // B2 dan faylni olamiz
        const command = new GetObjectCommand({
            Bucket: process.env.B2_BUCKET_NAME,
            Key: fileKey,
        });

        const s3Response = await s3.send(command);

        // Browser uchun sarlavhalar — to'g'ridan-to'g'ri yuklab olish
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

        if (s3Response.ContentLength) {
            res.setHeader('Content-Length', s3Response.ContentLength);
        }

        // Faylni stream orqali uzatamiz — xotirani ko'p egallaydi
        s3Response.Body.pipe(res);

        s3Response.Body.on('error', (err) => {
            console.error('Stream xatosi:', err);
            if (!res.headersSent) {
                res.status(500).json({ success: false, message: 'Yuklab olishda xatolik.' });
            }
        });

    } catch (err) {
        console.error('Download xatosi:', err);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: 'Fayl topilmadi yoki yuklab bo\'lmadi.' });
        }
    }
});

export default router;
