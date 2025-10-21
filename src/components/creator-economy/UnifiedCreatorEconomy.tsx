import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Download,
  UserPlus,
  Link,
  Copy,
  History,
  Crown,
  Share2,
  Building,
  CreditCard,
  Wallet,
  Plus,
  Filter,
  Search,
  ChevronRight,
  ExternalLink,
  FileText,
  Video,
  Image,
  Music,
  Tv,
  Play,
} from "lucide-react";
import { formatCurrency, formatNumber } from "@/utils/formatters";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface UnifiedEconomyData {
  // Activity Economy Data
  currentEloityPoints: number;
  totalEloityPointsEarned: number;
  totalActivities: number;
  trustScore: {
    current: number;
    level: string;
    multiplier: number;
    dailyCap: number;
  };

  // Creator Economy Data
  totalEarnings: number;
  availableToWithdraw: number;
  earningsByType: {
    tips: number;
    subscriptions: number;
    views: number;
    boosts: number;
    services: number;
    activities: number;
  };

  // Wallet Data
  walletBalance: {
    usdt: number;
    eth: number;
    btc: number;
    eloityPoints: number;
  };

  // Performance Data
  contentMetrics: {
    totalContent: number;
    totalViews: number;
    totalSubscribers: number;
    totalTips: number;
  };

  // Referral Data
  referralStats: {
    totalReferrals: number;
    totalReferralEarnings: number;
    conversionRate: number;
    activeReferrals: number;
  };
}

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  eloityPoints: number;
  walletBonus: number;
  timestamp: string;
  status: string;
  quality?: number;
}

interface ContentItem {
  id: string;
  type: string;
  title: string;
  thumbnail?: string;
  views: number;
  earnings: number;
  tips: number;
  eloityPoints: number;
  createdAt: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  reward: number;
  progress: number;
  target: number;
  type: string;
  timeLeft: string;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const UnifiedCreatorEconomy: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // State
  const [economyData, setEconomyData] = useState<UnifiedEconomyData | null>(
    null,
  );
  const [activityHistory, setActivityHistory] = useState<ActivityItem[]>([]);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("wallet");

  useEffect(() => {
    if (user) {
      loadEconomyData();
    }
  }, [user]);

  // =============================================================================
  // DATA LOADING
  // =============================================================================

  const loadEconomyData = async () => {
    try {
      setIsLoading(true);

      // In production, this would combine multiple API calls
      // For now, using comprehensive demo data
      setEconomyData({
        currentEloityPoints: 2450,
        totalEloityPointsEarned: 15680,
        totalActivities: 1247,
        trustScore: {
          current: 78.5,
          level: "gold",
          multiplier: 1.0,
          dailyCap: 200,
        },
        totalEarnings: 15240,
        availableToWithdraw: 9700,
        earningsByType: {
          tips: 4800,
          subscriptions: 5000,
          views: 2100,
          boosts: 1340,
          services: 1300,
          activities: 700,
        },
        walletBalance: {
          usdt: 9700,
          eth: 0.08,
          btc: 0.002,
          eloityPoints: 2450,
        },
        contentMetrics: {
          totalContent: 127,
          totalViews: 89456,
          totalSubscribers: 1234,
          totalTips: 89,
        },
        referralStats: {
          totalReferrals: 23,
          totalReferralEarnings: 340,
          conversionRate: 26.7,
          activeReferrals: 18,
        },
      });

      // Load activity history
      setActivityHistory([
        {
          id: "1",
          type: "post_content",
          description: "Created new post",
          eloityPoints: 3.0,
          walletBonus: 0,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: "confirmed",
          quality: 1.2,
        },
        {
          id: "2",
          type: "tip_received",
          description: "Received tip from Alice",
          eloityPoints: 1.0,
          walletBonus: 25.0,
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          status: "confirmed",
          quality: 1.0,
        },
        {
          id: "3",
          type: "like_post",
          description: "Liked 5 posts",
          eloityPoints: 2.5,
          walletBonus: 0,
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          status: "confirmed",
          quality: 0.8,
        },
        {
          id: "4",
          type: "subscription_earned",
          description: "New subscriber: Bob",
          eloityPoints: 10.0,
          walletBonus: 9.99,
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          status: "confirmed",
          quality: 1.0,
        },
      ]);

      // Load content performance
      setContentItems([
        {
          id: "1",
          type: "video",
          title: "AI Art Creation Tutorial",
          thumbnail:
            "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=100",
          views: 12450,
          earnings: 240.5,
          tips: 8,
          eloityPoints: 45,
          createdAt: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        },
        {
          id: "2",
          type: "post",
          title: "Behind the scenes of my process",
          views: 5678,
          earnings: 89.25,
          tips: 3,
          eloityPoints: 23,
          createdAt: new Date(
            Date.now() - 1 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        },
        {
          id: "3",
          type: "reel",
          title: "Quick design tips",
          views: 23456,
          earnings: 456.75,
          tips: 12,
          eloityPoints: 78,
          createdAt: new Date(
            Date.now() - 3 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        },
      ]);

      // Load challenges
      setChallenges([
        {
          id: "1",
          title: "Daily Creator",
          description: "Post 3 pieces of content today",
          reward: 15,
          progress: 1,
          target: 3,
          type: "daily",
          timeLeft: "8h 32m",
        },
        {
          id: "2",
          title: "Social Butterfly",
          description: "Engage with 20 posts",
          reward: 10,
          progress: 14,
          target: 20,
          type: "daily",
          timeLeft: "8h 32m",
        },
        {
          id: "3",
          title: "Earning Goal",
          description: "Earn $100 this week",
          reward: 50,
          progress: 67,
          target: 100,
          type: "weekly",
          timeLeft: "3d 12h",
        },
      ]);
    } catch (error) {
      console.error("Error loading economy data:", error);
      toast({
        title: "Error",
        description: "Failed to load economy data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadEconomyData();
    setTimeout(() => setIsRefreshing(false), 1000);
    toast({
      title: "Refreshed",
      description: "All data has been updated",
    });
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) < 50) {
      toast({
        title: "Invalid Amount",
        description: "Minimum withdrawal is $50",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Withdrawal Requested",
      description: `$${withdrawAmount} withdrawal to ${selectedPaymentMethod === "wallet" ? "Unified Wallet" : "Bank Account"} submitted. Check your wallet rewards tab for transaction history.`,
    });
    setWithdrawAmount("");
  };

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "post_content":
        return <Activity className="w-4 h-4 text-purple-500" />;
      case "like_post":
        return <Heart className="w-4 h-4 text-red-500" />;
      case "tip_received":
        return <Gift className="w-4 h-4 text-pink-500" />;
      case "subscription_earned":
        return <Users className="w-4 h-4 text-blue-500" />;
      case "view_reward":
        return <Eye className="w-4 h-4 text-green-500" />;
      default:
        return <Star className="w-4 h-4 text-gray-500" />;
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-4 h-4 text-red-500" />;
      case "post":
        return <FileText className="w-4 h-4 text-blue-500" />;
      case "reel":
        return <Play className="w-4 h-4 text-purple-500" />;
      case "image":
        return <Image className="w-4 h-4 text-green-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
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
          <h1 className="text-3xl font-bold">Creator & Activity Economy</h1>
          <p className="text-muted-foreground">
            Complete monetization ecosystem for creators and active users
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-purple-100 text-purple-800">
            <Crown className="w-3 h-3 mr-1" />
            Creator Program
          </Badge>
          <Badge className="bg-blue-100 text-blue-800">
            <Star className="w-3 h-3 mr-1" />
            Activity Economy
          </Badge>
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

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Earnings */}
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">
                  Total Earnings
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(economyData?.totalEarnings || 0)}
                </p>
                <p className="text-xs text-green-600">+15.8% this month</p>
              </div>
              <div className="p-3 bg-green-200 rounded-full">
                <DollarSign className="w-6 h-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Eloity Points */}
        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">
                  Eloity Points
                </p>
                <p className="text-2xl font-bold text-purple-900">
                  {formatNumber(economyData?.currentEloityPoints || 0)}
                </p>
                <p className="text-xs text-purple-600">
                  +{formatNumber(economyData?.totalEloityPointsEarned || 0)} earned
                </p>
              </div>
              <div className="p-3 bg-purple-200 rounded-full">
                <Star className="w-6 h-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trust Score */}
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Trust Score</p>
                <p className="text-2xl font-bold text-blue-900">
                  {economyData?.trustScore?.current.toFixed(1) || "N/A"}
                </p>
                <Badge
                  className={`text-xs ${getTrustLevelColor(economyData?.trustScore?.level || "bronze")}`}
                >
                  {economyData?.trustScore?.level || "Bronze"}
                </Badge>
              </div>
              <div className="p-3 bg-blue-200 rounded-full">
                <Shield className="w-6 h-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available to Withdraw */}
        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Available</p>
                <p className="text-2xl font-bold text-orange-900">
                  {formatCurrency(economyData?.availableToWithdraw || 0)}
                </p>
                <p className="text-xs text-orange-600">Ready to withdraw</p>
              </div>
              <div className="p-3 bg-orange-200 rounded-full">
                <ArrowUpRight className="w-6 h-6 text-orange-700" />
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
        <div className="overflow-x-auto">
          <TabsList className="inline-flex w-max min-w-full">
            <TabsTrigger value="overview" className="flex items-center gap-2 min-w-0">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="activities" className="flex items-center gap-2 min-w-0">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Activities</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2 min-w-0">
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">Content</span>
            </TabsTrigger>
            <TabsTrigger value="challenges" className="flex items-center gap-2 min-w-0">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Challenges</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2 min-w-0">
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Leaderboard</span>
            </TabsTrigger>
            <TabsTrigger value="rewards" className="flex items-center gap-2 min-w-0">
              <Gift className="w-4 h-4" />
              <span className="hidden sm:inline">Rewards</span>
            </TabsTrigger>
            <TabsTrigger value="referrals" className="flex items-center gap-2 min-w-0">
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Referrals</span>
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="flex items-center gap-2 min-w-0">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Withdraw</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Revenue Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(economyData?.earningsByType || {}).map(
                    ([source, amount]) => {
                      const percentage = economyData?.totalEarnings
                        ? Math.round((amount / economyData.totalEarnings) * 100)
                        : 0;
                      return (
                        <div
                          key={source}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <div>
                              <p className="font-medium text-sm capitalize">
                                {source.replace("_", " ")}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {percentage}% of total
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {formatCurrency(amount)}
                            </p>
                            <Progress
                              value={percentage}
                              className="w-16 h-2 mt-1"
                            />
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Performance Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-lg font-bold text-blue-600">
                      {formatNumber(
                        economyData?.contentMetrics.totalContent || 0,
                      )}
                    </p>
                    <p className="text-xs text-blue-600">Content Created</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-lg font-bold text-green-600">
                      {formatNumber(
                        economyData?.contentMetrics.totalViews || 0,
                      )}
                    </p>
                    <p className="text-xs text-green-600">Total Views</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-lg font-bold text-purple-600">
                      {formatNumber(
                        economyData?.contentMetrics.totalSubscribers || 0,
                      )}
                    </p>
                    <p className="text-xs text-purple-600">Subscribers</p>
                  </div>
                  <div className="text-center p-3 bg-pink-50 rounded-lg">
                    <p className="text-lg font-bold text-pink-600">
                      {formatNumber(economyData?.totalActivities || 0)}
                    </p>
                    <p className="text-xs text-pink-600">Activities</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activityHistory.slice(0, 6).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getActivityIcon(activity.type)}
                      <div>
                        <p className="font-medium text-sm">
                          {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        {activity.eloityPoints > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            +{formatNumber(activity.eloityPoints)} SP
                          </Badge>
                        )}
                        {activity.walletBonus > 0 && (
                          <Badge className="text-xs bg-green-100 text-green-800">
                            +{formatCurrency(activity.walletBonus)}
                          </Badge>
                        )}
                      </div>
                      <Badge
                        variant={
                          activity.status === "confirmed"
                            ? "default"
                            : "secondary"
                        }
                        className="text-xs mt-1"
                      >
                        {activity.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activities Tab */}
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
                        {getActivityIcon(activity.type)}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">
                              {activity.description}
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
                            {new Date(activity.timestamp).toLocaleString()}
                            {activity.quality &&
                              ` • Quality: ${activity.quality.toFixed(1)}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          {activity.eloityPoints > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              +{formatNumber(activity.eloityPoints)} SP
                            </Badge>
                          )}
                          {activity.walletBonus > 0 && (
                            <Badge className="text-xs bg-green-100 text-green-800">
                              +{formatCurrency(activity.walletBonus)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monetized Content Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contentItems.map((content) => (
                  <div
                    key={content.id}
                    className="flex items-center gap-4 p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {content.thumbnail ? (
                        <img
                          src={content.thumbnail}
                          alt={content.title}
                          className="w-16 h-16 rounded object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                          {getContentIcon(content.type)}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{content.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {content.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(content.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex-1 grid grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-lg font-bold text-blue-600">
                          {formatNumber(content.views)}
                        </p>
                        <p className="text-xs text-muted-foreground">Views</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(content.earnings)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Earnings
                        </p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-pink-600">
                          {content.tips}
                        </p>
                        <p className="text-xs text-muted-foreground">Tips</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-purple-600">
                          {content.eloityPoints}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Eloity Points
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                      {challenge.type}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {challenge.timeLeft}
                    </div>
                  </div>
                  <CardTitle className="text-lg">{challenge.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {challenge.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm text-muted-foreground">
                          {challenge.progress} / {challenge.target}
                        </span>
                      </div>
                      <Progress
                        value={(challenge.progress / challenge.target) * 100}
                        className="h-2"
                      />
                    </div>

                    <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Reward</p>
                          <p className="text-lg font-bold text-purple-600">
                            {challenge.reward} SP
                          </p>
                        </div>
                        {challenge.progress >= challenge.target ? (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Gift className="w-3 h-3 mr-1" />
                            Claim
                          </Button>
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

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Challenge Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { rank: 1, name: "DanceMaster", score: 2850, avatar: "https://i.pravatar.cc/150?img=1", badge: "🥇" },
                    { rank: 2, name: "CreativeQueen", score: 2720, avatar: "https://i.pravatar.cc/150?img=2", badge: "🥈" },
                    { rank: 3, name: "TalentKing", score: 2650, avatar: "https://i.pravatar.cc/150?img=3", badge: "🥉" },
                    { rank: 4, name: "You", score: 2100, avatar: "https://i.pravatar.cc/150?img=4", badge: "" },
                    { rank: 5, name: "ArtisticSoul", score: 1980, avatar: "https://i.pravatar.cc/150?img=5", badge: "" },
                  ].map((user) => (
                    <div key={user.rank} className={cn(
                      "flex items-center justify-between p-3 rounded-lg",
                      user.name === "You" ? "bg-purple-50 border border-purple-200" : "hover:bg-gray-50"
                    )}>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold w-8 text-center">
                            {user.badge || `#${user.rank}`}
                          </span>
                        </div>
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">Rank #{user.rank}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-purple-600">{user.score} SP</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-purple-500" />
                  Top Creators This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { rank: 1, name: "ViralStar", earnings: 15420, avatar: "https://i.pravatar.cc/150?img=6", growth: "+23%" },
                    { rank: 2, name: "ContentKing", earnings: 12850, avatar: "https://i.pravatar.cc/150?img=7", growth: "+18%" },
                    { rank: 3, name: "TrendSetter", earnings: 11200, avatar: "https://i.pravatar.cc/150?img=8", growth: "+15%" },
                    { rank: 4, name: "You", earnings: 8900, avatar: "https://i.pravatar.cc/150?img=4", growth: "+12%" },
                    { rank: 5, name: "RisingStar", earnings: 7650, avatar: "https://i.pravatar.cc/150?img=9", growth: "+9%" },
                  ].map((creator) => (
                    <div key={creator.rank} className={cn(
                      "flex items-center justify-between p-3 rounded-lg",
                      creator.name === "You" ? "bg-green-50 border border-green-200" : "hover:bg-gray-50"
                    )}>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold w-6 text-center">#{creator.rank}</span>
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={creator.avatar} />
                          <AvatarFallback>{creator.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{creator.name}</p>
                          <p className="text-sm text-green-600">{creator.growth}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${creator.earnings}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="col-span-full mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-pink-500" />
                  Available Rewards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border border-purple-200 rounded-lg text-center bg-purple-50">
                    <Crown className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <h3 className="font-bold text-lg mb-1">Creator Badge</h3>
                    <p className="text-sm text-muted-foreground mb-3">Unlock at 5,000 SP</p>
                    <Button size="sm" className="w-full" disabled>2,900 SP to go</Button>
                  </div>

                  <div className="p-4 border border-blue-200 rounded-lg text-center bg-blue-50">
                    <Zap className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <h3 className="font-bold text-lg mb-1">Free Boost</h3>
                    <p className="text-sm text-muted-foreground mb-3">Cost: 1,000 SP</p>
                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">Claim Now</Button>
                  </div>

                  <div className="p-4 border border-green-200 rounded-lg text-center bg-green-50">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <h3 className="font-bold text-lg mb-1">Cash Reward</h3>
                    <p className="text-sm text-muted-foreground mb-3">$50 USD</p>
                    <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">Claim for 2,500 SP</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5 text-gray-500" />
                  Reward History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { date: "2024-01-15", reward: "Free Boost", type: "boost", status: "claimed" },
                    { date: "2024-01-10", reward: "Challenge Winner", type: "sp", amount: "500 SP", status: "claimed" },
                    { date: "2024-01-05", reward: "Monthly Bonus", type: "cash", amount: "$25", status: "claimed" },
                    { date: "2024-01-01", reward: "Referral Bonus", type: "sp", amount: "200 SP", status: "claimed" },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          item.type === "boost" ? "bg-blue-500" :
                          item.type === "sp" ? "bg-purple-500" : "bg-green-500"
                        )} />
                        <div>
                          <p className="font-medium">{item.reward}</p>
                          <p className="text-sm text-muted-foreground">{item.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {item.amount && (
                          <p className="font-bold text-sm">{item.amount}</p>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Referrals Tab */}
        <TabsContent value="referrals" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {economyData?.referralStats.totalReferrals || 0}
                </p>
                <p className="text-sm text-muted-foreground">Total Referrals</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(
                    economyData?.referralStats.totalReferralEarnings || 0,
                  )}
                </p>
                <p className="text-sm text-muted-foreground">Earnings</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {economyData?.referralStats.conversionRate || 0}%
                </p>
                <p className="text-sm text-muted-foreground">Conversion</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {economyData?.referralStats.activeReferrals || 0}
                </p>
                <p className="text-sm text-muted-foreground">Active</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Your Referral Link</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    value="https://eloity.app/join?ref=CREATOR123"
                    readOnly
                    className="flex-1"
                  />
                  <Button variant="outline" size="sm">
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Share this link to earn 10 SP for each user who joins and
                  completes 3 actions
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Withdraw Tab */}
        <TabsContent value="withdraw" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Withdraw Earnings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Amount (USD)</label>
                  <Input
                    type="number"
                    placeholder="50.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    min="50"
                    step="0.01"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum withdrawal: $50.00 • Available:{" "}
                    {formatCurrency(economyData?.availableToWithdraw || 0)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium">Payment Method</label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Button
                      variant={
                        selectedPaymentMethod === "bank" ? "default" : "outline"
                      }
                      className="justify-start gap-2"
                      onClick={() => setSelectedPaymentMethod("bank")}
                    >
                      <Building className="w-4 h-4" />
                      Bank Transfer
                    </Button>
                    <Button
                      variant={
                        selectedPaymentMethod === "wallet"
                          ? "default"
                          : "outline"
                      }
                      className="justify-start gap-2"
                      onClick={() => setSelectedPaymentMethod("wallet")}
                    >
                      <Wallet className="w-4 h-4" />
                      Unified Wallet
                    </Button>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-sm mb-1">
                    Processing Information
                  </h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>
                      • Processing fee: {selectedPaymentMethod === "wallet" ? "0.5%" : "2%"} ($
                      {(parseFloat(withdrawAmount) * (selectedPaymentMethod === "wallet" ? 0.005 : 0.02)).toFixed(2) || "0.00"}
                      )
                    </li>
                    <li>• Processing time: {selectedPaymentMethod === "wallet" ? "Instant" : "2-5 business days"}</li>
                    <li>
                      • You'll receive: $
                      {(parseFloat(withdrawAmount) * (selectedPaymentMethod === "wallet" ? 0.995 : 0.98) || 0).toFixed(2)}
                    </li>
                  </ul>
                </div>

                <Button
                  onClick={handleWithdraw}
                  className="w-full"
                  disabled={!withdrawAmount || parseFloat(withdrawAmount) < 50}
                >
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  Request Withdrawal
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Wallet Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <span className="font-medium">USDT</span>
                    </div>
                    <span className="font-bold text-green-600">
                      {formatCurrency(economyData?.walletBalance.usdt || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">Eloity Points</span>
                    </div>
                    <span className="font-bold text-purple-600">
                      {formatNumber(economyData?.walletBalance.eloityPoints || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        E
                      </span>
                      <span className="font-medium">ETH</span>
                    </div>
                    <span className="font-bold text-blue-600">
                      {economyData?.walletBalance.eth.toFixed(4) || "0.0000"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        ₿
                      </span>
                      <span className="font-medium">BTC</span>
                    </div>
                    <span className="font-bold text-orange-600">
                      {economyData?.walletBalance.btc.toFixed(6) || "0.000000"}
                    </span>
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

export default UnifiedCreatorEconomy;
