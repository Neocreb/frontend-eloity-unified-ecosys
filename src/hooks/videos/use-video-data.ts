import { useState, useEffect } from 'react';
import { mockVideos } from '@/data/mockVideosData';
import type { VideoItem as Video } from '@/types/video';

export const useVideoData = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadVideos = async () => {
      try {
        console.log("Loading video data...");
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setVideos(mockVideos);
        setIsLoading(false);
        console.log("Video data loaded:", mockVideos.length, "videos");
      } catch (error) {
        console.error("Error loading videos:", error);
        setIsLoading(false);
      }
    };

    loadVideos();
  }, []);

  const handleLike = (videoId: string) => {
    console.log("Toggling like for video:", videoId);
    setLikedVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });

    // Update video likes count
    setVideos(prev => prev.map(video => 
      video.id === videoId 
        ? { 
            ...video, 
            likes: likedVideos.has(videoId) ? video.likes - 1 : video.likes + 1 
          }
        : video
    ));
  };

  const handleFollow = (username: string) => {
    console.log("Toggling follow for user:", username);
    setFollowedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(username)) {
        newSet.delete(username);
      } else {
        newSet.add(username);
      }
      return newSet;
    });
  };

  const handleShare = (videoId: string) => {
    console.log("Sharing video:", videoId);
    // In a real app, this would open a share dialog or copy link
    navigator.clipboard?.writeText(`https://softchat.com/video/${videoId}`);
  };

  const nextVideo = () => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevVideo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  return {
    videos,
    isLoading,
    currentIndex,
    likedVideos,
    followedUsers,
    handleLike,
    handleFollow,
    handleShare,
    nextVideo,
    prevVideo,
    currentVideo: videos[currentIndex] || null
  };
};
