#!/usr/bin/env node

// Script to test if environment variables are properly configured

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if .env file exists
const envPath = path.join(__dirname, "..", ".env");
const envLocalPath = path.join(__dirname, "..", ".env.local");

console.log("🔍 Looking for environment files:");
console.log("📁 .env file exists:", fs.existsSync(envPath));
console.log("📁 .env.local file exists:", fs.existsSync(envLocalPath));

// Load environment variables from .env first, then .env.local (latter will override)
let result = dotenv.config({ path: envPath });

if (result.error) {
  console.log("⚠️  Warning loading .env file:", result.error.message);
}

// Load .env.local if it exists (will override .env values)
if (fs.existsSync(envLocalPath)) {
  result = dotenv.config({ path: envLocalPath, override: true });
  
  if (result.error) {
    console.log("⚠️  Warning loading .env.local file:", result.error.message);
  } else {
    console.log("✅ .env.local file loaded successfully (overrides .env values)");
  }
}

console.log("\n🔍 Testing Environment Configuration...\n");

// Check required environment variables
const requiredVars = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_DB_URL",
  "DATABASE_URL",
];

let allSet = true;

console.log("📋 Checking Required Environment Variables:\n");

requiredVars.forEach((envVar) => {
  const value = process.env[envVar];
  console.log(`${envVar}: ${value ? (value.substring(0, 30) + (value.length > 30 ? "..." : "")) : "NOT SET"}`);
  if (!value) {
    console.log(`❌ ${envVar}: NOT SET`);
    allSet = false;
  } else if (value.includes("your-") || value.includes("placeholder")) {
    console.log(`❌ ${envVar}: USING PLACEHOLDER VALUE`);
    allSet = false;
  } else {
    console.log(`✅ ${envVar}: SET`);
  }
});

console.log("\n" + "=".repeat(50));

if (allSet) {
  console.log("🎉 All required environment variables are properly set!");
  console.log("\n🚀 You can now run your migrations:");
  console.log("   npm run migrate:apply");
} else {
  console.log("⚠️  Some environment variables are missing or using placeholders.");
  console.log("\n🔧 To fix this issue:");
  console.log("   1. Create a Supabase project at https://supabase.com/");
  console.log("   2. Update .env.local with your actual Supabase credentials");
  console.log("   3. For detailed instructions, see SUPABASE_SETUP_INSTRUCTIONS.md");
  console.log("\n📝 Required variables:");
  requiredVars.forEach((envVar) => {
    console.log(`      • ${envVar}`);
  });
}

console.log("\n" + "=".repeat(50));
console.log("🔒 Security Reminder: Never commit .env.local to version control!");
console.log("   It's already in .gitignore for your protection.");
console.log("=".repeat(50));