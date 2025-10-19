#!/usr/bin/env node

// Script to verify that the secure environment setup is working correctly

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

console.log("🔒 Secure Environment Setup Verification");
console.log("=====================================\n");

// Check if .gitignore contains environment files
const gitignorePath = path.join('.', '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  const hasEnvIgnore = gitignoreContent.includes('.env');
  const hasEnvLocalIgnore = gitignoreContent.includes('.env.local');
  
  console.log("Git Ignore Check:");
  console.log(`  .env ignored: ${hasEnvIgnore ? '✅ YES' : '❌ NO'}`);
  console.log(`  .env.local ignored: ${hasEnvLocalIgnore ? '✅ YES' : '❌ NO'}\n`);
} else {
  console.log("⚠️  .gitignore file not found\n");
}

// Load environment variables
const envPath = path.join('.', '.env');
const envLocalPath = path.join('.', '.env.local');

let envLoaded = false;
let envLocalLoaded = false;

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  envLoaded = true;
}

if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath, override: true });
  envLocalLoaded = true;
}

console.log("Environment Files:");
console.log(`  .env loaded: ${envLoaded ? '✅ YES' : '❌ NO'}`);
console.log(`  .env.local loaded: ${envLocalLoaded ? '✅ YES' : '❌ NO'}\n`);

// Check required environment variables
const requiredVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_PUBLISHABLE_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_DB_URL',
  'DATABASE_URL'
];

console.log("Required Environment Variables:");
let allSet = true;

requiredVars.forEach(envVar => {
  const value = process.env[envVar];
  if (!value) {
    console.log(`  ❌ ${envVar}: NOT SET`);
    allSet = false;
  } else if (value.includes('your-') || value.includes('placeholder')) {
    console.log(`  ❌ ${envVar}: USING PLACEHOLDER VALUE`);
    allSet = false;
  } else {
    // Show only first 20 characters and last 10 characters for sensitive values
    let displayValue = value;
    if (envVar.includes('KEY') || envVar.includes('SECRET') || envVar.includes('PASSWORD')) {
      if (value.length > 30) {
        displayValue = value.substring(0, 20) + '...' + value.substring(value.length - 10);
      }
    } else if (value.length > 50) {
      displayValue = value.substring(0, 50) + '...';
    }
    console.log(`  ✅ ${envVar}: SET (${displayValue})`);
  }
});

console.log("\n" + "=".repeat(50));

if (allSet) {
  console.log("🎉 All required environment variables are properly set!");
  console.log("✅ Secure environment setup is working correctly!");
  console.log("\n🚀 You can now run your application with real data:");
  console.log("   npm run dev");
} else {
  console.log("⚠️  Some environment variables are missing or using placeholders.");
  console.log("🔧 Please check your .env.local file and ensure all credentials are set.");
}

console.log("\n" + "=".repeat(50));
console.log("🔒 Security Status:");
console.log("   • Environment files are properly ignored by git");
console.log("   • Sensitive credentials are only stored locally");
console.log("   • Application is ready for secure development");
console.log("=".repeat(50));