import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  ArrowUpDown,
  Users,
  PieChart,
  BookOpen,
  ChevronRight,
  Star,
  Activity,
  Globe,
  Target,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import CryptoWalletBalanceCard from "@/components/crypto/CryptoWalletBalanceCard";
import { cryptoService } from "@/services/cryptoService";
import CryptoDepositModal from "@/components/crypto/CryptoDepositModal";
import CryptoWithdrawModal from "@/components/crypto/CryptoWithdrawModal";

interface Cryptocurrency {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  image: string;
  total_volume: number;
}

interface MarketStats {
  totalMarketCap: number;
  totalVolume24h: number;
  bitcoinDominance: number;
  activeCoins: number;
}

const ProfessionalCrypto = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [cryptos, setCryptos] = useState<Cryptocurrency[]>([]);
  const [marketStats, setMarketStats] = useState<MarketStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [topGainersLosersTab, setTopGainersLosersTab] = useState<"gainers" | "losers">("gainers");
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);

  // Mock portfolio data (in real app, this would come from API)
  const portfolioData = {
    totalBalance: 125670.45, // Match centralized crypto balance
    totalBalance24hChange: 3240.78, // Match centralized data
    totalBalance24hPercent: 2.64, // Match centralized data
    primaryAsset: {
      symbol: "BTC",
      name: "Bitcoin",
      balance: 2.5, // Match centralized data
      value: 108126.68, // Match centralized data
      change24h: 2.54, // Match centralized data
    },
  };

  useEffect(() => {
    loadCryptoData();
  }, []);

  const loadCryptoData = async () => {
    setIsLoading(true);
    try {
      // Simulated API calls
      const mockData: Cryptocurrency[] = [
        {
          id: "bitcoin",
          name: "Bitcoin",
          symbol: "btc",
          current_price: 52835.42,
          market_cap: 1034278909176,
          market_cap_rank: 1,
          total_volume: 25982611987,
          price_change_percentage_24h: 2.34,
          image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
        },
        {
          id: "ethereum",
          name: "Ethereum",
          symbol: "eth",
          current_price: 3145.79,
          market_cap: 377339750529,
          market_cap_rank: 2,
          total_volume: 18245920134,
          price_change_percentage_24h: -1.23,
          image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
        },
        {
          id: "tether",
          name: "Tether",
          symbol: "usdt",
          current_price: 1.0,
          market_cap: 99258852784,
          market_cap_rank: 3,
          total_volume: 47895732908,
          price_change_percentage_24h: 0.02,
          image: "https://assets.coingecko.com/coins/images/325/large/Tether.png",
        },
        {
          id: "solana",
          name: "Solana",
          symbol: "sol",
          current_price: 157.83,
          market_cap: 69573985610,
          market_cap_rank: 4,
          total_volume: 2945801497,
          price_change_percentage_24h: 5.67,
          image: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
        },
        {
          id: "cardano",
          name: "Cardano",
          symbol: "ada",
          current_price: 0.57,
          market_cap: 20187657290,
          market_cap_rank: 5,
          total_volume: 591872345,
          price_change_percentage_24h: -2.15,
          image: "https://assets.coingecko.com/coins/images/975/large/cardano.png",
        },
        {
          id: "chainlink",
          name: "Chainlink",
          symbol: "link",
          current_price: 18.37,
          market_cap: 10754982713,
          market_cap_rank: 6,
          total_volume: 589371285,
          price_change_percentage_24h: 0.87,
          image: "https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png",
        },
        {
          id: "polygon",
          name: "Polygon",
          symbol: "matic",
          current_price: 0.89,
          market_cap: 8234567890,
          market_cap_rank: 7,
          total_volume: 456789123,
          price_change_percentage_24h: 7.25,
          image: "https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png",
        },
        {
          id: "avalanche",
          name: "Avalanche",
          symbol: "avax",
          current_price: 38.92,
          market_cap: 15123456789,
          market_cap_rank: 8,
          total_volume: 789456123,
          price_change_percentage_24h: -3.45,
          image: "https://assets.coingecko.com/coins/images/12559/large/coin-round-red.png",
        },
        {
          id: "polkadot",
          name: "Polkadot",
          symbol: "dot",
          current_price: 7.92,
          market_cap: 10982365923,
          market_cap_rank: 9,
          total_volume: 343298712,
          price_change_percentage_24h: -3.78,
          image: "https://assets.coingecko.com/coins/images/12171/large/polkadot.png",
        },
        {
          id: "dogecoin",
          name: "Dogecoin",
          symbol: "doge",
          current_price: 0.17,
          market_cap: 24753982341,
          market_cap_rank: 10,
          total_volume: 1389752043,
          price_change_percentage_24h: 3.42,
          image: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png",
        },
      ];

      setCryptos(mockData);
      setMarketStats({
        totalMarketCap: 2500000000000,
        totalVolume24h: 95000000000,
        bitcoinDominance: 42.5,
        activeCoins: 13500,
      });
    } catch (error) {
      console.error("Error loading crypto data:", error);
      toast({
        title: "Error",
        description: "Failed to load cryptocurrency data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
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
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  const getChangeColor = (value: number) => {
    return value >= 0 ? "text-green-600" : "text-red-600";
  };

  const handleNavigateToTrade = (cryptoId: string) => {
    navigate(`/app/crypto-trading?pair=${cryptoId.toUpperCase()}USDT`);
  };

  const handleQuickNavigation = (section: string) => {
    switch (section) {
      case "trading":
        navigate("/app/crypto-trading");
        break;
      case "p2p":
        navigate("/app/crypto-p2p");
        break;
      case "portfolio":
        navigate("/app/crypto-portfolio");
        break;
      case "learn":
        navigate("/app/crypto-learn");
        break;
      case "defi":
        navigate("/app/defi");
        break;
      default:
        break;
    }
  };

  const handleDeposit = () => {
    setDepositModalOpen(true);
  };

  const handleWithdraw = () => {
    setWithdrawModalOpen(true);
  };

  const handleKYCSubmit = async (data: any) => {
    try {
      // Simulate API call
      console.log("KYC data submitted:", data);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({
        title: "KYC Submitted",
        description: "Your verification documents have been submitted for review.",
      });

      return { success: true };
    } catch (error) {
      console.error("Error submitting KYC:", error);
      toast({
        title: "Error",
        description: "Failed to submit verification documents. Please try again.",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const topGainers = cryptos.filter(c => c.price_change_percentage_24h > 0).sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h).slice(0, 5);
  const topLosers = cryptos.filter(c => c.price_change_percentage_24h < 0).sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h).slice(0, 5);

  return (
    <>
      <Helmet>
        <title>Crypto - Professional Trading Platform | Eloity</title>
      </Helmet>

      <div className="min-h-screen bg-platform">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
          
          {/* Portfolio Balance Card */}
          <CryptoWalletBalanceCard
            totalBalance={portfolioData.totalBalance}
            totalBalance24hChange={portfolioData.totalBalance24hChange}
            totalBalance24hPercent={portfolioData.totalBalance24hPercent}
            primaryAsset={portfolioData.primaryAsset}
            onDeposit={handleDeposit}
            onWithdraw={handleWithdraw}
            className="mb-8"
          />

          {/* Quick Navigation Links */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { label: "Trade", icon: ArrowUpDown, color: "from-green-500 to-emerald-600", description: "Spot & Futures Trading", section: "trading" },
              { label: "P2P", icon: Users, color: "from-blue-500 to-cyan-600", description: "Peer-to-Peer Trading", section: "p2p" },
              { label: "Portfolio", icon: PieChart, color: "from-purple-500 to-violet-600", description: "Asset Management", section: "portfolio" },
              { label: "Learn", icon: BookOpen, color: "from-orange-500 to-red-600", description: "Education Center", section: "learn" },
              { label: "DeFi", icon: Target, color: "from-teal-500 to-cyan-600", description: "Yield & Lending Hub", section: "defi" },
            ].map((item, index) => (
              <Card
                key={index}
                className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 group content-card hover:shadow-blue-500/25"
                onClick={() => handleQuickNavigation(item.section)}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-r ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{item.label}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <ChevronRight className="h-4 w-4 mx-auto mt-2 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Market Overview Content */}
          <div className="space-y-8">
              {/* Market Stats */}
              {marketStats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="content-card">
                    <CardContent className="p-6 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Globe className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-muted-foreground">Market Cap</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">{formatCurrency(marketStats.totalMarketCap)}</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="content-card">
                    <CardContent className="p-6 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <BarChart3 className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-muted-foreground">24h Volume</span>
                      </div>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(marketStats.totalVolume24h)}</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="content-card">
                    <CardContent className="p-6 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Target className="h-5 w-5 text-orange-600 mr-2" />
                        <span className="text-sm font-medium text-muted-foreground">BTC Dominance</span>
                      </div>
                      <p className="text-2xl font-bold text-orange-600">{marketStats.bitcoinDominance.toFixed(1)}%</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="content-card">
                    <CardContent className="p-6 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Activity className="h-5 w-5 text-purple-600 mr-2" />
                        <span className="text-sm font-medium text-muted-foreground">Active Coins</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-600">{marketStats.activeCoins.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Top Cryptocurrencies */}
              <Card className="content-card shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Top Cryptocurrencies
                    <Badge variant="outline" className="ml-auto">Live Prices</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {cryptos.slice(0, 10).map((crypto, index) => (
                      <div
                        key={crypto.id}
                        onClick={() => handleNavigateToTrade(crypto.id)}
                        className="flex items-center justify-between p-4 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-200 cursor-pointer group"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="relative">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs px-1.5 py-0.5 font-bold absolute -top-2 -left-2 z-10",
                                index < 3 && "bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0"
                              )}
                            >
                              #{crypto.market_cap_rank}
                            </Badge>
                            <img
                              src={crypto.image}
                              alt={crypto.name}
                              className="w-10 h-10 rounded-full ring-2 ring-white dark:ring-gray-700 shadow-sm group-hover:ring-blue-200 transition-all"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-base truncate group-hover:text-blue-600 transition-colors">
                                {crypto.name}
                              </p>
                              <span className="text-sm text-muted-foreground bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full font-medium">
                                {crypto.symbol.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Market Cap: {formatCurrency(crypto.market_cap)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right flex-shrink-0 space-y-1">
                          <p className="font-bold text-lg">
                            {formatCurrency(crypto.current_price)}
                          </p>
                          <div
                            className={cn(
                              "flex items-center gap-1 justify-end px-2 py-1 rounded-full text-sm font-semibold",
                              crypto.price_change_percentage_24h >= 0
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                            )}
                          >
                            {crypto.price_change_percentage_24h >= 0 ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                            <span>{formatPercentage(crypto.price_change_percentage_24h)}</span>
                          </div>
                        </div>
                        
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-blue-500 transition-colors ml-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Gainers and Top Losers */}
              <Card className="content-card shadow-xl">
                <CardHeader className="pb-4">
                  <Tabs value={topGainersLosersTab} onValueChange={(value) => setTopGainersLosersTab(value as "gainers" | "losers")}>
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                      <TabsTrigger value="gainers" className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        Top Gainers
                      </TabsTrigger>
                      <TabsTrigger value="losers" className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-red-600" />
                        Top Losers
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="gainers" className="mt-6">
                      <div className="space-y-3">
                        {topGainers.map((crypto) => (
                          <div
                            key={crypto.id}
                            onClick={() => handleNavigateToTrade(crypto.id)}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors cursor-pointer group"
                          >
                            <div className="flex items-center gap-3">
                              <img src={crypto.image} alt={crypto.name} className="w-8 h-8 rounded-full" />
                              <div>
                                <p className="font-medium group-hover:text-green-600 transition-colors">{crypto.name}</p>
                                <p className="text-sm text-muted-foreground">{crypto.symbol.toUpperCase()}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatCurrency(crypto.current_price)}</p>
                              <p className="text-green-600 font-medium text-sm">{formatPercentage(crypto.price_change_percentage_24h)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="losers" className="mt-6">
                      <div className="space-y-3">
                        {topLosers.map((crypto) => (
                          <div
                            key={crypto.id}
                            onClick={() => handleNavigateToTrade(crypto.id)}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer group"
                          >
                            <div className="flex items-center gap-3">
                              <img src={crypto.image} alt={crypto.name} className="w-8 h-8 rounded-full" />
                              <div>
                                <p className="font-medium group-hover:text-red-600 transition-colors">{crypto.name}</p>
                                <p className="text-sm text-muted-foreground">{crypto.symbol.toUpperCase()}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatCurrency(crypto.current_price)}</p>
                              <p className="text-red-600 font-medium text-sm">{formatPercentage(crypto.price_change_percentage_24h)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardHeader>
              </Card>
          </div>

          {/* Deposit and Withdraw Modals */}
          <CryptoDepositModal
            isOpen={depositModalOpen}
            onClose={() => setDepositModalOpen(false)}
            onKYCSubmit={handleKYCSubmit}
          />
          
          <CryptoWithdrawModal
            isOpen={withdrawModalOpen}
            onClose={() => setWithdrawModalOpen(false)}
            onKYCSubmit={handleKYCSubmit}
          />
        </div>
      </div>
    </>
  );
};

export default ProfessionalCrypto;
