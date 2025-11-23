const { cryptoService } = require('./src/services/cryptoService.ts');

async function testCryptoService() {
  console.log("Testing Crypto Service...\n");

  try {
    // Test getCryptocurrencies
    console.log("1. Testing getCryptocurrencies...");
    const cryptos = await cryptoService.getCryptocurrencies();
    console.log(`   Found ${cryptos.length} cryptocurrencies`);
    if (cryptos.length > 0) {
      console.log(`   First crypto: ${cryptos[0].name} (${cryptos[0].symbol}) - $${cryptos[0].current_price}`);
    }
    console.log("   ✓ getCryptocurrencies test passed\n");

    // Test getTradingPairs
    console.log("2. Testing getTradingPairs...");
    const pairs = await cryptoService.getTradingPairs();
    console.log(`   Found ${pairs.length} trading pairs`);
    if (pairs.length > 0) {
      console.log(`   First pair: ${pairs[0].symbol} - $${pairs[0].price}`);
    }
    console.log("   ✓ getTradingPairs test passed\n");

    console.log("Basic tests completed!");
  } catch (error) {
    console.error("Test failed:", error);
  }
}

// Run the test
testCryptoService();