import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { formatNumber } from "@/utils/formatters";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Building,
  Crown,
  Shield,
  Lock,
  Globe,
  MapPin,
  Calendar,
  TrendingUp,
  MessageSquare,
  UserPlus,
  UserMinus,
  Settings,
  Eye,
  Filter,
  Search,
  MoreHorizontal,
  Star,
  ThumbsUp,
  Share2,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  FileText,
  Flag,
  Clock,
  Verified,
  Activity,
  Download,
  Upload,
  RefreshCw,
  Mail,
  Phone,
  ExternalLink,
  Heart,
  Briefcase,
} from "lucide-react";

interface Group {
  id: string;
  name: string;
  members: number;
  category: string;
  cover: string;
  description?: string;
  privacy: "public" | "private";
  isActive: boolean;
  createdAt: string;
  ownerName: string;
  reportCount: number;
  status: "active" | "suspended" | "under_review";
  posts: number;
  engagement: number;
}

interface Page {
  id: string;
  name: string;
  followers: number;
  category: string;
  verified: boolean;
  avatar: string;
  description?: string;
  pageType: "business" | "brand" | "public_figure" | "community" | "organization";
  isActive: boolean;
  createdAt: string;
  ownerName: string;
  reportCount: number;
  status: "active" | "suspended" | "under_review" | "pending_verification";
  posts: number;
  engagement: number;
  website?: string;
  location?: string;
}

interface AdminAction {
  id: string;
  type: "group" | "page";
  targetId: string;
  targetName: string;
  action: "suspend" | "activate" | "delete" | "verify" | "warn";
  reason: string;
  timestamp: string;
  adminName: string;
}

const GroupsAndPagesAdmin = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("groups");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionType, setActionType] = useState<string>("");
  const [actionReason, setActionReason] = useState("");

  // Mock data
  const [groups, setGroups] = useState<Group[]>([
    {
      id: "1",
      name: "Web3 Developers Community",
      members: 15420,
      category: "Technology",
      cover: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400",
      description: "A vibrant community of Web3 developers",
      privacy: "public",
      isActive: true,
      createdAt: "2023-01-15",
      ownerName: "Alex Chen",
      reportCount: 0,
      status: "active",
      posts: 456,
      engagement: 87
    },
    {
      id: "2",
      name: "Crypto Trading Hub",
      members: 8340,
      category: "Finance",
      cover: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400",
      description: "Cryptocurrency trading strategies",
      privacy: "public",
      isActive: false,
      createdAt: "2023-02-20",
      ownerName: "Sarah Kim",
      reportCount: 5,
      status: "under_review",
      posts: 234,
      engagement: 65
    }
  ]);

  const [pages, setPages] = useState<Page[]>([
    {
      id: "1",
      name: "TechCorp Innovation Hub",
      followers: 125420,
      category: "Technology",
      verified: true,
      avatar: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200",
      description: "Leading technology solutions provider",
      pageType: "business",
      isActive: true,
      createdAt: "2020-03-15",
      ownerName: "TechCorp Team",
      reportCount: 0,
      status: "active",
      posts: 567,
      engagement: 92,
      website: "https://techcorp.com",
      location: "San Francisco, CA"
    },
    {
      id: "2",
      name: "Digital Marketing Hub",
      followers: 18340,
      category: "Marketing",
      verified: false,
      avatar: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=100",
      description: "Digital marketing tips and strategies",
      pageType: "brand",
      isActive: true,
      createdAt: "2021-05-10",
      ownerName: "Marketing Pro",
      reportCount: 2,
      status: "pending_verification",
      posts: 189,
      engagement: 78
    }
  ]);

  const [adminActions, setAdminActions] = useState<AdminAction[]>([
    {
      id: "1",
      type: "group",
      targetId: "2",
      targetName: "Crypto Trading Hub",
      action: "suspend",
      reason: "Multiple reports of spam content",
      timestamp: "2024-01-15T10:30:00Z",
      adminName: "Admin User"
    }
  ]);

  const handleAdminAction = (type: "group" | "page", target: Group | Page, action: string) => {
    if (!actionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for this action",
        variant: "destructive"
      });
      return;
    }

    const newAction: AdminAction = {
      id: Date.now().toString(),
      type,
      targetId: target.id,
      targetName: target.name,
      action: action as any,
      reason: actionReason,
      timestamp: new Date().toISOString(),
      adminName: "Current Admin"
    };

    setAdminActions(prev => [newAction, ...prev]);

    // Update the target status
    if (type === "group") {
      setGroups(prev => prev.map(g => 
        g.id === target.id 
          ? { 
              ...g, 
              status: action === "activate" ? "active" : 
                     action === "suspend" ? "suspended" : g.status,
              isActive: action === "activate" ? true : action === "suspend" ? false : g.isActive
            }
          : g
      ));
    } else {
      setPages(prev => prev.map(p => 
        p.id === target.id 
          ? { 
              ...p, 
              status: action === "activate" ? "active" : 
                     action === "suspend" ? "suspended" :
                     action === "verify" ? "active" : p.status,
              verified: action === "verify" ? true : p.verified,
              isActive: action === "activate" ? true : action === "suspend" ? false : p.isActive
            }
          : p
      ));
    }

    setShowActionDialog(false);
    setActionReason("");
    setSelectedGroup(null);
    setSelectedPage(null);

    toast({
      title: "Action Completed",
      description: `${action} action has been applied to ${target.name}`
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "suspended": return "bg-red-100 text-red-800";
      case "under_review": return "bg-yellow-100 text-yellow-800";
      case "pending_verification": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || group.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredPages = pages.filter(page => {
    const matchesSearch = page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         page.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || page.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const renderGroupCard = (group: Group) => (
    <Card key={group.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="relative">
            <img
              src={group.cover}
              alt={group.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
            {group.privacy === "private" && (
              <Lock className="absolute -top-1 -right-1 w-4 h-4 text-gray-600 bg-white rounded-full p-0.5" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-lg">{group.name}</h3>
                <p className="text-sm text-muted-foreground">
                  By {group.ownerName} • {group.category}
                </p>
              </div>
              <Badge className={getStatusColor(group.status)}>
                {group.status.replace('_', ' ')}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>{formatNumber(group.members)} members</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <span>{group.posts} posts</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{new Date(group.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Flag className={`w-4 h-4 ${group.reportCount > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
                <span>{group.reportCount} reports</span>
              </div>
            </div>

            {group.description && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {group.description}
              </p>
            )}

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedGroup(group);
                  setActionType("view");
                  setShowActionDialog(true);
                }}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
              
              {group.status === "active" ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedGroup(group);
                    setActionType("suspend");
                    setShowActionDialog(true);
                  }}
                >
                  <Ban className="w-4 h-4 mr-2" />
                  Suspend
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedGroup(group);
                    setActionType("activate");
                    setShowActionDialog(true);
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Activate
                </Button>
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedGroup(group);
                  setActionType("delete");
                  setShowActionDialog(true);
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderPageCard = (page: Page) => (
    <Card key={page.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="h-16 w-16">
              <AvatarImage src={page.avatar} alt={page.name} />
              <AvatarFallback>{page.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            {page.verified && (
              <Verified className="absolute -bottom-1 -right-1 w-5 h-5 text-blue-500 bg-white rounded-full" fill="currentColor" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-lg">{page.name}</h3>
                <p className="text-sm text-muted-foreground">
                  By {page.ownerName} • {page.category}
                </p>
              </div>
              <Badge className={getStatusColor(page.status)}>
                {page.status.replace('_', ' ')}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>{formatNumber(page.followers)} followers</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <span>{page.posts} posts</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{new Date(page.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Flag className={`w-4 h-4 ${page.reportCount > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
                <span>{page.reportCount} reports</span>
              </div>
            </div>

            {page.description && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {page.description}
              </p>
            )}

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedPage(page);
                  setActionType("view");
                  setShowActionDialog(true);
                }}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
              
              {!page.verified && page.status === "pending_verification" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedPage(page);
                    setActionType("verify");
                    setShowActionDialog(true);
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verify
                </Button>
              )}

              {page.status === "active" ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedPage(page);
                    setActionType("suspend");
                    setShowActionDialog(true);
                  }}
                >
                  <Ban className="w-4 h-4 mr-2" />
                  Suspend
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedPage(page);
                    setActionType("activate");
                    setShowActionDialog(true);
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Activate
                </Button>
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedPage(page);
                  setActionType("delete");
                  setShowActionDialog(true);
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Groups & Pages Management</h1>
        <p className="text-muted-foreground">
          Manage groups, pages, and community content across the platform
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{groups.length}</p>
              <p className="text-sm text-muted-foreground">Total Groups</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Building className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pages.length}</p>
              <p className="text-sm text-muted-foreground">Total Pages</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {[...groups, ...pages].filter(item => item.reportCount > 0).length}
              </p>
              <p className="text-sm text-muted-foreground">Reported Items</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{adminActions.length}</p>
              <p className="text-sm text-muted-foreground">Admin Actions</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="actions">Admin Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Groups List */}
          <div className="space-y-4">
            {filteredGroups.map(renderGroupCard)}
          </div>
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="pending_verification">Pending Verification</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Pages List */}
          <div className="space-y-4">
            {filteredPages.map(renderPageCard)}
          </div>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Admin Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adminActions.map((action) => (
                  <div key={action.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={action.action === "suspend" ? "destructive" : "default"}>
                          {action.action}
                        </Badge>
                        <span className="font-medium">{action.targetName}</span>
                        <span className="text-sm text-muted-foreground">({action.type})</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{action.reason}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        By {action.adminName} on {new Date(action.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {actionType === "view" ? "View Details" : 
               actionType === "delete" ? "Delete Confirmation" : 
               `${actionType.charAt(0).toUpperCase() + actionType.slice(1)} ${selectedGroup ? "Group" : "Page"}`}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {actionType === "view" ? (
              <div className="space-y-4">
                {selectedGroup && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3">{selectedGroup.name}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Owner</Label>
                        <p className="text-sm">{selectedGroup.ownerName}</p>
                      </div>
                      <div>
                        <Label>Members</Label>
                        <p className="text-sm">{formatNumber(selectedGroup.members)}</p>
                      </div>
                      <div>
                        <Label>Posts</Label>
                        <p className="text-sm">{selectedGroup.posts}</p>
                      </div>
                      <div>
                        <Label>Engagement</Label>
                        <p className="text-sm">{selectedGroup.engagement}%</p>
                      </div>
                      <div>
                        <Label>Created</Label>
                        <p className="text-sm">{new Date(selectedGroup.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <Label>Reports</Label>
                        <p className="text-sm">{selectedGroup.reportCount}</p>
                      </div>
                    </div>
                    {selectedGroup.description && (
                      <div className="mt-4">
                        <Label>Description</Label>
                        <p className="text-sm mt-1">{selectedGroup.description}</p>
                      </div>
                    )}
                  </div>
                )}
                
                {selectedPage && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3">{selectedPage.name}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Owner</Label>
                        <p className="text-sm">{selectedPage.ownerName}</p>
                      </div>
                      <div>
                        <Label>Followers</Label>
                        <p className="text-sm">{formatNumber(selectedPage.followers)}</p>
                      </div>
                      <div>
                        <Label>Posts</Label>
                        <p className="text-sm">{selectedPage.posts}</p>
                      </div>
                      <div>
                        <Label>Engagement</Label>
                        <p className="text-sm">{selectedPage.engagement}%</p>
                      </div>
                      <div>
                        <Label>Created</Label>
                        <p className="text-sm">{new Date(selectedPage.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <Label>Reports</Label>
                        <p className="text-sm">{selectedPage.reportCount}</p>
                      </div>
                    </div>
                    {selectedPage.description && (
                      <div className="mt-4">
                        <Label>Description</Label>
                        <p className="text-sm mt-1">{selectedPage.description}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : actionType === "delete" ? (
              <div className="text-center py-4">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Are you sure?</h3>
                <p className="text-muted-foreground mb-4">
                  This action cannot be undone. This will permanently delete the {selectedGroup ? "group" : "page"} and all associated data.
                </p>
                <div>
                  <Label htmlFor="deleteReason">Reason for deletion *</Label>
                  <Textarea
                    id="deleteReason"
                    placeholder="Provide a reason for this action..."
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
            ) : (
              <div>
                <p className="mb-4">
                  You are about to {actionType} this {selectedGroup ? "group" : "page"}. Please provide a reason for this action.
                </p>
                <div>
                  <Label htmlFor="actionReason">Reason *</Label>
                  <Textarea
                    id="actionReason"
                    placeholder="Provide a reason for this action..."
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2">
              {actionType === "view" ? (
                <Button onClick={() => setShowActionDialog(false)} className="flex-1">
                  Close
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setShowActionDialog(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant={actionType === "delete" ? "destructive" : "default"}
                    onClick={() => {
                      if (selectedGroup) {
                        handleAdminAction("group", selectedGroup, actionType);
                      } else if (selectedPage) {
                        handleAdminAction("page", selectedPage, actionType);
                      }
                    }}
                    className="flex-1"
                  >
                    Confirm {actionType}
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GroupsAndPagesAdmin;
