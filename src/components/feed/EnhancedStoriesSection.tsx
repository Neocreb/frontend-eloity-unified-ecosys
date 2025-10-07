// @ts-nocheck
import React, { useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

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
}

const EnhancedStoriesSection: React.FC<EnhancedStoriesSectionProps> = ({
  onCreateStory,
  userStories,
  onViewStory
}) => {
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Enhanced stories data with more realistic content
  const stories: Story[] = [
    {
      id: "create",
      user: {
        id: "current-user",
        name: "Create story",
        avatar: user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
        isUser: true,
      },
      hasStory: false,
      hasNew: false,
    },
    {
      id: "1",
      user: {
        id: "user-defabz",
        name: "De Fabz Conceptz",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        isUser: false,
      },
      hasStory: true,
      hasNew: true,
      thumbnail: "https://images.unsplash.com/photo-1551298370-9c50423473db?w=300&h=400&fit=crop",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    },
    {
      id: "2",
      user: {
        id: "user-gaise",
        name: "Gaise",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        isUser: false,
      },
      hasStory: true,
      hasNew: false,
      thumbnail: "https://images.unsplash.com/photo-1516715094483-75da06bc8a19?w=300&h=400&fit=crop",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    },
    {
      id: "3",
      user: {
        id: "user-sarah",
        name: "Sarah Johnson",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b5bb?w=150&h=150&fit=crop&crop=face",
        isUser: false,
      },
      hasStory: true,
      hasNew: true,
      thumbnail: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&h=400&fit=crop",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      id: "4",
      user: {
        id: "user-mike",
        name: "Mike Chen",
        avatar: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face",
        isUser: false,
      },
      hasStory: true,
      hasNew: false,
      thumbnail: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=300&h=400&fit=crop",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    },
    {
      id: "5",
      user: {
        id: "user-emma",
        name: "Emma Wilson",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        isUser: false,
      },
      hasStory: true,
      hasNew: true,
      thumbnail: "https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=300&h=400&fit=crop",
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    },
    {
      id: "6",
      user: {
        id: "user-david",
        name: "David Kim",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
        isUser: false,
      },
      hasStory: true,
      hasNew: false,
      thumbnail: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&h=400&fit=crop",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    },
    {
      id: "7",
      user: {
        id: "user-lisa",
        name: "Lisa Park",
        avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face",
        isUser: false,
      },
      hasStory: true,
      hasNew: true,
      thumbnail: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=300&h=400&fit=crop",
      timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    },
  ];

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 280; // Increased for larger cards
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleStoryClick = (story: Story, index: number) => {
    if (story.user.isUser) {
      onCreateStory();
    } else {
      onViewStory(index);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 py-3 sm:py-4 mb-4 sm:mb-6">
      <div className="relative max-w-full">
        {/* Left scroll button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg border hidden sm:flex h-8 w-8 hover:bg-gray-50"
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Stories container */}
        <div
          ref={scrollRef}
          className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide px-4 sm:px-12"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitScrollbar: { display: "none" }
          }}
        >
          {stories.map((story, index) => (
            <div
              key={story.id}
              className="flex-shrink-0 cursor-pointer group"
              onClick={() => handleStoryClick(story, index)}
            >
              <div className="flex flex-col items-center w-24 sm:w-28">
                {/* Large square story card */}
                <div className="relative w-24 h-32 sm:w-28 sm:h-36">
                  {/* Story background */}
                  <div
                    className={cn(
                      "w-full h-full rounded-xl overflow-hidden transition-all duration-200 group-hover:scale-105",
                      story.user.isUser
                        ? "bg-gradient-to-b from-blue-400 to-blue-600"
                        : "bg-gray-200"
                    )}
                    style={{
                      backgroundImage: !story.user.isUser && story.thumbnail
                        ? `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.4)), url(${story.thumbnail})`
                        : undefined,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    {/* Gradient border for new stories */}
                    {story.hasNew && !story.user.isUser && (
                      <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400/20 via-red-500/20 to-purple-600/20 rounded-xl" />
                    )}

                    {/* Profile picture */}
                    <div className="absolute top-2 left-2">
                      <div
                        className={cn(
                          "w-8 h-8 sm:w-10 sm:h-10 rounded-full p-[2px] transition-all duration-200",
                          story.user.isUser
                            ? "bg-white/20"
                            : story.hasNew
                            ? "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600"
                            : "bg-white/50"
                        )}
                      >
                        <div className="w-full h-full bg-white rounded-full p-[1px]">
                          <Avatar className="w-full h-full">
                            <AvatarImage src={story.user.avatar} />
                            <AvatarFallback className="text-[10px] sm:text-xs">
                              {story.user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                    </div>

                    {/* Create story plus icon */}
                    {story.user.isUser && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
                          <Plus className="w-6 h-6 sm:w-7 sm:h-7 text-blue-500" />
                        </div>
                      </div>
                    )}

                    {/* Live indicator for very recent stories */}
                    {!story.user.isUser && story.timestamp &&
                     Date.now() - story.timestamp.getTime() < 60 * 60 * 1000 && (
                      <div className="absolute top-2 right-2 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full flex items-center justify-center border border-white">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse" />
                      </div>
                    )}

                    {/* Story name overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <p className="text-xs sm:text-sm font-semibold text-white drop-shadow-md truncate">
                        {story.user.isUser ? "Create story" : story.user.name}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right scroll button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg border hidden sm:flex h-8 w-8 hover:bg-gray-50"
          onClick={() => scroll("right")}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default EnhancedStoriesSection;
