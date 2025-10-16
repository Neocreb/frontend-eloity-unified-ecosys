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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  MessageCircle,
  Download,
  RefreshCw,
  MoreHorizontal,
  Eye,
  Star,
  Shield,
  CreditCard,
  MapPin,
  Calendar,
  User,
  FileText,
  Camera,
  Send,
  ArrowLeft,
  ExternalLink,
  DollarSign,
  Lock,
  Unlock,
  Flag,
  CheckSquare,
  X,
} from "lucide-react";
import { useEnhancedMarketplace } from "@/contexts/EnhancedMarketplaceContext";
import { useToast } from "@/components/ui/use-toast";
import { Order, OrderStatus, OrderItem } from "@/types/enhanced-marketplace";

// Mock order data
const mockOrders: Order[] = [
  {
    id: "order_1",
    buyerId: "buyer1",
    sellerId: "seller1",
    customerName: "John Doe",
    customerEmail: "john@example.com",
    orderNumber: "ORD-2024-001",
    orderType: "marketplace",
    items: [
      {
        productId: "1",
        productName: "Wireless Noise Cancelling Headphones",
        productImage:
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60",
        sellerId: "seller1",
        sellerName: "AudioTech",
        quantity: 1,
        unitPrice: 249.99,
        totalPrice: 249.99,
        status: "confirmed",
      },
    ],
    subtotal: 249.99,
    shippingCost: 0,
    taxAmount: 20.0,
    discountAmount: 0,
    totalAmount: 269.99,
    paymentMethod: "wallet_usdt",
    paymentCurrency: "USDT",
    paymentStatus: "paid",
    escrowId: "escrow_1",
    shippingAddress: {
      fullName: "John Doe",
      addressLine1: "123 Main St",
      city: "New York",
      state: "NY",
      postalCode: "10001",
      country: "USA",
    },
    shippingMethod: "standard",
    trackingNumber: "1Z999AA1012345675",
    status: "shipped",
    fulfillmentStatus: "fulfilled",
    requiresShipping: true,
    autoCompleteAfterDays: 7,
    platformFee: 13.5,
    feePercentage: 5.0,
    returnRequested: false,
    downloadCount: 0,
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-17T14:20:00Z",
    confirmedAt: "2024-01-15T11:00:00Z",
    shippedAt: "2024-01-16T09:15:00Z",
  },
  {
    id: "order_2",
    buyerId: "buyer2",
    sellerId: "seller2",
    customerName: "Jane Smith",
    customerEmail: "jane@example.com",
    orderNumber: "ORD-2024-002",
    orderType: "digital",
    items: [
      {
        productId: "3",
        productName: "Premium E-book Collection",
        productImage:
          "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&auto=format&fit=crop&q=60",
        sellerId: "seller3",
        sellerName: "BusinessHub",
        quantity: 1,
        unitPrice: 29.99,
        totalPrice: 29.99,
        status: "delivered",
        downloadUrl: "https://example.com/download/ebook-collection",
      },
    ],
    subtotal: 29.99,
    shippingCost: 0,
    taxAmount: 2.4,
    discountAmount: 10.0,
    totalAmount: 22.39,
    paymentMethod: "eloity_points",
    paymentCurrency: "SOFT_POINTS",
    paymentStatus: "paid",
    downloadUrls: ["https://example.com/download/ebook-collection"],
    downloadLimit: 5,
    status: "completed",
    fulfillmentStatus: "fulfilled",
    requiresShipping: false,
    autoCompleteAfterDays: 0,
    platformFee: 1.5,
    feePercentage: 5.0,
    returnRequested: false,
    downloadCount: 2,
    createdAt: "2024-01-14T16:45:00Z",
    updatedAt: "2024-01-14T16:50:00Z",
    confirmedAt: "2024-01-14T16:46:00Z",
    completedAt: "2024-01-14T16:50:00Z",
  },
  {
    id: "order_3",
    buyerId: "buyer3",
    sellerId: "seller4",
    customerName: "Bob Johnson",
    customerEmail: "bob@example.com",
    orderNumber: "ORD-2024-003",
    orderType: "marketplace",
    items: [
      {
        productId: "4",
        productName: "Designer Sunglasses",
        productImage:
          "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&auto=format&fit=crop&q=60",
        sellerId: "seller4",
        sellerName: "LuxeStyle",
        quantity: 1,
        unitPrice: 159.99,
        totalPrice: 159.99,
        status: "processing",
      },
    ],
    subtotal: 159.99,
    shippingCost: 9.99,
    taxAmount: 12.8,
    discountAmount: 0,
    totalAmount: 182.78,
    paymentMethod: "wallet_usdt",
    paymentCurrency: "USDT",
    paymentStatus: "paid",
    escrowId: "escrow_2",
    status: "disputed",
    fulfillmentStatus: "processing",
    requiresShipping: true,
    autoCompleteAfterDays: 7,
    platformFee: 9.14,
    feePercentage: 5.0,
    disputeId: "dispute_1",
    disputeReason: "not_as_described",
    returnRequested: true,
    returnRequestedAt: "2024-01-18T10:00:00Z",
    returnReason: "Product does not match description",
    downloadCount: 0,
    createdAt: "2024-01-16T12:30:00Z",
    updatedAt: "2024-01-18T10:00:00Z",
    confirmedAt: "2024-01-16T13:00:00Z",
  },
];

const OrderManagementSystem: React.FC = () => {
  const {
    updateOrderStatus,
    confirmDelivery,
    cancelOrder,
    requestReturn,
    trackOrder,
    downloadDigitalProduct,
    raiseDispute,
    getOrderDisputes,
    startOrderChat,
  } = useEnhancedMarketplace();

  const { toast } = useToast();

  const [orders] = useState<Order[]>(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showDispute, setShowDispute] = useState(false);
  const [showReturn, setShowReturn] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeDescription, setDisputeDescription] = useState("");
  const [returnReason, setReturnReason] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");

  const filteredOrders = orders.filter((order) => {
    switch (selectedTab) {
      case "pending":
        return ["pending", "confirmed", "processing"].includes(order.status);
      case "shipped":
        return order.status === "shipped";
      case "delivered":
        return ["delivered", "completed"].includes(order.status);
      case "disputed":
        return order.status === "disputed";
      case "cancelled":
        return order.status === "cancelled";
      default:
        return true;
    }
  });

  const getStatusBadge = (status: OrderStatus) => {
    const statusConfig = {
      pending: { color: "bg-yellow-500", icon: Clock },
      confirmed: { color: "bg-blue-500", icon: CheckCircle },
      processing: { color: "bg-orange-500", icon: Package },
      shipped: { color: "bg-purple-500", icon: Truck },
      delivered: { color: "bg-green-500", icon: CheckCircle },
      completed: { color: "bg-green-600", icon: CheckSquare },
      cancelled: { color: "bg-red-500", icon: XCircle },
      disputed: { color: "bg-red-600", icon: AlertTriangle },
      refunded: { color: "bg-gray-500", icon: RefreshCw },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <Badge className={`${config.color} text-white`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const colors = {
      paid: "bg-green-500",
      pending: "bg-yellow-500",
      failed: "bg-red-500",
      refunded: "bg-gray-500",
      partial_refund: "bg-orange-500",
    };

    return (
      <Badge
        className={`${colors[status as keyof typeof colors] || "bg-gray-500"} text-white`}
      >
        {status.replace("_", " ").charAt(0).toUpperCase() +
          status.slice(1).replace("_", " ")}
      </Badge>
    );
  };

  const handleConfirmDelivery = async (orderId: string) => {
    try {
      await confirmDelivery(orderId);
      toast({
        title: "Delivery Confirmed",
        description: "Order has been marked as delivered",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to confirm delivery",
        variant: "destructive",
      });
    }
  };

  const handleCancelOrder = async (orderId: string, reason: string) => {
    try {
      await cancelOrder(orderId, reason);
      toast({
        title: "Order Cancelled",
        description: "Your order has been cancelled",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel order",
        variant: "destructive",
      });
    }
  };

  const handleRequestReturn = async () => {
    if (!selectedOrder || !returnReason.trim()) return;

    try {
      await requestReturn(selectedOrder.id, returnReason);
      toast({
        title: "Return Requested",
        description: "Your return request has been submitted",
      });
      setShowReturn(false);
      setReturnReason("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to request return",
        variant: "destructive",
      });
    }
  };

  const handleRaiseDispute = async () => {
    if (!selectedOrder || !disputeReason || !disputeDescription.trim()) return;

    try {
      await raiseDispute(selectedOrder.id, disputeReason, disputeDescription);
      toast({
        title: "Dispute Raised",
        description: "Your dispute has been submitted for review",
      });
      setShowDispute(false);
      setDisputeReason("");
      setDisputeDescription("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to raise dispute",
        variant: "destructive",
      });
    }
  };

  const handleDownloadProduct = async (orderId: string, productId: string) => {
    try {
      const downloadUrl = await downloadDigitalProduct(orderId, productId);
      window.open(downloadUrl, "_blank");
      toast({
        title: "Download Started",
        description: "Your download should begin shortly",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download product",
        variant: "destructive",
      });
    }
  };

  const handleStartChat = async (orderId: string) => {
    try {
      const chatThreadId = await startOrderChat(orderId);
      toast({
        title: "Chat Started",
        description: "Opening chat with seller",
      });
      // Navigate to chat or open chat interface
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start chat",
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

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Order Management</h1>
          <p className="text-muted-foreground">Track and manage your orders</p>
        </div>
      </div>

      {/* Order Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {
                orders.filter((o) =>
                  ["pending", "confirmed", "processing"].includes(o.status),
                ).length
              }
            </div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {orders.filter((o) => o.status === "shipped").length}
            </div>
            <div className="text-sm text-muted-foreground">Shipped</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {
                orders.filter((o) =>
                  ["delivered", "completed"].includes(o.status),
                ).length
              }
            </div>
            <div className="text-sm text-muted-foreground">Delivered</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {orders.filter((o) => o.status === "disputed").length}
            </div>
            <div className="text-sm text-muted-foreground">Disputed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">
              {orders.filter((o) => o.status === "cancelled").length}
            </div>
            <div className="text-sm text-muted-foreground">Cancelled</div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="shipped">Shipped</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
          <TabsTrigger value="disputed">Disputed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab}>
          {filteredOrders.length === 0 ? (
            <Card className="bg-gray-50">
              <CardContent className="pt-6 text-center">
                <div className="py-8 space-y-4">
                  <Package className="h-16 w-16 text-gray-400 mx-auto" />
                  <h3 className="text-lg font-medium">No orders found</h3>
                  <p className="text-muted-foreground">
                    {selectedTab === "all"
                      ? "You haven't placed any orders yet"
                      : `No ${selectedTab} orders found`}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="font-semibold">
                            Order #{order.orderNumber}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Placed on {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(order.status)}
                          {getPaymentStatusBadge(order.paymentStatus)}
                          {order.orderType === "digital" && (
                            <Badge variant="outline">Digital</Badge>
                          )}
                          {order.escrowId && (
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-600"
                            >
                              <Shield className="h-3 w-3 mr-1" />
                              Escrow Protected
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">
                          ${order.totalAmount.toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.paymentCurrency}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Order Items */}
                    <div className="space-y-3">
                      {order.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                        >
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-16 h-16 rounded object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">{item.productName}</h4>
                            <p className="text-sm text-muted-foreground">
                              by {item.sellerName} • Qty: {item.quantity}
                            </p>
                            <p className="text-sm font-medium">
                              ${item.totalPrice.toFixed(2)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.downloadUrl &&
                              order.status === "completed" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleDownloadProduct(
                                      order.id,
                                      item.productId,
                                    )
                                  }
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  Download
                                </Button>
                              )}
                            {getStatusBadge(item.status)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Shipping Info */}
                    {order.requiresShipping && order.shippingAddress && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="font-medium">Shipping Address</p>
                            <p className="text-sm text-muted-foreground">
                              {order.shippingAddress.fullName}
                              <br />
                              {order.shippingAddress.addressLine1}
                              <br />
                              {order.shippingAddress.city},{" "}
                              {order.shippingAddress.state}{" "}
                              {order.shippingAddress.postalCode}
                            </p>
                            {order.trackingNumber && (
                              <p className="text-sm font-medium mt-1">
                                Tracking: {order.trackingNumber}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Dispute Info */}
                    {order.status === "disputed" && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-red-800">
                              Order Disputed
                            </p>
                            <p className="text-sm text-red-600">
                              Reason: {order.disputeReason?.replace("_", " ")}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Our support team is reviewing this dispute and
                              will contact you soon.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Return Info */}
                    {order.returnRequested && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <RefreshCw className="h-5 w-5 text-yellow-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-yellow-800">
                              Return Requested
                            </p>
                            <p className="text-sm text-yellow-600">
                              Status: {order.returnStatus || "Pending Review"}
                            </p>
                            {order.returnReason && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Reason: {order.returnReason}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="border-t bg-gray-50 p-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderDetails(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>

                      {order.trackingNumber && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowTracking(true);
                          }}
                        >
                          <Truck className="h-4 w-4 mr-1" />
                          Track Package
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStartChat(order.id)}
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Chat with Seller
                      </Button>

                      {order.status === "shipped" && (
                        <Button
                          size="sm"
                          onClick={() => handleConfirmDelivery(order.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Confirm Delivery
                        </Button>
                      )}

                      {["delivered", "completed"].includes(order.status) &&
                        !order.returnRequested && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowReturn(true);
                            }}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Request Return
                          </Button>
                        )}

                      {!["cancelled", "disputed", "completed"].includes(
                        order.status,
                      ) &&
                        !order.disputeId && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowDispute(true);
                            }}
                          >
                            <Flag className="h-4 w-4 mr-1" />
                            Raise Dispute
                          </Button>
                        )}

                      {order.status === "pending" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            handleCancelOrder(
                              order.id,
                              "Customer requested cancellation",
                            )
                          }
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel Order
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Order Details Dialog */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Complete information about your order
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <h3 className="font-medium">Order Summary</h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Order Number:</span>
                    <span className="font-medium">
                      {selectedOrder.orderNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Order Date:</span>
                    <span>{formatDate(selectedOrder.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Status:</span>
                    {getPaymentStatusBadge(selectedOrder.paymentStatus)}
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span>
                      {selectedOrder.paymentMethod
                        .replace("_", " ")
                        .toUpperCase()}
                    </span>
                  </div>
                  {selectedOrder.escrowId && (
                    <div className="flex justify-between">
                      <span>Escrow ID:</span>
                      <span className="font-mono text-sm">
                        {selectedOrder.escrowId}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Financial Breakdown */}
              <Card>
                <CardHeader>
                  <h3 className="font-medium">Financial Details</h3>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>${selectedOrder.shippingCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>${selectedOrder.taxAmount.toFixed(2)}</span>
                  </div>
                  {selectedOrder.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-${selectedOrder.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>${selectedOrder.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Platform Fee:</span>
                    <span>
                      ${selectedOrder.platformFee.toFixed(2)} (
                      {selectedOrder.feePercentage}%)
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Order Timeline */}
              <Card>
                <CardHeader>
                  <h3 className="font-medium">Order Timeline</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Order Placed</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(selectedOrder.createdAt)}
                        </p>
                      </div>
                    </div>
                    {selectedOrder.confirmedAt && (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium">Order Confirmed</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(selectedOrder.confirmedAt)}
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedOrder.shippedAt && (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium">Order Shipped</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(selectedOrder.shippedAt)}
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedOrder.deliveredAt && (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium">Order Delivered</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(selectedOrder.deliveredAt)}
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedOrder.completedAt && (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium">Order Completed</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(selectedOrder.completedAt)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dispute Dialog */}
      <Dialog open={showDispute} onOpenChange={setShowDispute}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Raise a Dispute</DialogTitle>
            <DialogDescription>
              If you have an issue with your order, please describe the problem
              below
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="disputeReason">Dispute Reason</Label>
              <Select value={disputeReason} onValueChange={setDisputeReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_received">
                    Order not received
                  </SelectItem>
                  <SelectItem value="not_as_described">
                    Item not as described
                  </SelectItem>
                  <SelectItem value="damaged">Item arrived damaged</SelectItem>
                  <SelectItem value="wrong_item">
                    Wrong item received
                  </SelectItem>
                  <SelectItem value="quality_issues">Quality issues</SelectItem>
                  <SelectItem value="seller_unresponsive">
                    Seller unresponsive
                  </SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="disputeDescription">Description</Label>
              <Textarea
                id="disputeDescription"
                placeholder="Please provide detailed information about the issue..."
                value={disputeDescription}
                onChange={(e) => setDisputeDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="text-sm text-muted-foreground">
              <p>
                Note: Our support team will review your dispute and contact both
                parties to resolve the issue fairly.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDispute(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRaiseDispute}
              disabled={!disputeReason || !disputeDescription.trim()}
            >
              <Flag className="h-4 w-4 mr-2" />
              Raise Dispute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Return Dialog */}
      <Dialog open={showReturn} onOpenChange={setShowReturn}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Request Return</DialogTitle>
            <DialogDescription>
              Request a return for your order
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="returnReason">Return Reason</Label>
              <Textarea
                id="returnReason"
                placeholder="Please explain why you want to return this item..."
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                rows={4}
              />
            </div>

            <div className="text-sm text-muted-foreground">
              <p>
                Returns are subject to the seller's return policy. Processing
                may take 3-5 business days.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReturn(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRequestReturn}
              disabled={!returnReason.trim()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Request Return
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tracking Dialog */}
      <Dialog open={showTracking} onOpenChange={setShowTracking}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Track Your Package</DialogTitle>
            <DialogDescription>
              Real-time tracking information for your order
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="font-medium">Tracking Number</p>
                <p className="font-mono text-lg">
                  {selectedOrder.trackingNumber}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Package Shipped</p>
                    <p className="text-sm text-muted-foreground">
                      Your package has been shipped and is on its way
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedOrder.shippedAt
                        ? formatDate(selectedOrder.shippedAt)
                        : "Pending"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">In Transit</p>
                    <p className="text-sm text-muted-foreground">
                      Package is being transported to your location
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Expected delivery: 2-3 business days
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <div>
                    <p className="font-medium">Out for Delivery</p>
                    <p className="text-sm text-muted-foreground">
                      Package is out for delivery
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <div>
                    <p className="font-medium">Delivered</p>
                    <p className="text-sm text-muted-foreground">
                      Package has been delivered
                    </p>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  window.open(
                    `https://track.example.com/${selectedOrder.trackingNumber}`,
                    "_blank",
                  )
                }
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View on Carrier Website
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderManagementSystem;
