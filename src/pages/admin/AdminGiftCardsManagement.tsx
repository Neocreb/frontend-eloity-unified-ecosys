import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import {
  giftCardService,
  GiftCardRecord,
  GiftCardStatus,
  updateGiftCardStatus,
  deleteGiftCardRecord,
} from '@/services/giftCardService';
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

interface Transaction {
  id: string;
  userId: string;
  providerName: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface Statistics {
  totalTransactions: number;
  totalAmount: number;
  totalFees: number;
  byStatus: Record<string, number>;
  averageTransaction: number;
}

const AdminGiftCardsManagement: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('records');
  const [items, setItems] = useState<GiftCardRecord[]>([]);
  const [status, setStatus] = useState<'all' | GiftCardStatus>('all');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      refresh();
      await Promise.all([fetchTransactions(), fetchStatistics()]);
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

  const refresh = () => giftCardService.list(200).then(setItems);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/admin/reloadly/transactions?type=gift_card&limit=20');
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

  const filtered = items.filter((i) => {
    const matchesStatus = status === 'all' ? true : i.status === status;
    const matchesSearch =
      i.retailerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredTransactions = transactions.filter((t) =>
    t.providerName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const setStatusFor = (id: string, st: GiftCardStatus) => {
    const res = updateGiftCardStatus(id, st);
    if (res) {
      toast({ title: `Marked ${st}` });
      refresh();
    }
  };

  const remove = (id: string) => {
    if (deleteGiftCardRecord(id)) {
      toast({ title: 'Deleted' });
      refresh();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Gift className="h-8 w-8 text-pink-600" />
          Gift Cards Management
        </h1>
        <p className="text-muted-foreground mt-1">Manage gift card products, purchases, and redemptions</p>
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
                <TrendingUp className="h-8 w-8 text-pink-500 opacity-20" />
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
          <TabsTrigger value="records">Gift Card Records</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        {/* Records Tab */}
        <TabsContent value="records" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gift Card Records</CardTitle>
              <CardDescription>View and manage individual gift card purchases and redemptions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search and Filter */}
              <div className="flex gap-2 items-center flex-wrap">
                <div className="flex-1 relative min-w-[250px]">
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
