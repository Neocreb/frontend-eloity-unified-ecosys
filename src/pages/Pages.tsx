import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatNumber } from "@/utils/formatters";
import { useToast } from "@/hooks/use-toast";
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
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Page {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  follower_count: number;
  is_verified: boolean;
  privacy: string;
  creator_id: string;
  created_at: string;
  updated_at: string;
  isFollowing?: boolean;
  isOwner?: boolean;
}

const Badge: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <span
    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
      className || "border-gray-300 text-gray-700"
    }`}
  >
    {children}
  </span>
);

const Pages: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("discover");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("followers");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [followedPages, setFollowedPages] = useState<Page[]>([]);
  const [myPages, setMyPages] = useState<Page[]>([]);
  const [allPages, setAllPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [userFollowedPageIds, setUserFollowedPageIds] = useState<string[]>([]);
  const [pageForm, setPageForm] = useState({
    name: "",
    description: "",
    category: "",
    avatar_url: "",
    cover_url: "",
    privacy: "public",
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
    "Travel",
    "Food & Beverage",
  ];

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      // Fetch all public pages
      const { data: pages, error: pagesError } = await supabase
        .from("pages")
        .select("*")
        .eq("privacy", "public")
        .order("follower_count", { ascending: false });

      if (pagesError) {
        console.error("Error loading pages:", pagesError);
        toast({
          title: "Error",
          description: "Failed to load pages",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Fetch user's page follows
      const { data: followData, error: followError } = await supabase
        .from("page_followers")
        .select("page_id")
        .eq("user_id", user.id);

      if (followError) {
        console.error("Error loading follows:", followError);
      }

      const followedPageIds = followData?.map((f) => f.page_id) || [];
      setUserFollowedPageIds(followedPageIds);

      const enrichedPages = (pages || []).map((page) => ({
        ...page,
        isFollowing: followedPageIds.includes(page.id),
        isOwner: page.creator_id === user.id,
      }));

      setAllPages(enrichedPages);
      setFollowedPages(enrichedPages.filter((p) => p.isFollowing));
      setMyPages(enrichedPages.filter((p) => p.isOwner));
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load pages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPages = allPages
    .filter((page) => {
      const matchesSearch =
        page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (page.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
      const matchesCategory =
        selectedCategory === "all" ||
        (page.category?.toLowerCase() === selectedCategory.toLowerCase() || false);
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "followers":
          return b.follower_count - a.follower_count;
        case "recent":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "name":
          return a.name.localeCompare(b.name);
        case "verified":
          return (b.is_verified ? 1 : 0) - (a.is_verified ? 1 : 0);
        default:
          return 0;
      }
    });

  const handleCreatePage = async () => {
    if (!pageForm.name || !user?.id) {
      toast({
        title: "Error",
        description: "Page name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: newPage, error } = await supabase
        .from("pages")
        .insert({
          name: pageForm.name,
          description: pageForm.description || null,
          category: pageForm.category || null,
          avatar_url: pageForm.avatar_url || null,
          cover_url: pageForm.cover_url || null,
          privacy: pageForm.privacy,
          creator_id: user.id,
          follower_count: 0,
          is_verified: false,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setMyPages((prev) => [
        { ...newPage, isOwner: true, isFollowing: false },
        ...prev,
      ]);
      setAllPages((prev) => [
        { ...newPage, isOwner: true, isFollowing: false },
        ...prev,
      ]);
      setPageForm({
        name: "",
        description: "",
        category: "",
        avatar_url: "",
        cover_url: "",
        privacy: "public",
      });
      setShowCreateDialog(false);
      toast({
        title: "Success",
        description: `Page "${newPage.name}" created successfully!`,
      });
    } catch (error) {
      console.error("Error creating page:", error);
      toast({
        title: "Error",
        description: "Failed to create page",
        variant: "destructive",
      });
    }
  };

  const handleFollowPage = async (pageId: string) => {
    if (!user?.id) return;
    try {
      await supabase.from("page_followers").insert({
        page_id: pageId,
        user_id: user.id,
      });

      const updatedPages = allPages.map((p) =>
        p.id === pageId
          ? {
              ...p,
              isFollowing: true,
              follower_count: p.follower_count + 1,
            }
          : p
      );

      setAllPages(updatedPages);
      setFollowedPages(updatedPages.filter((p) => p.isFollowing));

      toast({
        title: "Success",
        description: "You're now following this page!",
      });
    } catch (error) {
      console.error("Error following page:", error);
      toast({
        title: "Error",
        description: "Failed to follow page",
        variant: "destructive",
      });
    }
  };

  const handleUnfollowPage = async (pageId: string) => {
    if (!user?.id) return;
    try {
      await supabase
        .from("page_followers")
        .delete()
        .eq("page_id", pageId)
        .eq("user_id", user.id);

      const updatedPages = allPages.map((p) =>
        p.id === pageId
          ? {
              ...p,
              isFollowing: false,
              follower_count: Math.max(0, p.follower_count - 1),
            }
          : p
      );

      setAllPages(updatedPages);
      setFollowedPages(updatedPages.filter((p) => p.isFollowing));

      toast({
        title: "Success",
        description: "You've unfollowed this page",
      });
    } catch (error) {
      console.error("Error unfollowing page:", error);
      toast({
        title: "Error",
        description: "Failed to unfollow page",
        variant: "destructive",
      });
    }
  };

  const handleViewPage = (pageId: string) => {
    navigate(`/app/pages/${pageId}`);
  };

  const renderPageCard = (page: Page) => (
    <Card
      key={page.id}
      className="hover:shadow-lg transition duration-200 cursor-pointer"
      onClick={() => handleViewPage(page.id)}
    >
      <CardContent className="flex flex-col gap-4 p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={page.avatar_url || ""} alt={page.name} />
            <AvatarFallback>{page.name?.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold truncate text-lg">{page.name}</h3>
              {page.is_verified && (
                <Verified className="w-4 h-4 text-blue-600 flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {page.description}
            </p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
              <span>{formatNumber(page.follower_count)} followers</span>
              {page.category && <span>• {page.category}</span>}
            </div>
          </div>
        </div>

        <div onClick={(e) => e.stopPropagation()}>
          {page.isFollowing ? (
            <Button
              variant="outline"
              className="w-full"
              size="sm"
              onClick={() => handleUnfollowPage(page.id)}
            >
              Following
            </Button>
          ) : page.isOwner ? (
            <Button
              variant="outline"
              className="w-full"
              size="sm"
              onClick={() => handleViewPage(page.id)}
            >
              Manage
            </Button>
          ) : (
            <Button
              className="w-full"
              size="sm"
              onClick={() => handleFollowPage(page.id)}
            >
              Follow
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Pages</h1>
              <p className="text-muted-foreground">
                Discover and follow pages from businesses, brands, and public figures
              </p>
            </div>
          </div>
          {user && (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Create Page
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Page</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="pageName">Page Name *</Label>
                    <Input
                      id="pageName"
                      value={pageForm.name}
                      onChange={(e) =>
                        setPageForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="Enter page name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pageCategory">Category</Label>
                    <Select
                      value={pageForm.category}
                      onValueChange={(v) =>
                        setPageForm((prev) => ({ ...prev, category: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
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
                      rows={3}
                      placeholder="Describe your page"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pagePrivacy">Privacy</Label>
                    <Select
                      value={pageForm.privacy}
                      onValueChange={(v) =>
                        setPageForm((prev) => ({ ...prev, privacy: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select privacy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
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
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Left filters */}
            <aside className="md:col-span-1 sticky top-24">
              <div className="bg-card p-4 rounded-lg shadow-sm space-y-4">
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search pages..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Categories" />
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
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="followers">Most Followers</SelectItem>
                      <SelectItem value="recent">Recently Created</SelectItem>
                      <SelectItem value="name">Name A-Z</SelectItem>
                      <SelectItem value="verified">Verified First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-card p-4 rounded-lg shadow-sm space-y-3 mt-4">
                <div className="flex items-center gap-3 pb-3 border-b">
                  <Building className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{allPages.length}</p>
                    <p className="text-xs text-muted-foreground">
                      Total Pages
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{followedPages.length}</p>
                    <p className="text-xs text-muted-foreground">
                      Following
                    </p>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main */}
            <main className="md:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="discover" className="text-xs sm:text-sm">
                    <Eye className="w-4 h-4 mr-1 hidden sm:inline" />
                    Discover
                  </TabsTrigger>
                  <TabsTrigger value="following" className="text-xs sm:text-sm">
                    <UserPlus className="w-4 h-4 mr-1 hidden sm:inline" />
                    Following ({followedPages.length})
                  </TabsTrigger>
                  <TabsTrigger value="owned" className="text-xs sm:text-sm">
                    <Crown className="w-4 h-4 mr-1 hidden sm:inline" />
                    Owned ({myPages.length})
                  </TabsTrigger>
                  <TabsTrigger value="featured" className="text-xs sm:text-sm">
                    <Star className="w-4 h-4 mr-1 hidden sm:inline" />
                    Featured
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="discover" className="space-y-4">
                  {filteredPages.length > 0 ? (
                    <div className="space-y-4">
                      {filteredPages.map((page) => renderPageCard(page))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Globe className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No pages found
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Try adjusting your search criteria
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
                </TabsContent>

                <TabsContent value="following" className="space-y-4">
                  {followedPages.length > 0 ? (
                    <div className="space-y-4">
                      {followedPages.map((page) => renderPageCard(page))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <UserPlus className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        You're not following any pages
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Start following pages that interest you
                      </p>
                      <Button onClick={() => setActiveTab("discover")}>
                        Discover Pages
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="owned" className="space-y-4">
                  {myPages.length > 0 ? (
                    <div className="space-y-4">
                      {myPages.map((page) => renderPageCard(page))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Building className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        You haven't created any pages
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Create your own page to share content and connect with
                        followers
                      </p>
                      {user && (
                        <Button onClick={() => setShowCreateDialog(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Your First Page
                        </Button>
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="featured" className="space-y-4">
                  {allPages.filter((p) => p.is_verified).length > 0 ? (
                    <div className="space-y-4">
                      {allPages
                        .filter((p) => p.is_verified)
                        .map((page) => renderPageCard(page))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Star className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No featured pages
                      </h3>
                      <p className="text-muted-foreground">
                        Verified pages will appear here
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </main>

            {/* Right */}
            <aside className="hidden md:block md:col-span-1">
              <div className="space-y-4">
                <Card className="p-4">
                  <h5 className="font-medium mb-3">Top Pages</h5>
                  <div className="space-y-3">
                    {allPages.slice(0, 5).map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded transition"
                        onClick={() => handleViewPage(p.id)}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={p.avatar_url || ""} />
                          <AvatarFallback>
                            {p.name?.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium flex items-center gap-1">
                            <span className="truncate">{p.name}</span>
                            {p.is_verified && (
                              <Verified className="w-3 h-3 text-blue-600 flex-shrink-0" />
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatNumber(p.follower_count)} followers
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-4">
                  <h5 className="font-medium mb-3">Categories</h5>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <Badge key={cat} variant="outline">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </Card>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pages;
