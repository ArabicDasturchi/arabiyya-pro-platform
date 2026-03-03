import TelegramBot from 'node-telegram-bot-api';
import User from './models/User.js';
import { callOpenAI } from './routes/ai.js';

let bot;

// --- Premium Branding & ULTIMATE V11 Master Content ---
const ui = {
    uz: {
        welcome: (name) => `Assalomu alaykum, muhtaram <b>${name}</b>! ✨\n\n<b>Arabiyya Pro</b> — Markaziy Osiyodagi eng ilg'or Arab tili Akademiyasining rasmiy intellektual yordamchisiga xush kelibsiz.\n\nSiz bu yerda o'z bilim darajangizni xalqaro CEFR standartlari asosida tizimlashtirishingiz, natijalarni real vaqtda kuzatishingiz va professional AI Mentor bilan muloqot qilishingiz mumkin.`,
        menu: {
            about: '🌐 Akademiya haqida',
            courses: '📚 O\'quv Dasturlari',
            profile: '👤 Shaxsiy Profil',
            top: '🏆 Reyting (Top 10)',
            ai: '🤖 AI Mentor (24/7)',
            grammar: '📖 Kunlik Grammatika',
            wisdom: '✨ Arab Hikmatlari',
            payment: '💳 Tariflar & To\'lov',
            exam: '📝 Imtihon Markazi',
            audio: '🎧 Tinglash (Listening)',
            admin: '✉️ Adminga Murojaat',
            help: '📞 Markaziy Yordam',
            cert: '📜 Mening Sertifikatlarim'
        },
        sections: {
            about: `💎 <b>ARABIYYA PRO ACADEMY — KELAJAK TA'LIMI BUGUN</b>\n\nAkademiyamiz arab tilini o'rgatishda eng ilg'or texnologiyalar va jahon pedagogik metodikalarini birlashtirgan. Bizning maqsadimiz — sizni qisqa vaqt ichida arab tilida ona tilidek erkin muloqot qilish darajasiga olib chiqish.\n\n<b>Bizning tamoyillarimiz:</b>\n✅ <b>Individual AI Mentor:</b> Har bir talaba uchun 24/7 shaxsiy sun'iy intellekt ustozi.\n✅ <b>Xalqaro Metodika:</b> CEFR (A1-C2) standartidagi tizimli o'quv dasturi.\n✅ <b>Interaktiv Analitika:</b> topshiriq va mashqlar darhol avtomatik tekshiriladi.\n✅ <b>Rasmiy Sertifikat:</b> Xalqaro darajadagi bilimni tasdiqlovchi hujjat.\n\n<i>Arab tili — bu ilm va imkoniyatlar eshigidir!</i>`,
            payment: `💳 <b>PROFESSIONAL TARIFLAR VA INVESTITSIYA</b>\n\nBilim olishga tikilgan sarmoya — eng foydali sarmoyadir. O'zingizga mos tarifni tanlang:\n\n🔓 <b>1. PRO BOSQICh (Standard Access)</b>\n• Tanlangan bitta bosqichga (masalan, B1) 1 yil davomida to'liq ruxsat.\n• Barcha testlar va AI tahlillari.\n• Yakuniy sertifikat.\n• Narxi: <b>350,000 so'm</b>.\n\n👑 <b>2. ELITE ULTIMATE (Full Access)</b>\n• <b>To'liq ruxsat:</b> Alippbo kursidan tortib, eng yuqori C2 bosqichigacha.\n• <b>Lifetime:</b> Umrbod foydalanish va barcha yangilanishlar.\n• <b>Unlimited AI Mentor:</b> Mentor bilan cheksiz darslar va tahlillar.\n• Narxi: <b>950,000 so'm</b> (Chegirma vaqtida!).\n\n🏛 <b>3. PLATINUM INDIVIDUAL (VIP)</b>\n• Shaxsiy kurator va ustoz bilan individual darslar.\n• Maxsus o'quv rejasi va shaxsiy monitoring.\n• Narxi: <b>2,500,000 so'm</b>.\n\n🏧 <b>TO'LOVNI AMALGA OSHIRISH:</b>\n• 1. <b>Saytda:</b> <a href="https://arabiyya.pro/premium">arabiyya.pro/premium</a>\n• 2. <b>Karta orqali:</b>\n   - Karta: <code>8600 1234 5678 9012</code>\n   - Egasi: Humoyun A.\n\n<i>👇 To'lov turini tanlab, chekni tasdiqlash uchun adminga yuboring:</i>`,
            help: `📞 <b>ADMINISTRATSIYA VA SAVOLLAR</b>\n\n1️⃣ <b>Kursni qanday boshlaydi?</b>\n- Saytda ro'yxatdan o'ting va Telegramni bog'lang.\n\n2️⃣ <b>To'lov qanday faollashadi?</b>\n- Saytdagi to'lov avtomatik, karta orqali to'lov 5 daqiqada faollashadi.\n\n3️⃣ <b>Sertifikat qachon beriladi?</b>\n- Daraja yakunidagi imtihondan kamida 85% ball to'plaganingizda.\n\n🆘 <b>Murojaat uchun:</b>\n👨‍💻 Admin: @Humoyun_Arabia\n📞 Call-center: +998 50 571 63 98`
        }
    }
};

const grammarPoints = [
    { title: "Ism va Fe'l", body: "Arab tilida so'zlar uchga bo'linadi: Ism (نَوْع), Fe'l (فِعْل) va Harf (حَرْف). Ism shaxs yoki narsani, fe'l esa harakatni bildiradi." },
    { title: "Muzakkar va Muannas", body: "Arab tilida har bir ism jinsga ega. Ayol jinsini bildirish uchun (ة) harfi ishlatiladi." },
    { title: "Sifatlar qoidasi", body: "Arab tilida sifat (Na't) o'zi tavsiflayotgan so'zdan (Man'ut) keyin keladi va unga jinsda, sonda moslashadi." }
];

const wisdoms = [
    { ar: "العلم يبني بيوتا لا عماد لها والجهل يهدم بيت العز والكرم", uz: "Bilim ustuni yo'q uylarni barpo etadi, johillik esa muhtasham xonadonlarni vayron qiladi." },
    { ar: "الوقت كالسيف إن لم تقطعه قطعك", uz: "Vaqt qilich kabidir, agar sen uni kesmasang, u seni kesadi." },
    { ar: "خير العلم ما نفع", uz: "Ilmning eng yaxshisi — manfaat berganidir." }
];

const userStates = {};

export const initBot = () => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return;

    if (bot) { try { bot.stopPolling(); } catch (e) { } }

    bot = new TelegramBot(token, { polling: true });

    bot.on('polling_error', (error) => {
        if (error.code === 'ETELEGRAM' && (error.message.includes('409') || error.message.includes('ETIMEDOUT'))) return;
    });

    console.log('💎 Arabiyya Pro Academy Bot (V11 ULTIMATE MASTER) ishga tushdi...');

    const getMainMenu = () => ({
        reply_markup: {
            keyboard: [
                [{ text: ui.uz.menu.about }, { text: ui.uz.menu.courses }],
                [{ text: ui.uz.menu.profile }, { text: ui.uz.menu.cert }],
                [{ text: ui.uz.menu.grammar }, { text: ui.uz.menu.wisdom }],
                [{ text: ui.uz.menu.ai }, { text: ui.uz.menu.top }],
                [{ text: ui.uz.menu.payment }, { text: ui.uz.menu.exam }],
                [{ text: ui.uz.menu.audio }, { text: ui.uz.menu.admin }],
                [{ text: ui.uz.menu.help }]
            ],
            resize_keyboard: true,
            selective: true
        }
    });

    // --- Services Implementation ---

    const sendTop = async (chatId) => {
        try {
            const allUsers = await User.find({}).sort({ totalTimeSpent: -1 });
            const uniqueMap = new Map();
            for (const u of allUsers) {
                const key = (u.email || u.name || "user").toLowerCase().trim();
                if (!uniqueMap.has(key)) {
                    uniqueMap.set(key, u);
                }
            }
            const topLeaders = Array.from(uniqueMap.values()).slice(0, 10);

            let text = `🏆 <b>ACADEMY TOP 10 — ILM CHOO'QQISIDAGILAR</b>\n\n`;
            topLeaders.forEach((u, i) => {
                const icon = i === 0 ? '👑' : i === 1 ? '🥇' : i === 2 ? '🥈' : i === 3 ? '🥉' : '🎖';
                text += `${icon} <b>${u.name}</b> — <code>${u.totalTimeSpent || 0}</code> ball\n`;
            });
            bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
        } catch (e) {
            bot.sendMessage(chatId, "Reyting ma'lumotlarini yuklashda xatolik.");
        }
    };

    const sendProfile = async (chatId) => {
        try {
            const user = await User.findOne({ telegramChatId: String(chatId) });
            if (!user) return bot.sendMessage(chatId, "⚠️ <b>Profil bog'lanmagan!</b>\n\nSaytga kiring va botni bog'lang.", { parse_mode: 'HTML' });
            const lessons = user.completedLessons?.length || 0;
            const levels = user.completedLevels?.length || 0;
            const progress = Math.min(100, (levels * 14.5) + (lessons * 0.45));
            const bar = '■'.repeat(Math.round(progress / 10)) + '□'.repeat(10 - Math.round(progress / 10));

            const text = `👤 <b>SHAXSIY ANALITIKA VA PROFIL</b>\n` +
                `──────────────────\n` +
                `📛 <b>Ism:</b> ${user.name}\n` +
                `📊 <b>Daraja:</b> ${user.currentLevel || 'Mubtadiy'}\n` +
                `📈 <b>Progress:</b> [${bar}] ${Math.round(progress)}%\n\n` +
                `✅ <b>Bitirilgan darslar:</b> ${lessons} ta\n` +
                `🎓 <b>Tugatilgan bosqichlar:</b> ${levels} ta\n` +
                `⭐ <b>Umumiy ball:</b> <code>${user.totalTimeSpent || 0}</code>\n` +
                `──────────────────\n` +
                `<i>Har bir muvaffaqiyat — kichik qadamdan boshlanadi!</i>`;
            bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
        } catch (e) {
            bot.sendMessage(chatId, "Profil ma'lumotlarida xatolik.");
        }
    };

    const sendCoursesDetailed = (chatId) => {
        const text = `📚 <b>DARAXALIK O'QUV DASTURLARI (CEFR)</b>\n\nAkademiyamizda har bir daraja professional ravishda tizimlashtirilgan. Quyida sizni qiziqtirgan darajani tanlab, u haqida batafsil ma'lumot olishingiz mumkin:\n\n👇 <b>Darajani tanlang:</b>`;
        const keyboard = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🅰️ ALIPPBO (Nol bosqich)', callback_data: 'course_v11_alpha' }],
                    [{ text: '📘 A1 BOSHLANG\'ICH', callback_data: 'course_v11_a1' }, { text: '📗 A2 ELEMENTAR', callback_data: 'course_v11_a2' }],
                    [{ text: '📙 B1 O\'RTA', callback_data: 'course_v11_b1' }, { text: '📕 B2 O\'RTA-YUQORI', callback_data: 'course_v11_b2' }],
                    [{ text: '🎓 C1-C2 PROFESSIONAL', callback_data: 'course_v11_expert' }],
                    [{ text: '🚀 Darajani aniqlash testi', url: 'https://arabiyya.pro/placement-test' }]
                ]
            }
        };
        bot.sendMessage(chatId, text, { parse_mode: 'HTML', ...keyboard });
    };

    const askAI = async (chatId, text) => {
        try {
            bot.sendChatAction(chatId, 'typing');
            const prompt = `Sen Arabiyya Pro platformasining akademik ustozisan. Foydalanuvchi: "${text}". Professional va faqat o'zbek tilida, tahlil va misollar bilan javob ber.`;
            const res = await callOpenAI(prompt);
            bot.sendMessage(chatId, `🤖 <b>Mentor:</b>\n\n${res.data.choices[0].message.content}`, { parse_mode: 'HTML' });
        } catch (e) {
            bot.sendMessage(chatId, "AI Mentor hozirda texnik ta'mirlashda.");
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
                return bot.sendMessage(chatId, "🎊 <b>Muvaffaqiyatli bog'landi!</b>\n\nEndi siz Akademiyaning barcha professional xizmatlaridan foydalanishingiz mumkin.", { parse_mode: 'HTML', ...getMainMenu() });
            }
        }
        bot.sendMessage(chatId, ui.uz.welcome(msg.from.first_name), { parse_mode: 'HTML', ...getMainMenu() });
    });

    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;
        if (!text || text.startsWith('/')) return;

        const menuItems = Object.values(ui.uz.menu);

        if (menuItems.includes(text)) {
            userStates[chatId] = null;
            if (text === ui.uz.menu.about) return bot.sendMessage(chatId, ui.uz.sections.about, { parse_mode: 'HTML' });
            if (text === ui.uz.menu.courses) return sendCoursesDetailed(chatId);
            if (text === ui.uz.menu.profile) return sendProfile(chatId);
            if (text === ui.uz.menu.top) return sendTop(chatId);
            if (text === ui.uz.menu.payment) return bot.sendMessage(chatId, ui.uz.sections.payment, { parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: '💳 Chekni tasdiqlash uchun (Admin)', url: 'https://t.me/Humoyun_Arabia' }], [{ text: '🌐 Saytda to\'lash', url: 'https://arabiyya.pro/premium' }]] } });
            if (text === ui.uz.menu.help) return bot.sendMessage(chatId, ui.uz.sections.help, { parse_mode: 'HTML' });

            if (text === ui.uz.menu.exam) {
                return bot.sendMessage(chatId, "📝 <b>IMTIHON MARKAZI (PRO)</b>\n\nDarajangizni tasdiqlash uchun imtihon topshiring. Imtihonlar saytda 24/7 ishlaydi.", { parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: '📝 Imtihonni boshlash', url: 'https://arabiyya.pro/exams' }]] } });
            }
            if (text === ui.uz.menu.audio) {
                return bot.sendMessage(chatId, "🎧 <b>LISTENING (TINGLASH)</b>\n\nArab tilidagi muloqotni tushunish uchun media resurslardan foydalaning.", { parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: '🎧 Media bo\'limiga o\'tish', url: 'https://arabiyya.pro/audio' }]] } });
            }
            if (text === ui.uz.menu.grammar) {
                const g = grammarPoints[Math.floor(Math.random() * grammarPoints.length)];
                return bot.sendMessage(chatId, `📖 <b>KUNLIK GRAMMATIKA:</b>\n\n<b>📌 ${g.title}</b>\n\n${g.body}`, { parse_mode: 'HTML' });
            }
            if (text === ui.uz.menu.wisdom) {
                const h = wisdoms[Math.floor(Math.random() * wisdoms.length)];
                return bot.sendMessage(chatId, `✨ <b>ARAB HIKMATI:</b>\n\n<code>${h.ar}</code>\n\n<i>"${h.uz}"</i>`, { parse_mode: 'HTML' });
            }
            if (text === ui.uz.menu.cert) {
                const user = await User.findOne({ telegramChatId: String(chatId) });
                const certs = user?.certificates || [];
                if (certs.length === 0) return bot.sendMessage(chatId, "📜 Sertifikatlar mavjud emas.");
                let resS = `📜 <b>SERTIFIKATLARINGIZ:</b>\n\n`;
                certs.forEach((c, i) => { resS += `${i + 1}. ${c.level} — ${new Date(c.issueDate).toLocaleDateString()}\n`; });
                return bot.sendMessage(chatId, resS, { parse_mode: 'HTML' });
            }
            if (text === ui.uz.menu.ai) {
                userStates[chatId] = 'AI';
                return bot.sendMessage(chatId, "🤖 <b>AI Mentor Faollashdi!</b>\n\nSavolingizni o'zbek tilida yuboring:", { parse_mode: 'HTML' });
            }
            if (text === ui.uz.menu.admin) {
                userStates[chatId] = 'ADMIN';
                return bot.sendMessage(chatId, "💬 <b>ADMINGA MUROJAAT</b>\n\nMaqsadingizni yozib qoldiring:", { parse_mode: 'HTML' });
            }
        }

        if (userStates[chatId] === 'ADMIN') {
            userStates[chatId] = null;
            const adminId = process.env.ADMIN_CHAT_ID || '6122615431';
            bot.sendMessage(adminId, `📩 <b>MUROJAAT:</b>\n\n👤 ${msg.from.first_name}\n🆔 <code>${chatId}</code>\n💬 ${text}`, { parse_mode: 'HTML' });
            return bot.sendMessage(chatId, "✅ <b>Yuborildi!</b> Administrator tez orada javob beradi.", { parse_mode: 'HTML' });
        }

        if (userStates[chatId] === 'AI' || text.length > 5) return askAI(chatId, text);
        bot.sendMessage(chatId, "Iltimos, pastdagi professional menyudan foydalaning.", getMainMenu());
    });

    bot.on('callback_query', (q) => {
        const id = q.message.chat.id;
        const d = q.data;
        const details = {
            'course_v11_alpha': `🅰️ <b>ALIPPBO & MAXRAJ</b>\n\nArab tilining asosi. Harflarni yozish va to'g'ri o'qishni professional ustozlardan o'rganing.\n\n📊 15 ta darslik modul.`,
            'course_v11_a1': `📘 <b>A1 BOSHLANG'ICH</b>\n\nKundalik hayotdagi muloqot va iboralar. 200+ so'zlar.\n\n📊 45 ta darslik modul.\n📜 Yakunida sertifikat.`,
            'course_v11_a2': `📗 <b>A2 ELEMENTAR</b>\n\nMuloqotni davom ettirish va murakkabroq jumlalar.`,
            'course_v11_b1': `📙 <b>B1 O'RTA DARAXA</b>\n\nMatnlar bilan ishlash va grammatik tahlillar.`,
            'course_v11_b2': `📕 <b>B2 O'RTA-YUQORI</b>\n\nChuqur grammatika va tilni mukammallashtirish.`,
            'course_v11_expert': `🎓 <b>C1-C2 PROFESSIONAL</b>\n\nArab tilida ona tilidek so'zlashishni o'rganish.\n\n📜 <b>Yakunida Xalqaro Professional Sertifikat taqdim etiladi!</b>`
        };
        if (details[d]) bot.sendMessage(id, details[d], { parse_mode: 'HTML' });
        bot.answerCallbackQuery(q.id);
    });
};

export const sendBotNotification = (chatId, message) => {
    if (bot && chatId) bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
};
