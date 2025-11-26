// components/stories/Stories.tsx
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle } from "lucide-react";
import { useNotification } from "@/hooks/use-notification";
import { CreateStoryModal } from "./CreateStory";
import { useAuth } from "@/contexts/AuthContext";
import { SponsoredStory } from "@/components/ads/SponsoredStory";
import { adSettings } from "../../../config/adSettings";
import { useStories } from "@/hooks/use-stories";
import StoryViewer from "./StoryViewer";
import { supabase } from '@/integrations/supabase/client';
import { storiesService } from '@/services/storiesService';

// Define UserStory interface locally since we can't import it directly
interface UserStory {
  id: string;
  user_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  caption: string | null;
  expires_at: string;
  views_count: number;
  likes_count: number;
  created_at: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
}

export type Story = {
  id: string;
  username: string;
  avatar: string;
  hasNewStory?: boolean;
  isUser?: boolean;
  stories?: UserStory[]; // Add stories array
};

const Stories = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [storiesWithAds, setStoriesWithAds] = useState<(Story | { id: string; type: 'sponsored_story' | 'ad_story' })[]>([]);
  const notification = useNotification();
  const { user } = useAuth();
  const { stories, loading, error, refresh } = useStories();

  // Create stories list with ads
  useEffect(() => {
    const createStoriesWithAds = () => {
      const storyItems = [];
      let nativeAdCounter = 0;

      // Add Eloity sponsored story as first item if ads are enabled
      if (adSettings.enableAds) {
        storyItems.push({
          id: 'eloity-sponsored-story',
          type: 'sponsored_story' as const
        });
      }

      for (let i = 0; i < stories.length; i++) {
        storyItems.push(stories[i]);

        // Insert story ad every 5th story
        if ((i + 1) % adSettings.storyAdFrequency === 0 && adSettings.enableAds) {
          nativeAdCounter++;
          storyItems.push({
            id: `story-ad-${nativeAdCounter}`,
            type: 'ad_story' as const
          });
        }
      }

      return storyItems;
    };

    setStoriesWithAds(createStoriesWithAds());
  }, [stories]);

  const handleCreateStory = async (content: {
    text?: string;
    file?: File;
    type: 'audio' | 'video' | 'image' | null
  }) => {
    try {
      if (!user) {
        notification.error("Please log in to create stories");
        return;
      }

      if (!content.file || !content.type) {
        notification.error("Please select a file for your story");
        return;
      }

      notification.info("Uploading story...");

      // Upload file to Supabase storage
      const fileExt = content.file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('stories')
        .upload(fileName, content.file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        notification.error("Failed to upload media. Please try again.");
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('stories')
        .getPublicUrl(fileName);

      // Create story record
      await storiesService.createStory({
        media_url: publicUrl,
        media_type: content.type as 'image' | 'video',
        caption: content.text,
        expires_in_hours: 24
      }, user.id);

      notification.success("Story created successfully!");

      // Refresh stories
      refresh();
    } catch (error) {
      notification.error("Failed to create story");
      console.error("Error creating story:", error);
    }
  };

  const handleViewStory = (index: number) => {
    setCurrentStoryIndex(index);
    setIsStoryViewerOpen(true);
  };

  if (loading) {
    return (
      <div className="mb-6 overflow-x-auto">
        <div className="flex gap-4 pb-2">
          <div className="flex flex-col items-center space-y-1 min-w-[70px]">
            <div className="relative bg-gray-100 p-1 rounded-full cursor-pointer hover:bg-gray-200 transition-colors">
              <Avatar className="h-16 w-16 border-2 border-white animate-pulse">
                <AvatarFallback>SC</AvatarFallback>
              </Avatar>
              <div className="absolute bottom-1 right-1 bg-blue-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs border-2 border-white">
                <PlusCircle className="h-4 w-4" />
              </div>
            </div>
            <span className="text-xs">Create Story</span>
          </div>

          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center space-y-1 min-w-[70px]">
              <div className="relative bg-gray-200 p-[2px] rounded-full">
                <Avatar className="h-16 w-16 border-2 border-white animate-pulse">
                  <AvatarFallback>U{i}</AvatarFallback>
                </Avatar>
              </div>
              <span className="text-xs animate-pulse">Loading...</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 overflow-x-auto">
        <div className="flex gap-4 pb-2">
          {/* Create Story Button - Always first */}
          <div className="flex flex-col items-center space-y-1 min-w-[70px]">
            <div
              className="relative bg-gray-100 p-1 rounded-full cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Avatar className="h-16 w-16 border-2 border-white">
                <AvatarImage src={user?.user_metadata?.avatar || "/placeholder.svg"} alt={user?.user_metadata?.name || "@user"} />
                <AvatarFallback>{user?.user_metadata?.name?.substring(0, 2).toUpperCase() || "SC"}</AvatarFallback>
              </Avatar>
              <div className="absolute bottom-1 right-1 bg-blue-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs border-2 border-white">
                <PlusCircle className="h-4 w-4" />
              </div>
            </div>
            <span className="text-xs">Create Story</span>
          </div>

          {/* Stories with ads */}
          {storiesWithAds.map((item, index) => {
            if ('type' in item) {
              if (item.type === 'sponsored_story') {
                return (
                  <SponsoredStory
                    key={item.id}
                    title="Eloity"
                    isInternal={true}
                    onClick={() => {
                      console.log('Sponsored story clicked');
                      // Handle sponsored story click
                    }}
                  />
                );
              } else if (item.type === 'ad_story') {
                return (
                  <SponsoredStory
                    key={item.id}
                    title="Advertisement"
                    isInternal={false}
                    onClick={() => {
                      console.log('Ad story clicked');
                      // Handle ad story click
                    }}
                  />
                );
              }
            }

            // Regular story
            const story = item as Story;
            return (
              <div key={story.id} className="flex flex-col items-center space-y-1 min-w-[70px]">
                <div
                  className={`relative ${story.hasNewStory
                    ? 'bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 p-[2px]'
                    : 'bg-gray-200 p-[2px]'
                    } rounded-full cursor-pointer`}
                  onClick={() => handleViewStory(index - (adSettings.enableAds ? 1 : 0))} // Adjust index for ad
                >
                  <Avatar className="h-16 w-16 border-2 border-white">
                    <AvatarImage src={story.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{story.username?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                </div>
                <span className="text-xs">{story.username || "User"}</span>
              </div>
            );
          })}
        </div>
      </div>

      <CreateStoryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateStory}
      />

      {isStoryViewerOpen && (
        <StoryViewer
          stories={stories}
          initialIndex={currentStoryIndex}
          onClose={() => setIsStoryViewerOpen(false)}
          onStoryChange={setCurrentStoryIndex}
        />
      )}
    </>
  );
};

export default Stories;