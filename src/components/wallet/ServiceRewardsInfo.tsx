import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useServiceRewards } from '@/hooks/useServiceRewards';
import { Trophy, Zap, Award } from 'lucide-react';

interface ServiceRewardsInfoProps {
  serviceId: string;
  serviceLabel: string;
}

export const ServiceRewardsInfo: React.FC<ServiceRewardsInfoProps> = ({
  serviceId,
  serviceLabel,
}) => {
  const { rewards, isLoading, loadServiceRewards } = useServiceRewards(serviceId);

  useEffect(() => {
    loadServiceRewards(serviceId);
  }, [serviceId, loadServiceRewards]);

  if (isLoading || !rewards) {
    return null;
  }

  const progressPercent = rewards.nextMilestone
    ? ((rewards.totalTransactions / rewards.nextMilestone.transactions) * 100)
    : 0;

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Earn Rewards</CardTitle>
          <Trophy className="h-5 w-5 text-amber-600" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Points Display */}
        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-100">
          <div>
            <p className="text-xs text-gray-600">Total Points Earned</p>
            <p className="text-2xl font-bold text-amber-600">{rewards.totalPoints}</p>
          </div>
          <Zap className="h-8 w-8 text-amber-500 opacity-50" />
        </div>

        {/* Badges */}
        {rewards.badges && rewards.badges.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">Badges Earned</p>
            <div className="flex flex-wrap gap-2">
              {rewards.badges.map(badge => (
                <Badge key={badge} variant="secondary" className="bg-amber-100 text-amber-800">
                  <Award className="h-3 w-3 mr-1" />
                  {badge}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Next Milestone */}
        {rewards.nextMilestone && (
          <div className="p-3 bg-white rounded-lg border border-amber-100">
            <p className="text-xs text-gray-600 mb-2">
              Progress to Next Milestone
            </p>
            <Progress value={Math.min(progressPercent, 100)} className="h-2 mb-2" />
            <div className="flex justify-between items-center">
              <p className="text-xs font-medium text-gray-700">
                {rewards.totalTransactions} / {rewards.nextMilestone.transactions} transactions
              </p>
              {rewards.nextMilestone.badge && (
                <Badge variant="outline" className="text-amber-700 border-amber-300">
                  {rewards.nextMilestone.badge}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Info */}
        <p className="text-xs text-gray-600 bg-white p-2 rounded border border-amber-100">
          You earn <strong>{rewards.totalTransactions}</strong> {serviceLabel} transactions. Keep going!
        </p>
      </CardContent>
    </Card>
  );
};

export default ServiceRewardsInfo;
