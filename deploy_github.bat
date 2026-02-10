@echo off
echo ==========================================
echo GitHub ga yuklash boshlandi...
echo ==========================================

echo 1. Git initsializatsiya...
git init

echo 2. Fayllarni qo'shish...
git add .

echo 3. O'zgarishlarni saqlash (Commit)...
git commit -m "Admin panel yakunlandi va deployga tayyor"

echo 4. Asosiy tarmoqqa o'tish (Main)...
git branch -M main

echo 5. Masofaviy repozitoriyni ulash...
git remote remove origin
git remote add origin https://github.com/ArabicDasturchi/arabiyya-pro-platform.git

echo 6. GitHub ga yuklash (Push)...
echo DIQQAT: Agar birinchi marta bo'lsa, brauzerda GitHub ga kirishni so'rashi mumkin.
git push -u origin main

echo ==========================================
echo Muvaffaqiyatli yuklandi!
pause
