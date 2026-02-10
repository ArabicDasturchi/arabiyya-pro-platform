import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        // Find the most recent user
        const user = await User.findOne().sort({ createdAt: -1 });

        if (user) {
            console.log('\n--- ENG OXIRGI FOYDALANUVCHI ---');
            console.log(`ID: ${user._id}`);
            console.log(`Ism: ${user.name}`);
            console.log(`Email: ${user.email}`);

            console.log('\n--- TEST NATIJALARI (placement-analysis) ---');
            if (user.testResults && user.testResults.length > 0) {
                user.testResults.forEach((result, index) => {
                    console.log(`#${index + 1} Turi: ${result.type}`);
                    console.log(`   Ball: ${result.score}`);
                    console.log(`   Daraja: ${result.levelId}`);
                    console.log(`   Vaqt: ${result.completedAt}`);
                });
            } else {
                console.log('Test natijalari yo\'q.');
            }

            console.log('\n--- CHAT TARIXI (chat) ---');
            if (user.chatHistory && user.chatHistory.length > 0) {
                user.chatHistory.forEach((chat, index) => {
                    console.log(`#${index + 1} [${chat.role}]: ${chat.message.substring(0, 50)}... (${chat.timestamp})`);
                });
            } else {
                console.log('Chat tarixi yo\'q.');
            }
        } else {
            console.log('Foydalanuvchilar topilmadi.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected.');
    }
};

checkData();
