import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Globe,
  Activity,
  Target,
  Brain,
  Wallet,
  ArrowUpDown,
  Plus,
  Minus,
  PieChart,
  BookOpen,
  CreditCard,
  Banknote,
  Users,
  Shield,
  Clock,
  Star,
  DollarSign,
  Eye,
  Heart,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { cryptoService } from "@/services/cryptoService";
import { blogService } from "@/services/blogService";
import {
  Cryptocurrency,
  MarketData,
  Portfolio,
  OrderBook,
  Trade,
  News,
  EducationContent,
} from "@/types/crypto";
import { BlogPost } from "@/types/blog";
import { SmartContentRecommendations } from "@/components/ai/SmartContentRecommendations";
import EnhancedP2PMarketplace from "@/components/crypto/EnhancedP2PMarketplace";
import EnhancedCryptoPortfolio from "@/components/crypto/EnhancedCryptoPortfolio";
import ApiStatusIndicator from "@/components/crypto/ApiStatusIndicator";
import CryptoDetailModal from "@/components/crypto/CryptoDetailModal";
import BlogRSSFeed from "@/components/crypto/BlogRSSFeed";
import { cn } from "@/lib/utils";

export default function EnhancedCrypto() {
  const [activeTab, setActiveTab] = useState("overview");
  const [cryptos, setCryptos] = useState<Cryptocurrency[]>([]);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [orderBook, setOrderBook] = useState<OrderBook | null>(null);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [educationContent, setEducationContent] = useState<EducationContent[]>(
    [],
  );
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [selectedPair, setSelectedPair] = useState("BTCUSDT");
  const [orderType, setOrderType] = useState("limit");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [price, setPrice] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedCrypto, setSelectedCrypto] = useState<Cryptocurrency | null>(
    null,
  );
  const [isCryptoDetailOpen, setIsCryptoDetailOpen] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadCryptoData();
  }, []);

  // Real-time updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(updateRealTimeData, 30000);
    return () => clearInterval(interval);
  }, [selectedPair]);

  // Listen for P2P navigation events from portfolio
  useEffect(() => {
    const handleNavigateToP2P = () => {
      setActiveTab("p2p");
    };

    window.addEventListener('navigate-to-p2p', handleNavigateToP2P);
    return () => {
      window.removeEventListener('navigate-to-p2p', handleNavigateToP2P);
    };
  }, []);

  const loadCryptoData = async () => {
    setIsLoading(true);
    try {
      // Load data with individual error handling to prevent total failure
      const results = await Promise.allSettled([
        cryptoService.getCryptocurrencies(20),
        cryptoService.getMarketData(),
        cryptoService.getPortfolio(),
        cryptoService.getOrderBook(selectedPair),
        cryptoService.getRecentTrades(selectedPair, 10),
        cryptoService.getNews(6),
        cryptoService.getEducationContent(),
        blogService.getBlogPosts({ limit: 6 }),
      ]);

      // Handle each result individually
      if (results[0].status === "fulfilled") setCryptos(results[0].value || []);
      if (results[1].status === "fulfilled") setMarketData(results[1].value);
      if (results[2].status === "fulfilled") setPortfolio(results[2].value);
      if (results[3].status === "fulfilled") setOrderBook(results[3].value);
      if (results[4].status === "fulfilled")
        setRecentTrades(results[4].value || []);
      if (results[5].status === "fulfilled") setNews(results[5].value || []);
      if (results[6].status === "fulfilled")
        setEducationContent(results[6].value || []);
      if (results[7].status === "fulfilled")
        setBlogPosts(results[7].value?.posts || []);

      setLastUpdated(new Date());

      // Show warning if some services failed
      const failedServices = results.filter(
        (r) => r.status === "rejected",
      ).length;
      if (failedServices > 0) {
        console.log(
          `${failedServices} services failed to load, using cached/mock data`,
        );
        toast({
          title: "Partial data loaded",
          description:
            "Some services are unavailable. Using cached data where possible.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Failed to load crypto data:", error);
      toast({
        title: "Loading error",
        description:
          "Some data services are unavailable. The app will use simulated data.",
        variant: "default",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateRealTimeData = async () => {
    try {
      // Simulate price fluctuations for real-time feel
      setCryptos((prevCryptos) =>
        prevCryptos.map((crypto) => {
          // Small random price fluctuations (±0.1%)
          const fluctuation = (Math.random() - 0.5) * 0.002;
          const newPrice = crypto.current_price * (1 + fluctuation);
          return {
            ...crypto,
            current_price: parseFloat(newPrice.toFixed(8)),
            last_updated: new Date().toISOString(),
          };
        }),
      );

      // Update market data occasionally
      if (Math.random() < 0.1) {
        try {
          const newMarketData = await cryptoService.getMarketData();
          setMarketData(newMarketData);
        } catch (error) {
          console.log("Market data API unavailable, keeping cached data");
        }
      }
    } catch (error) {
      console.error("Error in price update system:", error);
    }
  };

  const formatCurrency = (value: number) => {
    if (typeof value !== "number" || isNaN(value)) {
      return "$0.00";
    }

    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(2)}B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: value < 1 ? 6 : 2,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    if (typeof value !== "number" || isNaN(value)) {
      return "0.00%";
    }
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  const safeToFixed = (value: number | undefined, decimals = 2) => {
    if (typeof value !== "number" || isNaN(value)) {
      return "0.00";
    }
    return value.toFixed(decimals);
  };

  const getChangeColor = (value: number) => {
    if (typeof value !== "number" || isNaN(value)) {
      return "text-gray-500";
    }
    return value >= 0 ? "text-green-600" : "text-red-600";
  };

  const handlePlaceOrder = () => {
    toast({
      title: "Order Placed",
      description: `${side.toUpperCase()} order for ${amount} ${selectedPair.replace("USDT", "")} at $${price}`,
    });
    setPrice("");
    setAmount("");
  };

  const currentPair = cryptos.find(
    (c) => c.symbol.toUpperCase() + "USDT" === selectedPair,
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading crypto data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-blue-950/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Enhanced Header */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-xl sm:text-2xl font-bold">
                  Hi, {user?.profile?.full_name || user?.profile?.username || user?.email?.split('@')[0] || 'User'}!
                </h1>
                <p className="text-sm text-muted-foreground">
                  Trade and manage crypto
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-blue-200">
                    Crypto
                  </Badge>
                </div>
                <ApiStatusIndicator showDetails={true} />
                <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-green-700 dark:text-green-300">
                    Live Market
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Tabs Navigation */}
          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg overflow-hidden">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              {/* Mobile Tabs - Horizontal Scroll */}
              <div className="block sm:hidden">
                <div className="flex overflow-x-auto scrollbar-hide px-2">
                  <TabsList className="flex min-w-max bg-transparent p-1 gap-1">
                    <TabsTrigger
                      value="overview"
                      className="flex items-center gap-1 text-xs py-2 px-3 min-w-max rounded-md data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all whitespace-nowrap"
                    >
                      <BarChart3 className="h-3 w-3 flex-shrink-0" />
                      <span>Overview</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="trading"
                      className="flex items-center gap-1 text-xs py-2 px-3 min-w-max rounded-md data-[state=active]:bg-green-500 data-[state=active]:text-white transition-all whitespace-nowrap"
                    >
                      <ArrowUpDown className="h-3 w-3 flex-shrink-0" />
                      <span>Trading</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="p2p"
                      className="flex items-center gap-1 text-xs py-2 px-3 min-w-max rounded-md data-[state=active]:bg-purple-500 data-[state=active]:text-white transition-all whitespace-nowrap"
                    >
                      <Users className="h-3 w-3 flex-shrink-0" />
                      <span>P2P</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="portfolio"
                      className="flex items-center gap-1 text-xs py-2 px-3 min-w-max rounded-md data-[state=active]:bg-orange-500 data-[state=active]:text-white transition-all whitespace-nowrap"
                    >
                      <PieChart className="h-3 w-3 flex-shrink-0" />
                      <span>Portfolio</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="learn"
                      className="flex items-center gap-1 text-xs py-2 px-3 min-w-max rounded-md data-[state=active]:bg-indigo-500 data-[state=active]:text-white transition-all whitespace-nowrap"
                    >
                      <BookOpen className="h-3 w-3 flex-shrink-0" />
                      <span>Learn</span>
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>

              {/* Desktop Tabs - Grid Layout */}
              <div className="hidden sm:block">
                <TabsList className="grid w-full grid-cols-5 bg-gray-100 dark:bg-slate-700 p-1 rounded-lg mx-2 my-2">
                  <TabsTrigger
                    value="overview"
                    className="flex items-center justify-center gap-2 text-sm py-3 px-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                  >
                    <BarChart3 className="h-4 w-4 flex-shrink-0" />
                    <span className="hidden md:inline">Overview</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="trading"
                    className="flex items-center gap-2 text-sm py-3 px-4 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                    <span className="hidden lg:inline">Trading</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="p2p"
                    className="flex items-center gap-2 text-sm py-3 px-4 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                  >
                    <Users className="h-4 w-4" />
                    <span className="hidden lg:inline">P2P</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="portfolio"
                    className="flex items-center gap-2 text-sm py-3 px-4 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                  >
                    <PieChart className="h-4 w-4" />
                    <span className="hidden lg:inline">Portfolio</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="learn"
                    className="flex items-center gap-2 text-sm py-3 px-4 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span className="hidden lg:inline">Learn</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Overview Tab */}
              <TabsContent
                value="overview"
                className="mt-4 sm:mt-6 space-y-4 sm:space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold">
                      Market Overview
                    </h2>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">
                        Real-time market data and analytics
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last updated: {lastUpdated.toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {/* Enhanced Global Market Stats */}
                {marketData && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                    <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-4 sm:p-5">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <p className="text-xs sm:text-sm text-blue-600/80 font-medium">
                              Market Cap
                            </p>
                            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-800 dark:text-blue-200">
                              {formatCurrency(
                                marketData.globalStats?.totalMarketCap || 0,
                              )}
                            </p>
                            <p
                              className={cn(
                                "text-xs sm:text-sm font-semibold",
                                getChangeColor(
                                  marketData.globalStats?.marketCapChange24h ||
                                    0,
                                ),
                              )}
                            >
                              {formatPercentage(
                                marketData.globalStats?.marketCapChange24h || 0,
                              )}
                            </p>
                          </div>
                          <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-4 sm:p-5">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <p className="text-xs sm:text-sm text-green-600/80 font-medium">
                              24h Volume
                            </p>
                            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-800 dark:text-green-200">
                              {formatCurrency(
                                marketData.globalStats?.totalVolume24h || 0,
                              )}
                            </p>
                            <p className="text-xs sm:text-sm font-semibold text-green-600">
                              +2.4%
                            </p>
                          </div>
                          <div className="p-2 bg-green-500/20 rounded-lg">
                            <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-4 sm:p-5">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <p className="text-xs sm:text-sm text-orange-600/80 font-medium">
                              BTC Dominance
                            </p>
                            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-800 dark:text-orange-200">
                              {safeToFixed(
                                marketData.globalStats?.btcDominance,
                                1,
                              )}
                              %
                            </p>
                            <p className="text-xs sm:text-sm text-orange-600/70">
                              ETH{" "}
                              {safeToFixed(
                                marketData.globalStats?.ethDominance,
                                1,
                              )}
                              %
                            </p>
                          </div>
                          <div className="p-2 bg-orange-500/20 rounded-lg">
                            <PieChart className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-4 sm:p-5">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <p className="text-xs sm:text-sm text-purple-600/80 font-medium">
                              Fear & Greed
                            </p>
                            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-800 dark:text-purple-200">
                              {marketData.fearGreedIndex || 65}
                            </p>
                            <p className="text-xs sm:text-sm font-semibold text-yellow-600">
                              Greed
                            </p>
                          </div>
                          <div className="p-2 bg-purple-500/20 rounded-lg">
                            <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Enhanced Top Cryptocurrencies */}
                <Card className="overflow-hidden border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                  <CardHeader className="pb-3 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800 dark:to-slate-700">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                        Top Cryptocurrencies
                      </CardTitle>
                      <Badge variant="outline" className="text-xs">
                        Live Prices
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {cryptos.slice(0, 10).map((crypto, index) => (
                        <div
                          key={crypto.id}
                          onClick={() => {
                            setSelectedCrypto(crypto);
                            setIsCryptoDetailOpen(true);
                          }}
                          className="flex items-center justify-between p-3 sm:p-4 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-200 cursor-pointer group relative"
                        >
                          {/* Rank Badge */}
                          <div className="absolute left-1 top-1 sm:relative sm:left-auto sm:top-auto">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs px-1.5 py-0.5 font-bold",
                                index < 3 &&
                                  "bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0",
                                index >= 3 &&
                                  index < 10 &&
                                  "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
                              )}
                            >
                              #{crypto.market_cap_rank}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 pl-12 sm:pl-0">
                            <div className="relative">
                              <img
                                src={crypto.image}
                                alt={crypto.name}
                                className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full flex-shrink-0 ring-2 ring-white dark:ring-gray-700 shadow-sm group-hover:ring-blue-200 transition-all"
                              />
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 hidden sm:block"></div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-sm sm:text-base lg:text-lg truncate group-hover:text-blue-600 transition-colors">
                                  {crypto.name}
                                </p>
                                <span className="text-xs sm:text-sm text-muted-foreground bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full font-medium flex-shrink-0">
                                  {crypto.symbol.toUpperCase()}
                                </span>
                              </div>
                              <p className="text-xs sm:text-sm text-muted-foreground mt-1 hidden sm:block">
                                Market Cap:{" "}
                                {formatCurrency(crypto.market_cap || 0)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 space-y-1">
                            <p className="font-bold text-sm sm:text-base lg:text-lg">
                              {formatCurrency(crypto.current_price)}
                            </p>
                            <div
                              className={cn(
                                "flex items-center gap-1 justify-end px-2 py-1 rounded-full text-xs sm:text-sm font-semibold",
                                crypto.price_change_percentage_24h >= 0
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
                              )}
                            >
                              {crypto.price_change_percentage_24h >= 0 ? (
                                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              ) : (
                                <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              )}
                              <span>
                                {formatPercentage(
                                  crypto.price_change_percentage_24h,
                                )}
                              </span>
                            </div>
                          </div>

                          {/* Hover Effect Arrow */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                            <ArrowUpDown className="h-4 w-4 text-blue-500" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Market Movers */}
                {marketData && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-green-600 text-base sm:text-lg">
                          <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                          Top Gainers (24h)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 sm:space-y-3">
                          {marketData.topMovers?.gainers?.length > 0 ? (
                            marketData.topMovers.gainers
                              .slice(0, 4)
                              .map((crypto) => (
                                <div
                                  key={crypto.id}
                                  className="flex items-center justify-between"
                                >
                                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                    <img
                                      src={crypto.image}
                                      alt={crypto.name}
                                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex-shrink-0"
                                    />
                                    <span className="font-medium text-sm sm:text-base truncate">
                                      {crypto.symbol?.toUpperCase() || "N/A"}
                                    </span>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <div className="font-semibold text-sm sm:text-base">
                                      {formatCurrency(
                                        crypto.current_price || 0,
                                      )}
                                    </div>
                                    <div className="text-green-600 text-xs sm:text-sm font-medium">
                                      {formatPercentage(
                                        crypto.price_change_percentage_24h || 0,
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))
                          ) : (
                            <div className="text-center text-muted-foreground py-4">
                              <p className="text-sm">
                                No gainers data available
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-red-600 text-base sm:text-lg">
                          <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5" />
                          Top Losers (24h)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 sm:space-y-3">
                          {marketData.topMovers?.losers?.length > 0 ? (
                            marketData.topMovers.losers
                              .slice(0, 4)
                              .map((crypto) => (
                                <div
                                  key={crypto.id}
                                  className="flex items-center justify-between"
                                >
                                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                    <img
                                      src={crypto.image}
                                      alt={crypto.name}
                                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex-shrink-0"
                                    />
                                    <span className="font-medium text-sm sm:text-base truncate">
                                      {crypto.symbol?.toUpperCase() || "N/A"}
                                    </span>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <div className="font-semibold text-sm sm:text-base">
                                      {formatCurrency(
                                        crypto.current_price || 0,
                                      )}
                                    </div>
                                    <div className="text-red-600 text-xs sm:text-sm font-medium">
                                      {formatPercentage(
                                        crypto.price_change_percentage_24h || 0,
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))
                          ) : (
                            <div className="text-center text-muted-foreground py-4">
                              <p className="text-sm">
                                No losers data available
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              {/* Trading Tab */}
              <TabsContent
                value="trading"
                className="mt-4 sm:mt-6 space-y-4 sm:space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold">
                      Trading Dashboard
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Professional trading interface with simulated data
                    </p>
                  </div>
                  {currentPair && (
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Badge
                        variant="outline"
                        className="text-sm sm:text-lg px-2 sm:px-3 py-1"
                      >
                        {currentPair.symbol.toUpperCase()}/USDT
                      </Badge>
                      <div className="text-right">
                        <div className="font-bold text-sm sm:text-base">
                          {formatCurrency(currentPair.current_price)}
                        </div>
                        <div
                          className={cn(
                            "text-xs",
                            getChangeColor(
                              currentPair.price_change_percentage_24h,
                            ),
                          )}
                        >
                          {formatPercentage(
                            currentPair.price_change_percentage_24h,
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Enhanced Trading Interface */}
                <Card className="overflow-hidden border-0 shadow-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800 dark:to-slate-700 border-b">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
                        <div className="p-2 bg-gradient-to-r from-green-500 to-red-500 rounded-lg">
                          <ArrowUpDown className="h-5 w-5 text-white" />
                        </div>
                        Place Order
                      </CardTitle>
                      <Badge variant="outline" className="text-xs">
                        Simulated Trading
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                      {/* Enhanced Buy Panel */}
                      <div className="space-y-4 p-4 sm:p-5 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200/50 dark:border-green-700/30">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-500 rounded-lg">
                            <Plus className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-green-700 dark:text-green-300 text-base sm:text-lg">
                              Buy {selectedPair.replace("USDT", "")}
                            </h3>
                            <p className="text-xs text-green-600/70 dark:text-green-400/70">
                              Long position
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-semibold mb-2 block text-green-700 dark:text-green-300">
                              Order Type
                            </label>
                            <Select
                              value={orderType}
                              onValueChange={setOrderType}
                            >
                              <SelectTrigger className="h-11 bg-white dark:bg-slate-800 border-green-200 dark:border-green-700">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="market">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    Market Order
                                  </div>
                                </SelectItem>
                                <SelectItem value="limit">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                    Limit Order
                                  </div>
                                </SelectItem>
                                <SelectItem value="stop">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    Stop Order
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="text-sm font-semibold mb-2 block text-green-700 dark:text-green-300 flex items-center gap-2">
                              <DollarSign className="w-4 h-4" />
                              Price (USDT)
                            </label>
                            <Input
                              type="number"
                              value={price}
                              onChange={(e) => setPrice(e.target.value)}
                              placeholder={safeToFixed(
                                currentPair?.current_price,
                              )}
                              className="h-11 bg-white dark:bg-slate-800 border-green-200 dark:border-green-700 focus:ring-green-500 focus:border-green-500"
                            />
                          </div>

                          <div>
                            <label className="text-sm font-semibold mb-2 block text-green-700 dark:text-green-300 flex items-center gap-2">
                              <Banknote className="w-4 h-4" />
                              Amount ({selectedPair.replace("USDT", "")})
                            </label>
                            <Input
                              type="number"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              placeholder="0.00"
                              className="h-11 bg-white dark:bg-slate-800 border-green-200 dark:border-green-700 focus:ring-green-500 focus:border-green-500"
                            />
                          </div>

                          <Button
                            className="w-full h-12 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                            onClick={handlePlaceOrder}
                          >
                            <Plus className="w-4 h-4" />
                            Buy {selectedPair.replace("USDT", "")}
                          </Button>
                        </div>
                      </div>

                      {/* Enhanced Sell Panel */}
                      <div className="space-y-4 p-4 sm:p-5 bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/20 rounded-xl border border-red-200/50 dark:border-red-700/30">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-red-500 rounded-lg">
                            <Minus className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-red-700 dark:text-red-300 text-base sm:text-lg">
                              Sell {selectedPair.replace("USDT", "")}
                            </h3>
                            <p className="text-xs text-red-600/70 dark:text-red-400/70">
                              Short position
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-semibold mb-2 block text-red-700 dark:text-red-300">
                              Order Type
                            </label>
                            <Select
                              value={orderType}
                              onValueChange={setOrderType}
                            >
                              <SelectTrigger className="h-11 bg-white dark:bg-slate-800 border-red-200 dark:border-red-700">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="market">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    Market Order
                                  </div>
                                </SelectItem>
                                <SelectItem value="limit">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                    Limit Order
                                  </div>
                                </SelectItem>
                                <SelectItem value="stop">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    Stop Order
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="text-sm font-semibold mb-2 block text-red-700 dark:text-red-300 flex items-center gap-2">
                              <DollarSign className="w-4 h-4" />
                              Price (USDT)
                            </label>
                            <Input
                              type="number"
                              value={price}
                              onChange={(e) => setPrice(e.target.value)}
                              placeholder={safeToFixed(
                                currentPair?.current_price,
                              )}
                              className="h-11 bg-white dark:bg-slate-800 border-red-200 dark:border-red-700 focus:ring-red-500 focus:border-red-500"
                            />
                          </div>

                          <div>
                            <label className="text-sm font-semibold mb-2 block text-red-700 dark:text-red-300 flex items-center gap-2">
                              <Banknote className="w-4 h-4" />
                              Amount ({selectedPair.replace("USDT", "")})
                            </label>
                            <Input
                              type="number"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              placeholder="0.00"
                              className="h-11 bg-white dark:bg-slate-800 border-red-200 dark:border-red-700 focus:ring-red-500 focus:border-red-500"
                            />
                          </div>

                          <Button
                            className="w-full h-12 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                            onClick={handlePlaceOrder}
                          >
                            <Minus className="w-4 h-4" />
                            Sell {selectedPair.replace("USDT", "")}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* P2P Tab */}
              <TabsContent
                value="p2p"
                className="mt-4 sm:mt-6 space-y-4 sm:space-y-6"
              >
                <EnhancedP2PMarketplace />
              </TabsContent>

              {/* Portfolio Tab */}
              <TabsContent
                value="portfolio"
                className="mt-4 sm:mt-6 space-y-4 sm:space-y-6"
              >
                <EnhancedCryptoPortfolio />
              </TabsContent>

              {/* Learn Tab */}
              <TabsContent
                value="learn"
                className="mt-4 sm:mt-6 space-y-4 sm:space-y-6"
              >
                <div>
                  <h2 className="text-lg sm:text-xl font-bold">Learn & News</h2>
                  <p className="text-sm text-muted-foreground">
                    Educational content, blog articles, and latest
                    cryptocurrency news
                  </p>
                </div>

                {/* Enhanced Blog RSS Feed Section */}
                <div className="space-y-6 mb-8">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 sm:p-6 border border-blue-200/50 dark:border-blue-700/50">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="space-y-2">
                        <h3 className="text-lg sm:text-xl font-bold flex items-center gap-3 text-blue-800 dark:text-blue-200">
                          <div className="p-2 bg-blue-500 rounded-lg">
                            <BookOpen className="h-5 w-5 text-white" />
                          </div>
                          Latest from Eloity Blog
                        </h3>
                        <p className="text-sm text-blue-600/80 dark:text-blue-300/80">
                          Stay updated with crypto insights, trading strategies,
                          and market analysis
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white/50 hover:bg-white"
                          asChild
                        >
                          <a
                            href="/api/blog/rss"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-xs sm:text-sm"
                          >
                            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                            RSS Feed
                          </a>
                        </Button>
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                          asChild
                        >
                          <a
                            href="/blog"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                          >
                            View All Articles
                            <ArrowUpDown className="h-3 w-3 rotate-45" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {blogPosts && blogPosts.length > 0 ? (
                      blogPosts.slice(0, 6).map((post, index) => (
                        <Card
                          key={post.id}
                          className="cursor-pointer hover:shadow-xl transition-all duration-300 group border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm overflow-hidden hover:scale-[1.02]"
                          onClick={() =>
                            window.open(`/blog/${post.slug}`, "_blank")
                          }
                        >
                          {post.featuredImage && (
                            <div className="relative h-40 sm:h-48 overflow-hidden">
                              <img
                                src={post.featuredImage}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent group-hover:from-black/40 transition-all duration-300"></div>

                              {/* Article Number Badge */}
                              <div className="absolute top-3 left-3">
                                <Badge className="bg-white/90 text-black font-bold text-xs px-2 py-1">
                                  #{index + 1}
                                </Badge>
                              </div>

                              <div className="absolute top-3 right-3">
                                <Badge
                                  className={cn(
                                    "text-white text-xs font-semibold shadow-lg",
                                    post.category.color,
                                  )}
                                >
                                  {post.category.name}
                                </Badge>
                              </div>

                              {post.difficulty && (
                                <div className="absolute bottom-3 left-3">
                                  <Badge
                                    className={cn(
                                      "text-xs font-semibold shadow-lg border-0",
                                      post.difficulty === "BEGINNER" &&
                                        "bg-green-500 text-white",
                                      post.difficulty === "INTERMEDIATE" &&
                                        "bg-yellow-500 text-white",
                                      post.difficulty === "ADVANCED" &&
                                        "bg-red-500 text-white",
                                    )}
                                  >
                                    {post.difficulty}
                                  </Badge>
                                </div>
                              )}

                              {/* Reading Time Badge */}
                              <div className="absolute bottom-3 right-3">
                                <Badge
                                  variant="secondary"
                                  className="bg-white/90 text-black text-xs"
                                >
                                  <Clock className="w-3 h-3 mr-1" />
                                  {post.readingTime}m
                                </Badge>
                              </div>
                            </div>
                          )}
                          <CardContent className="p-5">
                            <div className="space-y-4">
                              <div className="space-y-3">
                                <h3 className="font-bold text-base sm:text-lg line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
                                  {post.title}
                                </h3>
                                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                                  {post.excerpt}
                                </p>
                              </div>

                              {/* Enhanced Tags */}
                              <div className="flex flex-wrap gap-1.5">
                                {post.tags.slice(0, 2).map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant="outline"
                                    className="text-xs bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                                {post.tags.length > 2 && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-gray-100 dark:bg-gray-700"
                                  >
                                    +{post.tags.length - 2} more
                                  </Badge>
                                )}
                              </div>

                              {/* Enhanced Author and Meta */}
                              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-2">
                                  <div className="relative">
                                    <img
                                      src={post.author.avatar}
                                      alt={post.author.name}
                                      className="w-6 h-6 rounded-full ring-2 ring-gray-100 dark:ring-gray-700"
                                    />
                                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-white dark:border-gray-800"></div>
                                  </div>
                                  <span className="text-sm font-medium truncate text-gray-700 dark:text-gray-300">
                                    {post.author.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Eye className="h-3 w-3" />
                                    <span>{post.views}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Heart className="h-3 w-3" />
                                    <span>{post.likes}</span>
                                  </div>
                                  <span className="hidden sm:inline">
                                    {new Date(
                                      post.publishedAt,
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-full text-center text-muted-foreground py-8">
                        <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p>Loading blog articles...</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* News & Education Section */}
                <div className="space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold">
                    News & Market Updates
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* News Articles */}
                    {news && news.length > 0 ? (
                      news.slice(0, 6).map((article) => (
                        <Card
                          key={article.id}
                          className="cursor-pointer hover:shadow-lg transition-shadow"
                        >
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <Badge variant="outline" className="text-xs">
                                News
                              </Badge>
                              <h3 className="font-semibold text-sm line-clamp-2">
                                {article.title}
                              </h3>
                              <p className="text-xs text-muted-foreground line-clamp-3">
                                {article.summary}
                              </p>
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>{article.source}</span>
                                <span>
                                  {new Date(
                                    article.publishedAt,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-full text-center text-muted-foreground py-8">
                        <p>Loading news articles...</p>
                      </div>
                    )}

                    {/* Education Content */}
                    {educationContent && educationContent.length > 0
                      ? educationContent.slice(0, 3).map((content) => (
                          <Card
                            key={content.id}
                            className="cursor-pointer hover:shadow-lg transition-shadow"
                          >
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <Badge variant="outline" className="text-xs">
                                  Education
                                </Badge>
                                <h3 className="font-semibold text-sm line-clamp-2">
                                  {content.title}
                                </h3>
                                <p className="text-xs text-muted-foreground line-clamp-3">
                                  {content.description}
                                </p>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span>{content.author}</span>
                                  <span>{content.duration} min read</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      : null}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Crypto Detail Modal */}
          <CryptoDetailModal
            crypto={selectedCrypto}
            isOpen={isCryptoDetailOpen}
            onClose={() => {
              setIsCryptoDetailOpen(false);
              setSelectedCrypto(null);
            }}
          />
        </div>
      </div>
    </div>
  );
}
