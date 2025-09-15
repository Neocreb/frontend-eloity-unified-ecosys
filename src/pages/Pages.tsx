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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatNumber } from "@/utils/formatters";
import { useToast } from "@/hooks/use-toast";
import { chatInitiationService } from "@/services/chatInitiationService";
import {
  Plus,
  Search,
  Building,
  Crown,
  Verified,
  Globe,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  TrendingUp,
  MessageSquare,
  UserPlus,
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
  BarChart3,
  Heart,
  Users,
  Briefcase,
  Calendar,
  Image as ImageIcon,
} from "lucide-react";

import { pages as mockPages } from "@/data/mockExploreData";

interface Page {
  id: string;
  name: string;
  followers: number;
  category: string;
  verified: boolean;
  avatar: string;
  description?: string;
  pageType:
    | "business"
    | "brand"
    | "public_figure"
    | "community"
    | "organization";
  isFollowing?: boolean;
  isOwner?: boolean;
  website?: string;
  location?: string;
  email?: string;
  phone?: string;
  createdAt?: string;
  posts?: number;
  engagement?: number;
}

const Pages = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("discover");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [sortBy, setSortBy] = useState("followers");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [followedPages, setFollowedPages] = useState<Page[]>([]);
  const [myPages, setMyPages] = useState<Page[]>([]);
  const [pageForm, setPageForm] = useState({
    name: "",
    description: "",
    category: "",
    pageType: "business",
    website: "",
    location: "",
    email: "",
    phone: "",
    avatar: "",
  });

  // Filter and sort pages
  const filteredPages = mockPages
    .filter((page) => {
      const matchesSearch =
        page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || page.category === selectedCategory;
      const matchesType =
        selectedType === "all" || page.pageType === selectedType;
      return matchesSearch && matchesCategory && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "followers":
          return b.followers - a.followers;
        case "recent":
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
        case "name":
          return a.name.localeCompare(b.name);
        case "verified":
          return (b.verified ? 1 : 0) - (a.verified ? 1 : 0);
        default:
          return 0;
      }
    });

  const categories = [
    "Technology",
    "Business",
    "Marketing",
    "Finance",
    "Healthcare",
    "Education",
    "Entertainment",
    "Sports",
    "Food & Beverage",
    "Fashion",
    "Media",
    "Automotive",
    "Science",
    "Local Business",
    "Celebrity Chef",
    "Non-Profit",
  ];

  const pageTypes = [
    { value: "business", label: "Business", icon: Building },
    { value: "brand", label: "Brand", icon: Star },
    { value: "public_figure", label: "Public Figure", icon: Users },
    { value: "community", label: "Community", icon: Heart },
    { value: "organization", label: "Organization", icon: Briefcase },
  ];

  const handleCreatePage = () => {
    if (!pageForm.name || !pageForm.category || !pageForm.pageType) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const newPage: Page = {
      id: `page-${Date.now()}`,
      name: pageForm.name,
      description: pageForm.description,
      category: pageForm.category,
      pageType: pageForm.pageType as any,
      website: pageForm.website,
      location: pageForm.location,
      email: pageForm.email,
      phone: pageForm.phone,
      avatar:
        pageForm.avatar ||
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100",
      followers: 0,
      verified: false,
      isOwner: true,
      posts: 0,
      engagement: 0,
      createdAt: new Date().toISOString(),
    };

    setMyPages((prev) => [...prev, newPage]);
    setPageForm({
      name: "",
      description: "",
      category: "",
      pageType: "business",
      website: "",
      location: "",
      email: "",
      phone: "",
      avatar: "",
    });
    setShowCreateDialog(false);

    toast({
      title: "Page Created",
      description: `${newPage.name} has been created successfully!`,
    });
  };

  const handleFollowPage = (page: Page) => {
    if (page.isFollowing) return;

    const updatedPage = { ...page, isFollowing: true };
    setFollowedPages((prev) => [...prev, updatedPage]);

    toast({
      title: "Following Page",
      description: `You're now following ${page.name}!`,
    });
  };

  const handleUnfollowPage = (pageId: string) => {
    setFollowedPages((prev) => prev.filter((p) => p.id !== pageId));
    toast({
      title: "Unfollowed Page",
      description: "You've unfollowed the page successfully",
    });
  };

  const handleViewPage = (pageId: string) => {
    navigate(`/app/pages/${pageId}`);
  };

  const getPageTypeIcon = (type: string) => {
    const pageType = pageTypes.find((pt) => pt.value === type);
    return pageType ? pageType.icon : Building;
  };

  const renderPageCard = (page: Page, showManageButton = false) => {
    const PageTypeIcon = getPageTypeIcon(page.pageType);

    return (
      <Card
        key={page.id}
        className="hover:shadow-lg transition-all duration-200 group overflow-hidden cursor-pointer"
        onClick={() => handleViewPage(page.id)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16 border-2 border-gray-100">
                <AvatarImage src={page.avatar} alt={page.name} />
                <AvatarFallback className="text-lg font-bold">
                  {page.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {page.verified && (
                <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-1 border-2 border-white">
                  <Verified className="h-3 w-3" fill="currentColor" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg truncate group-hover:text-blue-600 transition-colors">
                      {page.name}
                    </h3>
                    {page.verified && (
                      <Verified
                        className="h-5 w-5 text-blue-500"
                        fill="currentColor"
                      />
                    )}
                    {page.isOwner && (
                      <Badge
                        variant="outline"
                        className="bg-yellow-50 text-yellow-700 border-yellow-200"
                      >
                        <Crown className="w-3 h-3 mr-1" />
                        Owner
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <PageTypeIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="truncate">{page.category}</span>
                    </div>
                    {page.location && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <div className="flex items-center gap-1 min-w-0">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate text-xs">{page.location}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="font-medium whitespace-nowrap">
                        {formatNumber(page.followers)} followers
                      </span>
                    </div>
                    {page.posts !== undefined && (
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="whitespace-nowrap">{formatNumber(page.posts)} posts</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {page.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {page.description}
            </p>
          )}

          {/* Contact info */}
          <div className="space-y-2 mb-4">
            {page.website && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ExternalLink className="w-4 h-4" />
                <a
                  href={page.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline truncate"
                  onClick={(e) => e.stopPropagation()}
                >
                  {page.website.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}
            {page.email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span className="truncate">{page.email}</span>
              </div>
            )}
            {page.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{page.phone}</span>
              </div>
            )}
          </div>

          {/* Engagement stats for owned pages */}
          {page.isOwner && page.engagement !== undefined && (
            <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {page.engagement}%
                </div>
                <div className="text-xs text-muted-foreground">Engagement</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {page.posts
                    ? Math.round((page.posts * (page.engagement || 0)) / 100)
                    : 0}
                </div>
                <div className="text-xs text-muted-foreground">Avg. Likes</div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2" onClick={(e) => e.stopPropagation()}>
            <div className="flex gap-2 flex-1">
              {!page.isFollowing && !page.isOwner ? (
                <Button
                  onClick={() => handleFollowPage(page)}
                  className="flex-1 h-8 sm:h-9 text-xs sm:text-sm"
                  size="sm"
                >
                  <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Follow
                </Button>
              ) : page.isFollowing ? (
                <>
                  <Button
                    variant="outline"
                    className="flex-1 h-8 sm:h-9 text-xs sm:text-sm"
                    onClick={() => handleViewPage(page.id)}
                    size="sm"
                  >
                    <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">View Page</span>
                    <span className="sm:hidden">View</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleUnfollowPage(page.id)}
                    className="h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3"
                    size="sm"
                  >
                    <span className="hidden sm:inline">Following</span>
                    <span className="sm:hidden">✓</span>
                  </Button>
                </>
              ) : page.isOwner ? (
                <>
                  <Button
                    variant="outline"
                    className="flex-1 h-8 sm:h-9 text-xs sm:text-sm"
                    onClick={() => handleViewPage(page.id)}
                    size="sm"
                  >
                    <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Manage Page</span>
                    <span className="sm:hidden">Manage</span>
                  </Button>
                  <Button variant="outline" className="h-8 w-8 sm:h-9 sm:w-9 p-0" size="sm">
                    <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </>
              ) : null}
            </div>

            <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-9 sm:w-9 p-0 flex-shrink-0">
              <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const getFollowedPagesData = () => {
    return [...followedPages, ...mockPages.filter((p) => p.isFollowing)];
  };

  const getMyPagesData = () => {
    return [...myPages, ...mockPages.filter((p) => p.isOwner)];
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
                <h1 className="text-3xl font-bold">Pages</h1>
                <p className="text-muted-foreground">
                  Discover and follow pages from businesses, brands, and public
                  figures
                </p>
              </div>
            </div>

            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create Page
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Page</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="pageName">Page Name *</Label>
                    <Input
                      id="pageName"
                      value={pageForm.name}
                      onChange={(e) =>
                        setPageForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Enter page name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="pageType">Page Type *</Label>
                    <Select
                      value={pageForm.pageType}
                      onValueChange={(value) =>
                        setPageForm((prev) => ({ ...prev, pageType: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select page type" />
                      </SelectTrigger>
                      <SelectContent>
                        {pageTypes.map((type) => {
                          const Icon = type.icon;
                          return (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center">
                                <Icon className="w-4 h-4 mr-2" />
                                {type.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="pageCategory">Category *</Label>
                    <Select
                      value={pageForm.category}
                      onValueChange={(value) =>
                        setPageForm((prev) => ({ ...prev, category: value }))
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
                    <Label htmlFor="pageDescription">Description</Label>
                    <Textarea
                      id="pageDescription"
                      value={pageForm.description}
                      onChange={(e) =>
                        setPageForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Describe your page"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pageWebsite">Website</Label>
                      <Input
                        id="pageWebsite"
                        value={pageForm.website}
                        onChange={(e) =>
                          setPageForm((prev) => ({
                            ...prev,
                            website: e.target.value,
                          }))
                        }
                        placeholder="https://example.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="pageLocation">Location</Label>
                      <Input
                        id="pageLocation"
                        value={pageForm.location}
                        onChange={(e) =>
                          setPageForm((prev) => ({
                            ...prev,
                            location: e.target.value,
                          }))
                        }
                        placeholder="City, Country"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="pageEmail">Contact Email</Label>
                    <Input
                      id="pageEmail"
                      type="email"
                      value={pageForm.email}
                      onChange={(e) =>
                        setPageForm((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      placeholder="contact@example.com"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleCreatePage} className="flex-1">
                      Create Page
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
                  placeholder="Search pages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-full">
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

                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {pageTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="followers">Most Followers</SelectItem>
                    <SelectItem value="verified">Verified First</SelectItem>
                    <SelectItem value="recent">Recently Created</SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {searchQuery && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Found {filteredPages.length} pages matching "{searchQuery}"
                </span>
                <Badge variant="secondary">
                  {filteredPages.length} results
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Page Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="discover" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Discover
            </TabsTrigger>
            <TabsTrigger value="following" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Following ({getFollowedPagesData().length})
            </TabsTrigger>
            <TabsTrigger value="owned" className="flex items-center gap-2">
              <Crown className="w-4 h-4" />
              My Pages ({getMyPagesData().length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-6">
            {/* Quick stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{mockPages.length}</p>
                    <p className="text-sm text-muted-foreground">Total Pages</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Verified className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {mockPages.filter((p) => p.verified).length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Verified Pages
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{categories.length}</p>
                    <p className="text-sm text-muted-foreground">Categories</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Users className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {Math.round(
                        mockPages.reduce((acc, p) => acc + p.followers, 0) /
                          1000000,
                      )}
                      M
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Total Followers
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {filteredPages.length > 0 ? (
                filteredPages.map((page) => renderPageCard(page))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Building className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No pages found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search criteria or browse different
                    categories
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                      setSelectedType("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="following" className="space-y-6">
            {getFollowedPagesData().length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                {getFollowedPagesData().map((page) =>
                  renderPageCard(page, false),
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  You're not following any pages yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Discover interesting pages from businesses, brands, and public
                  figures
                </p>
                <Button onClick={() => setActiveTab("discover")}>
                  Discover Pages
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="owned" className="space-y-6">
            {getMyPagesData().length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                {getMyPagesData().map((page) => renderPageCard(page, true))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Crown className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  You haven't created any pages yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Create a page to represent your business, brand, or public
                  presence
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Page
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Pages;
