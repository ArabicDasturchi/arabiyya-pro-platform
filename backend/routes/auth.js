import express from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Generate JWT Token
const generateToken = (userId, sessionId) => {
  return jwt.sign({ userId, sessionId }, process.env.JWT_SECRET, {
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
    const sessionId = Math.random().toString(36).substring(2, 15);
    const user = new User({ name, email, password, activeSessionId: sessionId });
    await user.save();
    const token = generateToken(user._id, sessionId);
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
    const sessionId = Math.random().toString(36).substring(2, 15);
    user.activeSessionId = sessionId;
    await user.updateLastActive();
    const token = generateToken(user._id, sessionId);
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
        purchasedLevels: user.purchasedLevels,
        completedLessons: user.completedLessons,
        completedLevels: user.completedLevels,
        isPremium: user.isPremium,
        premiumUntil: user.premiumUntil,
        premiumType: user.premiumType
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
    const sessionId = Math.random().toString(36).substring(2, 15);
    const user = new User({ name, email: tempEmail, password: tempPassword, activeSessionId: sessionId });
    await user.save();
    const token = generateToken(user._id, sessionId);
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

// @route   POST /api/auth/google
// @desc    Google login/register
// @access  Public
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;
    const CLIENT_ID = "645466008042-5c2r49etqtdd0srgou6tfvqrlo9vr272.apps.googleusercontent.com";
    const client = new OAuth2Client(CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { name, email } = payload;
    const sessionId = Math.random().toString(36).substring(2, 15);

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if doesn't exist
      // Generate a random secure password since they use Google
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

      const superAdmins = ['humoyunanvarjonov466@gmail.com', 'humoyunanvarjonov52@gmail.com'];

      user = new User({
        name,
        email,
        password: randomPassword,
        activeSessionId: sessionId,
        role: superAdmins.includes(email) ? 'admin' : 'user'
      });
      await user.save();
    } else {
      user.activeSessionId = sessionId;
      await user.updateLastActive();

      // Upgrade existing core admin emails if not already admin
      const superAdmins = ['humoyunanvarjonov466@gmail.com', 'humoyunanvarjonov52@gmail.com'];
      if (superAdmins.includes(email) && user.role !== 'admin') {
        user.role = 'admin';
      }

      // Ensure user is saved with new session ID (and potentially new role)
      await user.save();
    }

    const jwtToken = generateToken(user._id, sessionId);

    res.json({
      success: true,
      message: 'Google orqali kirdingiz',
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        currentLevel: user.currentLevel,
        purchasedLevels: user.purchasedLevels,
        completedLessons: user.completedLessons,
        completedLevels: user.completedLevels,
        isPremium: user.isPremium,
        premiumUntil: user.premiumUntil,
        premiumType: user.premiumType
      }
    });

  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(401).json({ success: false, message: 'Google tizimi xatosi yoki token yaroqsiz' });
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
        purchasedLevels: user.purchasedLevels, // MUHIM: Sotib olingan darajalar
        completedLessons: user.completedLessons,
        completedLevels: user.completedLevels,
        certificates: user.certificates || [],
        chatHistory: user.chatHistory,
        isPremium: user.isPremium,
        premiumUntil: user.premiumUntil,
        premiumType: user.premiumType
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

// @route   POST /api/auth/certificates
// @desc    Issue a certificate to the user
// @access  Private
router.post('/certificates', [authMiddleware], async (req, res) => {
  try {
    const { level, score, certificateNumber, issueDate } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });
    }

    // Check if certificate already exists for this level
    // certificates array might not be initialized
    if (!user.certificates) user.certificates = [];

    const existingCert = user.certificates.find(c => c.level === level);
    if (existingCert) {
      return res.json({ success: true, message: 'Sertifikat allaqachon mavjud', certificate: existingCert });
    }

    const newCert = {
      certificateId: certificateNumber,
      level,
      issueDate: issueDate || new Date(),
      score: parseInt(score) || 0
    };

    user.certificates.push(newCert);
    await user.save();

    res.json({ success: true, certificate: newCert });
  } catch (error) {
    console.error('Certificate issue error:', error);
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
});


// @route   POST /api/auth/telegram-login
// @desc    Register or Login via Telegram
// @access  Public
router.post('/telegram-login', async (req, res) => {
  try {
    const { telegramId, name, username } = req.body;
    if (!telegramId) return res.status(400).json({ success: false, message: 'Telegram ID missing' });

    let user = await User.findOne({ telegramChatId: telegramId.toString() });

    if (!user) {
      // Create new user
      const tempEmail = 	g_ + telegramId + @arabiyya.pro;
      const tempPassword = Math.random().toString(36).slice(-10);
      user = new User({
        name: name || 'Telegram User',
        email: tempEmail,
        password: tempPassword,
        telegramChatId: telegramId.toString(),
        telegramUsername: username
      });
      await user.save();
    } else {
      // Update username if changed
      if (username && user.telegramUsername !== username) {
        user.telegramUsername = username;
        await user.save();
      }
    }

    res.json({ success: true, user: { id: user._id, name: user.name } });
  } catch (error) {
    console.error('Telegram Login Error:', error);
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
});

// @route   GET /api/auth/telegram-profile
// @desc    Get user profile by Telegram ID
// @access  Public (Secure by x-telegram-id header)
router.get('/telegram-profile', async (req, res) => {
  try {
    const tgId = req.header('x-telegram-id');
    if (!tgId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const user = await User.findOne({ telegramChatId: tgId });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Calculate points based on completed lessons
    const points = (user.completedLessons?.length || 0) * 10;

    res.json({
      success: true,
      user: {
        name: user.name,
        level: user.currentLevel || 'A1',
        points: points,
        isPremium: user.isPremium
      }
    });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// @route   GET /api/auth/leaderboard
// @desc    Get top users
// @access  Public
router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find()
      .select('name completedLessons isPremium')
      .limit(20);

    const leaders = users.map(u => ({
      name: u.name,
      points: (u.completedLessons?.length || 0) * 10,
      isPremium: u.isPremium
    })).sort((a, b) => b.points - a.points);

    res.json({ success: true, users: leaders });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

export default router;
