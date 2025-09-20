import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  RefreshCw,
  Download,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { AdminService } from "@/services/adminService";
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
  providerId: string;
  providerName: string;
}

interface DeliveryProvider {
  id: string;
  businessName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  rating: number;
  reviewCount: number;
  isActive: boolean;
}

interface DeliveryTrackingStats {
  totalDeliveries: number;
  activeDeliveries: number;
  completedToday: number;
  delayedDeliveries: number;
  averageDeliveryTime: number;
  onTimeRate: number;
}

export default function DeliveryTrackingAdmin() {
  const [deliveries, setDeliveries] = useState<DeliveryAssignment[]>([]);
  const [providers, setProviders] = useState<DeliveryProvider[]>([]);
  const [stats, setStats] = useState<DeliveryTrackingStats | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryAssignment | null>(null);
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [providerFilter, setProviderFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load delivery assignments
      const deliveriesResponse = await AdminService.getDeliveryAssignments({ limit: 50 });
      if (deliveriesResponse.success) {
        setDeliveries(deliveriesResponse.data.assignments);
      }
      
      // Load delivery providers
      const providersResponse = await AdminService.getDeliveryProviders({ limit: 50 });
      if (providersResponse.success) {
        setProviders(providersResponse.data.providers);
      }
      
      // Load delivery stats
      const statsResponse = await AdminService.getDeliveryTrackingStats();
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      console.error("Error loading delivery tracking data:", error);
      toast({
        title: "Error",
        description: "Failed to load delivery tracking data",
        variant: "destructive",
      });
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

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = delivery.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         delivery.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         delivery.providerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || delivery.status === statusFilter;
    
    const matchesProvider = providerFilter === "all" || delivery.providerId === providerFilter;

    return matchesSearch && matchesStatus && matchesProvider;
  });

  const handleRefresh = () => {
    loadData();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Delivery Tracking</h1>
          <p className="text-gray-600">Monitor and manage all delivery assignments and tracking</p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
                  <p className="text-2xl font-bold">{stats.totalDeliveries}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold">{stats.activeDeliveries}</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Truck className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed Today</p>
                  <p className="text-2xl font-bold">{stats.completedToday}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Delayed</p>
                  <p className="text-2xl font-bold">{stats.delayedDeliveries}</p>
                </div>
                <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Time (min)</p>
                  <p className="text-2xl font-bold">{stats.averageDeliveryTime}</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">On-Time Rate</p>
                  <p className="text-2xl font-bold">{stats.onTimeRate}%</p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Deliveries</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by order number, tracking number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="picked_up">Picked Up</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Provider</Label>
              <Select value={providerFilter} onValueChange={setProviderFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  {providers.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.businessName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deliveries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Assignments ({filteredDeliveries.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Tracking</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Pickup/Delivery</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeliveries.map((delivery) => (
                <TableRow key={delivery.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">#{delivery.orderNumber}</p>
                      <p className="text-sm text-gray-500">{formatCurrency(delivery.deliveryFee)}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{delivery.trackingNumber}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{delivery.providerName}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-red-500" />
                        <span>{delivery.pickupAddress.city}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-green-500" />
                        <span>{delivery.deliveryAddress.city}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{delivery.packageDetails.description}</p>
                      <p className="text-gray-500">{delivery.packageDetails.weight}kg</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(delivery.status)}>
                      {getStatusIcon(delivery.status)}
                      <span className="ml-1 capitalize">{delivery.status.replace('_', ' ')}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDateTime(delivery.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedDelivery(delivery);
                            setShowDeliveryDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Export Data
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delivery Details Dialog */}
      <Dialog open={showDeliveryDialog} onOpenChange={setShowDeliveryDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Delivery Details</DialogTitle>
            <DialogDescription>
              Complete information for order #{selectedDelivery?.orderNumber}
            </DialogDescription>
          </DialogHeader>

          {selectedDelivery && (
            <Tabs defaultValue="timeline" className="space-y-4">
              <TabsList>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="package">Package</TabsTrigger>
                <TabsTrigger value="addresses">Addresses</TabsTrigger>
                <TabsTrigger value="provider">Provider</TabsTrigger>
              </TabsList>

              <TabsContent value="timeline" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Route className="h-5 w-5" />
                      Delivery Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Mock timeline events - in a real implementation, these would come from the API */}
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
                            <Package className="h-4 w-4 text-blue-500" />
                          </div>
                          <div className="w-0.5 h-12 bg-gray-200 mt-2"></div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium">Delivery assignment created</h4>
                            <span className="text-sm text-gray-500">
                              {formatDateTime(selectedDelivery.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">Order processing initiated</p>
                        </div>
                      </div>

                      {selectedDelivery.actualPickupTime && (
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
                              <Package className="h-4 w-4 text-purple-500" />
                            </div>
                            <div className="w-0.5 h-12 bg-gray-200 mt-2"></div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium">Package picked up</h4>
                              <span className="text-sm text-gray-500">
                                {formatDateTime(selectedDelivery.actualPickupTime)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">Package collected from pickup location</p>
                          </div>
                        </div>
                      )}

                      {selectedDelivery.status === "in_transit" && (
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
                              <Truck className="h-4 w-4 text-orange-500" />
                            </div>
                            <div className="w-0.5 h-12 bg-gray-200 mt-2"></div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium">Package in transit</h4>
                              <span className="text-sm text-gray-500">
                                {formatDateTime(new Date().toISOString())}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">Package is on the way to destination</p>
                          </div>
                        </div>
                      )}

                      {selectedDelivery.status === "delivered" && (
                        <>
                          <div className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
                                <Truck className="h-4 w-4 text-orange-500" />
                              </div>
                              <div className="w-0.5 h-12 bg-gray-200 mt-2"></div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-medium">Package in transit</h4>
                                <span className="text-sm text-gray-500">
                                  {formatDateTime(new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString())}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">Package is on the way to destination</p>
                            </div>
                          </div>

                          <div className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-medium">Package delivered</h4>
                                <span className="text-sm text-gray-500">
                                  {formatDateTime(selectedDelivery.actualDeliveryTime || new Date().toISOString())}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">Package successfully delivered to recipient</p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="package" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Package Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="font-medium">Description</Label>
                        <p className="text-sm">{selectedDelivery.packageDetails.description}</p>
                      </div>
                      <div>
                        <Label className="font-medium">Weight</Label>
                        <p className="text-sm">{selectedDelivery.packageDetails.weight}kg</p>
                      </div>
                      <div>
                        <Label className="font-medium">Value</Label>
                        <p className="text-sm">{formatCurrency(selectedDelivery.packageDetails.value)}</p>
                      </div>
                      <div>
                        <Label className="font-medium">Dimensions</Label>
                        <p className="text-sm">
                          {selectedDelivery.packageDetails.dimensions.length} × 
                          {selectedDelivery.packageDetails.dimensions.width} × 
                          {selectedDelivery.packageDetails.dimensions.height} cm
                        </p>
                      </div>
                      {selectedDelivery.packageDetails.fragile && (
                        <Badge variant="destructive" className="text-xs">
                          Fragile Item
                        </Badge>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Delivery Fee</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(selectedDelivery.deliveryFee)}
                      </div>
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Base Fee</span>
                          <span>{formatCurrency(selectedDelivery.deliveryFee * 0.8)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Service Fee</span>
                          <span>{formatCurrency(selectedDelivery.deliveryFee * 0.2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="addresses" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-red-500" />
                        Pickup Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="font-medium">{selectedDelivery.pickupAddress.name}</p>
                        <p className="text-sm text-gray-600">{selectedDelivery.pickupAddress.address}</p>
                        <p className="text-sm text-gray-600">{selectedDelivery.pickupAddress.city}, {selectedDelivery.pickupAddress.state} {selectedDelivery.pickupAddress.zipCode}</p>
                        <p className="text-sm text-gray-600">{selectedDelivery.pickupAddress.phone}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-green-500" />
                        Delivery Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="font-medium">{selectedDelivery.deliveryAddress.name}</p>
                        <p className="text-sm text-gray-600">{selectedDelivery.deliveryAddress.address}</p>
                        <p className="text-sm text-gray-600">{selectedDelivery.deliveryAddress.city}, {selectedDelivery.deliveryAddress.state} {selectedDelivery.deliveryAddress.zipCode}</p>
                        <p className="text-sm text-gray-600">{selectedDelivery.deliveryAddress.phone}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="provider" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Delivery Provider</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Truck className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{selectedDelivery.providerName}</h3>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm">4.8 (127 reviews)</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="font-medium">Contact Name</Label>
                        <p className="text-sm">John Smith</p>
                      </div>
                      <div>
                        <Label className="font-medium">Contact Phone</Label>
                        <p className="text-sm">+1-555-0123</p>
                      </div>
                      <div>
                        <Label className="font-medium">Email</Label>
                        <p className="text-sm">john@fasttrack.com</p>
                      </div>
                      <div>
                        <Label className="font-medium">Status</Label>
                        <Badge variant="default">Active</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}