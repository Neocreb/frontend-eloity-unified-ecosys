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


export type Story = {
  isUser: any;
  id: string;
  username: string;
  avatar: string;
  hasNewStory?: boolean;
};

interface StoriesProps {
  onViewStory?: (storyId: string) => void;
  onCreateStory?: () => void;
}

const Stories = ({ onViewStory, onCreateStory }: StoriesProps) => {
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
      let sponsoredAdCounter = 0;
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
      // Here you would upload the file to your storage (e.g., Firebase, S3)
      // and create the story in your database
      const formData = new FormData();
      if (content.text) formData.append('text', content.text);
      if (content.file) formData.append('file', content.file);
      if (content.type) formData.append('type', content.type);

      // Example API call:
      // const response = await fetch('/api/stories', {
      //   method: 'POST',
      //   body: formData
      // });
      // const data = await response.json();

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
                    <AvatarImage src={story.avatar} />
                    <AvatarFallback>{story.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </div>
                <span className="text-xs">{story.username}</span>
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