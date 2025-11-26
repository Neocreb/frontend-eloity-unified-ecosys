import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  DollarSign,
  Shield,
  AlertTriangle,
  Settings,
  Bookmark,
  Eye,
  Bell,
  Target,
  Clock,
  Zap,
  Star,
  Users,
  PieChart,
  LineChart,
  CandlestickChart,
  Wallet,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cryptoService } from "@/services/cryptoService";
import {
  Cryptocurrency,
  TradingPair,
  OrderBook,
  Trade,
  Order,
  Portfolio,
  Alert,
  WatchlistItem,
} from "@/types/crypto";
import { cn } from "@/lib/utils";

interface EnhancedTradingDashboardProps {
  selectedPair?: string;
  onPairSelect?: (pair: string) => void;
}

export default function EnhancedTradingDashboard({
  selectedPair = "BTCUSDT",
  onPairSelect,
}: EnhancedTradingDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [cryptos, setCryptos] = useState<Cryptocurrency[]>([]);
  const [tradingPairs, setTradingPairs] = useState<TradingPair[]>([]);
  const [orderBook, setOrderBook] = useState<OrderBook | null>(null);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [openOrders, setOpenOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [priceAlertValue, setPriceAlertValue] = useState("");
  const [showAlertDialog, setShowAlertDialog] = useState(false);

  const { toast } = useToast();

  // Load initial data
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      updateRealTimeData();
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedPair]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [
        cryptosData,
        tradingPairsData,
        orderBookData,
        recentTradesData,
        portfolioData,
        watchlistData,
      ] = await Promise.all([
        cryptoService.getCryptocurrencies(),
        cryptoService.getTradingPairs(),
        cryptoService.getOrderBook(selectedPair),
        cryptoService.getRecentTrades(selectedPair, 20),
        cryptoService.getPortfolio(),
        cryptoService.getWatchlist(),
      ]);

      setCryptos(cryptosData);
      setTradingPairs(tradingPairsData);
      setOrderBook(orderBookData);
      setRecentTrades(recentTradesData);
      setPortfolio(portfolioData);
      setWatchlist(watchlistData);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load trading data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateRealTimeData = async () => {
    try {
      const [newOrderBook, newTrades] = await Promise.all([
        cryptoService.getOrderBook(selectedPair),
        cryptoService.getRecentTrades(selectedPair, 10),
      ]);

      setOrderBook(newOrderBook);
      setRecentTrades((prev) => [...newTrades, ...prev].slice(0, 50));
    } catch (error) {
      console.error("Failed to update real-time data:", error);
    }
  };

  const handleAddToWatchlist = async (asset: string) => {
    try {
      const newItem = await cryptoService.addToWatchlist(asset);
      setWatchlist((prev) => [...prev, newItem]);
      toast({
        title: "Added to Watchlist",
        description: `${asset} has been added to your watchlist`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add to watchlist",
        variant: "destructive",
      });
    }
  };

  const handleCreateAlert = async () => {
    if (!priceAlertValue) return;

    try {
      const currentPair = tradingPairs.find((p) => p.symbol === selectedPair);
      if (!currentPair) return;

      const newAlert = await cryptoService.createAlert({
        type: "PRICE",
        asset: currentPair.baseAsset,
        condition:
          parseFloat(priceAlertValue) > currentPair.price ? "ABOVE" : "BELOW",
        value: parseFloat(priceAlertValue),
        currentValue: currentPair.price,
        message: `${currentPair.baseAsset} price ${parseFloat(priceAlertValue) > currentPair.price ? "above" : "below"} $${priceAlertValue}`,
        isActive: true,
      });

      setAlerts((prev) => [...prev, newAlert]);
      setPriceAlertValue("");
      setShowAlertDialog(false);

      toast({
        title: "Alert Created",
        description: "You will be notified when the price condition is met",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create alert",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(price);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  const getCurrentPair = () => {
    return tradingPairs.find((p) => p.symbol === selectedPair);
  };

  const currentPair = getCurrentPair();

  return (
    <div className="w-full mobile-space-y">
      {/* Header with Pair Selection */}
      <div className="mobile-flex lg:items-start lg:justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 min-w-0 flex-1">
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold truncate">
              Trading Dashboard
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              Advanced crypto trading with real-time data
            </p>
          </div>

          {currentPair && (
            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
              <Badge
                variant="outline"
                className="text-sm md:text-lg px-2 md:px-3 py-1"
              >
                {currentPair.baseAsset}/{currentPair.quoteAsset}
              </Badge>
              <div className="text-right">
                <div className="text-lg md:text-2xl font-bold">
                  {formatPrice(currentPair.price)}
                </div>
                <div
                  className={cn(
                    "text-xs md:text-sm font-medium flex items-center gap-1",
                    currentPair.priceChangePercent >= 0
                      ? "text-green-600"
                      : "text-red-600",
                  )}
                >
                  {currentPair.priceChangePercent >= 0 ? (
                    <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
                  ) : (
                    <TrendingDown className="h-3 w-3 md:h-4 md:w-4" />
                  )}
                  {formatPercentage(currentPair.priceChangePercent)}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-xs md:text-sm"
              >
                <Bell className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Create</span> Alert
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-md">
              <DialogHeader>
                <DialogTitle className="text-lg">
                  Create Price Alert
                </DialogTitle>
                <DialogDescription className="text-sm">
                  Get notified when the price reaches your target level
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">
                    Target Price (USD)
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter price"
                    value={priceAlertValue}
                    onChange={(e) => setPriceAlertValue(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowAlertDialog(false)}
                    size="sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateAlert}
                    disabled={!priceAlertValue}
                    size="sm"
                  >
                    Create Alert
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              currentPair && handleAddToWatchlist(currentPair.baseAsset)
            }
            className="text-xs md:text-sm"
          >
            <Star className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Watch</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Mobile optimized tab list */}
        <div className="w-full mobile-tabs">
          <div className="border-b border-gray-200">
            <TabsList className="inline-flex h-auto bg-transparent min-w-max p-0 gap-1">
              <TabsTrigger
                value="overview"
                className="mobile-tab data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent rounded-none touch-target"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="trading"
                className="mobile-tab data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent rounded-none touch-target"
              >
                Trading
              </TabsTrigger>
              <TabsTrigger
                value="portfolio"
                className="mobile-tab data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent rounded-none touch-target"
              >
                Portfolio
              </TabsTrigger>
              <TabsTrigger
                value="watchlist"
                className="mobile-tab data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent rounded-none touch-target"
              >
                Watchlist
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="mobile-tab data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent rounded-none touch-target"
              >
                Analytics
              </TabsTrigger>
              <TabsTrigger
                value="alerts"
                className="mobile-tab data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent rounded-none touch-target"
              >
                Alerts
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 md:space-y-6 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {/* Market Stats */}
            <Card>
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="p-1.5 md:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                    <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs md:text-sm text-gray-600">
                      Market Cap
                    </div>
                    <div className="text-lg md:text-xl font-bold">$1.75T</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="p-1.5 md:p-2 bg-green-100 rounded-lg flex-shrink-0">
                    <Activity className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs md:text-sm text-gray-600">
                      24h Volume
                    </div>
                    <div className="text-lg md:text-xl font-bold">$85B</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="p-1.5 md:p-2 bg-purple-100 rounded-lg flex-shrink-0">
                    <Target className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs md:text-sm text-gray-600">
                      BTC Dominance
                    </div>
                    <div className="text-lg md:text-xl font-bold">48.5%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="p-1.5 md:p-2 bg-orange-100 rounded-lg flex-shrink-0">
                    <Zap className="h-4 w-4 md:h-5 md:w-5 text-orange-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs md:text-sm text-gray-600">
                      Fear & Greed
                    </div>
                    <div className="text-lg md:text-xl font-bold">
                      75 <span className="text-sm font-normal">(Greed)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Cryptocurrencies */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
                Top Cryptocurrencies
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 md:px-6">
              <div className="space-y-2 md:space-y-3">
                {cryptos.slice(0, 10).map((crypto) => (
                  <div
                    key={crypto.id}
                    className="flex items-center justify-between p-2 md:p-3 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                      <img
                        src={crypto.image}
                        alt={crypto.name}
                        className="w-6 h-6 md:w-8 md:h-8 rounded-full flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-medium text-sm md:text-base truncate">
                          {crypto.name}
                        </div>
                        <div className="text-xs md:text-sm text-gray-600">
                          {crypto.symbol.toUpperCase()}
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="font-semibold text-sm md:text-base">
                        {formatPrice(crypto.current_price)}
                      </div>
                      <div
                        className={cn(
                          "text-xs md:text-sm",
                          crypto.price_change_percentage_24h >= 0
                            ? "text-green-600"
                            : "text-red-600",
                        )}
                      >
                        {formatPercentage(crypto.price_change_percentage_24h)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trading Tab */}
        <TabsContent value="trading" className="space-y-4 md:space-y-6 mt-4">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
            {/* Order Book */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg">
                  Order Book
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 md:px-6">
                {orderBook ? (
                  <div className="space-y-3 md:space-y-4">
                    {/* Asks */}
                    <div>
                      <div className="text-xs md:text-sm font-medium text-gray-600 mb-2">
                        Asks
                      </div>
                      <div className="space-y-1">
                        {orderBook.asks.slice(0, 8).map((ask, index) => (
                          <div
                            key={index}
                            className="flex justify-between text-xs md:text-sm"
                          >
                            <span className="text-red-600 font-mono">
                              {ask.price.toFixed(2)}
                            </span>
                            <span className="font-mono">
                              {ask.quantity.toFixed(6)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Current Price */}
                    {currentPair && (
                      <div className="text-center py-2 border-y">
                        <div className="text-base md:text-lg font-bold">
                          {formatPrice(currentPair.price)}
                        </div>
                        <div className="text-xs md:text-sm text-gray-600">
                          Last Price
                        </div>
                      </div>
                    )}

                    {/* Bids */}
                    <div>
                      <div className="text-xs md:text-sm font-medium text-gray-600 mb-2">
                        Bids
                      </div>
                      <div className="space-y-1">
                        {orderBook.bids.slice(0, 8).map((bid, index) => (
                          <div
                            key={index}
                            className="flex justify-between text-xs md:text-sm"
                          >
                            <span className="text-green-600 font-mono">
                              {bid.price.toFixed(2)}
                            </span>
                            <span className="font-mono">
                              {bid.quantity.toFixed(6)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 md:py-8 text-gray-500">
                    Loading order book...
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Trades */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg">
                  Recent Trades
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 md:px-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs md:text-sm font-medium text-gray-600">
                    <span>Price</span>
                    <span>Amount</span>
                    <span>Time</span>
                  </div>
                  <div className="max-h-64 md:max-h-80 overflow-y-auto space-y-1">
                    {recentTrades.slice(0, 15).map((trade, index) => (
                      <div
                        key={`${trade.id}-${index}-${trade.time}`}
                        className="flex justify-between text-xs md:text-sm"
                      >
                        <span
                          className={cn(
                            "font-medium font-mono",
                            trade.isBuyerMaker
                              ? "text-red-600"
                              : "text-green-600",
                          )}
                        >
                          {trade.price.toFixed(2)}
                        </span>
                        <span className="font-mono">
                          {trade.quantity.toFixed(6)}
                        </span>
                        <span className="text-gray-500 font-mono">
                          {new Date(trade.time).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trading Panel */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg">
                  Place Order
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 md:px-6">
                <div className="space-y-4">
                  <Tabs defaultValue="buy" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger
                        value="buy"
                        className="text-green-600 data-[state=active]:bg-green-50"
                      >
                        Buy
                      </TabsTrigger>
                      <TabsTrigger
                        value="sell"
                        className="text-red-600 data-[state=active]:bg-red-50"
                      >
                        Sell
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="buy" className="space-y-3 md:space-y-4">
                      <div>
                        <label className="text-xs md:text-sm font-medium">
                          Order Type
                        </label>
                        <Select defaultValue="limit">
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="market">Market</SelectItem>
                            <SelectItem value="limit">Limit</SelectItem>
                            <SelectItem value="stop">Stop Loss</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-xs md:text-sm font-medium">
                          Price (USDT)
                        </label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          defaultValue={currentPair?.price.toFixed(2)}
                          className="mt-1 font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-xs md:text-sm font-medium">
                          Amount (BTC)
                        </label>
                        <Input
                          type="number"
                          placeholder="0.00000000"
                          className="mt-1 font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-xs md:text-sm font-medium">
                          Total (USDT)
                        </label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          className="mt-1 font-mono"
                        />
                      </div>

                      <Button className="w-full bg-green-600 hover:bg-green-700 text-sm">
                        Buy {currentPair?.baseAsset}
                      </Button>
                    </TabsContent>

                    <TabsContent
                      value="sell"
                      className="space-y-3 md:space-y-4"
                    >
                      <div>
                        <label className="text-xs md:text-sm font-medium">
                          Order Type
                        </label>
                        <Select defaultValue="limit">
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="market">Market</SelectItem>
                            <SelectItem value="limit">Limit</SelectItem>
                            <SelectItem value="stop">Stop Loss</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-xs md:text-sm font-medium">
                          Price (USDT)
                        </label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          defaultValue={currentPair?.price.toFixed(2)}
                          className="mt-1 font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-xs md:text-sm font-medium">
                          Amount (BTC)
                        </label>
                        <Input
                          type="number"
                          placeholder="0.00000000"
                          className="mt-1 font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-xs md:text-sm font-medium">
                          Total (USDT)
                        </label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          className="mt-1 font-mono"
                        />
                      </div>

                      <Button className="w-full bg-red-600 hover:bg-red-700 text-sm">
                        Sell {currentPair?.baseAsset}
                      </Button>
                    </TabsContent>
                  </Tabs>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="space-y-4 md:space-y-6 mt-4">
          {portfolio ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Portfolio Summary */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <Wallet className="h-4 w-4 md:h-5 md:w-5" />
                    Portfolio Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 md:space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <div className="text-2xl md:text-3xl font-bold">
                          {formatPrice(portfolio.totalValue)}
                        </div>
                        <div
                          className={cn(
                            "text-base md:text-lg font-medium",
                            portfolio.totalChangePercent24h >= 0
                              ? "text-green-600"
                              : "text-red-600",
                          )}
                        >
                          {formatPercentage(portfolio.totalChangePercent24h)}{" "}
                          (24h)
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <div className="text-xs md:text-sm text-gray-600">
                          P&L (24h)
                        </div>
                        <div
                          className={cn(
                            "text-lg md:text-xl font-bold",
                            portfolio.totalChange24h >= 0
                              ? "text-green-600"
                              : "text-red-600",
                          )}
                        >
                          {formatPrice(portfolio.totalChange24h)}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 md:space-y-3">
                      {portfolio.assets.map((asset) => (
                        <div
                          key={asset.asset}
                          className="flex items-center justify-between p-2 md:p-3 rounded-lg bg-gray-50"
                        >
                          <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                            <div
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: "#F7931A" }}
                            ></div>
                            <div className="min-w-0">
                              <div className="font-medium text-sm md:text-base">
                                {asset.asset}
                              </div>
                              <div className="text-xs md:text-sm text-gray-600 truncate">
                                {asset.total} {asset.asset}
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="font-semibold text-sm md:text-base">
                              {formatPrice(asset.usdValue)}
                            </div>
                            <div
                              className={cn(
                                "text-xs md:text-sm",
                                asset.changePercent24h >= 0
                                  ? "text-green-600"
                                  : "text-red-600",
                              )}
                            >
                              {formatPercentage(asset.changePercent24h)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Asset Allocation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <PieChart className="h-4 w-4 md:h-5 md:w-5" />
                    Allocation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 md:space-y-4">
                    {portfolio.allocation.map((item) => (
                      <div key={item.asset} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium truncate flex-1 mr-2">
                            {item.asset}
                          </span>
                          <span className="flex-shrink-0">
                            {item.percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${item.percentage}%`,
                              backgroundColor: item.color,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8 md:py-12">
              <Wallet className="h-10 w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-base md:text-lg font-semibold mb-2">
                No Portfolio Data
              </h3>
              <p className="text-sm md:text-base text-gray-600">
                Start trading to see your portfolio here
              </p>
            </div>
          )}
        </TabsContent>

        {/* Watchlist Tab */}
        <TabsContent value="watchlist" className="space-y-4 md:space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Star className="h-4 w-4 md:h-5 md:w-5" />
                My Watchlist
              </CardTitle>
            </CardHeader>
            <CardContent>
              {watchlist.length > 0 ? (
                <div className="space-y-2 md:space-y-3">
                  {watchlist.map((item) => {
                    const crypto = cryptos.find(
                      (c) => c.symbol === item.asset.toLowerCase(),
                    );
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 md:p-3 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                          {crypto && (
                            <img
                              src={crypto.image}
                              alt={crypto.name}
                              className="w-6 h-6 md:w-8 md:h-8 rounded-full flex-shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <div className="font-medium text-sm md:text-base">
                              {item.asset}
                            </div>
                            {item.notes && (
                              <div className="text-xs md:text-sm text-gray-600 truncate">
                                {item.notes}
                              </div>
                            )}
                          </div>
                        </div>

                        {crypto && (
                          <div className="text-right flex-shrink-0">
                            <div className="font-semibold text-sm md:text-base">
                              {formatPrice(crypto.current_price)}
                            </div>
                            <div
                              className={cn(
                                "text-xs md:text-sm",
                                crypto.price_change_percentage_24h >= 0
                                  ? "text-green-600"
                                  : "text-red-600",
                              )}
                            >
                              {formatPercentage(
                                crypto.price_change_percentage_24h,
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 md:py-12">
                  <Star className="h-10 w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-base md:text-lg font-semibold mb-2">
                    No Watchlist Items
                  </h3>
                  <p className="text-sm md:text-base text-gray-600">
                    Add cryptocurrencies to track their performance
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4 md:space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">
                  Performance Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 md:py-12 text-gray-500">
                  <LineChart className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-4" />
                  <p className="text-sm md:text-base">
                    Advanced analytics coming soon...
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">
                  Trading Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 md:py-12 text-gray-500">
                  <BarChart3 className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-4" />
                  <p className="text-sm md:text-base">
                    Trading stats will appear here
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4 md:space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Bell className="h-4 w-4 md:h-5 md:w-5" />
                Price Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {alerts.length > 0 ? (
                <div className="space-y-2 md:space-y-3">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between p-2 md:p-3 rounded-lg border"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm md:text-base">
                          {alert.message}
                        </div>
                        <div className="text-xs md:text-sm text-gray-600">
                          Created{" "}
                          {new Date(alert.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge
                        variant={alert.isActive ? "default" : "secondary"}
                        className="flex-shrink-0 ml-2"
                      >
                        {alert.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 md:py-12">
                  <Bell className="h-10 w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-base md:text-lg font-semibold mb-2">
                    No Active Alerts
                  </h3>
                  <p className="text-sm md:text-base text-gray-600">
                    Create price alerts to stay informed
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
