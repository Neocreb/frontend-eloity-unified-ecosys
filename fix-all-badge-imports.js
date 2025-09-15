#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to recursively find all .tsx and .ts files in src directory
function findFiles(dir, ext = ['.tsx', '.ts']) {
  let results = [];
  
  try {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        results = results.concat(findFiles(filePath, ext));
      } else if (ext.some(e => file.endsWith(e))) {
        results.push(filePath);
      }
    }
  } catch (err) {
    console.error('Error reading directory:', err);
  }
  
  return results;
}

// Function to fix Badge imports in a file
function fixBadgeImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Replace the incorrect Badge import with correct one
    const updatedContent = content.replace(
      /import\s*{\s*Badge\s*}\s*from\s*["']@\/components\/ui\/badge["'];?/g,
      'import { Badge } from "@/components/ui";'
    );
    
    // Only write if content changed
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`Fixed Badge import in: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (err) {
    console.error(`Error fixing file ${filePath}:`, err);
    return false;
  }
}

// Main execution
function main() {
  console.log('Starting Badge import fixes...');
  
  const srcDir = path.join(process.cwd(), 'src');
  const files = findFiles(srcDir);
  
  let fixedCount = 0;
  
  for (const file of files) {
    if (fixBadgeImports(file)) {
      fixedCount++;
    }
  }
  
  console.log(`\nCompleted! Fixed ${fixedCount} files.`);
  
  if (fixedCount === 0) {
    console.log('No Badge import issues found.');
  }
}

main();