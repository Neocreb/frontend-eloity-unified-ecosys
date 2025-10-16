#!/usr/bin/env node

// Comprehensive test script for all services
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing All Services Integration...\n');

// Read .env file to get the API keys
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found!');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  if (line.trim() && !line.startsWith('#')) {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
    }
  }
});

// Test CoinGecko API
async function testCoinGeckoAPI() {
  console.log('🔍 Testing CoinGecko API...');
  
  const COINGECKO_API_KEY = envVars['COINGECKO_API_KEY'];
  
  if (!COINGECKO_API_KEY || COINGECKO_API_KEY === 'your_actual_coingecko_api_key') {
    console.log('   ⚠️  CoinGecko API key not found or is placeholder');
    return false;
  }

  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=3&page=1',
      {
        headers: {
          'Authorization': `Bearer ${COINGECKO_API_KEY}`
        }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ CoinGecko API connection successful!');
      console.log(`   📊 Retrieved ${data.length} cryptocurrencies:`);
      data.forEach(coin => {
        console.log(`      - ${coin.name} (${coin.symbol.toUpperCase()}): $${coin.current_price.toFixed(2)}`);
      });
      return true;
    } else {
      // Try with demo API key header as fallback
      const demoResponse = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=3&page=1',
        {
          headers: {
            'x-cg-demo-api-key': COINGECKO_API_KEY
          }
        }
      );
      
      if (demoResponse.ok) {
        const data = await demoResponse.json();
        console.log('   ✅ CoinGecko API connection successful with demo header!');
        console.log(`   📊 Retrieved ${data.length} cryptocurrencies:`);
        data.forEach(coin => {
          console.log(`      - ${coin.name} (${coin.symbol.toUpperCase()}): $${coin.current_price.toFixed(2)}`);
        });
        return true;
      } else {
        console.log('   ❌ CoinGecko API test failed');
        return false;
      }
    }
  } catch (error) {
    console.log(`   ❌ CoinGecko API test failed: ${error.message}`);
    return false;
  }
}

// Test Flutterwave API
async function testFlutterwaveAPI() {
  console.log('\n🔍 Testing Flutterwave API...');
  
  const FLUTTERWAVE_SECRET_KEY = envVars['FLUTTERWAVE_SECRET_KEY'];
  
  if (!FLUTTERWAVE_SECRET_KEY || FLUTTERWAVE_SECRET_KEY === 'your_actual_flutterwave_secret_key') {
    console.log('   ⚠️  Flutterwave API key not found or is placeholder');
    return false;
  }

  try {
    // Test Flutterwave API connectivity (get banks as a simple test)
    const response = await fetch('https://api.flutterwave.com/v3/banks/NG', {
      headers: {
        'Authorization': `Bearer ${FLUTTERWAVE_SECRET_KEY}`
      }
    });
    
    if (response.ok) {
      console.log('   ✅ Flutterwave API connection successful!');
      return true;
    } else {
      const errorText = await response.text();
      console.log(`   ❌ Flutterwave API test failed with status ${response.status}: ${errorText}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Flutterwave API test failed: ${error.message}`);
    return false;
  }
}

// Test Paystack API
async function testPaystackAPI() {
  console.log('\n🔍 Testing Paystack API...');
  
  const PAYSTACK_SECRET_KEY = envVars['PAYSTACK_SECRET_KEY'];
  
  if (!PAYSTACK_SECRET_KEY || PAYSTACK_SECRET_KEY === 'your_actual_paystack_secret_key') {
    console.log('   ⚠️  Paystack API key not found or is placeholder');
    return false;
  }

  try {
    // Test Paystack API connectivity (get banks as a simple test)
    const response = await fetch('https://api.paystack.co/bank', {
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`
      }
    });
    
    if (response.ok) {
      console.log('   ✅ Paystack API connection successful!');
      return true;
    } else {
      const errorText = await response.text();
      console.log(`   ❌ Paystack API test failed with status ${response.status}: ${errorText}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Paystack API test failed: ${error.message}`);
    return false;
  }
}

// Test Twilio API
async function testTwilioAPI() {
  console.log('\n🔍 Testing Twilio API...');
  
  const TWILIO_ACCOUNT_SID = envVars['TWILIO_ACCOUNT_SID'];
  const TWILIO_AUTH_TOKEN = envVars['TWILIO_AUTH_TOKEN'];
  
  if (!TWILIO_ACCOUNT_SID || TWILIO_ACCOUNT_SID === 'your_actual_twilio_account_sid' ||
      !TWILIO_AUTH_TOKEN || TWILIO_AUTH_TOKEN === 'your_actual_twilio_auth_token') {
    console.log('   ⚠️  Twilio credentials not found or are placeholders');
    return false;
  }

  try {
    // Test Twilio API connectivity (get account info as a simple test)
    const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
    
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}.json`, {
      headers: {
        'Authorization': `Basic ${credentials}`
      }
    });
    
    if (response.ok) {
      console.log('   ✅ Twilio API connection successful!');
      return true;
    } else {
      const errorText = await response.text();
      console.log(`   ❌ Twilio API test failed with status ${response.status}: ${errorText}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Twilio API test failed: ${error.message}`);
    return false;
  }
}

// Main test function
async function testAllServices() {
  console.log('🚀 Starting comprehensive service integration tests...\n');
  
  const results = {
    coingecko: await testCoinGeckoAPI(),
    flutterwave: await testFlutterwaveAPI(),
    paystack: await testPaystackAPI(),
    twilio: await testTwilioAPI()
  };
  
  console.log('\n📊 Integration Test Results:');
  console.log('==========================');
  
  Object.entries(results).forEach(([service, success]) => {
    console.log(`${success ? '✅' : '❌'} ${service.charAt(0).toUpperCase() + service.slice(1)}: ${success ? 'Working' : 'Not working'}`);
  });
  
  const allPassed = Object.values(results).every(result => result === true);
  
  console.log('\n' + (allPassed ? '🎉 All services are properly integrated!' : '⚠️  Some services need attention.'));
  
  if (!allPassed) {
    console.log('\n📝 Next Steps:');
    console.log('1. Check that all secret keys in your .env file are actual production keys');
    console.log('2. Verify network connectivity to external APIs');
    console.log('3. Check API key permissions and restrictions');
    console.log('4. Review service implementation files for any issues');
  } else {
    console.log('\n🚀 Your platform is ready for production deployment!');
  }
}

// Run the tests
testAllServices().catch(console.error);