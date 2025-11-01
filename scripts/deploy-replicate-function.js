#!/usr/bin/env node

// Script to deploy the replicate-generate Edge Function to Supabase
// This script helps you deploy the Edge Function that handles Replicate API integration

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Deploying Supabase Edge Function: replicate-generate\n');

// Check if Supabase CLI is installed
try {
  execSync('npx supabase --version', { stdio: 'pipe' });
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
const edgeFunctionPath = path.join(__dirname, '..', 'supabase', 'functions', 'replicate-generate', 'index.ts');
if (!fs.existsSync(edgeFunctionPath)) {
  console.log('❌ Edge Function not found');
  console.log('📝 Please create the Edge Function at supabase/functions/replicate-generate/index.ts');
  process.exit(1);
}

// Deploy the Edge Function
try {
  console.log('🔄 Deploying Edge Function...');
  
  // Link the project if not already linked
  console.log('🔗 Linking project...');
  execSync('npx supabase link', { stdio: 'inherit' });
  
  // Deploy the Edge Function
  console.log('📤 Deploying replicate-generate function...');
  execSync('npx supabase functions deploy replicate-generate', { stdio: 'inherit' });
  
  console.log('\n✅ Edge Function deployed successfully!');
  console.log('\n📋 Next Steps:');
  console.log('1. Set your REPLICATE_API_KEY in the Supabase Dashboard:');
  console.log('   - Go to your Supabase project');
  console.log('   - Navigate to Project Settings > API > Edge Functions');
  console.log('   - Add REPLICATE_API_KEY as an environment variable');
  console.log('\n2. Test the Edge Function by using the Edith AI content generation feature');
  
} catch (error) {
  console.error('❌ Error deploying Edge Function:', error.message);
  process.exit(1);
}