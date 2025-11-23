/// <reference types="jest" />

import { cryptoService } from '../src/services/cryptoService';

describe('CryptoService', () => {
  test('should fetch cryptocurrencies', async () => {
    const cryptos = await cryptoService.getCryptocurrencies();
    expect(cryptos).toBeDefined();
    expect(Array.isArray(cryptos)).toBe(true);
  });

  test('should fetch trading pairs', async () => {
    const pairs = await cryptoService.getTradingPairs();
    expect(pairs).toBeDefined();
    expect(Array.isArray(pairs)).toBe(true);
  });

  test('should fetch portfolio', async () => {
    const portfolio = await cryptoService.getPortfolio();
    expect(portfolio).toBeDefined();
    expect(typeof portfolio).toBe('object');
  });

  test('should fetch staking products', async () => {
    const products = await cryptoService.getStakingProducts();
    expect(products).toBeDefined();
    expect(Array.isArray(products)).toBe(true);
  });

  test('should fetch staking positions', async () => {
    const positions = await cryptoService.getStakingPositions('test-user-id');
    expect(positions).toBeDefined();
    expect(Array.isArray(positions)).toBe(true);
  });

  test('should fetch order book', async () => {
    const orderBook = await cryptoService.getOrderBook('BTCUSDT');
    expect(orderBook).toBeDefined();
    expect(orderBook.bids).toBeDefined();
    expect(orderBook.asks).toBeDefined();
  });

  test('should fetch recent trades', async () => {
    const trades = await cryptoService.getRecentTrades('BTCUSDT', 10);
    expect(trades).toBeDefined();
    expect(Array.isArray(trades)).toBe(true);
  });

  test('should fetch P2P offers', async () => {
    const offers = await cryptoService.getP2POffers();
    expect(offers).toBeDefined();
    expect(Array.isArray(offers)).toBe(true);
  });

  test('should fetch market data', async () => {
    const marketData = await cryptoService.getMarketData();
    expect(marketData).toBeDefined();
    expect(marketData.globalStats).toBeDefined();
    expect(marketData.topMovers).toBeDefined();
  });
});