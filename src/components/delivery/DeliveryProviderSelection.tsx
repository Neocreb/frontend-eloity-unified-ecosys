import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  Clock,
  Star,
  DollarSign,
  MapPin,
  Phone,
  Shield,
  Zap,
  Package,
  Info,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";
import { cn } from "@/lib/utils";

interface DeliveryProvider {
  id: string;
  businessName: string;
  rating: number;
  reviewCount: number;
  onTimeRate: number;
  completedDeliveries: number;
  vehicleTypes: string[];
  servicesOffered: string[];
  contactPhone: string;
  estimatedFee: number;
  estimatedDistance: number;
  estimatedDeliveryTime: number; // hours
  operatingHours: any;
  specialServices: string[];
  isVerified: boolean;
}

interface DeliveryProviderSelectionProps {
  pickupAddress: any;
  deliveryAddress: any;
  packageDetails: any;
  onProviderSelect: (provider: DeliveryProvider, serviceType: string) => void;
  onClose: () => void;
  open: boolean;
}

const mockProviders: DeliveryProvider[] = [
  {
    id: "1",
    businessName: "FastTrack Delivery",
    rating: 4.8,
    reviewCount: 247,
    onTimeRate: 96.5,
    completedDeliveries: 1250,
    vehicleTypes: ["bike", "car"],
    servicesOffered: ["same_day", "express", "standard"],
    contactPhone: "+1-555-0123",
    estimatedFee: 12.50,
    estimatedDistance: 8.5,
    estimatedDeliveryTime: 2,
    operatingHours: {
      monday: { start: "08:00", end: "20:00", isOpen: true },
      tuesday: { start: "08:00", end: "20:00", isOpen: true },
      // ... other days
    },
    specialServices: ["fragile", "documents"],
    isVerified: true,
  },
  {
    id: "2",
    businessName: "QuickDrop Services",
    rating: 4.6,
    reviewCount: 182,
    onTimeRate: 94.2,
    completedDeliveries: 890,
    vehicleTypes: ["car", "van"],
    servicesOffered: ["next_day", "standard", "scheduled"],
    contactPhone: "+1-555-0456",
    estimatedFee: 10.75,
    estimatedDistance: 8.5,
    estimatedDeliveryTime: 4,
    operatingHours: {
      monday: { start: "09:00", end: "18:00", isOpen: true },
      tuesday: { start: "09:00", end: "18:00", isOpen: true },
      // ... other days
    },
    specialServices: ["heavy_items", "oversized"],
    isVerified: true,
  },
  {
    id: "3",
    businessName: "Metro Express",
    rating: 4.9,
    reviewCount: 356,
    onTimeRate: 98.1,
    completedDeliveries: 2100,
    vehicleTypes: ["bike", "car", "van"],
    servicesOffered: ["same_day", "express", "standard", "scheduled"],
    contactPhone: "+1-555-0789",
    estimatedFee: 15.25,
    estimatedDistance: 8.5,
    estimatedDeliveryTime: 1.5,
    operatingHours: {
      monday: { start: "07:00", end: "22:00", isOpen: true },
      tuesday: { start: "07:00", end: "22:00", isOpen: true },
      // ... other days
    },
    specialServices: ["fragile", "cold_chain", "valuable"],
    isVerified: true,
  },
];

const serviceTypeOptions = [
  {
    value: "standard",
    label: "Standard Delivery",
    description: "Regular delivery service",
    multiplier: 1.0,
    icon: Package,
  },
  {
    value: "express",
    label: "Express Delivery",
    description: "Faster delivery (2-4 hours)",
    multiplier: 1.5,
    icon: Zap,
  },
  {
    value: "same_day",
    label: "Same Day Delivery",
    description: "Delivered within the same day",
    multiplier: 1.3,
    icon: Clock,
  },
];

export default function DeliveryProviderSelection({
  pickupAddress,
  deliveryAddress,
  packageDetails,
  onProviderSelect,
  onClose,
  open,
}: DeliveryProviderSelectionProps) {
  const [providers, setProviders] = useState<DeliveryProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [selectedServiceType, setSelectedServiceType] = useState<string>("standard");
  const [loading, setLoading] = useState(false);
  const [showProviderDetails, setShowProviderDetails] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchAvailableProviders();
    }
  }, [open, pickupAddress, deliveryAddress]);

  const fetchAvailableProviders = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would call the API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setProviders(mockProviders);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch delivery providers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateAdjustedFee = (baseFee: number, serviceType: string) => {
    const serviceOption = serviceTypeOptions.find(option => option.value === serviceType);
    return baseFee * (serviceOption?.multiplier || 1.0);
  };

  const calculateEstimatedTime = (baseTime: number, serviceType: string) => {
    switch (serviceType) {
      case "express":
        return Math.max(1, baseTime * 0.5);
      case "same_day":
        return Math.max(2, baseTime * 0.7);
      default:
        return baseTime;
    }
  };

  const handleConfirmSelection = () => {
    const provider = providers.find(p => p.id === selectedProvider);
    if (provider) {
      onProviderSelect(provider, selectedServiceType);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case "bike":
        return "🏍️";
      case "car":
        return "🚗";
      case "van":
        return "🚐";
      case "truck":
        return "🚛";
      default:
        return "🚚";
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Finding Delivery Providers</DialogTitle>
            <DialogDescription>
              Searching for available delivery providers in your area...
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Choose Delivery Provider</DialogTitle>
            <DialogDescription>
              Select a delivery provider and service type for your order
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Provider Selection */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-4">Available Providers</h3>
                <RadioGroup
                  value={selectedProvider}
                  onValueChange={setSelectedProvider}
                  className="space-y-4"
                >
                  {providers.map((provider) => (
                    <Card key={provider.id} className={cn(
                      "cursor-pointer transition-all",
                      selectedProvider === provider.id && "ring-2 ring-primary"
                    )}>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value={provider.id} id={provider.id} />
                          <Label
                            htmlFor={provider.id}
                            className="flex-1 cursor-pointer"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-medium">{provider.businessName}</h4>
                                  {provider.isVerified && (
                                    <Badge variant="secondary" className="text-xs">
                                      <Shield className="h-3 w-3 mr-1" />
                                      Verified
                                    </Badge>
                                  )}
                                </div>

                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                  <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                    <span>{provider.rating}</span>
                                    <span>({provider.reviewCount})</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{provider.onTimeRate}% on-time</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Truck className="h-4 w-4" />
                                    <span>{provider.completedDeliveries} deliveries</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 mb-2">
                                  {provider.vehicleTypes.map((type) => (
                                    <span key={type} className="text-lg" title={type}>
                                      {getVehicleIcon(type)}
                                    </span>
                                  ))}
                                </div>

                                <div className="flex items-center gap-2 text-xs">
                                  {provider.specialServices.slice(0, 3).map((service) => (
                                    <Badge key={service} variant="outline" className="text-xs">
                                      {service.replace('_', ' ')}
                                    </Badge>
                                  ))}
                                  {provider.specialServices.length > 3 && (
                                    <span className="text-gray-500">
                                      +{provider.specialServices.length - 3} more
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="text-right ml-4">
                                <p className="text-lg font-bold text-green-600">
                                  {formatCurrency(calculateAdjustedFee(provider.estimatedFee, selectedServiceType))}
                                </p>
                                <p className="text-xs text-gray-500">
                                  ~{calculateEstimatedTime(provider.estimatedDeliveryTime, selectedServiceType)}h delivery
                                </p>
                                <p className="text-xs text-gray-500">
                                  {provider.estimatedDistance}km away
                                </p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="mt-2"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setShowProviderDetails(provider.id);
                                  }}
                                >
                                  <Info className="h-3 w-3 mr-1" />
                                  Details
                                </Button>
                              </div>
                            </div>
                          </Label>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </RadioGroup>
              </div>
            </div>

            {/* Service Type & Summary */}
            <div className="space-y-6">
              {/* Service Type Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Service Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={selectedServiceType}
                    onValueChange={setSelectedServiceType}
                    className="space-y-3"
                  >
                    {serviceTypeOptions.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={option.value} />
                        <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <option.icon className="h-4 w-4" />
                            <div>
                              <p className="font-medium">{option.label}</p>
                              <p className="text-xs text-gray-500">{option.description}</p>
                            </div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">From</p>
                        <p className="text-gray-600">{pickupAddress?.address || "Pickup location"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">To</p>
                        <p className="text-gray-600">{deliveryAddress?.address || "Delivery location"}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Package Weight</span>
                      <span>{packageDetails?.weight || 0}kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Distance</span>
                      <span>{providers.find(p => p.id === selectedProvider)?.estimatedDistance || 0}km</span>
                    </div>
                    {selectedProvider && (
                      <>
                        <div className="flex justify-between">
                          <span>Service Type</span>
                          <span className="capitalize">{selectedServiceType.replace('_', ' ')}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Delivery Fee</span>
                          <span className="text-green-600">
                            {formatCurrency(
                              calculateAdjustedFee(
                                providers.find(p => p.id === selectedProvider)?.estimatedFee || 0,
                                selectedServiceType
                              )
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Estimated Time</span>
                          <span>
                            ~{calculateEstimatedTime(
                              providers.find(p => p.id === selectedProvider)?.estimatedDeliveryTime || 0,
                              selectedServiceType
                            )}h
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={handleConfirmSelection}
                  disabled={!selectedProvider}
                  className="w-full"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Delivery Provider
                </Button>
                <Button variant="outline" onClick={onClose} className="w-full">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Provider Details Dialog */}
      <Dialog
        open={!!showProviderDetails}
        onOpenChange={() => setShowProviderDetails(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Provider Details</DialogTitle>
          </DialogHeader>

          {showProviderDetails && (() => {
            const provider = providers.find(p => p.id === showProviderDetails);
            if (!provider) return null;

            return (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">{provider.businessName}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span>{provider.rating} ({provider.reviewCount} reviews)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        <span>{provider.contactPhone}</span>
                      </div>
                    </div>
                  </div>
                  {provider.isVerified && (
                    <Badge variant="secondary">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Performance</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>On-time Rate</span>
                        <span className="font-medium">{provider.onTimeRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Completed Deliveries</span>
                        <span className="font-medium">{provider.completedDeliveries}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Distance</span>
                        <span className="font-medium">{provider.estimatedDistance}km</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Vehicle Fleet</h4>
                    <div className="flex gap-2">
                      {provider.vehicleTypes.map((type) => (
                        <div key={type} className="text-center">
                          <div className="text-2xl">{getVehicleIcon(type)}</div>
                          <div className="text-xs text-gray-600 capitalize">{type}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Services Offered</h4>
                  <div className="flex flex-wrap gap-2">
                    {provider.servicesOffered.map((service) => (
                      <Badge key={service} variant="outline">
                        {service.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Special Services</h4>
                  <div className="flex flex-wrap gap-2">
                    {provider.specialServices.map((service) => (
                      <Badge key={service} variant="secondary">
                        {service.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => setShowProviderDetails(null)}>
                    Close
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </>
  );
}
