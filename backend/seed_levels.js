import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Level from './models/Level.js';
import Lesson from './models/Lesson.js';

dotenv.config();

export const levelsData = [
    {
        id: 'ALPHABET',
        title: "Arab Harflari",
        description: "Arab tilini noldan o'rganuvchilar uchun maxsus bo'lim. Harflar, talaffuz va yozish qoidalarini mukammal o'rganing.",
        color: "from-amber-500 to-orange-600",
        icon: "ا ب ت",
        order: 0
    },
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
            // ALPHABET: 3 modul (15 dars) + 1 Exam Modul (Lesson 16)
            {
                id: 'ALPHABET', lessons: [
                    // Modul 1
                    { lessonNumber: 1, title: 'Dars 1: Alif harfi', topics: ['Alif shakli', 'Talaffuz', 'Yozish'], duration: '30 daqiqa' },
                    { lessonNumber: 2, title: 'Dars 2: Ba harfi', topics: ['Ba shakli', 'Maxraj', 'Mashq'], duration: '30 daqiqa' },
                    { lessonNumber: 3, title: 'Dars 3: Ta harfi', topics: ['Ta shakli', 'Farqlar', 'Amaliyot'], duration: '30 daqiqa' },
                    { lessonNumber: 4, title: 'Dars 4: Sa harfi', topics: ['Sa shakli', 'Uyg\'a vazifa', 'Takrorlash'], duration: '30 daqiqa' },
                    { lessonNumber: 5, title: 'Dars 5: Jim harfi', topics: ['Jim shakli', 'Talaffuz', 'Test'], duration: '30 daqiqa' },
                    // Modul 2
                    { lessonNumber: 6, title: 'Dars 6: Ha harfi', topics: ['Ha shakli', 'Yozuv', 'Mashq'], duration: '30 daqiqa' },
                    { lessonNumber: 7, title: 'Dars 7: Xo harfi', topics: ['Xo shakli', 'Tovush', 'Amaliyot'], duration: '30 daqiqa' },
                    { lessonNumber: 8, title: 'Dars 8: Dal harfi', topics: ['Dal shakli', 'Talaffuz', 'Yozish'], duration: '30 daqiqa' },
                    { lessonNumber: 9, title: 'Dars 9: Zal harfi', topics: ['Zal shakli', 'Farqlar', 'Mashq'], duration: '30 daqiqa' },
                    { lessonNumber: 10, title: 'Dars 10: Ro harfi', topics: ['Ro shakli', 'Uyg\'a vazifa', 'Test'], duration: '30 daqiqa' },
                    // Modul 3
                    { lessonNumber: 11, title: 'Dars 11: Za harfi', topics: ['Za shakli', 'Talaffuz', 'Yozish'], duration: '30 daqiqa' },
                    { lessonNumber: 12, title: 'Dars 12: Sin harfi', topics: ['Sin shakli', 'Maxraj', 'Mashq'], duration: '30 daqiqa' },
                    { lessonNumber: 13, title: 'Dars 13: Shin harfi', topics: ['Shin shakli', 'Tovush', 'Amaliyot'], duration: '30 daqiqa' },
                    { lessonNumber: 14, title: 'Dars 14: Sod harfi', topics: ['Sod shakli', 'Yozuv', 'Takror'], duration: '30 daqiqa' },
                    { lessonNumber: 15, title: 'Dars 15: Takrorlash va mustahkamlash', topics: ['Umumiy takror', 'Mashqlar', 'Suhbat'], duration: '35 daqiqa' },
                    // Modul 4 (Exam)
                    { lessonNumber: 16, title: 'Yakuniy Imtihon: Arab Harflari', topics: ['O\'qish', 'Eshitish', 'Yozish', 'Yakuniy Test'], duration: '60 daqiqa' }
                ]
            },
            // A1: 4 modul (20 dars) + 1 Exam Modul (Lesson 21)
            {
                id: 'A1', lessons: [
                    // Modul 1
                    { lessonNumber: 1, title: 'Dars 1: Tanishuv', topics: ['Salom', 'Ismim', 'Yashash joyi'], duration: '45 daqiqa' },
                    { lessonNumber: 2, title: 'Dars 2: Salomlashuv', topics: ['Assalamu alaykum', 'Kayfiyat', 'Xayrlashuv'], duration: '40 daqiqa' },
                    { lessonNumber: 3, title: 'Dars 3: Sonlar 1-10', topics: ['Asosiy sonlar', 'Sanash', 'Mashqlar'], duration: '45 daqiqa' },
                    { lessonNumber: 4, title: 'Dars 4: Oila a\'zolari', topics: ['Ota-ona', 'Aka-uka', 'Oila'], duration: '50 daqiqa' },
                    { lessonNumber: 5, title: 'Dars 5: Harakatlar', topics: ['Fatha', 'Kasra', 'Damma'], duration: '40 daqiqa' },
                    // Modul 2
                    { lessonNumber: 6, title: 'Dars 6: Ranglar', topics: ['Asosiy ranglar', 'Tavsif', 'Mashqlar'], duration: '45 daqiqa' },
                    { lessonNumber: 7, title: 'Dars 7: Uy va buyumlar', topics: ['Xonalar', 'Mebel', 'Joy'], duration: '50 daqiqa' },
                    { lessonNumber: 8, title: 'Dars 8: Sonlar 11-100', topics: ['O\'nliklar', 'Yuzliklar', 'Amaliyot'], duration: '45 daqiqa' },
                    { lessonNumber: 9, title: 'Dars 9: Kun va vaqt', topics: ['Soat', 'Haftaning kunlari', 'Yil oylari'], duration: '50 daqiqa' },
                    { lessonNumber: 10, title: 'Dars 10: Oddiy so\'zlar', topics: ['100 ta so\'z', 'Kundalik lug\'at', 'Talaffuz'], duration: '40 daqiqa' },
                    // Modul 3
                    { lessonNumber: 11, title: 'Dars 11: Kundalik iboralar', topics: ['Iltimos', 'Rahmat', 'Kechirasiz'], duration: '45 daqiqa' },
                    { lessonNumber: 12, title: 'Dars 12: Taom nomlari', topics: ['Ovqatlar', 'Ichimliklar', 'Mevalar'], duration: '50 daqiqa' },
                    { lessonNumber: 13, title: 'Dars 13: Kasb-hunар', topics: ['O\'qituvchi', 'Shifokor', 'Ishlar'], duration: '45 daqiqa' },
                    { lessonNumber: 14, title: 'Dars 14: Shakllar', topics: ['Geometriya', 'O\'lcham', 'Tavsif'], duration: '40 daqiqa' },
                    { lessonNumber: 15, title: 'Dars 15: Oylar', topics: ['12 oy', 'Fasllar', 'Sana'], duration: '45 daqiqa' },
                    // Modul 4
                    { lessonNumber: 16, title: 'Dars 16: Transport', topics: ['Avtomobil', 'Poyezd', 'Samolyot'], duration: '50 daqiqa' },
                    { lessonNumber: 17, title: 'Dars 17: Shahar', topics: ['Ko\'chalar', 'Binolar', 'Yo\'nalish'], duration: '45 daqiqa' },
                    { lessonNumber: 18, title: 'Dars 18: O\'qish va yozish', topics: ['Kitob', 'Darslik', 'Yozuv'], duration: '50 daqiqa' },
                    { lessonNumber: 19, title: 'Dars 19: Bozor', topics: ['Xarid', 'Savdo', 'Pul'], duration: '45 daqiqa' },
                    { lessonNumber: 20, title: 'Dars 20: Takrorlash', topics: ['Takrorlash', 'Savol-javob', 'Mustahkamlash'], duration: '45 daqiqa' },
                    // Modul 5 (Exam)
                    { lessonNumber: 21, title: 'Yakuniy Imtihon: A1 Boshlang\'ich', topics: ['O\'qish', 'Eshitish', 'Yozish', 'Yakuniy Test'], duration: '90 daqiqa' }
                ]
            },
            // A2: 4 modul (20 dars) + 1 Exam Modul (Lesson 21)
            {
                id: 'A2', lessons: [
                    // Modul 1
                    { lessonNumber: 1, title: 'Dars 1: Gaplar tuzish', topics: ['Fe\'l + Ot', 'Gap tartibi', 'Mashqlar'], duration: '50 daqiqa' },
                    { lessonNumber: 2, title: 'Dars 2: Hozirgi zamon', topics: ['Mudorriy', 'Fe\'l shakllari', 'Amaliyot'], duration: '55 daqiqa' },
                    { lessonNumber: 3, title: 'Dars 3: O\'tmish zamon', topics: ['Mozi', 'O\'zgarishlar', 'Misollar'], duration: '50 daqiqa' },
                    { lessonNumber: 4, title: 'Dars 4: Savol so\'zlari', topics: ['Man? Ma? Ayna?', 'Dialog', 'Suhbat'], duration: '45 daqiqa' },
                    { lessonNumber: 5, title: 'Dars 5: Bozorda xarid', topics: ['Narx', 'Savdo', 'Muloqot'], duration: '50 daqiqa' },
                    // Modul 2
                    { lessonNumber: 6, title: 'Dars 6: Taomlar', topics: ['Menyu', 'Restoran', 'Buyurtma'], duration: '55 daqiqa' },
                    { lessonNumber: 7, title: 'Dars 7: Yo\'nalishlar', topics: ['Qaerda?', 'Qanday borish?', 'Transport'], duration: '50 daqiqa' },
                    { lessonNumber: 8, title: 'Dars 8: Hobbi', topics: ['Qiziqishlar', 'Sport', 'Erkin vaqt'], duration: '45 daqiqa' },
                    { lessonNumber: 9, title: 'Dars 9: Ob-havo', topics: ['Fasllar', 'Iqlim', 'Havo'], duration: '40 daqiqa' },
                    { lessonNumber: 10, title: 'Dars 10: Sog\'liq', topics: ['Kasalxona', 'Shifokor', 'Dori'], duration: '50 daqiqa' },
                    // Modul 3
                    { lessonNumber: 11, title: 'Dars 11: Sayohat', topics: ['Safar', 'Mehmonxona', 'Chipta'], duration: '55 daqiqa' },
                    { lessonNumber: 12, title: 'Dars 12: Telefon', topics: ['Allo', 'Xabar', 'Dialog'], duration: '45 daqiqa' },
                    { lessonNumber: 13, title: 'Dars 13: Taklif', topics: ['Keling', 'Maslahat', 'Fikr'], duration: '50 daqiqa' },
                    { lessonNumber: 14, title: 'Dars 14: Tabiat', topics: ['Daraxt', 'Daryo', 'Hayvonlar'], duration: '45 daqiqa' },
                    { lessonNumber: 15, title: 'Dars 15: Maktab', topics: ['O\'qish', 'Fanlar', 'Dars'], duration: '50 daqiqa' },
                    // Modul 4
                    { lessonNumber: 16, title: 'Dars 16: Kiyim-kechak', topics: ['Libos', 'Rang', 'O\'lcham'], duration: '45 daqiqa' },
                    { lessonNumber: 17, title: 'Dars 17: Internet', topics: ['Kompyuter', 'Onlayn', 'Dasturlar'], duration: '50 daqiqa' },
                    { lessonNumber: 18, title: 'Dars 18: Kun tartibi', topics: ['Ertalab', 'Kechqurun', 'Ish rejalari'], duration: '45 daqiqa' },
                    { lessonNumber: 119, title: 'Dars 19: Bank', topics: ['Pul', 'Hisob', 'O\'tkazma'], duration: '50 daqiqa' },
                    { lessonNumber: 20, title: 'Dars 20: Takrorlash', topics: ['Takror', 'Test', 'Mustahkamlash'], duration: '50 daqiqa' },
                    // Modul 5 (Exam)
                    { lessonNumber: 21, title: 'Yakuniy Imtihon: A2 O\'rta-Boshlang\'ich', topics: ['O\'qish', 'Eshitish', 'Yozish', 'Yakuniy Test'], duration: '90 daqiqa' }
                ]
            },
            // B1: 5 modul (25 dars) + 1 Exam Modul (Lesson 26)
            {
                id: 'B1', lessons: [
                    // Modul 1
                    { lessonNumber: 1, title: 'Dars 1: Grammatika I\'rob', topics: ['Marfu\'', 'Mansub', 'Majrur'], duration: '60 daqiqa' },
                    { lessonNumber: 2, title: 'Dars 2: Murakkab gaplar', topics: ['Jumlat ismiyya', 'Fi\'liyya', 'Tuzilma'], duration: '55 daqiqa' },
                    { lessonNumber: 3, title: 'Dars 3: Kelajak zamon', topics: ['Sawfa', 'Sa-', 'Rejalar'], duration: '50 daqiqa' },
                    { lessonNumber: 4, title: 'Dars 4: Munosabat', topics: ['Rozilik', 'Norozilik', 'Fikr'], duration: '55 daqiqa' },
                    { lessonNumber: 5, title: 'Dars 5: Ish va kasb', topics: ['Intervyu', 'CV', 'Professional'], duration: '50 daqiqa' },
                    // Modul 2
                    { lessonNumber: 6, title: 'Dars 6: OAV', topics: ['Yangiliklar', 'Maqola', 'Radio'], duration: '45 daqiqa' },
                    { lessonNumber: 7, title: 'Dars 7: Madaniyat', topics: ['Bayram', 'An\'ana', 'Mehmondo\'stlik'], duration: '50 daqiqa' },
                    { lessonNumber: 8, title: 'Dars 8: Ijtimoiy mavzular', topics: ['Jamiyat', 'Muammo', 'Tahlil'], duration: '55 daqiqa' },
                    { lessonNumber: 9, title: 'Dars 9: Ta\'lim tizimi', topics: ['Universitet', 'Fan', 'Tadqiqot'], duration: '50 daqiqa' },
                    { lessonNumber: 10, title: 'Dars 10: Biznes', topics: ['Kompaniya', 'Shartnoma', 'Kelishuv'], duration: '55 daqiqa' },
                    // Modul 3
                    { lessonNumber: 11, title: 'Dars 11: Texnologiya', topics: ['Innovatsiya', 'Raqamli', 'Kelajak'], duration: '50 daqiqa' },
                    { lessonNumber: 12, title: 'Dars 12: Muvoffaqiyat', topics: ['Maqsad', 'Reja', 'Natija'], duration: '45 daqiqa' },
                    { lessonNumber: 13, title: 'Dars 13: San\'at', topics: ['Musiqa', 'Rasm', 'Adabiyot'], duration: '50 daqiqa' },
                    { lessonNumber: 14, title: 'Dars 14: Din va akhlоq', topics: ['Imon', 'Ibоdat', 'Xulq'], duration: '55 daqiqa' },
                    { lessonNumber: 15, title: 'Dars 15: Tarix', topics: ['Islom tarixi', 'Xalifa', 'Salaflar'], duration: '60 daqiqa' },
                    // Modul 4
                    { lessonNumber: 16, title: 'Dars 16: Iqtisod', topics: ['Savdo', 'Moliya', 'Bozor'], duration: '55 daqiqa' },
                    { lessonNumber: 17, title: 'Dars 17: Ekologiya', topics: ['Tabiat', 'Muhit', 'Himoya'], duration: '50 daqiqa' },
                    { lessonNumber: 18, title: 'Dars 18: Fan', topics: ['Kashfiyot', 'Teknologiya', 'Rivojlanish'], duration: '55 daqiqa' },
                    { lessonNumber: 19, title: 'Dars 19: Sport', topics: ['O\'yinlar', 'Musobaqa', 'Salomatlik'], duration: '45 daqiqa' },
                    { lessonNumber: 20, title: 'Dars 20: Globalizatsiya', topics: ['Dunyo', 'Aloqa', 'Integratsiya'], duration: '50 daqiqa' },
                    // Modul 5
                    { lessonNumber: 21, title: 'Dars 21: Psixologiya', topics: ['Ruhiyat', 'Xatti-harakat', 'Muloqot'], duration: '55 daqiqa' },
                    { lessonNumber: 22, title: 'Dars 22: Adabiyot', topics: ['She\'riyat', 'Nasr', 'Tanqid'], duration: '50 daqiqa' },
                    { lessonNumber: 23, title: 'Dars 23: Siyosat', topics: ['Davlat', 'Huquq', 'Siyosy'], duration: '55 daqiqa' },
                    { lessonNumber: 24, title: 'Dars 24: Tadbirkorlik', topics: ['Startup', 'Loyiha', 'Marketing'], duration: '50 daqiqa' },
                    { lessonNumber: 25, title: 'Dars 25: Takrorlash va Tahlil', topics: ['Umumiy takror', 'Suhbat', 'Tahlil'], duration: '60 daqiqa' },
                    // Modul 6 (Exam)
                    { lessonNumber: 26, title: 'Yakuniy Imtihon: B1 O\'rta', topics: ['O\'qish', 'Eshitish', 'Yozish', 'Yakuniy Test'], duration: '120 daqiqa' }
                ]
            },
            // B2: 5 modul (25 dars) + 1 Exam Modul (Lesson 26)
            {
                id: 'B2', lessons: [
                    // Modul 1
                    { lessonNumber: 1, title: 'Dars 1: Ilg\'or Grammatika', topics: ['Istisno', 'Hol', 'Tamyiz'], duration: '60 daqiqa' },
                    { lessonNumber: 2, title: 'Dars 2: Balog\'at Tashbeh', topics: ['Tashbeh', 'O\'xshatish', 'Amaliyot'], duration: '55 daqiqa' },
                    { lessonNumber: 3, title: 'Dars 3: Balog\'at Majoz', topics: ['Majoz', 'Kinoya', 'Misol'], duration: '60 daqiqa' },
                    { lessonNumber: 4, title: 'Dars 4: Rasmiy xat', topics: ['Ariza', 'Email', 'Odob'], duration: '50 daqiqa' },
                    { lessonNumber: 5, title: 'Dars 5: Siyosiy tahlil', topics: ['Yangilik', 'Debat', 'Nutq'], duration: '55 daqiqa' },
                    // Modul 2
                    { lessonNumber: 6, title: 'Dars 6: Adabiy hikoya', topics: ['Hikoya', 'Syujet', 'Tahlil'], duration: '50 daqiqa' },
                    { lessonNumber: 7, title: 'Dars 7: She\'riyat', topics: ['Qasida', 'G\'azal', 'Vazn'], duration: '60 daqiqa' },
                    { lessonNumber: 8, title: 'Dars 8: Tarjima', topics: ['Matn tarjimasi', 'Sinxron', 'Atama'], duration: '55 daqiqa' },
                    { lessonNumber: 9, title: 'Dars 9: Ilmiy maqola', topics: ['Tadqiqot', 'Tuzilma', 'Nashr'], duration: '60 daqiqa' },
                    { lessonNumber: 10, title: 'Dars 10: Muhokama', topics: ['Bahs', 'Dalil', 'Xulosa'], duration: '50 daqiqa' },
                    // Modul 3
                    { lessonNumber: 11, title: 'Dars 11: Falsafa', topics: ['Mantiq', 'Tafakkur', 'Ilm'], duration: '55 daqiqa' },
                    { lessonNumber: 12, title: 'Dars 12: Huquq', topics: ['Qonun', 'Shariya', 'Fiqh'], duration: '60 daqiqa' },
                    { lessonNumber: 13, title: 'Dars 13: Iqtisodiy tahlil', topics: ['Statistika', 'Grafik', 'Prognoz'], duration: '55 daqiqa' },
                    { lessonNumber: 14, title: 'Dars 14: Media', topics: ['Jurnalistika', 'Telekanal', 'Internet'], duration: '50 daqiqa' },
                    { lessonNumber: 15, title: 'Dars 15: Xalqaro aloqalar', topics: ['Diplomatiya', 'Konferensiya', 'Protokol'], duration: '55 daqiqa' },
                    // Modul 4
                    { lessonNumber: 16, title: 'Dars 16: Professional lug\'at', topics: ['Texnik atamalar', 'Jargon', 'Sohaviy til'], duration: '50 daqiqa' },
                    { lessonNumber: 17, title: 'Dars 17: Prezentatsiya', topics: ['Taqdimot', 'PowerPoint', 'Auditoriya'], duration: '55 daqiqa' },
                    { lessonNumber: 18, title: 'Dars 18: Muzokaralar', topics: ['Kelishuv', 'Kompromiss', 'Strategiya'], duration: '60 daqiqa' },
                    { lessonNumber: 19, title: 'Dars 19: Korporativ kommunikatsiya', topics: ['Email', 'Yig\'ilish', 'Hisobot'], duration: '50 daqiqa' },
                    { lessonNumber: 20, title: 'Dars 20: Axborot texnologiyalari', topics: ['IT', 'Dasturlash', 'Sun\'iy intellekt'], duration: '55 daqiqa' },
                    // Modul 5
                    { lessonNumber: 21, title: 'Dars 21: Tibbiyot', topics: ['Anatomiya', 'O\'simliklar dorilar', 'Tib'], duration: '50 daqiqa' },
                    { lessonNumber: 22, title: 'Dars 22: Muhandislik', topics: ['Arxitektura', 'Qurilish', 'Loyiha'], duration: '55 daqiqa' },
                    { lessonNumber: 23, title: 'Dars 23: Tabiiy fanlar', topics: ['Fizika', 'Kimyo', 'Biologiya'], duration: '60 daqiqa' },
                    { lessonNumber: 24, title: 'Dars 24: Ijtimoiy fanlar', topics: ['Sotsiologiya', 'Antropologiya', 'Tarix'], duration: '55 daqiqa' },
                    { lessonNumber: 25, title: 'Dars 25: Dissertatsiya Tahlili', topics: ['Dissertatsiya', 'Himoya', 'Sertifikat'], duration: '60 daqiqa' },
                    // Modul 6 (Exam)
                    { lessonNumber: 26, title: 'Yakuniy Imtihon: B2 Yuqori-O\'rta', topics: ['O\'qish', 'Eshitish', 'Yozish', 'Yakuniy Test'], duration: '120 daqiqa' }
                ]
            },
            // C1: 6 modul (30 dars) + 1 Exam Modul (Lesson 31)
            {
                id: 'C1', lessons: [
                    // Modul 1
                    { lessonNumber: 1, title: 'Dars 1: Klassik Arab adabiyoti', topics: ['Jahiliyat davri', 'Muallaqot', 'Tahlil'], duration: '65 daqiqa' },
                    { lessonNumber: 2, title: 'Dars 2: Qur\'on uslubi', topics: ['I\'joz', 'Balog\'at', 'Tafsir'], duration: '70 daqiqa' },
                    { lessonNumber: 3, title: 'Dars 3: Hadis ta\'limlari', topics: ['Sanad', 'Matn', 'Ravi'], duration: '65 daqiqa' },
                    { lessonNumber: 4, title: 'Dars 4: Fiqh asoslari', topics: ['Usul', 'Hukm', 'Dalil'], duration: '60 daqiqa' },
                    { lessonNumber: 5, title: 'Dars 5: Aqida', topics: ['Tawhid', 'Inson', 'Ohirat'], duration: '65 daqiqa' },
                    // Modul 2
                    { lessonNumber: 6, title: 'Dars 6: Tasavvuf', topics: ['Zikr', 'Nafs', 'Suluk'], duration: '60 daqiqa' },
                    { lessonNumber: 7, title: 'Dars 7: Arab she\'riyati', topics: ['Vazn', 'Qofiya', 'Janr'], duration: '70 daqiqa' },
                    { lessonNumber: 8, title: 'Dars 8: Nasr san\'ati', topics: ['Maqoma', 'Risola', 'Uslub'], duration: '65 daqiqa' },
                    { lessonNumber: 9, title: 'Dars 9: Tarix manbalari', topics: ['Xronologiya', 'Manbashуnoslik', 'Tahlil'], duration: '60 daqiqa' },
                    { lessonNumber: 10, title: 'Dars 10: Geografiya', topics: ['Islom mamlakatlari', 'Jug\'rofiya', 'Sayyohlik'], duration: '55 daqiqa' },
                    // Modul 3
                    { lessonNumber: 11, title: 'Dars 11: Ilmiy metodologiya', topics: ['Tadqiqot', 'Gipoteza', 'Natija'], duration: '70 daqiqa' },
                    { lessonNumber: 12, title: 'Dars 12: Akademik yozuv', topics: ['Dissertatsiya', 'Tuzilma', 'Manba'], duration: '65 daqiqa' },
                    { lessonNumber: 13, title: 'Dars 13: Tanqid', topics: ['Tahlil', 'Baholash', 'Mulohaza'], duration: '60 daqiqa' },
                    { lessonNumber: 14, title: 'Dars 14: Xutba', topics: ['Public speaking', 'Nutq', 'Ta\'sir'], duration: '65 daqiqa' },
                    { lessonNumber: 15, title: 'Dars 15: Debat va munozara', topics: ['Bahs texnikasi', 'Mantiq', 'Strategiya'], duration: '60 daqiqa' },
                    // Modul 4
                    { lessonNumber: 16, title: 'Dars 16: Sarf ilmi chuqurligi', topics: ['Mizo\`n', 'Ishtiqоq', 'I\'lol'], duration: '70 daqiqa' },
                    { lessonNumber: 17, title: 'Dars 17: Nahv ilmi chuqurligi', topics: ['I\'rob', 'Taqdim-ta\'xir', 'Mahzuf'], duration: '65 daqiqa' },
                    { lessonNumber: 18, title: 'Dars 18: Balog\'at cho\'qqisi', topics: ['Ma\'oniy', 'Bayan', 'Badi\''], duration: '70 daqiqa' },
                    { lessonNumber: 19, title: 'Dars 19: Aruz ilmi', topics: ['She\'riy vaznlar', 'Bahr', 'Qofiya'], duration: '60 daqiqa' },
                    { lessonNumber: 20, title: 'Dars 20: Mantiq', topics: ['Qiyos', 'Istidlol', 'Burхon'], duration: '65 daqiqa' },
                    // Modul 5
                    { lessonNumber: 21, title: 'Dars 21: Professional tarjimonlik', topics: ['Simultanniy', 'Ketma-ket', 'Texnika'], duration: '70 daqiqa' },
                    { lessonNumber: 22, title: 'Dars 22: Media va jurnalistika', topics: ['Reportaj', 'Interview', 'Nashr'], duration: '65 daqiqa' },
                    { lessonNumber: 23, title: 'Dars 23: Xalqaro konferensiyalar', topics: ['Protokol', 'Diplomatiya', 'Nutq'], duration: '60 daqiqa' },
                    { lessonNumber: 24, title: 'Dars 24: Bo\'shliq va vaqt boshqarma', topics: ['O\'qitish', 'Mentor', 'Loyiha'], duration: '65 daqiqa' },
                    { lessonNumber: 25, title: 'Dars 25: Mеnedjment', topics: ['Rahbarlik', 'Jamoa', 'Strategiya'], duration: '60 daqiqa' },
                    // Modul 6
                    { lessonNumber: 26, title: 'Dars 26: Arab lahjalar', topics: ['Misr', 'Sham', 'Xalij'], duration: '65 daqiqa' },
                    { lessonNumber: 27, title: 'Dars 27: Zamonaviy adabiyot', topics: ['Roman', 'Hikoya', 'Muasir adib'], duration: '70 daqiqa' },
                    { lessonNumber: 28, title: 'Dars 28: Texnologiya va innovatsiya', topics: ['IT', 'AI', 'Kelajak'], duration: '60 daqiqa' },
                    { lessonNumber: 29, title: 'Dars 29: Global muammolar', topics: ['Ekologiya', 'Iqtisod', 'Siyosat'], duration: '65 daqiqa' },
                    { lessonNumber: 30, title: 'Dars 30: C1 Imtihon Oldi Takrorlash', topics: ['Magistr darajasi', 'Himoya', 'Sertifikat'], duration: '80 daqiqa' },
                    // Modul 7 (Exam)
                    { lessonNumber: 31, title: 'Yakuniy Imtihon: C1 Ilg\'or', topics: ['O\'qish', 'Eshitish', 'Yozish', 'Yakuniy Test'], duration: '120 daqiqa' }
                ]
            },
            // C2: 6 modul (30 dars) + 1 Exam Modul (Lesson 31)
            {
                id: 'C2', lessons: [
                    // Modul 1
                    { lessonNumber: 1, title: 'Dars 1: Arab filologiyasi tarixi', topics: ['Til tarixi', 'Evolyutsiya', 'Ilm'], duration: '75 daqiqa' },
                    { lessonNumber: 2, title: 'Dars 2: Qiyosiy tilshunoslik', topics: ['Semitik tillar', 'Taqqoslash', 'Tahlil'], duration: '70 daqiqa' },
                    { lessonNumber: 3, title: 'Dars 3: Morfologiya chuqurligi', topics: ['Sarf asoslari', 'Ishtiqоq nazariyasi', 'Tizim'], duration: '75 daqiqa' },
                    { lessonNumber: 4, title: 'Dars 4: Sintaksis chuqurligi', topics: ['Nahv falsafasi', 'Mantiq', 'Strukturalizm'], duration: '70 daqiqa' },
                    { lessonNumber: 5, title: 'Dars 5: Semantika', topics: ['Ma\'no', 'Kontekst', 'Pragmatika'], duration: '65 daqiqa' },
                    // Modul 2
                    { lessonNumber: 6, title: 'Dars 6: Adabiy tanqid', topics: ['Tahlil metodlari', 'Maktablar', 'Nazariya'], duration: '75 daqiqa' },
                    { lessonNumber: 7, title: 'Dars 7: Badiiy matn tahlili', topics: ['Hermeneutika', 'Dekonstruktsiya', 'Yondashuvlar'], duration: '70 daqiqa' },
                    { lessonNumber: 8, title: 'Dars 8: Qur\'on ilmlari', topics: ['Tafsir', 'Usul', 'Mufassir'], duration: '80 daqiqa' },
                    { lessonNumber: 9, title: 'Dars 9: Hadis ilmlari', topics: ['Mustalah', 'Jarh va ta\'dil', 'Ilm ar-rijal'], duration: '75 daqiqa' },
                    { lessonNumber: 10, title: 'Dars 10: Fiqh va usul', topics: ['Maqosid ash-shari\'a', 'Ijtihod', 'Madhhablar'], duration: '70 daqiqa' },
                    // Modul 3
                    { lessonNumber: 11, title: 'Dars 11: Professional tarjima', topics: ['Adabiy tarjima', 'Texnik', 'Simultanniy'], duration: '75 daqiqa' },
                    { lessonNumber: 12, title: 'Dars 12: Ilmiy nashr', topics: ['Maqola', 'Monografiya', 'Konferensiya'], duration: '70 daqiqa' },
                    { lessonNumber: 13, title: 'Dars 13: Akademik kommunikatsiya', topics: ['Prezentatsiya', 'Poster', 'Debat'], duration: '65 daqiqa' },
                    { lessonNumber: 14, title: 'Dars 14: Mentor va ta\'limchi', topics: ['O\'qitish metodikasi', 'Pedagogika', 'Kurs ishlab chiqish'], duration: '75 daqiqa' },
                    { lessonNumber: 15, title: 'Dars 15: Tadqiqot loyihalari', topics: ['Grant', 'Loyihalash', 'Bajarish'], duration: '70 daqiqa' },
                    // Modul 4
                    { lessonNumber: 16, title: 'Dars 16: Xalqaro diplomatiya', topics: ['Bitimlar', 'Tashkilotlar', 'Protokol'], duration: '75 daqiqa' },
                    { lessonNumber: 17, title: 'Dars 17: Global siyosat', topics: ['Xalqaro munosabatlar', 'Geosiyosat', 'Tahlil'], duration: '70 daqiqa' },
                    { lessonNumber: 18, title: 'Dars 18: Iqtisodiy ekspert', topics: ['Moliyaviy tahlil', 'Prognoz', 'Strategiya'], duration: '75 daqiqa' },
                    { lessonNumber: 19, title: 'Dars 19: Korporativ rahbarlik', topics: ['CEO', 'Boardroom', 'Boshqaruv'], duration: '70 daqiqa' },
                    { lessonNumber: 20, title: 'Dars 20: Ekspert konsultant', topics: ['Advisory', 'Tavsiyalar', 'Professional xizmat'], duration: '65 daqiqa' },
                    // Modul 5
                    { lessonNumber: 21, title: 'Dars 21: Media magnati', topics: ['Telekanal', 'Gazeta', 'Onlayn'], duration: '70 daqiqa' },
                    { lessonNumber: 22, title: 'Dars 22: Kontent yaratuvchi', topics: ['Podcast', 'YouTube', 'Ijod'], duration: '75 daqiqa' },
                    { lessonNumber: 23, title: 'Dars 23: Mualлif va yozuvchi', topics: ['Kitob', 'Roman', 'Nashriyot'], duration: '70 daqiqa' },
                    { lessonNumber: 24, title: 'Dars 24: Teatr va kino', topics: ['Ssenariy', 'Dialоg', 'Dubbing'], duration: '75 daqiqa' },
                    { lessonNumber: 25, title: 'Dars 25: AI va texnologiya', topics: ['ChatGPT', 'NLP', 'Kelajak'], duration: '70 daqiqa' },
                    // Modul 6
                    { lessonNumber: 26, title: 'Dars 26: PhD tadqiqot', topics: ['Dissertatsiya', 'Yangilik', 'Hissa'], duration: '90 daqiqa' },
                    { lessonNumber: 27, title: 'Dars 27: Nashrlar va jurnallar', topics: ['Impact factor', 'Peer review', 'Indeksatsiya'], duration: '75 daqiqa' },
                    { lessonNumber: 28, title: 'Dars 28: Xalqaro konsultant', topics: ['Global loyihalar', 'Korporativ', 'Strategiya'], duration: '80 daqiqa' },
                    { lessonNumber: 29, title: 'Dars 29: Shaxsiy brend', topics: ['LinkedIn', 'Networking', 'Ta\'sir'], duration: '70 daqiqa' },
                    { lessonNumber: 30, title: 'Dars 30: C2 Takrorlash va Himoya Tayyorlov', topics: ['Doktorlik dissertatsiyasi', 'Himoya', 'Sertifikat'], duration: '120 daqiqa' },
                    // Modul 7 (Exam)
                    { lessonNumber: 31, title: 'Yakuniy Imtihon: Professional', topics: ['O\'qish', 'Eshitish', 'Yozish', 'Yakuniy Test'], duration: '180 daqiqa' }
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
