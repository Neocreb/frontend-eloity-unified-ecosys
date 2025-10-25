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
}

const EnhancedStoriesSection: React.FC<EnhancedStoriesSectionProps> = ({
  onCreateStory,
  userStories,
  onViewStory
}) => {
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [stories, setStories] = useState<Story[]>([]);

  // Fetch real stories data from the database
  useEffect(() => {
    const fetchStories = async () => {
      try {
        // Fetch recent stories from the database
        // Using the correct table name and schema based on Supabase setup
        const { data, error } = await supabase
          .from('stories')
          .select(`
            id,
            user_id,
            created_at,
            media_url,
            profiles:user_id(
              username,
              full_name,
              avatar_url
            )
          `)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) {
          console.error("Error fetching stories:", error);
          throw error;
        }

        // Transform the data to match our Story interface
        const fetchedStories: Story[] = (data || []).map((story: any) => ({
          id: story.id,
          user: {
            id: story.user_id,
            name: story.profiles?.full_name || story.profiles?.username || "Unknown User",
            avatar: story.profiles?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
            isUser: story.user_id === user?.id
          },
          hasStory: true,
          hasNew: new Date(story.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000), // New if created in last 24 hours
          thumbnail: story.media_url,
          timestamp: new Date(story.created_at)
        }));

        // Add "Create story" option for current user
        const createStoryOption: Story = {
          id: "create",
          user: {
            id: user?.id || "current-user",
            name: "Create story",
            avatar: user?.user_metadata?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
            isUser: true,
          },
          hasStory: false,
          hasNew: false,
        };

        // Combine create story option with fetched stories
        setStories([createStoryOption, ...fetchedStories]);
      } catch (error) {
        console.error("Error fetching stories:", error);
        // Only show create story option if database fetch fails
        const createStoryOption: Story = {
          id: "create",
          user: {
            id: user?.id || "current-user",
            name: "Create story",
            avatar: user?.user_metadata?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
            isUser: true,
          },
          hasStory: false,
          hasNew: false,
        };
        setStories([createStoryOption]);
      }
    };

    if (user) {
      fetchStories();
    }
  }, [user]);

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
    if (story.user.isUser && !story.hasStory) {
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
                  >
                    {story.thumbnail ? (
                      <img
                        src={story.thumbnail}
                        alt={`${story.user.name}'s story`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          {story.user.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    {story.hasNew && (
                      <div className="absolute inset-0 border-2 border-blue-500 rounded-xl pointer-events-none"></div>
                    )}
                  </div>

                  {/* User avatar with ring */}
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-10 h-10 sm:w-12 sm:h-12">
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
                          <AvatarFallback className="text-xs">
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

                {/* User name */}
                <p className="text-xs text-center mt-4 max-w-[96px] sm:max-w-[112px] truncate">
                  {story.user.name}
                </p>
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