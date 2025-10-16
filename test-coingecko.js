// Test CoinGecko API integration
async function testCoinGeckoAPI() {
  const API_KEY = 'CG-ZmDHBa3kaPCNF2a2xg2mA5je';
  const BASE_URL = 'https://api.coingecko.com/api/v3';
  
  try {
    console.log('Testing CoinGecko API...');
    
    // Test the coins/markets endpoint
    const response = await fetch(
      `${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5&page=1`,
      {
        headers: {
          'x-cg-demo-api-key': API_KEY
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ CoinGecko API is working!');
    console.log('Retrieved', data.length, 'coins');
    console.log('Top coin:', data[0]?.name, '- $' + data[0]?.current_price);
    
    return true;
  } catch (error) {
    console.error('❌ CoinGecko API test failed:', error.message);
    return false;
  }
}

// Run the test
testCoinGeckoAPI();