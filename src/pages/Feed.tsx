import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Camera,
  Image as ImageIcon,
  Video,
  MapPin,
  Smile,
  Plus,
  TrendingUp,
  Users,
  Globe,
  Building,
  ChevronLeft,
  ChevronRight,
  Play,
  Settings,
  Search,
  MessageSquare,
  List,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuickLinksStats, useTrendingTopicsData, useSuggestedUsersData, useLiveNowData } from "@/hooks/use-sidebar-widgets";
import { supabase } from "@/integrations/supabase/client";
import { useFeed } from "@/hooks/use-feed";
import EnhancedPostCard from "@/components/feed/EnhancedPostCard";
import { FeedNativeAdCard } from "@/components/ads/FeedNativeAdCard";
import { SponsoredPostCard } from "@/components/ads/SponsoredPostCard";
import { adSettings } from "../../config/adSettings";
import FeedSkeleton from "@/components/feed/FeedSkeleton";
import CreatePostTrigger from "@/components/feed/CreatePostTrigger";
import EnhancedStoriesSection from "@/components/feed/EnhancedStoriesSection";
import { CreateStoryModal } from "@/components/feed/CreateStory";
import StoryViewer from "@/components/feed/StoryViewer";
import ErrorBoundary from "@/components/ui/error-boundary";
import { HybridFeedProvider } from "@/contexts/HybridFeedContext";
import HybridFeedContent from "@/components/feed/HybridFeedContent";
import UnifiedFeedContent from "@/components/feed/UnifiedFeedContent";
import SuggestedSidebar from "@/components/feed/SuggestedSidebar";
import FeedSidebar from "@/components/feed/FeedSidebar";

// Define the Post type
export type Post = {
  id: string;
  content: string;
  timestamp?: string;
  createdAt: string;
  likes: number;
  comments: number;
  shares: number;
  author: {
    name: string;
    username: string;
    handle: string;
    avatar: string;
    verified?: boolean;
  };
  image?: string;
  liked?: boolean;
};

// Convert Supabase post format to legacy Post format
const convertToLegacyPost = (supabasePost: any): Post => ({
  id: supabasePost.id,
  content: supabasePost.content,
  timestamp: supabasePost.createdAt,
  createdAt: supabasePost.createdAt,
  likes: supabasePost.likes,
  comments: supabasePost.comments,
  shares: supabasePost.shares,
  author: {
    name: supabasePost.author.name,
    username: supabasePost.author.username,
    handle: `@${supabasePost.author.username}`,
    avatar: supabasePost.author.avatar,
    verified: supabasePost.author.verified,
  },
  image: supabasePost.image,
  liked: false,
});

// Left Sidebar Component
const FeedSidebar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const quickLinks = useQuickLinksStats();
  const { data: trendingTopics } = useTrendingTopicsData();

  const [userStats, setUserStats] = useState({
    posts: 0,
    friends: 0,
    following: 0
  });

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user?.id) return;
      
      try {
        const { count: postsCount } = await supabase
          .from('posts')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id);
        
        const { count: followersCount } = await supabase
          .from('followers')
          .select('*', { count: 'exact' })
          .eq('following_id', user.id);
        
        const { count: followingCount } = await supabase
          .from('followers')
          .select('*', { count: 'exact' })
          .eq('follower_id', user.id);
        
        setUserStats({
          posts: postsCount || 0,
          friends: followersCount || 0,
          following: followingCount || 0
        });
      } catch (error) {
        console.error("Error fetching user stats:", error);
        setUserStats({
          posts: 1200,
          friends: 5400,
          following: 890
        });
      }
    };
    
    fetchUserStats();
  }, [user?.id]);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{user?.name}</h3>
              <p className="text-sm text-gray-500">@{user?.username}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div>
              <p className="font-semibold">{userStats.posts.toLocaleString()}</p>
              <p className="text-gray-500">Posts</p>
            </div>
            <div>
              <p className="font-semibold">{userStats.friends.toLocaleString()}</p>
              <p className="text-gray-500">Friends</p>
            </div>
            <div>
              <p className="font-semibold">{userStats.following.toLocaleString()}</p>
              <p className="text-gray-500">Following</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Quick Links</h3>
          <div className="space-y-2">
            {quickLinks.map((item) => (
              <button
                key={item.name}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 text-left"
                onClick={() => navigate(item.route)}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 text-gray-600" />
                  <span className="text-sm">{item.name}</span>
                </div>
                {typeof item.count === "number" && item.count > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {item.count}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Trending Topics</h3>
          <div className="space-y-2">
            {(trendingTopics || []).map((topic: any) => (
              <button
                key={topic.id || topic.name}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 text-left"
              >
                <span className="text-sm text-blue-600">#{topic.name || topic}</span>
                <TrendingUp className="w-3 h-3 text-gray-400" />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Right Sidebar Component
const SuggestedSidebar = () => {
  const { user } = useAuth();
  const { data: suggestedUsers } = useSuggestedUsersData(6);
  const { liveStreams } = useLiveNowData();
  const [following, setFollowing] = React.useState<Record<string, boolean>>({});

  const toggleFollowUser = async (id: string) => {
    try {
      const current = !!following[id];
      setFollowing((prev) => ({ ...prev, [id]: !current }));
      const { toggleFollow } = await import("@/services/profileService");
      if (user?.id && id) {
        await toggleFollow(user.id, id, current);
      }
    } catch (e) {
      console.warn("Follow action failed", e);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">People You May Know</h3>
          <div className="space-y-3">
            {(suggestedUsers || []).map((u: any) => {
              const name = u.name || u.profile?.full_name || u.username;
              const id = u.id || u.profile?.id || (u.username || u.profile?.username || "user");
              const username = u.username || u.profile?.username || "user";
              const avatar = u.avatar || u.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
              const verified = Boolean(u.verified || u.profile?.is_verified);
              const mutualConnections = u.mutualFriends ?? Math.floor((u.followers || u.profile?.followers_count || 0) % 16);
              const isFollowing = !!following[id];
              return (
                <div key={id} className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={avatar} />
                    <AvatarFallback>{String(name || "U").charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="font-medium text-sm truncate">{name}</p>
                      {verified && (
                        <Badge variant="secondary" className="h-3 w-3 p-0 rounded-full bg-blue-500">
                          <span className="text-white text-xs">✓</span>
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{mutualConnections} mutual connections</p>
                  </div>
                  <Button size="sm" variant={isFollowing ? "secondary" : "outline"} className="text-xs px-2 py-1 h-auto" onClick={() => toggleFollowUser(id)}>
                    {isFollowing ? "Following" : "Follow"}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Live Now</h3>
          <div className="space-y-3">
            {(liveStreams || []).map((content: any) => (
              <div key={content.id} className="relative cursor-pointer group">
                <div className="relative">
                  <img
                    src={content.user.avatar}
                    alt={content.title}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                  <Badge variant="destructive" className="absolute top-2 right-2 text-xs animate-pulse">LIVE</Badge>
                  <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-white text-xs flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {content.viewerCount}
                  </div>
                </div>
                <div className="mt-2">
                  <p className="font-medium text-sm truncate">{content.title}</p>
                  <p className="text-xs text-gray-500">{content.user.displayName}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Main Feed Component
const Feed = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("for-you");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreateStoryModal, setShowCreateStoryModal] = useState(false);
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [userStories, setUserStories] = useState<any[]>([]);
  const [feedWithAds, setFeedWithAds] = useState<(Post | { id: string; type: 'native_ad' | 'sponsored_post' })[]>([]);

  // Use real feed data from Supabase
  const { posts: supabasePosts, isLoading, hasMore, loadMorePosts, handleCreatePost } = useFeed();

  // Update URL when tab changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    params.set("tab", activeTab);
    navigate({ pathname: "/app/feed", search: params.toString() }, { replace: true });
  }, [activeTab]);

  // Load URL tab parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab) setActiveTab(tab);
  }, [location.search]);

  // Create feed with ads using real posts from Supabase
  useEffect(() => {
    if (supabasePosts.length === 0) return;
    
    const createFeedWithAds = () => {
      const feedItems = [];
      let nativeAdCounter = 0;
      let sponsoredAdCounter = 0;
      
      const legacyPosts = supabasePosts.map(convertToLegacyPost);

      for (let i = 0; i < legacyPosts.length; i++) {
        feedItems.push(legacyPosts[i]);

        if ((i + 1) % adSettings.feedAdFrequency === 0 && adSettings.enableAds) {
          nativeAdCounter++;
          feedItems.push({
            id: `native-ad-${nativeAdCounter}`,
            type: 'native_ad' as const
          });
        }

        if ((i + 1) % adSettings.feedSponsoredFrequency === 0 && adSettings.enableAds) {
          sponsoredAdCounter++;
          feedItems.push({
            id: `sponsored-post-${sponsoredAdCounter}`,
            type: 'sponsored_post' as const
          });
        }
      }

      return feedItems;
    };

    setFeedWithAds(createFeedWithAds());
  }, [supabasePosts]);

  const renderFeedItem = (item: Post | { id: string; type: 'native_ad' | 'sponsored_post' }) => {
    if ('type' in item) {
      if (item.type === 'native_ad') {
        return (
          <FeedNativeAdCard
            key={item.id}
            onClick={() => console.log('Native ad clicked')}
          />
        );
      } else if (item.type === 'sponsored_post') {
        return (
          <SponsoredPostCard
            key={item.id}
            title="Discover Eloity Premium"
            content="Unlock exclusive features, priority support, and enhanced creator tools. Join thousands of creators already earning more with Eloity Premium!"
            ctaText="Upgrade Now"
            onClick={() => console.log('Sponsored post clicked')}
          />
        );
      }
    }

    const post = item as Post;
    return <EnhancedPostCard key={post.id} post={post} />;
  };

  const handleCreateStory = async (storyData: any) => {
    try {
      const newStory = {
        id: `story-${Date.now()}`,
        user: {
          id: user?.id || "current-user",
          name: user?.name || "You",
          username: user?.username || "you",
          avatar: user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
          isUser: true,
        },
        timestamp: new Date(),
        content: storyData,
        views: 0,
        hasNew: true,
      };

      setUserStories(prev => [newStory, ...prev]);
      toast({
        title: "Story created!",
        description: "Your story has been published.",
      });
    } catch (error) {
      console.error("Error creating story:", error);
      toast({
        title: "Failed to create story",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewStory = (storyIndex: number) => {
    setCurrentStoryIndex(storyIndex);
    setShowStoryViewer(true);
  };

  const baseTabs = [
    {
      value: "for-you",
      label: "All",
      icon: TrendingUp,
      description: "Personalized content based on your interests",
    },
    {
      value: "following",
      label: "Friends",
      icon: Users,
      description: "Posts from people you follow",
    },
    {
      value: "groups",
      label: "Groups",
      icon: Users,
      description: "Posts from your groups and communities",
    },
    {
      value: "pages",
      label: "Pages",
      icon: Building,
      description: "Content from pages and businesses you follow",
    },
    {
      value: "saved",
      label: "Saved",
      icon: Bookmark,
      description: "Your saved posts and viewing history",
    },
  ];

  if (isLoading && supabasePosts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 p-2 sm:p-4">
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-4">
                <FeedSidebar />
              </div>
            </div>
            <div className="col-span-1 lg:col-span-2">
              <FeedSkeleton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 p-2 sm:p-4">
          {/* Left Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-4">
              <FeedSidebar />
            </div>
          </div>

          {/* Main Feed */}
          <div className="col-span-1 lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Tab Navigation */}
              <div className="sticky top-0 z-40 bg-white border-b border-gray-200 mb-4">
                <div className="flex overflow-x-auto scrollbar-hide">
                  {baseTabs.map((tab) => (
                    <button
                      key={tab.value}
                      onClick={() => setActiveTab(tab.value)}
                      className={cn(
                        "flex-shrink-0 flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors min-w-max",
                        activeTab === tab.value
                          ? "text-blue-600 border-blue-600"
                          : "text-gray-500 border-transparent hover:text-gray-700"
                      )}
                    >
                      <tab.icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stories and Create Post */}
              {activeTab === "for-you" && (
                <>
                  <EnhancedStoriesSection
                    onCreateStory={() => setShowCreateStoryModal(true)}
                    userStories={userStories}
                    onViewStory={handleViewStory}
                  />
                  <CreatePostTrigger onOpenCreatePost={() => navigate('/app/create-post')} />
                </>
              )}

              {/* Tab Content */}
              {baseTabs.map((tab) => (
                <TabsContent key={tab.value} value={tab.value} className="mt-0 space-y-0">
                  {tab.value === 'saved' ? (
                    <ErrorBoundary
                      fallback={
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <Bookmark className="w-8 h-8 text-red-500" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Saved Content Error</h3>
                          <p className="text-gray-600 max-w-sm mb-4">Unable to load saved content. Please try again later.</p>
                          <Button onClick={() => setActiveTab('for-you')} variant="outline">
                            Go to All Feed
                          </Button>
                        </div>
                      }
                    >
                      <HybridFeedProvider>
                        <HybridFeedContent feedType={tab.value} viewMode='saved' />
                      </HybridFeedProvider>
                    </ErrorBoundary>
                  ) : (
                    <>
                      {feedWithAds.length > 0 ? (
                        <>
                          {feedWithAds.map((item) => renderFeedItem(item))}
                          {hasMore && (
                            <div className="flex justify-center py-4">
                              <button 
                                onClick={loadMorePosts}
                                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                disabled={isLoading}
                              >
                                {isLoading ? 'Loading...' : 'Load More'}
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <UnifiedFeedContent feedType={tab.value} />
                      )}
                    </>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Right Sidebar */}
          <div className="hidden xl:block xl:col-span-1">
            <div className="sticky top-4">
              <SuggestedSidebar />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateStoryModal
        isOpen={showCreateStoryModal}
        onClose={() => setShowCreateStoryModal(false)}
        onSubmit={handleCreateStory}
      />

      {showStoryViewer && (
        <StoryViewer
          stories={[
            ...userStories,
            {
              id: "2",
              user: { id: "user-sarah", name: "Sarah", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah", isUser: false },
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
              content: { text: "Having a great day! 🌟" },
              views: 45,
              hasNew: true,
            },
            {
              id: "3",
              user: { id: "user-mike", name: "Mike", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike", isUser: false },
              timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
              content: { text: "Just finished a great workout! 💪" },
              views: 23,
              hasNew: false,
            },
            {
              id: "4",
              user: { id: "user-emma", name: "Emma", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emma", isUser: false },
              timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
              content: { text: "Beautiful sunset today! 🌅" },
              views: 67,
              hasNew: true,
            },
          ]}
          initialIndex={currentStoryIndex}
          onClose={() => setShowStoryViewer(false)}
          onStoryChange={setCurrentStoryIndex}
        />
      )}
    </div>
  );
};

export default Feed;
