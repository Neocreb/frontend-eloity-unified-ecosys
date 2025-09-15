import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Star,
  Phone,
  MapPin,
  FileText,
  DollarSign,
  TrendingUp,
  Users,
  Package,
  AlertTriangle,
  Eye,
  Edit,
  Ban,
  UserCheck,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface DeliveryProvider {
  id: string;
  businessName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  serviceAreas: any[];
  vehicleTypes: string[];
  servicesOffered: string[];
  verificationStatus: string;
  rating: number;
  reviewCount: number;
  completedDeliveries: number;
  onTimeRate: number;
  isActive: boolean;
  isAvailable: boolean;
  createdAt: string;
  lastActiveAt: string;
  documents: any;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
}

interface DeliveryStats {
  totalProviders: number;
  activeProviders: number;
  pendingVerification: number;
  totalDeliveries: number;
  averageRating: number;
  onTimeRate: number;
}

const mockProviders: DeliveryProvider[] = [
  {
    id: "1",
    businessName: "FastTrack Delivery",
    contactName: "John Smith",
    contactEmail: "john@fasttrack.com",
    contactPhone: "+1-555-0123",
    serviceAreas: [
      { city: "New York", state: "NY", country: "USA", radius: 15 }
    ],
    vehicleTypes: ["bike", "car"],
    servicesOffered: ["same_day", "express", "standard"],
    verificationStatus: "verified",
    rating: 4.8,
    reviewCount: 247,
    completedDeliveries: 1250,
    onTimeRate: 96.5,
    isActive: true,
    isAvailable: true,
    createdAt: "2024-01-10T10:00:00Z",
    lastActiveAt: "2024-01-15T14:30:00Z",
    documents: {
      license: ["license-1.jpg"],
      insurance: ["insurance-1.pdf"],
      registration: ["registration-1.pdf"],
    },
    verifiedAt: "2024-01-12T09:00:00Z",
    verifiedBy: "admin-1",
  },
  {
    id: "2",
    businessName: "QuickDrop Services",
    contactName: "Sarah Johnson",
    contactEmail: "sarah@quickdrop.com",
    contactPhone: "+1-555-0456",
    serviceAreas: [
      { city: "Los Angeles", state: "CA", country: "USA", radius: 20 }
    ],
    vehicleTypes: ["car", "van"],
    servicesOffered: ["next_day", "standard", "scheduled"],
    verificationStatus: "pending",
    rating: 0,
    reviewCount: 0,
    completedDeliveries: 0,
    onTimeRate: 0,
    isActive: false,
    isAvailable: false,
    createdAt: "2024-01-14T15:30:00Z",
    lastActiveAt: "2024-01-14T15:30:00Z",
    documents: {
      license: ["license-2.jpg"],
      insurance: ["insurance-2.pdf"],
    },
  },
  {
    id: "3",
    businessName: "Metro Express",
    contactName: "Mike Wilson",
    contactEmail: "mike@metroexpress.com",
    contactPhone: "+1-555-0789",
    serviceAreas: [
      { city: "Chicago", state: "IL", country: "USA", radius: 25 }
    ],
    vehicleTypes: ["bike", "car", "van"],
    servicesOffered: ["same_day", "express", "standard", "scheduled"],
    verificationStatus: "rejected",
    rating: 0,
    reviewCount: 0,
    completedDeliveries: 0,
    onTimeRate: 0,
    isActive: false,
    isAvailable: false,
    createdAt: "2024-01-08T12:00:00Z",
    lastActiveAt: "2024-01-08T12:00:00Z",
    documents: {
      license: ["license-3.jpg"],
    },
    rejectionReason: "Incomplete documentation - missing insurance certificate",
  },
];

const mockStats: DeliveryStats = {
  totalProviders: 15,
  activeProviders: 8,
  pendingVerification: 3,
  totalDeliveries: 2847,
  averageRating: 4.6,
  onTimeRate: 94.2,
};

export default function DeliveryProvidersAdmin() {
  const [providers, setProviders] = useState<DeliveryProvider[]>(mockProviders);
  const [stats, setStats] = useState<DeliveryStats>(mockStats);
  const [selectedProvider, setSelectedProvider] = useState<DeliveryProvider | null>(null);
  const [showProviderDialog, setShowProviderDialog] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [verificationAction, setVerificationAction] = useState<"approve" | "reject" | null>(null);
  const [verificationNotes, setVerificationNotes] = useState("");
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.contactEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && provider.isActive) ||
                         (statusFilter === "inactive" && !provider.isActive);
    
    const matchesVerification = verificationFilter === "all" ||
                               provider.verificationStatus === verificationFilter;

    return matchesSearch && matchesStatus && matchesVerification;
  });

  const handleVerificationAction = async (providerId: string, action: "approve" | "reject", notes?: string) => {
    try {
      const updatedProviders = providers.map(provider => {
        if (provider.id === providerId) {
          return {
            ...provider,
            verificationStatus: action === "approve" ? "verified" : "rejected",
            isActive: action === "approve",
            verifiedAt: action === "approve" ? new Date().toISOString() : undefined,
            rejectionReason: action === "reject" ? notes : undefined,
          };
        }
        return provider;
      });

      setProviders(updatedProviders);
      setShowVerificationDialog(false);
      setVerificationNotes("");

      toast({
        title: `Provider ${action === "approve" ? "Approved" : "Rejected"}`,
        description: `The delivery provider has been ${action === "approve" ? "approved and activated" : "rejected"}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update provider verification status.",
        variant: "destructive",
      });
    }
  };

  const handleToggleProviderStatus = async (providerId: string, newStatus: boolean) => {
    try {
      const updatedProviders = providers.map(provider => {
        if (provider.id === providerId) {
          return { ...provider, isActive: newStatus };
        }
        return provider;
      });

      setProviders(updatedProviders);

      toast({
        title: "Provider Status Updated",
        description: `Provider has been ${newStatus ? "activated" : "deactivated"}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update provider status.",
        variant: "destructive",
      });
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Delivery Providers</h1>
        <p className="text-gray-600">Manage delivery service providers and their verification status</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Providers</p>
                <p className="text-2xl font-bold">{stats.totalProviders}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold">{stats.activeProviders}</p>
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
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{stats.pendingVerification}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
                <p className="text-2xl font-bold">{stats.totalDeliveries.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold">{stats.averageRating}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-600" />
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
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Providers</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name, email, or phone..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Verification</Label>
              <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Providers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Providers ({filteredProviders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Service Areas</TableHead>
                <TableHead>Vehicle Types</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProviders.map((provider) => (
                <TableRow key={provider.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{provider.businessName}</p>
                      <p className="text-sm text-gray-500">{provider.contactName}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{provider.contactEmail}</p>
                      <p className="text-gray-500">{provider.contactPhone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {provider.serviceAreas.map((area, index) => (
                        <div key={index}>
                          {area.city}, {area.state} ({area.radius}km)
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {provider.vehicleTypes.map((type) => (
                        <span key={type} className="text-lg" title={type}>
                          {getVehicleIcon(type)}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(provider.verificationStatus)}>
                      {getStatusIcon(provider.verificationStatus)}
                      <span className="ml-1 capitalize">{provider.verificationStatus}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {provider.verificationStatus === "verified" ? (
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span>{provider.rating} ({provider.reviewCount})</span>
                        </div>
                        <div className="text-gray-500">
                          {provider.onTimeRate}% on-time
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={provider.isActive ? "default" : "secondary"}>
                      {provider.isActive ? "Active" : "Inactive"}
                    </Badge>
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
                            setSelectedProvider(provider);
                            setShowProviderDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        
                        {provider.verificationStatus === "pending" && (
                          <>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedProvider(provider);
                                setVerificationAction("approve");
                                setShowVerificationDialog(true);
                              }}
                            >
                              <UserCheck className="h-4 w-4 mr-2" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedProvider(provider);
                                setVerificationAction("reject");
                                setShowVerificationDialog(true);
                              }}
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}

                        {provider.verificationStatus === "verified" && (
                          <DropdownMenuItem
                            onClick={() => handleToggleProviderStatus(provider.id, !provider.isActive)}
                          >
                            {provider.isActive ? (
                              <>
                                <Ban className="h-4 w-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Provider Details Dialog */}
      <Dialog open={showProviderDialog} onOpenChange={setShowProviderDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Provider Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedProvider?.businessName}
            </DialogDescription>
          </DialogHeader>

          {selectedProvider && (
            <Tabs defaultValue="general" className="space-y-4">
              <TabsList>
                <TabsTrigger value="general">General Info</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Business Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="font-medium">Business Name</Label>
                        <p className="text-sm">{selectedProvider.businessName}</p>
                      </div>
                      <div>
                        <Label className="font-medium">Contact Name</Label>
                        <p className="text-sm">{selectedProvider.contactName}</p>
                      </div>
                      <div>
                        <Label className="font-medium">Email</Label>
                        <p className="text-sm">{selectedProvider.contactEmail}</p>
                      </div>
                      <div>
                        <Label className="font-medium">Phone</Label>
                        <p className="text-sm">{selectedProvider.contactPhone}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Status & Verification</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="font-medium">Verification Status</Label>
                        <div className="mt-1">
                          <Badge className={getStatusColor(selectedProvider.verificationStatus)}>
                            {getStatusIcon(selectedProvider.verificationStatus)}
                            <span className="ml-1 capitalize">{selectedProvider.verificationStatus}</span>
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <Label className="font-medium">Account Status</Label>
                        <div className="mt-1">
                          <Badge variant={selectedProvider.isActive ? "default" : "secondary"}>
                            {selectedProvider.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <Label className="font-medium">Registered</Label>
                        <p className="text-sm">{formatDateTime(selectedProvider.createdAt)}</p>
                      </div>
                      <div>
                        <Label className="font-medium">Last Active</Label>
                        <p className="text-sm">{formatDateTime(selectedProvider.lastActiveAt)}</p>
                      </div>
                      {selectedProvider.rejectionReason && (
                        <div>
                          <Label className="font-medium text-red-600">Rejection Reason</Label>
                          <p className="text-sm text-red-600">{selectedProvider.rejectionReason}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="services" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Service Areas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedProvider.serviceAreas.map((area, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">{area.city}, {area.state}, {area.country}</span>
                            </div>
                            <p className="text-sm text-gray-600">Coverage radius: {area.radius}km</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Fleet & Services</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="font-medium">Vehicle Types</Label>
                        <div className="flex gap-2 mt-1">
                          {selectedProvider.vehicleTypes.map((type) => (
                            <div key={type} className="text-center p-2 border rounded">
                              <div className="text-2xl">{getVehicleIcon(type)}</div>
                              <div className="text-xs text-gray-600 capitalize">{type}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="font-medium">Services Offered</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedProvider.servicesOffered.map((service) => (
                            <Badge key={service} variant="outline">
                              {service.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="documents" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Verification Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(selectedProvider.documents || {}).map(([type, files]) => (
                        <div key={type} className="p-4 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span className="font-medium capitalize">{type}</span>
                          </div>
                          <div className="space-y-1">
                            {(files as string[]).map((file, index) => (
                              <div key={index} className="text-sm text-gray-600">
                                <Button variant="ghost" size="sm" className="h-auto p-0">
                                  {file}
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="performance" className="space-y-4">
                {selectedProvider.verificationStatus === "verified" ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Overall Rating</p>
                            <div className="flex items-center gap-1">
                              <p className="text-2xl font-bold">{selectedProvider.rating}</p>
                              <Star className="h-5 w-5 text-yellow-500 fill-current" />
                            </div>
                            <p className="text-xs text-gray-500">{selectedProvider.reviewCount} reviews</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Completed Deliveries</p>
                            <p className="text-2xl font-bold">{selectedProvider.completedDeliveries.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">Total deliveries</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">On-Time Rate</p>
                            <p className="text-2xl font-bold">{selectedProvider.onTimeRate}%</p>
                            <p className="text-xs text-gray-500">Delivery performance</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Performance Data</h3>
                      <p className="text-gray-600">
                        Performance metrics will be available after the provider is verified and starts completing deliveries.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Verification Dialog */}
      <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {verificationAction === "approve" ? "Approve Provider" : "Reject Provider"}
            </DialogTitle>
            <DialogDescription>
              {verificationAction === "approve" 
                ? "This will verify and activate the delivery provider."
                : "Please provide a reason for rejecting this provider application."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {verificationAction === "reject" && (
              <div>
                <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                <Textarea
                  id="rejection-reason"
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  placeholder="Please explain why this application is being rejected..."
                  rows={4}
                />
              </div>
            )}

            {verificationAction === "approve" && (
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Provider Verification</p>
                    <p className="text-sm text-green-700">
                      This provider will be verified and activated to start accepting delivery requests.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowVerificationDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedProvider && verificationAction) {
                    if (verificationAction === "reject" && !verificationNotes.trim()) {
                      toast({
                        title: "Rejection Reason Required",
                        description: "Please provide a reason for rejecting this application.",
                        variant: "destructive",
                      });
                      return;
                    }
                    handleVerificationAction(selectedProvider.id, verificationAction, verificationNotes);
                  }
                }}
                variant={verificationAction === "approve" ? "default" : "destructive"}
              >
                {verificationAction === "approve" ? "Approve Provider" : "Reject Application"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
