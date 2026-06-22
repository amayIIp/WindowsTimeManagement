@echo off
echo ========================================================
echo   Windows Digital Wellbeing Tracker - Onboarding Setup
echo ========================================================
echo.

set "EXE_FILE=D:\Digital wellbeing\wellbeing-tracker\dist\WellbeingTracker.exe"
set "STARTUP_DIR=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "SHORTCUT_PATH=%STARTUP_DIR%\WellbeingTracker.lnk"

if not exist "%EXE_FILE%" (
    echo [ERROR] WellbeingTracker.exe not found. Please wait for the build to finish.
    pause
    exit /b 1
)

echo [1/3] Creating shortcut in Windows Startup folder...
powershell -Command "$wshell = New-Object -ComObject WScript.Shell; $shortcut = $wshell.CreateShortcut('%SHORTCUT_PATH%'); $shortcut.TargetPath = '%EXE_FILE%'; $shortcut.WorkingDirectory = 'D:\Digital wellbeing\wellbeing-tracker\dist'; $shortcut.Save()"

echo       Done! The tracker will now start seamlessly when you log in.

echo.
echo [2/3] Starting the background tracker now...
start "" "%EXE_FILE%"
echo       Done! Processes are running invisibly in the background.

echo.
echo [3/3] Opening your dashboard...
timeout /t 3 >nul
start http://localhost:7331

echo.
echo Setup Complete! 
echo You can close this window. Your tracker is running seamlessly.
echo To completely stop the tracker, end 'WellbeingTracker.exe' in Task Manager.
echo.
pause
