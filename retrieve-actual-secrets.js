#!/usr/bin/env node

// Script to retrieve actual secret keys from Supabase Edge Functions
// This script helps you get the real secret keys you've stored in Supabase Edge Functions

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔐 Retrieving Actual Secret Keys from Supabase Edge Functions...\n');

// Read current .env file
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found!');
  process.exit(1);
}

let envContent = fs.readFileSync(envPath, 'utf8');

// Get Supabase configuration from .env
const supabaseUrl = getEnvVar(envContent, 'VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar(envContent, 'VITE_SUPABASE_PUBLISHABLE_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ Supabase configuration not found in .env file!');
  console.log('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are set.');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

async function retrieveSecret(key) {
  try {
    console.log(`🔄 Retrieving ${key}...`);
    
    // This is where you would call your Edge Function
    // For now, we'll show how you would do it
    console.log(`   To retrieve ${key}, you would call your Edge Function like this:`);
    console.log(`   curl -X POST "${supabaseUrl}/functions/v1/get-secret" \\`);
    console.log(`   -H "Authorization: Bearer ${supabaseAnonKey}" \\`);
    console.log(`   -H "Content-Type: application/json" \\`);
    console.log(`   -d '{"key": "${key}"}'`);
    console.log('');
    
    // Return placeholder since we can't actually call the Edge Function without proper auth
    return `your_actual_${key.toLowerCase()}`;
  } catch (error) {
    console.log(`   ❌ Failed to retrieve ${key}: ${error.message}`);
    return null;
  }
}

function getEnvVar(envContent, key) {
  const regex = new RegExp(`${key}\\s*=\\s*(.*)`);
  const match = envContent.match(regex);
  return match ? match[1].trim() : null;
}

function updateEnvFile(envContent, key, value) {
  const regex = new RegExp(`(${key}\\s*=\\s*).*`, 'g');
  if (envContent.match(regex)) {
    return envContent.replace(regex, `$1${value}`);
  } else {
    return envContent + `\n${key}=${value}`;
  }
}

async function main() {
  console.log('📋 Secret Keys to Retrieve:');
  secretKeys.forEach(key => console.log(`   • ${key}`));
  console.log('');
  
  console.log('📝 Instructions:');
  console.log('1. You need to manually call your Edge Function to retrieve each secret key');
  console.log('2. Replace the placeholder values in your .env file with the actual keys');
  console.log('3. Here are example curl commands for each key:\n');
  
  for (const key of secretKeys) {
    await retrieveSecret(key);
  }
  
  console.log('🔧 Manual Update Instructions:');
  console.log('1. Open your .env file');
  console.log('2. Replace each placeholder value with your actual secret key');
  console.log('3. For example, change:');
  console.log('   FLUTTERWAVE_SECRET_KEY=your_actual_flutterwave_secret_key');
  console.log('   to:');
  console.log('   FLUTTERWAVE_SECRET_KEY=actual_secret_key_from_supabase');
  console.log('');
  
  console.log('🔐 Security Reminder:');
  console.log('• Never commit actual secret keys to version control');
  console.log('• Use different keys for development and production');
  console.log('• Rotate keys regularly for security');
  console.log('• Monitor API usage to detect anomalies');
}

// Run the script
main().catch(console.error);