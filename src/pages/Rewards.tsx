import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRewards } from "@/hooks/use-rewards";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import CreatorEconomyHeader from "@/components/rewards/CreatorEconomyHeader";
import EarningsOverview from "@/components/rewards/EarningsOverview";
import RevenueHistory from "@/components/rewards/RevenueHistory";
import MonetizedContent from "@/components/rewards/MonetizedContent";
import BoostManager from "@/components/rewards/BoostManager";
import Subscribers from "@/components/rewards/Subscribers";
import WithdrawEarnings from "@/components/rewards/WithdrawEarnings";
import { PartnershipSystem } from "@/components/rewards/PartnershipSystem";
import SafeReferralComponent from "@/components/rewards/SafeReferralComponent";
import { ActivityEconomyDashboard } from "@/components/activity-economy/ActivityEconomyDashboard";

interface CreatorRevenueData {
  totalEarnings: number;
  earningsByType: {
    tips: number;
    subscriptions: number;
    views: number;
    boosts: number;
    services: number;
  };
  eloityPointsEarned: number;
  availableToWithdraw: number;
}

const CreatorEconomy = () => {
  const { user } = useAuth();
  const { data: rewardsData, isLoading, error, refresh } = useRewards();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // Transform rewards data to match the expected format
  const revenueData: CreatorRevenueData | null = rewardsData?.calculatedUserRewards ? {
    totalEarnings: rewardsData.calculatedUserRewards.total_earned,
    earningsByType: {
      tips: 0, // Would need to calculate from tip transactions
      subscriptions: 0,
      views: 0,
      boosts: 0,
      services: 0,
    },
    eloityPointsEarned: rewardsData.calculatedUserRewards.total_earned,
    availableToWithdraw: rewardsData.calculatedUserRewards.available_balance,
  } : null;

  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading rewards data",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        {/* Overview Skeleton */}
        <div className="space-y-6">
          <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
            <div className="mt-6 grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <CreatorEconomyHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsContent value="overview" className="mt-0">
          <EarningsOverview
            revenueData={revenueData}
            user={user}
            setActiveTab={setActiveTab}
            onRefresh={refresh}
          />
        </TabsContent>

        <TabsContent value="content" className="mt-0">
          <MonetizedContent userId={user.id} />
        </TabsContent>

        <TabsContent value="boosts" className="mt-0">
          <BoostManager userId={user.id} />
        </TabsContent>

        <TabsContent value="subscribers" className="mt-0">
          <Subscribers userId={user.id} />
        </TabsContent>

        <TabsContent value="withdraw" className="mt-0">
          <WithdrawEarnings
            availableBalance={revenueData?.availableToWithdraw || 0}
            userId={user.id}
            onWithdraw={refresh}
          />
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          <RevenueHistory userId={user.id} />
        </TabsContent>

        <TabsContent value="partnerships" className="mt-0">
          <PartnershipSystem />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CreatorEconomy;
