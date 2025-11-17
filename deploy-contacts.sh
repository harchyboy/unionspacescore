#!/bin/bash
# Deployment script for contacts-only Vercel project

echo "🚀 Deploying Contacts-Only Version to Vercel"
echo ""

# Check if logged in
if ! vercel whoami &> /dev/null; then
    echo "⚠️  Not logged in to Vercel. Please run: vercel login"
    echo "   Then run this script again."
    exit 1
fi

echo "✅ Logged in to Vercel"
echo ""

# Create or link project
echo "📦 Creating/Linking Vercel project..."
vercel link --yes

# Set environment variable for contacts-only mode
echo ""
echo "🔧 Setting environment variable: VITE_ENABLED_FEATURES=contacts"
vercel env add VITE_ENABLED_FEATURES production <<< "contacts"
vercel env add VITE_ENABLED_FEATURES preview <<< "contacts"
vercel env add VITE_ENABLED_FEATURES development <<< "contacts"

# Deploy
echo ""
echo "🚀 Deploying to production..."
vercel --prod --yes

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Check the deployment URL above"
echo "   2. The contacts-only version will be live at that URL"
echo "   3. Only contacts functionality will be visible"

