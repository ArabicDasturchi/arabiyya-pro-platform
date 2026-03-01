import TelegramBot from 'node-telegram-bot-api';
import User from './models/User.js';
import axios from 'axios';
import { callOpenAI } from './routes/ai.js';

let bot;

const i18n = {
    uz: {
        welcome: (name) => `Assalomu alaykum, <b>${name}</b>! ✨\n\nArabiyya Pro platformasining rasmiy aqlli o'qituvchisiga xush kelibsiz.`,
        menu_about: '🌐 Platforma haqida',
        menu_courses: '📚 Kurslar',
        menu_profile: '👤 Mening Profilim',
        menu_top: '🏆 Reyting (Top 10)',
        menu_ai: '🤖 AI O\'qituvchi',
        menu_lughat: '📖 Lug\'at (Flashcards)',
        menu_help: '📞 Yordam',
        ai_welcome: 'Men sizning shaxsiy arab tili o\'qituvchingizman. Savollaringizni bemalol soravering! (Masalan: "Assalomu alaykum nima degani?", "Ismim nima?" so\'zining arabcha tarjimasi?)',
        help_text: `📞 <b>Yordam markazi:</b>\n\n👨‍💻 Admin: @Humoyun_Arabia\n📞 Tel: +998 50 571 63 98\n\nSavollaringiz bo'lsa biz doimo tayyormiz!`,
        connect_required: `⚠️ Profilingiz saytga ulanmagan. Saytdagi Profil bo'limidan Telegramni ulang.`
    }
};

const arabicWords = [
    { ar: 'كتاب', tr: 'Kitab', uz: 'Kitob' },
    { ar: 'قلم', tr: 'Qalam', uz: 'Qalam' },
    { ar: 'مدرسة', tr: 'Madrasa', uz: 'Maktab' },
    { ar: 'بيت', tr: 'Bayt', uz: 'Uy' },
    { ar: 'طالب', tr: 'Toib', uz: 'Talaba' },
    { ar: 'أستاذ', tr: 'Ustaz', uz: 'O\'qituvchi' }
];

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

    console.log('🤖 Telegram bot ishga tushdi (Professional Mode)...');

    const getMainMenu = (lang = 'uz') => {
        const t = i18n[lang] || i18n.uz;
        return {
            reply_markup: {
                keyboard: [
                    [{ text: t.menu_about }, { text: t.menu_courses }],
                    [{ text: t.menu_profile }, { text: t.menu_lughat }],
                    [{ text: t.menu_top }, { text: t.menu_ai }],
                    [{ text: t.menu_help }]
                ],
                resize_keyboard: true,
                is_persistent: true
            }
        };
    };

    const sendTop = async (item) => {
        const chatId = item.chat ? item.chat.id : item;
        const topUsers = await User.find({}).sort({ totalTimeSpent: -1 }).limit(10);
        let text = `🏆 <b>ENG FAOL O'QUVCHILAR</b>\n\n`;
        topUsers.forEach((u, i) => {
            const icon = i === 0 ? '👑' : i === 1 ? '🥇' : i === 2 ? '🥈' : '🎖';
            text += `${icon} <b>${u.name}</b> — ${u.totalTimeSpent || 0} ball\n`;
        });
        bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
    };

    const sendCourses = (chatId) => {
        const text = `🎯 <b>Barcha kurslar va imkoniyatlar:</b>\n\nBizda harflardan tortib yuqori darajagacha darslar mavjud. Qaysi darajani ko'rishni istaysiz?`;
        const keyboard = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🅰️ Alippbo (Harflar)', callback_data: 'course_detail_alphabet' }],
                    [{ text: '📘 Boshlang\'ich (A1)', callback_data: 'course_detail_a1' }, { text: '📗 O\'rta (B1)', callback_data: 'course_detail_b1' }],
                    [{ text: '🖥 Saytga o\'tish', url: 'https://arabiyya.pro' }]
                ]
            }
        };
        bot.sendMessage(chatId, text, { parse_mode: 'HTML', ...keyboard });
    };

    const sendProfile = async (chatId) => {
        const user = await User.findOne({ telegramChatId: chatId });
        if (!user) return bot.sendMessage(chatId, i18n.uz.connect_required, { parse_mode: 'HTML' });

        const courseProgress = Math.min(100, Math.round((user.completedLessons?.length || 0) * 1.5));
        const stars = '⭐'.repeat(Math.ceil(courseProgress / 20));

        const text = `👤 <b>PROFIL MA'LUMOTLARI</b>\n` +
            `──────────────────\n` +
            `📛 <b>Foydalanuvchi:</b> ${user.name}\n` +
            `📧 <b>Email:</b> ${user.email}\n` +
            `📊 <b>Daraja:</b> ${user.currentLevel || 'A1'}\n` +
            `📈 <b>Progress:</b> [${'■'.repeat(Math.floor(courseProgress / 10))}${'□'.repeat(10 - Math.floor(courseProgress / 10))}] ${courseProgress}%\n` +
            `⭐ <b>Rating:</b> ${stars || 'Boshlang\'ich'}\n` +
            `──────────────────\n` +
            `🏆 <b>Natijalar:</b>\n` +
            `✅ ${user.completedLessons?.length || 0} ta dars yakunlangan\n` +
            `🎓 ${user.completedLevels?.length || 0} ta bosqich tugatilgan`;

        bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
    };

    const sendLughat = (chatId) => {
        const word = arabicWords[Math.floor(Math.random() * arabicWords.length)];
        const text = `📖 <b>Yangi so'z o'rganamiz:</b>\n\n<b>${word.ar}</b> [${word.tr}]\n\n🇺🇿 <b>Tarjimasi:</b> ${word.uz}\n\n<i>Kuniga 5 ta so'z yodlang va 1 yilda 1800 ta so'zga ega bo'ling!</i>`;
        bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
    };

    const askAI = async (chatId, message) => {
        try {
            bot.sendChatAction(chatId, 'typing');
            const prompt = `Sen professional arab tili o'qituvchisissan - Arabiyya Pro platformasining AI yordamchisissan. Foydalanuvchi savoli: ${message}. Javobni o'zbek tilida, qisqa va aniq, motivatsion tarzda ber.`;
            const response = await callOpenAI(prompt);
            const aiResponse = response.data.choices[0].message.content || "Kechirasiz, hozir javob bera olmayman.";
            bot.sendMessage(chatId, `🤖: ${aiResponse}`, { parse_mode: 'HTML' });
        } catch (err) {
            bot.sendMessage(chatId, "Hozirda AI ulanishda xatolik.");
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
                return bot.sendMessage(chatId, `🎊 Akkauntingiz muvaffaqiyatli bog'landi!`, { parse_mode: 'HTML', ...getMainMenu() });
            }
        }
        bot.sendMessage(chatId, i18n.uz.welcome(msg.from.first_name), { parse_mode: 'HTML', ...getMainMenu() });
    });

    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;
        if (!text || text.startsWith('/')) return;

        if (text === i18n.uz.menu_courses) return sendCourses(chatId);
        if (text === i18n.uz.menu_profile) return sendProfile(chatId);
        if (text === i18n.uz.menu_top) return sendTop(chatId);
        if (text === i18n.uz.menu_lughat) return sendLughat(chatId);
        if (text === i18n.uz.menu_ai) return bot.sendMessage(chatId, i18n.uz.ai_welcome);
        if (text === i18n.uz.menu_help) return bot.sendMessage(chatId, i18n.uz.help_text, { parse_mode: 'HTML' });
        if (text === i18n.uz.menu_about) return bot.sendMessage(chatId, `💎 <b>Arabiyya Pro</b>\n\nMarkaziy Osiyodagi eng sifatli arab tili ta'lim platformasi.`, { parse_mode: 'HTML' });

        if (text.length > 3) return askAI(chatId, text);
    });

    bot.on('callback_query', (query) => {
        const data = query.data;
        if (data.startsWith('course_detail_')) {
            const level = data.replace('course_detail_', '').toUpperCase();
            bot.sendMessage(query.message.chat.id, `📝 <b>${level} Kursi:</b>\n\nBu darajada siz tilni chuqur o'rganasiz.`, { parse_mode: 'HTML' });
        }
    });
};

export const sendBotNotification = (chatId, message) => {
    if (bot && chatId) bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
};
