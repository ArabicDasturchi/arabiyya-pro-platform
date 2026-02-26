import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header or query
    let token = req.header('Authorization')?.replace('Bearer ', '');

    // If no header token, check query string (useful for direct PDF links)
    if (!token && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      console.log('❌ Token topilmadi: ', req.method, req.path);
      return res.status(401).json({
        success: false,
        message: 'Token topilmadi. Iltimos, tizimga kiring (Token not found)'
      });
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check for concurrent session
      const user = await User.findById(decoded.userId).select('activeSessionId');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Foydalanuvchi topilmadi'
        });
      }

      if (decoded.sessionId && user.activeSessionId !== decoded.sessionId) {
        return res.status(401).json({
          success: false,
          message: 'Siz boshqa qurilmadan kirdingiz. Iltimos, qaytadan kiring.',
          code: 'CONCURRENT_SESSION'
        });
      }

      req.userId = decoded.userId;
      next();
    } catch (error) {
      // Handle specific JWT errors
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Noto\'g\'ri token'
        });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token muddati tugagan. Qaytadan kiring'
        });
      }
      throw error;
    }

  } catch (error) {
    console.error('Auth Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

export const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (user && user.role === 'admin') {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: 'Ruxsat yo\'q. Faqat adminlar uchun.'
      });
    }
  } catch (error) {
    console.error('Admin Check Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};