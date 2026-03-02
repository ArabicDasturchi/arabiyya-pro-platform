import TelegramBot from 'node-telegram-bot-api';
import User from './models/User.js';
import { callOpenAI } from './routes/ai.js';

let bot;

// --- Premium Branding & ULTIMATE V10 Content ---
const ui = {
    uz: {
        welcome: (name) => `Assalomu alaykum, muhtaram <b>${name}</b>! ✨\n\n<b>Arabiyya Pro</b> — Arab tilining oliy akademiyasi va innovatsion ta'lim tizimining rasmiy botiga xush kelibsiz.\n\nSiz bu yerda o'z bilimlaringizni xalqaro CEFR standartlari asosida tizimlashtirishingiz, AI Mentor yordamida o'qishingiz va professional natijalarga erishishingiz mumkin.`,
        menu: {
            about: '🌐 Akademiya haqida',
            courses: '📚 O\'quv Dasturlari',
            profile: '👤 Shaxsiy Profil',
            top: '🏆 Reyting (Top 10)',
            ai: '🤖 AI Mentor (24/7)',
            grammar: '📖 Kunlik Grammatika',
            wisdom: '✨ Arab Hikmatlari',
            payment: '💳 Tariflar & To\'lov',
            exam: '📝 Imtihon Markazi', // Yangi xizmat
            audio: '🎧 Tinglash (Listening)', // Yangi xizmat
            admin: '✉️ Adminga Murojaat',
            help: '📞 Markaziy Yordam',
            cert: '📜 Mening Sertifikatlarim'
        },
        sections: {
            about: `💎 <b>ARABIYYA PRO ACADEMY — KELAJAK TA'LIMI</b>\n\nAkademiyamiz arab tilini o'rgatishda eng ilg'or texnologiyalar va pedagogik metodikalarni birlashtirgan. Bizning maqsadimiz — sizni qisqa vaqt ichida arab tilida erkin muloqot qilish darajasiga olib chiqish.\n\n<b>Bizning ustunliklarimiz:</b>\n✅ <b>Individual AI Mentor:</b> Har bir talaba uchun shaxsiy sun'iy intellekt o'qituvchisi.\n✅ <b>Xalqaro Metodika:</b> CEFR (A1-C2) standartidagi tizimli dastur.\n✅ <b>Interaktiv Tahlil:</b> Har bir topshiriq va mashq darhol avtomatik tekshiriladi.\n✅ <b>Jonli Muloqot:</b> Ustozlar va native-speakerlar bilan guruhlarda amaliyot.\n✅ <b>Rasmiy Sertifikat:</b> Bilimingizni tasdiqlovchi xalqaro darajadagi hujjat.\n\n<i>Arab tili — bu nafaqat til, balki buyuk tafakkur olamidir!</i>`,
            payment: `💳 <b>PROFESSIONAL TARIFLAR VA INVESTITSIYA</b>\n\nBilim olishga tikilgan sarmoya — eng foydali sarmoyadir. Arabiyya Pro platformasida o'zingizga mos tarifni tanlang:\n\n🔓 <b>1. PRO BOSQICh (Standard Access)</b>\n• Tanlangan bitta bosqichga (masalan, B1) 1 yil davomida to'liq ruxsat.\n• Barcha testlar va AI tahlillari.\n• Yakuniy sertifikat.\n• Narxi: <b>350,000 so'm</b>.\n\n👑 <b>2. ELITE ULTIMATE (Hamma kurslar)</b>\n• <b>Full Access:</b> Alippbo kursidan tortib, eng yuqori C2 bosqichigacha.\n• <b>Lifetime:</b> Hech qanday vaqt chegarasisiz umrbod foydalanish.\n• <b>Unlimited AI Mentor:</b> Mentor bilan cheksiz darslar va tahlillar.\n• <b>Yangi kurslar:</b> Kelajakdagi barcha yangilanishlar mutlaqo bepul.\n• Narxi: <b>950,000 so'm</b> (Hozirgi imtiyozli narx!).\n\n🏛 <b>3. PLATINUM INDIVIDUAL (VIP)</b>\n• Shaxsiy ustoz (curator) bilan individual darslar.\n• Maxsus o'quv rejasi va monitoring.\n• Narxi: <b>2,500,000 so'm</b>.\n\n🏧 <b>TO'LOVNI AMALGA OSHIRISH:</b>\n• 1. <b>Saytda:</b> <a href="https://arabiyya.pro/premium">arabiyya.pro/premium</a>\n• 2. <b>Karta orqali:</b>\n   - Karta: <code>8600 1234 5678 9012</code>\n   - Egasi: Humoyun A.\n\n<i>👇 To'lov turini tanlab, chekni tasdiqlash uchun adminga yuboring:</i>`,
            help: `📞 <b>ADMINISTRATSIYA VA SAVOLLAR</b>\n\n1️⃣ <b>Kursni qanday boshlaydi?</b>\n- Saytda ro'yxatdan o'ting va Telegramni bog'lang.\n\n2️⃣ <b>To'lov qanday faollashadi?</b>\n- Saytdagi to'lov avtomatik, karta orqali to'lov 5 daqiqada faollashadi.\n\n3️⃣ <b>Sertifikat qanday beriladi?</b>\n- Daraja yakunidagi testdan 85% dan yuqori ball to'plaganingizda.\n\n🆘 <b>Murojaat uchun:</b>\n👨‍💻 Admin: @Humoyun_Arabia\n📞 Call-center: +998 50 571 63 98`
        }
    }
};

const grammarPoints = [
    { title: "Ism va Fe'l", body: "Arab tilida so'zlar uchga bo'linadi: Ism (نَوْع), Fe'l (فِعْل) va Harf (حَرْف). Ism biror narsa yoki shaxsni bildirsa, fe'l harakatni ifodalaydi." },
    { title: "Zamir bo'laklari", body: "Arab tilida zamirlar (kishilik olmoshlari) mustaqil (أَنَا، أَنْتَ) va qo'shilgan (كتابُكَ، بيتُنا) turlarga bo'linadi." },
    { title: "Muzakkar va Muannas", body: "Arab tilida deyarli barcha ismlar jinsga ega: Muzakkar (erkak) va Muannas (ayol). Ayol jinsini bildirish uchun so'z oxiriga 'Ta marbuta' (ة) qo'shiladi." }
];

const wisdoms = [
    { ar: "العلم يبني بيوتا لا عماد لها والجهل يهدم بيت العز والكرم", uz: "Bilim ustuni yo'q uylarni barpo etadi, johillik esa aziz xonadonlarni vayron qiladi." },
    { ar: "من سار على الدرب وصل", uz: "Kim yo'lda matonat bilan yursa, albatta manziliga yetadi." },
    { ar: "خير العلم ما نفع", uz: "Ilmning yaxshisi — manfaat berganidir." }
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
        // console.error('Core Bot Error:', error.message);
    });

    console.log('💎 Arabiyya Pro Professional Academy Bot (V10 ULTIMATE) ishga tushdi...');

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

    const sendTop = async (chatId) => {
        try {
            const users = await User.find({}).sort({ totalTimeSpent: -1 });
            const leaders = [];
            const seenKeys = new Set();
            for (const u of users) {
                const key = (u.email || u.name || "anon").toLowerCase().trim();
                if (!seenKeys.has(key)) {
                    leaders.push(u);
                    seenKeys.add(key);
                }
                if (leaders.length >= 10) break;
            }
            let text = `🏆 <b>ACADEMY TOP 10 — ILM CHOO'QQISIDAGILAR</b>\n\n`;
            leaders.forEach((u, i) => {
                const icon = i === 0 ? '👑' : i === 1 ? '🥇' : i === 2 ? '🥈' : i === 3 ? '🥉' : '🎖';
                text += `${icon} <b>${u.name}</b> — <code>${u.totalTimeSpent || 0}</code> ball\n`;
            });
            text += `\n<i>Sizning natijalaringiz biz uchun faxr!</i>`;
            bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
        } catch (e) {
            bot.sendMessage(chatId, "Reytingni yuklashda xatolik.");
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
                `✅ <b>O'tilgan darslar:</b> ${lessons} ta\n` +
                `🎓 <b>Tugatilgan bosqichlar:</b> ${levels} ta\n` +
                `⭐ <b>Umumiy ball:</b> <code>${user.totalTimeSpent || 0}</code>\n` +
                `──────────────────\n` +
                `<i>Har bir natija — kelajaga qilingan katta qadam!</i>`;
            bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
        } catch (e) {
            bot.sendMessage(chatId, "Xatolik yuz berdi.");
        }
    };

    const askAI = async (chatId, text) => {
        try {
            bot.sendChatAction(chatId, 'typing');
            const prompt = `Sen Arabiyya Pro platformasining shaxsiy akademik ustozisan. Foydalanuvchi: "${text}". Arab tili grammatikasi, lug'ati va madaniyati bo'yicha professional javob ber. Javobingni faqat o'zbek tilida, chuqur tahlil va misollar bilan taqdim et.`;
            const res = await callOpenAI(prompt);
            bot.sendMessage(chatId, `🤖 <b>Mentor Sharhi:</b>\n\n${res.data.choices[0].message.content}`, { parse_mode: 'HTML' });
        } catch (e) {
            bot.sendMessage(chatId, "Hozirda AI Mentor savollarni qabul qilolmaydi.");
        }
    };

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
                return bot.sendMessage(chatId, "🎊 <b>Tabriklaymiz!</b>\n\nAkkauntingiz muvaffaqiyatli bog'landi.", { parse_mode: 'HTML', ...getMainMenu() });
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
            if (text === ui.uz.menu.courses) return bot.sendMessage(chatId, "📚 <b>DARAXALIK O'QUV DASTURLARI</b>\n\nPlatformamizda CEFR bo'yicha A1 dan C2 gacha darajalar mavjud. O'zingizga mos darsni saytimizdan tanlashingiz mumkin.", { parse_mode: 'HTML' });
            if (text === ui.uz.menu.profile) return sendProfile(chatId);
            if (text === ui.uz.menu.top) return sendTop(chatId);
            if (text === ui.uz.menu.payment) return bot.sendMessage(chatId, ui.uz.sections.payment, { parse_mode: 'HTML' });
            if (text === ui.uz.menu.help) return bot.sendMessage(chatId, ui.uz.sections.help, { parse_mode: 'HTML' });

            if (text === ui.uz.menu.exam) {
                return bot.sendMessage(chatId, "📝 <b>IMTIHON MARKAZI</b>\n\nDarajangizni aniqlash yoki kursni yakunlash uchun imtihon topshirishingiz mumkin. Imtihonlar saytimizda 24/7 rejimida ishlaydi.", { parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: '📝 Imtihonni boshlash', url: 'https://arabiyya.pro/exams' }]] } });
            }

            if (text === ui.uz.menu.audio) {
                return bot.sendMessage(chatId, "🎧 <b>TINGLASH (LISTENING)</b>\n\nArab tilida eshitish qobiliyatingizni rivojlantirish uchun maxsus audiolarni saytimizning 'Media' bo'limidan topishingiz mumkin.", { parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: '🎧 Audioni tinglash', url: 'https://arabiyya.pro/audio' }]] } });
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
                return bot.sendMessage(chatId, "🤖 <b>AI Mentor Faollashdi!</b> Savolingizni yuboring:", { parse_mode: 'HTML' });
            }
            if (text === ui.uz.menu.admin) {
                userStates[chatId] = 'ADMIN';
                return bot.sendMessage(chatId, "💬 <b>ADMINGA MUROJAAT</b>\n\nSavolingizni yozib qoldiring:", { parse_mode: 'HTML' });
            }
        }

        if (userStates[chatId] === 'ADMIN') {
            userStates[chatId] = null;
            const adminId = process.env.ADMIN_CHAT_ID || '6122615431';
            bot.sendMessage(adminId, `📩 <b>MUROJAAT:</b>\n\n👤 ${msg.from.first_name}\n🆔 <code>${chatId}</code>\n💬 ${text}`, { parse_mode: 'HTML' });
            return bot.sendMessage(chatId, "✅ <b>Yuborildi!</b>", { parse_mode: 'HTML' });
        }

        if (userStates[chatId] === 'AI' || text.length > 5) return askAI(chatId, text);
        bot.sendMessage(chatId, "Iltimos menyudan foydalaning.", getMainMenu());
    });
};

export const sendBotNotification = (chatId, message) => {
    if (bot && chatId) bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
};
