import express from 'express';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Foydalanuvchi topilmadi'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        currentLevel: user.currentLevel,
        placementTestScore: user.placementTestScore,
        completedLessons: user.completedLessons,
        completedLevels: user.completedLevels,
        certificates: user.certificates,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
});

// @route   PUT /api/users/placement-test
// @desc    Update placement test result
// @access  Private
router.put('/placement-test', authMiddleware, async (req, res) => {
  try {
    const { score, level, answers } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Foydalanuvchi topilmadi'
      });
    }

    // Update user
    user.placementTestScore = score;
    user.currentLevel = level;

    // Save test result
    user.testResults.push({
      type: 'placement',
      score,
      totalQuestions: 12,
      answers
    });

    await user.save();

    res.json({
      success: true,
      message: 'Placement test natijasi saqlandi',
      user: {
        currentLevel: user.currentLevel,
        placementTestScore: user.placementTestScore
      }
    });
  } catch (error) {
    console.error('Update placement test error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
});

// @route   POST /api/users/complete-lesson
// @desc    Mark lesson as completed
// @access  Private
router.post('/complete-lesson', authMiddleware, async (req, res) => {
  try {
    const { levelId, lessonId } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Foydalanuvchi topilmadi'
      });
    }

    // Check if already completed
    const alreadyCompleted = user.completedLessons.some(
      lesson => lesson.levelId === levelId && lesson.lessonId === lessonId
    );

    if (!alreadyCompleted) {
      user.completedLessons.push({
        levelId,
        lessonId
      });
      await user.save();
    }

    res.json({
      success: true,
      message: 'Dars tugatilgan deb belgilandi',
      completedLessons: user.completedLessons
    });
  } catch (error) {
    console.error('Complete lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
});

// @route   POST /api/users/complete-level
// @desc    Mark level as completed
// @access  Private
router.post('/complete-level', authMiddleware, async (req, res) => {
  try {
    const { levelId, examScore } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Foydalanuvchi topilmadi'
      });
    }

    // Check if already completed
    const alreadyCompleted = user.completedLevels.some(
      level => level.levelId === levelId
    );

    if (!alreadyCompleted) {
      user.completedLevels.push({
        levelId,
        examScore
      });
      await user.save();
    }

    res.json({
      success: true,
      message: 'Daraja tugatilgan deb belgilandi',
      completedLevels: user.completedLevels
    });
  } catch (error) {
    console.error('Complete level error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
});

// @route   POST /api/users/save-test-result
// @desc    Save test result
// @access  Private
router.post('/save-test-result', authMiddleware, async (req, res) => {
  try {
    const { type, levelId, lessonId, score, totalQuestions, answers, aiAnalysis } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Foydalanuvchi topilmadi'
      });
    }

    user.testResults.push({
      type,
      levelId,
      lessonId,
      score,
      totalQuestions,
      answers,
      aiAnalysis
    });

    await user.save();

    res.json({
      success: true,
      message: 'Test natijasi saqlandi'
    });
  } catch (error) {
    console.error('Save test result error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
});

// @route   POST /api/users/update-time
// @desc    Update user time spent
// @access  Private
router.post('/update-time', authMiddleware, async (req, res) => {
  try {
    const { minutes } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });

    user.totalTimeSpent = (user.totalTimeSpent || 0) + (minutes || 1);
    user.lastActive = Date.now();
    await user.save();

    res.json({ success: true, totalTimeSpent: user.totalTimeSpent });
  } catch (error) {
    console.error('Update time error:', error);
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
});

export default router;