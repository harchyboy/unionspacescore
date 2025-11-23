# Auto-Deploy Setup

This project is configured for automatic commit and deployment after changes.

## Quick Deploy

After making changes to files, run:

```bash
pnpm run deploy
```

Or with a custom commit message:

```bash
pnpm run deploy:msg "Your custom commit message"
```

## Manual Scripts

You can also run the scripts directly:

**Windows (PowerShell):**
```powershell
.\auto-deploy.ps1
.\auto-deploy.ps1 -CommitMessage "Your custom message"
```

**Mac/Linux:**
```bash
chmod +x auto-deploy.sh
./auto-deploy.sh
./auto-deploy.sh "Your custom message"
```

## What It Does

The auto-deploy script will:
1. ✅ Check for changes
2. ✅ Stage all changes (`git add .`)
3. ✅ Commit with message (`git commit`)
4. ✅ Push to remote (`git push`)
5. ✅ Build static files (`pnpm run build`)

## Git Hooks (Optional)

Git hooks are set up to automatically deploy after commits:
- `.git/hooks/post-commit` - Runs after each commit
- `.git/hooks/post-commit.ps1` - Windows PowerShell version

Note: Git hooks may need to be made executable on Unix systems:
```bash
chmod +x .git/hooks/post-commit
```

## Usage in Cursor/AI Assistant

When the AI assistant makes changes, you can simply run:
```
pnpm run deploy
```

Or the assistant can run the PowerShell script directly:
```powershell
.\auto-deploy.ps1 -CommitMessage "Description of changes"
```

