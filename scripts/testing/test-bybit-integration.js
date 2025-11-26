#!/usr/bin/env node

// Script to test Bybit API integration

import axios from 'axios';
import crypto from 'crypto';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const BYBIT_PUBLIC_API = process.env.BYBIT_PUBLIC_API;
const BYBIT_SECRET_API = process.env.BYBIT_SECRET_API;

console.log('🔧 Testing Bybit API Integration...\n');

// Helper: HMAC-SHA256 signature for Bybit API
async function signBybit(secret, timestamp, method, path, body = '') {
  const payload = `${timestamp}${method.toUpperCase()}${path}${body}`;
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

async function testBybitConnection() {
  try {
    // Check if API keys are configured
    if (!BYBIT_PUBLIC_API || !BYBIT_SECRET_API || BYBIT_PUBLIC_API === 'your-bybit-public-api-key') {
      console.log('❌ Bybit API keys not configured properly!');
      console.log('Please update your .env.local file with actual Bybit API keys.');
      return;
    }

    console.log('✅ Bybit API keys found');
    console.log('🔑 Public Key:', BYBIT_PUBLIC_API);
    console.log('📍 Your IP Address:', '102.90.97.156');
    console.log('⚠️  Make sure this IP is whitelisted in your Bybit API settings\n');
    
    // Test 1: Get server time (no authentication required)
    console.log('📡 Test 1: Getting server time...');
    try {
      const timeResponse = await axios.get('https://api.bybit.com/v5/market/time', { 
        timeout: 15000,
        headers: {
          'User-Agent': 'Eloity-Crypto-Client/1.0'
        }
      });
      console.log('✅ Server time:', timeResponse.data.time_now);
    } catch (error) {
      console.log('❌ Failed to get server time:', error.message);
      console.log('   Error code:', error.code);
      if (error.response) {
        console.log('   Response status:', error.response.status);
        console.log('   Response headers:', error.response.headers);
        console.log('   Response data:', JSON.stringify(error.response.data, null, 2));
      }
    }

    // Test 2: Get BTC/USDT ticker (no authentication required)
    console.log('\n📈 Test 2: Getting BTC/USDT ticker...');
    try {
      const tickerResponse = await axios.get('https://api.bybit.com/v5/market/tickers?category=spot&symbol=BTCUSDT', { 
        timeout: 15000,
        headers: {
          'User-Agent': 'Eloity-Crypto-Client/1.0'
        }
      });
      if (tickerResponse.data.retCode === 0) {
        const ticker = tickerResponse.data.result.list[0];
        console.log('✅ BTC/USDT Price:', ticker.lastPrice);
        console.log('✅ 24h Change:', ticker.price24hPcnt, '%');
      } else {
        console.log('❌ Failed to get ticker:', tickerResponse.data.retMsg);
        console.log('   Return code:', tickerResponse.data.retCode);
      }
    } catch (error) {
      console.log('❌ Failed to get ticker:', error.message);
      console.log('   Error code:', error.code);
      if (error.response) {
        console.log('   Response status:', error.response.status);
        console.log('   Response headers:', error.response.headers);
        try {
          const data = error.response.data;
          console.log('   Response data:', typeof data === 'string' ? data.substring(0, 500) : JSON.stringify(data, null, 2));
        } catch (parseError) {
          console.log('   Response data (raw):', String(error.response.data).substring(0, 500));
        }
      }
    }

    // Test 3: Get wallet balance (authentication required)
    console.log('\n💰 Test 3: Getting wallet balance...');
    try {
      const timestamp = Date.now().toString();
      const path = '/v5/account/wallet-balance';
      const signature = await signBybit(BYBIT_SECRET_API, timestamp, 'GET', path);

      const balanceResponse = await axios.get(`https://api.bybit.com${path}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-BAPI-API-KEY': BYBIT_PUBLIC_API,
          'X-BAPI-SIGN': signature,
          'X-BAPI-TIMESTAMP': timestamp,
          'X-BAPI-RECV-WINDOW': '5000',
          'User-Agent': 'Eloity-Crypto-Client/1.0'
        },
        timeout: 15000
      });

      if (balanceResponse.data.retCode === 0) {
        console.log('✅ Wallet balance retrieved successfully');
        // Log first few accounts
        const accounts = balanceResponse.data.result.list.slice(0, 3);
        accounts.forEach(account => {
          console.log(`  - Account Type: ${account.accountType}`);
          console.log(`    Total Equity: ${account.totalEquity} USDT`);
        });
      } else {
        console.log('❌ Failed to get wallet balance:', balanceResponse.data.retMsg);
        console.log('   Return code:', balanceResponse.data.retCode);
      }
    } catch (error) {
      console.log('❌ Failed to get wallet balance:', error.message);
      console.log('   Error code:', error.code);
      if (error.response) {
        console.log('   Response status:', error.response.status);
        console.log('   Response headers:', error.response.headers);
        try {
          const data = error.response.data;
          console.log('   Response data:', typeof data === 'string' ? data.substring(0, 500) : JSON.stringify(data, null, 2));
        } catch (parseError) {
          console.log('   Response data (raw):', String(error.response.data).substring(0, 500));
        }
      }
    }

    console.log('\n🏁 Bybit integration test completed!');
    console.log('\n💡 Troubleshooting tips:');
    console.log('   1. Ensure your IP (102.90.97.156) is whitelisted in Bybit API settings');
    console.log('   2. Check if your API keys have the required permissions');
    console.log('   3. Verify that your network can access https://api.bybit.com');
    console.log('   4. Try using a VPN if there are regional restrictions');
    
  } catch (error) {
    console.error('❌ Error testing Bybit integration:', error.message);
  }
}

testBybitConnection();