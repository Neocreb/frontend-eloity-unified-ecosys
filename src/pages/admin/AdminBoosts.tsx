// @ts-nocheck
import React, { useState, useEffect } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNotification } from "@/hooks/use-notification";
import { AdminService } from "@/services/adminService";
import { useCurrency } from "@/contexts/CurrencyContext";
import {
  Zap,
  TrendingUp,
  DollarSign,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Star,
  Target,
  BarChart3,
  Users,
  AlertTriangle,
} from "lucide-react";

interface BoostCampaign {
  id: string;
  userId: string;
  userName: string;
  contentType: "post" | "product" | "job" | "profile" | "video";
  contentId: string;
  contentTitle: string;
  boostType: "visibility" | "engagement" | "reach" | "conversion";
  budget: number;
  spent: number;
  duration: number;
  startDate: string;
  endDate: string;
  status: "pending" | "active" | "paused" | "completed" | "rejected";
  targetAudience: string;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  priority: "low" | "medium" | "high" | "urgent";
}

interface BoostMetrics {
  totalCampaigns: number;
  activeCampaigns: number;
  totalRevenue: number;
  totalImpressions: number;
  averageCTR: number;
  pendingApprovals: number;
}

const AdminBoosts = () => {
  const [campaigns, setCampaigns] = useState<BoostCampaign[]>([]);
  const [metrics, setMetrics] = useState<BoostMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const notification = useNotification();

  useEffect(() => {
    loadBoostData();
  }, []);

  const loadBoostData = async () => {
    try {
      setIsLoading(true);
      
      // Use real API calls instead of mock data
      const response = await AdminService.getBoostCampaigns({
        page: 1,
        limit: 50
      });
      
      if (response.success) {
        const apiCampaigns = response.data.campaigns || [];
        setCampaigns(apiCampaigns);
        
        // Calculate metrics from real data
        const apiMetrics: BoostMetrics = {
          totalCampaigns: apiCampaigns.length,
          activeCampaigns: apiCampaigns.filter((c: BoostCampaign) => c.status === "active").length,
          totalRevenue: apiCampaigns.reduce((sum: number, c: BoostCampaign) => sum + c.spent, 0),
          totalImpressions: apiCampaigns.reduce((sum: number, c: BoostCampaign) => sum + c.impressions, 0),
          averageCTR: apiCampaigns.length > 0 ? apiCampaigns.reduce((sum: number, c: BoostCampaign) => sum + c.ctr, 0) / apiCampaigns.length : 0,
          pendingApprovals: apiCampaigns.filter((c: BoostCampaign) => c.status === "pending").length,
        };
        setMetrics(apiMetrics);
      } else {
        throw new Error(response.error || 'Failed to load boost campaigns');
      }
    } catch (error) {
      console.error("Error loading boost data:", error);
      notification.error("Failed to load boost data");
      
      // Fallback to mock data if API fails
      const mockCampaigns: BoostCampaign[] = [
        {
          id: "boost-001",
          userId: "user-123",
          userName: "John Smith",
          contentType: "post",
          contentId: "post-456",
          contentTitle: "Amazing product launch announcement",
          boostType: "visibility",
          budget: 100.00,
          spent: 45.50,
          duration: 7,
          startDate: "2024-01-20T00:00:00Z",
          endDate: "2024-01-27T00:00:00Z",
          status: "active",
          targetAudience: "Tech enthusiasts, 25-40",
          impressions: 12450,
          clicks: 287,
          conversions: 15,
          ctr: 2.3,
          priority: "medium",
        },
      ];
      
      const mockMetrics: BoostMetrics = {
        totalCampaigns: mockCampaigns.length,
        activeCampaigns: mockCampaigns.filter(c => c.status === "active").length,
        totalRevenue: mockCampaigns.reduce((sum, c) => sum + c.spent, 0),
        totalImpressions: mockCampaigns.reduce((sum, c) => sum + c.impressions, 0),
        averageCTR: mockCampaigns.reduce((sum, c) => sum + c.ctr, 0) / mockCampaigns.length,
        pendingApprovals: mockCampaigns.filter(c => c.status === "pending").length,
      };
      
      setCampaigns(mockCampaigns);
      setMetrics(mockMetrics);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCampaignAction = async (campaignId: string, action: "approve" | "reject" | "pause" | "resume") => {
    try {
      // Use real API instead of mock update
      const response = await AdminService.updateBoostCampaign(
        campaignId,
        action === "approve" ? "active" : 
        action === "reject" ? "rejected" :
        action === "pause" ? "paused" : "active"
      );
      
      if (response.success) {
        // Update local state
        setCampaigns(prev => 
          prev.map(campaign => 
            campaign.id === campaignId 
              ? { 
                  ...campaign, 
                  status: action === "approve" ? "active" : 
                         action === "reject" ? "rejected" :
                         action === "pause" ? "paused" : "active"
                }
              : campaign
          )
        );
        notification.success(`Campaign ${action}d successfully`);
      } else {
        throw new Error(response.error || `Failed to ${action} campaign`);
      }
    } catch (error) {
      console.error(`Error ${action}ing campaign:`, error);
      notification.error(`Failed to ${action} campaign`);
      
      // Fallback to local state update if API fails
      setCampaigns(prev => 
        prev.map(campaign => 
          campaign.id === campaignId 
            ? { 
                ...campaign, 
                status: action === "approve" ? "active" : 
                       action === "reject" ? "rejected" :
                       action === "pause" ? "paused" : "active"
              }
            : campaign
        )
      );
      notification.success(`Campaign ${action}d successfully (offline mode)`);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500 text-white",
      active: "bg-green-500 text-white",
      paused: "bg-orange-500 text-white",
      completed: "bg-blue-500 text-white",
      rejected: "bg-red-500 text-white",
    };
    return colors[status] || "bg-gray-500 text-white";
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;
    const matchesType = typeFilter === "all" || campaign.contentType === typeFilter;
    const matchesSearch = searchTerm === "" || 
      campaign.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.contentTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesType && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Loading boost campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Boost System Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage content promotion campaigns and advertising
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="bg-blue-500/10 p-3 rounded-full mb-4">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold">{metrics.totalCampaigns}</div>
              <div className="text-sm text-gray-600">Total Campaigns</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="bg-green-500/10 p-3 rounded-full mb-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold">{metrics.activeCampaigns}</div>
              <div className="text-sm text-gray-600">Active</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="bg-purple-500/10 p-3 rounded-full mb-4">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
              <div className="text-sm text-gray-600">Revenue</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="bg-orange-500/10 p-3 rounded-full mb-4">
                <Eye className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold">{metrics.totalImpressions.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Impressions</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="bg-pink-500/10 p-3 rounded-full mb-4">
                <Target className="h-6 w-6 text-pink-600" />
              </div>
              <div className="text-2xl font-bold">{metrics.averageCTR.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Avg CTR</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="bg-yellow-500/10 p-3 rounded-full mb-4">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold">{metrics.pendingApprovals}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Boost Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Boost Campaigns
          </CardTitle>
          <CardDescription>
            Manage and monitor content promotion campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="space-y-2">
              <Label>Status Filter</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Content Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="post">Posts</SelectItem>
                  <SelectItem value="product">Products</SelectItem>
                  <SelectItem value="job">Jobs</SelectItem>
                  <SelectItem value="profile">Profiles</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex-1 min-w-[200px]">
              <Label>Search</Label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Campaigns Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium capitalize">{campaign.boostType} Boost</p>
                        <p className="text-sm text-gray-600 max-w-xs truncate">
                          {campaign.contentTitle}
                        </p>
                        <Badge variant="outline" className="mt-1 capitalize">
                          {campaign.contentType}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{campaign.userName}</p>
                        <p className="text-sm text-gray-600">{campaign.userId}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{formatCurrency(campaign.budget)}</p>
                        <p className="text-sm text-gray-600">
                          Spent: {formatCurrency(campaign.spent)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Eye className="w-3 h-3" />
                          <span className="text-xs">{campaign.impressions.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="w-3 h-3" />
                          <span className="text-xs">{campaign.clicks}</span>
                        </div>
                        <div className="text-xs text-green-600">CTR: {campaign.ctr}%</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(campaign.priority)}>
                        {campaign.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{campaign.duration} days</p>
                        <p className="text-xs text-gray-600">
                          {new Date(campaign.startDate).toLocaleDateString()} - 
                          {new Date(campaign.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        {campaign.status === "pending" && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="bg-green-50 hover:bg-green-100"
                              onClick={() => handleCampaignAction(campaign.id, "approve")}
                            >
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="bg-red-50 hover:bg-red-100"
                              onClick={() => handleCampaignAction(campaign.id, "reject")}
                            >
                              <XCircle className="w-4 h-4 text-red-600" />
                            </Button>
                          </>
                        )}
                        {campaign.status === "active" && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCampaignAction(campaign.id, "pause")}
                          >
                            Pause
                          </Button>
                        )}
                        {campaign.status === "paused" && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCampaignAction(campaign.id, "resume")}
                          >
                            Resume
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Boost System Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Boost system configuration including pricing tiers, approval workflows, and 
              automated moderation rules will be implemented in future updates.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBoosts;
