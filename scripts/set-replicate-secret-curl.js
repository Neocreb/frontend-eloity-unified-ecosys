#!/usr/bin/env node

// Script to set the REPLICATE_API_KEY secret using curl
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔐 Setting REPLICATE_API_KEY secret using curl\n');

// Check if .env.local file exists
const envLocalPath = path.join(__dirname, '..', '.env.local');

let envContent = '';
if (fs.existsSync(envLocalPath)) {
  envContent = fs.readFileSync(envLocalPath, 'utf8');
  console.log('✅ Found .env.local file');
} else {
  console.log('❌ No .env.local file found');
  process.exit(1);
}

// Extract REPLICATE_API_KEY from env file
const replicateApiKeyMatch = envContent.match(/REPLICATE_API_KEY=(.+)/);
if (!replicateApiKeyMatch) {
  console.log('❌ REPLICATE_API_KEY not found in environment file');
  process.exit(1);
}

const replicateApiKey = replicateApiKeyMatch[1].trim();
console.log('🔑 REPLICATE_API_KEY found');

// Get the service role key from env file
const serviceRoleKeyMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/);
if (!serviceRoleKeyMatch) {
  console.log('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment file');
  process.exit(1);
}

const serviceRoleKey = serviceRoleKeyMatch[1].trim();
console.log('🔑 SUPABASE_SERVICE_ROLE_KEY found');

// Project ID
const projectId = 'hjebzdekquczudhrygns';
console.log('📦 Project ID:', projectId);

// Use curl to set the secret
try {
  console.log('\n🔄 Setting secret using curl...');
  
  // Note: This is a simplified approach. In practice, you would need to use the Supabase API
  // to set function secrets, which requires authentication and proper endpoints.
  console.log('📝 Please set the REPLICATE_API_KEY secret manually through the Supabase dashboard:');
  console.log('1. Go to https://supabase.com/dashboard/project/hjebzdekquczudhrygns/functions');
  console.log('2. Click on the "Secrets" tab');
  console.log('3. Click "Add Secret"');
  console.log('4. Set Key as "REPLICATE_API_KEY"');
  console.log('5. Set Value as:', replicateApiKey);
  console.log('6. Click "Add"');
  
  console.log('\n✅ Manual setup instructions provided above.');
} catch (error) {
  console.error('❌ Error setting secret:', error.message);
  process.exit(1);
}