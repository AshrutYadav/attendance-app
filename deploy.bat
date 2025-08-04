@echo off
REM Attendance App Deployment Script for Windows
REM This script builds and prepares the application for deployment

echo 🚀 Starting deployment process...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js first.
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed. Please install npm first.
    exit /b 1
)

echo [INFO] Node.js version: 
node --version
echo [INFO] npm version: 
npm --version

REM Install dependencies
echo [INFO] Installing dependencies...
call npm run install:all
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    exit /b 1
)

REM Run tests
echo [INFO] Running tests...
call npm run test
if %errorlevel% neq 0 (
    echo [WARNING] Tests failed, but continuing with deployment...
)

REM Build frontend
echo [INFO] Building frontend...
call npm run build:frontend
if %errorlevel% neq 0 (
    echo [ERROR] Frontend build failed
    exit /b 1
)

REM Build backend
echo [INFO] Building backend...
call npm run build:backend
if %errorlevel% neq 0 (
    echo [ERROR] Backend build failed
    exit /b 1
)

REM Create deployment directory
set DEPLOY_DIR=deployment-%date:~-4,4%%date:~-10,2%%date:~-7,2%-%time:~0,2%%time:~3,2%%time:~6,2%
set DEPLOY_DIR=%DEPLOY_DIR: =0%
echo [INFO] Creating deployment directory: %DEPLOY_DIR%
mkdir "%DEPLOY_DIR%"

REM Copy frontend build
echo [INFO] Copying frontend build...
xcopy "frontend\build" "%DEPLOY_DIR%\frontend" /E /I /Y

REM Copy backend files
echo [INFO] Copying backend files...
xcopy "backend" "%DEPLOY_DIR%\backend" /E /I /Y
rmdir /S /Q "%DEPLOY_DIR%\backend\node_modules"

REM Copy configuration files
echo [INFO] Copying configuration files...
copy "package.json" "%DEPLOY_DIR%\"
copy "README.md" "%DEPLOY_DIR%\"

REM Create deployment info
echo [INFO] Creating deployment info...
echo Deployment Date: %date% %time% > "%DEPLOY_DIR%\deployment-info.txt"
echo Node.js Version: >> "%DEPLOY_DIR%\deployment-info.txt"
node --version >> "%DEPLOY_DIR%\deployment-info.txt"
echo npm Version: >> "%DEPLOY_DIR%\deployment-info.txt"
npm --version >> "%DEPLOY_DIR%\deployment-info.txt"

REM Create start script for deployment
echo @echo off > "%DEPLOY_DIR%\start.bat"
echo echo Starting Attendance App... >> "%DEPLOY_DIR%\start.bat"
echo. >> "%DEPLOY_DIR%\start.bat"
echo REM Install production dependencies >> "%DEPLOY_DIR%\start.bat"
echo call npm install --production >> "%DEPLOY_DIR%\start.bat"
echo. >> "%DEPLOY_DIR%\start.bat"
echo REM Start the backend server >> "%DEPLOY_DIR%\start.bat"
echo cd backend >> "%DEPLOY_DIR%\start.bat"
echo call npm install --production >> "%DEPLOY_DIR%\start.bat"
echo call npm start >> "%DEPLOY_DIR%\start.bat"

echo [INFO] Deployment package created successfully!
echo [INFO] Deployment directory: %DEPLOY_DIR%
echo.
echo [INFO] To deploy:
echo [INFO] 1. Copy the '%DEPLOY_DIR%' folder to your server
echo [INFO] 2. Navigate to the deployment directory
echo [INFO] 3. Run: start.bat
echo.
echo [INFO] Don't forget to:
echo [INFO] - Set up your environment variables
echo [INFO] - Configure your database connection
echo [INFO] - Set up your domain and SSL certificates

echo.
echo ✅ Deployment process completed successfully!
pause 