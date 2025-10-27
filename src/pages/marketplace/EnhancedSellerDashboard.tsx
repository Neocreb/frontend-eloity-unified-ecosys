// @ts-nocheck
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEnhancedMarketplace } from "@/contexts/EnhancedMarketplaceContext";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  Product,
  ProductBoost,
  BoostOption,
  Order,
  OrderStatus,
} from "@/types/enhanced-marketplace";
import { 
  Activity, 
  BarChart3, 
  CheckCircle, 
  Copy, 
  DollarSign, 
  Edit, 
  Eye, 
  Heart, 
  MoreHorizontal, 
  Package, 
  Plus, 
  ShoppingCart, 
  Sparkles, 
  Star, 
  Target, 
  Trash2, 
  Zap 
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PageLoading } from "@/components/ui/loading-states";

export default function EnhancedSellerDashboard() {
  // Inline Badge component to avoid import issues
  const Badge = ({ 
    children, 
    variant = "default",
    className = ""
  }: { 
    children: React.ReactNode; 
    variant?: "default" | "secondary" | "outline" | "success" | "destructive";
    className?: string;
  }) => {
    const variantClasses = {
      default: "bg-primary text-primary-foreground",
      secondary: "bg-secondary text-secondary-foreground",
      outline: "border border-input bg-background",
      success: "bg-green-100 text-green-800",
      destructive: "bg-destructive text-destructive-foreground",
    };
    
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}>
        {children}
      </span>
    );
  };
  
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

  const handleDelete = async () => {
    if (!selectedProduct) return;

    try {
      await deleteProduct(selectedProduct.id);
      toast({
        title: "Product Deleted",
        description: "Your product has been removed from the marketplace",
      });
      setShowDeleteDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again",
        variant: "destructive",
      });
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, status);
      // Refresh orders
      if (user) {
        const orders = await getSellerOrders(user.id);
        setSellerOrders(orders);
      }
      toast({
        title: "Order Updated",
        description: "Order status has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  // Add fulfillment tracking functionality
  const handleAddTrackingInfo = async (orderId: string, trackingNumber: string, carrier: string) => {
    try {
      // In a real implementation, this would call an API to update tracking info
      setFulfillmentTracking(prev => ({
        ...prev,
        [orderId]: {
          trackingNumber,
          carrier,
          shippedAt: new Date().toISOString(),
          status: "shipped"
        }
      }));
      
      toast({
        title: "Tracking Info Added",
        description: "Fulfillment tracking information has been updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add tracking information",
        variant: "destructive",
      });
    }
  };

  // Add order filtering
  const filteredOrders = useMemo(() => {
    return sellerOrders.filter((order: Order) => {
      // Status filter
      if (orderFilters.status !== "all" && order.status !== orderFilters.status) {
        return false;
      }
      
      // Date range filter
      if (orderFilters.dateRange !== "all") {
        const orderDate = new Date(order.createdAt);
        const now = new Date();
        
        switch (orderFilters.dateRange) {
          case "today":
            return orderDate.toDateString() === now.toDateString();
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return orderDate >= weekAgo;
          case "month":
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return orderDate >= monthAgo;
          default:
            return true;
        }
      }
      
      return true;
    });
  }, [sellerOrders, orderFilters]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const isProductBoosted = (product: Product) => {
    if (!product.boostedUntil) return false;
    const boostedUntil = new Date(product.boostedUntil);
    const now = new Date();
    return boostedUntil > now;
  };

  const getBoostStatusBadge = (boost: ProductBoost) => {
    const statusColors = {
      active: "bg-green-500",
      pending: "bg-yellow-500",
      completed: "bg-blue-500",
      cancelled: "bg-red-500",
      rejected: "bg-red-600",
    };

    return (
      <Badge className={`${statusColors[boost.status]} text-white`}>
        {boost.status.charAt(0).toUpperCase() + boost.status.slice(1)}
      </Badge>
    );
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string = "USDT") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  // Get status color
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-indigo-100 text-indigo-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-teal-100 text-teal-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "disputed":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Fulfillment tracking dialog state
  const [isTrackingDialogOpen, setIsTrackingDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [trackingData, setTrackingData] = useState({
    carrier: '',
    trackingNumber: '',
    estimatedDelivery: '',
  })
  
  // Function to open tracking dialog
  const openTrackingDialog = (order: Order) => {
    setSelectedOrder(order)
    setIsTrackingDialogOpen(true)
    // Pre-fill with existing tracking data if available
    if (fulfillmentTracking[order.id]) {
      setTrackingData(fulfillmentTracking[order.id])
    } else {
      setTrackingData({
        carrier: '',
        trackingNumber: '',
        estimatedDelivery: '',
      })
    }
  }
  
  // Function to handle tracking submission
  const handleTrackingSubmit = () => {
    if (selectedOrder) {
      setFulfillmentTracking(prev => ({
        ...prev,
        [selectedOrder.id]: trackingData
      }))
      
      // Update order status to shipped
      setSellerOrders(prev => 
        prev.map(order => 
          order.id === selectedOrder.id 
            ? { ...order, status: 'shipped' } 
            : order
        )
      )
      
      setIsTrackingDialogOpen(false)
      setSelectedOrder(null)
      setTrackingData({
        carrier: '',
        trackingNumber: '',
        estimatedDelivery: '',
      })
    }
  }
  
  if (!sellerAnalytics) {
    return (
      <div className="container py-6">
        <PageLoading message="Loading seller dashboard..." />
      </div>
    );
  }

  return (
    <div className="container py-6">
      {/* Enhanced Header with proper layout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Seller Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your products, track performance, and grow your business
          </p>
        </div>

        <Button
          onClick={handleCreateListing}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          <span>List Product</span>
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <div className="w-full overflow-x-auto pb-2">
          <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground min-w-fit">
            <TabsTrigger value="overview" className="flex items-center gap-2 whitespace-nowrap px-3">
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2 whitespace-nowrap px-3">
              <Package className="h-4 w-4" />
              <span>Orders</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2 whitespace-nowrap px-3">
              <ShoppingCart className="h-4 w-4" />
              <span>Products</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2 whitespace-nowrap px-3">
              <Activity className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Grid - 2 rows x 3 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* Revenue Card */}
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/app/marketplace/analytics")}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="text-2xl font-bold">
                      ${sellerAnalytics?.totalRevenue?.toLocaleString() || "0"}
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <Button variant="link" className="p-0 h-auto mt-2 text-xs">
                  See More
                </Button>
              </CardContent>
            </Card>

            {/* Orders Card */}
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/app/marketplace/orders")}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Orders</p>
                    <p className="text-2xl font-bold">
                      {sellerAnalytics?.totalOrders || "0"}
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <Button variant="link" className="p-0 h-auto mt-2 text-xs">
                  See More
                </Button>
              </CardContent>
            </Card>

            {/* Products Card */}
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/app/marketplace/my?tab=products")}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Products</p>
                    <p className="text-2xl font-bold">
                      {sellerAnalytics?.totalProducts || "0"}
                    </p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <ShoppingCart className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <Button variant="link" className="p-0 h-auto mt-2 text-xs">
                  See More
                </Button>
              </CardContent>
            </Card>

            {/* Rating Card */}
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/app/marketplace/analytics")}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Rating</p>
                    <p className="text-2xl font-bold">
                      {sellerAnalytics?.customerSatisfaction || "0"}/5
                    </p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
                <Button variant="link" className="p-0 h-auto mt-2 text-xs">
                  See More
                </Button>
              </CardContent>
            </Card>

            {/* Conversion Card */}
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/app/marketplace/analytics")}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Conversion</p>
                    <p className="text-2xl font-bold">
                      {sellerAnalytics?.conversionRate || "0"}%
                    </p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-full">
                    <Target className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <Button variant="link" className="p-0 h-auto mt-2 text-xs">
                  See More
                </Button>
              </CardContent>
            </Card>

            {/* Boost ROI Card */}
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/app/marketplace/analytics")}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Boost ROI</p>
                    <p className="text-2xl font-bold">
                      {sellerAnalytics?.boostROI || "0"}%
                    </p>
                  </div>
                  <div className="bg-amber-100 p-3 rounded-full">
                    <Zap className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
                <Button variant="link" className="p-0 h-auto mt-2 text-xs">
                  See More
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Additional Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Revenue Trend</CardTitle>
                <Button variant="link" className="p-0 h-auto text-xs" onClick={() => navigate("/app/marketplace/analytics")}>
                  See More
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center border rounded-md">
                  <div className="text-center">
                    <BarChart3 className="h-8 w-8 text-gray-300 mx-auto" />
                    <p className="text-muted-foreground mt-2">
                      Revenue chart will appear here
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category Performance */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Category Performance</CardTitle>
                <Button variant="link" className="p-0 h-auto text-xs" onClick={() => navigate("/app/marketplace/analytics")}>
                  See More
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sellerAnalytics?.categoryBreakdown?.map((category: any) => (
                    <div key={category.category} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{category.category}</span>
                        <span>${category.revenue?.toLocaleString() || "0"}</span>
                      </div>
                      <Progress value={category.percentage || 0} className="h-2" />
                    </div>
                  )) || (
                    <p className="text-muted-foreground text-sm">
                      No category data available
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Key Metrics */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Key Metrics</CardTitle>
                <Button variant="link" className="p-0 h-auto text-xs" onClick={() => navigate("/app/marketplace/analytics")}>
                  See More
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Average Order Value
                    </span>
                    <span className="font-medium">
                      ${sellerAnalytics?.averageOrderValue || "0"}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Response Rate
                    </span>
                    <span className="font-medium">
                      {sellerAnalytics?.responseRate || "0"}%
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      On-time Delivery
                    </span>
                    <span className="font-medium">
                      {sellerAnalytics?.onTimeDeliveryRate || "0"}%
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Customer Satisfaction
                    </span>
                    <span className="font-medium flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {sellerAnalytics?.customerSatisfaction || "0"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Top Products</CardTitle>
                <Button variant="link" className="p-0 h-auto text-xs" onClick={() => navigate("/app/marketplace/my?tab=products")}>
                  See More
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sellerAnalytics?.topProducts?.slice(0, 3).map((product: any, index: number) => (
                    <div key={product.id} className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-medium">
                        {index + 1}
                      </div>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-10 h-10 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {product.totalSales || "0"} sales
                        </p>
                      </div>
                    </div>
                  )) || (
                    <p className="text-muted-foreground text-sm">
                      No product data available
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Active Boosts */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Active Boosts</CardTitle>
                <Button variant="link" className="p-0 h-auto text-xs" onClick={() => navigate("/app/marketplace/my?tab=products")}>
                  See More
                </Button>
              </CardHeader>
              <CardContent>
                {activeBoosts.length === 0 ? (
                  <div className="text-center py-4">
                    <Zap className="h-8 w-8 text-gray-400 mx-auto" />
                    <p className="text-muted-foreground text-sm mt-2">
                      No active boosts
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeBoosts.slice(0, 3).map((boost) => {
                      const product = myListings.find(
                        (p) => p.id === boost.productId,
                      );
                      if (!product) return null;

                      return (
                        <div
                          key={boost.id}
                          className="flex items-center justify-between p-2 border rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-8 h-8 rounded object-cover"
                            />
                            <div>
                              <p className="text-sm font-medium">
                                {product.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {boost.boostType}
                              </p>
                            </div>
                          </div>
                          <Badge className="bg-amber-500 text-white text-xs">
                            Active
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Additional Performance Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Boost History */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Boost History</CardTitle>
                <Button variant="link" className="p-0 h-auto text-xs" onClick={() => navigate("/app/marketplace/my?tab=products")}>
                  See More
                </Button>
              </CardHeader>
              <CardContent>
                {myBoosts.length === 0 ? (
                  <div className="text-center py-4">
                    <Activity className="h-8 w-8 text-gray-400 mx-auto" />
                    <p className="text-muted-foreground text-sm mt-2">
                      No boost history
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myBoosts.slice(0, 3).map((boost) => {
                      const product = myListings.find(
                        (p) => p.id === boost.productId,
                      );
                      if (!product) return null;

                      return (
                        <div
                          key={boost.id}
                          className="flex items-center justify-between p-2 border rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-8 h-8 rounded object-cover"
                            />
                            <div>
                              <p className="text-sm font-medium">
                                {product.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(boost.createdAt)}
                              </p>
                            </div>
                          </div>
                          {getBoostStatusBadge(boost)}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Boost Performance Summary */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Boost Performance</CardTitle>
                <Button variant="link" className="p-0 h-auto text-xs" onClick={() => navigate("/app/marketplace/analytics")}>
                  See More
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-xl font-bold text-green-600">245%</p>
                    <p className="text-xs text-muted-foreground">Average ROI</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-xl font-bold text-blue-600">12,543</p>
                    <p className="text-xs text-muted-foreground">Impressions</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-xl font-bold text-purple-600">1,234</p>
                    <p className="text-xs text-muted-foreground">Clicks</p>
                  </div>
                  <div className="text-center p-3 bg-amber-50 rounded-lg">
                    <p className="text-xl font-bold text-amber-600">89</p>
                    <p className="text-xs text-muted-foreground">Conversions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Management</CardTitle>
              <CardDescription>
                Manage your orders and track fulfillment status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Order Filters */}
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="status-filter">Status</Label>
                  <Select 
                    value={orderFilters.status} 
                    onValueChange={(value) => setOrderFilters(prev => ({ ...prev, status: value as "all" | OrderStatus }))}
                  >
                    <SelectTrigger id="status-filter">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="date-filter">Date Range</Label>
                  <Select 
                    value={orderFilters.dateRange} 
                    onValueChange={(value) => setOrderFilters(prev => ({ ...prev, dateRange: value as "all" | "today" | "week" | "month" }))}
                  >
                    <SelectTrigger id="date-filter">
                      <SelectValue placeholder="Filter by date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Orders Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order: Order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="font-medium">{order.orderNumber}</div>
                        <div className="text-sm text-muted-foreground">
                          {order.items.length} item(s)
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{order.customerName}</div>
                        <div className="text-sm text-muted-foreground">
                          {order.customerEmail}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        ${order.totalAmount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          order.status === 'pending' ? 'secondary' :
                          order.status === 'processing' ? 'default' :
                          order.status === 'shipped' ? 'outline' :
                          order.status === 'delivered' ? 'success' :
                          'destructive'
                        }>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openTrackingDialog(order)}
                          >
                            Track
                          </Button>
                          <Button variant="outline" size="sm">
                            Details
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
        
        <TabsContent value="products" className="space-y-4">
          {myListings.length === 0 ? (
            <Card className="bg-gray-50">
              <CardContent className="pt-6 text-center">
                <div className="py-6 space-y-4">
                  <Package className="h-12 w-12 text-gray-400 mx-auto" />
                  <h3 className="text-lg font-medium">No Products Listed</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    You haven't listed any products yet. Create your first
                    listing to start selling on the marketplace.
                  </p>
                  <Button onClick={handleCreateListing} className="mt-2">
                    List Your First Product
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myListings.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="relative h-48">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
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
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleEditListing(product.id)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Product
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDuplicateProduct(product.id)}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleOpenBoostDialog(product)}
                          >
                            <Sparkles className="h-4 w-4 mr-2" />
                            Boost Product
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleOpenDeleteDialog(product)}
                            className="text-red-500"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Product
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Status badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {product.status !== "active" && (
                        <Badge
                          variant={
                            product.status === "draft"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {product.status}
                        </Badge>
                      )}
                      {isProductBoosted(product) && (
                        <Badge className="bg-amber-500 text-white">
                          Boosted
                        </Badge>
                      )}
                      {product.isFeatured && (
                        <Badge className="bg-blue-500 text-white">
                          Featured
                        </Badge>
                      )}
                      {product.campaignIds &&
                        product.campaignIds.length > 0 && (
                          <Badge className="bg-purple-500 text-white">
                            Campaign
                          </Badge>
                        )}
                    </div>
                  </div>

                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-base line-clamp-2">
                        {product.name}
                      </h3>
                      <div className="text-right">
                        <span className="font-semibold text-lg">
                          $
                          {(product.discountPrice || product.price).toFixed(
                            2,
                          )}
                        </span>
                        {product.discountPrice && (
                          <p className="text-sm text-muted-foreground line-through">
                            ${product.price.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Listed on {formatDate(product.createdAt)}
                    </p>
                  </CardHeader>

                  <CardContent className="pb-3">
                    <div className="grid grid-cols-3 gap-4 text-center text-sm">
                      <div className="flex flex-col items-center">
                        <Eye className="h-4 w-4 mb-1 text-muted-foreground" />
                        <span className="font-medium">
                          {product.viewCount}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Views
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <Heart className="h-4 w-4 mb-1 text-muted-foreground" />
                        <span className="font-medium">
                          {product.favoriteCount}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Likes
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <ShoppingCart className="h-4 w-4 mb-1 text-muted-foreground" />
                        <span className="font-medium">
                          {product.totalSales}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Sales
                        </span>
                      </div>
                    </div>

                    {/* Stock status */}
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Stock</span>
                        <span>{product.stockQuantity || "Unlimited"}</span>
                      </div>
                      {product.stockQuantity && product.stockQuantity > 0 && (
                        <Progress
                          value={
                            (product.stockQuantity /
                              (product.stockQuantity + product.totalSales)) *
                            100
                          }
                          className="h-2"
                        />
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="border-t bg-gray-50 p-3 flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditListing(product.id)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleOpenBoostDialog(product)}
                      className="flex items-center gap-1"
                      disabled={isProductBoosted(product)}
                      variant={
                        isProductBoosted(product) ? "secondary" : "default"
                      }
                    >
                      <Sparkles className="h-4 w-4" />
                      {isProductBoosted(product) ? "Boosted" : "Boost"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Performance Overview Cards */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>
                  Key metrics for your products
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Views</span>
                    <span className="font-semibold">
                      {sellerAnalytics.totalViews?.toLocaleString() || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Clicks</span>
                    <span className="font-semibold">
                      {sellerAnalytics.totalClicks?.toLocaleString() || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Add to Carts</span>
                    <span className="font-semibold">
                      {sellerAnalytics.totalAddToCarts?.toLocaleString() || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Purchases</span>
                    <span className="font-semibold">
                      {sellerAnalytics.totalPurchases?.toLocaleString() || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Favorites</span>
                    <span className="font-semibold">
                      {sellerAnalytics.totalFavorites?.toLocaleString() || "0"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Conversion Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Conversion Metrics</CardTitle>
                <CardDescription>
                  How well your products convert
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">View to Click</span>
                    <span className="font-semibold">
                      {sellerAnalytics.viewToClickRate || "0"}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Click to Cart</span>
                    <span className="font-semibold">
                      {sellerAnalytics.clickToCartRate || "0"}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cart to Purchase</span>
                    <span className="font-semibold">
                      {sellerAnalytics.cartToPurchaseRate || "0"}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Overall Conversion</span>
                    <span className="font-semibold">
                      {sellerAnalytics.overallConversionRate || "0"}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Performing Products */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Products</CardTitle>
                <CardDescription>
                  Your best-selling items
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sellerAnalytics.topPerformingProducts?.slice(0, 3).map((product: any, index: number) => (
                    <div key={product.id} className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-medium">
                        {index + 1}
                      </div>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-10 h-10 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {product.purchases} sales
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {product.conversionRate}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          conversion
                        </p>
                      </div>
                    </div>
                  )) || (
                    <p className="text-muted-foreground text-sm">
                      No performance data available
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product Performance Details */}
          <Card>
            <CardHeader>
              <CardTitle>Product Performance Details</CardTitle>
              <CardDescription>
                Detailed metrics for individual products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>Add to Cart</TableHead>
                    <TableHead>Purchases</TableHead>
                    <TableHead>Conversion</TableHead>
                    <TableHead>Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myListings.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                          <div>
                            <p className="font-medium text-sm">
                              {product.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {product.totalSales} sales
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {product.viewCount?.toLocaleString() || "0"}
                      </TableCell>
                      <TableCell>
                        {product.clickCount?.toLocaleString() || "0"}
                      </TableCell>
                      <TableCell>
                        {product.addToCartCount?.toLocaleString() || "0"}
                      </TableCell>
                      <TableCell>
                        {product.totalSales?.toLocaleString() || "0"}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {product.conversionRate || "0"}%
                        </span>
                      </TableCell>
                      <TableCell>
                        ${(product.totalSales * (product.discountPrice || product.price)).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Optimization Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle>Optimization Suggestions</CardTitle>
              <CardDescription>
                Recommendations to improve your product performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myListings.map((product) => {
                  const suggestions = [];
                  
                  // Check for low conversion rate
                  if ((product.conversionRate || 0) < 2) {
                    suggestions.push({
                      type: "warning",
                      message: "Low conversion rate - Consider improving product images or description",
                      priority: "high"
                    });
                  }
                  
                  // Check for low view count
                  if ((product.viewCount || 0) < 100) {
                    suggestions.push({
                      type: "info",
                      message: "Low visibility - Consider boosting this product",
                      priority: "medium"
                    });
                  }
                  
                  // Check for low rating
                  if ((product.averageRating || 0) < 4.0) {
                    suggestions.push({
                      type: "warning",
                      message: "Low rating - Address customer feedback and reviews",
                      priority: "high"
                    });
                  }
                  
                  // Check for stock issues
                  if (product.stockQuantity && product.stockQuantity < 5) {
                    suggestions.push({
                      type: "warning",
                      message: "Low stock - Consider restocking to avoid lost sales",
                      priority: "high"
                    });
                  }
                  
                  // Check for pricing competitiveness
                  if ((product.discountPercentage || 0) < 5) {
                    suggestions.push({
                      type: "info",
                      message: "Consider offering a discount to improve competitiveness",
                      priority: "low"
                    });
                  }
                  
                  return suggestions.length > 0 ? (
                    <div key={product.id} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{product.name}</h4>
                          <div className="mt-2 space-y-2">
                            {suggestions.map((suggestion, idx) => (
                              <div key={idx} className="flex items-start gap-2">
                                <div className={`mt-1 w-2 h-2 rounded-full ${
                                  suggestion.type === "warning" ? "bg-yellow-500" : "bg-blue-500"
                                }`}></div>
                                <p className="text-sm text-muted-foreground">
                                  {suggestion.message}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null;
                })}
                
                {myListings.every(product => {
                  const suggestions = [];
                  if ((product.conversionRate || 0) >= 2 && 
                      (product.viewCount || 0) >= 100 && 
                      (product.averageRating || 0) >= 4.0 && 
                      (!product.stockQuantity || product.stockQuantity >= 5) && 
                      (product.discountPercentage || 0) >= 5) {
                    return true;
                  }
                  return false;
                }) && (
                  <div className="text-center py-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-3">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-medium">Great Job!</h3>
                    <p className="text-muted-foreground">
                      All your products are performing well. Keep up the good work!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Boost Product Dialog */}
      <Dialog open={showBoostDialog} onOpenChange={setShowBoostDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Boost Product Visibility</DialogTitle>
            <DialogDescription>
              Boosted products appear in sponsored sections and get higher
              visibility across the marketplace.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <h4 className="text-sm font-medium mb-3">Select Boost Package:</h4>
            <div className="space-y-3">
              {boostOptions.map((option) => (
                <Card
                  key={option.id}
                  className={`cursor-pointer transition-all ${
                    selectedBoostOption === option.id
                      ? "border-blue-500 bg-blue-50"
                      : ""
                  }`}
                  onClick={() => setSelectedBoostOption(option.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{option.name}</h4>
                          {option.popular && (
                            <Badge className="bg-blue-500 text-white text-xs">
                              Popular
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {option.description}
                        </p>
                        {option.features && (
                          <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                            {option.features.map((feature, index) => (
                              <li
                                key={index}
                                className="flex items-center gap-1"
                              >
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <span className="font-semibold text-blue-600">
                          {option.price} {option.currency}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {option.duration}h duration
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBoostDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBoost} disabled={!selectedBoostOption}>
              <Sparkles className="h-4 w-4 mr-2" />
              Boost Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Product Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {selectedProduct && (
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 rounded overflow-hidden">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-medium">{selectedProduct.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    $
                    {(
                      selectedProduct.discountPrice || selectedProduct.price
                    ).toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Fulfillment Tracking Dialog */}
      <Dialog open={isTrackingDialogOpen} onOpenChange={setIsTrackingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Fulfillment Tracking</DialogTitle>
            <DialogDescription>
              Add tracking information for order {selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="carrier">Carrier</Label>
              <Select 
                value={trackingData.carrier} 
                onValueChange={(value) => setTrackingData(prev => ({ ...prev, carrier: value }))}
              >
                <SelectTrigger id="carrier">
                  <SelectValue placeholder="Select carrier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ups">UPS</SelectItem>
                  <SelectItem value="fedex">FedEx</SelectItem>
                  <SelectItem value="usps">USPS</SelectItem>
                  <SelectItem value="dhl">DHL</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="tracking-number">Tracking Number</Label>
              <Input
                id="tracking-number"
                value={trackingData.trackingNumber}
                onChange={(e) => setTrackingData(prev => ({ ...prev, trackingNumber: e.target.value }))}
                placeholder="Enter tracking number"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="estimated-delivery">Estimated Delivery</Label>
              <Input
                id="estimated-delivery"
                type="date"
                value={trackingData.estimatedDelivery}
                onChange={(e) => setTrackingData(prev => ({ ...prev, estimatedDelivery: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTrackingDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleTrackingSubmit}>
              Save Tracking Info
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
