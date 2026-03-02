import TelegramBot from 'node-telegram-bot-api';
import User from './models/User.js';
import { callOpenAI } from './routes/ai.js';

let bot;

const i18n = {
    uz: {
        welcome: (name) => `Assalomu alaykum, <b>${name}</b>! ✨\n\n<b>Arabiyya Pro</b> — Markaziy Osiyodagi eng sifatli arab tili ta'lim platformasining rasmiy botiga xush kelibsiz.\n\nSiz bu yerda o'qish natijalaringizni kuzatib borishingiz, AI o'qituvchi bilan muloqot qilishingiz va yangiliklardan birinchi bo'lib xabardor bo'lishingiz mumkin.`,
        menu_about: '🌐 Platforma haqida',
        menu_courses: '📚 Kurslarimiz',
        menu_profile: '👤 Mening Profilim',
        menu_top: '🏆 Reyting (Top 10)',
        menu_ai: '🤖 AI O\'qituvchi',
        menu_lughat: '📖 Lug\'at (Yozuv)',
        menu_wisdom: '✨ Kun hikmati',
        menu_payment: '💳 Tarif va To\'lov',
        menu_admin: '✉️ Adminga murojaat',
        menu_help: '📞 Yordam markazi',
        ai_welcome: '🤖 <b>Men sizning shaxsiy AI o\'qituvchingizman!</b>\n\nSavollaringizni bemalol yozib yuboring. Men sizga arab tili grammatikasi, lug\'at va madaniyatini o\'rganishda yordam beraman.',
        help_text: `📞 <b>Yordam kerakmi?</b>\n\nArabiyya Pro jamoasi doimo xizmatingizda:\n\n👨‍💻 Admin: @Humoyun_Arabia\n📞 Tel: +998 50 571 63 98\n\n<i>Bilim olishdan to'xtamang!</i>`,
        connect_required: `⚠️ <b>Profilingiz ulanmagan!</b>\n\nIltimos, platformamizda profil bo'limiga kiring va "Telegramga ulash" tugmasini bosing.`
    }
};

const wisdoms = [
    { ar: "العلم صيد والكتابة قيده", uz: "Bilim — o'ljadir, yozuv — uni kishanlashdir." },
    { ar: "من سار على الدرب وصل", uz: "Kim yo'lda yursa, albatta manzilga yetadi." },
    { ar: "جالس العلماء تزداد علماً", uz: "Olimlar bilan o'tir, ilmda ziyoda bo'lasan." },
    { ar: "العلم نور والجهل ظلم", uz: "Ilm — nurdir, johillik — zulmatdir." }
];

const userStates = {};

export const initBot = () => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return;

    bot = new TelegramBot(token, { polling: true });

    bot.on('polling_error', (error) => {
        if (error.code === 'ETELEGRAM' && (error.message.includes('409') || error.message.includes('ETIMEDOUT'))) return;
        // console.error('Bot Polling Error:', error);
    });

    console.log('🤖 Telegram bot ishga tushirildi (PROFESSIONAL FULL MODE)...');

    const getMainMenu = () => ({
        reply_markup: {
            keyboard: [
                [{ text: i18n.uz.menu_about }, { text: i18n.uz.menu_courses }],
                [{ text: i18n.uz.menu_profile }, { text: i18n.uz.menu_top }],
                [{ text: i18n.uz.menu_lughat }, { text: i18n.uz.menu_wisdom }],
                [{ text: i18n.uz.menu_ai }, { text: i18n.uz.menu_payment }],
                [{ text: i18n.uz.menu_admin }, { text: i18n.uz.menu_help }]
            ],
            resize_keyboard: true
        }
    });

    // 🌐 Platforma haqida
    const sendAbout = (chatId) => {
        const text = `💎 <b>ARABIYYA PRO — TA'LIMDA ENG YUQORI DARAXA</b>\n\n` +
            `Biz Markaziy Osiyoda arab tilini interaktiv va zamonaviy uslubda o'rgatuvchi yagona platformamiz. Sizga eng zamonaviy texnologiyalarni taqdim etamiz:\n\n` +
            `✅ <b>Video darslar:</b> 500 dan ortiq 4K sifatli darsliklar.\n` +
            `✅ <b>AI Tahlil:</b> Sun'iy intellekt xatolaringizni to'g'irlaydi.\n` +
            `✅ <b>Sertifikat:</b> Har bir daraja yakunida rasmiy hujjat.\n` +
            `✅ <b>Hamyonbop:</b> Sifatni hamma birdek olishi tarafdorimiz.\n\n` +
            `Ijtimoiy tarmoqlarimiz orqali darslarimizni kuzating:`;

        bot.sendMessage(chatId, text, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🌐 Veb-sayt', url: 'https://arabiyya.pro' }],
                    [{ text: '📱 Instagram', url: 'https://instagram.com/arabiyya_pro' }, { text: '📢 YouTube', url: 'https://youtube.com/@arabiyya_pro' }]
                ]
            }
        });
    };

    // 📚 Kurslar
    const sendCourses = (chatId) => {
        const text = `📚 <b>MAVJUD O'QUV DARASTURLARIMIZ</b>\n\n` +
            `Platformamizda 6 ta asosiy daraja bor. Har bir darajaga xarid qilish orqali to'liq darslar, testlar va AI tahlilini olasiz:\n\n` +
            `• 🅰️ <b>Alippbo:</b> Arab harflari va maxraj.\n` +
            `• 📘 <b>A1-A2:</b> Boshlang'ich daraja.\n` +
            `• 📙 <b>B1-B2:</b> O'rta va Grammatika.\n` +
            `• 🎓 <b>C1-C2:</b> Professional daraja.\n\n` +
            `👇 <b>Kurslarimiz haqida batafsil bilish:</b>`;

        bot.sendMessage(chatId, text, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🅰️ Alippbo haqida', callback_data: 'course_v3_alpha' }, { text: '📘 A1 haqida', callback_data: 'course_v3_a1' }],
                    [{ text: '📙 B1 haqida', callback_data: 'course_v3_b1' }, { text: '🎓 C1 haqida', callback_data: 'course_v3_c1' }],
                    [{ text: '🚀 Darajani aniqlash testi', url: 'https://arabiyya.pro/placement-test' }]
                ]
            }
        });
    };

    // 🏆 Reyting (Fixed)
    const sendTop = async (chatId) => {
        try {
            const raw = await User.find({}).sort({ totalTimeSpent: -1 });
            const unique = [];
            const seen = new Set();
            for (const u of raw) {
                if (!seen.has(u.email.toLowerCase())) {
                    unique.push(u);
                    seen.add(u.email.toLowerCase());
                }
            }
            const top = unique.slice(0, 10);
            let text = `👑 <b>TOP 10 — TALABALAR REYTINGI</b>\n\n`;
            top.forEach((u, i) => {
                const icon = i === 0 ? '👑' : i === 1 ? '🥇' : i === 2 ? '🥈' : '🎖';
                text += `${icon} <b>${u.name}</b> — ${u.totalTimeSpent || 0} ball\n`;
            });
            bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
        } catch (e) {
            bot.sendMessage(chatId, "Reytingda xatolik.");
        }
    };

    // 👤 Profil
    const sendProfile = async (chatId) => {
        try {
            const user = await User.findOne({ telegramChatId: chatId });
            if (!user) return bot.sendMessage(chatId, i18n.uz.connect_required, { parse_mode: 'HTML' });

            const progress = Math.min(100, (user.completedLevels?.length || 0) * 15 + (user.completedLessons?.length || 0) * 0.5);
            const bar = '■'.repeat(Math.round(progress / 10)) + '□'.repeat(10 - Math.round(progress / 10));

            const text = `👤 <b>SIZNING PROFILINGIZ</b>\n\n` +
                `🆔 <b>Ism:</b> ${user.name}\n` +
                `📊 <b>Darajangiz:</b> ${user.currentLevel || 'A1'}\n` +
                `📈 <b>Status:</b> [${bar}] ${Math.round(progress)}%\n\n` +
                `✅ <b>Darslar:</b> ${user.completedLessons?.length || 0} ta\n` +
                `🎓 <b>Bosqichlar:</b> ${user.completedLevels?.length || 0} ta\n` +
                `🌟 <b>Ballaringiz:</b> ${user.totalTimeSpent || 0} ball`;

            bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
        } catch (e) {
            bot.sendMessage(chatId, "Profil topilmadi.");
        }
    };

    // 💳 To'lov
    const sendPayment = (chatId) => {
        const text = `💳 <b>TARIFLAR VA TO'LOV TIZIMI</b>\n\n` +
            `O'qishni davom ettirish uchun darajalarni ochishingiz kerak:\n\n` +
            `🎁 <b>Standard:</b> Har bir daraja — 145,000 so'm.\n` +
            `🌟 <b>Full Premium:</b> Barcha kurslar umrbod — 399,000 so'm.\n\n` +
            `🏧 <b>To'lov usuli:</b>\n` +
            `• Click / Payme: Saytda to'lash\n` +
            `• Karta (8600 1234 5678 9012) — Humoyun A.\n\n` +
            `To'lovdan so'ng chekni @Humoyun_Arabia ga yuboring.`;
        bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
    };

    const askAI = async (chatId, text) => {
        try {
            bot.sendChatAction(chatId, 'typing');
            const res = await callOpenAI(`Sen Arabiyya Pro platformasining o'qituvchisissan. Foydalanuvchiga faqat o'zbekcha, professional va qisqa javob ber. Savol: ${text}`);
            bot.sendMessage(chatId, `🤖: ${res.data.choices[0].message.content}`);
        } catch (e) {
            bot.sendMessage(chatId, "AI hozir band.");
        }
    };

    // --- Commands ---
    bot.onText(/\/start(?:\s+(.+))?/, async (msg, match) => {
        const chatId = msg.chat.id;
        const code = match ? match[1] : null;
        if (code) {
            const user = await User.findOne({ telegramSyncCode: code });
            if (user) {
                user.telegramChatId = chatId;
                user.telegramSyncCode = undefined;
                await user.save();
                return bot.sendMessage(chatId, "✅ Muvaffaqiyatli bog'landi!", getMainMenu());
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
            return bot.sendMessage(chatId, `✨ <b>KUN HIKMATI:</b>\n\n<code>${h.ar}</code>\n\n<i>"${h.uz}"</i>`, { parse_mode: 'HTML' });
        }
        if (text === i18n.uz.menu_lughat) return bot.sendMessage(chatId, "📖 <b>Yozuv va Lug'at:</b>\n\nArab yozuvini o'rganish uchun veb-saytimizdagi interaktiv darslardan foydalaning. Tez orada bu yerda o'yinlar bo'ladi.", { parse_mode: 'HTML' });
        if (text === i18n.uz.menu_ai) {
            userStates[chatId] = 'AI';
            return bot.sendMessage(chatId, i18n.uz.ai_welcome, { parse_mode: 'HTML' });
        }
        if (text === i18n.uz.menu_payment) return sendPayment(chatId);
        if (text === i18n.uz.menu_admin) {
            userStates[chatId] = 'ADMIN';
            return bot.sendMessage(chatId, "💬 Adminga murojaat yozing:");
        }
        if (text === i18n.uz.menu_help) return bot.sendMessage(chatId, i18n.uz.help_text, { parse_mode: 'HTML' });

        if (userStates[chatId] === 'ADMIN') {
            userStates[chatId] = null;
            const target = process.env.ADMIN_CHAT_ID || '6122615431';
            bot.sendMessage(target, `✉️ <b>Murojaat:</b>\n\nFoydalanuvchi: ${msg.from.first_name} ID: ${chatId}\n\n💬 ${text}`);
            return bot.sendMessage(chatId, "✅ Yuborildi.");
        }

        if (text.length > 5 || userStates[chatId] === 'AI') return askAI(chatId, text);
    });

    // Callback details
    bot.on('callback_query', (query) => {
        const id = query.message.chat.id;
        const d = query.data;
        if (d === 'course_v3_alpha') bot.sendMessage(id, "🅰️ <b>Alippbo:</b> Arab harflari, maxraj va yozuv. 12 ta dars.", { parse_mode: 'HTML' });
        if (d === 'course_v3_a1') bot.sendMessage(id, "📘 <b>A1:</b> Kundalik muloqot va so'zlashuv. 45 ta dars.", { parse_mode: 'HTML' });
    });
};

export const sendBotNotification = (chatId, message) => {
    if (bot && chatId) bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
};
