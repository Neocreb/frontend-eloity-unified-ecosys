import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRewards } from "@/hooks/use-rewards";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  RefreshCw,
  UserPlus,
  BarChart3,
  Activity,
  Gift,
  Target,
  Swords,
  ArrowRight
} from "lucide-react";
import { formatCurrency, formatNumber } from "@/utils/formatters";
import { cn } from "@/lib/utils";

// Test integration (only in development)
if (typeof window !== "undefined" && typeof process !== 'undefined' && process.env && process.env.NODE_ENV === "development") {
  import("@/utils/testRewardsIntegration").catch(console.warn);
}

// Import new organized components
import RewardsCard from "@/components/rewards/RewardsCard";
import RewardsStats from "@/components/rewards/RewardsStats";
import RewardsActivitiesTab from "@/components/rewards/RewardsActivitiesTab";
import RewardsChallengesTab from "@/components/rewards/RewardsChallengesTab";
import RewardsBattleTab from "@/components/rewards/RewardsBattleTab";
import SafeReferralManager from "@/components/rewards/SafeReferralManager";
import AchievementSystem from "@/components/rewards/AchievementSystem";
import GoalTracking from "@/components/rewards/GoalTracking";
import AdvancedAnalytics from "@/components/rewards/AdvancedAnalytics";
import RewardsErrorBoundary from "@/components/rewards/RewardsErrorBoundary";
import SeasonalEvents from "@/components/rewards/SeasonalEvents";
import PioneerBadgeWidget from "@/components/rewards/PioneerBadgeWidget";

interface RewardData {
  totalEarnings: number;
  availableToWithdraw: number;
  currentEloits: number;
  trustScore: {
    current: number;
    level: string;
    multiplier: number;
    nextLevelAt: number;
  };
  activityStats: {
    totalActivities: number;
    contentCreated: number;
    qualityScore: number;
    streakDays: number;
  };
  earningsByType: {
    contentCreation: number;
    engagement: number;
    marketplace: number;
    freelance: number;
    p2pTrading: number;
    referrals: number;
    challenges: number;
    battleVoting: number;
    battleRewards: number;
    giftsAndTips: number;
    education: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    amount: number;
    timestamp: string;
  }>;
  referralStats: {
    totalReferrals: number;
    totalEarnings: number;
    activeReferrals: number;
  };
}

export default function EnhancedRewards() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: rewardsData, isLoading, error, refresh } = useRewards();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Transform rewards data to match the expected format
  const rewardData: RewardData | null = rewardsData?.calculatedUserRewards ? {
    totalEarnings: rewardsData.calculatedUserRewards.total_earned,
    availableToWithdraw: rewardsData.calculatedUserRewards.available_balance,
    currentEloits: rewardsData.calculatedUserRewards.total_earned,
    trustScore: {
      current: Math.min(100, rewardsData.calculatedUserRewards.level * 20), // Simple calculation
      level: `Level ${rewardsData.calculatedUserRewards.level}`,
      multiplier: 1 + (rewardsData.calculatedUserRewards.level * 0.1),
      nextLevelAt: rewardsData.calculatedUserRewards.next_level_requirement
    },
    activityStats: {
      totalActivities: rewardsData.dailyActions?.reduce((sum: number, action: { count: number }) => sum + action.count, 0) || 0,
      contentCreated: 0, // Would need to calculate from user posts
      qualityScore: rewardsData.calculatedUserRewards.level,
      streakDays: rewardsData.calculatedUserRewards.streak
    },
    earningsByType: {
      contentCreation: 0,
      engagement: 0,
      marketplace: 0,
      freelance: 0,
      p2pTrading: 0,
      referrals: 0,
      challenges: 0,
      battleVoting: 0,
      battleRewards: 0,
      giftsAndTips: rewardsData.tipTransactions?.reduce((sum: number, tip: { amount: number }) => sum + tip.amount, 0) || 0,
      education: 0
    },
    recentActivity: rewardsData.recentRewards?.map(reward => ({
      id: reward.id,
      type: reward.type,
      description: reward.description || `Reward for ${reward.type}`,
      amount: reward.amount,
      timestamp: reward.created_at
    })) || [],
    referralStats: {
      totalReferrals: 0,
      totalEarnings: 0,
      activeReferrals: 0
    }
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

  const handleRefresh = async () => {
    try {
      await refresh();
      toast({
        title: "Data Updated",
        description: "Your rewards data has been refreshed"
      });
    } catch (error) {
      console.error("Refresh failed:", error);
      toast({
        title: "Refresh Failed",
        description: "Could not refresh data. Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleWithdrawalSuccess = (amount: number, method: string) => {
    toast({
      title: "Withdrawal Complete!",
      description: `${formatCurrency(amount)} has been added to your ${method}`,
    });
    // Refresh data to show updated balance
    handleRefresh();
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
          <p className="text-muted-foreground">
            You need to be signed in to access the Rewards Center.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>

        {/* Metrics Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="space-y-6">
          <Skeleton className="h-12 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-96 rounded-xl" />
            <Skeleton className="h-96 rounded-xl" />
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <RewardsErrorBoundary>
      <div className="min-h-screen bg-platform">
        <div className="max-w-7xl mx-auto p-4 space-y-8">
      {/* Enhanced Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Monetization
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Rewards Credit Card */}
      {rewardData ? (
        <RewardsCard
          currentEloits={rewardData.currentEloits}
          availableToWithdraw={rewardData.availableToWithdraw}
          totalEarnings={rewardData.totalEarnings}
          trustScore={rewardData.trustScore}
          onWithdraw={() => navigate("/app/rewards/withdraw")}
          className="mb-8"
        />
      ) : (
        <div className="bg-muted rounded-xl p-8 text-center">
          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No Rewards Data Available
          </h3>
          <p className="text-muted-foreground">
            Start earning rewards by participating in platform activities.
          </p>
        </div>
      )}

      {/* Tabbed Content */}
      <Tabs key="rewards-tabs" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="w-full relative">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto scrollbar-hide" aria-label="Tabs">
              {[
                { id: "dashboard", label: "Dashboard", icon: BarChart3, description: "Overview and stats" },
                { id: "activities", label: "Activities", icon: Activity, description: "Earnings analysis" },
                { id: "challenges", label: "Challenges", icon: Target, description: "Complete challenges" },
                { id: "battles", label: "Battles", icon: Swords, description: "Vote and earn" },
                { id: "referrals", label: "Referral", icon: UserPlus, description: "Invite friends" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex flex-col items-center gap-1 min-w-20
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                  aria-current={activeTab === tab.id ? 'page' : undefined}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{tab.label}</span>
                  {tab.id === "referrals" && rewardData?.referralStats.totalReferrals && (
                    <Badge variant="secondary" className="ml-1 text-xs h-4 w-4 rounded-full p-0 flex items-center justify-center">
                      {rewardData.referralStats.totalReferrals}
                    </Badge>
                  )}
                </button>
              ))}
            </nav>
            {/* Horizontal scroll indicator */}
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <div className="flex items-center text-gray-400">
                <ArrowRight className="h-4 w-4 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        <TabsContent value="dashboard" className="mt-6">
          {rewardData ? (
            <div className="space-y-8">
              <RewardsErrorBoundary>
                <SeasonalEvents />
              </RewardsErrorBoundary>

              <RewardsErrorBoundary>
                <RewardsStats
                  totalEarnings={rewardData.totalEarnings}
                  currentEloits={rewardData.currentEloits}
                  trustScore={rewardData.trustScore}
                  activityStats={rewardData.activityStats}
                  earningsByType={rewardData.earningsByType}
                />
              </RewardsErrorBoundary>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <RewardsErrorBoundary>
                  <AchievementSystem />
                </RewardsErrorBoundary>
                <RewardsErrorBoundary>
                  <GoalTracking />
                </RewardsErrorBoundary>
                <RewardsErrorBoundary>
                  <PioneerBadgeWidget />
                </RewardsErrorBoundary>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Dashboard</h3>
              <p className="text-gray-600">Your rewards dashboard will appear here once data loads.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="activities" className="mt-6">
          {rewardData ? (
            <div className="space-y-8">
              <RewardsErrorBoundary>
                <AdvancedAnalytics earningsByType={rewardData.earningsByType} />
              </RewardsErrorBoundary>
              <RewardsErrorBoundary>
                <RewardsActivitiesTab
                  earningsByType={rewardData.earningsByType}
                  recentActivity={rewardData.recentActivity}
                />
              </RewardsErrorBoundary>
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Activities</h3>
              <p className="text-gray-600">Your earnings activities will appear here once data loads.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="challenges" className="mt-6">
          <RewardsErrorBoundary>
            <RewardsChallengesTab />
          </RewardsErrorBoundary>
        </TabsContent>

        <TabsContent value="battles" className="mt-6">
          <RewardsErrorBoundary>
            <RewardsBattleTab />
          </RewardsErrorBoundary>
        </TabsContent>

        <TabsContent value="referrals" className="mt-6">
          <div className="space-y-6">
            {/* Reward Sharing Notice */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-purple-100 rounded-full">
                  <Gift className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-purple-900">
                    Community Sharing Active
                  </h3>
                  <p className="text-sm text-purple-700">
                    0.5% of creator earnings automatically shared with referrals.
                    <a href="/terms" className="underline hover:text-purple-800 ml-1">Terms</a>
                  </p>
                </div>
              </div>
            </div>

            <RewardsErrorBoundary>
              <SafeReferralManager />
            </RewardsErrorBoundary>
          </div>
        </TabsContent>
      </Tabs>

      {/* Withdrawal Modal */}
      {rewardData && (
        <WithdrawalModal
          isOpen={showWithdrawalModal}
          onClose={() => setShowWithdrawalModal(false)}
          currentEloits={rewardData.currentEloits}
          availableToWithdraw={rewardData.availableToWithdraw}
          trustScore={rewardData.trustScore}
          onWithdrawalSuccess={handleWithdrawalSuccess}
        />
      )}
        </div>
      </div>
    </RewardsErrorBoundary>
  );
}
