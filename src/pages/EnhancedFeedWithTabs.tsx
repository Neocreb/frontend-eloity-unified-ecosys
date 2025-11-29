// @ts-nocheck
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, TrendingUp, Users, Building, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate, useLocation } from "react-router-dom";
import UnifiedFeedContent from "@/components/feed/UnifiedFeedContent";
import CreatePostTrigger from "@/components/feed/CreatePostTrigger";
import CreatePostFlow from "@/components/feed/CreatePostFlow";
import EnhancedStoriesSection from "@/components/feed/EnhancedStoriesSection";
import { CreateStoryModal } from "@/components/feed/CreateStory";
import StoryViewer from "@/components/feed/StoryViewer";
import ErrorBoundary from "@/components/ui/error-boundary";
import { useQuickLinksStats, useTrendingTopicsData, useSuggestedUsersData, useLiveNowData } from "@/hooks/use-sidebar-widgets";
import { HybridFeedProvider } from "@/contexts/HybridFeedContext";
import HybridFeedContent from "@/components/feed/HybridFeedContent";

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

  const handleViewStory = (index: number) => {
    setCurrentStoryIndex(index);
    setShowStoryViewer(true);
  };

  const handleCreateStoryClick = () => {
    setShowCreateStoryModal(true);
  };

  return (
    <div className="w-full">
      <HybridFeedProvider>
        <ErrorBoundary>
          <div className="flex flex-col">
            {/* Stories Section */}
            <EnhancedStoriesSection
              onCreateStory={handleCreateStoryClick}
              userStories={userStories}
              onViewStory={handleViewStory}
            />

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {tabs.map((tab) => (
                <TabsContent key={tab.value} value={tab.value} className="mt-0">
                  <CreatePostTrigger onPostCreated={() => handleRefresh()} />

                  <HybridFeedContent
                    feedType={tab.value}
                    viewMode={activeTab === 'saved' ? 'saved' : 'classic'}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Modals */}
          {showCreateStoryModal && (
            <CreateStoryModal
              isOpen={showCreateStoryModal}
              onClose={() => setShowCreateStoryModal(false)}
              onSubmit={handleCreateStory}
            />
          )}

          {showStoryViewer && (
            <StoryViewer
              stories={userStories}
              initialIndex={currentStoryIndex}
              onClose={() => setShowStoryViewer(false)}
            />
          )}

          {showCreatePostFlow && (
            <CreatePostFlow
              isOpen={showCreatePostFlow}
              onClose={() => setShowCreatePostFlow(false)}
              onPostCreated={() => {
                setShowCreatePostFlow(false);
                handleRefresh();
              }}
            />
          )}
        </ErrorBoundary>
      </HybridFeedProvider>
    </div>
  );
};

export default EnhancedFeedWithTabs;
