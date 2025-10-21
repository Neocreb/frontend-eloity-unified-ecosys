import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, Gift, Trophy, AlertCircle } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

export default function Earnings() {
  const { stats, earnings } = useOutletContext() as any;

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const getEarningTypeIcon = (type: string) => {
    switch (type) {
      case 'delivery': return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'bonus': return <Trophy className="h-4 w-4 text-yellow-600" />;
      case 'tip': return <Gift className="h-4 w-4 text-green-600" />;
      case 'penalty': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  const getEarningTypeColor = (type: string) => {
    switch (type) {
      case 'delivery': return 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-600';
      case 'bonus': return 'bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-600';
      case 'tip': return 'bg-green-50 dark:bg-green-900/30 border-l-4 border-green-600';
      case 'penalty': return 'bg-red-50 dark:bg-red-900/30 border-l-4 border-red-600';
      default: return 'bg-gray-50 dark:bg-gray-800/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Earnings</h2>
      </div>

      {/* Earnings Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">This Week</p>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-2">{formatCurrency(stats.weekEarnings)}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">This Month</p>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-2">{formatCurrency(stats.monthEarnings)}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <p className="text-sm text-green-700 dark:text-green-300 font-medium">Total Tips</p>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-2">{formatCurrency(stats.totalTips)}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4">
            <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">Bonuses</p>
            <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100 mt-2">{formatCurrency(stats.bonusesEarned)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Earnings History */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Earnings History
          </CardTitle>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {earnings.map((e: any) => (
              <div
                key={e.id}
                className={`flex items-center justify-between p-4 rounded-lg border transition-all ${getEarningTypeColor(e.type)}`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {getEarningTypeIcon(e.type)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{e.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(e.date).toLocaleDateString()} at {new Date(e.date).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-lg ${e.type === 'penalty' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    {e.type === 'penalty' ? '-' : '+'}{formatCurrency(e.amount)}
                  </p>
                  <span className="text-xs px-2 py-1 rounded-full capitalize font-medium" style={{
                    backgroundColor: e.status === 'completed' ? '#dcfce7' : e.status === 'pending' ? '#fef3c7' : '#e0e7ff',
                    color: e.status === 'completed' ? '#166534' : e.status === 'pending' ? '#92400e' : '#3730a3',
                  }}>
                    {e.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="font-medium text-gray-900 dark:text-gray-100">Delivery Fees</span>
              </div>
              <span className="font-bold text-gray-900 dark:text-gray-100">{formatCurrency(stats.monthEarnings * 0.7)}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <Gift className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="font-medium text-gray-900 dark:text-gray-100">Tips & Bonuses</span>
              </div>
              <span className="font-bold text-gray-900 dark:text-gray-100">{formatCurrency(stats.totalTips + stats.bonusesEarned)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
