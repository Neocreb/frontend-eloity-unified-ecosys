import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import {
  Zap,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Search,
} from 'lucide-react';

interface Transaction {
  id: string;
  userId: string;
  providerName: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface Operator {
  id: number;
  name: string;
  countryCode: string;
  countryName: string;
  commissionRate: number;
  isActive: boolean;
  logoUrl?: string;
}

interface Statistics {
  totalTransactions: number;
  totalAmount: number;
  totalFees: number;
  byStatus: Record<string, number>;
  averageTransaction: number;
}

const AdminUtilitiesManagement: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchOperators(),
        fetchTransactions(),
        fetchStatistics(),
      ]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOperators = async () => {
    try {
      const response = await fetch('/api/admin/reloadly/operators?serviceType=utility');
      if (!response.ok) throw new Error('Failed to fetch operators');
      const { operators } = await response.json();
      setOperators(operators);
    } catch (error) {
      console.error('Error fetching operators:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/admin/reloadly/transactions?type=utility&limit=20');
      if (!response.ok) throw new Error('Failed to fetch transactions');
      const { transactions } = await response.json();
      setTransactions(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/admin/reloadly/transactions/statistics');
      if (!response.ok) throw new Error('Failed to fetch statistics');
      const { statistics } = await response.json();
      setStatistics(statistics);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleSyncOperators = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/reloadly/operators/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ countryCode: selectedCountry || undefined }),
      });
      if (!response.ok) throw new Error('Sync failed');
      const { synced } = await response.json();
      toast({
        title: 'Success',
        description: `Synced ${synced} operators`,
      });
      await fetchOperators();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sync operators',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleOperator = async (operatorId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/reloadly/operators/${operatorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (!response.ok) throw new Error('Update failed');
      toast({
        title: 'Success',
        description: `Operator ${!currentStatus ? 'activated' : 'deactivated'}`,
      });
      await fetchOperators();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update operator',
        variant: 'destructive',
      });
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.providerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredOperators = operators.filter((op) =>
    op.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Zap className="h-8 w-8 text-yellow-600" />
          Utilities Management
        </h1>
        <p className="text-muted-foreground mt-1">Manage utility bill payment providers and monitor transactions</p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Transactions</p>
                  <p className="text-3xl font-bold">{statistics.totalTransactions}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-yellow-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Amount</p>
                  <p className="text-3xl font-bold">${statistics.totalAmount.toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Fees</p>
                  <p className="text-3xl font-bold">${statistics.totalFees.toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-orange-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Avg Transaction</p>
                  <p className="text-3xl font-bold">${statistics.averageTransaction.toFixed(2)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="operators">Operators</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest utility bill payment transactions in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search and Filter */}
                <div className="flex gap-2 mb-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by provider..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Transactions List */}
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex-1">
                          <div className="font-medium flex items-center gap-2">
                            {tx.providerName}
                            <Badge
                              variant={
                                tx.status === 'success'
                                  ? 'default'
                                  : tx.status === 'pending'
                                    ? 'secondary'
                                    : 'destructive'
                              }
                            >
                              {tx.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(tx.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${tx.amount.toFixed(2)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      No transactions found
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Operators Tab */}
        <TabsContent value="operators" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sync Operators</CardTitle>
              <CardDescription>Synchronize utility bill operators from RELOADLY API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Countries</SelectItem>
                    <SelectItem value="NG">Nigeria</SelectItem>
                    <SelectItem value="GH">Ghana</SelectItem>
                    <SelectItem value="KE">Kenya</SelectItem>
                    <SelectItem value="UG">Uganda</SelectItem>
                    <SelectItem value="TZ">Tanzania</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleSyncOperators} disabled={isLoading}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync Operators
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Operators</CardTitle>
              <CardDescription>Manage utility bill payment providers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredOperators.length > 0 ? (
                  filteredOperators.map((op) => (
                    <div
                      key={op.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {op.logoUrl && (
                          <img src={op.logoUrl} alt={op.name} className="h-8 w-8 rounded" />
                        )}
                        <div>
                          <p className="font-medium">{op.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {op.countryName} ({op.countryCode})
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Commission: {op.commissionRate}%
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={op.isActive ? 'default' : 'secondary'}>
                          {op.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleOperator(op.id, op.isActive)}
                          disabled={isLoading}
                        >
                          {op.isActive ? 'Disable' : 'Enable'}
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No operators found. Click "Sync Operators" to load them.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminUtilitiesManagement;
