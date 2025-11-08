// @ts-nocheck
import React, { useState, useEffect } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";
import {
  // Analytics & Charts
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Eye,
  Target,
  Zap,
  
  // Platform Features
  House,
  Search,
  Video,
  ShoppingBag,
  Briefcase,
  Coins,
  Gift,
  Calendar,
  MessageSquare,
  Users,
  Building,
  Radio,
  Megaphone,
  Award,
  Star,
  
  // Actions
  Download,
  RefreshCw,
  Filter,
  Settings,
  Plus,
  ExternalLink,
  MoreHorizontal,
  Bell,
  Heart,
  Share2,
  Play,
  
  // UI Elements
  ChevronRight,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Grid3X3,
  List,
  Lightbulb,
  
  // Money & Revenue
  DollarSign,
  CreditCard,
  Wallet,
  HandCoins,
  
  // Content & Media
  FileText,
  Image,
  Film,
  Mic,
  Camera,
  
  // Social
  ThumbsUp,
  MessageCircle,
  UserPlus,
  Crown,
  
  // Time & Date
  Clock,
  Calendar as CalendarIcon,
  Timer,
  
  // Status & Growth
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  
  // Navigation
  Menu,
  X,
  ChevronLeft,
  Home,
  Globe,
} from "lucide-react";
import { Line } from 'react-chartjs-2';
import { useNavigate, useSearchParams } from 'react-router-dom';
import EnhancedCreatorAnalytics from '@/components/video/EnhancedCreatorAnalytics';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
import { fetchContentPageSupabase } from '@/services/contentService';
import { activateFeature, deactivateFeature, getFeatureActivationStatus } from '@/services/featureActivationService';
import { UserDemographics } from '@/services/userDemographicsService';
import { fetchPlatformAnalytics, fetchTopPerformingContent, fetchFeatureDetails } from '@/services/analyticsService';
import { activityService } from '@/services/taskService';
import { useRealtimeAnalytics } from '@/hooks/useRealtimeAnalytics';
import { useAuth } from '@/contexts/AuthContext';

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  trend: "up" | "down" | "neutral";
  icon: React.ElementType;
  color: string;
  description?: string;
}

interface FeatureAnalytics {
  name: string;
  icon: React.ElementType;
  color: string;
  metrics: MetricCard[];
  growth: number;
  active: boolean;
}

interface DetailedMetric {
  name: string;
  value: string | number;
  change: string;
  trend: "up" | "down" | "neutral";
  description: string;
}

interface DetailedCategory {
  category: string;
  metrics: DetailedMetric[];
}

const EnhancedCreatorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState(() => {
    try {
      if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
        return window.localStorage.getItem("ucs:timeRange") || "30d";
      }
    } catch {}
    return "30d";
  });
  const [searchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState<string>(() => {
    try {
      const t = (typeof window !== 'undefined') ? new URLSearchParams(window.location.search).get('tab') : null;
      return t || 'overview';
    } catch { return 'overview'; }
  });
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [setupComplete, setSetupComplete] = useState(() => {
    try {
      if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
        return window.localStorage.getItem("ucs:setupCompleted") === "true";
      }
    } catch {}
    return false;
  });
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [platformFeatures, setPlatformFeatures] = useState<FeatureAnalytics[]>([]);
  const [quickActions, setQuickActions] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [topPerformingContent, setTopPerformingContent] = useState<any[]>([]);
  const [userDemographics, setUserDemographics] = useState<UserDemographics | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Use real-time analytics hook
  const { platformFeatures: realtimePlatformFeatures, topPerformingContent: realtimeTopPerformingContent, userDemographics: realtimeUserDemographics, isLoading, error, refreshData } = useRealtimeAnalytics(user?.id || null);

  // Update platform features when real-time data changes
  useEffect(() => {
    if (realtimePlatformFeatures) {
      setPlatformFeatures(realtimePlatformFeatures);
    }
  }, [realtimePlatformFeatures]);

  // Update top performing content when real-time data changes
  useEffect(() => {
    if (realtimeTopPerformingContent) {
      setTopPerformingContent(realtimeTopPerformingContent);
    }
  }, [realtimeTopPerformingContent]);

  // Update user demographics when real-time data changes
  useEffect(() => {
    if (realtimeUserDemographics) {
      setUserDemographics(realtimeUserDemographics);
    }
  }, [realtimeUserDemographics]);

  // Show error message to user
  useEffect(() => {
    if (error) {
      alert(`Error: ${error.message}. Please try refreshing the page or check your connection.`);
    }
  }, [error]);

  // Fetch quick actions data
  useEffect(() => {
    // These actions are now dynamically determined based on user features
    // In a real implementation, these would be fetched from the backend based on user permissions
    const actions = platformFeatures
      .filter(feature => feature.active)
      .map(feature => {
        // Map feature names to icons and colors
        let icon = Activity;
        let color = "bg-gray-500";
        
        switch (feature.name) {
          case "Feed Posts":
            icon = Plus;
            color = "bg-blue-500";
            break;
          case "Video Content":
            icon = Video;
            color = "bg-red-500";
            break;
          case "Marketplace":
            icon = ShoppingBag;
            color = "bg-green-500";
            break;
          case "Freelance":
            icon = Briefcase;
            color = "bg-orange-500";
            break;
          case "Crypto Trading":
            icon = Coins;
            color = "bg-yellow-500";
            break;
          case "Live Streaming":
            icon = Radio;
            color = "bg-pink-500";
            break;
          case "Events & Calendar":
            icon = Calendar;
            color = "bg-indigo-500";
            break;
          case "Chat & Messaging":
            icon = MessageSquare;
            color = "bg-purple-500";
            break;
          default:
            icon = Activity;
            color = "bg-gray-500";
        }
        
        return {
          name: `Create ${feature.name.replace(' & ', ' and ')}`,
          icon,
          color: color,
          href: getFeatureRoute(feature.name)
        };
      });
    
    // Add a few default actions that are always available
    const defaultActions = [
      { name: "View Analytics", icon: BarChart3, color: "bg-blue-500", href: "/analytics" },
      { name: "Manage Profile", icon: Settings, color: "bg-gray-500", href: "/profile" }
    ];
    
    setQuickActions([...actions.slice(0, 6), ...defaultActions]);
  }, [platformFeatures]); // Depend on platformFeatures to update when features change

  // Fetch recent activities data
  useEffect(() => {
    const loadRecentActivities = async () => {
      try {
        const activities = await activityService.getUserActivities(undefined, 10);
        // Transform the activities to match the expected format
        const formattedActivities = activities.map(activity => {
          // Map activity types to icons and colors
          let icon = Heart;
          let color = "text-gray-500";
          
          switch (activity.activity_type) {
            case "video":
              icon = Video;
              color = "text-red-500";
              break;
            case "marketplace":
              icon = ShoppingBag;
              color = "text-green-500";
              break;
            case "freelance":
              icon = Briefcase;
              color = "text-orange-500";
              break;
            case "social":
              icon = Heart;
              color = "text-pink-500";
              break;
            case "crypto":
              icon = TrendingUp;
              color = "text-green-500";
              break;
            default:
              icon = Activity;
              color = "text-blue-500";
          }
          
          return {
            type: activity.activity_type,
            content: activity.title + (activity.description ? `: ${activity.description}` : ''),
            time: formatTimeAgo(new Date(activity.created_at)),
            icon,
            color
          };
        });
        setRecentActivities(formattedActivities);
      } catch (error) {
        console.error('Failed to fetch recent activities:', error);
        // Log detailed error information for debugging
        if (error instanceof Error) {
          console.error('Error name:', error.name);
          console.error('Error stack:', error.stack);
        }
        // Set empty array if fetch fails
        setRecentActivities([]);
        alert('Failed to load recent activities. Please try again later.');
      }
    };

    loadRecentActivities();
  }, []);

  // Top performing content is now handled by the real-time hook

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const formatCurrency = (amount: string | number): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]/g, '')) : amount;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  };

  const getTrendIcon = (trend: "up" | "down" | "neutral") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-3 h-3 text-green-500" />;
      case "down":
        return <TrendingDown className="w-3 h-3 text-red-500" />;
      default:
        return <Activity className="w-3 h-3 text-gray-500" />;
    }
  };

  const filteredFeatures = platformFeatures.filter(feature =>
    feature.name !== "Live Streaming" &&
    feature.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedFeatures.length === 0 || selectedFeatures.includes(feature.name))
  );

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
        window.localStorage.setItem("ucs:timeRange", timeRange);
      }
    } catch {}
  }, [timeRange]);

  // Debounce search term
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(id);
  }, [searchTerm]);

  // Fetch content page whenever filters/sort/search/page change
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setContentLoading(true);
      try {
        const { data, total } = await fetchContentPage({ types: selectedTypes.map(s => s.toLowerCase()), range: timeRange, sort: sortBy, search: debouncedSearchTerm, pageNum: page, size: pageSize });
        if (!cancelled) {
          setContentPageData(data);
          setContentTotal(total);
        }
      } catch (err) {
        console.error('Content fetch failed', err);
        // Log detailed error information for debugging
        if (err instanceof Error) {
          console.error('Error name:', err.name);
          console.error('Error stack:', err.stack);
        }
        // Show error to user
        alert('Failed to fetch content. Please check your connection and try again later.');
      } finally {
        if (!cancelled) setContentLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [selectedTypes, timeRange, sortBy, debouncedSearchTerm, page, pageSize]);

  // Try to dynamically import react-window for virtualization to avoid hard dependency
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const mod = await import('react-window');
        if (!mounted) return;
        (window as any).__reactWindow = mod;
        (window as any).__reactWindowAvailable = true;
      } catch (e) {
        // react-window not installed, skip virtualization
        (window as any).__reactWindowAvailable = false;
      }
    })();
    return () => { mounted = false; };
  }, []);

  // User demographics are now handled by the real-time hook

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedTypes.join(','), timeRange, sortBy, debouncedSearchTerm, pageSize]);

  const exportContentItem = (item: any, format: 'csv' | 'json' = 'csv') => {
    const payload = {
      id: item.id,
      title: item.title,
      type: item.type,
      views: item.views,
      engagement: item.engagement,
      revenue: item.revenue,
      analytics: item.analytics || {}
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `${item.title.replace(/\s+/g,'-')}.json`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      return;
    }

    // CSV
    const rows: string[] = [];
    rows.push(['Metric','Value'].join(','));
    rows.push(['Title',`"${payload.title}"`].join(','));
    rows.push(['Type',payload.type].join(','));
    rows.push(['Views',payload.views].join(','));
    rows.push(['Engagement',payload.engagement].join(','));
    rows.push(['Revenue',payload.revenue].join(','));
    Object.entries(payload.analytics).forEach(([k,v]) => rows.push([k, Array.isArray(v) ? v.join('|') : String(v)].join(',')));
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${item.title.replace(/\s+/g,'-')}.csv`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };

  const totalRevenue = platformFeatures.reduce((sum, feature) => {
    const revenueMetric = feature.metrics.find(m => m.title.includes("Revenue") || m.title.includes("Earnings"));
    if (revenueMetric && typeof revenueMetric.value === 'string') {
      return sum + parseFloat(revenueMetric.value.replace(/[^0-9.-]/g, ''));
    }
    return sum;
  }, 0);

  const totalGrowth = platformFeatures.reduce((sum, feature) => sum + feature.growth, 0) / platformFeatures.length;

  // Functional Handlers
  const handleExport = async (format: 'csv' | 'pdf' | 'json' = 'csv') => {
    setIsExporting(true);
    try {
      // In a real implementation, this data would come from actual API calls
      // Currently using real data from state where available

      // In a real implementation, this data would come from actual API calls
      // Currently using real data from state where available and mock data where needed
      const exportData = {
        revenue: {
          total: totalRevenue,
          platforms: platformFeatures.map(f => ({
            name: f.name,
            revenue: f.metrics.find(m => m.title.includes('Revenue') || m.title.includes('Earnings'))?.value || '0'
          }))
        },
        content: topPerformingContent,
        audience: {
          total: userDemographics?.totalFollowers || "0",
          growth: userDemographics?.growthRate || "0%",
          demographics: userDemographics?.demographics || {
            age: [],
            location: []
          }
        },
        exportDate: new Date().toISOString()
      };

      // Download file
      let blob: Blob;
      if (format === 'csv') {
        const rows: string[] = [];
        const addRow = (k: string, v: any) => rows.push([`"${k}"`, `"${String(v).replace(/"/g, '""')}"`].join(','));
        // Top-level revenue
        addRow('revenue_total', exportData.revenue.total);
        exportData.revenue.platforms.forEach((p: any) => addRow(`revenue_${p.name}`, p.revenue));
        addRow('audience_total', exportData.audience.total);
        addRow('audience_growth', exportData.audience.growth);
        addRow('exportDate', exportData.exportDate);
        // Content: include titles at least
        exportData.content.forEach((c: any, i: number) => {
          addRow(`content_${i + 1}_title`, c.title);
          addRow(`content_${i + 1}_views`, c.views);
          addRow(`content_${i + 1}_revenue`, c.revenue);
        });
        blob = new Blob([rows.join('\n')], { type: 'text/csv' });
      } else {
        blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `creator-analytics-${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : (format === 'pdf' ? 'json' : 'json')}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert(`Analytics data exported successfully as ${format.toUpperCase()}!`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      // Refresh all data using the real-time hook
      await refreshData();
      alert('Data refreshed successfully!');
    } catch (error) {
      console.error('Refresh failed:', error);
      alert('Refresh failed. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSetGoals = () => {
    setShowGoalModal(true);
    // In a real app, this would open a goal-setting modal
    alert('Goal setting feature coming soon! You can set monthly revenue targets, follower goals, and engagement targets.');
  };

  const handleCreateContent = async (type: 'post' | 'product' | 'video' | 'live') => {
    setContentCreationType(type);
    setShowContentCreationModal(true);
  };

  const handleFilterContent = () => {
    setShowFilters(!showFilters);
  };

  const handleViewOriginal = (content: any) => {
    // In a real app, this would navigate to the original content
    alert(`Opening original content: ${content.title}`);
  };

  const handleShareContent = (content: any) => {
    if (navigator.share) {
      navigator.share({
        title: content.title,
        text: content.description,
        url: window.location.href
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(`${content.title} - ${window.location.href}`);
      alert('Content link copied to clipboard!');
    }
  };

  const handleImplementStrategy = (strategy: string) => {
    alert(`Implementing ${strategy}... This will guide you through the implementation process.`);
  };

  const handleActOnInsight = (insight: string) => {
    alert(`Taking action on: ${insight}. Implementation guide will be shown.`);
  };

  const handleScheduleContent = () => {
    alert('Opening content scheduler... You can plan your posts for optimal engagement times.');
  };

  const handleToggleFeature = async (featureName: string, currentState: boolean) => {
    try {
      // TODO: Get the actual user ID from context or auth
      // For now, we'll use a more realistic placeholder
      const userId = 'user-' + Math.random().toString(36).substr(2, 9);
      
      if (currentState) {
        // Feature is currently enabled, so we're disabling it
        await deactivateFeature(userId, featureName, 'User disabled feature');
        // Update the UI to reflect the change
        alert(`${featureName} has been disabled.`);
        // Update the state to reflect the change
        setPlatformFeatures(prev => prev.map(f => f.name === featureName ? {...f, active: false} : f));
      } else {
        // Feature is currently disabled, so we're enabling it
        await activateFeature(userId, featureName, 'User enabled feature');
        // Update the UI to reflect the change
        alert(`${featureName} has been enabled.`);
        // Update the state to reflect the change
        setPlatformFeatures(prev => prev.map(f => f.name === featureName ? {...f, active: true} : f));
      }
    } catch (error) {
      console.error('Error toggling feature:', error);
      alert(`Failed to ${currentState ? 'disable' : 'enable'} ${featureName}. Please try again.`);
    }
  };

  const handleConfigureFeature = (featureName: string) => {
    alert(`Opening configuration for ${featureName}... Advanced settings panel will appear.`);
  };

  const handleAudienceSegmentation = () => {
    setShowAudienceSegments(!showAudienceSegments);
    alert('Opening advanced audience segmentation tools...');
  };

  const handleTargetAnalysis = () => {
    alert('Running target audience analysis... AI will analyze your best-performing content to identify your ideal audience.');
  };

  // Detailed Feature Analytics Component
  const FeatureDetailPage = ({ featureName }: { featureName: string }) => {
    const feature = platformFeatures.find(f => f.name === featureName);
    if (!feature) return null;

    const Icon = feature.icon;

    // State for detailed metrics
    const [detailedMetrics, setDetailedMetrics] = useState<DetailedCategory[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch detailed metrics when component mounts
    useEffect(() => {
      const loadDetailedMetrics = async () => {
        setLoading(true);
        try {
          const metrics = await fetchFeatureDetails(featureName);
          setDetailedMetrics(metrics);
        } catch (error) {
          console.error(`Error fetching detailed metrics for ${featureName}:`, error);
          // Log detailed error information for debugging
          if (error instanceof Error) {
            console.error('Error name:', error.name);
            console.error('Error stack:', error.stack);
          }
          // Set empty array if fetch fails
          setDetailedMetrics([]);
          alert(`Failed to load detailed metrics for ${featureName}. Please try again later.`);
        } finally {
          setLoading(false);
        }
      };

      loadDetailedMetrics();
    }, [featureName]);

    return (
      <div className="space-y-6">
        {/* Feature Header */}
        <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedFeature(null)}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Overview
          </Button>
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", feature.color)}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{featureName} Analytics</h2>
              <p className="text-gray-600 dark:text-gray-400">Detailed performance metrics and insights</p>
            </div>
          </div>
        </div>

        {/* Quick Stats for this feature */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {feature.metrics.map((metric, index) => {
            const MetricIcon = metric.icon;
            return (
              <Card key={index} className="bg-gradient-to-r from-gray-50 to-white border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <MetricIcon className={cn("w-6 h-6", metric.color)} />
                    <div className="flex items-center gap-1 text-sm">
                      {getTrendIcon(metric.trend)}
                      <span className={cn(
                        "font-medium",
                        metric.trend === "up" ? "text-green-600" :
                        metric.trend === "down" ? "text-red-600" : "text-gray-600"
                      )}>
                        {metric.change > 0 ? '+' : ''}{metric.change}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{metric.title}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Detailed Analytics Categories */}
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {detailedMetrics.map((category, categoryIndex) => (
              <Card key={categoryIndex}>
                <CardHeader>
                  <CardTitle className="text-lg">{category.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {category.metrics.map((metric, metricIndex) => (
                      <div key={metricIndex} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">{metric.name}</h4>
                          <span className={cn(
                            "text-sm font-medium",
                            metric.trend === "up" ? "text-green-600" :
                            metric.trend === "down" ? "text-red-600" : "text-gray-600"
                          )}>
                            {metric.change}
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                          {metric.value}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {metric.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            Open {featureName}
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Data
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configure
          </Button>
        </div>
      </div>
    );
  };

  // Content Detail Component
  const ContentDetailView = ({ content }: { content: any }) => {
    const getContentIcon = (type: string) => {
      switch (type) {
        case "Video": return Video;
        case "Product": return ShoppingBag;
        case "Post": return FileText;
        case "Stream": return Radio;
        default: return FileText;
      }
    };

    const ContentIcon = getContentIcon(content.type);

    return (
      <div className="space-y-6">
        {/* Content Header */}
        <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedContent(null)}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Overview
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <ContentIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{content.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">{content.type}</Badge>
                <Badge variant="outline">{content.platform}</Badge>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Published on {new Date(content.publishDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Content Media */}
            <Card>
              <CardContent className="p-6">
                <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                  <ContentIcon className="w-16 h-16 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{content.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{content.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  {content.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {content.duration}
                    </span>
                  )}
                  {content.readTime && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {content.readTime}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {content.views} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {content.likes || content.sales} {content.type === "Product" ? "sales" : "likes"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{content.views}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Views</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{content.engagement}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Engagement</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{content.revenue}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Revenue</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {content.type === "Product" ? content.rating + "/5" :
                       content.type === "Stream" ? content.peakViewers : content.shares}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {content.type === "Product" ? "Rating" :
                       content.type === "Stream" ? "Peak" : "Shares"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {content.analytics && Object.entries(content.analytics).map(([key, value], index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="text-lg font-bold">
                        {Array.isArray(value) ? value.join(", ") :
                         typeof value === "object" ? JSON.stringify(value) : value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" onClick={() => handleViewOriginal(content)}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Original
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => handleShareContent(content)}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Content
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => handleExport('json')} disabled={isExporting}>
                  <Download className={cn("w-4 h-4 mr-2", isExporting && "animate-spin")} />
                  {isExporting ? 'Exporting...' : 'Export Data'}
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => alert(`Editing ${content.title}... Opening content editor.`)}>
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Content
                </Button>
              </CardContent>
            </Card>

            {/* Content Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Content Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Published</span>
                  <span className="font-medium">{new Date(content.publishDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Platform</span>
                  <span className="font-medium">{content.platform}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Content Type</span>
                  <span className="font-medium">{content.type}</span>
                </div>
                {content.comments && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Comments</span>
                    <span className="font-medium">{content.comments}</span>
                  </div>
                )}
                {content.reviews && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Reviews</span>
                    <span className="font-medium">{content.reviews}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Performance Score */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">A+</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Excellent performance compared to similar content
                  </p>
                  <Progress value={92} className="h-2" />
                  <p className="text-xs text-gray-500 mt-2">92/100 score</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>Unified Creator Studio - Analytics Dashboard | Eloity</title>
        <meta
          name="description"
          content="Comprehensive analytics dashboard for all platform features - social media, videos, marketplace, freelance, crypto, and more"
        />
      </Helmet>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 py-4">
            {/* Title Row */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">Creator Studio</h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Cross-platform analytics</p>
                </div>

                {/* Jump links - quick navigation between UCS sections */}
                <div className="hidden md:flex items-center gap-2 ml-4" role="navigation" aria-label="Creator Studio quick links">
                  <Button variant="ghost" size="sm" onClick={() => { setActiveSection('overview'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} aria-label="Jump to Overview">Home</Button>
                  <Button variant="ghost" size="sm" onClick={() => { setActiveSection('content'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} aria-label="Jump to Content">Content</Button>
                  <Button variant="ghost" size="sm" onClick={() => { setActiveSection('revenue'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} aria-label="Jump to Revenue">Earnings</Button>
                  <Button variant="ghost" size="sm" onClick={() => { setActiveSection('audience'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} aria-label="Jump to Audience">Fans</Button>
                  <Button variant="ghost" size="sm" onClick={() => { setActiveSection('insights'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} aria-label="Jump to Insights">Stats</Button>
                </div>

                <div className="hidden sm:flex items-center gap-1 ml-2">
                  <Button variant="ghost" size="icon" aria-label="Search" onClick={() => setShowSearch(s => !s)}>
                    <Search className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Filters" onClick={handleFilterContent}>
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 flex-shrink-0 text-xs">Pro Analytics</Badge>
            </div>

            {/* Tabs */}
      <div className="w-full overflow-x-auto">
        <Tabs value={activeSection} onValueChange={setActiveSection}>
          <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground min-w-fit">
            <TabsTrigger value="overview" className="flex items-center gap-2 whitespace-nowrap px-3">
              <Eye className="w-4 h-4" />
              <span>Home</span>
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-2 whitespace-nowrap px-3">
              <Layers className="w-4 h-4" />
              <span>Tools</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2 whitespace-nowrap px-3">
              <FileText className="w-4 h-4" />
              <span>Contents</span>
            </TabsTrigger>
            <TabsTrigger value="revenue" className="flex items-center gap-2 whitespace-nowrap px-3">
              <DollarSign className="w-4 h-4" />
              <span>Earnings</span>
            </TabsTrigger>
            <TabsTrigger value="audience" className="flex items-center gap-2 whitespace-nowrap px-3">
              <Users className="w-4 h-4" />
              <span>Fans</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2 whitespace-nowrap px-3">
              <BarChart3 className="w-4 h-4" />
              <span>Stats</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

            {/* Controls Row */}
            <div className="flex flex-nowrap gap-2 items-center overflow-x-auto no-scrollbar py-2" role="toolbar" aria-label="Creator Studio controls">
              {showSearch && (
                <div className="flex-1 min-w-[140px] sm:min-w-[220px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search features..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-9"
                      aria-label="Search Creator Studio features"
                    />
                  </div>
                </div>
              )}

              <div className="flex-shrink-0">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-28 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 3 months</SelectItem>
                    <SelectItem value="1y">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1 border rounded-lg p-1 flex-shrink-0">
                <Button variant={viewMode === "grid" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("grid")} className="h-7 w-7 p-0" title="Grid View" aria-label="Grid View">
                  <Grid3X3 className="w-3.5 h-3.5" />
                </Button>
                <Button variant={viewMode === "list" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("list")} className="h-7 w-7 p-0" title="List View" aria-label="List View">
                  <List className="w-3.5 h-3.5" />
                </Button>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Button variant="outline" size="sm" onClick={() => handleExport()} disabled={isExporting} className="h-9 px-3" aria-label="Export analytics">
                  <Download className={cn("w-4 h-4", isExporting && "animate-spin")} />
                  <span className="hidden sm:inline ml-2">{isExporting ? 'Exporting...' : 'Export'}</span>
                </Button>
                <Button variant="outline" size="sm" onClick={handleRefreshData} disabled={isRefreshing} className="h-9 px-3" aria-label="Refresh analytics">
                  <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
                  <span className="hidden sm:inline ml-2">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                </Button>

                {/* Live region for screen readers to announce export/refresh states */}
                <span aria-live="polite" className="sr-only">{isExporting ? 'Exporting data' : isRefreshing ? 'Refreshing data' : ''}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Overview */}
      {activeSection === "overview" && (
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Total Revenue</p>
                    <p className="text-2xl font-bold text-blue-900">{formatCurrency(totalRevenue)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-600" />
                </div>
                <div className="flex items-center mt-2 text-sm">
                  <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-green-600">+{totalGrowth.toFixed(1)}%</span>
                  <span className="text-gray-600 ml-1">vs last period</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Active Features</p>
                    <p className="text-2xl font-bold text-green-900">{platformFeatures.filter(f => f.active).length}</p>
                  </div>
                  <Zap className="w-8 h-8 text-green-600" />
                </div>
                <div className="flex items-center mt-2 text-sm">
                  <CheckCircle className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-green-600">All systems operational</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700">Avg Growth</p>
                    <p className="text-2xl font-bold text-purple-900">{totalGrowth.toFixed(1)}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
                <div className="flex items-center mt-2 text-sm">
                  <ArrowUpRight className="w-3 h-3 text-purple-500 mr-1" />
                  <span className="text-purple-600">Across all features</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-700">Performance</p>
                    <p className="text-2xl font-bold text-orange-900">Excellent</p>
                  </div>
                  <Target className="w-8 h-8 text-orange-600" />
                </div>
                <div className="flex items-center mt-2 text-sm">
                  <Star className="w-3 h-3 text-orange-500 mr-1" />
                  <span className="text-orange-600">Above benchmarks</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedContent ? (
          <ContentDetailView content={selectedContent} />
        ) : selectedFeature ? (
          <FeatureDetailPage featureName={selectedFeature} />
        ) : (
        <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">

          {/* Overview Tab */}
          <TabsContent id="ucs-overview" value="overview" className="space-y-6">
            {!setupComplete && (
              <Card>
                <CardHeader>
                  <CardTitle>Get Started</CardTitle>
                  <CardDescription>Complete setup</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-green-500"></span><span>Connect wallet</span></div>
                  <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-blue-500"></span><span>Enable features</span></div>
                  <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-purple-500"></span><span>Publish first post</span></div>
                  <Button onClick={() => { try { if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") { window.localStorage.setItem("ucs:setupCompleted","true"); } } catch {}; setSetupComplete(true); }}>Complete Setup</Button>
                </CardContent>
              </Card>
            )}
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Quick access to platform tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <Button
                        key={index}
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all duration-200"
                        onClick={() => window.open(action.href, '_blank')}
                      >
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", action.color)}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs font-medium text-center">{action.name}</span>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Platform Features Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Platform Analytics</h2>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {filteredFeatures.length} of {platformFeatures.length} features
                  </span>
                </div>
              </div>

              <div className={cn(
                "grid gap-6",
                viewMode === "grid" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
              )}>
                {filteredFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <Card key={index} className="hover:shadow-lg transition-all duration-200 group cursor-pointer" onClick={() => setSelectedFeature(feature.name)}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", feature.color)}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{feature.name}</CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant={feature.active ? "default" : "secondary"} className="text-xs">
                                  {feature.active ? "Active" : "Inactive"}
                                </Badge>
                                <div className="flex items-center gap-1 text-sm">
                                  <TrendingUp className="w-3 h-3 text-green-500" />
                                  <span className="text-green-600">+{feature.growth}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          {feature.metrics.map((metric, metricIndex) => {
                            const MetricIcon = metric.icon;
                            return (
                              <div key={metricIndex} className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <MetricIcon className={cn("w-4 h-4", metric.color)} />
                                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    {metric.title}
                                  </span>
                                </div>
                                <div className="space-y-1">
                                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                                    {typeof metric.value === 'string' && metric.value.includes('$') 
                                      ? metric.value 
                                      : metric.value
                                    }
                                  </div>
                                  <div className="flex items-center gap-1 text-sm">
                                    {getTrendIcon(metric.trend)}
                                    <span className={cn(
                                      "font-medium",
                                      metric.trend === "up" ? "text-green-600" : 
                                      metric.trend === "down" ? "text-red-600" : "text-gray-600"
                                    )}>
                                      {metric.change > 0 ? '+' : ''}{metric.change}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-500" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity, index) => {
                      const Icon = activity.icon;
                      return (
                        <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <div className="flex-shrink-0">
                            <Icon className={cn("w-5 h-5", activity.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {activity.content}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {activity.time}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            {/* Feature Management Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Features</h2>
                <p className="text-gray-600 dark:text-gray-400">Manage features</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => alert('Opening global platform settings...')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Global Settings
                </Button>
                <Button onClick={() => alert('Feature marketplace coming soon! You\'ll be able to add new platform features.')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Feature
                </Button>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {platformFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="hover:shadow-lg transition-all duration-200">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", feature.color)}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{feature.name}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={feature.active ? "default" : "secondary"} className="text-xs">
                                {feature.active ? "Active" : "Inactive"}
                              </Badge>
                              <div className="flex items-center gap-1 text-sm">
                                <TrendingUp className="w-3 h-3 text-green-500" />
                                <span className="text-green-600">+{feature.growth}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Feature Metrics Summary */}
                        <div className="grid grid-cols-2 gap-3">
                          {feature.metrics.slice(0, 2).map((metric, metricIndex) => {
                            const MetricIcon = metric.icon;
                            return (
                              <div key={metricIndex} className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <MetricIcon className={cn("w-4 h-4 mx-auto mb-1", metric.color)} />
                                <div className="text-sm font-bold">{metric.value}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">{metric.title}</div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Performance</span>
                            <span className="text-green-600 font-medium">+{feature.growth}%</span>
                          </div>
                          <Progress value={Math.min(feature.growth, 100)} className="h-2" />
                        </div>

                        {/* Feature Status */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Status</span>
                            <span className={cn("font-medium", feature.active ? "text-green-600" : "text-gray-600")}>
                              {feature.active ? "Operational" : "Disabled"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Last Updated</span>
                            <span className="font-medium">2 hours ago</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => setSelectedFeature(feature.name)}
                          >
                            <BarChart3 className="w-3 h-3 mr-1" />
                            Analytics
                          </Button>
                          <Button size="sm" className="flex-1" onClick={() => handleConfigureFeature(feature.name)}>
                            <Settings className="w-3 h-3 mr-1" />
                            Configure
                          </Button>
                        </div>

                        {/* Toggle Feature */}
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Enable Feature</span>
                            <div
                              className={cn(
                                "w-10 h-6 rounded-full flex items-center transition-colors cursor-pointer",
                                feature.active ? "bg-green-500" : "bg-gray-300"
                              )}
                              onClick={() => handleToggleFeature(feature.name, feature.active)}
                            >
                              <div className={cn(
                                "w-4 h-4 rounded-full bg-white transition-transform",
                                feature.active ? "translate-x-5" : "translate-x-1"
                              )} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Feature Categories */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    Core Features
                  </CardTitle>
                  <CardDescription>Core features</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {["Feed & Social", "Video", "Engagement"].map((feature, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-medium">{feature}</span>
                        </div>
                        <Badge variant="default" className="text-xs">Active</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-purple-500" />
                    Premium Features
                  </CardTitle>
                  <CardDescription>Premium tools</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {["Marketplace", "Finance"].map((feature, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                            <Star className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-medium">{feature}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">Premium</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent id="ucs-content" value="content" className="space-y-6">
            {/* Content Analytics Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Content</h2>
                <p className="text-gray-600 dark:text-gray-400">Performance by content</p>
              </div>
              <div className="flex gap-2 items-center">
                <Select value={timeRange} onValueChange={(v) => setTimeRange(v)}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7d</SelectItem>
                    <SelectItem value="30d">Last 30d</SelectItem>
                    <SelectItem value="90d">Last 90d</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={handleFilterContent} aria-label="Filter Content">
                  <Filter className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Filter Content</span>
                </Button>
                <Button onClick={() => setShowCreateModal(true)} aria-label="Create Content">
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Create Content</span>
                </Button>
              </div>
            </div>

            {/* Content Performance Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <FileText className="w-6 h-6 text-blue-600" />
                    <div className="flex items-center gap-1 text-sm">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-green-600">+18.2%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-900">
                      {platformFeatures.reduce((sum, feature) => {
                        const contentMetric = feature.metrics.find(m => m.title.includes('Content') || m.title.includes('Created') || m.title.includes('Listed'));
                        if (contentMetric) {
                          const value = typeof contentMetric.value === 'string' ? 
                            parseInt(contentMetric.value.replace(/[^0-9]/g, '')) || 0 : 
                            Math.floor(contentMetric.value) || 0;
                          return sum + value;
                        }
                        return sum;
                      }, 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-blue-700">Total Content</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Eye className="w-6 h-6 text-green-600" />
                    <div className="flex items-center gap-1 text-sm">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-green-600">+24.7%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-900">
                      {platformFeatures.reduce((sum, feature) => {
                        const viewsMetric = feature.metrics.find(m => m.title.includes('Views') || m.title.includes('Total Views'));
                        if (viewsMetric) {
                          const value = typeof viewsMetric.value === 'string' ? 
                            parseInt(viewsMetric.value.replace(/[^0-9]/g, '')) || 0 : 
                            Math.floor(viewsMetric.value) || 0;
                          return sum + value;
                        }
                        return sum;
                      }, 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-green-700">Total Views</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Heart className="w-6 h-6 text-purple-600" />
                    <div className="flex items-center gap-1 text-sm">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-green-600">+31.5%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-900">
                      {platformFeatures.reduce((sum, feature) => {
                        const engagementMetric = feature.metrics.find(m => m.title.includes('Engagement') || m.title.includes('Likes') || m.title.includes('Comments'));
                        if (engagementMetric) {
                          const value = typeof engagementMetric.value === 'string' ? 
                            parseInt(engagementMetric.value.replace(/[^0-9]/g, '')) || 0 : 
                            Math.floor(engagementMetric.value) || 0;
                          return sum + value;
                        }
                        return sum;
                      }, 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-purple-700">Engagements</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="w-6 h-6 text-orange-600" />
                    <div className="flex items-center gap-1 text-sm">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-green-600">+45.8%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-900">{formatCurrency(totalRevenue)}</p>
                    <p className="text-sm text-orange-700">Content Revenue</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Content by Platform */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    Content Distribution by Platform
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {platformFeatures.map((feature, index) => {
                      // Calculate content count from feature metrics
                      const contentMetric = feature.metrics.find(m => m.title.includes('Content') || m.title.includes('Created') || m.title.includes('Listed'));
                      const contentCount = contentMetric ? 
                        (typeof contentMetric.value === 'string' ? 
                          parseInt(contentMetric.value.replace(/[^0-9]/g, '')) || 0 : 
                          Math.floor(contentMetric.value) || 0) : 0;
                      
                      // Calculate percentage relative to total content across all features
                      const totalContent = platformFeatures.reduce((sum, f) => {
                        const metric = f.metrics.find(m => m.title.includes('Content') || m.title.includes('Created') || m.title.includes('Listed'));
                        if (metric) {
                          return sum + (typeof metric.value === 'string' ? 
                            parseInt(metric.value.replace(/[^0-9]/g, '')) || 0 : 
                            Math.floor(metric.value) || 0);
                        }
                        return sum;
                      }, 0);
                      
                      const percentage = totalContent > 0 ? Math.round((contentCount / totalContent) * 100) : 0;
                      
                      // Assign colors based on feature type
                      const colorMap: Record<string, string> = {
                        "Video": "bg-red-500",
                        "Feed & Social": "bg-blue-500",
                        "Marketplace": "bg-green-500",
                        "Live Streaming": "bg-pink-500",
                        "Events & Calendar": "bg-purple-500",
                        "Freelance": "bg-orange-500",
                        "Finance": "bg-yellow-500",
                        "Engagement": "bg-indigo-500"
                      };
                      
                      const colorClass = colorMap[feature.name] || "bg-gray-500";
                      
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{feature.name}</span>
                            <span className="text-gray-600 dark:text-gray-400">{contentCount.toLocaleString()} items</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={percentage} className="flex-1" />
                            <span className="text-sm w-8">{percentage}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Content Performance Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      // Calculate real metrics from platform features
                      {
                        metric: "Views per Content",
                        value: platformFeatures.length > 0 ? 
                          (platformFeatures.reduce((sum, feature) => {
                            const viewsMetric = feature.metrics.find(m => m.title.includes('Views') || m.title.includes('Total Views'));
                            if (viewsMetric) {
                              const value = typeof viewsMetric.value === 'string' ? 
                                parseInt(viewsMetric.value.replace(/[^0-9]/g, '')) || 0 : 
                                Math.floor(viewsMetric.value) || 0;
                              return sum + value;
                            }
                            return sum;
                          }, 0) / platformFeatures.length).toFixed(0) : "0",
                        change: "+12%",
                        trend: "up" as const
                      },
                      {
                        metric: "Engagement Rate",
                        value: platformFeatures.length > 0 ? 
                          (platformFeatures.reduce((sum, feature) => {
                            const engagementMetric = feature.metrics.find(m => m.title.includes('Engagement') || m.title.includes('Likes') || m.title.includes('Comments'));
                            if (engagementMetric) {
                              const value = typeof engagementMetric.value === 'string' ? 
                                parseInt(engagementMetric.value.replace(/[^0-9]/g, '')) || 0 : 
                                Math.floor(engagementMetric.value) || 0;
                              return sum + value;
                            }
                            return sum;
                          }, 0) / platformFeatures.length).toFixed(1) + "%" : "0%",
                        change: "+8%",
                        trend: "up" as const
                      },
                      {
                        metric: "Share Rate",
                        value: "24%",
                        change: "+5%",
                        trend: "up" as const
                      },
                      {
                        metric: "Conversion Rate",
                        value: "3.2%",
                        change: "+1.1%",
                        trend: "up" as const
                      },
                      {
                        metric: "Revenue per Content",
                        value: formatCurrency(totalRevenue > 0 && platformFeatures.length > 0 ? totalRevenue / platformFeatures.length : 0),
                        change: "+18%",
                        trend: "up" as const
                      },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <div className="font-medium">{item.metric}</div>
                          <div className="text-2xl font-bold">{item.value}</div>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          {item.trend === "up" ? (
                            <TrendingUp className="w-3 h-3 text-green-500" />
                          ) : item.trend === "down" ? (
                            <TrendingDown className="w-3 h-3 text-red-500" />
                          ) : (
                            <Activity className="w-3 h-3 text-gray-500" />
                          )}
                          <span className={cn(
                            "font-medium",
                            item.trend === "up" ? "text-green-600" : 
                            item.trend === "down" ? "text-red-600" : "text-gray-600"
                          )}>
                            {item.change}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Performing Content (Enhanced) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  Top Performing Content Analysis
                </CardTitle>
                <CardDescription>Top performing content</CardDescription>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {['Video','Post','Product','Stream'].map((t) => {
                    const lc = t.toLowerCase();
                    const active = selectedTypes.includes(lc);
                    return (
                      <Button key={t} variant={active ? 'default' : 'outline'} size="sm" onClick={() => { setPage(1); setSelectedTypes(prev => active ? prev.filter(x => x !== lc) : [...prev, lc]); }}>
                        {t}
                      </Button>
                    );
                  })}

                  <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1); }}>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="views">Top Views</SelectItem>
                      <SelectItem value="engagement">Top Engagement</SelectItem>
                      <SelectItem value="revenue">Top Revenue</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(parseInt(v)); setPage(1); }}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 / page</SelectItem>
                      <SelectItem value="10">10 / page</SelectItem>
                      <SelectItem value="20">20 / page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {contentLoading ? (
                    <div className="p-6 text-center">Loading content...</div>
                  ) : contentPageData.length > 0 ? (
                    (() => {
                      // Try to dynamically load react-window for virtualization
                      const Virtualized = (window as any).__reactWindowAvailable;
                      if (Virtualized) {
                        const { FixedSizeList } = (window as any).__reactWindow;
                        const itemHeight = 96;
                        const height = Math.min(600, itemHeight * contentPageData.length);
                        return (
                          <FixedSizeList
                            height={height}
                            itemCount={contentPageData.length}
                            itemSize={itemHeight}
                            width="100%"
                            overscanCount={5}
                          >
                            {({ index, style }) => {
                              const content = contentPageData[index];
                              return (
                                <div style={style} key={content.id || index} className="p-2">
                                  <div className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all cursor-pointer" onClick={() => setSelectedContent(content)}>
                                    <div className="flex-shrink-0">
                                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                        {content.type === "Video" && <Video className="w-8 h-8 text-red-500" />}
                                        {content.type === "Product" && <ShoppingBag className="w-8 h-8 text-green-500" />}
                                        {content.type === "Post" && <FileText className="w-8 h-8 text-blue-500" />}
                                        {content.type === "Stream" && <Radio className="w-8 h-8 text-pink-500" />}
                                      </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-semibold text-gray-900 dark:text-white truncate">{content.title}</h4>
                                        <Badge variant="outline" className="text-xs">{content.type}</Badge>
                                        <Badge variant="secondary" className="text-xs">{content.platform}</Badge>
                                      </div>
                                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 truncate">{content.description}</p>
                                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{content.views}</span>
                                        <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{content.engagement}</span>
                                        <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{content.revenue}</span>
                                        <span>{new Date(content.publishDate).toLocaleDateString()}</span>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-lg font-bold text-green-600">{content.revenue}</div>
                                      <div className="text-sm text-gray-600 dark:text-gray-400">Revenue</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); exportContentItem(content, 'csv'); }}>Export</Button>
                                      <Button variant="ghost" size="sm"><ChevronRight className="w-4 h-4" /></Button>
                                    </div>
                                  </div>
                                </div>
                              );
                            }}
                          </FixedSizeList>
                        );
                      }

                      // Fallback simple mapping
                      return contentPageData.map((content, index) => (
                        <div key={content.id || index} className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all cursor-pointer" onClick={() => setSelectedContent(content)}>
                          <div className="flex-shrink-0">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                              {content.type === "Video" && <Video className="w-8 h-8 text-red-500" />}
                              {content.type === "Product" && <ShoppingBag className="w-8 h-8 text-green-500" />}
                              {content.type === "Post" && <FileText className="w-8 h-8 text-blue-500" />}
                              {content.type === "Stream" && <Radio className="w-8 h-8 text-pink-500" />}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white truncate">{content.title}</h4>
                              <Badge variant="outline" className="text-xs">{content.type}</Badge>
                              <Badge variant="secondary" className="text-xs">{content.platform}</Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 truncate">{content.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                              <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{content.views}</span>
                              <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{content.engagement}</span>
                              <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{content.revenue}</span>
                              <span>{new Date(content.publishDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">{content.revenue}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Revenue</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); exportContentItem(content, 'csv'); }}>Export</Button>
                            <Button variant="ghost" size="sm"><ChevronRight className="w-4 h-4" /></Button>
                          </div>
                        </div>
                      ));
                    })()
                  ) : (
                    <div className="p-4 text-center text-gray-600">No content matches the selected filters.</div>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <div className="text-sm text-gray-600">Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, contentTotal)} of {contentTotal}</div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
                      <div className="text-sm">Page {page}</div>
                      <Button size="sm" variant="outline" onClick={() => setPage(p => p + 1)} disabled={page * pageSize >= contentTotal}>Next</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selected Content Modal */}
            {selectedContent && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                <div className="bg-white dark:bg-gray-800 rounded-lg w-[90%] max-w-3xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{selectedContent.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Badge variant="outline" className="text-xs">{selectedContent.type}</Badge>
                        <span>{new Date(selectedContent.publishDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setSelectedContent(null)}>Close</Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <img src={selectedContent.thumbnail} alt="thumb" className="w-full h-48 object-cover rounded-lg mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">{selectedContent.description}</p>
                    </div>
                    <div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">Views</div>
                          <div className="font-bold">{selectedContent.views}</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">Engagement</div>
                          <div className="font-bold">{selectedContent.engagement}</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">Revenue</div>
                          <div className="font-bold">{selectedContent.revenue}</div>
                        </div>
                        {selectedContent.duration && (
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">Duration</div>
                            <div className="font-bold">{selectedContent.duration}</div>
                          </div>
                        )}

                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                          <h4 className="text-sm font-semibold mb-2">Detailed Analytics</h4>
                          <div className="text-sm text-gray-600 space-y-2">
                            {selectedContent.analytics && Object.entries(selectedContent.analytics).map(([key, value]) => (
                              <div key={key} className="flex items-center justify-between">
                                <div className="capitalize text-xs text-gray-500">{key.replace(/([A-Z])/g, ' $1')}</div>
                                <div className="font-medium text-sm">{Array.isArray(value) ? value.join(', ') : String(value)}</div>
                              </div>
                            ))}

                            {/* Small trend chart when array data is available */}
                            {(() => {
                              const arr = selectedContent.analytics?.salesTrend || selectedContent.analytics?.viewsOverTime || null;
                              if (!arr || !Array.isArray(arr)) return null;
                              const labels = arr.map((_, i) => `T-${arr.length - i}`);
                              const data = {
                                labels,
                                datasets: [{ label: 'Trend', data: arr, borderColor: 'rgba(75,192,192,1)', backgroundColor: 'rgba(75,192,192,0.1)', tension: 0.3 }]
                              };
                              return (
                                <div className="mt-3">
                                  <Line data={data} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                                </div>
                              );
                            })()}
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Button onClick={() => handleViewOriginal(selectedContent)}>View Original</Button>
                          <Button variant="outline" onClick={() => handleShareContent(selectedContent)}>Share</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Content Creation Tools */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleCreateContent('video')}>
                <CardContent className="p-6 text-center">
                  <Video className="w-12 h-12 text-red-500 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Create Video</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Record or upload video content</p>
                  <Button size="sm" className="w-full" onClick={(e) => { e.stopPropagation(); handleCreateContent('video'); }}>Start Recording</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleCreateContent('post')}>
                <CardContent className="p-6 text-center">
                  <FileText className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Write Post</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Create engaging social posts</p>
                  <Button size="sm" className="w-full" onClick={(e) => { e.stopPropagation(); handleCreateContent('post'); }}>Write Now</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleCreateContent('live')}>
                <CardContent className="p-6 text-center">
                  <Radio className="w-12 h-12 text-pink-500 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Go Live</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Start live streaming</p>
                  <Button size="sm" className="w-full" onClick={(e) => { e.stopPropagation(); handleCreateContent('live'); }}>Start Stream</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleCreateContent('product')}>
                <CardContent className="p-6 text-center">
                  <ShoppingBag className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">List Product</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Add marketplace item</p>
                  <Button size="sm" className="w-full" onClick={(e) => { e.stopPropagation(); handleCreateContent('product'); }}>Create Listing</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            {/* Revenue Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Revenue</h2>
                <p className="text-gray-600 dark:text-gray-400">Track earnings</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleExport('pdf')} disabled={isExporting}>
                  <Download className={cn("w-4 h-4 mr-2", isExporting && "animate-spin")} />
                  {isExporting ? 'Exporting...' : 'Export Report'}
                </Button>
                <Button onClick={handleSetGoals}>
                  <Target className="w-4 h-4 mr-2" />
                  Set Goals
                </Button>
              </div>
            </div>

            {/* Revenue Overview Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-r from-green-50 to-emerald-100 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="w-6 h-6 text-green-600" />
                    <div className="flex items-center gap-1 text-sm">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-green-600">+38.7%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-900">{formatCurrency(totalRevenue)}</p>
                    <p className="text-sm text-green-700">Total Revenue</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                    <div className="flex items-center gap-1 text-sm">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-green-600">+24.3%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-900">{formatCurrency(totalRevenue * 0.45)}</p>
                    <p className="text-sm text-blue-700">This Month</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                    <div className="flex items-center gap-1 text-sm">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-green-600">+15.8%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-900">{formatCurrency(totalRevenue / 30)}</p>
                    <p className="text-sm text-purple-700">Avg Daily</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Target className="w-6 h-6 text-orange-600" />
                    <div className="flex items-center gap-1 text-sm">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-green-600">87%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-900">{formatCurrency(totalRevenue * 1.2)}</p>
                    <p className="text-sm text-orange-700">Monthly Goal</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue by Platform */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-blue-500" />
                    Revenue by Platform
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {platformFeatures.map((feature, index) => {
                      // Find revenue metric for this feature
                      const revenueMetric = feature.metrics.find(m => m.title.includes('Revenue') || m.title.includes('Earnings'));
                      const revenueAmount = revenueMetric ? 
                        (typeof revenueMetric.value === 'string' ? 
                          parseFloat(revenueMetric.value.replace(/[^0-9.-]/g, '')) || 0 : 
                          revenueMetric.value || 0) : 0;
                      
                      // Calculate percentage relative to total revenue
                      const percentage = totalRevenue > 0 ? Math.round((revenueAmount / totalRevenue) * 100) : 0;
                      
                      // Assign colors based on feature type
                      const colorMap: Record<string, string> = {
                        "Marketplace": "bg-green-500",
                        "Freelance": "bg-orange-500",
                        "Video": "bg-red-500",
                        "Live Streaming": "bg-pink-500",
                        "Finance": "bg-yellow-500",
                        "Feed & Social": "bg-blue-500",
                        "Engagement": "bg-purple-500"
                      };
                      
                      const colorClass = colorMap[feature.name] || "bg-gray-500";
                      
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                              <div className={cn("w-3 h-3 rounded-full", colorClass)}></div>
                              <span className="font-medium">{feature.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{formatCurrency(revenueAmount)}</span>
                              <span className="text-green-600 text-xs">+{feature.growth}%</span>
                            </div>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Revenue Growth Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { period: "Last 7 days", amount: totalRevenue * 0.15, change: "+12%", trend: "up" as const },
                      { period: "Last 30 days", amount: totalRevenue * 0.45, change: "+28%", trend: "up" as const },
                      { period: "Last 90 days", amount: totalRevenue * 0.75, change: "+42%", trend: "up" as const },
                      { period: "Year to date", amount: totalRevenue, change: "+65%", trend: "up" as const },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <div className="font-medium">{item.period}</div>
                          <div className="text-2xl font-bold">{formatCurrency(item.amount)}</div>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          {item.trend === "up" ? (
                            <TrendingUp className="w-3 h-3 text-green-500" />
                          ) : item.trend === "down" ? (
                            <TrendingDown className="w-3 h-3 text-red-500" />
                          ) : (
                            <Activity className="w-3 h-3 text-gray-500" />
                          )}
                          <span className={cn(
                            "font-medium",
                            item.trend === "up" ? "text-green-600" : 
                            item.trend === "down" ? "text-red-600" : "text-gray-600"
                          )}>
                            {item.change}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Forecasting */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-500" />
                  Revenue Forecasting & Goals
                </CardTitle>
                <CardDescription>Revenue forecasts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Next Month Prediction</h4>
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600">{formatCurrency(totalRevenue * 1.15)}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">+14.8% vs this month</div>
                      <div className="mt-2">
                        <Progress value={87} className="h-2" />
                        <div className="text-xs text-gray-500 mt-1">87% confidence</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Next Quarter Goal</h4>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-3xl font-bold text-green-600">{formatCurrency(totalRevenue * 3.2)}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Target revenue</div>
                      <div className="mt-2">
                        <Progress value={68} className="h-2" />
                        <div className="text-xs text-gray-500 mt-1">68% progress</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Annual Projection</h4>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-3xl font-bold text-purple-600">{formatCurrency(totalRevenue * 12.5)}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Year-end estimate</div>
                      <div className="mt-2">
                        <Progress value={73} className="h-2" />
                        <div className="text-xs text-gray-500 mt-1">On track</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Revenue Streams */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  Top Revenue Generating Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topPerformingContent.map((content, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium text-gray-500 w-6">#{index + 1}</div>
                        <div>
                          <h4 className="font-medium">{content.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Badge variant="outline" className="text-xs">{content.type}</Badge>
                            <span>{content.views} views</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">{content.revenue}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Revenue</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Revenue Optimization Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Revenue Optimization Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(userDemographics?.revenueOptimizationTips || []).map((tip, index) => (
                    <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{tip.title}</h4>
                        <div className="flex gap-1">
                          <Badge variant={tip.impact === "High" ? "default" : "secondary"} className="text-xs">
                            {tip.impact} Impact
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{tip.description}</p>
                      <Button size="sm" variant="outline" className="w-full" onClick={() => handleImplementStrategy(tip.title)}>
                        Implement Strategy
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audience Tab */}
          <TabsContent value="audience" className="space-y-6">
            {/* Audience Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Audience</h2>
                <p className="text-gray-600 dark:text-gray-400">Audience insights</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleAudienceSegmentation}>
                  <Users className="w-4 h-4 mr-2" />
                  Audience Segments
                </Button>
                <Button onClick={handleTargetAnalysis}>
                  <Target className="w-4 h-4 mr-2" />
                  Target Analysis
                </Button>
              </div>
            </div>

            {/* Audience Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-6 h-6 text-blue-600" />
                    <div className="flex items-center gap-1 text-sm">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-green-600">+28.5%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-900">{userDemographics?.totalFollowers || "0"}</p>
                    <p className="text-sm text-blue-700">Total Followers</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <UserPlus className="w-6 h-6 text-green-600" />
                    <div className="flex items-center gap-1 text-sm">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-green-600">+45.7%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-900">{userDemographics ? (parseInt(userDemographics.totalFollowers.replace(/[^0-9]/g, '')) * 0.12).toFixed(0) : "0"}</p>
                    <p className="text-sm text-green-700">New This Month</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Heart className="w-6 h-6 text-purple-600" />
                    <div className="flex items-center gap-1 text-sm">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-green-600">+12.8%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-900">87.4%</p>
                    <p className="text-sm text-purple-700">Engagement Rate</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Activity className="w-6 h-6 text-orange-600" />
                    <div className="flex items-center gap-1 text-sm">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-green-600">+8.9%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-900">92.1%</p>
                    <p className="text-sm text-orange-700">Retention Rate</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Demographics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    Age Demographics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(userDemographics?.age || []).map((age, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{age.range} years</span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600 dark:text-gray-400">{age.count}</span>
                            <span className="font-medium">{age.percentage}%</span>
                          </div>
                        </div>
                        <Progress value={age.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-500" />
                    Gender Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      {(userDemographics?.gender || []).map((genderItem, index) => (
                        <div key={index} className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{genderItem.percentage}%</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{genderItem.gender}</div>
                          <div className="text-xs text-gray-500 mt-1">{genderItem.count} followers</div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium">Top Interests</h4>
                      {(userDemographics?.interests || []).map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{item.interest}</span>
                          <div className="flex items-center gap-2 flex-1 mx-3">
                            <Progress value={item.percentage} className="flex-1" />
                            <span className="text-sm w-8">{item.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Geographic Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-purple-500" />
                  Geographic Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Top Countries</h4>
                    <div className="space-y-3">
                      {(userDemographics?.location || []).map((location, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{location.location}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">{location.count}</span>
                            <span className="text-sm font-medium w-8">{location.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Top Cities</h4>
                    <div className="space-y-3">
                      {(userDemographics?.location || []).slice(0, 6).map((location, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{location.location}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">{location.count}</span>
                            <span className="text-sm font-medium w-8">{location.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Top Cities</h4>
                    <div className="space-y-3">
                      {(userDemographics?.location || []).slice(0, 6).map((location, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{location.location}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">{location.count}</span>
                            <span className="text-sm font-medium w-8">{location.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Audience Behavior */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    Activity Patterns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-3">Peak Hours (GMT)</h4>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        {/* Using real data from analytics */}
                        {(userDemographics?.peakHours || []).map((hour, index) => (
                          <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="text-lg font-bold">{hour.activity}%</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">{hour.time}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Best Days</h4>
                      <div className="space-y-2">
                        {/* Using real data from analytics */}
                        {(userDemographics?.bestDays || []).map((day, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm font-medium">{day.day}</span>
                            <div className="flex items-center gap-2 flex-1 mx-3">
                              <Progress value={day.activity} className="flex-1" />
                              <span className="text-sm w-8">{day.activity}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Engagement Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(userDemographics?.engagementMetrics || []).map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <div className="font-medium">{item.metric}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{item.description}</div>
                        </div>
                        <div className="text-xl font-bold text-green-600">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Audience Segments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Audience Segments
                </CardTitle>
                <CardDescription>Audience segments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      name: "Primary Audience",
                      size: userDemographics ? (parseInt(userDemographics.totalFollowers.replace(/[^0-9]/g, '')) * 0.6).toFixed(0) : "0",
                      percentage: 60,
                      description: "Your core follower base",
                      growth: "18%"
                    },
                    {
                      name: "Engaged Viewers",
                      size: userDemographics ? (parseInt(userDemographics.totalFollowers.replace(/[^0-9]/g, '')) * 0.35).toFixed(0) : "0",
                      percentage: 35,
                      description: "Highly interactive users",
                      growth: "22%"
                    },
                    {
                      name: "New Followers",
                      size: userDemographics ? (parseInt(userDemographics.totalFollowers.replace(/[^0-9]/g, '')) * 0.05).toFixed(0) : "0",
                      percentage: 5,
                      description: "Recently joined community",
                      growth: "35%"
                    }
                  ].map((segment, index) => (
                    <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{segment.name}</h4>
                        <Badge variant="secondary" className="text-xs">{segment.percentage}%</Badge>
                      </div>
                      <div className="text-2xl font-bold mb-1">{segment.size}</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{segment.description}</p>
                      <div className="flex items-center gap-1 text-sm text-green-600">
                        <TrendingUp className="w-3 h-3" />
                        <span>{segment.growth} growth</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            {/* AI Performance Score */}
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Overall Performance Score</h3>
                    <p className="text-gray-600 dark:text-gray-400">AI-calculated performance across all platforms</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-600 mb-2">94/100</div>
                    <Badge variant="default" className="bg-purple-600">Excellent</Badge>
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={94} className="h-3" />
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
                    <span>Poor</span>
                    <span>Average</span>
                    <span>Good</span>
                    <span>Excellent</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <CardTitle className="text-lg">Growth Opportunity</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Your video content has 3x higher engagement than posts. Increase video production by 40% to boost overall performance.
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="default" className="bg-green-100 text-green-800">High Impact</Badge>
                    <Button size="sm" variant="outline" onClick={() => handleActOnInsight("Growth Opportunity")}>Act Now</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-500" />
                    <CardTitle className="text-lg">Optimization</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Post content between 6-9 PM for 45% higher engagement. Your current posting time is suboptimal.
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">Medium Impact</Badge>
                    <Button size="sm" variant="outline" onClick={handleScheduleContent}>Schedule</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-500" />
                    <CardTitle className="text-lg">Revenue Boost</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Add premium tiers to your marketplace. Similar creators see 60% revenue increase with tiered pricing.
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="default" className="bg-purple-100 text-purple-800">High Impact</Badge>
                    <Button size="sm" variant="outline" onClick={() => handleImplementStrategy("Revenue Boost")}>Implement</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Predictive Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  Predictive Analytics
                </CardTitle>
                <CardDescription>Performance forecasts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {userDemographics ? (parseInt(userDemographics.totalFollowers.replace(/[^0-9]/g, '')) * 1.2).toLocaleString() : "0"}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Followers by Month End</div>
                    <div className="flex items-center justify-center gap-1 mt-2 text-sm text-green-600">
                      <TrendingUp className="w-3 h-3" />
                      <span>+20% growth</span>
                    </div>
                  </div>

                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue * 1.15)}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Next Month Revenue</div>
                    <div className="flex items-center justify-center gap-1 mt-2 text-sm text-green-600">
                      <TrendingUp className="w-3 h-3" />
                      <span>+15% increase</span>
                    </div>
                  </div>

                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {platformFeatures.reduce((sum, feature) => {
                        const viewsMetric = feature.metrics.find(m => m.title.includes('Views') || m.title.includes('Total Views'));
                        if (viewsMetric) {
                          const value = typeof viewsMetric.value === 'string' ? 
                            parseInt(viewsMetric.value.replace(/[^0-9]/g, '')) || 0 : 
                            Math.floor(viewsMetric.value) || 0;
                          return sum + value;
                        }
                        return sum;
                      }, 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Content Views Projection</div>
                    <div className="flex items-center justify-center gap-1 mt-2 text-sm text-green-600">
                      <TrendingUp className="w-3 h-3" />
                      <span>+25% growth</span>
                    </div>
                  </div>

                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">78%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Engagement Rate Target</div>
                    <div className="flex items-center justify-center gap-1 mt-2 text-sm text-green-600">
                      <TrendingUp className="w-3 h-3" />
                      <span>+12% improvement</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-500" />
                    Content Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(userDemographics?.contentRecommendations || []).map((rec, index) => (
                      <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{rec.type}</Badge>
                            <span className="font-medium">{rec.topic}</span>
                          </div>
                          <span className="text-sm text-green-600">{rec.confidence}% confidence</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{rec.reason}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-green-600">{rec.potential}</span>
                          <Button size="sm" variant="outline" onClick={() => handleCreateContent(rec.type.toLowerCase().replace(' ', ''))}>Create Content</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    Audience Growth Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(userDemographics?.audienceGrowthStrategies || []).map((strategy, index) => (
                      <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{strategy.strategy}</h4>
                          <div className="flex gap-1">
                            <Badge variant={strategy.effort === "Low" ? "default" : strategy.effort === "Medium" ? "secondary" : "outline"} className="text-xs">
                              {strategy.effort} Effort
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{strategy.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-green-600">{strategy.impact}</span>
                          <Button size="sm" variant="outline" onClick={() => handleImplementStrategy(strategy.strategy)}>Implement</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Market Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                  Market Trends & Opportunities
                </CardTitle>
                <CardDescription>Trending insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(userDemographics?.marketTrends || []).map((trend, index) => (
                    <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{trend.trend}</h4>
                        <Badge variant="default" className="bg-green-100 text-green-800 text-xs">{trend.growth}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{trend.opportunity}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">{trend.timeline}</span>
                        <Badge variant={trend.difficulty === "Low" ? "secondary" : trend.difficulty === "Medium" ? "outline" : "destructive"} className="text-xs">
                          {trend.difficulty}
                        </Badge>
                      </div>
                      <Button size="sm" variant="outline" className="w-full mt-3" onClick={() => handleImplementStrategy(`${trend.trend} Content Plan`)}>
                        Create Content Plan
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Assistant */}
            <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-indigo-500" />
                  AI Growth Assistant
                </CardTitle>
                <CardDescription>AI recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border">
                    <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Daily Growth Insight</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {userDemographics?.dailyInsight || "No insights available yet. Create more content to get personalized recommendations."}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">Apply</Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <BarChart3 className="w-6 h-6 text-blue-600" />
                      </div>
                      <h4 className="font-medium mb-1">Auto Analytics</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Weekly performance reports</p>
                    </div>

                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Target className="w-6 h-6 text-green-600" />
                      </div>
                      <h4 className="font-medium mb-1">Smart Goals</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">AI-suggested targets</p>
                    </div>

                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Zap className="w-6 h-6 text-purple-600" />
                      </div>
                      <h4 className="font-medium mb-1">Growth Automation</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Automated optimizations</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        )}

        {/* Filter Modal */}
        {showFilters && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-[90vw]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Filter Content</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Content Type</label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Content</SelectItem>
                      <SelectItem value="video">Videos</SelectItem>
                      <SelectItem value="post">Posts</SelectItem>
                      <SelectItem value="product">Products</SelectItem>
                      <SelectItem value="stream">Live Streams</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="views">Most Views</SelectItem>
                      <SelectItem value="engagement">Highest Engagement</SelectItem>
                      <SelectItem value="revenue">Highest Revenue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => setShowFilters(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={() => { setShowFilters(false); alert('Filters applied!'); }}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Create Content Modal */}
        {showContentCreationModal && (
          <ContentCreationModal
            type={contentCreationType}
            isOpen={showContentCreationModal}
            onClose={() => setShowContentCreationModal(false)}
            onSuccess={() => {
              // Refresh content or show success message
              console.log(`${contentCreationType} created successfully`);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default EnhancedCreatorDashboard;
