# Deployment Guide

This guide shows you how to deploy the UNION Core Property area to Vercel with dummy data.

## Quick Deploy to Vercel

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
# Create a repo on GitHub, then:
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up/login with GitHub
3. Click **"New Project"**
4. Import your GitHub repository
5. Vercel will auto-detect Vite settings
6. Click **"Deploy"**
7. Your app will be live in ~2 minutes!

## How It Works

The app uses **Vercel Serverless Functions** to serve dummy data in production:

- `api/properties.ts` - Handles GET (list) and POST (create) for `/api/properties`
- `api/properties/[id].ts` - Handles GET and PATCH for `/api/properties/:id`
- `api/properties/[id]/documents.ts` - Handles POST for document uploads

**No backend needed!** All dummy data is served via Vercel's serverless functions.

## Testing Your Deployment

After deployment, visit:
- `https://your-app.vercel.app/properties` - Properties list
- `https://your-app.vercel.app/properties/99-bishopsgate` - Property details
- `https://your-app.vercel.app/properties/new` - Add property

## Local Development vs Production

- **Local**: Uses MSW (Mock Service Worker) for API mocking
- **Production**: Uses Vercel Serverless Functions with the same dummy data

Both use the same API endpoints (`/api/properties`), so the code works the same way!

## Environment Variables

No environment variables needed! The app automatically:
- Uses MSW in local development (`VITE_ENV=local`)
- Uses Vercel functions in production

## Troubleshooting

**If API calls fail:**
- Check that the `api/` folder is in your repository
- Verify Vercel detected the serverless functions (check Functions tab in Vercel dashboard)
- Check browser console for errors

**If the app shows a blank page:**
- Verify the build completed successfully
- Check that routing is working (SPA redirects are configured in `vercel.json`)
