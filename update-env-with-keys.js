#!/usr/bin/env node

// Script to update .env file with actual secret keys
// Run this script after retrieving your keys from Supabase Edge Functions

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔄 Updating .env file with actual secret keys...\n');

// Read current .env file
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found!');
  process.exit(1);
}

let envContent = fs.readFileSync(envPath, 'utf8');

// Function to update a key in the .env file
function updateEnvKey(key, value) {
  const regex = new RegExp(`(${key}\\s*=\\s*).*`, 'g');
  if (envContent.match(regex)) {
    envContent = envContent.replace(regex, `$1${value}`);
    console.log(`✅ Updated ${key}`);
  } else {
    envContent += `\n${key}=${value}`;
    console.log(`➕ Added ${key}`);
  }
}

// Example of how to use this function
// You would replace these placeholder values with your actual keys
console.log('📝 To update your .env file with actual keys:');
console.log('   1. Replace the placeholder values below with your actual keys');
console.log('   2. Uncomment the lines');
console.log('   3. Run this script\n');

/*
updateEnvKey('FLUTTERWAVE_SECRET_KEY', 'your_actual_flutterwave_secret_key');
updateEnvKey('PAYSTACK_SECRET_KEY', 'your_actual_paystack_secret_key');
updateEnvKey('TWILIO_ACCOUNT_SID', 'your_actual_twilio_account_sid');
updateEnvKey('TWILIO_AUTH_TOKEN', 'your_actual_twilio_auth_token');
updateEnvKey('TWILIO_PHONE_NUMBER', 'your_actual_twilio_phone_number');
updateEnvKey('COINGECKO_API_KEY', 'your_actual_coingecko_api_key');
updateEnvKey('AFRICAS_TALKING_API_KEY', 'your_actual_africas_talking_api_key');
updateEnvKey('AFRICAS_TALKING_USERNAME', 'your_actual_africas_talking_username');
updateEnvKey('TERMII_API_KEY', 'your_actual_termii_api_key');
*/

// Write updated content back to .env file
// fs.writeFileSync(envPath, envContent);
// console.log('\n✅ .env file updated successfully!');

console.log('🔧 To use this script:');
console.log('   1. Edit this file and replace the placeholder values with your actual keys');
console.log('   2. Uncomment the updateEnvKey function calls');
console.log('   3. Uncomment the fs.writeFileSync line');
console.log('   4. Run: node update-env-with-keys.js');