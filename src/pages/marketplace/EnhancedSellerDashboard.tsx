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
  Zap,
  Download,
  BookOpen,
  FileText
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage your products, orders, and performance
          </p>
        </div>
        <Button onClick={handleCreateListing} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add New Product
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-3">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-semibold">{totalProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-3">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-2xl font-semibold">{totalSales}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-yellow-100 p-3">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-semibold">${totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-purple-100 p-3">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Rating</p>
                <p className="text-2xl font-semibold">{averageRating.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Type Tabs */}
      <Tabs defaultValue="all" className="mb-8">
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

      {/* Orders Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Recent Orders
          </CardTitle>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sellerOrders.slice(0, 5).map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.orderNumber}</TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{order.items.length} items</TableCell>
                    <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={order.status === "completed" ? "success" : order.status === "cancelled" ? "destructive" : "default"}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/marketplace/orders/${order.id}`)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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