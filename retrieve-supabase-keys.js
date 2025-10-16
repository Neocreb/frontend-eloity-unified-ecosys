#!/usr/bin/env node

// Script to retrieve actual secret keys from Supabase Edge Functions
// This script generates the curl commands you need to run to retrieve your secret keys

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔐 Supabase Edge Functions Secret Key Retrieval\n');

// Read .env file to get Supabase configuration
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found!');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');

// Extract Supabase configuration
const supabaseUrl = getEnvVar(envContent, 'VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar(envContent, 'VITE_SUPABASE_PUBLISHABLE_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ Supabase configuration not found in .env file!');
  console.log('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are set.');
  process.exit(1);
}

console.log(`📡 Supabase Project: ${supabaseUrl}\n`);

// List of secrets we need to retrieve
const secretKeys = [
  'FLUTTERWAVE_SECRET_KEY',
  'PAYSTACK_SECRET_KEY',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_PHONE_NUMBER',
  'COINGECKO_API_KEY',
  'AFRICAS_TALKING_API_KEY',
  'AFRICAS_TALKING_USERNAME',
  'TERMII_API_KEY'
];

function getEnvVar(envContent, key) {
  const regex = new RegExp(`${key}\\s*=\\s*(.*)`);
  const match = envContent.match(regex);
  return match ? match[1].trim() : null;
}

console.log('📋 To retrieve your actual secret keys from Supabase Edge Functions,');
console.log('   run the following curl commands in your terminal:\n');

// Generate curl commands for each secret
secretKeys.forEach((key, index) => {
  console.log(`${index + 1}. ${key}:`);
  console.log(`   curl -X POST "${supabaseUrl}/functions/v1/get-secret" \\`);
  console.log(`        -H "Authorization: Bearer ${supabaseAnonKey}" \\`);
  console.log(`        -H "Content-Type: application/json" \\`);
  console.log(`        -d '{"key": "${key}"}'`);
  console.log('');
});

console.log('📝 Instructions:');
console.log('1. Run each curl command in your terminal');
console.log('2. Copy the returned values to your .env file');
console.log('3. Replace the placeholder values with the actual secret keys');
console.log('');

console.log('⚠️  Security Notes:');
console.log('• Never share or commit actual secret keys');
console.log('• Store keys securely');
console.log('• Use different keys for development and production');
console.log('');

console.log('🔄 After retrieving all keys, run the verification script:');
console.log('   node scripts/verify-secret-integration.js');