import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useServiceRewards } from '@/hooks/useServiceRewards';
import { Trophy, Zap, Award, TrendingUp, Loader2 } from 'lucide-react';

export const RewardsDashboard: React.FC = () => {
  const { allRewards, isLoading } = useServiceRewards();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  const totalPoints = allRewards.reduce((sum, r) => sum + r.totalPoints, 0);
  const totalBadges = allRewards.reduce((sum, r) => sum + (r.badges?.length || 0), 0);
  const activeServices = allRewards.filter(r => r.totalTransactions > 0).length;

  const getServiceLabel = (serviceId: string): string => {
    const labels: Record<string, string> = {
      'send-money': 'Send Money',
      'airtime': 'Airtime',
      'electricity': 'Electricity',
      'freelance': 'Freelance',
      'marketplace': 'Marketplace',
      'buy-gift-cards': 'Gift Cards',
      'data': 'Data',
      'transfer': 'Transfer',
      'crypto': 'Crypto',
      'investments': 'Investments',
    };
    return labels[serviceId] || serviceId;
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total Points */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-700 font-medium">Total Points</p>
                <p className="text-2xl font-bold text-blue-900">{totalPoints}</p>
              </div>
              <Zap className="h-8 w-8 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-700 font-medium">Badges Earned</p>
                <p className="text-2xl font-bold text-purple-900">{totalBadges}</p>
              </div>
              <Award className="h-8 w-8 text-purple-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* Active Services */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-700 font-medium">Active Services</p>
                <p className="text-2xl font-bold text-green-900">{activeServices}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Breakdown */}
      {allRewards.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Service Rewards Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allRewards
                .filter(r => r.totalTransactions > 0)
                .sort((a, b) => b.totalPoints - a.totalPoints)
                .map(reward => (
                  <div key={reward.serviceId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{getServiceLabel(reward.serviceId)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-600">{reward.totalTransactions} transactions</span>
                        {reward.badges && reward.badges.length > 0 && (
                          <div className="flex gap-1">
                            {reward.badges.map(badge => (
                              <Badge key={badge} variant="secondary" className="text-xs">
                                {badge}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-amber-600">{reward.totalPoints}</p>
                      <p className="text-xs text-gray-500">points</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No rewards earned yet</p>
            <p className="text-sm text-gray-500 mt-1">Start using services to earn points and badges</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RewardsDashboard;
