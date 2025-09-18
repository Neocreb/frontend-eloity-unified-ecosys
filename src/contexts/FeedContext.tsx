import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UnifiedFeedItem {
  id: string;
  type:
    | "post"
    | "product"
    | "job"
    | "freelancer_skill"
    | "sponsored_post"
    | "ad"
    | "live_event"
    | "community_event"
    | "story_recap"
    | "recommended_user"
    | "trending_topic"
    | "meme"
    | "gif";
  timestamp: Date;
  priority: number;
  author?: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
    badges?: string[];
  };
  content: any;
  interactions: {
    likes: number;
    comments: number;
    shares: number;
    saves?: number;
    views?: number;
  };
  userInteracted: {
    liked: boolean;
    commented: boolean;
    shared: boolean;
    saved: boolean;
  };
}

interface FeedContextType {
  userPosts: UnifiedFeedItem[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  addPost: (post: UnifiedFeedItem) => void;
  removePost: (postId: string) => void;
  updatePost: (postId: string, updates: Partial<UnifiedFeedItem>) => void;
  loadMorePosts: () => void;
  refreshFeed: () => void;
}

const FeedContext = createContext<FeedContextType | undefined>(undefined);

export const useFeed = () => {
  const context = useContext(FeedContext);
  if (!context) {
    throw new Error('useFeed must be used within a FeedProvider');
  }
  return context;
};

interface FeedProviderProps {
  children: ReactNode;
}

const mapRowToUnifiedFeedItem = (row: any, profilesById: Record<string, any>): UnifiedFeedItem => {
  const authorProfile = profilesById[row.user_id] || null;
  return {
    id: String(row.id),
    type: 'post',
    timestamp: row.created_at ? new Date(row.created_at) : new Date(),
    priority: row.priority ?? 0,
    author: authorProfile
      ? {
          id: authorProfile.id,
          name: authorProfile.name || authorProfile.username || 'Unknown',
          username: authorProfile.username || 'unknown',
          avatar: authorProfile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authorProfile.id}`,
          verified: !!authorProfile.verified,
          badges: authorProfile.badges || [],
        }
      : undefined,
    content: {
      text: row.content_text ?? row.text ?? '',
      media: row.media ?? [],
      location: row.location ?? null,
    },
    interactions: {
      likes: Number(row.likes_count ?? 0),
      comments: Number(row.comments_count ?? 0),
      shares: Number(row.shares_count ?? 0) || 0,
      views: Number(row.views_count ?? 0) || 0,
    },
    userInteracted: {
      liked: false,
      commented: false,
      shared: false,
      saved: false,
    },
  };
};

const PAGE_SIZE = 10;

const loadPostsFromSupabase = async (page: number, currentUserId?: string) => {
  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE - 1;

  const { data: postsData, error: postsError } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
    .range(start, end);

  if (postsError) throw postsError;
  const posts = postsData ?? [];

  const userIds = Array.from(new Set(posts.map((p: any) => p.user_id).filter(Boolean)));
  let profilesById: Record<string, any> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await supabase.from('profiles').select('*').in('id', userIds);
    (profiles ?? []).forEach((p: any) => (profilesById[p.id] = p));
  }

  const postIds = posts.map((p: any) => p.id);
  const likesByPostId = new Set<string>();
  if (currentUserId && postIds.length > 0) {
    const { data: likes } = await supabase
      .from('post_likes')
      .select('post_id')
      .in('post_id', postIds)
      .eq('user_id', currentUserId);
    (likes ?? []).forEach((l: any) => likesByPostId.add(String(l.post_id)));
  }

  const items: UnifiedFeedItem[] = posts.map((row: any) => {
    const item = mapRowToUnifiedFeedItem(row, profilesById);
    if (currentUserId && likesByPostId.has(String(row.id))) item.userInteracted.liked = true;
    return item;
  });

  return items;
};

export const FeedProvider: React.FC<FeedProviderProps> = ({ children }) => {
  const [userPosts, setUserPosts] = useState<UnifiedFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useAuth();
  const { toast } = useToast();

  const PAGE_SIZE = 10;

  // Load initial feed data (from Supabase)
  const loadFeedData = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await loadPostsFromSupabase(page, user?.id);

      if (append) {
        setUserPosts(prev => [...prev, ...result]);
      } else {
        setUserPosts(result);
      }

      setHasMore(result.length === PAGE_SIZE);
      setCurrentPage(page);
    } catch (err: any) {
      console.error('Error loading feed:', err);
      setError(err?.message || 'Failed to load feed content');
      toast({
        title: 'Error loading feed',
        description: err?.message || 'Unable to load posts. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, user?.id]);

  // Realtime subscriptions for posts, comments and likes
  useEffect(() => {
    let channel: any;
    try {
      channel = supabase.channel('public:feed');

      channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload: any) => {
        const newPost = payload.new;
        // Fetch author profile and map
        (async () => {
          try {
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', newPost.user_id).maybeSingle();
            const item = mapRowToUnifiedFeedItem(newPost, profile ? { [profile.id]: profile } : {});
            setUserPosts(prev => [item, ...prev]);
          } catch (e) {
            console.error('Error handling new post realtime:', e);
          }
        })();
      }).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'posts' }, (payload: any) => {
        const updated = payload.new;
        setUserPosts(prev => prev.map(p => (p.id === String(updated.id) ? { ...p, interactions: { ...p.interactions, likes: Number(updated.likes_count ?? p.interactions.likes), comments: Number(updated.comments_count ?? p.interactions.comments) } } : p)));
      }).on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'posts' }, (payload: any) => {
        const deleted = payload.old;
        setUserPosts(prev => prev.filter(p => p.id !== String(deleted.id)));
      });

      // comments
      channel.on('postgres_changes', { event: '*', schema: 'public', table: 'post_comments' }, (payload: any) => {
        if (payload.eventType === 'INSERT') {
          const comment = payload.new;
          setUserPosts(prev => prev.map(p => p.id === String(comment.post_id) ? { ...p, interactions: { ...p.interactions, comments: p.interactions.comments + 1 } } : p));
        }
      });

      // likes
      channel.on('postgres_changes', { event: '*', schema: 'public', table: 'post_likes' }, (payload: any) => {
        const ev = payload;
        if (ev.eventType === 'INSERT') {
          const like = ev.new;
          setUserPosts(prev => prev.map(p => p.id === String(like.post_id) ? { ...p, interactions: { ...p.interactions, likes: p.interactions.likes + 1 }, userInteracted: { ...p.userInteracted, liked: user?.id === like.user_id ? true : p.userInteracted.liked } } : p));
        } else if (ev.eventType === 'DELETE') {
          const old = ev.old;
          setUserPosts(prev => prev.map(p => p.id === String(old.post_id) ? { ...p, interactions: { ...p.interactions, likes: Math.max(0, p.interactions.likes - 1) }, userInteracted: { ...p.userInteracted, liked: user?.id === old.user_id ? false : p.userInteracted.liked } } : p));
        }
      });

      channel.subscribe();
    } catch (e) {
      console.error('Failed to setup realtime feed subscriptions', e);
    }

    return () => {
      if (channel) {
        try { supabase.removeChannel(channel); } catch (e) { /* ignore */ }
      }
    };
  }, [user?.id]);

  // Load more posts (pagination)
  const loadMorePosts = useCallback(() => {
    if (!isLoading && hasMore) {
      loadFeedData(currentPage + 1, true);
    }
  }, [isLoading, hasMore, currentPage, loadFeedData]);

  // Refresh feed
  const refreshFeed = useCallback(() => {
    setCurrentPage(1);
    loadFeedData(1, false);
  }, [loadFeedData]);

  // Load initial data when component mounts
  useEffect(() => {
    loadFeedData(1, false);
  }, [loadFeedData]);

  const addPost = (post: UnifiedFeedItem) => {
    setUserPosts(prev => [post, ...prev]);
  };

  const removePost = (postId: string) => {
    setUserPosts(prev => prev.filter(post => post.id !== postId));
  };

  const updatePost = (postId: string, updates: Partial<UnifiedFeedItem>) => {
    setUserPosts(prev => prev.map(post => 
      post.id === postId ? { ...post, ...updates } : post
    ));
  };

  const value = {
    userPosts,
    isLoading,
    error,
    hasMore,
    addPost,
    removePost,
    updatePost,
    loadMorePosts,
    refreshFeed,
  };

  return (
    <FeedContext.Provider value={value}>
      {children}
    </FeedContext.Provider>
  );
};

export default FeedProvider;
