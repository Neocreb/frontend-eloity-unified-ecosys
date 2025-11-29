import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getErrorMessage } from '@/utils/utils';

export interface VideoItem {
  id: string;
  url: string;
  thumbnail: string;
  title: string;
  description: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    username: string;
    verified: boolean;
  };
  stats: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  duration: number;
  timestamp: string;
  tags: string[];
  isLiked: boolean;
  isFollowing: boolean;
}

export const useVideos = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      
      // Fetch video posts from posts table
      const { data: videoPosts, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            user_id,
            full_name,
            username,
            avatar_url,
            is_verified
          )
        `)
        .eq('type', 'video')
        .not('video_url', 'is', null)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Transform to VideoItem format
      const transformedVideos: VideoItem[] = (videoPosts || []).map(post => {
        const profile = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
        
        return {
          id: post.id,
          url: post.video_url || '',
          thumbnail: post.image_url || '',
          title: post.content.slice(0, 50),
          description: post.content,
          user: {
            id: post.user_id,
            name: profile?.full_name || 'Anonymous',
            avatar: profile?.avatar_url || '',
            username: profile?.username || 'user',
            verified: profile?.is_verified || false
          },
          stats: {
            likes: 0,
            comments: 0,
            shares: 0,
            views: 0
          },
          duration: 0,
          timestamp: post.created_at,
          tags: post.tags || [],
          isLiked: false,
          isFollowing: false
        };
      });

      setVideos(transformedVideos);
    } catch (error) {
      console.error('Error fetching videos:', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [user]);

  return { videos, loading, refetch: fetchVideos };
};
