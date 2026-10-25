@echo off
title ProducePay — Dev
cd /d "%~dp0"

:: Wait 3 seconds in the background, then open the browser
start "" /b cmd /c "timeout /t 3 >nul & start http://localhost:5000"

call npm run dev
pause