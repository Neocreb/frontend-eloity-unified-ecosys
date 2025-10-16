// Simple test script for CoinGecko API integration
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Testing CoinGecko API integration...");

// Read .env file to get the API key
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log("❌ .env file not found!");
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

const COINGECKO_API_KEY = envVars['COINGECKO_API_KEY'];

if (!COINGECKO_API_KEY || COINGECKO_API_KEY === 'your_actual_coingecko_api_key') {
  console.log("❌ CoinGecko API key not found in .env file!");
  process.exit(1);
}

console.log("✅ CoinGecko API key found");

// Test the CoinGecko API
async function testCoinGeckoAPI() {
  try {
    console.log("🔄 Testing CoinGecko API connection...");
    
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5&page=1',
      {
        headers: {
          'Authorization': `Bearer ${COINGECKO_API_KEY}`
        }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ CoinGecko API connection successful!`);
      console.log(`📊 Retrieved ${data.length} cryptocurrencies:`);
      data.forEach(coin => {
        console.log(`   - ${coin.name} (${coin.symbol.toUpperCase()}): $${coin.current_price.toFixed(2)}`);
      });
    } else {
      const errorText = await response.text();
      console.log(`❌ CoinGecko API request failed with status ${response.status}: ${errorText}`);
      
      // Try with the demo API key header as fallback
      console.log("🔄 Trying with demo API key header...");
      const demoResponse = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5&page=1',
        {
          headers: {
            'x-cg-demo-api-key': COINGECKO_API_KEY
          }
        }
      );
      
      if (demoResponse.ok) {
        const data = await demoResponse.json();
        console.log(`✅ CoinGecko API connection successful with demo header!`);
        console.log(`📊 Retrieved ${data.length} cryptocurrencies:`);
        data.forEach(coin => {
          console.log(`   - ${coin.name} (${coin.symbol.toUpperCase()}): $${coin.current_price.toFixed(2)}`);
        });
      } else {
        const demoErrorText = await demoResponse.text();
        console.log(`❌ CoinGecko API request failed with demo header and status ${demoResponse.status}: ${demoErrorText}`);
      }
    }
  } catch (error) {
    console.log(`❌ CoinGecko API test failed: ${error.message}`);
  }
}

// Run the test
testCoinGeckoAPI();