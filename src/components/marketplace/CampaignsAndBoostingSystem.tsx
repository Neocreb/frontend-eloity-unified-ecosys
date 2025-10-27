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
      setSelectedBoostOption("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to boost product",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Campaigns Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Active Campaigns</h2>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-center py-8">
              <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Active Campaigns</h3>
              <p className="text-gray-500 mb-4">
                There are currently no active campaigns. Check back later or create your own.
              </p>
              <Button>Create Campaign</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaigns.map((campaign) => (
                <Card 
                  key={campaign.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedCampaign(campaign);
                    setShowCampaignDetails(true);
                  }}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getCampaignTypeIcon(campaign.type)}
                        <h3 className="font-semibold text-sm line-clamp-1">
                          {campaign.name}
                        </h3>
                      </div>
                      {getCampaignStatusBadge(campaign)}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {campaign.description}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">
                        {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                      </span>
                      <span className="font-medium">
                        {campaign.conversionCount || 0} conversions
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCampaign(campaign);
                        setShowJoinCampaign(true);
                      }}
                    >
                      Join Campaign
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Boosting Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Product Boosting</h2>
            <Button variant="outline" size="sm">
              <Sparkles className="h-4 w-4 mr-2" />
              Boost Product
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {myListings.length === 0 ? (
            <div className="text-center py-8">
              <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Products to Boost</h3>
              <p className="text-gray-500 mb-4">
                You don't have any products listed yet. Create your first product to start boosting.
              </p>
              <Button>Create Product</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myListings.slice(0, 4).map((product) => (
                  <div 
                    key={product.id} 
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{product.name}</h3>
                      <p className="text-xs text-gray-500">
                        ${product.price.toFixed(2)}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowBoostProduct(true);
                      }}
                    >
                      Boost
                    </Button>
                  </div>
                ))}
              </div>
              
              {activeBoosts.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-medium mb-2">Active Boosts</h3>
                    <div className="space-y-2">
                      {activeBoosts.slice(0, 3).map((boost) => {
                        const product = myListings.find(p => p.id === boost.productId);
                        return (
                          <div key={boost.id} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                            <div className="flex items-center gap-2">
                              {product && (
                                <img 
                                  src={product.image} 
                                  alt={product.name} 
                                  className="w-8 h-8 rounded object-cover"
                                />
                              )}
                              <div>
                                <p className="text-sm font-medium">
                                  {product?.name || "Unknown Product"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {boost.boostType} boost
                                </p>
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {Math.ceil((new Date(boost.endDate).getTime() - Date.now()) / (1000 * 60 * 60))}h left
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Campaign Details Dialog */}
      <Dialog open={showCampaignDetails} onOpenChange={setShowCampaignDetails}>
        <DialogContent className="max-w-2xl">
          {selectedCampaign && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getCampaignTypeIcon(selectedCampaign.type)}
                  {selectedCampaign.name}
                </DialogTitle>
                <DialogDescription>
                  {selectedCampaign.description}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-500">Start Date</p>
                    <p className="font-medium">
                      {new Date(selectedCampaign.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-500">End Date</p>
                    <p className="font-medium">
                      {new Date(selectedCampaign.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded">
                    <Eye className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-lg font-bold">{selectedCampaign.viewCount || 0}</p>
                    <p className="text-xs text-gray-500">Views</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded">
                    <MousePointer className="h-5 w-5 text-green-600 mx-auto mb-1" />
                    <p className="text-lg font-bold">{selectedCampaign.clickCount || 0}</p>
                    <p className="text-xs text-gray-500">Clicks</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded">
                    <ShoppingCart className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                    <p className="text-lg font-bold">{selectedCampaign.conversionCount || 0}</p>
                    <p className="text-xs text-gray-500">Conversions</p>
                  </div>
                </div>
                
                {selectedCampaign.bannerImage && (
                  <div>
                    <p className="text-sm font-medium mb-2">Campaign Banner</p>
                    <img 
                      src={selectedCampaign.bannerImage} 
                      alt={selectedCampaign.name} 
                      className="w-full h-32 object-cover rounded"
                    />
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button 
                  onClick={() => {
                    setShowCampaignDetails(false);
                    setShowJoinCampaign(true);
                  }}
                >
                  Join Campaign
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Join Campaign Dialog */}
      <Dialog open={showJoinCampaign} onOpenChange={setShowJoinCampaign}>
        <DialogContent>
          {selectedCampaign && (
            <>
              <DialogHeader>
                <DialogTitle>Join {selectedCampaign.name}</DialogTitle>
                <DialogDescription>
                  Select products to participate in this campaign
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="max-h-60 overflow-y-auto">
                  {myListings.map((product) => (
                    <div key={product.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProducts([...selectedProducts, product.id]);
                          } else {
                            setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-10 h-10 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <p className="text-xs text-gray-500">
                          ${product.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="text-xs text-gray-500">
                  <p>
                    Max {selectedCampaign.maxProductsPerSeller || 10} products per seller
                  </p>
                  {selectedCampaign.minOrderAmount && (
                    <p>
                      Minimum order amount: ${selectedCampaign.minOrderAmount.toFixed(2)}
                    </p>
                  )}
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
                  Request Participation
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Boost Product Dialog */}
      <Dialog open={showBoostProduct} onOpenChange={setShowBoostProduct}>
        <DialogContent>
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle>Boost {selectedProduct.name}</DialogTitle>
                <DialogDescription>
                  Select a boost package to increase visibility
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-3">
                {boostOptions.map((option: BoostOption) => (
                  <div 
                    key={option.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedBoostOption === option.id 
                        ? "border-blue-500 bg-blue-50" 
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedBoostOption(option.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          {getBoostTypeIcon(option.boostType)}
                          <h3 className="font-medium">{option.name}</h3>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {option.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-blue-600">
                          {option.price} {option.currency}
                        </p>
                        <p className="text-xs text-gray-500">
                          {option.duration} hours
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
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
                  disabled={!selectedBoostOption}
                >
                  Boost Product
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CampaignsAndBoostingSystem;