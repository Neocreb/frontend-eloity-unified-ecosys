import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  Building,
  CreditCard,
  Zap,
  Calendar,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Link,
  Unlink,
  DollarSign,
  Repeat,
  Bell,
  Settings,
  Smartphone,
  Wifi,
  Shield,
} from "lucide-react";

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountType: "checking" | "savings";
  isVerified: boolean;
  isDefault: boolean;
  balance?: number;
  lastUpdated: string;
}

interface Bill {
  id: string;
  name: string;
  category: "utilities" | "internet" | "phone" | "insurance" | "other";
  amount: number;
  dueDate: string;
  isRecurring: boolean;
  frequency: "monthly" | "quarterly" | "annually";
  isAutoPay: boolean;
  lastPaid?: string;
  status: "pending" | "paid" | "overdue";
}

interface Subscription {
  id: string;
  name: string;
  category: "streaming" | "software" | "fitness" | "news" | "other";
  amount: number;
  frequency: "monthly" | "annually";
  nextBilling: string;
  isActive: boolean;
  logo?: string;
  description: string;
}

const IntegrationManager = () => {
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState(
    [
      { id: "paypal", name: "PayPal", status: "disconnected" as const, lastSynced: null as string | null },
      { id: "applepay", name: "Apple Pay", status: "disconnected" as const, lastSynced: null as string | null },
      { id: "googlepay", name: "Google Pay", status: "disconnected" as const, lastSynced: null as string | null },
      { id: "stripe", name: "Stripe", status: "disconnected" as const, lastSynced: null as string | null },
    ]
  );

  const toggleIntegration = async (id: string) => {
    setIntegrations(prev => prev.map(i => i.id === id ? ({
      ...i,
      status: i.status === "connected" ? "disconnected" : "connected",
      lastSynced: i.status === "connected" ? i.lastSynced : new Date().toISOString(),
    }) : i));
    const name = id.charAt(0).toUpperCase() + id.slice(1);
    toast({ title: "Integration updated", description: `${name} ${integrations.find(i => i.id === id)?.status === "connected" ? "disconnected" : "connected"}` });
  };

  const syncIntegration = async (id: string) => {
    setIntegrations(prev => prev.map(i => i.id === id ? ({ ...i, lastSynced: new Date().toISOString() }) : i));
    toast({ title: "Synced", description: `Synced ${id}` });
  };
  
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([
    {
      id: "1",
      bankName: "Chase Bank",
      accountNumber: "****1234",
      accountType: "checking",
      isVerified: true,
      isDefault: true,
      balance: 5420.50,
      lastUpdated: "2024-01-15T10:30:00Z",
    },
    {
      id: "2",
      bankName: "Wells Fargo",
      accountNumber: "****5678",
      accountType: "savings",
      isVerified: false,
      isDefault: false,
      lastUpdated: "2024-01-14T15:20:00Z",
    },
  ]);

  const [bills, setBills] = useState<Bill[]>([
    {
      id: "1",
      name: "Electric Bill",
      category: "utilities",
      amount: 120.50,
      dueDate: "2024-01-25",
      isRecurring: true,
      frequency: "monthly",
      isAutoPay: false,
      status: "pending",
    },
    {
      id: "2",
      name: "Internet Service",
      category: "internet",
      amount: 79.99,
      dueDate: "2024-01-20",
      isRecurring: true,
      frequency: "monthly",
      isAutoPay: true,
      lastPaid: "2023-12-20",
      status: "paid",
    },
    {
      id: "3",
      name: "Phone Bill",
      category: "phone",
      amount: 65.00,
      dueDate: "2024-01-18",
      isRecurring: true,
      frequency: "monthly",
      isAutoPay: false,
      status: "overdue",
    },
  ]);

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([
    {
      id: "1",
      name: "Netflix",
      category: "streaming",
      amount: 15.99,
      frequency: "monthly",
      nextBilling: "2024-01-20",
      isActive: true,
      description: "Premium streaming service",
    },
    {
      id: "2",
      name: "Adobe Creative Cloud",
      category: "software",
      amount: 52.99,
      frequency: "monthly",
      nextBilling: "2024-01-25",
      isActive: true,
      description: "Design and creative tools",
    },
    {
      id: "3",
      name: "Spotify Premium",
      category: "streaming",
      amount: 9.99,
      frequency: "monthly",
      nextBilling: "2024-01-22",
      isActive: false,
      description: "Music streaming service",
    },
  ]);

  const [showAddBankDialog, setShowAddBankDialog] = useState(false);
  const [showAddBillDialog, setShowAddBillDialog] = useState(false);
  const [newBankAccount, setNewBankAccount] = useState({
    bankName: "",
    accountNumber: "",
    routingNumber: "",
    sortCode: "",
    swiftCode: "",
    accountType: "checking" as "checking" | "savings",
  });

  const [newBill, setNewBill] = useState({
    name: "",
    category: "utilities" as Bill["category"],
    amount: "",
    dueDate: "",
    isRecurring: false,
    frequency: "monthly" as Bill["frequency"],
  });

  const addBankAccount = async () => {
    try {
      const account: BankAccount = {
        id: Date.now().toString(),
        bankName: newBankAccount.bankName,
        accountNumber: `****${newBankAccount.accountNumber.slice(-4)}`,
        accountType: newBankAccount.accountType,
        isVerified: false,
        isDefault: bankAccounts.length === 0,
        lastUpdated: new Date().toISOString(),
      };

      setBankAccounts(prev => [...prev, account]);
      setShowAddBankDialog(false);
      setNewBankAccount({
        bankName: "",
        accountNumber: "",
        routingNumber: "",
        sortCode: "",
        swiftCode: "",
        accountType: "checking",
      });

      toast({
        title: "Bank Account Added",
        description: "Your bank account has been added. Verification will take 1-2 business days.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add bank account",
        variant: "destructive",
      });
    }
  };

  const addBill = async () => {
    try {
      const bill: Bill = {
        id: Date.now().toString(),
        name: newBill.name,
        category: newBill.category,
        amount: parseFloat(newBill.amount),
        dueDate: newBill.dueDate,
        isRecurring: newBill.isRecurring,
        frequency: newBill.frequency,
        isAutoPay: false,
        status: "pending",
      };

      setBills(prev => [...prev, bill]);
      setShowAddBillDialog(false);
      setNewBill({
        name: "",
        category: "utilities",
        amount: "",
        dueDate: "",
        isRecurring: false,
        frequency: "monthly",
      });

      toast({
        title: "Bill Added",
        description: "Your bill has been added to tracking.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add bill",
        variant: "destructive",
      });
    }
  };

  const toggleAutoPay = async (billId: string) => {
    setBills(prev => prev.map(bill => 
      bill.id === billId 
        ? { ...bill, isAutoPay: !bill.isAutoPay }
        : bill
    ));

    toast({
      title: "AutoPay Updated",
      description: "AutoPay settings have been updated",
    });
  };

  const toggleSubscription = async (subscriptionId: string) => {
    setSubscriptions(prev => prev.map(sub => 
      sub.id === subscriptionId 
        ? { ...sub, isActive: !sub.isActive }
        : sub
    ));

    const subscription = subscriptions.find(s => s.id === subscriptionId);
    toast({
      title: subscription?.isActive ? "Subscription Paused" : "Subscription Activated",
      description: `${subscription?.name} has been ${subscription?.isActive ? "paused" : "activated"}`,
    });
  };

  const verifyBankAccount = async (accountId: string) => {
    setBankAccounts(prev => prev.map(account => 
      account.id === accountId 
        ? { ...account, isVerified: true }
        : account
    ));

    toast({
      title: "Account Verified",
      description: "Bank account verification completed successfully",
    });
  };

  const setDefaultAccount = async (accountId: string) => {
    setBankAccounts(prev => prev.map(account => ({
      ...account,
      isDefault: account.id === accountId,
    })));

    toast({
      title: "Default Account Updated",
      description: "Your default bank account has been updated",
    });
  };

  const removeBankAccount = async (accountId: string) => {
    setBankAccounts(prev => prev.filter(account => account.id !== accountId));
    toast({
      title: "Account Removed",
      description: "Bank account has been removed from your wallet",
    });
  };

  const removeBill = async (billId: string) => {
    setBills(prev => prev.filter(bill => bill.id !== billId));
    toast({
      title: "Bill Removed",
      description: "Bill has been removed from tracking",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "overdue": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "utilities": return <Zap className="h-4 w-4" />;
      case "internet": return <Wifi className="h-4 w-4" />;
      case "phone": return <Smartphone className="h-4 w-4" />;
      case "streaming": return <Smartphone className="h-4 w-4" />;
      case "software": return <Settings className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const totalMonthlySubscriptions = subscriptions
    .filter(sub => sub.isActive)
    .reduce((sum, sub) => sum + (sub.frequency === "monthly" ? sub.amount : sub.amount / 12), 0);

  const upcomingBills = bills
    .filter(bill => bill.status === "pending" || bill.status === "overdue")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Connected Banks</p>
                <p className="text-2xl font-bold">{bankAccounts.length}</p>
              </div>
              <Building className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {bankAccounts.filter(acc => acc.isVerified).length} verified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Subscriptions</p>
                <p className="text-2xl font-bold">${totalMonthlySubscriptions.toFixed(2)}</p>
              </div>
              <Repeat className="h-8 w-8 text-purple-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {subscriptions.filter(sub => sub.isActive).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming Bills</p>
                <p className="text-2xl font-bold">{upcomingBills.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {bills.filter(bill => bill.status === "overdue").length} overdue
            </p>
          </CardContent>
        </Card>
      </div>


      {/* Bank Accounts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Traditional Bank Accounts
            </CardTitle>
            <Dialog open={showAddBankDialog} onOpenChange={setShowAddBankDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Bank
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Bank Account</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bank-name">Bank Name</Label>
                    <Select
                      value={newBankAccount.bankName}
                      onValueChange={(value) => setNewBankAccount(prev => ({ ...prev, bankName: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your bank" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* US Banks */}
                        <SelectItem value="Chase Bank">Chase Bank</SelectItem>
                        <SelectItem value="Wells Fargo">Wells Fargo</SelectItem>
                        <SelectItem value="Bank of America">Bank of America</SelectItem>
                        <SelectItem value="Citibank">Citibank</SelectItem>
                        <SelectItem value="Capital One">Capital One</SelectItem>
                        <SelectItem value="TD Bank">TD Bank</SelectItem>
                        <SelectItem value="PNC Bank">PNC Bank</SelectItem>
                        <SelectItem value="US Bank">US Bank</SelectItem>
                        <SelectItem value="Truist Bank">Truist Bank</SelectItem>

                        {/* UK Banks */}
                        <SelectItem value="HSBC UK">HSBC UK</SelectItem>
                        <SelectItem value="Barclays UK">Barclays UK</SelectItem>
                        <SelectItem value="Lloyds Bank">Lloyds Bank</SelectItem>
                        <SelectItem value="NatWest">NatWest</SelectItem>
                        <SelectItem value="Santander UK">Santander UK</SelectItem>

                        {/* European Banks */}
                        <SelectItem value="Deutsche Bank">Deutsche Bank</SelectItem>
                        <SelectItem value="BNP Paribas">BNP Paribas</SelectItem>
                        <SelectItem value="ING Bank">ING Bank</SelectItem>
                        <SelectItem value="Santander Spain">Santander Spain</SelectItem>

                        {/* International Banks */}
                        <SelectItem value="HSBC International">HSBC International</SelectItem>
                        <SelectItem value="Standard Chartered">Standard Chartered</SelectItem>
                        <SelectItem value="Citibank International">Citibank International</SelectItem>

                        <SelectItem value="Other">Other Bank</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="account-number">Account Number</Label>
                    <Input
                      id="account-number"
                      placeholder="Enter account number"
                      value={newBankAccount.accountNumber}
                      onChange={(e) => setNewBankAccount(prev => ({ ...prev, accountNumber: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="routing-number">Routing Number (US Banks)</Label>
                    <Input
                      id="routing-number"
                      placeholder="021000021"
                      value={newBankAccount.routingNumber}
                      onChange={(e) => setNewBankAccount(prev => ({ ...prev, routingNumber: e.target.value }))}
                      maxLength={9}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sort-code">Sort Code (UK/SA Banks)</Label>
                    <Input
                      id="sort-code"
                      placeholder="12-34-56"
                      value={newBankAccount.sortCode}
                      onChange={(e) => setNewBankAccount(prev => ({ ...prev, sortCode: e.target.value }))}
                      maxLength={8}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="swift-code">SWIFT/BIC Code (International)</Label>
                    <Input
                      id="swift-code"
                      placeholder="ABNANL2A"
                      value={newBankAccount.swiftCode}
                      onChange={(e) => setNewBankAccount(prev => ({ ...prev, swiftCode: e.target.value }))}
                      maxLength={11}
                    />
                    <p className="text-xs text-gray-500">
                      Required for international transfers and most African banks
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="account-type">Account Type</Label>
                    <Select
                      value={newBankAccount.accountType}
                      onValueChange={(value) => setNewBankAccount(prev => ({ ...prev, accountType: value as "checking" | "savings" }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checking">Checking</SelectItem>
                        <SelectItem value="savings">Savings</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={addBankAccount} className="w-full">
                    Add Bank Account
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {bankAccounts.map((account) => (
            <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Building className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{account.bankName}</p>
                    {account.isDefault && (
                      <Badge variant="secondary">Default</Badge>
                    )}
                    <Badge variant={account.isVerified ? "default" : "destructive"}>
                      {account.isVerified ? "Verified" : "Unverified"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    {account.accountType} • {account.accountNumber}
                  </p>
                  {account.balance && (
                    <p className="text-sm font-medium text-green-600">
                      Balance: ${account.balance.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {!account.isVerified && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => verifyBankAccount(account.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Verify
                  </Button>
                )}
                {!account.isDefault && account.isVerified && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDefaultAccount(account.id)}
                  >
                    Set Default
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => removeBankAccount(account.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Bill Payments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Bill Payments
            </CardTitle>
            <Dialog open={showAddBillDialog} onOpenChange={setShowAddBillDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Bill
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Bill</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bill-name">Bill Name</Label>
                    <Input
                      id="bill-name"
                      placeholder="e.g., Electric Bill"
                      value={newBill.name}
                      onChange={(e) => setNewBill(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bill-category">Category</Label>
                    <Select
                      value={newBill.category}
                      onValueChange={(value) => setNewBill(prev => ({ ...prev, category: value as Bill["category"] }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utilities">Utilities</SelectItem>
                        <SelectItem value="internet">Internet</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="insurance">Insurance</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bill-amount">Amount</Label>
                    <Input
                      id="bill-amount"
                      type="number"
                      placeholder="0.00"
                      value={newBill.amount}
                      onChange={(e) => setNewBill(prev => ({ ...prev, amount: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bill-due-date">Due Date</Label>
                    <Input
                      id="bill-due-date"
                      type="date"
                      value={newBill.dueDate}
                      onChange={(e) => setNewBill(prev => ({ ...prev, dueDate: e.target.value }))}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newBill.isRecurring}
                      onCheckedChange={(checked) => setNewBill(prev => ({ ...prev, isRecurring: checked }))}
                    />
                    <Label>Recurring bill</Label>
                  </div>

                  {newBill.isRecurring && (
                    <div className="space-y-2">
                      <Label htmlFor="bill-frequency">Frequency</Label>
                      <Select
                        value={newBill.frequency}
                        onValueChange={(value) => setNewBill(prev => ({ ...prev, frequency: value as Bill["frequency"] }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="annually">Annually</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <Button onClick={addBill} className="w-full">
                    Add Bill
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {bills.map((bill) => (
            <div key={bill.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-full">
                  {getCategoryIcon(bill.category)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{bill.name}</p>
                    <Badge className={getStatusColor(bill.status)}>
                      {bill.status}
                    </Badge>
                    {bill.isRecurring && (
                      <Badge variant="outline">
                        <Repeat className="h-3 w-3 mr-1" />
                        {bill.frequency}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    ${bill.amount.toFixed(2)} • Due: {new Date(bill.dueDate).toLocaleDateString()}
                  </p>
                  {bill.isAutoPay && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      AutoPay enabled
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={bill.isAutoPay ? "default" : "outline"}
                  onClick={() => toggleAutoPay(bill.id)}
                >
                  {bill.isAutoPay ? "Disable AutoPay" : "Enable AutoPay"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => removeBill(bill.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Subscription Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Repeat className="h-5 w-5" />
            Subscription Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div>
              <p className="font-medium">Total Monthly Cost</p>
              <p className="text-sm text-gray-600">Active subscriptions</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">
                ${totalMonthlySubscriptions.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">per month</p>
            </div>
          </div>

          {subscriptions.map((subscription) => (
            <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-full">
                  {getCategoryIcon(subscription.category)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{subscription.name}</p>
                    <Badge variant={subscription.isActive ? "default" : "secondary"}>
                      {subscription.isActive ? "Active" : "Paused"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{subscription.description}</p>
                  <p className="text-sm font-medium">
                    ${subscription.amount.toFixed(2)}/{subscription.frequency}
                  </p>
                  <p className="text-xs text-gray-500">
                    Next billing: {new Date(subscription.nextBilling).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={subscription.isActive ? "destructive" : "default"}
                  onClick={() => toggleSubscription(subscription.id)}
                >
                  {subscription.isActive ? "Pause" : "Resume"}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationManager;
