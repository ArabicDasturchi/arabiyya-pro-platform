import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Level from './models/Level.js';
import Lesson from './models/Lesson.js';

dotenv.config();

export const levelsData = [
    {
        id: 'A1',
        title: "Boshlang'ich",
        description: "Arab alifbosi va oddiy so'zlashuvlarni o'rganing. Bu daraja arab tilini noldan boshlovchilar uchun mo'ljallangan.",
        color: "from-green-500 to-teal-500",
        icon: "🌱",
        order: 1
    },
    {
        id: 'A2',
        title: "O'rta-Boshlang'ich",
        description: "Kundalik mavzularda gaplasha olish ko'nikmasi. Oddiy grammatik qoidalarni tushunish va qo'llash.",
        color: "from-teal-500 to-blue-500",
        icon: "🌿",
        order: 2
    },
    {
        id: 'B1',
        title: "O'rta",
        description: "O'z fikrini erkin bayon qilish va murakkabroq matnlarni tushunish. Sayohat va ish faoliyatida muloqot qilish.",
        color: "from-blue-500 to-indigo-500",
        icon: "🌳",
        order: 3
    },
    {
        id: 'B2',
        title: "Yuqori-O'rta",
        description: "Murakkab mavzularda bahs yurita olish. Ijtimoiy va siyosiy mavzulardagi matnlarni tahlil qilish.",
        color: "from-indigo-500 to-purple-500",
        icon: "🌺",
        order: 4
    },
    {
        id: 'C1',
        title: "Ilg'or",
        description: "Professional darajada muloqot. Ilmiy va badiiy adabiyotlarni o'qish va tushunish.",
        color: "from-purple-500 to-pink-500",
        icon: "🌟",
        order: 5
    },
    {
        id: 'C2',
        title: "Professional",
        description: "Ona tilidek erkin va aniq so'zlashish. Har qanday murakkablikdagi matn va nutqni to'liq tushunish.",
        color: "from-pink-500 to-rose-500",
        icon: "👑",
        order: 6
    }
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

        const lessonsData = [
            {
                id: 'A1', lessons: [
                    { lessonNumber: 1, title: 'Arab alifbosi - 1 qism', topics: ['Harflar: أ ب ت ث', 'Talaffuz asoslari', 'Yozish texnikasi'], duration: '45 daqiqa' },
                    { lessonNumber: 2, title: 'Arab alifbosi - 2 qism', topics: ['Harflar: ج ح خ د', 'Tovush farqlari', 'Amaliy mashqlar'], duration: '50 daqiqa' },
                    { lessonNumber: 3, title: 'Harakatlar (Fatha, Kasra, Damma)', topics: ['Unli tovushlar', 'Sukun belgisi', 'O\'qish amaliyoti'], duration: '40 daqiqa' },
                    { lessonNumber: 4, title: 'Oddiy so\'zlar', topics: ['100 ta asosiy so\'z', 'Kundalik lug\'at', 'Talaffuz mashqi'], duration: '55 daqiqa' },
                    { lessonNumber: 5, title: 'Tanishuv va salomlashuv', topics: ['Assalamu alaykum', 'Ismim...', 'Oddiy suhbat'], duration: '45 daqiqa' },
                    { lessonNumber: 6, title: 'Sonlar (1-100)', topics: ['Asosiy sonlar', 'Sanash usullari', 'Amaliy mashqlar'], duration: '50 daqiqa' },
                    { lessonNumber: 7, title: 'Kundalik iboralar', topics: ['Shukran, Min fadlika', 'Na\'am/La', 'Iltimos so\'zlari'], duration: '40 daqiqa' },
                    { lessonNumber: 8, title: 'Ranglar va shakllar', topics: ['Asosiy ranglar', 'Geometrik shakllar', 'Tavsif qilish'], duration: '45 daqiqa' },
                    { lessonNumber: 9, title: 'Oila a\'zolari', topics: ['Ab, Umm, Ibn', 'Qarindoshlar', 'Oila haqida gap'], duration: '50 daqiqa' },
                    { lessonNumber: 10, title: 'Uy va buyumlar', topics: ['Xona nomlari', 'Oshxona buyumlari', 'Uy-ro\'zg\'or'], duration: '55 daqiqa' },
                    { lessonNumber: 11, title: 'Vaqt va kun', topics: ['Soat', 'Haftaning kunlari', 'Yil oyлари'], duration: '45 daqiqa' },
                    { lessonNumber: 12, title: 'A1 imtihonga tayyorgarlik', topics: ['Umumiy takrorlash', 'Mock testlar', 'Mashqlar'], duration: '60 daqiqa' }
                ]
            },
            {
                id: 'A2', lessons: [
                    { lessonNumber: 1, title: 'Oddiy gaplar tuzish', topics: ['Fe\'l + Ot', 'Gap tartibi', 'Misollar'], duration: '50 daqiqa' },
                    { lessonNumber: 2, title: 'Hozirgi zamon', topics: ['Fe\'l shakllari', 'Mudorriy zamon', 'Amaliyot'], duration: '55 daqiqa' },
                    { lessonNumber: 3, title: 'O\'tmish zamon', topics: ['Mozi zamoni', 'Fe\'l o\'zgarishi', 'Mashqlar'], duration: '50 daqiqa' },
                    { lessonNumber: 4, title: 'Savol berish', topics: ['Man? Ma? Ayna?', 'Savol so\'zlari', 'Dialog tuzish'], duration: '45 daqiqa' },
                    { lessonNumber: 5, title: 'Bozorda xarid qilish', topics: ['Narx so\'rash', 'Savdo-sotiq', 'Muloqot'], duration: '50 daqiqa' },
                    { lessonNumber: 6, title: 'Taom va ichimliklar', topics: ['Menyu', 'Restoran', 'Buyurtma berish'], duration: '55 daqiqa' },
                    { lessonNumber: 7, title: 'Shahar va yo\'nalishlar', topics: ['Qaerda?', 'Qanday borish?', 'Transport'], duration: '50 daqiqa' },
                    { lessonNumber: 8, title: 'Mashg\'ulotlar va hobbi', topics: ['Qiziqishlar', 'Sport turlari', 'Erkin vaqt'], duration: '45 daqiqa' },
                    { lessonNumber: 9, title: 'Ob-havo', topics: ['Fasllar', 'Iqlim', 'Havo tavsifi'], duration: '40 daqiqa' },
                    { lessonNumber: 10, title: 'Sog\'liq va shifokorlar', topics: ['Bemor', 'Kasalxona', 'Dori-darmonlar'], duration: '50 daqiqa' },
                    { lessonNumber: 11, title: 'Sayohat rejalashtirish', topics: ['Safar', 'Mehmonxona', 'Chipta olish'], duration: '55 daqiqa' },
                    { lessonNumber: 12, title: 'Telefondan gaplashish', topics: ['Allo', 'Xabar qoldirish', 'Dialog'], duration: '45 daqiqa' },
                    { lessonNumber: 13, title: 'Taklif va maslahat', topics: ['Keling...', 'Tavsiya berish', 'Fikr bildirish'], duration: '50 daqiqa' },
                    { lessonNumber: 14, title: 'Tabiat va hayvonot', topics: ['Daraxt', 'Daryo', 'Hayvonlar dunyosi'], duration: '45 daqiqa' },
                    { lessonNumber: 15, title: 'A2 imtihonga tayyorgarlik', topics: ['Umumiy takror', 'Test ishlash', 'Baholash'], duration: '60 daqiqa' }
                ]
            },
            {
                id: 'B1', lessons: [
                    { lessonNumber: 1, title: 'Grammatika asoslari', topics: ['I\'rob', 'Marfu\'', 'Mansub va Majrur'], duration: '60 daqiqa' },
                    { lessonNumber: 2, title: 'Murakkab gaplar', topics: ['Jumlat ismiyya', 'Jumlat fi\'liyya', 'Gap tuzilmasi'], duration: '55 daqiqa' },
                    { lessonNumber: 3, title: 'Kelajak zamon va niyat', topics: ['Sawfa va Sa-', 'Rejalar', 'Istaklar'], duration: '50 daqiqa' },
                    { lessonNumber: 4, title: 'Munosabat bildirish', topics: ['Rozilik/Norozilik', 'Fikrlar', 'Debat asoslari'], duration: '55 daqiqa' },
                    { lessonNumber: 5, title: 'Ish va kasb', topics: ['Intervyu', 'CV yozish', 'Professional lug\'at'], duration: '50 daqiqa' },
                    { lessonNumber: 6, title: 'Ommaviy axborot vositalari', topics: ['Yangiliklar', 'Maqolalar', 'Radio'], duration: '45 daqiqa' },
                    { lessonNumber: 7, title: 'Madaniyat va urf-odatlar', topics: ['Bayramlar', 'An\'analar', 'Mehmondo\'stlik'], duration: '50 daqiqa' },
                    { lessonNumber: 8, title: 'B1 imtihonga tayyorgarlik', topics: ['Insho yozish', 'Tinglab tushunish', 'Suhbat'], duration: '60 daqiqa' }
                ]
            },
            {
                id: 'B2', lessons: [
                    { lessonNumber: 1, title: 'Ilg\'or Grammatika', topics: ['Istisno', 'Hol', 'Tamyiz'], duration: '60 daqiqa' },
                    { lessonNumber: 2, title: 'Balog\'at ilmi kirish', topics: ['Tashbeh', 'Majoz', 'Kinoya'], duration: '55 daqiqa' },
                    { lessonNumber: 3, title: 'Rasmiy yozishmalar', topics: ['Ariza', 'Rasmiy xat', 'Email odobi'], duration: '50 daqiqa' },
                    { lessonNumber: 4, title: 'Siyosiy va ijtimoiy mavzular', topics: ['Yangiliklar tahlili', 'Debatlar', 'Nutq so\'zlash'], duration: '55 daqiqa' },
                    { lessonNumber: 5, title: 'Adabiy matnlar', topics: ['Hikoyalar', 'She\'riyat', 'Nasr'], duration: '50 daqiqa' },
                    { lessonNumber: 6, title: 'Tarjima asoslari', topics: ['Matn tarjimasi', 'Sinxron tarjima', 'Atamalar'], duration: '60 daqiqa' }
                ]
            },
            {
                id: 'C1', lessons: [
                    { lessonNumber: 1, title: 'Klassik Arab tili', topics: ['Qadimgi matnlar', 'She\'riy vaznlar', 'Tarixiy uslub'], duration: '65 daqiqa' },
                    { lessonNumber: 2, title: 'Ilmiy uslub', topics: ['Maqola yozish', 'Tadqiqot', 'Terminologiya'], duration: '60 daqiqa' },
                    { lessonNumber: 3, title: 'Qur\'oni Karim uslubi', topics: ['Oyatlar tahlili', 'Tafsir asoslari', 'Balog\'at cho\'qqisi'], duration: '70 daqiqa' },
                    { lessonNumber: 4, title: 'Professional notiqlik', topics: ['Xutba', 'Taqdimot', 'Auditoriya bilan ishlash'], duration: '60 daqiqa' }
                ]
            },
            {
                id: 'C2', lessons: [
                    { lessonNumber: 1, title: 'Arab filologiyasi', topics: ['Til tarixi', 'Lahjalar', 'Zamonaviy tendensiyalar'], duration: '75 daqiqa' },
                    { lessonNumber: 2, title: 'Adabiy tanqid', topics: ['Asar tahlili', 'Yozuvchi uslubi', 'Janrlar'], duration: '70 daqiqa' },
                    { lessonNumber: 3, title: 'Global muloqot', topics: ['Xalqaro aloqalar', 'Diplomatiya', 'Muzokaralar'], duration: '65 daqiqa' },
                    { lessonNumber: 4, title: 'C2 Sertifikatsiyasi', topics: ['Yakuniy imtihon', 'Dissertatsiya', 'Himoya'], duration: '90 daqiqa' }
                ]
            }
        ];

        for (const levelData of levelsData) {
            // Find lessons for this level
            const levelFound = lessonsData.find(l => l.id === levelData.id);
            const levelSpecificLessons = levelFound ? levelFound.lessons : [];

            const lessonIds = [];

            for (const lesson of levelSpecificLessons) {
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
