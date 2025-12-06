#!/usr/bin/env pwsh
# Quick deploy script for UNION Spaces Core
# Usage: .\deploy.ps1 "Your commit message"

param(
    [string]$message = "Auto-deploy changes"
)

Write-Host "🚀 Starting deployment..." -ForegroundColor Cyan

# Stage all changes
Write-Host "📦 Staging changes..." -ForegroundColor Yellow
git add .

# Check if there are changes to commit
$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "✅ No changes to commit" -ForegroundColor Green
    exit 0
}

# Commit changes
Write-Host "💾 Committing changes..." -ForegroundColor Yellow
git commit -m $message --no-verify

# Push to fix-lockfile branch
Write-Host "📤 Pushing to fix-lockfile..." -ForegroundColor Yellow
git push

# Push to main branch (production)
Write-Host "🌐 Deploying to main (production)..." -ForegroundColor Yellow
git push origin fix-lockfile:main

Write-Host "✅ Deployment complete! Wait 1-2 minutes for Vercel to build." -ForegroundColor Green
Write-Host "🔄 Hard refresh your browser (Ctrl+Shift+R) to see changes." -ForegroundColor Cyan

