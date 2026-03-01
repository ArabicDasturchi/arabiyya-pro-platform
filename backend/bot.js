import TelegramBot from 'node-telegram-bot-api';
import User from './models/User.js';

let bot;

export const initBot = () => {
    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
        console.log('⚠️ TELEGRAM_BOT_TOKEN kiritilmagan. Bot ishga tushmadi.');
        return;
    }

    bot = new TelegramBot(token, { polling: true });

    console.log('🤖 Telegram bot ishga tushdi...');

    // Asosiy menyu
    const getMainMenu = () => ({
        reply_markup: {
            keyboard: [
                [{ text: '🌐 Platforma haqida' }, { text: '📚 Kurslar' }],
                [{ text: '👤 Mening Profilim' }, { text: '📞 Yordam' }]
            ],
            resize_keyboard: true,
            is_persistent: true
        }
    });

    // Buyruqlarni ro'yxatdan o'tkazish
    bot.setMyCommands([
        { command: '/start', description: 'Botni ishga tushirish' },
        { command: '/profile', description: 'Profil ma\'lumotlarini ko\'rish' },
        { command: '/courses', description: 'Barcha kurslar ro\'yxati' },
        { command: '/help', description: 'Yordam va qo\'llab-quvvatlash' }
    ]);

    // Start buyrug'i (Kodni ushlab olish uchun Regex)
    bot.onText(/\/start(?:\s+(.+))?/, async (msg, match) => {
        const chatId = msg.chat.id;
        const name = msg.from.first_name;
        const code = match[1];

        // Agar ulanish kodi kiritilgan bo'lsa
        if (code) {
            try {
                const user = await User.findOne({ telegramSyncCode: code });
                if (user) {
                    user.telegramChatId = chatId;
                    user.telegramUsername = msg.from.username || '';
                    user.telegramSyncCode = undefined; // kodni ishlatilgandan so'ng tozalash
                    await user.save();

                    const successMsg = `🎉 <b>Tabriklaymiz, ${user.name}!</b>\n\n` +
                        `Sizning akkauntingiz Telegram bilan muvaffaqiyatli sinxronlashtirildi. ` +
                        `Endi barcha yangiliklar, dars eslatmalari va natijalaringiz haqida shu yerda xabardor bo'lib borasiz.`;

                    await bot.sendMessage(chatId, successMsg, { parse_mode: 'HTML', ...getMainMenu() });
                    return;
                } else {
                    await bot.sendMessage(
                        chatId,
                        `❌ <b>Ulanish kodi noto'g'ri yoki allaqachon ishlatilgan!</b>\nIltimos, platformamizga kirib yangi kod oling.`,
                        { parse_mode: 'HTML', ...getMainMenu() }
                    );
                }
            } catch (err) {
                console.error("Bot link error: ", err);
                await bot.sendMessage(chatId, `⚠️ Tizimda xatolik yuz berdi. Iltimos keyinroq urinib ko'ring.`);
            }
        }

        // Oddiy start
        const welcomeText = `Assalomu alaykum, <b>${name}</b>! ✨\n\n` +
            `🎓 <b>Arabiyya Pro</b> rasmiy botiga xush kelibsiz!\n\n` +
            `Bu yerda siz platformamizdagi o'zlashtirishingizni kuzatib borishingiz, ` +
            `muhim xabarnomalarni olishingiz va kurslarimiz bilan tanishishingiz mumkin.\n\n` +
            `👇 <i>Quyidagi menyudan kerakli bo'limni tanlang:</i>`;

        bot.sendMessage(chatId, welcomeText, { parse_mode: 'HTML', ...getMainMenu() });
    });

    // Profile command (also handles the button)
    const sendProfile = async (chatId) => {
        try {
            const user = await User.findOne({ telegramChatId: chatId });
            if (user) {
                const completedLessonsCount = user.completedLessons?.length || 0;
                const completedLevelsCount = user.completedLevels?.length || 0;

                let progressText = '';
                if (completedLevelsCount === 0 && completedLessonsCount === 0) {
                    progressText = `O'qishni boshlang! Sizda ajoyib imkoniyat bor. 🚀`;
                } else {
                    progressText = `Barakalla! Siz darslarni faol ravishda o'zlashtirmoqdasiz. 🔥`;
                }

                const profileText = `👤 <b>Foydalanuvchi:</b> ${user.name}\n` +
                    `📧 <b>Email:</b> ${user.email}\n` +
                    `──────────────\n` +
                    `📊 <b>Joriy darajangiz:</b> ${user.currentLevel || 'Belgilanmagan'}\n` +
                    `🏆 <b>Tugatilgan darslar:</b> ${completedLessonsCount} ta\n` +
                    `🎓 <b>Tugatilgan bosqichlar:</b> ${completedLevelsCount} ta\n` +
                    `──────────────\n` +
                    `<i>${progressText}</i>`;

                const inlineKeyboard = {
                    reply_markup: {
                        inline_keyboard: [[{ text: "🖥 Platformaga o'tish", url: "https://arabiyya.pro" }]]
                    }
                };
                await bot.sendMessage(chatId, profileText, { parse_mode: 'HTML', ...inlineKeyboard });
            } else {
                const profileText = `⚠️ <b>Profilingiz tasdiqlanmagan!</b>\n\n` +
                    `Sizning Telegram akkauntingiz platformamizga ulanmagan.\n\n` +
                    `✅ <b>Ulanish uchun qo'llanma:</b>\n` +
                    `1. Platformamizga (www.arabiyya.pro) shaxsiy kabinetingizga kiring.\n` +
                    `2. <b>Profil</b> bo'limiga o'ting.\n` +
                    `3. <b>Telegramga ulash</b> tugmasini bosing va maxsus kodni ushbu botga yuboring.`;

                await bot.sendMessage(chatId, profileText, { parse_mode: 'HTML' });
            }
        } catch (err) {
            console.error(err);
            await bot.sendMessage(chatId, "Serverda xatolik yuz berdi. Iltimos keyinroq urinib ko'ring.");
        }
    };

    bot.onText(/\/profile/, (msg) => sendProfile(msg.chat.id));

    // Help command
    const sendHelp = async (chatId) => {
        const helpText = `📞 <b>Yordam markazi</b>\n\n` +
            `Arabiyya Pro platformasi bo'yicha savollaringiz, takliflaringiz yoki texnik muammolar bo'lsa, biz bilan bog'laning:\n\n` +
            `👨‍💻 <b>Admin:</b> @Humoyun_Arabia\n` +
            `📱 <b>Tel:</b> +998 50 571 63 98\n\n` +
            `<i>Biz sizga yordam berishdan doimo xursandmiz!</i>`;

        await bot.sendMessage(chatId, helpText, { parse_mode: 'HTML' });
    };

    bot.onText(/\/help/, (msg) => sendHelp(msg.chat.id));

    // Courses command
    const sendCourses = async (chatId) => {
        const coursesText = `📚 <b>Arabiyya Pro Kurslari</b>\n\n` +
            `Platformamiz sizni qadam-baqadam yuqoriga olib chiqadigan tizimli darajalarga ega:\n\n` +
            `1️⃣ <b>Arab Harflari (Maxraj)</b>\n` +
            `2️⃣ <b>A1 - Boshlang'ich (Mubtadiy)</b>\n` +
            `3️⃣ <b>A2 - Elementar (Mutavassit)</b>\n` +
            `4️⃣ <b>B1 - O'rta</b>\n` +
            `5️⃣ <b>B2 - O'rta Maxsus</b>\n` +
            `6️⃣ <b>C1 - Yuqori</b>\n` +
            `7️⃣ <b>C2 - Mukammal</b>\n\n` +
            `Siz darslarni istalgan vaqtda, xohlagan qurilmangizda o'rganishingiz mumkin.`;

        const inlineKeyboard = {
            reply_markup: {
                inline_keyboard: [[{ text: "🚀 Darslarni boshlash", url: "https://arabiyya.pro/#courses" }]]
            }
        };

        await bot.sendMessage(chatId, coursesText, { parse_mode: 'HTML', ...inlineKeyboard });
    };

    bot.onText(/\/courses/, (msg) => sendCourses(msg.chat.id));

    // Matnli xabarlarni ushlash
    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;

        // Buyruqlarni e'tiborsiz qoldirish
        if (!text || text.startsWith('/')) return;

        if (text === '🌐 Platforma haqida') {
            const aboutText = `🌟 <b>Arabiyya Pro Haqida</b>\n\n` +
                `Arab tilini professional, tez va samarali o'rganish uchun yaratilgan innovatsion platforma!\n\n` +
                `🎯 <b>Nimalarga ega bo'lasiz?</b>\n` +
                `• <b>Maxsus video darslar</b>\n` +
                `• <b>Jonli va AI yordamchi 24/7</b>\n` +
                `• <b>Nazariy va amaliy mashqlar</b>\n` +
                `• <b>Shaxsiy taraqqiyot nazorati</b>\n` +
                `• <b>Rasmiy sertifikatlar</b>\n\n` +
                `<i>Biz bilan birgalikda arab tilini chuqur o'zlashtiring!</i>`;

            await bot.sendMessage(chatId, aboutText, { parse_mode: 'HTML' });
            return;
        }

        if (text === '📚 Kurslar') {
            return sendCourses(chatId);
        }

        if (text === '👤 Mening Profilim') {
            return sendProfile(chatId);
        }

        if (text === '📞 Yordam') {
            return sendHelp(chatId);
        }

        // Default handler
        const fallbackText = `Kechirasiz, <b>${msg.from.first_name}</b>, men bu xabarni tushunmadim.\n\n` +
            `Iltimos, pastdagi menyudan kerakli bo'limni tanlang yoki /help buyrug'ini bosing.`;

        bot.sendMessage(chatId, fallbackText, { parse_mode: 'HTML', ...getMainMenu() });
    });
};

export const getBot = () => bot;
