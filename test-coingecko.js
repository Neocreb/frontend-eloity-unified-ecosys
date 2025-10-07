import { cryptoService } from './src/services/cryptoService';

async function testCoinGeckoAPI() {
  console.log('Testing CoinGecko API integration...');
  
  try {
    // Test getting cryptocurrency data
    const cryptos = await cryptoService.getCryptocurrencies();
    console.log(`Retrieved ${cryptos.length} cryptocurrencies`);
    
    if (cryptos.length > 0) {
      console.log('First cryptocurrency:', {
        id: cryptos[0].id,
        name: cryptos[0].name,
        symbol: cryptos[0].symbol,
        price: cryptos[0].current_price,
        market_cap: cryptos[0].market_cap
      });
    }
    
    // Test getting a specific cryptocurrency
    const bitcoin = await cryptoService.getCryptocurrencyById('bitcoin');
    if (bitcoin) {
      console.log('Bitcoin data:', {
        name: bitcoin.name,
        price: bitcoin.current_price,
        market_cap: bitcoin.market_cap
      });
    } else {
      console.log('Failed to retrieve Bitcoin data');
    }
    
    console.log('CoinGecko API test completed successfully!');
  } catch (error) {
    console.error('Error testing CoinGecko API:', error);
  }
}

testCoinGeckoAPI();