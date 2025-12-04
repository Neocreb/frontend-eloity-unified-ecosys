// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
  Users, BarChart3, DollarSign, Activity, Video, MessageSquare, 
  ShoppingCart, TrendingUp, AlertCircle, Eye, ThumbsUp, Share2,
  Clock, Globe, Smartphone, Desktop, Monitor, ChevronUp, ChevronDown,
  Calendar, Filter, Download, RefreshCw, Settings, Bell, Search,
  User, CreditCard, Zap, Target, Award, Flag, Shield, Database,
  Layers, PieChart, LineChart, Map, Users2, Heart, Star, Play
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/contexts/CurrencyContext';

// Types
interface DashboardMetrics {
  overview: {
    users: {
      total: number;
      active: number;
      new: number;
      growth: number;
    };
    content: {
      posts: number;
      videos: number;
      stories: number;
      engagement: number;
    };
    revenue: {
      total: number;
      growth: number;
      sources: Record<string, number>;
      arpu: number;
    };
    engagement: {
      rate: number;
      growth: number;
      topContent: any[];
      activeTime: number;
    };
    performance: {
      responseTime: number;
      uptime: number;
      errorRate: number;
      throughput: number;
    };
  };
  realTime: {
    activeUsers: number;
    postsPerMinute: number;
    revenue: number;
    errors: number;
  };
  trends: {
    hashtags: string[];
    topics: string[];
    creators: any[];
  };
  alerts: Array<{
    id: string;
    type: string;
    message: string;
    severity: 'info' | 'warning' | 'error';
    timestamp: Date;
  }>;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
  onClick?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  icon, 
  trend = 'neutral', 
  description,
  onClick 
}) => {
  const isMobile = useIsMobile();
  
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]",
        onClick && "hover:bg-accent/5"
      )}
      onClick={onClick}
    >
      <CardContent className={cn("p-4", isMobile && "p-3")}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn(
              "p-2 rounded-full",
              trend === 'up' && "bg-green-100 text-green-600",
              trend === 'down' && "bg-red-100 text-red-600",
              trend === 'neutral' && "bg-blue-100 text-blue-600"
            )}>
              {icon}
            </div>
            <div className="space-y-1">
              <p className={cn(
                "text-sm font-medium text-muted-foreground",
                isMobile && "text-xs"
              )}>
                {title}
              </p>
              <p className={cn(
                "text-2xl font-bold",
                isMobile && "text-xl"
              )}>
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              {description && (
                <p className={cn(
                  "text-xs text-muted-foreground",
                  isMobile && "text-xs"
                )}>
                  {description}
                </p>
              )}
            </div>
          </div>
          {change !== undefined && (
            <div className={cn(
              "flex items-center space-x-1 text-sm font-medium",
              change > 0 && "text-green-600",
              change < 0 && "text-red-600",
              change === 0 && "text-gray-600"
            )}>
              {change > 0 ? <ChevronUp className="h-4 w-4" /> : 
               change < 0 ? <ChevronDown className="h-4 w-4" /> : null}
              <span>{Math.abs(change).toFixed(1)}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const RealTimeMetrics: React.FC<{ data: DashboardMetrics['realTime'] }> = ({ data }) => {
  const isMobile = useIsMobile();
  
  return (
    <Card>
      <CardHeader className={cn("pb-3", isMobile && "pb-2")}>
        <CardTitle className={cn("text-lg font-semibold flex items-center space-x-2", isMobile && "text-base")}>
          <Activity className="h-5 w-5 text-green-500" />
          <span>Real-Time Activity</span>
          <Badge variant="outline" className="ml-auto">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
            Live
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className={cn("space-y-4", isMobile && "space-y-3")}>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className={cn("text-2xl font-bold text-blue-600", isMobile && "text-xl")}>
              {data.activeUsers.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Active Users</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className={cn("text-2xl font-bold text-green-600", isMobile && "text-xl")}>
              {data.postsPerMinute}
            </p>
            <p className="text-sm text-muted-foreground">Posts/min</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <p className={cn("text-2xl font-bold text-yellow-600", isMobile && "text-xl")}>
              ${data.revenue.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Revenue Today</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <p className={cn("text-2xl font-bold text-red-600", isMobile && "text-xl")}>
              {data.errors}
            </p>
            <p className="text-sm text-muted-foreground">Active Errors</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const TrendingSection: React.FC<{ data: DashboardMetrics['trends'] }> = ({ data }) => {
  const isMobile = useIsMobile();
  
  return (
    <Card>
      <CardHeader className={cn("pb-3", isMobile && "pb-2")}>
        <CardTitle className={cn("text-lg font-semibold flex items-center space-x-2", isMobile && "text-base")}>
          <TrendingUp className="h-5 w-5 text-orange-500" />
          <span>Trending Now</span>
        </CardTitle>
      </CardHeader>
      <CardContent className={cn("space-y-4", isMobile && "space-y-3")}>
        <div>
          <h4 className="font-medium mb-2 text-sm">Popular Hashtags</h4>
          <div className="flex flex-wrap gap-2">
            {data.hashtags.map((hashtag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {hashtag}
              </Badge>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-medium mb-2 text-sm">Trending Topics</h4>
          <div className="flex flex-wrap gap-2">
            {data.topics.map((topic, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {topic}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AlertsPanel: React.FC<{ alerts: DashboardMetrics['alerts'] }> = ({ alerts }) => {
  const isMobile = useIsMobile();
  
  return (
    <Card>
      <CardHeader className={cn("pb-3", isMobile && "pb-2")}>
        <CardTitle className={cn("text-lg font-semibold flex items-center space-x-2", isMobile && "text-base")}>
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span>System Alerts</span>
          {alerts.length > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {alerts.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Shield className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-sm">All systems operational</p>
          </div>
        ) : (
          <ScrollArea className="h-40">
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div 
                  key={alert.id}
                  className={cn(
                    "p-3 rounded-lg border-l-4",
                    alert.severity === 'error' && "bg-red-50 border-red-500",
                    alert.severity === 'warning' && "bg-yellow-50 border-yellow-500",
                    alert.severity === 'info' && "bg-blue-50 border-blue-500"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className={cn("font-medium text-sm", isMobile && "text-xs")}>
                        {alert.message}
                      </p>
                      <p className={cn("text-xs text-muted-foreground mt-1", isMobile && "text-xs")}>
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <Badge 
                      variant={
                        alert.severity === 'error' ? 'destructive' : 
                        alert.severity === 'warning' ? 'secondary' : 'default'
                      }
                      className="text-xs"
                    >
                      {alert.severity}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

const QuickActions: React.FC = () => {
  const isMobile = useIsMobile();
  
  const actions = [
    { icon: Users, label: 'User Management', color: 'bg-blue-500', href: '/admin/users' },
    { icon: BarChart3, label: 'Analytics', color: 'bg-green-500', href: '/admin/analytics' },
    { icon: ShoppingCart, label: 'Marketplace', color: 'bg-purple-500', href: '/admin/marketplace' },
    { icon: DollarSign, label: 'Revenue', color: 'bg-yellow-500', href: '/admin/finance' },
    { icon: Video, label: 'Content', color: 'bg-red-500', href: '/admin/content' },
    { icon: Shield, label: 'Security', color: 'bg-gray-500', href: '/admin/security' },
  ];
  
  return (
    <Card>
      <CardHeader className={cn("pb-3", isMobile && "pb-2")}>
        <CardTitle className={cn("text-lg font-semibold", isMobile && "text-base")}>
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn(
          "grid gap-3",
          isMobile ? "grid-cols-2" : "grid-cols-3"
        )}>
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className={cn(
                "flex flex-col items-center space-y-2 h-auto py-4 px-3 hover:scale-105 transition-transform",
                isMobile && "py-3 px-2"
              )}
              onClick={() => window.location.href = action.href}
            >
              <div className={cn("p-2 rounded-full text-white", action.color)}>
                <action.icon className={cn("h-5 w-5", isMobile && "h-4 w-4")} />
              </div>
              <span className={cn("text-xs font-medium text-center", isMobile && "text-xs")}>
                {action.label}
              </span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const ComprehensiveAdminDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardMetrics | null>(null);
  const [timeframe, setTimeframe] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const isMobile = useIsMobile();

  // Mock data - in production this would come from API
  const mockData: DashboardMetrics = {
    overview: {
      users: { total: 125000, active: 45000, new: 2500, growth: 12.5 },
      content: { posts: 450000, videos: 180000, stories: 120000, engagement: 8.7 },
      revenue: { 
        total: 2500000, 
        growth: 18.3, 
        sources: { subscriptions: 1200000, marketplace: 800000, freelance: 300000, crypto: 200000 },
        arpu: 45.50 
      },
      engagement: { rate: 12.8, growth: 5.2, topContent: [], activeTime: 2400 },
      performance: { responseTime: 180, uptime: 99.8, errorRate: 0.02, throughput: 1200 }
    },
    realTime: { activeUsers: 12500, postsPerMinute: 45, revenue: 15000, errors: 2 },
    trends: { 
      hashtags: ['#trending', '#viral', '#ai', '#crypto', '#freelance'], 
      topics: ['AI Revolution', 'Crypto Trading', 'Remote Work'],
      creators: []
    },
    alerts: [
      {
        id: '1',
        type: 'performance',
        message: 'Database response time increased by 15%',
        severity: 'warning',
        timestamp: new Date()
      },
      {
        id: '2',
        type: 'security',
        message: 'Multiple login attempts detected',
        severity: 'error',
        timestamp: new Date()
      }
    ]
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setDashboardData(mockData);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      if (!isLoading) {
        fetchDashboardData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [timeframe]);

  const handleRefresh = () => {
    setDashboardData(null);
    setIsLoading(true);
    // Trigger data fetch
    setTimeout(() => {
      setDashboardData(mockData);
      setLastUpdated(new Date());
      setIsLoading(false);
    }, 1000);
  };

  if (isLoading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className={cn("text-3xl font-bold text-gray-900", isMobile && "text-2xl")}>
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">24 Hours</SelectItem>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
                <SelectItem value="90d">90 Days</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              {!isMobile && <span className="ml-2">Refresh</span>}
            </Button>
            
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
              {!isMobile && <span className="ml-2">Export</span>}
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Users"
            value={dashboardData.overview.users.total}
            change={dashboardData.overview.users.growth}
            icon={<Users className="h-5 w-5" />}
            trend="up"
            description={`${dashboardData.overview.users.active.toLocaleString()} active today`}
          />
          
          <MetricCard
            title="Total Revenue"
            value={`$${(dashboardData.overview.revenue.total / 1000000).toFixed(1)}M`}
            change={dashboardData.overview.revenue.growth}
            icon={<DollarSign className="h-5 w-5" />}
            trend="up"
            description={`$${dashboardData.overview.revenue.arpu} ARPU`}
          />
          
          <MetricCard
            title="Content Created"
            value={`${(dashboardData.overview.content.posts / 1000).toFixed(0)}K`}
            change={8.2}
            icon={<Video className="h-5 w-5" />}
            trend="up"
            description={`${dashboardData.overview.content.engagement}% avg engagement`}
          />
          
          <MetricCard
            title="Platform Health"
            value={`${dashboardData.overview.performance.uptime}%`}
            change={0.1}
            icon={<Activity className="h-5 w-5" />}
            trend="up"
            description={`${dashboardData.overview.performance.responseTime}ms response`}
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            title="Active Sessions"
            value={dashboardData.realTime.activeUsers}
            icon={<Eye className="h-4 w-4" />}
            description="Real-time"
          />
          
          <MetricCard
            title="Engagement Rate"
            value={`${dashboardData.overview.engagement.rate}%`}
            change={dashboardData.overview.engagement.growth}
            icon={<Heart className="h-4 w-4" />}
            trend="up"
          />
          
          <MetricCard
            title="Error Rate"
            value={`${dashboardData.overview.performance.errorRate}%`}
            change={-0.01}
            icon={<AlertCircle className="h-4 w-4" />}
            trend="down"
          />
          
          <MetricCard
            title="Throughput"
            value={`${dashboardData.overview.performance.throughput}/s`}
            icon={<Zap className="h-4 w-4" />}
            description="Requests"
          />
        </div>

        {/* Detailed Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <RealTimeMetrics data={dashboardData.realTime} />
          <TrendingSection data={dashboardData.trends} />
          <AlertsPanel alerts={dashboardData.alerts} />
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Revenue Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center space-x-2">
              <PieChart className="h-5 w-5 text-blue-500" />
              <span>Revenue Sources</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(dashboardData.overview.revenue.sources).map(([source, amount]) => {
                const percentage = (amount / dashboardData.overview.revenue.total) * 100;
                return (
                  <div key={source} className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 capitalize mb-1">
                      {source.replace('_', ' ')}
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      ${(amount / 1000000).toFixed(1)}M
                    </p>
                    <p className="text-sm text-gray-500">
                      {percentage.toFixed(1)}%
                    </p>
                    <Progress value={percentage} className="mt-2 h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComprehensiveAdminDashboard;
