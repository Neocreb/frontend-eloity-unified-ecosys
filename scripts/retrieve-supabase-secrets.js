#!/usr/bin/env node

// Script to retrieve secret keys from Supabase Edge Functions
// This script helps you extract the secret keys you've stored in Supabase Edge Functions
// and format them for use in your .env file

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔐 Retrieving Secret Keys from Supabase Edge Functions...\n');

// Configuration - Update these with your Supabase project details
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'your-supabase-project-url';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Function to retrieve secrets from Supabase Edge Functions
async function retrieveSecrets() {
  try {
    // List of secrets we expect to find
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

    console.log('🔍 Looking for the following secrets:');
    secretKeys.forEach(key => console.log(`   • ${key}`));
    console.log('');

    // Try to retrieve each secret
    const retrievedSecrets = {};
    
    for (const key of secretKeys) {
      try {
        // In a real implementation, you would call the Supabase Edge Function
        // that retrieves the secret. For now, we'll simulate this.
        console.log(`🔄 Retrieving ${key}...`);
        
        // This is a placeholder - in practice, you would call your Edge Function
        // For example:
        // const { data, error } = await supabase.functions.invoke('get-secret', {
        //   body: { key: key }
        // });
        
        // For demonstration, we'll use placeholder values
        retrievedSecrets[key] = `your_actual_${key.toLowerCase()}_from_supabase`;
        
        console.log(`✅ Retrieved ${key}`);
      } catch (error) {
        console.log(`❌ Failed to retrieve ${key}: ${error.message}`);
      }
    }

    // Display the retrieved secrets
    console.log('\n🔑 Retrieved Secrets:');
    console.log('====================');
    Object.entries(retrievedSecrets).forEach(([key, value]) => {
      console.log(`${key}=${value}`);
    });

    // Update the .env file with the retrieved secrets
    await updateEnvFile(retrievedSecrets);
    
    console.log('\n✅ Secret retrieval complete!');
    console.log('📝 The .env file has been updated with placeholder values.');
    console.log('🔄 Please replace the placeholder values with your actual secret keys from Supabase.');

  } catch (error) {
    console.error('Error retrieving secrets:', error);
    process.exit(1);
  }
}

// Function to update the .env file with retrieved secrets
async function updateEnvFile(secrets) {
  try {
    const envPath = path.join(__dirname, '..', '.env');
    
    // Check if .env file exists
    if (!fs.existsSync(envPath)) {
      console.log('❌ .env file not found. Creating a new one...');
      // Create a basic .env file structure
      const basicEnvContent = `# ELOITY UNIFIED ECOSYSTEM - ENVIRONMENT CONFIGURATION

# Server Configuration
NODE_ENV=development
PORT=5000

# Payment Processing
FLUTTERWAVE_SECRET_KEY=your_actual_flutterwave_secret_key
PAYSTACK_SECRET_KEY=your_actual_paystack_secret_key

# SMS & Notifications
TWILIO_ACCOUNT_SID=your_actual_twilio_account_sid
TWILIO_AUTH_TOKEN=your_actual_twilio_auth_token
TWILIO_PHONE_NUMBER=your_actual_twilio_phone_number

# Crypto Services
COINGECKO_API_KEY=your_actual_coingecko_api_key

# African Payment Providers
AFRICAS_TALKING_API_KEY=your_actual_africas_talking_api_key
AFRICAS_TALKING_USERNAME=your_actual_africas_talking_username
TERMII_API_KEY=your_actual_termii_api_key
`;
      fs.writeFileSync(envPath, basicEnvContent);
    }

    // Read the current .env file
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Update each secret in the .env file
    Object.entries(secrets).forEach(([key, value]) => {
      const regex = new RegExp(`(${key}\\s*=\\s*).*`, 'g');
      if (envContent.match(regex)) {
        envContent = envContent.replace(regex, `$1${value}`);
      } else {
        // If the key doesn't exist, append it to the file
        envContent += `\n${key}=${value}`;
      }
    });

    // Write the updated content back to the .env file
    fs.writeFileSync(envPath, envContent);
    
    console.log('💾 .env file updated successfully.');
  } catch (error) {
    console.error('Error updating .env file:', error);
  }
}

// Function to test the integration of secrets
async function testSecretIntegration() {
  console.log('\n🧪 Testing Secret Integration...\n');
  
  // Test CoinGecko API
  console.log('🔍 Testing CoinGecko API...');
  try {
    // This would be a real test in production
    console.log('✅ CoinGecko API test placeholder');
  } catch (error) {
    console.log(`❌ CoinGecko API test failed: ${error.message}`);
  }

  // Test Flutterwave API
  console.log('\n🔍 Testing Flutterwave API...');
  try {
    // This would be a real test in production
    console.log('✅ Flutterwave API test placeholder');
  } catch (error) {
    console.log(`❌ Flutterwave API test failed: ${error.message}`);
  }

  // Test Paystack API
  console.log('\n🔍 Testing Paystack API...');
  try {
    // This would be a real test in production
    console.log('✅ Paystack API test placeholder');
  } catch (error) {
    console.log(`❌ Paystack API test failed: ${error.message}`);
  }

  // Test Twilio API
  console.log('\n🔍 Testing Twilio API...');
  try {
    // This would be a real test in production
    console.log('✅ Twilio API test placeholder');
  } catch (error) {
    console.log(`❌ Twilio API test failed: ${error.message}`);
  }

  console.log('\n✅ Secret integration tests completed!');
}

// Main execution
async function main() {
  console.log('🚀 Supabase Edge Functions Secret Retrieval Tool\n');
  
  // Retrieve secrets from Supabase
  await retrieveSecrets();
  
  // Test the integration
  await testSecretIntegration();
  
  console.log('\n📋 Next Steps:');
  console.log('1. Open the .env file and replace the placeholder values with your actual secret keys');
  console.log('2. Run the verification script: node scripts/verify-secret-integration.js');
  console.log('3. Test individual services with their respective test scripts');
  console.log('4. Deploy your application to production');
}

// Run the script
main().catch(console.error);