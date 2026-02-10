# 🚀 ARABIYYA PRO - TO'LIQ O'RNATISH QOLLANMASI

## 📋 MUNDARIJA
1. [Tizim Talablari](#1-tizim-talablari)
2. [Node.js O'rnatish](#2-nodejs-ornatish)
3. [MongoDB O'rnatish](#3-mongodb-ornatish)
4. [Google Gemini API Key Olish](#4-google-gemini-api-key-olish)
5. [Loyihani Yuklab Olish](#5-loyihani-yuklab-olish)
6. [Backend Sozlash](#6-backend-sozlash)
7. [Frontend Sozlash](#7-frontend-sozlash)
8. [Ishga Tushirish](#8-ishga-tushirish)
9. [Tekshirish](#9-tekshirish)
10. [Muammolarni Hal Qilish](#10-muammolarni-hal-qilish)

---

## 1. TIZIM TALABLARI

### Minimal Talablar:
- **OS:** Windows 10+, macOS 10.15+, Linux (Ubuntu 20.04+)
- **RAM:** 4GB (8GB tavsiya etiladi)
- **Disk:** 2GB bo'sh joy
- **Internet:** API uchun

### Kerakli Dasturlar:
✅ Node.js 18+
✅ npm yoki yarn
✅ MongoDB 6+
✅ Git (ixtiyoriy)
✅ VS Code yoki boshqa code editor

---

## 2. NODE.JS O'RNATISH

### Windows:
1. [nodejs.org](https://nodejs.org/) ga kiring
2. **LTS** versiyasini yuklab oling (masalan: 20.11.0)
3. `.msi` faylni ishga tushiring
4. "Next" bosib o'rnating (barcha default settings)
5. Terminal (CMD) ochib tekshiring:
   ```bash
   node --version
   npm --version
   ```
   Natija: `v20.11.0` va `10.2.4` (yoki yangi)

### macOS:
```bash
# Homebrew orqali
brew install node

# Yoki nodejs.org dan yuklab oling
```

### Linux (Ubuntu/Debian):
```bash
# NodeSource repository qo'shish
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Node.js o'rnatish
sudo apt-get install -y nodejs

# Tekshirish
node --version
npm --version
```

---

## 3. MONGODB O'RNATISH

### Variant A: Local MongoDB (Tavsiya - Yangi boshlovchilar uchun)

#### Windows:
1. [MongoDB Community Download](https://www.mongodb.com/try/download/community) ga kiring
2. Versiya: Latest, Platform: Windows, Package: MSI
3. Yuklab oling va o'rnating
4. O'rnatish jarayonida:
   - "Complete" installation tanlang
   - "Install MongoDB as a Service" belgilang
   - Default settings qoldiring

5. MongoDB Compass ham o'rnatiladi (GUI client)

6. Ishga tushganini tekshirish:
   ```bash
   # CMD ochib
   mongod --version
   ```

#### macOS:
```bash
# Homebrew orqali
brew tap mongodb/brew
brew install mongodb-community

# Ishga tushirish
brew services start mongodb-community

# Tekshirish
mongosh
```

#### Linux (Ubuntu):
```bash
# Import GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Repository qo'shish
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update va o'rnatish
sudo apt-get update
sudo apt-get install -y mongodb-org

# Ishga tushirish
sudo systemctl start mongod
sudo systemctl enable mongod

# Tekshirish
sudo systemctl status mongod
```

### Variant B: MongoDB Atlas (Cloud - Oson va Bepul)

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) ga ro'yxatdan o'ting
2. "Build a Database" tugmasini bosing
3. **FREE** (M0) tier ni tanlang
4. Cloud Provider: AWS, Region: yaqin region
5. Cluster Name: `arabiyya-pro-cluster`
6. "Create" bosing (2-3 daqiqa kutish)

7. Security Setup:
   - **Database Access:** Username va Password yarating
   - **Network Access:** "Add IP Address" -> "Allow Access from Anywhere" (0.0.0.0/0)

8. Connection String:
   - "Connect" tugmasini bosing
   - "Connect your application" tanlang
   - Connection string nusxalang:
     ```
     mongodb+srv://username:<password>@arabiyya-pro-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - `<password>` ni o'z parolingiz bilan almashtiring

---

## 4. GOOGLE GEMINI API KEY OLISH

1. [Google AI Studio](https://makersuite.google.com/app/apikey) ga kiring
2. Google account bilan login qiling
3. "Get API Key" tugmasini bosing
4. "Create API key in new project" tanlang
5. API key paydo bo'ladi: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXX`
6. **DIQQAT:** Bu kalitni xavfsiz joyda saqlang!

---

## 5. LOYIHANI YUKLAB OLISH

### Variant A: Git orqali (Tavsiya)
```bash
git clone https://github.com/your-repo/arabiyya-pro.git
cd arabiyya-pro-platform
```

### Variant B: ZIP faylini yuklab olish
1. GitHub repository'dan "Code" -> "Download ZIP"
2. ZIP ni ochib, papkani terminalda oching:
   ```bash
   cd arabiyya-pro-platform
   ```

---

## 6. BACKEND SOZLASH

### 1. Backend papkasiga o'ting:
```bash
cd backend
```

### 2. Dependencies o'rnating:
```bash
npm install
```
Bu 2-3 daqiqa vaqt oladi. Kutib turing.

### 3. `.env` faylini yarating:
```bash
# Windows
copy .env.example .env

# macOS/Linux
cp .env.example .env
```

### 4. `.env` faylini tahrirlang:

**VS Code da ochish:**
```bash
code .env
```

**Yoki istalgan text editor'da ochib, quyidagilarni yozing:**

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB - Local uchun
MONGODB_URI=mongodb://localhost:27017/arabiyya-pro

# Yoki MongoDB Atlas uchun (3-qadamda olgan connection string)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/arabiyya-pro

# JWT Secret (ixtiyoriy 32+ belgili string)
JWT_SECRET=arabiyya-pro-super-secret-key-2024-change-this

# Google Gemini API Key (4-qadamda olgan)
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 5. Saqlang va yoping (Ctrl+S, Ctrl+W)

---

## 7. FRONTEND SOZLASH

### 1. Root papkaga qaytish:
```bash
cd ..
```
(Hozir `arabiyya-pro-platform` papkadasiz)

### 2. Dependencies o'rnating:
```bash
npm install
```
Bu ham 2-3 daqiqa vaqt oladi.

---

## 8. ISHGA TUSHIRISH

### Backend ishga tushirish:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

Natija ko'rishingiz kerak:
```
🚀 Server running on port 5000
🌍 Environment: development
📱 Frontend URL: http://localhost:3000
✅ MongoDB connected successfully
📊 Database: arabiyya-pro

✨ Arabiyya Pro Backend is ready!
```

Agar MongoDB error bo'lsa, 3-qadamni qayta tekshiring.

---

### Frontend ishga tushirish:

**Terminal 2 (Frontend) - YANGI terminal oching:**
```bash
# Root papkada
npm run dev
```

Natija:
```
  VITE v5.0.8  ready in 1234 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

---

## 9. TEKSHIRISH

### Backend Tekshirish:

1. Browser'da oching: `http://localhost:5000`
   
   Ko'rishingiz kerak:
   ```json
   {
     "message": "Welcome to Arabiyya Pro API",
     "version": "1.0.0",
     "endpoints": {...}
   }
   ```

2. Health check: `http://localhost:5000/api/health`
   ```json
   {
     "status": "OK",
     "message": "Arabiyya Pro API is running"
   }
   ```

### Frontend Tekshirish:

Browser'da: `http://localhost:3000`

Ko'rishingiz kerak:
- ✅ Arabiyya Pro bosh sahifasi
- ✅ Gradient background (ko'k-indigo-purple)
- ✅ Navigation bar
- ✅ "Bepul Boshlash" tugmasi

### To'liq Test:

1. "Bepul Boshlash" bosing
2. Ismingizni kiriting (masalan: "Abdulloh")
3. "Keyingi Qadam" bosing
4. 12 ta savolga javob bering
5. AI tahlilini kuting (5-10 soniya)
6. Daraja aniqlanishi kerak (A1, A2, B1, etc.)
7. "O'qishni Boshlash" bosing
8. Kurslar sahifasi ochilishi kerak

Agar barchasi ishlasa - **TABRIKLAYMIZ! 🎉**

---

## 10. MUAMMOLARNI HAL QILISH

### ❌ "MongoDB connection error"

**Sabab:** MongoDB ishlamayapti yoki connection string noto'g'ri

**Yechim:**
```bash
# Windows - MongoDB ishga tushiring
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Connection string tekshirish
# backend/.env faylida MONGODB_URI to'g'riligini tekshiring
```

---

### ❌ "Port 5000 already in use"

**Sabab:** 5000 port band

**Yechim:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>

# Yoki backend/.env da PORT ni o'zgartiring:
PORT=5001
```

---

### ❌ "npm: command not found"

**Sabab:** Node.js to'g'ri o'rnatilmagan

**Yechim:**
- Node.js ni qayta o'rnating (2-qadam)
- Terminal/CMD ni yopib qayta oching

---

### ❌ "AI responses not working"

**Sabab:** Gemini API key noto'g'ri yoki internet yo'q

**Yechim:**
1. `backend/.env` da `GEMINI_API_KEY` ni tekshiring
2. API key to'g'riligini [Google AI Studio](https://makersuite.google.com/app/apikey) da tekshiring
3. Internet connectionni tekshiring
4. Backend'ni qayta ishga tushiring

---

### ❌ "Cannot GET /"

**Sabab:** Frontend ishlamayapti

**Yechim:**
```bash
# Root papkada
npm run dev
```

---

### ❌ Dependencies install error

**Yechim:**
```bash
# Cache tozalash
npm cache clean --force

# node_modules o'chirish va qayta o'rnatish
rm -rf node_modules
npm install
```

---

## 📞 YORDAM KERAKMI?

Agar muammo hal bo'lmasa:

1. **Logs tekshiring:**
   - Backend terminal'dagi error messagelarni o'qing
   - Browser Console (F12) ni oching va errorlarni ko'ring

2. **Aloqa:**
   - Email: info@arabiyya.pro
   - Telegram: @arabiyya_pro
   - GitHub Issues

---

## 🎓 KEYINGI QADAMLAR

✅ Backend va Frontend ishlayapti
✅ MongoDB ulangan
✅ AI integration ishlayapti

**Endi nima qilish mumkin:**

1. **Kontent qo'shish:**
   - Video darslarni upload qilish
   - PDF kitoblarni qo'shish
   - Test savollarini kengaytirish

2. **Customization:**
   - Dizaynni o'zgartirish
   - Logo qo'shish
   - Ranglarni sozlash

3. **Production Deploy:**
   - Vercel (Frontend)
   - Heroku/Railway (Backend)
   - MongoDB Atlas (Database)

---

## 🚀 PRODUCTION DEPLOY

### Frontend (Vercel):
```bash
npm run build
# dist/ papkani Vercel ga yuklash
```

### Backend (Railway):
1. [Railway.app](https://railway.app) ga kiring
2. GitHub repo ulash
3. Environment variables qo'shish
4. Deploy!

---

**Muvaffaqiyatlar! Savollar bo'lsa, yordam so'rang! 💪**