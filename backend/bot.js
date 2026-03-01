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

    // Start buyrug'i (Kodni ushlab olish uchun Regex)
    bot.onText(/\/start(?:\s+(.+))?/, async (msg, match) => {
        const chatId = msg.chat.id;
        const name = msg.from.first_name;
        const code = match[1];

        const keyboard = {
            reply_markup: {
                keyboard: [
                    [{ text: '🌐 Platforma haqida' }, { text: '📚 Kurslar' }],
                    [{ text: '👤 Mening Profilim' }, { text: '📞 Yordam' }]
                ],
                resize_keyboard: true
            }
        };

        if (code) {
            try {
                const user = await User.findOne({ telegramSyncCode: code });
                if (user) {
                    user.telegramChatId = chatId;
                    user.telegramUsername = msg.from.username;
                    user.telegramSyncCode = undefined;
                    await user.save();

                    await bot.sendMessage(
                        chatId,
                        `✅ <b>Muvaffaqiyatli ulandi!</b>\n\nSizning platformadagi <b>${user.name}</b> akkauntingiz Telegramga ulandi. Endi siz barcha natijalaringizni shu yerdan ko'rishingiz mumkin!`,
                        { parse_mode: 'HTML', ...keyboard }
                    );
                    return;
                } else {
                    await bot.sendMessage(chatId, `❌ Ulanish kodi noto'g'ri yoki eskirgan. Sayt orqali yana bir bor urinib ko'ring.`, { ...keyboard });
                    // Shunda ham start xabarini ko'rsatish
                }
            } catch (err) {
                console.log("Bot link eror: ", err);
            }
        }

        bot.sendMessage(
            chatId,
            `Assalomu alaykum, <b>${name}</b>!\n\nArabiyya Pro platformasining rasmiy botiga xush kelibsiz. Bu yerda siz platformamiz haqida ma'lumot olishingiz, kurslarni ko'rib chiqishingiz va o'z hisobingizni boshqarishingiz mumkin.`,
            { parse_mode: 'HTML', ...keyboard }
        );
    });

    // Matnli xabarlarni ushlash
    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;

        if (!text || text.startsWith('/start')) return; // Handled above

        if (text === '🌐 Platforma haqida') {
            const aboutText = `<b>Arabiyya Pro</b> — bu arab tilini o'rganish uchun zamonaviy va innovatsion platforma.\n\n` +
                `Biz o'quvchilarga eng samarali va qiziqarli ta'lim tajribasini taqdim etishga intilamiz. ` +
                `Platformamiz orqali arab tilini professional darajada o'rganish imkoniyatiga ega bo'lasiz.\n\n` +
                `✅ <b>Interaktiv Darslar</b>\n` +
                `✅ <b>24/7 AI Yordamchi</b>\n` +
                `✅ <b>Professional O'qituvchilar</b>\n` +
                `✅ <b>Sertifikatlar</b>`;

            await bot.sendMessage(chatId, aboutText, { parse_mode: 'HTML' });
            return;
        }

        if (text === '📚 Kurslar') {
            const coursesText = `Hozirda quyidagi darajalar mavjud:\n\n` +
                `1️⃣ <b>Arab Harflari (Maxraj)</b>\n` +
                `2️⃣ <b>A1 - Boshlang'ich</b>\n` +
                `3️⃣ <b>A2 - Elementar</b>\n` +
                `4️⃣ <b>B1 - O'rta</b>\n` +
                `5️⃣ <b>B2 - O'rta Maxsus</b>\n` +
                `6️⃣ <b>C1 - Yuqori</b>\n` +
                `7️⃣ <b>C2 - Mukammal</b>\n\n` +
                `Siz o'zingizga mos darajani platformamiz orqali tanlab o'qishni boshlashingiz mumkin.`;

            const inlineKeyboard = {
                reply_markup: {
                    inline_keyboard: [[{ text: "Saytga o'tish", url: "https://arabiyya.pro" }]] // Change URL as needed
                }
            };

            await bot.sendMessage(chatId, coursesText, { parse_mode: 'HTML', ...inlineKeyboard });
            return;
        }

        if (text === '👤 Mening Profilim') {
            try {
                const user = await User.findOne({ telegramChatId: chatId });
                if (user) {
                    const profileText = `👤 <b>${user.name}</b>\n\n` +
                        `📧 <b>Email:</b> ${user.email}\n` +
                        `📊 <b>Joriy daraja:</b> ${user.currentLevel || 'Belgilanmagan'}\n` +
                        `🏆 <b>Tugatilgan darslar:</b> ${user.completedLessons?.length || 0} ta\n` +
                        `🎓 <b>Tugatilgan bosqichlar:</b> ${user.completedLevels?.length || 0} ta\n\n` +
                        `Platformada o'qishni davom ettiring!`;

                    const inlineKeyboard = {
                        reply_markup: {
                            inline_keyboard: [[{ text: "Saytga o'tish", url: "https://arabiyya.pro" }]]
                        }
                    };
                    await bot.sendMessage(chatId, profileText, { parse_mode: 'HTML', ...inlineKeyboard });
                } else {
                    const profileText = `Sizning profilingiz hali veb-saytga ulanmagan.\n\nAkkauntni boshqarish va natijalaringizni shu yerda ko'rish uchun saytga kirib, <b>"Profil"</b> bo'limidan <b>"Telegramga ulash"</b> tugmasini bosing!`;
                    await bot.sendMessage(chatId, profileText, { parse_mode: 'HTML' });
                }
            } catch (err) {
                await bot.sendMessage(chatId, "Serverda xatolik yuz berdi. Iltimos keyinroq urinib ko'ring.");
            }
            return;
        }

        if (text === '📞 Yordam') {
            const helpText = `Agar sizda savollar tug'ilsa, quyidagi raqamlarga yoki admin profiliga yozishingiz mumkin:\n\n👨‍💻 Admin: @arabiyya_admin\n📞 Tel: +998 90 123 45 67`;
            await bot.sendMessage(chatId, helpText);
            return;
        }

        // Default 
        bot.sendMessage(chatId, `Kechirasiz, men bu buyruqni tushunmadim. Iltimos, menyudan foydalaning.`);
    });
};

export const getBot = () => bot;
