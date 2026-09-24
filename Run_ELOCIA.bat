@echo off
title ELOCIA Desktop Application Launcher
color 0B

echo =========================================================
echo             STARTING ELOCIA DESKTOP SYSTEM
echo =========================================================
echo.

set "ROOT_DIR=%~dp0"

:: 1. Auto-resolve Directories (supporting both root and subfolder execution)
if exist "%ROOT_DIR%backend" (
    set "BACKEND_DIR=%ROOT_DIR%backend"
    set "FRONTEND_DIR=%ROOT_DIR%apps\student-desktop\frontend"
    set "DESKTOP_DIR=%ROOT_DIR%apps\student-desktop\desktop"
) else if exist "%ROOT_DIR%elocia\backend" (
    set "BACKEND_DIR=%ROOT_DIR%elocia\backend"
    set "FRONTEND_DIR=%ROOT_DIR%elocia\apps\student-desktop\frontend"
    set "DESKTOP_DIR=%ROOT_DIR%elocia\apps\student-desktop\desktop"
) else (
    echo [ERROR] Backend folder not found! Checked %ROOT_DIR%
    pause
    exit /b 1
)

:: 2. Auto-detect Python Executable on laptop
set "PYTHON_EXE="
if exist "%DESKTOP_DIR%\venv\Scripts\python.exe" (
    set "PYTHON_EXE=%DESKTOP_DIR%\venv\Scripts\python.exe"
) else if exist "%BACKEND_DIR%\venv\Scripts\python.exe" (
    set "PYTHON_EXE=%BACKEND_DIR%\venv\Scripts\python.exe"
) else if exist "%LOCALAPPDATA%\Programs\Python\Python311\python.exe" (
    set "PYTHON_EXE=%LOCALAPPDATA%\Programs\Python\Python311\python.exe"
) else (
    where py >nul 2>nul
    if %errorlevel% equ 0 (
        set "PYTHON_EXE=py -3.11"
    ) else (
        set "PYTHON_EXE=python"
    )
)

echo [INFO] Using Python: %PYTHON_EXE%
echo [INFO] Backend:  %BACKEND_DIR%
echo [INFO] Frontend: %FRONTEND_DIR%
echo [INFO] Desktop:  %DESKTOP_DIR%
echo.

:: 3. Start Backend Service (Port 8000)
echo [1/3] Starting FastAPI Backend on Port 8000...
start "ELOCIA - Backend Service" /min cmd /c "cd /d ""%BACKEND_DIR%"" && %PYTHON_EXE% -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

:: 4. Start Student Desktop Frontend Dev Server (Port 5173)
echo [2/3] Starting Student Frontend Dev Server on Port 5173...
start "ELOCIA - Frontend Server" /min cmd /c "cd /d ""%FRONTEND_DIR%"" && npm run dev"

:: Wait 4 seconds for backend and frontend dev servers to initialize
echo Waiting for servers to initialize...
timeout /t 4 /nobreak >nul

:: 5. Launch Native Desktop Window (PyWebView + CV Server on Port 8001)
echo [3/3] Launching ELOCIA Desktop Application Window...
cd /d "%DESKTOP_DIR%"
%PYTHON_EXE% main.py

:: 6. Clean up background services when the desktop window is closed
echo.
echo =========================================================
echo             CLOSING ELOCIA BACKGROUND SERVICES
echo =========================================================
taskkill /F /FI "WINDOWTITLE eq ELOCIA - Backend Service*" /T >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq ELOCIA - Frontend Server*" /T >nul 2>&1

echo Done! Have a great day.
timeout /t 2 /nobreak >nul
exit
