# PowerShell deployment script for contacts-only Vercel project

Write-Host "🚀 Deploying Contacts-Only Version to Vercel" -ForegroundColor Cyan
Write-Host ""

# Check if logged in
$whoami = vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Not logged in to Vercel. Please run: vercel login" -ForegroundColor Yellow
    Write-Host "   Then run this script again."
    exit 1
}

Write-Host "✅ Logged in to Vercel" -ForegroundColor Green
Write-Host ""

# Create or link project
Write-Host "📦 Creating/Linking Vercel project..." -ForegroundColor Cyan
vercel link --yes

# Set environment variable for contacts-only mode
Write-Host ""
Write-Host "🔧 Setting environment variable: VITE_ENABLED_FEATURES=contacts" -ForegroundColor Cyan
echo "contacts" | vercel env add VITE_ENABLED_FEATURES production
echo "contacts" | vercel env add VITE_ENABLED_FEATURES preview
echo "contacts" | vercel env add VITE_ENABLED_FEATURES development

# Deploy
Write-Host ""
Write-Host "🚀 Deploying to production..." -ForegroundColor Cyan
vercel --prod --yes

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Check the deployment URL above"
Write-Host "   2. The contacts-only version will be live at that URL"
Write-Host "   3. Only contacts functionality will be visible"

