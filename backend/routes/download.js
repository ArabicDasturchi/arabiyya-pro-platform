import express from 'express';
// Bu route hozircha ishlatilmaydi — yuklab olish to'g'ridan-to'g'ri /uploads/filename.pdf orqali amalga oshiriladi
const router = express.Router();
router.get('/', (req, res) => res.json({ message: 'Download via /uploads/ static path' }));
export default router;
