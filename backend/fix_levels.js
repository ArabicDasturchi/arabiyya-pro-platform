import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Level from './models/Level.js';
import Lesson from './models/Lesson.js';

dotenv.config();

const fixLevels = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // 1. Check/Create "Arab Harflari (Kirish)" Level
        let introLevel = await Level.findOne({ id: 'INTRO' });

        if (!introLevel) {
            console.log('Creating INTRO level...');
            introLevel = new Level({
                id: 'INTRO',
                title: 'Arab Harflari (Kirish)',
                description: 'Arab tilini noldan o\'rganuvchilar uchun maxsus bepul bo\'lim. 3 ta dars bepul.',
                icon: '🌱',
                color: 'from-green-500 to-emerald-600',
                order: 0, // En birinchi
                totalLessons: 3,
                isActive: true,
                lessons: []
            });
            await introLevel.save();
        } else {
            console.log('INTRO level already exists. Updating...');
            introLevel.order = 0;
            introLevel.title = 'Arab Harflari (Kirish)';
            introLevel.icon = '🌱';
            await introLevel.save();
        }

        // 2. Add 3 Lessons to INTRO if empty or incomplete
        // First, clear existing lessons to ensure clean state (optional, but safer for "fix")
        // Or just append if empty. Let's append if empty.
        if (introLevel.lessons.length === 0) {
            console.log('Adding 3 lessons to INTRO...');
            const lessonsData = [
                { title: 'Arab Tiliga Kirish', duration: '15 daqiqa', ebookUrl: 'https://example.com/demo.pdf' },
                { title: 'Alif va Ba Harflari', duration: '20 daqiqa', ebookUrl: 'https://example.com/demo.pdf' },
                { title: 'Ta va Sa Harflari', duration: '20 daqiqa', ebookUrl: 'https://example.com/demo.pdf' }
            ];

            for (const l of lessonsData) {
                const lesson = new Lesson({
                    levelId: 'INTRO',
                    lessonNumber: introLevel.lessons.length + 1,
                    title: l.title,
                    duration: l.duration,
                    videoUrl: '',
                    ebookUrl: l.ebookUrl,
                    topics: ['Kirish', 'Alifbo'],
                    content: { mainContent: 'Bu darsning asosiy mazmuni.' }
                });
                const savedLesson = await lesson.save();
                introLevel.lessons.push(savedLesson._id);
            }
            await introLevel.save();
            console.log('Added 3 lessons.');
        } else {
            // Update existing lessons to have ebookUrl if missing
            console.log('Updating existing INTRO lessons...');
            for (const lessonId of introLevel.lessons) {
                await Lesson.findByIdAndUpdate(lessonId, {
                    $set: { ebookUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }
                });
            }
        }

        // 3. Update ALPHABET level (if exists)
        let alphabetLevel = await Level.findOne({ id: 'ALPHABET' });
        if (alphabetLevel) {
            console.log('Updating ALPHABET level order...');
            alphabetLevel.order = 1; // Second
            alphabetLevel.title = 'Mukammal Alifbo';
            await alphabetLevel.save();
        }

        console.log('✅ Levels fixed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error fixing levels:', err);
        process.exit(1);
    }
};

fixLevels();
