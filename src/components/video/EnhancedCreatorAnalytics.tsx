import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  Eye, 
  ThumbsUp, 
  MessageCircle, 
  Share2, 
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  Target,
  Calendar,
  Download,
  RefreshCw,
  Award,
  Zap,
  Globe
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';

interface AnalyticsData {
  overview: {
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    totalEarnings: number;
    subscriberGrowth: number;
    engagementRate: number;
    averageWatchTime: number;
  };
  performance: Array<{
    date: string;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    earnings: number;
  }>;
  demographics: {
    ageGroups: Array<{ name: string; value: number; color: string }>;
    genderSplit: Array<{ name: string; value: number; color: string }>;
    topCountries: Array<{ country: string; views: number; percentage: number }>;
    deviceTypes: Array<{ device: string; usage: number; color: string }>;
  };
  content: {
    topPerformingVideos: Array<{
      id: string;
      title: string;
      views: number;
      likes: number;
      engagement: number;
      earnings: number;
    }>;
    contentCategories: Array<{ category: string; performance: number; growth: number }>;
    uploadTrends: Array<{ time: string; uploads: number; avgPerformance: number }>;
  };
  monetization: {
    revenueStreams: Array<{ source: string; amount: number; percentage: number; color: string }>;
    monthlyEarnings: Array<{ month: string; tips: number; sponsorships: number; ads: number }>;
    fanSupport: Array<{ supporter: string; amount: number; frequency: string }>;
  };
  audience: {
    retentionCurve: Array<{ timestamp: number; retention: number }>;
    peakViewingTimes: Array<{ hour: number; viewers: number; day: string }>;
    subscriberJourney: Array<{ stage: string; users: number; conversionRate: number }>;
  };
}

const EnhancedCreatorAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedTimeRange]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    
    // Simulated analytics data - in real app, this would come from API
    const mockData: AnalyticsData = {
      overview: {
        totalViews: 2450000,
        totalLikes: 180000,
        totalComments: 45000,
        totalShares: 25000,
        totalEarnings: 15750.50,
        subscriberGrowth: 12.5,
        engagementRate: 8.7,
        averageWatchTime: 4.2
      },
      performance: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        views: Math.floor(Math.random() * 50000) + 20000,
        likes: Math.floor(Math.random() * 3000) + 1000,
        comments: Math.floor(Math.random() * 800) + 200,
        shares: Math.floor(Math.random() * 500) + 100,
        earnings: Math.floor(Math.random() * 500) + 100
      })),
      demographics: {
        ageGroups: [
          { name: '13-17', value: 15, color: '#8884d8' },
          { name: '18-24', value: 35, color: '#82ca9d' },
          { name: '25-34', value: 28, color: '#ffc658' },
          { name: '35-44', value: 15, color: '#ff7c7c' },
          { name: '45+', value: 7, color: '#8dd1e1' }
        ],
        genderSplit: [
          { name: 'Female', value: 52, color: '#ff9999' },
          { name: 'Male', value: 45, color: '#99ccff' },
          { name: 'Other', value: 3, color: '#99ff99' }
        ],
        topCountries: [
          { country: 'United States', views: 850000, percentage: 34.7 },
          { country: 'United Kingdom', views: 420000, percentage: 17.1 },
          { country: 'Canada', views: 310000, percentage: 12.7 },
          { country: 'Australia', views: 245000, percentage: 10.0 },
          { country: 'Germany', views: 180000, percentage: 7.3 }
        ],
        deviceTypes: [
          { device: 'Mobile', usage: 68, color: '#8884d8' },
          { device: 'Desktop', usage: 25, color: '#82ca9d' },
          { device: 'Tablet', usage: 7, color: '#ffc658' }
        ]
      },
      content: {
        topPerformingVideos: [
          { id: '1', title: 'Amazing Dance Challenge', views: 450000, likes: 35000, engagement: 9.2, earnings: 2250 },
          { id: '2', title: 'Cooking Tutorial: Perfect Pasta', views: 380000, likes: 28000, engagement: 8.8, earnings: 1900 },
          { id: '3', title: 'Travel Vlog: Japan Adventure', views: 320000, likes: 22000, engagement: 7.9, earnings: 1600 },
          { id: '4', title: 'Tech Review: Latest Smartphone', views: 280000, likes: 18000, engagement: 7.1, earnings: 1400 },
          { id: '5', title: 'Fitness Workout at Home', views: 250000, likes: 16000, engagement: 6.8, earnings: 1250 }
        ],
        contentCategories: [
          { category: 'Entertainment', performance: 92, growth: 15.2 },
          { category: 'Education', performance: 87, growth: 8.7 },
          { category: 'Lifestyle', performance: 79, growth: 12.1 },
          { category: 'Technology', performance: 74, growth: 5.3 },
          { category: 'Gaming', performance: 68, growth: -2.1 }
        ],
        uploadTrends: [
          { time: 'Morning (6-12)', uploads: 25, avgPerformance: 78 },
          { time: 'Afternoon (12-18)', uploads: 40, avgPerformance: 85 },
          { time: 'Evening (18-24)', uploads: 30, avgPerformance: 92 },
          { time: 'Night (0-6)', uploads: 5, avgPerformance: 65 }
        ]
      },
      monetization: {
        revenueStreams: [
          { source: 'Fan Tips', amount: 6800, percentage: 43.2, color: '#8884d8' },
          { source: 'Sponsorships', amount: 4900, percentage: 31.1, color: '#82ca9d' },
          { source: 'Ad Revenue', amount: 2600, percentage: 16.5, color: '#ffc658' },
          { source: 'Merchandise', amount: 1450, percentage: 9.2, color: '#ff7c7c' }
        ],
        monthlyEarnings: Array.from({ length: 12 }, (_, i) => ({
          month: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short' }),
          tips: Math.floor(Math.random() * 3000) + 2000,
          sponsorships: Math.floor(Math.random() * 2000) + 1500,
          ads: Math.floor(Math.random() * 1000) + 800
        })),
        fanSupport: [
          { supporter: 'Sarah M.', amount: 250, frequency: 'Weekly' },
          { supporter: 'Mike T.', amount: 150, frequency: 'Monthly' },
          { supporter: 'Jessica L.', amount: 100, frequency: 'Weekly' },
          { supporter: 'David R.', amount: 200, frequency: 'Bi-weekly' },
          { supporter: 'Emma S.', amount: 75, frequency: 'Monthly' }
        ]
      },
      audience: {
        retentionCurve: Array.from({ length: 100 }, (_, i) => ({
          timestamp: i,
          retention: Math.max(0, 100 - (i * 1.2) - Math.random() * 20)
        })),
        peakViewingTimes: [
          { hour: 8, viewers: 1200, day: 'Mon' },
          { hour: 12, viewers: 2100, day: 'Mon' },
          { hour: 18, viewers: 3800, day: 'Mon' },
          { hour: 20, viewers: 4500, day: 'Mon' },
          { hour: 8, viewers: 1400, day: 'Tue' },
          { hour: 12, viewers: 2300, day: 'Tue' },
          { hour: 18, viewers: 4200, day: 'Tue' },
          { hour: 20, viewers: 5100, day: 'Tue' }
        ],
        subscriberJourney: [
          { stage: 'Discovery', users: 10000, conversionRate: 25 },
          { stage: 'First Watch', users: 2500, conversionRate: 40 },
          { stage: 'Engagement', users: 1000, conversionRate: 60 },
          { stage: 'Subscription', users: 600, conversionRate: 80 },
          { stage: 'Advocacy', users: 480, conversionRate: 100 }
        ]
      }
    };

    // Simulate API delay
    setTimeout(() => {
      setAnalyticsData(mockData);
      setIsLoading(false);
    }, 1000);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const exportData = (format: 'csv' | 'json' | 'pdf') => {
    // Implementation for data export
    console.log(`Exporting data in ${format} format`);
  };

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Creator Analytics</h2>
          <p className="text-muted-foreground hidden sm:block">Track your content performance and audience insights</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedTimeRange === '7d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTimeRange('7d')}
          >
            7 Days
          </Button>
          <Button
            variant={selectedTimeRange === '30d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTimeRange('30d')}
          >
            30 Days
          </Button>
          <Button
            variant={selectedTimeRange === '90d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTimeRange('90d')}
          >
            90 Days
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportData('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-blue-500" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{formatNumber(analyticsData.overview.totalViews)}</p>
                <p className="text-xs text-green-600">+12.5% from last period</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <ThumbsUp className="h-5 w-5 text-green-500" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Likes</p>
                <p className="text-2xl font-bold">{formatNumber(analyticsData.overview.totalLikes)}</p>
                <p className="text-xs text-green-600">+8.3% from last period</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-yellow-500" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold">{formatCurrency(analyticsData.overview.totalEarnings)}</p>
                <p className="text-xs text-green-600">+15.7% from last period</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Engagement Rate</p>
                <p className="text-2xl font-bold">{analyticsData.overview.engagementRate}%</p>
                <p className="text-xs text-green-600">+2.1% from last period</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="monetization">Monetization</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>Track your content performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.performance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="views" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="likes" stroke="#82ca9d" strokeWidth={2} />
                  <Line type="monotone" dataKey="comments" stroke="#ffc658" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={analyticsData.performance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="earnings" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Like Rate</span>
                    <span className="text-sm text-muted-foreground">7.3%</span>
                  </div>
                  <Progress value={73} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Comment Rate</span>
                    <span className="text-sm text-muted-foreground">1.8%</span>
                  </div>
                  <Progress value={18} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Share Rate</span>
                    <span className="text-sm text-muted-foreground">1.0%</span>
                  </div>
                  <Progress value={10} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Demographics Tab */}
        <TabsContent value="demographics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Age Groups</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={analyticsData.demographics.ageGroups}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {analyticsData.demographics.ageGroups.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={analyticsData.demographics.deviceTypes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="device" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="usage" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Countries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.demographics.topCountries.map((country, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{country.country}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-muted-foreground">{formatNumber(country.views)} views</span>
                      <Badge variant="outline">{country.percentage}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Videos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.content.topPerformingVideos.map((video, index) => (
                  <div key={video.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline">{index + 1}</Badge>
                      <div>
                        <h4 className="font-medium">{video.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatNumber(video.views)} views • {formatNumber(video.likes)} likes
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(video.earnings)}</p>
                      <p className="text-sm text-muted-foreground">{video.engagement}% engagement</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.content.contentCategories.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{category.category}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">{category.performance}%</span>
                          <Badge variant={category.growth > 0 ? "default" : "destructive"}>
                            {category.growth > 0 ? '+' : ''}{category.growth}%
                          </Badge>
                        </div>
                      </div>
                      <Progress value={category.performance} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upload Timing</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={analyticsData.content.uploadTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avgPerformance" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Monetization Tab */}
        <TabsContent value="monetization" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Streams</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={analyticsData.monetization.revenueStreams}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="amount"
                      label={({ source, percentage }) => `${source}: ${percentage}%`}
                    >
                      {analyticsData.monetization.revenueStreams.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Supporters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.monetization.fanSupport.map((supporter, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Award className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">{supporter.supporter}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(supporter.amount)}</p>
                        <p className="text-sm text-muted-foreground">{supporter.frequency}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Earnings Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.monetization.monthlyEarnings}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="tips" stackId="a" fill="#8884d8" />
                  <Bar dataKey="sponsorships" stackId="a" fill="#82ca9d" />
                  <Bar dataKey="ads" stackId="a" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audience Tab */}
        <TabsContent value="audience" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Audience Retention</CardTitle>
              <CardDescription>Average retention curve across all videos</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={analyticsData.audience.retentionCurve}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="retention" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Peak Viewing Times</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={analyticsData.audience.peakViewingTimes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="viewers" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscriber Journey</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.audience.subscriberJourney.map((stage, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{stage.stage}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">{formatNumber(stage.users)}</span>
                          <Badge variant="outline">{stage.conversionRate}%</Badge>
                        </div>
                      </div>
                      <Progress value={stage.conversionRate} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedCreatorAnalytics;
