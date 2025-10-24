#!/usr/bin/env node

// Script to test cryptocurrency integration

import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const BYBIT_PUBLIC_API = process.env.BYBIT_PUBLIC_API;
const BYBIT_SECRET_API = process.env.BYBIT_SECRET_API;

console.log('🔧 Testing Cryptocurrency Integration...\n');

// Helper: HMAC-SHA256 signature for Bybit API
async function signBybit(secret, timestamp, method, path, body = '') {
  const payload = `${timestamp}${method.toUpperCase()}${path}${body}`;
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

async function callBybitDirect(method, path, query = '', body = null) {
  try {
    if (!BYBIT_PUBLIC_API || !BYBIT_SECRET_API || BYBIT_PUBLIC_API === 'your-bybit-public-api-key') {
      throw new Error('Bybit API keys not configured properly');
    }

    const timestamp = Date.now().toString();
    const bodyString = body ? JSON.stringify(body) : '';
    const signature = await signBybit(BYBIT_SECRET_API, timestamp, method, path, bodyString);

    const fullUrl = `https://api.bybit.com${path}${query ? `?${query}` : ''}`;
    const headers = {
      'Content-Type': 'application/json',
      'X-BAPI-API-KEY': BYBIT_PUBLIC_API,
      'X-BAPI-SIGN': signature,
      'X-BAPI-TIMESTAMP': timestamp,
      'X-BAPI-RECV-WINDOW': '5000'
    };

    const response = await axios(fullUrl, {
      method,
      headers,
      data: bodyString || undefined,
      timeout: 5000
    });

    return response.data;
  } catch (error) {
    console.log('❌ Bybit API call failed:', error.message);
    throw error;
  }
}

async function testCryptoIntegration() {
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
        console.log('✅ 24h Change:', parseFloat(ticker.price24hPcnt) * 100, '%');
      } else {
        console.log('❌ Failed to get ticker:', tickerResponse.data.retMsg);
      }
    } catch (error) {
      console.log('❌ Failed to get ticker:', error.message);
    }

    // Test 3: Get order book (no authentication required)
    console.log('\n📚 Test 3: Getting BTC/USDT order book...');
    try {
      const orderbookResponse = await axios.get('https://api.bybit.com/v5/market/orderbook?category=spot&symbol=BTCUSDT&limit=10', { timeout: 5000 });
      if (orderbookResponse.data.retCode === 0) {
        const orderbook = orderbookResponse.data.result;
        console.log('✅ Order book retrieved successfully');
        console.log('   Best bid:', orderbook.b[0][0], '(', orderbook.b[0][1], ')');
        console.log('   Best ask:', orderbook.a[0][0], '(', orderbook.a[0][1], ')');
      } else {
        console.log('❌ Failed to get order book:', orderbookResponse.data.retMsg);
      }
    } catch (error) {
      console.log('❌ Failed to get order book:', error.message);
    }

    // Test 4: Get wallet balance (authentication required)
    console.log('\n💰 Test 4: Getting wallet balance...');
    try {
      const path = '/v5/account/wallet-balance';
      const result = await callBybitDirect('GET', path);
      
      if (result.retCode === 0) {
        console.log('✅ Wallet balance retrieved successfully');
        // Log first few accounts
        const accounts = result.result.list.slice(0, 3);
        accounts.forEach(account => {
          console.log(`  - Account Type: ${account.accountType}`);
          console.log(`    Total Equity: ${account.totalEquity} USDT`);
        });
      } else {
        console.log('❌ Failed to get wallet balance:', result.retMsg);
      }
    } catch (error) {
      console.log('❌ Failed to get wallet balance:', error.message);
    }

    // Test 5: Generate deposit address (authentication required)
    console.log('\n📬 Test 5: Generating BTC deposit address...');
    try {
      const path = '/v5/asset/deposit/query-address';
      const query = 'coin=BTC';
      const result = await callBybitDirect('GET', path, query);
      
      if (result.retCode === 0) {
        console.log('✅ Deposit address generated successfully');
        if (result.result && result.result.length > 0) {
          console.log('   Address:', result.result[0].address);
          console.log('   Chain:', result.result[0].chain);
        }
      } else {
        console.log('❌ Failed to generate deposit address:', result.retMsg);
      }
    } catch (error) {
      console.log('❌ Failed to generate deposit address:', error.message);
    }

    console.log('\n🏁 Cryptocurrency integration test completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Restart your development server: npm run dev');
    console.log('2. Test the crypto routes in your application');
    console.log('3. Verify that prices, order books, and trading functionality are working');
    
  } catch (error) {
    console.error('❌ Error testing cryptocurrency integration:', error.message);
  }
}

testCryptoIntegration();