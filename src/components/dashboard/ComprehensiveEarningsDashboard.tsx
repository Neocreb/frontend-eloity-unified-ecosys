import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Star,
  Users,
  ShoppingBag,
  Briefcase,
  Video,
  MessageCircle,
  Gift,
  Award,
  Target,
  Calendar,
  Eye,
  Clock,
  Zap,
  Crown,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  Settings,
  Plus,
  Filter,
  ChevronRight,
  Wallet,
  CreditCard,
  PieChart,
  BarChart3,
  Activity,
  Flame,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useRewardIntegration } from "@/hooks/use-reward-integration";
import { ReferralService } from "@/services/referralService";
import { LevelsBoostsService } from "@/services/levelsBoostsService";
import { ActivityRewardService } from "@/services/activityRewardService";
import { formatCurrency, formatNumber } from "@/utils/formatters";

interface EarningsData {
  // Total earnings overview
  totalEarnings: number;
  totalEloityPoints: number;
  availableToWithdraw: number;
  lifetimeEarnings: number;

  // Module-specific earnings
  moduleEarnings: {
    social: {
      posts: number;
      likes: number;
      comments: number;
      shares: number;
      views: number;
      tips: number;
      subscriptions: number;
    };
    marketplace: {
      sales: number;
      purchases: number;
      commissions: number;
      reviews: number;
    };
    freelance: {
      jobsCompleted: number;
      clientWork: number;
      ratings: number;
      bonuses: number;
    };
    crypto: {
      trading: number;
      staking: number;
      p2pTrades: number;
      conversions: number;
    };
    video: {
      creatorFund: number;
      tips: number;
      sponsorships: number;
      liveStreaming: number;
    };
    referrals: {
      signupBonuses: number;
      commissions: number;
      lifetimeValue: number;
      activeReferrals: number;
    };
    activities: {
      dailyLogin: number;
      profileCompletion: number;
      communityParticipation: number;
      achievements: number;
    };
  };

  // Time-based analytics
  analytics: {
    thisWeek: number;
    lastWeek: number;
    thisMonth: number;
    lastMonth: number;
    growthRate: number;
    bestPerformingModule: string;
  };

  // Goals and targets
  goals: {
    monthly: { target: number; current: number };
    yearly: { target: number; current: number };
    nextMilestone: { name: string; target: number; current: number };
  };
}

interface QuickActions {
  id: string;
  title: string;
  description: string;
  icon: any;
  action: string;
  earnings: number;
  timeEstimate: string;
  difficulty: "easy" | "medium" | "hard";
}

const ComprehensiveEarningsDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const rewardHooks = useRewardIntegration();

  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("7d");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // State
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [userProgress, setUserProgress] = useState<any>(null);
  const [referralStats, setReferralStats] = useState<any>(null);
  const [activeBoosts, setActiveBoosts] = useState<any[]>([]);
  const [quickActions, setQuickActions] = useState<QuickActions[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, timeRange]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadEarningsData(),
        loadUserProgress(),
        loadReferralStats(),
        loadActiveBoosts(),
        loadQuickActions(),
        loadRecentActivities(),
      ]);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadEarningsData = async () => {
    try {
      // In production, this would be multiple API calls combined
      const mockData: EarningsData = {
        totalEarnings: 1247.83,
        totalEloityPoints: 3450,
        availableToWithdraw: 892.5,
        lifetimeEarnings: 5689.42,

        moduleEarnings: {
          social: {
            posts: 125.3,
            likes: 23.45,
            comments: 45.67,
            shares: 12.34,
            views: 89.12,
            tips: 156.78,
            subscriptions: 234.56,
          },
          marketplace: {
            sales: 345.67,
            purchases: 23.45,
            commissions: 67.89,
            reviews: 5.67,
          },
          freelance: {
            jobsCompleted: 456.78,
            clientWork: 234.56,
            ratings: 12.34,
            bonuses: 45.67,
          },
          crypto: {
            trading: 123.45,
            staking: 67.89,
            p2pTrades: 89.12,
            conversions: 34.56,
          },
          video: {
            creatorFund: 234.56,
            tips: 89.12,
            sponsorships: 345.67,
            liveStreaming: 123.45,
          },
          referrals: {
            signupBonuses: 89.12,
            commissions: 234.56,
            lifetimeValue: 567.89,
            activeReferrals: 23,
          },
          activities: {
            dailyLogin: 45.67,
            profileCompletion: 25.0,
            communityParticipation: 34.56,
            achievements: 67.89,
          },
        },

        analytics: {
          thisWeek: 234.56,
          lastWeek: 198.45,
          thisMonth: 892.5,
          lastMonth: 756.78,
          growthRate: 18.2,
          bestPerformingModule: "freelance",
        },

        goals: {
          monthly: { target: 1000, current: 892.5 },
          yearly: { target: 12000, current: 5689.42 },
          nextMilestone: {
            name: "Silver Creator",
            target: 1000,
            current: 892.5,
          },
        },
      };

      setEarningsData(mockData);
    } catch (error) {
      console.error("Error loading earnings data:", error);
    }
  };

  const loadUserProgress = async () => {
    try {
      const progress = await LevelsBoostsService.getUserProgress();
      setUserProgress(progress);
    } catch (error) {
      console.error("Error loading user progress:", error);
    }
  };

  const loadReferralStats = async () => {
    try {
      const stats = await ReferralService.getReferralStats();
      setReferralStats(stats);
    } catch (error) {
      console.error("Error loading referral stats:", error);
    }
  };

  const loadActiveBoosts = async () => {
    try {
      const boosts = await LevelsBoostsService.getActiveBoosts();
      setActiveBoosts(boosts);
    } catch (error) {
      console.error("Error loading active boosts:", error);
    }
  };

  const loadQuickActions = async () => {
    const actions: QuickActions[] = [
      {
        id: "1",
        title: "Create a Post",
        description: "Share your thoughts and earn Eloity Points",
        icon: MessageCircle,
        action: "create_post",
        earnings: 3.0,
        timeEstimate: "2 min",
        difficulty: "easy",
      },
      {
        id: "2",
        title: "Complete Profile",
        description: "Unlock 25 SP bonus by completing your profile",
        icon: Users,
        action: "complete_profile",
        earnings: 25.0,
        timeEstimate: "5 min",
        difficulty: "easy",
      },
      {
        id: "3",
        title: "Refer a Friend",
        description: "Invite friends and earn lifetime commissions",
        icon: Gift,
        action: "refer_friend",
        earnings: 50.0,
        timeEstimate: "1 min",
        difficulty: "medium",
      },
      {
        id: "4",
        title: "List a Product",
        description: "Sell something on the marketplace",
        icon: ShoppingBag,
        action: "list_product",
        earnings: 5.0,
        timeEstimate: "10 min",
        difficulty: "medium",
      },
      {
        id: "5",
        title: "Create a Video",
        description: "Share video content for higher rewards",
        icon: Video,
        action: "create_video",
        earnings: 10.0,
        timeEstimate: "15 min",
        difficulty: "hard",
      },
      {
        id: "6",
        title: "Apply for Freelance Job",
        description: "Find work and earn project fees",
        icon: Briefcase,
        action: "apply_job",
        earnings: 100.0,
        timeEstimate: "20 min",
        difficulty: "hard",
      },
    ];

    setQuickActions(actions);
  };

  const loadRecentActivities = async () => {
    try {
      const activities = await ActivityRewardService.getRewardHistory(1, 10);
      setRecentActivities(activities || []);
    } catch (error) {
      console.error("Error loading recent activities:", error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setTimeout(() => setIsRefreshing(false), 1000);
    toast({
      title: "Dashboard Refreshed",
      description: "All data has been updated",
    });
  };

  const executeQuickAction = async (action: QuickActions) => {
    try {
      switch (action.action) {
        case "create_post":
          // Navigate to create post
          window.location.href = "/app/feed";
          break;
        case "complete_profile":
          // Navigate to profile
          window.location.href = "/profile";
          break;
        case "refer_friend":
          // Navigate to referrals
          window.location.href = "/referrals";
          break;
        case "list_product":
          // Navigate to marketplace
          window.location.href = "/marketplace/sell";
          break;
        case "create_video":
          // Navigate to video creation
          window.location.href = "/videos/create";
          break;
        case "apply_job":
          // Navigate to freelance
          window.location.href = "/freelance";
          break;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to execute action",
        variant: "destructive",
      });
    }
  };

  const exportEarningsReport = async () => {
    try {
      toast({
        title: "Export Started",
        description: "Generating your earnings report...",
      });

      // Simulate export
      setTimeout(() => {
        toast({
          title: "Export Complete",
          description: "Your earnings report has been downloaded",
        });
      }, 2000);
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to generate earnings report",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Earnings Dashboard</h1>
          <p className="text-muted-foreground">
            Complete view of your Eloity earnings across all modules
          </p>
        </div>
        <div className="flex items-center gap-2">
          {userProgress && (
            <Badge
              className="text-white"
              style={{ backgroundColor: userProgress.currentLevel?.color }}
            >
              {userProgress.currentLevel?.badge}{" "}
              {userProgress.currentLevel?.name}
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={exportEarningsReport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">
                  Total Earnings
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(earningsData?.totalEarnings || 0)}
                </p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="w-3 h-3" />+
                  {earningsData?.analytics.growthRate.toFixed(1)}% this month
                </div>
              </div>
              <div className="p-3 bg-green-200 rounded-full">
                <DollarSign className="w-6 h-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">
                  Eloity Points
                </p>
                <p className="text-2xl font-bold text-purple-900">
                  {formatNumber(earningsData?.totalEloityPoints || 0)}
                </p>
                <p className="text-xs text-purple-600">
                  {userProgress?.streakDays || 0} day streak 🔥
                </p>
              </div>
              <div className="p-3 bg-purple-200 rounded-full">
                <Star className="w-6 h-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Available</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatCurrency(earningsData?.availableToWithdraw || 0)}
                </p>
                <p className="text-xs text-blue-600">Ready to withdraw</p>
              </div>
              <div className="p-3 bg-blue-200 rounded-full">
                <Wallet className="w-6 h-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Lifetime</p>
                <p className="text-2xl font-bold text-orange-900">
                  {formatCurrency(earningsData?.lifetimeEarnings || 0)}
                </p>
                <p className="text-xs text-orange-600">All-time earnings</p>
              </div>
              <div className="p-3 bg-orange-200 rounded-full">
                <Award className="w-6 h-6 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Boosts */}
      {activeBoosts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Active Boosts
              <Badge className="bg-yellow-100 text-yellow-800">
                {activeBoosts.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeBoosts.map((boost, index) => (
                <div
                  key={index}
                  className="p-3 border rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{boost.icon || "⚡"}</span>
                      <div>
                        <p className="font-medium text-sm">
                          {boost.name || "Active Boost"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          2h 15m remaining
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Goals Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Goal Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Monthly Goal</span>
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(earningsData?.goals.monthly.current || 0)} /{" "}
                  {formatCurrency(earningsData?.goals.monthly.target || 0)}
                </span>
              </div>
              <Progress
                value={
                  ((earningsData?.goals.monthly.current || 0) /
                    (earningsData?.goals.monthly.target || 1)) *
                  100
                }
                className="h-3"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formatCurrency(
                  (earningsData?.goals.monthly.target || 0) -
                    (earningsData?.goals.monthly.current || 0),
                )}{" "}
                remaining
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Yearly Goal</span>
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(earningsData?.goals.yearly.current || 0)} /{" "}
                  {formatCurrency(earningsData?.goals.yearly.target || 0)}
                </span>
              </div>
              <Progress
                value={
                  ((earningsData?.goals.yearly.current || 0) /
                    (earningsData?.goals.yearly.target || 1)) *
                  100
                }
                className="h-3"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {(
                  ((earningsData?.goals.yearly.current || 0) /
                    (earningsData?.goals.yearly.target || 1)) *
                  100
                ).toFixed(1)}
                % complete
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">
                  {earningsData?.goals.nextMilestone.name}
                </span>
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(
                    earningsData?.goals.nextMilestone.current || 0,
                  )}{" "}
                  /{" "}
                  {formatCurrency(
                    earningsData?.goals.nextMilestone.target || 0,
                  )}
                </span>
              </div>
              <Progress
                value={
                  ((earningsData?.goals.nextMilestone.current || 0) /
                    (earningsData?.goals.nextMilestone.target || 1)) *
                  100
                }
                className="h-3"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Next level unlock
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="modules">By Module</TabsTrigger>
          <TabsTrigger value="activities">Recent Activities</TabsTrigger>
          <TabsTrigger value="actions">Quick Actions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Earnings This Week */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Weekly Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">This Week</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {formatCurrency(earningsData?.analytics.thisWeek || 0)}
                      </span>
                      <Badge className="bg-green-100 text-green-800">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +18.2%
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Last Week</span>
                    <span className="font-medium">
                      {formatCurrency(earningsData?.analytics.lastWeek || 0)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Best Module</span>
                    <Badge variant="outline" className="capitalize">
                      {earningsData?.analytics.bestPerformingModule}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Earning Sources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Top Earning Sources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(earningsData?.moduleEarnings || {})
                    .sort(([, a], [, b]) => {
                      const sumA = Object.values(a as any).reduce(
                        (sum: number, val: any) =>
                          sum + (typeof val === "number" ? val : 0),
                        0,
                      );
                      const sumB = Object.values(b as any).reduce(
                        (sum: number, val: any) =>
                          sum + (typeof val === "number" ? val : 0),
                        0,
                      );
                      return sumB - sumA;
                    })
                    .slice(0, 5)
                    .map(([module, earnings]) => {
                      const total = Object.values(earnings as any).reduce(
                        (sum: number, val: any) =>
                          sum + (typeof val === "number" ? val : 0),
                        0,
                      );
                      const percentage = (
                        (total / (earningsData?.totalEarnings || 1)) *
                        100
                      ).toFixed(1);

                      return (
                        <div
                          key={module}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <div className="flex items-center gap-2">
                            {module === "social" && (
                              <MessageCircle className="w-4 h-4 text-blue-500" />
                            )}
                            {module === "marketplace" && (
                              <ShoppingBag className="w-4 h-4 text-green-500" />
                            )}
                            {module === "freelance" && (
                              <Briefcase className="w-4 h-4 text-purple-500" />
                            )}
                            {module === "crypto" && (
                              <TrendingUp className="w-4 h-4 text-orange-500" />
                            )}
                            {module === "video" && (
                              <Video className="w-4 h-4 text-red-500" />
                            )}
                            {module === "referrals" && (
                              <Users className="w-4 h-4 text-pink-500" />
                            )}
                            {module === "activities" && (
                              <Activity className="w-4 h-4 text-indigo-500" />
                            )}
                            <span className="text-sm font-medium capitalize">
                              {module}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-sm">
                              {formatCurrency(total)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {percentage}%
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Modules Tab */}
        <TabsContent value="modules" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(earningsData?.moduleEarnings || {}).map(
              ([module, earnings]) => {
                const total = Object.values(earnings as any).reduce(
                  (sum: number, val: any) =>
                    sum + (typeof val === "number" ? val : 0),
                  0,
                );

                return (
                  <Card
                    key={module}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg capitalize flex items-center gap-2">
                          {module === "social" && (
                            <MessageCircle className="w-5 h-5 text-blue-500" />
                          )}
                          {module === "marketplace" && (
                            <ShoppingBag className="w-5 h-5 text-green-500" />
                          )}
                          {module === "freelance" && (
                            <Briefcase className="w-5 h-5 text-purple-500" />
                          )}
                          {module === "crypto" && (
                            <TrendingUp className="w-5 h-5 text-orange-500" />
                          )}
                          {module === "video" && (
                            <Video className="w-5 h-5 text-red-500" />
                          )}
                          {module === "referrals" && (
                            <Users className="w-5 h-5 text-pink-500" />
                          )}
                          {module === "activities" && (
                            <Activity className="w-5 h-5 text-indigo-500" />
                          )}
                          {module}
                        </CardTitle>
                        <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                          <p className="text-2xl font-bold text-blue-600">
                            {formatCurrency(total)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Total Earned
                          </p>
                        </div>

                        <div className="space-y-2">
                          {Object.entries(earnings as any).map(
                            ([subCategory, amount]) => (
                              <div
                                key={subCategory}
                                className="flex justify-between items-center text-sm"
                              >
                                <span className="capitalize text-muted-foreground">
                                  {subCategory
                                    .replace(/([A-Z])/g, " $1")
                                    .trim()}
                                </span>
                                <span className="font-medium">
                                  {formatCurrency(amount as number)}
                                </span>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              },
            )}
          </div>
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Earning Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Activity className="w-4 h-4 text-blue-500" />
                          <div>
                            <p className="font-medium text-sm">
                              {activity.actionType?.replace("_", " ")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(activity.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm text-green-600">
                            +{formatNumber(activity.eloityPoints)} SP
                          </p>
                          {activity.walletBonus > 0 && (
                            <p className="text-xs text-green-500">
                              +{formatCurrency(activity.walletBonus)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        No recent activities
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Start engaging to see your earning activities here
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quick Actions Tab */}
        <TabsContent value="actions" className="space-y-6">
          <div className="grid gap-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2">
                Quick Earning Opportunities
              </h3>
              <p className="text-muted-foreground">
                Fast ways to boost your earnings right now
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action) => (
                <Card
                  key={action.id}
                  className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer"
                  onClick={() => executeQuickAction(action)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <action.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <Badge
                        variant={
                          action.difficulty === "easy"
                            ? "default"
                            : action.difficulty === "medium"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {action.difficulty}
                      </Badge>
                    </div>

                    <h4 className="font-semibold mb-2">{action.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {action.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-green-500" />
                          <span className="font-medium">
                            {formatNumber(action.earnings)} SP
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-blue-500" />
                          <span>{action.timeEstimate}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Earnings Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(earningsData?.analytics.thisMonth || 0)}
                      </p>
                      <p className="text-xs text-green-600">This Month</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-lg font-bold text-gray-600">
                        {formatCurrency(earningsData?.analytics.lastMonth || 0)}
                      </p>
                      <p className="text-xs text-gray-600">Last Month</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <span className="text-lg font-semibold text-green-600">
                      +{earningsData?.analytics.growthRate.toFixed(1)}%
                    </span>
                    <span className="text-sm text-muted-foreground">
                      growth
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-sm text-blue-800 mb-1">
                      Best Performing Module
                    </h4>
                    <p className="text-blue-600 capitalize">
                      {earningsData?.analytics.bestPerformingModule}
                    </p>
                  </div>

                  <div className="p-3 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-sm text-purple-800 mb-1">
                      Current Level
                    </h4>
                    <p className="text-purple-600">
                      {userProgress?.currentLevel?.name || "Bronze Explorer"}
                    </p>
                  </div>

                  <div className="p-3 bg-orange-50 rounded-lg">
                    <h4 className="font-medium text-sm text-orange-800 mb-1">
                      Next Milestone
                    </h4>
                    <p className="text-orange-600">
                      {formatCurrency(
                        (earningsData?.goals.nextMilestone.target || 0) -
                          (earningsData?.goals.nextMilestone.current || 0),
                      )}{" "}
                      to go
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComprehensiveEarningsDashboard;
