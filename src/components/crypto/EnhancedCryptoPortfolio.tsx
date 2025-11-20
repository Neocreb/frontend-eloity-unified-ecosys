import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  PieChart as PieChartIcon,
  BarChart3,
  Calculator,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  Target,
  DollarSign,
  Percent,
  Calendar,
  FileText,
  Plus,
  Minus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { cryptoNotificationService } from "@/services/cryptoNotificationService";
import { useAuth } from "@/contexts/AuthContext";
import { useWalletContext, WalletProvider } from "@/contexts/WalletContext";
import { cn } from "@/lib/utils";
import useCrypto from "@/hooks/use-crypto";

interface PortfolioAsset {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  value: number;
  avgBuyPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  allocation: number;
  color: string;
  lastUpdated: string;
}

interface PerformanceData {
  date: string;
  totalValue: number;
  btcValue: number;
  ethValue: number;
  altcoinsValue: number;
  pnl: number;
  pnlPercent: number;
}

interface Transaction {
  id: string;
  type: "BUY" | "SELL" | "DEPOSIT" | "WITHDRAW" | "TRANSFER";
  asset: string;
  amount: number;
  price: number;
  value: number;
  fee: number;
  timestamp: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

// Import centralized crypto balance to ensure consistency
import { CENTRALIZED_CRYPTO_BALANCE } from "@/services/cryptoService";

const mockPortfolioAssets: PortfolioAsset[] = [
  {
    id: "bitcoin",
    symbol: "BTC",
    name: "Bitcoin",
    amount: 2.5, // Match cryptoService.ts mockPortfolio
    value: 108126.68, // Match cryptoService.ts mockPortfolio
    avgBuyPrice: 41500,
    currentPrice: 43250.67,
    pnl: 2675.55, // Match cryptoService.ts mockPortfolio
    pnlPercent: 2.54, // Match cryptoService.ts mockPortfolio
    allocation: 86.1, // Match cryptoService.ts mockPortfolio
    color: "#F7931A",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
    amount: 6.8, // Match cryptoService.ts mockPortfolio
    value: 17593.51, // Match cryptoService.ts mockPortfolio
    avgBuyPrice: 2400,
    currentPrice: 2587.34,
    pnl: 361.9, // Match cryptoService.ts mockPortfolio
    pnlPercent: 2.1, // Match cryptoService.ts mockPortfolio
    allocation: 14.0, // Match cryptoService.ts mockPortfolio
    color: "#627EEA",
    lastUpdated: new Date().toISOString(),
  },
];

const mockPerformanceData: PerformanceData[] = Array.from(
  { length: 30 },
  (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const baseValue = 30000 + Math.sin(i / 5) * 2000 + Math.random() * 1000;

    return {
      date: date.toISOString().split("T")[0],
      totalValue: baseValue,
      btcValue: baseValue * 0.65,
      ethValue: baseValue * 0.33,
      altcoinsValue: baseValue * 0.02,
      pnl: baseValue - 30000,
      pnlPercent: ((baseValue - 30000) / 30000) * 100,
    };
  },
);

const mockTransactions: Transaction[] = [
  {
    id: "1",
    type: "BUY",
    asset: "BTC",
    amount: 0.1,
    price: 43250,
    value: 4325,
    fee: 21.63,
    timestamp: "2024-01-15T10:30:00Z",
    status: "COMPLETED",
  },
  {
    id: "2",
    type: "SELL",
    asset: "ETH",
    amount: 0.5,
    price: 2587,
    value: 1293.5,
    fee: 6.47,
    timestamp: "2024-01-14T15:20:00Z",
    status: "COMPLETED",
  },
  {
    id: "3",
    type: "DEPOSIT",
    asset: "USDT",
    amount: 1000,
    price: 1,
    value: 1000,
    fee: 0,
    timestamp: "2024-01-13T09:15:00Z",
    status: "COMPLETED",
  },
];

function EnhancedCryptoPortfolioContent() {
  const crypto = useCrypto();

  const [portfolioAssets, setPortfolioAssets] =
    useState<PortfolioAsset[]>(() => {
        // Initialize from central portfolio if available
      const p = crypto?.portfolio;
      if (p && p.assets) {
        return p.assets.map((a: any) => ({
          id: String(a.asset).toLowerCase(),
          symbol: String(a.asset).toUpperCase(),
          name: String(a.asset).toUpperCase(),
          amount: Number(a.total || a.free || 0),
          value: Number(a.usdValue || a.usd_value || a.usd || 0),
          avgBuyPrice: Number(a.avgBuyPrice || 0),
          currentPrice: Number(a.price || 0),
          pnl: Number((a.usdValue || 0) - ((a.avgBuyPrice || 0) * (a.total || a.free || 0))),
          pnlPercent: 0,
          allocation: Number(a.allocation || 0),
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          lastUpdated: new Date().toISOString(),
        }));
      }

      // If no portfolio available from backend, return empty list (do not use mock data)
      return [];
    });

  const [performanceData, setPerformanceData] =
    useState<PerformanceData[]>(() => {
      // If crypto.marketData exists, create a basic performance array
      if (crypto?.marketData) {
        return mockPerformanceData; // keep mock for now
      }
      return mockPerformanceData;
    });
  const [transactions, setTransactions] =
    useState<Transaction[]>(mockTransactions);
  const [timeframe, setTimeframe] = useState("30D");
  const [activeTab, setActiveTab] = useState("overview");
  const [showValues, setShowValues] = useState(true);
  const [selectedAssetForAction, setSelectedAssetForAction] = useState<string | null>(null);
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { walletBalance, refreshWallet } = useWalletContext();

  const { toast } = useToast();
  const { user } = useAuth();

  // Update when central portfolio changes
  useEffect(() => {
    if (crypto?.portfolio && crypto.portfolio.assets) {
      setPortfolioAssets(
        crypto.portfolio.assets.map((a: any) => ({
          id: String(a.asset).toLowerCase(),
          symbol: String(a.asset).toUpperCase(),
          name: String(a.asset).toUpperCase(),
          amount: Number(a.total || a.free || 0),
          value: Number(a.usdValue || a.usd_value || a.usd || 0),
          avgBuyPrice: Number(a.avgBuyPrice || 0),
          currentPrice: Number(a.price || 0),
          pnl: Number((a.usdValue || 0) - ((a.avgBuyPrice || 0) * (a.total || a.free || 0))),
          pnlPercent: 0,
          allocation: Number(a.allocation || 0),
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          lastUpdated: new Date().toISOString(),
        })),
      );
    }
  }, [crypto?.portfolio]);

  const totalValue = portfolioAssets.reduce(
    (sum, asset) => sum + asset.value,
    0,
  );
  const totalPnl = portfolioAssets.reduce((sum, asset) => sum + asset.pnl, 0);
  const totalPnlPercent = (totalPnl / (totalValue - totalPnl)) * 100;
  const last24hChange = performanceData[performanceData.length - 1]?.pnl || 0;
  const last24hChangePercent =
    performanceData[performanceData.length - 1]?.pnlPercent || 0;

  const refreshPortfolio = async () => {
    setIsRefreshing(true);
    try {
      await refreshWallet();
      // Simulate portfolio refresh
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Portfolio Updated",
        description: "Your portfolio data has been refreshed.",
      });

      // Send unified notification for significant portfolio changes
      if (user?.id && Math.abs(totalPnlPercent) > 5) {
        await cryptoNotificationService.notifyPortfolioUpdate(
          user.id,
          totalPnlPercent,
          totalValue
        );
      }
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh portfolio data.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatCurrency = (value: number, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}%`;
  };

  const formatCrypto = (amount: number, symbol: string) => {
    return `${amount.toFixed(8)} ${symbol}`;
  };

  const getChangeColor = (value: number) => {
    return value >= 0 ? "text-green-600" : "text-red-600";
  };

  const getChangeIcon = (value: number) => {
    return value >= 0 ? TrendingUp : TrendingDown;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Portfolio Dashboard</h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Track your cryptocurrency investments and performance
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={() => setShowValues(!showValues)}
              size="sm"
              className="flex-shrink-0"
            >
              {showValues ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              onClick={refreshPortfolio}
              disabled={isRefreshing}
              size="sm"
              className="flex-shrink-0"
            >
              <RefreshCw
                className={cn("h-4 w-4", isRefreshing && "animate-spin")}
              />
            </Button>
          </div>
        </div>

        {/* Main Action Buttons - Mobile Responsive */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            onClick={() => navigate("/app/crypto/deposit")}
            className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none sm:min-w-[140px]"
            size="default"
          >
            <ArrowDownLeft className="h-4 w-4 mr-2" />
            Deposit Crypto
          </Button>
          <Button
            onClick={() => navigate("/app/crypto/withdraw")}
            variant="outline"
            className="flex-1 sm:flex-none sm:min-w-[140px]"
            size="default"
          >
            <ArrowUpRight className="h-4 w-4 mr-2" />
            Withdraw Crypto
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Portfolio Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Value</p>
                    <p className="text-2xl font-bold">
                      {showValues ? formatCurrency(totalValue) : "••••••"}
                    </p>
                    <div
                      className={cn(
                        "flex items-center gap-1 text-sm",
                        getChangeColor(totalPnlPercent),
                      )}
                    >
                      {React.createElement(getChangeIcon(totalPnlPercent), {
                        className: "h-4 w-4",
                      })}
                      {showValues ? formatPercent(totalPnlPercent) : "••••"}
                    </div>
                  </div>
                  <Wallet className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">24h Change</p>
                    <p className="text-2xl font-bold">
                      {showValues ? formatCurrency(last24hChange) : "••••••"}
                    </p>
                    <div
                      className={cn(
                        "flex items-center gap-1 text-sm",
                        getChangeColor(last24hChangePercent),
                      )}
                    >
                      {React.createElement(
                        getChangeIcon(last24hChangePercent),
                        { className: "h-4 w-4" },
                      )}
                      {showValues
                        ? formatPercent(last24hChangePercent)
                        : "��•••"}
                    </div>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total P&L</p>
                    <p className="text-2xl font-bold">
                      {showValues ? formatCurrency(totalPnl) : "••••••"}
                    </p>
                    <div
                      className={cn(
                        "flex items-center gap-1 text-sm",
                        getChangeColor(totalPnlPercent),
                      )}
                    >
                      {React.createElement(getChangeIcon(totalPnlPercent), {
                        className: "h-4 w-4",
                      })}
                      {showValues ? formatPercent(totalPnlPercent) : "••••"}
                    </div>
                  </div>
                  <Target className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Assets Count</p>
                    <p className="text-2xl font-bold">
                      {portfolioAssets.length}
                    </p>
                    <p className="text-sm text-gray-500">Different tokens</p>
                  </div>
                  <PieChartIcon className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Portfolio Performance Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Portfolio Performance</CardTitle>
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7D">7D</SelectItem>
                    <SelectItem value="30D">30D</SelectItem>
                    <SelectItem value="90D">90D</SelectItem>
                    <SelectItem value="1Y">1Y</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString()
                      }
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: number) => [
                        formatCurrency(value),
                        "Portfolio Value",
                      ]}
                      labelFormatter={(label) =>
                        new Date(label).toLocaleDateString()
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="totalValue"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Asset Allocation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Asset Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={portfolioAssets}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="allocation"
                        label={({ symbol, allocation }) =>
                          `${symbol} ${allocation.toFixed(1)}%`
                        }
                      >
                        {portfolioAssets.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [
                          `${value.toFixed(1)}%`,
                          "Allocation",
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Holdings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {portfolioAssets.slice(0, 5).map((asset) => (
                    <div
                      key={asset.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: asset.color }}
                        />
                        <div>
                          <div className="font-medium">{asset.symbol}</div>
                          <div className="text-sm text-gray-600">
                            {asset.name}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {showValues ? formatCurrency(asset.value) : "••••••"}
                        </div>
                        <div className="text-sm text-gray-600">
                          {asset.allocation.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Assets Tab */}
        <TabsContent value="assets" className="space-y-6">
          {/* Assets Header */}
          <div>
            <h3 className="text-lg font-semibold">Your Crypto Assets</h3>
            <p className="text-sm text-muted-foreground">
              Manage your cryptocurrency holdings and perform quick actions
            </p>
          </div>

          {/* Enhanced Assets Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {portfolioAssets.map((asset) => (
              <Card key={asset.id} className="hover:shadow-lg transition-all duration-200 group">
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4">
                    {/* Asset Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0"
                          style={{ backgroundColor: asset.color }}
                        >
                          {asset.symbol === 'BTC' ? '₿' :
                           asset.symbol === 'ETH' ? 'Ξ' :
                           asset.symbol === 'SOL' ? '◎' :
                           asset.symbol.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-base sm:text-lg truncate">{asset.symbol}</div>
                          <div className="text-xs sm:text-sm text-muted-foreground truncate">
                            {asset.name}
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-semibold",
                          asset.pnl >= 0 ? "text-green-600 border-green-200" : "text-red-600 border-red-200"
                        )}
                      >
                        {formatPercent(asset.pnlPercent)}
                      </Badge>
                    </div>

                    {/* Asset Values */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Holdings</span>
                        <div className="text-right">
                          <div className="font-semibold">
                            {formatCrypto(asset.amount, asset.symbol)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {showValues ? formatCurrency(asset.value) : "••••••"}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Current Price</span>
                        <div className="text-right">
                          <div className="font-medium">
                            {formatCurrency(asset.currentPrice)}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Avg Buy Price</span>
                        <div className="text-right">
                          <div className="font-medium">
                            {formatCurrency(asset.avgBuyPrice)}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">P&L</span>
                        <div className={cn("text-right font-semibold", getChangeColor(asset.pnl))}>
                          <div>{showValues ? formatCurrency(asset.pnl) : "••••••"}</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Portfolio Weight</span>
                          <span className="font-medium">{asset.allocation.toFixed(1)}%</span>
                        </div>
                        <Progress value={asset.allocation} className="h-2" />
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedAssetForAction(asset.symbol);
                          setShowCryptoDepositModal(true);
                        }}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <ArrowDownLeft className="h-3 w-3 mr-1" />
                        Deposit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedAssetForAction(asset.symbol);
                          setShowCryptoWithdrawModal(true);
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        Withdraw
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* P2P Trading Quick Access */}
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold text-purple-800 dark:text-purple-200">
                    Start P2P Trading
                  </h4>
                  <p className="text-sm text-purple-600 dark:text-purple-300">
                    Buy and sell cryptocurrencies directly with other users at competitive rates
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => {
                      // Navigate to P2P tab
                      const event = new CustomEvent('navigate-to-p2p');
                      window.dispatchEvent(event);
                    }}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Start Trading
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600">+24.7%</div>
                <div className="text-sm text-gray-600">30-Day Return</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600">1.85</div>
                <div className="text-sm text-gray-600">Sharpe Ratio</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-red-600">-8.4%</div>
                <div className="text-sm text-gray-600">Max Drawdown</div>
              </CardContent>
            </Card>
          </div>

          {/* P&L Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Profit & Loss Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString()
                      }
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: number) => [
                        formatCurrency(value),
                        "P&L",
                      ]}
                      labelFormatter={(label) =>
                        new Date(label).toLocaleDateString()
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="pnl"
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Asset Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Asset Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={portfolioAssets}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="symbol" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => [
                        `${value.toFixed(2)}%`,
                        "P&L %",
                      ]}
                    />
                    <Bar dataKey="pnlPercent" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Transaction History</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Date</th>
                      <th className="text-left py-2">Type</th>
                      <th className="text-left py-2">Asset</th>
                      <th className="text-right py-2">Amount</th>
                      <th className="text-right py-2">Price</th>
                      <th className="text-right py-2">Value</th>
                      <th className="text-right py-2">Fee</th>
                      <th className="text-center py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-b hover:bg-gray-50">
                        <td className="py-3">
                          {new Date(tx.timestamp).toLocaleDateString()}
                        </td>
                        <td className="py-3">
                          <Badge
                            variant={
                              tx.type === "BUY"
                                ? "default"
                                : tx.type === "SELL"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {tx.type}
                          </Badge>
                        </td>
                        <td className="py-3 font-medium">{tx.asset}</td>
                        <td className="text-right py-3">{tx.amount}</td>
                        <td className="text-right py-3">
                          {formatCurrency(tx.price)}
                        </td>
                        <td className="text-right py-3">
                          {formatCurrency(tx.value)}
                        </td>
                        <td className="text-right py-3">
                          {formatCurrency(tx.fee)}
                        </td>
                        <td className="text-center py-3">
                          <Badge
                            variant={
                              tx.status === "COMPLETED"
                                ? "default"
                                : tx.status === "PENDING"
                                  ? "outline"
                                  : "destructive"
                            }
                          >
                            {tx.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>


      </Tabs>

      {/* Modals removed - now using full-page routes for crypto operations */}
    </div>
  );
}

export default function EnhancedCryptoPortfolio() {
  return (
    <WalletProvider>
      <EnhancedCryptoPortfolioContent />
    </WalletProvider>
  );
}
