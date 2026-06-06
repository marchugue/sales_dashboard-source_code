@echo off
echo ==========================================
echo   Starting Sales Dashboard
echo ==========================================
echo.

:: Start Backend in new window
echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm run dev"

:: Wait a moment for backend to start
timeout /t 3 /nobreak >nul

:: Start Frontend in new window
echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm start"

echo.
echo ==========================================
echo   Servers Started!
echo ==========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Close the server windows to stop.
echo.
