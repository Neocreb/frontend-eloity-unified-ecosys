import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { realSocialService } from '@/services/realSocialService';
import { realMarketplaceService } from '@/services/realMarketplaceService';
import { realFreelanceService } from '@/services/realFreelanceService';
import { USE_MOCK_DATA } from '@/lib/featureFlags';

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

// Real feed data generator using Supabase
const loadRealFeedData = async (page: number = 1, limit: number = 10): Promise<UnifiedFeedItem[]> => {
  const feedItems: UnifiedFeedItem[] = [];

  try {
    // Load posts from Supabase using the realSocialService.getFeed API
    const posts = await realSocialService.getFeed(undefined, { limit, offset: (page - 1) * limit });
    for (const post of posts) {
      feedItems.push({
        id: post.id,
        type: "post",
        timestamp: new Date(post.createdAt || post.created_at || Date.now()),
        priority: 8,
        author: {
          id: post.userId || post.user_id,
          name: (post.author && (post.author.name || post.author.full_name)) || "User",
          username: (post.author && (post.author.username || post.author.full_name)) || `user-${(post.userId || post.user_id || '').toString().slice(0, 8)}`,
          avatar: (post.author && (post.author.avatar || post.author.avatar_url)) || "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
          verified: !!(post.author && post.author.verified),
        },
        content: {
          text: post.content,
          media: post.mediaType === 'image' && post.imageUrl ? [{ type: 'image', url: post.imageUrl, alt: 'Post media' }] : [],
        },
        interactions: {
          likes: post.likes || post.like_count || 0,
          comments: post.comments || post.comment_count || 0,
          shares: post.shares || post.share_count || 0,
        },
        userInteracted: {
          liked: !!post.isLiked,
          commented: false,
          shared: false,
          saved: false,
        },
      });
    }

    // Load products from marketplace
    const products = await realMarketplaceService.getProducts({ page, limit: Math.floor(limit / 3) });
    for (const product of products) {
      feedItems.push({
        id: `product-${product.id}`,
        type: "product",
        timestamp: new Date(product.created_at),
        priority: 6,
        author: {
          id: product.seller_id,
          name: "Seller",
          username: `seller-${product.seller_id.slice(0, 8)}`,
          avatar: "https://api.dicebear.com/7.x/initials/svg?seed=seller",
          verified: true,
          badges: ["Trusted Seller"],
        },
        content: {
          title: product.title,
          description: product.description,
          price: product.price,
          images: product.images || [],
          category: product.category,
          inStock: product.status === 'active',
        },
        interactions: {
          likes: 0,
          comments: 0,
          shares: 0,
          saves: 0,
        },
        userInteracted: {
          liked: false,
          commented: false,
          shared: false,
          saved: false,
        },
      });
    }

    // Load freelance jobs
    const jobs = await realFreelanceService.getJobs({ page, limit: Math.floor(limit / 3) });
    for (const job of jobs) {
      feedItems.push({
        id: `job-${job.id}`,
        type: "job",
        timestamp: new Date(job.created_at),
        priority: 7,
        author: {
          id: job.client_id,
          name: "Client",
          username: `client-${job.client_id.slice(0, 8)}`,
          avatar: "https://api.dicebear.com/7.x/initials/svg?seed=client",
          verified: true,
          badges: ["Verified Client"],
        },
        content: {
          title: job.title,
          description: job.description,
          budget: {
            min: job.budget_min,
            max: job.budget_max,
            type: job.project_type,
          },
          skills: job.skills_required || [],
          experience_level: job.experience_level,
        },
        interactions: {
          likes: 0,
          comments: 0,
          shares: 0,
        },
        userInteracted: {
          liked: false,
          commented: false,
          shared: false,
          saved: false,
        },
      });
    }

    // Sort by timestamp and priority
    return feedItems.sort((a, b) => {
      const priorityDiff = b.priority - a.priority;
      if (priorityDiff !== 0) return priorityDiff;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });

  } catch (error) {
    const msg = (error && (error.message || (typeof error === 'string' ? error : JSON.stringify(error)))) || 'Unknown error';
    console.error('Error loading real feed data:', msg, error);
    return [];
  }
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

  // Mock feed loader
  const loadMockFeedData = async (page: number = 1, limit: number = 10): Promise<UnifiedFeedItem[]> => {
    const now = Date.now();
    const items: UnifiedFeedItem[] = [
      {
        id: `mock_post_${page}_1`,
        type: 'post',
        timestamp: new Date(now - 1000 * 60 * 60),
        priority: 8,
        author: { id: 'user_1', name: 'Alice Johnson', username: 'alice', avatar: '', verified: true },
        content: { text: 'Hey! How was your weekend?', media: [] },
        interactions: { likes: 12, comments: 3, shares: 1 },
        userInteracted: { liked: false, commented: false, shared: false, saved: false },
      },
      {
        id: `mock_product_${page}_1`,
        type: 'product',
        timestamp: new Date(now - 1000 * 60 * 120),
        priority: 6,
        author: { id: 'seller_1', name: 'AudioHouse', username: 'audiohouse', avatar: '', verified: true },
        content: {
          title: 'Wireless Headphones X200',
          description: 'High quality wireless headphones with noise cancellation.',
          price: 99.99,
          images: ['https://images.unsplash.com/photo-1518444021915-7a1b9cb11a2a?w=800'],
          inStock: true,
        },
        interactions: { likes: 34, comments: 2, shares: 0, saves: 5 },
        userInteracted: { liked: false, commented: false, shared: false, saved: false },
      },
      {
        id: `mock_job_${page}_1`,
        type: 'job',
        timestamp: new Date(now - 1000 * 60 * 60 * 24),
        priority: 7,
        author: { id: 'client_1', name: 'TechCorp Inc.', username: 'techcorp', avatar: '', verified: true },
        content: { title: 'React Developer for E-commerce Platform', description: 'Build a responsive e-commerce frontend', budget: { min: 0, max: 5000, type: 'fixed' }, skills: ['React','TypeScript'] },
        interactions: { likes: 5, comments: 1, shares: 0 },
        userInteracted: { liked: false, commented: false, shared: false, saved: false },
      }
    ];

    return items.slice(0, limit);
  };

  // Load feed data (real or mock) from Supabase or mocks
  const loadFeedData = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const newPosts = USE_MOCK_DATA ? await loadMockFeedData(page, PAGE_SIZE) : await loadRealFeedData(page, PAGE_SIZE);

      if (append) {
        setUserPosts(prev => [...prev, ...newPosts]);
      } else {
        setUserPosts(newPosts);
      }

      // Pagination logic
      setHasMore(newPosts.length === PAGE_SIZE);
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
  }, [toast]);

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
