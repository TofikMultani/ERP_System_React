@echo off
REM ERP System Backend Setup Script for Windows

echo.
echo ================================
echo ERP System Backend Setup
echo ================================
echo.

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js version:
node --version

echo ✅ npm version:
npm --version

echo.
echo Checking PostgreSQL...
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  PostgreSQL might not be installed or not in PATH
) else (
    echo ✅ PostgreSQL is installed
    psql --version
)

echo.
echo 📦 Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ✅ Setup completed!
echo.
echo Next steps:
echo 1. Create or update .env file with PostgreSQL credentials
echo 2. Create PostgreSQL database: CREATE DATABASE erp_system;
echo 3. Run backend server: npm run dev
echo.
echo Documentation:
echo - QUICK_START.md - Getting started guide
echo - DATABASE_SETUP.md - Database schema and setup
echo.
pause
