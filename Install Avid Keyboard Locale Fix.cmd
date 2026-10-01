@echo off
setlocal
set "APPDIR=%LOCALAPPDATA%\AvidKeyboardLocaleFix"
set "STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"

where AutoHotkey.exe >nul 2>&1
if errorlevel 1 (
    where AutoHotkey64.exe >nul 2>&1
    if errorlevel 1 (
        echo.
        echo AutoHotkey v2 does not appear to be installed or available in PATH.
        echo Install AutoHotkey v2 from the official AutoHotkey website, then run this installer again.
        echo.
        pause
        exit /b 1
    )
)

if not exist "%APPDIR%" mkdir "%APPDIR%"
copy /Y "%~dp0Avid Keyboard Locale Fix.ahk" "%APPDIR%\Avid Keyboard Locale Fix.ahk" >nul

> "%STARTUP%\Avid Keyboard Locale Fix.cmd" (
  echo @echo off
  echo start "" "%APPDIR%\Avid Keyboard Locale Fix.ahk"
)

start "" "%APPDIR%\Avid Keyboard Locale Fix.ahk"

echo.
echo Avid Keyboard Locale Fix has been installed and started.
echo It will start automatically when you sign in to Windows.
echo.
pause
