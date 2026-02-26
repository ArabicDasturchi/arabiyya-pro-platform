import express from 'express';
import Lesson from '../models/Lesson.js';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Helper to check if user has access to level
const hasAccess = (user, levelId) => {
  if (user.role === 'admin') return true;
  if (levelId === 'ALPHABET') return true; // Alphabet is always free
  return user.purchasedLevels && user.purchasedLevels.includes(levelId);
};

// @route   GET /api/lessons/:levelId
// @desc    Get all lessons for a level
// @access  Private
router.get('/:levelId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !hasAccess(user, req.params.levelId)) {
      return res.status(403).json({
        success: false,
        message: 'Ushbu darslarni ko\'rish uchun ruxsat yo\'q. Iltimos, darajani sotib oling.'
      });
    }

    const lessons = await Lesson.find({
      levelId: req.params.levelId,
      isActive: true
    }).sort({ lessonNumber: 1 });

    res.json({
      success: true,
      count: lessons.length,
      lessons
    });
  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
});

// @route   GET /api/lessons/:levelId/:lessonNumber
// @desc    Get single lesson
// @access  Private
router.get('/:levelId/:lessonNumber', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !hasAccess(user, req.params.levelId)) {
      return res.status(403).json({
        success: false,
        message: 'Ushbu darsni ko\'rish uchun ruxsat yo\'q. Iltimos, darajani sotib oling.'
      });
    }

    const lesson = await Lesson.findOne({
      levelId: req.params.levelId,
      lessonNumber: parseInt(req.params.lessonNumber),
      isActive: true
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Dars topilmadi'
      });
    }

    res.json({
      success: true,
      lesson
    });
  } catch (error) {
    console.error('Get lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
});

export default router;