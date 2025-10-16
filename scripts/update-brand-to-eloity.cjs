const fs = require('fs');
const path = require('path');

// Brand replacement mappings
const brandReplacements = [
  // Main brand name variations
  { from: 'Softchat', to: 'Eloity' },
  { from: 'SoftChat', to: 'Eloity' },
  { from: 'softchat', to: 'eloity' },
  
  // Specific title replacements
  { from: 'Welcome to Softchat', to: 'Welcome to Eloity' },
  { from: 'Welcome to SoftChat', to: 'Welcome to Eloity' },
  
  // Email domains and specific references (keep these as is for now)
  // We'll handle email domains separately if needed
  
  // CSS class updates
  { from: 'text-softchat-', to: 'text-eloity-' },
  { from: 'bg-softchat-', to: 'bg-eloity-' },
  { from: 'border-softchat-', to: 'border-eloity-' },
  { from: 'hover:text-softchat-', to: 'hover:text-eloity-' },
  { from: 'hover:bg-softchat-', to: 'hover:bg-eloity-' },
];

// Files and patterns to search
const searchPatterns = [
  'src/**/*.tsx',
  'src/**/*.ts',
  'src/**/*.css'
];

function updateFileContent(filePath, content) {
  let updatedContent = content;
  let hasChanges = false;
  
  for (const replacement of brandReplacements) {
    const regex = new RegExp(replacement.from, 'g');
    if (regex.test(updatedContent)) {
      updatedContent = updatedContent.replace(regex, replacement.to);
      hasChanges = true;
    }
  }
  
  if (hasChanges) {
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
  
  return hasChanges;
}

function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);
  let totalUpdates = 0;
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      totalUpdates += processDirectory(fullPath);
    } else if (stat.isFile() && (item.endsWith('.tsx') || item.endsWith('.ts') || item.endsWith('.css'))) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (updateFileContent(fullPath, content)) {
          totalUpdates++;
        }
      } catch (error) {
        console.error(`Error processing ${fullPath}: ${error.message}`);
      }
    }
  }
  
  return totalUpdates;
}

// Main execution
console.log('🚀 Starting Eloity brand update...\n');

const srcPath = path.join(process.cwd(), 'src');
if (fs.existsSync(srcPath)) {
  const updates = processDirectory(srcPath);
  console.log(`\n✅ Brand update complete! Updated ${updates} files.`);
} else {
  console.error('❌ src directory not found!');
}

console.log('\n📝 Next steps:');
console.log('1. Review the changes to ensure they look correct');
console.log('2. Update any remaining email domains if needed');
console.log('3. Test the application to ensure everything works');
console.log('4. Update documentation and README files');
