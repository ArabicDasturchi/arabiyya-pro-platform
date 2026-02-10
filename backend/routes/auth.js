import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// ... (register, login, quick-register routes remain same)

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Ism 2-50 ta belgidan iborat bo\'lishi kerak'),
  body('email').isEmail().normalizeEmail().withMessage('To\'g\'ri email kiriting'),
  body('password').isLength({ min: 6 }).withMessage('Parol kamida 6 ta belgidan iborat bo\'lishi kerak')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Bu email allaqachon ro\'yxatdan o\'tgan' });
    }
    const user = new User({ name, email, password });
    await user.save();
    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      message: 'Muvaffaqiyatli ro\'yxatdan o\'tdingiz',
      token,
      user: { id: user._id, name: user.name, email: user.email, currentLevel: user.currentLevel }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('To\'g\'ri email kiriting'),
  body('password').notEmpty().withMessage('Parol kiritish majburiy')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email yoki parol noto\'g\'ri' });
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Email yoki parol noto\'g\'ri' });
    }
    await user.updateLastActive();
    const token = generateToken(user._id);
    res.json({
      success: true,
      message: 'Muvaffaqiyatli kirdingiz',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, // Added role
        currentLevel: user.currentLevel,
        completedLessons: user.completedLessons,
        completedLevels: user.completedLevels
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
});

// @route   POST /api/auth/quick-register
// @desc    Quick register with just name (for demo)
// @access  Public
router.post('/quick-register', [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Ism 2-50 ta belgidan iborat bo\'lishi kerak')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { name } = req.body;
    const tempEmail = `${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}@temp.arabiyya.pro`;
    const tempPassword = Math.random().toString(36).slice(-8);
    const user = new User({ name, email: tempEmail, password: tempPassword });
    await user.save();
    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      message: 'Muvaffaqiyatli ro\'yxatdan o\'tdingiz',
      token,
      user: { id: user._id, name: user.name, currentLevel: user.currentLevel }
    });
  } catch (error) {
    console.error('Quick register error:', error);
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });
    }
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        currentLevel: user.currentLevel,
        completedLessons: user.completedLessons,
        completedLevels: user.completedLevels,
        chatHistory: user.chatHistory
      }
    });
  } catch (error) {
    console.error('Get Me Error:', error);
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
});

// @route   PUT /api/auth/update-password
// @desc    Update user password
// @access  Private
router.put('/update-password', [
  authMiddleware,
  body('oldPassword').notEmpty().withMessage('Eski parol kiriting'),
  body('newPassword').isLength({ min: 6 }).withMessage('Yangi parol kamida 6 ta belgidan iborat bo\'lishi kerak')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { oldPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.userId).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });
    }

    // Check old password
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Eski parol noto\'g\'ri' });
    }

    // Update password
    user.password = newPassword; // Will be hashed by pre-save hook
    await user.save();

    res.json({ success: true, message: 'Parol muvaffaqiyatli yangilandi' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
});

export default router;