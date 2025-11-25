import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Zap, TrendingUp, Clock, Gift } from 'lucide-react';
import type { CreatorBoost } from '@/services/creatorFundBoostService';

interface CreatorBoostDisplayProps {
  activeBoost: CreatorBoost | null;
  loading?: boolean;
}

export const CreatorBoostDisplay: React.FC<CreatorBoostDisplayProps> = ({
  activeBoost,
  loading = false
}) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    if (!activeBoost) return;

    const updateTimer = () => {
      const now = new Date();
      const end = new Date(activeBoost.endDate);
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Expired');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`);
      } else {
        setTimeRemaining(`${minutes}m`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [activeBoost]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          Loading boost information...
        </CardContent>
      </Card>
    );
  }

  if (!activeBoost) {
    return (
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Gift className="h-5 w-5 text-gray-400" />
            No Active Boost
          </CardTitle>
          <CardDescription>
            Complete KYC to unlock special earning boosts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            When you verify your account, you'll get a 1.5x earnings boost for your first 30 days
            as a creator! Keep an eye out for seasonal promotions too.
          </p>
        </CardContent>
      </Card>
    );
  }

  const boostTypeLabels: Record<string, string> = {
    tier_upgrade: '🎉 Welcome Boost',
    seasonal: '🌟 Seasonal Promotion',
    promotional: '⚡ Flash Promotion',
    referral: '👥 Referral Reward'
  };

  const boostTypeColors: Record<string, string> = {
    tier_upgrade: 'bg-green-50 border-green-200',
    seasonal: 'bg-blue-50 border-blue-200',
    promotional: 'bg-purple-50 border-purple-200',
    referral: 'bg-orange-50 border-orange-200'
  };

  return (
    <Card className={`border-2 ${boostTypeColors[activeBoost.boostType]}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5 text-yellow-500" />
              {boostTypeLabels[activeBoost.boostType] || 'Active Boost'}
            </CardTitle>
            <CardDescription>{activeBoost.description}</CardDescription>
          </div>
          <Badge className="bg-green-600 text-white">Active</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Earnings Multiplier */}
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Earnings Multiplier</span>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-green-600">
            {activeBoost.multiplier}x
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Earn {(activeBoost.multiplier - 1) * 100}% extra on all creator activities
          </p>
        </div>

        {/* Time Remaining */}
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Time Remaining</span>
            <Clock className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {timeRemaining}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Until {new Date(activeBoost.endDate).toLocaleDateString()}
          </p>
        </div>

        {/* Earnings Tracked */}
        {activeBoost.appliedEarnings && activeBoost.appliedEarnings > 0 && (
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Extra Earnings This Boost</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              ${activeBoost.appliedEarnings.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Bonus earnings from {activeBoost.boostType} boost
            </p>
          </div>
        )}

        {/* Info Alert */}
        <Alert className="bg-blue-50 border-blue-200">
          <Zap className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm text-blue-800">
            Your boost is automatically applied to all creator earnings (posts, freelance, marketplace).
            No action needed - just keep creating!
          </AlertDescription>
        </Alert>

        {/* Progress indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Boost Progress</span>
            <span>
              {Math.round(
                ((new Date(activeBoost.startDate).getTime() - new Date().getTime()) /
                  (new Date(activeBoost.startDate).getTime() - new Date(activeBoost.endDate).getTime())) * 100
              )}%
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-green-500"
              style={{
                width: `${Math.max(
                  0,
                  Math.min(
                    100,
                    100 -
                      ((new Date().getTime() - new Date(activeBoost.startDate).getTime()) /
                        (new Date(activeBoost.endDate).getTime() - new Date(activeBoost.startDate).getTime())) * 100
                  )
                )}%`
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface EarningsWithBoostProps {
  baseAmount: number;
  multiplier: number;
  showBreakdown?: boolean;
}

export const EarningsWithBoostDisplay: React.FC<EarningsWithBoostProps> = ({
  baseAmount,
  multiplier,
  showBreakdown = true
}) => {
  const boostAmount = baseAmount * (multiplier - 1);
  const totalAmount = baseAmount * multiplier;

  return (
    <div className="space-y-2">
      {showBreakdown && (
        <>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Base Earnings</span>
            <span className="font-medium">${baseAmount.toFixed(2)}</span>
          </div>
          {multiplier > 1 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Boost Bonus ({(multiplier - 1) * 100}%)</span>
              <span className="font-medium">+${boostAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm border-t pt-2 font-bold">
            <span>Total Earnings</span>
            <span className="text-green-600">${totalAmount.toFixed(2)}</span>
          </div>
        </>
      )}
      {!showBreakdown && (
        <div className="text-lg font-bold text-green-600">
          ${totalAmount.toFixed(2)} {multiplier > 1 && `(${multiplier}x)`}
        </div>
      )}
    </div>
  );
};
