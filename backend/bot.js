import TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Configuration
const WEB_URL = 'https://arabiyya.pro';
const API_URL = 'https://arabiyya-pro-backend.onrender.com/api';

let botInstance = null;

export const initBot = () => {
    if (botInstance) {
        console.log('🤖 BotInstance allaqachon mavjud.');
        return botInstance;
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
        console.error('❌ TELEGRAM_BOT_TOKEN topilmadi.');
        return;
    }

    // Singleton check with more reliability
    botInstance = new TelegramBot(token, { polling: true });

    console.log('✅ Arabiyya Pro Professional Bot ishga tushdi.');

    // Graceful Polling Error Handling (409 Conflict handled by logic)
    botInstance.on('polling_error', (error) => {
        if (error.code === 'ETELEGRAM' && error.message.includes('409 Conflict')) {
            // Ignore Render transition conflicts
            return;
        }
        console.error('🤖 Polling Error:', error.message);
    });

    // --- Keyboards ---
    const mainKeyboard = {
        reply_markup: {
            keyboard: [
                [{ text: '🌐 Platformaga kirish' }],
                [{ text: '💎 Akademiya haqida' }, { text: '📚 O\'quv dasturlari' }],
                [{ text: '👤 Mening Profilim' }, { text: '🏆 Reyting (Top 10)' }],
                [{ text: '🤖 AI Mentor (24/7)' }, { text: '👑 Premium Tariflar' }],
                [{ text: '📜 Sertifikatlarim' }, { text: '✨ Kun hikmati' }],
                [{ text: '📞 Yordam markazi' }]
            ],
            resize_keyboard: true
        }
    };

    const courseKeyboard = {
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

    // --- Core Logic ---

    botInstance.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;

        if (!text) return;

        // /start logic
        if (text === '/start') {
            try {
                await axios.post(`${API_URL}/auth/telegram-login`, {
                    telegramId: chatId.toString(),
                    name: msg.from.first_name,
                    username: msg.from.username
                });

                const welcomeMsg = `<b>Assalomu alaykum, muhtaram ${msg.from.first_name}! ✨</b>\n\n` +
                    `<b>Arabiyya Pro Academy</b> — Arab tili oliy akademiyasining rasmiy intellektual yordamchisiga xush kelibsiz.\n\n` +
                    `Siz bu yerda o'z bilim darajangizni xalqaro darajada tizimlashtirishingiz, professional AI Mentor bilan muloqot qilishingiz mumkin.\n\n` +
                    `🚀 <i>O'rganishni boshlash uchun quyidagi menyudan foydalaning:</i>`;

                return botInstance.sendMessage(chatId, welcomeMsg, {
                    parse_mode: 'HTML',
                    ...mainKeyboard
                });
            } catch (err) {
                return botInstance.sendMessage(chatId, "Hush kelibsiz! Arabiyya Pro platformasidan foydalanishingiz mumkin.", mainKeyboard);
            }
        }

        // Menu Switch
        switch (text) {
            case '🌐 Platformaga kirish':
                return botInstance.sendMessage(chatId, "<b>🚀 ARABIYYA PRO PLATFORMASI</b>\n\nBarcha interaktiv video darslar, mashqlar va shaxsiy tahlillar platformada joylashgan:", {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [[{ text: '🌐 Platformaga o\'tish', url: WEB_URL }]]
                    }
                });

            case '💎 Akademiya haqida':
                return botInstance.sendMessage(chatId,
                    "<b>💎 ARABIYYA PRO ACADEMY — INNOVATSION TA'LIM</b>\n\n" +
                    "Biz Markaziy Osiyodagi eng ilg'or va professional arab tili akademiyasimiz.\n\n" +
                    "✅ <b>AI Mentor:</b> 24/7 shaxsiy o'qituvchi.\n" +
                    "✅ <b>CEFR:</b> Xalqaro standartdagi tizim.\n" +
                    "✅ <b>Sertifikat:</b> Rasmiy daraja hujjati.\n\n" +
                    "Bilim olishni hoziroq boshlang:", {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '🚀 Akademiyaga kirish', url: WEB_URL }],
                            [{ text: '📚 Kurslarimiz', callback_data: 'view_courses' }]
                        ]
                    }
                });

            case '📚 O\'quv dasturlari':
                return botInstance.sendMessage(chatId, "<b>📚 AKADEMIK KURSLAR</b>\n\nO'zingizga mos darajani tanlang:", {
                    parse_mode: 'HTML',
                    reply_markup: courseKeyboard.reply_markup
                });

            case '👤 Mening Profilim':
                try {
                    const res = await axios.get(`${API_URL}/auth/telegram-profile`, {
                        headers: { 'x-telegram-id': chatId.toString() }
                    });
                    if (res.data.success) {
                        const u = res.data.user;
                        const status = u.isPremium ? '👑 PREMIUM' : '🥈 Standart';
                        const profile = `<b>👤 TALABA PROFILI</b>\n\n` +
                            `▫️ <b>Ism:</b> ${u.name}\n` +
                            `▫️ <b>Daraja:</b> ${u.level}\n` +
                            `▫️ <b>Natija:</b> ${u.points} ball ✨\n` +
                            `▫️ <b>Status:</b> ${status}`;
                        return botInstance.sendMessage(chatId, profile, {
                            parse_mode: 'HTML',
                            reply_markup: {
                                inline_keyboard: [[{ text: '🔗 Platformada to\'liq ko\'rish', url: `${WEB_URL}/profile` }]]
                            }
                        });
                    }
                } catch (err) {
                    return botInstance.sendMessage(chatId, `⚠️ Profil yuklashda xato. Platformada ko'ring: ${WEB_URL}/profile`, { parse_mode: 'HTML' });
                }
                break;

            case '🏆 Reyting (Top 10)':
                try {
                    const res = await axios.get(`${API_URL}/auth/leaderboard`);
                    if (res.data.success) {
                        let leadMsg = "<b>🏆 ACADEMY TOP 10 TALABALARI</b>\n\n";
                        res.data.users.slice(0, 10).forEach((u, i) => {
                            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🔹';
                            leadMsg += `${medal} <b>${u.name}</b> — ${u.points} ball\n`;
                        });
                        return botInstance.sendMessage(chatId, leadMsg, { parse_mode: 'HTML' });
                    }
                } catch (err) {
                    return botInstance.sendMessage(chatId, "❌ Reytingni yuklashda xatolik.");
                }
                break;

            case '👑 Premium Tariflar':
                return botInstance.sendMessage(chatId,
                    "<b>👑 PREMIUM ACADEMY — IMTIYOZLAR</b>\n\n" +
                    "• Barcha PDF materiallar va video darslar\n" +
                    "• AI Mentor bilan cheksiz muloqot\n" +
                    "• Xalqaro darajadagi sertifikatlar\n\n" +
                    "<b>TARIFLAR:</b>", {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '🚀 1 Oylik (Standard) - 500k', callback_data: 'pay_monthly' }],
                            [{ text: '💎 3 Oylik (Pro) - 1.5M', callback_data: 'pay_quarterly' }],
                            [{ text: '👑 1 Yillik (Ultimate) - 4M', callback_data: 'pay_yearly' }],
                            [{ text: '💳 Platformada to\'lash', url: `${WEB_URL}/billing` }]
                        ]
                    }
                });

            case '📜 Sertifikatlarim':
                return botInstance.sendMessage(chatId, "<b>📜 XALQARO SERTIFIKATLAR</b>\n\nSertifikatlaringizni platformadan yuklab olishingiz mumkin:", {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [[{ text: '📜 Sertifikatlar bo\'limi', url: `${WEB_URL}/certificates` }]]
                    }
                });

            case '🤖 AI Mentor (24/7)':
                return botInstance.sendMessage(chatId, "<b>🤖 AI MENTOR</b>\n\nMen sizning shaxsiy o'qituvchingizman. Savolingizni yozing yoki platformaga o'ting:", {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [[{ text: '🤖 AI Mentor (Platformada)', url: `${WEB_URL}/ai-chat` }]]
                    }
                });

            case '✨ Kun hikmati':
                const wisdoms = [
                    "اطلبوا العلم من المهد إلى اللحد — Бешикдан қабргача илм изланг.",
                    "الوقت كالسيف إن لم تقطعه قطعك — Вақт қилич кабидир, агар сен уни кесмасанг, у сени кесади.",
                    "من جد وجد — Ким изланса, топади.",
                    "العلم في الصغر كالنقش في الحجر — Ёшликда ўрганилган илм тошга ўйилган нақш кабидир."
                ];
                const w = wisdoms[Math.floor(Math.random() * wisdoms.length)];
                return botInstance.sendMessage(chatId, `✨ <b>KUN HIKMATI</b>\n\n<i>${w}</i>`, { parse_mode: 'HTML' });

            case '📞 Yordam markazi':
                return botInstance.sendMessage(chatId, "<b>📞 QO'LLAB-QUVVATLASH MARKAZI</b>\n\nBiz bilan bog'lanish uchun quyidagi tugmalarni bosing:", {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '👨‍💻 Ma\'muriyat (Admin)', url: 'https://t.me/ArabiyyaPro_Admin' }],
                            [{ text: '👥 O\'quvchilar guruhi', url: 'https://t.me/ArabiyyaPro_Community' }],
                            [{ text: '🌐 Saytga o\'tish', url: WEB_URL }]
                        ]
                    }
                });

            default:
                if (text.startsWith('/')) return;
                // Treat as AI Chat
                try {
                    const wait = await botInstance.sendMessage(chatId, "🤖 <i>AI Mentor o'ylamoqda...</i>", { parse_mode: 'HTML' });
                    const aiRes = await axios.post(`${API_URL}/ai/chat`, { message: text });
                    if (aiRes.data.success) {
                        await botInstance.deleteMessage(chatId, wait.message_id);
                        return botInstance.sendMessage(chatId, `🤖 <b>AI MENTOR:</b>\n\n${aiRes.data.response}`, { parse_mode: 'HTML' });
                    }
                } catch (e) { /* silent fail */ }
                break;
        }
    });

    // --- Callback Logic ---
    botInstance.on('callback_query', async (q) => {
        const chatId = q.message.chat.id;
        const data = q.data;

        if (data === 'view_courses') {
            return botInstance.sendMessage(chatId, "<b>📚 AKADEMIK KURSLARIMIZ:</b>", { parse_mode: 'HTML', ...courseKeyboard });
        }

        if (data.startsWith('course_')) {
            const level = data.replace('course_', '');
            const info = {
                'ALPHABET': 'Arab tili harflari va talaffuzi xalqaro standartda.',
                'A1': 'Boshlang\'ich daraja - kundalik muloqot mantiqi.',
                'A2': 'O\'rta-quyi - erkin muloqot va asosiy grammatika.',
                'B1': 'O\'rta - professional matnlar va murakkab grammatika.',
                'B2': 'O\'rta-yuqori - ravon nutq va akademik bilim.',
                'C1': 'Professional - ona tili darajasidagi mukammallik.'
            }[level];

            botInstance.sendMessage(chatId, `<b>📚 Ma'lumot:</b> ${info}`, {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [[{ text: '🚀 O\'qishni boshlash', url: `${WEB_URL}/#levels` }]]
                }
            });
        }

        if (data.startsWith('pay_')) {
            botInstance.sendMessage(chatId, "💳 To'lovni xavfsiz amalga oshirish uchun platformaga o'ting:", {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [[{ text: '💳 Platformada to\'lash', url: `${WEB_URL}/billing` }]]
                }
            });
        }

        botInstance.answerCallbackQuery(q.id);
    });

    return botInstance;
};

// Graceful exit for Render deployment
const shutdown = () => {
    if (botInstance) {
        botInstance.stopPolling();
        console.log('🛑 Bot pollling to\'xtatildi.');
        process.exit(0);
    }
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export const sendBotNotification = (chatId, message) => {
    if (botInstance && chatId) botInstance.sendMessage(chatId, message, { parse_mode: 'HTML' });
};
