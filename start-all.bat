@echo off
title Resort Registry - Auto Start
setlocal

echo ================================================
echo   Resort Registry - Auto Start
echo ================================================
echo.

REM Setup environment
set JAVA_HOME=C:\Program Files\Java\latest\jdk-25
set PATH=%JAVA_HOME%\bin;C:\Program Files\nodejs;%PATH%
cd /d "D:\Baitap\java\Ck"

REM Check Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found!
    echo        Please install Node.js first
    echo        Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check Java
where java >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Java not found!
    echo        Please install Java first
    echo        Download from: https://www.oracle.com/java/technologies/downloads/
    pause
    exit /b 1
)

echo [1/3] Starting Backend...
echo.

REM Kill processes on port 8080
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080') do (
    taskkill /F /PID %%a >nul 2>&1
)

REM Start backend in separate window
start "Resort Backend" cmd /c "set JAVA_HOME=C:\Program Files\Java\latest\jdk-25 && set PATH=%JAVA_HOME%\bin;%PATH% && cd /d D:\Baitap\java\Ck && mvnw.cmd spring-boot:run"

echo [WAIT] Waiting for backend to start (45 seconds)...
timeout /t 45 /nobreak >nul

echo [OK] Backend started
echo.

echo [2/3] Starting Frontend...
echo.

REM Kill processes on port 8443
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8443') do (
    taskkill /F /PID %%a >nul 2>&1
)

REM Start frontend in separate window
start "Resort Frontend" cmd /c "set PATH=C:\Program Files\nodejs;%PATH% && cd /d D:\Baitap\java\Ck && npm run dev"

echo [WAIT] Waiting for frontend to start (15 seconds)...
timeout /t 15 /nobreak >nul

echo [OK] Frontend started
echo.

echo [3/3] Opening Browser...
echo.

REM Wait 3 seconds then open browser
timeout /t 3 /nobreak >nul

REM Open browser automatically
start http://localhost:8443

echo.
echo ================================================
echo   DONE! Application is running
echo ================================================
echo.
echo   Frontend: http://localhost:8443
echo   Backend:  http://localhost:8080/api
echo.
echo   Terminal windows are still open for monitoring
echo   Close terminal windows to stop the application
echo.

endlocal
