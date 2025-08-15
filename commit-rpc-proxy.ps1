Write-Host "========================================" -ForegroundColor Green
Write-Host "Fixing Port Conflict and Committing RPC Proxy" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host ""
Write-Host "Step 1: Verifying git remote..." -ForegroundColor Yellow
git remote -v

Write-Host ""
Write-Host "Step 2: Killing Node.js processes to free port 8080..." -ForegroundColor Yellow
try {
    Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
    Write-Host "Successfully killed Node.js processes" -ForegroundColor Green
} catch {
    Write-Host "No Node.js processes found or already killed" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 3: Waiting 2 seconds for processes to fully terminate..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "Step 4: Checking git status..." -ForegroundColor Yellow
git status

Write-Host ""
Write-Host "Step 5: Adding all changes..." -ForegroundColor Yellow
git add .

Write-Host ""
Write-Host "Step 6: Committing RPC proxy changes..." -ForegroundColor Yellow
git commit -m "feat: Add RPC proxy to resolve CORS issues with Lens Protocol endpoints"

Write-Host ""
Write-Host "Step 7: Checking commit result..." -ForegroundColor Yellow
git log --oneline -1

Write-Host ""
Write-Host "Step 8: Pushing to remote repository..." -ForegroundColor Yellow
git push

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Done! You can now run: npm run dev" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Read-Host "Press Enter to continue"
