import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Zap,
  TrendingUp,
  Rocket,
  Gift,
  Clock,
  CheckCircle2,
  AlertCircle,
  Star,
  Flame,
  Calendar,
  DollarSign,
} from "lucide-react";
import { CreatorFundBoostService } from "@/services/creatorFundBoostService";
import { formatCurrency, formatNumber } from "@/utils/formatters";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CreatorFundBoostDashboardProps {
  baseMonthlyEarnings?: number;
  onBoostClaimed?: () => void;
}

export default function CreatorFundBoostDashboard({
  baseMonthlyEarnings = 5000,
  onBoostClaimed,
}: CreatorFundBoostDashboardProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [boosts, setBoosts] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [seasonalPromotions, setSeasonalPromotions] = useState<any[]>([]);
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    loadCreatorFundData();
  }, []);

  const loadCreatorFundData = async () => {
    setIsLoading(true);
    try {
      const [stats, boosts, opportunities, promotions] = await Promise.all([
        CreatorFundBoostService.getCreatorFundStats(),
        CreatorFundBoostService.getActiveBoosts(),
        CreatorFundBoostService.getBoostOpportunities(),
        CreatorFundBoostService.getSeasonalPromotions(),
      ]);

      setStats(stats);
      setBoosts(boosts);
      setOpportunities(opportunities);
      setSeasonalPromotions(promotions.filter((p: any) => p.isActive));
    } catch (error) {
      console.error("Error loading creator fund data:", error);
      toast({
        title: "Error",
        description: "Failed to load creator fund data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimBoost = async (boostType: string) => {
    setIsClaiming(true);
    try {
      const success = await CreatorFundBoostService.applyTier2CreatorBoost();
      if (success) {
        toast({
          title: "Success!",
          description: "Creator fund boost activated",
        });
        onBoostClaimed?.();
        await loadCreatorFundData();
      } else {
        toast({
          title: "Error",
          description: "Failed to claim boost",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error claiming boost:", error);
      toast({
        title: "Error",
        description: "Failed to claim boost",
        variant: "destructive",
      });
    } finally {
      setIsClaiming(false);
    }
  };

  const handleClaimSeasonal = async (promotionId: string) => {
    setIsClaiming(true);
    try {
      const success = await CreatorFundBoostService.claimSeasonalPromotion(promotionId);
      if (success) {
        toast({
          title: "Success!",
          description: "Seasonal promotion claimed",
        });
        onBoostClaimed?.();
        await loadCreatorFundData();
      } else {
        toast({
          title: "Error",
          description: "Failed to claim promotion",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error claiming promotion:", error);
      toast({
        title: "Error",
        description: "Failed to claim promotion",
        variant: "destructive",
      });
    } finally {
      setIsClaiming(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg animate-pulse" />
        <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  // Calculate boosted earnings
  const boostedEarnings = stats
    ? CreatorFundBoostService.calculateBoostedEarnings(
        baseMonthlyEarnings,
        boosts
      )
    : { totalEarnings: baseMonthlyEarnings, boostedAmount: 0, breakdown: [] };

  return (
    <div className="space-y-6">
      {/* Earnings Overview */}
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-amber-600" />
              Creator Fund Boost
            </CardTitle>
            {boosts.length > 0 && (
              <Badge className="bg-green-500 hover:bg-green-600">
                <Rocket className="h-3 w-3 mr-1" />
                {boosts.length} Active
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Base Earnings</p>
              <p className="text-2xl font-bold text-gray-900">
                ${baseMonthlyEarnings.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">Monthly</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Boosted</p>
              <p className="text-2xl font-bold text-amber-600">
                +${Math.round(boostedEarnings.boostedAmount).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">{boosts.length} boost(s)</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-green-600">
                ${Math.round(boostedEarnings.totalEarnings).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">+
                {boosts.length > 0
                  ? Math.round(
                      ((boostedEarnings.boostedAmount / baseMonthlyEarnings) * 100)
                    )
                  : 0}
                %</p>
            </div>
          </div>

          {/* Boost Breakdown */}
          {boostedEarnings.breakdown.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-amber-200">
              <p className="text-sm font-semibold text-gray-900">Boost Breakdown</p>
              {boostedEarnings.breakdown.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span className="text-sm text-gray-700 capitalize">
                      {item.boost.replace("_", " ")}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      x{item.multiplier}
                    </Badge>
                  </div>
                  <span className="text-sm font-semibold text-orange-600">
                    +${Math.round(item.amount).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Boosts & Opportunities Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Rocket className="h-4 w-4" />
            <span className="hidden sm:inline">Active</span>
          </TabsTrigger>
          <TabsTrigger value="opportunities" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            <span className="hidden sm:inline">Available</span>
          </TabsTrigger>
          <TabsTrigger value="seasonal" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Seasonal</span>
          </TabsTrigger>
        </TabsList>

        {/* Active Boosts Tab */}
        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Boosts</CardTitle>
            </CardHeader>
            <CardContent>
              {boosts && boosts.length > 0 ? (
                <div className="space-y-4">
                  {boosts.map((boost) => {
                    const timeline = CreatorFundBoostService.getBoostTimeline(boost);
                    const isExpiringSoon =
                      CreatorFundBoostService.isBoostExpiringSoon(boost);

                    return (
                      <div
                        key={boost.id}
                        className="border border-green-200 rounded-lg p-4 bg-green-50"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl">
                                {CreatorFundBoostService.getBoostIcon(boost.boostType)}
                              </span>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {CreatorFundBoostService.getBoostDisplay(boost)}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {boost.description}
                                </p>
                              </div>
                            </div>
                          </div>
                          <Badge className="bg-green-500 hover:bg-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        </div>

                        {/* Multiplier Display */}
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-2">Multiplier</p>
                          <div className="flex items-center gap-3">
                            <div className="text-3xl font-bold text-green-600">
                              {boost.multiplier.toFixed(2)}x
                            </div>
                            <div className="text-sm text-gray-600">
                              <p>
                                {boost.baseBenefit}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Timeline Progress */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-700">
                              Time Remaining
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {timeline.daysRemaining} days
                            </p>
                          </div>
                          <Progress
                            value={100 - timeline.percentComplete}
                            className="h-2"
                          />
                          <p className="text-xs text-gray-500">
                            Expires {timeline.endDate}
                          </p>

                          {isExpiringSoon && (
                            <Alert className="border-orange-200 bg-orange-50 mt-3">
                              <AlertCircle className="h-4 w-4 text-orange-600" />
                              <AlertDescription className="text-orange-800">
                                This boost is expiring soon! Make the most of it.
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>

                        {/* Earnings Info */}
                        <div className="mt-4 pt-4 border-t border-green-200">
                          <p className="text-xs text-gray-500 mb-2">Earnings Applied</p>
                          <p className="text-lg font-bold text-green-600">
                            +${Math.round(boost.appliedEarnings).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Total boosted: ${Math.round(boost.totalBoosted).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Rocket className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No active boosts</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Check the available opportunities tab
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Opportunities Tab */}
        <TabsContent value="opportunities">
          <Card>
            <CardHeader>
              <CardTitle>Available Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              {opportunities && opportunities.length > 0 ? (
                <div className="space-y-3">
                  {opportunities.map((opp, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-semibold text-gray-900">
                            {opp.title}
                          </p>
                          <Badge variant="secondary">
                            {opp.duration} days
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {opp.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <Zap className="h-3 w-3 text-amber-600" />
                          <p className="text-sm font-semibold text-amber-600">
                            {(opp.multiplier * 100).toFixed(0)}% boost
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleClaimBoost(opp.type)}
                        disabled={isClaiming}
                        className="ml-4"
                      >
                        {isClaiming ? "Claiming..." : "Claim"}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No opportunities available</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Check back soon for new boosts
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Seasonal Promotions Tab */}
        <TabsContent value="seasonal">
          <Card>
            <CardHeader>
              <CardTitle>Seasonal Promotions</CardTitle>
            </CardHeader>
            <CardContent>
              {seasonalPromotions && seasonalPromotions.length > 0 ? (
                <div className="space-y-3">
                  {seasonalPromotions.map((promo) => {
                    const formatted = CreatorFundBoostService.formatPromotion(promo);
                    const participationRate = formatted.participationRate;

                    return (
                      <div
                        key={promo.id}
                        className="border border-purple-200 rounded-lg p-4 bg-purple-50"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {formatted.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {formatted.description}
                            </p>
                          </div>
                          <Badge className="bg-purple-500 hover:bg-purple-600">
                            <Gift className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-gray-600">Earnings Boost</p>
                            <p className="text-lg font-bold text-purple-600">
                              {formatted.multiplier}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Duration</p>
                            <p className="text-lg font-bold text-purple-600">
                              {formatted.duration}
                            </p>
                          </div>
                        </div>

                        {/* Participation Rate */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-medium text-gray-700">
                              Participation
                            </p>
                            <p className="text-xs text-gray-600">
                              {Math.round(participationRate)}%
                            </p>
                          </div>
                          <Progress value={participationRate} className="h-1.5" />
                        </div>

                        <Button
                          onClick={() => handleClaimSeasonal(promo.id)}
                          disabled={isClaiming}
                          className="w-full"
                        >
                          {isClaiming ? "Claiming..." : "Claim Promotion"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No active seasonal promotions</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Check back during seasonal events
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* How It Works */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-base">How Creator Fund Boost Works</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex gap-3">
              <span className="font-bold text-blue-600 min-w-fit">1.</span>
              <span>
                <strong>New Tier 2 Creators:</strong> Get 1.5x earnings for 30 days
                after upgrading to Tier 2
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600 min-w-fit">2.</span>
              <span>
                <strong>Seasonal Promotions:</strong> Claim limited-time boosts during
                special seasons (Summer, Holiday, New Year)
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600 min-w-fit">3.</span>
              <span>
                <strong>Badge Trials:</strong> Some promotions include free premium
                badge trials
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600 min-w-fit">4.</span>
              <span>
                <strong>Stack Multipliers:</strong> Combine multiple boosts for even
                higher earnings
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
