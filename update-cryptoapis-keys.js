#!/usr/bin/env node

// Script to update CryptoAPIs API keys in .env.local file

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

// Get __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to .env.local file
const envLocalPath = path.join(__dirname, '.env.local');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 CryptoAPIs API Key Updater');
console.log('==============================\n');

// Function to prompt user for input
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Function to update .env.local file
function updateEnvFile(cryptoapisKey) {
  try {
    // Read the current .env.local file
    let envContent = '';
    if (fs.existsSync(envLocalPath)) {
      envContent = fs.readFileSync(envLocalPath, 'utf8');
    }

    // Update or add CryptoAPIs API key
    const cryptoapisKeyRegex = /^CRYPTOAPIS_API_KEY=.*/m;
    if (envContent.match(cryptoapisKeyRegex)) {
      envContent = envContent.replace(cryptoapisKeyRegex, `CRYPTOAPIS_API_KEY=${cryptoapisKey}`);
    } else {
      // Add the key to the end of the file
      if (envContent && !envContent.endsWith('\n')) {
        envContent += '\n';
      }
      envContent += `CRYPTOAPIS_API_KEY=${cryptoapisKey}\n`;
    }

    // Write the updated content back to the file
    fs.writeFileSync(envLocalPath, envContent);
    console.log('✅ CryptoAPIs API key updated successfully in .env.local');
    return true;
  } catch (error) {
    console.error('❌ Error updating .env.local file:', error.message);
    return false;
  }
}

// Main function
async function main() {
  try {
    console.log('This script will help you update your CryptoAPIs API key in the .env.local file.\n');
    
    // Check if .env.local exists
    if (!fs.existsSync(envLocalPath)) {
      console.log('⚠️  .env.local file not found. Creating a new one...');
    }

    // Get CryptoAPIs API key from user
    const cryptoapisKey = await askQuestion('Enter your CryptoAPIs API Key (or press Enter to skip): ');
    
    if (!cryptoapisKey.trim()) {
      console.log('❌ No API key provided. Exiting.');
      rl.close();
      return;
    }

    // Update the .env.local file
    const success = updateEnvFile(cryptoapisKey.trim());
    
    if (success) {
      console.log('\n🎉 CryptoAPIs API key has been successfully configured!');
      console.log('\nNext steps:');
      console.log('1. Restart your development server: npm run dev');
      console.log('2. Test the crypto functionality in your application');
    } else {
      console.log('\n❌ Failed to update CryptoAPIs API key.');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

// Run the script
main();