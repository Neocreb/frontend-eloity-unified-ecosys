// @ts-nocheck
import React, { useRef, useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Story {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    isUser: boolean;
  };
  hasStory: boolean;
  hasNew: boolean;
  thumbnail?: string;
  timestamp?: Date;
}

interface EnhancedStoriesSectionProps {
  onCreateStory: () => void;
  userStories: any[];
  onViewStory: (index: number) => void;
  refetchTrigger?: number;
}

const EnhancedStoriesSection: React.FC<EnhancedStoriesSectionProps> = ({
  onCreateStory,
  userStories,
  onViewStory,
  refetchTrigger = 0,
}) => {
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStories = async () => {
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
      {/* Suggested Users */}
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

      {/* Live Streams */}
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

// Main enhanced feed component
const EnhancedFeedWithTabs = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("for-you");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreateStoryModal, setShowCreateStoryModal] = useState(false);
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [showCreatePostFlow, setShowCreatePostFlow] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [userStories, setUserStories] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab) setActiveTab(tab);
  }, [location.search]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    params.set("tab", activeTab);
    navigate({ pathname: "/app/feed", search: params.toString() }, { replace: true });
  }, [activeTab]);

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

  const tabs = baseTabs;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Feed refreshed",
        description: "Your feed has been updated with the latest content.",
      });
    }, 1000);
  };

  const handleCreateStory = async (storyData: any) => {
    try {
      // Add the new story to the userStories state
      const newStory = {
        id: `story-${Date.now()}`,
      setIsLoading(true);

      const { data, error } = await supabase
        .from("stories")
        .select(
          `
          id,
          user_id,
          created_at,
          media_url,
          profiles:user_id(
            username,
            full_name,
            avatar_url
          )
        `
        )
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      const fetchedStories: Story[] = (data || []).map((story: any) => ({
        id: story.id,
        user: {
          id: story.user_id,
          name:
            story.profiles?.full_name ||
            story.profiles?.username ||
            "Unknown User",
          avatar:
            story.profiles?.avatar_url ||
            "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
          isUser: story.user_id === user?.id,
        },
        hasStory: true,
        hasNew:
          new Date(story.created_at) >
          new Date(Date.now() - 24 * 60 * 60 * 1000),
        thumbnail: story.media_url,
        timestamp: new Date(story.created_at),
      }));

      const createStoryOption: Story = {
        id: "create",
        user: {
          id: user?.id || "current-user",
          name: "Create story",
          avatar:
            user?.user_metadata?.avatar ||
            "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
          isUser: true,
        },
        hasStory: false,
        hasNew: false,
      };

      setStories([createStoryOption, ...fetchedStories]);
    } catch {
      const createStoryOption: Story = {
        id: "create",
        user: {
          id: user?.id || "current-user",
          name: "Create story",
          avatar:
            user?.user_metadata?.avatar ||
            "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
          isUser: true,
        },
        hasStory: false,
        hasNew: false,
      };
      setStories([createStoryOption]);
    } finally {
      setIsLoading(false);
    }
  };

  // First fetch
  useEffect(() => {
    if (user) fetchStories();
  }, [user]);

  // Refetch when parent triggers
  useEffect(() => {
    if (user && refetchTrigger > 0) fetchStories();
  }, [refetchTrigger, user]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -260 : 260,
        behavior: "smooth",
      });
    }
  };

  const handleStoryClick = (story: Story, index: number) => {
    if (story.user.isUser && !story.hasStory) onCreateStory();
    else onViewStory(index);
  };

  return (
    <div className="bg-white border-b border-gray-200 py-3 sm:py-4 mb-4 sm:mb-6">
      <div className="relative max-w-full">
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg border hidden sm:flex h-8 w-8"
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div
          ref={scrollRef}
          className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide px-4 sm:px-12"
        >
          {isLoading && stories.length === 0 && (
            <div className="w-full text-gray-500 text-sm text-center">
              Loading stories...
            </div>
          )}

          {!isLoading && stories.length === 0 && (
            <div className="w-full text-gray-500 text-sm text-center">
              No stories yet
            </div>
          )}

          {stories.map((story, index) => (
            <div
              key={`story-${story.id}-${index}`}
              className="flex-shrink-0 cursor-pointer group"
              onClick={() => handleStoryClick(story, index)}
            >
              <div className="flex flex-col items-center w-24 sm:w-28">
                <div className="relative w-24 h-32 sm:w-28 sm:h-36">
                  <div
                    className={cn(
                      "w-full h-full rounded-xl overflow-hidden transition-all group-hover:scale-105",
                      story.user.isUser
                        ? "bg-gradient-to-b from-blue-400 to-blue-600"
                        : "bg-gray-200"
                    )}
                  >
                    {story.thumbnail ? (
                      <img
                        src={story.thumbnail}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300" />
                    )}
                    {story.hasNew && (
                      <div className="absolute inset-0 border-2 border-blue-500 rounded-xl" />
                    )}
                  </div>

                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-10 h-10 sm:w-12 sm:h-12">
                    <div
                      className={cn(
                        "w-full h-full rounded-full p-0.5",
                        story.hasNew
                          ? "bg-gradient-to-r from-purple-500 to-pink-500"
                          : "bg-gray-300"
                      )}
                    >
                      <div className="w-full h-full bg-white rounded-full p-0.5">
                        <Avatar className="w-full h-full">
                          <AvatarImage src={story.user.avatar} />
                          <AvatarFallback>
                            {story.user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                    {story.user.isUser && !story.hasStory && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <Plus className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-center mt-4 truncate w-full max-w-[96px] sm:max-w-[112px]">
                  {story.user.name}
                </p>
              </div>
            </div>
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg border hidden sm:flex h-8 w-8"
          onClick={() => scroll("right")}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default EnhancedStoriesSection;
