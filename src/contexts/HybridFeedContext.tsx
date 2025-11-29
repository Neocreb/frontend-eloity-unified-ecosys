import { createContext, useContext, useState, ReactNode } from 'react';

interface Post {
  id: string;
  content: string;
  author: {
    id?: string;
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
  };
  createdAt: string;
  likes: number;
  comments: number;
  shares: number;
  gifts: number;
  liked?: boolean;
  bookmarked?: boolean;
  gifted?: boolean;
  image?: string;
  location?: string;
  type: 'post' | 'reply' | 'quote';
  originalPost?: Post;
  media?: any[];
  privacy?: string;
  feeling?: { emoji: string; text: string };
  parentId?: string;
  depth?: number;
  isReply?: boolean;
}

export type HybridPost = Post;

interface HybridFeedContextType {
  // Post management
  posts: Post[];
  addPost: (post: Omit<Post, 'id' | 'createdAt'>) => void;
  updatePost: (postId: string, updates: Partial<Post>) => void;
  removePost: (postId: string) => void;

  // Saved content management
  savedPosts: Post[];
  savePost: (postId: string) => void;
  unsavePost: (postId: string) => void;

  // History tracking
  viewHistory: Post[];
  addToHistory: (postId: string) => void;
  clearHistory: () => void;

  // Interaction handling
  toggleLike: (postId: string) => void;
  toggleBookmark: (postId: string) => void;
  toggleGift: (postId: string) => void;
  incrementShares: (postId: string) => void;

  // Threading support
  createReplyPost: (parentId: string, content: string, author: any) => void;
  createQuotePost: (originalPostId: string, content: string, author: any) => void;
  getPostReplies: (postId: string) => Post[];
}

const HybridFeedContext = createContext<HybridFeedContextType | undefined>(undefined);

export const useHybridFeed = () => {
  const context = useContext(HybridFeedContext);
  if (!context) {
    throw new Error('useHybridFeed must be used within a HybridFeedProvider');
  }
  return context;
};

interface HybridFeedProviderProps {
  children: ReactNode;
}

export const HybridFeedProvider: React.FC<HybridFeedProviderProps> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>([
    // Sample data
    {
      id: '1',
      content: 'Just launched my new project! Excited to share it with everyone 🚀',
      author: {
        name: 'Sarah Chen',
        username: 'sarahc_dev',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
        verified: true,
      },
      type: 'post',
      createdAt: '2h',
      likes: 45,
      comments: 12,
      shares: 8,
      gifts: 3,
      media: [{
        type: 'image',
        url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500',
        alt: 'Project screenshot'
      }],
      privacy: 'public',
    },
    {
      id: '2',
      content: 'Beautiful weather today! Perfect for a walk in the park 🌞 #nature #weekend',
      author: {
        name: 'Emma Wilson',
        username: 'emma_w',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        verified: false,
      },
      type: 'post',
      createdAt: '3h',
      likes: 23,
      comments: 4,
      shares: 2,
      gifts: 1,
      media: [{
        type: 'image',
        url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500',
        alt: 'Beautiful park scene'
      }],
      privacy: 'public',
    },
    {
      id: '3',
      content: 'Working on some exciting new features. Can\'t wait to show you all what we\'re building! 💻✨',
      author: {
        name: 'Mike Johnson',
        username: 'mikej_dev',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        verified: false,
      },
      type: 'post',
      createdAt: '5h',
      likes: 23,
      comments: 7,
      shares: 3,
      gifts: 0,
      privacy: 'public',
    },
  ]);

  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [viewHistory, setViewHistory] = useState<Post[]>([]);

  const addPost = (post: Omit<Post, 'id' | 'createdAt'>) => {
    const newPost: Post = {
      ...post,
      id: Date.now().toString(),
      createdAt: 'now',
    };
    setPosts(prev => [newPost, ...prev]);
  };

  const updatePost = (postId: string, updates: Partial<Post>) => {
    setPosts(prev => prev.map(post => 
      post.id === postId ? { ...post, ...updates } : post
    ));
  };

  const removePost = (postId: string) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
  };

  const savePost = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    setSavedPosts(prev => {
      const isAlreadySaved = prev.some(p => p.id === postId);
      if (isAlreadySaved) {
        return prev; // Already saved
      }
      return [post, ...prev];
    });

    // Update the post's bookmarked status
    updatePost(postId, { bookmarked: true });
  };

  const unsavePost = (postId: string) => {
    setSavedPosts(prev => prev.filter(p => p.id !== postId));
    updatePost(postId, { bookmarked: false });
  };

  const addToHistory = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    setViewHistory(prev => {
      // Remove if already in history to avoid duplicates
      const filtered = prev.filter(p => p.id !== postId);
      // Add to the beginning
      return [post, ...filtered].slice(0, 50); // Keep only last 50 items
    });
  };

  const clearHistory = () => {
    setViewHistory([]);
  };

  const toggleLike = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    updatePost(postId, {
      liked: !post.liked,
      likes: post.liked ? post.likes - 1 : post.likes + 1,
    });
  };

  const toggleBookmark = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const isBookmarked = !post.bookmarked;
    updatePost(postId, {
      bookmarked: isBookmarked,
    });

    if (isBookmarked) {
      savePost(postId);
    } else {
      unsavePost(postId);
    }
  };

  const toggleGift = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    updatePost(postId, {
      gifted: !post.gifted,
      gifts: post.gifted ? post.gifts - 1 : post.gifts + 1,
    });
  };

  const incrementShares = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    updatePost(postId, {
      shares: post.shares + 1,
    });
  };

  const createReplyPost = (parentId: string, content: string, author: any) => {
    const newPost: Post = {
      id: Date.now().toString(),
      content,
      author: {
        id: author.id || 'user-' + Date.now(),
        name: author.name,
        username: author.username,
        avatar: author.avatar,
        verified: author.verified || false,
      },
      createdAt: 'now',
      likes: 0,
      comments: 0,
      shares: 0,
      gifts: 0,
      type: 'reply',
      parentId,
      depth: 1,
      isReply: true,
    };
    setPosts(prev => [newPost, ...prev]);
  };

  const createQuotePost = (originalPostId: string, content: string, author: any) => {
    const originalPost = posts.find(p => p.id === originalPostId);
    if (!originalPost) return;

    const newPost: Post = {
      id: Date.now().toString(),
      content,
      author: {
        id: author.id || 'user-' + Date.now(),
        name: author.name,
        username: author.username,
        avatar: author.avatar,
        verified: author.verified || false,
      },
      createdAt: 'now',
      likes: 0,
      comments: 0,
      shares: 0,
      gifts: 0,
      type: 'quote',
      originalPost,
    };
    setPosts(prev => [newPost, ...prev]);
  };

  const getPostReplies = (postId: string): Post[] => {
    return posts.filter(p => p.parentId === postId && p.type === 'reply');
  };

  const value = {
    posts,
    addPost,
    updatePost,
    removePost,
    savedPosts,
    savePost,
    unsavePost,
    viewHistory,
    addToHistory,
    clearHistory,
    toggleLike,
    toggleBookmark,
    toggleGift,
    incrementShares,
    createReplyPost,
    createQuotePost,
    getPostReplies,
  };

  return (
    <HybridFeedContext.Provider value={value}>
      {children}
    </HybridFeedContext.Provider>
  );
};

export default HybridFeedProvider;
