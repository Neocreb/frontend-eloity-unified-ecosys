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
  Settings,
  Download,
  UserPlus,
  Copy,
  History,
  Crown,
  Share2,
  Building,
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
  Home,
  Coins,
  TrendingDown,
  Info,
} from "lucide-react";
import { formatCurrency, formatNumber } from "@/utils/formatters";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface EnhancedEconomyData {
  // Core Metrics
  currentEloity Points: number;
  totalEloity PointsEarned: number;
  totalEarnings: number;
  availableToWithdraw: number;
  
  // Trust & Quality
  trustScore: {
    current: number;
    level: string;
    multiplier: number;
    nextLevelAt: number;
  };
  
  // Activity Data (New Enhanced System)
  activityStats: {
    totalActivities: number;
    contentCreated: number;
    qualityScore: number;
    streakDays: number;
  };
  
  // Earnings Breakdown (Updated Categories)
  earningsByType: {
    contentCreation: number;  // Post creation with quality bonuses
    engagement: number;       // Likes, comments, shares
    marketplace: number;      // Product sales (payment completed)
    freelance: number;        // Milestones completed
    p2pTrading: number;       // Confirmed trades
    referrals: number;        // Quality referrals
    challenges: number;       // Challenge completions
    education: number;        // Learning rewards from courses and articles
  };
  
  // Recent Activity (Enhanced)
  recentRewards: Array<{
    id: string;
    type: string;
    description: string;
    eloityPoints: number;
    walletBonus: number;
    qualityMultiplier?: number;
    timestamp: string;
    status: 'confirmed' | 'pending' | 'failed';
  }>;
  
  // Challenges (Gamification)
  activeChallenges: Array<{
    id: string;
    title: string;
    description: string;
    progress: number;
    target: number;
    reward: number;
    timeLeft: string;
    type: 'daily' | 'weekly' | 'monthly';
  }>;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const EnhancedUnifiedCreatorEconomy: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");

  // State
  const [economyData, setEconomyData] = useState<EnhancedEconomyData | null>(null);

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

      // Enhanced demo data reflecting new reward system
      setEconomyData({
        currentEloity Points: 3420,
        totalEloity PointsEarned: 18560,
        totalEarnings: 18240,
        availableToWithdraw: 12150,
        
        trustScore: {
          current: 82.5,
          level: "Gold",
          multiplier: 1.25,
          nextLevelAt: 90.0,
        },
        
        activityStats: {
          totalActivities: 1456,
          contentCreated: 89,
          qualityScore: 1.8,
          streakDays: 12,
        },
        
        earningsByType: {
          contentCreation: 6840,    // 37.5% - No daily limits, quality-based
          engagement: 2280,         // 12.5% - Likes, comments, shares
          marketplace: 4560,        // 25% - Payment-completed sales
          freelance: 3420,          // 18.75% - Milestone-based
          p2pTrading: 684,          // 3.75% - Confirmed trades
          referrals: 456,           // 2.5% - Quality referrals
          challenges: 0,            // 0% - No active completions
          education: 0,             // Learning rewards
        },
        
        recentRewards: [
          {
            id: "1",
            type: "post_content",
            description: "High-quality post with media and engagement",
            eloityPoints: 7.2,
            walletBonus: 0,
            qualityMultiplier: 2.4,
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            status: "confirmed",
          },
          {
            id: "2", 
            type: "marketplace_sale",
            description: "Product sale - payment completed",
            eloityPoints: 15.0,
            walletBonus: 25.50,
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            status: "confirmed",
          },
          {
            id: "3",
            type: "freelance_milestone",
            description: "Milestone completed - client approved",
            eloityPoints: 20.0,
            walletBonus: 85.00,
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            status: "confirmed",
          },
          {
            id: "4",
            type: "p2p_trade",
            description: "P2P trade confirmed",
            eloityPoints: 8.0,
            walletBonus: 2.50,
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            status: "confirmed",
          },
          {
            id: "5",
            type: "quality_referral",
            description: "Quality referral completed 3+ actions",
            eloityPoints: 25.0,
            walletBonus: 5.00,
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            status: "confirmed",
          },
        ],
        
        activeChallenges: [
          {
            id: "1",
            title: "Quality Creator",
            description: "Create 3 high-quality posts today (no daily limits!)",
            progress: 2,
            target: 3,
            reward: 15,
            timeLeft: "6h 45m",
            type: "daily",
          },
          {
            id: "2",
            title: "Payment Master",
            description: "Complete 2 payment-based transactions",
            progress: 1,
            target: 2,
            reward: 25,
            timeLeft: "6h 45m", 
            type: "daily",
          },
          {
            id: "3",
            title: "Trust Builder",
            description: "Maintain 80+ trust score for the week",
            progress: 5,
            target: 7,
            reward: 100,
            timeLeft: "2d 6h",
            type: "weekly",
          },
        ],
      });
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
      description: "Reward data updated with latest earnings",
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
      description: `$${withdrawAmount} withdrawal submitted for processing.`,
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
      case "marketplace_sale":
        return <ShoppingBag className="w-4 h-4 text-green-500" />;
      case "freelance_milestone":
        return <Award className="w-4 h-4 text-blue-500" />;
      case "p2p_trade":
        return <TrendingUp className="w-4 h-4 text-orange-500" />;
      case "quality_referral":
        return <UserPlus className="w-4 h-4 text-pink-500" />;
      case "engagement":
        return <Heart className="w-4 h-4 text-red-500" />;
      default:
        return <Star className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrustLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
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
      <div className="space-y-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Enhanced Reward System</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Quality-based rewards • No daily limits • Payment-gated earnings
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className="bg-purple-100 text-purple-800 text-xs sm:text-sm">
            <Crown className="w-3 h-3 mr-1" />
            Enhanced System
          </Badge>
          <Badge className="bg-green-100 text-green-800 text-xs sm:text-sm">
            <CheckCircle className="w-3 h-3 mr-1" />
            Payment Gated
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-xs sm:text-sm"
          >
            <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Earnings */}
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-green-700">
                  Total Earnings
                </p>
                <p className="text-lg sm:text-2xl font-bold text-green-900">
                  {formatCurrency(economyData?.totalEarnings || 0)}
                </p>
                <p className="text-xs text-green-600">+23.8% this month</p>
              </div>
              <div className="p-2 sm:p-3 bg-green-200 rounded-full">
                <DollarSign className="w-4 h-4 sm:w-6 sm:h-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Eloity Points */}
        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-purple-700">
                  Eloity Points
                </p>
                <p className="text-lg sm:text-2xl font-bold text-purple-900">
                  {formatNumber(economyData?.currentEloity Points || 0)}
                </p>
                <p className="text-xs text-purple-600">
                  +{formatNumber(economyData?.totalEloity PointsEarned || 0)} earned
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-purple-200 rounded-full">
                <Star className="w-4 h-4 sm:w-6 sm:h-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trust Score */}
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-blue-700">Trust Score</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-900">
                  {economyData?.trustScore?.current.toFixed(1) || "N/A"}
                </p>
                <Badge className={`text-xs ${getTrustLevelColor(economyData?.trustScore?.level || "bronze")}`}>
                  {economyData?.trustScore?.level || "Bronze"}
                </Badge>
              </div>
              <div className="p-2 sm:p-3 bg-blue-200 rounded-full">
                <Shield className="w-4 h-4 sm:w-6 sm:h-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quality Score */}
        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-orange-700">Quality Score</p>
                <p className="text-lg sm:text-2xl font-bold text-orange-900">
                  {economyData?.activityStats?.qualityScore.toFixed(1) || "1.0"}x
                </p>
                <p className="text-xs text-orange-600">Avg multiplier</p>
              </div>
              <div className="p-2 sm:p-3 bg-orange-200 rounded-full">
                <Award className="w-4 h-4 sm:w-6 sm:h-6 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Simplified Tabs - Mobile Optimized */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        <div className="overflow-x-auto">
          <TabsList className="grid w-full grid-cols-4 lg:w-max lg:grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Home className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="activities" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Activities</span>
            </TabsTrigger>
            <TabsTrigger value="challenges" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Target className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Challenges</span>
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Withdraw</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4 sm:space-y-6">
          {/* Enhanced Reward System Info */}
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-200 rounded-full">
                  <Info className="w-4 h-4 sm:w-5 sm:h-5 text-purple-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm sm:text-base mb-2">Enhanced Reward System Active</h3>
                  <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                    <li>• <strong>No Daily Limits:</strong> Create unlimited content, earn based on quality</li>
                    <li>• <strong>Payment-Gated:</strong> Marketplace & freelance rewards only on completion</li>
                    <li>• <strong>Quality Bonuses:</strong> Up to 2.5x multipliers for high-quality content</li>
                    <li>• <strong>Trust-Based:</strong> Higher trust = better rewards and fewer restrictions</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Revenue Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
                  Revenue Sources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {Object.entries(economyData?.earningsByType || {}).map(([source, amount]) => {
                    const percentage = economyData?.totalEarnings
                      ? Math.round((amount / economyData.totalEarnings) * 100)
                      : 0;
                    const colors = {
                      contentCreation: "bg-purple-500",
                      engagement: "bg-red-500", 
                      marketplace: "bg-green-500",
                      freelance: "bg-blue-500",
                      p2pTrading: "bg-orange-500",
                      referrals: "bg-pink-500",
                      challenges: "bg-yellow-500",
                    };
                    return (
                      <div key={source} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 ${colors[source as keyof typeof colors]} rounded-full`}></div>
                          <div>
                            <p className="font-medium text-xs sm:text-sm capitalize">
                              {source.replace(/([A-Z])/g, ' $1').trim()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {percentage}% of total
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-xs sm:text-sm">{formatCurrency(amount)}</p>
                          <Progress value={percentage} className="w-12 sm:w-16 h-1 sm:h-2 mt-1" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-lg sm:text-xl font-bold text-purple-600">
                      {formatNumber(economyData?.activityStats.contentCreated || 0)}
                    </p>
                    <p className="text-xs text-purple-600">Content Created</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-lg sm:text-xl font-bold text-blue-600">
                      {formatNumber(economyData?.activityStats.totalActivities || 0)}
                    </p>
                    <p className="text-xs text-blue-600">Total Activities</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-lg sm:text-xl font-bold text-green-600">
                      {economyData?.activityStats.streakDays || 0}
                    </p>
                    <p className="text-xs text-green-600">Day Streak</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <p className="text-lg sm:text-xl font-bold text-orange-600">
                      {formatCurrency(economyData?.availableToWithdraw || 0)}
                    </p>
                    <p className="text-xs text-orange-600">Available</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm sm:text-base">Recent Reward Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64 sm:h-96">
                <div className="space-y-3">
                  {economyData?.recentRewards.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getActivityIcon(activity.type)}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-xs sm:text-sm">{activity.description}</p>
                            <Badge
                              variant={activity.status === "confirmed" ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {activity.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleString()}
                            {activity.qualityMultiplier && 
                              ` • Quality: ${activity.qualityMultiplier.toFixed(1)}x`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-end">
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

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {economyData?.activeChallenges.map((challenge) => (
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
                  <CardTitle className="text-sm sm:text-lg">{challenge.title}</CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {challenge.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm font-medium">Progress</span>
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          {challenge.progress} / {challenge.target}
                        </span>
                      </div>
                      <Progress value={(challenge.progress / challenge.target) * 100} className="h-2" />
                    </div>

                    {/* Reward */}
                    <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs sm:text-sm font-medium">Reward</p>
                          <p className="text-sm sm:text-lg font-bold text-purple-600">
                            {challenge.reward} SP
                          </p>
                        </div>
                        {challenge.progress >= challenge.target ? (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs">
                            <Gift className="w-3 h-3 mr-1" />
                            Claim
                          </Button>
                        ) : (
                          <Badge variant="outline" className="text-xs">
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

        {/* Withdraw Tab */}
        <TabsContent value="withdraw" className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm sm:text-base">Withdraw Earnings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs sm:text-sm font-medium">Amount (USD)</label>
                  <Input
                    type="number"
                    placeholder="50.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    min="50"
                    step="0.01"
                    className="text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum: $50.00 • Available: {formatCurrency(economyData?.availableToWithdraw || 0)}
                  </p>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-xs sm:text-sm mb-1">Enhanced System Benefits</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Instant processing to Unified Wallet (0.5% fee)</li>
                    <li>• All earnings are payment-completion verified</li>
                    <li>• Quality-based rewards ensure legitimate earnings</li>
                  </ul>
                </div>

                <Button
                  onClick={handleWithdraw}
                  className="w-full text-sm"
                  disabled={!withdrawAmount || parseFloat(withdrawAmount) < 50}
                >
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  Request Withdrawal
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm sm:text-base">Account Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                      <span className="font-medium text-xs sm:text-sm">Available Balance</span>
                    </div>
                    <span className="font-bold text-green-600 text-sm sm:text-base">
                      {formatCurrency(economyData?.availableToWithdraw || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                      <span className="font-medium text-xs sm:text-sm">Eloity Points</span>
                    </div>
                    <span className="font-bold text-purple-600 text-sm sm:text-base">
                      {formatNumber(economyData?.currentEloity Points || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      <span className="font-medium text-xs sm:text-sm">Trust Level</span>
                    </div>
                    <Badge className={getTrustLevelColor(economyData?.trustScore?.level || "bronze")}>
                      {economyData?.trustScore?.level || "Bronze"}
                    </Badge>
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

export default EnhancedUnifiedCreatorEconomy;
