import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Truck,
  Package,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Star,
  Navigation,
  MessageCircle,
  Eye,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";

interface OrderTrackingCardProps {
  order: {
    id: string;
    orderNumber: string;
    status: "pending" | "confirmed" | "picked_up" | "in_transit" | "delivered" | "cancelled";
    deliveryProvider?: {
      id: string;
      businessName: string;
      rating: number;
      contactPhone: string;
      driverName?: string;
      vehicleInfo?: string;
    };
    deliveryInfo?: {
      estimatedDelivery: string;
      actualDelivery?: string;
      trackingNumber: string;
      currentLocation?: string;
      progress: number;
    };
    items: Array<{
      name: string;
      quantity: number;
      image: string;
    }>;
    total: number;
    createdAt: string;
  };
}

export default function OrderTrackingCard({ order }: OrderTrackingCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const { toast } = useToast();
  const { formatCurrency: formatCurrencyContext } = useCurrency();

  const formatCurrency = (amount: number) => {
    return formatCurrencyContext(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "picked_up":
        return "bg-purple-100 text-purple-800";
      case "in_transit":
        return "bg-orange-100 text-orange-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;
      case "picked_up":
        return <Package className="h-4 w-4" />;
      case "in_transit":
        return <Truck className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getDeliverySteps = () => {
    const steps = [
      { label: "Order Confirmed", status: "confirmed", completed: true },
      { label: "Picked Up", status: "picked_up", completed: ["picked_up", "in_transit", "delivered"].includes(order.status) },
      { label: "In Transit", status: "in_transit", completed: ["in_transit", "delivered"].includes(order.status) },
      { label: "Delivered", status: "delivered", completed: order.status === "delivered" },
    ];
    return steps;
  };

  const handleRefreshTracking = async () => {
    setIsTracking(true);
    try {
      // Simulate API call to refresh tracking info
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Tracking Updated",
        description: "Latest delivery information has been retrieved",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Could not refresh tracking information",
        variant: "destructive",
      });
    } finally {
      setIsTracking(false);
    }
  };

  const handleContactDriver = () => {
    toast({
      title: "Contacting Driver",
      description: "Opening communication channel with your delivery driver",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Badge className={getStatusColor(order.status)}>
                {getStatusIcon(order.status)}
                <span className="ml-1 capitalize">{order.status.replace('_', ' ')}</span>
              </Badge>
              <span className="font-medium">#{order.orderNumber}</span>
            </div>
            <div className="text-right">
              <p className="font-bold">{formatCurrency(order.total)}</p>
              <p className="text-xs text-gray-500">
                {formatDateTime(order.createdAt)}
              </p>
            </div>
          </div>

          {/* Items Preview */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex -space-x-2">
              {order.items.slice(0, 3).map((item, index) => (
                <div key={index} className="w-8 h-8 rounded border-2 border-white overflow-hidden bg-gray-100">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {order.items.length > 3 && (
                <div className="w-8 h-8 rounded border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium">
                  +{order.items.length - 3}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium">
                {order.items.length} item{order.items.length !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-gray-500">
                {order.items[0]?.name}{order.items.length > 1 ? ` and ${order.items.length - 1} more` : ''}
              </p>
            </div>
          </div>

          {/* Delivery Provider Info */}
          {order.deliveryProvider && (
            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-sm">{order.deliveryProvider.businessName}</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                    <span className="text-xs">{order.deliveryProvider.rating}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleContactDriver}
                    className="text-xs px-2 py-1 h-auto"
                  >
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Contact
                  </Button>
                </div>
              </div>
              
              {order.deliveryProvider.driverName && (
                <p className="text-xs text-gray-600 mt-1">
                  Driver: {order.deliveryProvider.driverName}
                  {order.deliveryProvider.vehicleInfo && ` • ${order.deliveryProvider.vehicleInfo}`}
                </p>
              )}
            </div>
          )}

          {/* Delivery Progress */}
          {order.deliveryInfo && ["picked_up", "in_transit", "delivered"].includes(order.status) && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Delivery Progress</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefreshTracking}
                  disabled={isTracking}
                  className="text-xs px-2 py-1 h-auto"
                >
                  <RefreshCw className={`h-3 w-3 mr-1 ${isTracking ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
              <Progress value={order.deliveryInfo.progress} className="mb-2" />
              
              <div className="flex justify-between text-xs text-gray-600">
                <span>Tracking: {order.deliveryInfo.trackingNumber}</span>
                <span>
                  {order.status === "delivered" ? 
                    `Delivered ${formatDateTime(order.deliveryInfo.actualDelivery || "")}` :
                    `ETA: ${formatDateTime(order.deliveryInfo.estimatedDelivery)}`
                  }
                </span>
              </div>
              
              {order.deliveryInfo.currentLocation && order.status !== "delivered" && (
                <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                  <MapPin className="h-3 w-3" />
                  <span>Current location: {order.deliveryInfo.currentLocation}</span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(true)}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
            
            {order.status !== "delivered" && order.status !== "cancelled" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Navigate to live tracking page
                  window.open(`/delivery/track?order=${order.orderNumber}`, '_blank');
                }}
              >
                <Navigation className="h-4 w-4 mr-2" />
                Live Track
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details - #{order.orderNumber}</DialogTitle>
            <DialogDescription>
              Complete information about your order and delivery
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Order Status Timeline */}
            <div>
              <h4 className="font-medium mb-3">Delivery Timeline</h4>
              <div className="space-y-3">
                {getDeliverySteps().map((step, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      step.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {step.completed ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                    </div>
                    <span className={`text-sm ${step.completed ? 'font-medium' : 'text-gray-500'}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h4 className="font-medium mb-3">Order Items</h4>
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                    <div className="w-12 h-12 rounded overflow-hidden bg-gray-200">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Information */}
            {order.deliveryProvider && (
              <div>
                <h4 className="font-medium mb-3">Delivery Provider</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{order.deliveryProvider.businessName}</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span>{order.deliveryProvider.rating}</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      <span>{order.deliveryProvider.contactPhone}</span>
                    </div>
                    {order.deliveryProvider.driverName && (
                      <p>Driver: {order.deliveryProvider.driverName}</p>
                    )}
                    {order.deliveryProvider.vehicleInfo && (
                      <p>Vehicle: {order.deliveryProvider.vehicleInfo}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={() => setShowDetails(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
