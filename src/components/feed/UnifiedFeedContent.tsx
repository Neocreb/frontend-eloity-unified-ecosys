// @ts-nocheck
import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  MapPin,
  Clock,
  Users,
  TrendingUp,
  Briefcase,
  ShoppingBag,
  Video,
  Calendar,
  Zap,
  Star,
  Eye,
  DollarSign,
  Globe,
  UserCheck,
  Play,
  Calendar as CalendarIcon,
  MapPin as LocationIcon,
  Building,
  Award,
  Settings,
  ShoppingCart,
  ExternalLink,
  Gift,
  Crown,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import {
  formatNumber,
  formatTimeAgo,
  mixContentIntelligently,
  filterContentByFeedType,
  getContentPriority
} from "@/utils/feedUtils";
import { EnhancedCommentsSection } from "@/components/feed/EnhancedCommentsSection";
import VirtualGiftsAndTips from "@/components/premium/VirtualGiftsAndTips";
import { useEnhancedMarketplace } from "@/contexts/EnhancedMarketplaceContext";
import { useFeed } from "@/contexts/FeedContext";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UnifiedActivityService } from '@/services/unifiedActivityService';
import { useNotification } from '@/hooks/use-notification';
import EnhancedShareDialog from './EnhancedShareDialog';
import QuickActionButton from './QuickActionButton';
import FeedSkeleton from './FeedSkeleton';
import UnifiedFeedItemCard from './UnifiedFeedItemCard';
// import { FeedUserCard, FeedGroupCard, FeedPageCard } from './FeedEntityCards';
// import { groups, pages } from '@/data/mockExploreData';
// import { getRandomMockUsers } from '@/data/mockUsers';
// import { useEntityFollowHandlers } from './UnifiedFeedHandlers';

// Unified content type interface
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
    | "group"
    | "page";
  timestamp: Date;
  priority: number; // Higher number = higher priority in feed
  author?: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
    badges?: string[];
  };
  content: any; // Specific content based on type
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

// Sample unified feed data with intelligent mixing
const generateUnifiedFeed = (): UnifiedFeedItem[] => {
  const baseItems: UnifiedFeedItem[] = [
    // Regular post
    {
      id: "post-1",
      type: "post",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
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
        text: "Just launched my new AI-powered productivity app! 🚀 It's been months of hard work, but seeing it come to life is incredible. Check it out!",
        media: [
          {
            type: "image",
            url: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop",
            alt: "App screenshot",
          },
        ],
        location: "San Francisco, CA",
      },
      interactions: {
        likes: 245,
        comments: 38,
        shares: 15,
        views: 1204,
      },
      userInteracted: {
        liked: false,
        commented: false,
        shared: false,
        saved: false,
      },
    },
    
    // Product recommendation
    {
      id: "product-1",
      type: "product",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
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
        title: "Wireless Noise-Canceling Headphones",
        description: "Premium quality headphones with active noise cancellation, 30-hour battery life, and crystal-clear sound.",
        price: 129.99,
        originalPrice: 199.99,
        discount: 35,
        images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop"],
        rating: 4.8,
        reviews: 2847,
        category: "Electronics",
        inStock: true,
        fastShipping: true,
      },
      interactions: {
        likes: 89,
        comments: 23,
        shares: 12,
        saves: 156,
      },
      userInteracted: {
        liked: false,
        commented: false,
        shared: false,
        saved: true,
      },
    },

    // Job posting
    {
      id: "job-1",
      type: "job",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      priority: 7,
      author: {
        id: "client-1",
        name: "StartupXYZ",
        username: "startupxyz",
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=SXY",
        verified: true,
        badges: ["Verified Client"],
      },
      content: {
        title: "Senior React Developer Needed",
        description: "We're looking for an experienced React developer to join our team and help build the future of e-commerce.",
        budget: {
          type: "hourly",
          min: 50,
          max: 80,
        },
        duration: "3-6 months",
        skills: ["React", "TypeScript", "Node.js", "AWS"],
        location: "Remote",
        urgency: "High",
        proposals: 8,
        clientRating: 4.9,
      },
      interactions: {
        likes: 45,
        comments: 12,
        shares: 8,
      },
      userInteracted: {
        liked: false,
        commented: false,
        shared: false,
        saved: false,
      },
    },

    // Freelancer skill showcase
    {
      id: "skill-1",
      type: "freelancer_skill",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      priority: 6,
      author: {
        id: "freelancer-1",
        name: "Alex Designer",
        username: "alexdesign",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
        verified: true,
        badges: ["Top Freelancer", "Design Expert"],
      },
      content: {
        title: "Professional Logo & Brand Identity Design",
        description: "Transform your business with stunning visual identity. Complete branding packages starting at $99.",
        portfolio: [
          "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=300&h=300&fit=crop",
          "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=300&h=300&fit=crop",
        ],
        rating: 4.9,
        completedProjects: 127,
        startingPrice: 99,
        deliveryTime: "3-5 days",
        skills: ["Logo Design", "Brand Identity", "Graphic Design"],
        availability: "Available",
      },
      interactions: {
        likes: 67,
        comments: 15,
        shares: 9,
        saves: 89,
      },
      userInteracted: {
        liked: false,
        commented: false,
        shared: false,
        saved: false,
      },
    },

    // Live event
    {
      id: "event-1",
      type: "live_event",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      priority: 9,
      author: {
        id: "creator-1",
        name: "David Tech",
        username: "davidtech",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=david",
        verified: true,
        badges: ["Live Creator"],
      },
      content: {
        title: "Live Coding: Building a React App",
        isLive: true,
        viewers: 234,
        thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop",
        category: "Technology",
        duration: "2:34:15",
      },
      interactions: {
        likes: 189,
        comments: 45,
        shares: 23,
        views: 234,
      },
      userInteracted: {
        liked: true,
        commented: false,
        shared: false,
        saved: false,
      },
    },

    // Community event
    {
      id: "community-1",
      type: "community_event",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      priority: 5,
      content: {
        title: "Tech Meetup: AI & Machine Learning",
        description: "Join us for an evening of discussions about the latest in AI and ML technologies.",
        date: "December 30, 2024",
        time: "6:00 PM - 9:00 PM",
        location: "Downtown Tech Hub",
        attendees: 45,
        maxAttendees: 100,
        organizer: "Tech Community SF",
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop",
        isOnline: false,
        isFree: true,
      },
      interactions: {
        likes: 78,
        comments: 12,
        shares: 18,
      },
      userInteracted: {
        liked: false,
        commented: false,
        shared: false,
        saved: false,
      },
    },

    // Sponsored post
    {
      id: "sponsored-1",
      type: "sponsored_post",
      timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000), // 7 hours ago
      priority: 4,
      author: {
        id: "sponsor-1",
        name: "Eloity Premium",
        username: "eloity",
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=SC",
        verified: true,
        badges: ["Official"],
      },
      content: {
        title: "Unlock Your Creative Potential",
        description: "Join Eloity Premium and get access to exclusive creator tools, priority support, and advanced analytics.",
        ctaText: "Upgrade Now",
        benefits: [
          "Advanced Analytics",
          "Priority Support",
          "Exclusive Tools",
          "Ad-Free Experience",
        ],
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
        price: "$9.99/month",
      },
      interactions: {
        likes: 123,
        comments: 34,
        shares: 8,
      },
      userInteracted: {
        liked: false,
        commented: false,
        shared: false,
        saved: false,
      },
    },

    // Another regular post
    {
      id: "post-2",
      type: "post",
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      priority: 6,
      author: {
        id: "user-2",
        name: "Emma Wilson",
        username: "emmaw",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emma",
        verified: false,
      },
      content: {
        text: "Beautiful sunset from my balcony today! Sometimes you need to step away from work and enjoy the simple things. 🌅✨",
        media: [
          {
            type: "image",
            url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
            alt: "Sunset view",
          },
        ],
      },
      interactions: {
        likes: 156,
        comments: 28,
        shares: 5,
      },
      userInteracted: {
        liked: true,
        commented: false,
        shared: false,
        saved: false,
      },
    },

    // Group recommendation
    {
      id: "group-1",
      type: "group",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      priority: 5,
      content: {
        ...groups[0], // Web Development Hub
        recentActivity: "15 new posts today"
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
    },

    // Page recommendation
    {
      id: "page-1",
      type: "page",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      priority: 5,
      content: pages[1], // Tesla
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
    },

    // User recommendation
    {
      id: "user-rec-1",
      type: "recommended_user",
      timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000), // 7 hours ago
      priority: 4,
      content: {
        ...getRandomMockUsers(1)[0].profile,
        mutualConnections: 8,
        isFollowing: false
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
    },

    // Another group recommendation
    {
      id: "group-2",
      type: "group",
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      priority: 4,
      content: {
        ...groups[2], // Travel Addicts
        recentActivity: "New photo challenge started"
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
    },
  ];

  // Calculate priorities for all items
  const itemsWithCalculatedPriority = baseItems.map(item => ({
    ...item,
    priority: getContentPriority(
      item.type,
      item.timestamp,
      {
        likes: item.interactions.likes,
        comments: item.interactions.comments,
        shares: item.interactions.shares,
        views: item.interactions.views || 0
      },
      item.type === 'sponsored_post',
      item.author?.verified || false
    )
  }));

  // Use intelligent mixing to distribute content types evenly
  return mixContentIntelligently(itemsWithCalculatedPriority, {
    posts: 40,      // 40% regular posts
    products: 20,   // 20% product recommendations
    jobs: 15,       // 15% job/freelancer content
    ads: 8,         // 8% sponsored content
    events: 5,      // 5% events
    groups: 6,      // 6% group recommendations
    pages: 4,       // 4% page recommendations
    users: 2,       // 2% user recommendations
  });
};

// Component for rendering different content types is now imported from UnifiedFeedItemCard.tsx

// Main unified feed content component
const UnifiedFeedContentComponent: React.FC<{ feedType: string }> = ({ feedType }) => {
  const [feedItems, setFeedItems] = useState<UnifiedFeedItem[]>([]);
  const {
    userPosts,
    isLoading,
    error,
    hasMore,
    loadMorePosts,
    refreshFeed
  } = useFeed();

  const filteredAndSortedItems = useMemo(() => {
    if (!userPosts || userPosts.length === 0) {
      return [];
    }

    // Filter items based on feed type
    let filteredItems = filterContentByFeedType(userPosts, feedType);

    // Apply additional filtering based on tab selection for better content organization
    if (feedType === 'groups') {
      filteredItems = filteredItems.filter(item =>
        item.type === 'group' ||
        (item.type === 'post' && item.author?.id?.startsWith('group-')) ||
        item.type === 'community_event'
      );
    } else if (feedType === 'pages') {
      filteredItems = filteredItems.filter(item =>
        item.type === 'page' ||
        (item.type === 'post' && item.author?.id?.startsWith('page-')) ||
        item.type === 'sponsored_post'
      );
    } else if (feedType === 'following') {
      filteredItems = filteredItems.filter(item =>
        item.type === 'post' ||
        item.type === 'recommended_user' ||
        item.type === 'story_recap'
      );
    }

    // Sort by timestamp (newest first)
    return filteredItems.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [feedType, userPosts]);

  useEffect(() => {
    setFeedItems(filteredAndSortedItems);
  }, [filteredAndSortedItems]);

  const handleInteraction = useCallback((itemId: string, type: string) => {
    setFeedItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item };
        if (type === "like") {
          updatedItem.userInteracted.liked = !item.userInteracted.liked;
          updatedItem.interactions.likes += item.userInteracted.liked ? -1 : 1;
        } else if (type === "save") {
          updatedItem.userInteracted.saved = !item.userInteracted.saved;
        }
        return updatedItem;
      }
      return item;
    }));
  }, [setFeedItems]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      loadMorePosts();
    }
  }, [hasMore, isLoading, loadMorePosts]);

  // Throttled scroll handler
  const throttledHandleScroll = useCallback(() => {
    let throttleTimer: NodeJS.Timeout;
    
    return () => {
      if (throttleTimer) clearTimeout(throttleTimer);
      throttleTimer = setTimeout(() => {
        if (
          window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 1000
        ) {
          handleLoadMore();
        }
      }, 100);
    };
  }, [handleLoadMore]);

  // Handle infinite scroll with throttling
  useEffect(() => {
    const throttledScroll = throttledHandleScroll();
    window.addEventListener("scroll", throttledScroll);
    return () => window.removeEventListener("scroll", throttledScroll);
  }, [throttledHandleScroll]);

  // Handle error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Failed to load feed
        </h3>
        <p className="text-gray-600 max-w-sm mb-4">
          {error}
        </p>
        <Button onClick={refreshFeed} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  // Show loading skeleton for initial load
  if (isLoading && feedItems.length === 0) {
    return <FeedSkeleton />;
  }

  // If no content available for feed type
  if (!isLoading && feedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <TrendingUp className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No posts yet for {feedType}
        </h3>
        <p className="text-gray-600 max-w-sm mb-4">
          {feedType === "following"
            ? "Start following people to see their posts here"
            : "Be the first to share something amazing!"}
        </p>
        <Button onClick={refreshFeed} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
    );
  }

  // Memoized feed items rendering
  const feedItemsRender = useMemo(() => {
    return feedItems.map((item) => (
      <UnifiedFeedItemCard
        key={item.id}
        item={item}
        onInteraction={handleInteraction}
      />
    ));
  }, [feedItems]);

  return (
    <div className="pb-4">
      {feedItemsRender}

      {/* Load More Button or Loading Indicator */}
      {hasMore && (
        <div className="flex justify-center py-6">
          <Button
            onClick={handleLoadMore}
            disabled={isLoading}
            variant="outline"
            size="lg"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}

      {/* Show loading indicator for pagination */}
      {isLoading && feedItems.length > 0 && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
        </div>
      )}
    </div>
  );
};

const UnifiedFeedContent = memo(UnifiedFeedContentComponent);

export default UnifiedFeedContent;
