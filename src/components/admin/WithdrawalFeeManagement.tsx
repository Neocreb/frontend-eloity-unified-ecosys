import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, DollarSign, BarChart3, Settings } from 'lucide-react';

interface FeeConfig {
  category: string;
  feePercentage: number;
  minFee?: number;
  maxFee?: number;
  description: string;
}

interface RevenueStats {
  totalRevenue: number;
  transactionCount: number;
  averageFeeAmount: number;
  categoryBreakdown: Record<string, number>;
}

interface RevenueRecord {
  id: string;
  category: string;
  date: string;
  feeAmount: number;
  grossAmount: number;
  count: number;
}

export const WithdrawalFeeManagement: React.FC = () => {
  const [feeConfigs, setFeeConfigs] = useState<FeeConfig[]>([]);
  const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null);
  const [revenueByCategory, setRevenueByCategory] = useState<RevenueRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<FeeConfig>>({});
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch fee configurations
      const configRes = await fetch('/api/enhanced-rewards/admin/fee-configs');
      if (configRes.ok) {
        const configData = await configRes.json();
        setFeeConfigs(configData.data || []);
      }

      // Fetch revenue statistics
      const statsRes = await fetch('/api/enhanced-rewards/admin/revenue-stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setRevenueStats(statsData.data || null);
      }

      // Fetch revenue by category
      const categoryRes = await fetch(
        `/api/enhanced-rewards/admin/revenue-by-category?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
      );
      if (categoryRes.ok) {
        const categoryData = await categoryRes.json();
        setRevenueByCategory(categoryData.data || []);
      }
    } catch (error) {
      console.error('Error fetching fee management data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditFee = (config: FeeConfig) => {
    setEditingCategory(config.category);
    setEditValues({
      feePercentage: config.feePercentage,
      minFee: config.minFee,
      maxFee: config.maxFee
    });
  };

  const handleSaveFee = async () => {
    if (!editingCategory) return;

    try {
      const response = await fetch(`/api/enhanced-rewards/admin/fee-configs/${editingCategory}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editValues)
      });

      if (response.ok) {
        setEditingCategory(null);
        fetchData();
      }
    } catch (error) {
      console.error('Error saving fee configuration:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading fee management data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              ${revenueStats?.totalRevenue.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-gray-500 mt-1">All withdrawal fees collected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {revenueStats?.transactionCount || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Total withdrawals processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Average Fee</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              ${revenueStats?.averageFeeAmount.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-gray-500 mt-1">Per transaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Top Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {revenueStats?.categoryBreakdown
                ? Object.entries(revenueStats.categoryBreakdown).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'
                : 'N/A'}
            </div>
            <p className="text-xs text-gray-500 mt-1">Highest fee revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Fee Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Fee Configuration
          </CardTitle>
          <CardDescription>Manage withdrawal fees by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {feeConfigs.map((config) => (
              <div key={config.category} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold capitalize">{config.category}</h3>
                    <p className="text-sm text-gray-600">{config.description}</p>
                  </div>
                  <Button
                    size="sm"
                    variant={editingCategory === config.category ? 'default' : 'outline'}
                    onClick={() => {
                      if (editingCategory === config.category) {
                        handleSaveFee();
                      } else {
                        handleEditFee(config);
                      }
                    }}
                  >
                    {editingCategory === config.category ? 'Save' : 'Edit'}
                  </Button>
                </div>

                {editingCategory === config.category ? (
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-medium">Fee %</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editValues.feePercentage || 0}
                        onChange={(e) =>
                          setEditValues({ ...editValues, feePercentage: parseFloat(e.target.value) })
                        }
                        className="w-full mt-1 px-2 py-1 border rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">Min Fee</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editValues.minFee || 0}
                        onChange={(e) =>
                          setEditValues({ ...editValues, minFee: parseFloat(e.target.value) })
                        }
                        className="w-full mt-1 px-2 py-1 border rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">Max Fee</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editValues.maxFee || 0}
                        onChange={(e) =>
                          setEditValues({ ...editValues, maxFee: parseFloat(e.target.value) })
                        }
                        className="w-full mt-1 px-2 py-1 border rounded text-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs text-gray-600">Fee Rate</p>
                      <p className="font-semibold">{config.feePercentage}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Min</p>
                      <p className="font-semibold">${config.minFee?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Max</p>
                      <p className="font-semibold">${config.maxFee?.toFixed(2) || '0.00'}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue by Category */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Revenue by Category
          </CardTitle>
          <CardDescription>
            Detailed breakdown of fees collected by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(revenueStats?.categoryBreakdown || {}).map(([category, amount]) => (
              <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium capitalize">{category}</p>
                  <p className="text-sm text-gray-600">
                    {revenueByCategory
                      .filter(r => r.category === category)
                      .reduce((sum, r) => sum + r.count, 0)} transactions
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">${amount.toFixed(2)}</p>
                  <p className="text-xs text-gray-600">
                    {revenueStats?.totalRevenue && revenueStats.totalRevenue > 0
                      ? `${((amount / revenueStats.totalRevenue) * 100).toFixed(1)}%`
                      : '0%'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Filter by Date Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="px-3 py-2 border rounded"
            />
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="px-3 py-2 border rounded"
            />
            <Button onClick={fetchData} variant="outline">
              Apply
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
