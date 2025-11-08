import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNotification } from "@/hooks/use-notification";
import { AdminService } from "@/services/adminService";
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Eye,
} from "lucide-react";

import { cn } from "@/lib/utils";

// Simple Badge component since import is having issues
interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'success';
}

const Badge: React.FC<BadgeProps> = ({ children, className, variant }) => {
  const baseClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold";
  
  const variantClasses = {
    default: "border-transparent bg-primary text-primary-foreground",
    outline: "border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300",
    secondary: "border-transparent bg-secondary text-secondary-foreground",
    destructive: "border-transparent bg-destructive text-destructive-foreground",
    success: "border-transparent bg-green-500 text-white",
  }[variant || 'default'] || "";
  
  return (
    <span className={cn(baseClasses, variantClasses, className)}>
      {children}
    </span>
  );
};

interface KYCVerification {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  level: 0 | 1 | 2 | 3;
  status: "pending" | "approved" | "rejected" | "in_review";
  documents: {
    type: "id_front" | "id_back" | "selfie" | "proof_of_address";
    url: string;
    uploadedAt: string;
  }[];
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  notes?: string;
  verificationScore?: number;
  autoVerified: boolean;
  riskLevel: "low" | "medium" | "high";
}

const AdminKYC = () => {
  const [kycVerifications, setKycVerifications] = useState<KYCVerification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<KYCVerification | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [levelFilter, setLevelFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const notification = useNotification();

  useEffect(() => {
    loadKYCVerifications();
  }, []);

  const loadKYCVerifications = async () => {
    try {
      setIsLoading(true);
      // Use real API instead of mock data
      const response = await AdminService.getKYCVerifications({
        page: 1,
        limit: 50,
        status: statusFilter === 'all' ? undefined : statusFilter
      });
      
      if (response.success) {
        setKycVerifications(response.data);
      } else {
        throw new Error(response.error || 'Failed to load KYC verifications');
      }
    } catch (error) {
      console.error("Error loading KYC verifications:", error);
      notification.error("Failed to load KYC verifications");
      
      // Fallback to mock data only if API fails
      const mockVerifications: KYCVerification[] = [
        {
          id: "kyc-001",
          userId: "user-123",
          userName: "John Doe",
          userEmail: "john.doe@example.com",
          level: 2,
          status: "pending",
          documents: [
            { type: "id_front", url: "/mock-id-front.jpg", uploadedAt: "2024-01-25T10:00:00Z" },
            { type: "id_back", url: "/mock-id-back.jpg", uploadedAt: "2024-01-25T10:01:00Z" },
            { type: "selfie", url: "/mock-selfie.jpg", uploadedAt: "2024-01-25T10:02:00Z" },
          ],
          submittedAt: "2024-01-25T10:02:00Z",
          verificationScore: 0.85,
          autoVerified: false,
          riskLevel: "low",
        }
      ];
      setKycVerifications(mockVerifications);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationAction = async (action: "approve" | "reject") => {
    if (!selectedVerification) return;

    try {
      // Use real API instead of mock call
      const response = await AdminService.updateKYCVerification(
        selectedVerification.id,
        {
          status: action === "approve" ? "approved" : "rejected",
          rejectionReason: action === "reject" ? reviewNotes : undefined,
        }
      );
      
      if (response.success) {
        // Update local state
        setKycVerifications(prev => 
          prev.map(v => 
            v.id === selectedVerification.id 
              ? { 
                  ...v, 
                  status: action === "approve" ? "approved" : "rejected",
                  reviewedAt: new Date().toISOString(),
                  reviewedBy: "current-admin",
                  rejectionReason: action === "reject" ? reviewNotes : undefined,
                  notes: reviewNotes,
                }
              : v
          )
        );
        
        notification.success(`Verification ${action}d successfully`);
      } else {
        throw new Error(response.error || `Failed to ${action} verification`);
      }
      
      setShowReviewDialog(false);
      setSelectedVerification(null);
      setReviewNotes("");
    } catch (error) {
      console.error("Error processing verification:", error);
      notification.error(`Failed to ${action} verification`);
    }
  };

  const openReviewDialog = (verification: KYCVerification) => {
    setSelectedVerification(verification);
    setShowReviewDialog(true);
    setReviewNotes("");
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500 text-white",
      in_review: "bg-blue-500 text-white",
      approved: "bg-green-500 text-white",
      rejected: "bg-red-500 text-white",
    };
    return colors[status] || "bg-gray-500 text-white";
  };

  const getRiskColor = (risk: string) => {
    const colors: Record<string, string> = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800",
    };
    return colors[risk] || "bg-gray-100 text-gray-800";
  };

  const getLevelBadge = (level: number) => {
    const badges: Record<number, { label: string; color: string }> = {
      0: { label: "No KYC", color: "bg-gray-500 text-white" },
      1: { label: "Basic", color: "bg-blue-500 text-white" },
      2: { label: "Verified", color: "bg-green-500 text-white" },
      3: { label: "Enhanced", color: "bg-purple-500 text-white" },
    };
    return badges[level] || badges[0];
  };

  const filteredVerifications = kycVerifications.filter(verification => {
    const matchesStatus = statusFilter === "all" || verification.status === statusFilter;
    const matchesLevel = levelFilter === "all" || verification.level.toString() === levelFilter;
    const matchesRisk = riskFilter === "all" || verification.riskLevel === riskFilter;
    const matchesSearch = searchTerm === "" || 
      verification.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesLevel && matchesRisk && matchesSearch;
  });

  const stats = {
    total: kycVerifications.length,
    pending: kycVerifications.filter(v => v.status === "pending").length,
    approved: kycVerifications.filter(v => v.status === "approved").length,
    rejected: kycVerifications.filter(v => v.status === "rejected").length,
    highRisk: kycVerifications.filter(v => v.riskLevel === "high").length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Loading KYC verifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            KYC Verification Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Review and approve user identity verifications
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="bg-blue-500/10 p-3 rounded-full mb-4">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Submissions</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="bg-yellow-500/10 p-3 rounded-full mb-4">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending Review</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="bg-green-500/10 p-3 rounded-full mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <div className="text-sm text-gray-600">Approved</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="bg-red-500/10 p-3 rounded-full mb-4">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="text-2xl font-bold">{stats.rejected}</div>
            <div className="text-sm text-gray-600">Rejected</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="bg-orange-500/10 p-3 rounded-full mb-4">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <div className="text-2xl font-bold">{stats.highRisk}</div>
            <div className="text-sm text-gray-600">High Risk</div>
          </CardContent>
        </Card>
      </div>

      {/* High Risk Alert */}
      {stats.highRisk > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            You have {stats.highRisk} high-risk verification(s) that require immediate attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>KYC Level</Label>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="1">Level 1</SelectItem>
                  <SelectItem value="2">Level 2</SelectItem>
                  <SelectItem value="3">Level 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Risk Level</Label>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex-1 min-w-[200px]">
              <Label>Search</Label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KYC Verifications Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            KYC Verifications ({filteredVerifications.length})
          </CardTitle>
          <CardDescription>
            Review and approve user identity verification submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>KYC Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVerifications.map((verification) => {
                  const levelBadge = getLevelBadge(verification.level);
                  return (
                    <TableRow key={verification.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                            {verification.userName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{verification.userName}</p>
                            <p className="text-sm text-gray-600">{verification.userEmail}</p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge className={levelBadge.color}>
                          {levelBadge.label}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge className={getStatusColor(verification.status)}>
                          {verification.status.toUpperCase()}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className={getRiskColor(verification.riskLevel)}>
                          {verification.riskLevel.toUpperCase()}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {verification.verificationScore && (
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{width: `${verification.verificationScore * 100}%`}}
                              />
                            </div>
                            <span className="text-sm">
                              {Math.round(verification.verificationScore * 100)}%
                            </span>
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="text-sm">
                          <p>{new Date(verification.submittedAt).toLocaleDateString()}</p>
                          <p className="text-gray-500">
                            {new Date(verification.submittedAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openReviewDialog(verification)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Review
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review KYC Verification</DialogTitle>
            <DialogDescription>
              Review the user's identity verification documents and take appropriate action.
            </DialogDescription>
          </DialogHeader>

          {selectedVerification && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-xl">
                    {selectedVerification.userName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">{selectedVerification.userName}</h3>
                    <p className="text-gray-600">{selectedVerification.userEmail}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge className={getLevelBadge(selectedVerification.level).color}>
                        KYC Level {selectedVerification.level}
                      </Badge>
                      <Badge variant="outline" className={getRiskColor(selectedVerification.riskLevel)}>
                        {selectedVerification.riskLevel.toUpperCase()} Risk
                      </Badge>
                    </div>
                  </div>
                </div>

                {selectedVerification.verificationScore && (
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">AI Verification Score:</span>
                    <div className="flex items-center gap-2 flex-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-blue-600 h-3 rounded-full" 
                          style={{width: `${selectedVerification.verificationScore * 100}%`}}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {Math.round(selectedVerification.verificationScore * 100)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Documents */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium">Submitted Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedVerification.documents.map((doc, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium capitalize">
                          {doc.type.replace("_", " ")}
                        </h5>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                      <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <FileText className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-sm">Document Preview</p>
                          <p className="text-xs">Click download to view</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Uploaded: {new Date(doc.uploadedAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review Notes */}
              <div className="space-y-2">
                <Label htmlFor="reviewNotes">Review Notes</Label>
                <Textarea
                  id="reviewNotes"
                  placeholder="Add your review notes and reasoning for the decision..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Action Buttons */}
              {selectedVerification.status === "pending" || selectedVerification.status === "in_review" ? (
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowReviewDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleVerificationAction("approve")}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleVerificationAction("reject")}
                    variant="destructive"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              ) : (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-800 font-medium">
                    This verification has already been reviewed.
                  </p>
                  {selectedVerification.reviewedAt && (
                    <p className="text-blue-600 text-sm mt-1">
                      Reviewed on {new Date(selectedVerification.reviewedAt).toLocaleString()}
                      {selectedVerification.reviewedBy && ` by ${selectedVerification.reviewedBy}`}
                    </p>
                  )}
                  {selectedVerification.notes && (
                    <p className="text-blue-600 text-sm mt-2">
                      Notes: {selectedVerification.notes}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminKYC;