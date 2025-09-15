import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Shield,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Flag,
  MoreVertical,
  Search,
  Filter,
  Calendar,
  User,
  Image as ImageIcon,
  Ban,
  MessageSquare,
  TrendingUp,
  Clock,
  Star,
  Download,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { 
  StickerPackData, 
  StickerData, 
  StickerReport, 
  StickerCreationRequest 
} from "@/types/sticker";

interface StickerModerationPanelProps {
  className?: string;
}

interface ModerationItem {
  id: string;
  type: "sticker" | "pack" | "creation_request";
  item: StickerData | StickerPackData | StickerCreationRequest;
  reports?: StickerReport[];
  status: "pending" | "approved" | "rejected" | "under_review";
  priority: "low" | "medium" | "high" | "urgent";
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

const MODERATION_FILTERS = [
  { value: "all", label: "All Items" },
  { value: "pending", label: "Pending Review" },
  { value: "reported", label: "Reported Content" },
  { value: "high_priority", label: "High Priority" },
  { value: "my_assigned", label: "Assigned to Me" },
];

const REPORT_REASONS = [
  { value: "inappropriate", label: "Inappropriate Content" },
  { value: "spam", label: "Spam" },
  { value: "copyright", label: "Copyright Violation" },
  { value: "hate_speech", label: "Hate Speech" },
  { value: "violence", label: "Violence" },
  { value: "nudity", label: "Nudity/Sexual Content" },
  { value: "harassment", label: "Harassment" },
  { value: "other", label: "Other" },
];

const MODERATION_ACTIONS = [
  { value: "approve", label: "Approve", icon: CheckCircle, color: "text-green-600" },
  { value: "reject", label: "Reject", icon: XCircle, color: "text-red-600" },
  { value: "request_changes", label: "Request Changes", icon: AlertTriangle, color: "text-yellow-600" },
  { value: "ban_user", label: "Ban User", icon: Ban, color: "text-red-800" },
];

export const StickerModerationPanel: React.FC<StickerModerationPanelProps> = ({
  className,
}) => {
  const { toast } = useToast();
  
  // State
  const [activeTab, setActiveTab] = useState("queue");
  const [moderationItems, setModerationItems] = useState<ModerationItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ModerationItem | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>("");
  const [actionReason, setActionReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Mock data - would be fetched from API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockItems: ModerationItem[] = [
        {
          id: "1",
          type: "creation_request",
          item: {
            id: "req_1",
            userId: "user_1",
            packName: "Nigerian Memes",
            description: "Popular Nigerian meme stickers",
            category: "memes",
            isPublic: true,
            files: [
              {
                id: "f1",
                originalName: "baba_slap.png",
                fileUrl: "/placeholder-sticker.png",
                type: "image/png",
                size: 45000,
                width: 512,
                height: 512,
              },
            ],
            status: "pending",
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
          status: "pending",
          priority: "medium",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "2",
          type: "sticker",
          item: {
            id: "sticker_1",
            name: "Reported Sticker",
            emoji: "🤬",
            fileUrl: "/placeholder-sticker.png",
            packId: "pack_1",
            packName: "Controversial Pack",
            type: "emoji" as const,
            width: 128,
            height: 128,
            fileSize: 0,
            mimeType: "text/emoji",
            usageCount: 25,
            tags: ["angry", "swear"],
            isOriginal: true,
          },
          reports: [
            {
              id: "report_1",
              stickerId: "sticker_1",
              reportedBy: "user_2",
              reason: "inappropriate",
              description: "Contains inappropriate language",
              status: "pending",
              createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            },
          ],
          status: "under_review",
          priority: "high",
          assignedTo: "mod_1",
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        },
      ];
      
      setModerationItems(mockItems);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredItems = moderationItems.filter(item => {
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      if (item.type === "creation_request") {
        const req = item.item as StickerCreationRequest;
        return req.packName.toLowerCase().includes(searchLower);
      }
      // Add other search logic for stickers and packs
    }
    
    if (selectedFilter === "pending") {
      return item.status === "pending";
    }
    if (selectedFilter === "reported") {
      return item.reports && item.reports.length > 0;
    }
    if (selectedFilter === "high_priority") {
      return item.priority === "high" || item.priority === "urgent";
    }
    
    return true;
  });

  const handleViewDetails = (item: ModerationItem) => {
    setSelectedItem(item);
    setShowDetailDialog(true);
  };

  const handleTakeAction = (action: string) => {
    setSelectedAction(action);
    setShowActionDialog(true);
  };

  const executeAction = async () => {
    if (!selectedItem || !selectedAction) return;

    try {
      // API call would go here
      const actionLabel = MODERATION_ACTIONS.find(a => a.value === selectedAction)?.label;
      
      toast({
        title: "Action executed",
        description: `${actionLabel} applied to ${selectedItem.type}`,
      });

      // Update local state
      setModerationItems(prev => 
        prev.map(item => 
          item.id === selectedItem.id
            ? {
                ...item,
                status: selectedAction === "approve" ? "approved" : 
                       selectedAction === "reject" ? "rejected" : item.status,
                updatedAt: new Date().toISOString(),
              }
            : item
        )
      );

      setShowActionDialog(false);
      setShowDetailDialog(false);
      setSelectedItem(null);
      setActionReason("");
    } catch (error) {
      toast({
        title: "Action failed",
        description: "Failed to execute moderation action",
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "under_review": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const renderModerationQueue = () => (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedFilter} onValueChange={setSelectedFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MODERATION_FILTERS.map((filter) => (
              <SelectItem key={filter.value} value={filter.value}>
                {filter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Items list */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-muted rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredItems.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-medium mb-2">No items to review</h3>
              <p className="text-sm text-muted-foreground">
                All caught up! Check back later for new moderation items.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredItems.map((item) => (
            <ModerationItemCard
              key={item.id}
              item={item}
              onViewDetails={() => handleViewDetails(item)}
              onTakeAction={(action) => {
                setSelectedItem(item);
                handleTakeAction(action);
              }}
              getPriorityColor={getPriorityColor}
              getStatusColor={getStatusColor}
            />
          ))
        )}
      </div>
    </div>
  );

  const renderStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Review</p>
              <p className="text-2xl font-semibold">12</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Flag className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Reports</p>
              <p className="text-2xl font-semibold">5</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Approved Today</p>
              <p className="text-2xl font-semibold">28</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Processing Time</p>
              <p className="text-2xl font-semibold">2.4h</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sticker Moderation</h2>
          <p className="text-muted-foreground">
            Review and moderate sticker content
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="queue">Moderation Queue</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          {renderModerationQueue()}
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          {renderStats()}
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="text-center py-8">
            <Flag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Reports management coming soon</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      {selectedItem && (
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedItem.type === "creation_request" ? "Sticker Pack Request" : 
                 selectedItem.type === "sticker" ? "Sticker Review" : "Pack Review"}
              </DialogTitle>
            </DialogHeader>
            
            <ModerationDetailView 
              item={selectedItem}
              onTakeAction={handleTakeAction}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Action Dialog */}
      <AlertDialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {selectedAction} this {selectedItem?.type}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4">
            <Textarea
              placeholder="Reason for action (optional)"
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              rows={3}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeAction}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Individual moderation item card
interface ModerationItemCardProps {
  item: ModerationItem;
  onViewDetails: () => void;
  onTakeAction: (action: string) => void;
  getPriorityColor: (priority: string) => string;
  getStatusColor: (status: string) => string;
}

const ModerationItemCard: React.FC<ModerationItemCardProps> = ({
  item,
  onViewDetails,
  onTakeAction,
  getPriorityColor,
  getStatusColor,
}) => {
  const getItemTitle = () => {
    if (item.type === "creation_request") {
      return (item.item as StickerCreationRequest).packName;
    }
    if (item.type === "sticker") {
      return (item.item as StickerData).name;
    }
    return (item.item as StickerPackData).name;
  };

  const getItemPreview = () => {
    if (item.type === "creation_request") {
      const req = item.item as StickerCreationRequest;
      return req.files[0]?.fileUrl || "/placeholder-sticker.png";
    }
    if (item.type === "sticker") {
      const sticker = item.item as StickerData;
      return sticker.fileUrl || "/placeholder-sticker.png";
    }
    return (item.item as StickerPackData).coverImageUrl || "/placeholder-sticker.png";
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Preview */}
          <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden">
            {item.type === "sticker" && (item.item as StickerData).emoji ? (
              <div className="w-full h-full flex items-center justify-center text-2xl">
                {(item.item as StickerData).emoji}
              </div>
            ) : (
              <img
                src={getItemPreview()}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium truncate">{getItemTitle()}</h3>
              <Badge className={cn("text-xs", getPriorityColor(item.priority))}>
                {item.priority}
              </Badge>
              <Badge className={cn("text-xs", getStatusColor(item.status))}>
                {item.status.replace("_", " ")}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {item.type === "creation_request" ? 
                  (item.item as StickerCreationRequest).userId : 
                  "Unknown"}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(item.createdAt), "MMM d, HH:mm")}
              </span>
              {item.reports && item.reports.length > 0 && (
                <span className="flex items-center gap-1 text-red-600">
                  <Flag className="w-3 h-3" />
                  {item.reports.length} report{item.reports.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onViewDetails}>
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {MODERATION_ACTIONS.map((action) => {
                  const Icon = action.icon;
                  return (
                    <DropdownMenuItem
                      key={action.value}
                      onClick={() => onTakeAction(action.value)}
                      className={action.color}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {action.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Detailed view component
interface ModerationDetailViewProps {
  item: ModerationItem;
  onTakeAction: (action: string) => void;
}

const ModerationDetailView: React.FC<ModerationDetailViewProps> = ({
  item,
  onTakeAction,
}) => {
  const renderCreationRequest = (request: StickerCreationRequest) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium mb-2">Pack Details</h4>
          <div className="space-y-2 text-sm">
            <p><strong>Name:</strong> {request.packName}</p>
            <p><strong>Category:</strong> {request.category}</p>
            <p><strong>Public:</strong> {request.isPublic ? "Yes" : "No"}</p>
            <p><strong>Files:</strong> {request.files.length}</p>
          </div>
        </div>
        <div>
          <h4 className="font-medium mb-2">Files Preview</h4>
          <div className="grid grid-cols-3 gap-2">
            {request.files.slice(0, 6).map((file) => (
              <div key={file.id} className="aspect-square bg-muted rounded border">
                <img
                  src={file.fileUrl}
                  alt={file.originalName}
                  className="w-full h-full object-cover rounded"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {request.description && (
        <div>
          <h4 className="font-medium mb-2">Description</h4>
          <p className="text-sm text-muted-foreground">{request.description}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {item.type === "creation_request" && 
        renderCreationRequest(item.item as StickerCreationRequest)}
      
      {/* Reports */}
      {item.reports && item.reports.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Reports ({item.reports.length})</h4>
          <div className="space-y-2">
            {item.reports.map((report) => (
              <Card key={report.id}>
                <CardContent className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline">
                      {REPORT_REASONS.find(r => r.value === report.reason)?.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(report.createdAt), "MMM d, HH:mm")}
                    </span>
                  </div>
                  {report.description && (
                    <p className="text-sm">{report.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 pt-4 border-t">
        {MODERATION_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.value}
              variant={action.value === "approve" ? "default" : "outline"}
              onClick={() => onTakeAction(action.value)}
              className={action.value !== "approve" ? action.color : ""}
            >
              <Icon className="w-4 h-4 mr-2" />
              {action.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default StickerModerationPanel;
