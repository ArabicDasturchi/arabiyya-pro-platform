import express from 'express';
import Lesson from '../models/Lesson.js';

const router = express.Router();

// @route   GET /api/lessons/:levelId
// @desc    Get all lessons for a level
// @access  Public
router.get('/:levelId', async (req, res) => {
  try {
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
// @access  Public
router.get('/:levelId/:lessonNumber', async (req, res) => {
  try {
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