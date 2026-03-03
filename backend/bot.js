import TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const WEB_URL = 'https://arabiyya.pro';
const API_URL = 'https://arabiyya-pro-backend.onrender.com/api';

let botInstance = null;

export const initBot = () => {
    if (botInstance) return botInstance;

    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return;

    // Initialize bot
    botInstance = new TelegramBot(token, { polling: true });

    console.log('✅ Arabiyya Pro Professional Bot ishga tushdi.');

    // Graceful Polling Error Handling
    botInstance.on('polling_error', (error) => {
        if (error.code === 'ETELEGRAM' && error.message.includes('409 Conflict')) {
            // This happens on Render during deployment transitions
            return;
        }
        console.error('Polling error:', error.message);
    });

    // --- Keyboards ---
    const layouts = {
        main: {
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
        },
        courses: {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'ا Alippbo (Kirish)', callback_data: 'course_ALPHABET' }],
                    [{ text: '🇦 A1 (Boshlang\'ich)', callback_data: 'course_A1' }, { text: '🇧 A2 (O\'rta-quyi)', callback_data: 'course_A2' }],
                    [{ text: '🇨 B1 (O\'rta)', callback_data: 'course_B1' }, { text: '🇩 B2 (O\'rta-yuqori)', callback_data: 'course_B2' }],
                    [{ text: '🎓 C1-C2 (Professional)', callback_data: 'course_C1' }],
                    [{ text: '🌐 Barcha kurslarni ko\'rish', url: WEB_URL + '/#levels' }]
                ]
            }
        },
        premium: {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🚀 1 Oylik (Standard) - 500,000 UZS', callback_data: 'pay_monthly' }],
                    [{ text: '💎 3 Oylik (Professional) - 1,500,000 UZS', callback_data: 'pay_quarterly' }],
                    [{ text: '👑 1 Yillik (Ultimate) - 4,000,000 UZS', callback_data: 'pay_yearly' }],
                    [{ text: '💳 Platformada to\'lov qilish', url: WEB_URL + '/billing' }]
                ]
            }
        }
    };

    // --- Message Logic ---

    botInstance.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;

        if (!text) return;

        // 1. Handle Commands
        if (text === '/start') {
            try {
                await axios.post(API_URL + '/auth/telegram-login', {
                    telegramId: chatId.toString(),
                    name: msg.from.first_name,
                    username: msg.from.username
                });
                const welcome = `Assalomu alaykum, muhtaram *${msg.from.first_name}*! ✨\n\n` +
                    `*Arabiyya Pro Academy* — Arab tili oliy akademiyasining rasmiy intellektual yordamchisiga xush kelibsiz.\n\n` +
                    `Professional o'rganishni boshlash uchun quyidagi menyudan foydalaning:`;
                return botInstance.sendMessage(chatId, welcome, { parse_mode: 'Markdown', ...layouts.main });
            } catch (err) {
                return botInstance.sendMessage(chatId, "Hush kelibsiz! Arabiyya Pro platformasidan foydalanishingiz mumkin.", layouts.main);
            }
        }

        // 2. Handle Menu Actions
        switch (text) {
            case '🌐 Platformaga kirish':
                return botInstance.sendMessage(chatId, "🚀 *ARABIYYA PRO PLATFORMASI*\n\nBarcha interaktiv darslar, video materiallar va shaxsiy AI tahlillar platformada joylashgan:", {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [[{ text: '🌐 Platformani ochish', url: WEB_URL }]]
                    }
                });

            case '💎 Akademiya haqida':
                return botInstance.sendMessage(chatId,
                    "💎 *ARABIYYA PRO ACADEMY — INNOVATSION TA'LIM*\n\n" +
                    "Biz Markaziy Osiyodagi eng ilg'or arab tili akademiyasimiz.\n\n" +
                    "✅ *AI Mentor:* 24/7 shaxsiy o'qituvchi.\n" +
                    "✅ *CEFR:* Xalqaro standartdagi tizim.\n" +
                    "✅ *Sertifikat:* Rasmiy daraja hujjati.\n\n" +
                    "Bilim olishni hoziroq boshlang:", {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '🚀 Akademiyaga kirish', url: WEB_URL }],
                            [{ text: '📚 Kurslarimiz', callback_data: 'view_courses' }]
                        ]
                    }
                });

            case '📚 O\'quv dasturlari':
                return botInstance.sendMessage(chatId, "📚 *AKADEMIK KURSLAR*\n\nO'zingizga mos darajani tanlang:", {
                    parse_mode: 'Markdown',
                    ...layouts.courses
                });

            case '👤 Mening Profilim':
                try {
                    const res = await axios.get(API_URL + '/auth/telegram-profile', {
                        headers: { 'x-telegram-id': chatId.toString() }
                    });
                    if (res.data.success) {
                        const u = res.data.user;
                        const status = u.isPremium ? '👑 PREMIUM' : '🥈 Standart';
                        const profile = `👤 *TALABA PROFILI*\n\n` +
                            `▫️ *Ism:* ${u.name}\n` +
                            `▫️ *Daraja:* ${u.level}\n` +
                            `▫️ *Natija:* ${u.points} ball ✨\n` +
                            `▫️ *Status:* ${status}`;
                        return botInstance.sendMessage(chatId, profile, {
                            parse_mode: 'Markdown',
                            reply_markup: {
                                inline_keyboard: [[{ text: '🔗 Platformada to\'liq ko\'rish', url: WEB_URL + '/profile' }]]
                            }
                        });
                    }
                } catch (err) {
                    return botInstance.sendMessage(chatId, "⚠️ Profil ma'lumotlarini yuklashda xatolik. Saytga kiring: " + WEB_URL + "/profile");
                }
                break;

            case '🏆 Reyting (Top 10)':
                try {
                    const res = await axios.get(API_URL + '/auth/leaderboard');
                    if (res.data.success) {
                        let leadMsg = "🏆 *ACADEMY TOP 10 TALABALARI*\n\n";
                        res.data.users.slice(0, 10).forEach((u, i) => {
                            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🔹';
                            leadMsg += `${medal} *${u.name}* — ${u.points} ball\n`;
                        });
                        return botInstance.sendMessage(chatId, leadMsg, { parse_mode: 'Markdown' });
                    }
                } catch (err) {
                    return botInstance.sendMessage(chatId, "❌ Reyting xatoligi.");
                }
                break;

            case '👑 Premium Tariflar':
                return botInstance.sendMessage(chatId,
                    "👑 *PREMIUM ACADEMY — IMTIYOZLAR*\n\n" +
                    "• Barcha PDF materiallar va darslar\n" +
                    "• AI Mentor bilan cheksiz chat\n" +
                    "• Rasmiy sertifikatlar\n\n" +
                    "*TARIFLAR:*", {
                    parse_mode: 'Markdown',
                    ...layouts.premium
                });

            case '📜 Sertifikatlarim':
                return botInstance.sendMessage(chatId, "📜 *XALQARO SERTIFIKATLAR*\n\nSizning barcha yutuqlaringiz va sertifikatlaringiz platformada saqlanadi:", {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [[{ text: '📜 Sertifikatlar bo\'limi', url: WEB_URL + '/certificates' }]]
                    }
                });

            case '🤖 AI Mentor (24/7)':
                return botInstance.sendMessage(chatId, "🤖 *AI MENTOR*\n\nMen sizga arab tili grammatikasi va tarjimada yordam beraman. Savolingizni yozing yoki platformaga o'ting:", {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [[{ text: '🤖 AI Mentor Platformada', url: WEB_URL + '/ai-chat' }]]
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
                return botInstance.sendMessage(chatId, "✨ *KUN HIKMATI*\n\n_" + w + "_", { parse_mode: 'Markdown' });

            case '📞 Yordam markazi':
                return botInstance.sendMessage(chatId, "📞 *QO'LLAB-QUVVATLASH*\n\nBiz bilan bog'lanish yo'llari:", {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '👨‍💻 Ma\'muriyat (Admin)', url: 'https://t.me/ArabiyyaPro_Admin' }],
                            [{ text: '👥 O\'quvchilar guruhi', url: 'https://t.me/ArabiyyaPro_Community' }],
                            [{ text: '🌐 Veb-sayt', url: WEB_URL }]
                        ]
                    }
                });

            default:
                if (text.startsWith('/')) return;
                // AI Chat
                try {
                    const wait = await botInstance.sendMessage(chatId, "🤖 _AI Mentor o'ylamoqda..._", { parse_mode: 'Markdown' });
                    const aiRes = await axios.post(API_URL + '/ai/chat', { message: text });
                    if (aiRes.data.success) {
                        await botInstance.deleteMessage(chatId, wait.message_id);
                        return botInstance.sendMessage(chatId, "🤖 *AI MENTOR:*\n\n" + aiRes.data.response, { parse_mode: 'Markdown' });
                    }
                } catch (e) { /* ignore */ }
                break;
        }
    });

    // Callback Queries
    botInstance.on('callback_query', async (q) => {
        const chatId = q.message.chat.id;
        const data = q.data;

        if (data.startsWith('course_')) {
            const level = data.replace('course_', '');
            const info = {
                'ALPHABET': 'Arab tili harflari va talaffuzi.',
                'A1': 'Boshlang\'ich daraja - kundalik muloqot.',
                'A2': 'O\'rta-quyi - erkin muloqot asosi.',
                'B1': 'O\'rta - professional grammatika.',
                'B2': 'O\'rta-yuqori - murakkab mavzular.',
                'C1': 'Professional - mukammal bilim.'
            }[level];
            botInstance.sendMessage(chatId, `📚 *Ma'lumot:* ${info}`, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[{ text: '🚀 O\'qishni boshlash', url: `${WEB_URL}/#levels` }]]
                }
            });
        }

        if (data.startsWith('pay_')) {
            const p = { 'monthly': '500,000', 'quarterly': '1,500,000', 'yearly': '4,000,000' }[data.replace('pay_', '')];
            botInstance.sendMessage(chatId, `💳 To'lov miqdori: *${p} UZS*\n\nXavfsiz to'lov uchun platformaga o'ting:`, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[{ text: '💳 Platformada to\'lash', url: WEB_URL + '/billing' }]]
                }
            });
        }

        if (data === 'view_courses') {
            botInstance.sendMessage(chatId, "📚 *KURS BOSQICHLARI:*", layouts.courses);
        }

        botInstance.answerCallbackQuery(q.id);
    });
};

// Graceful exit to prevent duplicate bots on Render
const shutdown = () => {
    if (botInstance) {
        botInstance.stopPolling();
        console.log('🛑 Bot polling to\'xtatildi.');
        process.exit(0);
    }
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export const sendBotNotification = (chatId, message) => {
    if (botInstance && chatId) botInstance.sendMessage(chatId, message, { parse_mode: 'Markdown' });
};
