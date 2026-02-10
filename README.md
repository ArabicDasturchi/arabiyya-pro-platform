# 🌟 Arabiyya Pro - Professional Arab Tili O'rganish Platformasi

![Arabiyya Pro](https://img.shields.io/badge/Arabiyya-Pro-blue?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-green?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-yellow?style=for-the-badge)

Professional arab tilini o'rganish platformasi - AI texnologiyasi bilan.

## 📋 Mundarija

- [Xususiyatlar](#-xususiyatlar)
- [Texnologiyalar](#-texnologiyalar)
- [O'rnatish](#-ornatish)
- [Ishga Tushirish](#-ishga-tushirish)
- [Loyiha Strukturasi](#-loyiha-strukturasi)
- [API Endpoints](#-api-endpoints)
- [Muhit O'zgaruvchilari](#-muhit-ozgaruvchilari)

## ✨ Xususiyatlar

### Frontend
- ✅ **Modern UI/UX** - Gradient dizayn, glassmorphism
- ✅ **Responsive** - Mobile, tablet, desktop uchun
- ✅ **6 ta CEFR Darajasi** - A1 dan C2 gacha
- ✅ **150+ Video Dars** - HD sifatda
- ✅ **AI Placement Test** - 12 savollik daraja aniqlash
- ✅ **24/7 AI Chat** - Professional yordamchi
- ✅ **Interactive Tests** - Har dars va daraja uchun
- ✅ **Progress Tracking** - Real-time jarayon kuzatuvi
- ✅ **Certificates** - Professional sertifikatlar
- ✅ **PDF E-books** - Har dars uchun

### Backend
- ✅ **RESTful API** - Express.js
- ✅ **MongoDB Database** - User data, progress
- ✅ **JWT Authentication** - Secure auth
- ✅ **AI Integration** - Google Gemini API
- ✅ **User Management** - CRUD operations
- ✅ **Test System** - Automated grading
- ✅ **Certificate Generation** - Auto certificates

## 🛠 Texnologiyalar

### Frontend
- React 18.2
- Vite 5.0
- Tailwind CSS 3.4
- Lucide React (icons)
- Axios

### Backend
- Node.js & Express
- MongoDB & Mongoose
- JWT (jsonwebtoken)
- Bcrypt.js
- Google Gemini AI API
- Helmet (security)
- Morgan (logging)
- CORS

## 📥 O'rnatish

### 1. Repository'ni Clone qiling

\`\`\`bash
git clone https://github.com/your-username/arabiyya-pro.git
cd arabiyya-pro-platform
\`\`\`

### 2. Node.js va npm o'rnating

**Node.js 18+** kerak.

Tekshirish:
\`\`\`bash
node --version
npm --version
\`\`\`

Yuklab olish: [nodejs.org](https://nodejs.org/)

### 3. MongoDB o'rnating

**Variant A: Local MongoDB**
- [MongoDB Community](https://www.mongodb.com/try/download/community) yuklab oling
- O'rnating va ishga tushiring

**Variant B: MongoDB Atlas (Cloud)**
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) da account yarating
- Cluster yarating (FREE tier yetarli)
- Connection string oling

### 4. Google Gemini API Key oling

1. [Google AI Studio](https://makersuite.google.com/app/apikey) ga kiring
2. **Get API Key** tugmasini bosing
3. API key ni nusxalang

---

## 🚀 Ishga Tushirish

### Backend Setup

\`\`\`bash
# Backend papkasiga o'ting
cd backend

# Dependencies o'rnating
npm install

# .env fayl yarating
cp .env.example .env
\`\`\`

**`.env` faylini tahrirlang:**

\`\`\`env
PORT=5000
NODE_ENV=development

# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/arabiyya-pro

# Yoki MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/arabiyya-pro

JWT_SECRET=your-secret-key-min-32-characters-long
GEMINI_API_KEY=your-google-gemini-api-key-here
FRONTEND_URL=http://localhost:3000
\`\`\`

**Backend ishga tushiring:**

\`\`\`bash
# Development mode
npm run dev

# Production mode
npm start
\`\`\`

Backend `http://localhost:5000` da ishga tushadi.

---

### Frontend Setup

\`\`\`bash
# Root papkada
cd ..  # agar backend papkada bo'lsangiz

# Dependencies o'rnating
npm install

# Development server ishga tushiring
npm run dev
\`\`\`

Frontend `http://localhost:3000` da ochiladi.

---

## 📂 Loyiha Strukturasi

\`\`\`
arabiyya-pro-platform/
│
├── backend/                    # Backend (Node.js + Express)
│   ├── models/                 # MongoDB models
│   │   ├── User.js
│   │   ├── Level.js
│   │   └── Lesson.js
│   ├── routes/                 # API routes
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── levels.js
│   │   ├── lessons.js
│   │   ├── tests.js
│   │   ├── certificates.js
│   │   └── ai.js
│   ├── middleware/             # Middlewares
│   │   └── auth.js
│   ├── .env.example           # Environment template
│   ├── package.json
│   └── server.js              # Entry point
│
├── src/                        # Frontend (React)
│   ├── App.jsx                # Main component
│   ├── main.jsx               # Entry point
│   └── index.css              # Tailwind CSS
│
├── public/                     # Static files
├── index.html                  # HTML template
├── package.json               # Frontend dependencies
├── vite.config.js             # Vite config
├── tailwind.config.js         # Tailwind config
└── README.md                  # Documentation
\`\`\`

---

## 🌐 API Endpoints

### Auth
- `POST /api/auth/register` - Ro'yxatdan o'tish
- `POST /api/auth/login` - Tizimga kirish
- `POST /api/auth/quick-register` - Tez ro'yxatdan o'tish

### Users
- `GET /api/users/profile` - Profile olish
- `PUT /api/users/placement-test` - Placement test yangilash
- `POST /api/users/complete-lesson` - Darsni tugatish
- `POST /api/users/complete-level` - Darajani tugatish
- `POST /api/users/save-test-result` - Test natijasini saqlash

### Levels
- `GET /api/levels` - Barcha darajalar
- `GET /api/levels/:levelId` - Bitta daraja

### Lessons
- `GET /api/lessons/:levelId` - Daraja bo'yicha darslar
- `GET /api/lessons/:levelId/:lessonNumber` - Bitta dars

### Tests
- `GET /api/tests/placement` - Placement test
- `POST /api/tests/placement/check` - Javoblarni tekshirish
- `GET /api/tests/lesson/:levelId/:lessonNumber` - Dars testi
- `GET /api/tests/exam/:levelId` - Daraja imtihoni

### AI
- `POST /api/ai/placement-analysis` - Placement tahlil
- `POST /api/ai/lesson-test-analysis` - Dars test tahlil
- `POST /api/ai/level-exam-analysis` - Imtihon tahlil
- `POST /api/ai/chat` - AI chat

### Certificates
- `POST /api/certificates/generate` - Sertifikat yaratish
- `GET /api/certificates` - Sertifikatlar ro'yxati

---

## 🔐 Muhit O'zgaruvchilari

### Backend (.env)

| O'zgaruvchi | Tavsif | Misol |
|------------|--------|-------|
| `PORT` | Server porti | `5000` |
| `NODE_ENV` | Muhit | `development` / `production` |
| `MONGODB_URI` | MongoDB connection | `mongodb://localhost:27017/arabiyya-pro` |
| `JWT_SECRET` | JWT secret key | `min-32-characters-secret` |
| `GEMINI_API_KEY` | Google AI API | `AIzaSy...` |
| `FRONTEND_URL` | Frontend URL | `http://localhost:3000` |

---

## 🧪 Test Qilish

### Backend Test
\`\`\`bash
cd backend

# Health check
curl http://localhost:5000/api/health

# Get levels
curl http://localhost:5000/api/levels
\`\`\`

### Frontend Test
Browser'da `http://localhost:3000` oching.

---

## 📦 Production Build

### Frontend
\`\`\`bash
npm run build
\`\`\`

Build fayllari `dist/` papkada.

### Backend
\`\`\`bash
cd backend
NODE_ENV=production npm start
\`\`\`

---

## 🐛 Muammolarni Hal Qilish

### MongoDB Connection Error
- MongoDB ishga tushganini tekshiring: `mongod --version`
- Connection string to'g'riligini tekshiring

### Port Already in Use
\`\`\`bash
# Port 5000 ni tekshirish
lsof -i :5000

# Jarayonni to'xtatish
kill -9 <PID>
\`\`\`

### API Key Issues
- Gemini API key to'g'ri ekanligi
- `.env` fayl mavjudligi
- Server restart qilish kerak

---

## 🤝 Hissa Qo'shish

1. Fork qiling
2. Feature branch yarating: `git checkout -b feature/AmazingFeature`
3. Commit qiling: `git commit -m 'Add AmazingFeature'`
4. Push qiling: `git push origin feature/AmazingFeature`
5. Pull Request oching

---

## 📄 Litsenziya

MIT License - [LICENSE](LICENSE) faylini ko'ring.

---

## 👨‍💻 Muallif

**Arabiyya Pro Team**

- Website: [arabiyya.pro](https://arabiyya.pro)
- Email: info@arabiyya.pro
- GitHub: [@arabiyya-pro](https://github.com/arabiyya-pro)

---

## 🙏 Rahmat

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [MongoDB](https://www.mongodb.com/)
- [Express](https://expressjs.com/)
- [Google AI](https://ai.google.dev/)

---

## 📞 Aloqa

Savollar yoki yordam kerakmi?

- 📧 Email: info@arabiyya.pro
- 💬 Telegram: [@arabiyya_pro](https://t.me/arabiyya_pro)
- 🌐 Website: [arabiyya.pro](https://arabiyya.pro)

---

**Made with ❤️ by Arabiyya Pro Team**