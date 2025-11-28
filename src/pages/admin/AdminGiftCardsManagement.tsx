import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import {
  Copy,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Gift,
  TrendingUp,
  DollarSign,
  Search,
} from 'lucide-react';

interface GiftCardRecord {
  id: string;
  userId: string;
  retailerName: string;
  amount: number;
  code: string;
  status: 'active' | 'redeemed' | 'pending' | 'expired';
  direction: 'buy' | 'sell';
  createdAt: string;
}

const AdminGiftCardsManagement = () => {
  const { toast } = useToast();
  const [records, setRecords] = useState<GiftCardRecord[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data for gift card records
  const mockRecords: GiftCardRecord[] = [
    {
      id: '1',
      userId: 'user123',
      retailerName: 'Amazon',
      amount: 50.00,
      code: 'AMZN-XXXX-XXXX-1234',
      status: 'active',
      direction: 'buy',
      createdAt: '2025-11-20T10:30:00Z'
    },
    {
      id: '2',
      userId: 'user456',
      retailerName: 'Google Play',
      amount: 25.00,
      code: 'GPLY-XXXX-XXXX-5678',
      status: 'redeemed',
      direction: 'buy',
      createdAt: '2025-11-18T14:15:00Z'
    },
    {
      id: '3',
      userId: 'user789',
      retailerName: 'Steam',
      amount: 100.00,
      code: 'STM-XXXX-XXXX-9012',
      status: 'active',
      direction: 'buy',
      createdAt: '2025-11-22T09:45:00Z'
    }
  ];

  // Mock data for transactions
  const mockTransactions = [
    {
      id: 'tx1',
      userId: 'user123',
      providerName: 'RELOADLY',
      amount: 50.00,
      status: 'success',
      createdAt: '2025-11-20T10:30:00Z'
    },
    {
      id: 'tx2',
      userId: 'user456',
      providerName: 'RELOADLY',
      amount: 25.00,
      status: 'pending',
      createdAt: '2025-11-18T14:15:00Z'
    }
  ];

  useEffect(() => {
    setRecords(mockRecords);
    setTransactions(mockTransactions);
  }, []);

  const filtered = records.filter(r => {
    const matchesSearch = r.retailerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = status === 'all' || r.status === status;
    return matchesSearch && matchesStatus;
  });

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.providerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || tx.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const setStatusFor = async (id: string, newStatus: string) => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setRecords(records.map(r => 
        r.id === id ? { ...r, status: newStatus as any } : r
      ));
      
      toast({
        title: 'Status Updated',
        description: `Gift card status updated to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const remove = async (id: string) => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setRecords(records.filter(r => r.id !== id));
      
      toast({
        title: 'Gift Card Removed',
        description: 'Gift card record has been deleted',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove gift card',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Transactions Refreshed',
        description: 'Latest transactions loaded',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch transactions',
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
          <Gift className="h-6 w-6" />
          Gift Cards Management
        </h1>
        <p className="text-muted-foreground">
          Manage gift card inventory and transactions
        </p>
      </div>

      <Tabs defaultValue="inventory" className="space-y-6">
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gift Card Inventory</CardTitle>
              <CardDescription>Manage gift card records and status</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by retailer or code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={status === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatus('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={status === 'active' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatus('active')}
                  >
                    Active
                  </Button>
                  <Button
                    variant={status === 'redeemed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatus('redeemed')}
                  >
                    Redeemed
                  </Button>
                  <Button
                    variant={status === 'pending' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatus('pending')}
                  >
                    Pending
                  </Button>
                </div>
              </div>

              {/* Records List */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filtered.map((r) => (
                  <div key={r.id} className="flex items-start justify-between rounded border p-4 hover:bg-muted/50">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={r.direction === 'buy' ? 'default' : 'secondary'}>
                          {r.direction}
                        </Badge>
                        <span className="font-medium text-base">{r.retailerName}</span>
                        <Badge
                          variant={
                            r.status === 'redeemed'
                              ? 'secondary'
                              : r.status === 'active'
                                ? 'default'
                                : 'outline'
                          }
                        >
                          {r.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Amount: <span className="font-semibold">${r.amount.toFixed(2)}</span>
                      </div>
                      <div className="text-xs font-mono bg-muted p-2 rounded break-all">{r.code}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(r.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0 ml-4">
                      {r.status !== 'redeemed' && r.direction === 'buy' && (
                        <Button size="sm" onClick={() => setStatusFor(r.id, 'redeemed')}>
                          <CheckCircle2 className="h-4 w-4 mr-1" /> Mark Redeemed
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(r.code);
                          toast({ title: 'Copied to clipboard' });
                        }}
                      >
                        <Copy className="h-4 w-4 mr-1" /> Copy
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => remove(r.id)}>
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div className="text-sm text-muted-foreground text-center py-8">No records found.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest gift card purchase transactions from RELOADLY</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by brand..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button onClick={fetchTransactions} disabled={isLoading} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
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
                  <div className="text-center text-muted-foreground py-8">No transactions found</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminGiftCardsManagement;