# Quick Deployment Guide - MVP/Prototype

## 🚀 Fastest Options (Choose One)

### Option 1: Netlify Drop (FASTEST - No Account Needed!)
**Time: ~2 minutes**

1. **Build your static files:**
   ```bash
   pnpm run build
   ```

2. **Deploy:**
   - Go to [app.netlify.com/drop](https://app.netlify.com/drop)
   - Drag and drop your `dist` folder
   - Get instant live URL!

**Pros:** No signup, instant deployment, free HTTPS, custom domain support

---

### Option 2: Surge.sh (One Command)
**Time: ~3 minutes**

1. **Install Surge (one time):**
   ```bash
   npm install -g surge
   ```

2. **Build and deploy:**
   ```bash
   pnpm run build
   cd dist
   surge
   ```
   - Follow prompts (or use: `surge dist your-project-name.surge.sh`)

**Pros:** Free, instant, command-line friendly

---

### Option 3: Vercel CLI (If You Have It)
**Time: ~2 minutes**

1. **Install Vercel CLI (one time):**
   ```bash
   npm install -g vercel
   ```

2. **Build and deploy:**
   ```bash
   pnpm run build
   vercel --prod
   ```

**Pros:** Already configured, great performance, free tier

---

### Option 4: GitHub Pages (If Repo Exists)
**Time: ~5 minutes**

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "MVP ready"
   git push
   ```

2. **Deploy:**
   - Go to GitHub repo → Settings → Pages
   - Source: Deploy from branch
   - Branch: `main`, folder: `/dist`
   - Save → Get URL at `https://yourusername.github.io/repo-name`

---

## 🎯 Recommended: Netlify Drop

For MVP/client sign-off, **Netlify Drop** is the absolute fastest:
- ✅ No account required
- ✅ Drag & drop = instant live URL
- ✅ Free HTTPS
- ✅ Share link immediately with client

## 📝 After Deployment

Your HTML files will be accessible at:
- `https://your-site.netlify.app/index.html` (main dashboard)
- `https://your-site.netlify.app/Property List Dashboard.html`
- `https://your-site.netlify.app/Contacts List Page.html`
- etc.

## 🔄 Updating

Just rebuild and drag-drop again, or use one of the CLI options for automatic updates.

