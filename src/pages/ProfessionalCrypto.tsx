import React, { useState, useEffect, useMemo } from "react";
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
import { supabase } from "@/integrations/supabase/client";

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

const SYMBOL_META: Record<string, { symbol: string; name: string; image: string; rank: number }> = {
  bitcoin: { symbol: "BTC", name: "Bitcoin", image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png", rank: 1 },
  ethereum: { symbol: "ETH", name: "Ethereum", image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png", rank: 2 },
  tether: { symbol: "USDT", name: "Tether", image: "https://assets.coingecko.com/coins/images/325/large/Tether.png", rank: 3 },
  solana: { symbol: "SOL", name: "Solana", image: "https://assets.coingecko.com/coins/images/4128/large/solana.png", rank: 4 },
  cardano: { symbol: "ADA", name: "Cardano", image: "https://assets.coingecko.com/coins/images/975/large/cardano.png", rank: 5 },
  chainlink: { symbol: "LINK", name: "Chainlink", image: "https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png", rank: 6 },
  polygon: { symbol: "MATIC", name: "Polygon", image: "https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png", rank: 7 },
  avalanche: { symbol: "AVAX", name: "Avalanche", image: "https://assets.coingecko.com/coins/images/12559/large/coin-round-red.png", rank: 8 },
  polkadot: { symbol: "DOT", name: "Polkadot", image: "https://assets.coingecko.com/coins/images/12171/large/polkadot.png", rank: 9 },
  dogecoin: { symbol: "DOGE", name: "Dogecoin", image: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png", rank: 10 },
};

const TRACKED = Object.keys(SYMBOL_META);

const ProfessionalCrypto = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [cryptos, setCryptos] = useState<Cryptocurrency[]>([]);
  const [marketStats, setMarketStats] = useState<MarketStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [topGainersLosersTab, setTopGainersLosersTab] = useState<"gainers" | "losers">("gainers");

  const [totalBalanceUSD, setTotalBalanceUSD] = useState(0);
  const [totalChangeUSD, setTotalChangeUSD] = useState(0);
  const [totalChangePct, setTotalChangePct] = useState(0);
  const [primaryAsset, setPrimaryAsset] = useState<{ symbol: string; balance: number; value: number }>({ symbol: "USDT", balance: 0, value: 0 });

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1) Fetch live prices from backend (using CryptoAPIs)
      const pricesRes = await fetch(`/api/crypto/prices?symbols=bitcoin,ethereum,tether,binancecoin,solana,cardano,polkadot,avalanche`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Read body once to avoid "body stream already read" errors
      const pricesText = await pricesRes.text();

      if (!pricesRes.ok) {
        console.error(`HTTP error! status: ${pricesRes.status}`, pricesText);
        throw new Error(`HTTP error! status: ${pricesRes.status}`);
      }

      const contentType = pricesRes.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Non-JSON response received:', pricesText.substring(0, 500)); // Limit log size
        throw new Error(`Received non-JSON response from API: ${pricesText.substring(0, 100)}`);
      }

      let pricesPayload;
      try {
        pricesPayload = pricesText ? JSON.parse(pricesText) : null;
      } catch (parseError) {
        console.error('Failed to parse JSON response:', pricesText);
        throw new Error('Failed to parse API response as JSON');
      }
      const prices: Record<string, any> = {};

      // Process backend data into the format expected by the UI
      if (pricesPayload.prices) {
        Object.entries(pricesPayload.prices).forEach(([symbol, data]: [string, any]) => {
          prices[symbol] = {
            usd: parseFloat(data.usd || '0'),
            usd_market_cap: parseFloat(data.usd_market_cap || '0'),
            usd_24h_change: parseFloat(data.usd_24h_change || '0'),
            usd_24h_vol: parseFloat(data.usd_24h_vol || '0')
          };
        });
      }

      // Normalize into UI list with metadata
      const list: Cryptocurrency[] = TRACKED.map((id) => {
        const p = prices[id] || {};
        const meta = SYMBOL_META[id];
        return {
          id,
          name: meta.name,
          symbol: meta.symbol,
          current_price: Number(p.usd) || 0,
          market_cap: Number(p.usd_market_cap) || 0,
          market_cap_rank: meta.rank,
          price_change_percentage_24h: Number(p.usd_24h_change) || 0,
          image: meta.image,
          total_volume: Number(p.usd_24h_vol) || 0,
        };
      }).sort((a, b) => a.market_cap_rank - b.market_cap_rank);
      setCryptos(list);

      // Compute market stats (best-effort from available data)
      const totalMarketCap = list.reduce((s, c) => s + (c.market_cap || 0), 0);
      const totalVolume24h = list.reduce((s, c) => s + (c.total_volume || 0), 0);
      const btc = list.find((c) => c.id === "bitcoin");
      const btcDominance = totalMarketCap > 0 && btc ? (btc.market_cap / totalMarketCap) * 100 : 0;
      setMarketStats({ totalMarketCap, totalVolume24h, bitcoinDominance: btcDominance, activeCoins: list.length });

      // 2) Fetch user crypto holdings from Supabase (per-currency), fallback to unified wallet API
      let perCurrency: { currency: string; balance: number }[] = [];
      try {
        if (!user?.id) throw new Error("No user");
        const { data, error } = await (supabase as any)
          .from("crypto_wallets")
          .select("currency,balance")
          .eq("user_id", user.id);
        if (error) throw error;
        perCurrency = (data || [])
          .filter((r: any) => r.currency && typeof r.balance !== "undefined")
          .map((r: any) => ({ currency: String(r.currency).toUpperCase(), balance: Number(r.balance) || 0 }));
      } catch (_) {
        // Fallback: use aggregated unified wallet balance
        try {
          if (user?.id) {
            const r = await fetch(`/api/wallet/balance?userId=${encodeURIComponent(user.id)}`);
            
            // Check if response is OK and is actually JSON
            if (!r.ok) {
              const errorText = await r.text();
              console.error(`HTTP error! status: ${r.status}`, errorText);
              throw new Error(`HTTP error! status: ${r.status}`);
            }
            
            const contentType = r.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
              const text = await r.text();
              console.error('Non-JSON response received:', text.substring(0, 500)); // Limit log size
              throw new Error(`Received non-JSON response from wallet balance API: ${text.substring(0, 100)}`);
            }

            let j;
            try {
              j = await r.json();
            } catch (parseError) {
              console.error('Failed to parse wallet balance response:', r);
              throw new Error('Failed to parse wallet balance response as JSON');
            }
            const total = Number(j?.data?.balances?.crypto || 0);
            perCurrency = total > 0 ? [{ currency: "USDT", balance: total }] : [];
          }
        } catch (error) {
          console.error("Error fetching wallet balance:", error);
          throw error; // No fallback to mock data
        }
      }

      // 3) Compute totals in USD and primary asset from holdings and prices
      const priceMap = new Map(list.map((c) => [c.symbol.toUpperCase(), c.current_price]));
      let sumUSD = 0;
      let sumUSDPrev = 0;
      let top = { symbol: "USDT", balance: 0, value: 0 };
      for (const h of perCurrency) {
        const sym = h.currency.toUpperCase();
        // Map common synonyms
        const norm = sym === "BTC" || sym === "ETH" || sym === "SOL" || sym === "ADA" || sym === "LINK" || sym === "MATIC" || sym === "AVAX" || sym === "DOT" || sym === "DOGE" || sym === "USDT" ? sym : sym;
        const px = priceMap.get(norm) ?? (norm === "USDT" ? 1 : 0);
        const usd = h.balance * px;
        sumUSD += usd;
        const changePct = list.find((c) => c.symbol.toUpperCase() === norm)?.price_change_percentage_24h || 0;
        const prev = usd / (1 + changePct / 100);
        sumUSDPrev += isFinite(prev) ? prev : usd;
        if (usd > top.value) top = { symbol: norm, balance: h.balance, value: usd };
      }
      setTotalBalanceUSD(sumUSD);
      const delta = sumUSD - sumUSDPrev;
      setTotalChangeUSD(delta);
      setTotalChangePct(sumUSDPrev > 0 ? (delta / sumUSDPrev) * 100 : 0);
      setPrimaryAsset(top);
    } catch (error) {
      console.error("Error loading crypto data:", error);
      toast({
        title: "Error",
        description: "Failed to load cryptocurrency data.",
        variant: "destructive",
      });
      throw error; // No fallback to mock data
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

  const formatPercentage = (value: number) => `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;

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

  const handleDeposit = () => navigate("/app/crypto/deposit");
  const handleWithdraw = () => navigate("/app/crypto/withdraw");

  // Initiate KYC if needed for certain actions. Tries backend, fails gracefully.
  const handleKYCSubmit = async (data: any): Promise<{ success: boolean; error?: any }> => {
    try {
      if (!user?.id) {
        return { success: false, error: 'Not authenticated' };
      }

      const authToken = localStorage.getItem('access_token');
      const res = await fetch('/api/kyc/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({ userId: user.id, ...data }),
      });

      if (res.ok) {
        return { success: true };
      }

      const err = await res.json().catch(() => ({}));
      return { success: false, error: err?.error || res.statusText };
    } catch (e) {
      return { success: false, error: (e as any)?.message || e };
    }
  };

  const topGainers = useMemo(
    () => cryptos.filter(c => c.price_change_percentage_24h > 0).sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h).slice(0, 5),
    [cryptos]
  );
  const topLosers = useMemo(
    () => cryptos.filter(c => c.price_change_percentage_24h < 0).sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h).slice(0, 5),
    [cryptos]
  );

  return (
    <>
      <Helmet>
        <title>Crypto - Professional Trading Platform | Eloity</title>
      </Helmet>

      <div className="min-h-screen bg-platform">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
          <CryptoWalletBalanceCard
            totalBalance={totalBalanceUSD}
            totalBalance24hChange={totalChangeUSD}
            totalBalance24hPercent={totalChangePct}
            primaryAsset={primaryAsset}
            onDeposit={handleDeposit}
            onWithdraw={handleWithdraw}
            className="mb-8"
          />

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

          <div className="space-y-8">
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
                          <p className="text-sm text-muted-foreground">Market Cap: {formatCurrency(crypto.market_cap)}</p>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 space-y-1">
                        <p className="font-bold text-lg">{formatCurrency(crypto.current_price)}</p>
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

          {/* Modals removed - now using full-page routes for crypto operations */}
        </div>
      </div>
    </>
  );
};

export default ProfessionalCrypto;
