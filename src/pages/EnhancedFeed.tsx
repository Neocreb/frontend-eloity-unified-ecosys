import React, { useState, useEffect, useRef, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { useFeed } from "@/contexts/FeedContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Image,
  Video,
  MapPin,
  Smile,
  Send,
  Camera,
  Plus,
  Play,
  Volume2,
  VolumeX,
  Users,
  Globe,
  Lock,
  ChevronLeft,
  ChevronRight,
  X,
  Edit,
  Trash2,
  Star,
  Shield,
  Gift,
  Sparkles,
  Zap,
  TrendingUp,
  Compass,
  Clock,
  Target,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

const EnhancedFeed = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { userPosts: feedPosts, isLoading: feedLoading, loadMorePosts, refreshFeed, hasMore } = useFeed();
  const [posts, setPosts] = useState<any[]>([]);

  // Convert feed posts to display format and sync with local state
  useEffect(() => {
    if (feedPosts.length > 0) {
      const convertedPosts = feedPosts.map(feedItem => ({
        id: feedItem.id,
        user: {
          id: feedItem.author?.id || 'unknown',
          name: feedItem.author?.name || 'Anonymous',
          username: feedItem.author?.username || 'anonymous',
          avatar: feedItem.author?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=default",
          isVerified: feedItem.author?.verified || false,
        },
        content: typeof feedItem.content === 'string' ? feedItem.content : 
                 feedItem.content?.text || feedItem.content?.title || 
                 feedItem.content?.description || '',
        media: feedItem.content?.media || feedItem.content?.images?.map((url: string) => ({
          type: "image" as const,
          url,
          alt: "Post media"
        })) || [],
        timestamp: feedItem.timestamp ? new Date(feedItem.timestamp).toLocaleString() : 'Unknown time',
        likes: feedItem.interactions?.likes || 0,
        comments: feedItem.interactions?.comments || 0,
        shares: feedItem.interactions?.shares || 0,
        saved: feedItem.userInteracted?.saved || false,
        liked: feedItem.userInteracted?.liked || false,
        type: feedItem.type,
        // Additional data for marketplace and freelancer items
        ...(feedItem.type === 'product' && {
          price: feedItem.content?.price,
          category: feedItem.content?.category,
          inStock: feedItem.content?.inStock
        }),
        ...(feedItem.type === 'job' && {
          budget: feedItem.content?.budget,
          skills: feedItem.content?.skills,
          experienceLevel: feedItem.content?.experience_level
        })
      }));
      setPosts(convertedPosts);
    }
  }, [feedPosts]);

  // Use the real refreshFeed from FeedContext
  const handleRefreshFeed = () => {
    refreshFeed();
    toast({
      title: "Feed refreshed!",
      description: "Latest posts loaded successfully.",
    });
  };

  // Use the real loadMorePosts from FeedContext
  const handleLoadMore = () => {
    loadMorePosts();
  };

  const handlePostLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handlePostSave = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, saved: !post.saved }
        : post
    ));
  };

  const PostCard = ({ post }: { post: any }) => (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.user.avatar} alt={post.user.name} />
            <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <p className="font-semibold text-sm">{post.user.name}</p>
              {post.user.isVerified && <Badge variant="secondary" className="h-4 px-1 text-xs">✓</Badge>}
              <span className="text-xs text-muted-foreground">@{post.user.username}</span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">{post.timestamp}</span>
              {post.type !== 'post' && (
                <Badge variant="outline" className="h-4 px-1 text-xs capitalize">{post.type}</Badge>
              )}
            </div>
            
            <p className="text-sm mb-3">{post.content}</p>
            
            {/* Special display for marketplace items */}
            {post.type === 'product' && post.price && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg mb-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-green-600">${post.price}</span>
                  <Badge variant={post.inStock ? "default" : "secondary"}>
                    {post.inStock ? "In Stock" : "Out of Stock"}
                  </Badge>
                </div>
                {post.category && <p className="text-xs text-muted-foreground mt-1">Category: {post.category}</p>}
              </div>
            )}
            
            {/* Special display for job posts */}
            {post.type === 'job' && post.budget && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg mb-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">
                    ${post.budget.min} - ${post.budget.max} {post.budget.type}
                  </span>
                  <Badge variant="outline">{post.experienceLevel}</Badge>
                </div>
                {post.skills && post.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {post.skills.slice(0, 3).map((skill: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs">{skill}</Badge>
                    ))}
                    {post.skills.length > 3 && <span className="text-xs text-muted-foreground">+{post.skills.length - 3} more</span>}
                  </div>
                )}
              </div>
            )}
            
            {/* Media display */}
            {post.media && post.media.length > 0 && (
              <div className="mb-3">
                {post.media.map((item: any, idx: number) => (
                  <div key={idx} className="rounded-lg overflow-hidden">
                    <img 
                      src={item.url} 
                      alt={item.alt || "Post media"} 
                      className="w-full h-48 object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
            
            {/* Engagement buttons */}
            <div className="flex items-center justify-between pt-2 border-t">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handlePostLike(post.id)}
                className={cn("text-muted-foreground hover:text-red-500", post.liked && "text-red-500")}
              >
                <Heart className={cn("h-4 w-4 mr-1", post.liked && "fill-current")} />
                {post.likes}
              </Button>
              
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-blue-500">
                <MessageCircle className="h-4 w-4 mr-1" />
                {post.comments}
              </Button>
              
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-green-500">
                <Share2 className="h-4 w-4 mr-1" />
                {post.shares}
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handlePostSave(post.id)}
                className={cn("text-muted-foreground hover:text-yellow-500", post.saved && "text-yellow-500")}
              >
                <Bookmark className={cn("h-4 w-4", post.saved && "fill-current")} />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Please Sign In</h2>
            <p className="text-muted-foreground mb-4">You need to be signed in to view the feed.</p>
            <Button onClick={() => navigate("/auth")}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Feed - Social Media & Marketplace | Softchat</title>
        <meta name="description" content="Discover posts, products, and freelance opportunities in your personalized feed." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Feed</h1>
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleRefreshFeed} 
                size="sm" 
                variant="outline"
                disabled={feedLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${feedLoading ? 'animate-spin' : ''}`} />
                {feedLoading ? 'Loading...' : 'Refresh'}
              </Button>
            </div>
          </div>

          {/* Feed content */}
          <div className="space-y-6">
            {feedLoading && posts.length === 0 ? (
              // Loading skeletons
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="w-full">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-32 w-full rounded-lg" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : posts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="space-y-4">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto" />
                    <h3 className="text-lg font-semibold">No posts yet</h3>
                    <p className="text-muted-foreground">Be the first to share something!</p>
                    <Button onClick={() => navigate("/app/create-post")}>Create Post</Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            )}

            {/* Load more button */}
            {hasMore && posts.length > 0 && (
              <div className="text-center">
                <Button
                  onClick={handleLoadMore}
                  variant="outline"
                  disabled={feedLoading}
                  className="w-full"
                >
                  {feedLoading ? 'Loading...' : 'Load More Posts'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default EnhancedFeed;