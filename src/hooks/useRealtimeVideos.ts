import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface VideoContent {
  id: string;
  user_id: string;
  content: string;
  video_url: string;
  thumbnail_url?: string;
  filter?: string;
  tags?: string[];
  duration?: number;
  view_count: number;
  like_count: number;
  comment_count: number;
  share_count: number;
  softpoints: number;
  is_live?: boolean;
  live_viewers?: number;
  created_at: string;
  updated_at: string;
  author: {
    user_id: string;
    name?: string;
    username?: string;
    avatar_url?: string;
    is_verified?: boolean;
  };
  is_liked?: boolean;
  is_following?: boolean;
}

export interface VideoComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user: {
    name?: string;
    username?: string;
    avatar_url?: string;
  };
}

export const useRealtimeVideos = (limit: number = 20) => {
  const [videos, setVideos] = useState<VideoContent[]>([]);
  const [currentVideo, setCurrentVideo] = useState<VideoContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch videos from posts table where type is 'video'
  const fetchVideos = useCallback(async (reset: boolean = false) => {
    try {
      const currentOffset = reset ? 0 : offset;
      
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles!posts_user_id_fkey (
            user_id,
            name,
            username,
            avatar_url,
            is_verified
          ),
          post_likes (
            user_id
          )
        `)
        .eq('type', 'video')
        .not('video_url', 'is', null)
        .order('created_at', { ascending: false })
        .range(currentOffset, currentOffset + limit - 1);

      if (error) throw error;

      const videosWithCounts = data.map(video => ({
        id: video.id,
        user_id: video.user_id,
        content: video.content,
        video_url: video.video_url!,
        thumbnail_url: video.image_url,
        filter: video.filter,
        tags: video.tags,
        view_count: video.view_count || 0,
        like_count: Array.isArray(video.post_likes) ? video.post_likes.length : 0,
        comment_count: video.comment_count || 0,
        share_count: video.share_count || 0,
        softpoints: video.softpoints,
        created_at: video.created_at,
        updated_at: video.updated_at,
        author: video.author || {
          user_id: video.user_id,
          name: 'Unknown User',
          username: `user-${String(video.user_id || '').slice(0, 8)}`,
          avatar_url: '/placeholder.svg',
          is_verified: false,
        },
        is_liked: user ? video.post_likes?.some((like: any) => like.user_id === user.id) : false,
        is_following: false,
      }));

      if (reset) {
        setVideos(videosWithCounts);
        setOffset(limit);
      } else {
        setVideos(prev => [...prev, ...videosWithCounts]);
        setOffset(prev => prev + limit);
      }

      setHasMore(data.length === limit);
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast({
        title: "Error",
        description: "Failed to load videos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [offset, limit, user, toast]);

  // Upload a video
  const uploadVideo = useCallback(async (
    videoFile: File,
    thumbnailFile: File | null,
    metadata: {
      content: string;
      tags?: string[];
      filter?: string;
    }
  ) => {
    if (!user?.id) return false;

    try {
      setLoading(true);

      // Upload video file to Supabase Storage
      const videoFileName = `${user.id}/${Date.now()}_${videoFile.name}`;
      const { data: videoData, error: videoError } = await supabase.storage
        .from('videos')
        .upload(videoFileName, videoFile);

      if (videoError) throw videoError;

      // Get public URL for video
      const { data: videoUrlData } = supabase.storage
        .from('videos')
        .getPublicUrl(videoFileName);

      let thumbnailUrl = null;

      // Upload thumbnail if provided
      if (thumbnailFile) {
        const thumbnailFileName = `${user.id}/thumbnails/${Date.now()}_${thumbnailFile.name}`;
        const { data: thumbnailData, error: thumbnailError } = await supabase.storage
          .from('videos')
          .upload(thumbnailFileName, thumbnailFile);

        if (!thumbnailError) {
          const { data: thumbnailUrlData } = supabase.storage
            .from('videos')
            .getPublicUrl(thumbnailFileName);
          thumbnailUrl = thumbnailUrlData.publicUrl;
        }
      }

      // Create post record
      const { error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: metadata.content,
          type: 'video',
          video_url: videoUrlData.publicUrl,
          image_url: thumbnailUrl,
          filter: metadata.filter,
          tags: metadata.tags,
          softpoints: 0,
        });

      if (postError) throw postError;

      toast({
        title: "Video Uploaded",
        description: "Your video has been published successfully",
      });

      // Refresh videos
      await fetchVideos(true);
      return true;
    } catch (error) {
      console.error('Error uploading video:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload video. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id, fetchVideos, toast]);

  // Like/unlike a video
  const toggleLike = useCallback(async (videoId: string) => {
    if (!user?.id) return;

    try {
      const video = videos.find(v => v.id === videoId);
      if (!video) return;

      if (video.is_liked) {
        // Unlike
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', videoId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: videoId,
            user_id: user.id,
          });

        if (error) throw error;
      }

      // Update local state optimistically
      setVideos(prev => prev.map(v => 
        v.id === videoId 
          ? {
              ...v,
              is_liked: !v.is_liked,
              like_count: v.is_liked ? v.like_count - 1 : v.like_count + 1,
            }
          : v
      ));

      // Update current video if it's the one being liked
      if (currentVideo?.id === videoId) {
        setCurrentVideo(prev => prev ? {
          ...prev,
          is_liked: !prev.is_liked,
          like_count: prev.is_liked ? prev.like_count - 1 : prev.like_count + 1,
        } : null);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  }, [user?.id, videos, currentVideo]);

  // Track video view
  const trackView = useCallback(async (videoId: string) => {
    // In a real implementation, you'd track views in the database
    // For now, just update local state
    setVideos(prev => prev.map(v => 
      v.id === videoId 
        ? { ...v, view_count: v.view_count + 1 }
        : v
    ));
  }, []);

  // Set up real-time subscriptions for video updates
  useEffect(() => {
    const videosChannel = supabase
      .channel('videos_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts',
          filter: 'type=eq.video',
        },
        (payload) => {
          console.log('New video:', payload);
          fetchVideos(true);
        }
      )
      .subscribe();

    const likesChannel = supabase
      .channel('video_likes_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_likes',
        },
        (payload) => {
          const postId = payload.new?.post_id || payload.old?.post_id;
          if (postId) {
            // Update video like counts in real-time
            const isCurrentUserLike = 
              (payload.new?.user_id === user?.id) || 
              (payload.old?.user_id === user?.id);
            
            setVideos(prev => prev.map(video => {
              if (video.id === postId) {
                if (payload.eventType === 'INSERT') {
                  return {
                    ...video,
                    like_count: video.like_count + 1,
                    is_liked: isCurrentUserLike ? true : video.is_liked,
                  };
                } else if (payload.eventType === 'DELETE') {
                  return {
                    ...video,
                    like_count: Math.max(0, video.like_count - 1),
                    is_liked: isCurrentUserLike ? false : video.is_liked,
                  };
                }
              }
              return video;
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(videosChannel);
      supabase.removeChannel(likesChannel);
    };
  }, [user?.id, fetchVideos]);

  // Initial load
  useEffect(() => {
    fetchVideos(true);
  }, []);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchVideos(false);
    }
  }, [loading, hasMore, fetchVideos]);

  return {
    videos,
    currentVideo,
    setCurrentVideo,
    loading,
    hasMore,
    loadMore,
    uploadVideo,
    toggleLike,
    trackView,
    refetch: () => fetchVideos(true),
  };
};
