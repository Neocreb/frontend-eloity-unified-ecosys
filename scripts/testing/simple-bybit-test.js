#!/usr/bin/env node

// Simple script to test Bybit API connectivity

import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const BYBIT_PUBLIC_API = process.env.BYBIT_PUBLIC_API;
const BYBIT_SECRET_API = process.env.BYBIT_SECRET_API;

console.log('🔧 Testing Bybit API Connectivity...\n');

async function testBybitKeys() {
  try {
    // Check if API keys are configured
    if (!BYBIT_PUBLIC_API || !BYBIT_SECRET_API || BYBIT_PUBLIC_API === 'your-bybit-public-api-key') {
      console.log('❌ Bybit API keys not configured properly!');
      console.log('Please update your .env.local file with actual Bybit API keys.');
      return;
    }

    console.log('✅ Bybit API keys found');
    console.log('   Public Key:', BYBIT_PUBLIC_API);
    console.log('   Secret Key: [HIDDEN]');
    
    // Test basic connectivity with a simple public endpoint
    console.log('\n📡 Testing basic connectivity...');
    try {
      const response = await axios.get('https://api.bybit.com/v5/market/time', { 
        timeout: 10000 
      });
      console.log('✅ Connection successful');
      console.log('   Server time:', response.data.time_now);
    } catch (error) {
      console.log('❌ Connection failed:', error.message);
      console.log('   This might be due to network issues, firewall restrictions, or temporary Bybit API issues');
    }
    
    console.log('\n📋 Next steps:');
    console.log('1. Restart your development server: npm run dev');
    console.log('2. Test the crypto functionality in your application');
    
  } catch (error) {
    console.error('❌ Error testing Bybit keys:', error.message);
  }
}

testBybitKeys();