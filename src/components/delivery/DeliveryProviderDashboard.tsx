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
  Package,
  Clock,
  DollarSign,
  Star,
  MapPin,
  Navigation,
  ExternalLink,
  Timer,
  BarChart3,
  Activity,
  Users,
  PlusCircle,
  Award,
  Info,
  Eye,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWalletContext } from "@/contexts/WalletContext";
import { cn } from "@/lib/utils";
import { Outlet, useNavigate } from "react-router-dom";

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

export default function DeliveryProviderDashboard() {
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferAmount, setTransferAmount] = useState("");
  const { toast } = useToast();
  const { walletBalance, refreshWallet } = useWalletContext();
  const navigate = useNavigate();

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

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

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Delivery Provider Hub</h1>
          <p className="text-gray-600">Professional delivery management dashboard</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm font-medium">Online & Available</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/app/delivery/provider/dashboard/overview')}>Go to Overview</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-1 space-y-6">
          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <DollarSign className="h-5 w-5" />
                Delivery Earnings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-green-700">Available Balance</p>
                <p className="text-3xl font-bold text-green-800">{formatCurrency(mockStats.deliveryBalance)}</p>
                <p className="text-xs text-green-600">Ready to transfer</p>
              </div>

              <Button onClick={() => setShowTransferModal(true)} className="w-full bg-green-600 hover:bg-green-700" disabled={mockStats.deliveryBalance < 5}>
                <Send className="h-4 w-4 mr-2" />
                Transfer to Wallet
              </Button>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="text-center p-2 bg-white/50 rounded">
                  <p className="text-xs text-green-700">Today</p>
                  <p className="font-bold text-green-800">{formatCurrency(mockStats.todayEarnings)}</p>
                </div>
                <div className="text-center p-2 bg-white/50 rounded">
                  <p className="text-xs text-green-700">This Week</p>
                  <p className="font-bold text-green-800">{formatCurrency(mockStats.weekEarnings)}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-green-300">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-green-700">Main Wallet Balance:</span>
                  <span className="font-medium text-green-800">{formatCurrency(walletBalance?.ecommerce || 0)}</span>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-2 border-green-300 text-green-700 hover:bg-green-50" onClick={() => window.open('/app/wallet', '_blank')}>
                  <ExternalLink className="h-3 w-3 mr-2" /> View Main Wallet
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Rating</span>
                <div className="flex items-center gap-1"><span className="font-medium">{mockStats.rating}</span></div>
              </div>
              <div className="flex justify-between items-center"><span className="text-sm text-gray-600">On-Time Rate</span><span className="font-medium">{mockStats.onTimeRate}%</span></div>
              <div className="flex justify-between items-center"><span className="text-sm text-gray-600">Completion Rate</span><span className="font-medium">{mockStats.completionRate}%</span></div>
              <div className="flex justify-between items-center"><span className="text-sm text-gray-600">Total Deliveries</span><span className="font-medium">{mockStats.totalDeliveries}</span></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">Optimize Routes</Button>
              <Button variant="outline" size="sm" className="w-full justify-start">Schedule</Button>
              <Button variant="outline" size="sm" className="w-full justify-start">Support</Button>
            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-3">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Navigation className="h-5 w-5"/> Dashboard Navigation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <Button onClick={() => navigate('overview')} className="flex flex-col items-center gap-2 py-4"> <BarChart3 className="h-4 w-4"/> <span className="text-xs font-medium">Overview</span> </Button>
                  <Button onClick={() => navigate('active')} className="flex flex-col items-center gap-2 py-4"> <Truck className="h-4 w-4"/> <span className="text-xs font-medium">Active</span> </Button>
                  <Button onClick={() => navigate('earnings')} className="flex flex-col items-center gap-2 py-4"> <DollarSign className="h-4 w-4"/> <span className="text-xs font-medium">Earnings</span> </Button>
                  <Button onClick={() => navigate('reviews')} className="flex flex-col items-center gap-2 py-4"> <Star className="h-4 w-4"/> <span className="text-xs font-medium">Reviews</span> </Button>
                  <Button onClick={() => navigate('vehicles')} className="flex flex-col items-center gap-2 py-4"> <Truck className="h-4 w-4"/> <span className="text-xs font-medium">Vehicles</span> </Button>
                  <Button onClick={() => navigate('analytics')} className="flex flex-col items-center gap-2 py-4"> <Activity className="h-4 w-4"/> <span className="text-xs font-medium">Analytics</span> </Button>
                </div>
              </CardContent>
            </Card>

            {/* Render subpage content via nested routes */}
            <div>
              <Outlet context={{ stats: mockStats, assignments: mockAssignments, ratings: mockRatings, earnings: mockEarnings }} />
            </div>

          </div>
        </div>
      </div>

      <Dialog open={showTransferModal} onOpenChange={setShowTransferModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Earnings to Main Wallet</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Transfer Amount</label>
              <Input type="number" placeholder="Enter amount" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} min={5} />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowTransferModal(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleTransferToWallet} className="flex-1">Transfer to Wallet</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
