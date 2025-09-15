import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Settings,
  Shield,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  Download,
  Search,
  Filter,
  Eye,
  Ban,
  Crown,
  DollarSign,
  TrendingUp,
  Award,
  Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatNumber } from "@/utils/formatters";

interface RewardRule {
  id: string;
  actionType: string;
  displayName: string;
  description: string;
  baseSoftPoints: number;
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

interface UserTrustScore {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  currentScore: number;
  trustLevel: string;
  rewardMultiplier: number;
  dailySoftPointsCap: number;
  totalActivities: number;
  suspiciousActivityCount: number;
  isFrozen: boolean;
  freezeReason?: string;
  lastActivity: string;
}

interface FraudDetection {
  id: string;
  userId: string;
  userName: string;
  riskScore: number;
  riskLevel: string;
  detectionMethod: string;
  flaggedActions: string[];
  actionTaken: string;
  reviewStatus: string;
  createdAt: string;
}

interface AdminStats {
  totalUsers: number;
  totalSoftPointsIssued: number;
  totalWalletBonusIssued: number;
  totalActivitiesTracked: number;
  fraudDetectionCount: number;
  frozenAccountsCount: number;
  averageTrustScore: number;
  topActiveUsers: Array<{
    userId: string;
    userName: string;
    totalPoints: number;
    totalActivities: number;
  }>;
}

const RewardSystemAdmin: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);

  // State
  const [rewardRules, setRewardRules] = useState<RewardRule[]>([]);
  const [userTrustScores, setUserTrustScores] = useState<UserTrustScore[]>([]);
  const [fraudDetections, setFraudDetections] = useState<FraudDetection[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);

  // Filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Dialog states
  const [editingRule, setEditingRule] = useState<RewardRule | null>(null);
  const [newRule, setNewRule] = useState<Partial<RewardRule>>({});
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      // In a real app, these would be actual API calls
      await Promise.all([
        loadRewardRules(),
        loadUserTrustScores(),
        loadFraudDetections(),
        loadAdminStats(),
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

  const loadRewardRules = async () => {
    // Demo data - replace with actual API call
    setRewardRules([
      {
        id: "1",
        actionType: "post_content",
        displayName: "Create Post",
        description: "Reward for creating quality content",
        baseSoftPoints: 3,
        baseWalletBonus: 0,
        currency: "USDT",
        dailyLimit: 10,
        weeklyLimit: 50,
        monthlyLimit: 200,
        minimumTrustScore: 0,
        decayEnabled: true,
        decayStart: 3,
        decayRate: 0.15,
        minMultiplier: 0.2,
        requiresModeration: false,
        qualityThreshold: 0.5,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "2",
        actionType: "like_post",
        displayName: "Like Post",
        description: "Reward for engaging with content",
        baseSoftPoints: 0.5,
        baseWalletBonus: 0,
        currency: "USDT",
        dailyLimit: 100,
        weeklyLimit: 500,
        monthlyLimit: 2000,
        minimumTrustScore: 0,
        decayEnabled: true,
        decayStart: 50,
        decayRate: 0.1,
        minMultiplier: 0.1,
        requiresModeration: false,
        qualityThreshold: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
  };

  const loadUserTrustScores = async () => {
    // Demo data
    setUserTrustScores([
      {
        id: "1",
        userId: "user1",
        userName: "john_doe",
        userEmail: "john@example.com",
        currentScore: 85.5,
        trustLevel: "gold",
        rewardMultiplier: 1.5,
        dailySoftPointsCap: 150,
        totalActivities: 1247,
        suspiciousActivityCount: 2,
        isFrozen: false,
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "2",
        userId: "user2",
        userName: "suspicious_user",
        userEmail: "suspicious@example.com",
        currentScore: 25.0,
        trustLevel: "bronze",
        rewardMultiplier: 0.5,
        dailySoftPointsCap: 25,
        totalActivities: 50,
        suspiciousActivityCount: 15,
        isFrozen: true,
        freezeReason: "Automated fraud detection",
        lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      },
    ]);
  };

  const loadFraudDetections = async () => {
    // Demo data
    setFraudDetections([
      {
        id: "1",
        userId: "user2",
        userName: "suspicious_user",
        riskScore: 85,
        riskLevel: "high",
        detectionMethod: "ml_model",
        flaggedActions: ["like_post", "comment_post"],
        actionTaken: "freeze_account",
        reviewStatus: "pending",
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      },
    ]);
  };

  const loadAdminStats = async () => {
    // Demo data
    setAdminStats({
      totalUsers: 12847,
      totalSoftPointsIssued: 1547892,
      totalWalletBonusIssued: 25678.45,
      totalActivitiesTracked: 847593,
      fraudDetectionCount: 23,
      frozenAccountsCount: 5,
      averageTrustScore: 72.3,
      topActiveUsers: [
        {
          userId: "user1",
          userName: "john_doe",
          totalPoints: 2450,
          totalActivities: 1247,
        },
        {
          userId: "user3",
          userName: "creator_pro",
          totalPoints: 3891,
          totalActivities: 1890,
        },
        {
          userId: "user4",
          userName: "social_butterfly",
          totalPoints: 1567,
          totalActivities: 2340,
        },
      ],
    });
  };

  const updateRewardRule = async (rule: RewardRule) => {
    try {
      // API call would go here
      setRewardRules((prev) => prev.map((r) => (r.id === rule.id ? rule : r)));
      toast({
        title: "Rule Updated",
        description: `${rule.displayName} has been updated successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update reward rule",
        variant: "destructive",
      });
    }
  };

  const createRewardRule = async (rule: Partial<RewardRule>) => {
    try {
      // API call would go here
      const newRuleWithId = {
        ...rule,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as RewardRule;

      setRewardRules((prev) => [...prev, newRuleWithId]);
      setIsCreateDialogOpen(false);
      setNewRule({});

      toast({
        title: "Rule Created",
        description: `${rule.displayName} has been created successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create reward rule",
        variant: "destructive",
      });
    }
  };

  const deleteRewardRule = async (ruleId: string) => {
    try {
      // API call would go here
      setRewardRules((prev) => prev.filter((r) => r.id !== ruleId));
      toast({
        title: "Rule Deleted",
        description: "Reward rule has been deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete reward rule",
        variant: "destructive",
      });
    }
  };

  const freezeUser = async (userId: string, reason: string) => {
    try {
      // API call would go here
      setUserTrustScores((prev) =>
        prev.map((user) =>
          user.userId === userId
            ? { ...user, isFrozen: true, freezeReason: reason }
            : user,
        ),
      );

      toast({
        title: "User Frozen",
        description: "User has been frozen from the reward system",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to freeze user",
        variant: "destructive",
      });
    }
  };

  const unfreezeUser = async (userId: string) => {
    try {
      // API call would go here
      setUserTrustScores((prev) =>
        prev.map((user) =>
          user.userId === userId
            ? { ...user, isFrozen: false, freezeReason: undefined }
            : user,
        ),
      );

      toast({
        title: "User Unfrozen",
        description: "User has been unfrozen and can earn rewards again",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unfreeze user",
        variant: "destructive",
      });
    }
  };

  const adjustTrustScore = async (
    userId: string,
    newScore: number,
    reason: string,
  ) => {
    try {
      // API call would go here
      setUserTrustScores((prev) =>
        prev.map((user) =>
          user.userId === userId ? { ...user, currentScore: newScore } : user,
        ),
      );

      toast({
        title: "Trust Score Updated",
        description: `Trust score adjusted to ${newScore}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to adjust trust score",
        variant: "destructive",
      });
    }
  };

  const exportData = async (type: "rules" | "users" | "fraud") => {
    try {
      // In a real app, this would generate and download a CSV/Excel file
      toast({
        title: "Export Started",
        description: `Exporting ${type} data...`,
      });

      // Simulate export delay
      setTimeout(() => {
        toast({
          title: "Export Complete",
          description: `${type} data has been exported successfully`,
        });
      }, 2000);
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reward System Administration</h1>
          <p className="text-muted-foreground">
            Manage reward rules, user trust scores, and fraud detection
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
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Users</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatNumber(adminStats?.totalUsers || 0)}
                </p>
                <p className="text-xs text-blue-600">
                  Avg Trust: {adminStats?.averageTrustScore.toFixed(1)}
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
                  SoftPoints Issued
                </p>
                <p className="text-2xl font-bold text-purple-900">
                  {formatNumber(adminStats?.totalSoftPointsIssued || 0)}
                </p>
                <p className="text-xs text-purple-600">Platform-wide</p>
              </div>
              <div className="p-3 bg-purple-200 rounded-full">
                <Award className="w-6 h-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">
                  Wallet Bonuses
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(adminStats?.totalWalletBonusIssued || 0)}
                </p>
                <p className="text-xs text-green-600">Total distributed</p>
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
                <p className="text-sm font-medium text-red-700">
                  Fraud Detections
                </p>
                <p className="text-2xl font-bold text-red-900">
                  {adminStats?.fraudDetectionCount || 0}
                </p>
                <p className="text-xs text-red-600">
                  {adminStats?.frozenAccountsCount || 0} frozen accounts
                </p>
              </div>
              <div className="p-3 bg-red-200 rounded-full">
                <Shield className="w-6 h-6 text-red-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rules">Reward Rules</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="fraud">Fraud Detection</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Active Users */}
            <Card>
              <CardHeader>
                <CardTitle>Top Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {adminStats?.topActiveUsers.map((user, index) => (
                    <div
                      key={user.userId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className="w-6 h-6 flex items-center justify-center"
                        >
                          {index + 1}
                        </Badge>
                        <div>
                          <p className="font-medium text-sm">{user.userName}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.totalActivities} activities
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm text-purple-600">
                          {formatNumber(user.totalPoints)} SP
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
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium">Reward System</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      Online
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium">
                        Fraud Detection
                      </span>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      Active
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium">Trust Scoring</span>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      Optimized
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reward Rules Tab */}
        <TabsContent value="rules" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Reward Rules Management</h3>
            <div className="flex gap-2">
              <Button
                onClick={() => exportData("rules")}
                variant="outline"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    New Rule
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Reward Rule</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="actionType">Action Type</Label>
                        <Input
                          id="actionType"
                          value={newRule.actionType || ""}
                          onChange={(e) =>
                            setNewRule((prev) => ({
                              ...prev,
                              actionType: e.target.value,
                            }))
                          }
                          placeholder="e.g., post_content"
                        />
                      </div>
                      <div>
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input
                          id="displayName"
                          value={newRule.displayName || ""}
                          onChange={(e) =>
                            setNewRule((prev) => ({
                              ...prev,
                              displayName: e.target.value,
                            }))
                          }
                          placeholder="e.g., Create Post"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newRule.description || ""}
                        onChange={(e) =>
                          setNewRule((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Describe what this reward is for..."
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="baseSoftPoints">Base SoftPoints</Label>
                        <Input
                          id="baseSoftPoints"
                          type="number"
                          step="0.1"
                          value={newRule.baseSoftPoints || ""}
                          onChange={(e) =>
                            setNewRule((prev) => ({
                              ...prev,
                              baseSoftPoints: parseFloat(e.target.value),
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="baseWalletBonus">Wallet Bonus</Label>
                        <Input
                          id="baseWalletBonus"
                          type="number"
                          step="0.001"
                          value={newRule.baseWalletBonus || ""}
                          onChange={(e) =>
                            setNewRule((prev) => ({
                              ...prev,
                              baseWalletBonus: parseFloat(e.target.value),
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="dailyLimit">Daily Limit</Label>
                        <Input
                          id="dailyLimit"
                          type="number"
                          value={newRule.dailyLimit || ""}
                          onChange={(e) =>
                            setNewRule((prev) => ({
                              ...prev,
                              dailyLimit: parseInt(e.target.value),
                            }))
                          }
                        />
                      </div>
                    </div>

                    <Button
                      onClick={() => createRewardRule(newRule)}
                      className="w-full"
                    >
                      Create Rule
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid gap-4">
            {rewardRules.map((rule) => (
              <Card key={rule.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
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
                      <p className="text-sm text-muted-foreground mb-2">
                        {rule.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>SP: {rule.baseSoftPoints}</span>
                        {rule.baseWalletBonus > 0 && (
                          <span>
                            Bonus: {formatCurrency(rule.baseWalletBonus)}
                          </span>
                        )}
                        {rule.dailyLimit && (
                          <span>Daily Limit: {rule.dailyLimit}</span>
                        )}
                        <span>Min Trust: {rule.minimumTrustScore}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingRule(rule)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Reward Rule
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "
                              {rule.displayName}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteRewardRule(rule.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* User Management Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              User Trust Score Management
            </h3>
            <div className="flex gap-2">
              <Button
                onClick={() => exportData("users")}
                variant="outline"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Trust Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="bronze">Bronze</SelectItem>
                <SelectItem value="silver">Silver</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
                <SelectItem value="platinum">Platinum</SelectItem>
                <SelectItem value="diamond">Diamond</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="frozen">Frozen</SelectItem>
                <SelectItem value="suspicious">Suspicious</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {userTrustScores.map((user) => (
              <Card
                key={user.id}
                className={user.isFrozen ? "border-red-200 bg-red-50" : ""}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{user.userName}</h3>
                        <Badge
                          className={`
                          ${user.trustLevel === "diamond" ? "bg-blue-100 text-blue-800" : ""}
                          ${user.trustLevel === "platinum" ? "bg-gray-100 text-gray-800" : ""}
                          ${user.trustLevel === "gold" ? "bg-yellow-100 text-yellow-800" : ""}
                          ${user.trustLevel === "silver" ? "bg-slate-100 text-slate-800" : ""}
                          ${user.trustLevel === "bronze" ? "bg-orange-100 text-orange-800" : ""}
                        `}
                        >
                          <Crown className="w-3 h-3 mr-1" />
                          {user.trustLevel}
                        </Badge>
                        {user.isFrozen && (
                          <Badge variant="destructive">
                            <Ban className="w-3 h-3 mr-1" />
                            Frozen
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {user.userEmail}
                      </p>
                      <div className="grid grid-cols-4 gap-4 text-xs">
                        <div>
                          <span className="text-muted-foreground">
                            Trust Score:
                          </span>
                          <p className="font-medium">
                            {user.currentScore.toFixed(1)}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Multiplier:
                          </span>
                          <p className="font-medium">
                            {user.rewardMultiplier}x
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Activities:
                          </span>
                          <p className="font-medium">
                            {formatNumber(user.totalActivities)}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Suspicious:
                          </span>
                          <p className="font-medium text-red-600">
                            {user.suspiciousActivityCount}
                          </p>
                        </div>
                      </div>
                      {user.freezeReason && (
                        <p className="text-xs text-red-600 mt-2">
                          Freeze Reason: {user.freezeReason}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {user.isFrozen ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => unfreezeUser(user.userId)}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Unfreeze
                        </Button>
                      ) : (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Ban className="w-3 h-3 mr-1" />
                              Freeze
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Freeze User</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will prevent {user.userName} from earning
                                rewards. Please provide a reason.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  freezeUser(user.userId, "Manual admin action")
                                }
                              >
                                Freeze User
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                      <Button size="sm" variant="outline">
                        <Settings className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Fraud Detection Tab */}
        <TabsContent value="fraud" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Fraud Detection & Review</h3>
            <Button
              onClick={() => exportData("fraud")}
              variant="outline"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          <div className="grid gap-4">
            {fraudDetections.map((detection) => (
              <Card
                key={detection.id}
                className="border-yellow-200 bg-yellow-50"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{detection.userName}</h3>
                        <Badge
                          variant={
                            detection.riskLevel === "critical"
                              ? "destructive"
                              : detection.riskLevel === "high"
                                ? "destructive"
                                : detection.riskLevel === "medium"
                                  ? "default"
                                  : "secondary"
                          }
                        >
                          {detection.riskLevel.toUpperCase()} RISK
                        </Badge>
                        <Badge variant="outline">
                          Score: {detection.riskScore}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-xs mb-2">
                        <div>
                          <span className="text-muted-foreground">
                            Detection:
                          </span>
                          <p className="font-medium">
                            {detection.detectionMethod}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Action Taken:
                          </span>
                          <p className="font-medium">
                            {detection.actionTaken.replace("_", " ")}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Status:</span>
                          <p className="font-medium">
                            {detection.reviewStatus}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-xs text-muted-foreground">
                          Flagged Actions:
                        </span>
                        {detection.flaggedActions.map((action, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {action.replace("_", " ")}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-3 h-3 mr-1" />
                        Review
                      </Button>
                      <Button size="sm" variant="outline">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Resolve
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Reward Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">SoftPoints</span>
                    <span className="font-medium">
                      {formatNumber(adminStats?.totalSoftPointsIssued || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Wallet Bonuses</span>
                    <span className="font-medium">
                      {formatCurrency(adminStats?.totalWalletBonusIssued || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Activities Tracked</span>
                    <span className="font-medium">
                      {formatNumber(adminStats?.totalActivitiesTracked || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Fraud Detection Rate</span>
                    <span className="font-medium text-green-600">99.7%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">False Positives</span>
                    <span className="font-medium">2.1%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Response Time</span>
                    <span className="font-medium">1.2 seconds</span>
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

export default RewardSystemAdmin;
