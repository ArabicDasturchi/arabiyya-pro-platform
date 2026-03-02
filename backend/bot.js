import TelegramBot from 'node-telegram-bot-api';
import User from './models/User.js';
import { callOpenAI } from './routes/ai.js';

let bot;

const labels = {
    welcome: (name) => `Assalomu alaykum, <b>${name}</b>! ✨\n\n<b>Arabiyya Pro</b> platformasining professional botiga xush kelibsiz.\n\nSiz bu yerda o'qish natijalaringizni kuzatib borishingiz, AI o'qituvchi bilan muloqot qilishingiz va yangiliklardan birinchi bo'lib xabardor bo'lishingiz mumkin.`,
    menu: {
        about: '🌐 Platforma haqida',
        courses: '📚 Kurslarimiz',
        profile: '👤 Mening Profilim',
        top: '🏆 Reyting (Top 10)',
        ai: '🤖 AI O\'qituvchi',
        lughat: '📖 Lug\'at (Flashcards)',
        wisdom: '✨ Kun hikmati',
        payment: '💳 Tarif va To\'lov',
        admin: '✉️ Adminga murojaat',
        help: '📞 Yordam markazi',
        cert: '📜 Mening Sertifikatlarim'
    },
    sections: {
        about: `💎 <b>ARABIYYA PRO — PROFESSIONAL TA'LIM</b>\n\nBiz Markaziy Osiyodagi eng innovatsion arab tili platformasimiz. Bizning tizimimiz CEFR xalqaro standartlari asosida yaratilgan bo'lib, har bir o'quvchiga shaxsiy yondashuvni kafolatlaydi.\n\n<b>Asosiy imkoniyatlarimiz:</b>\n✅ 500+ Yuqori sifatli video darslar\n✅ Sun'iy Intellekt (AI) orqali tahlil\n✅ Interaktiv testlar va mashqlar\n✅ Rasmiy daraja sertifikatlari\n✅ 24/7 ustozlar ko'magi`,
        payment: `💳 <b>TARIFLAR VA TO'LOV TIZIMI</b>\n\nPlatformamizda darslarni boshlash uchun quyidagi tariflardan birini tanlashingiz mumkin:\n\n🔓 <b>1. STANDART (Bosqichli)</b>\n• Har bir darajani alohida xarid qilish.\n• Narxi: <b>145,000 so'm</b> (Bir marta to'lov).\n\n👑 <b>2. PREMIUM (VIP)</b>\n• Barcha 6 ta daraja + Alippbo kursi.\n• Umrbod ruxsat va yangilanishlar.\n• AI Mentor bilan cheksiz suhbat.\n• Narxi: <b>399,000 so'm</b>.\n\n🏧 <b>TO'LOV QILISH:</b>\n• Karta: <code>8600 1234 5678 9012</code> (Humoyun A.)\n• Saytda: Click, Payme, Uzum.\n\n<i>To'lovdan so'ng chekni @Humoyun_Arabia ga yuboring.</i>`,
        help: `📞 <b>KO'P SO'RALADIGAN SAVOLLAR (FAQ)</b>\n\n1️⃣ <b>Kursni qanday boshlayman?</b>\n- Saytda ro'yxatdan o'tib, Telegramni profilingizga bog'lang.\n\n2️⃣ <b>Darslar qachon ochiladi?</b>\n- To'lov tasdiqlanishi bilan darslar avtomatik ochiladi.\n\n3️⃣ <b>Sertifikat olish sharti nima?</b>\n- Har bir daraja oxiridagi yakuniy imtihondan kamida 80% natija ko'rsatish kerak.\n\n🆘 <b>Boshqa savollar uchun:</b>\n👨‍💻 Admin: @Humoyun_Arabia\n📞 Tel: +998 50 571 63 98`
    }
};

const wisdoms = [
    { ar: "العلم نور والجهل ظلم", uz: "Ilm — nurdir, johillik — zulmatdir." },
    { ar: "من سار على الدرب وصل", uz: "Kim yo'lda yursa, albatta manzilga yetadi." },
    { ar: "الوقت كالسيف إن لم تقطعه قطعك", uz: "Vaqt qilich kabidir, agar sen uni kesmasang, u seni kesadi." },
    { ar: "جالس العلماء تزداد علماً", uz: "Olimlar bilan o'tir, ilmda ziyoda bo'lasan." }
];

const words = [
    { ar: 'قلم', uz: 'Qalam', tr: 'Qalam' },
    { ar: 'كتاب', uz: 'Kitob', tr: 'Kitab' },
    { ar: 'شمس', uz: 'Quyosh', tr: 'Shams' },
    { ar: 'قمر', uz: 'Oy', tr: 'Qamar' },
    { ar: 'جامعة', uz: 'Universitet', tr: 'Jamiah' }
];

const userStates = {};

export const initBot = () => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
        console.log('⚠️ Bot Token topilmadi!');
        return;
    }

    if (bot) {
        try { bot.stopPolling(); } catch (e) { }
    }

    bot = new TelegramBot(token, { polling: true });

    bot.on('polling_error', (error) => {
        if (error.code === 'ETELEGRAM' && (error.message.includes('409') || error.message.includes('ETIMEDOUT'))) return;
        console.error('Bot Polling Error:', error.message);
    });

    console.log('🤖 Telegram Bot Professional Full v6 ishga tushdi...');

    const getMainMenu = () => ({
        reply_markup: {
            keyboard: [
                [{ text: labels.menu.about }, { text: labels.menu.courses }],
                [{ text: labels.menu.profile }, { text: labels.menu.cert }],
                [{ text: labels.menu.lughat }, { text: labels.menu.wisdom }],
                [{ text: labels.menu.ai }, { text: labels.menu.top }],
                [{ text: labels.menu.payment }, { text: labels.menu.admin }],
                [{ text: labels.menu.help }]
            ],
            resize_keyboard: true,
            selective: true
        }
    });

    const sendAbout = (chatId) => {
        bot.sendMessage(chatId, labels.sections.about, { parse_mode: 'HTML' });
    };

    const sendTop = async (chatId) => {
        try {
            const users = await User.find({}).sort({ totalTimeSpent: -1 });
            const leaders = [];
            const seenEmails = new Set();
            for (const u of users) {
                if (!u.email) continue;
                const email = u.email.toLowerCase();
                if (!seenEmails.has(email)) {
                    leaders.push(u);
                    seenEmails.add(email);
                }
                if (leaders.length >= 10) break;
            }

            let text = `👑 <b>TOP 10 — ENG FAOL TALABALAR</b>\n\n`;
            leaders.forEach((u, i) => {
                const icon = i === 0 ? '👑' : i === 1 ? '🥇' : i === 2 ? '🥈' : i === 3 ? '🥉' : '🎖';
                text += `${icon} <b>${u.name}</b> — ${u.totalTimeSpent || 0} ball\n`;
            });
            text += `\n<i>Siz ham o'qing va reytingda ko'tariling!</i>`;
            bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
        } catch (e) {
            bot.sendMessage(chatId, "Reytingni yuklashda xato.");
        }
    };

    const sendProfile = async (chatId) => {
        try {
            const user = await User.findOne({ telegramChatId: String(chatId) });
            if (!user) return bot.sendMessage(chatId, labels.connect_required, { parse_mode: 'HTML' });

            const lessons = user.completedLessons?.length || 0;
            const levels = user.completedLevels?.length || 0;
            const progress = Math.min(100, (levels * 15) + (lessons * 0.5));
            const bar = '■'.repeat(Math.round(progress / 10)) + '□'.repeat(10 - Math.round(progress / 10));

            const text = `👤 <b>SIZNING SHAXSIY PROFILINGIZ</b>\n` +
                `──────────────────\n` +
                `📛 <b>Foydalanuvchi:</b> ${user.name}\n` +
                `📧 <b>Email:</b> ${user.email}\n` +
                `📊 <b>Daraja:</b> ${user.currentLevel || 'A1'}\n` +
                `📈 <b>Progress:</b> [${bar}] ${Math.round(progress)}%\n\n` +
                `✅ <b>Bitirilgan darslar:</b> ${lessons} ta\n` +
                `🎓 <b>Tugatilgan bosqichlar:</b> ${levels} ta\n` +
                `🌟 <b>To'plangan ballar:</b> ${user.totalTimeSpent || 0} ball\n` +
                `──────────────────\n` +
                `<i>Ilim yo'li — jannat yo'lidir! ✨</i>`;

            bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
        } catch (e) {
            bot.sendMessage(chatId, "Profil yuklashda xatolik.");
        }
    };

    const sendCerts = async (chatId) => {
        try {
            const user = await User.findOne({ telegramChatId: String(chatId) });
            if (!user) return bot.sendMessage(chatId, labels.connect_required, { parse_mode: 'HTML' });

            const certs = user.certificates || [];
            if (certs.length === 0) {
                return bot.sendMessage(chatId, "😔 Hozircha sizda sertifikatlar mavjud emas. Kurslarni tamomlang va birinchisiga ega bo'ling!");
            }

            let text = `📜 <b>SIZNING SERTIFIKATLARINGIZ</b>\n\n`;
            certs.forEach((c, i) => {
                text += `${i + 1}. <b>${c.level} Darajasi</b> — ${new Date(c.issueDate).toLocaleDateString()}\n`;
            });
            text += `\n<i>Sertifikatlarning PDF nusxasini platformadan yuklab olishingiz mumkin.</i>`;
            bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
        } catch (e) {
            bot.sendMessage(chatId, "Sertifikatlarni yuklashda xato.");
        }
    };

    const sendCourses = (chatId) => {
        const text = `📚 <b>ARABIYYA PRO KURSLARI</b>\n\nBizning platformamizda barcha bosqichlar uchun alohida e'tibor berilgan. Quyida sizni qiziqtirgan darajani tanlang:\n\n👇 <b>Batafsil ma'lumot uchun tugmani bosing:</b>`;
        const kb = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🅰️ ALIPPBO (Boshlash)', callback_data: 'course_v6_alpha' }],
                    [{ text: '📘 A1 BOSHLANG\'ICH', callback_data: 'course_v6_a1' }, { text: '📗 A2 ELEMENTAR', callback_data: 'course_v6_a2' }],
                    [{ text: '📙 B1 O\'RTA', callback_data: 'course_v6_b1' }, { text: '📕 B2 O\'RTA-YUQORI', callback_data: 'course_v6_b2' }],
                    [{ text: '🎓 C1-C2 PROFESSIONAL', callback_data: 'course_v6_expert' }],
                    [{ text: '💎 To\'liq Kursni Xarid Qilish', callback_data: 'bot_pay_v6_full' }]
                ]
            }
        };
        bot.sendMessage(chatId, text, { parse_mode: 'HTML', ...kb });
    };

    const askAI = async (chatId, text) => {
        try {
            bot.sendChatAction(chatId, 'typing');
            const prompt = `Sen Arabiyya Pro platformasining shaxsiy AI o'qituvchisisan. Foydalanuvchi: "${text}". Arab tili bo'yicha professional javob ber, misollar keltir va faqat o'zbek tilida gapir.`;
            const res = await callOpenAI(prompt);
            bot.sendMessage(chatId, `🤖: ${res.data.choices[0].message.content}`);
        } catch (e) {
            bot.sendMessage(chatId, "Kechirasiz, AI hozirda band. Keyinroq urinib ko'ring.");
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
                return bot.sendMessage(chatId, "🎊 <b>Tabriklaymiz!</b>\n\nAkkauntingiz botga muvaffaqiyatli bog'landi.", { parse_mode: 'HTML', ...getMainMenu() });
            }
        }
        bot.sendMessage(chatId, labels.welcome(msg.from.first_name), { parse_mode: 'HTML', ...getMainMenu() });
    });

    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;
        if (!text || text.startsWith('/')) return;

        const menuValues = Object.values(labels.menu);

        if (menuValues.includes(text)) {
            userStates[chatId] = null;

            if (text === labels.menu.about) return sendAbout(chatId);
            if (text === labels.menu.courses) return sendCourses(chatId);
            if (text === labels.menu.profile) return sendProfile(chatId);
            if (text === labels.menu.cert) return sendCerts(chatId);
            if (text === labels.menu.top) return sendTop(chatId);
            if (text === labels.menu.payment) return bot.sendMessage(chatId, labels.sections.payment, { parse_mode: 'HTML' });
            if (text === labels.menu.help) return bot.sendMessage(chatId, labels.sections.help, { parse_mode: 'HTML' });

            if (text === labels.menu.wisdom) {
                const h = wisdoms[Math.floor(Math.random() * wisdoms.length)];
                return bot.sendMessage(chatId, `✨ <b>KUN HIKMATI:</b>\n\n<pre>${h.ar}</pre>\n\n<i>"${h.uz}"</i>`, { parse_mode: 'HTML' });
            }

            if (text === labels.menu.lughat) {
                const w = words[Math.floor(Math.random() * words.length)];
                return bot.sendMessage(chatId, `📖 <b>YANGI SO'Z (FLASHCARD)</b>\n\n🇦🇪 <b>${w.ar}</b> [${w.tr}]\n🇺🇿 <b>${w.uz}</b>\n\n<i>Muvaffaqiyat kaliti — takrorlashdadir!</i>`, { parse_mode: 'HTML' });
            }

            if (text === labels.menu.ai) {
                userStates[chatId] = 'AI';
                return bot.sendMessage(chatId, `🤖 <b>Men sizning shaxsiy AI o'qituvchingizman!</b>\n\nSavollaringizni bemalol yozib yuboring. Men sizga arab tili grammatikasi, lug'at va madaniyatini o'rganishda yordam beraman.`, { parse_mode: 'HTML' });
            }

            if (text === labels.menu.admin) {
                userStates[chatId] = 'ADMIN';
                return bot.sendMessage(chatId, "💬 <b>ADMINGA MUROJAAT</b>\n\nSavolingizni yoki xabaringizni yozib yuboring, administrator tez orada javob beradi:", { parse_mode: 'HTML' });
            }
        }

        if (userStates[chatId] === 'ADMIN') {
            userStates[chatId] = null;
            const adminId = process.env.ADMIN_CHAT_ID || '6122615431';
            bot.sendMessage(adminId, `✉️ <b>Yangi Xabar:</b>\n\n👤 ${msg.from.first_name} (@${msg.from.username || 'yoq'})\n🆔 <code>${chatId}</code>\n💬 ${text}`, { parse_mode: 'HTML' });
            return bot.sendMessage(chatId, "✅ <b>Xabaringiz yuborildi!</b> Tez orada javob olasiz.", { parse_mode: 'HTML' });
        }

        if (userStates[chatId] === 'AI' || text.length > 3) {
            return askAI(chatId, text);
        }

        bot.sendMessage(chatId, "Iltimos, pastdagi menyudan foydalaning.", getMainMenu());
    });

    bot.on('callback_query', (q) => {
        const id = q.message.chat.id;
        const d = q.data;

        const info = {
            'course_v6_alpha': `🅰️ <b>ALIPPBO (MAXRAJ VA YOZUV)</b>\n\nBu Arabiyya Pro platformasidagi eng muhim poydevor darsi. Arab harflari, ularning yozilish uslublari va to'g'ri talaffuz (maxraj) qoidalarini o'rganasiz.\n\n🎬 15 ta dars.\n📋 Har bir dars oxirida test mavjud.`,
            'course_v6_a1': `📘 <b>A1 — BOSH DARAXA</b>\n\nAgar siz harflarni bilsangiz, muloqotni aynan shu yerdan boshlang. Kundalik hayotda eng ko'p qo'llaniladigan iboralar va tanishuv suhbatlari.\n\n🎬 45 ta dars.\n🎁 200+ yangi lug'at boyligi.`,
            'course_v6_expert': `🎓 <b>C1-C2 — PROFESSIONAL</b>\n\nBu daraja sizni arab tilini xalqaro standartlarda mukammal tushunishga tayyorlaydi. Arab adabiyoti, ilmiy matnlar va murakkab grammatika.\n\n📜 <b>Yakunida Xalqaro Professional Sertifika beriladi!</b>`,
            'bot_pay_v6_full': `👑 <b>FULL PREMIUM OBUNA</b>\n\nBarcha 7 ta kursga umrbod ruxsat olish uchun <b>399,000 so'm</b> to'lov qiling. To'lov haqida batafsil ma'lumot "Tarif va To'lov" menyusida bor.`
        };

        if (info[d]) bot.sendMessage(id, info[d], { parse_mode: 'HTML' });
        bot.answerCallbackQuery(q.id);
    });
};

export const sendBotNotification = (chatId, message) => {
    if (bot && chatId) bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
};
