const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const baseDir = path.join(__dirname, '../public/fiszki_zagrywki');
const results = {};

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.pdf')) {
      try {
        const out = execSync(`mdls -name kMDItemNumberOfPages "${fullPath}"`).toString();
        const match = out.match(/kMDItemNumberOfPages = (\d+)/);
        if (match) {
          const pages = parseInt(match[1], 10);
          const relPath = path.relative(baseDir, fullPath);
          results[relPath] = pages;
        }
      } catch (e) {
        console.error(e);
      }
    }
  }
}

walk(baseDir);
fs.writeFileSync(path.join(baseDir, 'pdf_meta.json'), JSON.stringify(results, null, 2));
console.log('Done');
