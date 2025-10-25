// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal,
  Plus,
  Zap,
  Award,
  BarChart3,
  Users,
  Percent,
  Gift,
  Megaphone,
  Star,
  Flame,
  Crown,
  Rocket,
  Diamond,
} from "lucide-react";
import { useEnhancedMarketplace } from "@/contexts/EnhancedMarketplaceContext";
import { useToast } from "@/components/ui/use-toast";
import { campaignService } from "@/services/campaignService";
import { boostService } from "@/services/boostService";
import { useAuth } from "@/contexts/AuthContext";
import {
  Campaign,
  ProductBoost,
  BoostOption,
  Product,
} from "@/types/enhanced-marketplace";

const CampaignsAndBoostingSystem: React.FC = () => {
  const {
    getCampaignProducts,
    requestCampaignParticipation,
    boostProduct,
    boostOptions,
    getMyBoosts,
    myListings,
  } = useEnhancedMarketplace();

  const { toast } = useToast();
  const { user } = useAuth();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [boostPerformance, setBoostPerformance] = useState<any>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null,
  );
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCampaignDetails, setShowCampaignDetails] = useState(false);
  const [showJoinCampaign, setShowJoinCampaign] = useState(false);
  const [showBoostProduct, setShowBoostProduct] = useState(false);
  const [selectedBoostOption, setSelectedBoostOption] = useState<string>("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaignsAndBoostData();
  }, []);

  const loadCampaignsAndBoostData = async () => {
    try {
      setLoading(true);
      
      // Fetch real campaigns data
      const campaignsData = await campaignService.getActiveCampaigns();
      setCampaigns(campaignsData);
      
      // Fetch real boost performance data
      if (user?.id) {
        const performanceData = await boostService.getBoostPerformance(user.id);
        setBoostPerformance(performanceData);
      }
    } catch (error) {
      console.error("Error loading campaigns and boost data:", error);
      toast({
        title: "Error loading data",
        description: "Failed to load campaigns and boost information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const myBoosts = getMyBoosts();
  const activeBoosts = myBoosts.filter((b) => b.status === "active");

  const getCampaignStatusBadge = (campaign: Campaign) => {
    const now = new Date();
    const startDate = new Date(campaign.start_date);
    const endDate = new Date(campaign.end_date);

    if (now < startDate) {
      return <Badge className="bg-blue-500 text-white">Upcoming</Badge>;
    } else if (now > endDate) {
      return <Badge className="bg-gray-500 text-white">Ended</Badge>;
    } else {
      return <Badge className="bg-green-500 text-white">Active</Badge>;
    }
  };

  const getCampaignTypeIcon = (type: string) => {
    switch (type) {
      case "seasonal":
        return <Calendar className="h-4 w-4" />;
      case "flash_sale":
        return <Flame className="h-4 w-4" />;
      case "featured":
        return <Star className="h-4 w-4" />;
      case "category_boost":
        return <Target className="h-4 w-4" />;
      default:
        return <Megaphone className="h-4 w-4" />;
    }
  };

  const getBoostTypeIcon = (type: string) => {
    switch (type) {
      case "basic":
        return <Zap className="h-4 w-4" />;
      case "featured":
        return <Star className="h-4 w-4" />;
      case "premium":
        return <Crown className="h-4 w-4" />;
      case "homepage":
        return <Diamond className="h-4 w-4" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  const handleJoinCampaign = async () => {
    if (!selectedCampaign || selectedProducts.length === 0) return;

    try {
      for (const productId of selectedProducts) {
        await requestCampaignParticipation(selectedCampaign.id, productId);
      }

      toast({
        title: "Campaign Participation Requested",
        description: `Your products have been submitted for the ${selectedCampaign.name} campaign`,
      });

      setShowJoinCampaign(false);
      setSelectedProducts([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join campaign",
        variant: "destructive",
      });
    }
  };

  const handleBoostProduct = async () => {
    if (!selectedProduct || !selectedBoostOption) return;

    try {
      await boostProduct(selectedProduct.id, selectedBoostOption);
      toast({
        title: "Product Boosted",
        description: `${selectedProduct.name} has been boosted successfully`,
      });
      setShowBoostProduct(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to boost product",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateTimeLeft = (endDate: string) => {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const diff = end - now;

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  if (loading) {
    return (
      <div className="container py-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Campaigns & Boosting</h1>
          <p className="text-muted-foreground">
            Promote your products and join exciting campaigns
          </p>
        </div>

        <Button onClick={() => setShowBoostProduct(true)}>
          <Rocket className="h-4 w-4 mr-2" />
          Boost Product
        </Button>
      </div>

      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="campaigns">Active Campaigns</TabsTrigger>
          <TabsTrigger value="my-boosts">My Boosts</TabsTrigger>
          <TabsTrigger value="boost-options">Boost Options</TabsTrigger>
          <TabsTrigger value="analytics">Performance</TabsTrigger>
        </TabsList>

        {/* Active Campaigns */}
        <TabsContent value="campaigns">
          <div className="space-y-6">
            {/* Campaign Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {campaigns.filter((c) => c.status === "active").length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Active Campaigns
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {campaigns
                      .reduce((sum, c) => sum + (c.view_count || 0), 0)
                      .toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Views
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {campaigns
                      .reduce((sum, c) => sum + (c.conversion_count || 0), 0)
                      .toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Conversions
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    $
                    {campaigns
                      .reduce((sum, c) => sum + (c.total_revenue || 0), 0)
                      .toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Revenue</div>
                </CardContent>
              </Card>
            </div>

            {/* Campaigns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="overflow-hidden">
                  <div
                    className="h-32 relative"
                    style={{
                      backgroundColor: campaign.background_color || "#f3f4f6",
                      backgroundImage: campaign.banner_image
                        ? `url(${campaign.banner_image})`
                        : undefined,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                      <h3
                        className="text-xl font-bold text-center px-4"
                        style={{ color: campaign.text_color || "#ffffff" }}
                      >
                        {campaign.banner_text || campaign.name}
                      </h3>
                    </div>
                    <div className="absolute top-2 right-2">
                      {getCampaignStatusBadge(campaign)}
                    </div>
                    <div className="absolute top-2 left-2">
                      <Badge variant="outline" className="bg-white/90">
                        {getCampaignTypeIcon(campaign.type)}
                        <span className="ml-1 capitalize">
                          {campaign.type.replace("_", " ")}
                        </span>
                      </Badge>
                    </div>
                  </div>

                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{campaign.name}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {campaign.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Campaign Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Starts</p>
                        <p className="font-medium">
                          {formatDate(campaign.start_date)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Ends</p>
                        <p className="font-medium">
                          {formatDate(campaign.end_date)}
                        </p>
                      </div>
                    </div>

                    {/* Time Left */}
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {calculateTimeLeft(campaign.end_date)}
                      </span>
                    </div>

                    {/* Discount Info */}
                    {campaign.discount_type && campaign.discount_value && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Percent className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-800">
                            {campaign.discount_value}% discount
                          </span>
                        </div>
                        {campaign.min_order_amount && (
                          <p className="text-sm text-green-600 mt-1">
                            Min order: ${campaign.min_order_amount}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Participation Stats */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Participation</span>
                        <span>
                          {campaign.usage_count || 0}/{campaign.usage_limit || "∞"}
                        </span>
                      </div>
                      {campaign.usage_limit && (
                        <Progress
                          value={
                            ((campaign.usage_count || 0) / campaign.usage_limit) * 100
                          }
                          className="h-2"
                        />
                      )}
                    </div>

                    {/* Performance */}
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      <div>
                        <p className="font-medium">
                          {(campaign.view_count || 0).toLocaleString()}
                        </p>
                        <p className="text-muted-foreground">Views</p>
                      </div>
                      <div>
                        <p className="font-medium">
                          {(campaign.click_count || 0).toLocaleString()}
                        </p>
                        <p className="text-muted-foreground">Clicks</p>
                      </div>
                      <div>
                        <p className="font-medium">
                          {(campaign.conversion_count || 0).toLocaleString()}
                        </p>
                        <p className="text-muted-foreground">Sales</p>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="border-t bg-gray-50 p-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCampaign(campaign);
                        setShowCampaignDetails(true);
                      }}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    {campaign.status === "active" && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedCampaign(campaign);
                          setShowJoinCampaign(true);
                        }}
                        className="flex-1"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Join Campaign
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* My Boosts */}
        <TabsContent value="my-boosts">
          <div className="space-y-6">
            {/* Active Boosts Summary */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Active Boosts Summary</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {activeBoosts.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Active Boosts
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {boostPerformance?.totalImpressions?.toLocaleString() || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Impressions
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {boostPerformance?.totalClicks?.toLocaleString() || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Clicks
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {boostPerformance?.averageROI ? `${boostPerformance.averageROI}%` : "0%"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Average ROI
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Boosts List */}
            {activeBoosts.length === 0 ? (
              <Card className="bg-gray-50">
                <CardContent className="pt-6 text-center">
                  <div className="py-8 space-y-4">
                    <Rocket className="h-16 w-16 text-gray-400 mx-auto" />
                    <h3 className="text-lg font-medium">No Active Boosts</h3>
                    <p className="text-muted-foreground">
                      Start boosting your products to increase visibility and
                      sales
                    </p>
                    <Button onClick={() => setShowBoostProduct(true)}>
                      <Rocket className="h-4 w-4 mr-2" />
                      Boost a Product
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {activeBoosts.map((boost) => {
                  const product = myListings.find(
                    (p) => p.id === boost.productId,
                  );
                  if (!product) return null;

                  const timeLeft = calculateTimeLeft(boost.endDate || "");
                  const progressPercentage = boost.endDate
                    ? Math.max(
                        0,
                        Math.min(
                          100,
                          ((new Date().getTime() -
                            new Date(boost.startDate || "").getTime()) /
                            (new Date(boost.endDate).getTime() -
                              new Date(boost.startDate || "").getTime())) *
                            100,
                        ),
                      )
                    : 0;

                  return (
                    <Card key={boost.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-20 h-20 rounded object-cover"
                          />

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{product.name}</h4>
                              <Badge
                                className={`${
                                  boost.boostType === "basic"
                                    ? "bg-blue-500"
                                    : boost.boostType === "featured"
                                      ? "bg-purple-500"
                                      : boost.boostType === "premium"
                                        ? "bg-gold-500"
                                        : "bg-diamond-500"
                                } text-white`}
                              >
                                {getBoostTypeIcon(boost.boostType)}
                                <span className="ml-1 capitalize">
                                  {boost.boostType}
                                </span>
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                              <div>
                                <p className="text-muted-foreground">
                                  Impressions
                                </p>
                                <p className="font-medium">
                                  {boost.impressions?.toLocaleString() || 0}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Clicks</p>
                                <p className="font-medium">
                                  {boost.clicks?.toLocaleString() || 0}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">
                                  Conversions
                                </p>
                                <p className="font-medium">
                                  {boost.conversions || 0}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">ROI</p>
                                <p className="font-medium text-green-600">
                                  {boost.roi
                                    ? `${boost.roi}%`
                                    : "Calculating..."}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Time Remaining</span>
                                <span className="font-medium">{timeLeft}</span>
                              </div>
                              <Progress
                                value={progressPercentage}
                                className="h-2"
                              />
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="font-semibold text-lg">
                              {boost.cost} {boost.currency}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Total Spent
                            </p>
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-2"
                            >
                              <BarChart3 className="h-4 w-4 mr-1" />
                              View Analytics
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Boost Options */}
        <TabsContent value="boost-options">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">
                Choose Your Boost Level
              </h2>
              <p className="text-muted-foreground">
                Increase your product visibility and reach more customers
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {boostOptions.map((option) => (
                <Card
                  key={option.id}
                  className={`relative transition-all hover:shadow-lg ${
                    option.popular ? "border-blue-500 shadow-md" : ""
                  }`}
                >
                  {option.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-500 text-white px-3 py-1">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto mb-4 p-3 rounded-full bg-gray-100 w-fit">
                      {getBoostTypeIcon(option.boostType)}
                    </div>
                    <h3 className="font-semibold text-lg">{option.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </CardHeader>

                  <CardContent className="text-center space-y-4">
                    <div>
                      <span className="text-3xl font-bold">{option.price}</span>
                      <span className="text-muted-foreground ml-1">
                        {option.currency}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {option.duration} hours duration
                    </p>

                    {option.features && (
                      <div className="space-y-2">
                        {option.features.map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-sm"
                          >
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>

                  <CardFooter>
                    <Button
                      className="w-full"
                      onClick={() => {
                        setSelectedBoostOption(option.id);
                        setShowBoostProduct(true);
                      }}
                      variant={option.popular ? "default" : "outline"}
                    >
                      Choose {option.boostType}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics">
          <div className="space-y-6">
            {/* Performance Overview */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Boost Performance Overview</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      ${boostPerformance?.totalSpent?.toFixed(2) || "0.00"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Spent
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {boostPerformance?.averageROI ? `${boostPerformance.averageROI}%` : "0%"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Average ROI
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {boostPerformance?.clickThroughRate ? `${boostPerformance.clickThroughRate}%` : "0%"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Click Through Rate
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">
                      {boostPerformance?.conversionRate ? `${boostPerformance.conversionRate}%` : "0%"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Conversion Rate
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <h4 className="font-medium">Cost Analysis</h4>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Cost per Click</span>
                    <span className="font-medium">
                      ${boostPerformance?.costPerClick || "0.00"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cost per Conversion</span>
                    <span className="font-medium">
                      ${boostPerformance?.costPerConversion || "0.00"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Impressions</span>
                    <span className="font-medium">
                      {boostPerformance?.totalImpressions?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Clicks</span>
                    <span className="font-medium">
                      {boostPerformance?.totalClicks?.toLocaleString() || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h4 className="font-medium">Performance Trends</h4>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-center justify-center border rounded-md">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-gray-300 mx-auto" />
                      <p className="text-muted-foreground mt-2">
                        Performance charts will appear here
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Campaign Details Dialog */}
      <Dialog open={showCampaignDetails} onOpenChange={setShowCampaignDetails}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Campaign Details</DialogTitle>
            <DialogDescription>
              Complete information about this campaign
            </DialogDescription>
          </DialogHeader>

          {selectedCampaign && (
            <div className="space-y-6">
              {/* Campaign Banner */}
              <div
                className="h-32 rounded-lg relative"
                style={{
                  backgroundColor:
                    selectedCampaign.background_color || "#f3f4f6",
                  backgroundImage: selectedCampaign.banner_image
                    ? `url(${selectedCampaign.banner_image})`
                    : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center">
                  <h3
                    className="text-xl font-bold text-center px-4"
                    style={{ color: selectedCampaign.text_color || "#ffffff" }}
                  >
                    {selectedCampaign.banner_text || selectedCampaign.name}
                  </h3>
                </div>
              </div>

              {/* Campaign Info */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-muted-foreground">
                    {selectedCampaign.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Campaign Period</h4>
                    <p className="text-sm">
                      Start: {formatDate(selectedCampaign.start_date)}
                    </p>
                    <p className="text-sm">
                      End: {formatDate(selectedCampaign.end_date)}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Participation</h4>
                    <p className="text-sm">
                      Used: {selectedCampaign.usage_count || 0}
                    </p>
                    <p className="text-sm">
                      Limit: {selectedCampaign.usage_limit || "Unlimited"}
                    </p>
                  </div>
                </div>

                {selectedCampaign.discount_type && (
                  <div>
                    <h4 className="font-semibold mb-2">Discount Details</h4>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-green-800 font-medium">
                        {selectedCampaign.discount_value}% discount
                      </p>
                      {selectedCampaign.min_order_amount && (
                        <p className="text-green-600 text-sm">
                          Minimum order: ${selectedCampaign.min_order_amount}
                        </p>
                      )}
                      {selectedCampaign.max_discount && (
                        <p className="text-green-600 text-sm">
                          Maximum discount: ${selectedCampaign.max_discount}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCampaignDetails(false)}
            >
              Close
            </Button>
            {selectedCampaign?.status === "active" && (
              <Button
                onClick={() => {
                  setShowCampaignDetails(false);
                  setShowJoinCampaign(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Join Campaign
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Join Campaign Dialog */}
      <Dialog open={showJoinCampaign} onOpenChange={setShowJoinCampaign}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Join Campaign</DialogTitle>
            <DialogDescription>
              Select products to participate in this campaign
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Select the products you want to include in the campaign. Products
              must meet the campaign criteria.
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {myListings.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <input
                    type="checkbox"
                    id={`product-${product.id}`}
                    checked={selectedProducts.includes(product.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProducts([...selectedProducts, product.id]);
                      } else {
                        setSelectedProducts(
                          selectedProducts.filter((id) => id !== product.id),
                        );
                      }
                    }}
                    className="rounded"
                  />
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{product.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      ${product.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowJoinCampaign(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleJoinCampaign}
              disabled={selectedProducts.length === 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              Join Campaign ({selectedProducts.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Boost Product Dialog */}
      <Dialog open={showBoostProduct} onOpenChange={setShowBoostProduct}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Boost Product</DialogTitle>
            <DialogDescription>
              Select a product and boost package to increase visibility
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Product Selection */}
            <div>
              <Label>Select Product</Label>
              <Select
                onValueChange={(value) => {
                  const product = myListings.find((p) => p.id === value);
                  setSelectedProduct(product || null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a product to boost" />
                </SelectTrigger>
                <SelectContent>
                  {myListings.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      <div className="flex items-center gap-2">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-6 h-6 rounded object-cover"
                        />
                        <span>{product.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Boost Option Selection */}
            <div>
              <Label>Select Boost Package</Label>
              <div className="space-y-2 mt-2">
                {boostOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedBoostOption === option.id
                        ? "border-blue-500 bg-blue-50"
                        : ""
                    }`}
                    onClick={() => setSelectedBoostOption(option.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{option.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {option.price} {option.currency}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {option.duration}h
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBoostProduct(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBoostProduct}
              disabled={!selectedProduct || !selectedBoostOption}
            >
              <Rocket className="h-4 w-4 mr-2" />
              Boost Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CampaignsAndBoostingSystem;