#!/usr/bin/env node

// Script to test the replicate-generate Edge Function
// This script helps you verify that the Replicate API integration is working

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

console.log('🧪 Testing replicate-generate Edge Function\n');

// Check if required environment variables are set
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ Supabase environment variables not found');
  console.log('📝 Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are set in your .env file');
  process.exit(1);
}

console.log('✅ Supabase environment variables found');

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testReplicateFunction() {
  console.log('\n🔍 Testing replicate-generate function...');
  
  try {
    // Test the function with a simple prompt
    console.log('📤 Sending test request to replicate-generate function...');
    
    const { data, error } = await supabase.functions.invoke('replicate-generate', {
      body: {
        model: 'stable-diffusion',
        prompt: 'a blue square',
        width: 256,
        height: 256,
        numOutputs: 1
      }
    });

    if (error) {
      console.log('❌ Error calling replicate-generate function:');
      console.log('   Status:', error.status);
      console.log('   Message:', error.message);
      console.log('   Error details:', JSON.stringify(error, null, 2));
      
      if (error.status === 404) {
        console.log('   📝 The function may not be deployed yet. Deploy it using:');
        console.log('      node scripts/deploy-replicate-function.js');
      } else if (error.status === 500) {
        console.log('   📝 The function may be missing the REPLICATE_API_KEY. Set it using:');
        console.log('      node scripts/set-replicate-api-key.js');
      } else if (error.status === 400) {
        console.log('   📝 There may be an issue with the request parameters.');
      }
      
      return false;
    }

    console.log('✅ Function call successful!');
    console.log('📦 Response:', JSON.stringify(data, null, 2));
    
    if (data && data.output) {
      console.log('🎉 Replicate API integration is working correctly!');
      console.log('   The function returned output from the Replicate API.');
      return true;
    } else {
      console.log('⚠️  Function returned no output. This might indicate an issue with the Replicate API key.');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Unexpected error testing replicate-generate function:', error.message);
    console.error('Error stack:', error.stack);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting replicate-generate function test...\n');
  
  const success = await testReplicateFunction();
  
  if (success) {
    console.log('\n✅ All tests passed! The replicate-generate function is working correctly.');
    console.log('\n📝 You can now use the Edith AI content generation features in the app.');
  } else {
    console.log('\n❌ Tests failed. Please check the error messages above and resolve the issues.');
    
    console.log('\n📋 Troubleshooting steps:');
    console.log('1. Ensure the replicate-generate function is deployed:');
    console.log('   node scripts/deploy-replicate-function.js');
    console.log('2. Ensure the REPLICATE_API_KEY is set:');
    console.log('   node scripts/set-replicate-api-key.js');
    console.log('3. Check that your Replicate API key is valid:');
    console.log('   Visit https://replicate.com/account/api-tokens');
    console.log('4. Check the Supabase function logs in the dashboard:');
    console.log('   https://supabase.com/dashboard/project/hjebzdekquczudhrygns/functions');
  }
}

main();