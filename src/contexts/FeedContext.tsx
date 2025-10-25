import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { PostService } from '@/services/postService';

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

export const FeedProvider: React.FC<FeedProviderProps> = ({ children }) => {
  const [userPosts, setUserPosts] = useState<UnifiedFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useAuth();
  const { toast } = useToast();

  const PAGE_SIZE = 10;

  // Load initial feed data
  const loadFeedData = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if user is authenticated
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      // Fetch real data from PostService
      const feedPosts = await PostService.getFeedPosts(user.id, PAGE_SIZE, (page - 1) * PAGE_SIZE);
      
      // Transform posts to UnifiedFeedItem format
      const transformedPosts: UnifiedFeedItem[] = feedPosts.map((post: any) => ({
        id: post.id,
        type: "post",
        timestamp: new Date(post.created_at),
        priority: 5, // Default priority
        author: {
          id: post.author?.id || "",
          name: post.author?.name || "Unknown User",
          username: post.author?.username || "unknown",
          avatar: post.author?.avatar || "/placeholder.svg",
          verified: post.author?.verified || false,
        },
        content: {
          text: post.content,
          media: post.image ? [{
            type: "image",
            url: post.image,
            alt: "Post image",
          }] : [],
        },
        interactions: {
          likes: post.likes_count || 0,
          comments: post.comments_count || 0,
          shares: post.shares_count || 0,
        },
        userInteracted: {
          liked: post.liked_by_user || false,
          commented: false,
          shared: false,
          saved: false,
        },
      }));

      if (append) {
        setUserPosts(prev => [...prev, ...transformedPosts]);
      } else {
        setUserPosts(transformedPosts);
      }

      // Set pagination
      setHasMore(feedPosts.length === PAGE_SIZE);
      setCurrentPage(page);

    } catch (err) {
      console.error('Error loading feed:', err);
      setError('Failed to load feed content');
      toast({
        title: "Error loading feed",
        description: "Unable to load posts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, toast]);

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