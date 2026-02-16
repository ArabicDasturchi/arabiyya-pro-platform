import express from 'express';
import Level from '../models/Level.js';
import Lesson from '../models/Lesson.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/levels
// @desc    Get all levels with lessons populated
// @access  Public
router.get('/', async (req, res) => {
  try {
    const levels = await Level.find({ isActive: true })
      .sort({ order: 1 })
      .populate('lessons'); // Populate lessons

    res.json({
      success: true,
      count: levels.length,
      levels
    });
  } catch (error) {
    console.error('Get levels error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
});

// @route   GET /api/levels/:levelId
// @desc    Get single level
// @access  Public
router.get('/:levelId', async (req, res) => {
  try {
    const level = await Level.findOne({
      id: req.params.levelId,
      isActive: true
    }).populate('lessons');

    if (!level) {
      return res.status(404).json({
        success: false,
        message: 'Daraja topilmadi'
      });
    }

    res.json({
      success: true,
      level
    });
  } catch (error) {
    console.error('Get level error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
});

// @route   POST /api/levels/:levelId/lessons
// @desc    Add a lesson to a level
// @access  Private/Admin
router.post('/:levelId/lessons', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const { title, duration, videoUrl } = req.body;
    const levelId = req.params.levelId; // e.g., 'A1'

    // Find the level document
    const level = await Level.findOne({ id: levelId });
    if (!level) {
      return res.status(404).json({ success: false, message: 'Level not found' });
    }

    // Create new Lesson
    const newLesson = new Lesson({
      levelId: levelId,
      lessonNumber: level.lessons.length + 1, // Simple incremental logic
      title,
      duration,
      videoUrl,
      topics: ['Mavzu'], // Placeholder
      content: { introduction: '', mainContent: '', summary: '', keyPoints: [] }, // Placeholder
      homework: { description: '', tasks: [] } // Placeholder
    });

    const savedLesson = await newLesson.save();

    // Add lesson to Level's lessons array
    level.lessons.push(savedLesson._id);
    await level.save();

    res.json({
      success: true,
      lesson: savedLesson
    });

  } catch (error) {
    console.error('Add lesson error:', error);
    res.status(500).json({ success: false, message: 'Server error adding lesson' });
  }
});

// @route   PUT /api/levels/:levelId/lessons/:lessonId
// @desc    Update a lesson
// @access  Private/Admin
router.put('/:levelId/lessons/:lessonId', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { title, duration, videoUrl, content, topics } = req.body;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    if (title) lesson.title = title;
    if (duration) lesson.duration = duration;
    if (videoUrl) lesson.videoUrl = videoUrl;
    if (content) lesson.content = content;
    if (topics) lesson.topics = topics;

    await lesson.save();

    res.json({ success: true, lesson });

  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({ success: false, message: 'Server error updating lesson' });
  }
});

// @route   DELETE /api/levels/:levelId/lessons/:lessonId
// @desc    Delete a lesson
// @access  Private/Admin
router.delete('/:levelId/lessons/:lessonId', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const { levelId, lessonId } = req.params;

    // Find Level
    const level = await Level.findOne({ id: levelId });
    if (!level) {
      return res.status(404).json({ success: false, message: 'Level not found' });
    }

    // Remove from Level's lessons array
    level.lessons = level.lessons.filter(id => id.toString() !== lessonId);
    await level.save();

    // Delete Lesson document
    await Lesson.findByIdAndDelete(lessonId);

    res.json({ success: true, message: 'Lesson deleted' });

  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting lesson' });
  }
});

export default router;