import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  TrendingUp,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import { formatCurrency, formatNumber } from "@/utils/formatters";
import { useActivityFeed } from "@/hooks/useActivityFeed";
import { useRewardsSummary } from "@/hooks/useRewardsSummary";
import { useToast } from "@/hooks/use-toast";

const EnhancedRewardsActivitiesTab = () => {
  const { toast } = useToast();
  const { summary } = useRewardsSummary();
  const { activities, isLoading, error, totalCount, hasMore, loadMore, filter, clearFilters, refresh } = useActivityFeed(50);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);

  // Activity type options
  const activityTypes = [
    { value: "all", label: "All Activities" },
    { value: "post_creation", label: "Post Creation" },
    { value: "engagement", label: "Engagement" },
    { value: "challenge_complete", label: "Challenge Completed" },
    { value: "battle_vote", label: "Battle Vote" },
    { value: "battle_loss", label: "Battle Loss" },
    { value: "gift_received", label: "Gift Received" },
    { value: "tip_received", label: "Tip Received" },
    { value: "referral_signup", label: "Referral Signup" },
    { value: "referral_activity", label: "Referral Activity" },
    { value: "marketplace_sale", label: "Marketplace Sale" },
    { value: "freelance_work", label: "Freelance Work" },
    { value: "p2p_trading", label: "P2P Trading" },
  ];

  const categoryOptions = [
    { value: "all", label: "All Categories" },
    { value: "Content", label: "Content" },
    { value: "Engagement", label: "Engagement" },
    { value: "Challenges", label: "Challenges" },
    { value: "Battles", label: "Battles" },
    { value: "Gifts", label: "Gifts & Tips" },
    { value: "Referrals", label: "Referrals" },
    { value: "Marketplace", label: "Marketplace" },
    { value: "Freelance", label: "Freelance" },
    { value: "Crypto", label: "Crypto" },
  ];

  const dateRangeOptions = [
    { value: "all", label: "All Time" },
    { value: "7days", label: "Last 7 Days" },
    { value: "30days", label: "Last 30 Days" },
    { value: "90days", label: "Last 90 Days" },
  ];

  // Calculate date range filter
  const getDateRange = (range: string) => {
    const now = new Date();
    switch (range) {
      case "7days":
        return { startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), endDate: now };
      case "30days":
        return { startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), endDate: now };
      case "90days":
        return { startDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), endDate: now };
      default:
        return {};
    }
  };

  // Client-side filtering for search (activities are already server-filtered)
  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const matchesSearch = activity.description
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ?? false;
      return matchesSearch;
    });
  }, [activities, searchTerm]);

  // Calculate statistics
  const totalEarnings = activities.reduce((sum, a) => sum + (a.amount_currency || 0), 0);
  const byCategory = activities.reduce(
    (acc, a) => {
      if (!acc[a.category]) acc[a.category] = 0;
      acc[a.category] += a.amount_currency || 0;
      return acc;
    },
    {} as Record<string, number>
  );

  const handleFilterChange = async () => {
    const newFilters: any = {};

    if (filterType !== "all") {
      newFilters.type = filterType;
    }
    if (filterCategory !== "all") {
      newFilters.category = filterCategory;
    }
    if (dateRange !== "all") {
      const { startDate, endDate } = getDateRange(dateRange);
      newFilters.startDate = startDate;
      newFilters.endDate = endDate;
    }

    if (Object.keys(newFilters).length > 0) {
      await filter(newFilters);
    } else {
      await clearFilters();
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refresh();
      toast({
        title: "✓ Refreshed",
        description: "Activity feed updated with latest data",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to refresh activities",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      Content: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      Engagement: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      Challenges: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
      Battles: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      Gifts: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      Referrals: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      Marketplace: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
      Freelance: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
      Crypto: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const getActivityIcon = (type: string) => {
    const iconClass = "h-4 w-4";
    switch (type) {
      case "post_creation":
        return <Zap className={`${iconClass} text-blue-500`} />;
      case "engagement":
        return <TrendingUp className={`${iconClass} text-orange-500`} />;
      case "challenge_complete":
        return <Activity className={`${iconClass} text-pink-500`} />;
      case "battle_vote":
        return <ArrowUpRight className={`${iconClass} text-red-500`} />;
      case "battle_loss":
        return <ArrowDownRight className={`${iconClass} text-gray-500`} />;
      case "gift_received":
        return <span className="text-lg">🎁</span>;
      case "tip_received":
        return <DollarSign className={`${iconClass} text-green-500`} />;
      case "referral_signup":
        return <span className="text-lg">👥</span>;
      case "referral_activity":
        return <TrendingUp className={`${iconClass} text-purple-500`} />;
      case "marketplace_sale":
        return <DollarSign className={`${iconClass} text-yellow-500`} />;
      case "freelance_work":
        return <Activity className={`${iconClass} text-indigo-500`} />;
      case "p2p_trading":
        return <span className="text-lg">💱</span>;
      default:
        return <Activity className={`${iconClass} text-gray-500`} />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Stats skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-6 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filter skeleton */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activities skeleton */}
        <Card>
          <CardContent className="p-4 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <Skeleton className="h-4 w-64 mb-2" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Failed to load activities</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-1">{error.message}</p>
        <Button onClick={handleRefresh} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold mt-2">
                  {formatCurrency(totalEarnings, summary?.currency_code || "USD")}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500 opacity-20" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">From {totalCount} activities</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Activities</p>
                <p className="text-2xl font-bold mt-2">{formatNumber(totalCount)}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-500 opacity-20" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {activities.length} displayed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Top Category</p>
                <p className="text-2xl font-bold mt-2">
                  {Object.entries(byCategory).length > 0
                    ? Object.entries(byCategory).sort(([, a], [, b]) => b - a)[0]?.[0] ||
                      "N/A"
                    : "N/A"}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500 opacity-20" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">By earnings amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg per Activity</p>
                <p className="text-2xl font-bold mt-2">
                  {formatCurrency(
                    totalCount > 0 ? totalEarnings / totalCount : 0,
                    summary?.currency_code || "USD"
                  )}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500 opacity-20" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Average earnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Breakdown */}
      {Object.keys(byCategory).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Earnings Breakdown by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(byCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount]) => {
                  const percentage = totalEarnings > 0 ? (amount / totalEarnings) * 100 : 0;
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{category}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {percentage.toFixed(1)}%
                          </span>
                          <span className="font-semibold">
                            {formatCurrency(amount, summary?.currency_code || "USD")}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Activities
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
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Activity Type" />
              </SelectTrigger>
              <SelectContent>
                {activityTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                {dateRangeOptions.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Apply Button */}
          <Button
            onClick={handleFilterChange}
            variant="default"
            className="w-full"
          >
            Apply Filters
          </Button>

          {/* Clear Filters */}
          {(filterType !== "all" || filterCategory !== "all" || dateRange !== "all") && (
            <Button
              onClick={async () => {
                setFilterType("all");
                setFilterCategory("all");
                setDateRange("all");
                await clearFilters();
              }}
              variant="outline"
              className="w-full"
            >
              Clear Filters
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Activity List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredActivities.length > 0 ? (
            <div className="space-y-3">
              {filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() =>
                    setExpandedActivity(
                      expandedActivity === activity.id ? null : activity.id
                    )
                  }
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">{getActivityIcon(activity.activity_type)}</div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.description}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge className={getCategoryColor(activity.category)}>
                            {activity.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(activity.created_at).toLocaleDateString()} at{" "}
                            {new Date(activity.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {activity.source_type && (
                            <Badge variant="secondary" className="text-xs">
                              {activity.source_type}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p
                        className={`font-bold text-lg ${
                          activity.amount_currency && activity.amount_currency > 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-gray-600"
                        }`}
                      >
                        {activity.amount_currency && activity.amount_currency > 0
                          ? "+"
                          : ""}
                        {formatCurrency(
                          activity.amount_currency || 0,
                          summary?.currency_code || "USD"
                        )}
                      </p>
                      {activity.amount_eloits && (
                        <p className="text-xs text-muted-foreground">
                          {formatNumber(activity.amount_eloits)} ELO
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedActivity === activity.id && activity.metadata && (
                    <div className="mt-3 pt-3 border-t bg-muted/30 p-3 rounded text-sm space-y-1">
                      <p className="font-semibold text-muted-foreground">Details:</p>
                      {Object.entries(activity.metadata).map(([key, value]) => (
                        <p key={key} className="text-xs text-muted-foreground">
                          <span className="font-medium">{key}:</span>{" "}
                          {typeof value === "object"
                            ? JSON.stringify(value)
                            : String(value)}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Load More Button */}
              {hasMore && (
                <Button
                  onClick={loadMore}
                  variant="outline"
                  className="w-full"
                >
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Load More Activities
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                No activities found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Try adjusting your filters or check back later
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedRewardsActivitiesTab;
