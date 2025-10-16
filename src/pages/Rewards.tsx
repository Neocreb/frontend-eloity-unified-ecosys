import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import CreatorEconomyHeader from "@/components/rewards/CreatorEconomyHeader";
import EarningsOverview from "@/components/rewards/EarningsOverview";
import RevenueHistory from "@/components/rewards/RevenueHistory";
import MonetizedContent from "@/components/rewards/MonetizedContent";
import BoostManager from "@/components/rewards/BoostManager";
import Subscribers from "@/components/rewards/Subscribers";
import WithdrawEarnings from "@/components/rewards/WithdrawEarnings";
import { PartnershipSystem } from "@/components/rewards/PartnershipSystem";
import { fetchWithAuth } from "@/lib/fetch-utils";

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
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<CreatorRevenueData | null>(
    null,
  );

  useEffect(() => {
    if (user) {
      loadRevenueData();
    }
  }, [user]);

  const loadRevenueData = async () => {
    try {
      setIsLoading(true);
      const response = await fetchWithAuth("/api/creator/revenue/summary");
      if (response.ok) {
        const data = await response.json();
        setRevenueData(data.data);
      } else {
        // Fallback to demo data if API not available
        setRevenueData({
          totalEarnings: 15200,
          earningsByType: {
            tips: 4800,
            subscriptions: 5000,
            views: 2100,
            boosts: 0,
            services: 1300,
          },
          eloityPointsEarned: 630,
          availableToWithdraw: 9700,
        });
      }
    } catch (error) {
      console.error("Failed to load revenue data:", error);
      // Use demo data as fallback
      setRevenueData({
        totalEarnings: 15200,
        earningsByType: {
          tips: 4800,
          subscriptions: 5000,
          views: 2100,
          boosts: 0,
          services: 1300,
        },
        eloityPointsEarned: 630,
        availableToWithdraw: 9700,
      });
    } finally {
      setIsLoading(false);
    }
  };

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
            onRefresh={loadRevenueData}
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
            onWithdraw={loadRevenueData}
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
