import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WalletProvider, useWalletContext } from "@/contexts/WalletContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  Wallet,
  BarChart3,
  Settings,
  Receipt,
  TrendingUp,
  Eye,
  EyeOff,
  MoreHorizontal,
  Plus,
  Repeat,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

import QuickActionsWidget from "./QuickActionsWidget";
import AdvancedTransactionManager from "./AdvancedTransactionManager";
import WalletAnalyticsDashboard from "./WalletAnalyticsDashboard";
import IntegrationManager from "./IntegrationManager";
import WithdrawModal from "./WithdrawModal";
import DepositModal from "./DepositModal";
import { TransferModal } from "./QuickActionModals";

const EnhancedWalletDashboardContent = () => {
  const { walletBalance, transactions, isLoading, refreshWallet } = useWalletContext();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [selectedView, setSelectedView] = useState<"total" | "ecommerce" | "crypto" | "rewards" | "freelance">("total");

  const balanceOptions = [
    { value: "total", label: "Total Portfolio" },
    { value: "ecommerce", label: "E-commerce" },
    { value: "crypto", label: "Crypto" },
    { value: "rewards", label: "Rewards" },
    { value: "freelance", label: "Freelance" },
  ] as const;

  const displayedBalance = useMemo(() => {
    if (!walletBalance) return 0;
    return walletBalance[selectedView] ?? 0;
  }, [walletBalance, selectedView]);

  if (isLoading) {
    return (
      <div className="mobile-container mobile-space-y">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container mobile-space-y bg-platform min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
            Hi {user?.profile?.full_name || user?.profile?.username || user?.email?.split("@")[0] || "User"}
          </h1>
        </div>
        <div className="flex-shrink-0">
          <Badge variant="outline" className="text-xs whitespace-nowrap">
            <Wallet className="h-3 w-3 mr-1" /> Wallet
          </Badge>
        </div>
      </div>

      {/* Balance Card */}
      <Card className="overflow-hidden">
        <CardContent className="p-6 md:p-8 bg-gradient-to-br from-purple-600 to-indigo-600 text-white">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="text-sm text-white/90">Total Balance</div>
              <div className="flex items-center gap-3">
                <div className="text-4xl md:text-5xl font-bold">
                  {balanceVisible ? `$${displayedBalance.toFixed(2)}` : "��•••••"}
                </div>
                <button
                  aria-label="Toggle balance visibility"
                  className="p-2 rounded-lg/5 hover:bg-white/10"
                  onClick={() => setBalanceVisible((v) => !v)}
                >
                  {balanceVisible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                </button>
              </div>
              <div className="text-xs flex items-center gap-1 text-emerald-200">
                <TrendingUp className="h-4 w-4" />
                <span>+2.5% from last month</span>
              </div>
            </div>
            <div className="w-40">
              <Select value={selectedView} onValueChange={(v) => setSelectedView(v as any)}>
                <SelectTrigger className="bg-white/10 text-white border-white/20">
                  <SelectValue placeholder="Total Portfolio" />
                </SelectTrigger>
                <SelectContent>
                  {balanceOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Primary Actions */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button onClick={() => setShowDepositModal(true)} className="bg-white/10 hover:bg-white/20 text-white h-16">
              <Plus className="h-4 w-4 mr-2" /> Add Money
            </Button>
            <Button onClick={() => navigate("/app/wallet/convert")} className="bg-white/10 hover:bg-white/20 text-white h-16">
              <Repeat className="h-4 w-4 mr-2" /> Convert
            </Button>
            <Button onClick={() => setShowTransferModal(true)} className="bg-white/10 hover:bg-white/20 text-white h-16">
              <Repeat className="h-4 w-4 mr-2" /> Transfer
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-white/10 hover:bg-white/20 text-white h-16">
                  <MoreHorizontal className="h-4 w-4 mr-2" /> More
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate("/app/wallet/analytics")}> <BarChart3 className="h-4 w-4 mr-2" /> Analytics</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/app/wallet/transactions")}> <Receipt className="h-4 w-4 mr-2" /> Transactions</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/app/wallet/integrations")}> <Settings className="h-4 w-4 mr-2" /> Integrations</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Hidden withdraw trigger for QuickActions compatibility */}
      <button data-action="withdraw" onClick={() => setShowWithdrawModal(true)} className="hidden" aria-hidden="true" />

      {/* Quick Actions */}
      <QuickActionsWidget />

      {/* My Cards - coming soon */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>My Cards</CardTitle>
          <Badge variant="secondary">Coming soon</Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-xl p-5 text-white bg-gradient-to-r from-indigo-500 to-purple-500">
            <div className="text-sm opacity-90">Visa Debit •••• 4532</div>
            <div className="text-right text-lg">$2,450.00</div>
          </div>
          <div className="rounded-xl p-5 text-white bg-gradient-to-r from-slate-700 to-slate-900">
            <div className="text-sm opacity-90">Mastercard •••• 8901</div>
            <div className="text-right text-lg">$550.00</div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions preview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Transactions</CardTitle>
          <Button variant="ghost" className="h-8 px-2" onClick={() => navigate("/app/wallet/transactions")}>See All</Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {transactions.slice(0, 3).map((t) => (
            <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <div className="font-medium text-sm">{t.description}</div>
                <div className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(t.timestamp), { addSuffix: true })}</div>
              </div>
              <div className={t.amount >= 0 ? "text-emerald-600 font-semibold" : "text-red-600 font-semibold"}>
                {t.amount >= 0 ? "+" : "-"}${Math.abs(t.amount).toFixed(2)}
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="text-sm text-muted-foreground">No recent transactions</div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        walletBalance={walletBalance}
        onSuccess={refreshWallet}
      />
      <DepositModal isOpen={showDepositModal} onClose={() => setShowDepositModal(false)} onSuccess={refreshWallet} />
      <TransferModal isOpen={showTransferModal} onClose={() => setShowTransferModal(false)} />
    </div>
  );
};

const EnhancedUnifiedWalletDashboard = () => {
  return (
    <WalletProvider>
      <EnhancedWalletDashboardContent />
    </WalletProvider>
  );
};

export default EnhancedUnifiedWalletDashboard;
