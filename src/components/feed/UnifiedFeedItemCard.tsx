// @ts-nocheck
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CompactFollowButton } from "./FollowButton";
import PostOptionsModal from "./PostOptionsModal";
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
} from "@/utils/feedUtils";
import { EnhancedCommentsSection } from "@/components/feed/EnhancedCommentsSection";
import VirtualGiftsAndTips from "@/components/premium/VirtualGiftsAndTips";
import { useEnhancedMarketplace } from "@/contexts/EnhancedMarketplaceContext";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/hooks/use-notification';
import EnhancedShareDialog from './EnhancedShareDialog';
import QuickActionButton from './QuickActionButton';
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

// Component for rendering different content types
const UnifiedFeedItemCardComponent: React.FC<{
  item: UnifiedFeedItem;
  onInteraction: (itemId: string, type: string) => void;
}> = ({ item, onInteraction }) => {
  const { toast } = useToast();
  const { addToCart } = useEnhancedMarketplace();
  const navigate = useNavigate();
  const { user } = useAuth();
  const notification = useNotification();
  // const { handleUserFollow, handleGroupJoin, handlePageFollow } = useEntityFollowHandlers();

  // Modal states
  const [showComments, setShowComments] = React.useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const formatTime = (date: Date) => formatTimeAgo(date);

  const handleInteraction = (type: string) => {
    switch (type) {
      case "like":
        onInteraction(item.id, type);
        break;
      case "comment":
        setShowComments(!showComments);
        break;
      case "share":
        if (navigator.share) {
          navigator.share({
            title: item.content.title || item.content.text || "Check this out!",
            text: item.content.description || item.content.text,
            url: window.location.href,
          });
        } else {
          navigator.clipboard.writeText(window.location.href);
          toast({
            title: "Link copied!",
            description: "Post link copied to clipboard.",
          });
        }
        break;
      case "gift":
        // Handled inline with VirtualGiftsAndTips component
        break;
      case "buy":
        if (item.type === "product") {
          addToCart(item.id, 1);
          toast({
            title: "Added to Cart!",
            description: "Product added to your cart.",
          });
        }
        break;
      case "apply":
        if (item.type === "job") {
          toast({
            title: "Apply to Job",
            description: "Application functionality coming soon!",
          });
        }
        break;
      case "hire":
        if (item.type === "freelancer_skill") {
          toast({
            title: "Contact Freelancer",
            description: "Opening contact form...",
          });
          // Could open hire modal here
        }
        break;
      case "save":
        onInteraction(item.id, type);
        const saveTitle = item.userInteracted.saved ? "Unsaved!" : "Saved!";
        const saveDescription = item.userInteracted.saved ? "Removed from saved items." : "Added to saved items.";
        toast({
          title: saveTitle,
          description: saveDescription,
        });
        break;
      default:
        onInteraction(item.id, type);
    }
  };

  const handleContentClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('[role="button"]')) {
      return;
    }

    // Navigate based on content type for unified experience
    switch (item.type) {
      case 'product':
        navigate(`/app/marketplace/product/${item.id}`);
        break;
      case 'job':
        navigate(`/app/freelance/job/${item.id}`);
        break;
      case 'freelancer_skill':
        navigate(`/app/freelance/find-freelancers?search=${item.author?.username}`);
        break;
      case 'live_event':
        navigate(`/app/events/${item.id}`);
        break;
      case 'community_event':
        navigate(`/app/events/${item.id}`);
        break;
      case 'sponsored_post':
        if (item.content.ctaUrl) {
          if (item.content.ctaUrl.startsWith('http')) {
            window.open(item.content.ctaUrl, '_blank');
          } else {
            navigate(item.content.ctaUrl);
          }
        }
        break;
      case 'group':
        navigate(`/app/groups/${item.id.replace('group-', '')}`);
        break;
      case 'page':
        navigate(`/app/pages/${item.id.replace('page-', '')}`);
        break;
      case 'recommended_user':
        navigate(`/app/profile/${item.content.username}`);
        break;
      default:
        // Regular posts go to post detail
        navigate(`/app/post/${item.id}`);
        break;
    }
  };

  const handleRepost = (originalPostId: string, content: string) => {
    // This would integrate with the feed context to create reposts
    console.log('Repost:', originalPostId, content);
    notification.success('Post reposted successfully!');
  };

  const handleQuotePost = (originalPostId: string, content: string) => {
    // This would integrate with the feed context to create quote posts
    console.log('Quote post:', originalPostId, content);
    notification.success('Quote post created successfully!');
  };

  const InteractionBar = () => (
    <div className="flex items-center justify-between pt-3 border-t">
      <div className="flex items-center gap-1 sm:gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleInteraction("like")}
          className={cn(
            "flex items-center gap-1 px-2 py-1.5 h-auto",
            item.userInteracted.liked && "text-red-500"
          )}
        >
          <Heart
            className={cn(
              "w-4 h-4",
              item.userInteracted.liked && "fill-current"
            )}
          />
          <span className="text-xs sm:text-sm">{formatNumber(item.interactions.likes)}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleInteraction("comment")}
          className={cn(
            "flex items-center gap-1 px-2 py-1.5 h-auto",
            showComments && "text-blue-500"
          )}
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-xs sm:text-sm">{formatNumber(item.interactions.comments)}</span>
        </Button>
        <EnhancedShareDialog
          postId={item.id}
          postContent={item.content.text || item.content.title || item.content.description || ''}
          postAuthor={{
            name: item.author?.name || 'Unknown',
            username: item.author?.username || 'unknown'
          }}
          onRepost={handleRepost}
          onQuotePost={handleQuotePost}
          trigger={
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 px-2 py-1.5 h-auto hover:text-green-500 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Share2 className="w-4 h-4" />
              <span className="text-xs sm:text-sm">{formatNumber(item.interactions.shares)}</span>
            </Button>
          }
        />
{item.author && (
          <VirtualGiftsAndTips
            recipientId={item.author.id}
            recipientName={item.author.name}
            trigger={
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 px-2 py-1.5 h-auto text-yellow-600 hover:text-yellow-700"
              >
                <Gift className="w-4 h-4" />
                <span className="text-xs sm:text-sm hidden sm:inline">Gift</span>
              </Button>
            }
          />
        )}
        {item.type === "product" && (
          <QuickActionButton
            postId={item.id}
            type="product"
            actionType="buy_direct"
            label="Buy"
            price={item.content.price?.toString()}
            size="sm"
            variant="ghost"
            className="flex items-center gap-1 px-2 py-1.5 h-auto text-green-600 hover:text-green-700"
          />
        )}
        {item.type === "job" && (
          <QuickActionButton
            postId={item.id}
            type="job"
            actionType="apply_quick"
            label="Apply"
            size="sm"
            variant="ghost"
            className="flex items-center gap-1 px-2 py-1.5 h-auto text-blue-600 hover:text-blue-700"
          />
        )}
        {item.type === "freelancer_skill" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/app/freelance/find-freelancers?search=${item.author?.username}`)}
            className="flex items-center gap-1 px-2 py-1.5 h-auto text-purple-600 hover:text-purple-700"
          >
            <ExternalLink className="w-3 h-3" />
            <span className="text-xs">Hire</span>
          </Button>
        )}
        {(item.type === "live_event" || item.type === "community_event") && (
          <QuickActionButton
            postId={item.id}
            type="event"
            actionType="join_direct"
            label="Join"
            size="sm"
            variant="ghost"
            className="flex items-center gap-1 px-2 py-1.5 h-auto text-orange-600 hover:text-orange-700"
          />
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleInteraction("save")}
        className={cn(
          "px-2 py-1.5 h-auto",
          item.userInteracted.saved && "text-blue-500"
        )}
      >
        <Bookmark
          className={cn(
            "w-4 h-4",
            item.userInteracted.saved && "fill-current"
          )}
        />
      </Button>
    </div>
  );

  // Regular post rendering
  if (item.type === "post") {
    return (
      <Card className="mb-4 sm:mb-6 mx-2 sm:mx-0">
        <CardContent className="p-0">
          {/* Header */}
          <div className="p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar
                className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/app/profile/${item.author?.username}`);
                }}
              >
                <AvatarImage src={item.author?.avatar} />
                <AvatarFallback>{item.author?.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="font-semibold cursor-pointer hover:underline truncate"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/app/profile/${item.author?.username}`);
                    }}
                  >
                    {item.author?.name}
                  </span>
                  {item.author?.verified && (
                    <Badge variant="secondary" className="h-4 w-4 p-0 rounded-full bg-blue-500 flex-shrink-0">
                      <span className="text-white text-xs">✓</span>
                    </Badge>
                  )}
                  {item.author?.badges?.map((badge) => (
                    <Badge key={badge} variant="outline" className="text-xs flex-shrink-0">
                      {badge}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
                  <span
                    className="cursor-pointer hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/app/profile/${item.author?.username}`);
                    }}
                  >
                    @{item.author?.username}
                  </span>
                  <span>•</span>
                  <span>{formatTime(item.timestamp)}</span>
                  <Globe className="w-3 h-3" />
                  {item.content.location && (
                    <>
                      <span>•</span>
                      <MapPin className="w-3 h-3" />
                      <span>{item.content.location}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {!item.author?.id.startsWith(user?.id || '') && (
                <CompactFollowButton
                  type="user"
                  isFollowing={isFollowing}
                  onToggleFollow={() => setIsFollowing(!isFollowing)}
                />
              )}
              <PostOptionsModal
                postId={item.id}
                postAuthorId={item.author?.id || ''}
                postAuthorName={item.author?.name || ''}
                postAuthorUsername={item.author?.username || ''}
                postContent={item.content.text || ''}
                isFollowing={isFollowing}
                onFollowChange={setIsFollowing}
                onPostDelete={() => {
                  navigate('/app/feed');
                }}
                onPostEdit={(newContent) => {
                  // Optionally refresh the post data
                }}
                trigger={
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                }
              />
            </div>
          </div>

          {/* Content */}
          <div className="px-4 pb-3">
            <p className="text-sm mb-3">{item.content.text}</p>
            {item.content.media && item.content.media.length > 0 && (
              <div className="relative">
                <img
                  src={item.content.media[0].url}
                  alt={item.content.media[0].alt}
                  className="w-full max-h-96 object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          <div className="px-4 pb-4">
            <InteractionBar />

            {/* Comments Section */}
            {showComments && (
              <div className="mt-4 border-t pt-4">
                <EnhancedCommentsSection
                  postId={item.id}
                  isVisible={showComments}
                  commentsCount={item.interactions.comments}
                  onCommentsCountChange={(count) => {
                    // Update comments count if needed
                  }}
                />
              </div>
            )}
          </div>

          {/* Share handled natively in handleInteraction */}
        </CardContent>
      </Card>
    );
  }

  // Product recommendation rendering
  if (item.type === "product") {
    return (
      <Card className="mb-4 sm:mb-6 mx-2 sm:mx-0">
        <CardContent className="p-0">
          {/* Header */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={item.author?.avatar} />
                <AvatarFallback>{item.author?.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{item.author?.name}</span>
                  {item.author?.verified && (
                    <Badge variant="secondary" className="h-4 w-4 p-0 rounded-full bg-blue-500">
                      <span className="text-white text-xs">✓</span>
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    <ShoppingBag className="w-3 h-3 mr-1" />
                    Product
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{formatTime(item.timestamp)}</span>
                  <span>•</span>
                  <span>{item.content.category}</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>

          {/* Product Content */}
          <div className="px-4 pb-3">
            <div
              className="flex gap-3 sm:gap-4 cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2"
              onClick={handleContentClick}
            >
              <div className="flex-shrink-0">
                <img
                  src={item.content.images[0]}
                  alt={item.content.title}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2 line-clamp-2">
                  {item.content.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2 line-clamp-2">
                  {item.content.description}
                </p>
                <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs sm:text-sm font-medium">{item.content.rating}</span>
                    <span className="text-xs sm:text-sm text-gray-500">({formatNumber(item.content.reviews)})</span>
                  </div>
                  {item.content.fastShipping && (
                    <Badge variant="secondary" className="text-xs">
                      Fast Ship
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className="text-base sm:text-lg font-bold text-green-600">
                    ${item.content.price}
                  </span>
                  {item.content.originalPrice && (
                    <>
                      <span className="text-xs sm:text-sm text-gray-500 line-through">
                        ${item.content.originalPrice}
                      </span>
                      <Badge variant="destructive" className="text-xs">
                        -{item.content.discount}%
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 pb-4">
            <InteractionBar />

            {/* Quick Actions for Product */}
            <div className="mt-3 flex gap-2">
              <QuickActionButton
                postId={item.id}
                type="product"
                actionType="buy_direct"
                label="Buy Now"
                price={item.content.price?.toString()}
                size="sm"
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/app/marketplace/product/${item.id}`);
                }}
                className="flex-1"
              >
                View Details
              </Button>
            </div>

            {/* Comments Section */}
            {showComments && (
              <div className="mt-4 border-t pt-4">
                <EnhancedCommentsSection
                  postId={item.id}
                  isVisible={showComments}
                  commentsCount={item.interactions.comments}
                  onCommentsCountChange={(count) => {
                    // Update comments count if needed
                  }}
                />
              </div>
            )}
          </div>

          {/* Product click handled in handleContentClick */}

        </CardContent>
      </Card>
    );
  }

  // Job posting rendering
  if (item.type === "job") {
    return (
      <Card className="mb-4 sm:mb-6 mx-2 sm:mx-0">
        <CardContent className="p-0">
          {/* Header */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={item.author?.avatar} />
                <AvatarFallback>{item.author?.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{item.author?.name}</span>
                  {item.author?.verified && (
                    <Badge variant="secondary" className="h-4 w-4 p-0 rounded-full bg-blue-500">
                      <span className="text-white text-xs">✓</span>
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    <Briefcase className="w-3 h-3 mr-1" />
                    Job
                  </Badge>
                  {item.content.urgency === "High" && (
                    <Badge variant="destructive" className="text-xs">
                      Urgent
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{formatTime(item.timestamp)}</span>
                  <span>•</span>
                  <span>{item.content.location}</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>

          {/* Job Content */}
          <div
            className="px-4 pb-3 cursor-pointer hover:bg-gray-50 rounded-lg mx-2 -mx-2"
            onClick={handleContentClick}
          >
            <h3 className="font-semibold text-lg mb-2">{item.content.title}</h3>
            <p className="text-sm text-gray-600 mb-3">{item.content.description}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <span className="text-sm font-medium">Budget:</span>
                <p className="text-sm text-gray-600">
                  ${item.content.budget.min}-${item.content.budget.max}/{item.content.budget.type}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium">Duration:</span>
                <p className="text-sm text-gray-600">{item.content.duration}</p>
              </div>
            </div>

            <div className="mb-3">
              <span className="text-sm font-medium">Skills:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {item.content.skills.map((skill: string) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{item.content.proposals} proposals</span>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{item.content.clientRating} client rating</span>
              </div>
            </div>
          </div>

          <div className="px-4 pb-4">
            <InteractionBar />

            {/* Quick Actions for Job */}
            <div className="mt-3 flex gap-2">
              <QuickActionButton
                postId={item.id}
                type="job"
                actionType="apply_quick"
                label="Quick Apply"
                size="sm"
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/app/freelance/job/${item.id}`);
                }}
                className="flex-1"
              >
                View Job
              </Button>
            </div>

            {/* Comments Section */}
            {showComments && (
              <div className="mt-4 border-t pt-4">
                <EnhancedCommentsSection
                  postId={item.id}
                  isVisible={showComments}
                  commentsCount={item.interactions.comments}
                  onCommentsCountChange={(count) => {
                    // Update comments count if needed
                  }}
                />
              </div>
            )}
          </div>

          {/* Job click handled in handleContentClick */}

        </CardContent>
      </Card>
    );
  }

  // Freelancer skill showcase rendering
  if (item.type === "freelancer_skill") {
    return (
      <Card className="mb-4 sm:mb-6 mx-2 sm:mx-0">
        <CardContent className="p-0">
          {/* Header */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={item.author?.avatar} />
                <AvatarFallback>{item.author?.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{item.author?.name}</span>
                  {item.author?.verified && (
                    <Badge variant="secondary" className="h-4 w-4 p-0 rounded-full bg-blue-500">
                      <span className="text-white text-xs">✓</span>
                    </Badge>
                  )}
                  {item.author?.badges?.map((badge) => (
                    <Badge key={badge} variant="outline" className="text-xs">
                      {badge}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{formatTime(item.timestamp)}</span>
                  <span>•</span>
                  <span>{item.content.availability}</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>

          {/* Freelancer Content */}
          <div className="px-4 pb-3">
            <h3 className="font-semibold text-lg mb-2">{item.content.title}</h3>
            <p className="text-sm text-gray-600 mb-3">{item.content.description}</p>
            
            {/* Portfolio preview */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {item.content.portfolio.map((image: string, index: number) => (
                <img
                  key={index}
                  src={image}
                  alt={`Portfolio ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <span className="text-sm font-medium">Starting at:</span>
                <p className="text-lg font-bold text-green-600">${item.content.startingPrice}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Delivery:</span>
                <p className="text-sm text-gray-600">{item.content.deliveryTime}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{item.content.rating}</span>
              </div>
              <span>{item.content.completedProjects} projects</span>
            </div>

            <div className="flex flex-wrap gap-1">
              {item.content.skills.map((skill: string) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <div className="px-4 pb-4">
            <InteractionBar />

            {/* Comments Section */}
            {showComments && (
              <div className="mt-4 border-t pt-4">
                <EnhancedCommentsSection
                  postId={item.id}
                  isVisible={showComments}
                  commentsCount={item.interactions.comments}
                  onCommentsCountChange={(count) => {
                    // Update comments count if needed
                  }}
                />
              </div>
            )}
          </div>

          {/* Modals */}
        </CardContent>
      </Card>
    );
  }

  // Live event rendering
  if (item.type === "live_event") {
    return (
      <Card className="mb-4 sm:mb-6 mx-2 sm:mx-0">
        <CardContent className="p-0">
          {/* Header */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={item.author?.avatar} />
                <AvatarFallback>{item.author?.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{item.author?.name}</span>
                  {item.author?.verified && (
                    <Badge variant="secondary" className="h-4 w-4 p-0 rounded-full bg-blue-500">
                      <span className="text-white text-xs">✓</span>
                    </Badge>
                  )}
                  {item.content.isLive && (
                    <Badge variant="destructive" className="text-xs animate-pulse">
                      <div className="w-2 h-2 bg-white rounded-full mr-1"></div>
                      LIVE
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{formatTime(item.timestamp)}</span>
                  <span>•</span>
                  <span>{item.content.category}</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>

          {/* Live Content */}
          <div className="relative">
            <img
              src={item.content.thumbnail}
              alt={item.content.title}
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <Button size="lg" className="rounded-full bg-white bg-opacity-20 hover:bg-opacity-30">
                <Play className="w-8 h-8 text-white fill-white" />
              </Button>
            </div>
            <div className="absolute top-4 left-4 bg-black bg-opacity-70 px-2 py-1 rounded text-white text-sm">
              {item.content.duration}
            </div>
            <div className="absolute top-4 right-4 bg-red-500 px-2 py-1 rounded text-white text-sm flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {formatNumber(item.content.viewers)}
            </div>
          </div>

          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2">{item.content.title}</h3>
            <InteractionBar />

            {/* Comments Section */}
            {showComments && (
              <div className="mt-4 border-t pt-4">
                <EnhancedCommentsSection
                  postId={item.id}
                  isVisible={showComments}
                  commentsCount={item.interactions.comments}
                  onCommentsCountChange={(count) => {
                    // Update comments count if needed
                  }}
                />
              </div>
            )}
          </div>

          {/* Modals */}
        </CardContent>
      </Card>
    );
  }

  // Community event rendering
  if (item.type === "community_event") {
    return (
      <Card className="mb-4 sm:mb-6 mx-2 sm:mx-0">
        <CardContent className="p-0">
          {/* Header */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{item.content.organizer}</span>
                  <Badge variant="outline" className="text-xs">
                    <CalendarIcon className="w-3 h-3 mr-1" />
                    Event
                  </Badge>
                  {item.content.isFree && (
                    <Badge variant="secondary" className="text-xs">
                      Free
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{formatTime(item.timestamp)}</span>
                  <span>•</span>
                  <span>{item.content.location}</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>

          {/* Event Content */}
          <div className="relative">
            <img
              src={item.content.image}
              alt={item.content.title}
              className="w-full h-48 object-cover"
            />
          </div>

          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2">{item.content.title}</h3>
            <p className="text-sm text-gray-600 mb-3">{item.content.description}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <span className="text-sm font-medium">Date & Time:</span>
                <p className="text-sm text-gray-600">{item.content.date}</p>
                <p className="text-sm text-gray-600">{item.content.time}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Attendees:</span>
                <p className="text-sm text-gray-600">
                  {item.content.attendees}/{item.content.maxAttendees} going
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <Button size="sm" className="flex-1">
                <Users className="w-4 h-4 mr-2" />
                Join Event
              </Button>
              <Button size="sm" variant="outline">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>

            <InteractionBar />

            {/* Comments Section */}
            {showComments && (
              <div className="mt-4 border-t pt-4">
                <EnhancedCommentsSection
                  postId={item.id}
                  isVisible={showComments}
                  commentsCount={item.interactions.comments}
                  onCommentsCountChange={(count) => {
                    // Update comments count if needed
                  }}
                />
              </div>
            )}
          </div>

          {/* Modals */}
        </CardContent>
      </Card>
    );
  }

  // Sponsored post rendering
  if (item.type === "sponsored_post") {
    return (
      <Card className="mb-4 border-blue-200 bg-blue-50/30">
        <CardContent className="p-0">
          {/* Header */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={item.author?.avatar} />
                <AvatarFallback>{item.author?.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{item.author?.name}</span>
                  {item.author?.verified && (
                    <Badge variant="secondary" className="h-4 w-4 p-0 rounded-full bg-blue-500">
                      <span className="text-white text-xs">✓</span>
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs text-blue-600 border-blue-600">
                    Sponsored
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{formatTime(item.timestamp)}</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>

          {/* Sponsored Content */}
          <div className="relative">
            <img
              src={item.content.image}
              alt={item.content.title}
              className="w-full h-48 object-cover"
            />
          </div>

          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2">{item.content.title}</h3>
            <p className="text-sm text-gray-600 mb-3">{item.content.description}</p>
            
            <div className="mb-3">
              <span className="text-sm font-medium mb-2 block">Features:</span>
              <div className="grid grid-cols-2 gap-2">
                {item.content.benefits.map((benefit: string) => (
                  <div key={benefit} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    {benefit}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <span className="text-lg font-bold text-blue-600">{item.content.price}</span>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Crown className="w-4 h-4 mr-2" />
                {item.content.ctaText}
              </Button>
            </div>

            <InteractionBar />

            {/* Comments Section */}
            {showComments && (
              <div className="mt-4 border-t pt-4">
                <EnhancedCommentsSection
                  postId={item.id}
                  isVisible={showComments}
                  commentsCount={item.interactions.comments}
                  onCommentsCountChange={(count) => {
                    // Update comments count if needed
                  }}
                />
              </div>
            )}
          </div>

          {/* Modals */}
        </CardContent>
      </Card>
    );
  }

  // Group recommendation rendering
  if (item.type === "group") {
    return (
      <FeedGroupCard
        key={item.id}
        group={item.content}
        onToggleJoin={handleGroupJoin}
        className="mb-4 sm:mb-6 mx-2 sm:mx-0"
      />
    );
  }

  // Page recommendation rendering
  if (item.type === "page") {
    return (
      <FeedPageCard
        key={item.id}
        page={item.content}
        onToggleFollow={handlePageFollow}
        className="mb-4 sm:mb-6 mx-2 sm:mx-0"
      />
    );
  }

  // Recommended user rendering
  if (item.type === "recommended_user") {
    return (
      <FeedUserCard
        key={item.id}
        user={item.content}
        onToggleFollow={handleUserFollow}
        className="mb-4 sm:mb-6 mx-2 sm:mx-0"
      />
    );
  }

  return null;
};

const UnifiedFeedItemCard = React.memo(UnifiedFeedItemCardComponent, (prevProps, nextProps) => {
  // Custom comparison function to optimize re-renders
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.userInteracted.liked === nextProps.item.userInteracted.liked &&
    prevProps.item.userInteracted.saved === nextProps.item.userInteracted.saved &&
    prevProps.item.interactions.likes === nextProps.item.interactions.likes &&
    prevProps.item.interactions.comments === nextProps.item.interactions.comments &&
    prevProps.item.interactions.shares === nextProps.item.interactions.shares
  );
});

export default UnifiedFeedItemCard;
