# Clear Next.js Cache Script

Write-Host "Clearing Next.js cache..." -ForegroundColor Yellow

# Delete .next folder
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "✓ .next folder deleted" -ForegroundColor Green
} else {
    Write-Host "⚠ .next folder not found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Cache cleared! Now restart your dev server:" -ForegroundColor Green
Write-Host "  npm run dev" -ForegroundColor Cyan

