import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        default: 'Yangi Suhbat'
    },
    messages: [{
        role: {
            type: String,
            enum: ['user', 'ai'],
            required: true
        },
        content: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

const Chat = mongoose.model('Chat', chatSchema);
export default Chat;
