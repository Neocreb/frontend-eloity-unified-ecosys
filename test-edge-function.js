#!/usr/bin/env node

// Test script to simulate Edge Function responses
// This script tests the retrieve-secrets functionality without actually calling the Edge Function

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🧪 Testing Edge Function Integration...\n');

// Check if required environment variables are set
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ Supabase configuration not found!');
  console.log('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are set in your .env file.');
  process.exit(1);
}

console.log(`📡 Supabase Project: ${supabaseUrl}\n`);

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Mock the Edge Function response
supabase.functions = {
  invoke: async (functionName, { body }) => {
    const { key } = body;
    
    // Simulate different responses based on the key
    const mockResponses = {
      'FLUTTERWAVE_SECRET_KEY': 'flw_test_key_here',
      'PAYSTACK_SECRET_KEY': 'sk_test_key_here',
      'PAYSTACK_PUBLIC_API': 'pk_test_key_here',
      'PAYSTACK_API_KEY': 'pk_test_key_here',
      'TWILIO_ACCOUNT_SID': 'AC_test_sid_here',
      'TWILIO_AUTH_TOKEN': 'test_auth_token_here',
      'TWILIO_PHONE_NUMBER': '+1234567890',
      'TWILIO_API_SECRET_KEY': 'test_twilio_api_secret',
      'TWILIO_SID_KEY': 'AC_test_sid_key_here',
      'COINGECKO_API_KEY': 'cg_test_key_here',
      'COINGECKO_API': 'cg_test_api_here',
      'BYBIT_PUBLIC_API': 'bybit_public_key_here',
      'BYBIT_SECRET_API': 'bybit_secret_key_here',
      'RESEND_API': 'resend_api_key_here',
      'OPENAI_API_KEY': 'openai_api_key_here'
    };
    
    if (mockResponses[key]) {
      return {
        data: { key, value: mockResponses[key] },
        error: null
      };
    } else {
      return {
        data: null,
        error: { message: `Secret not found for key: ${key}` }
      };
    }
  }
};

// Test the retrieve function
async function testRetrieveSecrets() {
  console.log('🔍 Testing secret retrieval...\n');
  
  // Test keys
  const testKeys = [
    'FLUTTERWAVE_SECRET_KEY',
    'PAYSTACK_SECRET_KEY',
    'TWILIO_ACCOUNT_SID',
    'COINGECKO_API_KEY',
    'OPENAI_API_KEY',
    'NON_EXISTENT_KEY' // This should fail
  ];
  
  for (const key of testKeys) {
    try {
      console.log(`🔄 Retrieving ${key}...`);
      
      // Call the Supabase Edge Function to retrieve the secret
      const { data, error } = await supabase.functions.invoke('get-secret', {
        body: { key: key }
      });
      
      if (error) {
        console.log(`❌ Failed to retrieve ${key}: ${error.message}`);
        continue;
      }
      
      if (!data || !data.value) {
        console.log(`❌ No value returned for ${key}`);
        continue;
      }
      
      console.log(`✅ Retrieved ${key}: ${data.value.substring(0, 10)}...`);
    } catch (error) {
      console.log(`❌ Failed to retrieve ${key}: ${error.message}`);
    }
  }
  
  console.log('\n✅ Test completed!');
}

// Run the test
testRetrieveSecrets().catch(console.error);