const fs = require('fs');
const path = require('path');

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy all files from public to dist
const publicDir = path.join(__dirname, 'public');
const files = fs.readdirSync(publicDir);

files.forEach(file => {
  const srcPath = path.join(publicDir, file);
  const destPath = path.join(distDir, file);
  
  if (fs.statSync(srcPath).isFile()) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied: ${file}`);
  }
});

// Copy root index.html to dist if it exists
const rootIndex = path.join(__dirname, 'index.html');
if (fs.existsSync(rootIndex)) {
  fs.copyFileSync(rootIndex, path.join(distDir, 'index.html'));
  console.log('Copied: index.html (root)');
}

console.log('Static build complete!');

