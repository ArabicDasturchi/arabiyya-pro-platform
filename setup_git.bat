@echo off
echo ==========================================
echo Arabiyya Pro - Git Initialization Script
echo ==========================================
git init
git add .
git commit -m "Initial commit - Prepare for deployment"
echo.
echo ==========================================
echo Muvaffaqiyatli bajarildi!
echo Endi GitHub da yangi repo yarating va quyidagi buyruqlarni terminalda yozing:
echo.
echo git remote add origin <SIZNING_GITHUB_REPO_URL>
echo git push -u origin master
echo ==========================================
pause
