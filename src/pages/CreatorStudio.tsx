import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  DollarSign,
  Calendar,
  Clock,
  Target,
  Award,
  Zap,
  Globe,
  Download,
  Filter,
  RefreshCw,
  Settings,
  PieChart,
  LineChart,
  Activity,
  Smartphone,
  Monitor,
  MapPin,
  Play,
  Pause,
  SkipForward,
  UserPlus,
  UserMinus,
  Coins,
  CreditCard,
  Gift,
  Handshake,
  Video,
  Music,
  Hash,
  Star,
  ThumbsUp,
  Bookmark,
  FileText,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  Brain,
  Rocket,
  Crown,
  Flame,
  ChevronRight,
  MoreHorizontal,
  Plus,
  Minus,
  Equal,
  X,
  Trophy,
  Shield,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import AnalyticsDashboard from "@/components/analytics/AnalyticsDashboard";

interface AnalyticsMetric {
  label: string;
  value: number;
  change: number;
  changeType: "increase" | "decrease" | "neutral";
  format: "number" | "currency" | "percentage" | "duration";
}

interface ContentPerformance {
  id: string;
  type: "video" | "post" | "story";
  title: string;
  thumbnail: string;
  views: number;
  engagement: number;
  revenue: number;
  publishedAt: Date;
  platform: "videos" | "feed" | "stories";
}

interface AudienceInsight {
  metric: string;
  value: string;
  description: string;
  trend: "up" | "down" | "stable";
}

interface RevenueStream {
  source: string;
  amount: number;
  percentage: number;
  change: number;
  icon: React.ReactNode;
}

interface PredictiveInsight {
  id: string;
  type: "opportunity" | "warning" | "trend" | "recommendation";
  title: string;
  description: string;
  confidence: number;
  impact: "high" | "medium" | "low";
  actionable: boolean;
}

const mockMetrics: AnalyticsMetric[] = [
  {
    label: "Total Views",
    value: 2847291,
    change: 23.5,
    changeType: "increase",
    format: "number",
  },
  {
    label: "Engagement Rate",
    value: 8.7,
    change: 2.1,
    changeType: "increase",
    format: "percentage",
  },
  {
    label: "Total Revenue",
    value: 12540,
    change: 15.8,
    changeType: "increase",
    format: "currency",
  },
  {
    label: "Followers",
    value: 89456,
    change: 4.2,
    changeType: "increase",
    format: "number",
  },
  {
    label: "Avg Watch Time",
    value: 324,
    change: -5.3,
    changeType: "decrease",
    format: "duration",
  },
  {
    label: "Content Created",
    value: 127,
    change: 12.1,
    changeType: "increase",
    format: "number",
  },
  {
    label: "Brand Partnerships",
    value: 8,
    change: 0,
    changeType: "neutral",
    format: "number",
  },
  {
    label: "Conversion Rate",
    value: 3.4,
    change: 1.8,
    changeType: "increase",
    format: "percentage",
  },
];

const topContent: ContentPerformance[] = [
  {
    id: "1",
    type: "video",
    title: "AI Art Creation Tutorial",
    thumbnail:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=100",
    views: 456789,
    engagement: 12.4,
    revenue: 240.5,
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    platform: "videos",
  },
  {
    id: "2",
    type: "post",
    title: "Behind the scenes of my creative process",
    thumbnail:
      "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=100",
    views: 234567,
    engagement: 9.8,
    revenue: 125.3,
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
    platform: "feed",
  },
  {
    id: "3",
    type: "video",
    title: "Quick Recipe: 30-Second Pasta",
    thumbnail:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=100",
    views: 189234,
    engagement: 15.2,
    revenue: 89.75,
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    platform: "videos",
  },
  {
    id: "4",
    type: "story",
    title: "Live creation session",
    thumbnail:
      "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=100",
    views: 98765,
    engagement: 18.7,
    revenue: 45.2,
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    platform: "stories",
  },
];

const audienceInsights: AudienceInsight[] = [
  {
    metric: "Peak Activity",
    value: "8-10 PM",
    description: "Your audience is most active in the evening",
    trend: "stable",
  },
  {
    metric: "Top Demographics",
    value: "25-34 years",
    description: "42% of your audience falls in this age group",
    trend: "up",
  },
  {
    metric: "Geographic Focus",
    value: "North America",
    description: "68% of views come from US & Canada",
    trend: "up",
  },
  {
    metric: "Device Preference",
    value: "Mobile (78%)",
    description: "Most engagement happens on mobile devices",
    trend: "up",
  },
  {
    metric: "Content Preference",
    value: "Video Content",
    description: "Videos get 3x more engagement than posts",
    trend: "up",
  },
  {
    metric: "Retention Rate",
    value: "68%",
    description: "Above average audience retention",
    trend: "stable",
  },
];

const revenueStreams: RevenueStream[] = [
  {
    source: "Video Monetization",
    amount: 6750,
    percentage: 54,
    change: 18.3,
    icon: <Video className="w-4 h-4" />,
  },
  {
    source: "Brand Partnerships",
    amount: 3200,
    percentage: 26,
    change: 12.7,
    icon: <Handshake className="w-4 h-4" />,
  },
  {
    source: "Tips & Donations",
    amount: 1590,
    percentage: 13,
    change: -3.2,
    icon: <Gift className="w-4 h-4" />,
  },
  {
    source: "Merchandise",
    amount: 870,
    percentage: 7,
    change: 34.6,
    icon: <Star className="w-4 h-4" />,
  },
];

const predictiveInsights: PredictiveInsight[] = [
  {
    id: "1",
    type: "opportunity",
    title: "Trending Topic Opportunity",
    description:
      "AI art tutorials are trending 340% this week. Consider creating more content in this niche.",
    confidence: 87,
    impact: "high",
    actionable: true,
  },
  {
    id: "2",
    type: "recommendation",
    title: "Optimal Posting Time",
    description:
      "Based on your audience activity, posting at 7 PM EST could increase engagement by 23%.",
    confidence: 92,
    impact: "medium",
    actionable: true,
  },
  {
    id: "3",
    type: "warning",
    title: "Engagement Decline Risk",
    description:
      "Your video completion rate has dropped 12% this week. Consider shorter content or stronger hooks.",
    confidence: 78,
    impact: "medium",
    actionable: true,
  },
  {
    id: "4",
    type: "trend",
    title: "Audience Growth Pattern",
    description:
      "Your follower growth shows consistent 4% weekly increase. Maintain current content strategy.",
    confidence: 94,
    impact: "high",
    actionable: false,
  },
];

const CreatorStudio: React.FC = () => {
  const [timeRange, setTimeRange] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [showInsights, setShowInsights] = useState(true);

  const formatNumber = (num: number, format: string): string => {
    switch (format) {
      case "currency":
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
        }).format(num);
      case "percentage":
        return `${num.toFixed(1)}%`;
      case "duration":
        const minutes = Math.floor(num / 60);
        const seconds = num % 60;
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
      default:
        if (num >= 1000000) {
          return (num / 1000000).toFixed(1) + "M";
        } else if (num >= 1000) {
          return (num / 1000).toFixed(1) + "K";
        }
        return num.toString();
    }
  };

  const getChangeIndicator = (change: number, type: string) => {
    const isPositive = change > 0;
    const isNegative = change < 0;

    return (
      <div
        className={cn(
          "flex items-center gap-1 text-sm",
          isPositive && "text-green-500",
          isNegative && "text-red-500",
          change === 0 && "text-gray-500",
        )}
      >
        {isPositive && <TrendingUp className="w-3 h-3" />}
        {isNegative && <TrendingDown className="w-3 h-3" />}
        {change === 0 && <Equal className="w-3 h-3" />}
        <span>{Math.abs(change)}%</span>
      </div>
    );
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "opportunity":
        return <Rocket className="w-4 h-4 text-green-500" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case "recommendation":
        return <Lightbulb className="w-4 h-4 text-blue-500" />;
      case "trend":
        return <TrendingUp className="w-4 h-4 text-purple-500" />;
      default:
        return <Brain className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>Creator Studio | Eloity</title>
        <meta
          name="description"
          content="Comprehensive analytics dashboard for content creators"
        />
      </Helmet>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 sm:h-16 gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  Creator Studio
                </h1>
              </div>
              <Badge
                variant="secondary"
                className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs sm:text-sm"
              >
                Pro Analytics
              </Badge>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-28 sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 3 months</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" className="sm:hidden">
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" className="sm:hidden">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <div className="w-full overflow-x-auto">
            <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:grid-cols-7 min-w-fit">
              <TabsTrigger
                value="overview"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger
                value="content"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <Video className="w-4 h-4" />
                <span className="hidden sm:inline">Content</span>
              </TabsTrigger>
              <TabsTrigger
                value="audience"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Audience</span>
              </TabsTrigger>
              <TabsTrigger
                value="revenue"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <DollarSign className="w-4 h-4" />
                <span className="hidden sm:inline">Creator Economy</span>
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                aria-label="Analytics dashboard"
              >
                <Activity className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger
                value="insights"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <Brain className="w-4 h-4" />
                <span className="hidden sm:inline">AI Insights</span>
              </TabsTrigger>
              <TabsTrigger
                value="compare"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Compare</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {mockMetrics.map((metric, index) => (
                <Card
                  key={index}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedMetric(metric.label)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {metric.label}
                      </p>
                      {getChangeIndicator(metric.change, metric.changeType)}
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatNumber(metric.value, metric.format)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Insights */}
            {showInsights && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    Quick Insights
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowInsights(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {predictiveInsights.slice(0, 3).map((insight) => (
                      <div
                        key={insight.id}
                        className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-start gap-3">
                          {getInsightIcon(insight.type)}
                          <div className="flex-1">
                            <h4 className="font-medium text-sm mb-1">
                              {insight.title}
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                              {insight.description}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "text-xs",
                                  insight.confidence > 90 &&
                                    "bg-green-100 text-green-800",
                                  insight.confidence > 70 &&
                                    insight.confidence <= 90 &&
                                    "bg-yellow-100 text-yellow-800",
                                  insight.confidence <= 70 &&
                                    "bg-gray-100 text-gray-800",
                                )}
                              >
                                {insight.confidence}% confidence
                              </Badge>
                              {insight.actionable && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-6"
                                >
                                  Take Action
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Top Content Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Top Performing Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topContent.map((content, index) => (
                    <div
                      key={content.id}
                      className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="text-sm font-medium text-gray-500 w-6">
                        #{index + 1}
                      </div>
                      <img
                        src={content.thumbnail}
                        alt={content.title}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">
                            {content.title}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {content.type}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {content.platform}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {formatNumber(content.views, "number")} views
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {content.engagement}% engagement
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {formatNumber(content.revenue, "currency")}
                          </span>
                          <span>
                            {formatDistanceToNow(content.publishedAt)} ago
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Analysis Tab */}
          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Content Performance by Type */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance by Content Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        type: "Videos",
                        count: 45,
                        engagement: 12.4,
                        revenue: 8540,
                        icon: <Video className="w-4 h-4" />,
                      },
                      {
                        type: "Posts",
                        count: 67,
                        engagement: 8.7,
                        revenue: 2340,
                        icon: <FileText className="w-4 h-4" />,
                      },
                      {
                        type: "Stories",
                        count: 89,
                        engagement: 15.2,
                        revenue: 890,
                        icon: <Play className="w-4 h-4" />,
                      },
                    ].map((item) => (
                      <div
                        key={item.type}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {item.icon}
                          <div>
                            <div className="font-medium">{item.type}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {item.count} pieces
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {item.engagement}% engagement
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {formatNumber(item.revenue, "currency")} revenue
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Publishing Schedule Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Optimal Publishing Times</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        time: "7:00 PM",
                        day: "Weekdays",
                        engagement: 94,
                        color: "bg-green-500",
                      },
                      {
                        time: "12:00 PM",
                        day: "Saturday",
                        engagement: 87,
                        color: "bg-blue-500",
                      },
                      {
                        time: "9:00 AM",
                        day: "Sunday",
                        engagement: 82,
                        color: "bg-purple-500",
                      },
                      {
                        time: "3:00 PM",
                        day: "Friday",
                        engagement: 78,
                        color: "bg-orange-500",
                      },
                    ].map((slot) => (
                      <div
                        key={`${slot.time}-${slot.day}`}
                        className="flex items-center gap-3"
                      >
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">
                              {slot.time} - {slot.day}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {slot.engagement}%
                            </span>
                          </div>
                          <Progress value={slot.engagement} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Content Calendar */}
            <Card>
              <CardHeader>
                <CardTitle>Content Calendar & Scheduling</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4" />
                  <p>Content calendar coming soon</p>
                  <Button className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Content
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audience Tab */}
          <TabsContent value="audience" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Audience Insights */}
              <Card>
                <CardHeader>
                  <CardTitle>Audience Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {audienceInsights.map((insight, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-sm">
                            {insight.metric}
                          </div>
                          <div className="text-lg font-bold">
                            {insight.value}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {insight.description}
                          </div>
                        </div>
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full",
                            insight.trend === "up" && "bg-green-500",
                            insight.trend === "down" && "bg-red-500",
                            insight.trend === "stable" && "bg-gray-500",
                          )}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Follower Growth */}
              <Card>
                <CardHeader>
                  <CardTitle>Follower Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold">89,456</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Total Followers
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-500 font-medium">+1,247</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          This week
                        </div>
                      </div>
                    </div>
                    <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                      <LineChart className="w-8 h-8 text-gray-400" />
                      <span className="ml-2 text-gray-500">
                        Growth chart placeholder
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Creator & Activity Economy Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              {/* Earnings Cards */}
              <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-700">
                        Total Earnings
                      </p>
                      <p className="text-2xl font-bold text-green-900">
                        $15,240
                      </p>
                      <p className="text-xs text-green-600">
                        +15.8% this month
                      </p>
                    </div>
                    <div className="p-2 bg-green-200 rounded-full">
                      <DollarSign className="w-5 h-5 text-green-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-700">
                        Eloity Points
                      </p>
                      <p className="text-2xl font-bold text-purple-900">
                        2,450
                      </p>
                      <p className="text-xs text-purple-600">
                        +23.5% this month
                      </p>
                    </div>
                    <div className="p-2 bg-purple-200 rounded-full">
                      <Star className="w-5 h-5 text-purple-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700">
                        Trust Score
                      </p>
                      <p className="text-2xl font-bold text-blue-900">78.5</p>
                      <p className="text-xs text-blue-600">Gold Level</p>
                    </div>
                    <div className="p-2 bg-blue-200 rounded-full">
                      <Shield className="w-5 h-5 text-blue-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-700">
                        Activities
                      </p>
                      <p className="text-2xl font-bold text-orange-900">
                        1,247
                      </p>
                      <p className="text-xs text-orange-600">This month</p>
                    </div>
                    <div className="p-2 bg-orange-200 rounded-full">
                      <Activity className="w-5 h-5 text-orange-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Revenue Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        source: "Subscriptions",
                        amount: 5000,
                        percentage: 33,
                        color: "bg-blue-500",
                      },
                      {
                        source: "Tips",
                        amount: 4800,
                        percentage: 31,
                        color: "bg-pink-500",
                      },
                      {
                        source: "View Rewards",
                        amount: 2100,
                        percentage: 14,
                        color: "bg-green-500",
                      },
                      {
                        source: "Services",
                        amount: 1300,
                        percentage: 9,
                        color: "bg-yellow-500",
                      },
                      {
                        source: "Boosts",
                        amount: 2040,
                        percentage: 13,
                        color: "bg-purple-500",
                      },
                    ].map((stream) => (
                      <div
                        key={stream.source}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-3 h-3 rounded-full ${stream.color}`}
                          ></div>
                          <div>
                            <div className="font-medium text-sm">
                              {stream.source}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {stream.percentage}% of total
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {formatNumber(stream.amount, "currency")}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Creator & Activity Economy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full justify-start gap-3 h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    asChild
                  >
                    <a href="/app/rewards">
                      <DollarSign className="w-5 h-5" />
                      <div className="text-left">
                        <p className="font-medium">
                          Creator & Activity Economy
                        </p>
                        <p className="text-xs text-purple-200">
                          Complete monetization ecosystem
                        </p>
                      </div>
                    </a>
                  </Button>

                  <Button
                    className="w-full justify-start gap-3 h-12"
                    variant="outline"
                  >
                    <Zap className="w-5 h-5" />
                    <div className="text-left">
                      <p className="font-medium">Boost Content</p>
                      <p className="text-xs text-muted-foreground">
                        Increase reach and earnings
                      </p>
                    </div>
                  </Button>

                  <Button
                    className="w-full justify-start gap-3 h-12"
                    variant="outline"
                  >
                    <Users className="w-5 h-5" />
                    <div className="text-left">
                      <p className="font-medium">Manage Subscribers</p>
                      <p className="text-xs text-muted-foreground">
                        View and manage your subscriber base
                      </p>
                    </div>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Earnings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Recent Earnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      type: "Tip",
                      amount: 25,
                      from: "Alice Johnson",
                      time: "2 hours ago",
                      icon: Gift,
                      color: "text-pink-500",
                    },
                    {
                      type: "Subscription",
                      amount: 9.99,
                      from: "Bob Smith",
                      time: "5 hours ago",
                      icon: Users,
                      color: "text-blue-500",
                    },
                    {
                      type: "View Reward",
                      amount: 0,
                      from: "1,000 views",
                      time: "1 day ago",
                      icon: Eye,
                      color: "text-green-500",
                      eloityPoints: 5,
                    },
                  ].map((earning, index) => {
                    const Icon = earning.icon;
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded-full">
                            <Icon className={`w-4 h-4 ${earning.color}`} />
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {earning.type}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              from {earning.from} • {earning.time}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {earning.amount > 0 && (
                            <p className="font-medium text-green-600">
                              +${earning.amount}
                            </p>
                          )}
                          {earning.eloityPoints && (
                            <p className="text-xs text-purple-600 flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              {earning.eloityPoints} SP
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Button variant="outline" className="w-full" asChild>
                    <a href="/app/rewards?tab=history">
                      View All Earnings History
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent
            value="analytics"
            className="space-y-6"
            role="tabpanel"
            aria-labelledby="analytics-tab"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg p-1">
              <AnalyticsDashboard />
            </div>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {predictiveInsights.map((insight) => (
                <Card
                  key={insight.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{insight.title}</h3>
                          <Badge
                            variant="secondary"
                            className={cn(
                              insight.impact === "high" &&
                                "bg-red-100 text-red-800",
                              insight.impact === "medium" &&
                                "bg-yellow-100 text-yellow-800",
                              insight.impact === "low" &&
                                "bg-green-100 text-green-800",
                            )}
                          >
                            {insight.impact} impact
                          </Badge>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                          {insight.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Progress
                              value={insight.confidence}
                              className="w-24 h-2"
                            />
                            <span className="text-sm text-gray-500">
                              {insight.confidence}% confidence
                            </span>
                          </div>
                          {insight.actionable && (
                            <Button size="sm">
                              Take Action
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Compare Tab */}
          <TabsContent value="compare" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4" />
                  <p>Comparison tools coming soon</p>
                  <p className="text-sm">
                    Compare your performance with industry benchmarks
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CreatorStudio;
