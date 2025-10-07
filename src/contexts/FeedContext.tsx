import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '@/components/ui/use-toast';

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

// Mock feed data generator (will be replaced with real API calls)
const generateMockFeedData = (page: number = 1, limit: number = 10): UnifiedFeedItem[] => {
  const baseItems = [
    {
      id: `post-${page}-1`,
      type: "post" as const,
      timestamp: new Date(Date.now() - (page * 2 * 60 * 60 * 1000)),
      priority: 8,
      author: {
        id: "user-1",
        name: "Sarah Johnson",
        username: "sarahj",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
        verified: true,
        badges: ["Creator"],
      },
      content: {
        text: `Amazing new project launch! 🚀 This is post ${page} - Working on something exciting that will change how we work remotely.`,
        media: [
          {
            type: "image",
            url: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop",
            alt: "Project screenshot",
          },
        ],
        location: "San Francisco, CA",
      },
      interactions: {
        likes: Math.floor(Math.random() * 500) + 50,
        comments: Math.floor(Math.random() * 50) + 5,
        shares: Math.floor(Math.random() * 25) + 2,
        views: Math.floor(Math.random() * 2000) + 100,
      },
      userInteracted: {
        liked: false,
        commented: false,
        shared: false,
        saved: false,
      },
    },
    {
      id: `product-${page}-1`,
      type: "product" as const,
      timestamp: new Date(Date.now() - (page * 3 * 60 * 60 * 1000)),
      priority: 6,
      author: {
        id: "seller-1",
        name: "TechGear Store",
        username: "techgear",
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=TG",
        verified: true,
        badges: ["Trusted Seller"],
      },
      content: {
        title: `Premium Wireless Headphones - Page ${page}`,
        description: "High-quality wireless headphones with noise cancellation and 30-hour battery life.",
        price: 129.99,
        originalPrice: 199.99,
        discount: 35,
        images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop"],
        rating: 4.8,
        reviews: Math.floor(Math.random() * 3000) + 500,
        category: "Electronics",
        inStock: true,
        fastShipping: true,
      },
      interactions: {
        likes: Math.floor(Math.random() * 200) + 20,
        comments: Math.floor(Math.random() * 30) + 3,
        shares: Math.floor(Math.random() * 15) + 1,
        saves: Math.floor(Math.random() * 100) + 10,
      },
      userInteracted: {
        liked: false,
        commented: false,
        shared: false,
        saved: Math.random() > 0.7,
      },
    },
    {
      id: `post-${page}-2`,
      type: "post" as const,
      timestamp: new Date(Date.now() - (page * 4 * 60 * 60 * 1000)),
      priority: 7,
      author: {
        id: "user-2",
        name: "Mike Chen",
        username: "mikechen",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike",
        verified: false,
      },
      content: {
        text: `Beautiful sunset from the office today! Sometimes you need to step back and appreciate the simple things. Page ${page} memories 🌅✨`,
        media: [
          {
            type: "image",
            url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
            alt: "Sunset view",
          },
        ],
      },
      interactions: {
        likes: Math.floor(Math.random() * 300) + 30,
        comments: Math.floor(Math.random() * 40) + 5,
        shares: Math.floor(Math.random() * 10) + 1,
      },
      userInteracted: {
        liked: Math.random() > 0.5,
        commented: false,
        shared: false,
        saved: false,
      },
    },
  ];

  return baseItems.slice(0, limit);
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

  // Load initial feed data
  const loadFeedData = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For now, use mock data. In production, this would be:
      // const response = await fetch(`/api/posts?page=${page}&limit=${PAGE_SIZE}`);
      // const data = await response.json();
      
      const newPosts = generateMockFeedData(page, PAGE_SIZE);

      if (append) {
        setUserPosts(prev => [...prev, ...newPosts]);
      } else {
        setUserPosts(newPosts);
      }

      // Simulate pagination logic
      setHasMore(page < 5); // Assume we have 5 pages of content
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
