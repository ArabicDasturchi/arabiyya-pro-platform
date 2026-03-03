import TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const WEB_URL = 'https://arabiyya.pro';
const API_URL = 'https://arabiyya-pro-backend.onrender.com/api';

let bot;
let isBotInitialized = false;

export const initBot = () => {
    if (isBotInitialized) {
        console.log('🤖 Bot allaqachon ishlayapti, qayta yuklash rad etildi.');
        return bot;
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
        console.log('❌ TELEGRAM_BOT_TOKEN topilmadi.');
        return;
    }

    bot = new TelegramBot(token, { polling: true });
    isBotInitialized = true;

    console.log('✅ Arabiyya Pro Bot muvaffaqiyatli ishga tushdi.');

    // Keyboards
    const mainKeyboard = {
        reply_markup: {
            keyboard: [
                [{ text: '💎 Akademiya haqida' }, { text: '📚 O\'quv dasturlari' }],
                [{ text: '👤 Mening Profilim' }, { text: '👑 Premium Tariflar' }],
                [{ text: '🏆 Reyting (Top 10)' }, { text: '📜 Sertifikatlarim' }],
                [{ text: '🤖 AI Mentor (24/7)' }, { text: '✨ Kun hikmati' }],
                [{ text: '📞 Yordam markazi' }]
            ],
            resize_keyboard: true
        }
    };

    const coursesKeyboard = {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'ا Alippbo (Kirish)', callback_data: 'course_ALPHABET' }],
                [{ text: '🇦 A1 (Boshlang\'ich)', callback_data: 'course_A1' }, { text: '🇧 A2 (O\'rta-quyi)', callback_data: 'course_A2' }],
                [{ text: '🇨 B1 (O\'rta)', callback_data: 'course_B1' }, { text: '🇩 B2 (O\'rta-yuqori)', callback_data: 'course_B2' }],
                [{ text: '🎓 C1-C2 (Professional)', callback_data: 'course_C1' }],
                [{ text: '🌐 Barcha kurslarni ko\'rish', url: WEB_URL + '/#levels' }]
            ]
        }
    };

    const premiumKeyboard = {
        reply_markup: {
            inline_keyboard: [
                [{ text: '🚀 1 Oylik (Standard) - 500,000 UZS', callback_data: 'pay_monthly' }],
                [{ text: '💎 3 Oylik (Professional) - 1,500,000 UZS', callback_data: 'pay_quarterly' }],
                [{ text: '👑 1 Yillik (Ultimate) - 5,000,000 UZS', callback_data: 'pay_yearly' }],
                [{ text: '💳 Platformada to\'lov qilish', url: WEB_URL + '/billing' }]
            ]
        }
    };

    // Handlers
    bot.onText(/\/start/, async (msg) => {
        const chatId = msg.chat.id;
        const firstName = msg.from.first_name;

        try {
            await axios.post(API_URL + '/auth/telegram-login', {
                telegramId: chatId.toString(),
                name: firstName,
                username: msg.from.username
            });

            const welcomeMsg = "Assalomu alaykum, muhtaram *" + firstName + "*! ✨\n\n" +
                "*Arabiyya Pro Academy* — Arab tili oliy akademiyasining rasmiy intellektual boti.\n\n" +
                "Siz bu yerda o'z bilimingizni xalqaro *CEFR* standartlari asosida tizimlashtirishingiz, AI Mentor bilan o'qishingiz va xalqaro sertifikatlarga ega bo'lishingiz mumkin.\n\n" +
                "Quyidagi menyudan foydalaning:";

            bot.sendMessage(chatId, welcomeMsg, { parse_mode: 'Markdown', ...mainKeyboard });
        } catch (err) {
            bot.sendMessage(chatId, "Assalomu alaykum! Arabiyya Pro Akademiyasiga xush kelibsiz.", mainKeyboard);
        }
    });

    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;

        if (!text || text.startsWith('/')) return;

        if (text === '💎 Akademiya haqida') {
            const aboutMsg = "💎 *ARABIYYA PRO ACADEMY — KELAJAK TA'LIMI BUGUN*\n\n" +
                "Biz Markaziy Osiyodagi eng ilg'or va innovatsion arab tili platformasimiz.\n\n" +
                "✅ *AI Mentor:* 24/7 shaxsiy sun'iy intellekt o'qituvchisi.\n" +
                "✅ *CEFR:* Xalqaro (A1-C2) standartidagi tizimli dastur.\n" +
                "✅ *Analitika:* Har bir javobingiz AI tomonidan tahlil qilinadi.\n" +
                "✅ *Sertifikat:* Har bir daraja yakunida rasmiy hujjat.\n\n" +
                "🔗 [Akademiya Platformasi](" + WEB_URL + ")";
            bot.sendMessage(chatId, aboutMsg, { parse_mode: 'Markdown' });
        }

        else if (text === '📚 O\'quv dasturlari') {
            bot.sendMessage(chatId, "📚 *AKADEMIK KURSLARIMIZ*\n\nQuyidagi bosqichlardan birini tanlang:", { parse_mode: 'Markdown', ...coursesKeyboard });
        }

        else if (text === '👑 Premium Tariflar') {
            const pricingMsg = "👑 *PREMIUM ACADEMY — INTELLECTUAL INVESTITSIYA*\n\n" +
                "Premium obuna orqali cheksiz imkoniyatga ega bo'ling:\n\n" +
                "✅ Barcha kurslar va PDF kitoblar\n" +
                "✅ AI Mentor bilan cheksiz muloqot\n" +
                "✅ Xalqaro darajadagi sertifikatlar\n\n" +
                "*PREMIUM TARIFLAR:*";
            bot.sendMessage(chatId, pricingMsg, { parse_mode: 'Markdown', ...premiumKeyboard });
        }

        else if (text === '👤 Mening Profilim') {
            try {
                const res = await axios.get(API_URL + '/auth/telegram-profile', {
                    headers: { 'x-telegram-id': chatId.toString() }
                });
                if (res.data.success) {
                    const u = res.data.user;
                    const profileMsg = "👤 *TALABA PROFILI*\n\n" +
                        "▫️ *Ism:* " + u.name + "\n" +
                        "▫️ *Daraja:* " + u.level + "\n" +
                        "▫️ *Natija:* " + u.points + " ball ✨\n" +
                        "▫️ *Status:* " + (u.isPremium ? '👑 PREMIUM' : 'Standart') + "\n\n" +
                        "🔗 [Platformada ko'rish](" + WEB_URL + "/profile)";
                    bot.sendMessage(chatId, profileMsg, { parse_mode: 'Markdown' });
                }
            } catch (err) {
                bot.sendMessage(chatId, "⚠️ Profil ma'lumotlarini olishda xatolik. Iltimos, platformaga kiring: " + WEB_URL + "/profile");
            }
        }

        else if (text === '🏆 Reyting (Top 10)') {
            try {
                const res = await axios.get(API_URL + '/auth/leaderboard');
                if (res.data.success) {
                    let leadMsg = "🏆 *ACADEMY TOP 10 TALABALARI*\n\n";
                    res.data.users.slice(0, 10).forEach((u, i) => {
                        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🔹';
                        leadMsg += medal + " *" + u.name + "* — " + u.points + " ball\n";
                    });
                    bot.sendMessage(chatId, leadMsg, { parse_mode: 'Markdown' });
                }
            } catch (err) {
                bot.sendMessage(chatId, "❌ Reytingni yuklashda xatolik yuz berdi.");
            }
        }

        else if (text === '📜 Sertifikatlarim') {
            bot.sendMessage(chatId, "📜 *SERTIFIKATLAR*\n\nXalqaro sertifikatlaringizni platformaning maxsus bo'limidan yuklab olishingiz mumkin:\n\n🔗 [Sertifikatlar bo'limi](" + WEB_URL + "/certificates)", { parse_mode: 'Markdown' });
        }

        else if (text === '🤖 AI Mentor (24/7)') {
            bot.sendMessage(chatId, "🤖 *AI MENTOR BILAN MULOQOT*\n\nMen sizning shaxsiy arab tili o'qituvchingizman. Menga arab tilida har qanday savol yo'llang yoki matnni tarjima qilishni so'rang.\n\n_Hozircha AI muloqoti platformada to'liqroq amalga oshirilgan:_ \n🔗 [AI Mentor Platformasi](" + WEB_URL + "/ai-chat)", { parse_mode: 'Markdown' });
        }

        else if (text === '✨ Kun hikmati') {
            const wisdoms = [
                "اطلبوا العلم من المهد إلى اللحد — Бешикдан қабргача илм изланг.",
                "الوقت كالسيف إن لم تقطعه قطعك — Вақт қилич кабидир, агар сен уни кесмасанг, у сени кесади.",
                "من جد وجد — Ким изланса, топади.",
                "العلم في الصغر كالنقش في الحجر — Ёшликда ўрганилган илм тошга ўйилган нақш кабидир."
            ];
            const wisdom = wisdoms[Math.floor(Math.random() * wisdoms.length)];
            bot.sendMessage(chatId, "✨ *KUN HIKMATI*\n\n_" + wisdom + "_", { parse_mode: 'Markdown' });
        }

        else if (text === '📞 Yordam markazi') {
            bot.sendMessage(chatId, "📞 *AKADEMIYA QO'LLAB-QUVVATLASH*\n\nSavollaringiz bormi? Bizga murojaat qiling:\n\n👨‍💻 Admin: @ArabiyyaPro_Admin\n🌐 Sayt: [arabiyya.pro](https://arabiyya.pro)", { parse_mode: 'Markdown' });
        }

        else {
            // Treat as AI Question if it's long enough or user just clicked AI Mentor
            try {
                const typingMsg = await bot.sendMessage(chatId, "🤖 _AI Mentor o'ylamoqda..._", { parse_mode: 'Markdown' });

                const res = await axios.post(API_URL + '/ai/chat', { message: text });

                if (res.data.success) {
                    bot.deleteMessage(chatId, typingMsg.message_id);
                    bot.sendMessage(chatId, "🤖 *AI MENTOR:*\n\n" + res.data.response, { parse_mode: 'Markdown' });
                }
            } catch (err) {
                // If AI fails, just ignore or send a generic help
                console.error('Bot AI Error:', err.message);
            }
        }
    });

    bot.on('callback_query', async (query) => {
        const chatId = query.message.chat.id;
        const data = query.data;

        if (data.startsWith('course_')) {
            const levelId = data.replace('course_', '');
            const levelsInfo = {
                'ALPHABET': { t: 'Alippbo', d: 'Arab tili harflari va talaffuzi xalqaro CEFR standarti asosida.' },
                'A1': { t: 'A1 (Boshlang\'ich)', d: 'Asosiy muloqot va kundalik iboralar.' },
                'A2': { t: 'A2 (O\'rta-quyi)', d: 'Elementar darajadagi erkin muloqot.' },
                'B1': { t: 'B1 (O\'rta)', d: 'Professional darajadagi matnlar va grammatika.' },
                'B2': { t: 'B2 (O\'rta-yuqori)', d: 'Murakkab mavzularda ravon nutq.' },
                'C1': { t: 'C1 (Professional)', d: 'Ona tili darajasidagi mukammal bilim.' }
            };
            const info = levelsInfo[levelId];
            if (info) {
                bot.sendMessage(chatId, "📚 *" + info.t + "*\n\n" + info.d, {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [[{ text: '🚀 O\'qishni Boshlash', url: WEB_URL + '/#levels' }]]
                    }
                });
            }
        }

        if (data.startsWith('pay_')) {
            const prices = { 'monthly': '500,000', 'quarterly': '1,500,000', 'yearly': '5,000,000' };
            const period = { 'monthly': '1 OYLIK', 'quarterly': '3 OYLIK', 'yearly': 'YILLIK' };
            const selected = data.replace('pay_', '');

            bot.sendMessage(chatId, "💳 *" + period[selected] + " PREMIUM ACADEMY*\n\nTo'lov miqdori: *" + prices[selected] + " UZS*\n\nTo'lovni platforma orqali xavfsiz amalga oshirishingiz mumkin:", {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '💳 Platformada To\'lash', url: WEB_URL + '/billing' }],
                        [{ text: '👨‍💻 Ma\'muriyat bilan bog\'lanish', url: 'https://t.me/ArabiyyaPro_Admin' }]
                    ]
                }
            });
        }
        bot.answerCallbackQuery(query.id);
    });
};

export const sendBotNotification = (chatId, message) => {
    if (bot && chatId) bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
};
