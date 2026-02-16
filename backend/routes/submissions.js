import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Submission from '../models/Submission.js';
import User from '../models/User.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Uploads papkasini tekshirish
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// @route   POST /api/submissions/upload
// @desc    Submit homework (file upload)
// @access  Private
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
    try {
        const { levelId, lessonId, comment } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ success: false, message: 'Fayl yuklanmadi' });
        }

        const fileUrl = `/uploads/${file.filename}`;

        const newSubmission = new Submission({
            user: req.userId,
            levelId,
            lessonId,
            type: 'homework',
            fileUrl,
            comment,
            status: 'pending' // Tekshirilmagan
        });

        await newSubmission.save();

        res.status(201).json({
            success: true,
            message: 'Vazifa muvaffaqiyatli yuklandi!',
            submission: newSubmission
        });

    } catch (error) {
        console.error('Submission Upload Error:', error);
        res.status(500).json({ success: false, message: 'Server xatosi uploading homework' });
    }
});

// @route   POST /api/submissions/quiz
// @desc    Submit quiz result
// @access  Private
router.post('/quiz', authMiddleware, async (req, res) => {
    try {
        const { levelId, lessonId, score, totalQuestions } = req.body;

        // Check existing quiz submission (avoid duplicates if needed, or allow retake)
        // For now, allow retake but just log it

        const newSubmission = new Submission({
            user: req.userId,
            levelId,
            lessonId,
            type: 'quiz',
            score,
            totalQuestions,
            status: 'approved' // Quiz avtomatik tekshiriladi
        });

        await newSubmission.save();

        // Update User Progress (masalan completedLessons arrayga qo'shish)
        // Bu qismi User modeliga bog'liq. Hozircha Submission o'zi yetarli.

        res.status(201).json({
            success: true,
            message: 'Test natijasi saqlandi!',
            submission: newSubmission
        });

    } catch (error) {
        console.error('Quiz Submission Error:', error);
        res.status(500).json({ success: false, message: 'Server xatosi submitting quiz' });
    }
});

// @route   GET /api/submissions/my
// @desc    Get my submissions
// @access  Private
router.get('/my', authMiddleware, async (req, res) => {
    try {
        const submissions = await Submission.find({ user: req.userId }).sort({ createdAt: -1 });
        res.json({ success: true, submissions });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// @route   GET /api/submissions/all
// @desc    Get all submissions (Admin only)
// @access  Private/Admin
router.get('/all', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const submissions = await Submission.find({})
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        res.json({ success: true, submissions });
    } catch (error) {
        console.error('Get All Submissions Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/submissions/:id
// @desc    Update submission (Grade/Feedback)
// @access  Private/Admin
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { status, score, comment } = req.body;

        let updateData = { status };
        if (score !== undefined) updateData.score = score;
        if (comment !== undefined) updateData.comment = comment; // Admin comment (feedback)

        const submission = await Submission.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate('user', 'name email');

        if (!submission) {
            return res.status(404).json({ success: false, message: 'Submission not found' });
        }

        res.json({ success: true, submission });
    } catch (error) {
        console.error('Update Submission Error:', error);
        res.status(500).json({ success: false, message: 'Server error updating submission' });
    }
});

export default router;
