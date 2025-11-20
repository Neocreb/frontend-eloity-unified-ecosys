import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { WalletProvider, useWalletContext } from "@/contexts/WalletContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  Wallet,
  BarChart3,
  Search,
  Shield,
  Zap,
  Settings,
  Receipt,
  TrendingUp,
  ArrowUpDown,
} from "lucide-react";

// Import all the new components
import WalletAnalyticsDashboard from "./WalletAnalyticsDashboard";
import AdvancedTransactionManager from "./AdvancedTransactionManager";
import WalletSecurityCenter from "./WalletSecurityCenter";
import QuickActionsWidget from "./QuickActionsWidget";
import IntegrationManager from "./IntegrationManager";

// Original components - Keep for now in case needed elsewhere
// import WithdrawModal from "./WithdrawModal";
// import DepositModal from "./DepositModal";

// Currency components
import CurrencyDemo from "@/components/currency/CurrencyDemo";

const EnhancedWalletDashboardContent = () => {
  const navigate = useNavigate();
  const {
    walletBalance,
    isLoading,
    refreshWallet,
  } = useWalletContext();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("overview");

  // Simple balance calculation
  const totalBalance = walletBalance?.total || 0;

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
            Hi, {user?.profile?.full_name || user?.profile?.username || user?.email?.split('@')[0] || 'User'}!
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your finances</p>
        </div>
        <div className="flex-shrink-0">
          <Badge variant="outline" className="text-xs whitespace-nowrap">
            <Wallet className="h-3 w-3 mr-1" />
            Wallet
          </Badge>
        </div>
      </div>

      {/* Main Balance Card - Fixed CSS for visibility */}
      <Card className="overflow-hidden card-enhanced">
        <CardContent className="p-6 md:p-8 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
          <div className="text-center space-y-4">
            <div>
              <h2 className="text-lg font-medium text-white drop-shadow-sm">
                Total Balance
              </h2>
              <div className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
                ${totalBalance.toFixed(2)}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              {[
                { name: "E-commerce", value: walletBalance?.ecommerce || 0 },
                { name: "Crypto", value: walletBalance?.crypto || 0 },
                { name: "Rewards", value: walletBalance?.rewards || 0 },
                { name: "Freelance", value: walletBalance?.freelance || 0 },
              ].map((source) => (
                <div key={source.name} className="text-center">
                  <div className="text-lg md:text-xl font-semibold text-white drop-shadow-sm">
                    ${source.value.toFixed(2)}
                  </div>
                  <div className="text-xs text-white/90 drop-shadow-sm">
                    {source.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Primary Action Buttons */}
      <div className="flex gap-3 justify-center sm:justify-start">
        <Button
          onClick={() => navigate("/app/wallet/deposit")}
          className="bg-blue-600 hover:bg-blue-700 text-white flex-1 sm:flex-none sm:min-w-[120px]"
          size="lg"
        >
          Deposit
        </Button>
        <Button
          onClick={() => navigate("/app/wallet/withdraw")}
          variant="outline"
          className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white flex-1 sm:flex-none sm:min-w-[120px]"
          size="lg"
        >
          Withdraw
        </Button>
      </div>


      {/* Main Tabbed Interface */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        {/* Responsive Tab Navigation */}
        <div className="w-full">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto scrollbar-hide" aria-label="Tabs">
              {[
                { id: "overview", label: "Overview", icon: Wallet, description: "Wallet summary" },
                { id: "analytics", label: "Analytics", icon: BarChart3, description: "Performance insights" },
                { id: "transactions", label: "Transactions", icon: Search, description: "Transaction history & receipts" },
                { id: "currency", label: "Currency", icon: ArrowUpDown, description: "Real-time currency conversion" },
                { id: "security", label: "Security", icon: Shield, description: "Security settings" },
                { id: "integrations", label: "Integrations", icon: Settings, description: "Bank & bill management" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex flex-col items-center gap-1 min-w-20
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                  aria-current={activeTab === tab.id ? 'page' : undefined}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab - Enhanced with unified layout */}
        <TabsContent value="overview" className="space-y-6">
          {/* Quick Actions Section */}
          <QuickActionsWidget />
        </TabsContent>

        {/* Analytics Tab - Enhanced with Performance Metrics */}
        <TabsContent value="analytics" className="space-y-6">
          <WalletAnalyticsDashboard />
        </TabsContent>

        {/* Advanced Transactions Tab - Now includes receipt generation */}
        <TabsContent value="transactions" className="space-y-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-foreground">Transaction Management</h2>
            <p className="text-muted-foreground">View, filter, and generate secure receipts for your transactions</p>
          </div>
          <AdvancedTransactionManager />
        </TabsContent>

        {/* Currency Conversion Tab */}
        <TabsContent value="currency" className="space-y-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-foreground">Currency Conversion</h2>
            <p className="text-muted-foreground">Real-time currency rates and conversion tools for all your financial needs</p>
          </div>
          <CurrencyDemo />
        </TabsContent>

        {/* Security Center Tab */}
        <TabsContent value="security" className="space-y-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-foreground">Security Center</h2>
            <p className="text-muted-foreground">Manage your account security and verification settings</p>
          </div>
          <WalletSecurityCenter />
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-foreground">Financial Integrations</h2>
            <p className="text-muted-foreground">Connect banks, manage bills, and track subscriptions</p>
          </div>
          <IntegrationManager />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        walletBalance={walletBalance}
        onSuccess={refreshWallet}
      />

      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        onSuccess={refreshWallet}
      />
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
