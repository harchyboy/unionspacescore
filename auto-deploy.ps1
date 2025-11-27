# Auto-deploy script for UNION Spaces Core
# This script commits changes, pushes to remote, and builds static files

param(
    [string]$CommitMessage = "Auto-commit: Update Deal Room Dashboard"
)

Write-Host "Starting auto-deploy process..." -ForegroundColor Cyan

# Get the current directory
$projectRoot = $PSScriptRoot
if (-not $projectRoot) {
    $projectRoot = Get-Location
}

Set-Location $projectRoot

# Check if there are any changes
$status = git status --porcelain
if (-not $status) {
    Write-Host "No changes to commit." -ForegroundColor Yellow
    exit 0
}

Write-Host "`nChanges detected:" -ForegroundColor Green
git status --short

# Add all changes
Write-Host "`nStaging changes..." -ForegroundColor Cyan
git add .

# Commit changes
Write-Host "Committing changes..." -ForegroundColor Cyan
git commit -m $CommitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Host "Commit failed!" -ForegroundColor Red
    exit 1
}

# Push to remote
Write-Host "Pushing to remote..." -ForegroundColor Cyan
git push

if ($LASTEXITCODE -ne 0) {
    Write-Host "Push failed!" -ForegroundColor Red
    exit 1
}

# Build static files
Write-Host "Building static files..." -ForegroundColor Cyan
pnpm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`nAuto-deploy completed successfully!" -ForegroundColor Green
Write-Host 'Changes committed, pushed, and built.' -ForegroundColor Green

