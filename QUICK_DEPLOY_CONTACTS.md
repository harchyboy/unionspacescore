# Quick Deploy Contacts-Only Version

## ✅ Code is Already Pushed!

Your feature flags code has been pushed to GitHub. Now deploy the contacts-only version.

---

## 🚀 Fastest Method: Vercel Dashboard (2 minutes)

### Step 1: Create New Project
1. Go to **[vercel.com/new](https://vercel.com/new)**
2. Click **"Import Git Repository"**
3. Select: **`harchyboy/unionspacescore`**
4. Click **"Import"**

### Step 2: Configure Project
- **Project Name**: `union-spaces-contacts` (or your preferred name)
- **Framework Preset**: Leave as "Other" or "Vite"
- **Root Directory**: `./` (default)
- **Build Command**: `npm run build:app` (or `node build-static.js`)
- **Output Directory**: `dist`
- **Install Command**: `npm install` (or `pnpm install`)

### Step 3: Add Environment Variable
1. Click **"Environment Variables"** (before deploying)
2. Click **"Add New"**
3. Enter:
   - **Key**: `VITE_ENABLED_FEATURES`
   - **Value**: `contacts`
   - **Environments**: ✅ Production ✅ Preview ✅ Development
4. Click **"Save"**

### Step 4: Deploy
1. Click **"Deploy"**
2. Wait ~2-3 minutes for build
3. **Your URL will be**: `https://union-spaces-contacts.vercel.app` (or similar)

---

## 🖥️ Alternative: CLI Method

If you prefer command line:

1. **Authenticate** (one-time):
   ```bash
   vercel login
   ```
   (Follow the browser prompt)

2. **Run deployment script**:
   ```powershell
   .\deploy-contacts.ps1
   ```
   (Windows PowerShell) or
   ```bash
   chmod +x deploy-contacts.sh
   ./deploy-contacts.sh
   ```
   (Mac/Linux)

---

## ✅ What You'll Get

- **URL**: `https://your-project-name.vercel.app`
- **Features**: Only contacts functionality visible
- **Navigation**: Only "Contacts" in sidebar
- **Routes**: All routes redirect to `/contacts` if not contacts-related

---

## 🔗 Share the URL

Once deployed, share the Vercel URL with your users. They'll only see contacts functionality!

