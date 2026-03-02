import TelegramBot from 'node-telegram-bot-api';
import User from './models/User.js';
import { callOpenAI } from './routes/ai.js';

let bot;

// --- Ma'lumotlar Bazasi (Content) ---
const i18n = {
    uz: {
        welcome: (name) => `Assalomu alaykum, <b>${name}</b>! ✨\n\n<b>Arabiyya Pro</b> — Arab tilini professional darajada o'rganish platformasining rasmiy botiga xush kelibsiz.\n\nSiz bu yerda o'qish natijalaringizni kuzatib borishingiz, AI o'qituvchi bilan muloqot qilishingiz va yangiliklardan birinchi bo'lib xabardor bo'lishingiz mumkin.`,
        menu_about: '🌐 Platforma haqida',
        menu_courses: '📚 Kurslarimiz',
        menu_profile: '👤 Mening Profilim',
        menu_top: '🏆 Reyting (Top 10)',
        menu_ai: '🤖 AI O\'qituvchi',
        menu_lughat: '📖 Lug\'at (Flashcards)',
        menu_wisdom: '✨ Kun hikmati',
        menu_payment: '💳 To\'lov va tariflar',
        menu_admin: '✉️ Adminga murojaat',
        menu_help: '📞 Yordam va savollar',
        ai_welcome: '🤖 <b>Men sizning shaxsiy AI o\'qituvchingizman!</b>\n\nSavollaringizni bemalol yozib yuboring. Men sizga arab tili grammatikasi, lug\'at va madaniyatini o\'rganishda yordam beraman.\n\n<i>Murojaatingizni kutib qolaman!</i>',
        help_text: `📞 <b>YORDAM MARKAZI (FAQ)</b>\n\nBizning maqsadimiz — Sizning arab tilini mukammal o'rganishingizni ta'minlash.\n\n❓ <b>Ko'p so'raladigan savollar:</b>\n\n1. <b>Qanday qilib botni saytga bog'lash mumkin?</b>\n- Veb-saytda profilingizga kiring va "Telegram" tugmasini bosing.\n\n2. <b>To'lov qanday amalga oshiriladi?</b>\n- "💳 To'lov va tariflar" bo'limida barcha ma'lumotlar bor.\n\n3. <b>Sertifikat qachon beriladi?</b>\n- Darajaning yakuniy imtihonidan muvaffaqiyatli o'tsangiz.\n\n👨‍💻 <b>Texnik yordam:</b> @Humoyun_Arabia\n📞 <b>Teg:</b> +998 50 571 63 98`,
        connect_required: `⚠️ <b>Tizimga ulanish zarur!</b>\n\nProfilingiz hali botimizga bog'lanmagan. Iltimos, veb-saytimizda profil bo'limiga kiring va "Telegramga ulash" tugmasini bosing.`
    }
};

const wisdoms = [
    { ar: "العلم في الصغر كالنقش على الحجر", uz: "Yoshlikda o'rganilgan ilm toshga o'yilgan naqsh kabidir." },
    { ar: "من جد وجد ومن زرع حصد", uz: "Kim intilsa - erishadi, kims eksa - o'radi." },
    { ar: "الوقت كالسيف إن لم تقطعه قطعك", uz: "Vaqt qilich kabidir, agar sen uni kesmasang, u seni kesadi." },
    { ar: "الصبر مفتاح الفرج", uz: "Sabr - shodlik (najot) kalitidir." },
    { ar: "العلم صيد والكتابة قيده", uz: "Bilim — o'ljadir, yozuv — uni kishanlashdir." }
];

const vocabulary = [
    { ar: 'جامعة', tr: 'Jamiah', uz: 'Universitet' },
    { ar: 'مستشفى', tr: 'Mustashfa', uz: 'Kasalxona' },
    { ar: 'مكتبة', tr: 'Maktabah', uz: 'Kutubxona' },
    { ar: 'سوق', tr: 'Suq', uz: 'Bozor' },
    { ar: 'طائرة', tr: 'Toirah', uz: 'Samolyot' }
];

const userStates = {};

export const initBot = () => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return;

    bot = new TelegramBot(token, { polling: true });

    bot.on('polling_error', (error) => {
        if (error.code === 'ETELEGRAM' && (error.message.includes('409') || error.message.includes('ETIMEDOUT'))) return;
    });

    console.log('🤖 Telegram bot ishga tushirildi (PROFESSIONAL FULL V4)...');

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

    // --- Xizmatlar Funktsiyalari ---

    const sendAbout = (chatId) => {
        const text = `💎 <b>ARABIYYA PRO — PROFESSIONAL TA'LIM PLATFORMASI</b>\n\n` +
            `Arabiyya Pro — bu nafaqat kurslar, balki arab tilini o'rganishda sizning eng ishonchli hamrohingizdir. Bizning tizimimiz CEFR xalqaro standartlari asosida qurilgan.\n\n` +
            `🚀 <b>Nima uchun bizni tanlashadi?</b>\n\n` +
            `• 🎞 <b>Professional Video Darslar:</b> Har bir modul chuqir o'ylangan va yuqori sifatda suratga olingan.\n` +
            `• 🤖 <b>AI Tahlil Tizimi:</b> Sizning talaffuzingiz va yozgan javoblaringizni sun'iy intellekt tahlil qiladi.\n` +
            `• 📈 <b>Shaxsiy Progress:</b> O'z rivojlanishingizni har bir darsda kuzatib borasiz.\n` +
            `• 🎓 <b>Rasmiy Sertifikatlar:</b> Kurs yakunida o'z darajangizni tasdiqlovchi sertifikatga ega bo'lasiz.\n\n` +
            `Bizning maqsadimiz — arab tili o'rganishni hamma uchun oson va maroqli qilish!`;

        bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
    };

    const sendCourses = (chatId) => {
        const text = `📚 <b>ARABIYYA PRO KURSLARI</b>\n\n` +
            `Bizda har bir bosqich uchun alohida e'tibor berilgan. Quyida siz o'zingizni qiziqtirgan darajani tanlab, u haqida batafsil ma'lumot olishingiz mumkin:\n\n` +
            `🔸 <b>ALIPPBO (0 DAN BOSHLASH)</b>\n` +
            `🔸 <b>A1 — BOSH DARAXA</b>\n` +
            `🔸 <b>A2 — ELEMENTAR</b>\n` +
            `🔸 <b>B1 — O'RTA</b>\n` +
            `🔸 <b>B2 — O'RTA-YUQORI</b>\n` +
            `🔸 <b>C1-C2 — PROFESSIONAL</b>\n\n` +
            `👇 <b>Darajani tanlang:</b>`;

        bot.sendMessage(chatId, text, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🅰️ Alippbo', callback_data: 'course_v4_alpha' }, { text: '📘 A1', callback_data: 'course_v4_a1' }],
                    [{ text: '📗 A2', callback_data: 'course_v4_a2' }, { text: '📙 B1', callback_data: 'course_v4_b1' }],
                    [{ text: '📕 B2', callback_data: 'course_v4_b2' }, { text: '🎓 C1-C2', callback_data: 'course_v4_expert' }],
                    [{ text: '🚀 Darajani aniqlash testi', url: 'https://arabiyya.pro/placement-test' }]
                ]
            }
        });
    };

    const sendTop = async (chatId) => {
        try {
            const users = await User.find({}).sort({ totalTimeSpent: -1 });
            const unique = [];
            const seen = new Set();
            for (const u of users) {
                if (!seen.has(u.email.toLowerCase())) {
                    unique.push(u);
                    seen.add(u.email.toLowerCase());
                }
            }
            const top = unique.slice(0, 10);
            let text = `🏆 <b>TOP 10 — ENG FAOL O'QUVCHILAR</b>\n\n`;
            top.forEach((u, i) => {
                const icon = i === 0 ? '👑' : i === 1 ? '🥇' : i === 2 ? '🥈' : '🎖';
                text += `${icon} <b>${u.name}</b> — ${u.totalTimeSpent || 0} ball\n`;
            });
            bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
        } catch (e) {
            bot.sendMessage(chatId, "Reytingni yuklashda xatolik.");
        }
    };

    const sendProfile = async (chatId) => {
        try {
            const user = await User.findOne({ telegramChatId: chatId });
            if (!user) return bot.sendMessage(chatId, i18n.uz.connect_required, { parse_mode: 'HTML' });

            const progress = Math.min(100, (user.completedLevels?.length || 0) * 15 + (user.completedLessons?.length || 0) * 0.4);
            const bar = '■'.repeat(Math.round(progress / 10)) + '□'.repeat(10 - Math.round(progress / 10));

            const text = `👤 <b>SIZNING PROFILINGIZ</b>\n` +
                `──────────────────\n` +
                `📛 <b>Ism:</b> ${user.name}\n` +
                `📧 <b>Email:</b> ${user.email}\n` +
                `📊 <b>Darajangiz:</b> ${user.currentLevel || 'A1'}\n` +
                `📈 <b>Status:</b> [${bar}] ${Math.round(progress)}%\n\n` +
                `🌟 <b>Ballaringiz:</b> ${user.totalTimeSpent || 0} ball\n` +
                `✅ <b>O'tilgan darslar:</b> ${user.completedLessons?.length || 0} ta\n` +
                `🎓 <b>Tugatilgan bosqichlar:</b> ${user.completedLevels?.length || 0} ta\n` +
                `──────────────────\n` +
                `<i>Ilm olishda davom eting!</i>`;

            bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
        } catch (e) {
            bot.sendMessage(chatId, "Xatoli yuz berdi.");
        }
    };

    const sendPayment = (chatId) => {
        const text = `💳 <b>TARIFLAR VA TO'LOV MA'LUMOTLARI</b>\n\n` +
            `Arabiyya Pro platformasida o'qishni davom ettirish uchun quyidagi tariflardan birini tanlashingiz mumkin:\n\n` +
            `1️⃣ <b>BOSH DARAXA (Level Access)</b>\n` +
            `• Faqat tanlangan 1 ta daraja.\n` +
            `• Narxi: <b>145,000 so'm</b> (Bir marta to'lov).\n\n` +
            `2️⃣ <b>FULL PREMIUM (VIP)</b>\n` +
            `• Barcha darajalar (Alippbo + A1 dan C2 gacha).\n` +
            `• Umrbod foydalanish.\n` +
            `• Shaxsiy kurator yordami.\n` +
            `• Narxi: <b>399,000 so'm</b> (Hozirgi narx).\n\n` +
            `🏧 <b>To'lov usullari:</b>\n` +
            `• <b>Saytda:</b> Payme, Click yoki Uzum orqali.\n` +
            `• <b>Karta orqali:</b> <code>8600 1234 5678 9012</code> (Humoyun A.)\n\n` +
            `<i>To'lovdan so'ng chekni @Humoyun_Arabia ga yuboring, kurs 5 daqiqada faollashadi.</i>`;

        bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
    };

    const askAI = async (chatId, text) => {
        try {
            bot.sendChatAction(chatId, 'typing');
            const res = await callOpenAI(`Sen Arabiyya Pro platformasining o'qituvchisissan. Foydalanuvchiga faqat o'zbekcha, professional va qisqa javob ber. Savol: ${text}`);
            bot.sendMessage(chatId, `🤖: ${res.data.choices[0].message.content}`);
        } catch (e) {
            bot.sendMessage(chatId, "AI hozirda band, iltimos keyinroq urinib ko'ring.");
        }
    };

    // --- Main Messaging ---
    bot.onText(/\/start(?:\s+(.+))?/, async (msg, match) => {
        const chatId = msg.chat.id;
        const code = match ? match[1] : null;
        if (code) {
            const user = await User.findOne({ telegramSyncCode: code });
            if (user) {
                user.telegramChatId = chatId;
                user.telegramSyncCode = undefined;
                await user.save();
                return bot.sendMessage(chatId, "✅ <b>Akkauntingiz muvaffaqiyatli bog'landi!</b>", { parse_mode: 'HTML', ...getMainMenu() });
            }
        }
        bot.sendMessage(chatId, i18n.uz.welcome(msg.from.first_name), { parse_mode: 'HTML', ...getMainMenu() });
    });

    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;
        if (!text || text.startsWith('/')) return;

        // --- Route by Menu Buttons (Exact match prioritized) ---
        if (text === i18n.uz.menu_about) { userStates[chatId] = null; return sendAbout(chatId); }
        if (text === i18n.uz.menu_courses) { userStates[chatId] = null; return sendCourses(chatId); }
        if (text === i18n.uz.menu_profile) { userStates[chatId] = null; return sendProfile(chatId); }
        if (text === i18n.uz.menu_top) { userStates[chatId] = null; return sendTop(chatId); }
        if (text === i18n.uz.menu_payment) { userStates[chatId] = null; return sendPayment(chatId); }
        if (text === i18n.uz.menu_help) { userStates[chatId] = null; return bot.sendMessage(chatId, i18n.uz.help_text, { parse_mode: 'HTML' }); }

        if (text === i18n.uz.menu_wisdom) {
            userStates[chatId] = null;
            const w = wisdoms[Math.floor(Math.random() * wisdoms.length)];
            return bot.sendMessage(chatId, `✨ <b>KUN HIKMATI:</b>\n\n<code>${w.ar}</code>\n\n<i>"${w.uz}"</i>`, { parse_mode: 'HTML' });
        }

        if (text === i18n.uz.menu_lughat) {
            userStates[chatId] = null;
            const v = vocabulary[Math.floor(Math.random() * vocabulary.length)];
            return bot.sendMessage(chatId, `📖 <b>YANGI SO'Z (FLASHCARD):</b>\n\n🇦🇪 <b>${v.ar}</b> [${v.tr}]\n🇺🇿 <b>${v.uz}</b>\n\n<i>Har kuni 5 tadan so'z yodlashni odat qiling!</i>`, { parse_mode: 'HTML' });
        }

        if (text === i18n.uz.menu_ai) {
            userStates[chatId] = 'AI';
            return bot.sendMessage(chatId, i18n.uz.ai_welcome, { parse_mode: 'HTML' });
        }

        if (text === i18n.uz.menu_admin) {
            userStates[chatId] = 'ADMIN';
            return bot.sendMessage(chatId, "💬 <b>ADMINGA MUROJAAT</b>\n\nSizni qiynayotgan savol yoki muammoni yozib yuboring. Administrator tez orada javob beradi:", { parse_mode: 'HTML' });
        }

        // --- Handle States ---
        if (userStates[chatId] === 'ADMIN') {
            userStates[chatId] = null;
            const adminId = process.env.ADMIN_CHAT_ID || '6122615431';
            bot.sendMessage(adminId, `✉️ <b>Yangi Murojaat:</b>\n\n👤 ${msg.from.first_name} (@${msg.from.username || 'yoq'})\n🆔 <code>${chatId}</code>\n💬 ${text}`, { parse_mode: 'HTML' });
            return bot.sendMessage(chatId, "✅ <b>Murojaatingiz yuborildi!</b> Tez orada siz bilan bog'lanamiz.", { parse_mode: 'HTML' });
        }

        if (text.length > 5 || userStates[chatId] === 'AI') return askAI(chatId, text);

        bot.sendMessage(chatId, "Iltimos menyudagi tugmalardan foydalaning.", getMainMenu());
    });

    // --- Inline Callbacks ---
    bot.on('callback_query', (query) => {
        const id = query.message.chat.id;
        const d = query.data;

        const details = {
            'course_v4_alpha': `🅰️ <b>ALIPPBO — MAXRAJ VA YOZUV</b>\n\nBu Arabiyya Pro-ning eng muhim kursi. Arab harflari, ularning so'z boshida, ortasida va oxirida yozilishi, hamda maxraj (to'g'ri talaffuz)ni o'rgatadi.\n\n🎬 15 ta Video Dars.\n📝 Har bir darsdan so'ng test.`,
            'course_v4_a1': `📘 <b>A1 — BOSH DARAXA</b>\n\nAgar siz harflarni bilsangiz, ushbu bosqichdan boshlang. Kundalik hayotdagi eng muhim iboralar, tanishuv va oddiy suhbatlar.\n\n🎬 45 ta dars.\n🎁 200+ lug'at foydasi.`,
            'course_v4_a2': `📗 <b>A2 — ELEMENTAR</b>\n\nA1 bosqichining davomi. Murakkabroq jumlalar, asosiy grammatika va erkinroq gapirish ko'nikmalari.\n\n🎬 40 ta Video Dars.`,
            'course_v4_b1': `📙 <b>B1 — O'RTA DARAXA</b>\n\nArab tilidagi matnlarni tahlil qilish, o'qib tushunish va turli mavzularda munozara qilish bosqichi.\n\n🎬 35 ta dars.`,
            'course_v4_b2': `📕 <b>B2 — O'RTA-YUQORI</b>\n\nChuqur grammatika (Nahv va Sarf) hamda matnlar bilan ishlash. Tilni mukammallashtirish.\n\n🎬 30 ta dars.`,
            'course_v4_expert': `🎓 <b>C1-C2 — PROFESSIONAL</b>\n\nUshbu daraja matnlar, adabiyot va ilmiy bilimlarni o'z ichiga oladi. Native darajasiga chiqish uchun yakuniy qadam.\n\n📜 <b>Yakunida Xalqaro Professional Sertifikat!</b>`
        };

        if (details[d]) bot.sendMessage(id, details[d], { parse_mode: 'HTML' });
    });
};

export const sendBotNotification = (chatId, message) => {
    if (bot && chatId) bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
};
