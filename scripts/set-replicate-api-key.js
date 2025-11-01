#!/usr/bin/env node

// Script to set the REPLICATE_API_KEY environment variable for Supabase Edge Functions
// This script helps you configure the Replicate API key for the replicate-generate function

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔐 Setting REPLICATE_API_KEY for Supabase Edge Functions\n');

// Check if .env.local file exists
const envLocalPath = path.join(__dirname, '..', '.env.local');
const envPath = path.join(__dirname, '..', '.env');

let envContent = '';
if (fs.existsSync(envLocalPath)) {
  envContent = fs.readFileSync(envLocalPath, 'utf8');
  console.log('✅ Found .env.local file');
} else if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ Found .env file');
} else {
  console.log('❌ No .env or .env.local file found');
  console.log('📝 Please create a .env or .env.local file with your REPLICATE_API_KEY');
  process.exit(1);
}

// Extract REPLICATE_API_KEY from env file
const replicateApiKeyMatch = envContent.match(/REPLICATE_API_KEY=(.+)/);
if (!replicateApiKeyMatch) {
  console.log('❌ REPLICATE_API_KEY not found in environment file');
  console.log('📝 Please add REPLICATE_API_KEY=your_actual_key to your .env or .env.local file');
  process.exit(1);
}

const replicateApiKey = replicateApiKeyMatch[1].trim();
if (replicateApiKey === 'your_actual_key' || replicateApiKey.includes('placeholder')) {
  console.log('❌ Please replace the placeholder REPLICATE_API_KEY with your actual key');
  console.log('📝 Get your Replicate API key from https://replicate.com/account/api-tokens');
  process.exit(1);
}

console.log('✅ REPLICATE_API_KEY found in environment file');

// Instructions for setting the environment variable in Supabase
console.log('\n📋 To set the REPLICATE_API_KEY in Supabase Edge Functions:');
console.log('\nOption 1: Using Supabase CLI (Recommended)');
console.log('------------------------------------------');
console.log('Run this command in your terminal:');
console.log(`npx supabase functions secrets set REPLICATE_API_KEY=${replicateApiKey}`);

console.log('\nOption 2: Using Supabase Dashboard');
console.log('-----------------------------------');
console.log('1. Go to your Supabase project dashboard');
console.log('2. Navigate to Project Settings > API > Edge Functions');
console.log('3. Click on "Secrets" tab');
console.log('4. Click "Add Secret"');
console.log('5. Set Key as "REPLICATE_API_KEY"');
console.log('6. Set Value as your actual Replicate API key');
console.log('7. Click "Add"');

console.log('\nOption 3: Using this script to set via curl (Advanced)');
console.log('-----------------------------------------------------');
console.log('You can also set it programmatically using the Supabase API.');
console.log('This requires your Supabase service role key.');

console.log('\n📝 After setting the secret, deploy the replicate-generate function:');
console.log('node scripts/deploy-replicate-function.js');

console.log('\n✅ Once deployed, test the integration using the Edith AI content generation feature!');