import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNotification } from "@/hooks/use-notification";
import { AdminService } from "@/services/adminService";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Wallet,
  AlertTriangle,
  Download,
  Filter,
  Search,
  Banknote,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  Shield,
} from "lucide-react";

import { cn } from "@/lib/utils";

// Simple Badge component since import is having issues
interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'success';
}

const Badge: React.FC<BadgeProps> = ({ children, className, variant }) => {
  const baseClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold";
  
  const variantClasses = {
    default: "border-transparent bg-primary text-primary-foreground",
    outline: "border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300",
    secondary: "border-transparent bg-secondary text-secondary-foreground",
    destructive: "border-transparent bg-destructive text-destructive-foreground",
    success: "border-transparent bg-green-500 text-white",
  }[variant || 'default'] || "";
  
  return (
    <span className={cn(baseClasses, variantClasses, className)}>
      {children}
    </span>
  );
};

interface FinancialMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  platformFees: number;
  totalWithdrawals: number;
  pendingPayouts: number;
  escrowBalance: number;
  userBalances: number;
  transactionVolume: number;
}

interface Transaction {
  id: string;
  userId: string;
  userName: string;
  type: "deposit" | "withdrawal" | "fee" | "payout" | "escrow" | "refund";
  amount: number;
  currency: string;
  source: "marketplace" | "freelance" | "crypto" | "rewards" | "platform";
  status: "pending" | "completed" | "failed" | "processing";
  timestamp: string;
  description: string;
  feeAmount?: number;
  reference?: string;
}

interface Dispute {
  id: string;
  type: "payment" | "refund" | "chargeback" | "escrow";
  userId: string;
  userName: string;
  amount: number;
  status: "open" | "investigating" | "resolved" | "escalated";
  priority: "low" | "medium" | "high" | "urgent";
  submittedAt: string;
  description: string;
}

const AdminFinancial = () => {
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [transactionFilter, setTransactionFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const notification = useNotification();

  useEffect(() => {
    loadFinancialData();
  }, [selectedPeriod]);

  const loadFinancialData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use real API calls instead of mock data
      const [overviewResponse, transactionsResponse] = await Promise.all([
        AdminService.getFinancialOverview(selectedPeriod),
        AdminService.getTransactions({ page: 1, limit: 50 })
      ]);
      
      if (overviewResponse.success) {
        const overview = overviewResponse.data;
        const apiMetrics: FinancialMetrics = {
          totalRevenue: overview.revenue?.total || 0,
          monthlyRevenue: overview.revenue?.change || 0,
          platformFees: overview.revenue?.total ? overview.revenue.total * 0.02 : 0, // 2% fee
          totalWithdrawals: overview.payouts?.completed || 0,
          pendingPayouts: overview.payouts?.pending || 0,
          escrowBalance: 0, // Not provided in mock data
          userBalances: 0, // Not provided in mock data
          transactionVolume: overview.transactions?.volume || 0,
        };
        setMetrics(apiMetrics);
      } else {
        throw new Error(overviewResponse.error || 'Failed to load financial overview');
      }
      
      if (transactionsResponse.success) {
        setTransactions(transactionsResponse.data?.transactions || []);
      } else {
        throw new Error(transactionsResponse.error || 'Failed to load transactions');
      }
      
      // For now, use mock disputes as API endpoint doesn't exist yet
      const mockDisputes: Dispute[] = [
        {
          id: "dispute-001",
          type: "payment",
          userId: "user-321",
          userName: "Alex Rodriguez",
          amount: 850.00,
          status: "investigating",
          priority: "high",
          submittedAt: "2024-01-25T16:20:00Z",
          description: "Payment not received for completed freelance project",
        },
        {
          id: "dispute-002",
          type: "refund",
          userId: "user-654",
          userName: "Emma Wilson",
          amount: 299.99,
          status: "open",
          priority: "medium",
          submittedAt: "2024-01-24T09:15:00Z",
          description: "Request for refund on defective product purchase",
        },
        {
          id: "dispute-003",
          type: "escrow",
          userId: "user-789",
          userName: "Michael Chen",
          amount: 1250.00,
          status: "resolved",
          priority: "low",
          submittedAt: "2024-01-20T14:30:00Z",
          description: "Escrow release dispute for freelance web design project",
        },
      ];
      setDisputes(mockDisputes);
    } catch (error) {
      console.error("Error loading financial data:", error);
      const errorMessage = error instanceof Error
        ? error.message
        : typeof error === 'string'
        ? error
        : "Failed to load financial data";
      setError(errorMessage);
      notification.error(`Error loading financial data: ${errorMessage}`);
      
      // Set mock data as fallback
      const mockMetrics: FinancialMetrics = {
        totalRevenue: 48500.75,
        monthlyRevenue: 12.5,
        platformFees: 970.02,
        totalWithdrawals: 45678.90,
        pendingPayouts: 8947.32,
        escrowBalance: 12500.00,
        userBalances: 250000.00,
        transactionVolume: 1250000.50,
      };
      
      const mockTransactions: Transaction[] = [
        {
          id: "txn-001",
          userId: "user-123",
          userName: "John Smith",
          type: "deposit",
          amount: 250.00,
          currency: "USD",
          source: "marketplace",
          status: "completed",
          timestamp: "2024-01-25T10:30:00Z",
          description: "Product sale commission",
        },
        {
          id: "txn-002",
          userId: "user-456",
          userName: "Sarah Johnson",
          type: "withdrawal",
          amount: 150.50,
          currency: "USD",
          source: "freelance",
          status: "pending",
          timestamp: "2024-01-25T09:15:00Z",
          description: "Payout request",
        },
        {
          id: "txn-003",
          userId: "user-789",
          userName: "Mike Davis",
          type: "fee",
          amount: 25.00,
          currency: "USD",
          source: "platform",
          status: "completed",
          timestamp: "2024-01-24T16:45:00Z",
          description: "Subscription fee",
        },
      ];
      
      setMetrics(mockMetrics);
      setTransactions(mockTransactions);
      
      const mockDisputes: Dispute[] = [
        {
          id: "dispute-001",
          type: "payment",
          userId: "user-321",
          userName: "Alex Rodriguez",
          amount: 850.00,
          status: "investigating",
          priority: "high",
          submittedAt: "2024-01-25T16:20:00Z",
          description: "Payment not received for completed freelance project",
        },
      ];
      setDisputes(mockDisputes);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: "bg-green-500 text-white",
      processing: "bg-blue-500 text-white",
      pending: "bg-yellow-500 text-white",
      failed: "bg-red-500 text-white",
      open: "bg-orange-500 text-white",
      investigating: "bg-blue-500 text-white",
      resolved: "bg-green-500 text-white",
      escalated: "bg-red-500 text-white",
    };
    return colors[status] || "bg-gray-500 text-white";
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
  };

  const getTransactionIcon = (type: string) => {
    const icons: Record<string, JSX.Element> = {
      deposit: <ArrowUpRight className="w-4 h-4 text-green-600" />,
      withdrawal: <ArrowDownRight className="w-4 h-4 text-red-600" />,
      fee: <DollarSign className="w-4 h-4 text-blue-600" />,
      payout: <Banknote className="w-4 h-4 text-purple-600" />,
      escrow: <Shield className="w-4 h-4 text-orange-600" />,
      refund: <ArrowUpRight className="w-4 h-4 text-yellow-600" />,
    };
    return icons[type] || <DollarSign className="w-4 h-4" />;
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesFilter = transactionFilter === "all" || transaction.type === transactionFilter;
    const matchesSearch = searchTerm === "" || 
      transaction.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Mock chart data
  const revenueData = [
    { name: "Jan", revenue: 145000, fees: 14500 },
    { name: "Feb", revenue: 165000, fees: 16500 },
    { name: "Mar", revenue: 175000, fees: 17500 },
    { name: "Apr", revenue: 185000, fees: 18500 },
    { name: "May", revenue: 195000, fees: 19500 },
    { name: "Jun", revenue: 205000, fees: 20500 },
  ];

  const sourceDistribution = [
    { name: "Marketplace", value: 45, color: "#8884d8" },
    { name: "Freelance", value: 30, color: "#82ca9d" },
    { name: "Crypto", value: 15, color: "#ffc658" },
    { name: "Rewards", value: 10, color: "#ff7300" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Loading financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Financial Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Monitor platform revenue, transactions, and financial health
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="bg-green-500/10 p-3 rounded-full mb-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
              <div className="text-sm text-gray-600">Total Revenue</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="bg-blue-500/10 p-3 rounded-full mb-4">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold">{formatCurrency(metrics.monthlyRevenue)}</div>
              <div className="text-sm text-gray-600">Monthly Revenue</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="bg-purple-500/10 p-3 rounded-full mb-4">
                <Wallet className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold">{formatCurrency(metrics.userBalances)}</div>
              <div className="text-sm text-gray-600">User Balances</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="bg-orange-500/10 p-3 rounded-full mb-4">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold">{formatCurrency(metrics.escrowBalance)}</div>
              <div className="text-sm text-gray-600">Escrow Balance</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
            <CardDescription>Platform revenue and fees over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue" />
                <Line type="monotone" dataKey="fees" stroke="#82ca9d" name="Platform Fees" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by Source</CardTitle>
            <CardDescription>Distribution of platform revenue sources</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sourceDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sourceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for detailed views */}
      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="disputes">Financial Disputes</TabsTrigger>
          <TabsTrigger value="payouts">Pending Payouts</TabsTrigger>
          <TabsTrigger value="settings">Financial Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Transaction Management
              </CardTitle>
              <CardDescription>
                Monitor and manage all platform transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="space-y-2">
                  <Label>Type Filter</Label>
                  <Select value={transactionFilter} onValueChange={setTransactionFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="deposit">Deposits</SelectItem>
                      <SelectItem value="withdrawal">Withdrawals</SelectItem>
                      <SelectItem value="fee">Platform Fees</SelectItem>
                      <SelectItem value="payout">Payouts</SelectItem>
                      <SelectItem value="escrow">Escrow</SelectItem>
                      <SelectItem value="refund">Refunds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 flex-1 min-w-[200px]">
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {getTransactionIcon(transaction.type)}
                            <div>
                              <p className="font-medium capitalize">{transaction.type}</p>
                              <p className="text-sm text-gray-600 max-w-xs truncate">
                                {transaction.description}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{transaction.userName}</p>
                            <p className="text-sm text-gray-600">{transaction.userId}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className={`font-medium ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(Math.abs(transaction.amount))}
                            </p>
                            {transaction.feeAmount && (
                              <p className="text-sm text-gray-600">
                                Fee: {formatCurrency(transaction.feeAmount)}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {transaction.source}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(transaction.status)}>
                            {transaction.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">
                              {new Date(transaction.timestamp).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-600">
                              {new Date(transaction.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <FileText className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="disputes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Financial Disputes
              </CardTitle>
              <CardDescription>
                Review and resolve financial disputes and issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dispute</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {disputes.map((dispute) => (
                      <TableRow key={dispute.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium capitalize">{dispute.type} Dispute</p>
                            <p className="text-sm text-gray-600 max-w-xs truncate">
                              {dispute.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{dispute.userName}</p>
                            <p className="text-sm text-gray-600">{dispute.userId}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{formatCurrency(dispute.amount)}</p>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(dispute.priority)}>
                            {dispute.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(dispute.status)}>
                            {dispute.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">
                              {new Date(dispute.submittedAt).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-600">
                              {new Date(dispute.submittedAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm">
                              Review
                            </Button>
                            <Button variant="outline" size="sm">
                              Resolve
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Pending Payouts
              </CardTitle>
              <CardDescription>
                Manage pending payouts and payment processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This section will show pending payouts awaiting processing. Integration with payment
                  processors needed for full functionality.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Financial Settings
              </CardTitle>
              <CardDescription>
                Configure platform financial settings and policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Financial settings configuration panel coming soon. This will include transaction
                  limits, fee structures, and payout schedules.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminFinancial;