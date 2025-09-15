import { useState, useEffect } from 'react';
import type { VideoItem as Video } from '@/types/video';
import { apiClient } from '@/lib/api';

export const useVideoData = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadVideos = async () => {
      try {
        const data = await apiClient.getPosts(50, 0) as any;
        const items = (Array.isArray((data as any)?.data) ? (data as any).data : Array.isArray(data) ? data : []) as any[];
        const mapped: Video[] = items
          .filter((p: any) => (p.type || '').toLowerCase() === 'video')
          .map((p: any) => ({
            id: p.id,
            url: p.media?.[0]?.url || p.video_url || '',
            thumbnail: p.thumbnail || p.media?.[0]?.thumbnail || '/placeholder.svg',
            description: p.content || '',
            likes: p.likes_count || 0,
            comments: p.comments_count || 0,
            shares: p.shares_count || 0,
            author: {
              name: p.author?.displayName || p.author?.username || 'User',
              username: p.author?.username || 'user',
              avatar: p.author?.avatar || '/placeholder.svg',
              verified: !!p.author?.verified,
            },
            isFollowing: false,
          }));
        setVideos(mapped);
      } catch (error) {
        console.error('Error loading videos:', error);
        setVideos([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadVideos();
  }, []);

  const handleLike = (videoId: string) => {
    setLikedVideos(prev => {
      const next = new Set(prev);
      if (next.has(videoId)) next.delete(videoId); else next.add(videoId);
      return next;
    });
    setVideos(prev => prev.map(v => v.id === videoId ? { ...v, likes: likedVideos.has(videoId) ? Math.max(0, v.likes - 1) : v.likes + 1 } : v));
  };

  const handleFollow = (username: string) => {
    setFollowedUsers(prev => {
      const next = new Set(prev);
      if (next.has(username)) next.delete(username); else next.add(username);
      return next;
    });
  };

  const handleShare = (videoId: string) => {
    navigator.clipboard?.writeText(`https://softchat.com/video/${videoId}`);
  };

  const nextVideo = () => {
    if (currentIndex < videos.length - 1) setCurrentIndex(i => i + 1);
  };

  const prevVideo = () => {
    if (currentIndex > 0) setCurrentIndex(i => i - 1);
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
    currentVideo: videos[currentIndex] || null,
  };
};
