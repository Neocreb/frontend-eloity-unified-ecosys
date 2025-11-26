import React, { useState, useEffect } from 'react';
import { X, Heart, MessageCircle, Share2, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useStories } from '@/hooks/useStories';
import { useAuth } from '@/contexts/AuthContext';

// Define UserStory interface locally
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

interface Story {
  id: string;
  username: string;
  avatar: string;
  hasNewStory?: boolean;
  stories?: UserStory[];
}

interface StoryViewerProps {
  stories: Story[];
  initialIndex?: number;
  onClose: () => void;
  onStoryChange?: (index: number) => void;
}

const StoryViewer = ({ stories, initialIndex = 0, onClose, onStoryChange }: StoryViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();
  const { likeStory, viewStory } = useStories();

  const currentStory = stories[currentIndex];
  const currentMedia = currentStory?.stories?.[currentStoryIndex];

  // Auto-advance story
  useEffect(() => {
    if (!currentMedia) return;

    // Mark story as viewed
    viewStory(currentMedia.id);

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          // Move to next story segment
          if (currentStory.stories && currentStoryIndex < currentStory.stories.length - 1) {
            setCurrentStoryIndex(prevIndex => prevIndex + 1);
            return 0;
          } else {
            // Move to next user's story
            if (currentIndex < stories.length - 1) {
              setCurrentIndex(prevIndex => prevIndex + 1);
              setCurrentStoryIndex(0);
              onStoryChange?.(currentIndex + 1);
              return 0;
            } else {
              // End of stories
              onClose();
              return 100;
            }
          }
        }
        return prev + 2; // Progress speed
      });
    }, 100);

    return () => clearInterval(timer);
  }, [currentMedia, currentIndex, currentStoryIndex, stories.length]);

  // Reset progress when story changes
  useEffect(() => {
    setProgress(0);
  }, [currentIndex, currentStoryIndex]);

  const handleLike = async () => {
    if (currentMedia) {
      try {
        await likeStory(currentMedia.id);
      } catch (error) {
        console.error('Error liking story:', error);
      }
    }
  };

  const goToPreviousStory = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setCurrentStoryIndex(0);
      onStoryChange?.(currentIndex - 1);
    } else {
      onClose();
    }
  };

  const goToNextStory = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setCurrentStoryIndex(0);
      onStoryChange?.(currentIndex + 1);
    } else {
      onClose();
    }
  };

  if (!currentStory || !currentMedia) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-white p-2 rounded-full hover:bg-white/20 transition-colors"
      >
        <X size={24} />
      </button>

      {/* Progress bars */}
      <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
        {currentStory.stories?.map((_: any, index: number) => (
          <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-100 ease-linear"
              style={{
                width: index < currentStoryIndex ? '100%' : 
                       index === currentStoryIndex ? `${progress}%` : '0%'
              }}
            />
          </div>
        ))}
      </div>

      {/* User info */}
      <div className="absolute top-8 left-4 z-10 flex items-center gap-3">
        <Avatar className="h-8 w-8 border-2 border-white">
          <AvatarImage src={currentStory.avatar || "/placeholder.svg"} alt={currentStory.username} />
          <AvatarFallback>{currentStory.username?.substring(0, 2) || "U"}</AvatarFallback>
        </Avatar>
        <div className="text-white">
          <div className="font-semibold text-sm">{currentStory.username || "User"}</div>
          {currentMedia.created_at && (
            <div className="text-xs opacity-75">
              {new Date(currentMedia.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
      </div>

      {/* Navigation - Previous */}
      <button
        onClick={goToPreviousStory}
        className="absolute left-0 top-0 bottom-0 w-1/3 z-10"
      />

      {/* Navigation - Next */}
      <button
        onClick={goToNextStory}
        className="absolute right-0 top-0 bottom-0 w-1/3 z-10"
      />

      {/* Story content */}
      <div className="relative w-full h-full max-w-md mx-auto">
        {currentMedia.media_type === 'image' ? (
          <img
            src={currentMedia.media_url}
            alt={currentMedia.caption || 'Story'}
            className="w-full h-full object-contain"
          />
        ) : (
          <video
            src={currentMedia.media_url}
            autoPlay
            loop
            className="w-full h-full object-contain"
          />
        )}

        {/* Story caption */}
        {currentMedia.caption && (
          <div className="absolute bottom-20 left-4 right-4 text-white text-sm bg-black/50 p-2 rounded-lg">
            {currentMedia.caption}
          </div>
        )}

        {/* Action buttons */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-white hover:bg-white/20"
              onClick={handleLike}
            >
              <Heart size={24} />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:text-white hover:bg-white/20">
              <MessageCircle size={24} />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-white hover:text-white hover:bg-white/20">
              <Share2 size={24} />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:text-white hover:bg-white/20">
              <MoreHorizontal size={24} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryViewer;