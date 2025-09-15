import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  DollarSign,
  ShoppingCart,
  Coins,
  Star,
  Clock,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Target,
  Briefcase,
  Award,
  Zap,
  Activity,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  BarChart as BarChartIcon,
  Settings,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Plus,
  Info,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface AnalyticsData {
  overview: {
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    totalEarnings: number;
    totalOrders: number;
    engagementRate: number;
    conversionRate: number;
  };
  trends: {
    daily: any[];
    weekly: any[];
    monthly: any[];
  };
  demographics: {
    age: any[];
    gender: any[];
    location: any[];
    interests: any[];
  };
  performance: {
    topPosts: any[];
    topProducts: any[];
    bestTimes: any[];
    engagement: any[];
  };
  goals: {
    current: any[];
    completed: any[];
  };
}

const mockAnalyticsData: AnalyticsData = {
  overview: {
    totalViews: 125430,
    totalLikes: 8945,
    totalComments: 2156,
    totalShares: 1234,
    totalEarnings: 3456.78,
    totalOrders: 89,
    engagementRate: 7.2,
    conversionRate: 3.4,
  },
  trends: {
    daily: [
      {
        date: "Mon",
        views: 1200,
        likes: 89,
        comments: 23,
        shares: 12,
        earnings: 45.67,
      },
      {
        date: "Tue",
        views: 1450,
        likes: 102,
        comments: 34,
        shares: 18,
        earnings: 67.89,
      },
      {
        date: "Wed",
        views: 1689,
        likes: 134,
        comments: 45,
        shares: 23,
        earnings: 89.12,
      },
      {
        date: "Thu",
        views: 1234,
        likes: 87,
        comments: 19,
        shares: 11,
        earnings: 34.56,
      },
      {
        date: "Fri",
        views: 1567,
        likes: 145,
        comments: 56,
        shares: 34,
        earnings: 123.45,
      },
      {
        date: "Sat",
        views: 1890,
        likes: 178,
        comments: 67,
        shares: 45,
        earnings: 156.78,
      },
      {
        date: "Sun",
        views: 1345,
        likes: 98,
        comments: 28,
        shares: 16,
        earnings: 78.9,
      },
    ],
    weekly: [
      { week: "W1", views: 8500, likes: 625, comments: 145, earnings: 234.56 },
      { week: "W2", views: 9200, likes: 701, comments: 178, earnings: 289.34 },
      { week: "W3", views: 8800, likes: 643, comments: 156, earnings: 267.89 },
      { week: "W4", views: 9600, likes: 734, comments: 189, earnings: 312.45 },
    ],
    monthly: [
      {
        month: "Jan",
        views: 35000,
        likes: 2500,
        comments: 600,
        earnings: 890.45,
      },
      {
        month: "Feb",
        views: 38000,
        likes: 2700,
        comments: 650,
        earnings: 1020.67,
      },
      {
        month: "Mar",
        views: 41000,
        likes: 2900,
        comments: 700,
        earnings: 1150.89,
      },
      {
        month: "Apr",
        views: 39000,
        likes: 2750,
        comments: 675,
        earnings: 1089.23,
      },
    ],
  },
  demographics: {
    age: [
      { range: "18-24", value: 28, count: 3500 },
      { range: "25-34", value: 35, count: 4375 },
      { range: "35-44", value: 22, count: 2750 },
      { range: "45-54", value: 10, count: 1250 },
      { range: "55+", value: 5, count: 625 },
    ],
    gender: [
      { gender: "Female", value: 52, count: 6500 },
      { gender: "Male", value: 45, count: 5625 },
      { gender: "Other", value: 3, count: 375 },
    ],
    location: [
      { country: "United States", value: 35, count: 4375 },
      { country: "United Kingdom", value: 15, count: 1875 },
      { country: "Canada", value: 12, count: 1500 },
      { country: "Australia", value: 8, count: 1000 },
      { country: "Germany", value: 7, count: 875 },
      { country: "Others", value: 23, count: 2875 },
    ],
    interests: [
      { interest: "Technology", value: 42 },
      { interest: "Design", value: 38 },
      { interest: "Business", value: 34 },
      { interest: "Finance", value: 29 },
      { interest: "Gaming", value: 25 },
    ],
  },
  performance: {
    topPosts: [
      {
        id: "1",
        title: "How to Build a React App",
        views: 5400,
        likes: 234,
        comments: 45,
        shares: 23,
        engagementRate: 5.6,
      },
      {
        id: "2",
        title: "CSS Grid vs Flexbox",
        views: 4200,
        likes: 189,
        comments: 32,
        shares: 18,
        engagementRate: 5.7,
      },
      {
        id: "3",
        title: "JavaScript Best Practices",
        views: 3800,
        likes: 156,
        comments: 28,
        shares: 14,
        engagementRate: 5.2,
      },
    ],
    topProducts: [
      {
        id: "1",
        name: "Wireless Headphones",
        sales: 45,
        revenue: 2250,
        rating: 4.8,
      },
      {
        id: "2",
        name: "Laptop Stand",
        sales: 32,
        revenue: 960,
        rating: 4.6,
      },
      {
        id: "3",
        name: "USB-C Hub",
        sales: 28,
        revenue: 1120,
        rating: 4.7,
      },
    ],
    bestTimes: [
      { time: "9 AM", engagement: 4.2 },
      { time: "12 PM", engagement: 6.8 },
      { time: "3 PM", engagement: 5.4 },
      { time: "6 PM", engagement: 8.1 },
      { time: "9 PM", engagement: 7.3 },
    ],
    engagement: [
      { type: "Likes", current: 8945, previous: 8234, change: 8.6 },
      { type: "Comments", current: 2156, previous: 1987, change: 8.5 },
      { type: "Shares", current: 1234, previous: 1098, change: 12.4 },
      { type: "Followers", current: 12500, previous: 11800, change: 5.9 },
    ],
  },
  goals: {
    current: [
      {
        id: "1",
        title: "Reach 15K followers",
        current: 12500,
        target: 15000,
        progress: 83.3,
        deadline: "2024-02-29",
        status: "on-track",
      },
      {
        id: "2",
        title: "Monthly earnings $5K",
        current: 3456.78,
        target: 5000,
        progress: 69.1,
        deadline: "2024-01-31",
        status: "behind",
      },
      {
        id: "3",
        title: "100 product sales",
        current: 89,
        target: 100,
        progress: 89,
        deadline: "2024-01-31",
        status: "on-track",
      },
    ],
    completed: [
      {
        id: "4",
        title: "10K profile views",
        target: 10000,
        completedDate: "2024-01-15",
      },
      {
        id: "5",
        title: "1K post likes",
        target: 1000,
        completedDate: "2024-01-10",
      },
    ],
  },
};

const COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
];

export const AnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<AnalyticsData>(mockAnalyticsData);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState("7d");
  const [activeTab, setActiveTab] = useState("overview");

  const refreshData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Analytics refreshed",
        description: "Your analytics data has been updated",
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `analytics-${new Date().toISOString().split("T")[0]}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    toast({
      title: "Data exported",
      description: "Analytics data has been downloaded",
    });
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US", { notation: "compact" }).format(num);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUpRight className="w-4 h-4 text-green-500" />;
    if (change < 0) return <ArrowDownRight className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-500";
    if (change < 0) return "text-red-500";
    return "text-gray-500";
  };

  const getGoalStatusColor = (status: string) => {
    switch (status) {
      case "on-track":
        return "text-green-500";
      case "behind":
        return "text-red-500";
      case "completed":
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Track your performance and insights
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={exportData}
            size="sm"
            className="hidden sm:flex"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            onClick={exportData}
            size="sm"
            className="sm:hidden"
          >
            <Download className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            onClick={refreshData}
            disabled={loading}
            size="sm"
            className="hidden sm:flex"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={refreshData}
            disabled={loading}
            size="sm"
            className="sm:hidden"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 lg:w-auto">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Overview</span>
            <span className="sm:hidden">📊</span>
          </TabsTrigger>
          <TabsTrigger value="engagement" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Engagement</span>
            <span className="sm:hidden">❤️</span>
          </TabsTrigger>
          <TabsTrigger value="audience" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Audience</span>
            <span className="sm:hidden">👥</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Performance</span>
            <span className="sm:hidden">🚀</span>
          </TabsTrigger>
          <TabsTrigger value="freelance" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Freelance</span>
            <span className="sm:hidden">💼</span>
          </TabsTrigger>
          <TabsTrigger value="goals" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Goals</span>
            <span className="sm:hidden">🎯</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Views</p>
                    <p className="text-2xl font-bold">
                      {formatNumber(data.overview.totalViews)}
                    </p>
                  </div>
                  <Eye className="w-8 h-8 text-blue-500" />
                </div>
                <div className="flex items-center mt-2 text-sm">
                  {getChangeIcon(12.5)}
                  <span className={getChangeColor(12.5)}>
                    +12.5% vs last period
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Engagement Rate
                    </p>
                    <p className="text-2xl font-bold">
                      {data.overview.engagementRate}%
                    </p>
                  </div>
                  <Heart className="w-8 h-8 text-red-500" />
                </div>
                <div className="flex items-center mt-2 text-sm">
                  {getChangeIcon(8.3)}
                  <span className={getChangeColor(8.3)}>
                    +8.3% vs last period
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Earnings
                    </p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(data.overview.totalEarnings)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
                <div className="flex items-center mt-2 text-sm">
                  {getChangeIcon(15.7)}
                  <span className={getChangeColor(15.7)}>
                    +15.7% vs last period
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Conversion Rate
                    </p>
                    <p className="text-2xl font-bold">
                      {data.overview.conversionRate}%
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-purple-500" />
                </div>
                <div className="flex items-center mt-2 text-sm">
                  {getChangeIcon(-2.1)}
                  <span className={getChangeColor(-2.1)}>
                    -2.1% vs last period
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChartIcon className="w-5 h-5" />
                Views & Engagement Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.trends.daily}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="#6366f1"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="likes"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="comments"
                    stroke="#06b6d4"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Engagement Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Engagement Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.performance.engagement.map((metric, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{metric.type}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {formatNumber(metric.current)}
                        </span>
                        <div className="flex items-center">
                          {getChangeIcon(metric.change)}
                          <span
                            className={`text-xs ${getChangeColor(metric.change)}`}
                          >
                            {metric.change > 0 ? "+" : ""}
                            {metric.change.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <Progress
                      value={(metric.current / (metric.current + 1000)) * 100}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Best Posting Times */}
            <Card>
              <CardHeader>
                <CardTitle>Best Posting Times</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.performance.bestTimes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="engagement" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Performing Content */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.performance.topPosts.map((post, index) => (
                  <div
                    key={post.id}
                    className="flex items-center gap-4 p-3 border rounded-lg"
                  >
                    <div className="flex-shrink-0">
                      <Badge variant="secondary">#{index + 1}</Badge>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{post.title}</h4>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {formatNumber(post.views)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {formatNumber(post.likes)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {formatNumber(post.comments)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Share2 className="w-3 h-3" />
                          {formatNumber(post.shares)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {post.engagementRate}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        engagement
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audience Tab */}
        <TabsContent value="audience" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Age Demographics */}
            <Card>
              <CardHeader>
                <CardTitle>Age Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={data.demographics.age}
                      dataKey="value"
                      nameKey="range"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ range, value }) => `${range}: ${value}%`}
                    >
                      {data.demographics.age.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gender Demographics */}
            <Card>
              <CardHeader>
                <CardTitle>Gender Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RadialBarChart data={data.demographics.gender}>
                    <RadialBar
                      dataKey="value"
                      cornerRadius={10}
                      fill="#6366f1"
                    />
                    <Tooltip />
                  </RadialBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Location & Interests */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Locations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.demographics.location.map((location, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm">{location.country}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={location.value} className="w-20 h-2" />
                      <span className="text-xs text-muted-foreground w-8">
                        {location.value}%
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Interests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.demographics.interests.map((interest, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm">{interest.interest}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={interest.value} className="w-20 h-2" />
                      <span className="text-xs text-muted-foreground w-8">
                        {interest.value}%
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          {/* Revenue & Sales */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.trends.daily}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="earnings"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.performance.topProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 p-3 border rounded-lg"
                  >
                    <Badge variant="secondary">#{index + 1}</Badge>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{product.name}</h4>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span>{product.sales} sales</span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          {product.rating}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {formatCurrency(product.revenue)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        revenue
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-6">
          {/* Current Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Current Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.goals.current.map((goal) => (
                <div key={goal.id} className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{goal.title}</h4>
                    <Badge
                      variant="outline"
                      className={getGoalStatusColor(goal.status)}
                    >
                      {goal.status.replace("-", " ")}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>{goal.progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={goal.progress} />
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      {formatNumber(goal.current)} / {formatNumber(goal.target)}
                    </span>
                    <span>
                      Due: {new Date(goal.deadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Completed Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Completed Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.goals.completed.map((goal) => (
                <div
                  key={goal.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-green-50"
                >
                  <div>
                    <h4 className="font-medium text-sm">{goal.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      Target: {formatNumber(goal.target)}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="text-green-700">
                      Completed
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(goal.completedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Freelance Analytics Tab */}
        <TabsContent value="freelance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                  Freelance Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        $12.5K
                      </div>
                      <div className="text-sm text-green-700">
                        Monthly Earnings
                      </div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        4.9
                      </div>
                      <div className="text-sm text-blue-700">Avg Rating</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Project Success Rate</span>
                      <span className="font-medium">95%</span>
                    </div>
                    <Progress value={95} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>On-time Delivery</span>
                      <span className="font-medium">98%</span>
                    </div>
                    <Progress value={98} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Market Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-1">
                      Skills in Demand
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">
                        React
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Node.js
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Python
                      </Badge>
                    </div>
                  </div>

                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-1">
                      Rate Suggestion
                    </h4>
                    <p className="text-sm text-green-700">
                      Consider increasing your rate to $85/hr based on market
                      demand
                    </p>
                  </div>

                  <div className="p-3 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-800 mb-1">
                      Opportunities
                    </h4>
                    <p className="text-sm text-purple-700">
                      3 high-value projects match your skills this week
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

export default AnalyticsDashboard;
