// @ts-nocheck
import { useState, useEffect, useCallback } from "react";
import { Post } from "@/types/post";
import { PostComment } from "@/types/user";
import { useNotification } from "@/hooks/use-notification";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { CreatePost } from "@/types/post";
import { notificationService } from "@/services/notificationService";
import { PostService } from "@/services/postService";

type CreatePostParams = {
  content: string;
  mediaUrl?: string;
  location?: string | null;
  taggedUsers?: string[];
  poll?: {
    question: string;
    options: string[];
  };
};

export const useFeed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [postComments, setPostComments] = useState<Record<string, PostComment[]>>({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const notification = useNotification();
  const { user } = useAuth();

  const PAGE_SIZE = 5; // Number of posts per page

  // Format date as "X time ago"
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Load posts with pagination using PostService
  useEffect(() => {
    let aborted = false;
    const load = async () => {
      setIsLoading(true);
      try {
        if (!user?.id) {
          setIsLoading(false);
          return;
        }

        const data = await PostService.getFeedPosts(user.id, PAGE_SIZE, (page - 1) * PAGE_SIZE);
        
        if (aborted) return;

        const mapped: Post[] = data.map((row: any) => ({
          id: row.id,
          author: {
            name: row.author?.full_name || row.author?.username || 'User',
            username: row.author?.username || 'user',
            avatar: row.author?.avatar_url || '/placeholder.svg',
            verified: !!row.author?.is_verified,
          },
          content: row.content,
          image: row.image_url || undefined,
          location: row.location || null,
          taggedUsers: row.tagged_users || null,
          createdAt: row.created_at,
          likes: row.likes_count || 0,
          comments: row.comments_count || 0,
          shares: 0,
        }));

        // Initialize comments map for these posts
        const initialComments: Record<string, PostComment[]> = {};
        mapped.forEach(p => { initialComments[p.id] = []; });
        setPostComments(prev => page === 1 ? initialComments : { ...prev, ...initialComments });

        setPosts(prev => page === 1 ? mapped : [...prev, ...mapped]);
        setHasMore(data.length === PAGE_SIZE);
      } catch (e) {
        console.error('Error loading posts from PostService:', e);
      } finally {
        if (!aborted) setIsLoading(false);
      }
    };
    load();
    return () => { aborted = true; };
  }, [page, user?.id]);

  const loadMorePosts = () => {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  // Create a post using PostService
  const handleCreatePost = useCallback(async ({
    content,
    mediaUrl,
    location,
    taggedUsers = [],
    poll
  }: CreatePostParams) => {
    if (!user?.id) {
      notification.error('Please sign in to post');
      return;
    }

    try {
      const postData = {
        user_id: user.id,
        content,
        image_url: mediaUrl || null,
        location: location || null,
        tagged_users: taggedUsers || null,
      };

      const data = await PostService.createPost(postData);
      
      if (!data) {
        throw new Error('Failed to create post');
      }

      const newPost: Post = {
        id: data.id,
        author: {
          name: user.name || 'You',
          username: user.profile?.username || 'you',
          avatar: user.avatar || '/placeholder.svg',
          verified: user.profile?.is_verified || false,
        },
        content: data.content,
        image: data.image_url || undefined,
        location: data.location || null,
        taggedUsers: data.tagged_users || null,
        createdAt: data.created_at,
        likes: 0,
        comments: 0,
        shares: 0,
        poll,
      };

      setPosts(prev => [newPost, ...prev]);
      setPostComments(prev => ({ ...prev, [newPost.id]: [] }));
      notification.success('Post created successfully');
    } catch (e: any) {
      console.error('Create post failed:', e?.message || e);
      notification.error(e?.message || 'Failed to create post');
    }
  }, [user, notification]);

  const handleAddComment = useCallback(async (postId: string, commentText: string) => {
    if (!commentText || !commentText.trim()) return;
    if (!user?.id) {
      notification.error('Please sign in to comment');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('post_comments')
        .insert({ post_id: postId, user_id: user.id, content: commentText })
        .select('id, content, created_at, post_id, user_id, updated_at, profiles:user_id(full_name, username, avatar_url, is_verified)')
        .single();
      if (error) throw error;

      const newComment: PostComment = {
        id: data.id,
        post_id: data.post_id,
        user_id: data.user_id,
        content: data.content,
        created_at: data.created_at,
        user: {
          name: data.profiles?.full_name || user.name || 'You',
          username: data.profiles?.username || user.profile?.username || 'you',
          avatar: data.profiles?.avatar_url || user.avatar || '/placeholder.svg',
          is_verified: !!data.profiles?.is_verified,
        },
      };

      setPostComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newComment]
      }));

      setPosts(prev => prev.map(post =>
        post.id === postId
          ? { ...post, comments: post.comments + 1 }
          : post
      ));

      // Optional: notify post author via existing service (needs real author id)
      const post = posts.find(p => p.id === postId);
      if (post && post.author.username !== user?.profile?.username) {
        await notificationService.createNotification(
          'post-author-id',
          'comment',
          'New comment on your post',
          `${user?.name || 'Someone'} commented on your post: ${commentText.substring(0, 50)}...`
        );
      }

      notification.success('Comment added');
    } catch (e: any) {
      console.error('Add comment failed:', e?.message || e);
      notification.error(e?.message || 'Failed to add comment');
    }
  }, [user, notification, posts]);

  // Realtime: comments and likes
  useEffect(() => {
    const channel = supabase.channel('realtime_feed');

    channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'post_comments' }, (payload: any) => {
      const row = payload.new;
      setPostComments(prev => ({
        ...prev,
        [row.post_id]: [...(prev[row.post_id] || []), {
          id: row.id,
          post_id: row.post_id,
          user_id: row.user_id,
          content: row.content,
          created_at: row.created_at,
          user: { name: 'Someone', username: 'user', avatar: '/placeholder.svg', is_verified: false },
        }],
      }));
      setPosts(prev => prev.map(p => p.id === row.post_id ? { ...p, comments: p.comments + 1 } : p));
    });

    channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'post_likes' }, (payload: any) => {
      const row = payload.new;
      setPosts(prev => prev.map(p => p.id === row.post_id ? { ...p, likes: p.likes + 1 } : p));
    });

    channel.on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'post_likes' }, (payload: any) => {
      const row = payload.old;
      setPosts(prev => prev.map(p => p.id === row.post_id ? { ...p, likes: Math.max(0, p.likes - 1) } : p));
    });

    channel.subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return {
    posts,
    isLoading,
    postComments,
    hasMore,
    loadMorePosts,
    handleCreatePost,
    handleAddComment
  };
};
