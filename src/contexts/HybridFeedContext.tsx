import React, { createContext, useContext, useState, ReactNode } from 'react';

export type FeedViewMode = 'classic' | 'threaded';

interface HybridPost {
  id: string;
  content: string;
  author: {
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
  };
  parentId?: string; // For threaded replies
  threadId?: string; // Groups related posts
  isReply: boolean;
  quotedPost?: string; // For quote posts
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
  depth?: number; // For nested display
  type: 'post' | 'reply' | 'quote';
  originalPost?: HybridPost; // For quote posts
  media?: any[];
  privacy?: string;
  feeling?: { emoji: string; text: string };
}

interface HybridFeedContextType {
  // View mode state
  viewMode: FeedViewMode;
  setViewMode: (mode: FeedViewMode) => void;
  
  // Post management
  posts: HybridPost[];
  addPost: (post: Omit<HybridPost, 'id' | 'createdAt'>) => void;
  updatePost: (postId: string, updates: Partial<HybridPost>) => void;
  removePost: (postId: string) => void;
  
  // Threading functions
  createReplyPost: (parentId: string, content: string, author: HybridPost['author']) => void;
  createQuotePost: (quotedPostId: string, content: string, author: HybridPost['author']) => void;
  
  // Thread navigation
  getPostThread: (postId: string) => HybridPost[];
  getPostReplies: (postId: string) => HybridPost[];
  getThreadRoot: (postId: string) => HybridPost | null;
  
  // Interaction handling
  toggleLike: (postId: string) => void;
  toggleBookmark: (postId: string) => void;
  toggleGift: (postId: string) => void;
  incrementShares: (postId: string) => void;
}

const HybridFeedContext = createContext<HybridFeedContextType | undefined>(undefined);

export const useHybridFeed = () => {
  const context = useContext(HybridFeedContext);
  if (!context) {
    console.error('useHybridFeed must be used within a HybridFeedProvider');
    // Return a safe fallback instead of throwing to prevent app crashes
    return {
      viewMode: 'classic' as FeedViewMode,
      setViewMode: () => console.warn('setViewMode not available - no HybridFeedProvider'),
      posts: [],
      addPost: () => console.warn('addPost not available - no HybridFeedProvider'),
      updatePost: () => console.warn('updatePost not available - no HybridFeedProvider'),
      removePost: () => console.warn('removePost not available - no HybridFeedProvider'),
      createReplyPost: () => console.warn('createReplyPost not available - no HybridFeedProvider'),
      createQuotePost: () => console.warn('createQuotePost not available - no HybridFeedProvider'),
      getPostThread: () => [],
      getPostReplies: () => [],
      getThreadRoot: () => null,
      toggleLike: () => console.warn('toggleLike not available - no HybridFeedProvider'),
      toggleBookmark: () => console.warn('toggleBookmark not available - no HybridFeedProvider'),
      toggleGift: () => console.warn('toggleGift not available - no HybridFeedProvider'),
      incrementShares: () => console.warn('incrementShares not available - no HybridFeedProvider'),
    };
  }
  return context;
};

interface HybridFeedProviderProps {
  children: ReactNode;
}

export const HybridFeedProvider: React.FC<HybridFeedProviderProps> = ({ children }) => {
  const [viewMode, setViewMode] = useState<FeedViewMode>('classic');
  const [posts, setPosts] = useState<HybridPost[]>([
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
      isReply: false,
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
      content: 'Congratulations! This looks amazing. Can\'t wait to try it out! 🎉',
      author: {
        name: 'Alex Rodriguez',
        username: 'alex_codes',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        verified: false,
      },
      parentId: '1',
      threadId: '1',
      isReply: true,
      type: 'reply',
      createdAt: '1h',
      likes: 12,
      comments: 3,
      shares: 1,
      gifts: 1,
      depth: 1,
      privacy: 'public',
    },
    {
      id: '3',
      content: 'The design choices here are incredible! Love the attention to detail.',
      author: {
        name: 'Maya Patel',
        username: 'maya_design',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        verified: true,
      },
      parentId: '1',
      threadId: '1',
      isReply: true,
      type: 'reply',
      createdAt: '45m',
      likes: 8,
      comments: 1,
      shares: 2,
      gifts: 0,
      depth: 1,
      privacy: 'public',
    },
    {
      id: '4',
      content: 'What technologies did you use for this? The UI looks so smooth! 🤔',
      author: {
        name: 'Dev Mike',
        username: 'dev_mike',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        verified: false,
      },
      parentId: '1',
      threadId: '1',
      isReply: true,
      type: 'reply',
      createdAt: '30m',
      likes: 5,
      comments: 0,
      shares: 0,
      gifts: 0,
      depth: 1,
      privacy: 'public',
    },
    {
      id: '5',
      content: 'Beautiful weather today! Perfect for a walk in the park 🌞 #nature #weekend',
      author: {
        name: 'Emma Wilson',
        username: 'emma_w',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        verified: false,
      },
      isReply: false,
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
      id: '6',
      content: 'Enjoy every moment! Love seeing posts like this 😊',
      author: {
        name: 'John Smith',
        username: 'john_smith',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        verified: false,
      },
      parentId: '5',
      threadId: '5',
      isReply: true,
      type: 'reply',
      createdAt: '2h',
      likes: 7,
      comments: 0,
      shares: 0,
      gifts: 0,
      depth: 1,
      privacy: 'public',
    },
    {
      id: '7',
      content: 'Thread mode is working! This is how conversations should look in a social platform 💬',
      author: {
        name: 'Tech Enthusiast',
        username: 'tech_lover',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
        verified: true,
      },
      isReply: false,
      type: 'post',
      createdAt: '1h',
      likes: 15,
      comments: 2,
      shares: 3,
      gifts: 2,
      privacy: 'public',
    },
  ]);

  const addPost = (post: Omit<HybridPost, 'id' | 'createdAt'>) => {
    const newPost: HybridPost = {
      ...post,
      id: Date.now().toString(),
      createdAt: 'now',
    };
    setPosts(prev => [newPost, ...prev]);
  };

  const updatePost = (postId: string, updates: Partial<HybridPost>) => {
    setPosts(prev => prev.map(post => 
      post.id === postId ? { ...post, ...updates } : post
    ));
  };

  const removePost = (postId: string) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
  };

  const createReplyPost = (parentId: string, content: string, author: HybridPost['author']) => {
    const parentPost = posts.find(p => p.id === parentId);
    if (!parentPost) return;

    const replyPost: HybridPost = {
      id: Date.now().toString(),
      content,
      author,
      parentId,
      threadId: parentPost.threadId || parentPost.id,
      isReply: true,
      type: 'reply',
      createdAt: 'now',
      likes: 0,
      comments: 0,
      shares: 0,
      gifts: 0,
      depth: (parentPost.depth || 0) + 1,
      privacy: 'public',
    };

    setPosts(prev => [replyPost, ...prev]);
    
    // Update parent comment count
    updatePost(parentId, { 
      comments: (parentPost.comments || 0) + 1 
    });
  };

  const createQuotePost = (quotedPostId: string, content: string, author: HybridPost['author']) => {
    const quotedPost = posts.find(p => p.id === quotedPostId);
    if (!quotedPost) return;

    const quotePost: HybridPost = {
      id: Date.now().toString(),
      content,
      author,
      quotedPost: quotedPostId,
      originalPost: quotedPost,
      isReply: false,
      type: 'quote',
      createdAt: 'now',
      likes: 0,
      comments: 0,
      shares: 0,
      gifts: 0,
      privacy: 'public',
    };

    setPosts(prev => [quotePost, ...prev]);
    
    // Update quoted post shares
    updatePost(quotedPostId, { 
      shares: (quotedPost.shares || 0) + 1 
    });
  };

  const getPostThread = (postId: string): HybridPost[] => {
    const post = posts.find(p => p.id === postId);
    if (!post) return [];

    const threadId = post.threadId || post.id;
    return posts
      .filter(p => p.threadId === threadId || p.id === threadId)
      .sort((a, b) => {
        // Sort by depth first, then by creation time
        if (a.depth !== b.depth) {
          return (a.depth || 0) - (b.depth || 0);
        }
        return new Date(b.createdAt === 'now' ? Date.now() : 0).getTime() - 
               new Date(a.createdAt === 'now' ? Date.now() : 0).getTime();
      });
  };

  const getPostReplies = (postId: string): HybridPost[] => {
    return posts
      .filter(p => p.parentId === postId)
      .sort((a, b) => (a.depth || 0) - (b.depth || 0));
  };

  const getThreadRoot = (postId: string): HybridPost | null => {
    const post = posts.find(p => p.id === postId);
    if (!post) return null;

    if (!post.parentId) return post;

    const threadId = post.threadId || post.id;
    return posts.find(p => p.id === threadId && !p.parentId) || null;
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

    updatePost(postId, {
      bookmarked: !post.bookmarked,
    });
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

  const value = {
    viewMode,
    setViewMode,
    posts,
    addPost,
    updatePost,
    removePost,
    createReplyPost,
    createQuotePost,
    getPostThread,
    getPostReplies,
    getThreadRoot,
    toggleLike,
    toggleBookmark,
    toggleGift,
    incrementShares,
  };

  return (
    <HybridFeedContext.Provider value={value}>
      {children}
    </HybridFeedContext.Provider>
  );
};

export default HybridFeedProvider;
