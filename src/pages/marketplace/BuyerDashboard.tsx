import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ShoppingCart,
  Heart,
  Star,
  Package,
  Clock,
  CheckCircle,
  Truck,
  CreditCard,
  MapPin,
  Bell,
  MessageCircle,
  RefreshCw,
  Eye,
  MoreHorizontal,
  Download,
  XCircle,
  AlertTriangle,
  Gift,
  TrendingUp,
  Calendar,
  DollarSign,
  Users,
  Target,
  BarChart3,
  Activity,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useEnhancedMarketplace } from "@/contexts/EnhancedMarketplaceContext";
import type { Order as EnhancedOrder } from "@/types/enhanced-marketplace";
import { OrderService } from "@/services/orderService";
import { WishlistService } from "@/services/wishlistService";
import { ReviewService } from "@/services/reviewService";

// Use the enhanced Order type from the marketplace types
// interface Order {
//   id: string;
//   orderNumber: string;
//   status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
//   date: string;
//   total: number;
//   items: {
//     id: string;
//     name: string;
//     image: string;
//     price: number;
//     quantity: number;
//     seller: string;
//   }[];
//   tracking?: string;
//   estimatedDelivery?: string;
// }

interface WishlistItem {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  inStock: boolean;
  rating: number;
  reviews: number;
  dateAdded: string;
}

interface Review {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
  verified: boolean;
}

export default function BuyerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { getSellerOrders, getSellerAnalytics } = useEnhancedMarketplace();
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState<EnhancedOrder | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [orders, setOrders] = useState<EnhancedOrder[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    wishlistItems: 0,
    reviewsWritten: 0,
    savedAmount: 0,
    favoriteCategory: "Electronics",
  });

  // Load real data
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        // Load orders
        const userOrders = await OrderService.getUserOrders(user.id);
        setOrders(userOrders);
        
        // Load wishlist
        const userWishlists = await WishlistService.getUserWishlists(user.id);
        if (userWishlists.length > 0) {
          const wishlistItems = await WishlistService.getWishlistItems(userWishlists[0].id);
          setWishlist(wishlistItems.map(item => ({
            id: item.id,
            name: item.product?.name || "Unknown Product",
            image: item.product?.image || "",
            price: item.product?.price || 0,
            originalPrice: item.product?.discountPrice || undefined,
            inStock: item.product?.inStock || false,
            rating: item.product?.rating || 0,
            reviews: item.product?.reviewCount || 0,
            dateAdded: item.addedAt,
          })));
        }
        
        // Load reviews (this would typically come from a user reviews service)
        // For now, we'll simulate with a placeholder
        setReviews([]);
        
        // Calculate stats
        const totalSpent = userOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        const savedAmount = wishlist.reduce(
          (sum, item) => sum + ((item.originalPrice || item.price) - item.price),
          0,
        );
        
        setStats({
          totalOrders: userOrders.length,
          totalSpent,
          wishlistItems: wishlist.length,
          reviewsWritten: reviews.length,
          savedAmount,
          favoriteCategory: "Electronics",
        });
      } catch (error) {
        console.error("Error loading buyer data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id, toast]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case "shipped":
        return <Truck className="w-4 h-4 text-purple-500" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Package className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-yellow-400"
            : "text-gray-300"
        }`}
      />
    ));
  };

  const handleViewOrderDetails = (order: EnhancedOrder) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  if (loading) {
    return (
      <div className="px-4 py-6">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      {/* Enhanced Header with proper layout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Buyer Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.name || "Customer"}! Track your orders, manage wishlist, and more.
          </p>
        </div>

        <Button
          onClick={() => navigate("/app/marketplace")}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="w-full overflow-x-auto pb-2">
          <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground min-w-fit">
            <TabsTrigger value="overview" className="flex items-center gap-2 whitespace-nowrap px-3">
              <BarChart3 className="w-4 h-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2 whitespace-nowrap px-3">
              <Package className="w-4 h-4" />
              <span>Orders</span>
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="flex items-center gap-2 whitespace-nowrap px-3">
              <Heart className="w-4 h-4" />
              <span>Wishlist</span>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2 whitespace-nowrap px-3">
              <Star className="w-4 h-4" />
              <span>Reviews</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Overview - Updated to 2x3 grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate("/app/marketplace/orders")}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Orders
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalOrders}
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <Button variant="link" className="p-0 h-auto mt-2 text-xs">
                  See More
                </Button>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate("/app/marketplace/orders")}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Spent</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPrice(stats.totalSpent)}
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <Button variant="link" className="p-0 h-auto mt-2 text-xs">
                  See More
                </Button>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate("/app/marketplace/wishlist")}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Wishlist Items
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.wishlistItems}
                    </p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-full">
                    <Heart className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <Button variant="link" className="p-0 h-auto mt-2 text-xs">
                  See More
                </Button>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate("/app/marketplace/my?tab=reviews")}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Reviews Written
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.reviewsWritten}
                    </p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <Button variant="link" className="p-0 h-auto mt-2 text-xs">
                  See More
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Saved Amount
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPrice(stats.savedAmount)}
                    </p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Gift className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <Button variant="link" className="p-0 h-auto mt-2 text-xs">
                  See More
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Favorite Category
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.favoriteCategory}
                    </p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-full">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
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
            {/* Order Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Order Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Order trend visualization would appear here
                </div>
                <Button variant="link" className="p-0 h-auto mt-2 text-xs" onClick={() => navigate("/app/marketplace/analytics")}>
                  See More
                </Button>
              </CardContent>
            </Card>

            {/* Category Spending */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Category Spending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Electronics</span>
                      <span>$1,240</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Fashion</span>
                      <span>$890</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Home & Garden</span>
                      <span>$620</span>
                    </div>
                    <Progress value={30} className="h-2" />
                  </div>
                </div>
                <Button variant="link" className="p-0 h-auto mt-2 text-xs" onClick={() => navigate("/app/marketplace/analytics")}>
                  See More
                </Button>
              </CardContent>
            </Card>

            {/* Recent Reviews */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Reviews</CardTitle>
                <Button variant="link" className="p-0 h-auto text-xs" onClick={() => navigate("/app/marketplace/my?tab=reviews")}>
                  See More
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews.slice(0, 2).map((review) => (
                    <div
                      key={review.id}
                      className="flex items-start gap-3"
                    >
                      <img
                        src={review.productImage}
                        alt={review.productName}
                        className="w-10 h-10 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{review.productName}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {renderStars(review.rating)}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                          "{review.comment}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shopping Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Shopping Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg. Order Value</span>
                    <span className="font-medium">
                      {formatPrice(stats.totalSpent / Math.max(stats.totalOrders, 1))}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Wishlist Conversion</span>
                    <span className="font-medium">23%</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Favorite Store</span>
                    <span className="font-medium">Tech Store</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">My Orders</h2>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate("/app/marketplace/orders")}
              >
                <Eye className="w-4 h-4 mr-2" />
                View All Orders
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Orders
              </Button>
            </div>
          </div>

          {orders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                <p className="text-gray-600 mb-4">
                  You haven't placed any orders yet. Start shopping to see your orders here.
                </p>
                <Button onClick={() => navigate("/app/marketplace")}>
                  Start Shopping
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <h3 className="font-semibold">Order #{order.orderNumber}</h3>
                          <Badge className={getStatusColor(order.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(order.status)}
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {order.items.length} item(s) • {formatDate(order.createdAt)}
                        </p>
                        <p className="font-semibold">{formatPrice(order.totalAmount)}</p>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewOrderDetails(order)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Contact Seller
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {orders.length > 5 && (
                <div className="text-center">
                  <Button 
                    variant="link" 
                    onClick={() => navigate("/app/marketplace/orders")}
                  >
                    View All {orders.length} Orders
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Wishlist Tab */}
        <TabsContent value="wishlist" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">My Wishlist</h2>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate("/app/marketplace/wishlist")}
              >
                <Heart className="w-4 h-4 mr-2" />
                View Full Wishlist
              </Button>
              <Button variant="outline" size="sm">
                <Gift className="w-4 h-4 mr-2" />
                Share Wishlist
              </Button>
            </div>
          </div>

          {wishlist.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
                <p className="text-gray-600 mb-4">
                  Save items to your wishlist to view them here later.
                </p>
                <Button onClick={() => navigate("/app/marketplace")}>
                  Start Shopping
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {wishlist.slice(0, 6).map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="relative">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full aspect-square object-cover rounded-lg mb-3"
                      />
                      {item.originalPrice && item.originalPrice > item.price && (
                        <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                          Save {formatPrice(item.originalPrice - item.price)}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-medium mb-1 line-clamp-2">{item.name}</h3>
                    <div className="flex items-center gap-1 mb-2">
                      {renderStars(item.rating)}
                      <span className="text-xs text-muted-foreground">
                        ({item.reviews})
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">
                          {formatPrice(item.price)}
                        </p>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <p className="text-xs text-muted-foreground line-through">
                            {formatPrice(item.originalPrice)}
                          </p>
                        )}
                      </div>
                      <Button size="sm">Add to Cart</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {wishlist.length > 6 && (
                <div className="col-span-full text-center">
                  <Button 
                    variant="link" 
                    onClick={() => navigate("/app/marketplace/wishlist")}
                  >
                    View All {wishlist.length} Items
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">My Reviews</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/app/marketplace/my?tab=reviews")}
            >
              <Star className="w-4 h-4 mr-2" />
              View All Reviews
            </Button>
          </div>

          {reviews.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
                <p className="text-gray-600 mb-4">
                  After purchasing items, you can leave reviews to help other buyers.
                </p>
                <Button onClick={() => navigate("/app/marketplace")}>
                  Start Shopping
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reviews.slice(0, 5).map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <img
                        src={review.productImage}
                        alt={review.productName}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{review.productName}</h3>
                          <div className="flex items-center gap-2">
                            {review.verified && (
                              <Badge variant="secondary" className="text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified Purchase
                              </Badge>
                            )}
                            <span className="text-sm text-gray-600">
                              {formatDate(review.date)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-600">
                            {review.rating} out of 5 stars
                          </span>
                        </div>

                        <p className="text-gray-700 mb-3">{review.comment}</p>

                        <div className="flex items-center gap-4">
                          <Button variant="ghost" size="sm">
                            👍 Helpful ({review.helpful})
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {reviews.length > 5 && (
                <div className="text-center">
                  <Button 
                    variant="link" 
                    onClick={() => navigate("/app/marketplace/my?tab=reviews")}
                  >
                    View All {reviews.length} Reviews
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Order Details Dialog */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order #{selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Summary */}
              <div>
                <h3 className="font-semibold mb-3">Order Summary</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.productId} className="flex items-center gap-3">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity} × {formatPrice(item.unitPrice)}
                        </p>
                      </div>
                      <p className="font-semibold">
                        {formatPrice(item.totalPrice)}
                      </p>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(selectedOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>
              
              {/* Order Status */}
              <div>
                <h3 className="font-semibold mb-3">Order Status</h3>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(selectedOrder.status)}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(selectedOrder.status)}
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </span>
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Placed on {formatDate(selectedOrder.createdAt)}
                  </span>
                </div>
              </div>
              
              {/* Tracking */}
              {selectedOrder.trackingNumber && (
                <div>
                  <h3 className="font-semibold mb-3">Tracking Information</h3>
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      Tracking #: {selectedOrder.trackingNumber}
                    </span>
                  </div>
                  {selectedOrder.estimatedDelivery && (
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        Estimated Delivery: {formatDate(selectedOrder.estimatedDelivery)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOrderDetails(false)}>
              Close
            </Button>
            <Button>
              <MessageCircle className="w-4 h-4 mr-2" />
              Contact Seller
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}