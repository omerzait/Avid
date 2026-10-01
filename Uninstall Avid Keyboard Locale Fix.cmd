@echo off
setlocal
set "APPDIR=%LOCALAPPDATA%\AvidKeyboardLocaleFix"
set "STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"

del /Q "%STARTUP%\Avid Keyboard Locale Fix.cmd" 2>nul

echo.
echo Startup entry removed.
echo.
echo If the script is currently running, right-click its AutoHotkey tray icon
echo and choose Exit. This uninstaller intentionally does NOT terminate all
echo AutoHotkey processes, because that could stop unrelated user scripts.
echo.

if exist "%APPDIR%" rmdir /S /Q "%APPDIR%"

echo Avid Keyboard Locale Fix files have been removed.
echo.
pause
