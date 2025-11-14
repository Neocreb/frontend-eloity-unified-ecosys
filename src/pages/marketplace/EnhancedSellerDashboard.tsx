// @ts-nocheck
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye,
  Heart,
  MessageCircle,
  Edit,
  Trash2,
  Sparkle,
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  Star,
  Calendar,
  BarChart3,
  Settings,
  FileText,
  Truck,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Upload,
  Filter,
  Search,
  RefreshCw,
  MoreHorizontal,
  Zap,
  Copy,
  ShoppingCart,
  Target,
  Activity,
  BarChart3 as BarChartIcon,
} from "lucide-react";
import { useEnhancedMarketplace } from "@/contexts/EnhancedMarketplaceContext";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Product, ProductBoost, BoostOption, Order, OrderStatus } from "@/types/enhanced-marketplace";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageLoading } from "@/components/ui/loading-states";
import { Progress } from "@/components/ui/progress";

interface Analytics {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  averageRating: number;
  monthlyRevenue: number[];
  topSellingProducts: Product[];
  recentOrders: Order[];
}

export default function EnhancedSellerDashboard() {
  const {
    myListings,
    deleteProduct,
    boostProduct,
    boostOptions,
    getProductBoosts,
    getMyBoosts,
    getSellerAnalytics,
    getProductPerformance,
    duplicateProduct,
    getSellerOrders,
    updateOrderStatus,
  } = useEnhancedMarketplace();

  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showBoostDialog, setShowBoostDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedBoostOption, setSelectedBoostOption] = useState<string | null>(
    null,
  );
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<
    "daily" | "weekly" | "monthly"
  >("weekly");
  const [sellerOrders, setSellerOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [sellerAnalytics, setSellerAnalytics] = useState<any>(null);
  const [myBoosts, setMyBoosts] = useState<ProductBoost[]>([]);
  const [activeBoosts, setActiveBoosts] = useState<ProductBoost[]>([]);

  const [orderFilters, setOrderFilters] = useState({
    status: "all" as "all" | OrderStatus,
    dateRange: "all" as "all" | "today" | "week" | "month",
  });

  const [fulfillmentTracking, setFulfillmentTracking] = useState<Record<string, any>>({});

  // Load seller orders and analytics
  useEffect(() => {
    const loadSellerData = async () => {
      if (!user) return;
      
      try {
        // Load seller orders
        setLoadingOrders(true);
        const orders = await getSellerOrders(user.id);
        setSellerOrders(orders);
        
        // Load seller analytics
        const analytics = await getSellerAnalytics();
        setSellerAnalytics(analytics);
        
        // Load boosts
        const boosts = getMyBoosts();
        setMyBoosts(boosts);
        setActiveBoosts(boosts.filter((b) => b.status === "active"));
      } catch (error) {
        console.error("Failed to load seller data:", error);
        toast({
          title: "Error",
          description: "Failed to load seller data",
          variant: "destructive",
        });
      } finally {
        setLoadingOrders(false);
      }
    };

    loadSellerData();
  }, [user, getSellerOrders, getSellerAnalytics, getMyBoosts, toast]);

  const handleCreateListing = () => {
    navigate("/marketplace/list");
  };

  const handleEditListing = (productId: string) => {
    navigate(`/marketplace/list?edit=${productId}`);
  };

  const handleDuplicateProduct = async (productId: string) => {
    try {
      await duplicateProduct(productId);
      toast({
        title: "Product Duplicated",
        description: "A copy of your product has been created",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to duplicate product",
        variant: "destructive",
      });
    }
  };

  const handleOpenBoostDialog = (product: Product) => {
    setSelectedProduct(product);
    setShowBoostDialog(true);
  };

  const handleOpenDeleteDialog = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteDialog(true);
  };

  const handleBoost = async () => {
    if (!selectedProduct || !selectedBoostOption) return;

    try {
      await boostProduct(selectedProduct.id, selectedBoostOption);
      toast({
        title: "Product Boosted",
        description: "Your product will now appear in sponsored sections",
      });
      setShowBoostDialog(false);
      setSelectedBoostOption(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to boost product. Please try again",
        variant: "destructive",
      });
    }
  };

  // Filter products by type
  const physicalProducts = myListings.filter(p => p.productType === "physical" || !p.productType);
  const digitalProducts = myListings.filter(p => p.productType === "digital");
  const serviceProducts = myListings.filter(p => p.productType === "service");

  // Calculate statistics
  const totalProducts = myListings.length;
  const totalSales = myListings.reduce((sum, product) => sum + (product.totalSales || 0), 0);
  const totalRevenue = myListings.reduce((sum, product) => sum + (product.totalSales || 0) * (product.price || 0), 0);
  const averageRating = myListings.length > 0 
    ? myListings.reduce((sum, product) => sum + (product.averageRating || 0), 0) / myListings.length 
    : 0;

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl md:text-2xl font-semibold">Seller Dashboard</h2>
        <Button
          onClick={handleCreateListing}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          <span>List New Product</span>
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 h-auto">
          <TabsTrigger value="overview" className="text-xs md:text-sm">
            Overview
          </TabsTrigger>
          <TabsTrigger value="products" className="text-xs md:text-sm">
            Products
          </TabsTrigger>
          <TabsTrigger value="orders" className="text-xs md:text-sm">
            Orders
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs md:text-sm">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="boosts" className="text-xs md:text-sm">
            Boosts
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-xs md:text-sm">
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Total Sales
                    </p>
                    <p className="text-lg font-bold">
                      ${totalRevenue.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Orders</p>
                    <p className="text-lg font-bold">
                      {totalSales}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Products
                    </p>
                    <p className="text-lg font-bold">
                      {totalProducts}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Rating</p>
                    <p className="text-lg font-bold">
                      {averageRating.toFixed(1)}/5
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingOrders ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : sellerOrders.length > 0 ? (
                <div className="space-y-4">
                  {sellerOrders.slice(0, 5).map((order) => (
                    <div
                      key={order.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg gap-2"
                    >
                      <div className="flex-1">
                        <p className="font-medium">#{order.orderNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.customerName}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge 
                          variant={order.status === "completed" ? "success" : order.status === "cancelled" ? "destructive" : "default"}
                        >
                          {order.status}
                        </Badge>
                        <span className="font-semibold">${order.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    When customers place orders, they'll appear here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          {/* Product Type Filter Tabs */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Products ({myListings.length})</TabsTrigger>
              <TabsTrigger value="physical">Physical ({physicalProducts.length})</TabsTrigger>
              <TabsTrigger value="digital">Digital ({digitalProducts.length})</TabsTrigger>
              <TabsTrigger value="service">Services ({serviceProducts.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <ProductListings 
                products={myListings} 
                onEdit={handleEditListing}
                onDelete={handleOpenDeleteDialog}
                onDuplicate={handleDuplicateProduct}
                onBoost={handleOpenBoostDialog}
              />
            </TabsContent>
            
            <TabsContent value="physical">
              <ProductListings 
                products={physicalProducts} 
                onEdit={handleEditListing}
                onDelete={handleOpenDeleteDialog}
                onDuplicate={handleDuplicateProduct}
                onBoost={handleOpenBoostDialog}
              />
            </TabsContent>
            
            <TabsContent value="digital">
              <ProductListings 
                products={digitalProducts} 
                onEdit={handleEditListing}
                onDelete={handleOpenDeleteDialog}
                onDuplicate={handleDuplicateProduct}
                onBoost={handleOpenBoostDialog}
              />
            </TabsContent>
            
            <TabsContent value="service">
              <ProductListings 
                products={serviceProducts} 
                onEdit={handleEditListing}
                onDelete={handleOpenDeleteDialog}
                onDuplicate={handleDuplicateProduct}
                onBoost={handleOpenBoostDialog}
              />
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Management</CardTitle>
              <CardDescription>
                Manage your recent orders and fulfillment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingOrders ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : sellerOrders.length > 0 ? (
                <div className="space-y-4">
                  {sellerOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg gap-4"
                    >
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <p className="font-medium">#{order.orderNumber}</p>
                          <Badge 
                            variant={order.status === "completed" ? "success" : order.status === "cancelled" ? "destructive" : "default"}
                          >
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Customer: {order.customerName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Items: {order.items.length}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Date: {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <span className="font-semibold text-lg">
                          ${order.totalAmount.toFixed(2)}
                        </span>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => navigate(`/marketplace/orders/${order.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    When customers place orders, they'll appear here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <BarChartIcon className="h-8 w-8 mr-2" />
                  Revenue chart would be implemented here
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {myListings
                    .sort((a, b) => (b.totalSales || 0) - (a.totalSales || 0))
                    .slice(0, 3)
                    .map((product, index) => (
                      <div key={product.id} className="flex items-center gap-3">
                        <span className="text-sm font-medium">#{index + 1}</span>
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium line-clamp-1">
                            {product.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ${product.price} • {product.totalSales || 0} sales
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Boosts Tab */}
        <TabsContent value="boosts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Boosts</CardTitle>
              <CardDescription>
                Manage your product visibility boosts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeBoosts.length > 0 ? (
                <div className="space-y-4">
                  {activeBoosts.map((boost) => (
                    <div
                      key={boost.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{boost.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          Boosted until {new Date(boost.endTime).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="success">
                          Active
                        </Badge>
                        <span className="font-semibold">${boost.amount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Zap className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No active boosts</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Boost your products to increase visibility and sales.
                  </p>
                  <div className="mt-6">
                    <Button onClick={() => navigate("/marketplace/products")}>
                      <Zap className="mr-2 h-4 w-4" />
                      Boost Products
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Store Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input id="storeName" placeholder="Your Store Name" />
                </div>
                <div>
                  <Label htmlFor="storeEmail">Contact Email</Label>
                  <Input
                    id="storeEmail"
                    type="email"
                    placeholder="store@example.com"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="storeDescription">Store Description</Label>
                <Textarea
                  id="storeDescription"
                  placeholder="Describe your store..."
                />
              </div>
              <div className="flex gap-4">
                <Button>Save Changes</Button>
                <Button variant="outline">Reset</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Boost Dialog */}
      <Dialog open={showBoostDialog} onOpenChange={setShowBoostDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Boost Your Product</DialogTitle>
            <DialogDescription>
              Increase visibility and sales by boosting your product
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {boostOptions.map((option) => (
              <div
                key={option.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedBoostOption === option.id
                    ? "border-primary bg-primary/10"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelectedBoostOption(option.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{option.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {option.features?.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${option.price}</p>
                    <p className="text-sm text-gray-500">{option.duration} hours</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBoostDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBoost} disabled={!selectedBoostOption}>
              Boost Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={async () => {
                if (selectedProduct) {
                  try {
                    await deleteProduct(selectedProduct.id);
                    toast({
                      title: "Product Deleted",
                      description: "Your product has been successfully deleted.",
                    });
                    setShowDeleteDialog(false);
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to delete product. Please try again.",
                      variant: "destructive",
                    });
                  }
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Product Listings Component
const ProductListings = ({ 
  products, 
  onEdit, 
  onDelete, 
  onDuplicate, 
  onBoost 
}: { 
  products: Product[]; 
  onEdit: (id: string) => void;
  onDelete: (product: Product) => void;
  onDuplicate: (id: string) => void;
  onBoost: (product: Product) => void;
}) => {
  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new product.
          </p>
          <div className="mt-6">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Product
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden">
          <div className="relative">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className="absolute top-2 right-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 bg-white/70 backdrop-blur-sm hover:bg-white/90"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => onEdit(product.id)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDuplicate(product.id)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onBoost(product)}>
                    <Zap className="mr-2 h-4 w-4" />
                    Boost
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600" 
                    onClick={() => onDelete(product)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="absolute top-2 left-2">
              {product.productType === "digital" ? (
                <Badge className="bg-green-500">
                  <Download className="w-3 h-3 mr-1" />
                  Digital
                </Badge>
              ) : product.productType === "service" ? (
                <Badge className="bg-purple-500">
                  <FileText className="w-3 h-3 mr-1" />
                  Service
                </Badge>
              ) : (
                <Badge className="bg-blue-500">
                  <Package className="w-3 h-3 mr-1" />
                  Physical
                </Badge>
              )}
            </div>
          </div>
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 line-clamp-2">{product.name}</h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {product.shortDescription || product.description}
            </p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600 ml-1">
                  {product.averageRating || 0}
                </span>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
              <span>{product.totalSales || 0} sales</span>
              <span>
                {product.inStock ? (
                  <span className="text-green-600">In stock</span>
                ) : (
                  <span className="text-red-600">Out of stock</span>
                )}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};