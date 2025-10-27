import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import EnhancedPostCard from "@/components/feed/EnhancedPostCard";
import { Post } from "@/types/post";
import { Building, Verified } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exploreService } from "@/services/exploreService";

interface Page {
  id: string;
  name: string;
  followers: number;
  category: string;
  verified: boolean;
  avatar: string;
  description?: string;
  pageType: 'business' | 'brand' | 'public_figure' | 'community' | 'organization';
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

interface PagePost extends Post {
  pageId: string;
  pageName: string;
  pageAvatar: string;
  pageVerified: boolean;
}

interface ExplorePagesProps {
  pages: Page[];
}

const ExplorePages = ({ pages }: ExplorePagesProps) => {
  const [pagePosts, setPagePosts] = useState<PagePost[]>([]);
  const [loading, setLoading] = useState(false);
  const [followedPages, setFollowedPages] = useState<Page[]>([]);
  const { toast } = useToast();

  // Load page posts on component mount
  useEffect(() => {
    loadPagePosts();
    loadFollowedPages();
  }, []);

  const loadFollowedPages = async () => {
    try {
      // In a real implementation, this would fetch the user's followed pages
      // For now, we'll use an empty array
      setFollowedPages([]);
    } catch (error) {
      console.error("Error loading followed pages:", error);
    }
  };

  const loadPagePosts = async () => {
    setLoading(true);
    try {
      // Fetch real pages using exploreService
      const suggestedPages = await exploreService.getSuggestedPages(10);
      
      // For now, we'll create mock posts based on real pages
      // In a full implementation, we would fetch actual posts from each page
      const mockPagePosts: PagePost[] = suggestedPages.slice(0, 4).map((page, index) => ({
        id: `page-post-${index + 1}`,
        author: {
          name: page.name,
          username: page.name.toLowerCase().replace(/\s+/g, ''),
          avatar: page.avatar_url || `https://images.unsplash.com/photo-${index + 20}?w=100`,
          verified: page.is_verified
        },
        content: `Update from ${page.name}: ${page.description || 'Follow us for the latest updates!'}`,
        image: index % 2 === 0 ? `https://images.unsplash.com/photo-${index + 30}?w=500` : undefined,
        createdAt: `${index + 2} hour${index + 2 > 1 ? 's' : ''} ago`,
        likes: Math.floor(Math.random() * 500),
        comments: Math.floor(Math.random() * 50),
        shares: Math.floor(Math.random() * 30),
        liked: index % 2 === 0,
        pageId: page.id,
        pageName: page.name,
        pageAvatar: page.avatar_url || `https://images.unsplash.com/photo-${index + 20}?w=100`,
        pageVerified: page.is_verified
      }));

      setPagePosts(mockPagePosts);
    } catch (error) {
      console.error("Error loading page posts:", error);
      toast({
        title: "Error",
        description: "Failed to load page posts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Posts from Pages</h3>
          {pagePosts.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {pagePosts.length} posts
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            Showing posts from popular pages
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadPagePosts}
            disabled={loading}
            className="text-xs"
          >
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : pagePosts.length > 0 ? (
        <div className="space-y-4">
          {pagePosts.map((post) => (
            <div key={post.id} className="space-y-2">
              {/* Page context header */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground px-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={post.pageAvatar} alt={post.pageName} />
                    <AvatarFallback>{post.pageName.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline">Posted by</span>
                  <span className="sm:hidden">By</span>
                  <span className="font-semibold text-primary flex items-center gap-1 truncate max-w-[200px]">
                    {post.pageName}
                    {post.pageVerified && (
                      <Verified className="h-3 w-3 text-blue-500" fill="currentColor" />
                    )}
                  </span>
                </div>
                {followedPages.some(p => p.id === post.pageId) && (
                  <Badge variant="secondary" className="text-xs">Following</Badge>
                )}
              </div>
              <EnhancedPostCard post={post} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Building className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground mb-2">No page posts found</p>
          <p className="text-sm text-muted-foreground mb-4">
            Follow some pages to see posts from brands and organizations you're interested in
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = '/pages'}
          >
            Browse Pages
          </Button>
        </div>
      )}
    </div>
  );
};

export default ExplorePages;