import express from 'express';
import Order from '../models/Order.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/purchase
// @desc    Create a new purchase order
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { levelId, amount, paymentType, transactionProof } = req.body;

        if (!levelId || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Ma\'lumotlar to\'liq emas'
            });
        }

        const newOrder = new Order({
            user: req.userId,
            levelId,
            amount,
            paymentType,
            transactionProof
        });

        await newOrder.save();

        res.json({
            success: true,
            message: 'Buyurtma muvaffaqiyatli yaratildi. Admin tasdiqlashini kuting.',
            order: newOrder
        });

    } catch (error) {
        console.error('Purchase Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server xatosi'
        });
    }
});

export default router;
