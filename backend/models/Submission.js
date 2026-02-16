import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    levelId: {
        type: String,
        required: true
    },
    lessonId: { // Masalan: "1-1" yoki Lesson ObjectId
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['homework', 'quiz'],
        required: true
    },
    // Quiz uchun
    score: {
        type: Number,
        default: 0
    },
    totalQuestions: {
        type: Number,
        default: 0
    },
    // Homework uchun
    fileUrl: {
        type: String // Yuklangan fayl manzili
    },
    comment: {
        type: String // O'quvchi izohi
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending' // Quiz uchun avtomatik 'approved' bo'lishi mumkin
    }
}, {
    timestamps: true
});

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;
