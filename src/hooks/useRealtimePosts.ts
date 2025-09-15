import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Post {
  id: string;
  user_id: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'audio';
  image_url?: string;
  video_url?: string;
  filter?: string;
  tags?: string[];
  softpoints: number;
  created_at: string;
  updated_at: string;
  author: {
    user_id: string;
    name?: string;
    username?: string;
    avatar_url?: string;
    is_verified?: boolean;
  };
  likes_count?: number;
  comments_count?: number;
  is_liked?: boolean;
  recent_comments?: Array<{
    id: string;
    content: string;
    user_id: string;
    created_at: string;
    user: {
      name?: string;
      username?: string;
      avatar_url?: string;
    };
  }>;
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user: {
    name?: string;
    username?: string;
    avatar_url?: string;
  };
}

export const useRealtimePosts = (limit: number = 20) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch posts with all related data
  const fetchPosts = useCallback(async (reset: boolean = false) => {
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
          ),
          post_comments (
            id,
            content,
            user_id,
            created_at,
            user:profiles!post_comments_user_id_fkey (
              name,
              username,
              avatar_url
            )
          )
        `)
        .order('created_at', { ascending: false })
        .range(currentOffset, currentOffset + limit - 1);

      if (error) throw error;

      const postsWithCounts = data.map(post => ({
        ...post,
        likes_count: post.post_likes?.length || 0,
        comments_count: post.post_comments?.length || 0,
        is_liked: user ? post.post_likes?.some((like: any) => like.user_id === user.id) : false,
        recent_comments: post.post_comments?.slice(-2) || [],
      }));

      if (reset) {
        setPosts(postsWithCounts);
        setOffset(limit);
      } else {
        setPosts(prev => [...prev, ...postsWithCounts]);
        setOffset(prev => prev + limit);
      }

      setHasMore(data.length === limit);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [offset, limit, user, toast]);

  // Create a new post
  const createPost = useCallback(async (
    content: string,
    type: 'text' | 'image' | 'video' = 'text',
    mediaUrl?: string,
    tags?: string[]
  ) => {
    if (!user?.id) return false;

    try {
      const postData: any = {
        user_id: user.id,
        content,
        type,
        tags,
        softpoints: 0,
      };

      if (type === 'image') {
        postData.image_url = mediaUrl;
      } else if (type === 'video') {
        postData.video_url = mediaUrl;
      }

      const { error } = await supabase
        .from('posts')
        .insert(postData);

      if (error) throw error;

      toast({
        title: "Post Created",
        description: "Your post has been published successfully",
      });

      // Refresh posts
      await fetchPosts(true);
      return true;
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
      return false;
    }
  }, [user?.id, fetchPosts, toast]);

  // Like/unlike a post
  const toggleLike = useCallback(async (postId: string) => {
    if (!user?.id) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.is_liked) {
        // Unlike
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id,
          });

        if (error) throw error;
      }

      // Update local state optimistically
      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? {
              ...p,
              is_liked: !p.is_liked,
              likes_count: p.is_liked ? p.likes_count! - 1 : p.likes_count! + 1,
            }
          : p
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  }, [user?.id, posts]);

  // Add a comment
  const addComment = useCallback(async (postId: string, content: string) => {
    if (!user?.id || !content.trim()) return false;

    try {
      const { error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: content.trim(),
        });

      if (error) throw error;

      toast({
        title: "Comment Added",
        description: "Your comment has been posted",
      });

      return true;
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
      return false;
    }
  }, [user?.id, toast]);

  // Set up real-time subscriptions
  useEffect(() => {
    const postsChannel = supabase
      .channel('posts_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts',
        },
        (payload) => {
          console.log('New post:', payload);
          // Refresh posts to get complete data with relations
          fetchPosts(true);
        }
      )
      .subscribe();

    const likesChannel = supabase
      .channel('likes_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_likes',
        },
        (payload) => {
          console.log('Like change:', payload);
          const postId = payload.new?.post_id || payload.old?.post_id;
          if (postId) {
            // Update the specific post's like count
            setPosts(prev => prev.map(post => {
              if (post.id === postId) {
                const isCurrentUserLike = 
                  (payload.new?.user_id === user?.id) || 
                  (payload.old?.user_id === user?.id);
                
                if (payload.eventType === 'INSERT') {
                  return {
                    ...post,
                    likes_count: post.likes_count! + 1,
                    is_liked: isCurrentUserLike ? true : post.is_liked,
                  };
                } else if (payload.eventType === 'DELETE') {
                  return {
                    ...post,
                    likes_count: Math.max(0, post.likes_count! - 1),
                    is_liked: isCurrentUserLike ? false : post.is_liked,
                  };
                }
              }
              return post;
            }));
          }
        }
      )
      .subscribe();

    const commentsChannel = supabase
      .channel('comments_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'post_comments',
        },
        (payload) => {
          console.log('New comment:', payload);
          const newComment = payload.new;
          
          // Update the specific post's comment count
          setPosts(prev => prev.map(post => 
            post.id === newComment.post_id
              ? { ...post, comments_count: post.comments_count! + 1 }
              : post
          ));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, [user?.id, fetchPosts]);

  // Initial load
  useEffect(() => {
    fetchPosts(true);
  }, []);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchPosts(false);
    }
  }, [loading, hasMore, fetchPosts]);

  return {
    posts,
    loading,
    hasMore,
    loadMore,
    createPost,
    toggleLike,
    addComment,
    refetch: () => fetchPosts(true),
  };
};