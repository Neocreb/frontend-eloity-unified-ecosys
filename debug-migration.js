#!/usr/bin/env node
/* Debug the migration file splitting */

import fs from 'fs';
import path from 'path';

const MIGRATION_FILE = path.join(process.cwd(), 'migrations', '0003_create_remaining_features_tables.sql');

// Read the migration file
const migrationContent = fs.readFileSync(MIGRATION_FILE, 'utf-8');

console.log('Migration file size:', migrationContent.length, 'characters');
console.log('First 200 characters:', migrationContent.substring(0, 200));

// Try different splitting methods
console.log('\n=== Splitting by \\n\\n ===');
const statements1 = migrationContent.split('\n\n');
console.log('Number of parts:', statements1.length);
console.log('First 3 parts:');
for (let i = 0; i < Math.min(3, statements1.length); i++) {
  console.log(`Part ${i + 1}:`, statements1[i].substring(0, 100));
}

console.log('\n=== Splitting by double newline pattern ===');
const statements2 = migrationContent.split(/\n\s*\n/);
console.log('Number of parts:', statements2.length);
console.log('First 3 parts:');
for (let i = 0; i < Math.min(3, statements2.length); i++) {
  console.log(`Part ${i + 1}:`, statements2[i].substring(0, 100));
}

console.log('\n=== Filtering out comments and empty parts ===');
const statements3 = statements2
  .map(stmt => stmt.trim())
  .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('/*'));
console.log('Number of filtered parts:', statements3.length);
console.log('First 3 parts:');
for (let i = 0; i < Math.min(3, statements3.length); i++) {
  console.log(`Part ${i + 1}:`, statements3[i].substring(0, 100));
}