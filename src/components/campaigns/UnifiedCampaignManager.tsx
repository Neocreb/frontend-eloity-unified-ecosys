import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sparkles,
  TrendingUp,
  Target,
  Calendar,
  DollarSign,
  Eye,
  MousePointer,
  ShoppingCart,
  Clock,
  Plus,
  Zap,
  Award,
  BarChart3,
  Users,
  Megaphone,
  Star,
  Flame,
  Crown,
  Rocket,
  Diamond,
  Gift,
  PlusCircle,
  Settings,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import CampaignCreationWizard from "./CampaignCreationWizard";
import CampaignAnalyticsDashboard from "./CampaignAnalyticsDashboard";
import SmartBoostSuggestions from "./SmartBoostSuggestions";
import { campaignSyncService } from "@/services/campaignSyncService";

export interface Campaign {
  id: string;
  name: string;
  type: "boost" | "promotion" | "brand_awareness" | "lead_generation";
  status: "active" | "paused" | "completed" | "draft";
  budget: {
    total: number;
    spent: number;
    remaining: number;
  };
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    cpc: number;
    roas: number;
  };
  startDate: string;
  endDate: string;
  targetAudience: {
    demographics: string[];
    interests: string[];
    locations: string[];
  };
  createdAt: string;
  updatedAt: string;
}

interface UnifiedCampaignManagerProps {
  context: "seller" | "freelancer" | "client";
  entityId?: string; // Product ID for seller, Profile ID for freelancer, etc.
  entityType?: "product" | "profile" | "job" | "service";
  showCreateButton?: boolean;
  compact?: boolean;
  maxCampaigns?: number;
}

export const UnifiedCampaignManager: React.FC<UnifiedCampaignManagerProps> = ({
  context,
  entityId,
  entityType,
  showCreateButton = true,
  compact = false,
  maxCampaigns,
}) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [activeTab, setActiveTab] = useState("campaigns");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Subscribe to campaign updates
  useEffect(() => {
    const unsubscribe = campaignSyncService.subscribe((updatedCampaigns) => {
      setCampaigns(updatedCampaigns);
    });

    // Load initial campaigns
    setCampaigns(campaignSyncService.getCampaignsByContext(context, entityId));

    return unsubscribe;
  }, [context, entityId]);

  // Filter campaigns based on context and entity
  const filteredCampaigns = campaigns.filter((campaign) => {
    // Add logic to filter campaigns based on context
    return true; // For now, show all campaigns
  });

  const displayCampaigns = maxCampaigns 
    ? filteredCampaigns.slice(0, maxCampaigns)
    : filteredCampaigns;

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: Campaign['type']) => {
    switch (type) {
      case "boost":
        return <Zap className="w-4 h-4" />;
      case "promotion":
        return <Megaphone className="w-4 h-4" />;
      case "brand_awareness":
        return <Award className="w-4 h-4" />;
      case "lead_generation":
        return <Target className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const handleCreateCampaign = () => {
    if (context === "seller" || context === "freelancer" || context === "client") {
      setShowCreateWizard(true);
    } else {
      // Navigate to main campaign center
      navigate("/app/campaigns");
    }
  };

  const handleCampaignAction = (action: string, campaign: Campaign) => {
    switch (action) {
      case "pause":
        campaignSyncService.updateCampaignStatus(campaign.id, "paused");
        toast({
          title: "Campaign Paused",
          description: `${campaign.name} has been paused.`,
        });
        break;
      case "resume":
        campaignSyncService.updateCampaignStatus(campaign.id, "active");
        toast({
          title: "Campaign Resumed",
          description: `${campaign.name} has been resumed.`,
        });
        break;
      case "view":
        setSelectedCampaign(campaign);
        setShowAnalytics(true);
        break;
      case "edit":
        // Navigate to campaign edit
        navigate(`/app/campaigns?edit=${campaign.id}`);
        break;
      default:
        break;
    }
  };

  const CampaignCard: React.FC<{ campaign: Campaign }> = ({ campaign }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {getTypeIcon(campaign.type)}
            <h4 className="font-semibold text-sm">{campaign.name}</h4>
          </div>
          <Badge className={`text-xs ${getStatusColor(campaign.status)}`}>
            {campaign.status}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Budget Progress</span>
            <span className="font-medium">
              ${campaign.budget.spent} / ${campaign.budget.total}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-blue-600 h-1.5 rounded-full" 
              style={{ 
                width: `${(campaign.budget.spent / campaign.budget.total) * 100}%` 
              }}
            />
          </div>
        </div>

        {!compact && (
          <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
            <div className="text-center">
              <div className="font-semibold">{campaign.metrics.impressions.toLocaleString()}</div>
              <div className="text-muted-foreground">Impressions</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">{campaign.metrics.clicks}</div>
              <div className="text-muted-foreground">Clicks</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">{campaign.metrics.ctr}%</div>
              <div className="text-muted-foreground">CTR</div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleCampaignAction("view", campaign)}
            className="flex-1 text-xs"
          >
            <Eye className="w-3 h-3 mr-1" />
            View
          </Button>
          {campaign.status === "active" ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCampaignAction("pause", campaign)}
              className="text-xs"
            >
              Pause
            </Button>
          ) : campaign.status === "paused" ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCampaignAction("resume", campaign)}
              className="text-xs"
            >
              Resume
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );

  if (compact) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Campaigns & Boosts</h3>
          {showCreateButton && (
            <Button size="sm" onClick={handleCreateCampaign}>
              <Plus className="w-4 h-4 mr-1" />
              Create
            </Button>
          )}
        </div>

        {displayCampaigns.length > 0 ? (
          <div className="space-y-3">
            {displayCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
            {filteredCampaigns.length > displayCampaigns.length && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/app/campaigns")}
              >
                View All Campaigns ({filteredCampaigns.length})
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <h4 className="font-medium mb-1">No campaigns yet</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Create your first campaign to boost visibility
              </p>
              <Button size="sm" onClick={handleCreateCampaign}>
                <Plus className="w-4 h-4 mr-1" />
                Create Campaign
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Campaign Creation Wizard */}
        <CampaignCreationWizard
          isOpen={showCreateWizard}
          onClose={() => setShowCreateWizard(false)}
          onCampaignCreated={(campaignData) => {
            const campaign = campaignSyncService.createCampaign(campaignData);
            setShowCreateWizard(false);
            toast({
              title: "Campaign Created",
              description: `${campaign.name} has been created successfully.`,
            });
          }}
          context={context}
          entityId={entityId}
          entityType={entityType}
        />

        {/* Campaign Analytics Modal */}
        <Dialog open={showAnalytics} onOpenChange={setShowAnalytics}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                Campaign Analytics - {selectedCampaign?.name}
              </DialogTitle>
              <DialogDescription>
                Detailed performance metrics and insights
              </DialogDescription>
            </DialogHeader>
            {selectedCampaign && (
              <CampaignAnalyticsDashboard campaigns={[selectedCampaign]} />
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Full dashboard view
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Campaigns & Boosts</h2>
          <p className="text-muted-foreground">
            Manage your marketing campaigns and boost performance
          </p>
        </div>
        {showCreateButton && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/app/campaigns")}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Campaign Center
            </Button>
            <Button onClick={handleCreateCampaign}>
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="campaigns">Active Campaigns</TabsTrigger>
          <TabsTrigger value="suggestions">Smart Suggestions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          {displayCampaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first campaign to boost visibility and reach more customers
                </p>
                <Button onClick={handleCreateCampaign}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Campaign
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="suggestions">
          <SmartBoostSuggestions 
            context={context}
            entityId={entityId}
            entityType={entityType}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <CampaignAnalyticsDashboard campaigns={filteredCampaigns} />
        </TabsContent>
      </Tabs>

      {/* Campaign Creation Wizard */}
      <CampaignCreationWizard
        isOpen={showCreateWizard}
        onClose={() => setShowCreateWizard(false)}
        onCampaignCreated={(campaignData) => {
          const campaign = campaignSyncService.createCampaign(campaignData);
          setShowCreateWizard(false);
          toast({
            title: "Campaign Created",
            description: `${campaign.name} has been created successfully.`,
          });
        }}
        context={context}
        entityId={entityId}
        entityType={entityType}
      />

      {/* Campaign Analytics Modal */}
      <Dialog open={showAnalytics} onOpenChange={setShowAnalytics}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Campaign Analytics - {selectedCampaign?.name}
            </DialogTitle>
            <DialogDescription>
              Detailed performance metrics and insights
            </DialogDescription>
          </DialogHeader>
          {selectedCampaign && (
            <CampaignAnalyticsDashboard campaigns={[selectedCampaign]} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UnifiedCampaignManager;
