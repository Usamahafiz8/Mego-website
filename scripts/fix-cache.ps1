# PowerShell script to fix Next.js cache issues
# Run: .\scripts\fix-cache.ps1

Write-Host "Clearing Next.js cache..." -ForegroundColor Yellow

# Remove .next directory
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "✓ Removed .next directory" -ForegroundColor Green
}

# Remove node_modules cache
if (Test-Path "node_modules\.cache") {
    Remove-Item -Recurse -Force "node_modules\.cache"
    Write-Host "✓ Removed node_modules cache" -ForegroundColor Green
}

Write-Host "`nCache cleared! Now run: npm run dev" -ForegroundColor Green




