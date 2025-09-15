import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  TrendingDown,
  Eye,
  MousePointer,
  ShoppingCart,
  DollarSign,
  Users,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Target,
  Clock,
  Zap,
  Award,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface CampaignAnalyticsDashboardProps {
  campaigns: any[];
}

// Mock analytics data for demonstration
const mockPerformanceData = [
  { date: "Jan 15", impressions: 1200, clicks: 89, conversions: 12, spend: 45.30, revenue: 189.50 },
  { date: "Jan 16", impressions: 1456, clicks: 103, conversions: 15, spend: 52.10, revenue: 234.20 },
  { date: "Jan 17", impressions: 1789, clicks: 134, conversions: 18, spend: 61.80, revenue: 298.40 },
  { date: "Jan 18", impressions: 2103, clicks: 156, conversions: 22, spend: 71.20, revenue: 367.80 },
  { date: "Jan 19", impressions: 1923, clicks: 142, conversions: 19, spend: 67.40, revenue: 342.10 },
  { date: "Jan 20", impressions: 2234, clicks: 178, conversions: 25, spend: 78.90, revenue: 421.30 },
  { date: "Jan 21", impressions: 2456, clicks: 195, conversions: 28, spend: 86.40, revenue: 467.20 },
];

const mockGeographicData = [
  { location: "Nigeria", impressions: 8543, clicks: 456, conversions: 67, percentage: 45.2 },
  { location: "Ghana", impressions: 3421, clicks: 234, conversions: 34, percentage: 18.1 },
  { location: "Kenya", impressions: 2876, clicks: 198, conversions: 28, percentage: 15.2 },
  { location: "South Africa", impressions: 2134, clicks: 156, conversions: 22, percentage: 11.3 },
  { location: "United States", impressions: 1567, clicks: 123, conversions: 18, percentage: 8.3 },
  { location: "Others", impressions: 456, clicks: 34, conversions: 5, percentage: 1.9 },
];

const mockDeviceData = [
  { device: "Mobile", value: 68, color: "#3B82F6" },
  { device: "Desktop", value: 25, color: "#10B981" },
  { device: "Tablet", value: 7, color: "#F59E0B" },
];

const mockAudienceInsights = [
  { category: "Age 18-24", percentage: 28, performance: "High" },
  { category: "Age 25-34", percentage: 42, performance: "Very High" },
  { category: "Age 35-44", percentage: 20, performance: "Medium" },
  { category: "Age 45+", percentage: 10, performance: "Low" },
];

const mockInterestData = [
  { interest: "Technology", clicks: 234, conversions: 34, ctr: 8.2 },
  { interest: "E-commerce", clicks: 198, conversions: 28, ctr: 6.7 },
  { interest: "Freelancing", clicks: 156, conversions: 22, ctr: 5.4 },
  { interest: "Cryptocurrency", clicks: 123, conversions: 18, ctr: 4.9 },
  { interest: "Business", clicks: 89, conversions: 12, ctr: 3.8 },
];

const CampaignAnalyticsDashboard: React.FC<CampaignAnalyticsDashboardProps> = ({
  campaigns = [],
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d");
  const [selectedCampaign, setSelectedCampaign] = useState("all");
  const [selectedMetric, setSelectedMetric] = useState("impressions");

  // Ensure campaigns is an array and filter out any invalid entries
  const validCampaigns = Array.isArray(campaigns) ? campaigns.filter(campaign =>
    campaign && typeof campaign === 'object' && campaign.name
  ) : [];

  // Calculate key metrics
  const totalImpressions = mockPerformanceData.reduce((sum, data) => sum + data.impressions, 0);
  const totalClicks = mockPerformanceData.reduce((sum, data) => sum + data.clicks, 0);
  const totalConversions = mockPerformanceData.reduce((sum, data) => sum + data.conversions, 0);
  const totalSpend = mockPerformanceData.reduce((sum, data) => sum + data.spend, 0);
  const totalRevenue = mockPerformanceData.reduce((sum, data) => sum + data.revenue, 0);

  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
  const costPerClick = totalClicks > 0 ? totalSpend / totalClicks : 0;
  const costPerConversion = totalConversions > 0 ? totalSpend / totalConversions : 0;
  const roi = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0;

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case "impressions": return <Eye className="h-4 w-4" />;
      case "clicks": return <MousePointer className="h-4 w-4" />;
      case "conversions": return <ShoppingCart className="h-4 w-4" />;
      case "revenue": return <DollarSign className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance.toLowerCase()) {
      case "very high": return "text-green-600 bg-green-50";
      case "high": return "text-blue-600 bg-blue-50";
      case "medium": return "text-yellow-600 bg-yellow-50";
      case "low": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value: number, decimals: number = 1) => {
    return `${value.toFixed(decimals)}%`;
  };

  // Show empty state if no valid campaigns
  if (validCampaigns.length === 0) {
    return (
      <div className="space-y-4 md:space-y-6 px-4 md:px-0">
        <Card>
          <CardContent className="p-8 text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Campaign Data</h3>
            <p className="text-muted-foreground">
              Create some campaigns to start viewing analytics and performance metrics.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 px-4 md:px-0">
      {/* Header with Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Campaign Analytics</h2>
          <p className="text-muted-foreground text-sm">
            Track performance and optimize your campaigns
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full md:w-auto">
          <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Select campaign" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Campaigns</SelectItem>
              {validCampaigns.map((campaign) => (
                <SelectItem key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2 sm:gap-3">
            <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Today</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>

            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
              <span className="sm:hidden ml-2">Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm text-muted-foreground">Impressions</p>
                <p className="text-lg md:text-2xl font-bold truncate">{totalImpressions.toLocaleString()}</p>
                <div className="flex items-center text-xs text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12.5%
                </div>
              </div>
              <Eye className="h-6 md:h-8 w-6 md:w-8 text-blue-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm text-muted-foreground">Clicks</p>
                <p className="text-lg md:text-2xl font-bold truncate">{totalClicks.toLocaleString()}</p>
                <div className="flex items-center text-xs text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8.7%
                </div>
              </div>
              <MousePointer className="h-6 md:h-8 w-6 md:w-8 text-purple-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm text-muted-foreground">Conversions</p>
                <p className="text-lg md:text-2xl font-bold truncate">{totalConversions}</p>
                <div className="flex items-center text-xs text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +15.3%
                </div>
              </div>
              <ShoppingCart className="h-6 md:h-8 w-6 md:w-8 text-green-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm text-muted-foreground">CTR</p>
                <p className="text-lg md:text-2xl font-bold truncate">{formatPercentage(ctr)}</p>
                <div className="flex items-center text-xs text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +2.1%
                </div>
              </div>
              <Target className="h-6 md:h-8 w-6 md:w-8 text-orange-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm text-muted-foreground">Cost/Click</p>
                <p className="text-lg md:text-2xl font-bold truncate">{formatCurrency(costPerClick)}</p>
                <div className="flex items-center text-xs text-red-600">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -5.2%
                </div>
              </div>
              <DollarSign className="h-6 md:h-8 w-6 md:w-8 text-red-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm text-muted-foreground">ROI</p>
                <p className="text-lg md:text-2xl font-bold truncate">{formatPercentage(roi, 0)}</p>
                <div className="flex items-center text-xs text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +18.9%
                </div>
              </div>
              <Award className="h-6 md:h-8 w-6 md:w-8 text-pink-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Performance Trends</h3>
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="impressions">Impressions</SelectItem>
                <SelectItem value="clicks">Clicks</SelectItem>
                <SelectItem value="conversions">Conversions</SelectItem>
                <SelectItem value="revenue">Revenue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any, name: string) => {
                    if (name === "spend" || name === "revenue") {
                      return [formatCurrency(value), name];
                    }
                    return [value.toLocaleString(), name];
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey={selectedMetric} 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.1}
                />
                {selectedMetric !== "spend" && (
                  <Area 
                    type="monotone" 
                    dataKey="spend" 
                    stroke="#F59E0B" 
                    fill="#F59E0B" 
                    fillOpacity={0.1}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Geographic Performance */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Geographic Performance</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockGeographicData.map((location, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{location.location}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatPercentage(location.percentage)}
                    </span>
                  </div>
                  <Progress value={location.percentage} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{location.impressions.toLocaleString()} impressions</span>
                    <span>{location.conversions} conversions</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Device Performance */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Device Performance</h3>
          </CardHeader>
          <CardContent>
            <div className="h-64 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockDeviceData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ device, value }) => `${device}: ${value}%`}
                  >
                    {mockDeviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {mockDeviceData.map((device, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: device.color }}
                    />
                    <span className="text-sm">{device.device}</span>
                  </div>
                  <span className="text-sm font-medium">{device.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Audience Insights */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Audience Insights</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAudienceInsights.map((insight, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium">{insight.category}</span>
                    <p className="text-sm text-muted-foreground">
                      {formatPercentage(insight.percentage)} of audience
                    </p>
                  </div>
                  <Badge className={getPerformanceColor(insight.performance)}>
                    {insight.performance}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Interest Performance */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Top Performing Interests</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockInterestData.map((interest, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{interest.interest}</span>
                    <p className="text-sm text-muted-foreground">
                      {interest.clicks} clicks • {interest.conversions} conversions
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">{formatPercentage(interest.ctr)}</span>
                    <p className="text-xs text-muted-foreground">CTR</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Comparison */}
      {validCampaigns.length > 1 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Campaign Comparison</h3>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={validCampaigns.map(campaign => ({
                  name: campaign.name.substring(0, 15) + "...",
                  impressions: campaign.metrics?.impressions || 0,
                  clicks: campaign.metrics?.clicks || 0,
                  conversions: campaign.metrics?.conversions || 0,
                  roi: campaign.metrics?.roas || 0,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="impressions" fill="#3B82F6" name="Impressions" />
                  <Bar dataKey="clicks" fill="#10B981" name="Clicks" />
                  <Bar dataKey="conversions" fill="#F59E0B" name="Conversions" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Optimization Recommendations */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Optimization Recommendations</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Strong Performance</h4>
                <p className="text-sm text-blue-700">
                  Your campaigns are performing 23% above industry average. Consider increasing budget for top-performing campaigns.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900">Audience Optimization</h4>
                <p className="text-sm text-yellow-700">
                  The 25-34 age group shows highest conversion rates. Consider targeting similar demographics for new campaigns.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
              <Zap className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900">Device Focus</h4>
                <p className="text-sm text-green-700">
                  Mobile users account for 68% of conversions. Optimize your content for mobile viewing to improve performance.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CampaignAnalyticsDashboard;
