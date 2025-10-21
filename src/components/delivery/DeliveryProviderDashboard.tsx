import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Truck,
  DollarSign,
  Star,
  Navigation,
  ExternalLink,
  Timer,
  BarChart3,
  Activity,
  Users,
  Award,
  Settings as SettingsIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWalletContext } from "@/contexts/WalletContext";
import { cn } from "@/lib/utils";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

interface DeliveryAssignment {
  id: string;
  orderId: string;
  orderNumber: string;
  status: string;
  pickupAddress: any;
  deliveryAddress: any;
  packageDetails: any;
  deliveryFee: number;
  estimatedDeliveryTime: string;
  trackingNumber: string;
  createdAt: string;
}

interface CustomerRating {
  id: string;
  customerName: string;
  orderNumber: string;
  rating: number;
  comment: string;
  deliveryDate: string;
}

interface DeliveryEarnings {
  id: string;
  type: 'delivery' | 'bonus' | 'tip' | 'penalty';
  amount: number;
  date: string;
  description: string;
  orderNumber?: string;
  status: 'completed' | 'pending' | 'processing';
}

interface ProviderStats {
  totalDeliveries: number;
  completedToday: number;
  todayEarnings: number;
  weekEarnings: number;
  monthEarnings: number;
  totalEarnings: number;
  deliveryBalance: number;
  rating: number;
  onTimeRate: number;
  activeAssignments: number;
  completionRate: number;
  averageDeliveryTime: number;
  customerSatisfaction: number;
  totalTips: number;
  bonusesEarned: number;
}

const mockStats: ProviderStats = {
  totalDeliveries: 247,
  completedToday: 8,
  todayEarnings: 156.75,
  weekEarnings: 892.4,
  monthEarnings: 3420.5,
  totalEarnings: 5420.5,
  deliveryBalance: 1450.3,
  rating: 4.8,
  onTimeRate: 94.2,
  activeAssignments: 3,
  completionRate: 98.5,
  averageDeliveryTime: 28,
  customerSatisfaction: 4.7,
  totalTips: 324.75,
  bonusesEarned: 180.0,
};

const mockRatings: CustomerRating[] = [
  {
    id: "1",
    customerName: "Sarah Johnson",
    orderNumber: "SC240001",
    rating: 5,
    comment: "Excellent service! Package arrived quickly and in perfect condition.",
    deliveryDate: "2024-01-15T14:30:00Z",
  },
  {
    id: "2",
    customerName: "Mike Chen",
    orderNumber: "SC240002",
    rating: 4,
    comment: "Good delivery service. Driver was polite and delivered on time.",
    deliveryDate: "2024-01-14T16:45:00Z",
  },
];

const mockEarnings: DeliveryEarnings[] = [
  {
    id: "1",
    type: "delivery",
    amount: 12.5,
    date: "2024-01-15T14:30:00Z",
    description: "Delivery fee for order SC240001",
    orderNumber: "SC240001",
    status: "completed",
  },
  {
    id: "2",
    type: "tip",
    amount: 5.0,
    date: "2024-01-15T14:30:00Z",
    description: "Customer tip for order SC240001",
    orderNumber: "SC240001",
    status: "completed",
  },
  {
    id: "3",
    type: "bonus",
    amount: 25.0,
    date: "2024-01-15T00:00:00Z",
    description: "Peak hour delivery bonus",
    status: "completed",
  },
];

const mockAssignments: DeliveryAssignment[] = [
  {
    id: "1",
    orderId: "order-1",
    orderNumber: "SC240001",
    status: "accepted",
    pickupAddress: { name: "TechStore Inc", address: "123 Business St, Downtown", phone: "+1-555-0123" },
    deliveryAddress: { name: "John Smith", address: "456 Residential Ave, Suburbs", phone: "+1-555-0456" },
    packageDetails: { weight: 2.5, dimensions: { length: 30, width: 20, height: 15 }, value: 299.99, description: "Electronics - Smartphone", fragile: true },
    deliveryFee: 12.5,
    estimatedDeliveryTime: "2024-01-15T16:00:00Z",
    trackingNumber: "SC240001ABC",
    createdAt: "2024-01-15T10:30:00Z",
  },
];

// Navigation items matching crypto page structure
const navigationItems = [
  { id: 'overview', label: 'Overview', icon: BarChart3, path: 'overview' },
  { id: 'active', label: 'Active', icon: Truck, path: 'active' },
  { id: 'earnings', label: 'Earnings', icon: DollarSign, path: 'earnings' },
  { id: 'analytics', label: 'Analytics', icon: Activity, path: 'analytics' },
  { id: 'reviews', label: 'Reviews', icon: Star, path: 'reviews' },
  { id: 'vehicles', label: 'Vehicles', icon: Truck, path: 'vehicles' },
];

export default function DeliveryProviderDashboard() {
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferAmount, setTransferAmount] = useState("");
  const { toast } = useToast();
  const { walletBalance, refreshWallet } = useWalletContext();
  const navigate = useNavigate();
  const location = useLocation();

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  // Determine current tab based on route
  const currentPath = location.pathname.split('/').pop() || 'overview';
  const isOnSubPage = currentPath !== 'dashboard' && currentPath !== '';

  const handleTransferToWallet = async () => {
    const amount = parseFloat(transferAmount || "0");
    if (!amount || amount < 5) {
      toast({ title: "Error", description: "Minimum transfer is $5.00", variant: "destructive" });
      return;
    }
    setShowTransferModal(false);
    setTransferAmount("");
    await refreshWallet?.();
    toast({ title: "Transfer Successful", description: `${formatCurrency(amount)} transferred to main wallet.` });
  };

  const handleNavigateTab = (path: string) => {
    navigate(path);
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-blue-950/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header with back button and title */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Delivery Hub</h1>
              <div className="h-8 w-px bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  Online & Available
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs - Similar to Crypto page */}
        <Card className="mb-6 border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center overflow-x-auto gap-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;
                return (
                  <Button
                    key={item.id}
                    onClick={() => handleNavigateTab(item.path)}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "flex items-center gap-2 whitespace-nowrap",
                      isActive && "bg-blue-600 text-white hover:bg-blue-700"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Sidebar - Earnings Card and Stats */}
          <div className="xl:col-span-1 space-y-4">
            {/* Earnings Card */}
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                  <DollarSign className="h-5 w-5" />
                  Delivery Earnings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-green-700 dark:text-green-300">Available Balance</p>
                  <p className="text-3xl font-bold text-green-800 dark:text-green-100">{formatCurrency(mockStats.deliveryBalance)}</p>
                  <p className="text-xs text-green-600 dark:text-green-400">Ready to transfer</p>
                </div>

                <Button
                  onClick={() => setShowTransferModal(true)}
                  className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                  disabled={mockStats.deliveryBalance < 5}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Transfer to Wallet
                </Button>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="text-center p-3 bg-white/50 dark:bg-white/10 rounded-lg">
                    <p className="text-xs text-green-700 dark:text-green-300">Today</p>
                    <p className="font-bold text-green-800 dark:text-green-100">{formatCurrency(mockStats.todayEarnings)}</p>
                  </div>
                  <div className="text-center p-3 bg-white/50 dark:bg-white/10 rounded-lg">
                    <p className="text-xs text-green-700 dark:text-green-300">This Week</p>
                    <p className="font-bold text-green-800 dark:text-green-100">{formatCurrency(mockStats.weekEarnings)}</p>
                  </div>
                </div>

                <Separator className="bg-green-300/50 dark:bg-green-700/50" />
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-green-700 dark:text-green-300">Main Wallet:</span>
                    <span className="font-medium text-green-800 dark:text-green-100">{formatCurrency(walletBalance?.ecommerce || 0)}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-950"
                    onClick={() => window.open('/app/wallet', '_blank')}
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    View Main Wallet
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Performance Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-4 w-4" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium">{mockStats.rating}</span>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">On-Time Rate</span>
                  <span className="font-medium text-green-600">{mockStats.onTimeRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</span>
                  <span className="font-medium text-blue-600">{mockStats.completionRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Deliveries</span>
                  <span className="font-medium">{mockStats.totalDeliveries}</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Navigation className="h-4 w-4 mr-2" />
                  Optimize Routes
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <SettingsIcon className="h-4 w-4 mr-2" />
                  Schedule
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Support
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area - Outlet for sub-pages */}
          <div className="xl:col-span-3">
            <Outlet context={{ stats: mockStats, assignments: mockAssignments, ratings: mockRatings, earnings: mockEarnings }} />
          </div>
        </div>
      </div>

      {/* Transfer Modal */}
      <Dialog open={showTransferModal} onOpenChange={setShowTransferModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Earnings to Main Wallet</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Transfer Amount</label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                min={5}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowTransferModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleTransferToWallet} className="flex-1">
                Transfer to Wallet
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
