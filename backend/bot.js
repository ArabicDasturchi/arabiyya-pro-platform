import TelegramBot from 'node-telegram-bot-api';
import User from './models/User.js';
import { callOpenAI } from './routes/ai.js';

let bot;

const i18n = {
    uz: {
        welcome: (name) => `Assalomu alaykum, <b>${name}</b>! ✨\n\n<b>Arabiyya Pro</b> — Arab tilini professional darajada o'rganish platformasining rasmiy botiga xush kelibsiz.\n\nSiz bu yerda o'qish natijalaringizni kuzatib borishingiz, AI o'qituvchi bilan muloqot qilishingiz va yangiliklardan birinchi bo'lib xabardor bo'lishingiz mumkin.`,
        menu_about: '🌐 Platforma haqida',
        menu_courses: '📚 Kurslarimiz',
        menu_profile: '👤 Mening Profilim',
        menu_top: '🏆 Reyting (Top 10)',
        menu_ai: '🤖 AI O\'qituvchi',
        menu_lughat: '📖 Lug\'at (Flashcards)',
        menu_wisdom: '✨ Kun hikmati',
        menu_payment: '💳 To\'lov va tariflar',
        menu_admin: '✉️ Adminga murojaat',
        menu_help: '📞 Yordam va savollar',
        ai_welcome: '🤖 <b>Men sizning shaxsiy AI o\'qituvchingizman!</b>\n\nSavollaringizni bemalol yozib yuboring. Men sizga arab tili grammatikasi, lug\'at va madaniyatini o\'rganishda yordam beraman.\n\n<i>Murojaatingizni kutib qolaman!</i>',
        help_text: `📞 <b>Yordam markazi:</b>\n\nBizning maqsadimiz — Sizning arab tilini mukammal o'rganishingizni ta'minlash. Agar sizda texnik yoki o'quv jarayoni bo'yicha savollar bo'lsa:\n\n👨‍💻 Admin: @Humoyun_Arabia\n📞 Tel: +998 50 571 63 98\n\n<i>Arabiyya Pro bilan ilm cho'qqilarini zabt eting!</i>`,
        connect_required: `⚠️ <b>Tizimga ulanish zarur!</b>\n\nProfilingiz hali botimizga bog'lanmagan. Iltimos, veb-saytimizda profil bo'limiga kiring va "Telegramga ulash" tugmasini bosing.`
    }
};

const wisdoms = [
    { ar: "العلم في الصغر كالنقش على الحجر", uz: "Yoshlikda o'rganilgan ilm toshga o'yilgan naqsh kabidir." },
    { ar: "من جد وجد ومن زرع حصد", uz: "Kim intilsa - erishadi, kims eksa - o'radi." },
    { ar: "الوقت كالسيف إن لم تقطعه قطعك", uz: "Vaqt qilich kabidir, agar sen uni kesmasang, u seni kesadi." },
    { ar: "الصبر مفتاح الفرج", uz: "Sabr - shodlik (najot) kalitidir." },
    { ar: "اطلبوا العلم من المهد إلى اللحد", uz: "Beshikdan qabrgacha ilm izla." },
    { ar: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ", uz: "Sizlarning yaxshingiz - Qur'onni o'rgangan va o'rgatganingizdir." },
    { ar: "العلم بلا عمل كالشجر بلا ثمر", uz: "Amalsiz ilm - mevasi yo'q daraxt kabidir." },
    { ar: "لسانُ الفتى نصفٌ ونصفٌ فؤادُه", uz: "Yigitning yarmi tildir, yarmi qalbi." }
];

const arabicWords = [
    { ar: 'كتاب', tr: 'Kitab', uz: 'Kitob' },
    { ar: 'قلم', tr: 'Qalam', uz: 'Qalam' },
    { ar: 'مدرسة', tr: 'Madrasa', uz: 'Maktab' },
    { ar: 'بيت', tr: 'Bayt', uz: 'Uy' },
    { ar: 'طالب', tr: 'Toib', uz: 'Talaba' },
    { ar: 'أستاذ', tr: 'Ustaz', uz: 'O\'qituvchi' },
    { ar: 'صديق', tr: 'Sadiq', uz: 'Do\'st' },
    { ar: 'صباح', tr: 'Sabah', uz: 'Tong' },
    { ar: 'مساء', tr: 'Masa', uz: 'Oqshom' }
];

const userStates = {};

export const initBot = () => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return;

    bot = new TelegramBot(token, { polling: true });

    bot.on('polling_error', (error) => {
        if (error.code === 'ETELEGRAM' && (error.message.includes('409') || error.message.includes('ETIMEDOUT'))) return;
        console.error('Bot Polling Error:', error);
    });

    const getMainMenu = () => ({
        reply_markup: {
            keyboard: [
                [{ text: i18n.uz.menu_about }, { text: i18n.uz.menu_courses }],
                [{ text: i18n.uz.menu_profile }, { text: i18n.uz.menu_top }],
                [{ text: i18n.uz.menu_lughat }, { text: i18n.uz.menu_wisdom }],
                [{ text: i18n.uz.menu_ai }, { text: i18n.uz.menu_payment }],
                [{ text: i18n.uz.menu_admin }, { text: i18n.uz.menu_help }]
            ],
            resize_keyboard: true,
            is_persistent: true
        }
    });

    const sendAbout = (chatId) => {
        const text = `💎 <b>ARABIYYA PRO — PROFESSIONAL TA'LIM</b>\n\n` +
            `Biz Markaziy Osiyodagi eng zamonaviy va innovatsion arab tili o'rganish platformasimiz. Bizning maqsadimiz har bir o'quvchiga shaxsiy yondashuv va jahon standartlariga mos ta'lim berishdir.\n\n` +
            `🚀 <b>Nima uchun biz?</b>\n` +
            `• <b>Video darslar:</b> Tajribali ustozlar tomonidan yaratilgan 500 dan ortiq darslar.\n` +
            `• <b>AI Yordamchi:</b> 24/7 sizga til o'rganishda yordam beruvchi sun'iy intellekt.\n` +
            `• <b>Amaliyot:</b> Minglab interaktiv mashqlar va testlar.\n` +
            `• <b>Sertifikat:</b> Kurs yakunida xalqaro darajadagi sertifikat.\n` +
            `• <b>Native Speakers:</b> Arab tilida so'zlashuvchi ustozlar bilan muloqot.\n\n` +
            `<i>Biz bilan birgalikda arab tilini tez va oson o'rganing!</i>`;

        const keyboard = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🌐 Saytga o\'tish', url: 'https://arabiyya.pro' }],
                    [{ text: '📱 Instagram', url: 'https://instagram.com/arabiyya_pro' }, { text: '📹 YouTube', url: 'https://youtube.com/@arabiyya_pro' }],
                    [{ text: '📢 Telegram Kanal', url: 'https://t.me/arabiyya_pro' }]
                ]
            }
        };
        bot.sendMessage(chatId, text, { parse_mode: 'HTML', ...keyboard });
    };

    const sendCourses = (chatId) => {
        const text = `📚 <b>ARABIYYA PRO KURSLARI</b>\n\n` +
            `Platformamizda CEFR (A1-C2) tizimi bo'yicha to'liq o'quv dasturi mavjud. Har bir bosqich sizni arab tili olamiga chuqurroq olib kiradi.\n\n` +
            `👇 <b>Kurslarni tanlab batafsil bilib oling:</b>`;

        const keyboard = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🅰️ Alippbo (0 dan boshlash)', callback_data: 'course_v2_alphabet' }],
                    [{ text: '📘 Boshlang\'ich (A1)', callback_data: 'course_v2_a1' }, { text: '📗 Elementar (A2)', callback_data: 'course_v2_a2' }],
                    [{ text: '📙 Boshlang\'ich-O\'rta (B1)', callback_data: 'course_v2_b1' }, { text: '📕 O\'rta (B2)', callback_data: 'course_v2_b2' }],
                    [{ text: '🎓 Professional (C1-C2)', callback_data: 'course_v2_expert' }],
                    [{ text: '🚀 Darajani aniqlash testi', url: 'https://arabiyya.pro/placement-test' }]
                ]
            }
        };
        bot.sendMessage(chatId, text, { parse_mode: 'HTML', ...keyboard });
    };

    const sendTop = async (chatId) => {
        try {
            // Find all users and group by email to remove visual duplicates (one person can have multiple entries in DB if incorrectly seeded)
            const rawUsers = await User.find({}).sort({ totalTimeSpent: -1 });
            const uniqueUsers = [];
            const seenEmails = new Set();

            for (const u of rawUsers) {
                if (!seenEmails.has(u.email.toLowerCase())) {
                    uniqueUsers.push(u);
                    seenEmails.add(u.email.toLowerCase());
                }
            }

            const topUsers = uniqueUsers.slice(0, 10);
            let text = `👑 <b>TOP 10 — ENG FAOL O'QUVCHILAR</b>\n\n`;

            topUsers.forEach((u, i) => {
                const icon = i === 0 ? '👑' : i === 1 ? '🥇' : i === 2 ? '🥈' : i === 3 ? '🥉' : '🎖';
                text += `${icon} <b>${u.name}</b> — ${u.totalTimeSpent || 0} ball\n`;
            });

            text += `\n<i>Bilim bu — kuch! Siz ham reytingning yuqori pog'onalariga intiling!</i>`;
            bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
        } catch (err) {
            bot.sendMessage(chatId, "Reytingni yuklashda xatolik.");
        }
    };

    const sendProfile = async (chatId) => {
        try {
            const user = await User.findOne({ telegramChatId: chatId });
            if (!user) return bot.sendMessage(chatId, i18n.uz.connect_required, { parse_mode: 'HTML' });

            const compLessons = user.completedLessons?.length || 0;
            const compLevels = user.completedLevels?.length || 0;
            const progress = Math.min(100, (compLevels * 14) + (compLessons * 0.4));
            const bar = '■'.repeat(Math.round(progress / 10)) + '□'.repeat(10 - Math.round(progress / 10));

            const text = `👤 <b>SHAXSIY KABINET</b>\n` +
                `──────────────────\n` +
                `🆔 <b>Ism:</b> ${user.name}\n` +
                `📧 <b>Email:</b> ${user.email}\n` +
                `📊 <b>Darajangiz:</b> ${user.currentLevel || 'A1'}\n` +
                `📈 <b>Status:</b> [${bar}] ${Math.round(progress)}%\n\n` +
                `🌟 <b>Ballaringiz:</b> ${user.totalTimeSpent || 0} ball\n` +
                `✅ <b>O'tilgan darslar:</b> ${compLessons} ta\n` +
                `🎓 <b>Tugatilgan bosqichlar:</b> ${compLevels} ta\n` +
                `──────────────────\n` +
                `<i>Sizning ilm yo'lidagi har bir qadamingiz biz uchun qadrli!</i>`;

            bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
        } catch (err) {
            bot.sendMessage(chatId, "Profil yuklashda xato.");
        }
    };

    const sendPayment = (chatId) => {
        const text = `💳 <b>TO'LOV VA TARIFLAR</b>\n\n` +
            `Arabiyya Pro platformasidagi barcha darslardan to'liq bahramand bo'lish uchun tarifingizni yangilang:\n\n` +
            `🎁 <b>1. BOSH DARAXA (Standard)</b>\n` +
            `• Istalgan 1 ta darajani ochish.\n` +
            `• Videodarslar va testlar.\n` +
            `• <b>Narxi:</b> 145,000 so'm (Umrbod)\n\n` +
            `🏮 <b>2. OLTIN OBUNA (Premium)</b>\n` +
            `• Barcha 6 ta daraja + Alippbo.\n` +
            `• AI Mentor bilan cheksiz muloqot.\n` +
            `• Shaxsiy kurator yordami.\n` +
            `• <b>Narxi:</b> 399,000 so'm (Hozirda chegirma!)\n\n` +
            `🏧 <b>To'lov usullari:</b>\n` +
            `• Payme / Click / Uzum\n` +
            `• Karta raqami: <code>8600 1234 5678 9012</code>\n` +
            `• Egasi: Humoyun A.\n\n` +
            `<i>To'lovdan so'ng chekni @Humoyun_Arabia ga yuboring.</i>`;

        bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
    };

    const askAI = async (chatId, message) => {
        try {
            bot.sendChatAction(chatId, 'typing');
            const prompt = `Sen Arabiyya Pro platformasining shaxsiy AI o'qituvchisisan. Foydalanuvchi: "${message}". Arab tili bo'yicha professional, samimiy va javobni faqat o'zbek tilida ber. Grammatika bo'lsa misollar keltir.`;
            const response = await callOpenAI(prompt);
            bot.sendMessage(chatId, `🤖: ${response.data.choices[0].message.content}`, { parse_mode: 'HTML' });
        } catch (err) {
            bot.sendMessage(chatId, "Hozircha AI band, iltimos keyinroq urinib ko'ring.");
        }
    };

    bot.onText(/\/start(?:\s+(.+))?/, async (msg, match) => {
        const chatId = msg.chat.id;
        const code = match ? match[1] : null;
        if (code) {
            const user = await User.findOne({ telegramSyncCode: code });
            if (user) {
                user.telegramChatId = chatId;
                user.telegramUsername = msg.from.username || '';
                user.telegramSyncCode = undefined;
                await user.save();
                return bot.sendMessage(chatId, `🎊 <b>Muvaffaqiyatli bog'landi!</b>\n\nEndi siz Arabiyya Pro oilasining Telegramdagi to'laqonli a'zosisiz!`, { parse_mode: 'HTML', ...getMainMenu() });
            }
        }
        bot.sendMessage(chatId, i18n.uz.welcome(msg.from.first_name), { parse_mode: 'HTML', ...getMainMenu() });
    });

    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;
        if (!text || text.startsWith('/')) return;

        if (text === i18n.uz.menu_about) return sendAbout(chatId);
        if (text === i18n.uz.menu_courses) return sendCourses(chatId);
        if (text === i18n.uz.menu_profile) return sendProfile(chatId);
        if (text === i18n.uz.menu_top) return sendTop(chatId);
        if (text === i18n.uz.menu_wisdom) {
            const h = wisdoms[Math.floor(Math.random() * wisdoms.length)];
            return bot.sendMessage(chatId, `✨ <b>KUN HIKMATI</b>\n\n<pre>${h.ar}</pre>\n\n<i>"${h.uz}"</i>`, { parse_mode: 'HTML' });
        }
        if (text === i18n.uz.menu_lughat) {
            const w = arabicWords[Math.floor(Math.random() * arabicWords.length)];
            return bot.sendMessage(chatId, `📖 <b>LUG'AT (FLASHCARD)</b>\n\n🇦🇪 <b>${w.ar}</b> [${w.tr}]\n🇺🇿 <b>${w.uz}</b>\n\n<i>Til o'rganish so'z yodlashdan boshlanadi!</i>`, { parse_mode: 'HTML' });
        }
        if (text === i18n.uz.menu_ai) {
            userStates[chatId] = 'AI';
            return bot.sendMessage(chatId, i18n.uz.ai_welcome, { parse_mode: 'HTML' });
        }
        if (text === i18n.uz.menu_payment) return sendPayment(chatId);
        if (text === i18n.uz.menu_admin) {
            userStates[chatId] = 'ADMIN';
            return bot.sendMessage(chatId, `📝 <b>ADMINGA MUROJAAT</b>\n\nSavolingizni yozib qoldiring:`, { parse_mode: 'HTML' });
        }
        if (text === i18n.uz.menu_help) return bot.sendMessage(chatId, i18n.uz.help_text, { parse_mode: 'HTML' });

        if (userStates[chatId] === 'ADMIN') {
            userStates[chatId] = null;
            const target = process.env.ADMIN_CHAT_ID || '6122615431';
            bot.sendMessage(target, `✉️ <b>Yangi murojaat:</b>\n\n👤 ${msg.from.first_name} (@${msg.from.username || 'yoq'})\n🆔 <code>${chatId}</code>\n💬 ${text}`, { parse_mode: 'HTML' });
            return bot.sendMessage(chatId, "✅ Murojaatingiz adminga yuborildi!");
        }

        if (userStates[chatId] === 'AI' || text.length > 5) return askAI(chatId, text);

        bot.sendMessage(chatId, "Iltimos menyudan foydalaning.", getMainMenu());
    });

    bot.on('callback_query', (query) => {
        const id = query.message.chat.id;
        const d = query.data;

        const infoMap = {
            'course_v2_alphabet': `🅰️ <b>ALIPPBO — MAXRAJ VA YOZUV</b>\n\nBu kurs arab tili poydevoridir. Bu yerda siz harflarni tanish, to'g'ri talaffuz qilish va yozishni o'rganasiz.\n\n📚 15 ta dars, interaktiv mashqlar.`,
            'course_v2_a1': `📘 <b>A1 — BOSHLANG'ICH DARAXA</b>\n\nSiz kundalik hayotdagi oddiy suhbatlarni tushunishni va savollarga javob berishni boshlaysiz.\n\n📚 40 ta dars, 200 ta yangi so'z.`,
            'course_v2_a2': `📗 <b>A2 — ELEMENTAR DARAXA</b>\n\nMurakkabroq jumlalar, asosiy grammatika va erkin muloqot sari birinchi qadam.\n\n📚 35 ta dars, grammatik tahlillar.`,
            'course_v2_b1': `📙 <b>B1 — O'RTA DARAXA</b>\n\nSiz arab tilidagi matnlarni o'qishni va o'z fikringizni bayon qilishni o'rganasiz.\n\n📚 30 ta dars, matnlar bilan ishlash.`,
            'course_v2_expert': `🎓 <b>C1-C2 — PROFESSIONAL MASTERY</b>\n\nBu daraja sizni arab tilini "Native" darajasida tushunishga tayyorlaydi. Arab adabiyoti va ilmiy matnlar.\n\n📜 Kurs yakunida xalqaro darajadagi sertifikat!`
        };

        if (infoMap[d]) bot.sendMessage(id, infoMap[d], { parse_mode: 'HTML' });
    });
};

export const sendBotNotification = (chatId, message) => {
    if (bot && chatId) bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
};
