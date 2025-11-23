import { cryptoService } from "./src/services/cryptoService.ts";

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

    // Test getPortfolio
    console.log("3. Testing getPortfolio...");
    const portfolio = await cryptoService.getPortfolio();
    console.log(`   Portfolio total value: $${portfolio.totalValue}`);
    console.log(`   Portfolio assets count: ${portfolio.assets.length}`);
    console.log("   ✓ getPortfolio test passed\n");

    // Test getStakingProducts
    console.log("4. Testing getStakingProducts...");
    const stakingProducts = await cryptoService.getStakingProducts();
    console.log(`   Found ${stakingProducts.length} staking products`);
    if (stakingProducts.length > 0) {
      console.log(`   First product: ${stakingProducts[0].asset} - ${stakingProducts[0].apy}% APY`);
    }
    console.log("   ✓ getStakingProducts test passed\n");

    // Test getStakingPositions
    console.log("5. Testing getStakingPositions...");
    const stakingPositions = await cryptoService.getStakingPositions("test-user-id");
    console.log(`   Found ${stakingPositions.length} staking positions`);
    if (stakingPositions.length > 0) {
      console.log(`   First position: ${stakingPositions[0].asset} - ${stakingPositions[0].amount}`);
    }
    console.log("   ✓ getStakingPositions test passed\n");

    // Test getOrderBook
    console.log("6. Testing getOrderBook...");
    const orderBook = await cryptoService.getOrderBook("BTCUSDT");
    console.log(`   Order book bids: ${orderBook.bids.length}`);
    console.log(`   Order book asks: ${orderBook.asks.length}`);
    console.log("   ✓ getOrderBook test passed\n");

    // Test getRecentTrades
    console.log("7. Testing getRecentTrades...");
    const trades = await cryptoService.getRecentTrades("BTCUSDT", 10);
    console.log(`   Found ${trades.length} recent trades`);
    if (trades.length > 0) {
      console.log(`   First trade price: $${trades[0].price}`);
    }
    console.log("   ✓ getRecentTrades test passed\n");

    // Test getP2POffers
    console.log("8. Testing getP2POffers...");
    const p2pOffers = await cryptoService.getP2POffers();
    console.log(`   Found ${p2pOffers.length} P2P offers`);
    console.log("   ✓ getP2POffers test passed\n");

    // Test getMarketData
    console.log("9. Testing getMarketData...");
    const marketData = await cryptoService.getMarketData();
    console.log(`   Market cap: $${marketData.globalStats.totalMarketCap}`);
    console.log(`   24h volume: $${marketData.globalStats.totalVolume24h}`);
    console.log(`   Top gainers: ${marketData.topMovers.gainers.length}`);
    console.log(`   Top losers: ${marketData.topMovers.losers.length}`);
    console.log("   ✓ getMarketData test passed\n");

    console.log("All tests passed! 🎉");
  } catch (error) {
    console.error("Test failed:", error);
  }
}

// Run the test
testCryptoService();