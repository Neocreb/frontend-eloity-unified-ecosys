// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  TrendingUp,
  TrendingDown,
  Star,
  Shield,
  Target,
  Users,
  Gift,
  Zap,
  Trophy,
  Activity,
  Calendar,
  Eye,
  Heart,
  MessageCircle,
  Share,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Flame,
  Award,
  RefreshCw,
  ArrowUpRight,
  BarChart3,
  PieChart,
  Settings,
} from "lucide-react";
import { formatCurrency, formatNumber } from "@/utils/formatters";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface ActivitySummary {
  currentEloits: number;
  currentWalletBalance: {
    usdt: number;
    eth: number;
    btc: number;
  };
  period: {
    totalEloitsEarned: number;
    totalWalletBonusEarned: number;
    totalActivities: number;
  };
  breakdown: Array<{
    actionType: string;
    eloitsEarned: number;
    walletBonusEarned: number;
    activityCount: number;
  }>;
  trustScore: {
    current: number;
    level: string;
    multiplier: number;
    dailyCap: number;
  } | null;
}

interface ActivityHistoryItem {
  id: string;
  actionType: string;
  targetId?: string;
  targetType?: string;
  eloits: number;
  walletBonus: number;
  currency: string;
  status: string;
  qualityScore: number;
  createdAt: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  targetAction: string;
  targetCount: number;
  targetValue?: number;
  eloitsReward: number;
  walletReward: number;
  progress: {
    currentProgress: number;
    currentValue: number;
    isCompleted: boolean;
    completedAt?: string;
    rewardClaimed: boolean;
  };
  endDate: string;
  challengeType: string;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const ActivityEconomyDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [timeRange, setTimeRange] = useState("7d");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // State
  const [activitySummary, setActivitySummary] =
    useState<ActivitySummary | null>(null);
  const [activityHistory, setActivityHistory] = useState<ActivityHistoryItem[]>(
    [],
  );
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState("today");

  // Load data on component mount
  useEffect(() => {
    if (user) {
      loadActivityData();
    }
  }, [user, timeRange]);

  // =============================================================================
  // DATA LOADING FUNCTIONS
  // =============================================================================

  const loadActivityData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        loadActivitySummary(),
        loadActivityHistory(),
        loadChallenges(),
      ]);
    } catch (error) {
      console.error("Error loading activity data:", error);
      toast({
        title: "Error",
        description: "Failed to load activity data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadActivitySummary = async () => {
    try {
      const response = await fetch(
        `/api/creator/reward-summary?period=${timeRange}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setActivitySummary(data.data);
        console.log("✅ Loaded real activity summary:", data.data);
      } else {
        console.warn(
          "⚠️ API failed, using demo data. Response:",
          response.status,
        );
        // Fallback to demo data with lower values to show progression
        setActivitySummary({
          currentEloits: 0,
          currentWalletBalance: {
            usdt: 0,
            eth: 0,
            btc: 0,
          },
          period: {
            totalEloitsEarned: 0,
            totalWalletBonusEarned: 0,
            totalActivities: 0,
          },
          breakdown: [],
          trustScore: {
            current: 78.5,
            level: "gold",
            multiplier: 1.0,
            dailyCap: 200,
          },
        });
      }
    } catch (error) {
      console.error("Error loading activity summary:", error);
    }
  };

  const loadActivityHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No auth token - starting with empty activity history");
        setActivityHistory([]);
        return;
      }

      const response = await fetch(`/api/creator/reward-history?limit=50`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(
          "✅ Loaded real activity history:",
          data.data?.length || 0,
          "items",
        );
        setActivityHistory(data.data || []);
      } else {
        console.warn("⚠️ Activity history API failed:", response.status);
        setActivityHistory([]);
      }
    } catch (error) {
      console.error("Error loading activity history:", error);
      setActivityHistory([]);
    }
  };

  const loadChallenges = async () => {
    // Demo challenges data
    setChallenges([
      {
        id: "1",
        title: "Daily Poster",
        description: "Post 3 pieces of content today",
        targetAction: "post_content",
        targetCount: 3,
        eloitsReward: 15,
        walletReward: 0,
        progress: {
          currentProgress: 1,
          currentValue: 1,
          isCompleted: false,
          rewardClaimed: false,
        },
        endDate: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
        challengeType: "daily",
      },
      {
        id: "2",
        title: "Social Butterfly",
        description: "Like and comment on 20 posts",
        targetAction: "social_engagement",
        targetCount: 20,
        eloitsReward: 10,
        walletReward: 0,
        progress: {
          currentProgress: 12,
          currentValue: 12,
          isCompleted: false,
          rewardClaimed: false,
        },
        endDate: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
        challengeType: "daily",
      },
      {
        id: "3",
        title: "Big Spender",
        description: "Make purchases worth $100",
        targetAction: "purchase_product",
        targetCount: 1,
        targetValue: 100,
        eloitsReward: 50,
        walletReward: 5,
        progress: {
          currentProgress: 0,
          currentValue: 45,
          isCompleted: false,
          rewardClaimed: false,
        },
        endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        challengeType: "weekly",
      },
    ]);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadActivityData();
    setTimeout(() => setIsRefreshing(false), 1000);
    toast({
      title: "Refreshed",
      description: "Activity data has been updated",
    });
  };

  // =============================================================================
  // RENDER FUNCTIONS
  // =============================================================================

  const renderActivityIcon = (actionType: string) => {
    switch (actionType) {
      case "like_post":
        return <Heart className="w-4 h-4 text-red-500" />;
      case "comment_post":
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case "share_content":
        return <Share className="w-4 h-4 text-green-500" />;
      case "post_content":
        return <Activity className="w-4 h-4 text-purple-500" />;
      case "purchase_product":
        return <ShoppingBag className="w-4 h-4 text-yellow-500" />;
      case "daily_login":
        return <Calendar className="w-4 h-4 text-indigo-500" />;
      default:
        return <Star className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionDisplayName = (actionType: string) => {
    const names: Record<string, string> = {
      like_post: "Like Post",
      comment_post: "Comment",
      share_content: "Share",
      post_content: "Create Post",
      purchase_product: "Purchase",
      daily_login: "Daily Login",
      complete_profile: "Profile Complete",
      refer_user: "Referral",
      tip_creator: "Tip",
      subscribe_creator: "Subscribe",
    };
    return names[actionType] || actionType.replace(/_/g, " ");
  };

  const getTrustLevelColor = (level: string) => {
    switch (level) {
      case "diamond":
        return "bg-gradient-to-r from-blue-400 to-purple-500 text-white";
      case "platinum":
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
      case "gold":
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
      case "silver":
        return "bg-gradient-to-r from-gray-200 to-gray-400 text-gray-800";
      default:
        return "bg-gradient-to-r from-orange-400 to-red-500 text-white";
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
          <h1 className="text-2xl font-bold">Activity Economy</h1>
          <p className="text-muted-foreground">
            Earn Eloits and wallet bonuses for every meaningful action
          </p>
        </div>
        <div className="flex items-center gap-2">
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
        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">
                  Eloits
                </p>
                <p className="text-2xl font-bold text-purple-900">
                  {formatNumber(activitySummary?.currentEloits || 0)}
                </p>
                <p className="text-xs text-purple-600">
                  +
                  {formatNumber(
                    activitySummary?.period.totalEloitsEarned || 0,
                  )}{" "}
                  this week
                </p>
              </div>
              <div className="p-3 bg-purple-200 rounded-full">
                <Star className="w-6 h-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">
                  Wallet Bonus
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(
                    activitySummary?.currentWalletBalance.usdt || 0,
                  )}
                </p>
                <p className="text-xs text-green-600">
                  +
                  {formatCurrency(
                    activitySummary?.period.totalWalletBonusEarned || 0,
                  )}{" "}
                  earned
                </p>
              </div>
              <div className="p-3 bg-green-200 rounded-full">
                <DollarSign className="w-6 h-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Trust Score</p>
                <p className="text-2xl font-bold text-blue-900">
                  {activitySummary?.trustScore?.current.toFixed(1) || "N/A"}
                </p>
                <Badge
                  className={`text-xs ${getTrustLevelColor(activitySummary?.trustScore?.level || "bronze")}`}
                >
                  {activitySummary?.trustScore?.level || "Bronze"}
                </Badge>
              </div>
              <div className="p-3 bg-blue-200 rounded-full">
                <Shield className="w-6 h-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">
                  Activities
                </p>
                <p className="text-2xl font-bold text-orange-900">
                  {formatNumber(activitySummary?.period.totalActivities || 0)}
                </p>
                <p className="text-xs text-orange-600">
                  This {timeRange === "7d" ? "week" : "month"}
                </p>
              </div>
              <div className="p-3 bg-orange-200 rounded-full">
                <Activity className="w-6 h-6 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="activities">Activity Log</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activity Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Activity Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activitySummary?.breakdown.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {renderActivityIcon(item.actionType)}
                        <div>
                          <p className="font-medium text-sm">
                            {getActionDisplayName(item.actionType)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.activityCount} actions
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">
                          {formatNumber(item.eloitsEarned)} ELO
                        </p>
                        {item.walletBonusEarned > 0 && (
                          <p className="text-xs text-green-600">
                            +{formatCurrency(item.walletBonusEarned)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Trust Score Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Trust Score Monitor
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activitySummary?.trustScore ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Current Score</span>
                      <span className="text-2xl font-bold">
                        {activitySummary.trustScore.current.toFixed(1)}
                      </span>
                    </div>

                    <Progress
                      value={activitySummary.trustScore.current}
                      className="h-3"
                    />

                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-muted-foreground">
                          Reward Multiplier
                        </p>
                        <p className="text-lg font-bold text-blue-600">
                          {activitySummary.trustScore.multiplier}x
                        </p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <p className="text-xs text-muted-foreground">
                          Daily Cap
                        </p>
                        <p className="text-lg font-bold text-purple-600">
                          {activitySummary.trustScore.dailyCap} ELO
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-sm mb-2">
                        How to improve:
                      </h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>
                          • Diversify your activities across different types
                        </li>
                        <li>• Maintain consistent daily engagement</li>
                        <li>• Create high-quality content and interactions</li>
                        <li>• Avoid rapid or repetitive actions</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Trust score not available
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activityHistory.slice(0, 5).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {renderActivityIcon(activity.actionType)}
                      <div>
                        <p className="font-medium text-sm">
                          {getActionDisplayName(activity.actionType)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">
                        +{formatNumber(activity.eloits)} SP
                      </p>
                      {activity.walletBonus > 0 && (
                        <p className="text-xs text-green-600">
                          +{formatCurrency(activity.walletBonus)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {activityHistory.length > 5 && (
                <div className="mt-4 text-center">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("activities")}
                  >
                    View All Activities
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Log Tab */}
        <TabsContent value="activities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Complete Activity History</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {activityHistory.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {renderActivityIcon(activity.actionType)}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">
                              {getActionDisplayName(activity.actionType)}
                            </p>
                            <Badge
                              variant={
                                activity.status === "confirmed"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {activity.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.createdAt).toLocaleString()} •
                            Quality: {activity.qualityScore.toFixed(1)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">
                          +{formatNumber(activity.eloits)} SP
                        </p>
                        {activity.walletBonus > 0 && (
                          <p className="text-xs text-green-600">
                            +{formatCurrency(activity.walletBonus)}{" "}
                            {activity.currency}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {challenges.map((challenge) => (
              <Card key={challenge.id} className="relative overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {challenge.challengeType}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {new Date(challenge.endDate).toLocaleDateString()}
                    </div>
                  </div>
                  <CardTitle className="text-lg">{challenge.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {challenge.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm text-muted-foreground">
                          {challenge.targetValue
                            ? `${formatCurrency(challenge.progress.currentValue)} / ${formatCurrency(challenge.targetValue)}`
                            : `${challenge.progress.currentProgress} / ${challenge.targetCount}`}
                        </span>
                      </div>
                      <Progress
                        value={
                          challenge.targetValue
                            ? (challenge.progress.currentValue /
                                challenge.targetValue) *
                              100
                            : (challenge.progress.currentProgress /
                                challenge.targetCount) *
                              100
                        }
                        className="h-2"
                      />
                    </div>

                    {/* Rewards */}
                    <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Rewards</p>
                          <div className="flex items-center gap-3 mt-1">
                            {challenge.eloitsReward > 0 && (
                              <span className="text-xs text-purple-600">
                                {challenge.eloitsReward} SP
                              </span>
                            )}
                            {challenge.walletReward > 0 && (
                              <span className="text-xs text-green-600">
                                {formatCurrency(challenge.walletReward)}
                              </span>
                            )}
                          </div>
                        </div>
                        {challenge.progress.isCompleted ? (
                          challenge.progress.rewardClaimed ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Claimed
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Gift className="w-3 h-3 mr-1" />
                              Claim
                            </Button>
                          )
                        ) : (
                          <Badge variant="outline">
                            <Target className="w-3 h-3 mr-1" />
                            In Progress
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Activity Economy Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Notification Preferences</h3>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">
                        Notify me when I earn Eloits
                      </span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Daily challenge reminders</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Weekly activity summary</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Privacy Settings</h3>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">
                        Show my activity on leaderboards
                      </span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" />
                      <span className="text-sm">
                        Share anonymized data for improvements
                      </span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button variant="outline" className="w-full">
                    Export Activity Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ActivityEconomyDashboard;
