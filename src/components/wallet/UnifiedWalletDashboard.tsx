// @ts-nocheck
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { WalletProvider, useWalletContext } from "@/contexts/WalletContext";
import WalletSourceCard from "./WalletSourceCard";
// import WithdrawModal from "./WithdrawModal";
// import DepositModal from "./DepositModal";
import TransactionItem from "./TransactionItem";
import { useToast } from "@/components/ui/use-toast";
import {
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Wallet,
  RefreshCw,
  Eye,
  EyeOff,
  ShoppingCart,
  Bitcoin,
  Gift,
  Briefcase,
} from "lucide-react";

const WalletDashboardContent = () => {
  const navigate = useNavigate();
  const {
    walletBalance,
    transactions: allTransactions,
    isLoading,
    refreshWallet,
    getTransactionsBySource,
    getTotalEarnings,
  } = useWalletContext();

  const [activeTab, setActiveTab] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const { toast } = useToast();

  const walletSources = [
    {
      id: "ecommerce",
      name: "E-Commerce Earnings",
      icon: <ShoppingCart className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-r from-green-500 to-green-600",
      description: "Marketplace sales and commissions",
    },
    {
      id: "crypto",
      name: "Crypto Portfolio",
      icon: <Bitcoin className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-r from-orange-500 to-orange-600",
      description: "Trading profits and investments",
    },
    {
      id: "rewards",
      name: "Rewards System",
      icon: <Gift className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
      description: "Points, bonuses, and achievements",
    },
    {
      id: "freelance",
      name: "Freelance Income",
      icon: <Briefcase className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-r from-indigo-500 to-indigo-600",
      description: "Project payments and milestones",
    },
  ];

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      await refreshWallet();
      toast({
        title: "Updated",
        description: "Wallet data refreshed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh data",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const getTransactionsForSource = (sourceId: string) => {
    if (sourceId === "all") return allTransactions;
    return getTransactionsBySource(sourceId);
  };

  if (isLoading) {
    return (
      <div className="mobile-container mobile-space-y">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 md:h-8 w-32 md:w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-8 md:h-10 w-16 md:w-24" />
            <Skeleton className="h-8 md:h-10 w-16 md:w-24" />
          </div>
        </div>

        {/* Balance Card Skeleton */}
        <Card>
          <CardContent className="p-6 md:p-8">
            <Skeleton className="h-8 md:h-12 w-48 md:w-64 mx-auto mb-4" />
            <Skeleton className="h-4 md:h-6 w-24 md:w-32 mx-auto" />
          </CardContent>
        </Card>

        {/* Tabs Skeleton */}
        <div className="space-y-4">
          <div className="flex gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-8 md:h-10 w-16 md:w-24" />
            ))}
          </div>
          <Skeleton className="h-48 md:h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!walletBalance) return null;

  const earningsGrowth = getTotalEarnings(30);

  return (
    <div className="mobile-container mobile-space-y">
      {/* Header */}
      <div className="mobile-flex sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Unified Wallet
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage all your earnings and funds in one place
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button
            variant="outline"
            onClick={refreshData}
            disabled={isRefreshing}
            className="flex items-center gap-1 md:gap-2 text-xs md:text-sm"
          >
            <RefreshCw
              className={`h-3 w-3 md:h-4 md:w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button
            onClick={() => setShowDepositModal(true)}
            className="bg-green-600 hover:bg-green-700 flex items-center gap-1 md:gap-2 text-xs md:text-sm"
          >
            <ArrowDownLeft className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Deposit</span>
          </Button>
          <Button
            onClick={() => setShowWithdrawModal(true)}
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-1 md:gap-2 text-xs md:text-sm"
          >
            <ArrowUpRight className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Withdraw</span>
          </Button>
        </div>
      </div>

      {/* Total Balance Card */}
      <Card className="overflow-hidden">
        <CardContent className="p-6 md:p-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
              <div className="p-2 md:p-3 bg-white/20 rounded-full flex-shrink-0">
                <Wallet className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base md:text-lg font-medium text-white drop-shadow-sm">
                  Total Balance
                </h2>
                <p className="text-white/90 drop-shadow-sm text-xs md:text-sm">
                  All sources combined
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setBalanceVisible(!balanceVisible)}
              className="text-white hover:bg-white/20 flex-shrink-0"
            >
              {balanceVisible ? (
                <EyeOff className="h-3 w-3 md:h-4 md:w-4" />
              ) : (
                <Eye className="h-3 w-3 md:h-4 md:w-4" />
              )}
            </Button>
          </div>

          <div className="text-center space-y-3 md:space-y-4">
            <div className="text-3xl md:text-5xl font-bold">
              {balanceVisible ? `$${walletBalance.total.toFixed(2)}` : "••••••"}
            </div>
            {earningsGrowth > 0 && (
              <div className="flex items-center justify-center gap-2 text-green-200">
                <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
                <span className="text-xs md:text-sm">
                  +${earningsGrowth.toFixed(2)} earned this month
                </span>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mt-6 md:mt-8">
            {walletSources.map((source) => {
              const balance = walletBalance[
                source.id as keyof WalletBalance
              ] as number;
              return (
                <div key={source.id} className="text-center">
                  <div className="text-lg md:text-2xl mb-1">{source.icon}</div>
                  <div className="text-base md:text-lg font-semibold">
                    {balanceVisible ? `$${balance.toFixed(2)}` : "••••"}
                  </div>
                  <div className="text-xs text-white/90 drop-shadow-sm leading-tight">
                    <span className="sm:hidden">
                      {source.name.split(" ")[0]}
                    </span>
                    <span className="hidden sm:inline">{source.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Interface - Income Source Navigation */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4 md:space-y-6"
      >
        {/* Mobile optimized tab list */}
        <div className="w-full mobile-tabs">
          <div className="border-b border-gray-200">
            <TabsList className="inline-flex h-auto bg-transparent min-w-max p-0 gap-1">
              <TabsTrigger
                value="all"
                className="flex flex-col items-center gap-1 px-3 py-2 text-xs data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent rounded-none"
              >
                <Wallet className="w-4 h-4 text-blue-600" />
                <span className="font-medium">All</span>
              </TabsTrigger>
              {walletSources.map((source) => (
                <TabsTrigger
                  key={source.id}
                  value={source.id}
                  className="flex flex-col items-center gap-1 px-3 py-2 text-xs data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent rounded-none"
                >
                  <div className="w-4 h-4 text-blue-600">
                    {source.id === "ecommerce" && (
                      <ShoppingCart className="w-4 h-4" />
                    )}
                    {source.id === "crypto" && <Bitcoin className="w-4 h-4" />}
                    {source.id === "rewards" && <Gift className="w-4 h-4" />}
                    {source.id === "freelance" && (
                      <Briefcase className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-center leading-tight font-medium">
                    <span className="sm:hidden">
                      {source.name.split(" ")[0]}
                    </span>
                    <span className="hidden sm:inline">{source.name}</span>
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>

        {/* All Transactions Tab */}
        <TabsContent value="all" className="space-y-4 md:space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base md:text-lg">
                <span className="flex items-center gap-2">
                  <span className="text-lg">💰</span>
                  All Transactions
                </span>
                <Badge variant="outline" className="text-xs md:text-sm">
                  {allTransactions.length} transactions
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {allTransactions.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {allTransactions.slice(0, 10).map((transaction) => (
                    <TransactionItem
                      key={transaction.id}
                      transaction={transaction}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-6 md:p-8 text-center text-gray-500">
                  <div className="text-2xl md:text-3xl mb-2">💸</div>
                  <p className="text-sm md:text-base">No transactions yet</p>
                  <p className="text-xs md:text-sm text-gray-400 mt-1">
                    Your transaction history will appear here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Individual Source Tabs */}
        {walletSources.map((source) => {
          const sourceTransactions = getTransactionsForSource(source.id);
          const sourceBalance = walletBalance[
            source.id as keyof WalletBalance
          ] as number;

          return (
            <TabsContent key={source.id} value={source.id}>
              <WalletSourceCard
                title={source.name}
                balance={sourceBalance}
                icon={source.icon}
                color={source.color}
                transactions={sourceTransactions}
                onViewAll={() => {
                  // Could implement a detailed transaction modal here
                  toast({
                    title: "View All Transactions",
                    description: `Showing all ${sourceTransactions.length} transactions for ${source.name}`,
                  });
                }}
              />
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Modals */}
      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        walletBalance={walletBalance}
        onSuccess={refreshData}
      />

      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        onSuccess={refreshData}
      />
    </div>
  );
};

const UnifiedWalletDashboard = () => {
  return (
    <WalletProvider>
      <WalletDashboardContent />
    </WalletProvider>
  );
};

export default UnifiedWalletDashboard;
