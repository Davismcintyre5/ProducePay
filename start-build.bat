@echo off
title ProducePay — Build + Dev
cd /d "%~dp0"

echo [BUILD] Building frontend...
call npm run build
if errorlevel 1 (
  echo [ERROR] Frontend build failed.
  pause
  exit /b 1
)

echo.
echo [RUN] Starting server...
call npm run dev
pause