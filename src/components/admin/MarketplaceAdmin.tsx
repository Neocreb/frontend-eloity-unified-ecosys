import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Plus, 
  Trash2, 
  Calendar, 
  Tag, 
  DollarSign, 
  Clock, 
  Zap,
  TrendingUp,
  Eye,
  ShoppingCart,
  Target,
  Edit
} from "lucide-react";
import { MarketplaceService } from "@/services/marketplaceService";
import { Product } from "@/types/marketplace";
import { useToast } from "@/components/ui/use-toast";

interface FlashSale {
  id: string;
  title: string;
  description: string;
  discountPercentage: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  featuredProducts: string[]; // Product IDs
}

interface SponsoredProduct {
  id: string;
  productId: string;
  title: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  boostLevel: "basic" | "premium" | "featured";
  position: number;
}

interface MarketplaceAd {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  position: "hero" | "sidebar" | "footer" | "product_page";
  priority: number;
}

interface Campaign {
  id: string;
  name: string;
  description: string;
  type: "seasonal" | "flash_sale" | "featured" | "category_boost";
  startDate: string;
  endDate: string;
  bannerImage?: string;
  bannerText?: string;
  backgroundColor?: string;
  textColor?: string;
  discountType?: "percentage" | "fixed_amount" | "buy_x_get_y";
  discountValue?: number;
  maxDiscount?: number;
  minOrderAmount?: number;
  usageLimit?: number;
  usageCount: number;
  status: "draft" | "active" | "paused" | "ended";
  isPublic: boolean;
  viewCount: number;
  clickCount: number;
  conversionCount: number;
  totalRevenue: number;
  createdAt: string;
  updatedAt: string;
}

export const MarketplaceAdmin = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [sponsoredProducts, setSponsoredProducts] = useState<SponsoredProduct[]>([]);
  const [ads, setAds] = useState<MarketplaceAd[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("flash-sales");

  // Form states
  const [newFlashSale, setNewFlashSale] = useState<Omit<FlashSale, "id">>({
    title: "",
    description: "",
    discountPercentage: 20,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    isActive: true,
    featuredProducts: []
  });

  const [newSponsoredProduct, setNewSponsoredProduct] = useState<Omit<SponsoredProduct, "id">>({
    productId: "",
    title: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    isActive: true,
    boostLevel: "basic",
    position: 1
  });

  const [newAd, setNewAd] = useState<Omit<MarketplaceAd, "id">>({
    title: "",
    description: "",
    imageUrl: "",
    targetUrl: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    isActive: true,
    position: "hero",
    priority: 1
  });

  const [newCampaign, setNewCampaign] = useState<Omit<Campaign, "id" | "createdAt" | "updatedAt" | "usageCount" | "viewCount" | "clickCount" | "conversionCount" | "totalRevenue">>({
    name: "",
    description: "",
    type: "seasonal",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    status: "draft",
    isPublic: true,
    bannerText: "",
    discountType: "percentage",
    discountValue: 10,
    maxDiscount: 100,
    minOrderAmount: 0,
    usageLimit: 1000
  });

  useEffect(() => {
    loadMarketplaceData();
  }, []);

  const loadMarketplaceData = async () => {
    try {
      setLoading(true);
      const productsData = await MarketplaceService.getProducts({ limit: 100 });
      setProducts(productsData);
      
      // Load existing flash sales, sponsored products, and ads
      const flashSalesData = await MarketplaceService.getActiveFlashSales();
      setFlashSales(flashSalesData);
      
      const sponsoredProductsData = await MarketplaceService.getSponsoredProducts();
      setSponsoredProducts(sponsoredProductsData);
      
      const adsData = await MarketplaceService.getActiveAds();
      setAds(adsData);
      
      // Load campaigns
      const campaignsData = await MarketplaceService.getCampaigns();
      setCampaigns(campaignsData);
    } catch (error) {
      console.error("Error loading marketplace data:", error);
      toast({
        title: "Error",
        description: "Failed to load marketplace data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFlashSale = async () => {
    if (!newFlashSale.title) {
      toast({
        title: "Validation Error",
        description: "Please enter a title for the flash sale",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await MarketplaceService.createFlashSale(newFlashSale);
      
      if (result) {
        setFlashSales([...flashSales, result]);
        
        // Reset form
        setNewFlashSale({
          title: "",
          description: "",
          discountPercentage: 20,
          startDate: new Date().toISOString().split("T")[0],
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          isActive: true,
          featuredProducts: []
        });
        
        toast({
          title: "Success",
          description: "Flash sale created successfully"
        });
      } else {
        throw new Error("Failed to create flash sale");
      }
    } catch (error) {
      console.error("Error creating flash sale:", error);
      toast({
        title: "Error",
        description: "Failed to create flash sale",
        variant: "destructive"
      });
    }
  };

  const handleCreateSponsoredProduct = async () => {
    if (!newSponsoredProduct.productId) {
      toast({
        title: "Validation Error",
        description: "Please select a product to sponsor",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await MarketplaceService.createSponsoredProduct(newSponsoredProduct);
      
      if (result) {
        setSponsoredProducts([...sponsoredProducts, result]);
        
        // Reset form
        setNewSponsoredProduct({
          productId: "",
          title: "",
          startDate: new Date().toISOString().split("T")[0],
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          isActive: true,
          boostLevel: "basic",
          position: 1
        });
        
        toast({
          title: "Success",
          description: "Sponsored product created successfully"
        });
      } else {
        throw new Error("Failed to create sponsored product");
      }
    } catch (error) {
      console.error("Error creating sponsored product:", error);
      toast({
        title: "Error",
        description: "Failed to create sponsored product",
        variant: "destructive"
      });
    }
  };

  const handleCreateAd = async () => {
    if (!newAd.title || !newAd.imageUrl || !newAd.targetUrl) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields for the ad",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await MarketplaceService.createAd(newAd);
      
      if (result) {
        setAds([...ads, result]);
        
        // Reset form
        setNewAd({
          title: "",
          description: "",
          imageUrl: "",
          targetUrl: "",
          startDate: new Date().toISOString().split("T")[0],
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          isActive: true,
          position: "hero",
          priority: 1
        });
        
        toast({
          title: "Success",
          description: "Ad created successfully"
        });
      } else {
        throw new Error("Failed to create ad");
      }
    } catch (error) {
      console.error("Error creating ad:", error);
      toast({
        title: "Error",
        description: "Failed to create ad",
        variant: "destructive"
      });
    }
  };

  const handleDeleteFlashSale = async (id: string) => {
    try {
      const result = await MarketplaceService.deleteFlashSale(id);
      
      if (result) {
        setFlashSales(flashSales.filter(sale => sale.id !== id));
        toast({
          title: "Success",
          description: "Flash sale deleted successfully"
        });
      } else {
        throw new Error("Failed to delete flash sale");
      }
    } catch (error) {
      console.error("Error deleting flash sale:", error);
      toast({
        title: "Error",
        description: "Failed to delete flash sale",
        variant: "destructive"
      });
    }
  };

  const handleDeleteSponsoredProduct = async (id: string) => {
    try {
      const result = await MarketplaceService.deleteSponsoredProduct(id);
      
      if (result) {
        setSponsoredProducts(sponsoredProducts.filter(sp => sp.id !== id));
        toast({
          title: "Success",
          description: "Sponsored product deleted successfully"
        });
      } else {
        throw new Error("Failed to delete sponsored product");
      }
    } catch (error) {
      console.error("Error deleting sponsored product:", error);
      toast({
        title: "Error",
        description: "Failed to delete sponsored product",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAd = async (id: string) => {
    try {
      const result = await MarketplaceService.deleteAd(id);
      
      if (result) {
        setAds(ads.filter(ad => ad.id !== id));
        toast({
          title: "Success",
          description: "Ad deleted successfully"
        });
      } else {
        throw new Error("Failed to delete ad");
      }
    } catch (error) {
      console.error("Error deleting ad:", error);
      toast({
        title: "Error",
        description: "Failed to delete ad",
        variant: "destructive"
      });
    }
  };

  const handleCreateCampaign = async () => {
    if (!newCampaign.name) {
      toast({
        title: "Validation Error",
        description: "Please enter a name for the campaign",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await MarketplaceService.createCampaign(newCampaign);
      
      if (result) {
        setCampaigns([...campaigns, result]);
        
        // Reset form
        setNewCampaign({
          name: "",
          description: "",
          type: "seasonal",
          startDate: new Date().toISOString().split("T")[0],
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          status: "draft",
          isPublic: true,
          bannerText: "",
          discountType: "percentage",
          discountValue: 10,
          maxDiscount: 100,
          minOrderAmount: 0,
          usageLimit: 1000
        });
        
        toast({
          title: "Success",
          description: "Campaign created successfully"
        });
      } else {
        throw new Error("Failed to create campaign");
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast({
        title: "Error",
        description: "Failed to create campaign",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    try {
      const result = await MarketplaceService.deleteCampaign(id);
      
      if (result) {
        setCampaigns(campaigns.filter(campaign => campaign.id !== id));
        toast({
          title: "Success",
          description: "Campaign deleted successfully"
        });
      } else {
        throw new Error("Failed to delete campaign");
      }
    } catch (error) {
      console.error("Error deleting campaign:", error);
      toast({
        title: "Error",
        description: "Failed to delete campaign",
        variant: "destructive"
      });
    }
  };

  const toggleCampaignStatus = (id: string) => {
    setCampaigns(campaigns.map(campaign => {
      if (campaign.id === id) {
        const newStatus = campaign.status === "active" ? "paused" : "active";
        return { ...campaign, status: newStatus };
      }
      return campaign;
    }));
  };

  const updateCampaign = async (id: string, updates: Partial<Campaign>) => {
    try {
      const result = await MarketplaceService.updateCampaign(id, updates);
      
      if (result) {
        setCampaigns(campaigns.map(campaign => 
          campaign.id === id ? { ...campaign, ...result } : campaign
        ));
        
        toast({
          title: "Success",
          description: "Campaign updated successfully"
        });
      } else {
        throw new Error("Failed to update campaign");
      }
    } catch (error) {
      console.error("Error updating campaign:", error);
      toast({
        title: "Error",
        description: "Failed to update campaign",
        variant: "destructive"
      });
    }
  };

  const getCampaignById = (id: string) => {
    return campaigns.find(c => c.id === id);
  };

  const getActiveCampaigns = () => {
    return campaigns.filter(c => c.status === "active");
  };

  const getUpcomingCampaigns = () => {
    const now = new Date();
    return campaigns.filter(c => {
      const startDate = new Date(c.startDate);
      return c.status === "draft" && startDate > now;
    });
  };

  const getPastCampaigns = () => {
    const now = new Date();
    return campaigns.filter(c => {
      const endDate = new Date(c.endDate);
      return c.status === "ended" || endDate < now;
    });
  };

  const toggleFlashSaleStatus = (id: string) => {
    setFlashSales(flashSales.map(sale => 
      sale.id === id ? { ...sale, isActive: !sale.isActive } : sale
    ));
  };

  const toggleSponsoredProductStatus = (id: string) => {
    setSponsoredProducts(sponsoredProducts.map(sp => 
      sp.id === id ? { ...sp, isActive: !sp.isActive } : sp
    ));
  };

  const toggleAdStatus = (id: string) => {
    setAds(ads.map(ad => 
      ad.id === id ? { ...ad, isActive: !ad.isActive } : ad
    ));
  };

  const getProductById = (productId: string) => {
    return products.find(p => p.id === productId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Marketplace Management</h2>
          <p className="text-gray-600">Manage flash sales, sponsored products, advertisements, and campaigns</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Button
          variant={activeTab === "flash-sales" ? "default" : "outline"}
          className="flex items-center gap-2"
          onClick={() => setActiveTab("flash-sales")}
        >
          <Zap className="w-4 h-4" />
          Flash Sales
        </Button>
        <Button
          variant={activeTab === "sponsored" ? "default" : "outline"}
          className="flex items-center gap-2"
          onClick={() => setActiveTab("sponsored")}
        >
          <TrendingUp className="w-4 h-4" />
          Sponsored Products
        </Button>
        <Button
          variant={activeTab === "ads" ? "default" : "outline"}
          className="flex items-center gap-2"
          onClick={() => setActiveTab("ads")}
        >
          <Eye className="w-4 h-4" />
          Advertisements
        </Button>
        <Button
          variant={activeTab === "campaigns" ? "default" : "outline"}
          className="flex items-center gap-2"
          onClick={() => setActiveTab("campaigns")}
        >
          <Target className="w-4 h-4" />
          Campaigns
        </Button>
        <Button
          variant={activeTab === "analytics" ? "default" : "outline"}
          className="flex items-center gap-2"
          onClick={() => setActiveTab("analytics")}
        >
          <ShoppingCart className="w-4 h-4" />
          Analytics
        </Button>
      </div>

      {activeTab === "flash-sales" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Flash Sale</CardTitle>
              <CardDescription>Set up a limited-time discount event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="flash-title">Title</Label>
                  <Input
                    id="flash-title"
                    value={newFlashSale.title}
                    onChange={(e) => setNewFlashSale({...newFlashSale, title: e.target.value})}
                    placeholder="e.g., Summer Sale, Black Friday"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="flash-discount">Discount Percentage</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="flash-discount"
                      type="number"
                      min="1"
                      max="99"
                      value={newFlashSale.discountPercentage}
                      onChange={(e) => setNewFlashSale({...newFlashSale, discountPercentage: parseInt(e.target.value) || 0})}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="flash-description">Description</Label>
                <Textarea
                  id="flash-description"
                  value={newFlashSale.description}
                  onChange={(e) => setNewFlashSale({...newFlashSale, description: e.target.value})}
                  placeholder="Describe the flash sale event"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="flash-start">Start Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="flash-start"
                      type="date"
                      value={newFlashSale.startDate}
                      onChange={(e) => setNewFlashSale({...newFlashSale, startDate: e.target.value})}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="flash-end">End Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="flash-end"
                      type="date"
                      value={newFlashSale.endDate}
                      onChange={(e) => setNewFlashSale({...newFlashSale, endDate: e.target.value})}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="flash-active"
                  checked={newFlashSale.isActive}
                  onCheckedChange={(checked) => setNewFlashSale({...newFlashSale, isActive: checked})}
                />
                <Label htmlFor="flash-active">Active</Label>
              </div>
              
              <Button onClick={handleCreateFlashSale} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Flash Sale
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Active Flash Sales</CardTitle>
              <CardDescription>Manage current and upcoming flash sale events</CardDescription>
            </CardHeader>
            <CardContent>
              {flashSales.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No flash sales created yet</p>
              ) : (
                <div className="space-y-4">
                  {flashSales.map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{sale.title}</h3>
                          <Badge variant={sale.isActive ? "default" : "secondary"}>
                            {sale.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{sale.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="flex items-center gap-1">
                            <Tag className="w-4 h-4" />
                            {sale.discountPercentage}% off
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(sale.startDate).toLocaleDateString()} - {new Date(sale.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={sale.isActive}
                          onCheckedChange={() => toggleFlashSaleStatus(sale.id)}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteFlashSale(sale.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      
      {activeTab === "sponsored" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sponsor a Product</CardTitle>
              <CardDescription>Boost visibility for specific products</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sponsored-product">Product</Label>
                  <Select
                    value={newSponsoredProduct.productId}
                    onValueChange={(value) => setNewSponsoredProduct({...newSponsoredProduct, productId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sponsored-boost">Boost Level</Label>
                  <Select
                    value={newSponsoredProduct.boostLevel}
                    onValueChange={(value) => setNewSponsoredProduct({
                      ...newSponsoredProduct, 
                      boostLevel: value as "basic" | "premium" | "featured"
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select boost level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="featured">Featured</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sponsored-start">Start Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-33 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="sponsored-start"
                      type="date"
                      value={newSponsoredProduct.startDate}
                      onChange={(e) => setNewSponsoredProduct({...newSponsoredProduct, startDate: e.target.value})}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sponsored-end">End Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="sponsored-end"
                      type="date"
                      value={newSponsoredProduct.endDate}
                      onChange={(e) => setNewSponsoredProduct({...newSponsoredProduct, endDate: e.target.value})}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="sponsored-active"
                  checked={newSponsoredProduct.isActive}
                  onCheckedChange={(checked) => setNewSponsoredProduct({...newSponsoredProduct, isActive: checked})}
                />
                <Label htmlFor="sponsored-active">Active</Label>
              </div>
              
              <Button onClick={handleCreateSponsoredProduct} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Sponsor Product
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Active Sponsored Products</CardTitle>
              <CardDescription>Manage currently sponsored products</CardDescription>
            </CardHeader>
            <CardContent>
              {sponsoredProducts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No sponsored products yet</p>
              ) : (
                <div className="space-y-4">
                  {sponsoredProducts.map((sp) => {
                    const product = getProductById(sp.productId);
                    return (
                      <div key={sp.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{product?.name || "Unknown Product"}</h3>
                            <Badge variant={sp.isActive ? "default" : "secondary"}>
                              {sp.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <Badge variant="outline">{sp.boostLevel}</Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {new Date(sp.startDate).toLocaleDateString()} - {new Date(sp.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={sp.isActive}
                            onCheckedChange={() => toggleSponsoredProductStatus(sp.id)}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteSponsoredProduct(sp.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      
      {activeTab === "ads" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Advertisement</CardTitle>
              <CardDescription>Create promotional banners and ads</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ad-title">Title</Label>
                  <Input
                    id="ad-title"
                    value={newAd.title}
                    onChange={(e) => setNewAd({...newAd, title: e.target.value})}
                    placeholder="Ad title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ad-position">Position</Label>
                  <Select
                    value={newAd.position}
                    onValueChange={(value) => setNewAd({
                      ...newAd, 
                      position: value as "hero" | "sidebar" | "footer" | "product_page"
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hero">Hero Banner</SelectItem>
                      <SelectItem value="sidebar">Sidebar</SelectItem>
                      <SelectItem value="footer">Footer</SelectItem>
                      <SelectItem value="product_page">Product Page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ad-description">Description</Label>
                <Textarea
                  id="ad-description"
                  value={newAd.description}
                  onChange={(e) => setNewAd({...newAd, description: e.target.value})}
                  placeholder="Ad description"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ad-image">Image URL</Label>
                  <Input
                    id="ad-image"
                    value={newAd.imageUrl}
                    onChange={(e) => setNewAd({...newAd, imageUrl: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ad-target">Target URL</Label>
                  <Input
                    id="ad-target"
                    value={newAd.targetUrl}
                    onChange={(e) => setNewAd({...newAd, targetUrl: e.target.value})}
                    placeholder="https://example.com/target"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ad-start">Start Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="ad-start"
                      type="date"
                      value={newAd.startDate}
                      onChange={(e) => setNewAd({...newAd, startDate: e.target.value})}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ad-end">End Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="ad-end"
                      type="date"
                      value={newAd.endDate}
                      onChange={(e) => setNewAd({...newAd, endDate: e.target.value})}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="ad-active"
                  checked={newAd.isActive}
                  onCheckedChange={(checked) => setNewAd({...newAd, isActive: checked})}
                />
                <Label htmlFor="ad-active">Active</Label>
              </div>
              
              <Button onClick={handleCreateAd} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Advertisement
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Active Advertisements</CardTitle>
              <CardDescription>Manage current advertisements</CardDescription>
            </CardHeader>
            <CardContent>
              {ads.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No advertisements created yet</p>
              ) : (
                <div className="space-y-4">
                  {ads.map((ad) => (
                    <div key={ad.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{ad.title}</h3>
                          <Badge variant={ad.isActive ? "default" : "secondary"}>
                            {ad.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant="outline">{ad.position}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{ad.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(ad.startDate).toLocaleDateString()} - {new Date(ad.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={ad.isActive}
                          onCheckedChange={() => toggleAdStatus(ad.id)}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteAd(ad.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      
      {activeTab === "campaigns" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Campaign</CardTitle>
              <CardDescription>Set up a marketing campaign to promote products</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="campaign-name">Campaign Name</Label>
                  <Input
                    id="campaign-name"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                    placeholder="e.g., Summer Sale, Back to School"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campaign-type">Campaign Type</Label>
                  <Select
                    value={newCampaign.type}
                    onValueChange={(value) => setNewCampaign({...newCampaign, type: value as any})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select campaign type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="seasonal">Seasonal</SelectItem>
                      <SelectItem value="flash_sale">Flash Sale</SelectItem>
                      <SelectItem value="featured">Featured Products</SelectItem>
                      <SelectItem value="category_boost">Category Boost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="campaign-description">Description</Label>
                <Textarea
                  id="campaign-description"
                  value={newCampaign.description}
                  onChange={(e) => setNewCampaign({...newCampaign, description: e.target.value})}
                  placeholder="Describe the campaign"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="campaign-start">Start Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="campaign-start"
                      type="date"
                      value={newCampaign.startDate}
                      onChange={(e) => setNewCampaign({...newCampaign, startDate: e.target.value})}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campaign-end">End Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="campaign-end"
                      type="date"
                      value={newCampaign.endDate}
                      onChange={(e) => setNewCampaign({...newCampaign, endDate: e.target.value})}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campaign-discount-value">Discount Value</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="campaign-discount-value"
                      type="number"
                      min="0"
                      value={newCampaign.discountValue}
                      onChange={(e) => setNewCampaign({...newCampaign, discountValue: parseInt(e.target.value) || 0})}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="campaign-discount-type">Discount Type</Label>
                  <Select
                    value={newCampaign.discountType}
                    onValueChange={(value) => setNewCampaign({...newCampaign, discountType: value as any})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select discount type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                      <SelectItem value="buy_x_get_y">Buy X Get Y</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campaign-banner-text">Banner Text</Label>
                  <Input
                    id="campaign-banner-text"
                    value={newCampaign.bannerText}
                    onChange={(e) => setNewCampaign({...newCampaign, bannerText: e.target.value})}
                    placeholder="Text to display on campaign banner"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="campaign-public"
                  checked={newCampaign.isPublic}
                  onCheckedChange={(checked) => setNewCampaign({...newCampaign, isPublic: checked})}
                />
                <Label htmlFor="campaign-public">Public Campaign</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="campaign-status"
                  checked={newCampaign.status === "active"}
                  onCheckedChange={(checked) => setNewCampaign({...newCampaign, status: checked ? "active" : "draft"})}
                />
                <Label htmlFor="campaign-status">Active</Label>
              </div>
              
              <Button onClick={handleCreateCampaign} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Campaign
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Active Campaigns</CardTitle>
              <CardDescription>Manage current and upcoming marketing campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              {campaigns.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No campaigns created yet</p>
              ) : (
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{campaign.name}</h3>
                          <Badge variant={campaign.status === "active" ? "default" : "secondary"}>
                            {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                          </Badge>
                          <Badge variant="outline">{campaign.type.replace('_', ' ')}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{campaign.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="flex items-center gap-1">
                            <Tag className="w-4 h-4" />
                            {campaign.discountValue}{campaign.discountType === "percentage" ? "%" : "$"} off
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={campaign.status === "active"}
                          onCheckedChange={() => toggleCampaignStatus(campaign.id)}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteCampaign(campaign.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      
      {activeTab === "analytics" && (
        <Card>
          <CardHeader>
            <CardTitle>Marketplace Analytics</CardTitle>
            <CardDescription>Track performance of flash sales and sponsored products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">24</div>
                <div className="text-sm text-gray-600">Active Flash Sales</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">156</div>
                <div className="text-sm text-gray-600">Sponsored Products</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">89</div>
                <div className="text-sm text-gray-600">Active Ads</div>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">12</div>
                <div className="text-sm text-gray-600">Active Campaigns</div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="font-medium mb-3">Recent Performance</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span>Summer Sale Flash Event</span>
                  <span className="font-medium">+342% sales</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span>Electronics Category Boost</span>
                  <span className="font-medium">+187% views</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span>Homepage Hero Ad</span>
                  <span className="font-medium">+89% CTR</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span>Holiday Campaign</span>
                  <span className="font-medium">+215% conversions</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};