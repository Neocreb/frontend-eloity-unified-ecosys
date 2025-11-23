import { useMemo, useState, useEffect } from "react";
import { WalletProvider, useWalletContext } from "@/contexts/WalletContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Eye, EyeOff, ChevronDown, BarChart3, List, PlugZap, Send, Repeat, Plus, MoreHorizontal, Gift, Plane, ArrowDown, ArrowUp, Wallet, Phone, CreditCard, Home, Clock, Star, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdCarousel, { Ad } from "@/components/wallet/AdCarousel";
import WalletServicesGrid from "@/components/wallet/WalletServicesGrid";
import SmartRecommendations from "@/components/wallet/SmartRecommendations";

const AnimatedWave = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg viewBox="0 0 1200 400" className="w-full h-full opacity-30" style={{ animation: 'wave 15s ease-in-out infinite' }} preserveAspectRatio="none">
        <path
          d="M 0 200 Q 300 100, 600 200 T 1200 200 L 1200 0 L 0 0 Z"
          fill="white"
          opacity="0.3"
        />
        <path
          d="M 0 220 Q 300 120, 600 220 T 1200 220 L 1200 400 L 0 400 Z"
          fill="white"
          opacity="0.1"
        />
      </svg>
      <style>{`
        @keyframes wave {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(50px);
          }
        }
        
        @keyframes slideUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

interface Recipient {
  id: string;
  initials: string;
  name: string;
  lastAmount: number;
  timesUsed: number;
}

const DashboardInner = () => {
  const { walletBalance, refreshWallet, transactions } = useWalletContext();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [showBalance, setShowBalance] = useState(true);
  const [portfolio, setPortfolio] = useState<'total'|'ecommerce'|'crypto'|'rewards'|'freelance'>('total');
  const [ads, setAds] = useState<Ad[]>([]);

  useEffect(() => {
    // Load ads from localStorage or API
    const savedAds = localStorage.getItem('walletAds');
    if (savedAds) {
      setAds(JSON.parse(savedAds));
    }
  }, []);

  // Extract frequent recipients from transactions
  const recipients = useMemo(() => {
    try {
      if (!transactions || transactions.length === 0) {
        return [];
      }

      // Filter for transfer/send type transactions
      const sendTransactions = transactions.filter(tx =>
        tx.type?.toLowerCase().includes('transfer') ||
        tx.type?.toLowerCase().includes('send') ||
        tx.description?.toLowerCase().includes('send') ||
        tx.description?.toLowerCase().includes('transfer')
      );

      if (sendTransactions.length === 0) {
        return [];
      }

      // Group transactions by recipient
      const recipientMap = new Map<string, {
        name: string;
        initials: string;
        amounts: number[];
        timestamps: Date[];
      }>();

      sendTransactions.forEach(tx => {
        // Try to extract recipient name from description
        const descParts = tx.description?.split('-') || [];
        let recipientName = 'Unknown';

        if (descParts.length > 1) {
          recipientName = descParts.slice(1).join('-').trim();
        }

        if (!recipientName || recipientName === 'Unknown') {
          recipientName = tx.description?.split('to ')?.pop() || 'Unknown';
        }

        const key = recipientName.toLowerCase();
        const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;

        if (!recipientMap.has(key)) {
          const initials = recipientName
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'U';

          recipientMap.set(key, {
            name: recipientName,
            initials: initials,
            amounts: [amount],
            timestamps: [new Date(tx.timestamp || tx.createdAt || '')],
          });
        } else {
          const existing = recipientMap.get(key)!;
          existing.amounts.push(amount);
          existing.timestamps.push(new Date(tx.timestamp || tx.createdAt || ''));
        }
      });

      // Convert map to array and sort by frequency and recency
      const recipientList = Array.from(recipientMap.entries()).map(([_, data]) => ({
        id: data.name.toLowerCase().replace(/\s+/g, '-'),
        initials: data.initials,
        name: data.name,
        lastAmount: data.amounts[0] || 0,
        timesUsed: data.amounts.length,
      }));

      // Sort by frequency (descending) then by most recent
      recipientList.sort((a, b) => b.timesUsed - a.timesUsed);

      return recipientList.slice(0, 5);
    } catch (error) {
      console.error('Error processing recipients:', error);
      return [];
    }
  }, [transactions]);

  const viewBalance = useMemo(()=>{
    if (!walletBalance) return 0;
    return portfolio==='total' ? walletBalance.total : walletBalance[portfolio];
  },[walletBalance, portfolio]);

  const userName = user?.profile?.full_name || user?.username || 'User';
  const firstName = userName.split(' ')[0];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Upper Zone - Full Bleed Gradient */}
      <div className="relative w-screen -ml-[50vw] left-1/2 bg-gradient-to-b from-[#8B5CF6] to-[#4F46E5] pt-8 pb-32">
        <AnimatedWave />
        
        <div className="relative z-10 max-w-md mx-auto px-4">
          {/* Greeting */}
          <div className="text-white text-sm font-medium mb-6">
            Hi {firstName} Jeremiah Chidiebube 👋
          </div>

          {/* Portfolio Section */}
          <div className="space-y-3 mb-8">
            <div className="text-white/80 text-xs font-medium">Total Portfolio</div>
            
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-white/20 text-white border border-white/30 hover:bg-white/30 h-9 px-3 text-sm font-medium rounded-lg flex items-center gap-1">
                    <span className="capitalize">{portfolio === 'total' ? 'Total Portfolio' : portfolio}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {(['total','ecommerce','crypto','rewards','freelance'] as const).map(p=> (
                    <DropdownMenuItem key={p} onClick={()=>setPortfolio(p)} className="capitalize">
                      {p === 'total' ? 'Total Portfolio' : p}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button 
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 h-9 w-9 p-0"
                onClick={()=>setShowBalance(v=>!v)}
              >
                {showBalance ? <Eye className="h-4 w-4"/> : <EyeOff className="h-4 w-4"/>}
              </Button>

              <div className="ml-auto bg-white/20 backdrop-blur-md text-white text-xs px-3 py-2 rounded-full border border-white/30">
                Balance Source: Total
              </div>
            </div>
          </div>

          {/* Balance Display */}
          <div className="mb-2">
            <div className="text-white text-5xl font-bold tracking-tight mb-3">
              {showBalance ? `$${viewBalance.toFixed(2)}` : '••••••••'}
            </div>
            <div className="inline-block bg-emerald-400/20 text-emerald-100 px-3 py-1 rounded-full text-xs font-medium border border-emerald-400/30">
              +0.0% from last month
            </div>
          </div>
        </div>

        {/* Floating Action Buttons */}
        <div className="relative z-20 max-w-md mx-auto px-4 mt-12 -mb-6">
          <div className="flex gap-3 justify-center">
            <button
              onClick={()=>navigate('/app/wallet/deposit')}
              className="flex-1 bg-white text-[#8B5CF6] rounded-2xl py-3 px-4 font-semibold text-sm flex flex-col items-center gap-1 shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="h-5 w-5" />
              <span>Deposit</span>
            </button>
            <button
              onClick={()=>navigate('/app/wallet/send-money')}
              className="flex-1 bg-white text-[#8B5CF6] rounded-2xl py-3 px-4 font-semibold text-sm flex flex-col items-center gap-1 shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              <Send className="h-5 w-5" />
              <span>Send</span>
            </button>
            <button
              onClick={()=>navigate('/app/wallet/withdraw')}
              className="flex-1 bg-white text-[#8B5CF6] rounded-2xl py-3 px-4 font-semibold text-sm flex flex-col items-center gap-1 shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              <ArrowUp className="h-5 w-5" />
              <span>Withdraw</span>
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex-1 bg-white text-[#8B5CF6] rounded-2xl py-3 px-4 font-semibold text-sm flex flex-col items-center gap-1 shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95">
                  <MoreHorizontal className="h-5 w-5" />
                  <span>More</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                <DropdownMenuItem onClick={()=>navigate('/app/wallet/top-up')} className="flex items-center gap-2">
                  <Phone className="h-4 w-4"/> Top Up
                </DropdownMenuItem>
                <DropdownMenuItem onClick={()=>navigate('/app/wallet/analytics')} className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4"/> Analytics
                </DropdownMenuItem>
                <DropdownMenuItem onClick={()=>navigate('/app/wallet/transactions')} className="flex items-center gap-2">
                  <List className="h-4 w-4"/> Transactions
                </DropdownMenuItem>
                <DropdownMenuItem onClick={()=>navigate('/app/wallet/cards')} className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4"/> My Cards
                </DropdownMenuItem>
                <DropdownMenuItem onClick={()=>navigate('/app/wallet/gift-cards')} className="flex items-center gap-2">
                  <Gift className="h-4 w-4"/> Gift Cards
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Lower Zone - White Content Area with Curved Top */}
      <div className="relative w-screen -ml-[50vw] left-1/2 bg-white pt-2 min-h-screen">
        {/* Curved divider */}
        <div className="absolute -top-12 left-0 right-0 h-24 bg-white" style={{
          borderRadius: '48px 48px 0 0',
          backgroundColor: 'white',
        }}></div>

        <div className="relative z-10 max-w-md mx-auto px-4 space-y-4 pb-12">

          {/* Ad Carousel Banner - Positioned to eliminate white space */}
          <div className="mt-0">
            <AdCarousel
              ads={ads}
              autoScroll={true}
              scrollInterval={6000}
              onAdClick={(ad) => {
                if (ad.ctaUrl) {
                  navigate(ad.ctaUrl);
                }
              }}
            />
          </div>

          {/* Wallet Services Grid */}
          <WalletServicesGrid />

          {/* Gifts & Rewards Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Gift className="h-5 w-5 text-red-500" />
              <h2 className="text-lg font-bold text-gray-900">Gifts & Rewards</h2>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={()=>navigate('/app/send-gifts')}
                className="bg-red-500 text-white rounded-xl py-4 px-2 flex flex-col items-center gap-1 font-semibold text-xs hover:bg-red-600 transition-all hover:scale-105 relative"
              >
                <Gift className="h-5 w-5" />
                <span>Send Gifts</span>
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-2xs px-1.5 py-0.5 rounded-full font-bold">Popular</span>
              </button>
              <button
                onClick={()=>navigate('/app/wallet/buy-gift-cards')}
                className="bg-pink-500 text-white rounded-xl py-4 px-2 flex flex-col items-center gap-2 font-semibold text-xs hover:bg-pink-600 transition-all hover:scale-105"
              >
                <Gift className="h-5 w-5" />
                <span>Buy Cards</span>
              </button>
              <button
                onClick={()=>navigate('/app/wallet/sell-gift-cards')}
                className="bg-green-500 text-white rounded-xl py-4 px-2 flex flex-col items-center gap-2 font-semibold text-xs hover:bg-green-600 transition-all hover:scale-105"
              >
                <Home className="h-5 w-5" />
                <span>Sell Cards</span>
              </button>
            </div>
          </div>

          {/* Frequent Recipients */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-5 w-5 text-blue-500 flex items-center justify-center">👤</div>
              <h2 className="text-lg font-bold text-gray-900">Frequent Recipients</h2>
            </div>
            <div className="space-y-3">
              {recipients.map(recipient => (
                <div key={recipient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {recipient.initials}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-gray-900">{recipient.name}</div>
                      <div className="text-xs text-gray-600">Last sent ${recipient.lastAmount.toFixed(2)} {recipient.timesUsed} times</div>
                    </div>
                  </div>
                  <button className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors">
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Activity */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-5 w-5 text-blue-600" />
              <h3 className="font-bold text-gray-900">Today's Activity</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Earned Today</span>
                <span className="font-semibold text-green-600">
                  +$
                  {(() => {
                    const today = new Date().toDateString();
                    const todayEarnings = transactions
                      .filter(tx => new Date(tx.timestamp || tx.createdAt || '').toDateString() === today && (typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount) > 0)
                      .reduce((sum, tx) => sum + (typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount), 0);
                    return todayEarnings.toFixed(2);
                  })()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Transactions</span>
                <span className="font-semibold text-blue-600">
                  {(() => {
                    const today = new Date().toDateString();
                    return transactions.filter(tx => new Date(tx.timestamp || tx.createdAt || '').toDateString() === today).length;
                  })()}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-purple-600" />
                <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
              </div>
              <button onClick={()=>navigate('/app/wallet/transactions')} className="text-blue-600 text-sm font-medium hover:underline">See All</button>
            </div>
            {transactions && transactions.length > 0 ? (
              <div className="space-y-2">
                {transactions.slice(0, 3).map((tx, idx) => (
                  <div key={tx.id || idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                        {tx.type?.charAt(0).toUpperCase() || 'T'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 truncate">{tx.description || 'Transaction'}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(tx.timestamp || tx.createdAt || '').toLocaleDateString()} {new Date(tx.timestamp || tx.createdAt || '').toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold text-sm ${(typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount) > 0 ? '+' : ''}{(typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount).toFixed(2)}
                      </div>
                      <div className={`text-xs ${tx.status === 'completed' ? 'text-green-600' : tx.status === 'pending' ? 'text-yellow-600' : 'text-red-600'}`}>
                        {tx.status?.charAt(0).toUpperCase() + tx.status?.slice(1) || 'Completed'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                <div className="text-gray-600 text-sm">No transactions yet.</div>
              </div>
            )}
          </div>

          {/* Gifts & Tips */}
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
            <div className="flex items-center gap-2 mb-3">
              <Gift className="h-5 w-5 text-purple-600" />
              <h3 className="font-bold text-gray-900">Gifts & Tips</h3>
            </div>
            <div className="text-sm text-gray-600 mb-4">No gifts or tips sent yet</div>
            <button
              onClick={()=>navigate('/app/send-gifts')}
              className="w-full bg-purple-600 text-white rounded-lg py-2 px-4 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-purple-700 transition-all active:scale-95"
            >
              <Gift className="h-4 w-4" />
              Send Your First Gift
            </button>
          </div>

          {/* My Cards */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">My Cards</h2>
              <button onClick={()=>navigate('/app/wallet/cards')} className="text-blue-600 text-sm font-medium hover:underline">Manage</button>
            </div>
            <div className="space-y-3">
              {/* Visa Card */}
              <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-5 text-white shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-medium opacity-90">Visa Debit</span>
                  <CreditCard className="h-5 w-5 opacity-90" />
                </div>
                <div className="text-2xl font-bold tracking-wider mb-6">•••• 4532</div>
                <div className="flex items-center justify-between">
                  <div className="text-sm opacity-90">Balance</div>
                  <div className="text-lg font-semibold">$2,450.00</div>
                </div>
              </div>

              {/* Mastercard */}
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-5 text-white shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-medium opacity-90">Mastercard</span>
                  <CreditCard className="h-5 w-5 opacity-90" />
                </div>
                <div className="text-2xl font-bold tracking-wider mb-6">•••• 8901</div>
                <div className="flex items-center justify-between">
                  <div className="text-sm opacity-90">Balance</div>
                  <div className="text-lg font-semibold">$550.00</div>
                </div>
              </div>
            </div>
          </div>

          {/* Smart Recommendations */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-5 w-5 text-blue-600" />
              <h3 className="font-bold text-gray-900">Smart Recommendations</h3>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-gray-900">Enable 2FA for Better Security</span>
                  <span className="bg-orange-500 text-white text-2xs px-2 py-0.5 rounded font-bold">HIGH</span>
                </div>
                <div className="text-xs text-gray-600 mb-3">Protect your account with two-factor authentication.</div>
              </div>
              <button onClick={()=>navigate('/app/settings')} className="w-full bg-white text-blue-600 border border-blue-200 rounded-lg py-2 px-4 font-semibold text-sm hover:bg-blue-50 transition-all active:scale-95">
                View
              </button>
            </div>
          </div>

        </div>
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
