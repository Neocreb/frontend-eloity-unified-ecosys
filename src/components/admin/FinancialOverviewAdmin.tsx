// @ts-nocheck
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  CreditCard,
  PieChart,
  Settings,
  MoreHorizontal,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { AdminService } from "@/services/adminService";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

interface FinancialStats {
  revenue: {
    total: number;
    change: number;
    trend: "up" | "down";
    dailyAverage: number;
  };
  transactions: {
    total: number;
    completed: number;
    pending: number;
    failed: number;
    volume: number;
  };
  payouts: {
    pending: number;
    completed: number;
    failed: number;
  };
  topPaymentMethods: Array<{
    method: string;
    count: number;
    percentage: number;
  }>;
}

interface Transaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  type: "credit" | "debit";
  status: "completed" | "pending" | "failed";
  method: string;
  description: string;
  createdAt: string;
  fees: number;
}

interface Payout {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: "completed" | "pending" | "failed";
  method: string;
  recipient: string;
  account: string;
  createdAt: string;
  processedAt?: string;
  fees: number;
}

interface PaymentProcessor {
  id: string;
  name: string;
  enabled: boolean;
  apiKeySet: boolean;
  webhookUrl: string;
  supportedCurrencies: string[];
  fees: {
    percentage: number;
    fixed: number;
  };
}

export default function FinancialOverviewAdmin() {
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [processors, setProcessors] = useState<PaymentProcessor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showProcessorDialog, setShowProcessorDialog] = useState(false);
  const [selectedProcessor, setSelectedProcessor] = useState<PaymentProcessor | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load financial overview
      const overviewResponse = await AdminService.getFinancialOverview(selectedPeriod);
      if (overviewResponse.success) {
        setStats(overviewResponse.data);
      }
      
      // Load transactions
      const transactionsResponse = await AdminService.getTransactions({ limit: 50 });
      if (transactionsResponse.success) {
        setTransactions(transactionsResponse.data.transactions);
      }
      
      // Load payouts
      const payoutsResponse = await AdminService.getPayouts({ limit: 50 });
      if (payoutsResponse.success) {
        setPayouts(payoutsResponse.data.payouts);
      }
      
      // Load payment processors
      const processorsResponse = await AdminService.getPaymentProcessors();
      if (processorsResponse.success) {
        setProcessors(processorsResponse.data.processors);
      }
    } catch (error) {
      console.error("Error loading financial data:", error);
      toast({
        title: "Error",
        description: "Failed to load financial data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadData();
  };

  const handleProcessorToggle = async (processorId: string, enabled: boolean) => {
    try {
      await AdminService.updatePaymentProcessor(processorId, { enabled });
      setProcessors(processors.map(p => 
        p.id === processorId ? { ...p, enabled } : p
      ));
      toast({
        title: "Success",
        description: `${enabled ? "Enabled" : "Disabled"} payment processor`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update payment processor",
        variant: "destructive",
      });
    }
  };

  const handleApprovePayout = async (payoutId: string) => {
    try {
      const response = await AdminService.processPayout(payoutId, 'approve');
      if (response.success) {
        setPayouts(payouts.map(p => 
          p.id === payoutId ? { ...p, status: 'completed' } : p
        ));
        toast({
          title: "Success",
          description: "Payout approved successfully",
        });
      } else {
        throw new Error(response.error || "Failed to approve payout");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve payout",
        variant: "destructive",
      });
    }
  };

  const handleRejectPayout = async (payoutId: string) => {
    try {
      const response = await AdminService.processPayout(payoutId, 'reject');
      if (response.success) {
        setPayouts(payouts.map(p => 
          p.id === payoutId ? { ...p, status: 'failed' } : p
        ));
        toast({
          title: "Success",
          description: "Payout rejected successfully",
        });
      } else {
        throw new Error(response.error || "Failed to reject payout");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject payout",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Financial Overview</h1>
          <p className="text-gray-600">Manage payments, transactions, and payouts</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.revenue.total)}</p>
                  <div className="flex items-center mt-1">
                    {stats.revenue.trend === "up" ? (
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={stats.revenue.trend === "up" ? "text-green-600" : "text-red-600"}>
                      {stats.revenue.change > 0 ? "+" : ""}{stats.revenue.change}%
                    </span>
                    <span className="text-xs text-gray-500 ml-2">vs last period</span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Transactions</p>
                  <p className="text-2xl font-bold">{stats.transactions.total.toLocaleString()}</p>
                  <div className="flex items-center mt-1">
                    <Users className="h-4 w-4 text-gray-500 mr-1" />
                    <span className="text-xs text-gray-500">
                      {stats.transactions.completed} completed
                    </span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Payouts Pending</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.payouts.pending)}</p>
                  <div className="flex items-center mt-1">
                    <Clock className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-xs text-gray-500">
                      {stats.payouts.completed} completed
                    </span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Daily Average</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.revenue.dailyAverage)}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-xs text-gray-500">Revenue per day</span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <PieChart className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="processors">Payment Processors</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Top Payment Methods
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Method</TableHead>
                      <TableHead>Transactions</TableHead>
                      <TableHead>Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats?.topPaymentMethods.map((method, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{method.method}</TableCell>
                        <TableCell>{method.count.toLocaleString()}</TableCell>
                        <TableCell>{method.percentage}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.slice(0, 5).map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-mono text-sm">
                          {transaction.id.substring(0, 8)}...
                        </TableCell>
                        <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                        <TableCell>
                          <Badge variant={transaction.type === "credit" ? "default" : "secondary"}>
                            {transaction.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(transaction.status)}>
                            {transaction.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          {/* Transaction Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search Transactions</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search by ID, user, or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-sm">
                        {transaction.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>{transaction.userId.substring(0, 8)}...</TableCell>
                      <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                      <TableCell>{transaction.method}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {transaction.description}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-nowrap">
                        {formatDateTime(transaction.createdAt)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Refund
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts" className="space-y-4">
          {/* Payouts Table */}
          <Card>
            <CardHeader>
              <CardTitle>Payout Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell className="font-mono text-sm">
                        {payout.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>{payout.userId.substring(0, 8)}...</TableCell>
                      <TableCell>{formatCurrency(payout.amount)}</TableCell>
                      <TableCell>{payout.method}</TableCell>
                      <TableCell>{payout.recipient}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(payout.status)}>
                          {payout.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-nowrap">
                        {formatDateTime(payout.createdAt)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {payout.status === "pending" && (
                              <>
                                <DropdownMenuItem onClick={() => handleApprovePayout(payout.id)}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleRejectPayout(payout.id)}>
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Payment Processors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Processor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>API Key</TableHead>
                    <TableHead>Currencies</TableHead>
                    <TableHead>Fees</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processors.map((processor) => (
                    <TableRow key={processor.id}>
                      <TableCell className="font-medium">{processor.name}</TableCell>
                      <TableCell>
                        <Badge className={processor.enabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {processor.enabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={processor.apiKeySet ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {processor.apiKeySet ? "Set" : "Missing"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {processor.supportedCurrencies.slice(0, 3).map((currency) => (
                            <Badge key={currency} variant="secondary" className="text-xs">
                              {currency}
                            </Badge>
                          ))}
                          {processor.supportedCurrencies.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{processor.supportedCurrencies.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {processor.fees.percentage}% + {formatCurrency(processor.fees.fixed)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={processor.enabled}
                            onCheckedChange={(checked) => handleProcessorToggle(processor.id, checked)}
                          />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setSelectedProcessor(processor);
                                setShowProcessorDialog(true);
                              }}>
                                <Edit className="h-4 w-4 mr-2" />
                                Configure
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Webhook
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Processor Configuration Dialog */}
      <Dialog open={showProcessorDialog} onOpenChange={setShowProcessorDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configure {selectedProcessor?.name}</DialogTitle>
            <DialogDescription>
              Update settings for this payment processor
            </DialogDescription>
          </DialogHeader>
          {selectedProcessor && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="Enter API key"
                    defaultValue={selectedProcessor.apiKeySet ? "••••••••••••••••" : ""}
                  />
                </div>
                <div>
                  <Label htmlFor="webhook">Webhook URL</Label>
                  <Input
                    id="webhook"
                    value={selectedProcessor.webhookUrl}
                    readOnly
                  />
                </div>
              </div>
              <div>
                <Label>Supported Currencies</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedProcessor.supportedCurrencies.map((currency) => (
                    <Badge key={currency} variant="secondary">
                      {currency}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="percentageFee">Percentage Fee (%)</Label>
                  <Input
                    id="percentageFee"
                    type="number"
                    step="0.01"
                    defaultValue={selectedProcessor.fees.percentage}
                  />
                </div>
                <div>
                  <Label htmlFor="fixedFee">Fixed Fee</Label>
                  <Input
                    id="fixedFee"
                    type="number"
                    step="0.01"
                    defaultValue={selectedProcessor.fees.fixed}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProcessorDialog(false)}>
              Cancel
            </Button>
            <Button>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}