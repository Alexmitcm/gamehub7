@echo off
echo ========================================
echo Verifying Git Remote Configuration
echo ========================================

echo.
echo Current git remote configuration:
git remote -v

echo.
echo Checking if remote points to Alexmitcm/gamehub4...
git remote get-url origin | findstr "Alexmitcm/gamehub4" >nul
if %errorlevel% equ 0 (
    echo ✅ Remote is correctly set to Alexmitcm/gamehub4
) else (
    echo ❌ Remote is NOT set to Alexmitcm/gamehub4
    echo.
    echo Current remote URL:
    git remote get-url origin
    echo.
    echo To fix this, run:
    echo git remote set-url origin https://github.com/Alexmitcm/gamehub4.git
)

echo.
echo ========================================
pause
