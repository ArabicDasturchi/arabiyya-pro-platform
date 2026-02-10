
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    levelId: {
        type: String, // 'A2', 'B1', etc.
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    paymentType: {
        type: String, // 'click', 'payme', 'bank_transfer'
        default: 'bank_transfer'
    },
    transactionProof: {
        type: String // URL or ID from user
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Order', orderSchema);
