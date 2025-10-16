// @ts-nocheck
import React, { useState } from "react";
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
import {
  Campaign,
  ProductBoost,
  BoostOption,
  Product,
} from "@/types/enhanced-marketplace";

// Mock campaigns data
const mockCampaigns: Campaign[] = [
  {
    id: "campaign1",
    name: "Black Friday Mega Sale",
    slug: "black-friday-2024",
    description:
      "The biggest sale of the year with up to 70% off on electronics and fashion",
    type: "seasonal",
    startDate: "2024-11-29T00:00:00Z",
    endDate: "2024-12-02T23:59:59Z",
    bannerImage:
      "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=1200&auto=format",
    bannerText: "BLACK FRIDAY SALE - Up to 70% OFF!",
    backgroundColor: "#000000",
    textColor: "#FFFFFF",
    discountType: "percentage",
    discountValue: 30,
    maxDiscount: 500,
    minOrderAmount: 50,
    maxParticipants: 500,
    maxProductsPerSeller: 20,
    usageLimit: 10000,
    usageCount: 3456,
    status: "active",
    isPublic: true,
    requiresApproval: true,
    createdBy: "admin1",
    viewCount: 45678,
    clickCount: 12345,
    conversionCount: 2345,
    totalRevenue: 234567.89,
    createdAt: "2024-10-15T10:00:00Z",
    updatedAt: "2024-11-01T15:30:00Z",
  },
  {
    id: "campaign2",
    name: "Digital Products Flash Sale",
    slug: "digital-flash-sale",
    description: "24-hour flash sale on digital products and courses",
    type: "flash_sale",
    startDate: "2024-01-20T12:00:00Z",
    endDate: "2024-01-21T12:00:00Z",
    bannerText: "⚡ FLASH SALE - 50% OFF Digital Products!",
    backgroundColor: "#FF6B6B",
    textColor: "#FFFFFF",
    discountType: "percentage",
    discountValue: 50,
    maxParticipants: 100,
    usageLimit: 1000,
    usageCount: 234,
    status: "active",
    isPublic: true,
    requiresApproval: false,
    createdBy: "admin1",
    viewCount: 8976,
    clickCount: 2134,
    conversionCount: 456,
    totalRevenue: 12345.67,
    createdAt: "2024-01-19T09:00:00Z",
    updatedAt: "2024-01-20T10:00:00Z",
  },
  {
    id: "campaign3",
    name: "New Seller Spotlight",
    slug: "new-seller-spotlight",
    description: "Featuring amazing products from new sellers on our platform",
    type: "featured",
    startDate: "2024-01-15T00:00:00Z",
    endDate: "2024-02-15T23:59:59Z",
    bannerText: "🌟 Discover New Sellers",
    backgroundColor: "#4ECDC4",
    textColor: "#FFFFFF",
    maxParticipants: 50,
    maxProductsPerSeller: 5,
    status: "active",
    isPublic: true,
    requiresApproval: true,
    createdBy: "admin1",
    viewCount: 15432,
    clickCount: 3456,
    conversionCount: 567,
    totalRevenue: 23456.78,
    createdAt: "2024-01-10T14:00:00Z",
    updatedAt: "2024-01-15T12:00:00Z",
  },
];

// Mock boost performance data
const mockBoostPerformance = {
  totalSpent: 1250.5,
  totalImpressions: 45670,
  totalClicks: 2340,
  totalConversions: 234,
  averageROI: 245,
  clickThroughRate: 5.12,
  conversionRate: 10.0,
  costPerClick: 0.53,
  costPerConversion: 5.34,
};

const CampaignsAndBoostingSystem: React.FC = () => {
  const {
    getCampaigns,
    getCampaignProducts,
    requestCampaignParticipation,
    boostProduct,
    boostOptions,
    getMyBoosts,
    myListings,
  } = useEnhancedMarketplace();

  const { toast } = useToast();

  const [campaigns] = useState<Campaign[]>(mockCampaigns);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null,
  );
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCampaignDetails, setShowCampaignDetails] = useState(false);
  const [showJoinCampaign, setShowJoinCampaign] = useState(false);
  const [showBoostProduct, setShowBoostProduct] = useState(false);
  const [selectedBoostOption, setSelectedBoostOption] = useState<string>("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const myBoosts = getMyBoosts();
  const activeBoosts = myBoosts.filter((b) => b.status === "active");

  const getCampaignStatusBadge = (campaign: Campaign) => {
    const now = new Date();
    const startDate = new Date(campaign.startDate);
    const endDate = new Date(campaign.endDate);

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
                      .reduce((sum, c) => sum + c.viewCount, 0)
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
                      .reduce((sum, c) => sum + c.conversionCount, 0)
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
                      .reduce((sum, c) => sum + c.totalRevenue, 0)
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
                      backgroundColor: campaign.backgroundColor || "#f3f4f6",
                      backgroundImage: campaign.bannerImage
                        ? `url(${campaign.bannerImage})`
                        : undefined,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                      <h3
                        className="text-xl font-bold text-center px-4"
                        style={{ color: campaign.textColor || "#ffffff" }}
                      >
                        {campaign.bannerText || campaign.name}
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
                          {formatDate(campaign.startDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Ends</p>
                        <p className="font-medium">
                          {formatDate(campaign.endDate)}
                        </p>
                      </div>
                    </div>

                    {/* Time Left */}
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {calculateTimeLeft(campaign.endDate)}
                      </span>
                    </div>

                    {/* Discount Info */}
                    {campaign.discountType && campaign.discountValue && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Percent className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-800">
                            {campaign.discountValue}% discount
                          </span>
                        </div>
                        {campaign.minOrderAmount && (
                          <p className="text-sm text-green-600 mt-1">
                            Min order: ${campaign.minOrderAmount}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Participation Stats */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Participation</span>
                        <span>
                          {campaign.usageCount}/{campaign.usageLimit || "∞"}
                        </span>
                      </div>
                      {campaign.usageLimit && (
                        <Progress
                          value={
                            (campaign.usageCount / campaign.usageLimit) * 100
                          }
                          className="h-2"
                        />
                      )}
                    </div>

                    {/* Performance */}
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      <div>
                        <p className="font-medium">
                          {campaign.viewCount.toLocaleString()}
                        </p>
                        <p className="text-muted-foreground">Views</p>
                      </div>
                      <div>
                        <p className="font-medium">
                          {campaign.clickCount.toLocaleString()}
                        </p>
                        <p className="text-muted-foreground">Clicks</p>
                      </div>
                      <div>
                        <p className="font-medium">
                          {campaign.conversionCount.toLocaleString()}
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
                      {mockBoostPerformance.totalImpressions.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Impressions
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {mockBoostPerformance.totalClicks.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Clicks
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {mockBoostPerformance.averageROI}%
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
                                  {boost.impressions.toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Clicks</p>
                                <p className="font-medium">
                                  {boost.clicks.toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">
                                  Conversions
                                </p>
                                <p className="font-medium">
                                  {boost.conversions}
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
                      ${mockBoostPerformance.totalSpent.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Spent
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {mockBoostPerformance.averageROI}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Average ROI
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {mockBoostPerformance.clickThroughRate}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Click Through Rate
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">
                      {mockBoostPerformance.conversionRate}%
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
                      ${mockBoostPerformance.costPerClick}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cost per Conversion</span>
                    <span className="font-medium">
                      ${mockBoostPerformance.costPerConversion}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Impressions</span>
                    <span className="font-medium">
                      {mockBoostPerformance.totalImpressions.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Clicks</span>
                    <span className="font-medium">
                      {mockBoostPerformance.totalClicks.toLocaleString()}
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
                    selectedCampaign.backgroundColor || "#f3f4f6",
                  backgroundImage: selectedCampaign.bannerImage
                    ? `url(${selectedCampaign.bannerImage})`
                    : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center">
                  <h3
                    className="text-xl font-bold text-center px-4"
                    style={{ color: selectedCampaign.textColor || "#ffffff" }}
                  >
                    {selectedCampaign.bannerText || selectedCampaign.name}
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
                      Start: {formatDate(selectedCampaign.startDate)}
                    </p>
                    <p className="text-sm">
                      End: {formatDate(selectedCampaign.endDate)}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Participation</h4>
                    <p className="text-sm">
                      Used: {selectedCampaign.usageCount}
                    </p>
                    <p className="text-sm">
                      Limit: {selectedCampaign.usageLimit || "Unlimited"}
                    </p>
                  </div>
                </div>

                {selectedCampaign.discountType && (
                  <div>
                    <h4 className="font-semibold mb-2">Discount Details</h4>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-green-800 font-medium">
                        {selectedCampaign.discountValue}% discount
                      </p>
                      {selectedCampaign.minOrderAmount && (
                        <p className="text-green-600 text-sm">
                          Minimum order: ${selectedCampaign.minOrderAmount}
                        </p>
                      )}
                      {selectedCampaign.maxDiscount && (
                        <p className="text-green-600 text-sm">
                          Maximum discount: ${selectedCampaign.maxDiscount}
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
