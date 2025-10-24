// Test script for Bybit API integration
import axios from 'axios';

console.log("Testing Bybit API integration...");

// Test Bybit API connection
async function testBybitAPI() {
  try {
    console.log("🔄 Testing Bybit API connection...");
    
    // Test fetching Bitcoin price
    const response = await axios.get(
      'https://api.bybit.com/v5/market/tickers?category=spot&symbol=BTCUSDT',
      { timeout: 5000 }
    );
    
    if (response.data.retCode === 0 && response.data.result.list.length > 0) {
      const data = response.data.result.list[0];
      const price = data.lastPrice || data.markPrice || null;
      console.log(`✅ Bybit API connection successful!`);
      console.log(`📊 Bitcoin price: $${parseFloat(price).toFixed(2)}`);
      console.log(`📊 24h change: ${(parseFloat(data.price24hPcnt || '0') * 100).toFixed(2)}%`);
      console.log(`📊 24h volume: ${parseFloat(data.turnover24h || data.volume24h || '0').toFixed(2)}`);
    } else {
      console.log(`❌ Bybit API request failed:`, response.data.retMsg);
    }
  } catch (error) {
    console.log(`❌ Bybit API test failed: ${error.message}`);
  }
}

// Run the test
testBybitAPI();