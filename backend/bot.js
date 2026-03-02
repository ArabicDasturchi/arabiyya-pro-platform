import TelegramBot from 'node-telegram-bot-api';
import User from './models/User.js';
import { callOpenAI } from './routes/ai.js';

let bot;

// --- Premium Branding & UI ---
const ui = {
    uz: {
        welcome: (name) => `Assalomu alaykum, muhtaram <b>${name}</b>! 🌟\n\n<b>Arabiyya Pro</b> — Arab tilini professional va innovatsion o'rganish akademiyasining rasmiy botiga xush kelibsiz.\n\nSiz bu yerda o'z bilim darajangizni oshirishingiz, natijalarni tizimli kuzatishingiz va jahon standartidagi o'quv dasturi bilan tanishishingiz mumkin.`,
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
            about: `💎 <b>ARABIYYA PRO — TA'LIMDAGI INNOVATSIYA</b>\n\nArabiyya Pro — bu nafaqat kurslar, balki arab tili olamiga ochilgan eshikdir. Bizning dasturimiz eng ilg'or CEFR metodikalari asosida yaratilgan.\n\n<b>Nima uchun aynan Arabiyya Pro?</b>\n✅ <b>Sun'iy Intellekt Tahlili:</b> Sizning har bir javobingiz AI tomonidan chuqur tahlil qilinadi.\n✅ <b>Interaktiv Amaliyot:</b> Mashqlar va daraja testlari orqali bilimlarni mustahkamlash.\n✅ <b>Akademik Nizom:</b> Bizda ta'lim tartibi va sifat nazorati o'ta jiddiy yo'lga qo'yilgan.\n✅ <b>Xalqaro Sertifikatlar:</b> Har bir daraja yakunida sizning yutug'ingizni tasdiqlovchi rasmiy hujjat.\n✅ <b>24/7 Yordam:</b> Ustozlar va qo'llab-quvvatlash jamoasi doimo aloqada.\n\n<i>Bilim — bu sizning kelajakka kiritayotgan eng katta sarmoyangizdir!</i>`,
            payment: `💳 <b>PROFESSIONAL TARIFLAR VA TO'LOV TIZIMI</b>\n\nArabiyya Pro platformasida o'qishni boshlash uchun o'zingizga mos tarifni tanlang. Bizda har bir yo'lanish maksimal natijaga qaratilgan:\n\n🔓 <b>1. STANDART BOSQICh (Darajali ochish)</b>\n• Tanlangan bitta darajaga (masalan, A1) 1 yil davomida ruxsat.\n• Interaktiv testlar va AI tahlilini olish.\n• Yakunida rasmiy sertifikat.\n• Narxi: <b>145,000 so'm</b>.\n\n👑 <b>2. PREMIUM FULL ULTIMATE (Hamma kurslar)</b>\n• <b>Barcha bosqichlar:</b> Alippbo + A1, A2, B1, B2, C1, C2.\n• <b>Umrbod Ruxsat:</b> Hech qanday vaqt chegarasisiz foydalanish.\n• <b>AI Mentor Unlimited:</b> Sun'iy intellekt bilan cheksiz muloqot va yordam.\n• <b>Yangi kurslar:</b> Kelajakda qo'shiladigan barcha darslarga bepul ruxsat.\n• Narxi: <b>399,000 so'm</b> (Chegirma vaqtida!).\n\n🏧 <b>TO'LOVNI AMALGA OSHIRISH:</b>\n• 1. <b>Payme/Click/Uzum:</b> Veb-saytimizning o'zida to'lash.\n• 2. <b>Karta orqali:</b>\n   - Karta raqami: <code>8600 1234 5678 9012</code>\n   - Egasi: Humoyun A.\n\n<i>👇 To'lov turini tanlab, chekni yuborish uchun pastdagi tugmani bosing:</i>`,
            help: `📞 <b>YORDAM VA FAQ (KO'P SO'RALADIGAN SAVOLLAR)</b>\n\n1️⃣ <b>Kursga qanday a'zo bo'lish mumkin?</b>\n- <a href="https://arabiyya.pro">arabiyya.pro</a> saytida ro'yxatdan o'ting va Telegramni bog'lang.\n\n2️⃣ <b>To'lov qilganimdan so'ng qancha vaqtda darslar ochiladi?</b>\n- Admin chekni tasdiqlashi bilan (odatda 5-15 daqiqa) darslar faollashadi.\n\n3️⃣ <b>AI Mentor nima uchun foydali?</b>\n- U sizga 24/7 davomida darslardagi tushunarsiz joylarni o'zbek tilida sharhlab beradi.\n\n🆘 <b>Bog'lanish:</b>\n👨‍💻 Administrator: @Humoyun_Arabia\n📞 Call-markaz: +998 50 571 63 98`
        }
    }
};

const wisdoms = [
    { ar: "العلم يبني بيوتا لا عماد لها والجهل يهدم بيت العز والكرم", uz: "Bilim ustuni yo'q uylarni barpo etadi, johillik esa aziz xonadonlarni vayron qiladi." },
    { ar: "من جد وجد ومن زرع حصد", uz: "Kim intilsa — erishadi, kim eksa — o'radi." },
    { ar: "خير الناس من ينفع الناس", uz: "Insonlarning eng yaxshisi — boshqalarga foydasi tegadiganidir." }
];

const vocabulary = [
    { ar: 'عزيمة', tr: 'Azimah', uz: 'Azm-u qaror (Irodali bo\'lish)' },
    { ar: 'إتقان', tr: 'Itqan', uz: 'Mukammallik (Ishni puxta qilish)' },
    { ar: 'إخلاص', tr: 'Ikhlas', uz: 'Samimiylik (Ixlos)' },
    { ar: 'تطوير', tr: 'Tatwir', uz: 'Rivojlanish (Taraqqiyot)' }
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
        console.error('Bot Connection Error:', error.message);
    });

    console.log('🤖 Arabiyya Pro Professional Bot (V8 FULL) ishga tushdi...');

    const getMainMenu = () => ({
        reply_markup: {
            keyboard: [
                [{ text: ui.uz.menu.about }, { text: ui.uz.menu.courses }],
                [{ text: ui.uz.menu.profile }, { text: ui.uz.menu.cert }],
                [{ text: ui.uz.menu.lughat }, { text: ui.uz.menu.wisdom }],
                [{ text: ui.uz.menu.ai }, { text: ui.uz.menu.top }],
                [{ text: ui.uz.menu.payment }, { text: ui.uz.menu.admin }],
                [{ text: ui.uz.menu.help }]
            ],
            resize_keyboard: true,
            selective: true
        }
    });

    // --- Services Logic ---

    const sendTop = async (chatId) => {
        try {
            // Strong Unique Filtering: Prioritize Email, then Name
            const users = await User.find({}).sort({ totalTimeSpent: -1 });
            const leaders = [];
            const seenKeys = new Set();

            for (const u of users) {
                // Key can be email or name if email is missing
                const key = (u.email || u.name || "unknown").toLowerCase().trim();
                if (!seenKeys.has(key)) {
                    leaders.push(u);
                    seenKeys.add(key);
                }
                if (leaders.length >= 10) break;
            }

            let text = `👑 <b>TOP 10 — ACADEMY STARS (ENG FAOL TALABALAR)</b>\n\n`;
            leaders.forEach((u, i) => {
                const icon = i === 0 ? '👑' : i === 1 ? '🥇' : i === 2 ? '🥈' : i === 3 ? '🥉' : '🎖';
                text += `${icon} <b>${u.name}</b> — <code>${u.totalTimeSpent || 0}</code> ball\n`;
            });
            text += `\n<i>Ushbu reyting bilim olishdagi intilishingizni ifodalaydi!</i>`;
            bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
        } catch (e) {
            bot.sendMessage(chatId, "Reytingni yuklashda texnik xatolik.");
        }
    };

    const sendProfile = async (chatId) => {
        try {
            const user = await User.findOne({ telegramChatId: String(chatId) });
            if (!user) return bot.sendMessage(chatId, "⚠️ <b>Profilingiz bog'lanmagan!</b>\n\nIltimos, saytdang botni bog'lang.", { parse_mode: 'HTML' });

            const lessons = user.completedLessons?.length || 0;
            const levels = user.completedLevels?.length || 0;
            const progress = Math.min(100, (levels * 14.2) + (lessons * 0.4));
            const bar = '■'.repeat(Math.round(progress / 10)) + '□'.repeat(10 - Math.round(progress / 10));

            const text = `👤 <b>SIZNING SHAXSIY KABINETINGIZ</b>\n` +
                `──────────────────\n` +
                `📛 <b>Ism:</b> ${user.name}\n` +
                `📧 <b>Email:</b> ${user.email}\n` +
                `📊 <b>Daraja:</b> ${user.currentLevel || 'A1'}\n` +
                `📈 <b>Status:</b> [${bar}] ${Math.round(progress)}%\n\n` +
                `✅ <b>O'tilgan darslar:</b> ${lessons} ta\n` +
                `🎓 <b>Tugatilgan bosqichlar:</b> ${levels} ta\n` +
                `⭐ <b>To'plangan ballar:</b> <code>${user.totalTimeSpent || 0}</code>\n` +
                `──────────────────\n` +
                `<i>Rivojlanishdan aslo to'xtamang!</i>`;

            bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
        } catch (e) {
            bot.sendMessage(chatId, "Profil yuklashda xatolik.");
        }
    };

    const sendCourses = (chatId) => {
        const text = `📚 <b>ARABIYYA PRO ACADEMY KURSLARI</b>\n\nBizning o'quv dasturimiz jahon standartlari asosida tizimlashtirilgan. Quyida siz uchun ochiq bo'lgan bosqichlar va batafsil rejalarni ko'rishingiz mumkin:\n\n👇 <b>Bosqichni tanlang:</b>`;
        const keyboard = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🅰️ ALIPPBO (Nol kurs)', callback_data: 'course_v8_alpha' }],
                    [{ text: '📘 A1 BOSHLANG\'ICH', callback_data: 'course_v8_a1' }, { text: '📗 A2 ELEMENTAR', callback_data: 'course_v8_a2' }],
                    [{ text: '📙 B1 O\'RTA', callback_data: 'course_v8_b1' }, { text: '📕 B2 O\'RTA-YUQORI', callback_data: 'course_v8_b2' }],
                    [{ text: '🎓 C1-C2 PROFESSIONAL', callback_data: 'course_v8_expert' }],
                    [{ text: '🚀 Darajani aniqlash testi', url: 'https://arabiyya.pro/placement-test' }]
                ]
            }
        };
        bot.sendMessage(chatId, text, { parse_mode: 'HTML', ...keyboard });
    };

    const sendPayment = (chatId) => {
        const text = ui.uz.sections.payment;
        const keyboard = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '💳 To\'lov chekini yuborish (Admin)', url: 'https://t.me/Humoyun_Arabia' }],
                    [{ text: '🌐 Saytda to\'lov (Click/Payme)', url: 'https://arabiyya.pro/premium' }],
                    [{ text: '🎁 Premium Narxi - 399,000 so\'m', callback_data: 'pay_info_full' }]
                ]
            }
        };
        bot.sendMessage(chatId, text, { parse_mode: 'HTML', ...keyboard });
    };

    const askAI = async (chatId, text) => {
        try {
            bot.sendChatAction(chatId, 'typing');
            const prompt = `Sen Arabiyya Pro platformasining oliy toifali arab tili ustozisan. Foydalanuvchi: "${text}". Samimiy, professional va aniq o'zbek tilida javob ber. Grammatik qoidalarni tushunarli qilib yoritib ber.`;
            const res = await callOpenAI(prompt);
            bot.sendMessage(chatId, `🤖 <b>AI Mentor (Ustoz):</b>\n\n${res.data.choices[0].message.content}`, { parse_mode: 'HTML' });
        } catch (e) {
            bot.sendMessage(chatId, "AI Mentor hozirda band, iltimos keyinroq savol bering.");
        }
    };

    // --- Main Logics ---

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
                return bot.sendMessage(chatId, "🎊 <b>Tabriklaymiz!</b>\n\nSiz platformani muvaffaqiyatli bog'ladingiz. Endi o'qish jarayoni osonlashdi!", { parse_mode: 'HTML', ...getMainMenu() });
            }
        }
        bot.sendMessage(chatId, ui.uz.welcome(msg.from.first_name), { parse_mode: 'HTML', ...getMainMenu() });
    });

    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;
        if (!text || text.startsWith('/')) return;

        const menuValues = Object.values(ui.uz.menu);

        if (menuValues.includes(text)) {
            userStates[chatId] = null; // Clear state on any menu click

            if (text === ui.uz.menu.about) return bot.sendMessage(chatId, ui.uz.sections.about, { parse_mode: 'HTML' });
            if (text === ui.uz.menu.courses) return sendCourses(chatId);
            if (text === ui.uz.menu.profile) return sendProfile(chatId);
            if (text === ui.uz.menu.top) return sendTop(chatId);
            if (text === ui.uz.menu.payment) return sendPayment(chatId);
            if (text === ui.uz.menu.help) return bot.sendMessage(chatId, ui.uz.sections.help, { parse_mode: 'HTML' });

            if (text === ui.uz.menu.wisdom) {
                const h = wisdoms[Math.floor(Math.random() * wisdoms.length)];
                return bot.sendMessage(chatId, `✨ <b>KUN HIKMATI:</b>\n\n<code>${h.ar}</code>\n\n<i>"${h.uz}"</i>`, { parse_mode: 'HTML' });
            }

            if (text === ui.uz.menu.lughat) {
                const v = vocabulary[Math.floor(Math.random() * vocabulary.length)];
                return bot.sendMessage(chatId, `📖 <b>LUG'AT FLASHCARD:</b>\n\n🇦🇪 <b>${v.ar}</b> [${v.tr}]\n🇺🇿 <b>${v.uz}</b>\n\n<i>Har bir so'z — bilim sari qadam!</i>`, { parse_mode: 'HTML' });
            }

            if (text === ui.uz.menu.cert) {
                const user = await User.findOne({ telegramChatId: String(chatId) });
                if (!user) return bot.sendMessage(chatId, "⚠️ Bog'lanish kerak!", { parse_mode: 'HTML' });
                const certs = user.certificates || [];
                if (certs.length === 0) return bot.sendMessage(chatId, "📜 Hozircha sizda sertifikatlar yo'q. Kursni bitiring va sohibiga aylaning!");
                let res = `📜 <b>SERTIFIKATLARINGIZ:</b>\n\n`;
                certs.forEach((c, i) => { res += `${i + 1}. ${c.level} — ${new Date(c.issueDate).toLocaleDateString()}\n`; });
                return bot.sendMessage(chatId, res, { parse_mode: 'HTML' });
            }

            if (text === ui.uz.menu.ai) {
                userStates[chatId] = 'AI';
                return bot.sendMessage(chatId, `🤖 <b>AI Mentor bilan muloqot boshlandi!</b>\n\nSizni qiziqtirgan savolni o'zbek tilida yuboring:`, { parse_mode: 'HTML' });
            }

            if (text === ui.uz.menu.admin) {
                userStates[chatId] = 'ADMIN';
                return bot.sendMessage(chatId, "💬 <b>ADMINGA ONLINE MUROJAAT</b>\n\nMaqsadingiz yoki savolingizni yozib qoldiring:", { parse_mode: 'HTML' });
            }
        }

        // --- States ---
        if (userStates[chatId] === 'ADMIN') {
            userStates[chatId] = null;
            const target = process.env.ADMIN_CHAT_ID || '6122615431';
            bot.sendMessage(target, `📩 <b>YANGI MUROJAAT:</b>\n\n👤 ${msg.from.first_name} (@${msg.from.username || 'n/a'})\n🆔 <code>${chatId}</code>\n💬 ${text}`, { parse_mode: 'HTML' });
            return bot.sendMessage(chatId, "✅ <b>Rahmat!</b> Murojaatingiz qabul qilindi. Tez orada javob beramiz.", { parse_mode: 'HTML' });
        }

        if (userStates[chatId] === 'AI' || text.length > 5) {
            return askAI(chatId, text);
        }

        bot.sendMessage(chatId, "Iltimos, pastdagi professional menyudan foydalaning.", getMainMenu());
    });

    // --- Inline Callbacks ---
    bot.on('callback_query', (q) => {
        const id = q.message.chat.id;
        const d = q.data;

        const infoMap = {
            'course_v8_alpha': `🅰️ <b>ALIPPBO & MAXRAJ DASTURI</b>\n\nUshbu kurs Arab tilining poydevori hisoblanadi. Arab harflari, ularning yozilish shakllari va maxraj (to'g'ri talaffuz) qoidalarini professional ustozlardan o'rganasiz.\n\n🎬 15 ta darslik modul.\n📊 Interaktiv testlar to'plami.`,
            'course_v8_a1': `📘 <b>A1 BOSHLANG'ICH BOSQICh</b>\n\nKundalik muloqot va o'zaro tanishuv suhbatlari uchun mo'ljallangan. Eng ko'p ishlatiladigan 200 tadan ortiq so'z va iboralar jamlangan.\n\n🎬 45 ta darslik modul.\n📜 Yakunida rasmiy sertifikat.`,
            'course_v8_expert': `🎓 <b>C1-C2 PROFESSIONAL DARAXA</b>\n\nUshbu kurs sizga arab tilida ona tilidek so'zlashish va matnlarni tahlil qilish imkonini beradi. Oliy darajadagi grammatika va adabiy bilimlar.\n\n📜 <b>Yakunida Xalqaro Professional Sertifika taqdim etiladi!</b>`,
            'pay_info_full': `👑 <b>PREMIUM FULL ULTIMATE</b>\n\nNarxi: 399,000 so'm.\nBarcha bosqichlarga umrbod ruxsat beriladi. To'lov haqida batafsil ma'lumot yuqorida keltirilgan.`
        };

        if (infoMap[d]) bot.sendMessage(id, infoMap[d], { parse_mode: 'HTML' });
        bot.answerCallbackQuery(q.id);
    });
};

export const sendBotNotification = (chatId, message) => {
    if (bot && chatId) bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
};
