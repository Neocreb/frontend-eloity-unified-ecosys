import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import {
  Zap,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Search,
  Filter,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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

const AdminUtilitiesManagement = () => {
  const { toast } = useToast();
  const { session } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('NG');
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch operators from real API
  const fetchOperators = async (countryCode: string) => {
    if (!session?.access_token) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/reloadly/operators?countryCode=${countryCode}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success && data.operators) {
        setOperators(data.operators);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch operators',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error fetching operators:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch operators',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch transactions from real API
  const fetchTransactions = async () => {
    if (!session?.access_token) return;

    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/reloadly/transactions', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success && data.transactions) {
        setTransactions(data.transactions);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch transactions',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch transactions',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Sync operators from RELOADLY
  const handleSyncOperators = async () => {
    if (!session?.access_token) return;

    try {
      setIsSyncing(true);
      const response = await fetch('/api/admin/reloadly/operators/sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ countryCode: selectedCountry })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Success',
          description: `Synced ${data.operatorsCount || 0} operators from RELOADLY`,
          variant: 'default'
        });
        await fetchOperators(selectedCountry);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to sync operators',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error syncing operators:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to sync operators',
        variant: 'destructive'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    if (session?.access_token) {
      fetchOperators(selectedCountry);
      fetchTransactions();
    }
  }, [session?.access_token]);

  // Update operators when country changes
  useEffect(() => {
    if (session?.access_token) {
      fetchOperators(selectedCountry);
    }
  }, [selectedCountry]);

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.userId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || tx.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Success</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Pending</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-50 text-red-700">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Utilities Management</h1>
          <p className="text-gray-600 mt-1">Manage utility bill payment operators and transactions</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="operators" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="operators">Operators</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        {/* Operators Tab */}
        <TabsContent value="operators" className="space-y-6">
          {/* Country Selection and Sync Button */}
          <Card>
            <CardHeader>
              <CardTitle>Operator Management</CardTitle>
              <CardDescription>Sync and manage utility bill payment operators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Country</label>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NG">Nigeria</SelectItem>
                      <SelectItem value="KE">Kenya</SelectItem>
                      <SelectItem value="GH">Ghana</SelectItem>
                      <SelectItem value="UG">Uganda</SelectItem>
                      <SelectItem value="ZA">South Africa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleSyncOperators}
                  disabled={isSyncing || isLoading}
                  className="gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Syncing...' : 'Sync Operators'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Operators List */}
          <div className="grid gap-4">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading operators...</div>
            ) : operators.length === 0 ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No operators found. Click "Sync Operators" to fetch from RELOADLY API.
                </AlertDescription>
              </Alert>
            ) : (
              operators.map(operator => (
                <Card key={operator.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          {operator.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {operator.countryName} ({operator.countryCode})
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="font-semibold">{operator.commissionRate}% commission</span>
                        </div>
                        <Badge variant={operator.isActive ? 'default' : 'secondary'}>
                          {operator.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardHeader>
              <CardTitle>Filter Transactions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by provider or user ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="gap-2"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Transactions List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading transactions...</div>
            ) : filteredTransactions.length === 0 ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No transactions found matching your filters.
                </AlertDescription>
              </Alert>
            ) : (
              filteredTransactions.map(transaction => (
                <Card key={transaction.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div className="space-y-1 flex-1">
                        <h3 className="font-semibold">{transaction.providerName}</h3>
                        <p className="text-sm text-gray-600">User: {transaction.userId}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="font-semibold flex items-center gap-2 justify-end">
                          <DollarSign className="w-4 h-4" />
                          {transaction.amount.toFixed(2)}
                        </div>
                        {getStatusBadge(transaction.status)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminUtilitiesManagement;
