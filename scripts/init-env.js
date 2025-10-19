#!/usr/bin/env node

// Script to initialize the .env file from .env.example

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.join(__dirname, "..");
const envExamplePath = path.join(projectRoot, ".env.example");
const envPath = path.join(projectRoot, ".env");

console.log("🔧 Initializing Environment Configuration...\n");

// Check if .env.example exists
if (!fs.existsSync(envExamplePath)) {
  console.log("❌ .env.example file not found!");
  process.exit(1);
}

// Check if .env already exists
if (fs.existsSync(envPath)) {
  console.log("⚠️  .env file already exists. Skipping initialization.");
  console.log("   If you want to reinitialize, delete the existing .env file first.");
  process.exit(0);
}

try {
  // Copy .env.example to .env
  fs.copyFileSync(envExamplePath, envPath);
  console.log("✅ .env file created successfully from .env.example");
  
  console.log("\n📝 Next steps:");
  console.log("   1. Open the .env file in a text editor");
  console.log("   2. Update the placeholder values with your actual credentials");
  console.log("   3. For Supabase credentials, you'll need to:");
  console.log("      a. Create a Supabase project at https://supabase.com/");
  console.log("      b. Get your project URL and API keys from Project Settings > API");
  console.log("      c. Get your database password from Settings > Database");
  console.log("   4. Run the environment test script to verify:");
  console.log("      node scripts/test-env-config.js");
  
  console.log("\n🔐 Security Reminder:");
  console.log("   • Never commit the .env file to version control");
  console.log("   • Use different credentials for development and production");
  console.log("   • Keep your service role key secret");
} catch (error) {
  console.error("❌ Error creating .env file:", error.message);
  process.exit(1);
}