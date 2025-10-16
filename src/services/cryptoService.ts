// @ts-nocheck
import {
  Cryptocurrency,
  TradingPair,
  Portfolio,
  MarketData,
  StakingProduct,
  StakingPosition,
} from "@/types/crypto";
import { realAPIService } from "@/services/realAPIService";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Wallet = Database["public"]["Tables"]["wallets"]["Row"];
type CryptoTransaction = Database["public"]["Tables"]["crypto_transactions"]["Row"];
type Trade = Database["public"]["Tables"]["trades"]["Row"];
type P2POffer = Database["public"]["Tables"]["p2p_offers"]["Row"];

// Mock data for fallback when real data is not available
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

// Simplified service class with real database connections
export class CryptoService {
  private readonly COINGECKO_API_KEY = process.env.COINGECKO_API_KEY || 'CG-ZmDHBa3kaPCNF2a2xg2mA5je';
  private readonly COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

  // Enhanced method to get cryptocurrencies with real data when available
  async getCryptocurrencies(): Promise<Cryptocurrency[]> {
    try {
      // Fetch real data from CoinGecko API
      const response = await fetch(
        `${this.COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=24h,7d,30d`,
        {
          headers: {
            'x-cg-demo-api-key': this.COINGECKO_API_KEY
          }
        }
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();

      // Convert CoinGecko data to Cryptocurrency format
      return data.map((coin: any) => ({
        id: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        image: coin.image,
        current_price: coin.current_price,
        market_cap: coin.market_cap,
        market_cap_rank: coin.market_cap_rank,
        fully_diluted_valuation: coin.fully_diluted_valuation,
        total_volume: coin.total_volume,
        high_24h: coin.high_24h,
        low_24h: coin.low_24h,
        price_change_24h: coin.price_change_24h,
        price_change_percentage_24h: coin.price_change_percentage_24h,
        price_change_percentage_7d: coin.price_change_percentage_7d_in_currency || 0,
        price_change_percentage_30d: coin.price_change_percentage_30d_in_currency || 0,
        market_cap_change_24h: coin.market_cap_change_24h,
        market_cap_change_percentage_24h: coin.market_cap_change_percentage_24h,
        circulating_supply: coin.circulating_supply,
        total_supply: coin.total_supply,
        max_supply: coin.max_supply,
        ath: coin.ath,
        ath_change_percentage: coin.ath_change_percentage,
        ath_date: coin.ath_date,
        atl: coin.atl,
        atl_change_percentage: coin.atl_change_percentage,
        atl_date: coin.atl_date,
        last_updated: coin.last_updated,
        sparkline_in_7d: coin.sparkline_in_7d?.price || []
      }));
    } catch (error) {
      console.error("Error fetching cryptocurrency data from CoinGecko, using mock data:", error);
      return mockCryptocurrencies;
    }
  }

  async getMarketData(): Promise<MarketData> {
    try {
      const cryptos = await this.getCryptocurrencies();
      
      if (cryptos.length === 0) {
        throw new Error("No cryptocurrency data available");
      }

      // Calculate global stats
      const totalMarketCap = cryptos.reduce((sum, crypto) => sum + (crypto.market_cap || 0), 0);
      const totalVolume24h = cryptos.reduce((sum, crypto) => sum + (crypto.total_volume || 0), 0);
      
      // Find top gainers and losers
      const gainers = cryptos
        .filter(c => c.price_change_percentage_24h > 0)
        .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
        .slice(0, 5);
        
      const losers = cryptos
        .filter(c => c.price_change_percentage_24h < 0)
        .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
        .slice(0, 5);

      return {
        globalStats: {
          totalMarketCap,
          totalVolume24h,
          marketCapChange24h: 0, // Would need historical data
          btcDominance: 0, // Would need to calculate
          ethDominance: 0, // Would need to calculate
          activeCoins: cryptos.length,
          markets: 0 // Would need data from exchanges
        },
        topMovers: {
          gainers,
          losers
        },
        fearGreedIndex: {
          value: Math.floor(Math.random() * 100),
          classification: "Neutral",
          timestamp: new Date().toISOString()
        },
        trending: cryptos.slice(0, 5)
      };
    } catch (error) {
      console.error("Error fetching market data:", error);
      // Return mock data as fallback
      const cryptos = mockCryptocurrencies;

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
  }

  async getTradingPairs(): Promise<TradingPair[]> {
    // In a real implementation, this would fetch from database or external API
    return mockTradingPairs;
  }

  async getPortfolio(): Promise<Portfolio> {
    // In a real implementation, this would fetch user's actual portfolio
    return mockPortfolio;
  }

  async getStakingProducts(): Promise<StakingProduct[]> {
    // Return mock staking products for demonstration
    return [
      {
        id: "eth-staking-1",
        asset: "ETH",
        type: "FLEXIBLE",
        apy: 4.5,
        minAmount: 0.1,
        rewardAsset: "ETH",
        isActive: true,
        totalStaked: 1250.5,
        description: "Flexible Ethereum staking with daily rewards",
        risks: ["Slashing risk", "Smart contract risk"],
        features: ["No lock-up period", "Daily rewards", "Instant withdrawal"]
      },
      {
        id: "eth-staking-2",
        asset: "ETH",
        type: "LOCKED",
        apy: 6.2,
        minAmount: 0.5,
        duration: 90,
        rewardAsset: "ETH",
        isActive: true,
        totalStaked: 2450.8,
        description: "90-day locked staking with higher rewards",
        risks: ["Lock-up period", "Slashing risk", "Smart contract risk"],
        features: ["Higher APY", "Compound rewards", "90-day lock"]
      },
      {
        id: "btc-staking-1",
        asset: "BTC",
        type: "LOCKED",
        apy: 3.8,
        minAmount: 0.01,
        duration: 180,
        rewardAsset: "BTC",
        isActive: true,
        totalStaked: 890.2,
        description: "180-day Bitcoin staking",
        risks: ["Lock-up period", "Custody risk"],
        features: ["BTC rewards", "180-day lock", "High security"]
      },
      {
        id: "sol-staking-1",
        asset: "SOL",
        type: "FLEXIBLE",
        apy: 7.2,
        minAmount: 1,
        rewardAsset: "SOL",
        isActive: true,
        totalStaked: 5600,
        description: "Flexible Solana staking",
        risks: ["Network risk", "Smart contract risk"],
        features: ["No lock-up", "High APY", "Instant withdrawal"]
      }
    ];
  }

  async getStakingPositions(userId: string): Promise<StakingPosition[]> {
    // Return mock staking positions for demonstration
    return [
      {
        id: "position-1",
        productId: "eth-staking-1",
        asset: "ETH",
        amount: 2.5,
        rewardAsset: "ETH",
        apy: 4.5,
        dailyReward: 0.00031,
        totalRewards: 0.042,
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: "ACTIVE",
        autoRenew: true
      },
      {
        id: "position-2",
        productId: "sol-staking-1",
        asset: "SOL",
        amount: 15,
        rewardAsset: "SOL",
        apy: 7.2,
        dailyReward: 0.0032,
        totalRewards: 0.18,
        startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: "ACTIVE",
        autoRenew: false
      }
    ];
  }

  async stakeAsset(userId: string, asset: string, amount: number, productId: string): Promise<boolean> {
    // Mock staking implementation
    console.log(`Staking ${amount} ${asset} for user ${userId} with product ${productId}`);
    // In a real implementation, this would interact with smart contracts or DeFi protocols
    return true;
  }

  async getDeFiProtocols(): Promise<any[]> {
    // Return mock DeFi protocols for demonstration
    return [
      {
        id: "aave",
        name: "Aave",
        description: "Decentralized lending and borrowing protocol",
        tvl: 8500000000,
        apyRange: { min: 2.5, max: 8.7 },
        assets: ["ETH", "USDC", "DAI", "USDT"],
        type: "LENDING"
      },
      {
        id: "uniswap",
        name: "Uniswap",
        description: "Decentralized exchange and liquidity protocol",
        tvl: 4200000000,
        apyRange: { min: 5.2, max: 45.8 },
        assets: ["ETH", "USDC", "DAI", "USDT", "WBTC"],
        type: "DEX"
      },
      {
        id: "compound",
        name: "Compound",
        description: "Algorithmic money market protocol",
        tvl: 3800000000,
        apyRange: { min: 1.8, max: 6.4 },
        assets: ["ETH", "USDC", "DAI", "USDT", "WBTC"],
        type: "LENDING"
      },
      {
        id: "curve",
        name: "Curve",
        description: "Exchange liquidity pool for stablecoins",
        tvl: 3100000000,
        apyRange: { min: 3.2, max: 18.5 },
        assets: ["USDC", "DAI", "USDT", "FRAX"],
        type: "DEX"
      }
    ];
  }

  async getDeFiPositions(userId: string): Promise<DeFiPosition[]> {
    // Return mock DeFi positions for demonstration
    return [
      {
        id: "defi-pos-1",
        protocol: "Aave",
        type: "LENDING",
        asset: "USDC",
        amount: 1000,
        apy: 4.8,
        rewards: [
          { asset: "AAVE", amount: 0.5, apy: 0, value: 12.5 }
        ],
        value: 1000,
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: "ACTIVE"
      },
      {
        id: "defi-pos-2",
        protocol: "Uniswap",
        type: "LP",
        asset: "ETH/USDC",
        amount: 5.2,
        apy: 12.4,
        rewards: [
          { asset: "UNI", amount: 8.3, apy: 0, value: 45.2 }
        ],
        value: 26500,
        startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        status: "ACTIVE"
      }
    ];
  }

  async getWatchlist(userId?: string): Promise<any[]> {
    // Placeholder for watchlist - returns empty array
    return [];
  }

  async addToWatchlist(userId: string, asset: string): Promise<any> {
    // Placeholder - return a mock watchlist item
    return { id: `watch-${Date.now()}`, asset, price: 0, change24h: 0 };
  }

  async createAlert(alertData: any): Promise<any> {
    // Placeholder - return mock alert
    return { id: `alert-${Date.now()}`, ...alertData };
  }

  async getOrderBook(pair: string): Promise<any> {
    // Placeholder for order book
    return { bids: [], asks: [] };
  }

  async getRecentTrades(pair: string, limit: number): Promise<any[]> {
    // Placeholder for recent trades
    return [];
  }

  // Enhanced method to get a single cryptocurrency with real data when available
  async getCryptocurrencyById(id: string): Promise<Cryptocurrency | null> {
    try {
      // Fetch real data from CoinGecko API
      const response = await fetch(
        `${this.COINGECKO_BASE_URL}/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true`,
        {
          headers: {
            'x-cg-demo-api-key': this.COINGECKO_API_KEY
          }
        }
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();

      // Convert CoinGecko data to Cryptocurrency format
      const coin: Cryptocurrency = {
        id: data.id,
        symbol: data.symbol,
        name: data.name,
        image: data.image.large,
        current_price: data.market_data.current_price.usd,
        market_cap: data.market_data.market_cap.usd,
        market_cap_rank: data.market_cap_rank,
        fully_diluted_valuation: data.market_data.fully_diluted_valuation.usd,
        total_volume: data.market_data.total_volume.usd,
        high_24h: data.market_data.high_24h.usd,
        low_24h: data.market_data.low_24h.usd,
        price_change_24h: data.market_data.price_change_24h,
        price_change_percentage_24h: data.market_data.price_change_percentage_24h,
        price_change_percentage_7d: data.market_data.price_change_percentage_7d,
        price_change_percentage_30d: data.market_data.price_change_percentage_30d,
        market_cap_change_24h: data.market_data.market_cap_change_24h,
        market_cap_change_percentage_24h: data.market_data.market_cap_change_percentage_24h,
        circulating_supply: data.market_data.circulating_supply,
        total_supply: data.market_data.total_supply,
        max_supply: data.market_data.max_supply,
        ath: data.market_data.ath.usd,
        ath_change_percentage: data.market_data.ath_change_percentage,
        ath_date: data.market_data.ath_date,
        atl: data.market_data.atl.usd,
        atl_change_percentage: data.market_data.atl_change_percentage,
        atl_date: data.market_data.atl_date,
        last_updated: data.last_updated,
        sparkline_in_7d: data.market_data.sparkline_7d.price || []
      };

      return coin;
    } catch (error) {
      console.error(`Error fetching cryptocurrency ${id} from CoinGecko:`, error);
      // Fallback to mock data
      return mockCryptocurrencies.find((c) => c.id === id) || null;
    }
  }

  // Get user wallet
  static async getUserWallet(userId: string): Promise<Wallet | null> {
    try {
      const { data, error } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching user wallet:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in getUserWallet:", error);
      return null;
    }
  }

  // Create user wallet
  static async createUserWallet(userId: string): Promise<Wallet | null> {
    try {
      const { data, error } = await supabase
        .from("wallets")
        .insert({
          user_id: userId,
          btc_balance: 0,
          eth_balance: 0,
          usdt_balance: 0,
          eloits_balance: 0,
          sol_balance: 0,
          kyc_level: 0,
          kyc_verified: false
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating user wallet:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in createUserWallet:", error);
      return null;
    }
  }

  // Get wallet balance
  static async getWalletBalance(userId: string): Promise<{
    btc: number;
    eth: number;
    usdt: number;
    eloits: number;
    sol: number;
    totalValueUSD: number;
  } | null> {
    try {
      const wallet = await this.getUserWallet(userId);
      if (!wallet) return null;

      // In a real implementation, you would fetch current prices and calculate total value
      const totalValueUSD = 
        wallet.btc_balance * 50000 + // Mock BTC price
        wallet.eth_balance * 3000 +  // Mock ETH price
        wallet.usdt_balance * 1 +    // USDT price
        wallet.eloits_balance * 0.1 + // Mock ELOITS price
        wallet.sol_balance * 100;    // Mock SOL price

      return {
        btc: wallet.btc_balance,
        eth: wallet.eth_balance,
        usdt: wallet.usdt_balance,
        eloits: wallet.eloits_balance,
        sol: wallet.sol_balance,
        totalValueUSD
      };
    } catch (error) {
      console.error("Error in getWalletBalance:", error);
      return null;
    }
  }

  // Get crypto transactions
  static async getUserTransactions(userId: string, limit = 20): Promise<CryptoTransaction[]> {
    try {
      const { data, error } = await supabase
        .from("crypto_transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching user transactions:", error);
        return [];
      }

      return data;
    } catch (error) {
      console.error("Error in getUserTransactions:", error);
      return [];
    }
  }

  // Get user trades
  static async getUserTrades(userId: string, limit = 20): Promise<Trade[]> {
    try {
      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching user trades:", error);
        return [];
      }

      return data;
    } catch (error) {
      console.error("Error in getUserTrades:", error);
      return [];
    }
  }

  // Create P2P offer
  static async createP2POffer(offerData: any): Promise<any | null> {
    try {
      // Map P2POffer interface to database structure
      const dbOfferData = {
        amount: offerData.totalAmount || offerData.amount,
        crypto_type: offerData.asset || offerData.crypto_type,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        offer_type: offerData.type || offerData.offer_type,
        payment_method: offerData.paymentMethods ? JSON.stringify(offerData.paymentMethods) : "",
        price_per_unit: offerData.price || offerData.price_per_unit,
        user_id: offerData.userId || offerData.user_id,
        notes: offerData.terms || offerData.notes || "",
        status: offerData.status || "active"
      };

      const { data, error } = await supabase
        .from("p2p_offers")
        .insert(dbOfferData)
        .select()
        .single();

      if (error) {
        console.error("Error creating P2P offer:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in createP2POffer:", error);
      return null;
    }
  }

  // Get P2P offers
  static async getP2POffers(limit = 20, cryptoType?: string): Promise<P2POffer[]> {
    try {
      let query = supabase
        .from("p2p_offers")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (cryptoType) {
        query = query.eq("crypto_type", cryptoType);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching P2P offers:", error);
        return [];
      }

      return data;
    } catch (error) {
      console.error("Error in getP2POffers:", error);
      return [];
    }
  }

  // Get user's P2P offers
  static async getUserP2POffers(userId: string, limit = 20): Promise<P2POffer[]> {
    try {
      const { data, error } = await supabase
        .from("p2p_offers")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching user P2P offers:", error);
        return [];
      }

      return data;
    } catch (error) {
      console.error("Error in getUserP2POffers:", error);
      return [];
    }
  }

  // Get crypto prices (in a real implementation, this would call an external API)
  static async getCryptoPrices(symbols: string[]): Promise<Record<string, number>> {
    // Mock prices - in a real implementation, you would call CoinGecko or similar API
    const mockPrices: Record<string, number> = {
      'bitcoin': 50000,
      'ethereum': 3000,
      'tether': 1,
      'solana': 100,
      'eloits': 0.1
    };

    const prices: Record<string, number> = {};
    symbols.forEach(symbol => {
      prices[symbol] = mockPrices[symbol] || 0;
    });

    return prices;
  }

  // Get user's crypto portfolio value
  static async getPortfolioValue(userId: string): Promise<{
    totalValue: number;
    assets: Array<{ symbol: string; balance: number; value: number; percentage: number }>;
  } | null> {
    try {
      const wallet = await this.getUserWallet(userId);
      if (!wallet) return null;

      const prices = await this.getCryptoPrices([
        'bitcoin', 'ethereum', 'tether', 'solana', 'eloits'
      ]);

      const assets = [
        { 
          symbol: 'BTC', 
          balance: wallet.btc_balance, 
          value: wallet.btc_balance * prices.bitcoin 
        },
        { 
          symbol: 'ETH', 
          balance: wallet.eth_balance, 
          value: wallet.eth_balance * prices.ethereum 
        },
        { 
          symbol: 'USDT', 
          balance: wallet.usdt_balance, 
          value: wallet.usdt_balance * prices.tether 
        },
        { 
          symbol: 'SOL', 
          balance: wallet.sol_balance, 
          value: wallet.sol_balance * prices.solana 
        },
        { 
          symbol: 'ELOITS', 
          balance: wallet.eloits_balance, 
          value: wallet.eloits_balance * prices.eloits 
        }
      ].filter(asset => asset.balance > 0);

      const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);

      const assetsWithPercentage = assets.map(asset => ({
        ...asset,
        percentage: totalValue > 0 ? (asset.value / totalValue) * 100 : 0
      }));

      return {
        totalValue,
        assets: assetsWithPercentage
      };
    } catch (error) {
      console.error("Error in getPortfolioValue:", error);
      return null;
    }
  }

  // Get recent market activity
  static async getMarketActivity(limit = 10): Promise<any[]> {
    try {
      // In a real implementation, this would fetch recent trades, price changes, etc.
      // For now, we'll return mock data
      const activity = [];
      for (let i = 0; i < limit; i++) {
        activity.push({
          id: `activity_${i}`,
          type: ['trade', 'price_change', 'new_listing'][Math.floor(Math.random() * 3)],
          symbol: ['BTC', 'ETH', 'USDT', 'SOL', 'ELOITS'][Math.floor(Math.random() * 5)],
          value: Math.random() * 10000,
          change: (Math.random() - 0.5) * 10,
          timestamp: new Date(Date.now() - Math.random() * 86400000)
        });
      }
      return activity;
    } catch (error) {
      console.error("Error in getMarketActivity:", error);
      return [];
    }
  }

  // These functions are already defined above with proper implementations

  async getP2POffers(filters?: { asset?: string; fiatCurrency?: string; type?: string }): Promise<any[]> {
    // Fetch P2P offers from database with user profile data
    try {
      let query = supabase
        .from('p2p_offers')
        .select(`
          *,
          profiles:user_id (
            user_id,
            full_name,
            username,
            avatar_url,
            is_verified
          )
        `)
        .eq('status', 'active');
      
      if (filters?.asset) {
        query = query.eq('crypto_type', filters.asset);
      }
      if (filters?.type) {
        query = query.eq('offer_type', filters.type.toLowerCase());
      }
      
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Map database format to UI format
      return (data || []).map((offer: any) => ({
        id: offer.id,
        userId: offer.user_id,
        type: offer.offer_type.toUpperCase(),
        asset: offer.crypto_type,
        fiatCurrency: 'USD', // Default for now
        price: parseFloat(offer.price_per_unit),
        minAmount: 0, // Not in current schema
        maxAmount: parseFloat(offer.amount),
        totalAmount: parseFloat(offer.amount),
        availableAmount: parseFloat(offer.amount),
        paymentMethods: offer.payment_method ? offer.payment_method.split(',').map((pm: string) => ({
          id: pm.trim().toLowerCase().replace(/\s+/g, '_'),
          name: pm.trim(),
          type: 'BANK_TRANSFER',
          processingTime: '1-2 hours',
          isActive: true
        })) : [],
        terms: offer.notes || '',
        status: offer.status.toUpperCase(),
        completionRate: 0, // Would need separate table for stats
        avgReleaseTime: 0,
        totalTrades: 0,
        createdAt: offer.created_at,
        updatedAt: offer.created_at,
        user: {
          id: offer.user_id,
          username: offer.profiles?.username || 'Anonymous',
          avatar: offer.profiles?.avatar_url || '',
          isVerified: offer.profiles?.is_verified || false,
          kycLevel: 1,
          rating: 5.0,
          totalTrades: 0,
          completionRate: 100,
          avgReleaseTime: 15,
          isOnline: true
        }
      }));
    } catch (error) {
      console.error('Error fetching P2P offers:', error);
      return [];
    }
  }

  async createP2POffer(offerData: {
    crypto_type: string;
    offer_type: string;
    amount: number;
    price_per_unit: number;
    payment_method: string;
    expires_at: string;
    notes?: string;
  }): Promise<any> {
    // Create P2P offer in database
    try {
      const { data, error } = await supabase
        .from('p2p_offers')
        .insert({
          ...offerData,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          status: 'active'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating P2P offer:', error);
      return null;
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