import { cryptoService } from "./src/services/cryptoService";

async function testCoinGeckoIntegration() {
  console.log("Testing CoinGecko API integration...");
  
  try {
    // Test fetching cryptocurrencies
    console.log("Fetching cryptocurrencies...");
    const cryptos = await cryptoService.getCryptocurrencies();
    console.log(`Successfully fetched ${cryptos.length} cryptocurrencies`);
    
    if (cryptos.length > 0) {
      console.log("First cryptocurrency:", {
        id: cryptos[0].id,
        name: cryptos[0].name,
        symbol: cryptos[0].symbol,
        current_price: cryptos[0].current_price
      });
    }
    
    // Test fetching a specific cryptocurrency
    console.log("Fetching Bitcoin data...");
    const bitcoin = await cryptoService.getCryptocurrencyById("bitcoin");
    if (bitcoin) {
      console.log("Bitcoin data:", {
        id: bitcoin.id,
        name: bitcoin.name,
        current_price: bitcoin.current_price,
        market_cap: bitcoin.market_cap
      });
    } else {
      console.log("Failed to fetch Bitcoin data");
    }
    
    console.log("CoinGecko API integration test completed successfully!");
  } catch (error) {
    console.error("CoinGecko API integration test failed:", error);
  }
}

// Run the test
testCoinGeckoIntegration();