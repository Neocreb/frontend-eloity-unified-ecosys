import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { useNotification } from '@/hooks/use-notification';
import { useAuth } from '@/contexts/AuthContext';
import type { VideoItem as Video } from '@/types/video';

interface VideoResponse {
  videos: Video[];
  total: number;
  hasMore: boolean;
}

export const useVideoData = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const notification = useNotification();
  const { user } = useAuth();

  const PAGE_SIZE = 10;

  // Load videos from API
  const loadVideos = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (pageNum === 1) setIsLoading(true);
      
      const offset = (pageNum - 1) * PAGE_SIZE;
      const response = await apiClient.getVideos(PAGE_SIZE, offset, 'all') as VideoResponse;
      
      const videoData = response.videos || [];
      
      if (append) {
        setVideos((prev: Video[]) => [...prev, ...videoData]);
      } else {
        setVideos(videoData);
      }
      
      setHasMore(videoData.length === PAGE_SIZE);
      
      // Load user interaction data if authenticated
      if (user?.id && videoData.length > 0) {
        await loadUserInteractions(videoData.map((v: Video) => v.id));
      }
      
    } catch (error) {
      console.error('Error loading videos:', error);
      notification.error('Failed to load videos');
      // Provide fallback empty array
      setVideos([]);
    } finally {
      if (pageNum === 1) setIsLoading(false);
    }
  }, [user?.id, notification]);

  // Load user interactions (likes, follows)
  const loadUserInteractions = async (videoIds: string[]) => {
    try {
      // This would typically be separate endpoints in a real API
      // For now, we'll simulate the data structure
      const interactions = {
        likedVideos: new Set<string>(),
        followedUsers: new Set<string>()
      };
      
      setLikedVideos(interactions.likedVideos);
      setFollowedUsers(interactions.followedUsers);
    } catch (error) {
      console.error('Error loading user interactions:', error);
    }
  };

  // Initial load
  useEffect(() => {
    loadVideos(1, false);
  }, [loadVideos]);

  // Load more videos (pagination)
  const loadMoreVideos = useCallback(() => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadVideos(nextPage, true);
    }
  }, [isLoading, hasMore, page, loadVideos]);

  // Handle like action
  const handleLike = useCallback(async (videoId: string) => {
    if (!user?.id) {
      notification.error('Please sign in to like videos');
      return;
    }

    try {
      const isLiked = likedVideos.has(videoId);
      
      if (isLiked) {
        await apiClient.unlikeVideo(videoId);
        setLikedVideos((prev: Set<string>) => {
          const newSet = new Set(prev);
          newSet.delete(videoId);
          return newSet;
        });
      } else {
        await apiClient.likeVideo(videoId);
        setLikedVideos((prev: Set<string>) => {
          const newSet = new Set(prev);
          newSet.add(videoId);
          return newSet;
        });
      }

      // Update video likes count locally
      setVideos((prev: Video[]) => prev.map((video: Video) => 
        video.id === videoId 
          ? { 
              ...video, 
              likes: isLiked ? video.likes - 1 : video.likes + 1 
            }
          : video
      ));
      
    } catch (error) {
      console.error('Error toggling like:', error);
      notification.error('Failed to update like status');
    }
  }, [user?.id, likedVideos, notification]);

  // Handle follow action
  const handleFollow = useCallback(async (username: string, userId: string) => {
    if (!user?.id) {
      notification.error('Please sign in to follow users');
      return;
    }

    try {
      const isFollowed = followedUsers.has(username);
      
      if (isFollowed) {
        await apiClient.unfollowUser(user.id, userId);
        setFollowedUsers((prev: Set<string>) => {
          const newSet = new Set(prev);
          newSet.delete(username);
          return newSet;
        });
      } else {
        await apiClient.followUser(user.id, userId);
        setFollowedUsers((prev: Set<string>) => {
          const newSet = new Set(prev);
          newSet.add(username);
          return newSet;
        });
      }
      
    } catch (error) {
      console.error('Error toggling follow:', error);
      notification.error('Failed to update follow status');
    }
  }, [user?.id, followedUsers, notification]);

  // Handle share action
  const handleShare = useCallback(async (videoId: string) => {
    try {
      const shareUrl = `${window.location.origin}/video/${videoId}`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'Check out this video on Eloity',
          url: shareUrl
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        notification.success('Video link copied to clipboard!');
      } else {
        // Fallback: create a temporary input element
        const tempInput = document.createElement('input');
        tempInput.value = shareUrl;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        notification.success('Video link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing video:', error);
      notification.error('Failed to share video');
    }
  }, [notification]);

  const nextVideo = useCallback(() => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex((prev: number) => prev + 1);
    } else if (hasMore) {
      // Auto-load more videos when reaching the end
      loadMoreVideos();
    }
  }, [currentIndex, videos.length, hasMore, loadMoreVideos]);

  const prevVideo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev: number) => prev - 1);
    }
  }, [currentIndex]);

  return {
    videos,
    isLoading,
    currentIndex,
    likedVideos,
    followedUsers,
    hasMore,
    handleLike,
    handleFollow,
    handleShare,
    nextVideo,
    prevVideo,
    loadMoreVideos,
    refreshVideos: () => loadVideos(1, false),
    currentVideo: videos[currentIndex] || null
  };
};
