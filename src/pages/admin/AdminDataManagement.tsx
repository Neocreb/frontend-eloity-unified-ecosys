import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import {
  Wifi,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Search,
  Filter,
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

const AdminDataManagement = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('');

  // Mock data for transactions
  const mockTransactions: Transaction[] = [
    {
      id: 'tx1',
      userId: 'user123',
      providerName: 'MTN Data Nigeria',
      amount: 5000,
      status: 'success',
      createdAt: '2025-11-20T10:30:00Z'
    },
    {
      id: 'tx2',
      userId: 'user456',
      providerName: 'Airtel Data Nigeria',
      amount: 2000,
      status: 'pending',
      createdAt: '2025-11-18T14:15:00Z'
    },
    {
      id: 'tx3',
      userId: 'user789',
      providerName: 'Glo Data Nigeria',
      amount: 10000,
      status: 'failed',
      createdAt: '2025-11-22T09:45:00Z'
    }
  ];

  // Mock data for operators
  const mockOperators: Operator[] = [
    {
      id: 1,
      name: 'MTN Data Nigeria',
      countryCode: 'NG',
      countryName: 'Nigeria',
      commissionRate: 3.0,
      isActive: true,
      logoUrl: '/placeholder-operator.jpg'
    },
    {
      id: 2,
      name: 'Airtel Data Nigeria',
      countryCode: 'NG',
      countryName: 'Nigeria',
      commissionRate: 2.5,
      isActive: true,
      logoUrl: '/placeholder-operator.jpg'
    },
    {
      id: 3,
      name: '9Mobile Data Nigeria',
      countryCode: 'NG',
      countryName: 'Nigeria',
      commissionRate: 2.2,
      isActive: false,
      logoUrl: '/placeholder-operator.jpg'
    }
  ];

  useEffect(() => {
    setTransactions(mockTransactions);
    setOperators(mockOperators);
  }, []);

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.providerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || tx.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredOperators = operators.filter(op => {
    const matchesCountry = selectedCountry === '' || op.countryCode === selectedCountry;
    return matchesCountry;
  });

  const handleSyncOperators = async () => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Operators Synced',
        description: 'Successfully synced data operators from RELOADLY',
      });
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

  const handleToggleOperator = async (id: number, currentStatus: boolean) => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setOperators(operators.map(op => 
        op.id === id ? { ...op, isActive: !currentStatus } : op
      ));
      
      toast({
        title: 'Operator Updated',
        description: `Operator ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update operator',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wifi className="h-6 w-6" />
          Data Management
        </h1>
        <p className="text-muted-foreground">
          Manage data bundles and operator settings
        </p>
      </div>

      <Alert className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Data bundles are processed through RELOADLY. Ensure operator settings are correctly configured.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="operators">Operators</TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Bundle Transactions</CardTitle>
              <CardDescription>Monitor and manage data bundle purchases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Operators Tab */}
        <TabsContent value="operators" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sync Operators</CardTitle>
              <CardDescription>Synchronize data operators from RELOADLY API</CardDescription>
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
              <CardDescription>Manage data service providers</CardDescription>
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

export default AdminDataManagement;