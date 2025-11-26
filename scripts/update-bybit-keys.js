#!/usr/bin/env node

// Script to update Bybit API keys in the .env.local file

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.join(__dirname, "..");
const envLocalPath = path.join(projectRoot, ".env.local");

console.log("🔧 Updating Bybit API Keys...\n");

// Function to prompt user for input
function prompt(question) {
  return new Promise((resolve) => {
    process.stdout.write(question);
    process.stdin.once('data', (data) => {
      resolve(data.toString().trim());
    });
  });
}

async function updateBybitKeys() {
  try {
    // Check if .env.local file exists
    if (!fs.existsSync(envLocalPath)) {
      console.log("❌ .env.local file not found!");
      console.log("Please create a .env.local file first by copying .env.example");
      process.exit(1);
    }

    console.log("📝 Please provide your Bybit API keys:\n");
    
    // Get Bybit API keys from user
    const bybitPublicKey = await prompt('Bybit Public API Key: ');
    const bybitSecretKey = await prompt('Bybit Secret API Key: ');

    // Read current .env.local file
    let envContent = fs.readFileSync(envLocalPath, 'utf8');

    // Update Bybit API keys
    envContent = envContent.replace(
      /BYBIT_PUBLIC_API=.*/,
      `BYBIT_PUBLIC_API=${bybitPublicKey}`
    );
    envContent = envContent.replace(
      /BYBIT_SECRET_API=.*/,
      `BYBIT_SECRET_API=${bybitSecretKey}`
    );

    // Write updated .env.local file
    fs.writeFileSync(envLocalPath, envContent);
    console.log('\n✅ Bybit API keys updated successfully!');

    console.log('\n📋 Next steps:');
    console.log('1. Restart your development server: npm run dev');
    console.log('2. Test the Bybit integration: node test-bybit-integration.js');
    
  } catch (error) {
    console.error('❌ Error updating Bybit API keys:', error.message);
    process.exit(1);
  }
}

// Run the script if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  updateBybitKeys();
}