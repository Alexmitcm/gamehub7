@echo off
echo ========================================
echo Comprehensive Fix and Commit Script
echo ========================================

echo.
echo Step 1: Verifying git remote...
git remote -v

echo.
echo Step 2: Checking if remote is correct...
git remote get-url origin | findstr "Alexmitcm/gamehub4" >nul
if %errorlevel% neq 0 (
    echo ❌ Remote is NOT set to Alexmitcm/gamehub4
    echo Setting correct remote...
    git remote set-url origin https://github.com/Alexmitcm/gamehub4.git
    echo ✅ Remote updated
) else (
    echo ✅ Remote is correctly set to Alexmitcm/gamehub4
)

echo.
echo Step 3: Killing Node.js processes to free port 8080...
taskkill /IM node.exe /F 2>nul
if %errorlevel% equ 0 (
    echo Successfully killed Node.js processes
) else (
    echo No Node.js processes found or already killed
)

echo.
echo Step 4: Waiting 3 seconds for processes to fully terminate...
timeout /t 3 /nobreak >nul

echo.
echo Step 5: Checking git status...
git status

echo.
echo Step 6: Adding all changes...
git add .

echo.
echo Step 7: Committing RPC proxy changes...
git commit -m "feat: Add RPC proxy to resolve CORS issues with Lens Protocol endpoints"

echo.
echo Step 8: Checking commit result...
git log --oneline -1

echo.
echo Step 9: Pushing to Alexmitcm/gamehub4 repository...
git push origin main

echo.
echo ========================================
echo ✅ All done! You can now run: npm run dev
echo ========================================
pause
