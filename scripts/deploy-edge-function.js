#!/usr/bin/env node

// Script to deploy the get-secret Edge Function to Supabase
// This script helps you deploy the Edge Function that retrieves secrets

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Deploying Supabase Edge Function: get-secret\n');

// Check if Supabase CLI is installed
try {
  execSync('supabase --version', { stdio: 'pipe' });
  console.log('✅ Supabase CLI is installed');
} catch (error) {
  console.log('❌ Supabase CLI is not installed');
  console.log('📝 Please install the Supabase CLI:');
  console.log('   npm install -g supabase');
  process.exit(1);
}

// Check if we're in a Supabase project directory
const supabaseConfigPath = path.join(__dirname, '..', 'supabase', 'config.toml');
if (!fs.existsSync(supabaseConfigPath)) {
  console.log('❌ Supabase project not found');
  console.log('📝 Please run this script from the root of your Supabase project');
  process.exit(1);
}

// Check if the Edge Function exists
const edgeFunctionPath = path.join(__dirname, '..', 'supabase', 'functions', 'get-secret', 'index.ts');
if (!fs.existsSync(edgeFunctionPath)) {
  console.log('❌ Edge Function not found');
  console.log('📝 Please create the Edge Function at supabase/functions/get-secret/index.ts');
  process.exit(1);
}

// Deploy the Edge Function
try {
  console.log('🔄 Deploying Edge Function...');
  
  // Link the project if not already linked
  console.log('🔗 Linking project...');
  execSync('supabase link', { stdio: 'inherit' });
  
  // Deploy the Edge Function
  console.log('📤 Deploying get-secret function...');
  execSync('supabase functions deploy get-secret', { stdio: 'inherit' });
  
  console.log('\n✅ Edge Function deployed successfully!');
  console.log('\n📋 Next Steps:');
  console.log('1. Set your secret keys in the Supabase Dashboard:');
  console.log('   - Go to your Supabase project');
  console.log('   - Navigate to Project Settings > API > Edge Functions');
  console.log('   - Add your secret keys as environment variables');
  console.log('\n2. Test the Edge Function:');
  console.log('   curl -X POST "https://<project-ref>.supabase.co/functions/v1/get-secret" \\');
  console.log('   -H "Authorization: Bearer <your-anon-key>" \\');
  console.log('   -H "Content-Type: application/json" \\');
  console.log('   -d \'{"key": "COINGECKO_API_KEY"}\'');
  console.log('\n3. Retrieve all your secrets and update your .env file');
  
} catch (error) {
  console.error('❌ Error deploying Edge Function:', error.message);
  process.exit(1);
}