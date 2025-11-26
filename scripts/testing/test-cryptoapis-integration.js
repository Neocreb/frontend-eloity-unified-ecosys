#!/usr/bin/env node

// Script to test CryptoAPIs integration

import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const CRYPTOAPIS_API_KEY = process.env.CRYPTOAPIS_API_KEY;

console.log('🔧 Testing CryptoAPIs Integration...\n');

async function testCryptoAPIsIntegration() {
  try {
    // Check if API key is configured
    if (!CRYPTOAPIS_API_KEY || CRYPTOAPIS_API_KEY === 'your_cryptoapis_api_key') {
      console.log('❌ CryptoAPIs API key not configured properly!');
      console.log('Please update your .env.local file with actual CryptoAPIs API key.');
      return;
    }

    console.log('✅ CryptoAPIs API key found');
    
    // Test 1: Get supported assets
    console.log('\n📡 Test 1: Getting supported assets...');
    try {
      const response = await axios.get('https://rest.cryptoapis.io/v2/market-data/assets', {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': CRYPTOAPIS_API_KEY
        },
        timeout: 10000
      });
      console.log('✅ Supported assets retrieved successfully');
      console.log('   Total assets:', response.data.data ? response.data.data.length : 0);
    } catch (error) {
      console.log('❌ Failed to get supported assets:', error.message);
    }

    // Test 2: Get exchange rates
    console.log('\n📈 Test 2: Getting BTC/USD exchange rate...');
    try {
      const response = await axios.get('https://rest.cryptoapis.io/v2/market-data/exchange-rates/realtime/BTC/USD', {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': CRYPTOAPIS_API_KEY
        },
        timeout: 10000
      });
      
      if (response.data && response.data.data) {
        console.log('✅ BTC/USD Exchange Rate:', response.data.data.rate);
        console.log('✅ 24h Change:', response.data.data.changePercent24h, '%');
      } else {
        console.log('❌ Failed to get exchange rate: No data returned');
      }
    } catch (error) {
      console.log('❌ Failed to get exchange rate:', error.message);
    }

    console.log('\n🏁 CryptoAPIs integration test completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Restart your development server: npm run dev');
    console.log('2. Test the crypto routes in your application');
    console.log('3. Verify that prices and trading functionality are working');
    
  } catch (error) {
    console.error('❌ Error testing CryptoAPIs integration:', error.message);
  }
}

testCryptoAPIsIntegration();