import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

// Import models
import User from './models/User.js';
import Order from './models/Order.js';
import jwt from 'jsonwebtoken';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import levelRoutes from './routes/levels.js';
import lessonRoutes from './routes/lessons.js';
import testRoutes from './routes/tests.js';
import certificateRoutes from './routes/certificates.js';
import aiRoutes from './routes/ai.js';
import adminRoutes from './routes/admin.js';

// Import seed function
import { seedDB } from './seed_levels.js';

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(morgan('dev')); // Logging
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'https://arabiyya-pro-platform.vercel.app', '*'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Temporary Admin Promotion Endpoint (Placed at top for priority)
app.get('/api/make-admin', async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ success: false, message: 'User ID required (use ?id=...)' });

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found with ID: ' + id });

    user.role = 'admin';
    await user.save();
    console.log(`User ${user.email} (ID: ${id}) promoted to ADMIN via API`);
    res.json({ success: true, message: `User ${user.email} is now an ADMIN!` });
  } catch (error) {
    console.error('Make Admin error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Temporary Debug Endpoint: List Users
app.get('/api/debug/users', async (req, res) => {
  try {
    const users = await User.find({}, 'username email role');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Routes

// ==========================================
// PAYMENT & ORDER ROUTES (Priority)
// ==========================================

// Create Purchase Order
app.post('/api/purchase', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { levelId, amount, paymentType, transactionProof } = req.body;

    const user = await User.findById(userId);
    if (user.purchasedLevels && user.purchasedLevels.includes(levelId)) {
      return res.status(400).json({ success: false, message: 'bu daraja allaqachon sotib olingan' });
    }

    const newOrder = new Order({
      user: userId,
      levelId,
      amount,
      paymentType,
      transactionProof
    });

    await newOrder.save();
    res.status(201).json({ success: true, message: 'Buyurtma yaratildi', order: newOrder });

  } catch (error) {
    console.error('Purchase Error:', error);
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
});

// Admin: Get All Orders
app.get('/api/admin/orders', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ success: false, message: 'User topilmadi' });
    if (user.role !== 'admin') return res.status(403).json({ success: false });

    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Admin Orders Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Approve Order
app.put('/api/admin/orders/:id/approve', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await User.findById(decoded.id);

    if (!admin) return res.status(404).json({ success: false, message: 'Admin topilmadi' });
    if (admin.role !== 'admin') return res.status(403).json({ success: false });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order topilmadi' });

    if (order.status === 'approved') return res.status(400).json({ success: false, message: 'Allaqachon tasdiqlangan' });

    order.status = 'approved';
    await order.save();

    // Unlock level for user
    const user = await User.findById(order.user);

    // Initialize purchasedLevels if undefined (for old users)
    if (!user.purchasedLevels) user.purchasedLevels = ['A1'];

    if (!user.purchasedLevels.includes(order.levelId)) {
      user.purchasedLevels.push(order.levelId);
      await user.save();
    }

    res.json({ success: true, message: 'Buyurtma tasdiqlandi va daraja ochildi' });
  } catch (error) {
    console.error('Approve Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/levels', levelRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

// Database Seeding Endpoint
app.get('/api/seed-levels', async (req, res) => {
  try {
    await seedDB();
    res.json({ success: true, message: 'Database seeded successfully!' });
  } catch (error) {
    console.error('Seeding error:', error);
    res.status(500).json({ success: false, message: 'Seeding failed', error: error.message });
  }
});

// Duplicate route removed


// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Arabiyya Pro API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Arabiyya Pro API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      levels: '/api/levels',
      lessons: '/api/lessons',
      tests: '/api/tests',
      certificates: '/api/certificates',
      ai: '/api/ai'
    }
  });
});



// Error Handler


// ==========================================
// PAYMENT & ORDER ROUTES
// ==========================================



// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`\n✨ Arabiyya Pro Backend is ready!\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  process.exit(1);
});