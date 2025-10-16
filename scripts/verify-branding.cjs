const fs = require('fs');
const path = require('path');

// Search for any remaining old brand references
const oldBrandTerms = [
  'Softchat',
  'SoftChat',
  'softchat',
  'SoftPoints',
  'Soft Points',
  'softPoints',
  'soft_points'
];

function searchForOldBranding(dirPath) {
  const items = fs.readdirSync(dirPath);
  const foundReferences = [];
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      foundReferences.push(...searchForOldBranding(fullPath));
    } else if (stat.isFile() && (item.endsWith('.tsx') || item.endsWith('.ts') || item.endsWith('.css') || item.endsWith('.md'))) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        for (const term of oldBrandTerms) {
          const regex = new RegExp(term, 'gi');
          if (regex.test(content)) {
            foundReferences.push({
              file: fullPath,
              term: term
            });
          }
        }
      } catch (error) {
        console.error(`Error processing ${fullPath}: ${error.message}`);
      }
    }
  }
  
  return foundReferences;
}

// Main execution
console.log('🔍 Verifying complete brand rebranding from Softchat to Eloity...\n');

const srcPath = path.join(process.cwd(), 'src');
if (fs.existsSync(srcPath)) {
  const references = searchForOldBranding(srcPath);
  
  if (references.length === 0) {
    console.log('✅ No remaining Softchat/SoftPoints references found in src directory!');
  } else {
    console.log('⚠️  Found remaining references:');
    references.forEach(ref => {
      console.log(`  - ${ref.term} in ${ref.file}`);
    });
  }
} else {
  console.error('❌ src directory not found!');
}

// Check documentation files
const docsFiles = [
  'README.md',
  'README.comprehensive.md',
  'FEATURES_MOCKUP_ANALYSIS.md',
  'PLATFORM_AUDIT_REPORT.md',
  'REMAINING_FEATURES_IMPLEMENTATION_GUIDE.md',
  'UPDATED_IMPLEMENTATION_GUIDE.md',
  'REMAINING_WORK_SUMMARY.md'
];

let docReferences = [];
for (const docFile of docsFiles) {
  const fullPath = path.join(process.cwd(), docFile);
  if (fs.existsSync(fullPath)) {
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const term of oldBrandTerms) {
        const regex = new RegExp(term, 'gi');
        if (regex.test(content)) {
          docReferences.push({
            file: fullPath,
            term: term
          });
        }
      }
    } catch (error) {
      console.error(`Error processing ${fullPath}: ${error.message}`);
    }
  }
}

if (docReferences.length === 0) {
  console.log('✅ No remaining Softchat/SoftPoints references found in documentation files!');
} else {
  console.log('⚠️  Found remaining references in documentation:');
  docReferences.forEach(ref => {
    console.log(`  - ${ref.term} in ${ref.file}`);
  });
}

console.log('\n🎉 Brand rebranding verification complete!');