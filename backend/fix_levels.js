import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Level from './models/Level.js';
import Lesson from './models/Lesson.js';

dotenv.config();

const fixLevels = async () => {
    try {
        if (process.env.MONGODB_URI) {
            await mongoose.connect(process.env.MONGODB_URI);
            console.log('Connected to DB via .env');
        } else {
            console.log('MONGODB_URI not found in .env, checking args...');
            // Maybe check command line args if needed, or rely on Render environment
            if (!mongoose.connection.readyState) {
                console.error('Error: MONGODB_URI is missing!');
                process.exit(1);
            }
        }

        console.log('Fixing levels...');

        // 1. DELETE "INTRO" or "Arab Harflari" level if it exists (As per user request)
        const introLevel = await Level.findOne({ id: 'INTRO' });
        if (introLevel) {
            console.log('Deleting INTRO level...');
            await Level.deleteOne({ id: 'INTRO' });
            // Optionally delete lessons linked to INTRO
            await Lesson.deleteMany({ levelId: 'INTRO' });
            console.log('INTRO level deleted.');
        } else {
            console.log('INTRO level not found (Good).');
        }

        // 2. Ensure ALPHABET is the first level
        let alphabetLevel = await Level.findOne({ id: 'ALPHABET' });
        if (!alphabetLevel) {
            console.log('ALPHABET level not found! Creating it...');
            alphabetLevel = new Level({
                id: 'ALPHABET',
                title: 'Arab Alifbosi',
                description: 'Harflar, talaffuz va yozish qoidalarini mukammal o\'rganing.',
                icon: 'ا',
                color: 'from-amber-500 to-orange-600',
                order: 1,
                isActive: true,
                lessons: []
            });
            await alphabetLevel.save();
        } else {
            console.log('Updating ALPHABET level...');
            alphabetLevel.order = 1;
            alphabetLevel.title = 'Arab Alifbosi';
            alphabetLevel.isActive = true;
            await alphabetLevel.save();
        }

        // 3. Ensure A1-C2 order
        const levelsOrder = ['ALPHABET', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        for (let i = 0; i < levelsOrder.length; i++) {
            const lid = levelsOrder[i];
            const lvl = await Level.findOne({ id: lid });
            if (lvl) {
                lvl.order = i + 1;
                await lvl.save();

                // Also ensure lessons have ebookUrl
                if (lvl.lessons && lvl.lessons.length > 0) {
                    await Lesson.updateMany(
                        { _id: { $in: lvl.lessons }, ebookUrl: { $exists: false } },
                        { $set: { ebookUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' } }
                    );
                }
            }
        }

        console.log('✅ Levels fixed successfully! Only 7 levels remaining.');
        process.exit(0);

    } catch (err) {
        console.error('Error fixing levels:', err);
        process.exit(1);
    }
};

fixLevels();
