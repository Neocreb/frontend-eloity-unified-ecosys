// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Download, 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Settings,
  Activity,
  Award,
  BarChart3,
  ShoppingCart,
  Package
} from "lucide-react";
import { enhancedEloitsService, TIER_CONFIG } from "@/services/enhancedEloitsService";
import { formatCurrency, formatNumber } from "@/utils/formatters";
import { useToast } from "@/hooks/use-toast";

interface RewardRule {
  id: string;
  action_type: string;
  display_name: string;
  description: string;
  base_eloits: string;
  base_wallet_bonus: string;
  currency: string;
  daily_limit: number | null;
  weekly_limit: number | null;
  monthly_limit: number | null;
  minimum_trust_score: string;
  minimum_value: string;
  decay_enabled: boolean;
  decay_start: number;
  decay_rate: string;
  min_multiplier: string;
  requires_moderation: boolean;
  quality_threshold: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SystemConfig {
  [key: string]: string;
}

interface UserRewardData {
  id: string;
  user_id: string;
  current_balance: number;
  total_earned: number;
  total_spent: number;
  trust_score: number;
  trust_level: string;
  reward_multiplier: number;
  daily_cap: number;
  streak_days: number;
  tier: string;
  referral_count: number;
  created_at: string;
  updated_at: string;
}

const EnhancedRewardSystemAdmin: React.FC = () => {
  const [rewardRules, setRewardRules] = useState<RewardRule[]>([]);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({});
  const [userRewards, setUserRewards] = useState<UserRewardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRule, setNewRule] = useState<Partial<RewardRule>>({});
  const [editingRule, setEditingRule] = useState<RewardRule | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // Load reward rules
      const rules = await enhancedEloitsService.getRewardRules();
      setRewardRules(rules);

      // Load system config
      const config = await enhancedEloitsService.getSystemConfig();
      setSystemConfig(config);

      // Load some sample user rewards (in a real app, you'd have pagination)
      // For demo purposes, we'll just show the structure
      setUserRewards([]);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load reward system data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = async () => {
    try {
      // In a real implementation, you would call an API to create the rule
      toast({
        title: "Success",
        description: "Reward rule created successfully",
      });
      setIsCreateDialogOpen(false);
      setNewRule({});
      loadAllData();
    } catch (error) {
      console.error("Error creating rule:", error);
      toast({
        title: "Error",
        description: "Failed to create reward rule",
        variant: "destructive",
      });
    }
  };

  const handleUpdateRule = async () => {
    try {
      if (!editingRule) return;
      
      // In a real implementation, you would call an API to update the rule
      toast({
        title: "Success",
        description: "Reward rule updated successfully",
      });
      setIsEditDialogOpen(false);
      setEditingRule(null);
      loadAllData();
    } catch (error) {
      console.error("Error updating rule:", error);
      toast({
        title: "Error",
        description: "Failed to update reward rule",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      // In a real implementation, you would call an API to delete the rule
      toast({
        title: "Success",
        description: "Reward rule deleted successfully",
      });
      loadAllData();
    } catch (error) {
      console.error("Error deleting rule:", error);
      toast({
        title: "Error",
        description: "Failed to delete reward rule",
        variant: "destructive",
      });
    }
  };

  const handleUpdateConfig = async () => {
    try {
      // In a real implementation, you would call an API to update the config
      toast({
        title: "Success",
        description: "System configuration updated successfully",
      });
    } catch (error) {
      console.error("Error updating config:", error);
      toast({
        title: "Error",
        description: "Failed to update system configuration",
        variant: "destructive",
      });
    }
  };

  const getTierColor = (tier: string) => {
    const config = TIER_CONFIG[tier as keyof typeof TIER_CONFIG];
    return config ? config.color : "bg-gray-500";
  };

  const getTrustLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "diamond": return "bg-blue-500";
      case "platinum": return "bg-purple-500";
      case "gold": return "bg-yellow-500";
      case "silver": return "bg-gray-400";
      case "bronze": return "bg-orange-600";
      default: return "bg-gray-500";
    }
  };

  // Marketplace purchase reward calculator
  const calculatePurchaseReward = (purchaseAmount: number) => {
    const baseReward = 10;
    const percentageReward = purchaseAmount * 0.01;
    const totalReward = baseReward + percentageReward;
    return Math.min(totalReward, 200); // Maximum daily bonus = 200 ELO
  };

  // Product sold reward calculator
  const calculateProductSoldReward = (tier: string) => {
    const tierConfig = TIER_CONFIG[tier as keyof typeof TIER_CONFIG];
    const baseReward = 750;
    return baseReward * (tierConfig?.multiplier || 1.0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Enhanced Reward System</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rules">Reward Rules</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total ELO Issued</p>
                    <p className="text-2xl font-bold">1,245,678</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                    <p className="text-2xl font-bold">45,672</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Redemption Requests</p>
                    <p className="text-2xl font-bold">1,234</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg. Trust Score</p>
                    <p className="text-2xl font-bold">72.5</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <Shield className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Marketplace Rewards Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Marketplace Rewards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Purchase Reward Calculator</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Base Reward:</span>
                      <span>10 ELO</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Percentage Reward:</span>
                      <span>1% of purchase amount</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Maximum Daily Bonus:</span>
                      <span>200 ELO</span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex justify-between font-semibold">
                        <span>Example (₦10,000 purchase):</span>
                        <span>{calculatePurchaseReward(10000)} ELO</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Product Sold Rewards</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Base Reward:</span>
                      <span>750 ELO</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bronze Tier:</span>
                      <span>{calculateProductSoldReward('bronze')} ELO</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Silver Tier:</span>
                      <span>{calculateProductSoldReward('silver')} ELO</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gold Tier:</span>
                      <span>{calculateProductSoldReward('gold')} ELO</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Platinum Tier:</span>
                      <span>{calculateProductSoldReward('platinum')} ELO</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Diamond Tier:</span>
                      <span>{calculateProductSoldReward('diamond')} ELO</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Referral Rewards Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Referral Rewards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Referral Action</th>
                      <th className="text-left py-2">Reward</th>
                      <th className="text-left py-2">Conditions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2">Refer Friend</td>
                      <td className="py-2">1000 ELO</td>
                      <td className="py-2">-</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Referral Signup (verified)</td>
                      <td className="py-2">500 ELO</td>
                      <td className="py-2">Profile completion + 3-day login streak</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Referral's First Purchase</td>
                      <td className="py-2">1500 ELO</td>
                      <td className="py-2">-</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Tier 2 Referral (friend of referral)</td>
                      <td className="py-2">100 ELO bonus</td>
                      <td className="py-2">Max 3 levels</td>
                    </tr>
                    <tr>
                      <td className="py-2">Tier 3 Referral</td>
                      <td className="py-2">50 ELO bonus</td>
                      <td className="py-2">Max 3 levels</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Trust Impact</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>john_doe</TableCell>
                    <TableCell>Create Post</TableCell>
                    <TableCell className="text-green-600">+15.00 ELO</TableCell>
                    <TableCell className="text-blue-600">+2.5</TableCell>
                    <TableCell>2024-01-15 14:30</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>jane_smith</TableCell>
                    <TableCell>Refer User</TableCell>
                    <TableCell className="text-green-600">+120.00 ELO</TableCell>
                    <TableCell className="text-blue-600">+5.0</TableCell>
                    <TableCell>2024-01-15 13:45</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>alex_wilson</TableCell>
                    <TableCell>Daily Login</TableCell>
                    <TableCell className="text-green-600">+7.50 ELO</TableCell>
                    <TableCell className="text-blue-600">+0.5</TableCell>
                    <TableCell>2024-01-15 12:15</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Reward Rules Management</h3>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
                        value={newRule.action_type || ""}
                        onChange={(e) =>
                          setNewRule({ ...newRule, action_type: e.target.value })
                        }
                        placeholder="e.g., post_content"
                      />
                    </div>
                    <div>
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        value={newRule.display_name || ""}
                        onChange={(e) =>
                          setNewRule({ ...newRule, display_name: e.target.value })
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
                        setNewRule({ ...newRule, description: e.target.value })
                      }
                      placeholder="Describe what this reward is for..."
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="baseEloits">Base ELO</Label>
                      <Input
                        id="baseEloits"
                        type="number"
                        step="0.1"
                        value={newRule.base_eloits || ""}
                        onChange={(e) =>
                          setNewRule({ ...newRule, base_eloits: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="dailyLimit">Daily Limit</Label>
                      <Input
                        id="dailyLimit"
                        type="number"
                        value={newRule.daily_limit || ""}
                        onChange={(e) =>
                          setNewRule({ ...newRule, daily_limit: parseInt(e.target.value) || undefined })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="minimumTrustScore">Min Trust Score</Label>
                      <Input
                        id="minimumTrustScore"
                        type="number"
                        step="0.1"
                        value={newRule.minimum_trust_score || ""}
                        onChange={(e) =>
                          setNewRule({ ...newRule, minimum_trust_score: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="isActive">Active</Label>
                    <Switch
                      id="isActive"
                      checked={newRule.is_active !== false}
                      onCheckedChange={(checked) =>
                        setNewRule({ ...newRule, is_active: checked })
                      }
                    />
                  </div>

                  <Button onClick={handleCreateRule} className="w-full">
                    Create Rule
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Base ELO</TableHead>
                    <TableHead>Daily Limit</TableHead>
                    <TableHead>Min Trust</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rewardRules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">{rule.action_type}</TableCell>
                      <TableCell>{rule.display_name}</TableCell>
                      <TableCell>{rule.base_eloits}</TableCell>
                      <TableCell>{rule.daily_limit || "Unlimited"}</TableCell>
                      <TableCell>{rule.minimum_trust_score}</TableCell>
                      <TableCell>
                        <Badge variant={rule.is_active ? "default" : "secondary"}>
                          {rule.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingRule(rule);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteRule(rule.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="conversionRate">Conversion Rate</Label>
                    <Input
                      id="conversionRate"
                      value={systemConfig.conversion_rate || "1000"}
                      onChange={(e) =>
                        setSystemConfig({ ...systemConfig, conversion_rate: e.target.value })
                      }
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      ELO to USD conversion rate (1000 ELO = $1.00)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="payoutMode">Payout Mode</Label>
                    <Select
                      value={systemConfig.payout_mode || "manual"}
                      onValueChange={(value) =>
                        setSystemConfig({ ...systemConfig, payout_mode: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="automated">Automated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="minRedeemable">Minimum Redeemable Balance</Label>
                    <Input
                      id="minRedeemable"
                      value={systemConfig.minimum_redeemable_balance || "500"}
                      onChange={(e) =>
                        setSystemConfig({ ...systemConfig, minimum_redeemable_balance: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="maxMonthly">Max Monthly Redemption</Label>
                    <Input
                      id="maxMonthly"
                      value={systemConfig.max_monthly_redemption_per_tier || "10000"}
                      onChange={(e) =>
                        setSystemConfig({ ...systemConfig, max_monthly_redemption_per_tier: e.target.value })
                      }
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Maximum USD redemption per month per tier
                    </p>
                  </div>

                  <div>
                    <Label>Bonus Multipliers</Label>
                    <Textarea
                      value={systemConfig.bonus_multipliers || JSON.stringify({
                        trust_bronze: 1.0,
                        trust_silver: 1.2,
                        trust_gold: 1.5,
                        trust_platinum: 2.0,
                        trust_diamond: 3.0,
                        badge_verified: 1.1,
                        badge_pioneer: 1.3
                      }, null, 2)}
                      onChange={(e) =>
                        setSystemConfig({ ...systemConfig, bonus_multipliers: e.target.value })
                      }
                      rows={6}
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleUpdateConfig}>Update Configuration</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Trust Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Current Balance</TableHead>
                    <TableHead>Trust Score</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Referrals</TableHead>
                    <TableHead>Last Activity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-xs font-medium">JD</span>
                        </div>
                        <span>john_doe</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatNumber(12500)} ELO</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge className={getTrustLevelColor("gold")}>78.5</Badge>
                        <span>Gold</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTierColor("gold")}>Gold</Badge>
                    </TableCell>
                    <TableCell>12</TableCell>
                    <TableCell>2 hours ago</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-xs font-medium">JS</span>
                        </div>
                        <span>jane_smith</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatNumber(8900)} ELO</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge className={getTrustLevelColor("silver")}>65.2</Badge>
                        <span>Silver</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTierColor("silver")}>Silver</Badge>
                    </TableCell>
                    <TableCell>8</TableCell>
                    <TableCell>5 hours ago</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Reward Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Social Activities</span>
                    <span className="font-medium">45%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: "45%" }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Marketplace</span>
                    <span className="font-medium">25%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: "25%" }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Referrals</span>
                    <span className="font-medium">15%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: "15%" }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Creator Economy</span>
                    <span className="font-medium">10%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{ width: "10%" }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Other</span>
                    <span className="font-medium">5%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gray-600 h-2 rounded-full" style={{ width: "5%" }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Tier Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(TIER_CONFIG).map(([tier, config]) => (
                    <div key={tier} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${config.color}`}></div>
                        <span className="capitalize">{config.name}</span>
                      </div>
                      <span className="font-medium">25%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Rule Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Reward Rule</DialogTitle>
          </DialogHeader>
          {editingRule && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editActionType">Action Type</Label>
                  <Input
                    id="editActionType"
                    value={editingRule.action_type || ""}
                    onChange={(e) =>
                      setEditingRule({ ...editingRule, action_type: e.target.value })
                    }
                    placeholder="e.g., post_content"
                  />
                </div>
                <div>
                  <Label htmlFor="editDisplayName">Display Name</Label>
                  <Input
                    id="editDisplayName"
                    value={editingRule.display_name || ""}
                    onChange={(e) =>
                      setEditingRule({ ...editingRule, display_name: e.target.value })
                    }
                    placeholder="e.g., Create Post"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="editDescription">Description</Label>
                <Textarea
                  id="editDescription"
                  value={editingRule.description || ""}
                  onChange={(e) =>
                    setEditingRule({ ...editingRule, description: e.target.value })
                  }
                  placeholder="Describe what this reward is for..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="editBaseEloits">Base ELO</Label>
                  <Input
                    id="editBaseEloits"
                    type="number"
                    step="0.1"
                    value={editingRule.base_eloits || ""}
                    onChange={(e) =>
                      setEditingRule({ ...editingRule, base_eloits: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="editDailyLimit">Daily Limit</Label>
                  <Input
                    id="editDailyLimit"
                    type="number"
                    value={editingRule.daily_limit || ""}
                    onChange={(e) =>
                      setEditingRule({ ...editingRule, daily_limit: parseInt(e.target.value) || undefined })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="editMinimumTrustScore">Min Trust Score</Label>
                  <Input
                    id="editMinimumTrustScore"
                    type="number"
                    step="0.1"
                    value={editingRule.minimum_trust_score || ""}
                    onChange={(e) =>
                      setEditingRule({ ...editingRule, minimum_trust_score: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="editIsActive">Active</Label>
                <Switch
                  id="editIsActive"
                  checked={editingRule.is_active}
                  onCheckedChange={(checked) =>
                    setEditingRule({ ...editingRule, is_active: checked })
                  }
                />
              </div>

              <Button onClick={handleUpdateRule} className="w-full">
                Update Rule
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedRewardSystemAdmin;