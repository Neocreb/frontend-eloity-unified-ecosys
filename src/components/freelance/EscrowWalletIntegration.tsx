import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Wallet,
  Shield,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Timer,
  CreditCard,
  Bitcoin,
  Coins,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  Settings,
  Info,
  Gavel,
  RefreshCw,
  Eye,
  EyeOff,
  Zap,
  Lock,
  Unlock,
} from "lucide-react";
import { useWalletContext } from "@/contexts/WalletContext";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface EscrowWalletTransaction {
  id: string;
  projectId: string;
  projectTitle: string;
  type: "deposit" | "release" | "refund" | "dispute_hold";
  amount: number;
  currency: "BTC" | "ETH" | "USDT" | "Eloity Points";
  status: "pending" | "confirmed" | "completed" | "failed";
  fromAddress?: string;
  toAddress?: string;
  txHash?: string;
  blockConfirmations?: number;
  requiredConfirmations?: number;
  autoReleaseDate?: Date;
  milestone?: {
    id: string;
    title: string;
    description: string;
  };
  disputeId?: string;
  createdAt: Date;
  completedAt?: Date;
  notes?: string;
}

interface EscrowBalance {
  currency: string;
  available: number;
  escrow: number;
  pending: number;
  total: number;
  usdValue: number;
  transactions: EscrowWalletTransaction[];
}

interface EscrowWalletIntegrationProps {
  projectId?: string;
  userRole: "client" | "freelancer";
  onEscrowUpdate?: (transaction: EscrowWalletTransaction) => void;
}

export const EscrowWalletIntegration: React.FC<
  EscrowWalletIntegrationProps
> = ({ projectId, userRole, onEscrowUpdate }) => {
  const [balances, setBalances] = useState<EscrowBalance[]>([]);
  const [transactions, setTransactions] = useState<EscrowWalletTransaction[]>(
    [],
  );
  const [selectedCurrency, setSelectedCurrency] = useState<string>("USDT");
  const [showCreateEscrow, setShowCreateEscrow] = useState(false);
  const [showWalletDetails, setShowWalletDetails] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [loading, setLoading] = useState(false);

  const { walletBalance, refreshWallet } = useWalletContext();
  const { toast } = useToast();

  // Mock exchange rates
  const exchangeRates = {
    BTC: 43250.0,
    ETH: 2680.5,
    USDT: 1.0,
    Eloity Points: 0.1,
  };

  // Initialize mock data
  useEffect(() => {
    loadEscrowData();
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadEscrowData(false);
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const loadEscrowData = async (showLoading = true) => {
    if (showLoading) setLoading(true);

    try {
      // Mock data generation
      const mockBalances: EscrowBalance[] = [
        {
          currency: "USDT",
          available: 2847.5,
          escrow: 1250.0,
          pending: 150.0,
          total: 4247.5,
          usdValue: 4247.5,
          transactions: [],
        },
        {
          currency: "BTC",
          available: 0.089,
          escrow: 0.025,
          pending: 0.005,
          total: 0.119,
          usdValue: 0.119 * exchangeRates.BTC,
          transactions: [],
        },
        {
          currency: "ETH",
          available: 1.45,
          escrow: 0.8,
          pending: 0.1,
          total: 2.35,
          usdValue: 2.35 * exchangeRates.ETH,
          transactions: [],
        },
        {
          currency: "Eloity Points",
          available: 15420,
          escrow: 2500,
          pending: 0,
          total: 17920,
          usdValue: 17920 * exchangeRates.Eloity Points,
          transactions: [],
        },
      ];

      const mockTransactions: EscrowWalletTransaction[] = [
        {
          id: "tx_001",
          projectId: "proj_001",
          projectTitle: "E-commerce Website Development",
          type: "deposit",
          amount: 1250.0,
          currency: "USDT",
          status: "completed",
          fromAddress: "0x742d35Cc6bD3b5b8C0532d3F4E8a1FcF8bE6FcDA",
          toAddress: "escrow_0x123...abc",
          txHash: "0x45f2a8b9c3d1e7f6a2b4c8d9e3f1a5b7c9d2e4f6",
          blockConfirmations: 12,
          requiredConfirmations: 6,
          autoReleaseDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          milestone: {
            id: "milestone_001",
            title: "Project Setup & Design",
            description: "Initial setup and UI/UX design completion",
          },
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          completedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
          notes: "First milestone payment for project setup",
        },
        {
          id: "tx_002",
          projectId: "proj_002",
          projectTitle: "Mobile App Development",
          type: "release",
          amount: 0.025,
          currency: "BTC",
          status: "pending",
          fromAddress: "escrow_bc1q123...xyz",
          toAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
          autoReleaseDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          milestone: {
            id: "milestone_002",
            title: "Backend Development",
            description: "API development and database setup",
          },
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
          notes: "Release pending client approval",
        },
        {
          id: "tx_003",
          projectId: "proj_003",
          projectTitle: "Smart Contract Audit",
          type: "dispute_hold",
          amount: 0.8,
          currency: "ETH",
          status: "confirmed",
          disputeId: "dispute_001",
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
          notes: "Funds held pending dispute resolution",
        },
      ];

      setBalances(mockBalances);
      setTransactions(mockTransactions);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load escrow data",
        variant: "destructive",
      });
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === "Eloity Points") {
      return `${amount.toLocaleString()} SP`;
    }

    const decimals = currency === "BTC" ? 8 : currency === "ETH" ? 6 : 2;
    return `${amount.toFixed(decimals)} ${currency}`;
  };

  const getCurrencyIcon = (currency: string) => {
    switch (currency) {
      case "BTC":
        return <Bitcoin className="w-4 h-4 text-orange-500" />;
      case "ETH":
        return <Coins className="w-4 h-4 text-blue-500" />;
      case "USDT":
        return <DollarSign className="w-4 h-4 text-green-500" />;
      case "Eloity Points":
        return <Zap className="w-4 h-4 text-purple-500" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownLeft className="w-4 h-4 text-green-500" />;
      case "release":
        return <ArrowUpRight className="w-4 h-4 text-blue-500" />;
      case "refund":
        return <RefreshCw className="w-4 h-4 text-orange-500" />;
      case "dispute_hold":
        return <Gavel className="w-4 h-4 text-red-500" />;
      default:
        return <History className="w-4 h-4" />;
    }
  };

  const handleCreateEscrow = async (formData: any) => {
    setLoading(true);
    try {
      // Mock escrow creation
      const newTransaction: EscrowWalletTransaction = {
        id: `tx_${Date.now()}`,
        projectId: formData.projectId || "new_project",
        projectTitle: formData.projectTitle,
        type: "deposit",
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        status: "pending",
        autoReleaseDate: new Date(
          Date.now() + formData.autoReleaseHours * 60 * 60 * 1000,
        ),
        createdAt: new Date(),
        notes: formData.notes,
      };

      setTransactions((prev) => [newTransaction, ...prev]);
      setShowCreateEscrow(false);

      if (onEscrowUpdate) {
        onEscrowUpdate(newTransaction);
      }

      toast({
        title: "Escrow Created",
        description: "Escrow contract has been created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create escrow",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReleaseEscrow = async (transactionId: string) => {
    setLoading(true);
    try {
      setTransactions((prev) =>
        prev.map((tx) =>
          tx.id === transactionId
            ? { ...tx, status: "completed", completedAt: new Date() }
            : tx,
        ),
      );

      toast({
        title: "Funds Released",
        description: "Escrow funds have been released successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to release funds",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const CreateEscrowForm = () => {
    const [formData, setFormData] = useState({
      projectTitle: "",
      amount: "",
      currency: "USDT",
      autoReleaseHours: "72",
      notes: "",
    });

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="projectTitle">Project Title</Label>
            <Input
              id="projectTitle"
              value={formData.projectTitle}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  projectTitle: e.target.value,
                }))
              }
              placeholder="Enter project title"
              required
            />
          </div>
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.00000001"
              value={formData.amount}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, amount: e.target.value }))
              }
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="currency">Currency</Label>
            <Select
              value={formData.currency}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, currency: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USDT">USDT (Tether)</SelectItem>
                <SelectItem value="BTC">Bitcoin</SelectItem>
                <SelectItem value="ETH">Ethereum</SelectItem>
                <SelectItem value="Eloity Points">Eloity Points</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="autoReleaseHours">Auto-Release Time</Label>
            <Select
              value={formData.autoReleaseHours}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, autoReleaseHours: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24">24 Hours</SelectItem>
                <SelectItem value="48">48 Hours</SelectItem>
                <SelectItem value="72">72 Hours (Recommended)</SelectItem>
                <SelectItem value="168">1 Week</SelectItem>
                <SelectItem value="336">2 Weeks</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Input
            id="notes"
            value={formData.notes}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, notes: e.target.value }))
            }
            placeholder="Add any additional notes..."
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setShowCreateEscrow(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => handleCreateEscrow(formData)}
            disabled={!formData.projectTitle || !formData.amount}
          >
            Create Escrow
          </Button>
        </div>
      </div>
    );
  };

  const selectedBalance = balances.find((b) => b.currency === selectedCurrency);
  const filteredTransactions = projectId
    ? transactions.filter((tx) => tx.projectId === projectId)
    : transactions;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-500" />
            Escrow Wallet
          </h2>
          <p className="text-muted-foreground">
            Secure payments with crypto escrow protection
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadEscrowData()}
            disabled={loading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Dialog open={showCreateEscrow} onOpenChange={setShowCreateEscrow}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Create Escrow
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Escrow Contract</DialogTitle>
              </DialogHeader>
              <CreateEscrowForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {balances.map((balance) => (
          <Card
            key={balance.currency}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedCurrency === balance.currency ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedCurrency(balance.currency)}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getCurrencyIcon(balance.currency)}
                  <span className="font-semibold">{balance.currency}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setBalanceVisible(!balanceVisible);
                  }}
                >
                  {balanceVisible ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-semibold">
                    {balanceVisible
                      ? formatCurrency(balance.total, balance.currency)
                      : "••••••"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Available</span>
                  <span className="text-green-600">
                    {balanceVisible
                      ? formatCurrency(balance.available, balance.currency)
                      : "••••••"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">In Escrow</span>
                  <span className="text-blue-600">
                    {balanceVisible
                      ? formatCurrency(balance.escrow, balance.currency)
                      : "••••••"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">USD Value</span>
                  <span className="text-muted-foreground">
                    {balanceVisible
                      ? `$${balance.usdValue.toFixed(2)}`
                      : "••••••"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Settings Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Escrow Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-refresh">Auto Refresh</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically refresh balances
                </p>
              </div>
              <Switch
                id="auto-refresh"
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
              />
            </div>

            <div>
              <Label htmlFor="refresh-interval">Refresh Interval</Label>
              <Select
                value={refreshInterval.toString()}
                onValueChange={(value) => setRefreshInterval(parseInt(value))}
                disabled={!autoRefresh}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 seconds</SelectItem>
                  <SelectItem value="30">30 seconds</SelectItem>
                  <SelectItem value="60">1 minute</SelectItem>
                  <SelectItem value="300">5 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="balance-visible">Show Balances</Label>
                <p className="text-sm text-muted-foreground">
                  Display wallet balances
                </p>
              </div>
              <Switch
                id="balance-visible"
                checked={balanceVisible}
                onCheckedChange={setBalanceVisible}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed View for Selected Currency */}
      {selectedBalance && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getCurrencyIcon(selectedBalance.currency)}
              {selectedBalance.currency} Escrow Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-green-600 font-semibold text-sm mb-1">
                  Available
                </div>
                <div className="text-2xl font-bold text-green-700">
                  {balanceVisible
                    ? formatCurrency(
                        selectedBalance.available,
                        selectedBalance.currency,
                      )
                    : "••••••"}
                </div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-blue-600 font-semibold text-sm mb-1">
                  In Escrow
                </div>
                <div className="text-2xl font-bold text-blue-700">
                  {balanceVisible
                    ? formatCurrency(
                        selectedBalance.escrow,
                        selectedBalance.currency,
                      )
                    : "••••••"}
                </div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-yellow-600 font-semibold text-sm mb-1">
                  Pending
                </div>
                <div className="text-2xl font-bold text-yellow-700">
                  {balanceVisible
                    ? formatCurrency(
                        selectedBalance.pending,
                        selectedBalance.currency,
                      )
                    : "••••••"}
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <History className="w-5 h-5" />
                Recent Transactions
              </h3>

              {filteredTransactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>No escrow transactions found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTransactions.slice(0, 5).map((transaction) => (
                    <Card
                      key={transaction.id}
                      className="hover:shadow-sm transition-shadow"
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-muted rounded-full">
                              {getTransactionTypeIcon(transaction.type)}
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm">
                                {transaction.projectTitle}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {transaction.type
                                  .replace("_", " ")
                                  .toUpperCase()}{" "}
                                • {transaction.id}
                              </p>
                              {transaction.milestone && (
                                <p className="text-xs text-blue-600 mt-1">
                                  {transaction.milestone.title}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(transaction.createdAt, {
                                  addSuffix: true,
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">
                              {formatCurrency(
                                transaction.amount,
                                transaction.currency,
                              )}
                            </div>
                            <Badge
                              className={getStatusColor(transaction.status)}
                            >
                              {transaction.status}
                            </Badge>
                            {transaction.autoReleaseDate &&
                              transaction.status === "pending" && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  Auto-release:{" "}
                                  {formatDistanceToNow(
                                    transaction.autoReleaseDate,
                                    { addSuffix: true },
                                  )}
                                </div>
                              )}
                          </div>
                        </div>

                        {transaction.blockConfirmations !== undefined && (
                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>Confirmations</span>
                              <span>
                                {transaction.blockConfirmations}/
                                {transaction.requiredConfirmations}
                              </span>
                            </div>
                            <Progress
                              value={
                                (transaction.blockConfirmations /
                                  (transaction.requiredConfirmations || 1)) *
                                100
                              }
                              className="h-1"
                            />
                          </div>
                        )}

                        {userRole === "client" &&
                          transaction.type === "deposit" &&
                          transaction.status === "confirmed" && (
                            <div className="mt-3 flex gap-2">
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleReleaseEscrow(transaction.id)
                                }
                                disabled={loading}
                              >
                                <Unlock className="w-4 h-4 mr-2" />
                                Release Funds
                              </Button>
                              <Button size="sm" variant="outline">
                                <Gavel className="w-4 h-4 mr-2" />
                                Dispute
                              </Button>
                            </div>
                          )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integration with Unified Wallet */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Unified Wallet Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Freelance Earnings</h4>
              <div className="text-2xl font-bold text-green-600 mb-2">
                ${walletBalance?.freelance?.toFixed(2) || "0.00"}
              </div>
              <p className="text-sm text-muted-foreground">
                Total earnings from completed escrow releases
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Quick Actions</h4>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={refreshWallet}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync Wallet
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowWalletDetails(true)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </div>
            </div>
          </div>

          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Escrow funds are automatically synced with your unified wallet
              when released. All transactions are secured with multi-signature
              technology and blockchain verification.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default EscrowWalletIntegration;
