#!/usr/bin/env node

// Test script to check what environment variables would be available to the frontend
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

console.log("🔍 Testing Frontend Environment Variables\n");

// Load .env file
const envPath = path.join('.', '.env');
const envLocalPath = path.join('.', '.env.local');

console.log("📁 Checking environment files:");
console.log("   .env exists:", fs.existsSync(envPath));
console.log("   .env.local exists:", fs.existsSync(envLocalPath));

// Load .env first
let envConfig = {};
if (fs.existsSync(envPath)) {
  const envResult = dotenv.config({ path: envPath });
  if (envResult.error) {
    console.log("⚠️  Error loading .env:", envResult.error.message);
  } else {
    envConfig = { ...envResult.parsed };
    console.log("✅ Loaded .env file");
  }
}

// Load .env.local and override values
if (fs.existsSync(envLocalPath)) {
  const envLocalResult = dotenv.config({ path: envLocalPath });
  if (envLocalResult.error) {
    console.log("⚠️  Error loading .env.local:", envLocalResult.error.message);
  } else {
    envConfig = { ...envConfig, ...envLocalResult.parsed };
    console.log("✅ Loaded .env.local file (overrides .env values)");
  }
}

console.log("\n🔍 VITE Environment Variables:");
console.log("   VITE_SUPABASE_URL:", envConfig.VITE_SUPABASE_URL || "NOT SET");
console.log("   VITE_SUPABASE_PUBLISHABLE_KEY:", envConfig.VITE_SUPABASE_PUBLISHABLE_KEY ? `${envConfig.VITE_SUPABASE_PUBLISHABLE_KEY.substring(0, 30)}...` : "NOT SET");

console.log("\n🔍 Checking for placeholder values:");
if (envConfig.VITE_SUPABASE_URL === 'your_supabase_project_url') {
  console.log("❌ VITE_SUPABASE_URL is still using placeholder value!");
} else if (envConfig.VITE_SUPABASE_URL) {
  console.log("✅ VITE_SUPABASE_URL is properly set");
}

if (envConfig.VITE_SUPABASE_PUBLISHABLE_KEY === 'your_supabase_anon_key') {
  console.log("❌ VITE_SUPABASE_PUBLISHABLE_KEY is still using placeholder value!");
} else if (envConfig.VITE_SUPABASE_PUBLISHABLE_KEY) {
  console.log("✅ VITE_SUPABASE_PUBLISHABLE_KEY is properly set");
}

console.log("\n📋 Full environment config (VITE variables only):");
Object.keys(envConfig).filter(key => key.startsWith('VITE_')).forEach(key => {
  const value = envConfig[key];
  if (key.includes('KEY') || key.includes('SECRET')) {
    console.log(`   ${key}: ${value ? '***REDACTED***' : 'NOT SET'}`);
  } else {
    console.log(`   ${key}: ${value || 'NOT SET'}`);
  }
});