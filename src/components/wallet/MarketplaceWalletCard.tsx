// @ts-nocheck
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Star,
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Download,
  CreditCard,
  Wallet,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MarketplaceSales {
  id: string;
  productName: string;
  customerName: string;
  amount: number;
  commission: number;
  netEarnings: number;
  status: "pending" | "processing" | "completed" | "refunded";
  date: string;
  orderId: string;
}

interface MarketplaceEarnings {
  totalEarnings: number;
  pendingEarnings: number;
  availableBalance: number;
  totalSales: number;
  salesCount: number;
  averageOrderValue: number;
  monthlyGrowth: number;
  topSellingCategory: string;
  recentSales: MarketplaceSales[];
  monthlyData: {
    month: string;
    earnings: number;
    sales: number;
  }[];
}

interface MarketplaceWalletCardProps {
  earnings?: MarketplaceEarnings;
  className?: string;
}

const mockEarnings: MarketplaceEarnings = {
  totalEarnings: 8947.32, // Match centralized e-commerce balance
  pendingEarnings: 1245.5,
  availableBalance: 7701.82, // Adjusted: 8947.32 - 1245.5
  totalSales: 15679.58,
  salesCount: 87,
  averageOrderValue: 180.22,
  monthlyGrowth: 23.5,
  topSellingCategory: "Electronics",
  recentSales: [
    {
      id: "1",
      productName: "iPhone 15 Pro",
      customerName: "John Doe",
      amount: 1099.99,
      commission: 109.99,
      netEarnings: 990.0,
      status: "completed",
      date: "2024-01-15T10:30:00Z",
      orderId: "ORD-001",
    },
    {
      id: "2",
      productName: 'MacBook Pro 16"',
      customerName: "Jane Smith",
      amount: 2499.99,
      commission: 249.99,
      netEarnings: 2250.0,
      status: "processing",
      date: "2024-01-14T15:45:00Z",
      orderId: "ORD-002",
    },
    {
      id: "3",
      productName: "AirPods Pro",
      customerName: "Mike Johnson",
      amount: 249.99,
      commission: 24.99,
      netEarnings: 225.0,
      status: "completed",
      date: "2024-01-13T09:20:00Z",
      orderId: "ORD-003",
    },
  ],
  monthlyData: [
    { month: "Jul", earnings: 8420, sales: 45 },
    { month: "Aug", earnings: 9650, sales: 52 },
    { month: "Sep", earnings: 11200, sales: 61 },
    { month: "Oct", earnings: 10800, sales: 58 },
    { month: "Nov", earnings: 13400, sales: 72 },
    { month: "Dec", earnings: 15679, sales: 87 },
  ],
};

export default function MarketplaceWalletCard({
  earnings = mockEarnings,
  className,
}: MarketplaceWalletCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "refunded":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getGrowthIcon = () => {
    if (earnings.monthlyGrowth > 0) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (earnings.monthlyGrowth < 0) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return null;
  };

  const getGrowthColor = () => {
    if (earnings.monthlyGrowth > 0) {
      return "text-green-600";
    } else if (earnings.monthlyGrowth < 0) {
      return "text-red-600";
    }
    return "text-gray-600";
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-white">Marketplace Earnings</CardTitle>
              <p className="text-white/80 text-sm">
                Seller dashboard & analytics
              </p>
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
              <Wallet className="h-4 w-4 text-purple-600" />
              <span className="text-xs text-gray-600">Available</span>
            </div>
            <div className="text-lg font-bold text-purple-600">
              {formatCurrency(earnings.availableBalance)}
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-xs text-gray-600">Total Earned</span>
            </div>
            <div className="text-lg font-bold text-green-600">
              {formatCurrency(earnings.totalEarnings)}
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Package className="h-4 w-4 text-blue-600" />
              <span className="text-xs text-gray-600">Sales</span>
            </div>
            <div className="text-lg font-bold text-blue-600">
              {earnings.salesCount}
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              {getGrowthIcon()}
              <span className="text-xs text-gray-600">Growth</span>
            </div>
            <div className={cn("text-lg font-bold", getGrowthColor())}>
              {earnings.monthlyGrowth > 0 ? "+" : ""}
              {earnings.monthlyGrowth.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Pending Earnings Alert */}
        {earnings.pendingEarnings > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                Pending Earnings: {formatCurrency(earnings.pendingEarnings)}
              </span>
            </div>
            <p className="text-xs text-yellow-700 mt-1">
              These will be available once orders are confirmed
            </p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2 mb-6">
          <Button size="sm" className="flex-1">
            <CreditCard className="h-4 w-4 mr-2" />
            Withdraw
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </div>

        {/* Detailed View */}
        {showDetails && (
          <div className="space-y-6 border-t pt-6">
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(earnings.averageOrderValue)}
                </div>
                <div className="text-sm text-gray-600">Avg. Order Value</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(earnings.totalSales)}
                </div>
                <div className="text-sm text-gray-600">Total Sales</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {earnings.topSellingCategory}
                </div>
                <div className="text-sm text-gray-600">Top Category</div>
              </div>
            </div>

            {/* Recent Sales */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Recent Sales
              </h3>
              <div className="space-y-3">
                {earnings.recentSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {sale.productName}
                      </div>
                      <div className="text-xs text-gray-600">
                        {sale.customerName} • {formatDate(sale.date)}
                      </div>
                    </div>

                    <div className="text-center mx-4">
                      <Badge
                        className={getStatusColor(sale.status)}
                        variant="secondary"
                      >
                        {sale.status}
                      </Badge>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold text-sm">
                        {formatCurrency(sale.netEarnings)}
                      </div>
                      <div className="text-xs text-gray-600">
                        from {formatCurrency(sale.amount)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Performance */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Monthly Performance
              </h3>
              <div className="space-y-3">
                {earnings.monthlyData.slice(-3).map((month, index) => {
                  const previousMonth =
                    earnings.monthlyData[
                      earnings.monthlyData.length - 4 + index
                    ];
                  const growth = previousMonth
                    ? ((month.earnings - previousMonth.earnings) /
                        previousMonth.earnings) *
                      100
                    : 0;

                  return (
                    <div key={month.month} className="flex items-center gap-4">
                      <div className="w-12 text-sm font-medium">
                        {month.month}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span>{formatCurrency(month.earnings)}</span>
                          <span className="text-gray-600">
                            {month.sales} sales
                          </span>
                        </div>
                        <Progress
                          value={(month.earnings / 20000) * 100}
                          className="h-2"
                        />
                      </div>
                      {growth !== 0 && (
                        <div
                          className={cn(
                            "text-xs font-medium flex items-center gap-1",
                            growth > 0 ? "text-green-600" : "text-red-600",
                          )}
                        >
                          {growth > 0 ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3" />
                          )}
                          {Math.abs(growth).toFixed(1)}%
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Next Payout Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Next Payout</span>
              </div>
              <div className="text-sm text-blue-800">
                <div className="flex justify-between items-center">
                  <span>Available for withdrawal:</span>
                  <span className="font-semibold">
                    {formatCurrency(earnings.availableBalance)}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span>Next automatic payout:</span>
                  <span className="font-semibold">January 28, 2024</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
