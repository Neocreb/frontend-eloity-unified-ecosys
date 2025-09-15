import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatNumber } from "@/utils/formatters";
import { useToast } from "@/hooks/use-toast";
import { chatInitiationService } from "@/services/chatInitiationService";
import {
  Plus,
  Search,
  Users,
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
  SortAsc,
  ArrowLeft,
  MoreHorizontal,
  Star,
  ThumbsUp,
  Share2,
  BookOpen,
  Activity,
} from "lucide-react";

import { groups as mockGroups } from "@/data/mockExploreData";

interface Group {
  id: string;
  name: string;
  members: number;
  category: string;
  cover: string;
  description?: string;
  privacy: "public" | "private";
  isJoined?: boolean;
  isOwner?: boolean;
  isAdmin?: boolean;
  location?: string;
  createdAt?: string;
}

const Groups = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("discover");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("members");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [joinedGroups, setJoinedGroups] = useState<Group[]>([]);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [groupForm, setGroupForm] = useState({
    name: "",
    description: "",
    category: "",
    privacy: "public",
    location: "",
    cover: "",
  });

  // Filter and sort groups
  const filteredGroups = mockGroups
    .filter((group) => {
      const matchesSearch =
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || group.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "members":
          return b.members - a.members;
        case "recent":
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const categories = [
    "Technology",
    "Finance",
    "Travel",
    "Food",
    "Business",
    "Art & Design",
    "Music",
    "Gaming",
    "Sports",
    "Health & Fitness",
    "Education",
    "Lifestyle",
  ];

  const handleCreateGroup = () => {
    if (!groupForm.name || !groupForm.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const newGroup: Group = {
      id: `group-${Date.now()}`,
      name: groupForm.name,
      description: groupForm.description,
      category: groupForm.category,
      privacy: groupForm.privacy as "public" | "private",
      location: groupForm.location,
      cover:
        groupForm.cover ||
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400",
      members: 1,
      isOwner: true,
      createdAt: new Date().toISOString(),
    };

    setMyGroups((prev) => [...prev, newGroup]);
    setGroupForm({
      name: "",
      description: "",
      category: "",
      privacy: "public",
      location: "",
      cover: "",
    });
    setShowCreateDialog(false);

    toast({
      title: "Group Created",
      description: `${newGroup.name} has been created successfully!`,
    });
  };

  const handleJoinGroup = (group: Group) => {
    if (group.isJoined) return;

    const updatedGroup = { ...group, isJoined: true };
    setJoinedGroups((prev) => [...prev, updatedGroup]);

    toast({
      title: "Joined Group",
      description: `You've successfully joined ${group.name}!`,
    });
  };

  const handleLeaveGroup = (groupId: string) => {
    setJoinedGroups((prev) => prev.filter((g) => g.id !== groupId));
    toast({
      title: "Left Group",
      description: "You've left the group successfully",
    });
  };

  const handleViewGroup = (groupId: string) => {
    navigate(`/app/groups/${groupId}`);
  };

  const renderGroupCard = (group: Group, showManageButton = false) => (
    <Card
      key={group.id}
      className="overflow-hidden hover:shadow-lg transition-all duration-200 group cursor-pointer"
      onClick={() => handleViewGroup(group.id)}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={group.cover}
          alt={group.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Status badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {group.privacy === "private" && (
            <Badge
              variant="secondary"
              className="bg-gray-900/80 text-white border-0"
            >
              <Lock className="w-3 h-3 mr-1" />
              Private
            </Badge>
          )}
          {group.isOwner && (
            <Badge
              variant="secondary"
              className="bg-yellow-600/90 text-white border-0"
            >
              <Crown className="w-3 h-3 mr-1" />
              Owner
            </Badge>
          )}
          {group.isAdmin && (
            <Badge
              variant="secondary"
              className="bg-blue-600/90 text-white border-0"
            >
              <Shield className="w-3 h-3 mr-1" />
              Admin
            </Badge>
          )}
        </div>

        {/* Group name overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-bold text-white text-base sm:text-lg mb-1 line-clamp-2">
            {group.name}
          </h3>
          <div className="flex flex-wrap items-center text-white/80 text-xs sm:text-sm gap-1">
            <div className="flex items-center">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="whitespace-nowrap">{formatNumber(group.members)} members</span>
            </div>
            {group.location && (
              <>
                <span className="hidden sm:inline mx-2">•</span>
                <div className="flex items-center min-w-0">
                  <MapPin className="w-3 h-3 sm:w-3 sm:h-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{group.location}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Badge variant="outline" className="text-xs">
                {group.category}
              </Badge>
              {group.privacy === "public" ? (
                <Globe className="w-4 h-4 text-green-500" />
              ) : (
                <Lock className="w-4 h-4 text-gray-500" />
              )}
            </div>

            {group.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {group.description}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2" onClick={(e) => e.stopPropagation()}>
            {!group.isJoined && !group.isOwner ? (
              <Button
                onClick={() => handleJoinGroup(group)}
                className="flex-1 text-xs sm:text-sm h-8 sm:h-9"
                size="sm"
              >
                <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{group.privacy === "private" ? "Request to Join" : "Join Group"}</span>
                <span className="sm:hidden">{group.privacy === "private" ? "Request" : "Join"}</span>
              </Button>
            ) : group.isJoined ? (
              <div className="flex gap-2 flex-1">
                <Button
                  variant="outline"
                  className="flex-1 text-xs sm:text-sm h-8 sm:h-9"
                  onClick={() => handleViewGroup(group.id)}
                  size="sm"
                >
                  <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">View Posts</span>
                  <span className="sm:hidden">View</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleLeaveGroup(group.id)}
                  className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                >
                  <UserMinus className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            ) : group.isOwner ? (
              <Button
                variant="outline"
                className="flex-1 text-xs sm:text-sm h-8 sm:h-9"
                onClick={() => handleViewGroup(group.id)}
                size="sm"
              >
                <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Manage Group</span>
                <span className="sm:hidden">Manage</span>
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const getJoinedGroupsData = () => {
    return [...joinedGroups, ...mockGroups.filter((g) => g.isJoined)];
  };

  const getMyGroupsData = () => {
    return [...myGroups, ...mockGroups.filter((g) => g.isOwner)];
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Groups</h1>
                <p className="text-muted-foreground">
                  Connect with communities that share your interests
                </p>
              </div>
            </div>

            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create Group
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Group</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="groupName">Group Name *</Label>
                    <Input
                      id="groupName"
                      value={groupForm.name}
                      onChange={(e) =>
                        setGroupForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Enter group name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="groupDescription">Description</Label>
                    <Textarea
                      id="groupDescription"
                      value={groupForm.description}
                      onChange={(e) =>
                        setGroupForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Describe your group"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="groupCategory">Category *</Label>
                    <Select
                      value={groupForm.category}
                      onValueChange={(value) =>
                        setGroupForm((prev) => ({ ...prev, category: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="groupPrivacy">Privacy</Label>
                    <Select
                      value={groupForm.privacy}
                      onValueChange={(value) =>
                        setGroupForm((prev) => ({ ...prev, privacy: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">
                          <div className="flex items-center">
                            <Globe className="w-4 h-4 mr-2" />
                            Public - Anyone can join
                          </div>
                        </SelectItem>
                        <SelectItem value="private">
                          <div className="flex items-center">
                            <Lock className="w-4 h-4 mr-2" />
                            Private - Invite only
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="groupLocation">Location (Optional)</Label>
                    <Input
                      id="groupLocation"
                      value={groupForm.location}
                      onChange={(e) =>
                        setGroupForm((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                      placeholder="City, Country"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleCreateGroup} className="flex-1">
                      Create Group
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateDialog(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search groups..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="members">Most Members</SelectItem>
                    <SelectItem value="recent">Recently Created</SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {searchQuery && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Found {filteredGroups.length} groups matching "{searchQuery}"
                </span>
                <Badge variant="secondary">
                  {filteredGroups.length} results
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Group Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="discover" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Discover
            </TabsTrigger>
            <TabsTrigger value="joined" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              My Groups ({getJoinedGroupsData().length})
            </TabsTrigger>
            <TabsTrigger value="owned" className="flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Created ({getMyGroupsData().length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-6">
            {/* Quick stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{mockGroups.length}</p>
                    <p className="text-sm text-muted-foreground">
                      Total Groups
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{categories.length}</p>
                    <p className="text-sm text-muted-foreground">Categories</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Activity className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {mockGroups.filter((g) => g.privacy === "public").length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Public Groups
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Star className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {Math.round(
                        mockGroups.reduce((acc, g) => acc + g.members, 0) /
                          1000,
                      )}
                      K
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Total Members
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {filteredGroups.length > 0 ? (
                filteredGroups.map((group) => renderGroupCard(group))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No groups found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search criteria or browse different
                    categories
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="joined" className="space-y-6">
            {getJoinedGroupsData().length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                {getJoinedGroupsData().map((group) =>
                  renderGroupCard(group, true),
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  You haven't joined any groups yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Explore groups that match your interests and connect with
                  like-minded people
                </p>
                <Button onClick={() => setActiveTab("discover")}>
                  Discover Groups
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="owned" className="space-y-6">
            {getMyGroupsData().length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                {getMyGroupsData().map((group) => renderGroupCard(group, true))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Crown className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  You haven't created any groups yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Start building your own community by creating your first group
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Group
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Groups;
