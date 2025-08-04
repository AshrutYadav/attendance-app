@echo off
REM Development Setup Script for Windows
REM This script sets up the development environment

echo 🛠️ Setting up development environment...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check Node.js version
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [INFO] Node.js version: %NODE_VERSION%

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo [INFO] npm version: 
npm --version

REM Install dependencies
echo [INFO] Installing all dependencies...
call npm run install:all
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

REM Check if config.env exists
if not exist "backend\config.env" (
    echo [INFO] Creating backend configuration file...
    if exist "backend\config.env.example" (
        copy "backend\config.env.example" "backend\config.env"
        echo [INFO] Please edit backend\config.env with your settings
    ) else (
        echo [WARNING] config.env.example not found. Please create backend\config.env manually
    )
) else (
    echo [INFO] Backend configuration file already exists
)

echo.
echo ✅ Development environment setup completed!
echo.
echo [INFO] Next steps:
echo [INFO] 1. Edit backend\config.env with your database and JWT settings
echo [INFO] 2. Start MongoDB (if using local database)
echo [INFO] 3. Run: npm run dev
echo.
echo [INFO] The application will be available at:
echo [INFO] - Frontend: http://localhost:3000
echo [INFO] - Backend API: http://localhost:5000
echo.
pause 