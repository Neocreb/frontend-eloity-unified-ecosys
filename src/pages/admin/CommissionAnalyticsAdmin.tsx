import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Download } from "lucide-react";
import { toast } from "react-hot-toast";

interface CommissionStats {
  total_transactions: number;
  total_amount: number;
  total_commission: number;
  average_commission_rate: number;
  success_rate: number;
}

interface Transaction {
  id: string;
  service_type: string;
  operator_name: string;
  recipient: string;
  amount: number;
  commission_earned: number;
  commission_rate: number;
  status: string;
  created_at: string;
}

const CommissionAnalyticsAdmin = () => {
  const { session } = useAuth();
  const [stats, setStats] = useState<CommissionStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Initialize date range (last 30 days)
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
  }, []);

  // Fetch stats when date range changes
  useEffect(() => {
    if (startDate && endDate) {
      fetchStats();
      fetchTransactions();
    }
  }, [startDate, endDate, selectedService]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      let url = `/api/commission/stats?startDate=${startDate}&endDate=${endDate}`;
      if (selectedService !== 'all') {
        url += `&serviceType=${selectedService}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      } else {
        toast.error('Failed to load statistics');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      let url = `/api/commission/transactions?limit=100`;
      if (selectedService !== 'all') {
        url += `&serviceType=${selectedService}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      const result = await response.json();
      if (result.success) {
        // Filter by date
        const filtered = result.data.transactions.filter((tx: Transaction) => {
          const txDate = new Date(tx.created_at).toISOString().split('T')[0];
          return txDate >= startDate && txDate <= endDate;
        });
        setTransactions(filtered);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleExportCSV = () => {
    if (!stats) return;

    const csvContent = [
      ['Commission Statistics Report'],
      ['Date Range', `${startDate} to ${endDate}`],
      ['Service Type', selectedService !== 'all' ? selectedService : 'All Services'],
      [],
      ['Metric', 'Value'],
      ['Total Transactions', stats.total_transactions],
      ['Total Amount', `₦${stats.total_amount.toLocaleString()}`],
      ['Total Commission Earned', `₦${stats.total_commission.toLocaleString()}`],
      ['Average Commission Rate', `${stats.average_commission_rate}%`],
      ['Success Rate', `${stats.success_rate}%`],
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commission-report-${startDate}-to-${endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getServiceIcon = (serviceType: string) => {
    const icons: Record<string, string> = {
      airtime: '📱',
      data: '📊',
      utilities: '⚡',
      gift_cards: '🎁'
    };
    return icons[serviceType] || '💰';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Commission Analytics</h1>
        <p className="text-gray-600 mt-2">Track revenue and transaction insights</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Type
              </label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Services</option>
                <option value="airtime">Airtime</option>
                <option value="data">Data</option>
                <option value="utilities">Utilities</option>
                <option value="gift_cards">Gift Cards</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleExportCSV}
                disabled={!stats}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
          <p className="text-gray-600 mt-2">Loading statistics...</p>
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600">Total Transactions</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {stats.total_transactions.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600">Total Volume</p>
              <p className="text-3xl font-bold text-indigo-600 mt-2">
                ₦{(stats.total_amount / 1000000).toFixed(1)}M
              </p>
              <p className="text-xs text-gray-500 mt-1">
                ₦{stats.total_amount.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600">Commission Earned</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                ₦{stats.total_commission.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {((stats.total_commission / stats.total_amount) * 100).toFixed(2)}% margin
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600">Avg Commission Rate</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {stats.average_commission_rate.toFixed(2)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {stats.success_rate.toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No transactions found for the selected period</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Provider</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Recipient</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Commission</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span>{getServiceIcon(tx.service_type)}</span>
                          <span className="capitalize">{tx.service_type}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{tx.operator_name}</td>
                      <td className="py-3 px-4 text-gray-600 font-mono text-xs">{tx.recipient.substring(0, 20)}</td>
                      <td className="py-3 px-4 text-right font-semibold">₦{tx.amount.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-green-600 font-semibold">
                        ₦{tx.commission_earned.toLocaleString()} ({tx.commission_rate}%)
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(tx.status)}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-xs">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CommissionAnalyticsAdmin;
