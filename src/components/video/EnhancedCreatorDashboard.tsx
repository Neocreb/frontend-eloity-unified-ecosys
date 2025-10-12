// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
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
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

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

const EnhancedCreatorDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState(() => {
    try {
      if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
        return window.localStorage.getItem("ucs:timeRange") || "30d";
      }
    } catch {}
    return "30d";
  });
  const [activeSection, setActiveSection] = useState("overview");
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<any | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [showAudienceSegments, setShowAudienceSegments] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Advanced content filtering/pagination states
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]); // multi-select types
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [contentPageData, setContentPageData] = useState<any[]>([]);
  const [contentTotal, setContentTotal] = useState(0);
  const [contentLoading, setContentLoading] = useState(false);
  const cacheRef = React.useRef(new Map<string, { ts: number; data: any; total: number }>());
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // Helpers for parsing abbreviated numbers like 45.2K or $23.4K
  const parseAbbrev = (v: string | number) => {
    if (typeof v === 'number') return v;
    const s = String(v).trim();
    if (!s) return 0;
    const negative = s.startsWith('-');
    const cleaned = s.replace(/[^0-9.]/g, '');
    const num = parseFloat(cleaned) || 0;
    if (s.toLowerCase().endsWith('k')) return num * 1000 * (negative ? -1 : 1);
    if (s.toLowerCase().endsWith('m')) return num * 1000000 * (negative ? -1 : 1);
    return num * (negative ? -1 : 1);
  };

  // Fetch / compute paginated content (simulates server-side)
  const fetchContentPage = async ({ types, range, sort, search, pageNum, size }:
    { types: string[]; range: string; sort: string; search: string; pageNum: number; size: number }) => {
    const key = JSON.stringify({ types: types.slice().sort(), range, sort, search, pageNum, size });
    const cached = cacheRef.current.get(key);
    if (cached && Date.now() - cached.ts < 1000 * 60) {
      return { data: cached.data, total: cached.total };
    }

    // Simulate server work
    await new Promise(r => setTimeout(r, 300));
    const now = new Date();
    const rangeMap: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };

    const filtered = topPerformingContent.filter(item => {
      const typeMatch = types.length === 0 || types.includes(item.type.toLowerCase());
      const dateMatch = (() => {
        if (range === 'all') return true;
        const pd = new Date(item.publishDate);
        if (isNaN(pd.getTime())) return true;
        const diffDays = Math.floor((now.getTime() - pd.getTime()) / (1000 * 60 * 60 * 24));
        return typeof rangeMap[range] === 'number' ? diffDays <= rangeMap[range] : true;
      })();
      const searchMatch = !search || item.title.toLowerCase().includes(search.toLowerCase()) || (item.description || '').toLowerCase().includes(search.toLowerCase());
      return typeMatch && dateMatch && searchMatch;
    });

    // Sorting
    const sorted = filtered.slice().sort((a, b) => {
      switch (sort) {
        case 'views':
          return parseAbbrev(parseInt(String(b.views).replace(/[^0-9]/g,''), 10) || parseAbbrev(b.views)) - parseAbbrev(parseInt(String(a.views).replace(/[^0-9]/g,''), 10) || parseAbbrev(a.views));
        case 'engagement':
          return parseFloat(String(b.engagement).replace(/[^0-9.]/g,'')) - parseFloat(String(a.engagement).replace(/[^0-9.]/g,''));
        case 'revenue':
          return parseAbbrev(String(b.revenue).replace(/[^0-9.]/g,'')) - parseAbbrev(String(a.revenue).replace(/[^0-9.]/g,''));
        default:
          return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
      }
    });

    const total = sorted.length;
    const start = (pageNum - 1) * size;
    const data = sorted.slice(start, start + size);

    cacheRef.current.set(key, { ts: Date.now(), data, total });
    return { data, total };
  };
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

  // Mock data for comprehensive analytics
  const platformFeatures: FeatureAnalytics[] = [
    {
      name: "Feed & Social",
      icon: House,
      color: "bg-blue-500",
      growth: 23.5,
      active: true,
      metrics: [
        { title: "Total Posts", value: "1,247", change: 18.2, trend: "up", icon: FileText, color: "text-blue-600" },
        { title: "Engagement Rate", value: "8.4%", change: 12.3, trend: "up", icon: Heart, color: "text-pink-600" },
        { title: "Followers", value: "45.2K", change: 15.7, trend: "up", icon: Users, color: "text-green-600" },
        { title: "Reach", value: "892K", change: 28.1, trend: "up", icon: Eye, color: "text-purple-600" },
      ]
    },
    {
      name: "Video",
      icon: Video,
      color: "bg-red-500",
      growth: 31.8,
      active: true,
      metrics: [
        { title: "Videos Created", value: "156", change: 22.4, trend: "up", icon: Film, color: "text-red-600" },
        { title: "Total Views", value: "2.1M", change: 35.2, trend: "up", icon: Play, color: "text-blue-600" },
        { title: "Watch Time", value: "45.2h", change: 18.9, trend: "up", icon: Clock, color: "text-green-600" },
        { title: "Avg Duration", value: "3:24", change: 8.1, trend: "up", icon: Timer, color: "text-orange-600" },
      ]
    },
    {
      name: "Marketplace",
      icon: ShoppingBag,
      color: "bg-green-500",
      growth: 45.2,
      active: true,
      metrics: [
        { title: "Products Sold", value: "389", change: 52.1, trend: "up", icon: ShoppingBag, color: "text-green-600" },
        { title: "Revenue", value: "$12,450", change: 38.7, trend: "up", icon: DollarSign, color: "text-emerald-600" },
        { title: "Conversion Rate", value: "3.2%", change: 15.4, trend: "up", icon: Target, color: "text-blue-600" },
        { title: "Avg Order Value", value: "$32", change: 8.9, trend: "up", icon: CreditCard, color: "text-purple-600" },
      ]
    },
    {
      name: "Freelance",
      icon: Briefcase,
      color: "bg-orange-500",
      growth: 28.9,
      active: true,
      metrics: [
        { title: "Projects Completed", value: "47", change: 31.2, trend: "up", icon: CheckCircle, color: "text-green-600" },
        { title: "Client Rating", value: "4.9", change: 2.1, trend: "up", icon: Star, color: "text-yellow-600" },
        { title: "Earnings", value: "$8,920", change: 25.3, trend: "up", icon: Wallet, color: "text-green-600" },
        { title: "Response Time", value: "2.1h", change: -12.4, trend: "down", icon: Clock, color: "text-blue-600" },
      ]
    },
    {
      name: "Finance",
      icon: Coins,
      color: "bg-yellow-500",
      growth: 18.7,
      active: true,
      metrics: [
        { title: "Portfolio Value", value: "$24,567", change: 22.8, trend: "up", icon: TrendingUp, color: "text-green-600" },
        { title: "Trading Volume", value: "$156K", change: 45.1, trend: "up", icon: BarChart3, color: "text-blue-600" },
        { title: "Win Rate", value: "72%", change: 8.3, trend: "up", icon: Target, color: "text-emerald-600" },
        { title: "P&L Today", value: "+$342", change: 0, trend: "up", icon: HandCoins, color: "text-green-600" },
      ]
    },
    {
      name: "Engagement",
      icon: MessageSquare,
      color: "bg-purple-500",
      growth: 19.4,
      active: true,
      metrics: [
        { title: "Messages Sent", value: "2,341", change: 15.6, trend: "up", icon: MessageCircle, color: "text-blue-600" },
        { title: "Active Chats", value: "89", change: 12.8, trend: "up", icon: Users, color: "text-green-600" },
        { title: "Response Rate", value: "94%", change: 3.2, trend: "up", icon: CheckCircle, color: "text-emerald-600" },
        { title: "Avg Response", value: "5min", change: -8.1, trend: "down", icon: Timer, color: "text-orange-600" },
      ]
    },
    {
      name: "Live Streaming",
      icon: Radio,
      color: "bg-pink-500",
      growth: 67.3,
      active: false,
      metrics: [
        { title: "Live Sessions", value: "23", change: 83.2, trend: "up", icon: Radio, color: "text-pink-600" },
        { title: "Peak Viewers", value: "1,247", change: 45.7, trend: "up", icon: Eye, color: "text-blue-600" },
        { title: "Stream Time", value: "34.2h", change: 28.9, trend: "up", icon: Clock, color: "text-green-600" },
        { title: "Super Chats", value: "$445", change: 92.1, trend: "up", icon: Gift, color: "text-yellow-600" },
      ]
    },
    {
      name: "Events & Calendar",
      icon: Calendar,
      color: "bg-indigo-500",
      growth: 34.6,
      active: true,
      metrics: [
        { title: "Events Created", value: "12", change: 50.0, trend: "up", icon: CalendarIcon, color: "text-indigo-600" },
        { title: "Attendees", value: "2,134", change: 42.3, trend: "up", icon: Users, color: "text-blue-600" },
        { title: "Event Revenue", value: "$3,240", change: 67.8, trend: "up", icon: DollarSign, color: "text-green-600" },
        { title: "Avg Rating", value: "4.7", change: 8.7, trend: "up", icon: Star, color: "text-yellow-600" },
      ]
    },
  ];

  const quickActions = [
    { name: "Create Post", icon: Plus, color: "bg-blue-500", href: "/app/feed" },
    { name: "New Video", icon: Video, color: "bg-red-500", href: "/videos" },
    { name: "List Product", icon: ShoppingBag, color: "bg-green-500", href: "/marketplace" },
    { name: "Find Job", icon: Briefcase, color: "bg-orange-500", href: "/freelance" },
    { name: "Trade Crypto", icon: Coins, color: "bg-yellow-500", href: "/app/crypto" },
    { name: "Go Live", icon: Radio, color: "bg-pink-500", href: "/app/live-streaming" },
    { name: "Create Event", icon: Calendar, color: "bg-indigo-500", href: "/events" },
    { name: "Start Chat", icon: MessageSquare, color: "bg-purple-500", href: "/chat" },
  ];

  const recentActivities = [
    { type: "video", content: "Your video 'How to Trade Crypto' reached 10K views", time: "2 hours ago", icon: Video, color: "text-red-500" },
    { type: "marketplace", content: "Product 'Digital Art Collection' sold for $89", time: "4 hours ago", icon: ShoppingBag, color: "text-green-500" },
    { type: "freelance", content: "New project proposal received from TechCorp", time: "6 hours ago", icon: Briefcase, color: "text-orange-500" },
    { type: "social", content: "Your post received 500+ likes and 50 comments", time: "8 hours ago", icon: Heart, color: "text-pink-500" },
    { type: "crypto", content: "Portfolio gained $234 from BTC trade", time: "12 hours ago", icon: TrendingUp, color: "text-green-500" },
  ];

  const topPerformingContent = [
    {
      id: 1,
      title: "Crypto Trading Tutorial",
      type: "Video",
      views: "45.2K",
      engagement: "12.4%",
      revenue: "$234",
      description: "Complete beginner's guide to cryptocurrency trading with practical examples",
      duration: "15:32",
      likes: "3.2K",
      comments: "567",
      shares: "234",
      publishDate: "2024-01-15",
      platform: "Video",
      thumbnail: "/api/placeholder/300/200",
      analytics: {
        watchTime: "92%",
        clickThrough: "8.5%",
        retention: "78%",
        topCountries: ["US", "UK", "Canada"],
        ageGroups: { "18-24": 35, "25-34": 40, "35-44": 20, "45+": 5 },
        trafficSources: { "Search": 45, "Direct": 30, "Social": 25 }
      }
    },
    {
      id: 2,
      title: "Digital Art Masterpiece",
      type: "Product",
      views: "23.1K",
      engagement: "8.7%",
      revenue: "$450",
      description: "Exclusive NFT collection featuring abstract digital artwork",
      price: "$45",
      sales: 10,
      rating: 4.9,
      reviews: 23,
      publishDate: "2024-01-10",
      platform: "Marketplace",
      thumbnail: "/api/placeholder/300/200",
      analytics: {
        conversionRate: "3.2%",
        cartAdds: "156",
        wishlistAdds: "89",
        topBuyers: ["Premium Users", "Art Collectors"],
        salesTrend: [5, 8, 12, 10, 15, 18, 10],
        refundRate: "2%"
      }
    },
    {
      id: 3,
      title: "Web Development Guide",
      type: "Post",
      views: "18.9K",
      engagement: "15.2%",
      revenue: "$89",
      description: "Step-by-step tutorial for building responsive websites with modern frameworks",
      readTime: "8 min",
      likes: "2.8K",
      comments: "412",
      shares: "189",
      publishDate: "2024-01-12",
      platform: "Feed & Social",
      thumbnail: "/api/placeholder/300/200",
      analytics: {
        avgReadTime: "6:32",
        bounceRate: "25%",
        shares: "189",
        saves: "456",
        demographics: { "Male": 65, "Female": 35 },
        topReferrers: ["Google", "Twitter", "LinkedIn"]
      }
    },
    {
      id: 4,
      title: "Live Q&A Session",
      type: "Stream",
      views: "12.7K",
      engagement: "23.1%",
      revenue: "$156",
      description: "Interactive live session answering community questions about freelancing",
      duration: "2:45:00",
      peakViewers: "1,247",
      totalMessages: "8,934",
      superChats: "$156",
      publishDate: "2024-01-18",
      platform: "Live Streaming",
      thumbnail: "/api/placeholder/300/200",
      analytics: {
        avgViewDuration: "45 min",
        chatEngagement: "78%",
        donations: "$89",
        newFollowers: "234",
        repeatViewers: "45%",
        peakTime: "8:30 PM"
      }
    },
  ];

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
      } finally {
        if (!cancelled) setContentLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [selectedTypes, timeRange, sortBy, debouncedSearchTerm, page, pageSize]);

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
      // Simulate export API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate mock data for export
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
          total: "45.2K",
          growth: "+28.5%",
          demographics: {
            age: { "18-24": 35, "25-34": 40, "35-44": 20, "45+": 5 },
            location: { "US": 42, "UK": 18, "CA": 12, "AU": 8, "Other": 20 }
          }
        },
        exportDate: new Date().toISOString()
      };

      // Download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `creator-analytics-${new Date().toISOString().split('T')[0]}.${format}`;
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
      // Simulate API refresh
      await new Promise(resolve => setTimeout(resolve, 1500));
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

  const handleCreateContent = (type: string) => {
    const routes = {
      'video': '/app/videos',
      'post': '/app/feed',
      'live': '/app/live',
      'product': '/app/marketplace/list',
      'stream': '/app/live',
      'article': '/app/blog'
    };

    const route = routes[type as keyof typeof routes];
    if (route) {
      window.open(route, '_blank');
    } else {
      alert(`Creating ${type} content... Redirecting to creation tool.`);
    }
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

  const handleToggleFeature = (featureName: string, currentState: boolean) => {
    alert(`${currentState ? 'Disabling' : 'Enabling'} ${featureName}... Feature state will be updated.`);
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

    // Generate additional detailed metrics for the subpage
    const detailedMetrics = {
      "Feed & Social": [
        { category: "Content Performance", metrics: [
          { name: "Total Posts", value: "1,247", change: "+18.2%", trend: "up", description: "Posts published this period" },
          { name: "Viral Posts", value: "23", change: "+45.7%", trend: "up", description: "Posts with >10K engagement" },
          { name: "Average Likes", value: "892", change: "+12.3%", trend: "up", description: "Per post engagement" },
          { name: "Comment Rate", value: "4.2%", change: "+8.9%", trend: "up", description: "Comments per view" },
        ]},
        { category: "Audience Growth", metrics: [
          { name: "New Followers", value: "2,341", change: "+25.4%", trend: "up", description: "This month" },
          { name: "Follower Growth Rate", value: "15.7%", change: "+3.2%", trend: "up", description: "Monthly growth" },
          { name: "Audience Retention", value: "87.3%", change: "+2.1%", trend: "up", description: "Active followers" },
          { name: "Demographics Score", value: "92/100", change: "+5.0%", trend: "up", description: "Target audience match" },
        ]},
        { category: "Engagement Analytics", metrics: [
          { name: "Engagement Rate", value: "8.4%", change: "+12.3%", trend: "up", description: "Overall engagement" },
          { name: "Share Rate", value: "2.1%", change: "+18.7%", trend: "up", description: "Shares per post" },
          { name: "Save Rate", value: "3.8%", change: "+22.1%", trend: "up", description: "Saves per post" },
          { name: "Story Views", value: "45.2K", change: "+31.4%", trend: "up", description: "Story impressions" },
        ]},
      ],
      "Video": [
        { category: "Video Performance", metrics: [
          { name: "Total Videos", value: "156", change: "+22.4%", trend: "up", description: "Videos created" },
          { name: "Total Views", value: "2.1M", change: "+35.2%", trend: "up", description: "All-time views" },
          { name: "Avg View Duration", value: "3:24", change: "+8.1%", trend: "up", description: "Average watch time" },
          { name: "Completion Rate", value: "68.7%", change: "+12.5%", trend: "up", description: "Videos watched to end" },
        ]},
        { category: "Monetization", metrics: [
          { name: "Ad Revenue", value: "$2,340", change: "+45.8%", trend: "up", description: "From video ads" },
          { name: "Sponsorship Deals", value: "12", change: "+200%", trend: "up", description: "Brand partnerships" },
          { name: "Tips Received", value: "$567", change: "+78.9%", trend: "up", description: "Viewer tips" },
          { name: "RPM", value: "$1.12", change: "+23.4%", trend: "up", description: "Revenue per mile" },
        ]},
        { category: "Audience Insights", metrics: [
          { name: "Subscribers", value: "89.2K", change: "+28.7%", trend: "up", description: "Video subscribers" },
          { name: "Notification Rate", value: "23.4%", change: "+5.6%", trend: "up", description: "Bell icon clicks" },
          { name: "Repeat Viewers", value: "45.8%", change: "+18.2%", trend: "up", description: "Return audience" },
          { name: "Peak Concurrent", value: "1,847", change: "+67.3%", trend: "up", description: "Live stream peak" },
        ]},
      ],
      "Marketplace": [
        { category: "Sales Performance", metrics: [
          { name: "Products Sold", value: "389", change: "+52.1%", trend: "up", description: "Units sold this period" },
          { name: "Total Revenue", value: "$12,450", change: "+38.7%", trend: "up", description: "Gross sales revenue" },
          { name: "Conversion Rate", value: "3.2%", change: "+15.4%", trend: "up", description: "Visitors to buyers" },
          { name: "Avg Order Value", value: "$32", change: "+8.9%", trend: "up", description: "Per transaction" },
        ]},
        { category: "Product Analytics", metrics: [
          { name: "Active Listings", value: "47", change: "+12.8%", trend: "up", description: "Live products" },
          { name: "Product Views", value: "45.2K", change: "+28.4%", trend: "up", description: "Product page visits" },
          { name: "Wishlist Adds", value: "1,234", change: "+67.8%", trend: "up", description: "Items saved" },
          { name: "Cart Abandonment", value: "23.4%", change: "-8.9%", trend: "down", description: "Checkout dropoff" },
        ]},
        { category: "Customer Metrics", metrics: [
          { name: "New Customers", value: "156", change: "+34.5%", trend: "up", description: "First-time buyers" },
          { name: "Repeat Customers", value: "89", change: "+45.2%", trend: "up", description: "Return buyers" },
          { name: "Customer Rating", value: "4.8/5", change: "+2.1%", trend: "up", description: "Average rating" },
          { name: "Return Rate", value: "2.1%", change: "-12.3%", trend: "down", description: "Product returns" },
        ]},
      ],
      "Freelance": [
        { category: "Project Performance", metrics: [
          { name: "Projects Completed", value: "47", change: "+31.2%", trend: "up", description: "Finished projects" },
          { name: "Active Projects", value: "8", change: "+60.0%", trend: "up", description: "In progress" },
          { name: "Project Success Rate", value: "95.7%", change: "+3.2%", trend: "up", description: "Successful completion" },
          { name: "Avg Project Value", value: "$890", change: "+25.3%", trend: "up", description: "Per project earning" },
        ]},
        { category: "Client Relations", metrics: [
          { name: "Client Rating", value: "4.9/5", change: "+2.1%", trend: "up", description: "Average client rating" },
          { name: "Repeat Clients", value: "67%", change: "+15.4%", trend: "up", description: "Return customers" },
          { name: "Response Time", value: "2.1h", change: "-12.4%", trend: "down", description: "Avg response time" },
          { name: "Communication Score", value: "98/100", change: "+5.2%", trend: "up", description: "Client feedback" },
        ]},
        { category: "Skills & Growth", metrics: [
          { name: "Skill Endorsements", value: "234", change: "+45.8%", trend: "up", description: "LinkedIn endorsements" },
          { name: "Portfolio Views", value: "2,340", change: "+67.2%", trend: "up", description: "Profile visits" },
          { name: "Proposal Win Rate", value: "23.4%", change: "+8.9%", trend: "up", description: "Proposals accepted" },
          { name: "Hourly Rate", value: "$45", change: "+12.5%", trend: "up", description: "Current rate" },
        ]},
      ],
      "Finance": [
        { category: "Portfolio Performance", metrics: [
          { name: "Portfolio Value", value: "$24,567", change: "+22.8%", trend: "up", description: "Total portfolio worth" },
          { name: "Total P&L", value: "+$3,456", change: "+145%", trend: "up", description: "Profit/Loss this period" },
          { name: "Best Performing", value: "ETH +45%", change: "+45.2%", trend: "up", description: "Top asset gain" },
          { name: "Portfolio Diversity", value: "12 assets", change: "+20.0%", trend: "up", description: "Different cryptocurrencies" },
        ]},
        { category: "Trading Analytics", metrics: [
          { name: "Total Trades", value: "234", change: "+56.7%", trend: "up", description: "Executed trades" },
          { name: "Win Rate", value: "72%", change: "+8.3%", trend: "up", description: "Profitable trades" },
          { name: "Avg Profit", value: "$156", change: "+23.4%", trend: "up", description: "Per winning trade" },
          { name: "Trading Volume", value: "$156K", change: "+45.1%", trend: "up", description: "Total volume traded" },
        ]},
        { category: "Risk Management", metrics: [
          { name: "Risk Score", value: "Medium", change: "Stable", trend: "neutral", description: "Portfolio risk level" },
          { name: "Stop Loss Hit", value: "15%", change: "-5.2%", trend: "down", description: "Stop losses triggered" },
          { name: "Max Drawdown", value: "8.4%", change: "-12.1%", trend: "down", description: "Largest portfolio drop" },
          { name: "Sharpe Ratio", value: "1.89", change: "+15.6%", trend: "up", description: "Risk-adjusted return" },
        ]},
      ],
      "Engagement": [
        { category: "Communication Stats", metrics: [
          { name: "Messages Sent", value: "2,341", change: "+15.6%", trend: "up", description: "Total messages sent" },
          { name: "Messages Received", value: "3,456", change: "+23.4%", trend: "up", description: "Incoming messages" },
          { name: "Active Chats", value: "89", change: "+12.8%", trend: "up", description: "Ongoing conversations" },
          { name: "Group Chats", value: "23", change: "+35.7%", trend: "up", description: "Group conversations" },
        ]},
        { category: "Response Metrics", metrics: [
          { name: "Response Rate", value: "94%", change: "+3.2%", trend: "up", description: "Messages responded to" },
          { name: "Avg Response Time", value: "5min", change: "-8.1%", trend: "down", description: "Time to respond" },
          { name: "Peak Hours", value: "2-6 PM", change: "Stable", trend: "neutral", description: "Most active time" },
          { name: "Read Rate", value: "98.7%", change: "+1.4%", trend: "up", description: "Messages read" },
        ]},
        { category: "Engagement Quality", metrics: [
          { name: "Video Calls", value: "67", change: "+89.3%", trend: "up", description: "Video calls made" },
          { name: "Voice Messages", value: "234", change: "+45.2%", trend: "up", description: "Voice notes sent" },
          { name: "Media Shared", value: "456", change: "+67.8%", trend: "up", description: "Photos/videos shared" },
          { name: "Reaction Rate", value: "78%", change: "+12.5%", trend: "up", description: "Messages with reactions" },
        ]},
      ],
      "Live Streaming": [
        { category: "Stream Performance", metrics: [
          { name: "Live Sessions", value: "23", change: "+83.2%", trend: "up", description: "Streams this period" },
          { name: "Total Stream Time", value: "34.2h", change: "+28.9%", trend: "up", description: "Hours streamed" },
          { name: "Peak Viewers", value: "1,247", change: "+45.7%", trend: "up", description: "Highest concurrent viewers" },
          { name: "Avg Stream Duration", value: "1.5h", change: "+12.3%", trend: "up", description: "Average stream length" },
        ]},
        { category: "Monetization", metrics: [
          { name: "Super Chats", value: "$445", change: "+92.1%", trend: "up", description: "Paid chat messages" },
          { name: "Donations", value: "$234", change: "+156%", trend: "up", description: "Direct donations" },
          { name: "Subscriber Revenue", value: "$567", change: "+78.4%", trend: "up", description: "From subscriptions" },
          { name: "Sponsorship Revenue", value: "$890", change: "+234%", trend: "up", description: "Brand partnerships" },
        ]},
        { category: "Audience Engagement", metrics: [
          { name: "Chat Messages", value: "12.3K", change: "+67.8%", trend: "up", description: "Chat interactions" },
          { name: "New Followers", value: "567", change: "+89.2%", trend: "up", description: "From live streams" },
          { name: "Stream Saves", value: "89", change: "+45.6%", trend: "up", description: "Streams saved by viewers" },
          { name: "Clip Creation", value: "34", change: "+123%", trend: "up", description: "Viewer-created clips" },
        ]},
      ],
      "Events & Calendar": [
        { category: "Event Performance", metrics: [
          { name: "Events Created", value: "12", change: "+50.0%", trend: "up", description: "Events organized" },
          { name: "Total Attendees", value: "2,134", change: "+42.3%", trend: "up", description: "Across all events" },
          { name: "Avg Attendance Rate", value: "78.5%", change: "+12.4%", trend: "up", description: "RSVP vs actual" },
          { name: "Event Completion", value: "91.7%", change: "+8.3%", trend: "up", description: "Successfully completed" },
        ]},
        { category: "Revenue & Monetization", metrics: [
          { name: "Event Revenue", value: "$3,240", change: "+67.8%", trend: "up", description: "Ticket sales" },
          { name: "Avg Ticket Price", value: "$27", change: "+12.5%", trend: "up", description: "Per ticket" },
          { name: "Premium Tickets", value: "234", change: "+89.7%", trend: "up", description: "VIP/Premium sales" },
          { name: "Merchandise Sales", value: "$567", change: "+123%", trend: "up", description: "Event merchandise" },
        ]},
        { category: "Engagement & Feedback", metrics: [
          { name: "Event Rating", value: "4.7/5", change: "+8.7%", trend: "up", description: "Average rating" },
          { name: "Repeat Attendees", value: "45%", change: "+23.4%", trend: "up", description: "Return participants" },
          { name: "Social Shares", value: "567", change: "+78.9%", trend: "up", description: "Event shares" },
          { name: "Follow-up Engagement", value: "67%", change: "+34.2%", trend: "up", description: "Post-event interaction" },
        ]},
      ],
    };

    const currentDetailedMetrics = detailedMetrics[featureName as keyof typeof detailedMetrics] || [];

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
        <div className="space-y-6">
          {currentDetailedMetrics.map((category, categoryIndex) => (
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
        <title>Unified Creator Studio - Analytics Dashboard | SoftChat</title>
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
            <div className="flex flex-wrap items-center gap-3">
              {showSearch && (
                <div className="flex-1 min-w-[200px] sm:min-w-[280px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search features..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-9"
                    />
                  </div>
                </div>
              )}

              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 3 months</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1 border rounded-lg p-1">
                <Button variant={viewMode === "grid" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("grid")} className="h-7 w-7 p-0" title="Grid View">
                  <Grid3X3 className="w-3.5 h-3.5" />
                </Button>
                <Button variant={viewMode === "list" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("list")} className="h-7 w-7 p-0" title="List View">
                  <List className="w-3.5 h-3.5" />
                </Button>
              </div>

              <Button variant="outline" size="sm" onClick={() => handleExport()} disabled={isExporting} className="h-9 px-3">
                <Download className={cn("w-4 h-4", isExporting && "animate-spin")} />
                <span className="hidden sm:inline ml-2">{isExporting ? 'Exporting...' : 'Export'}</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleRefreshData} disabled={isRefreshing} className="h-9 px-3">
                <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
                <span className="hidden sm:inline ml-2">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </Button>
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
          <TabsContent value="overview" className="space-y-6">
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
          <TabsContent value="content" className="space-y-6">
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
                <Button variant="outline" onClick={handleFilterContent}>
                  <Filter className="w-4 h-4 mr-2" />
                  Filter Content
                </Button>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Content
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
                    <p className="text-2xl font-bold text-blue-900">1,423</p>
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
                    <p className="text-2xl font-bold text-green-900">8.4M</p>
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
                    <p className="text-2xl font-bold text-purple-900">892K</p>
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
                    <p className="text-2xl font-bold text-orange-900">$23.4K</p>
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
                    {[
                      { platform: "Video", count: 456, percentage: 32, color: "bg-red-500" },
                      { platform: "Social Posts", count: 387, percentage: 27, color: "bg-blue-500" },
                      { platform: "Marketplace Products", count: 234, percentage: 16, color: "bg-green-500" },
                      { platform: "Live Streams", count: 189, percentage: 13, color: "bg-pink-500" },
                      { platform: "Blog Articles", count: 157, percentage: 12, color: "bg-purple-500" },
                    ].map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{item.platform}</span>
                          <span className="text-gray-600 dark:text-gray-400">{item.count} items</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={item.percentage} className="flex-1" />
                          <span className="text-sm w-8">{item.percentage}%</span>
                        </div>
                      </div>
                    ))}
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
                      { metric: "Views per Content", value: "5.9K", change: "+28.3%", trend: "up" },
                      { metric: "Engagement Rate", value: "12.4%", change: "+15.7%", trend: "up" },
                      { metric: "Share Rate", value: "3.2%", change: "+45.1%", trend: "up" },
                      { metric: "Conversion Rate", value: "2.8%", change: "+22.9%", trend: "up" },
                      { metric: "Revenue per Content", value: "$16.45", change: "+67.2%", trend: "up" },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <div className="font-medium">{item.metric}</div>
                          <div className="text-2xl font-bold">{item.value}</div>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <TrendingUp className="w-3 h-3 text-green-500" />
                          <span className="text-green-600 font-medium">{item.change}</span>
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
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(() => {
                    const now = new Date();
                    const withinRange = (publishDateStr: string) => {
                      if (timeRange === 'all') return true;
                      const pd = new Date(publishDateStr);
                      if (isNaN(pd.getTime())) return true;
                      const diffDays = Math.floor((now.getTime() - pd.getTime()) / (1000 * 60 * 60 * 24));
                      const rangeMap: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 };
                      return typeof rangeMap[timeRange] === 'number' ? diffDays <= rangeMap[timeRange] : true;
                    };

                    const normalizedFilter = filterType ? filterType.toLowerCase() : 'all';
                    const filtered = topPerformingContent.filter(item => {
                      const typeMatch = normalizedFilter === 'all' || item.type.toLowerCase() === normalizedFilter;
                      const dateMatch = withinRange(item.publishDate);
                      return typeMatch && dateMatch;
                    });

                    return filtered.length > 0 ? filtered.map((content, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all cursor-pointer"
                        onClick={() => setSelectedContent(content)}
                      >
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
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {content.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {content.engagement}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              {content.revenue}
                            </span>
                            <span>{new Date(content.publishDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">{content.revenue}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Revenue</div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    )) : (
                      <div className="p-4 text-center text-gray-600">No content matches the selected filters.</div>
                    );
                  })()}
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
                    <p className="text-2xl font-bold text-blue-900">$8,234</p>
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
                    <p className="text-2xl font-bold text-purple-900">$267</p>
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
                    <p className="text-2xl font-bold text-orange-900">$12K</p>
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
                    {[
                      { platform: "Marketplace", amount: 12450, percentage: 45, color: "bg-green-500", growth: "+52.1%" },
                      { platform: "Freelance", amount: 8920, percentage: 32, color: "bg-orange-500", growth: "+31.2%" },
                      { platform: "Video Content", amount: 3240, percentage: 12, color: "bg-red-500", growth: "+45.8%" },
                      { platform: "Live Streaming", amount: 1890, percentage: 7, color: "bg-pink-500", growth: "+92.1%" },
                      { platform: "Finance", amount: 1100, percentage: 4, color: "bg-yellow-500", growth: "+22.8%" },
                    ].map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2">
                            <div className={cn("w-3 h-3 rounded-full", item.color)}></div>
                            <span className="font-medium">{item.platform}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{formatCurrency(item.amount)}</span>
                            <span className="text-green-600 text-xs">{item.growth}</span>
                          </div>
                        </div>
                        <Progress value={item.percentage} className="h-2" />
                      </div>
                    ))}
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
                      { period: "Last 7 days", amount: 1890, change: "+23.4%", trend: "up" },
                      { period: "Last 30 days", amount: 8234, change: "+38.7%", trend: "up" },
                      { period: "Last 90 days", amount: 24567, change: "+45.2%", trend: "up" },
                      { period: "Year to date", amount: 67890, change: "+67.8%", trend: "up" },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <div className="font-medium">{item.period}</div>
                          <div className="text-2xl font-bold">{formatCurrency(item.amount)}</div>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <TrendingUp className="w-3 h-3 text-green-500" />
                          <span className="text-green-600 font-medium">{item.change}</span>
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
                      <div className="text-3xl font-bold text-blue-600">$9,450</div>
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
                      <div className="text-3xl font-bold text-green-600">$35K</div>
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
                      <div className="text-3xl font-bold text-purple-600">$98K</div>
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
                  {[
                    {
                      title: "Optimize Video Content",
                      description: "Your videos have high engagement but low monetization. Consider adding sponsored segments.",
                      impact: "High",
                      effort: "Low"
                    },
                    {
                      title: "Expand Marketplace",
                      description: "Add premium product tiers to increase average order value by 35%.",
                      impact: "High",
                      effort: "Medium"
                    },
                    {
                      title: "Leverage Live Streaming",
                      description: "Your live streams generate 3x more revenue per viewer. Increase frequency.",
                      impact: "Medium",
                      effort: "Low"
                    },
                    {
                      title: "Cross-Platform Promotion",
                      description: "Promote high-value content across all platforms to maximize reach.",
                      impact: "Medium",
                      effort: "Low"
                    }
                  ].map((tip, index) => (
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
                    <p className="text-2xl font-bold text-blue-900">45.2K</p>
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
                    <p className="text-2xl font-bold text-green-900">2.3K</p>
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
                    {[
                      { range: "18-24", percentage: 35, count: "15.8K" },
                      { range: "25-34", percentage: 40, count: "18.1K" },
                      { range: "35-44", percentage: 20, count: "9.0K" },
                      { range: "45-54", percentage: 4, count: "1.8K" },
                      { range: "55+", percentage: 1, count: "450" },
                    ].map((age, index) => (
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
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">58%</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Male</div>
                        <div className="text-xs text-gray-500 mt-1">26.2K followers</div>
                      </div>
                      <div className="text-center p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-pink-600">42%</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Female</div>
                        <div className="text-xs text-gray-500 mt-1">19.0K followers</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium">Top Interests</h4>
                      {[
                        { interest: "Technology", percentage: 78 },
                        { interest: "Finance", percentage: 65 },
                        { interest: "Business", percentage: 52 },
                        { interest: "Education", percentage: 47 },
                        { interest: "Entertainment", percentage: 38 },
                      ].map((item, index) => (
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
                      {[
                        { country: "United States", percentage: 42, count: "18.9K" },
                        { country: "United Kingdom", percentage: 18, count: "8.1K" },
                        { country: "Canada", percentage: 12, count: "5.4K" },
                        { country: "Australia", percentage: 8, count: "3.6K" },
                        { country: "Germany", percentage: 6, count: "2.7K" },
                        { country: "Others", percentage: 14, count: "6.3K" },
                      ].map((location, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{location.country}</span>
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
                      {[
                        { city: "New York", percentage: 15, count: "6.8K" },
                        { city: "London", percentage: 12, count: "5.4K" },
                        { city: "Los Angeles", percentage: 9, count: "4.1K" },
                        { city: "Toronto", percentage: 7, count: "3.2K" },
                        { city: "San Francisco", percentage: 6, count: "2.7K" },
                        { city: "Others", percentage: 51, count: "23.0K" },
                      ].map((city, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{city.city}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">{city.count}</span>
                            <span className="text-sm font-medium w-8">{city.percentage}%</span>
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
                        {[
                          { time: "6-9 AM", activity: 25 },
                          { time: "12-3 PM", activity: 45 },
                          { time: "6-9 PM", activity: 85 },
                          { time: "9-12 PM", activity: 92 },
                        ].map((hour, index) => (
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
                        {[
                          { day: "Tuesday", activity: 92 },
                          { day: "Wednesday", activity: 88 },
                          { day: "Thursday", activity: 85 },
                          { day: "Monday", activity: 78 },
                          { day: "Friday", activity: 72 },
                        ].map((day, index) => (
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
                    {[
                      { metric: "Average Session", value: "8:34", description: "Time spent per visit" },
                      { metric: "Pages per Session", value: "4.2", description: "Average page views" },
                      { metric: "Return Visitor Rate", value: "68%", description: "Repeat audience" },
                      { metric: "Share Rate", value: "12.4%", description: "Content sharing" },
                      { metric: "Comment Rate", value: "8.9%", description: "Active commenting" },
                      { metric: "Save Rate", value: "15.2%", description: "Content saves" },
                    ].map((item, index) => (
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
                      name: "Tech Enthusiasts",
                      size: "12.3K",
                      percentage: 27,
                      description: "Highly engaged with tech content",
                      growth: "+34.5%"
                    },
                    {
                      name: "Business Professionals",
                      size: "8.9K",
                      percentage: 20,
                      description: "Focus on business and finance",
                      growth: "+28.7%"
                    },
                    {
                      name: "Content Creators",
                      size: "6.1K",
                      percentage: 13,
                      description: "Fellow creators and influencers",
                      growth: "+45.2%"
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
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            {/* Insights Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Insights</h2>
                <p className="text-gray-600 dark:text-gray-400">AI recommendations</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleRefreshData} disabled={isRefreshing}>
                  <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
                  {isRefreshing ? 'Refreshing...' : 'Refresh Insights'}
                </Button>
                <Button onClick={handleSetGoals}>
                  <Target className="w-4 h-4 mr-2" />
                  Set Goals
                </Button>
              </div>
            </div>

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
                    <div className="text-2xl font-bold text-blue-600">65.3K</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Followers by Month End</div>
                    <div className="flex items-center justify-center gap-1 mt-2 text-sm text-green-600">
                      <TrendingUp className="w-3 h-3" />
                      <span>+44% growth</span>
                    </div>
                  </div>

                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">$15.2K</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Next Month Revenue</div>
                    <div className="flex items-center justify-center gap-1 mt-2 text-sm text-green-600">
                      <TrendingUp className="w-3 h-3" />
                      <span>+24% increase</span>
                    </div>
                  </div>

                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">2.8M</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Content Views Projection</div>
                    <div className="flex items-center justify-center gap-1 mt-2 text-sm text-green-600">
                      <TrendingUp className="w-3 h-3" />
                      <span>+67% growth</span>
                    </div>
                  </div>

                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">18.9%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Engagement Rate Target</div>
                    <div className="flex items-center justify-center gap-1 mt-2 text-sm text-green-600">
                      <TrendingUp className="w-3 h-3" />
                      <span>+52% improvement</span>
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
                    {[
                      {
                        type: "Video Tutorial",
                        topic: "Advanced Crypto Trading Strategies",
                        reason: "High demand topic in your audience",
                        potential: "2.3K views, $450 revenue",
                        confidence: 92
                      },
                      {
                        type: "Live Stream",
                        topic: "Q&A: Building Online Business",
                        reason: "Your live content performs 3x better",
                        potential: "1.8K viewers, $280 revenue",
                        confidence: 87
                      },
                      {
                        type: "Product Launch",
                        topic: "Premium Course: Freelance Mastery",
                        reason: "Your audience shows high interest in education",
                        potential: "250 sales, $12.5K revenue",
                        confidence: 78
                      }
                    ].map((rec, index) => (
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
                    {[
                      {
                        strategy: "Cross-Platform Promotion",
                        description: "Promote your video content on social media",
                        impact: "25% more views",
                        effort: "Low"
                      },
                      {
                        strategy: "Collaboration Opportunities",
                        description: "Partner with creators in your niche",
                        impact: "40% audience growth",
                        effort: "Medium"
                      },
                      {
                        strategy: "Trending Topic Integration",
                        description: "Create content around #CryptoEducation",
                        impact: "60% more reach",
                        effort: "Low"
                      },
                      {
                        strategy: "Community Building",
                        description: "Start a Discord or Telegram group",
                        impact: "80% higher engagement",
                        effort: "High"
                      }
                    ].map((strategy, index) => (
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
                  {[
                    {
                      trend: "AI & Automation",
                      growth: "+145%",
                      opportunity: "Create AI tool reviews and tutorials",
                      timeline: "Next 30 days",
                      difficulty: "Medium"
                    },
                    {
                      trend: "Sustainable Tech",
                      growth: "+89%",
                      opportunity: "Green technology investment content",
                      timeline: "Next 60 days",
                      difficulty: "Low"
                    },
                    {
                      trend: "Remote Work Tools",
                      growth: "+67%",
                      opportunity: "Productivity and freelance tools reviews",
                      timeline: "Ongoing",
                      difficulty: "Low"
                    },
                    {
                      trend: "Crypto Regulations",
                      growth: "+234%",
                      opportunity: "Educational content on compliance",
                      timeline: "Immediate",
                      difficulty: "High"
                    },
                    {
                      trend: "Creator Economy",
                      growth: "+156%",
                      opportunity: "Monetization strategy guides",
                      timeline: "Next 14 days",
                      difficulty: "Medium"
                    },
                    {
                      trend: "Web3 Development",
                      growth: "+198%",
                      opportunity: "DeFi and blockchain tutorials",
                      timeline: "Next 45 days",
                      difficulty: "High"
                    }
                  ].map((trend, index) => (
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
                        "Your Tuesday content performs 34% better than other days. Consider scheduling your best content for Tuesdays."
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
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-[90vw]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Create New Content</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowCreateModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => { handleCreateContent('video'); setShowCreateModal(false); }}>
                  <Video className="w-6 h-6" />
                  <span className="text-sm">Video</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => { handleCreateContent('post'); setShowCreateModal(false); }}>
                  <FileText className="w-6 h-6" />
                  <span className="text-sm">Post</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => { handleCreateContent('live'); setShowCreateModal(false); }}>
                  <Radio className="w-6 h-6" />
                  <span className="text-sm">Live Stream</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => { handleCreateContent('product'); setShowCreateModal(false); }}>
                  <ShoppingBag className="w-6 h-6" />
                  <span className="text-sm">Product</span>
                </Button>
              </div>
              <Button variant="outline" className="w-full mt-4" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedCreatorDashboard;
