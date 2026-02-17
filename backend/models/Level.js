import mongoose from 'mongoose';

const levelSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        enum: ['ALPHABET', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    icon: String,
    color: String,
    totalLessons: {
        type: Number,
        default: 0
    },
    order: {
        type: Number,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lessons: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson'
    }],
    examQuestions: [{
        question: {
            type: String,
            required: true
        },
        options: [{
            type: String,
            required: true
        }],
        correctAnswer: {
            type: Number,
            required: true,
            min: 0,
            max: 3
        }
    }]
}, {
    timestamps: true
});

export default mongoose.model('Level', levelSchema);
