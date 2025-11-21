import { useMemo, useState } from "react";
import { WalletProvider, useWalletContext } from "@/contexts/WalletContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Eye, EyeOff, ChevronDown, BarChart3, List, PlugZap, Send, Repeat, Plus, MoreHorizontal, Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PaymentCards from "@/components/wallet/PaymentCards";
import RecentTransactions from "@/components/wallet/RecentTransactions";
import SmartRecommendations from "@/components/wallet/SmartRecommendations";
import QuickActionsWidget from "@/components/wallet/QuickActionsWidget";
import GiftsAndTipsWidget from "@/components/wallet/GiftsAndTipsWidget";

const DashboardInner = () => {
  const { walletBalance, refreshWallet } = useWalletContext();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [showBalance, setShowBalance] = useState(true);
  const [portfolio, setPortfolio] = useState<'total'|'ecommerce'|'crypto'|'rewards'|'freelance'>('total');

  const viewBalance = useMemo(()=>{
    if (!walletBalance) return 0;
    return portfolio==='total' ? walletBalance.total : walletBalance[portfolio];
  },[walletBalance, portfolio]);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header gradient card */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <CardContent className="p-6 sm:p-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 text-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-white/90 text-sm">Hi {user?.profile?.full_name || user?.username || 'User'} 👋</div>
              <div className="mt-1 text-xs opacity-90">Total Portfolio</div>
              <div className="mt-1 flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 h-8 px-3">
                      <span className="capitalize">{portfolio === 'total' ? 'Portfolio' : portfolio}</span>
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {(['total','ecommerce','crypto','rewards','freelance'] as const).map(p=> (
                      <DropdownMenuItem key={p} onClick={()=>setPortfolio(p)} className="capitalize">
                        {p === 'total' ? 'Total Portfolio' : p}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 h-8 px-3" onClick={()=>setShowBalance(v=>!v)}>
                  {showBalance ? <Eye className="h-4 w-4"/> : <EyeOff className="h-4 w-4"/>}
                </Button>
              </div>
              <div className="mt-4 text-4xl font-bold tracking-tight">
                {showBalance ? `$${viewBalance.toFixed(2)}` : '•••••••'}
              </div>
              <div className="mt-1 text-sm text-emerald-200">+2.5% from last month</div>
            </div>
            <div className="backdrop-blur-md bg-white/10 rounded-xl px-3 py-2 border border-white/20 shadow-sm">
              <div className="text-xs opacity-90">Balance Source</div>
              <div className="text-sm font-medium capitalize">{portfolio === 'total' ? 'Total' : portfolio}</div>
            </div>
          </div>

          {/* Primary actions */}
          <div className="mt-6 grid grid-cols-2 sm:flex gap-3">
            <Button onClick={()=>navigate('/app/wallet/deposit')} className="bg-white text-indigo-700 hover:bg-white/90">
              <Plus className="h-4 w-4"/>
              Deposit
            </Button>
            <Button variant="outline" onClick={()=>navigate('/app/currency-demo')} className="bg-white/10 text-white border-white/20 hover:bg-white/20">
              <Repeat className="h-4 w-4"/>
              Convert
            </Button>
            <Button variant="outline" onClick={()=>navigate('/app/wallet/transfer')} className="bg-white/10 text-white border-white/20 hover:bg-white/20">
              <Send className="h-4 w-4"/>
              Transfer
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                  <MoreHorizontal className="h-4 w-4"/>
                  More
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={()=>navigate('/app/wallet/analytics')} className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4"/> Analytics
                </DropdownMenuItem>
                <DropdownMenuItem onClick={()=>navigate('/app/wallet/transactions')} className="flex items-center gap-2">
                  <List className="h-4 w-4"/> Transactions
                </DropdownMenuItem>
                <DropdownMenuItem onClick={()=>navigate('/app/wallet/integrations')} className="flex items-center gap-2">
                  <PlugZap className="h-4 w-4"/> Integrations
                </DropdownMenuItem>
                <DropdownMenuItem onClick={()=>navigate('/app/wallet/gift-cards')} className="flex items-center gap-2">
                  <Gift className="h-4 w-4"/> Gift Cards
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Grid and sections */}
      <div className="space-y-6">
        <QuickActionsWidget />
        <RecentTransactions />
        <PaymentCards />
        <SmartRecommendations />
      </div>
    </div>
  );
};

const WalletDashboard = () => (
  <WalletProvider>
    <DashboardInner />
  </WalletProvider>
);

export default WalletDashboard;
