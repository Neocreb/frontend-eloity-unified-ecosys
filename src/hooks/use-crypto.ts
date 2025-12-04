// @ts-nocheck
import { useState, useEffect, useCallback } from "react";
import {
  Cryptocurrency,
  TradingPair,
  OrderBook,
  Trade,
  Order,
  Portfolio,
  P2POffer,
  P2PTrade,
  StakingProduct,
  StakingPosition,
  DeFiPosition,
  Alert,
  WatchlistItem,
  Transaction,
  MarketData,
  News,
  EducationContent,
} from "@/types/crypto";
import { cryptoService } from "@/services/cryptoService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface UseCryptoState {
  // Market data
  cryptocurrencies: Cryptocurrency[];
  tradingPairs: TradingPair[];
  marketData: MarketData | null;
  selectedPair: string;

  // Trading
  orderBook: OrderBook | null;
  recentTrades: Trade[];
  openOrders: Order[];
  orderHistory: Order[];
  portfolio: Portfolio | null;

  // P2P
  p2pOffers: P2POffer[];
  p2pTrades: P2PTrade[];

  // DeFi
  stakingProducts: StakingProduct[];
  stakingPositions: StakingPosition[];
  defiPositions: DeFiPosition[];

  // Other features
  watchlist: WatchlistItem[];
  alerts: Alert[];
  news: News[];
  transactions: Transaction[];
  educationContent: EducationContent[];

  // State
  isLoading: boolean;
  error: string | null;
}

export function useCrypto() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [state, setState] = useState<UseCryptoState>({
    cryptocurrencies: [],
    tradingPairs: [],
    marketData: null,
    selectedPair: "BTCUSDT",
    orderBook: null,
    recentTrades: [],
    openOrders: [],
    orderHistory: [],
    portfolio: null,
    p2pOffers: [],
    p2pTrades: [],
    stakingProducts: [],
    stakingPositions: [],
    defiPositions: [],
    watchlist: [],
    alerts: [],
    news: [],
    transactions: [],
    educationContent: [],
    isLoading: false,
    error: null,
  });

  // Real-time data subscriptions
  const [subscriptions, setSubscriptions] = useState<(() => void)[]>([]);

  // Load initial data
  useEffect(() => {
    loadInitialData();
    return () => {
      // Cleanup subscriptions
      subscriptions.forEach((unsub) => unsub());
    };
  }, []);

  // Load user-specific data when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserData();
    } else {
      // Clear user-specific data when not authenticated
      setState((prev) => ({
        ...prev,
        portfolio: null,
        openOrders: [],
        orderHistory: [],
        p2pTrades: [],
        stakingPositions: [],
        defiPositions: [],
        watchlist: [],
        alerts: [],
        transactions: [],
      }));
    }
  }, [isAuthenticated, user]);

  const loadInitialData = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const results = await Promise.allSettled([
        cryptoService.getCryptocurrencies(),
        cryptoService.getTradingPairs(),
        cryptoService.getMarketData(),
        cryptoService.getStakingProducts(),
        cryptoService.getNews ? cryptoService.getNews(20) : Promise.resolve([]),
        cryptoService.getEducationContent ? cryptoService.getEducationContent() : Promise.resolve([]),
      ]);

      const [
        cryptocurrenciesResult,
        tradingPairsResult,
        marketDataResult,
        stakingProductsResult,
        newsResult,
        educationContentResult,
      ] = results;

      setState((prev) => ({
        ...prev,
        cryptocurrencies: cryptocurrenciesResult.status === 'fulfilled' ? cryptocurrenciesResult.value : [],
        tradingPairs: tradingPairsResult.status === 'fulfilled' ? tradingPairsResult.value : [],
        marketData: marketDataResult.status === 'fulfilled' ? marketDataResult.value : null,
        stakingProducts: stakingProductsResult.status === 'fulfilled' ? stakingProductsResult.value : [],
        news: newsResult.status === 'fulfilled' ? newsResult.value : [],
        educationContent: educationContentResult.status === 'fulfilled' ? educationContentResult.value : [],
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      console.error("Failed to load initial crypto data:", errorMessage);
      setState((prev) => ({
        ...prev,
        error: "Failed to load crypto data",
        isLoading: false,
      }));
    }
  };

  const loadUserData = async () => {
    if (!user) return;

    try {
      const results = await Promise.allSettled([
        cryptoService.getPortfolio(),
        cryptoService.getWatchlist(user.id),
        cryptoService.getStakingPositions(user.id),
        cryptoService.getTransactions ? cryptoService.getTransactions(50) : Promise.resolve([]),
        cryptoService.getOpenOrders ? cryptoService.getOpenOrders() : Promise.resolve([]),
      ]);

      const [
        portfolioResult,
        watchlistResult,
        stakingPositionsResult,
        transactionsResult,
        openOrdersResult,
      ] = results;

      setState((prev) => ({
        ...prev,
        portfolio: portfolioResult.status === 'fulfilled' ? portfolioResult.value : null,
        watchlist: watchlistResult.status === 'fulfilled' ? watchlistResult.value : [],
        stakingPositions: stakingPositionsResult.status === 'fulfilled' ? stakingPositionsResult.value : [],
        transactions: transactionsResult.status === 'fulfilled' ? transactionsResult.value : [],
        openOrders: openOrdersResult.status === 'fulfilled' ? openOrdersResult.value : [],
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      console.error("Failed to load user crypto data:", errorMessage);
    }
  };

  // Market data functions
  const fetchMarketData = useCallback(async () => {
    try {
      const marketData = await cryptoService.getMarketData();
      setState((prev) => ({ ...prev, marketData }));
    } catch (error) {
      console.error("Failed to fetch market data:", error);
      throw error;
    }
  }, []);

  const fetchPortfolio = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const portfolio = await cryptoService.getPortfolio();
      setState((prev) => ({ ...prev, portfolio }));
    } catch (error) {
      console.error("Failed to fetch portfolio:", error);
      throw error;
    }
  }, [isAuthenticated]);

  // Trading functions
  const setSelectedPair = useCallback((pair: string) => {
    setState((prev) => ({ ...prev, selectedPair: pair }));

    // Load order book and trades for new pair
    loadTradingData(pair);
  }, []);

  const loadTradingData = async (pair: string) => {
    try {
      const [orderBook, recentTrades] = await Promise.all([
        cryptoService.getOrderBook(pair),
        cryptoService.getRecentTrades(pair, 50),
      ]);

      setState((prev) => ({
        ...prev,
        orderBook,
        recentTrades,
      }));
    } catch (error) {
      console.error("Failed to load trading data:", error);
    }
  };

  const placeOrder = useCallback(
    async (
      orderData: Omit<Order, "id" | "timestamp" | "updateTime" | "fills">,
    ) => {
      if (!isAuthenticated) {
        toast({
          title: "Authentication required",
          description: "Please sign in to place orders",
          variant: "destructive",
        });
        throw new Error("Authentication required");
      }

      try {
        const order = await cryptoService.placeOrder(orderData);

        setState((prev) => ({
          ...prev,
          openOrders: [order, ...prev.openOrders],
        }));

        toast({
          title: "Order placed",
          description: `${orderData.side} order for ${orderData.quantity} ${orderData.symbol.replace("USDT", "")} placed successfully`,
        });

        return order;
      } catch (error) {
        console.error("Failed to place order:", error);
        toast({
          title: "Order failed",
          description: "Failed to place order. Please try again.",
          variant: "destructive",
        });
        throw error;
      }
    },
    [isAuthenticated, toast],
  );

  const cancelOrder = useCallback(
    async (orderId: string) => {
      try {
        await cryptoService.cancelOrder(orderId);

        setState((prev) => ({
          ...prev,
          openOrders: prev.openOrders.filter((order) => order.id !== orderId),
        }));

        toast({
          title: "Order cancelled",
          description: "Order has been cancelled successfully",
        });
      } catch (error) {
        console.error("Failed to cancel order:", error);
        toast({
          title: "Cancellation failed",
          description: "Failed to cancel order. Please try again.",
          variant: "destructive",
        });
        throw error;
      }
    },
    [toast],
  );

  // Watchlist functions
  const addToWatchlist = useCallback(
    async (asset: string, notes?: string) => {
      if (!isAuthenticated) {
        toast({
          title: "Authentication required",
          description: "Please sign in to manage your watchlist",
          variant: "destructive",
        });
        return;
      }

      try {
        const item = await cryptoService.addToWatchlist(asset, notes);

        setState((prev) => ({
          ...prev,
          watchlist: [...prev.watchlist, item],
        }));

        toast({
          title: "Added to watchlist",
          description: `${asset} has been added to your watchlist`,
        });
      } catch (error) {
        console.error("Failed to add to watchlist:", error);
        toast({
          title: "Error",
          description: "Failed to add to watchlist",
          variant: "destructive",
        });
      }
    },
    [isAuthenticated, toast],
  );

  const removeFromWatchlist = useCallback(
    async (itemId: string) => {
      try {
        await cryptoService.removeFromWatchlist(itemId);

        setState((prev) => ({
          ...prev,
          watchlist: prev.watchlist.filter((item) => item.id !== itemId),
        }));

        toast({
          title: "Removed from watchlist",
          description: "Item has been removed from your watchlist",
        });
      } catch (error) {
        console.error("Failed to remove from watchlist:", error);
        toast({
          title: "Error",
          description: "Failed to remove from watchlist",
          variant: "destructive",
        });
      }
    },
    [toast],
  );

  // Alert functions
  const createAlert = useCallback(
    async (
      alertData: Omit<
        Alert,
        "id" | "createdAt" | "isTriggered" | "triggeredAt"
      >,
    ) => {
      if (!isAuthenticated) {
        toast({
          title: "Authentication required",
          description: "Please sign in to create alerts",
          variant: "destructive",
        });
        return;
      }

      try {
        const alert = await cryptoService.createAlert(alertData);

        setState((prev) => ({
          ...prev,
          alerts: [...prev.alerts, alert],
        }));

        toast({
          title: "Alert created",
          description: "You will be notified when the condition is met",
        });
      } catch (error) {
        console.error("Failed to create alert:", error);
        toast({
          title: "Error",
          description: "Failed to create alert",
          variant: "destructive",
        });
      }
    },
    [isAuthenticated, toast],
  );

  // P2P functions
  const fetchP2POffers = useCallback(async (filters?: any) => {
    try {
      const offers = await cryptoService.getP2POffers(filters);
      setState((prev) => ({ ...prev, p2pOffers: offers }));
    } catch (error) {
      console.error("Failed to fetch P2P offers:", error);
      throw error;
    }
  }, []);

  const createP2POffer = useCallback(
    async (
      offerData: Omit<
        P2POffer,
        "id" | "userId" | "user" | "createdAt" | "updatedAt"
      >,
    ) => {
      if (!isAuthenticated) {
        toast({
          title: "Authentication required",
          description: "Please sign in to create P2P offers",
          variant: "destructive",
        });
        return;
      }

      try {
        const offer = await cryptoService.createP2POffer(offerData);

        setState((prev) => ({
          ...prev,
          p2pOffers: [offer, ...prev.p2pOffers],
        }));

        toast({
          title: "Offer created",
          description: "Your P2P offer has been created successfully",
        });
      } catch (error) {
        console.error("Failed to create P2P offer:", error);
        toast({
          title: "Error",
          description: "Failed to create P2P offer",
          variant: "destructive",
        });
      }
    },
    [isAuthenticated, toast],
  );

  // Staking functions
  const stakeAsset = useCallback(
    async (productId: string, amount: number) => {
      if (!isAuthenticated) {
        toast({
          title: "Authentication required",
          description: "Please sign in to stake assets",
          variant: "destructive",
        });
        return;
      }

      try {
        const position = await cryptoService.stakeAsset(productId, amount);

        setState((prev) => ({
          ...prev,
          stakingPositions: [...prev.stakingPositions, position],
        }));

        toast({
          title: "Staking successful",
          description: `Successfully staked ${amount} ${position.asset}`,
        });

        return position;
      } catch (error) {
        console.error("Failed to stake asset:", error);
        toast({
          title: "Staking failed",
          description: "Failed to stake assets. Please try again.",
          variant: "destructive",
        });
        throw error;
      }
    },
    [isAuthenticated, toast],
  );

  // Real-time data subscriptions
  const subscribeToTrades = useCallback((symbol: string) => {
    // Mock real-time subscription
    const interval = setInterval(async () => {
      try {
        const newTrades = await cryptoService.getRecentTrades(symbol, 5);
        setState((prev) => ({
          ...prev,
          recentTrades: [...newTrades, ...prev.recentTrades].slice(0, 100),
        }));
      } catch (error) {
        console.error("Failed to update trades:", error);
      }
    }, 2000);

    const unsubscribe = () => clearInterval(interval);
    setSubscriptions((prev) => [...prev, unsubscribe]);

    return unsubscribe;
  }, []);

  const subscribeToOrderBook = useCallback((symbol: string) => {
    // Mock real-time subscription
    const interval = setInterval(async () => {
      try {
        const orderBook = await cryptoService.getOrderBook(symbol);
        setState((prev) => ({ ...prev, orderBook }));
      } catch (error) {
        console.error("Failed to update order book:", error);
      }
    }, 1000);

    const unsubscribe = () => clearInterval(interval);
    setSubscriptions((prev) => [...prev, unsubscribe]);

    return unsubscribe;
  }, []);

  const subscribeToTicker = useCallback((symbol: string) => {
    // Mock real-time subscription for price updates
    const interval = setInterval(() => {
      setState((prev) => ({
        ...prev,
        cryptocurrencies: prev.cryptocurrencies.map((crypto) => ({
          ...crypto,
          current_price:
            crypto.current_price * (1 + (Math.random() - 0.5) * 0.001), // Small random changes
          price_change_percentage_24h:
            crypto.price_change_percentage_24h + (Math.random() - 0.5) * 0.1,
        })),
      }));
    }, 5000);

    const unsubscribe = () => clearInterval(interval);
    setSubscriptions((prev) => [...prev, unsubscribe]);

    return unsubscribe;
  }, []);

  // Utility functions
  const getCryptocurrency = useCallback(
    (id: string) => {
      return state.cryptocurrencies.find((crypto) => crypto.id === id);
    },
    [state.cryptocurrencies],
  );

  const getTradingPair = useCallback(
    (symbol: string) => {
      return state.tradingPairs.find((pair) => pair.symbol === symbol);
    },
    [state.tradingPairs],
  );

  const getPortfolioValue = useCallback(() => {
    return state.portfolio?.totalValue || 0;
  }, [state.portfolio]);

  const getStakingValue = useCallback(() => {
    return state.stakingPositions.reduce((total, position) => {
      // In a real app, multiply by current market price
      return total + position.amount;
    }, 0);
  }, [state.stakingPositions]);

  return {
    // State
    ...state,

    // Computed values
    totalValue: getPortfolioValue() + getStakingValue(),

    // Actions
    setSelectedPair,
    fetchMarketData,
    fetchPortfolio,
    placeOrder,
    cancelOrder,
    addToWatchlist,
    removeFromWatchlist,
    createAlert,
    fetchP2POffers,
    createP2POffer,
    stakeAsset,

    // Real-time subscriptions
    subscribeToTrades,
    subscribeToOrderBook,
    subscribeToTicker,

    // Utilities
    getCryptocurrency,
    getTradingPair,
    getPortfolioValue,
    getStakingValue,

    // Refresh functions
    refresh: loadInitialData,
    refreshUserData: loadUserData,
  };
}

export default useCrypto;
