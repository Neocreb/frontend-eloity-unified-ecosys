// @ts-nocheck
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Coins,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  Zap,
  Target,
  Gift,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Download,
  RefreshCw,
  Plus,
  Wallet,
  Activity,
} from "lucide-react";
import { cryptoService } from "@/services/cryptoService";
import { Portfolio, Transaction, StakingPosition } from "@/types/crypto";
import { cn } from "@/lib/utils";

interface CryptoEarnings {
  totalPortfolioValue: number;
  totalStakingValue: number;
  dailyStakingRewards: number;
  tradingPnL24h: number;
  tradingPnLPercent24h: number;
  topPerformingAsset: string;
  topPerformingAssetGain: number;
  recentTransactions: Transaction[];
  stakingPositions: StakingPosition[];
  portfolioAllocation: Array<{
    asset: string;
    percentage: number;
    value: number;
    change24h: number;
    color: string;
  }>;
}

interface CryptoWalletCardProps {
  className?: string;
}

export default function CryptoWalletCard({ className }: CryptoWalletCardProps) {
  const [earnings, setEarnings] = useState<CryptoEarnings | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCryptoData();
  }, []);

  const loadCryptoData = async () => {
    setIsLoading(true);
    try {
      const [portfolio, stakingPositions, transactions] = await Promise.all([
        cryptoService.getPortfolio(),
        cryptoService.getStakingPositions(),
        cryptoService.getTransactions(10),
      ]);

      if (portfolio) {
        const totalStakingValue = stakingPositions.reduce((sum, pos) => {
          const assetPrice = getAssetPrice(pos.asset);
          return sum + pos.amount * assetPrice;
        }, 0);

        const dailyStakingRewards = stakingPositions.reduce((sum, pos) => {
          const assetPrice = getAssetPrice(pos.asset);
          return sum + pos.dailyReward * assetPrice;
        }, 0);

        const topAsset = portfolio.assets.reduce((top, asset) =>
          asset.changePercent24h > top.changePercent24h ? asset : top,
        );

        setEarnings({
          totalPortfolioValue: portfolio.totalValue,
          totalStakingValue,
          dailyStakingRewards,
          tradingPnL24h: portfolio.totalChange24h,
          tradingPnLPercent24h: portfolio.totalChangePercent24h,
          topPerformingAsset: topAsset.asset,
          topPerformingAssetGain: topAsset.changePercent24h,
          recentTransactions: transactions,
          stakingPositions,
          portfolioAllocation: portfolio.allocation,
        });
      }
    } catch (error) {
      console.error("Failed to load crypto data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAssetPrice = (asset: string) => {
    const prices: Record<string, number> = {
      BTC: 43250.5,
      ETH: 2645.89,
      BNB: 315.8,
      ADA: 0.48,
      SOL: 98.45,
      DOT: 7.45,
      AVAX: 38.92,
      USDT: 1.0,
    };
    return prices[asset] || 1;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  const getChangeColor = (value: number) => {
    return value >= 0 ? "text-green-600" : "text-red-600";
  };

  const getChangeIcon = (value: number) => {
    return value >= 0 ? (
      <TrendingUp className="h-4 w-4" />
    ) : (
      <TrendingDown className="h-4 w-4" />
    );
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "DEPOSIT":
        return <ArrowDownRight className="h-4 w-4 text-green-600" />;
      case "WITHDRAW":
        return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      case "TRADE":
        return <Activity className="h-4 w-4 text-blue-600" />;
      case "STAKING":
        return <Lock className="h-4 w-4 text-purple-600" />;
      case "REWARD":
        return <Gift className="h-4 w-4 text-green-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          <CardTitle>Crypto Portfolio</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!earnings) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Coins className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-white">Crypto Portfolio</CardTitle>
                <p className="text-white/80 text-sm">
                  Start your crypto journey
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Crypto Holdings</h3>
          <p className="text-gray-600 mb-4">
            Start trading to build your crypto portfolio
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Start Trading
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Coins className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-white">Crypto Portfolio</CardTitle>
              <p className="text-white/80 text-sm">Trading & DeFi dashboard</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="text-white hover:bg-white/20"
          >
            {showDetails ? "Hide" : "View"} Details
            <Eye className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Main Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Wallet className="h-4 w-4 text-blue-600" />
              <span className="text-xs text-gray-600">Portfolio</span>
            </div>
            <div className="text-lg font-bold text-blue-600">
              {formatCurrency(earnings.totalPortfolioValue)}
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Lock className="h-4 w-4 text-purple-600" />
              <span className="text-xs text-gray-600">Staking</span>
            </div>
            <div className="text-lg font-bold text-purple-600">
              {formatCurrency(earnings.totalStakingValue)}
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Gift className="h-4 w-4 text-green-600" />
              <span className="text-xs text-gray-600">Daily Rewards</span>
            </div>
            <div className="text-lg font-bold text-green-600">
              {formatCurrency(earnings.dailyStakingRewards)}
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              {getChangeIcon(earnings.tradingPnLPercent24h)}
              <span className="text-xs text-gray-600">24h P&L</span>
            </div>
            <div
              className={cn(
                "text-lg font-bold",
                getChangeColor(earnings.tradingPnLPercent24h),
              )}
            >
              {formatPercentage(earnings.tradingPnLPercent24h)}
            </div>
          </div>
        </div>

        {/* Top Performer Alert */}
        {earnings.topPerformingAssetGain > 5 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                {earnings.topPerformingAsset} is up{" "}
                {formatPercentage(earnings.topPerformingAssetGain)} today!
              </span>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2 mb-6">
          <Button size="sm" className="flex-1">
            <Plus className="h-4 w-4 mr-2" />
            Trade
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Lock className="h-4 w-4 mr-2" />
            Stake
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analyze
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Detailed View */}
        {showDetails && (
          <div className="space-y-6 border-t pt-6">
            {/* Portfolio Allocation */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                Portfolio Allocation
              </h3>
              <div className="space-y-3">
                {earnings.portfolioAllocation.slice(0, 5).map((asset) => (
                  <div
                    key={asset.asset}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: asset.color }}
                      ></div>
                      <span className="font-medium">{asset.asset}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatCurrency(asset.value)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {asset.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Staking Positions */}
            {earnings.stakingPositions.length > 0 && (
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Active Staking
                </h3>
                <div className="space-y-3">
                  {earnings.stakingPositions.slice(0, 3).map((position) => (
                    <div
                      key={position.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <div className="font-medium">
                          {position.asset} Staking
                        </div>
                        <div className="text-sm text-gray-600">
                          {position.amount} {position.asset} •{" "}
                          {position.apy.toFixed(2)}% APY
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">
                          +{position.dailyReward.toFixed(6)}{" "}
                          {position.rewardAsset}
                        </div>
                        <div className="text-xs text-gray-600">daily</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Transactions */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {earnings.recentTransactions.slice(0, 5).map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(tx.type)}
                      <div>
                        <div className="font-medium capitalize">
                          {tx.type.toLowerCase()}
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(tx.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {tx.type === "WITHDRAW" ? "-" : "+"}
                        {tx.amount.toFixed(6)} {tx.asset}
                      </div>
                      <Badge
                        variant={
                          tx.status === "CONFIRMED" ? "default" : "secondary"
                        }
                        className="text-xs"
                      >
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">
                  Portfolio Performance
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Total Value:</span>
                  <span className="font-semibold text-blue-900">
                    {formatCurrency(
                      earnings.totalPortfolioValue + earnings.totalStakingValue,
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">24h Change:</span>
                  <span
                    className={cn(
                      "font-semibold",
                      getChangeColor(earnings.tradingPnLPercent24h),
                    )}
                  >
                    {formatCurrency(earnings.tradingPnL24h)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Best Asset:</span>
                  <span className="font-semibold text-blue-900">
                    {earnings.topPerformingAsset}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Staking APY:</span>
                  <span className="font-semibold text-blue-900">
                    {earnings.stakingPositions.length > 0
                      ? `${(earnings.stakingPositions.reduce((sum, pos) => sum + pos.apy, 0) / earnings.stakingPositions.length).toFixed(2)}%`
                      : "0%"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
