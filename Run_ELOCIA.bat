@echo off
title ELOCIA Desktop Application Launcher
color 0B

echo =========================================================
echo             STARTING ELOCIA DESKTOP SYSTEM
echo =========================================================
echo.

set SCRIPT_DIR=%~dp0

:: Auto-detect repository location (supports running from inside elocia or from parent folder)
if exist "%SCRIPT_DIR%backend" (
    set ROOT_DIR=%SCRIPT_DIR%
) else if exist "%SCRIPT_DIR%elocia\backend" (
    set ROOT_DIR=%SCRIPT_DIR%elocia\
) else (
    echo [ERROR] Could not find 'backend' folder relative to %SCRIPT_DIR%
    echo Make sure Run_ELOCIA.bat is located inside the elocia project folder.
    pause
    exit /b 1
)

set BACKEND_DIR=%ROOT_DIR%backend
set FRONTEND_DIR=%ROOT_DIR%apps\student-desktop\frontend
set DESKTOP_DIR=%ROOT_DIR%apps\student-desktop\desktop

:: 1. Verify Directories
if not exist "%BACKEND_DIR%" (
    echo [ERROR] Backend folder not found at %BACKEND_DIR%
    pause
    exit /b 1
)

:: 2. Check and Start Backend Service (Port 8000)
echo [1/3] Starting FastAPI Backend on Port 8000...
start "ELOCIA - Backend Service" /min cmd /c "cd /d ""%BACKEND_DIR%"" && venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000"

:: 3. Check and Start Student Desktop Frontend (Port 5173)
echo [2/3] Starting Frontend Dev Server on Port 5173...
start "ELOCIA - Frontend Server" /min cmd /c "cd /d ""%FRONTEND_DIR%"" && npm run dev"

:: Wait 3 seconds for backend and frontend to initialize
echo Waiting for servers to initialize...
timeout /t 3 /nobreak >nul

:: 4. Launch Native Desktop Window (PyWebView + Vision on Port 8001)
echo [3/3] Launching ELOCIA Desktop Application Window...
cd /d "%DESKTOP_DIR%"
"%DESKTOP_DIR%\venv\Scripts\python.exe" main.py

:: When the user closes the desktop window, clean up background tasks
echo.
echo =========================================================
echo             CLOSING ELOCIA BACKGROUND SERVICES
echo =========================================================
taskkill /F /FI "WINDOWTITLE eq ELOCIA - Backend Service*" /T >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq ELOCIA - Frontend Server*" /T >nul 2>&1

echo Done! Have a great day.
timeout /t 2 /nobreak >nul
exit
