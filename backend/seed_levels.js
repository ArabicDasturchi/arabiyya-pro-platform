import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Level from './models/Level.js';
import Lesson from './models/Lesson.js';

dotenv.config();

const levelsData = [
    {
        id: 'A1',
        title: 'A1 - Boshlang\'ich',
        description: 'Arab alifbosi va asosiy so\'zlar bilan tanishish',
        color: 'from-blue-500 via-blue-600 to-indigo-600',
        icon: '🌱',
        order: 1,
        lessons: [
            { lessonNumber: 1, title: 'Arab alifbosi - 1 qism', topics: ['Harflar: أ ب ت ث', 'Talaffuz asoslari', 'Yozish texnikasi'], duration: '45 daqiqa', videoUrl: '' },
            { lessonNumber: 2, title: 'Arab alifbosi - 2 qism', topics: ['Harflar: ج ح خ د', 'Tovush farqlari', 'Amaliy mashqlar'], duration: '50 daqiqa', videoUrl: '' },
            { lessonNumber: 3, title: 'Harakatlar (Fatha, Kasra, Damma)', topics: ['Unli tovushlar', 'Sukun belgisi', 'O\'qish amaliyoti'], duration: '40 daqiqa', videoUrl: '' },
            { lessonNumber: 4, title: 'Oddiy so\'zlar', topics: ['100 ta asosiy so\'z', 'Kundalik lug\'at', 'Talaffuz mashqi'], duration: '55 daqiqa', videoUrl: '' },
            { lessonNumber: 5, title: 'Tanishuv va salomlashuv', topics: ['Assalamu alaykum', 'Ismim...', 'Oddiy suhbat'], duration: '45 daqiqa', videoUrl: '' },
            { lessonNumber: 6, title: 'Sonlar (1-100)', topics: ['Asosiy sonlar', 'Sanash usullari', 'Amaliy mashqlar'], duration: '50 daqiqa', videoUrl: '' },
            { lessonNumber: 7, title: 'Kundalik iboralar', topics: ['Shukran, Min fadlika', 'Na\'am/La', 'Iltimos so\'zlari'], duration: '40 daqiqa', videoUrl: '' },
            { lessonNumber: 8, title: 'Ranglar va shakllar', topics: ['Asosiy ranglar', 'Geometrik shakllar', 'Tavsif qilish'], duration: '45 daqiqa', videoUrl: '' },
            { lessonNumber: 9, title: 'Oila a\'zolari', topics: ['Ab, Umm, Ibn', 'Qarindoshlar', 'Oila haqida gap'], duration: '50 daqiqa', videoUrl: '' },
            { lessonNumber: 10, title: 'Uy va buyumlar', topics: ['Xona nomlari', 'Oshxona buyumlari', 'Uy-ro\'zg\'or'], duration: '55 daqiqa', videoUrl: '' },
            { lessonNumber: 11, title: 'Vaqt va kun', topics: ['Soat', 'Haftaning kunlari', 'Yil oyлари'], duration: '45 daqiqa', videoUrl: '' },
            { lessonNumber: 12, title: 'A1 imtihonga tayyorgarlik', topics: ['Umumiy takrorlash', 'Mock testlar', 'Mashqlar'], duration: '60 daqiqa', videoUrl: '' }
        ]
    },
    {
        id: 'A2',
        title: 'A2 - Elementar',
        description: 'Oddiy gaplar tuzish va kundalik muloqot',
        color: 'from-green-500 via-emerald-600 to-teal-600',
        icon: '🌿',
        order: 2,
        lessons: [
            { lessonNumber: 1, title: 'Oddiy gaplar tuzish', topics: ['Fe\'l + Ot', 'Gap tartibi', 'Misollar'], duration: '50 daqiqa', videoUrl: '' },
            { lessonNumber: 2, title: 'Hozirgi zamon', topics: ['Fe\'l shakllari', 'Mudorriy zamon', 'Amaliyot'], duration: '55 daqiqa', videoUrl: '' },
            { lessonNumber: 3, title: 'O\'tmish zamon', topics: ['Mozi zamoni', 'Fe\'l o\'zgarishi', 'Mashqlar'], duration: '50 daqiqa', videoUrl: '' },
            { lessonNumber: 4, title: 'Savol berish', topics: ['Man? Ma? Ayna?', 'Savol so\'zlari', 'Dialog tuzish'], duration: '45 daqiqa', videoUrl: '' },
            { lessonNumber: 5, title: 'Bozorda xarid qilish', topics: ['Narx so\'rash', 'Savdo-sotiq', 'Muloqot'], duration: '50 daqiqa', videoUrl: '' },
            { lessonNumber: 6, title: 'Taom va ichimliklar', topics: ['Menyu', 'Restoran', 'Buyurtma berish'], duration: '55 daqiqa', videoUrl: '' },
            { lessonNumber: 7, title: 'Shahar va yo\'nalishlar', topics: ['Qaerda?', 'Qanday borish?', 'Transport'], duration: '50 daqiqa', videoUrl: '' },
            { lessonNumber: 8, title: 'Mashg\'ulotlar va hobbi', topics: ['Qiziqishlar', 'Sport turlari', 'Erkin vaqt'], duration: '45 daqiqa', videoUrl: '' },
            { lessonNumber: 9, title: 'Ob-havo', topics: ['Fasllar', 'Iqlim', 'Havo tavsifi'], duration: '40 daqiqa', videoUrl: '' },
            { lessonNumber: 10, title: 'Sog\'liq va shifokorlar', topics: ['Bemor', 'Kasalxona', 'Dori-darmonlar'], duration: '50 daqiqa', videoUrl: '' },
            { lessonNumber: 11, title: 'Sayohat rejalashtirish', topics: ['Safar', 'Mehmonxona', 'Chipta olish'], duration: '55 daqiqa', videoUrl: '' },
            { lessonNumber: 12, title: 'Telefondan gaplashish', topics: ['Allo', 'Xabar qoldirish', 'Dialog'], duration: '45 daqiqa', videoUrl: '' },
            { lessonNumber: 13, title: 'Taklif va maslahat', topics: ['Keling...', 'Tavsiya berish', 'Fikr bildirish'], duration: '50 daqiqa', videoUrl: '' },
            { lessonNumber: 14, title: 'Tabiat va hayvonot', topics: ['Daraxt', 'Daryo', 'Hayvonlar dunyosi'], duration: '45 daqiqa', videoUrl: '' },
            { lessonNumber: 15, title: 'A2 imtihonga tayyorgarlik', topics: ['Umumiy takror', 'Test ishlash', 'Baholash'], duration: '60 daqiqa', videoUrl: '' }
        ]
    },
    {
        id: 'B1',
        title: 'B1 - O\'rta daraja',
        description: 'Mustaqil muloqot va matnlarni tushunish',
        color: 'from-yellow-500 via-amber-600 to-orange-600',
        icon: '🔥',
        order: 3,
        lessons: [
            { lessonNumber: 1, title: 'Grammatika asoslari', topics: ['I\'rob', 'Marfu\'', 'Mansub va Majrur'], duration: '60 daqiqa' },
            { lessonNumber: 2, title: 'Murakkab gaplar', topics: ['Jumlat ismiyya', 'Jumlat fi\'liyya', 'Gap tuzilmasi'], duration: '55 daqiqa' },
            { lessonNumber: 3, title: 'Kelajak zamon va niyat', topics: ['Sawfa va Sa-', 'Rejalar', 'Istaklar'], duration: '50 daqiqa' }
        ]
    },
    {
        id: 'B2',
        title: 'B2 - Yuqori o\'rta',
        description: 'Professional muloqot va murakkab matnlar',
        color: 'from-purple-500 via-violet-600 to-purple-700',
        icon: '💎',
        order: 4,
        lessons: []
    },
    {
        id: 'C1',
        title: 'C1 - Ilg\'or',
        description: 'Mukammal til bilimi va akademik mahorat',
        color: 'from-red-500 via-rose-600 to-pink-600',
        icon: '🏆',
        order: 5,
        lessons: []
    },
    {
        id: 'C2',
        title: 'C2 - Mohir',
        description: 'Ona tilida so\'zlashadigan darajada',
        color: 'from-pink-500 via-fuchsia-600 to-purple-700',
        icon: '👑',
        order: 6,
        lessons: []
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected for seeding');

        // Clear existing
        await Level.deleteMany({});
        await Lesson.deleteMany({});
        console.log('Cleared existing levels and lessons');

        for (const levelData of levelsData) {
            const lessonsToAdd = levelData.lessons || [];
            const lessonIds = [];

            for (const lesson of lessonsToAdd) {
                const newLesson = new Lesson({
                    levelId: levelData.id,
                    lessonNumber: lesson.lessonNumber,
                    title: lesson.title,
                    topics: lesson.topics,
                    duration: lesson.duration,
                    videoUrl: lesson.videoUrl || ''
                });
                const savedLesson = await newLesson.save();
                lessonIds.push(savedLesson._id);
            }

            const newLevel = new Level({
                id: levelData.id,
                title: levelData.title,
                description: levelData.description,
                color: levelData.color,
                icon: levelData.icon,
                order: levelData.order,
                lessons: lessonIds
            });

            await newLevel.save();
            console.log(`Created level: ${levelData.id}`);
        }

        console.log('Seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

export const levelsData = [
    // ... (same data)
];

export const seedDB = async () => {
    try {
        if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(process.env.MONGODB_URI);
            console.log('MongoDB connected for seeding');
        }

        // Clear existing
        await Level.deleteMany({});
        await Lesson.deleteMany({});
        console.log('Cleared existing levels and lessons');

        for (const levelData of levelsData) {
            // Re-create lessons array structure for the loop
            const lessonsData = [
                {
                    id: 'A1', lessons: [
                        { lessonNumber: 1, title: 'Arab alifbosi - 1 qism', topics: ['Harflar: أ ب ت ث', 'Talaffuz asoslari', 'Yozish texnikasi'], duration: '45 daqiqa', videoUrl: '' },
                        { lessonNumber: 2, title: 'Arab alifbosi - 2 qism', topics: ['Harflar: ج ح خ د', 'Tovush farqlari', 'Amaliy mashqlar'], duration: '50 daqiqa', videoUrl: '' },
                        { lessonNumber: 3, title: 'Harakatlar (Fatha, Kasra, Damma)', topics: ['Unli tovushlar', 'Sukun belgisi', 'O\'qish amaliyoti'], duration: '40 daqiqa', videoUrl: '' },
                        { lessonNumber: 4, title: 'Oddiy so\'zlar', topics: ['100 ta asosiy so\'z', 'Kundalik lug\'at', 'Talaffuz mashqi'], duration: '55 daqiqa', videoUrl: '' },
                        { lessonNumber: 5, title: 'Tanishuv va salomlashuv', topics: ['Assalamu alaykum', 'Ismim...', 'Oddiy suhbat'], duration: '45 daqiqa', videoUrl: '' },
                        { lessonNumber: 6, title: 'Sonlar (1-100)', topics: ['Asosiy sonlar', 'Sanash usullari', 'Amaliy mashqlar'], duration: '50 daqiqa', videoUrl: '' },
                        { lessonNumber: 7, title: 'Kundalik iboralar', topics: ['Shukran, Min fadlika', 'Na\'am/La', 'Iltimos so\'zlari'], duration: '40 daqiqa', videoUrl: '' },
                        { lessonNumber: 8, title: 'Ranglar va shakllar', topics: ['Asosiy ranglar', 'Geometrik shakllar', 'Tavsif qilish'], duration: '45 daqiqa', videoUrl: '' },
                        { lessonNumber: 9, title: 'Oila a\'zolari', topics: ['Ab, Umm, Ibn', 'Qarindoshlar', 'Oila haqida gap'], duration: '50 daqiqa', videoUrl: '' },
                        { lessonNumber: 10, title: 'Uy va buyumlar', topics: ['Xona nomlari', 'Oshxona buyumlari', 'Uy-ro\'zg\'or'], duration: '55 daqiqa', videoUrl: '' },
                        { lessonNumber: 11, title: 'Vaqt va kun', topics: ['Soat', 'Haftaning kunlari', 'Yil oyлари'], duration: '45 daqiqa', videoUrl: '' },
                        { lessonNumber: 12, title: 'A1 imtihonga tayyorgarlik', topics: ['Umumiy takrorlash', 'Mock testlar', 'Mashqlar'], duration: '60 daqiqa', videoUrl: '' }
                    ]
                },
                {
                    id: 'A2', lessons: [
                        { lessonNumber: 1, title: 'Oddiy gaplar tuzish', topics: ['Fe\'l + Ot', 'Gap tartibi', 'Misollar'], duration: '50 daqiqa', videoUrl: '' },
                        { lessonNumber: 2, title: 'Hozirgi zamon', topics: ['Fe\'l shakllari', 'Mudorriy zamon', 'Amaliyot'], duration: '55 daqiqa', videoUrl: '' },
                        { lessonNumber: 3, title: 'O\'tmish zamon', topics: ['Mozi zamoni', 'Fe\'l o\'zgarishi', 'Mashqlar'], duration: '50 daqiqa', videoUrl: '' },
                        { lessonNumber: 4, title: 'Savol berish', topics: ['Man? Ma? Ayna?', 'Savol so\'zlari', 'Dialog tuzish'], duration: '45 daqiqa', videoUrl: '' },
                        { lessonNumber: 5, title: 'Bozorda xarid qilish', topics: ['Narx so\'rash', 'Savdo-sotiq', 'Muloqot'], duration: '50 daqiqa', videoUrl: '' },
                        { lessonNumber: 6, title: 'Taom va ichimliklar', topics: ['Menyu', 'Restoran', 'Buyurtma berish'], duration: '55 daqiqa', videoUrl: '' },
                        { lessonNumber: 7, title: 'Shahar va yo\'nalishlar', topics: ['Qaerda?', 'Qanday borish?', 'Transport'], duration: '50 daqiqa', videoUrl: '' },
                        { lessonNumber: 8, title: 'Mashg\'ulotlar va hobbi', topics: ['Qiziqishlar', 'Sport turlari', 'Erkin vaqt'], duration: '45 daqiqa', videoUrl: '' },
                        { lessonNumber: 9, title: 'Ob-havo', topics: ['Fasllar', 'Iqlim', 'Havo tavsifi'], duration: '40 daqiqa', videoUrl: '' },
                        { lessonNumber: 10, title: 'Sog\'liq va shifokorlar', topics: ['Bemor', 'Kasalxona', 'Dori-darmonlar'], duration: '50 daqiqa', videoUrl: '' },
                        { lessonNumber: 11, title: 'Sayohat rejalashtirish', topics: ['Safar', 'Mehmonxona', 'Chipta olish'], duration: '55 daqiqa', videoUrl: '' },
                        { lessonNumber: 12, title: 'Telefondan gaplashish', topics: ['Allo', 'Xabar qoldirish', 'Dialog'], duration: '45 daqiqa', videoUrl: '' },
                        { lessonNumber: 13, title: 'Taklif va maslahat', topics: ['Keling...', 'Tavsiya berish', 'Fikr bildirish'], duration: '50 daqiqa', videoUrl: '' },
                        { lessonNumber: 14, title: 'Tabiat va hayvonot', topics: ['Daraxt', 'Daryo', 'Hayvonlar dunyosi'], duration: '45 daqiqa', videoUrl: '' },
                        { lessonNumber: 15, title: 'A2 imtihonga tayyorgarlik', topics: ['Umumiy takror', 'Test ishlash', 'Baholash'], duration: '60 daqiqa', videoUrl: '' }
                    ]
                },
                {
                    id: 'B1', lessons: [
                        { lessonNumber: 1, title: 'Grammatika asoslari', topics: ['I\'rob', 'Marfu\'', 'Mansub va Majrur'], duration: '60 daqiqa' },
                        { lessonNumber: 2, title: 'Murakkab gaplar', topics: ['Jumlat ismiyya', 'Jumlat fi\'liyya', 'Gap tuzilmasi'], duration: '55 daqiqa' },
                        { lessonNumber: 3, title: 'Kelajak zamon va niyat', topics: ['Sawfa va Sa-', 'Rejalar', 'Istaklar'], duration: '50 daqiqa' }
                    ]
                }
            ];

            const currentLevelLessonsData = lessonsData.find(l => l.id === levelData.id)?.lessons || [];

            const lessonIds = [];

            for (const lesson of currentLevelLessonsData) {
                const newLesson = new Lesson({
                    levelId: levelData.id,
                    lessonNumber: lesson.lessonNumber,
                    title: lesson.title,
                    topics: lesson.topics,
                    duration: lesson.duration,
                    videoUrl: lesson.videoUrl || ''
                });
                const savedLesson = await newLesson.save();
                lessonIds.push(savedLesson._id);
            }

            const newLevel = new Level({
                id: levelData.id,
                title: levelData.title,
                description: levelData.description,
                color: levelData.color,
                icon: levelData.icon,
                order: levelData.order,
                lessons: lessonIds
            });

            await newLevel.save();
            console.log(`Created level: ${levelData.id}`);
        }

        console.log('Seeding completed successfully');
    } catch (error) {
        console.error('Seeding error:', error);
        throw error;
    }
};

// Only run if executed directly
if (process.argv[1] === import.meta.filename) {
    seedDB().then(() => process.exit(0)).catch(() => process.exit(1));
}
