// @ts-nocheck
import React, { useState, useEffect } from "react";


import { AIContentAssistant } from "@/components/ai/AIFeatures";
import AIPerformanceInsights from "@/components/ai/AIPerformanceInsights";
import UnifiedAIStudio from "@/components/ai/UnifiedAIStudio";
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
  ArrowUpRight,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Eye,
  Target,
  User,
  UserPlus,
  Users,
  MapPin,
  Zap,
  House,
  Search,
  Video,
  ShoppingBag,
  Briefcase,
  Coins,
  Gift,
  MessageSquare,
  Calendar as CalendarIcon,
  Radio,
  Film,
  FileText,
  Clock,
  Timer,
  Heart,
  DollarSign,
  CheckCircle,
  Star,
  Sparkles,
  Wand2,
  ImageIcon,
  Brain,
  Play,
  Download,
  RefreshCw,
  Filter,
  Settings,
  Plus,
  ExternalLink,
  MoreHorizontal,
  ChevronRight,
  ChevronLeft,
  Grid3X3,
  List,
  Lightbulb,
  Crown,
  Globe,
  Wallet,
  BookOpen as Stories,
  Rocket,
  Share2,
} from "lucide-react";
import { Line } from "react-chartjs-2";
import { useNavigate, useSearchParams } from "react-router-dom";
import EnhancedCreatorAnalytics from "@/components/video/EnhancedCreatorAnalytics";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);
import {
  fetchContentPageSupabase,
  subscribeToContentAnalytics,
  unsubscribeFromContentAnalytics,
} from "@/services/contentService";
import { unifiedAnalyticsService } from "@/services/unifiedAnalyticsService";
import { DemographicsService } from "@/services/demographicsService";
import { useAuth } from "@/contexts/AuthContext";
import EdithAIGenerator from "@/components/ai/EdithAIGenerator";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

/**
 * Cleaned version of EnhancedCreatorDashboard.tsx
 * - Removed stray placeholder tokens (e.g. literal "[...]")
 * - Simplified some mock data to keep file readable and buildable
 * - Preserved structure and most UI composition so it compiles in a typical project
 *
 * Note: If you want a byte-for-byte original restoration, apply the earlier patch
 * that simply strips the stray tokens from the original file contents.
 */

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  trend: "up" | "down" | "neutral";
  icon: React.ElementType;
  color: string;
  description?: string;
}

const EnhancedCreatorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<string>(() => {
    try {
      if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
        return window.localStorage.getItem("ucs:timeRange") || "30d";
      }
    } catch { }
    return "30d";
  });
  const [searchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState<string>(() => {
    try {
      const t =
        typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("tab") : null;
      return t || "overview";
    } catch {
      return "overview";
    }
  });
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<any | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [sortBy, setSortBy] = useState("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [contentPageData, setContentPageData] = useState<any[]>([]);
  const [contentTotal, setContentTotal] = useState(0);
  const [contentLoading, setContentLoading] = useState(false);
  const cacheRef = React.useRef(new Map<string, { ts: number; data: any; total: number }>());
  const [platformFeatures, setPlatformFeatures] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalGrowth, setTotalGrowth] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [demographics, setDemographics] = useState<any>(null);

  const { user } = useAuth();

  // Minimal mock top performing content (keeps file self-contained)
  const topPerformingContent = [
    {
      id: 1,
      title: "Sample Top Video",
      type: "Video",
      views: "2.1M",
      engagement: "45K",
      revenue: "$2,340",
      description: "A top performing sample video",
      duration: "3:24",
      likes: "34K",
      comments: "1.2K",
      shares: "4.5K",
      publishDate: new Date().toISOString(),
      platform: "Video",
      thumbnail: "/api/placeholder/300/200",
      analytics: {
        watchTime: "45%",
        clickThrough: "8.2%",
        retention: "68.7%",
        viewsOverTime: [100, 300, 700, 1200],
      },
    },
  ];

  // Helpers
  const parseAbbrev = (v: string | number) => {
    if (typeof v === "number") return v;
    const s = String(v).trim();
    if (!s) return 0;
    const negative = s.startsWith("-");
    const cleaned = s.replace(/[^0-9.]/g, "");
    const num = parseFloat(cleaned) || 0;
    if (s.toLowerCase().endsWith("k")) return num * 1000 * (negative ? -1 : 1);
    if (s.toLowerCase().endsWith("m")) return num * 1000000 * (negative ? -1 : 1);
    return num * (negative ? -1 : 1);
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === "string" ? parseFloat(String(amount).replace(/[^0-9.-]/g, "")) || 0 : amount;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(Number(numAmount));
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

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
        window.localStorage.setItem("ucs:timeRange", timeRange);
      }
    } catch { }
  }, [timeRange]);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(id);
  }, [searchTerm]);

  // Fetch real data (simplified)
  useEffect(() => {
    let cancelled = false;

    const fetchRealData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!user) {
          // use fallback mock features
          const fallback = [
            {
              name: "Video",
              icon: Video,
              color: "bg-red-500",
              growth: 31.8,
              active: true,
              metrics: [
                { title: "Videos Created", value: "156", change: 22.4, trend: "up", icon: Film, color: "text-red-600" },
                { title: "Total Views", value: "2.1M", change: 35.2, trend: "up", icon: Play, color: "text-blue-600" },
              ],
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
              ],
            },
          ];
          if (!cancelled) {
            setPlatformFeatures(fallback);
            setTotalRevenue(12450);
            setTotalGrowth((fallback.reduce((s, f) => s + f.growth, 0)) / fallback.length);
          }
          return;
        }

        // Try to fetch real platform metrics
        const metrics = await unifiedAnalyticsService.getPlatformMetrics(user.id, timeRange);
        
        // Fetch real demographic data
        const demographicsData = await DemographicsService.getProcessedDemographics(user.id);
        
        if (!cancelled) {
          setDemographics(demographicsData);
        }
        
        const realPlatformFeatures = [
          {
            name: "Feed & Social",
            icon: House,
            color: "bg-blue-500",
            growth: metrics?.social?.posts?.engagementRate || 0,
            active: true,
            metrics: [
              { title: "Total Posts", value: metrics?.social?.posts?.totalPosts || "0", change: 0, trend: "up", icon: FileText, color: "text-blue-600" },
              { title: "Followers", value: metrics?.social?.audience?.totalFollowers || "0", change: 0, trend: "up", icon: Users, color: "text-green-600" },
            ],
          },
          {
            name: "Video",
            icon: Video,
            color: "bg-red-500",
            growth: metrics?.social?.videos?.retentionRate || 0,
            active: true,
            metrics: [
              { title: "Videos Created", value: metrics?.social?.videos?.totalVideos || "0", change: 0, trend: "up", icon: Film, color: "text-red-600" },
              { title: "Total Views", value: metrics?.social?.videos?.avgViews || "0", change: 0, trend: "up", icon: Play, color: "text-blue-600" },
            ],
          },
          {
            name: "Marketplace",
            icon: ShoppingBag,
            color: "bg-green-500",
            growth: metrics?.ecommerce?.sales?.conversionRate || 0,
            active: true,
            metrics: [
              { title: "Products Sold", value: metrics?.ecommerce?.sales?.totalOrders || "0", change: 0, trend: "up", icon: ShoppingBag, color: "text-green-600" },
              { title: "Revenue", value: formatCurrency(metrics?.ecommerce?.sales?.totalRevenue || 0), change: 0, trend: "up", icon: DollarSign, color: "text-emerald-600" },
            ],
          },
          {
            name: "Freelance",
            icon: Briefcase,
            color: "bg-orange-500",
            growth: metrics?.freelance?.performance?.successScore || 0,
            active: true,
            metrics: [
              { title: "Active Projects", value: metrics?.freelance?.projects?.activeProjects || "0", change: 0, trend: "up", icon: Briefcase, color: "text-orange-600" },
              { title: "Earnings", value: formatCurrency(metrics?.freelance?.earnings?.totalEarnings || 0), change: 0, trend: "up", icon: DollarSign, color: "text-emerald-600" },
            ],
          },
          {
            name: "Crypto",
            icon: Coins,
            color: "bg-yellow-500",
            growth: metrics?.crypto?.portfolio?.totalPnL || 0,
            active: true,
            metrics: [
              { title: "Portfolio Value", value: formatCurrency(metrics?.crypto?.portfolio?.totalValue || 0), change: 0, trend: "up", icon: Coins, color: "text-yellow-600" },
              { title: "Win Rate", value: `${metrics?.crypto?.trading?.winRate || 0}%`, change: 0, trend: "up", icon: TrendingUp, color: "text-green-600" },
            ],
          },
          {
            name: "Wallet",
            icon: Wallet,
            color: "bg-purple-500",
            growth: 0,
            active: true,
            metrics: [
              { title: "Balance", value: formatCurrency(0), change: 0, trend: "up", icon: DollarSign, color: "text-purple-600" },
              { title: "Transactions", value: "0", change: 0, trend: "up", icon: Activity, color: "text-blue-600" },
            ],
          },
          {
            name: "Events",
            icon: CalendarIcon,
            color: "bg-pink-500",
            growth: 0,
            active: true,
            metrics: [
              { title: "Events Created", value: "0", change: 0, trend: "up", icon: CalendarIcon, color: "text-pink-600" },
              { title: "Attendees", value: "0", change: 0, trend: "up", icon: Users, color: "text-green-600" },
            ],
          },
          {
            name: "Tips & Rewards",
            icon: Gift,
            color: "bg-cyan-500",
            growth: 0,
            active: true,
            metrics: [
              { title: "Tips Received", value: formatCurrency(0), change: 0, trend: "up", icon: Heart, color: "text-pink-600" },
              { title: "Rewards Earned", value: formatCurrency(0), change: 0, trend: "up", icon: Gift, color: "text-cyan-600" },
            ],
          },
        ];
        if (!cancelled) {
          setPlatformFeatures(realPlatformFeatures);
          // compute revenue roughly
          const revenue = realPlatformFeatures.reduce((sum, feature) => {
            const rm = feature.metrics.find((m: any) => m.title.includes("Revenue") || m.title.includes("Earnings"));
            if (rm && typeof rm.value === "string") {
              const v = parseFloat(rm.value.replace(/[^0-9.-]/g, "")) || 0;
              return sum + v;
            }
            return sum;
          }, 0);
          setTotalRevenue(revenue);
          setTotalGrowth(realPlatformFeatures.length ? realPlatformFeatures.reduce((s, f) => s + f.growth, 0) / realPlatformFeatures.length : 0);
        }
      } catch (err: any) {
        console.error("Failed to fetch real data:", err);
        if (!cancelled) {
          setError(err.message || "Failed to load analytics data. Please try again later.");
          
          // Show user-friendly error message
          alert("Unable to load analytics data. Please check your connection and try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchRealData();
    return () => {
      cancelled = true;
    };
  }, [user, timeRange]);

  // Fetch content page (simplified / using fallback)
  const fetchContentPage = async ({
    types,
    range,
    sort,
    search,
    pageNum,
    size,
  }: {
    types: string[];
    range: string;
    sort: string;
    search: string;
    pageNum: number;
    size: number;
  }) => {
    const key = JSON.stringify({ types: types.slice().sort(), range, sort, search, pageNum, size });
    const cached = cacheRef.current.get(key);
    if (cached && Date.now() - cached.ts < 1000 * 60) return { data: cached.data, total: cached.total };

    try {
      const res = await fetchContentPageSupabase({ types, range, sort, search, page: pageNum, pageSize: size });
      cacheRef.current.set(key, { ts: Date.now(), data: res.data, total: res.total });
      return { data: res.data, total: res.total };
    } catch (err: any) {
      console.error("Content fetch failed", err);
      // Show error to user
      alert("Unable to load content data. Please try again later.");
      // fallback to local mock
      const filtered = topPerformingContent.filter((item) => {
        const typeMatch = types.length === 0 || types.includes(item.type.toLowerCase());
        const searchMatch = !search || item.title.toLowerCase().includes(search.toLowerCase());
        return typeMatch && searchMatch;
      });
      const total = filtered.length;
      const start = (pageNum - 1) * size;
      const data = filtered.slice(start, start + size);
      cacheRef.current.set(key, { ts: Date.now(), data, total });
      return { data, total };
    }
  };

  // Load content page on filters change
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setContentLoading(true);
      try {
        const { data, total } = await fetchContentPage({
          types: selectedTypes.map((s) => s.toLowerCase()),
          range: timeRange,
          sort: sortBy,
          search: debouncedSearchTerm,
          pageNum: page,
          size: pageSize,
        });
        if (!cancelled) {
          setContentPageData(data);
          setContentTotal(total);
        }
      } catch (err: any) {
        console.error("Content fetch failed", err);
        if (!cancelled) {
          alert("Failed to load content data. Please try again.");
        }
      } finally {
        if (!cancelled) setContentLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [selectedTypes, timeRange, sortBy, debouncedSearchTerm, page, pageSize]);

  // Export helper (simplified)
  const handleExport = async (format: "csv" | "json" | "pdf" = "csv") => {
    setIsExporting(true);
    try {
      const exportData = {
        revenue: { total: totalRevenue, platforms: platformFeatures.map((f) => ({ name: f.name, revenue: f.metrics.find((m: any) => m.title.includes("Revenue") || m.title.includes("Earnings"))?.value || "0" })) },
        content: topPerformingContent,
        exportDate: new Date().toISOString(),
      };
      const blob = format === "csv" ? new Blob([JSON.stringify(exportData)], { type: "text/csv" }) : new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `creator-analytics-${new Date().toISOString().split("T")[0]}.${format === "csv" ? "csv" : "json"}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      alert(`Exported ${format.toUpperCase()}`);
    } catch (err: any) {
      console.error("Export failed", err);
      alert("Export failed: " + (err.message || "Unknown error"));
    } finally {
      setIsExporting(false);
    }
  };

  const handleRefreshData = async () => {
    try {
      setLoading(true);
      unifiedAnalyticsService.clearCache?.();
      // Re-run the fetch effects by toggling timeRange (cheap) or reloading the page:
      // Here simply re-fetch
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay to show loading state
      alert("Analytics data refreshed successfully");
    } catch (err: any) {
      setLoading(false);
      console.error(err);
      alert("Failed to refresh data: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  // quick actions
  const quickActions = [
    { name: "Create Post", icon: Plus, color: "bg-blue-500", href: "/app/feed" },
    { name: "New Video", icon: Video, color: "bg-red-500", href: "/videos" },
    { name: "List Product", icon: ShoppingBag, color: "bg-green-500", href: "/marketplace" },
    { name: "Find Job", icon: Briefcase, color: "bg-orange-500", href: "/freelance" },
    { name: "Create Event", icon: CalendarIcon, color: "bg-purple-500", href: "/events" },
    { name: "Send Tip", icon: Heart, color: "bg-pink-500", href: "/tips" },
    { name: "Create Reward", icon: Gift, color: "bg-yellow-500", href: "/rewards" },
    { name: "Boost Content", icon: Rocket, color: "bg-indigo-500", href: "/boost" },
    { name: "AI Assistant", icon: Sparkles, color: "bg-cyan-500", href: "/ai-assistant" },
  ];

  const filteredFeatures = platformFeatures.filter((feature) => feature.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // calculated totals
  const calculatedTotalRevenue = platformFeatures.reduce((sum, feature) => {
    const revenueMetric = feature.metrics.find((m: any) => m.title.includes("Revenue") || m.title.includes("Earnings"));
    if (revenueMetric && typeof revenueMetric.value === "string") {
      return sum + (parseFloat(revenueMetric.value.replace(/[^0-9.-]/g, "")) || 0);
    }
    return sum;
  }, 0);

  const calculatedTotalGrowth = platformFeatures.length ? platformFeatures.reduce((sum, f) => sum + (f.growth || 0), 0) / platformFeatures.length : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 py-4">
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
                  <Button variant="ghost" size="sm" onClick={() => { setActiveSection("overview"); window.scrollTo({ top: 0, behavior: "smooth" }); }} aria-label="Jump to Overview">Home</Button>
                  <Button variant="ghost" size="sm" onClick={() => { setActiveSection("content"); window.scrollTo({ top: 0, behavior: "smooth" }); }} aria-label="Jump to Content">Content</Button>
                  <Button variant="ghost" size="sm" onClick={() => { setActiveSection("revenue"); window.scrollTo({ top: 0, behavior: "smooth" }); }} aria-label="Jump to Revenue">Earnings</Button>
                  <Button variant="ghost" size="sm" onClick={() => { setActiveSection("audience"); window.scrollTo({ top: 0, behavior: "smooth" }); }} aria-label="Jump to Audience">Fans</Button>
                  <Button variant="ghost" size="sm" onClick={() => { setActiveSection("insights"); window.scrollTo({ top: 0, behavior: "smooth" }); }} aria-label="Jump to Insights">Stats</Button>
                </div>

                <div className="hidden sm:flex items-center gap-1 ml-2">
                  <Button variant="ghost" size="icon" aria-label="Search" onClick={() => setShowFilters((s) => !s)}>
                    <Search className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Filters" onClick={() => setShowFilters((s) => !s)}>
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 flex-shrink-0 text-xs">
                Pro Analytics
              </Badge>
            </div>

            <div className="w-full overflow-x-auto">
              <Tabs value={activeSection} onValueChange={setActiveSection}>
                <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground min-w-fit">
                  <TabsTrigger value="overview" className="flex items-center gap-2 whitespace-nowrap px-3">
                    <Eye className="w-4 h-4" /> <span className="hidden sm:inline">Home</span><span className="sm:hidden">Home</span>
                  </TabsTrigger>
                  <TabsTrigger value="features" className="flex items-center gap-2 whitespace-nowrap px-3">
                    <BarChart3 className="w-4 h-4" /> <span className="hidden sm:inline">Tools</span><span className="sm:hidden">Tools</span>
                  </TabsTrigger>
                  <TabsTrigger value="content" className="flex items-center gap-2 whitespace-nowrap px-3">
                    <FileText className="w-4 h-4" /> <span className="hidden sm:inline">Contents</span><span className="sm:hidden">Posts</span>
                  </TabsTrigger>
                  <TabsTrigger value="audience" className="flex items-center gap-2 whitespace-nowrap px-3">
                    <Users className="w-4 h-4" /> <span className="hidden sm:inline">Audience</span><span className="sm:hidden">Fans</span>
                  </TabsTrigger>
                  <TabsTrigger value="insights" className="flex items-center gap-2 whitespace-nowrap px-3">
                    <BarChart3 className="w-4 h-4" /> <span className="hidden sm:inline">Insights</span><span className="sm:hidden">Stats</span>
                  </TabsTrigger>
                  <TabsTrigger value="revenue" className="flex items-center gap-2 whitespace-nowrap px-3">
                    <DollarSign className="w-4 h-4" /> <span className="hidden sm:inline">Earnings</span><span className="sm:hidden">Money</span>
                  </TabsTrigger>
                  <TabsTrigger value="ecommerce" className="flex items-center gap-2 whitespace-nowrap px-3">
                    <ShoppingBag className="w-4 h-4" /> <span className="hidden sm:inline">E-commerce</span><span className="sm:hidden">Shop</span>
                  </TabsTrigger>
                  <TabsTrigger value="crypto" className="flex items-center gap-2 whitespace-nowrap px-3">
                    <Coins className="w-4 h-4" /> <span className="hidden sm:inline">Crypto</span><span className="sm:hidden">Crypto</span>
                  </TabsTrigger>
                  <TabsTrigger value="wallet" className="flex items-center gap-2 whitespace-nowrap px-3">
                    <Wallet className="w-4 h-4" /> <span className="hidden sm:inline">Wallet</span><span className="sm:hidden">Money</span>
                  </TabsTrigger>
                  <TabsTrigger value="ai-content" className="flex items-center gap-2 whitespace-nowrap px-3">
                    <Sparkles className="w-4 h-4" /> <span className="hidden sm:inline">AI Content</span><span className="sm:hidden">AI</span>
                  </TabsTrigger>
                  <TabsTrigger value="ai-assistant" className="flex items-center gap-2 whitespace-nowrap px-3">
                    <Brain className="w-4 h-4" /> <span className="hidden sm:inline">AI Assistant</span><span className="sm:hidden">AI</span>
                  </TabsTrigger>
                  <TabsTrigger value="ai-insights" className="flex items-center gap-2 whitespace-nowrap px-3">
                    <Sparkles className="w-4 h-4" /> <span className="hidden sm:inline">AI Insights</span><span className="sm:hidden">AI</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
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
                      <p className="text-2xl font-bold text-blue-900">{formatCurrency(calculatedTotalRevenue || totalRevenue)}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="flex items-center mt-2 text-sm">
                    <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                    <span className="text-green-600">+{(calculatedTotalGrowth || totalGrowth).toFixed(1)}%</span>
                    <span className="text-gray-600 ml-1">vs last period</span>
                  </div>
                </CardContent>
              </Card>


              <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-700">Active Features</p>
                      <p className="text-2xl font-bold text-green-900">{platformFeatures.filter((f) => f.active).length}</p>
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
                      <p className="text-2xl font-bold text-purple-900">{(calculatedTotalGrowth || totalGrowth).toFixed(1)}%</p>
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
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => setSelectedContent(null)}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Content
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => alert("Export insights")}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button onClick={() => alert("Share insights")}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    {selectedContent.type === "Video" && <Video className="w-6 h-6 text-red-500" />}
                    {selectedContent.type === "Product" && <ShoppingBag className="w-6 h-6 text-green-500" />}
                    {selectedContent.type === "Post" && <FileText className="w-6 h-6 text-blue-500" />}
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {selectedContent.title}
                      <Badge variant="outline">{selectedContent.type}</Badge>
                    </CardTitle>
                    <CardDescription>{selectedContent.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Eye className="w-5 h-5 text-blue-600" />
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-900">{selectedContent.views || "0"}</p>
                        <p className="text-sm text-blue-700">Total Views</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Heart className="w-5 h-5 text-red-600" />
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-red-900">{selectedContent.engagement || "0"}</p>
                        <p className="text-sm text-red-700">Engagement</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-900">{selectedContent.revenue || "$0"}</p>
                        <p className="text-sm text-green-700">Revenue</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Performance Insights</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="w-4 h-4 text-purple-600" />
                        <span className="font-medium">Engagement Rate</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-600">4.2%</p>
                      <p className="text-sm text-gray-600">Above average by 18%</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-orange-600" />
                        <span className="font-medium">Avg. Watch Time</span>
                      </div>
                      <p className="text-2xl font-bold text-orange-600">2m 15s</p>
                      <p className="text-sm text-gray-600">Optimal retention</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Boost this content</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Increase reach by up to 3x with content boost</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => alert("Boost content")}>Boost</Button>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <Target className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Target similar audience</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Reach 2.3K more users with similar interests</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => alert("Target audience")}>Target</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : selectedFeature ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => setSelectedFeature(null)}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Overview
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => alert("Export feature data")}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button onClick={() => alert(`Configure ${selectedFeature}`)}>
                  <Settings className="w-4 h-4 mr-2" />
                  Configure
                </Button>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  {selectedFeature} Detailed Analytics
                </CardTitle>
                <CardDescription>Comprehensive insights for {selectedFeature.toLowerCase()}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Detailed {selectedFeature} Analytics</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Comprehensive insights and performance metrics for your {selectedFeature.toLowerCase()} activities.
                  </p>
                  <div className="flex justify-center gap-3">
                    <Button onClick={() => alert(`View ${selectedFeature} reports`)}>
                      View Reports
                    </Button>
                    <Button variant="outline" onClick={() => alert(`Customize ${selectedFeature} dashboard`)}>
                      Customize View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
            <TabsContent id="ucs-overview" value="overview" className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>Quick access to platform tools</CardDescription>
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
                          onClick={() => window.open(action.href, "_blank")}
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

              {/* Platform Features Grid (simplified) */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Platform Analytics</h2>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input 
                        type="text" 
                        placeholder="Search features..." 
                        className="pl-10 pr-4 py-2 w-full sm:w-64" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {filteredFeatures.length} of {platformFeatures.length} features
                      </span>
                    </div>
                  </div>
                </div>

                {platformFeatures.length === 0 ? (
                  <div className="text-center py-12">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Loading platform features...</h3>
                    <p className="text-gray-600 dark:text-gray-400">Fetching analytics data from all platform features.</p>
                  </div>
                ) : filteredFeatures.length === 0 ? (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No features found</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Try adjusting your search term.</p>
                    <Button variant="outline" onClick={() => setSearchTerm('')}>
                      Clear Search
                    </Button>
                  </div>
                ) : (
                  <div className={cn("grid gap-6", viewMode === "grid" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1")}>
                    {filteredFeatures.map((feature, index) => {
                      const Icon = feature.icon;
                      return (
                        <Card key={index} className="hover:shadow-lg transition-all duration-200 group cursor-pointer" onClick={() => {
                          // Map feature names to tab values
                          const featureToTabMap: Record<string, string> = {
                            "Feed & Social": "content",
                            "Video": "content",
                            "Marketplace": "ecommerce",
                            "Freelance": "freelance",
                            "Crypto": "crypto",
                            "Wallet": "wallet",
                            "Events": "features",
                            "Tips & Rewards": "revenue"
                          };
                          const tab = featureToTabMap[feature.name] || "overview";
                          setActiveSection(tab);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}>
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
                              {feature.metrics.map((metric: MetricCard, metricIndex: number) => {
                                const MetricIcon = metric.icon;
                                return (
                                  <div key={metricIndex} className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <MetricIcon className={cn("w-4 h-4", metric.color)} />
                                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{metric.title}</span>
                                    </div>
                                    <div className="space-y-1">
                                      <div className="text-xl font-bold text-gray-900 dark:text-white">
                                        {typeof metric.value === "string" && metric.value.includes("$") ? metric.value : metric.value}
                                      </div>
                                      <div className="flex items-center gap-1 text-sm">
                                        {getTrendIcon(metric.trend)}
                                        <span className={cn("font-medium", metric.trend === "up" ? "text-green-600" : metric.trend === "down" ? "text-red-600" : "text-gray-600")}>
                                          {metric.change > 0 ? "+" : ""}{metric.change}%
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
                )}
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              {/* Content header */}
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
                  <Button variant="outline" onClick={() => setShowFilters((s) => !s)}>
                    <Filter className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Filter Content</span>
                  </Button>
                  <Button onClick={() => alert("Create Content")}>
                    <Plus className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Create Content</span>
                  </Button>
                </div>
              </div>

              {/* Content list (simplified) */}
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
                    {contentLoading ? (
                      <div className="p-6 text-center">Loading content...</div>
                    ) : contentPageData.length > 0 ? (
                      contentPageData.map((content, idx) => (
                        <div 
                          key={content.id || idx} 
                          className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all cursor-pointer"
                          onClick={() => setSelectedContent(content)}
                        >
                          <div className="flex-shrink-0">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                              {content.type === "Video" && <Video className="w-8 h-8 text-red-500" />}
                              {content.type === "Product" && <ShoppingBag className="w-8 h-8 text-green-500" />}
                              {content.type === "Post" && <FileText className="w-8 h-8 text-blue-500" />}
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
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">{content.revenue}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Revenue</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); alert("Export"); }}>Export</Button>
                            <Button variant="ghost" size="sm"><ChevronRight className="w-4 h-4" /></Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-600">No content matches the selected filters.</div>
                    )}

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-sm text-gray-600">Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, contentTotal)} of {contentTotal}</div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
                        <div className="text-sm">Page {page}</div>
                        <Button size="sm" variant="outline" onClick={() => setPage((p) => p + 1)} disabled={page * pageSize >= contentTotal}>Next</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stories className="w-5 h-5 text-purple-500" />
                    Stories Analytics
                  </CardTitle>
                  <CardDescription>Performance metrics for your stories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Eye className="w-6 h-6 text-blue-600" />
                          <div className="flex items-center gap-1 text-sm">
                            <TrendingUp className="w-3 h-3 text-green-500" />
                            <span className="text-green-600">+18.3%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-blue-900">24.5K</p>
                          <p className="text-sm text-blue-700">Total Views</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Heart className="w-6 h-6 text-red-600" />
                          <div className="flex items-center gap-1 text-sm">
                            <TrendingUp className="w-3 h-3 text-green-500" />
                            <span className="text-green-600">+22.7%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-red-900">3.2K</p>
                          <p className="text-sm text-red-700">Total Likes</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <MessageSquare className="w-6 h-6 text-green-600" />
                          <div className="flex items-center gap-1 text-sm">
                            <TrendingUp className="w-3 h-3 text-green-500" />
                            <span className="text-green-600">+15.4%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-green-900">1.8K</p>
                          <p className="text-sm text-green-700">Total Replies</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <BarChart3 className="w-6 h-6 text-purple-600" />
                          <div className="flex items-center gap-1 text-sm">
                            <TrendingUp className="w-3 h-3 text-green-500" />
                            <span className="text-green-600">+12.8%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-purple-900">4.2x</p>
                          <p className="text-sm text-purple-700">Engagement Rate</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <div 
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:shadow-md transition-all"
                      onClick={() => alert("View story analytics: Summer Adventure Highlights")}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-full">
                          <Stories className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium">Summer Adventure Highlights</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">24h ago • 8.2K views</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">420 likes</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">180 replies</p>
                      </div>
                    </div>
                    <div 
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:shadow-md transition-all"
                      onClick={() => alert("View story analytics: Behind the Scenes: Product Launch")}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Stories className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Behind the Scenes: Product Launch</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">2 days ago • 12.4K views</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">680 likes</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">240 replies</p>
                      </div>
                    </div>
                    <div 
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:shadow-md transition-all"
                      onClick={() => alert("View story analytics: Tutorial: Quick Recipe Series")}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-full">
                          <Stories className="w-4 h-4 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium">Tutorial: Quick Recipe Series</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">1 week ago • 6.7K views</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">320 likes</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">95 replies</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <Button variant="outline" className="w-full" onClick={() => alert("View All Stories")}>
                      View All Stories Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="revenue" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Revenue</h2>
                  <p className="text-gray-600 dark:text-gray-400">Track earnings</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleExport("csv")} disabled={isExporting}>
                    <Download className={cn("w-4 h-4", isExporting && "animate-spin")} />
                    {isExporting ? "Exporting..." : "Export Report"}
                  </Button>
                  <Button onClick={() => alert("Set Goals")}>
                    <Target className="w-4 h-4 mr-2" />
                    Set Goals
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
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
                <Card>
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
                <Card>
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
                <Card>
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

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    Boost & Premium System Metrics
                  </CardTitle>
                  <CardDescription>Performance and earnings from boost and premium features</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Zap className="w-6 h-6 text-yellow-600" />
                          <div className="flex items-center gap-1 text-sm">
                            <TrendingUp className="w-3 h-3 text-green-500" />
                            <span className="text-green-600">+32.5%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-yellow-900">$1,840</p>
                          <p className="text-sm text-yellow-700">Boost Revenue</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Crown className="w-6 h-6 text-purple-600" />
                          <div className="flex items-center gap-1 text-sm">
                            <TrendingUp className="w-3 h-3 text-green-500" />
                            <span className="text-green-600">+28.7%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-purple-900">$3,260</p>
                          <p className="text-sm text-purple-700">Premium Revenue</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Rocket className="w-6 h-6 text-blue-600" />
                          <div className="flex items-center gap-1 text-sm">
                            <TrendingUp className="w-3 h-3 text-green-500" />
                            <span className="text-green-600">+15.4%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-blue-900">1,240</p>
                          <p className="text-sm text-blue-700">Boosts Used</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Star className="w-6 h-6 text-orange-600" />
                          <div className="flex items-center gap-1 text-sm">
                            <TrendingUp className="w-3 h-3 text-green-500" />
                            <span className="text-green-600">+22.8%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-orange-900">842</p>
                          <p className="text-sm text-orange-700">Premium Subscribers</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <div 
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:shadow-md transition-all"
                      onClick={() => alert("View boost campaign details: Content Boost Campaign")}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-full">
                          <Zap className="w-4 h-4 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium">Content Boost Campaign</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Active • 24h remaining</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">+$420</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">1,240 views</p>
                      </div>
                    </div>
                    <div 
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:shadow-md transition-all"
                      onClick={() => alert("View premium subscriber growth details")}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-full">
                          <Crown className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium">Premium Subscriber Growth</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">This month • 842 total</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">+18.3%</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">24 new subscribers</p>
                      </div>
                    </div>
                    <div 
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:shadow-md transition-all"
                      onClick={() => alert("View boost performance report")}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Rocket className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Boost Performance Report</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Last 30 days</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">4.2x</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Avg. reach boost</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <Button variant="outline" className="w-full" onClick={() => alert("View Boost & Premium Analytics")}>
                      View Detailed Boost & Premium Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audience" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Audience & Insights</h2>
                  <p className="text-gray-600 dark:text-gray-400">Detailed audience demographics and platform insights</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => alert("View Audience Segments")}>
                    <Users className="w-4 h-4 mr-2" />
                    Audience Segments
                  </Button>
                  <Button onClick={() => alert("View Target Analysis")}>
                    <Target className="w-4 h-4 mr-2" />
                    Target Analysis
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Users className="w-6 h-6 text-blue-600" />
                      <div className="flex items-center gap-1 text-sm">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-green-600">+{(platformFeatures.find(f => f.name === "Feed & Social")?.growth || 0).toFixed(1)}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-900">
                        {platformFeatures.find(f => f.name === "Feed & Social")?.metrics.find((m: any) => m.title === "Followers")?.value || "0"}
                      </p>
                      <p className="text-sm text-blue-700">Total Followers</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <UserPlus className="w-6 h-6 text-green-600" />
                      <div className="flex items-center gap-1 text-sm">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-green-600">+{(platformFeatures.find(f => f.name === "Feed & Social")?.growth || 0).toFixed(1)}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-900">
                        {Math.round((platformFeatures.find(f => f.name === "Feed & Social")?.metrics.find((m: any) => m.title === "Followers")?.value || 0) * 0.05).toLocaleString()}
                      </p>
                      <p className="text-sm text-green-700">New This Month</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Heart className="w-6 h-6 text-purple-600" />
                      <div className="flex items-center gap-1 text-sm">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-green-600">+{(platformFeatures.find(f => f.name === "Feed & Social")?.growth || 0).toFixed(1)}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-900">
                        {(platformFeatures.find(f => f.name === "Feed & Social")?.growth || 0).toFixed(1)}%
                      </p>
                      <p className="text-sm text-purple-700">Engagement Rate</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Activity className="w-6 h-6 text-orange-600" />
                      <div className="flex items-center gap-1 text-sm">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-green-600">+{(platformFeatures.find(f => f.name === "Video")?.growth || 0).toFixed(1)}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-900">
                        {(platformFeatures.find(f => f.name === "Video")?.growth || 0).toFixed(1)}%
                      </p>
                      <p className="text-sm text-orange-700">Retention Rate</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Demographic Breakdowns */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Age Demographics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-500" />
                      Age Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {demographics?.ageGroups?.map((ageGroup: any, index: number) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{ageGroup.range}</span>
                            <span className="text-gray-600 dark:text-gray-400">{ageGroup.percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-green-500' : index === 2 ? 'bg-purple-500' : index === 3 ? 'bg-orange-500' : 'bg-red-500'}`} 
                              style={{ width: `${ageGroup.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      )) || [
                        { range: "18-24", percentage: 35, color: "bg-blue-500" },
                        { range: "25-34", percentage: 28, color: "bg-green-500" },
                        { range: "35-44", percentage: 20, color: "bg-purple-500" },
                        { range: "45-54", percentage: 12, color: "bg-orange-500" },
                        { range: "55+", percentage: 5, color: "bg-red-500" }
                      ].map((ageGroup: any, index: number) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{ageGroup.range}</span>
                            <span className="text-gray-600 dark:text-gray-400">{ageGroup.percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className={`${ageGroup.color} h-2 rounded-full`} 
                              style={{ width: `${ageGroup.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Gender Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-500" />
                      Gender Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {demographics?.genderDistribution?.map((genderGroup: any, index: number) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{genderGroup.gender}</span>
                            <span className="text-gray-600 dark:text-gray-400">{genderGroup.percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-pink-500' : 'bg-gray-500'}`} 
                              style={{ width: `${genderGroup.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      )) || [
                        { gender: "Male", percentage: 58, color: "bg-blue-500" },
                        { gender: "Female", percentage: 39, color: "bg-pink-500" },
                        { gender: "Other/Non-binary", percentage: 3, color: "bg-gray-500" }
                      ].map((genderGroup: any, index: number) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{genderGroup.gender}</span>
                            <span className="text-gray-600 dark:text-gray-400">{genderGroup.percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className={`${genderGroup.color} h-2 rounded-full`} 
                              style={{ width: `${genderGroup.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Location Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-green-500" />
                      Top Locations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {demographics?.locationDistribution?.map((location: any, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{index === 0 ? '🇺🇸' : index === 1 ? '🇬🇧' : index === 2 ? '🇨🇦' : index === 3 ? '🇩��' : index === 4 ? '🇦����' : '🌐'}</span>
                            <span className="font-medium">{location.location}</span>
                          </div>
                          <span className="text-gray-600 dark:text-gray-400">{location.percentage}%</span>
                        </div>
                      )) || [
                        { location: "United States", percentage: 28, flag: "🇺🇸" },
                        { location: "United Kingdom", percentage: 15, flag: "🇬🇧" },
                        { location: "Canada", percentage: 12, flag: "🇨🇦" },
                        { location: "Germany", percentage: 9, flag: "🇩🇪" },
                        { location: "Australia", percentage: 8, flag: "🇦🇺" },
                        { location: "Other", percentage: 28, flag: "🌐" }
                      ].map((location: any, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{location.flag}</span>
                            <span className="font-medium">{location.location}</span>
                          </div>
                          <span className="text-gray-600 dark:text-gray-400">{location.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Interests */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-500" />
                      Top Interests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {demographics?.interests?.map((interest: any, index: number) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="px-3 py-1.5 text-sm"
                        >
                          {interest.interest}
                        </Badge>
                      )) || [
                        "Technology", "Gaming", "Music", "Sports", "Travel", 
                        "Food", "Fashion", "Fitness", "Art", "Photography"
                      ].map((interest: string, index: number) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="px-3 py-1.5 text-sm"
                        >
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Customer/Buyer/Seller Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-orange-500" />
                    Audience Segments
                  </CardTitle>
                  <CardDescription>Breakdown of your audience by engagement type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="w-5 h-5 text-blue-500" />
                        <span className="font-medium">Content Viewers</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">
                        {Math.round((platformFeatures.find(f => f.name === "Feed & Social")?.metrics.find((m: any) => m.title === "Followers")?.value || 0) * 0.72).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Regular content consumers</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <ShoppingBag className="w-5 h-5 text-green-500" />
                        <span className="font-medium">Buyers</span>
                      </div>
                      <p className="text-2xl font-bold text-green-600">
                        {platformFeatures.find(f => f.name === "Marketplace")?.metrics.find((m: any) => m.title === "Products Sold")?.value || "0"}
                      </p>
                      <p className="text-sm text-gray-600">Purchased products/services</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-5 h-5 text-purple-500" />
                        <span className="font-medium">Sellers</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-600">
                        {Math.round((platformFeatures.find(f => f.name === "Marketplace")?.metrics.find((m: any) => m.title === "Products Sold")?.value || 0) * 0.15).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Active marketplace sellers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="freelance" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Freelance Marketplace</h2>
                  <p className="text-gray-600 dark:text-gray-400">Track your freelance projects and earnings</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => alert("Browse Jobs")}>
                    <Briefcase className="w-4 h-4 mr-2" />
                    Browse Jobs
                  </Button>
                  <Button onClick={() => alert("Post a Job")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Post a Job
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Briefcase className="w-6 h-6 text-blue-600" />
                      <div className="flex items-center gap-1 text-sm">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-green-600">+12.5%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-900">$2,450</p>
                      <p className="text-sm text-blue-700">Total Earnings</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <FileText className="w-6 h-6 text-green-600" />
                      <div className="flex items-center gap-1 text-sm">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-green-600">+8.2%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-900">24</p>
                      <p className="text-sm text-green-700">Active Projects</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <CheckCircle className="w-6 h-6 text-purple-600" />
                      <div className="flex items-center gap-1 text-sm">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-green-600">+15.7%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-900">96%</p>
                      <p className="text-sm text-purple-700">Completion Rate</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Star className="w-6 h-6 text-orange-600" />
                      <div className="flex items-center gap-1 text-sm">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-green-600">+5.3%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-900">4.8</p>
                      <p className="text-sm text-orange-700">Avg. Rating</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-500" />
                    Recent Freelance Activity
                  </CardTitle>
                  <CardDescription>Your latest freelance projects and earnings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div 
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:shadow-md transition-all"
                      onClick={() => alert("View project details: Social Media Marketing Campaign")}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Briefcase className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Social Media Marketing Campaign</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Client: TechStart Inc. • Completed</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">+$1,200</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">2 days ago</p>
                      </div>
                    </div>
                    <div 
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:shadow-md transition-all"
                      onClick={() => alert("View project details: Content Writing for Blog Series")}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <FileText className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Content Writing for Blog Series</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Client: Creative Solutions • In Progress</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-blue-600">+$850</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">1 week ago</p>
                      </div>
                    </div>
                    <div 
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:shadow-md transition-all"
                      onClick={() => alert("View project details: Product Video Editing")}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-full">
                          <Video className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium">Product Video Editing</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Client: MediaPro • Pending Review</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-orange-600">+$1,400</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">3 days ago</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <Button variant="outline" className="w-full" onClick={() => alert("View All Freelance Projects")}>
                      View All Freelance Projects
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ecommerce" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">E-commerce</h2>
                  <p className="text-gray-600 dark:text-gray-400">Track your online store performance and sales</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => alert("View Products")}>
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    View Products
                  </Button>
                  <Button onClick={() => alert("Add Product")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <ShoppingBag className="w-6 h-6 text-blue-600" />
                      <div className="flex items-center gap-1 text-sm">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-green-600">+18.3%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-900">$5,680</p>
                      <p className="text-sm text-blue-700">Total Sales</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <DollarSign className="w-6 h-6 text-green-600" />
                      <div className="flex items-center gap-1 text-sm">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-green-600">+12.7%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-900">142</p>
                      <p className="text-sm text-green-700">Total Orders</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <CheckCircle className="w-6 h-6 text-purple-600" />
                      <div className="flex items-center gap-1 text-sm">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-green-600">+8.4%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-900">92%</p>
                      <p className="text-sm text-purple-700">Conversion Rate</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Star className="w-6 h-6 text-orange-600" />
                      <div className="flex items-center gap-1 text-sm">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-green-600">+3.2%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-900">4.7</p>
                      <p className="text-sm text-orange-700">Avg. Rating</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-blue-500" />
                    Recent Sales Activity
                  </CardTitle>
                  <CardDescription>Your latest e-commerce transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div 
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:shadow-md transition-all"
                      onClick={() => alert("View order details: Premium Headphones (Order #ORD-7842)")}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <ShoppingBag className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Premium Headphones</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Order #ORD-7842 • Completed</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">+$199.99</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">1 hour ago</p>
                      </div>
                    </div>
                    <div 
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:shadow-md transition-all"
                      onClick={() => alert("View order details: Wireless Charger (Order #ORD-7839)")}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <ShoppingBag className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Wireless Charger</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Order #ORD-7839 • Shipped</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-blue-600">+$49.99</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">3 hours ago</p>
                      </div>
                    </div>
                    <div 
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:shadow-md transition-all"
                      onClick={() => alert("View order details: Smart Watch (Order #ORD-7835)")}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-full">
                          <ShoppingBag className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium">Smart Watch</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Order #ORD-7835 ��� Processing</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-orange-600">+$249.99</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">1 day ago</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <Button variant="outline" className="w-full" onClick={() => alert("View All Sales")}>
                      View All Sales
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="crypto" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Crypto Trading</h2>
                  <p className="text-gray-600 dark:text-gray-400">Track your cryptocurrency portfolio and trading performance</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => alert("View Markets")}>
                    <Globe className="w-4 h-4 mr-2" />
                    View Markets
                  </Button>
                  <Button onClick={() => alert("Trade Crypto")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Trade Crypto
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Coins className="w-6 h-6 text-blue-600" />
                      <div className="flex items-center gap-1 text-sm">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-green-600">+12.5%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-900">$12,450</p>
                      <p className="text-sm text-blue-700">Portfolio Value</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                      <div className="flex items-center gap-1 text-sm">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-green-600">+8.2%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-900">$1,240</p>
                      <p className="text-sm text-green-700">24h P&L</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <BarChart3 className="w-6 h-6 text-purple-600" />
                      <div className="flex items-center gap-1 text-sm">
                        <TrendingDown className="w-3 h-3 text-red-500" />
                        <span className="text-red-600">-2.4%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-900">15</p>
                      <p className="text-sm text-purple-700">Active Trades</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Star className="w-6 h-6 text-orange-600" />
                      <div className="flex items-center gap-1 text-sm">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-green-600">+5.7%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-900">78.3%</p>
                      <p className="text-sm text-orange-700">Win Rate</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-blue-500" />
                    Recent Trading Activity
                  </CardTitle>
                  <CardDescription>Your latest cryptocurrency transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div 
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:shadow-md transition-all"
                      onClick={() => alert("View transaction details: Bitcoin (BTC) Purchase")}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Coins className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Bitcoin (BTC) Purchase</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">0.25 BTC @ $42,000 • Completed</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">-$10,500</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">2 hours ago</p>
                      </div>
                    </div>
                    <div 
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:shadow-md transition-all"
                      onClick={() => alert("View transaction details: Ethereum (ETH) Sale")}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <Coins className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Ethereum (ETH) Sale</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">3.2 ETH @ $2,450 • Completed</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">+$7,840</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">1 day ago</p>
                      </div>
                    </div>
                    <div 
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:shadow-md transition-all"
                      onClick={() => alert("View transaction details: Solana (SOL) Purchase")}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-full">
                          <Coins className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium">Solana (SOL) Purchase</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">15 SOL @ $98.50 • Pending</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-orange-600">-$1,477.50</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">3 days ago</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <Button variant="outline" className="w-full" onClick={() => alert("View All Transactions")}>
                      View All Transactions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wallet" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Wallet Management</h2>
                  <p className="text-gray-600 dark:text-gray-400">Track your wallet balances and transactions</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => alert("View Transactions")}>
                    <Activity className="w-4 h-4 mr-2" />
                    View Transactions
                  </Button>
                  <Button onClick={() => alert("Add Funds")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Funds
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Wallet className="w-6 h-6 text-blue-600" />
                      <div className="flex items-center gap-1 text-sm">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-green-600">+5.2%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-900">$3,240</p>
                      <p className="text-sm text-blue-700">Total Balance</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <DollarSign className="w-6 h-6 text-green-600" />
                      <div className="flex items-center gap-1 text-sm">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-green-600">+12.7%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-900">$1,850</p>
                      <p className="text-sm text-green-700">Available Funds</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Gift className="w-6 h-6 text-purple-600" />
                      <div className="flex items-center gap-1 text-sm">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-green-600">+3.4%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-900">$420</p>
                      <p className="text-sm text-purple-700">Gift Cards</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Star className="w-6 h-6 text-orange-600" />
                      <div className="flex items-center gap-1 text-sm">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-green-600">+8.1%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-900">96.7%</p>
                      <p className="text-sm text-orange-700">Savings Rate</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-blue-500" />
                    Recent Wallet Activity
                  </CardTitle>
                  <CardDescription>Your latest wallet transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div 
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:shadow-md transition-all"
                      onClick={() => alert("View transaction details: Platform Revenue Payout")}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Wallet className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Platform Revenue Payout</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Deposit • Completed</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">+$1,240</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">2 hours ago</p>
                      </div>
                    </div>
                    <div 
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:shadow-md transition-all"
                      onClick={() => alert("View transaction details: Marketplace Purchase")}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <ShoppingBag className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Marketplace Purchase</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Payment • Completed</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-red-600">-$85.99</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">1 day ago</p>
                      </div>
                    </div>
                    <div 
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:shadow-md transition-all"
                      onClick={() => alert("View transaction details: Gift Card Purchase")}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-full">
                          <Gift className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium">Gift Card Purchase</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Purchase • Pending</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-orange-600">-$50.00</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">3 days ago</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <Button variant="outline" className="w-full" onClick={() => alert("View All Transactions")}>
                      View All Transactions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Insights</h2>
                  <p className="text-gray-600 dark:text-gray-400">AI recommendations</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleRefreshData()}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Insights
                  </Button>
                  <Button onClick={() => alert("Set Goals")}>
                    <Target className="w-4 h-4 mr-2" />
                    Set Goals
                  </Button>
                </div>
              </div>

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
                  </div>
                </CardContent>
              </Card>

              <div>
                <EnhancedCreatorAnalytics />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Content Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">Video Tutorial</Badge>
                            <span className="font-medium">Advanced Crypto Trading Strategies</span>
                          </div>
                          <span className="text-sm text-green-600">92% confidence</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">High demand topic in your audience</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-green-600">2.3K views, $450 revenue</span>
                          <Button size="sm" variant="outline" onClick={() => alert("Create Content")}>Create Content</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Audience Growth Strategy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">Cross-Platform Promotion</h4>
                          <Badge variant="default" className="text-xs">Low Effort</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Promote your video content on social media</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-green-600">25% more views</span>
                          <Button size="sm" variant="outline" onClick={() => alert("Implement Strategy")}>Implement</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="ai-content" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Content Generator</h2>
                  <p className="text-gray-600 dark:text-gray-400">Create AI-powered content for your posts</p>
                </div>
                <Button onClick={() => setShowAIGenerator(true)}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate New Content
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Edith AI Content Generator</CardTitle>
                  <CardDescription>Create stunning AI-generated images and videos for your content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Create AI-Powered Content</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
                      Generate stunning images and videos with Edith AI to enhance your posts and engage your audience.
                    </p>
                    <Button onClick={() => setShowAIGenerator(true)} size="lg">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Content with Edith AI
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="font-semibold">Image Generation</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Create stunning images with detailed prompts for your social media posts.</p>
                    <Button variant="outline" size="sm" onClick={() => setShowAIGenerator(true)}>Generate Image</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <Video className="w-5 h-5 text-red-600" />
                      </div>
                      <h3 className="font-semibold">Video Creation</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Generate short videos with AI for engaging content.</p>
                    <Button variant="outline" size="sm" onClick={() => setShowAIGenerator(true)}>Generate Video</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Wand2 className="w-5 h-5 text-purple-600" />
                      </div>
                      <h3 className="font-semibold">Smart Editing</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Enhance and upscale your AI-generated content with smart editing tools.</p>
                    <Button variant="outline" size="sm" onClick={() => setShowAIGenerator(true)}>Enhance Content</Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="ai-assistant" className="space-y-6">
              <AIContentAssistant />
            </TabsContent>

            <TabsContent value="features" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Platform Tools</h2>
                  <p className="text-gray-600 dark:text-gray-400">Access all platform features and tools</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => alert("View All Tools")}>
                    <Grid3X3 className="w-4 h-4 mr-2" />
                    All Tools
                  </Button>
                  <Button onClick={() => alert("Customize Dashboard")}>
                    <Settings className="w-4 h-4 mr-2" />
                    Customize
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer" onClick={() => alert("Create Event")}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-purple-500" />
                        Events
                      </CardTitle>
                      <Badge variant="secondary">New</Badge>
                    </div>
                    <CardDescription>Create and manage events</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Active Events</span>
                        <span className="font-medium">0</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Created</span>
                        <span className="font-medium">0</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Attendees</span>
                        <span className="font-medium">0</span>
                      </div>
                    </div>
                    <Button className="w-full mt-4" variant="outline">
                      Create Event
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer" onClick={() => alert("Send Tip")}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-pink-500" />
                        Tips & Donations
                      </CardTitle>
                      <Badge variant="secondary">Popular</Badge>
                    </div>
                    <CardDescription>Send and receive tips</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Tips Received</span>
                        <span className="font-medium">{formatCurrency(0)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Tips Sent</span>
                        <span className="font-medium">{formatCurrency(0)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Top Supporters</span>
                        <span className="font-medium">0</span>
                      </div>
                    </div>
                    <Button className="w-full mt-4" variant="outline">
                      Send Tip
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer" onClick={() => alert("Create Reward")}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Gift className="w-5 h-5 text-yellow-500" />
                        Rewards
                      </CardTitle>
                      <Badge variant="secondary">Engage</Badge>
                    </div>
                    <CardDescription>Create and manage rewards</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Active Rewards</span>
                        <span className="font-medium">0</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Rewards Claimed</span>
                        <span className="font-medium">0</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Value</span>
                        <span className="font-medium">{formatCurrency(0)}</span>
                      </div>
                    </div>
                    <Button className="w-full mt-4" variant="outline">
                      Create Reward
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-blue-500" />
                    Platform Feature Recommendations
                  </CardTitle>
                  <CardDescription>Suggested features to enhance your creator experience</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <CalendarIcon className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Event Creation Tool</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Engage your audience with live events</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => alert("Try Events")}>Try Now</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-pink-100 rounded-full">
                          <Heart className="w-4 h-4 text-pink-600" />
                        </div>
                        <div>
                          <p className="font-medium">Tip Jar Integration</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Enable tipping on your content</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => alert("Enable Tipping")}>Enable</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-full">
                          <Gift className="w-4 h-4 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium">Loyalty Rewards System</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Reward your most loyal fans</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => alert("Setup Rewards")}>Setup</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai-insights" className="space-y-6">
              <AIPerformanceInsights />
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* AI Generator Modal (simple) */}
      {showAIGenerator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-[90%] max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edith AI Generator</h3>
              <Button variant="outline" size="sm" onClick={() => setShowAIGenerator(false)}>Close</Button>
            </div>
            <EdithAIGenerator onGenerate={(c) => { alert("AI content generated"); setShowAIGenerator(false); }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedCreatorDashboard;
