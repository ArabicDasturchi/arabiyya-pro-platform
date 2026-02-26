import express from 'express';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Level from '../models/Level.js';
import Lesson from '../models/Lesson.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/admin/stats
// @desc    Get dashboard stats
// @access  Private/Admin
router.get('/stats', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });

        // Calculate total completed lessons
        const users = await User.find().select('completedLessons certificates');
        const totalCompletedLessons = users.reduce((acc, user) => acc + (user.completedLessons?.length || 0), 0);
        const totalCertificates = users.reduce((acc, user) => acc + (user.certificates?.length || 0), 0);

        // Recent users
        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name email createdAt currentLevel');

        res.json({
            success: true,
            stats: {
                totalUsers,
                activeUsers,
                totalCompletedLessons,
                totalCertificates
            },
            recentUsers
        });
    } catch (error) {
        console.error('Admin Stats Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server xatosi'
        });
    }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const users = await User.find()
            .sort({ createdAt: -1 })
            .select('-password'); // Exclude password

        res.json({
            success: true,
            users
        });
    } catch (error) {
        console.error('Admin Users Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server xatosi'
        });
    }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Private/Admin
router.put('/users/:id/role', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const { role } = req.body;
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Noto\'g\'ri rol'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Foydalanuvchi topilmadi'
            });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Admin Update Role Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server xatosi'
        });
    }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/users/:id', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Foydalanuvchi topilmadi'
            });
        }

        res.json({
            success: true,
            message: 'Foydalanuvchi o\'chirildi',
            userId: req.params.id
        });
    } catch (error) {
        console.error('Admin Delete User Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server xatosi'
        });
    }
});

// @route   GET /api/admin/orders
// @desc    Get all purchase orders
// @access  Private/Admin
router.get('/orders', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            orders
        });
    } catch (error) {
        console.error('Admin Orders Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server xatosi'
        });
    }
});

// @route   PUT /api/admin/orders/:id/approve
// @desc    Approve purchase order
// @access  Private/Admin
router.put('/orders/:id/approve', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Buyurtma topilmadi'
            });
        }

        if (order.status === 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Allaqachon tasdiqlangan'
            });
        }

        // Update order status
        order.status = 'approved';
        await order.save();

        // Unlock level for user
        const user = await User.findById(order.user);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Foydalanuvchi topilmadi'
            });
        }

        // Initialize purchasedLevels if undefined
        if (!user.purchasedLevels) user.purchasedLevels = ['A1'];

        // Add level if not already purchased
        if (!user.purchasedLevels.includes(order.levelId)) {
            user.purchasedLevels.push(order.levelId);
            await user.save();
        }

        res.json({
            success: true,
            message: 'Buyurtma tasdiqlandi va daraja ochildi'
        });
    } catch (error) {
        console.error('Admin Approve Order Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server xatosi'
        });
    }
});

// @route   POST /api/admin/cleanup-links
// @desc    Cleanup broken/legacy links in database
// @access  Private/Admin
router.post('/cleanup-links', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        // 1. Fix Levels
        const levels = await Level.find();
        let levelsFixed = 0;
        for (const level of levels) {
            let changed = false;
            if (level.levelBookUrl) {
                // Remove localhost or old placeholder links
                if (level.levelBookUrl.includes('localhost') || level.levelBookUrl.includes('/book-')) {
                    level.levelBookUrl = '';
                    changed = true;
                }
                // Convert absolute Render URL back to relative if it exists
                else if (level.levelBookUrl.includes('arabiyya-pro-backend.onrender.com')) {
                    const parts = level.levelBookUrl.split('/uploads/');
                    if (parts.length > 1) {
                        level.levelBookUrl = '/uploads/' + parts[1];
                        changed = true;
                    }
                }

                if (changed) {
                    await level.save();
                    levelsFixed++;
                }
            }
        }

        // 2. Fix Lessons
        const lessons = await Lesson.find();
        let lessonsFixed = 0;
        for (const lesson of lessons) {
            let changed = false;
            if (lesson.ebookUrl) {
                if (lesson.ebookUrl.includes('localhost') || lesson.ebookUrl.includes('/book-')) {
                    lesson.ebookUrl = '';
                    changed = true;
                } else if (lesson.ebookUrl.includes('arabiyya-pro-backend.onrender.com')) {
                    const parts = lesson.ebookUrl.split('/uploads/');
                    if (parts.length > 1) {
                        lesson.ebookUrl = '/uploads/' + parts[1];
                        changed = true;
                    }
                }

                if (changed) {
                    await lesson.save();
                    lessonsFixed++;
                }
            }
        }

        res.json({
            success: true,
            message: `Tizim tozalandi! ${levelsFixed} ta daraja va ${lessonsFixed} ta dars linklari muvaffaqiyatli tuzatildi.`
        });
    } catch (error) {
        console.error('Cleanup error:', error);
        res.status(500).json({ success: false, message: 'Tozalashda xatolik yuz berdi' });
    }
});

// @route   POST /api/admin/grant-level
// @desc    Manually grant a level to a user
// @access  Private/Admin
router.post('/grant-level', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const { userId, levelId } = req.body;

        // Xavfsizlik uchun: Faqat belgilangan adminlar
        const currentAdmin = await User.findById(req.userId);
        const superAdmins = ['humoyunanvarjonov466@gmail.com', 'humoyunanvarjonov52@gmail.com'];

        if (!currentAdmin || !superAdmins.includes(currentAdmin.email)) {
            return res.status(403).json({
                success: false,
                message: 'Kechirasiz, faqat super-admin daraja bera oladi!'
            });
        }

        if (!userId || !levelId) {
            return res.status(400).json({
                success: false,
                message: 'Foydalanuvchi va daraja ma\'lumotlari yetarli emas.'
            });
        }

        const targetUser = await User.findById(userId);
        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: 'Foydalanuvchi bazadan topilmadi'
            });
        }

        // Darajani ochish
        if (!targetUser.purchasedLevels) targetUser.purchasedLevels = ['A1'];
        if (!targetUser.purchasedLevels.includes(levelId)) {
            targetUser.purchasedLevels.push(levelId);
            await targetUser.save();
        }

        console.log(`✅ Daraja ochildi: ${levelId} -> ${targetUser.email}`);

        res.json({
            success: true,
            message: `${targetUser.name} uchun ${levelId} darajasi muvaffaqiyatli ochildi!`
        });

    } catch (error) {
        console.error('Grant Level API Error:', error);
        res.status(500).json({
            success: false,
            message: 'Tizimda xatolik: ' + error.message
        });
    }
});

// --- BOOK UPLOAD LOGIC ---
const uploadsPath = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsPath),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const levelId = req.query.levelId || 'GENERAL';
        cb(null, `${levelId}-${Date.now()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 200 * 1024 * 1024 }, // 200MB
    fileFilter(req, file, cb) {
        if (file.originalname.toLowerCase().endsWith('.pdf')) {
            cb(null, true);
        } else {
            cb(new Error('Faqat PDF (.pdf) formatidagi fayllarni yuklash mumkin!'));
        }
    }
}).single('file');

// @route POST /api/admin/upload-book
router.post('/upload-book', [authMiddleware, adminMiddleware], (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Fayl tanlanmadi' });
        }
        const BACKEND = process.env.BACKEND_URL || 'https://arabiyya-pro-backend.onrender.com';
        const fileUrl = `${BACKEND}/uploads/${req.file.filename}`;
        res.json({ success: true, fileUrl });
    });
});

export default router;
