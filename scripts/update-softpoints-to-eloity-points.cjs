const fs = require('fs');
const path = require('path');

// Brand replacement mappings for SoftPoints
const brandReplacements = [
  // SoftPoints variations
  { from: 'SoftPoints', to: 'Eloity Points' },
  { from: 'Soft Points', to: 'Eloity Points' },
  { from: 'softPoints', to: 'eloityPoints' },
  { from: 'soft_points', to: 'eloity_points' },
  { from: 'currentSoftPoints', to: 'currentEloityPoints' },
  { from: 'totalSoftPointsEarned', to: 'totalEloityPointsEarned' },
  
  // CSS class updates
  { from: 'text-softpoints-', to: 'text-eloity-points-' },
  { from: 'bg-softpoints-', to: 'bg-eloity-points-' },
  { from: 'border-softpoints-', to: 'border-eloity-points-' },
  { from: 'hover:text-softpoints-', to: 'hover:text-eloity-points-' },
  { from: 'hover:bg-softpoints-', to: 'hover:bg-eloity-points-' },
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
    } else if (stat.isFile() && (item.endsWith('.tsx') || item.endsWith('.ts') || item.endsWith('.css') || item.endsWith('.md'))) {
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
console.log('🚀 Starting SoftPoints to Eloity Points update...\n');

const srcPath = path.join(process.cwd(), 'src');
if (fs.existsSync(srcPath)) {
  const updates = processDirectory(srcPath);
  console.log(`\n✅ SoftPoints update complete! Updated ${updates} files.`);
} else {
  console.error('❌ src directory not found!');
}

// Also update documentation files
const docsFiles = [
  'README.md',
  'README.comprehensive.md',
  'FEATURES_MOCKUP_ANALYSIS.md',
  'PLATFORM_AUDIT_REPORT.md',
  'REMAINING_FEATURES_IMPLEMENTATION_GUIDE.md',
  'UPDATED_IMPLEMENTATION_GUIDE.md',
  'REMAINING_WORK_SUMMARY.md'
];

let docUpdates = 0;
for (const docFile of docsFiles) {
  const fullPath = path.join(process.cwd(), docFile);
  if (fs.existsSync(fullPath)) {
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (updateFileContent(fullPath, content)) {
        docUpdates++;
      }
    } catch (error) {
      console.error(`Error processing ${fullPath}: ${error.message}`);
    }
  }
}

if (docUpdates > 0) {
  console.log(`\n📝 Updated ${docUpdates} documentation files.`);
}

console.log('\n📝 Next steps:');
console.log('1. Review the changes to ensure they look correct');
console.log('2. Test the application to ensure everything works');
console.log('3. Update any remaining references manually if needed');