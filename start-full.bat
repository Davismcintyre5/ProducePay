@echo off
title ProducePay — Full Setup + Dev
cd /d "%~dp0"

echo.
echo ================================
echo   ProducePay — Full Setup
echo ================================
echo.

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm not found in PATH.
  echo Install Node.js 20+ from https://nodejs.org
  echo.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo [SETUP] Installing backend dependencies...
  call npm install
  if errorlevel 1 (
    echo [ERROR] Backend install failed.
    pause
    exit /b 1
  )
  echo.
)

if not exist "frontend\node_modules" (
  echo [SETUP] Installing frontend dependencies...
  pushd frontend
  call npm install
  popd
  if errorlevel 1 (
    echo [ERROR] Frontend install failed.
    pause
    exit /b 1
  )
  echo.
)

if not exist ".env" (
  if exist ".env.example" (
    echo [SETUP] .env missing — copying from .env.example
    copy /Y ".env.example" ".env" >nul
    echo [WARN] Edit .env with your real secrets before use.
    echo.
  )
)

echo [BUILD] Building frontend...
call npm run build
if errorlevel 1 (
  echo [ERROR] Frontend build failed.
  pause
  exit /b 1
)
echo.

echo [RUN] Starting dev server...
echo.
call npm run dev
pause