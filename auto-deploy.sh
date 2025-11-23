#!/bin/bash
# Auto-deploy script for UNION Spaces Core
# This script commits changes, pushes to remote, and builds static files

COMMIT_MESSAGE="${1:-Auto-commit: Update Deal Room Dashboard}"

echo "Starting auto-deploy process..."

# Check if there are any changes
if [ -z "$(git status --porcelain)" ]; then
    echo "No changes to commit."
    exit 0
fi

echo ""
echo "Changes detected:"
git status --short

# Add all changes
echo ""
echo "Staging changes..."
git add .

# Commit changes
echo "Committing changes..."
git commit -m "$COMMIT_MESSAGE"

if [ $? -ne 0 ]; then
    echo "Commit failed!"
    exit 1
fi

# Push to remote
echo "Pushing to remote..."
git push

if [ $? -ne 0 ]; then
    echo "Push failed!"
    exit 1
fi

# Build static files
echo "Building static files..."
pnpm run build

if [ $? -ne 0 ]; then
    echo "Build failed!"
    exit 1
fi

echo ""
echo "✓ Auto-deploy completed successfully!"
echo "Changes committed, pushed, and built."

