/**
 * ARABIYYA PRO ACADEMY - OFFICIAL ULTIMATE BOT V12
 * Professional, Secure, and Feature-Rich for Global Learners
 * Optimized for ES Modules
 */

import TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';

// Configuration
const token = process.env.TELEGRAM_BOT_TOKEN || '7990520697:AAHl5N_Iq70A5eYI2kS1iRNDX_An_2361-o';
const API_URL = 'https://arabiyya-pro-backend.onrender.com/api';
const WEB_URL = 'https://arabiyya.pro'; // Professional Domain

let bot;

export const initBot = () => {
    if (bot) return; // Prevent multiple instances

    bot = new TelegramBot(token, { polling: true });

    console.log('--- ARABIYYA PRO ACADEMY BOT V12 IS ONLINE ---');

    // --- UTILITIES ---
    const getAuthHeaders = (chatId) => {
        return { headers: { 'x-telegram-id': chatId.toString() } };
    };

    // --- KEYBOARDS ---
    const mainKeyboard = {
        reply_markup: {
            keyboard: [
                [{ text: '💎 Akademiya haqida' }, { text: '📚 O\'quv dasturlari' }],
                [{ text: '👤 Mening Profilim' }, { text: '👑 Premium Tariflar' }],
                [{ text: '🏆 Reyting (Top 10)' }, { text: '📜 Sertifikatlarim' }],
                [{ text: '🤖 AI Mentor (24/7)' }, { text: '📞 Yordam markazi' }]
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
                [{ text: '🌐 Barcha kurslarni ko\'rish', url: `${WEB_URL}/#levels` }]
            ]
        }
    };

    const premiumKeyboard = {
        reply_markup: {
            inline_keyboard: [
                [{ text: '🚀 1 Oylik (Standard) - 300,000 UZS', callback_data: 'pay_monthly' }],
                [{ text: '💎 3 Oylik (Professional) - 800,000 UZS', callback_data: 'pay_quarterly' }],
                [{ text: '👑 1 Yillik (Ultimate) - 1,500,000 UZS', callback_data: 'pay_yearly' }],
                [{ text: '💳 Platformada to\'lov qilish', url: `${WEB_URL}/billing` }]
            ]
        }
    };

    // --- HANDLERS ---

    // /start command
    bot.onText(/\/start/, async (msg) => {
        const chatId = msg.chat.id;
        const firstName = msg.from.first_name;

        try {
            // Register or get user
            await axios.post(`${API_URL}/auth/telegram-login`, {
                telegramId: chatId.toString(),
                name: firstName,
                username: msg.from.username
            });

            const welcomeMsg = `Assalomu alaykum, muhtaram ${firstName}! ✨\n\n` +
                `*Arabiyya Pro Academy* — Markaziy Osiyodagi eng ilg'or Arab tili ta'lim tizimining rasmiy intellektual yordamchisiga xush kelibsiz.\n\n` +
                `Siz bu yerda o'z bilim darajangizni xalqaro *CEFR* standartlari asosida tizimlashtirishingiz, natijalarni real vaqtda kuzatishingiz va professional AI Mentor bilan muloqot qilishingiz mumkin.`;

            bot.sendMessage(chatId, welcomeMsg, { parse_mode: 'Markdown', ...mainKeyboard });
        } catch (err) {
            console.error('Login Error:', err.message);
            bot.sendMessage(chatId, "Assalomu alaykum! Arabiyya Pro platformasiga xush kelibsiz.", mainKeyboard);
        }
    });

    // Text commands
    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;

        if (!text || text.startsWith('/')) return;

        if (text === '💎 Akademiya haqida') {
            const aboutMsg = `💎 *ARABIYYA PRO ACADEMY — KELAJAK TA'LIMI BUGUN*\n\n` +
                `Akademiyamiz arab tilini o'rgatishda eng ilg'or texnologiyalar va jahon pedagogik metodikalarini birlashtirgan.\n\n` +
                `✅ *Individual AI Mentor:* 24/7 shaxsiy sun'iy intellekt ustozi.\n` +
                `✅ *Xalqaro Metodika:* CEFR (A1-C2) tizimli o'quv dasturi.\n` +
                `✅ *Interaktiv Analitika:* topshiriqlar darhol tekshiriladi.\n` +
                `✅ *Rasmiy Sertifikat:* Xalqaro darajadagi hujjat.\n\n` +
                `🔗 [Platformaga o'tish](${WEB_URL})`;
            bot.sendMessage(chatId, aboutMsg, { parse_mode: 'Markdown' });
        }

        else if (text === '📚 O\'quv dasturlari') {
            bot.sendMessage(chatId, "📚 *AKADEMIK KURSLARIMIZ*\n\nQuyidagi bosqichlardan birini tanlang:", { parse_mode: 'Markdown', ...coursesKeyboard });
        }

        else if (text === '👑 Premium Tariflar') {
            const pricingMsg = `👑 *PREMIUM ACADEMY — INTELLECTUAL INVESTITSIYA*\n\n` +
                `Premium obuna orqali Akademiyamizning barcha imkoniyatlaridan cheksiz foydalana olasiz:\n\n` +
                `✅ Barcha (A1-C2) kurslarga kirish\n` +
                `✅ AI Mentor bilan 24/7 muloqot\n` +
                `✅ PDF qo'llanmalarni yuklab olish\n` +
                `✅ Rasmiy sertifikatlar\n\n` +
                `*Tariflar:*`;
            bot.sendMessage(chatId, pricingMsg, { parse_mode: 'Markdown', ...premiumKeyboard });
        }

        else if (text === '👤 Mening Profilim') {
            try {
                const res = await axios.get(`${API_URL}/auth/telegram-profile`, getAuthHeaders(chatId));
                if (res.data.success) {
                    const u = res.data.user;
                    const profileMsg = `👤 *TALABA PROFILI*\n\n` +
                        `▫️ *Ism:* ${u.name}\n` +
                        `▫️ *Daraja:* ${u.level || 'A1'}\n` +
                        `▫️ *Ball:* ${u.points || 0} ⭐\n` +
                        `▫️ *Premium:* ${u.isPremium ? '✅ Faol' : '❌ Faol emas'}\n\n` +
                        `[Mening Profilim](${WEB_URL}/profile)`;
                    bot.sendMessage(chatId, profileMsg, { parse_mode: 'Markdown' });
                }
            } catch (err) {
                bot.sendMessage(chatId, "Profilingizni platformada ko'ring: " + `${WEB_URL}/profile`);
            }
        }

        else if (text === '🏆 Reyting (Top 10)') {
            try {
                const res = await axios.get(`${API_URL}/auth/leaderboard`);
                if (res.data.success) {
                    const uniqueLeaders = [];
                    const seen = new Set();
                    res.data.users
                        .sort((a, b) => (b.points || 0) - (a.points || 0))
                        .forEach(u => {
                            if (!seen.has(u.name)) {
                                seen.add(u.name);
                                uniqueLeaders.push(u);
                            }
                        });

                    let leadMsg = `🏆 *ACADEMY TOP 10 TALABALARI*\n\n`;
                    uniqueLeaders.slice(0, 10).forEach((u, i) => {
                        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🔹';
                        leadMsg += `${medal} *${u.name}* — ${u.points || 0} ball\n`;
                    });
                    bot.sendMessage(chatId, leadMsg, { parse_mode: 'Markdown' });
                }
            } catch (err) {
                bot.sendMessage(chatId, "Reytingni olishda xatolik.");
            }
        }

        else if (text === '📜 Sertifikatlarim') {
            bot.sendMessage(chatId, `📜 Sertifikatlarni platformadan yuklab oling:\n\n${WEB_URL}/certificates`);
        }

        else if (text === '🤖 AI Mentor (24/7)') {
            bot.sendMessage(chatId, "🤖 *MENING ISMIM MUALLIM AI.*\n\nMen sizga arab tilini o'rganishda yordam beraman. Menga istalgan savolingizni yo'llang.");
        }

        else if (text === '📞 Yordam markazi') {
            bot.sendMessage(chatId, "📞 *ADMINISTRATSIYA*\n\n👨‍💻 Admin: @ArabiyyaPro_Admin\nSizga yordam berishdan mamnunmiz!");
        }

        // AI Chat
        else if (text.length > 3) {
            try {
                bot.sendChatAction(chatId, 'typing');
                const res = await axios.post(`${API_URL}/ai/chat`, { message: text, chatId: `tg_${chatId}` }, getAuthHeaders(chatId));
                if (res.data.success) {
                    bot.sendMessage(chatId, res.data.response);
                }
            } catch (err) {
                console.error('AI Error:', err.message);
            }
        }
    });

    // Callback queries
    bot.on('callback_query', async (query) => {
        const chatId = query.message.chat.id;
        const data = query.data;

        if (data.startsWith('course_')) {
            const levelId = data.replace('course_', '');
            const levelsInfo = {
                'ALPHABET': { t: 'Alippbo', d: 'Arab tili harflari va talaffuzi.' },
                'A1': { t: 'A1 (Boshlang\'ich)', d: 'Asosiy muloqot va grammatika.' },
                'A2': { t: 'A2 (O\'rta-quyi)', d: 'Erkinroq so\'zlashish.' },
                'B1': { t: 'B1 (O\'rta)', d: 'Professional mavzularda muloqot.' },
                'B2': { t: 'B2 (O\'rta-yuqori)', d: 'Ravon nutq.' },
                'C1': { t: 'C1-C2 (Professional)', d: 'Ona tili darajasi.' }
            };
            const info = levelsInfo[levelId];
            if (info) {
                bot.sendMessage(chatId, `📚 *${info.t}*\n\n${info.d}`, {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [[{ text: '🚀 Kursni Boshlash', url: `${WEB_URL}/#levels` }]]
                    }
                });
            }
        }

        if (data.startsWith('pay_')) {
            const prices = { 'monthly': '300,000', 'quarterly': '800,000', 'yearly': '1,500,000' };
            const period = { 'monthly': '1 Oylik', 'quarterly': '3 Oylik', 'yearly': '1 Yillik' };
            const selected = data.replace('pay_', '');

            bot.sendMessage(chatId, `💳 *${period[selected]} PREMIUM*\n\nSumma: *${prices[selected]} UZS*\n\nTo'lovni platformada amalga oshiring:`, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '💳 Platformada to\'lash', url: `${WEB_URL}/billing` }],
                        [{ text: '👨‍💻 Operator bilan bog\'lanish', url: 'https://t.me/ArabiyyaPro_Admin' }]
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
