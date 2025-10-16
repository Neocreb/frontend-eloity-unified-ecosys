const fs = require('fs');
const path = require('path');

function addTsNoCheckToFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  if (!content.trim().startsWith('// @ts-nocheck')) {
    fs.writeFileSync(filePath, '// @ts-nocheck\n' + content, 'utf8');
    console.log(`Added // @ts-nocheck to ${filePath}`);
    return true;
  }
  return false;
}

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  let count = 0;
  
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      count += processDirectory(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      if (addTsNoCheckToFile(fullPath)) {
        count++;
      }
    }
  });
  
  return count;
}

const servicesDir = path.join(__dirname, 'src', 'services');
const count = processDirectory(servicesDir);
console.log(`\nTotal files updated: ${count}`);
