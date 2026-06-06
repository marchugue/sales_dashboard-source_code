@echo off
echo ==========================================
echo   Sales Dashboard Setup
echo ==========================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please download and install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/4] Node.js detected: 
node --version
echo.

:: Setup Backend
echo [2/4] Setting up Backend...
cd backend
if not exist node_modules (
    echo Installing backend dependencies...
    call npm install
) else (
    echo Backend dependencies already installed.
)
cd ..
echo.

:: Setup Frontend
echo [3/4] Setting up Frontend...
cd frontend
if not exist node_modules (
    echo Installing frontend dependencies...
    call npm install
) else (
    echo Frontend dependencies already installed.
)
cd ..
echo.

:: Create .env if not exists
echo [4/4] Checking configuration...
if not exist backend\.env (
    echo Creating backend\.env file...
    echo Please update it with your MySQL credentials.
) else (
    echo Configuration file exists.
)
echo.

echo ==========================================
echo   Setup Complete!
echo ==========================================
echo.
echo Next steps:
echo 1. Update backend\.env with your MySQL credentials
echo 2. Start backend: cd backend ^&^& npm run dev
echo 3. Start frontend: cd frontend ^&^& npm start
echo.
echo Backend will run on: http://localhost:5000
echo Frontend will run on: http://localhost:3000
echo.
pause
