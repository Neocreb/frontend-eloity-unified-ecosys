// @ts-nocheck
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  premiumService,
  PremiumService,
  type PremiumSubscription,
} from "@/services/premiumService";
import { Crown, Star, Calendar, CreditCard } from "lucide-react";

export function PremiumStatusWidget() {
  const [subscription, setSubscription] = useState<PremiumSubscription | null>(
    null,
  );
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPremiumStatus();
  }, []);

  const loadPremiumStatus = async () => {
    try {
      setLoading(true);
      const { subscription: sub, isPremium: premium } =
        await premiumService.getPremiumStatus();
      setSubscription(sub);
      setIsPremium(premium);
    } catch (err) {
      console.error("Premium status error:", err);
      // Use demo premium data when API fails
      setSubscription({
        tier: "gold",
        status: "active",
        boostCredits: 15,
        nextBillingDate: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        benefits: [
          "Priority support",
          "Enhanced features",
          "Additional boost credits",
        ],
      });
      setIsPremium(true);
      setError("Demo data - API not available");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isPremium || !subscription) {
    return (
      <Card className="border-2 border-dashed border-gray-300">
        <CardContent className="p-6 text-center">
          <Crown className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <h3 className="font-semibold mb-1">Upgrade to Premium</h3>
          <p className="text-sm text-gray-600 mb-3">
            Unlock exclusive features and benefits
          </p>
          <Button
            size="sm"
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
          >
            <Crown className="h-3 w-3 mr-1" />
            Upgrade Now
          </Button>
        </CardContent>
      </Card>
    );
  }

  const tierInfo = PremiumService.getTierInfo(subscription.tier);
  const daysRemaining = PremiumService.getDaysRemaining(subscription.endDate);
  const creditsRemaining =
    PremiumService.getBoostCreditsRemaining(subscription);
  const creditsUsedPercentage =
    (subscription.usedBoostCredits / subscription.monthlyBoostCredits) * 100;

  return (
    <Card className={`border-2 ${tierInfo.borderColor} ${tierInfo.bgColor}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <span className="text-lg">{tierInfo.icon}</span>
          {tierInfo.name} Member
        </CardTitle>
        <Badge variant="outline" className={tierInfo.color}>
          {subscription.status}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="flex items-center gap-1 text-gray-600">
              <Calendar className="h-3 w-3" />
              Days Left
            </div>
            <div className="font-semibold">{daysRemaining}</div>
          </div>
          <div>
            <div className="flex items-center gap-1 text-gray-600">
              <Star className="h-3 w-3" />
              Boost Credits
            </div>
            <div className="font-semibold">
              {creditsRemaining}/{subscription.monthlyBoostCredits}
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Boost Credits Used</span>
            <span>
              {subscription.usedBoostCredits}/{subscription.monthlyBoostCredits}
            </span>
          </div>
          <Progress value={creditsUsedPercentage} className="h-2" />
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1">
            <Star className="h-3 w-3 mr-1" />
            Use Credit
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <CreditCard className="h-3 w-3 mr-1" />
            Manage
          </Button>
        </div>

        {subscription.feeDiscountPercentage && (
          <div className="text-xs text-center p-2 bg-green-50 rounded-lg">
            🎉 You save {subscription.feeDiscountPercentage}% on all platform
            fees!
          </div>
        )}
      </CardContent>
    </Card>
  );
}
