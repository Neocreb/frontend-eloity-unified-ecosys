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
  }, [feedType, userPosts, filterContentByFeedType]);

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
  }, []);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      loadMorePosts();
    }
  }, [hasMore, isLoading, loadMorePosts]);

  // Handle infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000
      ) {
        handleLoadMore();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleLoadMore]); // Only depend on handleLoadMore

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
  }, [feedItems]); // Removed handleInteraction from dependencies since it's a stable useCallback

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