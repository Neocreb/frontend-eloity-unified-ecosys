import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Settings,
  Users,
  Shield,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Star,
  Activity,
  Database,
  RefreshCw,
  Download,
  Upload,
  Ban,
  CheckCircle,
  XCircle,
  Edit,
  Save,
  Eye,
  EyeOff,
  Filter,
  Search,
  BarChart3,
  PieChart,
  Calendar,
  Clock,
  Target,
  Zap,
  Flag,
  Award,
} from "lucide-react";
import { formatCurrency, formatNumber } from "@/utils/formatters";
import { useToast } from "@/hooks/use-toast";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface RewardRule {
  id: string;
  actionType: string;
  displayName: string;
  description: string;
  baseEloits: number;
  baseWalletBonus: number;
  currency: string;
  dailyLimit?: number;
  weeklyLimit?: number;
  monthlyLimit?: number;
  minimumTrustScore: number;
  minimumValue?: number;
  decayEnabled: boolean;
  decayStart: number;
  decayRate: number;
  minMultiplier: number;
  requiresModeration: boolean;
  qualityThreshold: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PlatformStats {
  totalUsers: number;
  activeUsers24h: number;
  totalEloitsIssued: number;
  totalWalletBonusPaid: number;
  totalActivities: number;
  flaggedUsers: number;
  pendingReviews: number;
  dailyActivity: Array<{ date: string; count: number; eloits: number }>;
}

interface FraudAlert {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  riskScore: number;
  riskLevel: string;
  detectionMethod: string;
  flaggedActions: string[];
  riskFactors: Array<{
    factor: string;
    weight: number;
    description: string;
  }>;
  actionTaken: string;
  reviewStatus: string;
  createdAt: string;
}

interface UserTrustScore {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  currentScore: number;
  trustLevel: string;
  rewardMultiplier: number;
  totalActivities: number;
  suspiciousActivityCount: number;
  isFrozen: boolean;
  freezeReason?: string;
  lastCalculatedAt: string;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const ActivityEconomyAdmin: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);

  // State
  const [rewardRules, setRewardRules] = useState<RewardRule[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(
    null,
  );
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [userTrustScores, setUserTrustScores] = useState<UserTrustScore[]>([]);
  const [editingRule, setEditingRule] = useState<RewardRule | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    loadAdminData();
  }, []);

  // =============================================================================
  // DATA LOADING
  // =============================================================================

  const loadAdminData = async () => {
    try {
      setIsLoading(true);

      // Demo data - in production, these would be API calls
      setRewardRules([
        {
          id: "1",
          actionType: "like_post",
          displayName: "Like Post",
          description: "User likes a post",
          baseEloits: 0.5,
          baseWalletBonus: 0,
          currency: "USDT",
          dailyLimit: 100,
          minimumTrustScore: 0,
          decayEnabled: true,
          decayStart: 20,
          decayRate: 0.1,
          minMultiplier: 0.1,
          requiresModeration: false,
          qualityThreshold: 0,
          isActive: true,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "2",
          actionType: "post_content",
          displayName: "Create Post",
          description: "User creates a new post",
          baseEloits: 3,
          baseWalletBonus: 0,
          currency: "USDT",
          dailyLimit: 5,
          minimumTrustScore: 20,
          decayEnabled: true,
          decayStart: 3,
          decayRate: 0.2,
          minMultiplier: 0.2,
          requiresModeration: true,
          qualityThreshold: 0.8,
          isActive: true,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "3",
          actionType: "purchase_product",
          displayName: "Purchase Product",
          description: "User makes a purchase",
          baseEloits: 5,
          baseWalletBonus: 0.01,
          currency: "USDT",
          minimumValue: 10,
          minimumTrustScore: 30,
          decayEnabled: false,
          decayStart: 1,
          decayRate: 0,
          minMultiplier: 1,
          requiresModeration: false,
          qualityThreshold: 0,
          isActive: true,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
      ]);

      setPlatformStats({
        totalUsers: 45672,
        activeUsers24h: 8934,
        totalEloitsIssued: 2456789,
        totalWalletBonusPaid: 8947.32, // Match centralized e-commerce balance
        totalActivities: 156789,
        flaggedUsers: 23,
        pendingReviews: 7,
        dailyActivity: [
          { date: "2024-01-01", count: 1234, eloits: 5678 },
          { date: "2024-01-02", count: 1456, eloits: 6234 },
          { date: "2024-01-03", count: 1678, eloits: 7123 },
          { date: "2024-01-04", count: 1234, eloits: 5897 },
          { date: "2024-01-05", count: 1567, eloits: 6789 },
          { date: "2024-01-06", count: 1789, eloits: 7456 },
          { date: "2024-01-07", count: 1890, eloits: 8123 },
        ],
      });

      setFraudAlerts([
        {
          id: "1",
          userId: "user1",
          userName: "SuspiciousUser1",
          riskScore: 85,
          riskLevel: "high",
          detectionMethod: "rule_based",
          flaggedActions: ["like_post", "comment_post"],
          riskFactors: [
            {
              factor: "high_frequency",
              weight: 0.4,
              description: "Unusually high activity frequency",
            },
            {
              factor: "rapid_interaction",
              weight: 0.3,
              description: "Very fast interactions",
            },
          ],
          actionTaken: "flag",
          reviewStatus: "pending",
          createdAt: "2024-01-07T10:30:00Z",
        },
        {
          id: "2",
          userId: "user2",
          userName: "BotLikeUser",
          riskScore: 92,
          riskLevel: "critical",
          detectionMethod: "ml_model",
          flaggedActions: ["like_post"],
          riskFactors: [
            {
              factor: "regular_intervals",
              weight: 0.5,
              description: "Suspiciously regular activity intervals",
            },
            {
              factor: "missing_device_info",
              weight: 0.2,
              description: "Missing device identification",
            },
          ],
          actionTaken: "freeze_account",
          reviewStatus: "reviewing",
          createdAt: "2024-01-07T09:15:00Z",
        },
      ]);

      setUserTrustScores([
        {
          id: "1",
          userId: "user3",
          userName: "TrustedUser1",
          currentScore: 89.5,
          trustLevel: "gold",
          rewardMultiplier: 1.0,
          totalActivities: 1234,
          suspiciousActivityCount: 0,
          isFrozen: false,
          lastCalculatedAt: "2024-01-07T00:00:00Z",
        },
        {
          id: "2",
          userId: "user4",
          userName: "NewUser1",
          currentScore: 45.2,
          trustLevel: "bronze",
          rewardMultiplier: 0.5,
          totalActivities: 67,
          suspiciousActivityCount: 2,
          isFrozen: false,
          lastCalculatedAt: "2024-01-07T00:00:00Z",
        },
      ]);
    } catch (error) {
      console.error("Error loading admin data:", error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // =============================================================================
  // ACTIONS
  // =============================================================================

  const updateRewardRule = async (rule: RewardRule) => {
    try {
      // In production, this would be an API call
      const updatedRules = rewardRules.map((r) =>
        r.id === rule.id ? { ...rule, updatedAt: new Date().toISOString() } : r,
      );
      setRewardRules(updatedRules);
      setEditingRule(null);

      toast({
        title: "Success",
        description: "Reward rule updated successfully",
      });
    } catch (error) {
      console.error("Error updating reward rule:", error);
      toast({
        title: "Error",
        description: "Failed to update reward rule",
        variant: "destructive",
      });
    }
  };

  const toggleRuleStatus = async (ruleId: string) => {
    try {
      const updatedRules = rewardRules.map((rule) =>
        rule.id === ruleId
          ? {
              ...rule,
              isActive: !rule.isActive,
              updatedAt: new Date().toISOString(),
            }
          : rule,
      );
      setRewardRules(updatedRules);

      toast({
        title: "Success",
        description: "Rule status updated",
      });
    } catch (error) {
      console.error("Error toggling rule status:", error);
      toast({
        title: "Error",
        description: "Failed to update rule status",
        variant: "destructive",
      });
    }
  };

  const handleFraudAlert = async (alertId: string, action: string) => {
    try {
      const updatedAlerts = fraudAlerts.map((alert) =>
        alert.id === alertId
          ? {
              ...alert,
              actionTaken: action,
              reviewStatus: action === "dismiss" ? "resolved" : "reviewing",
            }
          : alert,
      );
      setFraudAlerts(updatedAlerts);

      toast({
        title: "Success",
        description: `Fraud alert ${action}ed successfully`,
      });
    } catch (error) {
      console.error("Error handling fraud alert:", error);
      toast({
        title: "Error",
        description: "Failed to handle fraud alert",
        variant: "destructive",
      });
    }
  };

  const freezeUser = async (userId: string, reason: string) => {
    try {
      const updatedScores = userTrustScores.map((score) =>
        score.userId === userId
          ? { ...score, isFrozen: true, freezeReason: reason }
          : score,
      );
      setUserTrustScores(updatedScores);

      toast({
        title: "Success",
        description: "User account frozen",
      });
    } catch (error) {
      console.error("Error freezing user:", error);
      toast({
        title: "Error",
        description: "Failed to freeze user",
        variant: "destructive",
      });
    }
  };

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getTrustLevelColor = (level: string) => {
    switch (level) {
      case "diamond":
        return "bg-gradient-to-r from-blue-400 to-purple-500 text-white";
      case "platinum":
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
      case "gold":
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
      case "silver":
        return "bg-gradient-to-r from-gray-200 to-gray-400 text-gray-800";
      default:
        return "bg-gradient-to-r from-orange-400 to-red-500 text-white";
    }
  };

  const filteredFraudAlerts = fraudAlerts.filter((alert) => {
    const matchesSearch = alert.userName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || alert.reviewStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Activity Economy Admin</h1>
          <p className="text-muted-foreground">
            Manage reward rules, monitor fraud, and oversee the activity economy
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadAdminData}
            disabled={isLoading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Users</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatNumber(platformStats?.totalUsers || 0)}
                </p>
                <p className="text-xs text-blue-600">
                  {formatNumber(platformStats?.activeUsers24h || 0)} active
                  today
                </p>
              </div>
              <div className="p-3 bg-blue-200 rounded-full">
                <Users className="w-6 h-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">
                  Eloits Issued
                </p>
                <p className="text-2xl font-bold text-purple-900">
                  {formatNumber(platformStats?.totalEloitsIssued || 0)}
                </p>
                <p className="text-xs text-purple-600">Total distributed</p>
              </div>
              <div className="p-3 bg-purple-200 rounded-full">
                <Star className="w-6 h-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">
                  Wallet Bonus Paid
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(platformStats?.totalWalletBonusPaid || 0)}
                </p>
                <p className="text-xs text-green-600">Total rewards</p>
              </div>
              <div className="p-3 bg-green-200 rounded-full">
                <DollarSign className="w-6 h-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Fraud Alerts</p>
                <p className="text-2xl font-bold text-red-900">
                  {formatNumber(platformStats?.flaggedUsers || 0)}
                </p>
                <p className="text-xs text-red-600">
                  {platformStats?.pendingReviews || 0} pending review
                </p>
              </div>
              <div className="p-3 bg-red-200 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rules">Reward Rules</TabsTrigger>
          <TabsTrigger value="fraud">Fraud Detection</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {platformStats?.dailyActivity.slice(-5).map((day, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {new Date(day.date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatNumber(day.count)} activities
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">
                          {formatNumber(day.eloits)} ELO
                        </p>
                        <p className="text-xs text-muted-foreground">
                          distributed
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Fraud Detection</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Trust Score Engine</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Running
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Reward Processing</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Normal
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database Performance</span>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <Clock className="w-3 h-3 mr-1" />
                      Monitoring
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Critical Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Critical Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {fraudAlerts
                  .filter((alert) => alert.riskLevel === "critical")
                  .slice(0, 3)
                  .map((alert) => (
                    <Alert key={alert.id} className="border-red-200">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <AlertDescription>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              High-risk user detected: {alert.userName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Risk Score: {alert.riskScore}% •{" "}
                              {alert.detectionMethod}
                            </p>
                          </div>
                          <Button size="sm" variant="destructive">
                            Review
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reward Rules Tab */}
        <TabsContent value="rules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reward Rules Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rewardRules.map((rule) => (
                  <div key={rule.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{rule.displayName}</h3>
                          <Badge
                            variant={rule.isActive ? "default" : "secondary"}
                          >
                            {rule.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {rule.requiresModeration && (
                            <Badge variant="outline" className="text-xs">
                              <Eye className="w-3 h-3 mr-1" />
                              Moderated
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {rule.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingRule(rule)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Switch
                          checked={rule.isActive}
                          onCheckedChange={() => toggleRuleStatus(rule.id)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Base Reward</p>
                        <p className="font-medium">{rule.baseEloits} ELO</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Wallet Bonus</p>
                        <p className="font-medium">
                          {rule.baseWalletBonus > 0
                            ? `${rule.baseWalletBonus} ${rule.currency}`
                            : "None"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Daily Limit</p>
                        <p className="font-medium">
                          {rule.dailyLimit || "Unlimited"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Min Trust Score</p>
                        <p className="font-medium">{rule.minimumTrustScore}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Rule Editor Modal */}
          {editingRule && (
            <Card className="fixed inset-0 z-50 m-8 overflow-auto bg-background shadow-lg">
              <CardHeader>
                <CardTitle>
                  Edit Reward Rule: {editingRule.displayName}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="baseEloits">Base Eloits</Label>
                    <Input
                      id="baseEloits"
                      type="number"
                      value={editingRule.baseEloits}
                      onChange={(e) =>
                        setEditingRule({
                          ...editingRule,
                          baseEloits: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="baseWalletBonus">Base Wallet Bonus</Label>
                    <Input
                      id="baseWalletBonus"
                      type="number"
                      step="0.001"
                      value={editingRule.baseWalletBonus}
                      onChange={(e) =>
                        setEditingRule({
                          ...editingRule,
                          baseWalletBonus: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="dailyLimit">Daily Limit</Label>
                    <Input
                      id="dailyLimit"
                      type="number"
                      value={editingRule.dailyLimit || ""}
                      onChange={(e) =>
                        setEditingRule({
                          ...editingRule,
                          dailyLimit: e.target.value
                            ? parseInt(e.target.value)
                            : undefined,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="minimumTrustScore">
                      Minimum Trust Score
                    </Label>
                    <Input
                      id="minimumTrustScore"
                      type="number"
                      value={editingRule.minimumTrustScore}
                      onChange={(e) =>
                        setEditingRule({
                          ...editingRule,
                          minimumTrustScore: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editingRule.description}
                    onChange={(e) =>
                      setEditingRule({
                        ...editingRule,
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="decayEnabled"
                      checked={editingRule.decayEnabled}
                      onCheckedChange={(checked) =>
                        setEditingRule({
                          ...editingRule,
                          decayEnabled: checked,
                        })
                      }
                    />
                    <Label htmlFor="decayEnabled">Enable Decay</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requiresModeration"
                      checked={editingRule.requiresModeration}
                      onCheckedChange={(checked) =>
                        setEditingRule({
                          ...editingRule,
                          requiresModeration: checked,
                        })
                      }
                    />
                    <Label htmlFor="requiresModeration">
                      Requires Moderation
                    </Label>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <Button onClick={() => updateRewardRule(editingRule)}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingRule(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Fraud Detection Tab */}
        <TabsContent value="fraud" className="space-y-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Alerts</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewing">Reviewing</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Fraud Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredFraudAlerts.map((alert) => (
                  <div key={alert.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{alert.userName}</h3>
                          <Badge className={getRiskLevelColor(alert.riskLevel)}>
                            {alert.riskLevel.toUpperCase()} RISK
                          </Badge>
                          <Badge variant="outline">{alert.reviewStatus}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Risk Score: {alert.riskScore}% • Detected:{" "}
                          {new Date(alert.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFraudAlert(alert.id, "dismiss")}
                        >
                          Dismiss
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleFraudAlert(alert.id, "freeze")}
                        >
                          <Ban className="w-4 h-4 mr-1" />
                          Freeze
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="font-medium">Flagged Actions:</p>
                        <div className="flex gap-1">
                          {alert.flaggedActions.map((action, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {action}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="font-medium">Risk Factors:</p>
                        <ul className="text-xs text-muted-foreground ml-4">
                          {alert.riskFactors.map((factor, index) => (
                            <li key={index}>
                              • {factor.description} (Weight: {factor.weight})
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Management Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Trust Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userTrustScores.map((user) => (
                  <div key={user.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{user.userName}</h3>
                          <Badge
                            className={getTrustLevelColor(user.trustLevel)}
                          >
                            {user.trustLevel.toUpperCase()}
                          </Badge>
                          {user.isFrozen && (
                            <Badge variant="destructive">
                              <Ban className="w-3 h-3 mr-1" />
                              Frozen
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Trust Score: {user.currentScore.toFixed(1)} •
                          {user.totalActivities} activities •
                          {user.suspiciousActivityCount} suspicious
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!user.isFrozen ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              freezeUser(user.userId, "Manual admin action")
                            }
                          >
                            <Ban className="w-4 h-4 mr-1" />
                            Freeze
                          </Button>
                        ) : (
                          <p className="text-xs text-red-600">
                            Reason: {user.freezeReason}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">
                          Reward Multiplier
                        </p>
                        <p className="font-medium">{user.rewardMultiplier}x</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Last Updated</p>
                        <p className="font-medium">
                          {new Date(user.lastCalculatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <p className="font-medium">
                          {user.isFrozen ? "Frozen" : "Active"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activity Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Daily Activity Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Chart visualization would go here
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Reward Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Reward Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Pie chart would go here
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {formatNumber(platformStats?.totalActivities || 0)}
                  </p>
                  <p className="text-sm text-blue-600">Total Activities</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">95.2%</p>
                  <p className="text-sm text-green-600">System Uptime</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">2.3s</p>
                  <p className="text-sm text-purple-600">Avg Response Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ActivityEconomyAdmin;
