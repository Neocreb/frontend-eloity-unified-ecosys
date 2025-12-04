import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
  Clock,
  MapPin,
  Phone,
  CheckCircle,
  AlertCircle,
  Navigation,
  Camera,
  MessageCircle,
  Star,
  User,
  Calendar,
  Route,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";
import { cn } from "@/lib/utils";

interface TrackingEvent {
  id: string;
  eventType: string;
  description: string;
  timestamp: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  photos?: string[];
  metadata?: any;
}

interface DeliveryAssignment {
  id: string;
  orderId: string;
  orderNumber: string;
  status: string;
  trackingNumber: string;
  pickupAddress: any;
  deliveryAddress: any;
  packageDetails: any;
  deliveryFee: number;
  estimatedDeliveryTime: string;
  actualPickupTime?: string;
  actualDeliveryTime?: string;
  driverNotes?: string;
  customerNotes?: string;
  pickupPhotos?: string[];
  deliveryPhotos?: string[];
  signatureUrl?: string;
  recipientName?: string;
  createdAt: string;
}

interface DeliveryProvider {
  businessName: string;
  contactPhone: string;
  rating: number;
  reviewCount: number;
}

interface DeliveryTrackingProps {
  trackingNumber?: string;
  onClose?: () => void;
  open?: boolean;
}

const mockTrackingData = {
  assignment: {
    id: "1",
    orderId: "order-1",
    orderNumber: "SC240001",
    status: "in_transit",
    trackingNumber: "SC240001ABC",
    pickupAddress: {
      name: "TechStore Inc",
      address: "123 Business St, Downtown",
      phone: "+1-555-0123",
    },
    deliveryAddress: {
      name: "John Smith",
      address: "456 Residential Ave, Suburbs",
      phone: "+1-555-0456",
    },
    packageDetails: {
      weight: 2.5,
      dimensions: { length: 30, width: 20, height: 15 },
      value: 299.99,
      description: "Electronics - Smartphone",
      fragile: true,
    },
    deliveryFee: 12.50,
    estimatedDeliveryTime: "2024-01-15T16:00:00Z",
    actualPickupTime: "2024-01-15T14:15:00Z",
    customerNotes: "Please ring doorbell, leave at door if no answer",
    createdAt: "2024-01-15T10:30:00Z",
  },
  provider: {
    businessName: "FastTrack Delivery",
    contactPhone: "+1-555-0123",
    rating: 4.8,
    reviewCount: 247,
  },
  trackingEvents: [
    {
      id: "1",
      eventType: "created",
      description: "Delivery assignment created",
      timestamp: "2024-01-15T10:30:00Z",
      location: {
        latitude: 40.7128,
        longitude: -74.0060,
        address: "Business District, New York",
      },
    },
    {
      id: "2",
      eventType: "accepted",
      description: "Delivery accepted by FastTrack Delivery",
      timestamp: "2024-01-15T11:00:00Z",
    },
    {
      id: "3",
      eventType: "picked_up",
      description: "Package picked up from TechStore Inc",
      timestamp: "2024-01-15T14:15:00Z",
      location: {
        latitude: 40.7580,
        longitude: -73.9855,
        address: "123 Business St, Downtown",
      },
      photos: ["/pickup-photo-1.jpg"],
    },
    {
      id: "4",
      eventType: "in_transit",
      description: "Package is on the way to destination",
      timestamp: "2024-01-15T14:30:00Z",
      location: {
        latitude: 40.7505,
        longitude: -73.9934,
        address: "En route to delivery address",
      },
    },
  ],
};

export default function DeliveryTracking({
  trackingNumber: initialTrackingNumber,
  onClose,
  open = true,
}: DeliveryTrackingProps) {
  const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber || "");
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (initialTrackingNumber) {
      handleTrackDelivery(initialTrackingNumber);
    }
  }, [initialTrackingNumber]);

  const handleTrackDelivery = async (trackingNum?: string) => {
    const numberToTrack = trackingNum || trackingNumber;
    if (!numberToTrack.trim()) {
      setError("Please enter a tracking number");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (numberToTrack === "SC240001ABC") {
        setTrackingData(mockTrackingData);
      } else {
        setError("Tracking number not found");
      }
    } catch (err) {
      setError("Failed to fetch tracking information");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-blue-100 text-blue-800";
      case "picked_up":
        return "bg-purple-100 text-purple-800";
      case "in_transit":
        return "bg-orange-100 text-orange-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "accepted":
        return <CheckCircle className="h-4 w-4" />;
      case "picked_up":
        return <Package className="h-4 w-4" />;
      case "in_transit":
        return <Truck className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "failed":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "created":
        return <Package className="h-4 w-4 text-blue-500" />;
      case "accepted":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "picked_up":
        return <Package className="h-4 w-4 text-purple-500" />;
      case "in_transit":
        return <Truck className="h-4 w-4 text-orange-500" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getNextExpectedEvent = (currentStatus: string) => {
    switch (currentStatus) {
      case "pending":
        return "Awaiting pickup";
      case "accepted":
        return "Pickup scheduled";
      case "picked_up":
        return "In transit to destination";
      case "in_transit":
        return "Out for delivery";
      default:
        return null;
    }
  };

  if (!open && onClose) {
    return null;
  }

  const content = (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Track Your Delivery</h1>
        <p className="text-gray-600">
          Enter your tracking number to see real-time delivery updates
        </p>
      </div>

      {/* Tracking Input */}
      {!initialTrackingNumber && (
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="tracking-number">Tracking Number</Label>
                <Input
                  id="tracking-number"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number (e.g., SC240001ABC)"
                />
              </div>
              <Button
                onClick={() => handleTrackDelivery()}
                disabled={loading}
                className="mt-6"
              >
                {loading ? "Tracking..." : "Track Package"}
              </Button>
            </div>
            {error && (
              <p className="text-red-600 text-sm mt-2">{error}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Fetching tracking information...</p>
          </CardContent>
        </Card>
      )}

      {/* Tracking Results */}
      {trackingData && !loading && (
        <div className="space-y-6">
          {/* Status Overview */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold mb-2">Order #{trackingData.assignment.orderNumber}</h2>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(trackingData.assignment.status)}>
                      {getStatusIcon(trackingData.assignment.status)}
                      <span className="ml-1 capitalize">
                        {trackingData.assignment.status.replace('_', ' ')}
                      </span>
                    </Badge>
                    <span className="text-sm text-gray-500">
                      Tracking: {trackingData.assignment.trackingNumber}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Delivery Fee</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(trackingData.assignment.deliveryFee)}
                  </p>
                </div>
              </div>

              {/* Next Expected Update */}
              {getNextExpectedEvent(trackingData.assignment.status) && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">
                        {getNextExpectedEvent(trackingData.assignment.status)}
                      </p>
                      <p className="text-sm text-blue-700">
                        Expected delivery: {formatDateTime(trackingData.assignment.estimatedDeliveryTime)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tracking Timeline */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Route className="h-5 w-5" />
                    Delivery Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {trackingData.trackingEvents.map((event: TrackingEvent, index: number) => (
                      <div key={event.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
                            {getEventIcon(event.eventType)}
                          </div>
                          {index < trackingData.trackingEvents.length - 1 && (
                            <div className="w-0.5 h-12 bg-gray-200 mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium">{event.description}</h4>
                            <span className="text-sm text-gray-500">
                              {formatDateTime(event.timestamp)}
                            </span>
                          </div>
                          {event.location && (
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.location.address}
                            </p>
                          )}
                          {event.photos && event.photos.length > 0 && (
                            <div className="mt-2">
                              <Button variant="outline" size="sm">
                                <Camera className="h-3 w-3 mr-1" />
                                View Photos ({event.photos.length})
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Delivery Details */}
            <div className="space-y-6">
              {/* Package Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Package Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Description</p>
                    <p className="text-sm text-gray-600">{trackingData.assignment.packageDetails.description}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Weight</p>
                    <p className="text-sm text-gray-600">{trackingData.assignment.packageDetails.weight}kg</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Value</p>
                    <p className="text-sm text-gray-600">
                      {formatCurrency(trackingData.assignment.packageDetails.value)}
                    </p>
                  </div>
                  {trackingData.assignment.packageDetails.fragile && (
                    <Badge variant="destructive" className="text-xs">
                      Fragile Item
                    </Badge>
                  )}
                </CardContent>
              </Card>

              {/* Delivery Provider */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Delivery Provider
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-medium">{trackingData.provider.businessName}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm">{trackingData.provider.rating}</span>
                      <span className="text-sm text-gray-500">
                        ({trackingData.provider.reviewCount} reviews)
                      </span>
                    </div>
                  </div>
                  <Separator />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setShowContactDialog(true)}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Contact Provider
                  </Button>
                </CardContent>
              </Card>

              {/* Addresses */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Addresses
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-red-600 mb-1">Pickup</p>
                    <p className="text-sm font-medium">{trackingData.assignment.pickupAddress.name}</p>
                    <p className="text-sm text-gray-600">{trackingData.assignment.pickupAddress.address}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-green-600 mb-1">Delivery</p>
                    <p className="text-sm font-medium">{trackingData.assignment.deliveryAddress.name}</p>
                    <p className="text-sm text-gray-600">{trackingData.assignment.deliveryAddress.address}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Notes */}
              {trackingData.assignment.customerNotes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      Delivery Instructions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      {trackingData.assignment.customerNotes}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contact Provider Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Delivery Provider</DialogTitle>
            <DialogDescription>
              Get in touch with {trackingData?.provider.businessName} regarding your delivery
            </DialogDescription>
          </DialogHeader>

          {trackingData && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Truck className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">{trackingData.provider.businessName}</h4>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                    <span>{trackingData.provider.rating} ({trackingData.provider.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full justify-start"
                  onClick={() => {
                    window.location.href = `tel:${trackingData.provider.contactPhone}`;
                  }}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call {trackingData.provider.contactPhone}
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    // Open chat or messaging functionality
                    toast({
                      title: "Chat Feature",
                      description: "Opening chat with delivery provider...",
                    });
                  }}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </div>

              <div className="text-center pt-4">
                <Button variant="ghost" onClick={() => setShowContactDialog(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );

  if (onClose) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return content;
}
