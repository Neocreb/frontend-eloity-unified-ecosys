// @ts-nocheck
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getErrorMessage } from '@/utils/utils';

export interface FeedPost {
  id: string;
  user_id: string;
  content: string;
  type: 'text' | 'image' | 'video';
  image_url?: string;
  video_url?: string;
  tags?: string[];
  filter?: string;
  eloityPoints?: number;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    name: string;
    username: string;
    avatar_url?: string;
    is_verified?: boolean;
  };
  likes?: number;
  comments?: number;
  isLiked?: boolean;
}

export const useFeedPosts = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      // Fetch posts with author profile data
      const { data: postsData, error: postsError } = await supabase
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
        .order('created_at', { ascending: false })
        .limit(50);

      if (postsError) throw postsError;

      // Fetch like counts and user's liked posts
      const postIds = postsData?.map(p => p.id) || [];
      
      const { data: likesData } = await supabase
        .from('post_likes')
        .select('post_id, user_id')
        .in('post_id', postIds);

      const { data: commentsData } = await supabase
        .from('post_comments')
        .select('post_id')
        .in('post_id', postIds);

      // Transform data
      const transformedPosts: FeedPost[] = (postsData || []).map(post => {
        const profile = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
        const postLikes = likesData?.filter(l => l.post_id === post.id) || [];
        const postComments = commentsData?.filter(c => c.post_id === post.id) || [];
        
        return {
          ...post,
          author: profile ? {
            id: profile.user_id,
            name: profile.full_name || 'Anonymous',
            username: profile.username || 'user',
            avatar_url: profile.avatar_url,
            is_verified: profile.is_verified
          } : undefined,
          likes: postLikes.length,
          comments: postComments.length,
          isLiked: user ? postLikes.some(l => l.user_id === user.id) : false
        };
      });

      setPosts(transformedPosts);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      console.error('Error fetching posts:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('posts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { posts, loading, refetch: fetchPosts };
};
