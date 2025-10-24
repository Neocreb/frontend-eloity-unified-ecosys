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
    
    // Test 1: Get server time (no authentication required)
    console.log('\n📡 Test 1: Getting server time...');
    try {
      const timeResponse = await axios.get('https://api.bybit.com/v5/market/time', { timeout: 5000 });
      console.log('✅ Server time:', timeResponse.data.time_now);
    } catch (error) {
      console.log('❌ Failed to get server time:', error.message);
    }

    // Test 2: Get BTC/USDT ticker (no authentication required)
    console.log('\n📈 Test 2: Getting BTC/USDT ticker...');
    try {
      const tickerResponse = await axios.get('https://api.bybit.com/v5/market/tickers?category=spot&symbol=BTCUSDT', { timeout: 5000 });
      if (tickerResponse.data.retCode === 0) {
        const ticker = tickerResponse.data.result.list[0];
        console.log('✅ BTC/USDT Price:', ticker.lastPrice);
        console.log('✅ 24h Change:', ticker.price24hPcnt, '%');
      } else {
        console.log('❌ Failed to get ticker:', tickerResponse.data.retMsg);
      }
    } catch (error) {
      console.log('❌ Failed to get ticker:', error.message);
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
          'X-BAPI-RECV-WINDOW': '5000'
        },
        timeout: 5000
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
      }
    } catch (error) {
      console.log('❌ Failed to get wallet balance:', error.message);
    }

    console.log('\n🏁 Bybit integration test completed!');
    
  } catch (error) {
    console.error('❌ Error testing Bybit integration:', error.message);
  }
}

testBybitConnection();