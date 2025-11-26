import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  DollarSign,
  TrendingUp,
  Eye,
  Gift,
  Users,
  Zap,
  RefreshCw,
  ArrowUpRight,
  Star,
  Trophy,
  Flame,
  Target,
} from "lucide-react";
import { formatCurrency, formatNumber } from "@/utils/formatters";
import { useRewardsSummary } from "@/hooks/useRewardsSummary";
import { useActivityFeed } from "@/hooks/useActivityFeed";
import { activityTransactionService } from "@/services/activityTransactionService";

interface EnhancedEarningsOverviewProps {
  user: any;
  setActiveTab: (tab: string) => void;
}

const EnhancedEarningsOverview = ({ user, setActiveTab }: EnhancedEarningsOverviewProps) => {
  const { toast } = useToast();
  const { summary, isLoading, error, refresh } = useRewardsSummary();
  const { activities } = useActivityFeed(100);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [earningsByCategory, setEarningsByCategory] = useState<Record<string, number>>({});

  // Calculate earnings by category from activities
  useEffect(() => {
    if (activities.length > 0) {
      const breakdown: Record<string, number> = {};

      activities.forEach((activity) => {
        if (!breakdown[activity.category]) {
          breakdown[activity.category] = 0;
        }
        if (activity.amount_currency) {
          breakdown[activity.category] += activity.amount_currency;
        }
      });

      setEarningsByCategory(breakdown);
    }
  }, [activities]);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refresh();
      toast({
        title: "✓ Refreshed",
        description: "Your rewards data has been updated",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to refresh rewards data",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Skeleton cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Breakdown skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-2">Failed to load rewards data</div>
        <Button onClick={handleRefresh}>Try Again</Button>
      </div>
    );
  }

  // Get level info
  const levelInfo = {
    1: { title: "Starter", color: "#6B7280" },
    2: { title: "Bronze", color: "#92400E" },
    3: { title: "Silver", color: "#C0C7D0" },
    4: { title: "Gold", color: "#D97706" },
    5: { title: "Platinum", color: "#3B82F6" },
    6: { title: "Diamond", color: "#8B5CF6" },
  };

  const currentLevelInfo = levelInfo[summary.level as keyof typeof levelInfo] || levelInfo[1];

  // Calculate level progress percentage
  const currentLevelThreshold = [0, 100, 500, 1500, 3000, 6000][summary.level] || 0;
  const nextLevelThreshold = summary.next_level_threshold || (summary.level + 1) * 1000;
  const levelProgress =
    summary.total_earned >= nextLevelThreshold
      ? 100
      : ((summary.total_earned - currentLevelThreshold) /
          (nextLevelThreshold - currentLevelThreshold)) *
        100;

  const earningsCards = [
    {
      title: "Total Earned",
      value: summary.total_earned,
      format: "currency" as const,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
      change: "+15.8%",
      changeType: "positive" as const,
    },
    {
      title: "Available Balance",
      value: summary.available_balance,
      format: "currency" as const,
      icon: ArrowUpRight,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      change: `+${summary.activities_this_month} activities`,
      changeType: "positive" as const,
    },
    {
      title: "This Month",
      value: activities
        .filter((a) => {
          const actDate = new Date(a.created_at);
          const now = new Date();
          return (
            actDate.getMonth() === now.getMonth() &&
            actDate.getFullYear() === now.getFullYear()
          );
        })
        .reduce((sum, a) => sum + (a.amount_currency || 0), 0),
      format: "currency" as const,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      change: `${summary.activities_this_month} activities`,
      changeType: "positive" as const,
    },
    {
      title: "Current Streak",
      value: summary.current_streak,
      format: "number" as const,
      icon: Flame,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      change: `${summary.longest_streak} max`,
      changeType: "positive" as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Earnings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {earningsCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.title}
              className="hover:shadow-lg transition-shadow hover:border-purple-300 dark:hover:border-purple-500"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                    <p className="text-2xl font-bold mt-2">
                      {card.format === "currency"
                        ? formatCurrency(card.value, summary.currency_code)
                        : formatNumber(card.value)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">{card.change}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${card.bgColor}`}>
                    <Icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Level and Trust Score Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Level Progress */}
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                Level & Progress
              </CardTitle>
              <Badge
                className="text-white"
                style={{ backgroundColor: currentLevelInfo.color }}
              >
                Level {summary.level} - {currentLevelInfo.title}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Progress to next level</span>
                <span className="text-sm font-semibold text-purple-600">
                  {Math.round(levelProgress)}%
                </span>
              </div>
              <Progress value={levelProgress} className="h-2.5" />
              <p className="text-xs text-muted-foreground mt-2">
                {formatCurrency(summary.next_level_threshold - summary.total_earned)} needed for level {summary.level + 1}
              </p>
            </div>

            {/* Level Benefits */}
            <div className="mt-4 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Current Benefits</p>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>✓ {(1 + summary.level * 0.1).toFixed(1)}x earning multiplier</li>
                <li>✓ {Math.min(50 + summary.level * 10, 100)} point withdrawal limit</li>
                <li>✓ Priority support</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Trust Score */}
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Trust Score & Withdrawal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Trust Score</span>
                <Badge variant="secondary">{summary.trust_score}%</Badge>
              </div>
              <Progress value={summary.trust_score} className="h-2.5" />
              <p className="text-xs text-muted-foreground mt-2">
                Higher trust score unlocks better earning rates and faster withdrawals
              </p>
            </div>

            {/* Withdrawal Info */}
            <div className="mt-4 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-semibold text-muted-foreground">Available to Withdraw</p>
                <p className="font-bold text-lg text-green-600">
                  {formatCurrency(summary.available_balance, summary.currency_code)}
                </p>
              </div>
              <Button
                size="sm"
                className="w-full mt-2"
                onClick={() => setActiveTab("withdraw")}
              >
                Withdraw Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Breakdown by Category */}
      {Object.keys(earningsByCategory).length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3Icon className="h-5 w-5" />
                Earnings Breakdown
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(earningsByCategory).map(([category, amount]) => {
              const percentage =
                summary.total_earned > 0 ? (amount / summary.total_earned) * 100 : 0;
              const categoryColors: Record<string, string> = {
                Content: "bg-blue-500",
                Engagement: "bg-purple-500",
                Challenges: "bg-pink-500",
                Battles: "bg-red-500",
                Gifts: "bg-green-500",
                Referrals: "bg-yellow-500",
                Marketplace: "bg-amber-500",
                Freelance: "bg-indigo-500",
                Crypto: "bg-orange-500",
              };

              return (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</span>
                      <span className="font-semibold">
                        {formatCurrency(amount, summary.currency_code)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        categoryColors[category] || "bg-gray-500"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Activity Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Activity Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{summary.total_activities}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Activities</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{summary.activities_this_month}</p>
              <p className="text-xs text-muted-foreground mt-1">This Month</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.total_withdrawn, summary.currency_code)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Total Withdrawn</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">
                {summary.last_activity_at
                  ? new Date(summary.last_activity_at).toLocaleDateString()
                  : "Never"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Last Activity</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper component for icon (since it might not be available)
function BarChart3Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 3v18h18" />
      <path d="M7 9v8" />
      <path d="M12 5v12" />
      <path d="M17 7v10" />
    </svg>
  );
}

export default EnhancedEarningsOverview;
