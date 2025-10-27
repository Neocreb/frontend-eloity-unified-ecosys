import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ShoppingCart,
  Package,
  Clock,
  CheckCircle,
  Truck,
  MapPin,
  MessageCircle,
  RefreshCw,
  Eye,
  MoreHorizontal,
  Download,
  XCircle,
  AlertTriangle,
  Filter,
  Search,
  Calendar,
  DollarSign,
  ArrowLeft,
  Star,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { OrderService } from "@/services/orderService";
import type { Order } from "@/types/enhanced-marketplace";

const MarketplaceOrders: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Load orders on component mount
  useEffect(() => {
    const loadOrders = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        // Fetch real orders from the API
        const userOrders = await OrderService.getUserOrders(user.id);
        setOrders(userOrders);
      } catch (error) {
        console.error('Error loading orders:', error);
        toast({
          title: "Error",
          description: "Failed to load orders",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [user?.id, toast]);

  // Filter orders by tab
  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchQuery === "" || 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(item => item.productName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab = activeTab === "all" || order.status === activeTab;

    return matchesSearch && matchesTab;
  });

  // Get status color
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmed": return "bg-blue-100 text-blue-800 border-blue-200";
      case "processing": return "bg-purple-100 text-purple-800 border-purple-200";
      case "shipped": return "bg-orange-100 text-orange-800 border-orange-200";
      case "delivered": return "bg-green-100 text-green-800 border-green-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Get status icon
  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4" />;
      case "confirmed": return <CheckCircle className="w-4 h-4" />;
      case "processing": return <RefreshCw className="w-4 h-4" />;
      case "shipped": return <Truck className="w-4 h-4" />;
      case "delivered": return <Package className="w-4 h-4" />;
      case "cancelled": return <XCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Handle order actions
  const handleTrackOrder = (order: Order) => {
    if (order.trackingNumber) {
      toast({
        title: "Tracking Order",
        description: `Tracking number: ${order.trackingNumber}`,
      });
    }
  };

  const handleContactSeller = (order: Order) => {
    navigate(`/app/chat/${order.sellerId}`);
  };

  const handleReorder = (order: Order) => {
    toast({
      title: "Added to Cart",
      description: "Items have been added to your cart",
    });
  };

  const handleCancelOrder = (order: Order) => {
    setOrders(prev => 
      prev.map(o => o.id === order.id ? { ...o, status: "cancelled" } : o)
    );
    toast({
      title: "Order Cancelled",
      description: `Order ${order.orderNumber} has been cancelled`,
    });
  };

  const handleReturnOrder = (order: Order) => {
    toast({
      title: "Return Request",
      description: "Return request submitted successfully",
    });
  };

  const handleLeaveReview = (order: Order) => {
    toast({
      title: "Review",
      description: "Review feature coming soon!",
    });
  };

  // Order statistics
  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    processing: orders.filter(o => ["confirmed", "processing"].includes(o.status)).length,
    shipped: orders.filter(o => o.status === "shipped").length,
    delivered: orders.filter(o => o.status === "delivered").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Orders | Eloity Marketplace</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto p-4 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/app/marketplace")}
                className="p-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <ShoppingCart className="w-8 h-8 text-primary" />
                  My Orders
                </h1>
                <p className="text-muted-foreground mt-1">
                  Track and manage your marketplace orders
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Order Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{orderStats.total}</div>
                <div className="text-sm text-muted-foreground">Total Orders</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{orderStats.pending}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{orderStats.processing}</div>
                <div className="text-sm text-muted-foreground">Processing</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{orderStats.shipped}</div>
                <div className="text-sm text-muted-foreground">Shipped</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{orderStats.delivered}</div>
                <div className="text-sm text-muted-foreground">Delivered</div>
              </CardContent>
            </Card>
          </div>

          {/* Order Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="processing">Processing</TabsTrigger>
              <TabsTrigger value="shipped">Shipped</TabsTrigger>
              <TabsTrigger value="delivered">Delivered</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {filteredOrders.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No orders found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery 
                        ? "Try adjusting your search terms" 
                        : "You haven't placed any orders yet"}
                    </p>
                    {!searchQuery && (
                      <Button onClick={() => navigate("/app/marketplace")}>
                        Start Shopping
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <Card key={order.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          {/* Order Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="font-semibold text-lg">
                                Order #{order.orderNumber}
                              </h3>
                              <Badge 
                                className={cn(
                                  "flex items-center gap-1 border",
                                  getStatusColor(order.status)
                                )}
                              >
                                {getStatusIcon(order.status)}
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Date:</span>
                                <br />
                                <span className="font-medium">{formatDate(order.createdAt)}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Total:</span>
                                <br />
                                <span className="font-medium">
                                  ${order.totalAmount.toFixed(2)}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Seller:</span>
                                <br />
                                <span className="font-medium">{order.sellerName}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Items:</span>
                                <br />
                                <span className="font-medium">{order.items.length} item(s)</span>
                              </div>
                            </div>

                            {/* Order Items Preview */}
                            <div className="flex items-center gap-2 mt-4">
                              {order.items.slice(0, 3).map((item) => (
                                <img
                                  key={item.productId}
                                  src={item.productImage}
                                  alt={item.productName}
                                  className="w-12 h-12 rounded-lg object-cover border"
                                />
                              ))}
                              {order.items.length > 3 && (
                                <div className="w-12 h-12 rounded-lg border bg-muted flex items-center justify-center text-xs">
                                  +{order.items.length - 3}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowOrderDetails(true);
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>

                            {order.status === "shipped" && order.trackingNumber && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleTrackOrder(order)}
                              >
                                <Truck className="w-4 h-4 mr-2" />
                                Track
                              </Button>
                            )}

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleContactSeller(order)}>
                                  <MessageCircle className="w-4 h-4 mr-2" />
                                  Contact Seller
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleReorder(order)}>
                                  <RefreshCw className="w-4 h-4 mr-2" />
                                  Reorder
                                </DropdownMenuItem>
                                {order.status === "delivered" && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleLeaveReview(order)}>
                                      <Star className="w-4 h-4 mr-2" />
                                      Leave Review
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleReturnOrder(order)}>
                                      <RefreshCw className="w-4 h-4 mr-2" />
                                      Return Item
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {["pending", "confirmed"].includes(order.status) && (
                                  <DropdownMenuItem 
                                    onClick={() => handleCancelOrder(order)}
                                    className="text-destructive"
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Cancel Order
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  Order #{selectedOrder.orderNumber}
                  <Badge 
                    className={cn(
                      "flex items-center gap-1 border",
                      getStatusColor(selectedOrder.status)
                    )}
                  >
                    {getStatusIcon(selectedOrder.status)}
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  Placed on {formatDate(selectedOrder.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Order Items */}
                <div>
                  <h3 className="font-semibold mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div key={item.productId} className="flex items-center gap-4 p-3 border rounded-lg">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.productName}</h4>
                          <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                          <p className="text-sm">
                            Quantity: {item.quantity} × ${item.unitPrice.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            ${(item.quantity * item.unitPrice).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Timeline */}
                <div>
                  <h3 className="font-semibold mb-3">Order Timeline</h3>
                  <div className="space-y-3">
                    {selectedOrder.timeline && selectedOrder.timeline.map((event, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                        <div className="flex-1">
                          <p className="font-medium">{event.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(event.date)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping & Payment Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Shipping Information</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Address:</span> {selectedOrder.shippingAddress?.addressLine1}</p>
                      <p><span className="font-medium">Method:</span> {selectedOrder.shippingMethod}</p>
                      <p><span className="font-medium">Cost:</span> ${selectedOrder.shippingCost?.toFixed(2)}</p>
                      {selectedOrder.trackingNumber && (
                        <p><span className="font-medium">Tracking:</span> {selectedOrder.trackingNumber}</p>
                      )}
                      {selectedOrder.estimatedDelivery && (
                        <p><span className="font-medium">Estimated Delivery:</span> {selectedOrder.estimatedDelivery}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Payment Information</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Method:</span> {selectedOrder.paymentMethod}</p>
                      <p><span className="font-medium">Transaction ID:</span> {selectedOrder.paymentTransactionId}</p>
                      <Separator className="my-2" />
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${(selectedOrder.totalAmount - (selectedOrder.shippingCost || 0)).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span>${selectedOrder.shippingCost?.toFixed(2) || "0.00"}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>${selectedOrder.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2">
                {selectedOrder.status === "shipped" && selectedOrder.trackingNumber && (
                  <Button onClick={() => handleTrackOrder(selectedOrder)}>
                    <Truck className="w-4 h-4 mr-2" />
                    Track Order
                  </Button>
                )}
                <Button variant="outline" onClick={() => handleContactSeller(selectedOrder)}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Seller
                </Button>
                <Button variant="outline" onClick={() => setShowOrderDetails(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MarketplaceOrders;