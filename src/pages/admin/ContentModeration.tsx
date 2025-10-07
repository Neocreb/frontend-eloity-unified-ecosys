// @ts-nocheck
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { AdminService } from "@/services/adminService";
import { ContentModerationItem, AdminUser } from "@/types/admin";
import { useNotification } from "@/hooks/use-notification";
import {
  Eye,
  Check,
  X,
  Trash2,
  AlertTriangle,
  Clock,
  User,
  FileText,
  MessageSquare,
  ShoppingBag,
  Briefcase,
  Filter,
  Search,
  RefreshCw,
  TrendingUp,
  Shield,
  Flag,
  Bot,
} from "lucide-react";

const ContentModeration = () => {
  const [moderationItems, setModerationItems] = useState<
    ContentModerationItem[]
  >([]);
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] =
    useState<ContentModerationItem | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("pending");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const notification = useNotification();

  useEffect(() => {
    initializeModeration();
  }, []);

  useEffect(() => {
    // Refresh data every 30 seconds
    const interval = setInterval(initializeModeration, 30000);
    return () => clearInterval(interval);
  }, []);

  const initializeModeration = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setIsUsingMockData(false);

      // Get current admin
      const adminData = localStorage.getItem("admin_user");
      if (adminData) {
        setCurrentAdmin(JSON.parse(adminData));
      }

      // Fetch pending moderation items
      const items = await AdminService.getPendingModeration();
      setModerationItems(items);

      // Check if we got mock data (mock items have IDs starting with "mock-")
      if (items.length > 0 && items.some(item => item.id.startsWith("mock-"))) {
        setIsUsingMockData(true);
        notification.info("Using demo data - content moderation database not configured");
      }
    } catch (error) {
      console.error("Error loading moderation data:", error);
      const errorMessage = error instanceof Error
        ? error.message
        : typeof error === 'string'
        ? error
        : "Failed to load moderation queue";
      setError(errorMessage);
      notification.error(`Error fetching pending moderation: ${errorMessage}`);
      
      // Set mock data as fallback
      setModerationItems([
        {
          id: "mock-1",
          contentId: "content-123",
          contentType: "post",
          status: "pending",
          reason: "Inappropriate content",
          description: "User reported this post for containing inappropriate language",
          priority: "medium",
          reportedBy: "user-456",
          autoDetected: false,
          confidence: 0.8,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          reviewedBy: null,
          reviewedAt: null,
          reviewNotes: null,
        },
        {
          id: "mock-2",
          contentId: "content-789",
          contentType: "comment",
          status: "pending",
          reason: "Spam",
          description: "Automated detection flagged this as potential spam",
          priority: "high",
          reportedBy: null,
          autoDetected: true,
          confidence: 0.95,
          createdAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
          reviewedBy: null,
          reviewedAt: null,
          reviewNotes: null,
        },
      ]);
      setIsUsingMockData(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModerateContent = async (
    action: "approve" | "reject" | "remove",
  ) => {
    if (!selectedItem || !currentAdmin) return;

    try {
      await AdminService.moderateContent(
        selectedItem.id,
        action,
        currentAdmin.id,
        reviewNotes,
      );

      notification.success(`Content ${action}d successfully`);
      setShowReviewDialog(false);
      setSelectedItem(null);
      setReviewNotes("");
      initializeModeration();
    } catch (error) {
      console.error("Error moderating content:", error);
      const errorMessage = error instanceof Error
        ? error.message
        : typeof error === 'string'
        ? error
        : "Failed to moderate content";
      notification.error(`Error moderating content: ${errorMessage}`);
    }
  };

  const openReviewDialog = (item: ContentModerationItem) => {
    setSelectedItem(item);
    setShowReviewDialog(true);
    setReviewNotes("");
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500 text-white",
      approved: "bg-green-500 text-white",
      rejected: "bg-red-500 text-white",
      removed: "bg-gray-500 text-white",
      reviewed: "bg-blue-500 text-white",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      urgent: "bg-red-600 text-white",
      high: "bg-orange-500 text-white",
      medium: "bg-yellow-500 text-black",
      low: "bg-green-500 text-white",
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
  };

  const getContentTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      post: <FileText className="w-4 h-4" />,
      comment: <MessageSquare className="w-4 h-4" />,
      product: <ShoppingBag className="w-4 h-4" />,
      job: <Briefcase className="w-4 h-4" />,
    };
    return icons[type] || <FileText className="w-4 h-4" />;
  };

  const filteredItems = moderationItems.filter((item) => {
    if (filterStatus !== "all" && item.status !== filterStatus) return false;
    if (filterType !== "all" && item.contentType !== filterType) return false;
    if (filterPriority !== "all" && item.priority !== filterPriority)
      return false;
    return true;
  });

  const stats = {
    total: moderationItems.length,
    pending: moderationItems.filter((item) => item.status === "pending").length,
    urgent: moderationItems.filter((item) => item.priority === "urgent").length,
    autoDetected: moderationItems.filter((item) => item.autoDetected).length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Loading moderation queue...</p>
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
            Content Moderation
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Review and moderate platform content
          </p>
        </div>

        <Button onClick={initializeModeration} disabled={isLoading}>
          <RefreshCw
            className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh Queue
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="bg-blue-500/10 p-3 rounded-full mb-4">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Items</div>
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
            <div className="bg-red-500/10 p-3 rounded-full mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="text-2xl font-bold">{stats.urgent}</div>
            <div className="text-sm text-gray-600">Urgent Priority</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="bg-purple-500/10 p-3 rounded-full mb-4">
              <Bot className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold">{stats.autoDetected}</div>
            <div className="text-sm text-gray-600">AI Detected</div>
          </CardContent>
        </Card>
      </div>

      {/* Demo Data Alert */}
      {isUsingMockData && (
        <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
          <Bot className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <strong>Demo Mode:</strong> You're viewing demo data. The content moderation database is not configured.
            All moderation actions will be simulated.
          </AlertDescription>
        </Alert>
      )}

      {/* Urgent Items Alert */}
      {stats.urgent > 0 && (
        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            You have {stats.urgent} urgent item(s) that require immediate
            attention.
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
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="removed">Removed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Content Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="post">Posts</SelectItem>
                  <SelectItem value="comment">Comments</SelectItem>
                  <SelectItem value="product">Products</SelectItem>
                  <SelectItem value="job">Job Listings</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Moderation Queue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Moderation Queue ({filteredItems.length})
          </CardTitle>
          <CardDescription>
            Items requiring administrative review and action
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Content</TableHead>
                  <TableHead>Report Details</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reported</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                          {getContentTypeIcon(item.contentType)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {item.contentType}
                            </Badge>
                            {item.autoDetected && (
                              <Badge variant="secondary" className="text-xs">
                                <Bot className="w-3 h-3 mr-1" />
                                AI
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            ID: {item.contentId.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1 max-w-xs">
                        <p className="font-medium text-sm">{item.reason}</p>
                        {item.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                        {item.confidence && (
                          <div className="flex items-center gap-1 text-xs">
                            <span>
                              Confidence: {Math.round(item.confidence * 100)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={`text-xs ${getPriorityColor(item.priority)}`}
                      >
                        {item.priority.toUpperCase()}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={`text-xs ${getStatusColor(item.status)}`}
                      >
                        {item.status.toUpperCase()}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm">
                        <p>{new Date(item.createdAt).toLocaleDateString()}</p>
                        <p className="text-gray-500 text-xs">
                          {new Date(item.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {item.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openReviewDialog(item)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Review
                            </Button>
                          </>
                        )}
                        {item.status !== "pending" && (
                          <Badge variant="secondary" className="text-xs">
                            {item.reviewedBy ? "Reviewed" : "Processed"}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Content</DialogTitle>
            <DialogDescription>
              Review the reported content and take appropriate action.
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-6">
              {/* Content Info */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{selectedItem.contentType}</Badge>
                  <Badge className={getPriorityColor(selectedItem.priority)}>
                    {selectedItem.priority}
                  </Badge>
                  {selectedItem.autoDetected && (
                    <Badge variant="secondary">
                      <Bot className="w-3 h-3 mr-1" />
                      AI Detected
                    </Badge>
                  )}
                </div>

                <div>
                  <p className="font-medium">Report Reason</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedItem.reason}
                  </p>
                </div>

                {selectedItem.description && (
                  <div>
                    <p className="font-medium">Description</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedItem.description}
                    </p>
                  </div>
                )}

                {selectedItem.confidence && (
                  <div>
                    <p className="font-medium">AI Confidence</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {Math.round(selectedItem.confidence * 100)}% confidence
                    </p>
                  </div>
                )}

                <div>
                  <p className="font-medium">Reported</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(selectedItem.createdAt).toLocaleString()}
                  </p>
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
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowReviewDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleModerateContent("approve")}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={() => handleModerateContent("reject")}
                  variant="outline"
                  className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleModerateContent("remove")}
                  variant="destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentModeration;
