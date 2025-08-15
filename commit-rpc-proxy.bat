@echo off
echo ========================================
echo Fixing Port Conflict and Committing RPC Proxy
echo ========================================

echo.
echo Step 1: Verifying git remote...
git remote -v

echo.
echo Step 2: Killing Node.js processes to free port 8080...
taskkill /IM node.exe /F 2>nul
if %errorlevel% equ 0 (
    echo Successfully killed Node.js processes
) else (
    echo No Node.js processes found or already killed
)

echo.
echo Step 3: Waiting 2 seconds for processes to fully terminate...
timeout /t 2 /nobreak >nul

echo.
echo Step 4: Checking git status...
git status

echo.
echo Step 5: Adding all changes...
git add .

echo.
echo Step 6: Committing RPC proxy changes...
git commit -m "feat: Add RPC proxy to resolve CORS issues with Lens Protocol endpoints"

echo.
echo Step 7: Checking commit result...
git log --oneline -1

echo.
echo Step 8: Pushing to remote repository...
git push

echo.
echo ========================================
echo Done! You can now run: npm run dev
echo ========================================
pause
