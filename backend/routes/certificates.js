import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// @route   POST /api/certificates/generate
// @desc    Generate certificate for user
// @access  Private
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const { level, score } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Foydalanuvchi topilmadi'
      });
    }

    // Generate certificate ID
    const certificateId = `ARABPRO-${Date.now().toString().slice(-8)}`;
    
    const certificate = {
      certificateId,
      level,
      issueDate: new Date(),
      score
    };

    // Add to user certificates
    user.certificates.push(certificate);
    await user.save();

    res.json({
      success: true,
      message: 'Sertifikat muvaffaqiyatli yaratildi',
      certificate: {
        ...certificate,
        name: user.name,
        date: new Date().toLocaleDateString('uz-UZ', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }
    });
  } catch (error) {
    console.error('Generate certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
});

// @route   GET /api/certificates
// @desc    Get user certificates
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Foydalanuvchi topilmadi'
      });
    }

    const certificates = user.certificates.map(cert => ({
      ...cert.toObject(),
      name: user.name,
      date: cert.issueDate.toLocaleDateString('uz-UZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }));

    res.json({
      success: true,
      count: certificates.length,
      certificates
    });
  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
});

export default router;