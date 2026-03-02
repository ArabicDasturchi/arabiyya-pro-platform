import TelegramBot from 'node-telegram-bot-api';
import User from './models/User.js';
import { callOpenAI } from './routes/ai.js';

let bot;

const i18n = {
    uz: {
        welcome: (name) => `Assalomu alaykum, <b>${name}</b>! ✨\n\n<b>Arabiyya Pro</b> — Arab tilini professional darajada o'rganish platformasining rasmiy botiga xush kelibsiz.\n\nSiz bu yerda o'qish natijalaringizni kuzatib borishingiz, AI o'qituvchi bilan muloqot qilishingiz va yangiliklardan birinchi bo'lib xabardor bo'lishingiz mumkin.`,
        menu_about: '🌐 Platforma haqida',
        menu_courses: '📚 Kurslar',
        menu_profile: '👤 Mening Profilim',
        menu_top: '🏆 Reyting (Top 10)',
        menu_ai: '🤖 AI O\'qituvchi',
        menu_lughat: '📖 Lug\'at (Flashcards)',
        menu_wisdom: '✨ Kun hikmati',
        menu_payment: '💳 To\'lov',
        menu_admin: '✉️ Adminga murojaat',
        menu_help: '📞 Yordam',
        ai_welcome: '🤖 <b>Men sizning shaxsiy AI o\'qituvchingizman!</b>\n\nSavollaringizni bemalol yozib yuboring. Men sizga arab tili grammatikasi, lug\'at va madaniyatini o\'rganishda yordam beraman.\n\n<i>Murojaatingizni kutib qolaman!</i>',
        help_text: `📞 <b>Yordam markazi:</b>\n\nSavollaringiz bo'lsa, biz doimo tayyormiz!\n\n👨‍💻 Admin: @Humoyun_Arabia\n📞 Tel: +998 50 571 63 98\n\n<i>Arabiyya Pro bilan ilm cho'qqilarini zabt eting!</i>`,
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
    { ar: "العلم بلا عمل كالشجر بلا ثمر", uz: "Amalsiz ilm - mevasi yo'q daraxt kabidir." }
];

const arabicWords = [
    { ar: 'كتاب', tr: 'Kitab', uz: 'Kitob' },
    { ar: 'قلم', tr: 'Qalam', uz: 'Qalam' },
    { ar: 'مدرسة', tr: 'Madrasa', uz: 'Maktab' },
    { ar: 'بيت', tr: 'Bayt', uz: 'Uy' },
    { ar: 'طالب', tr: 'Toib', uz: 'Talaba' },
    { ar: 'أستاذ', tr: 'Ustaz', uz: 'O\'qituvchi' },
    { ar: 'شمس', tr: 'Shams', uz: 'Quyosh' },
    { ar: 'قمر', tr: 'Qamar', uz: 'Oy' },
    { ar: 'نجم', tr: 'Najm', uz: 'Yulduz' }
];

// In-memory states
const userStates = {};

export const initBot = () => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
        console.log('⚠️ TELEGRAM_BOT_TOKEN kiritilmagan. Bot ishga tushmadi.');
        return;
    }

    bot = new TelegramBot(token, { polling: true });

    bot.on('polling_error', (error) => {
        if (error.code === 'ETELEGRAM' && error.message.includes('409')) return;
        console.error('Bot Polling Error:', error);
    });

    console.log('🤖 Telegram bot ishga tushdi (Professional Full Mode)...');

    const getMainMenu = () => {
        const t = i18n.uz;
        return {
            reply_markup: {
                keyboard: [
                    [{ text: t.menu_about }, { text: t.menu_courses }],
                    [{ text: t.menu_profile }, { text: t.menu_top }],
                    [{ text: t.menu_lughat }, { text: t.menu_wisdom }],
                    [{ text: t.menu_ai }, { text: t.menu_payment }],
                    [{ text: t.menu_admin }, { text: t.menu_help }]
                ],
                resize_keyboard: true,
                is_persistent: true
            }
        };
    };

    // --- Core Logic Handlers ---

    const sendTop = async (chatId) => {
        try {
            // Group by email and take the best score/time to avoid duplicates visually
            const allUsers = await User.find({}).sort({ totalTimeSpent: -1 });
            const uniqueUsersMap = new Map();

            allUsers.forEach(u => {
                const key = u.email.toLowerCase();
                if (!uniqueUsersMap.has(key) || uniqueUsersMap.get(key).totalTimeSpent < u.totalTimeSpent) {
                    uniqueUsersMap.set(key, u);
                }
            });

            const topUsers = Array.from(uniqueUsersMap.values()).slice(0, 10);

            let text = `👑 <b>ENG FAOL O'QUVCHILAR (TOP 10)</b>\n\n`;
            topUsers.forEach((u, i) => {
                const icon = i === 0 ? '👑' : i === 1 ? '🥇' : i === 2 ? '🥈' : i === 3 ? '🥉' : '🎖';
                text += `${icon} <b>${u.name}</b> — ${u.totalTimeSpent || 0} ball\n`;
            });
            text += `\n<i>Siz ham ko'proq ilm izlab, ushbu ro'yxatdan joy oling!</i>`;
            bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
        } catch (err) {
            bot.sendMessage(chatId, "Reytingni yuklashda xatolik yuz berdi.");
        }
    };

    const sendCourses = (chatId) => {
        const text = `📚 <b>Bizning O'quv Dasturlarimiz</b>\n\nPlatformamizda 6 ta asosiy CEFR darajasi va boshlang'ich "Alippbo" kursi mavjud. Har bir kurs interaktiv darslar, testlar va AI tahlilini o'z ichiga oladi.\n\n👇 <b>Darajalardan birini tanlang:</b>`;
        const keyboard = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🅰️ Alippbo (Arab Harflari)', callback_data: 'course_info_alphabet' }],
                    [{ text: '📘 Boshlang\'ich (A1)', callback_data: 'course_info_a1' }, { text: '📗 Elementar (A2)', callback_data: 'course_info_a2' }],
                    [{ text: '📙 Boshlang\'ich-O\'rta (B1)', callback_data: 'course_info_b1' }, { text: '📕 O\'rta (B2)', callback_data: 'course_info_b2' }],
                    [{ text: '🎓 Professional (C1-C2)', callback_data: 'course_info_expert' }],
                    [{ text: '🌍 Saytda batafsil ko\'rish', url: 'https://arabiyya.pro' }]
                ]
            }
        };
        bot.sendMessage(chatId, text, { parse_mode: 'HTML', ...keyboard });
    };

    const sendProfile = async (chatId) => {
        try {
            const user = await User.findOne({ telegramChatId: chatId });
            if (!user) return bot.sendMessage(chatId, i18n.uz.connect_required, { parse_mode: 'HTML' });

            // Calculate progress based on levels and lessons
            const totalLevels = 7; // Alphabet + A1..C2
            const completedLevelsCount = user.completedLevels?.length || 0;
            const completedLessonsCount = user.completedLessons?.length || 0;

            // Artificial progress calculation for UI
            const levelWeight = 10; // each level gives 10% base
            const progressValue = Math.min(100, (completedLevelsCount * levelWeight) + (completedLessonsCount * 0.5));
            const stars = '⭐'.repeat(Math.max(1, Math.min(5, Math.ceil(progressValue / 20))));

            const text = `👤 <b>SHAXSIY PROFIL</b>\n` +
                `──────────────────\n` +
                `📛 <b>Ism:</b> ${user.name}\n` +
                `📧 <b>Email:</b> ${user.email}\n` +
                `📊 <b>Joriy holat:</b> ${user.currentLevel || 'Boshlang\'ich'}\n` +
                `📈 <b>Umumiy progress:</b> [${'■'.repeat(Math.floor(progressValue / 10))}${'□'.repeat(10 - Math.floor(progressValue / 10))}] ${Math.round(progressValue)}%\n\n` +
                `🏆 <b>Yutuqlar:</b>\n` +
                `✅ ${completedLessonsCount} ta dars yakunlandi\n` +
                `🎓 ${completedLevelsCount} ta bosqich tugatildi\n` +
                `🎖 <b>Daraja:</b> ${stars}\n\n` +
                `🌟 <b>Ballaringiz:</b> ${user.totalTimeSpent || 0} ball\n` +
                `──────────────────\n` +
                `<i>Ilm olishda davom eting! Biz siz bilan faxrlanamiz.</i>`;

            bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
        } catch (err) {
            bot.sendMessage(chatId, "Profil yuklashda xatolik.");
        }
    };

    const sendWisdom = (chatId) => {
        const item = wisdoms[Math.floor(Math.random() * wisdoms.length)];
        const text = `✨ <b>KUN HIKMATI</b>\n\n` +
            `<pre>${item.ar}</pre>\n\n` +
            `📝 <b>Tarjimasi:</b>\n<i>"${item.uz}"</i>`;
        bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
    };

    const sendLughat = (chatId) => {
        const word = arabicWords[Math.floor(Math.random() * arabicWords.length)];
        const text = `📖 <b>YANGI SO'Z</b>\n\n` +
            `🇦🇪 <b>Arabcha:</b> <code>${word.ar}</code>\n` +
            `🔊 <b>O'qilishi:</b> ${word.tr}\n` +
            `🇺🇿 <b>Tarjimasi:</b> ${word.uz}\n\n` +
            `<i>Har kuni yangi so'z yodlashni odat qiling!</i>`;
        bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
    };

    const sendPayment = (chatId) => {
        const text = `💳 <b>TO'LOV VA OBUNA</b>\n\n` +
            `<b>Arabiyya Pro</b> platformasida o'qish uchun turli darajadagi kurslarni xarid qilishingiz mumkin.\n\n` +
            `💰 <b>Xizmat narxlari:</b>\n` +
            `• Har bir daraja (CEFR): 149,000 so'm (Bir martalik to'lov)\n` +
            `• Oltin obuna (Barcha darajalar): 499,000 so'm (Umrbod)\n\n` +
            `🏧 <b>To'lov usullari:</b>\n` +
            `1. <b>Payme / Click</b> (Sayt orqali)\n` +
            `2. <b>Karta orqali o'tkazma:</b>\n` +
            `💳 <code>8600 1234 5678 9012</code> (Humoyun A.)\n\n` +
            `<i>To'lovdan so'ng chekni @Humoyun_Arabia ga yuboring, kursingiz 5 daqiqada faollashadi.</i>`;
        bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
    };

    const askAI = async (chatId, message) => {
        try {
            bot.sendChatAction(chatId, 'typing');
            const prompt = `Sen Arabiyya Pro platformasining professional o'qituvchi assistentisan. Foydalanuvchi bilan samimiy, o'zbek tilida muloqot qil. Javobing qisqa, aniq va foydali bo'lsin. Arabcha so'zlar kelsa tarjimasini ber. Savol: ${message}`;
            const response = await callOpenAI(prompt);
            const aiResponse = response.data.choices[0].message.content || "Kechirasiz, hozir javob bera olmayman.";
            bot.sendMessage(chatId, `🤖: ${aiResponse}`, { parse_mode: 'HTML' });
        } catch (err) {
            bot.sendMessage(chatId, "AI hozirda band. Iltimos keyinroq urinib ko'ring.");
        }
    };

    // --- Interaction Logic ---

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
                return bot.sendMessage(chatId, `🎊 <b>Tabriklaymiz!</b>\n\nAkkauntingiz botimizga muvaffaqiyatli bog'landi. Endi siz to'liq funksionaldan foydalanishingiz mumkin.`, { parse_mode: 'HTML', ...getMainMenu() });
            }
        }
        bot.sendMessage(chatId, i18n.uz.welcome(msg.from.first_name), { parse_mode: 'HTML', ...getMainMenu() });
    });

    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;
        if (!text || text.startsWith('/')) return;

        // Routing
        if (text === i18n.uz.menu_about) return bot.sendMessage(chatId, `💎 <b>ARABIYYA PRO HAQIDA</b>\n\nBiz - Markaziy Osiyodagi eng zamonaviy arab tili ta'lim platformasimiz. Bizning maqsadimiz - har bir o'quvchiga shaxsiy yondashuv va AI yordamida til o'rgatish.\n\n🔹 <b>Afzalliklarimiz:</b>\n- Yuqori sifatli video darslar\n- AI tahlili va yordamchisi\n- CEFR tizimi asosidagi dastur\n- Rasmiy sertifikatlar`, { parse_mode: 'HTML' });

        if (text === i18n.uz.menu_courses) return sendCourses(chatId);
        if (text === i18n.uz.menu_profile) return sendProfile(chatId);
        if (text === i18n.uz.menu_top) return sendTop(chatId);
        if (text === i18n.uz.menu_wisdom) return sendWisdom(chatId);
        if (text === i18n.uz.menu_lughat) return sendLughat(chatId);
        if (text === i18n.uz.menu_payment) return sendPayment(chatId);
        if (text === i18n.uz.menu_ai) {
            userStates[chatId] = 'AI_CHAT';
            return bot.sendMessage(chatId, i18n.uz.ai_welcome, { parse_mode: 'HTML' });
        }
        if (text === i18n.uz.menu_help) return bot.sendMessage(chatId, i18n.uz.help_text, { parse_mode: 'HTML' });
        if (text === i18n.uz.menu_admin) {
            userStates[chatId] = 'WAIT_ADMIN_MSG';
            return bot.sendMessage(chatId, `📝 <b>ADMINGA MUROJAAT</b>\n\nMurojaatingizni yozib yuboring. Administrator tez orada sizga javob beradi.`, { parse_mode: 'HTML' });
        }

        // Processing states
        if (userStates[chatId] === 'WAIT_ADMIN_MSG') {
            userStates[chatId] = null;
            // Forward to real admin (placeholder ID or from env)
            const ADMIN_ID = process.env.ADMIN_CHAT_ID || '6122615431';
            const userRef = msg.from.username ? `@${msg.from.username}` : msg.from.first_name;
            bot.sendMessage(ADMIN_ID, `📩 <b>YANGI MUROJAAT</b>\n\n👤 Foydalanuvchi: ${msg.from.first_name} (${userRef})\n🆔 ID: <code>${chatId}</code>\n💬 Murojaat: ${text}`, { parse_mode: 'HTML' });
            return bot.sendMessage(chatId, `✅ <b>Murojaatingiz yuborildi!</b> Tez orada siz bilan bog'lanamiz.`);
        }

        // Generic AI chat fallback
        if (userStates[chatId] === 'AI_CHAT' || text.length > 5) {
            return askAI(chatId, text);
        }

        bot.sendMessage(chatId, "Tushunmadim. Iltimos quyidagi menyudan foydalaning.", getMainMenu());
    });

    bot.on('callback_query', (query) => {
        const chatId = query.message.chat.id;
        const data = query.data;

        if (data.startsWith('course_info_')) {
            let info = "";
            const level = data.replace('course_info_', '');

            if (level === 'alphabet') info = "🅰️ <b>ALIPPBO KURSI</b>\n\nArab harflari va ularning talaffuz qoidalarini (Maxraj) o'rgatadi. Yangi boshlovchilar uchun eng birinchi qadam.\n\n📚 <i>Modul soni: 2 ta\n🎬 Darslar soni: 12 ta</i>";
            if (level === 'a1') info = "📘 <b>A1 - BOSHLANG'ICH</b>\n\nKundalik hayotda eng ko'p ishlatiladigan so'zlar va iboralar. Oddiy jumlalar tuzish va tushunish.\n\n📚 <i>Modul soni: 10 ta\n🎬 Darslar soni: 40 ta</i>";
            if (level === 'expert') info = "🎓 <b>C1-C2 - PROFESSIONAL</b>\n\nMukammal darajadagi arab tili. Akademik matnlar, adabiyot va chuqur grammatika.\n\n📜 <i>Kurs yakunida Xalqaro Professional Sertifikat beriladi!</i>";

            if (!info) info = "Ushbu kurs haqida saytimizda batafsil ma'lumot olishingiz mumkin.";

            bot.sendMessage(chatId, info, { parse_mode: 'HTML' });
        }
    });
};

export const sendBotNotification = (chatId, message) => {
    if (bot && chatId) bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
};
