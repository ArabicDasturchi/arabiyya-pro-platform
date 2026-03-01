import TelegramBot from 'node-telegram-bot-api';
import User from './models/User.js';

let bot;

// Admin chat ID for forwarding messages from users
// In a real scenario, you would find this ID after the admin first starts the bot
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || '6122615431'; // Default placeholder or real ID if known

export const initBot = () => {
    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
        console.log('⚠️ TELEGRAM_BOT_TOKEN kiritilmagan. Bot ishga tushmadi.');
        return;
    }

    // Initialize bot
    bot = new TelegramBot(token, { polling: true });

    // Handle Polling errors
    bot.on('polling_error', (error) => {
        if (error.code === 'ETELEGRAM' && error.message.includes('409')) {
            return;
        }
        console.error('Bot Polling Error:', error);
    });

    console.log('🤖 Telegram bot ishga tushdi (Professional Mode)...');

    // Arabic Wisdom Library
    const wisdoms = [
        { ar: "العلم في الصغر كالنقش على الحجر", uz: "Yoshlikda o'rganilgan ilm toshga o'yilgan naqsh kabidir." },
        { ar: "من جد وجد ومن زرع حصد", uz: "Kim intilsa, erishadi; kim eksa, o'radi." },
        { ar: "الوقت كالسيف إن لم تقطعه قطعك", uz: "Vaqt qilich kabidir, agar sen uni kesmasang, u seni kesadi." },
        { ar: "الصبر مفتاح الفرج", uz: "Sabr — shodlik kalitidir." },
        { ar: "اطلبوا العلم من المهد إلى اللحد", uz: "Beshikdan qabrgacha ilm izla." }
    ];

    // Main Menu
    const getMainMenu = () => ({
        reply_markup: {
            keyboard: [
                [{ text: '🌐 Platforma haqida' }, { text: '📚 Kurslar' }],
                [{ text: '👤 Mening Profilim' }, { text: '🏆 Reyting (Top 10)' }],
                [{ text: '✨ Kun hikmati' }, { text: '✉️ Adminga murojaat' }],
                [{ text: '📞 Yordam' }]
            ],
            resize_keyboard: true,
            is_persistent: true
        }
    });

    // Register Commands
    bot.setMyCommands([
        { command: '/start', description: 'Botni ishga tushirish' },
        { command: '/profile', description: 'Profil ma\'lumotlarini ko\'rish' },
        { command: '/courses', description: 'Barcha kurslar ro\'yxati' },
        { command: '/top', description: 'O\'quvchilar reytingi' },
        { command: '/wisdom', description: 'Kun hikmati' },
        { command: '/help', description: 'Yordam' }
    ]);

    // Command: /start
    bot.onText(/\/start(?:\s+(.+))?/, async (msg, match) => {
        const chatId = msg.chat.id;
        const name = msg.from.first_name;
        const code = match ? match[1] : null;

        if (code) {
            try {
                const user = await User.findOne({ telegramSyncCode: code });
                if (user) {
                    user.telegramChatId = chatId;
                    user.telegramUsername = msg.from.username || '';
                    user.telegramSyncCode = undefined;
                    await user.save();

                    const successMsg = `🎊 <b>Muborak bo'lsin, ${user.name}!</b>\n\n` +
                        `Sizning platformadagi hisobingiz muvaffaqiyatli ulandi. ` +
                        `Endi dars natijalari va yangiliklarni bevosita shu yerda qabul qilasiz. ✅`;

                    await bot.sendMessage(chatId, successMsg, { parse_mode: 'HTML', ...getMainMenu() });
                    return;
                } else {
                    await bot.sendMessage(chatId, `❌ <b>Xatolik!</b>\nUlanish kodi yaroqsiz yoki eskirgan.`, { parse_mode: 'HTML', ...getMainMenu() });
                }
            } catch (err) {
                console.error("Link error:", err);
            }
        }

        const welcomeText = `Assalomu alaykum, <b>${name}</b>! ✨\n\n` +
            `🎓 <b>Arabiyya Pro</b> — Arab tilini professional darajada o'rganish markaziga xush kelibsiz!\n\n` +
            `Ushbu bot orqali siz:\n` +
            `🔹 O'zingizning o'qish <b>progressingizni</b> ko'rishingiz\n` +
            `🔹 Kurslar haqida <b>ma'lumot</b> olishingiz\n` +
            `🔹 <b>Kun hikmati</b> bilan til boyligingizni oshirishingiz mumkin.\n\n` +
            `🚀 <i>O'rganishni boshlashga tayyormisiz?</i>`;

        bot.sendMessage(chatId, welcomeText, { parse_mode: 'HTML', ...getMainMenu() });
    });

    // Command: /wisdom
    const sendWisdom = async (chatId) => {
        const wisdom = wisdoms[Math.floor(Math.random() * wisdoms.length)];
        const text = `✨ <b>Kun hikmati</b>\n\n` +
            `<pre>“${wisdom.ar}”</pre>\n\n` +
            `📝 <b>Tarjimasi:</b>\n<i>“${wisdom.uz}”</i>`;
        await bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
    };
    bot.onText(/\/wisdom/, (msg) => sendWisdom(msg.chat.id));

    // Profile retrieval
    const sendProfile = async (chatId) => {
        try {
            const user = await User.findOne({ telegramChatId: chatId });
            if (user) {
                const lessonsCount = user.completedLessons?.length || 0;
                const levelsCount = user.completedLevels?.length || 0;

                const profileText = `👤 <b>SHAXSIY PROFIL</b>\n` +
                    `──────────────────\n` +
                    `📝 <b>Ism:</b> ${user.name}\n` +
                    `📧 <b>Email:</b> ${user.email}\n` +
                    `📊 <b>Daraja:</b> ${user.currentLevel || 'Yangi'}\n\n` +
                    `🏆 <b>Yutuqlar:</b>\n` +
                    `✅ ${lessonsCount} ta dars yakunlandi\n` +
                    `🎓 ${levelsCount} ta bosqich tugatildi\n` +
                    `⏰ ${user.totalTimeSpent || 0} daqiqa bilim olindi\n` +
                    `──────────────────\n` +
                    `💡 <i>O'qishda davom eting, natijalar kutilganidan ham yaxshi bo'ladi!</i>`;

                const keyboard = {
                    reply_markup: {
                        inline_keyboard: [[{ text: "🖥 Veb-saytga kirish", url: "https://arabiyya.pro" }]]
                    }
                };
                await bot.sendMessage(chatId, profileText, { parse_mode: 'HTML', ...keyboard });
            } else {
                await bot.sendMessage(chatId, `🙁 <b>Profil topilmadi.</b>\n\nIltimos, avval platformamizda ro'yxatdan o'tib, Telegramni sozlamalar orqali ulang.`, { parse_mode: 'HTML' });
            }
        } catch (err) {
            console.error(err);
        }
    };
    bot.onText(/\/profile/, (msg) => sendProfile(msg.chat.id));

    // Top Rating
    const sendTop = async (chatId) => {
        try {
            const topUsers = await User.find({}).sort({ totalTimeSpent: -1 }).limit(10);
            let text = `🏆 <b>TOP 10 O'QUVCHILAR REYTINGI</b>\n\n`;
            topUsers.forEach((u, i) => {
                const icon = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🔹';
                text += `${icon} <b>${u.name}</b> — ${u.totalTimeSpent || 0} ball\n`;
            });
            await bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
        } catch (err) {
            console.error(err);
        }
    };
    bot.onText(/\/top/, (msg) => sendTop(msg.chat.id));

    // Admin message state
    const userState = {};

    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;

        if (!text || text.startsWith('/')) return;

        // Custom Keyboards handling
        if (text === '✨ Kun hikmati') return sendWisdom(chatId);
        if (text === '👤 Mening Profilim') return sendProfile(chatId);
        if (text === '🏆 Reyting (Top 10)') return sendTop(chatId);
        if (text === '📚 Kurslar') {
            const coursesMsg = `📚 <b>MAVJUD KURSLARIMIZ</b>\n\n` +
                `1. <b>Alippbo</b> — Arab harflari va maxraj.\n` +
                `2. <b>A1-A2</b> — Boshlang'ich muloqot.\n` +
                `3. <b>B1-B2</b> — O'rta daraja (Grammatika).\n` +
                `4. <b>C1-C2</b> — Professional daraja.\n\n` +
                `Darslarni saytda yoki bot orqali doimiy kuzatishingiz mumkin.`;
            return bot.sendMessage(chatId, coursesMsg, { parse_mode: 'HTML' });
        }
        if (text === '✉️ Adminga murojaat') {
            userState[chatId] = 'WAITING_ADMIN_MSG';
            return bot.sendMessage(chatId, `📝 <b>Murojaatingizni yozib qoldiring:</b>\n\nBarcha xabarlar ko'rib chiqiladi va javob beriladi.`, { parse_mode: 'HTML' });
        }
        if (text === '📞 Yordam') {
            const help = `🆘 <b>YORDAM</b>\n\n` +
                `Muammo yuzaga kelsa:\n` +
                `👤 <b>Admin:</b> @Humoyun_Arabia\n` +
                `📞 <b>Tel:</b> +998 50 571 63 98\n\n` +
                `<i>Siz bilan hamkorlikdan mamnunmiz!</i>`;
            return bot.sendMessage(chatId, help, { parse_mode: 'HTML' });
        }
        if (text === '🌐 Platforma haqida') {
            const about = `💎 <b>Arabiyya Pro</b>\n\nArab tilini oson va sifatli o'rgatish uchun tashkil etilgan zamonaviy platforma. Biz bilan til o'rganish qiziqarli va samarali!`;
            return bot.sendMessage(chatId, about, { parse_mode: 'HTML' });
        }

        // Process admin message forwarding
        if (userState[chatId] === 'WAITING_ADMIN_MSG') {
            userState[chatId] = null;
            const userRef = msg.from.username ? `@${msg.from.username}` : msg.from.first_name;

            // Forward to admin (if ID exists)
            if (ADMIN_CHAT_ID) {
                const adminForward = `📩 <b>YANGI MUROJAAT!</b>\n\n` +
                    `👤 <b>Kimdan:</b> ${msg.from.first_name} (${userRef})\n` +
                    `🆔 <b>ID:</b> <code>${chatId}</code>\n\n` +
                    `💬 <b>Murojaat:</b>\n<i>“${text}”</i>`;

                bot.sendMessage(ADMIN_CHAT_ID, adminForward, { parse_mode: 'HTML' });
            }

            return bot.sendMessage(chatId, `✅ <b>Murojaatingiz qabul qilindi.</b> Rahmat!`, { parse_mode: 'HTML', ...getMainMenu() });
        }

        // Default
        bot.sendMessage(chatId, `Tushunmadim. Marhamat, menyudan foydalaning.`, { ...getMainMenu() });
    });
};

/**
 * Send custom notification to a user via Telegram
 * @param {string} chatId - Telegram chat ID of the user
 * @param {string} message - HTML formatted message
 */
export const sendNotification = async (chatId, message) => {
    if (!bot || !chatId) return;
    try {
        await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    } catch (err) {
        console.error("Notify error:", err);
    }
};

export const getBot = () => bot;
