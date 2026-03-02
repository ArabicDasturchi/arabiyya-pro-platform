import TelegramBot from 'node-telegram-bot-api';
import User from './models/User.js';
import { callOpenAI } from './routes/ai.js';

let bot;

// --- Premium UI & Localization ---
const content = {
    uz: {
        welcome: (name) => `Assalomu alaykum, muhtaram <b>${name}</b>! 🌟\n\n<b>Arabiyya Pro</b> — Arab tilini professional va tizimli o'rganuvchilar uchun maxsus platformaning aqlli botiga xush kelibsiz.\n\nSiz bu yerda o'z bilim darajangizni oshirishingiz, natijalarni kuzatishingiz va jahon standartidagi o'quv materiallaridan foydalanishingiz mumkin.`,
        menu: {
            about: '🌐 Platforma haqida',
            courses: '📚 O\'quv Kurslari',
            profile: '👤 Shaxsiy Kabinet',
            top: '🏆 Reyting (Top 10)',
            ai: '🤖 AI Mentor (Ustoz)',
            lughat: '📖 Lug\'at & Qoidalar',
            wisdom: '✨ Arab Hikmatlari',
            payment: '💳 Tariflar & To\'lov',
            admin: '✉️ Adminga Murojaat',
            help: '📞 Markaziy Yordam',
            cert: '📜 Mening Sertifikatlarim'
        },
        sections: {
            about: `💎 <b>ARABIYYA PRO — TA'LIMDA INNOVATSIYA</b>\n\nBiz Markaziy Osiyodagi eng sifatli arab tili ta'limini taklif etamiz. Tizimimiz <b>CEFR (Common European Framework of Reference for Languages)</b> standartlari asosida ishlab chiqilgan.\n\n<b>Nima uchun aynan biz?</b>\n✅ <b>500+ Video Darslar:</b> Har bir daraja uchun tushunarli va professional yondashuv.\n✅ <b>Sun'iy Intellekt:</b> AI Mentor darslarda sizga yo'l ko'rsatadi.\n✅ <b>Interaktiv Amaliyot:</b> Mashqlar va daraja testlari orqali bilimlarni mustahkamlash.\n✅ <b>Akademik Tan olinish:</b> Yakuniy sertifikatlar mukammal yutuqdir.\n✅ <b>24/7 Qo'llab-quvvatlash:</b> Ustozlar siz bilan doimo aloqada.`,
            payment: `💳 <b>PLATFORMA TARIFLARI VA TO'LOV</b>\n\nBilim olishda chegaralar yo'q! Quyida sizga mos keladigan tarifni tanlang:\n\n🔓 <b>1. STANDART BOSQICh</b>\n• Bitta tanlangan darajaga to'liq ruxsat.\n• Narxi: <b>145,000 so'm</b>.\n\n👑 <b>2. PREMIUM FULL (VIP)</b>\n• Barcha 7 ta kursga umrbod ruxsat.\n• Yangi darslarga birinchi bo'lib kirish.\n• AI Mentor bilan cheksiz muloqot.\n• Narxi: <b>399,000 so'm</b> (Hozirgi chegirma!).\n\n🏧 <b>TO'LOV USULLARI:</b>\n• Karta: <code>8600 1234 5678 9012</code> (Humoyun A.)\n• Saytda: Click, Payme, Uzum.\n\n<i>👇 To'lov turini tanlab, chekni yuborish uchun pastdagi tugmani bosing:</i>`,
            help: `📞 <b>YORDAM MARKAZI (FAQ)</b>\n\nSizda savollar bormi? Bizda javoblar bor:\n\n1️⃣ <b>Kursni qanday boshlaydi?</b>\n- <a href="https://arabiyya.pro">Saytdan</a> ro'yxatdan o'ting va Telegramni bog'lang.\n\n2️⃣ <b>To'lov qachon faollashadi?</b>\n- Chekingizni @Humoyun_Arabia ga yuborganingizdan so'ng 5-15 daqiqa ichida.\n\n3️⃣ <b>Sertifikat haqiqiy-mi?</b>\n- Ha, har bir sertifikat unikal ID raqamiga ega bo'lib, platformada tekshirish mumkin.\n\n🆘 <b>Boshqa savollar bo'yicha:</b>\n👨‍💻 Admin: @Humoyun_Arabia\n📞 Tel: +998 50 571 63 98`
        }
    }
};

const wisdoms = [
    { ar: "العلم يبني بيوتا لا عماد لها والجهل يهدم بيت العز والكرم", uz: "Bilim ustuni yo'q uylarni (qalblarni) barpo etadi, johillik esa aziz va karamli xonadonlarni vayron qiladi." },
    { ar: "من لم يذق مر التعلم ساعة تجرع ذل الجهل طول حياته", uz: "Kimki bir zum bo'lsa-da o'rganish achchig'ini totmasa, butun umr johillik xorligini yutishga majbur bo'ladi." },
    { ar: "الوقت كالسيف إن لم تقطعه قطعك", uz: "Vaqt qilich kabidir, agar sen uni kesmasang, u seni kesadi." },
    { ar: "الصبر مفتاح الفرج", uz: "Sabr — shodlik (najot) kalitidir." }
];

const vocabulary = [
    { ar: 'تعلم', tr: 'Ta\'allama', uz: 'O\'rganish' },
    { ar: 'لغة', tr: 'Lugah', uz: 'Til' },
    { ar: 'مستقبل', tr: 'Mustaqbal', uz: 'Kelajak' },
    { ar: 'نجاح', tr: 'Najah', uz: 'Muvaffaqiyat' },
    { ar: 'سعادة', tr: 'Sa\'adah', uz: 'Baxt' }
];

const userStates = {};

export const initBot = () => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return;

    if (bot) {
        try { bot.stopPolling(); } catch (e) { }
    }

    bot = new TelegramBot(token, { polling: true });

    bot.on('polling_error', (error) => {
        if (error.code === 'ETELEGRAM' && (error.message.includes('409') || error.message.includes('ETIMEDOUT'))) return;
        console.error('Bot Error:', error.message);
    });

    console.log('🤖 Arabiyya Pro Professional Bot (ULTIMATE V7) ishga tushdi...');

    const getMainMenu = () => ({
        reply_markup: {
            keyboard: [
                [{ text: content.uz.menu.about }, { text: content.uz.menu.courses }],
                [{ text: content.uz.menu.profile }, { text: content.uz.menu.cert }],
                [{ text: content.uz.menu.lughat }, { text: content.uz.menu.wisdom }],
                [{ text: content.uz.menu.ai }, { text: content.uz.menu.top }],
                [{ text: content.uz.menu.payment }, { text: content.uz.menu.admin }],
                [{ text: content.uz.menu.help }]
            ],
            resize_keyboard: true,
            selective: true
        }
    });

    // --- Services ---

    const sendTop = async (chatId) => {
        try {
            // Robust Unique Filtering: Use an object Map grouped by email
            const users = await User.find({}).sort({ totalTimeSpent: -1 });
            const uniqueMap = new Map();

            users.forEach(u => {
                if (u.email && !uniqueMap.has(u.email.toLowerCase())) {
                    uniqueMap.set(u.email.toLowerCase(), u);
                }
            });

            const topUsers = Array.from(uniqueMap.values()).slice(0, 10);

            let text = `👑 <b>TOP 10 — ENG FAOL TALABALARINIMIZ</b>\n\n`;
            topUsers.forEach((u, i) => {
                const icon = i === 0 ? '👑' : i === 1 ? '🥇' : i === 2 ? '🥈' : i === 3 ? '🥉' : '🎖';
                text += `${icon} <b>${u.name}</b> — <code>${u.totalTimeSpent || 0}</code> ball\n`;
            });
            text += `\n<i>Ushbu ro'yxatda bo'lish — katta mehnat natijasidir! Olg'a!</i>`;
            bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
        } catch (e) {
            bot.sendMessage(chatId, "Reytingni yuklashda texnik xatolik.");
        }
    };

    const sendProfile = async (chatId) => {
        try {
            const user = await User.findOne({ telegramChatId: String(chatId) });
            if (!user) return bot.sendMessage(chatId, content.uz.connect_required, { parse_mode: 'HTML' });

            const lessons = user.completedLessons?.length || 0;
            const levels = user.completedLevels?.length || 0;
            const progress = Math.min(100, (levels * 14.2) + (lessons * 0.4));
            const bar = '■'.repeat(Math.round(progress / 10)) + '□'.repeat(10 - Math.round(progress / 10));

            const text = `👤 <b>SHAXSIY KABINET</b>\n` +
                `──────────────────\n` +
                `🆔 <b>Ism:</b> ${user.name}\n` +
                `📧 <b>Email:</b> ${user.email}\n` +
                `📊 <b>Daraxt darsi:</b> ${user.currentLevel || 'Boshlang\'ich (A1)'}\n` +
                `📈 <b>Kurs progressi:</b> [${bar}] ${Math.round(progress)}%\n\n` +
                `✅ <b>O'tilgan darslar:</b> ${lessons} ta\n` +
                `🎓 <b>Bitirilgan bosqichlar:</b> ${levels} ta\n` +
                `⭐ <b>Umumiy ballar:</b> <code>${user.totalTimeSpent || 0}</code> ball\n` +
                `──────────────────\n` +
                `<i>Sizning ilm yo'lidagi har bir qadamingiz — bu muvaffaqiyat!</i>`;

            bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
        } catch (e) {
            bot.sendMessage(chatId, "Profil yuklashda xatolik yuz berdi.");
        }
    };

    const sendCourses = (chatId) => {
        const text = `📚 <b>ARABIYYA PRO O'QUV DARASTURLARI</b>\n\nHar bir bosqich uchun alohida e'tibor va metodika ishlab chiqilgan. Tanlang va batafsil bilib oling:\n\n👇 <b>O'quv rejalari:</b>`;
        const keyboard = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🅰️ ALIPPBO (0 bosqich)', callback_data: 'course_v7_alpha' }],
                    [{ text: '📘 A1 BOSHLANG\'ICH', callback_data: 'course_v7_a1' }, { text: '📗 A2 ELEMENTAR', callback_data: 'course_v7_a2' }],
                    [{ text: '📙 B1 O\'RTA', callback_data: 'course_v7_b1' }, { text: '📕 B2 O\'RTA-YUQORI', callback_data: 'course_v7_b2' }],
                    [{ text: '🎓 C1-C2 PROFESSIONAL', callback_data: 'course_v7_expert' }],
                    [{ text: '🚀 Darajani aniqlash testi', url: 'https://arabiyya.pro/placement-test' }]
                ]
            }
        };
        bot.sendMessage(chatId, text, { parse_mode: 'HTML', ...keyboard });
    };

    const sendPaymentMenu = (chatId) => {
        const text = content.uz.sections.payment;
        const keyboard = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '💳 To\'lovni tasdiqlash uchun (Admin)', url: 'https://t.me/Humoyun_Arabia' }],
                    [{ text: '🌐 Saytda to\'lash (Click/Payme)', url: 'https://arabiyya.pro/premium' }]
                ]
            }
        };
        bot.sendMessage(chatId, text, { parse_mode: 'HTML', ...keyboard });
    };

    const askAI = async (chatId, text) => {
        try {
            bot.sendChatAction(chatId, 'typing');
            const prompt = `Sen Arabiyya Pro platformasining oliy toifali arab tili ustozisan. Foydalanuvchi: "${text}". Samimiy, professional va aniq o'zbek tilida javob ber. Agar so'z tarjimasi bo'lsa, uni tushuntirib ber.`;
            const res = await callOpenAI(prompt);
            bot.sendMessage(chatId, `🤖 <b>Mentor:</b>\n\n${res.data.choices[0].message.content}`, { parse_mode: 'HTML' });
        } catch (e) {
            bot.sendMessage(chatId, "Hozirda AI mentor band. Keyinroq savol bering.");
        }
    };

    // --- Bot Events ---

    bot.onText(/\/start(?:\s+(.+))?/, async (msg, match) => {
        const chatId = msg.chat.id;
        const code = match ? match[1] : null;

        if (code) {
            const user = await User.findOne({ telegramSyncCode: code });
            if (user) {
                user.telegramChatId = String(chatId);
                user.telegramUsername = msg.from.username || '';
                user.telegramSyncCode = undefined;
                await user.save();
                return bot.sendMessage(chatId, "🎊 <b>Muvaffaqiyatli!</b>\n\nAkkauntingiz botga bog'landi. Endi xizmatlar to'liq ochiq.", { parse_mode: 'HTML', ...getMainMenu() });
            }
        }
        bot.sendMessage(chatId, content.uz.welcome(msg.from.first_name), { parse_mode: 'HTML', ...getMainMenu() });
    });

    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;
        if (!text || text.startsWith('/')) return;

        const menuButtons = Object.values(content.uz.menu);

        if (menuButtons.includes(text)) {
            userStates[chatId] = null; // Reset any previous state

            if (text === content.uz.menu.about) return bot.sendMessage(chatId, content.uz.sections.about, { parse_mode: 'HTML' });
            if (text === content.uz.menu.courses) return sendCourses(chatId);
            if (text === content.uz.menu.profile) return sendProfile(chatId);
            if (text === content.uz.menu.top) return sendTop(chatId);
            if (text === content.uz.menu.payment) return sendPaymentMenu(chatId);
            if (text === content.uz.menu.help) return bot.sendMessage(chatId, content.uz.sections.help, { parse_mode: 'HTML' });

            if (text === content.uz.menu.wisdom) {
                const h = wisdoms[Math.floor(Math.random() * wisdoms.length)];
                return bot.sendMessage(chatId, `✨ <b>KUN HIKMATI:</b>\n\n<code>${h.ar}</code>\n\n<i>"${h.uz}"</i>`, { parse_mode: 'HTML' });
            }

            if (text === content.uz.menu.lughat) {
                const w = vocabulary[Math.floor(Math.random() * vocabulary.length)];
                return bot.sendMessage(chatId, `📖 <b>YANGI SO'Z (FLASHCARD)</b>\n\n🇦🇪 <b>${w.ar}</b> [${w.tr}]\n🇺🇿 <b>${w.uz}</b>\n\n<i>Lison o'rganish — baraka kalitidir!</i>`, { parse_mode: 'HTML' });
            }

            if (text === content.uz.menu.cert) {
                const user = await User.findOne({ telegramChatId: String(chatId) });
                if (!user) return bot.sendMessage(chatId, content.uz.connect_required, { parse_mode: 'HTML' });
                const certs = user.certificates || [];
                if (certs.length === 0) return bot.sendMessage(chatId, "📜 Hali sertifikatlaringiz yo'q. Darslarni tamomlab, birinchisiga ega bo'ling!");
                let textRes = `📜 <b>SERTIFIKATLARINGIZ:</b>\n\n`;
                certs.forEach((c, i) => { textRes += `${i + 1}. ${c.level} — ${new Date(c.issueDate).toLocaleDateString()}\n`; });
                return bot.sendMessage(chatId, textRes, { parse_mode: 'HTML' });
            }

            if (text === content.uz.menu.ai) {
                userStates[chatId] = 'AI';
                return bot.sendMessage(chatId, `🤖 <b>AI Mentor Tizimi Faollashdi!</b>\n\nArab tili grammatikasi yoki darslar bo'yicha savolingiz bo'lsa, bemalol yozing:`, { parse_mode: 'HTML' });
            }

            if (text === content.uz.menu.admin) {
                userStates[chatId] = 'ADMIN';
                return bot.sendMessage(chatId, "💬 <b>ADMINGA ONLINE MUROJAAT</b>\n\nAdmin bilan bog'lanish uchun xabaringizni pastda yozib qoldiring:", { parse_mode: 'HTML' });
            }
        }

        // --- Action Handlers (States) ---
        if (userStates[chatId] === 'ADMIN') {
            userStates[chatId] = null;
            const adminTarget = process.env.ADMIN_CHAT_ID || '6122615431';
            bot.sendMessage(adminTarget, `📩 <b>MUROJAAT:</b>\n\n👤 ${msg.from.first_name} (@${msg.from.username || 'n/a'})\n🆔 <code>${chatId}</code>\n💬 ${text}`, { parse_mode: 'HTML' });
            return bot.sendMessage(chatId, "✅ <b>Rahmat!</b> Murojaatingiz adminga yetkazildi. Tez orada javob olasiz.", { parse_mode: 'HTML' });
        }

        if (userStates[chatId] === 'AI' || text.length > 5) {
            return askAI(chatId, text);
        }

        bot.sendMessage(chatId, "Tushunmadim. Iltimos, asosiy menyudagi tugmalardan foydalaning.", getMainMenu());
    });

    // --- Callbacks (Inline Buttons) ---
    bot.on('callback_query', (q) => {
        const id = q.message.chat.id;
        const d = q.data;

        const dMap = {
            'course_v7_alpha': `🅰️ <b>ALIPPBO (MAXRAJ VA YOZUV)</b>\n\nBu Arabiyya Pro platformasidagi eng poydevor dars. Arab harflari, ularning yozilish uslublari va to'g'ri talaffuz (maxraj) qoidalarini professional ustozlardan o'rganasiz.\n\n🎬 15 ta Video Dars.\n📊 Har bir dars oxirida interaktiv test.`,
            'course_v7_a1': `📘 <b>A1 — BOSH DARAXA</b>\n\nMuloqotni boshlash va asosiy tushunchalarni shakllantirish bosqichi. Kundalik iboralar va 200 tadan ortiq eng ko'p qo'llaniladigan so'zlar.\n\n🎬 45 ta dars.\n🎁 Shaxsiy sertifikat paketi.`,
            'course_v7_expert': `🎓 <b>C1-C2 — PROFESSIONAL MASTERY</b>\n\nUshbu bosqichda siz arab tilini ona tilidek tushunishga harakat qilasiz. Oliy darajadagi grammatika va adabiy matnlar.\n\n📜 <b>Yakunida Xalqaro Professional Sertifika taqdim etiladi!</b>`
        };

        if (dMap[d]) bot.sendMessage(id, dMap[d], { parse_mode: 'HTML' });
        bot.answerCallbackQuery(q.id);
    });
};

export const sendBotNotification = (chatId, message) => {
    if (bot && chatId) bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
};
