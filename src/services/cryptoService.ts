import {
  Cryptocurrency,
  TradingPair,
  Portfolio,
  Transaction,
  MarketData,
} from "@/types/crypto";
import { realAPIService } from "@/services/realAPIService"; // Import the real API service

// Mock data for realistic crypto experience
export const mockCryptocurrencies: Cryptocurrency[] = [
  {
    id: "bitcoin",
    symbol: "BTC",
    name: "Bitcoin",
    image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
    current_price: 43250.67,
    market_cap: 846750000000,
    market_cap_rank: 1,
    fully_diluted_valuation: 908500000000,
    total_volume: 18500000000,
    high_24h: 43890.12,
    low_24h: 42180.45,
    price_change_24h: 1070.22,
    price_change_percentage_24h: 2.54,
    price_change_percentage_7d: 8.42,
    price_change_percentage_30d: 15.67,
    market_cap_change_24h: 21600000000,
    market_cap_change_percentage_24h: 2.61,
    circulating_supply: 19590000,
    total_supply: 21000000,
    max_supply: 21000000,
    ath: 69045.0,
    ath_change_percentage: -37.35,
    ath_date: "2021-11-10T14:24:11.849Z",
    atl: 67.81,
    atl_change_percentage: 63654.78,
    atl_date: "2013-07-06T00:00:00.000Z",
    last_updated: new Date().toISOString(),
    sparkline_in_7d: [40123, 40567, 41234, 42100, 42890, 43250, 43567],
  },
  {
    id: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
    image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
    current_price: 2587.34,
    market_cap: 310950000000,
    market_cap_rank: 2,
    fully_diluted_valuation: 0,
    total_volume: 12400000000,
    high_24h: 2612.89,
    low_24h: 2534.12,
    price_change_24h: 53.22,
    price_change_percentage_24h: 2.1,
    price_change_percentage_7d: 6.78,
    price_change_percentage_30d: 12.34,
    market_cap_change_24h: 6400000000,
    market_cap_change_percentage_24h: 2.1,
    circulating_supply: 120280000,
    total_supply: 120280000,
    max_supply: 0,
    ath: 4878.26,
    ath_change_percentage: -46.95,
    ath_date: "2021-11-10T14:24:19.604Z",
    atl: 0.432979,
    atl_change_percentage: 597142.1,
    atl_date: "2015-10-20T00:00:00.000Z",
    last_updated: new Date().toISOString(),
    sparkline_in_7d: [2456, 2489, 2512, 2545, 2567, 2587, 2590],
  },
  {
    id: "binancecoin",
    symbol: "BNB",
    name: "BNB",
    image:
      "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png",
    current_price: 312.45,
    market_cap: 46890000000,
    market_cap_rank: 3,
    fully_diluted_valuation: 46890000000,
    total_volume: 1890000000,
    high_24h: 318.67,
    low_24h: 308.12,
    price_change_24h: 4.33,
    price_change_percentage_24h: 1.41,
    price_change_percentage_7d: 3.45,
    price_change_percentage_30d: 8.92,
    market_cap_change_24h: 650000000,
    market_cap_change_percentage_24h: 1.41,
    circulating_supply: 150030000,
    total_supply: 150030000,
    max_supply: 200000000,
    ath: 686.31,
    ath_change_percentage: -54.45,
    ath_date: "2021-05-10T07:24:17.097Z",
    atl: 0.0398177,
    atl_change_percentage: 784145.2,
    atl_date: "2017-10-19T00:00:00.000Z",
    last_updated: new Date().toISOString(),
    sparkline_in_7d: [301, 305, 309, 312, 315, 312, 314],
  },
  {
    id: "cardano",
    symbol: "ADA",
    name: "Cardano",
    image: "https://assets.coingecko.com/coins/images/975/large/cardano.png",
    current_price: 0.52,
    market_cap: 18420000000,
    market_cap_rank: 4,
    fully_diluted_valuation: 23400000000,
    total_volume: 890000000,
    high_24h: 0.538,
    low_24h: 0.501,
    price_change_24h: 0.018,
    price_change_percentage_24h: 3.59,
    price_change_percentage_7d: 7.23,
    price_change_percentage_30d: 14.67,
    market_cap_change_24h: 640000000,
    market_cap_change_percentage_24h: 3.59,
    circulating_supply: 35410000000,
    total_supply: 45000000000,
    max_supply: 45000000000,
    ath: 3.09,
    ath_change_percentage: -83.17,
    ath_date: "2021-09-02T06:00:10.474Z",
    atl: 0.01925275,
    atl_change_percentage: 2601.77,
    atl_date: "2020-03-13T02:22:55.391Z",
    last_updated: new Date().toISOString(),
    sparkline_in_7d: [0.485, 0.492, 0.501, 0.515, 0.523, 0.52, 0.525],
  },
  {
    id: "solana",
    symbol: "SOL",
    name: "Solana",
    image: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
    current_price: 98.45,
    market_cap: 42890000000,
    market_cap_rank: 5,
    fully_diluted_valuation: 55670000000,
    total_volume: 2340000000,
    high_24h: 102.34,
    low_24h: 96.12,
    price_change_24h: 2.33,
    price_change_percentage_24h: 2.42,
    price_change_percentage_7d: 9.67,
    price_change_percentage_30d: 18.94,
    market_cap_change_24h: 1020000000,
    market_cap_change_percentage_24h: 2.42,
    circulating_supply: 435670000,
    total_supply: 565450000,
    max_supply: 0,
    ath: 259.96,
    ath_change_percentage: -62.12,
    ath_date: "2021-11-06T21:54:35.825Z",
    atl: 0.500801,
    atl_change_percentage: 19556.89,
    atl_date: "2020-05-11T19:35:23.449Z",
    last_updated: new Date().toISOString(),
    sparkline_in_7d: [89.45, 91.23, 94.67, 96.12, 98.45, 100.23, 99.78],
  },
];

export const mockTradingPairs: TradingPair[] = [
  {
    symbol: "BTC/USDT",
    baseAsset: "BTC",
    quoteAsset: "USDT",
    price: 43250.67,
    priceChange: 1070.22,
    priceChangePercent: 2.54,
    volume: 18500000000,
    quoteVolume: 18500000000,
    openPrice: 42180.45,
    highPrice: 43890.12,
    lowPrice: 42180.45,
    bidPrice: 43250.67,
    askPrice: 43255.00,
    spread: 4.33,
    lastUpdateId: 1,
    lastUpdated: new Date().toISOString(),
  },
  {
    symbol: "ETH/USDT",
    baseAsset: "ETH",
    quoteAsset: "USDT",
    price: 2587.34,
    priceChange: 53.22,
    priceChangePercent: 2.1,
    volume: 12400000000,
    quoteVolume: 12400000000,
    openPrice: 2534.12,
    highPrice: 2612.89,
    lowPrice: 2534.12,
    bidPrice: 2587.34,
    askPrice: 2588.00,
    spread: 0.66,
    lastUpdateId: 1,
    lastUpdated: new Date().toISOString(),
  },
  {
    symbol: "BNB/USDT",
    baseAsset: "BNB",
    quoteAsset: "USDT",
    price: 312.45,
    priceChange: 4.33,
    priceChangePercent: 1.41,
    volume: 1890000000,
    quoteVolume: 1890000000,
    openPrice: 308.12,
    highPrice: 318.67,
    lowPrice: 308.12,
    bidPrice: 312.45,
    askPrice: 312.50,
    spread: 0.05,
    lastUpdateId: 1,
    lastUpdated: new Date().toISOString(),
  },
  {
    symbol: "ADA/USDT",
    baseAsset: "ADA",
    quoteAsset: "USDT",
    price: 0.52,
    priceChange: 0.018,
    priceChangePercent: 3.59,
    volume: 890000000,
    quoteVolume: 890000000,
    openPrice: 0.501,
    highPrice: 0.538,
    lowPrice: 0.501,
    bidPrice: 0.52,
    askPrice: 0.521,
    spread: 0.001,
    lastUpdateId: 1,
    lastUpdated: new Date().toISOString(),
  },
  {
    symbol: "SOL/USDT",
    baseAsset: "SOL",
    quoteAsset: "USDT",
    price: 98.45,
    priceChange: 2.33,
    priceChangePercent: 2.42,
    volume: 2340000000,
    quoteVolume: 2340000000,
    openPrice: 96.12,
    highPrice: 102.34,
    lowPrice: 96.12,
    bidPrice: 98.45,
    askPrice: 98.50,
    spread: 0.05,
    lastUpdateId: 1,
    lastUpdated: new Date().toISOString(),
  },
];

// Centralized crypto balance - must match walletService.ts
export const CENTRALIZED_CRYPTO_BALANCE = 125670.45;

export const mockPortfolio: Portfolio = {
  totalValue: CENTRALIZED_CRYPTO_BALANCE,
  totalChange24h: 3240.78,
  totalChangePercent24h: 2.64,
  assets: [
    {
      asset: "BTC",
      free: 2.5,
      locked: 0,
      total: 2.5,
      btcValue: 2.5,
      usdValue: 108126.68,
      price: 43250.67,
      change24h: 1070.22,
      changePercent24h: 2.54,
      allocation: 86.1,
    },
    {
      asset: "ETH",
      free: 6.8,
      locked: 0,
      total: 6.8,
      btcValue: 0.407,
      usdValue: 17593.51,
      price: 2587.34,
      change24h: 53.22,
      changePercent24h: 2.1,
      allocation: 14.0,
    },
  ],
  allocation: [
    {
      asset: "BTC",
      percentage: 86.1,
      value: 108126.68,
      color: "#F7931A",
    },
    {
      asset: "ETH",
      percentage: 14.0,
      value: 17593.51,
      color: "#627EEA",
    },
  ],
};

// Mock order book data
const generateOrderBook = () => ({
  symbol: "BTC/USDT",
  bids: Array.from({ length: 10 }, (_, i) => ({
    price: 43200 - i * 10,
    quantity: Math.random() * 5,
    total: (43200 - i * 10) * (Math.random() * 5),
  })),
  asks: Array.from({ length: 10 }, (_, i) => ({
    price: 43260 + i * 10,
    quantity: Math.random() * 5,
    total: (43260 + i * 10) * (Math.random() * 5),
  })),
  lastUpdateId: 1,
  timestamp: new Date().toISOString(),
});

// Mock recent trades
const generateRecentTrades = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: `trade-${i}`,
    symbol: "BTC/USDT",
    price: 43200 + (Math.random() - 0.5) * 100,
    quantity: Math.random() * 2,
    quoteQuantity: (43200 + (Math.random() - 0.5) * 100) * (Math.random() * 2),
    time: new Date(Date.now() - i * 60000).toISOString(),
    isBuyerMaker: Math.random() > 0.5,
    isBestMatch: true,
  }));

// Simplified service class with only mock data
export class CryptoService {
  // Add realistic delays to simulate loading
  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Simulate real-time price updates for mock data
  private simulateRealTimePrices(cryptos: Cryptocurrency[]): Cryptocurrency[] {
    return cryptos.map((crypto) => ({
      ...crypto,
      current_price: crypto.current_price * (1 + (Math.random() * 0.01 - 0.005)),
      price_change_24h: crypto.price_change_24h + (Math.random() * 0.4 - 0.2),
      last_updated: new Date().toISOString(),
    }));
  }

  // Enhanced method to get cryptocurrencies with real data when available
  async getCryptocurrencies(): Promise<Cryptocurrency[]> {
    try {
      // Try to fetch real data for major cryptocurrencies
      const cryptoSymbols = ["bitcoin", "ethereum", "binancecoin", "cardano", "solana"];
      
      const realData = await Promise.all(
        cryptoSymbols.map(async (symbol) => {
          try {
            const response = await realAPIService.getCryptoPrice(symbol);
            if (response.success) {
              // Map real API response to Cryptocurrency interface
              const mockCrypto = mockCryptocurrencies.find(c => c.id === symbol);
              if (mockCrypto) {
                return {
                  ...mockCrypto,
                  current_price: response.data.price,
                  market_cap: response.data.marketCap || mockCrypto.market_cap,
                  total_volume: response.data.volume24h || mockCrypto.total_volume,
                  price_change_24h: response.data.change24h || mockCrypto.price_change_24h,
                  high_24h: response.data.high24h || mockCrypto.high_24h,
                  low_24h: response.data.low24h || mockCrypto.low_24h,
                  last_updated: new Date().toISOString(),
                };
              }
            }
          } catch (error) {
            console.log(`Failed to fetch real data for ${symbol}, using mock data`);
          }
          
          // Return mock data as fallback
          return mockCryptocurrencies.find(c => c.id === symbol) || mockCryptocurrencies[0];
        })
      );
      
      return realData;
    } catch (error) {
      console.error("Error fetching cryptocurrency data, using mock data:", error);
      // Fallback to mock data with simulated real-time updates
      return this.simulateRealTimePrices(mockCryptocurrencies);
    }
  }

  async getMarketData(): Promise<MarketData> {
    await this.delay(300);
    console.log("📊 CryptoService: Returning simulated market data");

    const cryptos = this.simulateRealTimePrices(mockCryptocurrencies);

    return {
      globalStats: {
        totalMarketCap: 1750000000000 * (0.98 + Math.random() * 0.04), // ±2% variation
        totalVolume24h: 85000000000 * (0.9 + Math.random() * 0.2), // ±10% variation
        marketCapChange24h: (Math.random() - 0.5) * 10, // ±5% change
        btcDominance: 48.5 + (Math.random() - 0.5) * 2, // ±1% variation
        ethDominance: 18.2 + (Math.random() - 0.5) * 2, // ±1% variation
        activeCoins: 8924,
        markets: 25687,
      },
      topMovers: {
        gainers: cryptos
          .filter((c) => c.price_change_percentage_24h > 0)
          .sort(
            (a, b) =>
              b.price_change_percentage_24h - a.price_change_percentage_24h,
          )
          .slice(0, 5),
        losers: cryptos
          .filter((c) => c.price_change_percentage_24h < 0)
          .sort(
            (a, b) =>
              a.price_change_percentage_24h - b.price_change_percentage_24h,
          )
          .slice(0, 5),
      },
      fearGreedIndex: {
        value: Math.floor(Math.random() * 100),
        classification: "Neutral",
        timestamp: new Date().toISOString(),
      },
      trending: cryptos.slice(0, 5),
    };
  }

  async getTradingPairs(): Promise<TradingPair[]> {
    await this.delay(150);
    return mockTradingPairs;
  }

  async getPortfolio(): Promise<Portfolio> {
    await this.delay(250);
    return mockPortfolio;
  }

  // Enhanced method to get a single cryptocurrency with real data when available
  async getCryptocurrencyById(id: string): Promise<Cryptocurrency | null> {
    try {
      const response = await realAPIService.getCryptoPrice(id);
      if (response.success) {
        // Map real API response to Cryptocurrency interface
        const mockCrypto = mockCryptocurrencies.find(c => c.id === id);
        if (mockCrypto) {
          return {
            ...mockCrypto,
            current_price: response.data.price,
            market_cap: response.data.marketCap || mockCrypto.market_cap,
            total_volume: response.data.volume24h || mockCrypto.total_volume,
            price_change_24h: response.data.change24h || mockCrypto.price_change_24h,
            high_24h: response.data.high24h || mockCrypto.high_24h,
            low_24h: response.data.low24h || mockCrypto.low_24h,
            last_updated: new Date().toISOString(),
          };
        }
      }
    } catch (error) {
      console.log(`Failed to fetch real data for ${id}, using mock data`);
    }
    
    // Fallback to mock data
    const crypto = mockCryptocurrencies.find((c) => c.id === id);
    if (!crypto) return null;
    
    // Return with simulated price updates
    return this.simulateRealTimePrices([crypto])[0];
  }

  async getOrderBook(symbol: string) {
    await this.delay(100);
    return generateOrderBook();
  }

  async getRecentTrades(symbol: string, limit = 20) {
    await this.delay(100);
    return generateRecentTrades(limit);
  }

  // Chart data for trading interface
  async getChartData(symbol: string, interval: string) {
    await this.delay(200);

    // Generate realistic OHLCV data
    const now = Date.now();
    const intervalMs = 60000; // 1 minute intervals

    const data = Array.from({ length: 100 }, (_, i) => {
      const timestamp = now - (100 - i) * intervalMs;
      const basePrice = 43200 + Math.sin(i / 10) * 500; // Base wave pattern
      const volatility = 100; // Price volatility

      const open = basePrice + (Math.random() - 0.5) * volatility;
      const close = open + (Math.random() - 0.5) * volatility * 0.5;
      const high = Math.max(open, close) + Math.random() * volatility * 0.3;
      const low = Math.min(open, close) - Math.random() * volatility * 0.3;
      const volume = Math.random() * 1000000;

      return {
        timestamp,
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
      };
    });

    const volume = data.map((d, i) => ({
      timestamp: d.timestamp,
      volume: parseFloat((Math.random() * 1000000).toFixed(2)),
      buyVolume: parseFloat((Math.random() * 500000).toFixed(2)),
      sellVolume: parseFloat((Math.random() * 500000).toFixed(2)),
    }));

    return {
      symbol,
      timeframe: interval,
      data,
      volume,
    };
  }

  // P2P Marketplace methods
  async getP2POffers(filters?: {
    asset?: string;
    fiatCurrency?: string;
    type?: string;
    paymentMethod?: string;
    minAmount?: number;
    maxAmount?: number;
  }) {
    try {
      // Mock P2P offers data
      const mockOffers = [
        {
          id: "1",
          userId: "user1",
          type: "SELL",
          asset: "BTC",
          fiatCurrency: "USD",
          price: 43250.5,
          minAmount: 100,
          maxAmount: 5000,
          totalAmount: 10000,
          availableAmount: 8500,
          paymentMethods: [
            { id: "bank", name: "Bank Transfer", type: "BANK_TRANSFER", icon: "Building", processingTime: "1-2 business days", isActive: true },
            { id: "paypal", name: "PayPal", type: "DIGITAL_WALLET", icon: "CreditCard", processingTime: "Instant", isActive: true },
          ],
          terms: "Fast and secure transaction. Payment within 15 minutes.",
          status: "ACTIVE",
          user: {
            id: "user1",
            username: "CryptoKing",
            isVerified: true,
            kycLevel: 2,
            rating: 4.9,
            totalTrades: 127,
            completionRate: 98.5,
            avgReleaseTime: 120000,
            isOnline: true,
            lastSeen: new Date().toISOString(),
          },
          completionRate: 98.5,
          avgReleaseTime: 120000,
          totalTrades: 127,
          createdAt: "2024-01-15T10:00:00Z",
          updatedAt: "2024-01-15T10:00:00Z",
        },
        {
          id: "2",
          userId: "user2",
          type: "BUY",
          asset: "ETH",
          fiatCurrency: "EUR",
          price: 2650.75,
          minAmount: 50,
          maxAmount: 2000,
          totalAmount: 5000,
          availableAmount: 5000,
          paymentMethods: [
            { id: "wise", name: "Wise", type: "DIGITAL_WALLET", icon: "Globe", processingTime: "Instant", isActive: true },
            { id: "revolut", name: "Revolut", type: "DIGITAL_WALLET", icon: "Smartphone", processingTime: "Instant", isActive: true },
          ],
          terms: "Instant payment required. Excellent rates.",
          status: "ACTIVE",
          user: {
            id: "user2",
            username: "EthTrader",
            isVerified: true,
            kycLevel: 2,
            rating: 4.7,
            totalTrades: 89,
            completionRate: 97.2,
            avgReleaseTime: 300000,
            isOnline: true,
            lastSeen: new Date().toISOString(),
          },
          completionRate: 97.2,
          avgReleaseTime: 300000,
          totalTrades: 89,
          createdAt: "2024-01-15T09:30:00Z",
          updatedAt: "2024-01-15T09:30:00Z",
        },
      ];

      let filteredOffers = mockOffers;

      if (filters?.asset) {
        filteredOffers = filteredOffers.filter(
          (offer) => offer.asset === filters.asset,
        );
      }
      if (filters?.fiatCurrency) {
        filteredOffers = filteredOffers.filter(
          (offer) => offer.fiatCurrency === filters.fiatCurrency,
        );
      }
      if (filters?.type) {
        filteredOffers = filteredOffers.filter(
          (offer) => offer.type === filters.type,
        );
      }

      return filteredOffers;
    } catch (error) {
      console.error("Error loading P2P offers:", error);
      throw new Error("Failed to load P2P offers");
    }
  }

  async createP2POffer(offerData: any) {
    try {
      // Mock creation - in real app would call API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        id: Date.now().toString(),
        ...offerData,
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error creating P2P offer:", error);
      throw new Error("Failed to create P2P offer");
    }
  }

  async getP2PTrades(userId?: string) {
    try {
      // Mock user trades
      return [
        {
          id: "trade1",
          offerId: "1",
          buyerId: "buyer1",
          sellerId: "seller1",
          asset: "BTC",
          fiatCurrency: "USD",
          amount: 0.1,
          price: 43250,
          totalPrice: 4325,
          paymentMethod: "bank",
          status: "COMPLETED",
          messages: [],
          buyer: {
            id: "buyer1",
            username: "BuyerUser",
            isVerified: true,
            kycLevel: 2,
            rating: 4.8,
            totalTrades: 45,
            completionRate: 100,
            avgReleaseTime: 180000,
            isOnline: true,
            lastSeen: new Date().toISOString(),
          },
          seller: {
            id: "seller1",
            username: "SellerUser",
            isVerified: true,
            kycLevel: 2,
            rating: 4.9,
            totalTrades: 78,
            completionRate: 99,
            avgReleaseTime: 150000,
            isOnline: true,
            lastSeen: new Date().toISOString(),
          },
          createdAt: "2024-01-14T15:30:00Z",
          updatedAt: "2024-01-14T15:45:00Z",
        },
      ];
    } catch (error) {
      console.error("Error loading P2P trades:", error);
      throw new Error("Failed to load P2P trades");
    }
  }
}

// Export singleton instance
export const cryptoService = new CryptoService();

// Status functions (now always return "healthy" since we're using mock data)
export const getApiStatus = () => ({
  failureCount: 0,
  isDisabled: false,
  maxFailures: 0,
  lastAttempt: Date.now(),
  nextRetry: 0,
});

export const resetApiStatus = () => {
  console.log("📊 CryptoService: Using mock data only - no API to reset");
};