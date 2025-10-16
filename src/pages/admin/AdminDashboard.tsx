// @ts-nocheck
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotification } from "@/hooks/use-notification";
import { AdminService } from "@/services/adminService";
import { AdminDashboardData, AdminUser } from "@/types/admin";
import { ComprehensiveFeatureShowcase } from "@/components/admin/ComprehensiveFeatureShowcase";
import { WalletWidget } from "@/components/wallet/WalletWidget";
import { PremiumStatusWidget } from "@/components/premium/PremiumStatusWidget";
import { ApiHealthChecker } from "@/components/admin/ApiHealthChecker";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import {
  Users,
  ShoppingCart,
  TrendingUp,
  Award,
  Shield,
  AlertTriangle,
  Activity,
  Database,
  Cpu,
  HardDrive,
  LogOut,
  Settings,
  UserCheck,
  FileText,
  DollarSign,
  Eye,
  Clock,
  Bell,
  Briefcase,
  Bitcoin,
  MessageSquare,
  Star,
  Flag,
  CreditCard,
  Zap,
  Globe,
} from "lucide-react";

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#8dd1e1",
  "#d084d0",
];

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(
    null,
  );
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const notification = useNotification();

  useEffect(() => {
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    try {
      setIsLoading(true);

      // Check if admin is logged in
      const adminData = localStorage.getItem("admin_user");
      if (!adminData) {
        navigate("/admin/login");
        return;
      }

      const admin = JSON.parse(adminData);
      setCurrentAdmin(admin);

      // Fetch dashboard data with fallback
      try {
        const data = await AdminService.getDashboardData();
        setDashboardData(data);
      } catch (apiError) {
        console.error("Error fetching dashboard data:", apiError);
        // Use fallback data when API is not available
        setDashboardData({
          stats: {
            totalUsers: 1247,
            activeUsers: 892,
            totalProducts: 156,
            totalJobs: 89,
            totalTrades: 234,
            pendingModeration: 12,
            revenueMonth: 48500,
            activeBoosts: 27,
            premiumSubscribers: {
              silver: 45,
              gold: 23,
              pro: 8,
            },
          },
          recentActivity: [],
          activeAdmins: [],
          pendingModeration: [],
          topProducts: [],
          platformEarnings: [],
          trafficOverview: [],
          systemHealth: {
            uptime: "99.9%",
            cpu: 45,
            memory: 68,
            storage: 34,
          },
        });
        setError("Using demo data - API not available");
      }

      notification.success(`Welcome back, ${admin.name}!`);
    } catch (error) {
      console.error("Dashboard initialization error:", error);
      setError("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const sessionToken = localStorage.getItem("admin_session");
      if (sessionToken) {
        await AdminService.adminLogout(sessionToken);
      }

      localStorage.removeItem("admin_session");
      localStorage.removeItem("admin_user");

      notification.info("Logged out successfully");
      navigate("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      super_admin: "bg-red-500 text-white",
      content_admin: "bg-blue-500 text-white",
      user_admin: "bg-green-500 text-white",
      marketplace_admin: "bg-purple-500 text-white",
      crypto_admin: "bg-yellow-500 text-black",
      freelance_admin: "bg-orange-500 text-white",
      support_admin: "bg-gray-500 text-white",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!dashboardData || !currentAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No data available</p>
      </div>
    );
  }

  const userActivityData = [
    {
      name: "Jan",
      posts: (dashboardData?.stats?.totalPosts || 0) * 0.1,
      users: (dashboardData?.stats?.totalUsers || 0) * 0.1,
    },
    {
      name: "Feb",
      posts: (dashboardData?.stats?.totalPosts || 0) * 0.15,
      users: (dashboardData?.stats?.totalUsers || 0) * 0.15,
    },
    {
      name: "Mar",
      posts: (dashboardData?.stats?.totalPosts || 0) * 0.2,
      users: (dashboardData?.stats?.totalUsers || 0) * 0.2,
    },
    {
      name: "Apr",
      posts: (dashboardData?.stats?.totalPosts || 0) * 0.18,
      users: (dashboardData?.stats?.totalUsers || 0) * 0.18,
    },
    {
      name: "May",
      posts: (dashboardData?.stats?.totalPosts || 0) * 0.22,
      users: (dashboardData?.stats?.totalUsers || 0) * 0.22,
    },
    {
      name: "Jun",
      posts: (dashboardData?.stats?.totalPosts || 0) * 0.15,
      users: (dashboardData?.stats?.totalUsers || 0) * 0.25,
    },
  ];

  const systemHealthData = [
    {
      name: "CPU",
      value: dashboardData?.systemHealth?.cpu || 0,
      color: "#8884d8",
    },
    {
      name: "Memory",
      value: dashboardData?.systemHealth?.memory || 0,
      color: "#82ca9d",
    },
    {
      name: "Storage",
      value: dashboardData?.systemHealth?.storage || 0,
      color: "#ffc658",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Eloity Platform Control Center
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium text-gray-900 dark:text-white">
                {currentAdmin.name}
              </p>
              <div className="flex gap-1 justify-end">
                {currentAdmin.roles.map((role) => (
                  <Badge key={role} className={`text-xs ${getRoleColor(role)}`}>
                    {role.replace("_", " ")}
                  </Badge>
                ))}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/admin/settings")}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>

            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Comprehensive Server Alert */}
        <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
          <Zap className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <div className="flex flex-col gap-2">
              <div>
                🚀 <strong>NEW!</strong> Eloity Comprehensive Backend is
                available with advanced features: Freelance, P2P Trading,
                Multi-Admin System, Real-time Chat, Boost System, and more!
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText("npm run dev:comprehensive");
                    notification.success("Command copied to clipboard!");
                  }}
                  className="text-blue-800 border-blue-300 hover:bg-blue-100"
                >
                  📋 Copy Start Command
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open("http://localhost:3000/admin", "_blank")
                  }
                  className="text-blue-800 border-blue-300 hover:bg-blue-100"
                >
                  🔗 Access Full Admin (Port 3000)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open("/README.comprehensive.md", "_blank")
                  }
                  className="text-blue-800 border-blue-300 hover:bg-blue-100"
                >
                  📖 View Documentation
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Error Alert */}
        {error && (
          <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* System Alert */}
        {(dashboardData?.stats?.pendingModeration || 0) > 0 && (
          <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
            <Bell className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              You have {dashboardData?.stats?.pendingModeration || 0} items
              pending moderation review.
              <Button
                variant="link"
                className="ml-2 h-auto p-0 text-amber-800 dark:text-amber-200"
                onClick={() => navigate("/admin/moderation")}
              >
                Review now →
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="bg-blue-500/10 p-3 rounded-full mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold">
                {formatNumber(dashboardData?.stats?.totalUsers || 0)}
              </CardTitle>
              <CardDescription>Total Users</CardDescription>
              <div className="text-xs text-green-600 mt-1">
                {formatNumber(dashboardData?.stats?.activeUsers || 0)} active
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="bg-orange-500/10 p-3 rounded-full mb-4">
                <ShoppingCart className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle className="text-2xl font-bold">
                {formatNumber(dashboardData?.stats?.totalProducts || 0)}
              </CardTitle>
              <CardDescription>Marketplace</CardDescription>
              <div className="text-xs text-blue-600 mt-1">
                {formatNumber(dashboardData?.stats?.totalJobs || 0)} orders
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="bg-purple-500/10 p-3 rounded-full mb-4">
                <Briefcase className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-2xl font-bold">
                {formatNumber(dashboardData?.stats?.totalJobs || 156)}
              </CardTitle>
              <CardDescription>Freelance Jobs</CardDescription>
              <div className="text-xs text-green-600 mt-1">
                {formatNumber(42)} active
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="bg-yellow-500/10 p-3 rounded-full mb-4">
                <Bitcoin className="h-6 w-6 text-yellow-600" />
              </div>
              <CardTitle className="text-2xl font-bold">
                {formatNumber(dashboardData?.stats?.totalTrades || 89)}
              </CardTitle>
              <CardDescription>P2P Trades</CardDescription>
              <div className="text-xs text-green-600 mt-1">$1.2M volume</div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="bg-indigo-500/10 p-3 rounded-full mb-4">
                <Star className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle className="text-2xl font-bold">
                {formatNumber(27)}
              </CardTitle>
              <CardDescription>Active Boosts</CardDescription>
              <div className="text-xs text-blue-600 mt-1">
                5 pending approval
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="bg-red-500/10 p-3 rounded-full mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold">
                {dashboardData?.stats?.pendingModeration || 0}
              </CardTitle>
              <CardDescription>Pending Reviews</CardDescription>
              <div className="text-xs text-red-600 mt-1">
                Requires attention
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="freelance">Freelance</TabsTrigger>
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            <TabsTrigger value="crypto">P2P Trading</TabsTrigger>
            <TabsTrigger value="moderation">Moderation</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Comprehensive Feature Showcase */}
            <div className="mb-6">
              <ComprehensiveFeatureShowcase />
            </div>

            {/* Live Feature Demos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <WalletWidget />
              <PremiumStatusWidget />
              <ApiHealthChecker />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Activity</CardTitle>
                  <CardDescription>
                    Monthly posts and user growth
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={userActivityData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="posts" fill="#8884d8" name="Posts" />
                        <Bar dataKey="users" fill="#82ca9d" name="New Users" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Administrators</CardTitle>
                  <CardDescription>
                    Currently online admin users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(dashboardData?.activeAdmins || [])
                      .slice(0, 8)
                      .map((admin) => (
                        <div
                          key={admin.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {admin.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {admin.name}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {admin.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {(admin.roles || []).slice(0, 2).map((role) => (
                              <Badge
                                key={role}
                                variant="secondary"
                                className="text-xs"
                              >
                                {role.replace("_", " ")}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Admin Activity
                </CardTitle>
                <CardDescription>
                  Latest administrative actions across the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(dashboardData?.recentActivity || [])
                    .slice(0, 10)
                    .map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            <span className="text-blue-600">
                              {activity.adminName}
                            </span>{" "}
                            {activity.action.replace("_", " ")}
                            <span className="text-gray-600">
                              {" "}
                              {activity.targetType}
                            </span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(activity.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {activity.action}
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="moderation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Content Moderation Queue
                </CardTitle>
                <CardDescription>
                  Items requiring administrative review
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(dashboardData?.pendingModeration || [])
                    .slice(0, 5)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{item.contentType}</Badge>
                            <Badge
                              variant={
                                item.priority === "high"
                                  ? "destructive"
                                  : item.priority === "medium"
                                    ? "default"
                                    : "secondary"
                              }
                            >
                              {item.priority}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium">{item.reason}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            {item.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Reported {new Date(item.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button size="sm" variant="outline">
                            Review
                          </Button>
                          <Button size="sm" variant="destructive">
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    User Management
                  </CardTitle>
                  <CardDescription>
                    Recent user registrations and activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        name: "John Doe",
                        email: "john@example.com",
                        status: "active",
                        role: "user",
                      },
                      {
                        name: "Jane Smith",
                        email: "jane@example.com",
                        status: "verified",
                        role: "premium",
                      },
                      {
                        name: "Bob Johnson",
                        email: "bob@example.com",
                        status: "pending",
                        role: "user",
                      },
                      {
                        name: "Alice Brown",
                        email: "alice@example.com",
                        status: "active",
                        role: "seller",
                      },
                    ].map((user, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge
                            variant={
                              user.status === "active" ? "default" : "secondary"
                            }
                          >
                            {user.status}
                          </Badge>
                          <Badge variant="outline">{user.role}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" className="w-full">
                      View All Users
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5" />
                    KYC Verification Queue
                  </CardTitle>
                  <CardDescription>
                    Users pending identity verification
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        name: "Sarah Wilson",
                        submitted: "2 hours ago",
                        status: "pending",
                      },
                      {
                        name: "Mike Chen",
                        submitted: "5 hours ago",
                        status: "under_review",
                      },
                      {
                        name: "Lisa Garcia",
                        submitted: "1 day ago",
                        status: "pending",
                      },
                    ].map((kyc, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{kyc.name}</p>
                          <p className="text-sm text-gray-600">
                            Submitted {kyc.submitted}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            Review
                          </Button>
                          <Button size="sm">Approve</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="freelance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Freelance Jobs Overview
                  </CardTitle>
                  <CardDescription>
                    Active jobs and project management
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">42</p>
                        <p className="text-sm text-gray-600">Active Jobs</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">28</p>
                        <p className="text-sm text-gray-600">In Progress</p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">
                          156
                        </p>
                        <p className="text-sm text-gray-600">Completed</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      Manage Freelance Jobs
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Escrow Management
                  </CardTitle>
                  <CardDescription>
                    Active escrow contracts and payments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        project: "Website Development",
                        amount: "$2,500",
                        status: "funded",
                        client: "Tech Corp",
                      },
                      {
                        project: "Logo Design",
                        amount: "$500",
                        status: "pending",
                        client: "StartupXYZ",
                      },
                      {
                        project: "Mobile App",
                        amount: "$8,000",
                        status: "milestone",
                        client: "InnovateCo",
                      },
                    ].map((escrow, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{escrow.project}</p>
                          <p className="text-sm text-gray-600">
                            {escrow.client}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{escrow.amount}</p>
                          <Badge
                            variant={
                              escrow.status === "funded"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {escrow.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="marketplace" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Marketplace Analytics
                  </CardTitle>
                  <CardDescription>
                    Sales performance and product metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-green-50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-green-600">
                          $12.5K
                        </p>
                        <p className="text-sm text-gray-600">Today's Sales</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-blue-600">89</p>
                        <p className="text-sm text-gray-600">Orders</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Top Categories</p>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm">Electronics</span>
                          <span className="text-sm font-medium">45%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Fashion</span>
                          <span className="text-sm font-medium">32%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Home & Garden</span>
                          <span className="text-sm font-medium">23%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flag className="w-5 h-5" />
                    Product Reviews & Disputes
                  </CardTitle>
                  <CardDescription>
                    Content moderation and dispute resolution
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        product: "Wireless Headphones",
                        issue: "Quality complaint",
                        priority: "high",
                      },
                      {
                        product: "Smartphone Case",
                        issue: "Shipping delay",
                        priority: "medium",
                      },
                      {
                        product: "Gaming Mouse",
                        issue: "False advertising",
                        priority: "high",
                      },
                    ].map((dispute, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{dispute.product}</p>
                          <p className="text-sm text-gray-600">
                            {dispute.issue}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge
                            variant={
                              dispute.priority === "high"
                                ? "destructive"
                                : "default"
                            }
                          >
                            {dispute.priority}
                          </Badge>
                          <Button size="sm" variant="outline">
                            Resolve
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="crypto" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bitcoin className="w-5 h-5" />
                    P2P Trading Overview
                  </CardTitle>
                  <CardDescription>
                    Cryptocurrency trading statistics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-3 bg-yellow-50 rounded-lg">
                        <p className="text-2xl font-bold text-yellow-600">89</p>
                        <p className="text-sm text-gray-600">Active Trades</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">
                          $1.2M
                        </p>
                        <p className="text-sm text-gray-600">24h Volume</p>
                      </div>
                      <div className="p-3 bg-red-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">3</p>
                        <p className="text-sm text-gray-600">Disputes</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">
                        Popular Trading Pairs
                      </p>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm">USDT/USD</span>
                          <span className="text-sm font-medium">$450K</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">BTC/USD</span>
                          <span className="text-sm font-medium">$380K</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">ETH/USD</span>
                          <span className="text-sm font-medium">$290K</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Trade Disputes
                  </CardTitle>
                  <CardDescription>
                    Active disputes requiring resolution
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        trade: "BTC/USD #1234",
                        issue: "Payment not received",
                        status: "open",
                        amount: "$5,200",
                      },
                      {
                        trade: "USDT/USD #1235",
                        issue: "Crypto not released",
                        status: "investigating",
                        amount: "$1,800",
                      },
                      {
                        trade: "ETH/USD #1236",
                        issue: "Fraud suspected",
                        status: "escalated",
                        amount: "$3,400",
                      },
                    ].map((dispute, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{dispute.trade}</p>
                          <p className="text-sm text-gray-600">
                            {dispute.issue}
                          </p>
                          <p className="text-sm font-medium text-green-600">
                            {dispute.amount}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge
                            variant={
                              dispute.status === "escalated"
                                ? "destructive"
                                : "default"
                            }
                          >
                            {dispute.status}
                          </Badge>
                          <Button size="sm" variant="outline">
                            Review
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Platform Earnings
                  </CardTitle>
                  <CardDescription>
                    Revenue from fees and subscriptions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-green-50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-green-600">
                          $8.4K
                        </p>
                        <p className="text-sm text-gray-600">Today</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          $156K
                        </p>
                        <p className="text-sm text-gray-600">This Month</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Revenue Sources</p>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Freelance Fees (10%)</span>
                          <span className="text-sm font-medium">$2.1K</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Marketplace Fees (5%)</span>
                          <span className="text-sm font-medium">$3.2K</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Trading Fees (0.3%)</span>
                          <span className="text-sm font-medium">$1.8K</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Premium Subscriptions</span>
                          <span className="text-sm font-medium">$1.3K</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Boost System
                  </CardTitle>
                  <CardDescription>
                    Content promotion and advertising revenue
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-purple-50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-purple-600">27</p>
                        <p className="text-sm text-gray-600">Active Boosts</p>
                      </div>
                      <div className="p-3 bg-orange-50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-orange-600">5</p>
                        <p className="text-sm text-gray-600">Pending</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">
                        Pending Boost Approvals
                      </p>
                      {[
                        {
                          item: "Job: React Developer",
                          type: "featured",
                          cost: "$100",
                        },
                        {
                          item: "Product: Gaming Setup",
                          type: "top_listing",
                          cost: "$200",
                        },
                        {
                          item: "Post: Tutorial Video",
                          type: "highlight",
                          cost: "$50",
                        },
                      ].map((boost, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 border rounded"
                        >
                          <div>
                            <p className="text-sm font-medium">{boost.item}</p>
                            <p className="text-xs text-gray-600">
                              {boost.type} - {boost.cost}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline">
                              Approve
                            </Button>
                            <Button size="sm" variant="destructive">
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="w-5 h-5" />
                    System Health
                  </CardTitle>
                  <CardDescription>
                    Real-time system performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {systemHealthData.map((metric) => (
                      <div key={metric.name} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{metric.name}</span>
                          <span className="font-medium">{metric.value}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${metric.value}%`,
                              backgroundColor: metric.color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    API Performance
                  </CardTitle>
                  <CardDescription>
                    API response times and error rates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm">Average Latency</span>
                      <span className="font-medium text-green-600">
                        {dashboardData?.systemHealth?.apiLatency || 0}ms
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm">Error Rate</span>
                      <span className="font-medium text-red-600">
                        {(
                          (dashboardData?.systemHealth?.errorRate || 0) * 100
                        ).toFixed(2)}
                        %
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm">WebSocket Connections</span>
                      <span className="font-medium text-blue-600">
                        342 active
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm">Database Connections</span>
                      <span className="font-medium text-green-600">
                        12/50 pool
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
