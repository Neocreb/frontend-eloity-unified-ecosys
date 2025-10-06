import { supabase } from "@/integrations/supabase/client";
import { 
  Cryptocurrency, 
  TradingPair, 
  Portfolio, 
  MarketData,
  Wallet,
  CryptoTransaction,
  Trade,
  P2POffer
} from "@/types/crypto";

export interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  price_usd: number;
  price_change_24h: number;
  volume_24h: number;
  market_cap: number;
  market_cap_rank: number;
  high_24h: number;
  low_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  last_updated: string;
  created_at: string;
}

export interface UserWallet extends Wallet {
  id: string;
  user_id: string;
  wallet_address: string;
  wallet_provider: string;
  chain_type: string;
  balance: number;
  currency: string;
  is_primary: boolean;
  is_connected: boolean;
  last_synced_at: string;
  created_at: string;
  updated_at: string;
}

export interface UserTransaction extends CryptoTransaction {
  id: string;
  user_id: string;
  wallet_id: string;
  transaction_hash: string;
  from_address: string;
  to_address: string;
  amount: number;
  currency: string;
  transaction_fee: number;
  status: string;
  transaction_type: string;
  timestamp: string;
  confirmations: number;
  block_number: number;
  gas_price: number;
  gas_limit: number;
  gas_used: number;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface UserTrade extends Trade {
  id: string;
  user_id: string;
  transaction_id: string;
  pair: string;
  side: string;
  price: number;
  amount: number;
  total_value: number;
  fee: number;
  fee_currency: string;
  status: string;
  order_type: string;
  timestamp: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface UserP2POffer extends P2POffer {
  id: string;
  user_id: string;
  type: string;
  asset: string;
  fiat_currency: string;
  price: number;
  min_amount: number;
  max_amount: number;
  total_amount: number;
  available_amount: number;
  payment_methods: any;
  terms: string;
  status: string;
  completion_rate: number;
  avg_release_time: number;
  total_trades: number;
  created_at: string;
  updated_at: string;
}

class RealtimeCryptoService {
  // Get user wallet
  async getUserWallet(userId: string): Promise<UserWallet | null> {
    try {
      const { data, error } = await supabase
        .from('crypto_wallets')
        .select('*')
        .eq('user_id', userId)
        .order('is_primary', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user wallet:", error);
        return null;
      }

      return data as UserWallet;
    } catch (error) {
      console.error("Error in getUserWallet:", error);
      return null;
    }
  }

  // Create user wallet
  async createUserWallet(userId: string, walletData: Partial<UserWallet>): Promise<UserWallet | null> {
    try {
      const { data, error } = await supabase
        .from('crypto_wallets')
        .insert({
          user_id: userId,
          wallet_address: walletData.wallet_address,
          wallet_provider: walletData.wallet_provider,
          chain_type: walletData.chain_type,
          balance: walletData.balance || 0,
          currency: walletData.currency || 'USD',
          is_primary: walletData.is_primary || false,
          is_connected: walletData.is_connected !== undefined ? walletData.is_connected : true,
          last_synced_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating user wallet:", error);
        return null;
      }

      return data as UserWallet;
    } catch (error) {
      console.error("Error in createUserWallet:", error);
      return null;
    }
  }

  // Get wallet balance
  async getWalletBalance(userId: string): Promise<{
    btc: number;
    eth: number;
    usdt: number;
    eloits: number;
    sol: number;
    totalValueUSD: number;
  } | null> {
    try {
      const { data, error } = await supabase
        .from('crypto_wallets')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error("Error fetching user wallets:", error);
        return null;
      }

      // Calculate total value based on current prices
      const btcWallet = data.find(w => w.chain_type === 'bitcoin');
      const ethWallet = data.find(w => w.chain_type === 'ethereum');
      const usdtWallet = data.find(w => w.chain_type === 'tether');
      const solWallet = data.find(w => w.chain_type === 'solana');
      const eloitsWallet = data.find(w => w.chain_type === 'eloits');

      // In a real implementation, you would fetch current prices from an API
      // For now, we'll use mock prices
      const btcPrice = 50000; // Mock BTC price
      const ethPrice = 3000;  // Mock ETH price
      const usdtPrice = 1;    // USDT price
      const solPrice = 100;   // Mock SOL price
      const eloitsPrice = 0.1; // Mock ELOITS price

      const totalValueUSD = 
        (btcWallet?.balance || 0) * btcPrice +
        (ethWallet?.balance || 0) * ethPrice +
        (usdtWallet?.balance || 0) * usdtPrice +
        (solWallet?.balance || 0) * solPrice +
        (eloitsWallet?.balance || 0) * eloitsPrice;

      return {
        btc: btcWallet?.balance || 0,
        eth: ethWallet?.balance || 0,
        usdt: usdtWallet?.balance || 0,
        sol: solWallet?.balance || 0,
        eloits: eloitsWallet?.balance || 0,
        totalValueUSD
      };
    } catch (error) {
      console.error("Error in getWalletBalance:", error);
      return null;
    }
  }

  // Get crypto transactions
  async getUserTransactions(userId: string, limit: number = 20): Promise<UserTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('crypto_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching user transactions:", error);
        return [];
      }

      return data as UserTransaction[];
    } catch (error) {
      console.error("Error in getUserTransactions:", error);
      return [];
    }
  }

  // Get user trades
  async getUserTrades(userId: string, limit: number = 20): Promise<UserTrade[]> {
    try {
      const { data, error } = await supabase
        .from('crypto_trades')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching user trades:", error);
        return [];
      }

      return data as UserTrade[];
    } catch (error) {
      console.error("Error in getUserTrades:", error);
      return [];
    }
  }

  // Create P2P offer
  async createP2POffer(offerData: Partial<UserP2POffer> & { user_id: string }): Promise<UserP2POffer | null> {
    try {
      const { data, error } = await supabase
        .from('p2p_offers')
        .insert({
          user_id: offerData.user_id,
          type: offerData.type,
          asset: offerData.asset,
          fiat_currency: offerData.fiat_currency,
          price: offerData.price,
          min_amount: offerData.min_amount,
          max_amount: offerData.max_amount,
          total_amount: offerData.total_amount,
          available_amount: offerData.available_amount,
          payment_methods: offerData.payment_methods,
          terms: offerData.terms,
          status: offerData.status || 'active',
          completion_rate: offerData.completion_rate || 0,
          avg_release_time: offerData.avg_release_time || 0,
          total_trades: offerData.total_trades || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating P2P offer:", error);
        return null;
      }

      return data as UserP2POffer;
    } catch (error) {
      console.error("Error in createP2POffer:", error);
      return null;
    }
  }

  // Get P2P offers
  async getP2POffers(limit: number = 20, cryptoType?: string): Promise<UserP2POffer[]> {
    try {
      let query = supabase
        .from('p2p_offers')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (cryptoType) {
        query = query.eq('asset', cryptoType);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching P2P offers:", error);
        return [];
      }

      return data as UserP2POffer[];
    } catch (error) {
      console.error("Error in getP2POffers:", error);
      return [];
    }
  }

  // Get user's P2P offers
  async getUserP2POffers(userId: string, limit: number = 20): Promise<UserP2POffer[]> {
    try {
      const { data, error } = await supabase
        .from('p2p_offers')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching user P2P offers:", error);
        return [];
      }

      return data as UserP2POffer[];
    } catch (error) {
      console.error("Error in getUserP2POffers:", error);
      return [];
    }
  }

  // Get crypto prices
  async getCryptoPrices(symbols: string[]): Promise<Record<string, number>> {
    try {
      const { data, error } = await supabase
        .from('crypto_prices')
        .select('*')
        .in('symbol', symbols);

      if (error) {
        console.error("Error fetching crypto prices:", error);
        // Return mock prices as fallback
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

      const prices: Record<string, number> = {};
      data.forEach(price => {
        prices[price.symbol] = price.price_usd;
      });

      return prices;
    } catch (error) {
      console.error("Error in getCryptoPrices:", error);
      // Return mock prices as fallback
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
  }

  // Get user's crypto portfolio value
  async getPortfolioValue(userId: string): Promise<{
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
          balance: wallet.balance, 
          value: wallet.balance * prices.bitcoin 
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
  async getMarketActivity(limit: number = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('crypto_trades')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching market activity:", error);
        // Return mock data as fallback
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
      }

      return data.map(trade => ({
        id: trade.id,
        type: 'trade',
        symbol: trade.pair.split('/')[0],
        value: trade.total_value,
        change: 0, // Would need to calculate from price data
        timestamp: trade.timestamp
      }));
    } catch (error) {
      console.error("Error in getMarketActivity:", error);
      // Return mock data as fallback
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
    }
  }

  // Get cryptocurrency data
  async getCryptocurrencies(): Promise<Cryptocurrency[]> {
    try {
      const { data, error } = await supabase
        .from('crypto_prices')
        .select('*')
        .order('market_cap_rank', { ascending: true })
        .limit(100);

      if (error) {
        console.error("Error fetching cryptocurrencies:", error);
        return []; // Will fall back to mock data in the calling function
      }

      return data.map(price => ({
        id: price.symbol.toLowerCase(),
        symbol: price.symbol,
        name: price.name,
        image: `https://assets.coingecko.com/coins/images/${price.symbol.toLowerCase()}/large/${price.symbol.toLowerCase()}.png`,
        current_price: price.price_usd,
        market_cap: price.market_cap,
        market_cap_rank: price.market_cap_rank,
        fully_diluted_valuation: price.max_supply ? price.max_supply * price.price_usd : 0,
        total_volume: price.volume_24h,
        high_24h: price.high_24h,
        low_24h: price.low_24h,
        price_change_24h: price.price_change_24h,
        price_change_percentage_24h: price.price_change_24h ? (price.price_change_24h / (price.price_usd - price.price_change_24h)) * 100 : 0,
        price_change_percentage_7d: 0, // Would need historical data
        price_change_percentage_30d: 0, // Would need historical data
        market_cap_change_24h: 0, // Would need historical data
        market_cap_change_percentage_24h: 0, // Would need historical data
        circulating_supply: price.circulating_supply,
        total_supply: price.total_supply,
        max_supply: price.max_supply,
        ath: 0, // Would need historical data
        ath_change_percentage: 0, // Would need historical data
        ath_date: "", // Would need historical data
        atl: 0, // Would need historical data
        atl_change_percentage: 0, // Would need historical data
        atl_date: "", // Would need historical data
        last_updated: price.last_updated,
        sparkline_in_7d: [] // Would need historical data
      }));
    } catch (error) {
      console.error("Error in getCryptocurrencies:", error);
      return []; // Will fall back to mock data in the calling function
    }
  }

  // Get market data
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
      console.error("Error in getMarketData:", error);
      throw error;
    }
  }
}

export const realtimeCryptoService = new RealtimeCryptoService();