import { useState, useEffect, useCallback } from "react";
import { videoService, Video } from "@/services/videoService";
import { ContentItem, VideoItem, AdItem } from "@/types/video";

// Ad data - in a real implementation, this would come from an ad service
const adData = {
  id: "ad-1",
  title: "Special Offer",
  description: "Check out our amazing products!",
  cta: "Learn More",
  image: "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=400",
  url: "#",
  sponsor: "Sponsored"
};

export const useVideos = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch videos from the service
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);
        const videoData = await videoService.getVideos(20, 0);
        
        // Transform Video objects to VideoItem objects
        const transformedVideos: VideoItem[] = videoData.map((video: Video) => ({
          id: video.id,
          url: video.video_url,
          thumbnail: video.thumbnail_url || "",
          description: video.description || "",
          likes: video.likes_count,
          comments: video.comments_count,
          shares: video.shares_count || 0,
          views: video.views_count,
          author: {
            name: video.user?.full_name || "Unknown User",
            username: video.user?.username || "unknown",
            avatar: video.user?.avatar_url || "",
            verified: video.user?.is_verified || false
          },
          isFollowing: false, // This would need to be fetched from a following service
          duration: video.duration || 0,
          timestamp: video.created_at,
          tags: video.tags || [],
          category: video.category || "Entertainment"
        }));
        
        setVideos(transformedVideos);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching videos:", err);
        setError("Failed to load videos");
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  // Combine videos and ads into a single content feed
  const allItems: ContentItem[] = videos.length > 0 ? [
    ...videos.slice(0, 2),
    { isAd: true, ad: adData } as AdItem,
    ...videos.slice(2)
  ] : [];

  const handleNextVideo = useCallback(() => {
    setCurrentIndex((prev) =>
      prev < allItems.length - 1 ? prev + 1 : 0
    );
  }, [allItems.length]);

  const handlePrevVideo = useCallback(() => {
    setCurrentIndex((prev) =>
      prev > 0 ? prev - 1 : allItems.length - 1
    );
  }, [allItems.length]);

  const getCurrentItem = (): ContentItem | null => {
    if (allItems.length === 0) return null;
    return allItems[currentIndex % allItems.length];
  };

  return {
    currentItem: getCurrentItem(),
    handleNextVideo,
    handlePrevVideo,
    allItems,
    currentIndex,
    loading,
    error,
    videos
  };
};