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
import { supabase } from "@/integrations/supabase/client";
import { useFeed } from "@/hooks/use-feed";
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

// Main Feed Component
const Feed = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("for-you");
  const [showCreateStoryModal, setShowCreateStoryModal] = useState(false);
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [userStories, setUserStories] = useState<any[]>([]);

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
                    <UnifiedFeedContent feedType={tab.value} />
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
