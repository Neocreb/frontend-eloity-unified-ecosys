import { useState, useEffect, useCallback } from "react";
import { Post } from "@/types/post";
import { PostComment } from "@/types/user";
import { useNotification } from "@/hooks/use-notification";
import { useAuth } from "@/contexts/AuthContext";
import { CreatePost } from "@/types/post";
import { notificationService } from "@/services/notificationService";
import { realSocialService } from "@/services/realSocialService";

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

  // Load real posts from Supabase
  useEffect(() => {
    const loadRealPosts = async () => {
      try {
        setIsLoading(true);
        const realPosts = await realSocialService.getFeed(undefined, { limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE });

        // Transform Supabase data (mapped by service) to match Post interface
        const transformedPosts: Post[] = realPosts.map((p: any) => ({
          id: p.id,
          author: {
            name: (p.author && (p.author.name || p.author.full_name)) || "User",
            username: (p.author && (p.author.username || p.author.id)) || `user-${(p.userId || p.user_id || '').toString().slice(0, 8)}`,
            avatar: (p.author && (p.author.avatar || p.author.avatar_url)) || "/placeholder.svg",
            verified: !!(p.author && p.author.verified),
          },
          content: p.content,
          image: p.imageUrl || p.media_urls?.[0] || null,
          location: null,
          taggedUsers: null,
          createdAt: formatDate(p.createdAt || p.created_at),
          likes: p.likes || p.like_count || 0,
          comments: p.comments || p.comment_count || 0,
          shares: p.shares || p.share_count || 0,
          poll: null
        }));

        // For pagination, append or replace based on page
        if (page === 1) {
          setPosts(transformedPosts);
        } else {
          setPosts(prev => [...prev, ...transformedPosts]);
        }
        
        setHasMore(transformedPosts.length === PAGE_SIZE);

        // Initialize empty comments for posts
        const initialComments: Record<string, PostComment[]> = {};
        transformedPosts.forEach(post => {
          initialComments[post.id] = [];
        });
        setPostComments(prev => ({ ...prev, ...initialComments }));

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading posts:', error);
        setIsLoading(false);
      }
    };

    loadRealPosts();
  }, [page]);

  const loadMorePosts = () => {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  // Enhanced post creation with real Supabase integration
  const handleCreatePost = useCallback(async ({
    content,
    mediaUrl,
    location,
    taggedUsers = [],
    poll
  }: CreatePostParams) => {
    try {
      if (!user?.id) {
        notification.error("Must be logged in to create posts");
        return;
      }

      const newPost = await realSocialService.createPost({
        user_id: user.id,
        content,
        media_urls: mediaUrl ? [mediaUrl] : [],
        media_type: mediaUrl ? 'image' : undefined
      });

      // Transform to UI format and add to local state
      const transformedPost: Post = {
        id: newPost.id,
        author: {
          name: user?.name || "You",
          username: user?.profile?.username || "you",
          avatar: user?.avatar || "/placeholder.svg",
          verified: !!user?.profile?.is_verified,
        },
        content,
        image: mediaUrl,
        location: location || null,
        taggedUsers: taggedUsers || null,
        createdAt: "Just now",
        likes: 0,
        comments: 0,
        shares: 0,
        poll: poll
      };

      setPosts(prev => [transformedPost, ...prev]);

      // Initialize empty comments for the new post
      setPostComments(prev => ({
        ...prev,
        [newPost.id]: []
      }));

      notification.success("Post created successfully");
    } catch (error) {
      console.error('Error creating post:', error);
      notification.error("Failed to create post");
    }
  }, [user, notification]);

  const handleAddComment = useCallback(async (postId: string, commentText: string) => {
    if (!commentText || !commentText.trim()) return;

    const newComment: PostComment = {
      id: `new-${Date.now()}`,
      post_id: postId,
      user_id: user?.id || "current-user",
      content: commentText,
      created_at: new Date().toISOString(),
      user: {
        name: user?.name || "You",
        username: user?.profile?.username || "you",
        avatar: user?.avatar || "/placeholder.svg",
        is_verified: !!user?.profile?.is_verified
      }
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

    // Create notification for post author (if not commenting on own post)
    const post = posts.find(p => p.id === postId);
    if (post && post.author.username !== user?.profile?.username) {
      await notificationService.createNotification(
        'post-author-id', // In real app, get actual post author ID
        'comment',
        'New comment on your post',
        `${user?.name || 'Someone'} commented on your post: ${commentText.substring(0, 50)}...`
      );
    }

    notification.success("Comment added");
  }, [user, notification, posts]);

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
