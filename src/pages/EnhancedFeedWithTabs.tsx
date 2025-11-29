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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import UnifiedFeedContent from "@/components/feed/UnifiedFeedContent";
import EnhancedCreatePostCard from "@/components/feed/EnhancedCreatePostCard";
import { useToast } from "@/components/ui/use-toast";

// Stories component for the feed
const StoriesSection = () => {
  const { user } = useAuth();
  const [stories, setStories] = useState([
    {
      id: "1",
      user: {
        name: "Your Story",
        avatar: user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
        isUser: true,
      },
      hasStory: false,
    },
    {
      id: "2",
      user: {
        name: "Sarah",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
        isUser: false,
      },
      hasStory: true,
      hasNew: true,
    },
    {
      id: "3",
      user: {
        name: "Mike",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike",
        isUser: false,
      },
      hasStory: true,
      hasNew: false,
    },
    {
      id: "4",
      user: {
        name: "Emma",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emma",
        isUser: false,
      },
      hasStory: true,
      hasNew: true,
    },
    {
      id: "5",
      user: {
        name: "David",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=david",
        isUser: false,
      },
      hasStory: true,
      hasNew: false,
    },
  ]);

  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <Card className="mb-4 sm:mb-6">
      <CardContent className="p-3 sm:p-4">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-md hidden sm:flex h-8 w-8"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div
            ref={scrollRef}
            className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide px-0 sm:px-8"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {stories.map((story) => (
              <div key={story.id} className="flex-shrink-0">
                <div className="relative cursor-pointer group">
                  <div
                    className={cn(
                      "w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5",
                      story.user.isUser
                        ? "bg-gray-300"
                        : story.hasNew
                        ? "bg-gradient-to-r from-purple-500 to-pink-500"
                        : "bg-gray-300"
                    )}
                  >
                    <div className="w-full h-full bg-white rounded-full p-0.5">
                      <Avatar className="w-full h-full">
                        <AvatarImage src={story.user.avatar} />
                        <AvatarFallback className="text-xs">
                          {story.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  {story.user.isUser && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <Plus className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-center mt-1 sm:mt-2 max-w-[56px] sm:max-w-[64px] truncate">
                  {story.user.name}
                </p>
              </div>
            ))}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-md hidden sm:flex h-8 w-8"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Sidebar for desktop view
const FeedSidebar = () => {
  const { user } = useAuth();

  const shortcuts = [
    { name: "Friends", icon: Users, count: 127 },
    { name: "Groups", icon: Users, count: 8 },
    { name: "Pages", icon: Building, count: 4 },
    { name: "Marketplace", icon: Building, count: null },
    { name: "Memories", icon: Building, count: null },
    { name: "Saved", icon: Bookmark, count: 15 },
  ];

  const trendingTopics = [
    "#ReactJS",
    "#WebDevelopment", 
    "#TechNews",
    "#Startup",
    "#Design",
  ];

  return (
    <div className="space-y-4">
      {/* User Profile Card */}
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
              <p className="font-semibold">1.2K</p>
              <p className="text-gray-500">Posts</p>
            </div>
            <div>
              <p className="font-semibold">5.4K</p>
              <p className="text-gray-500">Friends</p>
            </div>
            <div>
              <p className="font-semibold">890</p>
              <p className="text-gray-500">Following</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Quick Links</h3>
          <div className="space-y-2">
            {shortcuts.map((shortcut) => (
              <button
                key={shortcut.name}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 text-left"
              >
                <div className="flex items-center gap-3">
                  <shortcut.icon className="w-4 h-4 text-gray-600" />
                  <span className="text-sm">{shortcut.name}</span>
                </div>
                {shortcut.count && (
                  <Badge variant="secondary" className="text-xs">
                    {shortcut.count}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trending Topics */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Trending Topics</h3>
          <div className="space-y-2">
            {trendingTopics.map((topic, index) => (
              <button
                key={topic}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 text-left"
              >
                <span className="text-sm text-blue-600">{topic}</span>
                <TrendingUp className="w-3 h-3 text-gray-400" />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Right sidebar for suggested content
const SuggestedSidebar = () => {
  const suggestedUsers = [
    {
      id: "1",
      name: "Alex Chen",
      username: "alexchen",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
      verified: true,
      mutualFriends: 12,
    },
    {
      id: "2", 
      name: "Maria Garcia",
      username: "mariagarcia",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maria",
      verified: false,
      mutualFriends: 8,
    },
    {
      id: "3",
      name: "John Smith",
      username: "johnsmith",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
      verified: true,
      mutualFriends: 15,
    },
  ];

  const liveStreams = [
    {
      id: "1",
      title: "React Masterclass",
      creator: "DevTutor",
      viewers: 234,
      thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=200&fit=crop",
    },
    {
      id: "2",
      title: "Design Workshop",
      creator: "DesignPro",
      viewers: 156,
      thumbnail: "https://images.unsplash.com/photo-1558618734-fbd6c5d20cc8?w=300&h=200&fit=crop",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Suggested Users */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">People You May Know</h3>
          <div className="space-y-3">
            {suggestedUsers.map((suggestedUser) => (
              <div key={suggestedUser.id} className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={suggestedUser.avatar} />
                  <AvatarFallback>{suggestedUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="font-medium text-sm truncate">{suggestedUser.name}</p>
                    {suggestedUser.verified && (
                      <Badge variant="secondary" className="h-3 w-3 p-0 rounded-full bg-blue-500">
                        <span className="text-white text-xs">✓</span>
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {suggestedUser.mutualFriends} mutual friends
                  </p>
                </div>
                <Button size="sm" variant="outline" className="text-xs px-2 py-1 h-auto">
                  Add
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live Streams */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Live Now</h3>
          <div className="space-y-3">
            {liveStreams.map((stream) => (
              <div key={stream.id} className="relative cursor-pointer group">
                <div className="relative">
                  <img
                    src={stream.thumbnail}
                    alt={stream.title}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                  <Badge
                    variant="destructive"
                    className="absolute top-2 right-2 text-xs animate-pulse"
                  >
                    LIVE
                  </Badge>
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 px-2 py-1 rounded text-white text-xs flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {stream.viewers}
                  </div>
                </div>
                <div className="mt-2">
                  <p className="font-medium text-sm truncate">{stream.title}</p>
                  <p className="text-xs text-gray-500">{stream.creator}</p>
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
  const [activeTab, setActiveTab] = useState("for-you");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const tabs = [
    {
      value: "for-you",
      label: "For You",
      icon: TrendingUp,
      description: "Personalized content based on your interests",
    },
    {
      value: "following",
      label: "Following",
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
  ];

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-4">
          {/* Left Sidebar - Hidden on mobile */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-4">
              <FeedSidebar />
            </div>
          </div>

          {/* Main Feed */}
          <div className="col-span-1 lg:col-span-2">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              {/* Tab Navigation */}
              <div className="sticky top-0 z-40 bg-gray-50 pb-4">
                <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-white">
                  {tabs.map((tab) => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="flex flex-col items-center gap-1 py-3 px-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600"
                    >
                      <tab.icon className="w-4 h-4" />
                      <span className="text-xs font-medium hidden sm:block">
                        {tab.label}
                      </span>
                      <span className="text-xs font-medium sm:hidden">
                        {tab.label.split(" ")[0]}
                      </span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {/* Tab Description and Controls */}
                <div className="flex items-center justify-between mt-4">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {tabs.find((tab) => tab.value === activeTab)?.label}
                    </h2>
                    <p className="text-sm text-gray-500 hidden sm:block">
                      {tabs.find((tab) => tab.value === activeTab)?.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      className="h-8 w-8"
                    >
                      <Settings
                        className={cn(
                          "w-4 h-4",
                          isRefreshing && "animate-spin"
                        )}
                      />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Stories Section - Only show on For You tab */}
              {activeTab === "for-you" && <StoriesSection />}

              {/* Create Post */}
              <EnhancedCreatePostCard />

              {/* Tab Content */}
              {tabs.map((tab) => (
                <TabsContent
                  key={tab.value}
                  value={tab.value}
                  className="mt-0 space-y-0"
                >
                  <UnifiedFeedContent feedType={tab.value} />
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Right Sidebar - Hidden on mobile and tablet */}
          <div className="hidden xl:block xl:col-span-1">
            <div className="sticky top-4">
              <SuggestedSidebar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedFeedWithTabs;
