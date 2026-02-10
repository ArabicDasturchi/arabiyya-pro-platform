import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const makeAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        // Find the most recent user
        const user = await User.findOne().sort({ createdAt: -1 });

        if (user) {
            console.log(`\nFoydalanuvchi topildi: ${user.name} (${user.email})`);
            console.log(`Hozirgi roli: ${user.role}`);

            user.role = 'admin';
            await user.save();

            console.log(`\n✅ Muvaffaqiyatli! ${user.name} endi ADMIN bo'ldi.`);
            console.log('Admin panelga kirish uchun sahifani yangilang.');
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

makeAdmin();
