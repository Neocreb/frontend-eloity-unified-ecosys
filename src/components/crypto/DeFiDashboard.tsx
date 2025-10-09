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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Coins,
  TrendingUp,
  Lock,
  Unlock,
  Shield,
  AlertTriangle,
  Gift,
  Timer,
  Zap,
  Target,
  DollarSign,
  Percent,
  Clock,
  Calendar,
  BarChart3,
  PieChart,
  Info,
  ExternalLink,
  RefreshCw,
  Plus,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { cryptoService } from "@/services/cryptoService";
import {
  StakingProduct,
  StakingPosition,
  DeFiPosition,
  Portfolio,
} from "@/types/crypto";
import { cn } from "@/lib/utils";

export default function DeFiDashboard() {
  const [activeTab, setActiveTab] = useState("staking");
  const [stakingProducts, setStakingProducts] = useState<StakingProduct[]>([]);
  const [stakingPositions, setStakingPositions] = useState<StakingPosition[]>(
    [],
  );
  const [defiPositions, setDefiPositions] = useState<DeFiPosition[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<StakingProduct | null>(
    null,
  );
  const [stakeAmount, setStakeAmount] = useState("");
  const [showStakeDialog, setShowStakeDialog] = useState(false);
  const [showUnstakeDialog, setShowUnstakeDialog] = useState(false);
  const [selectedPosition, setSelectedPosition] =
    useState<StakingPosition | null>(null);

  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      loadDeFiData();
    }
  }, [user?.id]);

  const loadDeFiData = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const [productsData, positionsData, portfolioData] = await Promise.all([
        cryptoService.getStakingProducts(),
        cryptoService.getStakingPositions(user.id),
        cryptoService.getPortfolio(),
      ]);

      setStakingProducts(productsData);
      setStakingPositions(positionsData);
      setPortfolio(portfolioData);
    } catch (error) {
      console.error("Failed to load DeFi data:", error);
      toast({
        title: "Error",
        description: "Failed to load DeFi data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStake = async () => {
    if (!selectedProduct || !stakeAmount || !user?.id) return;

    try {
      const amount = parseFloat(stakeAmount);
      await cryptoService.stakeAsset(
        user.id,
        selectedProduct.asset,
        amount,
        selectedProduct.id,
      );

      // Reload staking positions after successful stake
      const positionsData = await cryptoService.getStakingPositions(user.id);
      setStakingPositions(positionsData);
      
      setStakeAmount("");
      setShowStakeDialog(false);
      setSelectedProduct(null);

      toast({
        title: "Staking Successful",
        description: `Successfully staked ${amount} ${selectedProduct.asset}`,
      });
    } catch (error) {
      toast({
        title: "Staking Failed",
        description: "Failed to stake assets. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUnstake = async () => {
    if (!selectedPosition) return;

    try {
      // In a real app, call unstake API
      setStakingPositions((prev) =>
        prev.filter((p) => p.id !== selectedPosition.id),
      );
      setShowUnstakeDialog(false);
      setSelectedPosition(null);

      toast({
        title: "Unstaking Successful",
        description: `Successfully unstaked ${selectedPosition.amount} ${selectedPosition.asset}`,
      });
    } catch (error) {
      toast({
        title: "Unstaking Failed",
        description: "Failed to unstake assets. Please try again.",
        variant: "destructive",
      });
    }
  };

  const calculateTotalStakingValue = () => {
    return stakingPositions.reduce((total, position) => {
      const assetPrice = getAssetPrice(position.asset);
      return total + position.amount * assetPrice;
    }, 0);
  };

  const calculateTotalDailyRewards = () => {
    return stakingPositions.reduce(
      (total, position) => total + position.dailyReward,
      0,
    );
  };

  const getAssetPrice = (asset: string) => {
    // Mock prices - in real app, get from portfolio or market data
    const prices: Record<string, number> = {
      ETH: 2645.89,
      BNB: 315.8,
      ADA: 0.48,
      DOT: 7.45,
      AVAX: 38.92,
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
    return `${value.toFixed(2)}%`;
  };

  const getRiskColor = (risks: string[]) => {
    if (risks.some((r) => r.toLowerCase().includes("high")))
      return "text-red-600";
    if (risks.some((r) => r.toLowerCase().includes("medium")))
      return "text-yellow-600";
    return "text-green-600";
  };

  const getDaysRemaining = (endDate?: string) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">DeFi Dashboard</h1>
          <p className="text-gray-600">
            Stake, earn, and participate in decentralized finance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadDeFiData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Lock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Staked</div>
                <div className="text-xl font-bold">
                  {formatCurrency(calculateTotalStakingValue())}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Gift className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Daily Rewards</div>
                <div className="text-xl font-bold">
                  {formatCurrency(
                    calculateTotalDailyRewards() * getAssetPrice("ETH"),
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Active Positions</div>
                <div className="text-xl font-bold">
                  {stakingPositions.length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Percent className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Avg APY</div>
                <div className="text-xl font-bold">
                  {stakingPositions.length > 0
                    ? formatPercentage(
                        stakingPositions.reduce((sum, p) => sum + p.apy, 0) /
                          stakingPositions.length,
                      )
                    : "0.00%"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="staking">Staking</TabsTrigger>
          <TabsTrigger value="positions">My Positions</TabsTrigger>
          <TabsTrigger value="defi">DeFi Protocols</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Staking Products Tab */}
        <TabsContent value="staking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5" />
                Available Staking Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stakingProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="border-2 hover:border-blue-200 transition-colors"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            {product.asset}
                          </div>
                          <div>
                            <div className="font-semibold text-lg">
                              {product.asset} Staking
                            </div>
                            <Badge
                              variant={
                                product.type === "FLEXIBLE"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {product.type}
                            </Badge>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            {formatPercentage(product.apy)}
                          </div>
                          <div className="text-sm text-gray-600">APY</div>
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Min Amount:</span>
                          <span className="font-medium">
                            {product.minAmount} {product.asset}
                          </span>
                        </div>

                        {product.duration && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Duration:</span>
                            <span className="font-medium">
                              {product.duration} days
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total Staked:</span>
                          <span className="font-medium">
                            {formatCurrency(
                              product.totalStaked *
                                getAssetPrice(product.asset),
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="text-sm font-medium">Features:</div>
                        <div className="flex flex-wrap gap-1">
                          {product.features.map((feature, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="text-sm font-medium flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4" />
                          Risks:
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          {product.risks.map((risk, index) => (
                            <div key={index}>• {risk}</div>
                          ))}
                        </div>
                      </div>

                      <Button
                        className="w-full"
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowStakeDialog(true);
                        }}
                        disabled={!product.isActive}
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        Stake Now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Positions Tab */}
        <TabsContent value="positions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                My Staking Positions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stakingPositions.length > 0 ? (
                <div className="space-y-4">
                  {stakingPositions.map((position) => {
                    const daysRemaining = getDaysRemaining(position.endDate);
                    const assetPrice = getAssetPrice(position.asset);
                    const totalValue = position.amount * assetPrice;

                    return (
                      <Card key={position.id} className="border">
                        <CardContent className="p-6">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                {position.asset}
                              </div>

                              <div>
                                <div className="font-semibold text-lg">
                                  {position.amount} {position.asset}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {formatCurrency(totalValue)} •{" "}
                                  {formatPercentage(position.apy)} APY
                                </div>
                                <Badge
                                  variant={
                                    position.status === "ACTIVE"
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="mt-1"
                                >
                                  {position.status}
                                </Badge>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                              <div>
                                <div className="text-sm text-gray-600">
                                  Daily Reward
                                </div>
                                <div className="font-semibold">
                                  {position.dailyReward.toFixed(6)}{" "}
                                  {position.rewardAsset}
                                </div>
                              </div>

                              <div>
                                <div className="text-sm text-gray-600">
                                  Total Rewards
                                </div>
                                <div className="font-semibold text-green-600">
                                  {position.totalRewards.toFixed(6)}{" "}
                                  {position.rewardAsset}
                                </div>
                              </div>

                              <div>
                                <div className="text-sm text-gray-600">
                                  Started
                                </div>
                                <div className="font-semibold">
                                  {new Date(
                                    position.startDate,
                                  ).toLocaleDateString()}
                                </div>
                              </div>

                              <div>
                                <div className="text-sm text-gray-600">
                                  {daysRemaining !== null
                                    ? "Days Left"
                                    : "Duration"}
                                </div>
                                <div className="font-semibold">
                                  {daysRemaining !== null ? (
                                    <span
                                      className={cn(
                                        daysRemaining <= 7
                                          ? "text-orange-600"
                                          : "text-blue-600",
                                      )}
                                    >
                                      {daysRemaining} days
                                    </span>
                                  ) : (
                                    "Flexible"
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              {position.autoRenew && (
                                <Button variant="outline" size="sm">
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Auto-Renew
                                </Button>
                              )}

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      setSelectedPosition(position)
                                    }
                                  >
                                    <Unlock className="h-4 w-4 mr-2" />
                                    Unstake
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Unstake Assets
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to unstake{" "}
                                      {position.amount} {position.asset}?
                                      {daysRemaining && daysRemaining > 0 && (
                                        <span className="block mt-2 text-orange-600">
                                          Warning: Early withdrawal may incur
                                          penalties.
                                        </span>
                                      )}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction onClick={handleUnstake}>
                                      Confirm Unstake
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Staking Positions
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Start staking to earn passive income
                  </p>
                  <Button onClick={() => setActiveTab("staking")}>
                    Explore Staking Products
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* DeFi Protocols Tab */}
        <TabsContent value="defi" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                DeFi Protocols
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Zap className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  DeFi Integration Coming Soon
                </h3>
                <p>Access to lending, borrowing, and yield farming protocols</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Staking Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                  <p>Performance charts coming soon...</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reward History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <PieChart className="h-12 w-12 mx-auto mb-4" />
                  <p>Reward analytics coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Stake Dialog */}
      <Dialog open={showStakeDialog} onOpenChange={setShowStakeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Stake {selectedProduct?.asset}</DialogTitle>
            <DialogDescription>
              Stake your {selectedProduct?.asset} to earn{" "}
              {formatPercentage(selectedProduct?.apy || 0)} APY
            </DialogDescription>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>APY:</span>
                  <span className="font-semibold text-green-600">
                    {formatPercentage(selectedProduct.apy)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Min Amount:</span>
                  <span>
                    {selectedProduct.minAmount} {selectedProduct.asset}
                  </span>
                </div>
                {selectedProduct.duration && (
                  <div className="flex justify-between">
                    <span>Lock Period:</span>
                    <span>{selectedProduct.duration} days</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Reward Asset:</span>
                  <span>{selectedProduct.rewardAsset}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">
                  Amount to Stake ({selectedProduct.asset})
                </label>
                <Input
                  type="number"
                  placeholder={`Min: ${selectedProduct.minAmount}`}
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  min={selectedProduct.minAmount}
                />
              </div>

              {stakeAmount &&
                parseFloat(stakeAmount) >= selectedProduct.minAmount && (
                  <div className="p-4 bg-green-50 rounded-lg space-y-2">
                    <div className="font-medium text-green-800">
                      Estimated Rewards:
                    </div>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Daily:</span>
                        <span>
                          {(
                            (parseFloat(stakeAmount) * selectedProduct.apy) /
                            100 /
                            365
                          ).toFixed(6)}{" "}
                          {selectedProduct.rewardAsset}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Monthly:</span>
                        <span>
                          {(
                            (parseFloat(stakeAmount) * selectedProduct.apy) /
                            100 /
                            12
                          ).toFixed(6)}{" "}
                          {selectedProduct.rewardAsset}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Yearly:</span>
                        <span>
                          {(
                            (parseFloat(stakeAmount) * selectedProduct.apy) /
                            100
                          ).toFixed(6)}{" "}
                          {selectedProduct.rewardAsset}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowStakeDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleStake}
                  disabled={
                    !stakeAmount ||
                    parseFloat(stakeAmount) < selectedProduct.minAmount
                  }
                >
                  Stake {selectedProduct.asset}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
