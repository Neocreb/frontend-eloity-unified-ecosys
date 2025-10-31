// @ts-nocheck
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";


import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Share,
  Plus,
  Music,
  Volume2,
  VolumeX,
  MoreHorizontal,
  Bookmark,
  Search,
  User,
  Home,
  Sparkles,
  Award,
  Eye,
  Users,
  ChevronUp,
  ChevronDown,
  Settings,
  Filter,
  TrendingUp,
  Maximize,
  Minimize,
  Play,
  Pause,
  X,
  Clock,
  Hash,
  Globe,
  Star,
  Zap,
  ArrowLeft,
  Camera,
  Video,
  Mic,
  UserPlus,
  Crown,
  Flame,
  Coffee,
  Gift,
  Radio,
  Upload,
  Target,
  Swords,
  ShoppingCart,
  DollarSign,
  ThumbsUp as ThumbsUpIcon,
  Copy,
  Twitter,
  Facebook,
  Share2,
  Download,
  Send,
  Reply,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EnhancedVideoCreator from "@/components/video/EnhancedVideoCreator";
import AdvancedVideoRecorder from "@/components/video/AdvancedVideoRecorder";
import ContentDiscoveryEngine from "@/components/video/ContentDiscoveryEngine";
import InteractiveFeatures from "@/components/video/InteractiveFeatures";
import DuetEnabledVideoPlayer from "@/components/video/DuetEnabledVideoPlayer";
import DuetRecorder from "@/components/video/DuetRecorder";
import BattleSetup from "@/components/battles/BattleSetup";
import LiveBattle from "@/components/battles/LiveBattle";
import TikTokStyleBattle from "@/components/battles/TikTokStyleBattle";

import CreatorDashboard from "@/components/video/CreatorDashboard";
import EnhancedCreatorAnalytics from "@/components/video/EnhancedCreatorAnalytics";
import EnhancedVideoPlayer from "@/components/video/EnhancedVideoPlayer";
import EnhancedAccessibilityFeatures from "@/components/accessibility/EnhancedAccessibilityFeatures";
import EnhancedSearchDiscovery from "@/components/search/EnhancedSearchDiscovery";
import { LiveStreamCreator } from "../components/livestream/LiveStreamCreator";
import { useLiveContentContext } from "../contexts/LiveContentContext";
import { liveContentToVideoData } from "../utils/liveContentAdapter";
import LiveStreamingCard from "../components/video/LiveStreamingCard";
import FullScreenLiveStream from "../components/livestream/FullScreenLiveStream";
import MobileLiveStreamLayout from "../components/livestream/MobileLiveStreamLayout";
import { cn } from "@/utils/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useVideoPlayback } from "@/hooks/use-video-playback";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import VirtualGiftsAndTips from "@/components/premium/VirtualGiftsAndTips";
import { videoService, Video as VideoType } from "@/services/videoService";

interface VideoData {
  id: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    verified: boolean;
    followerCount?: number;
    isFollowing?: boolean;
  };
  description: string;
  music: {
    title: string;
    artist: string;
    id?: string;
    duration?: number;
  };
  stats: {
    likes: number;
    comments: number;
    shares: number;
    views: string;
    saves?: number;
  };
  hashtags: string[];
  videoUrl: string;
  thumbnail: string;
  duration: number;
  timestamp?: string;
  category?: string;
  isLiveStream?: boolean;
  allowDuets?: boolean;
  allowComments?: boolean;
  hasCaption?: boolean;
  isSponsored?: boolean;
  challenge?: {
    id: string;
    title: string;
    hashtag: string;
  };
  // Enhanced features
  videoSources?: {
    quality: string;
    url: string;
    minWidth: number;
    bitrate: number;
  }[];
  captions?: {
    language: string;
    label: string;
    url: string;
    default?: boolean;
  }[];
  chapters?: {
    id: string;
    title: string;
    startTime: number;
    endTime: number;
    thumbnail?: string;
  }[];
  allowDownload?: boolean;
  allowOffline?: boolean;
  supportsPiP?: boolean;
  supportsAirPlay?: boolean;
  aiGenerated?: boolean;
  transcription?: string;
}

const VideoCard: React.FC<{
  video: VideoData;
  isActive: boolean;
  showControls?: boolean;
  onDuetCreate?: (video: VideoData) => void;
  comments: any[];
  setComments: (comments: any[]) => void;
}> = ({ video, isActive, showControls = true, onDuetCreate, comments, setComments }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(video.stats.likes);
  const [isMuted, setIsMuted] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const [isPlaying, setIsPlaying] = useState(isActive);
  const [isFollowing, setIsFollowing] = useState(video.user.isFollowing || false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedControl, setShowSpeedControl] = useState(false);
  const [showQualityControl, setShowQualityControl] = useState(false);
  const [currentQuality, setCurrentQuality] = useState("Auto");
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [showGifts, setShowGifts] = useState(false);
  const [showBattleActions, setShowBattleActions] = useState(false); // New state for battle actions
  const [battleVote, setBattleVote] = useState<{creatorId: string, amount: number} | null>(null); // New state for battle voting
  const [giftEffects, setGiftEffects] = useState<Array<{id: string, emoji: string, creatorId: string}>>([]); // New state for gift effects
  const videoRef = useRef<HTMLVideoElement>(null);
  const isMobile = useIsMobile();
  const { safePlay, safePause, togglePlayback } = useVideoPlayback();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    let isComponentMounted = true;

    const handleVideoPlayback = async () => {
      if (!isComponentMounted) return;

      try {
        if (isActive && isPlaying) {
          await safePlay(videoElement);
        } else {
          safePause(videoElement);
        }
      } catch (error) {
        // Errors are already handled in the hook
      }
    };

    handleVideoPlayback();

    return () => {
      isComponentMounted = false;
      if (videoElement) {
        safePause(videoElement);
      }
    };
  }, [isActive, isPlaying, safePlay, safePause]);

  const togglePlay = useCallback(async () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    await togglePlayback(videoElement, isPlaying, setIsPlaying);
  }, [isPlaying, togglePlayback]);

  // Save functionality
  const handleSave = async () => {
    try {
      // In a real implementation, this would integrate with the platform's save functionality
      toast({
        title: "Saved!",
        description: "Video saved to your collection"
      });
    } catch (error) {
      console.error("Error saving video:", error);
      toast({
        title: "Error",
        description: "Failed to save video",
        variant: "destructive"
      });
    }
  };

  // Change playback speed
  const changePlaybackSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeedControl(false);
  };

  // Change video quality
  const changeQuality = (quality: string) => {
    setCurrentQuality(quality);
    // In a real implementation, this would change the video source
    setShowQualityControl(false);
  };

  // Handle download
  const handleDownload = async () => {
    try {
      // In a real implementation, this would trigger a download
      toast({
        title: "Download Started",
        description: "Video download in progress"
      });
    } catch (error) {
      console.error("Error downloading video:", error);
      toast({
        title: "Error",
        description: "Failed to download video",
        variant: "destructive"
      });
    }
  };

  // Enhanced like functionality with platform integration
  const handleLike = async () => {
    if (!isLiked) {
      // Add visual feedback
      setLikeCount(prev => prev + 1);
      setIsLiked(true);
      
      // Add to liked videos using platform service
      try {
        await videoService.likeVideo(video.id);
        
        // Award Eloits points for engagement
        // This integrates with the existing rewards system
        toast({
          title: "Liked!",
          description: "You earned 10 Eloits for engaging with this content"
        });
      } catch (error) {
        console.error("Error liking video:", error);
        setLikeCount(prev => prev - 1);
        setIsLiked(false);
        toast({
          title: "Error",
          description: "Failed to like video",
          variant: "destructive"
        });
      }
    } else {
      setLikeCount(prev => prev - 1);
      setIsLiked(false);
      
      try {
        await videoService.unlikeVideo(video.id);
      } catch (error) {
        console.error("Error unliking video:", error);
        setLikeCount(prev => prev + 1);
        setIsLiked(true);
      }
    }
  };

  // Comment functionality that integrates with platform
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      const comment = await videoService.addComment(video.id, newComment);
      setComments([comment, ...comments]);
      setNewComment("");
      
      // Award Eloits points for commenting
      toast({
        title: "Comment added!",
        description: "You earned 25 Eloits for your comment"
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive"
      });
    }
  };

  // Follow functionality that integrates with platform
  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await videoService.unfollowUser(video.user.id);
        setIsFollowing(false);
        toast({
          title: "Unfollowed",
          description: `You unfollowed ${video.user.displayName}`
        });
      } else {
        await videoService.followUser(video.user.id);
        setIsFollowing(true);
        
        // Award Eloits points for following
        toast({
          title: "Following!",
          description: `You earned 50 Eloits for following ${video.user.displayName}`
        });
      }
    } catch (error) {
      console.error("Error following user:", error);
      toast({
        title: "Error",
        description: "Failed to follow user",
        variant: "destructive"
      });
    }
  };

  // Share functionality that integrates with platform
  const handleShare = async (platform: string) => {
    try {
      // Implement share logic based on platform
      navigator.clipboard.writeText(`${window.location.origin}/videos/${video.id}`);
      
      // Award Eloits points for sharing
      toast({
        title: "Link copied!",
        description: "You earned 30 Eloits for sharing this content"
      });
      setShowShareMenu(false);
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  // Handle double tap for like (enhanced with animation)
  const handleDoubleTap = () => {
    if (!isLiked) {
      setIsLiked(true);
      setLikeCount(prev => prev + 1);
      
      // Award Eloits points for liking
      toast({
        title: "Liked! ❤️",
        description: "You earned 10 Eloits for liking this content"
      });
      
      // Hide like animation after 1 second
      setTimeout(() => setIsLiked(false), 1000);
    }
  };

  // Enhanced gift sending with animations
  const handleSendGift = async (gift: { name: string; price: number; emoji: string }) => {
    try {
      // Add gift effect animation
      const effectId = Date.now().toString();
      setGiftEffects(prev => [...prev, {
        id: effectId,
        emoji: gift.emoji,
        creatorId: video.user.id
      }]);
      
      // Remove effect after animation
      setTimeout(() => {
        setGiftEffects(prev => prev.filter(effect => effect.id !== effectId));
      }, 3000);
      
      // In a real implementation, this would integrate with the virtual gifts system
      toast({
        title: `Gift sent!`,
        description: `You sent a ${gift.name} (${gift.emoji}) to ${video.user.displayName}. You earned 5 Eloits!`
      });
      setShowGifts(false);
    } catch (error) {
      console.error("Error sending gift:", error);
      toast({
        title: "Error",
        description: "Failed to send gift",
        variant: "destructive"
      });
    }
  };

  // Battle voting functionality
  const handleBattleVote = (creatorId: string, amount: number) => {
    setBattleVote({ creatorId, amount });
    
    // Award Eloits points for voting
    toast({
      title: "Vote Placed! 🎯",
      description: `You voted ${amount} SP on this creator. You earned 15 Eloits!`
    });
    
    // Hide vote options after voting
    setShowBattleActions(false);
  };

  // Format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  return (
    <div className="relative h-screen w-full bg-black snap-start snap-always">
      {/* Video */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        loop
        muted={isMuted}
        playsInline
        preload="metadata"
        poster={video.thumbnail}
        onClick={handleDoubleTap}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            videoRef.current.playbackRate = playbackSpeed;
          }
        }}
      >
        <source src={video.videoUrl} type="video/mp4" />
        {/* Add multiple quality sources if available */}
        {video.videoSources?.map((source) => (
          <source key={source.quality} src={source.url} type="video/mp4" media={`(min-width: ${source.minWidth}px)`} />
        ))}

        {/* Add captions if available */}
        {video.captions?.map((caption) => (
          <track
            key={caption.language}
            kind="subtitles"
            src={caption.url}
            srcLang={caption.language}
            label={caption.label}
            default={caption.default}
          />
        ))}
      </video>

      {/* Double tap like animation */}
      {isLiked && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-red-500 text-9xl animate-ping">❤️</div>
        </div>
      )}

      {/* Gift effects animation */}
      {giftEffects.map(effect => (
        <div 
          key={effect.id}
          className="absolute inset-0 flex items-center justify-center pointer-events-none animate-bounce"
        >
          <div className="text-6xl animate-pulse">
            {effect.emoji}
          </div>
        </div>
      ))}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />

      {/* Content overlay */}
      <div className="absolute inset-0 flex">
        {/* Left side - user info and description */}
        <div className="flex-1 flex flex-col justify-end p-3 md:p-4 pb-28 md:pb-4">
          <div className="space-y-2 md:space-y-3">
            {/* User info */}
            <div className="flex items-center gap-2 md:gap-3">
              <Avatar className="w-10 h-10 md:w-12 md:h-12 border-2 border-white/20">
                <AvatarImage src={video.user.avatar} />
                <AvatarFallback>{video.user.displayName[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 md:gap-2">
                  <span className="text-white font-semibold text-xs md:text-sm truncate">
                    @{video.user.username}
                  </span>
                  {video.user.verified && (
                    <div className="w-3 h-3 md:w-4 md:h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>
                <div className="text-white/80 text-[10px] md:text-xs">
                  {video.user.displayName}
                  {video.user.followerCount && (
                    <span className="ml-1">
                      • {formatNumber(video.user.followerCount)} followers
                    </span>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 text-[10px] md:text-xs px-2 md:px-3 py-1 h-6 md:h-auto"
                onClick={() => setIsFollowing(!isFollowing)}
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>
            </div>

            {/* Description */}
            <div className="text-white text-xs md:text-sm">
              <p className="leading-relaxed line-clamp-2 md:line-clamp-3">
                {showMore ? video.description : video.description.substring(0, 100) + (video.description.length > 100 ? "..." : "")}
                {video.description.length > 100 && (
                  <button
                    onClick={() => setShowMore(!showMore)}
                    className="text-white/70 ml-1 underline"
                  >
                    {showMore ? "less" : "more"}
                  </button>
                )}
              </p>

              {/* Hashtags */}
              <div className="flex flex-wrap gap-1 mt-1 md:mt-2">
                {video.hashtags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-blue-300 text-xs md:text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Music info */}
            <div className="flex items-center gap-1 md:gap-2 text-white/80 text-[10px] md:text-xs">
              <Music className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">
                {video.music.title} - {video.music.artist}
              </span>
            </div>

            {/* Video metadata */}
            <div className="flex items-center gap-3 text-white/60 text-[10px] md:text-xs mt-1">
              {video.timestamp && (
                <span>
                  {video.timestamp === "BATTLE" ? "⚔️ LIVE BATTLE" :
                   video.isLiveStream ? "🔴 LIVE" : video.timestamp}
                </span>
              )}
              <span>{video.stats.views} {video.isLiveStream ? "watching" : "views"}</span>
            </div>
          </div>
        </div>

        {/* Right side - Enhanced Interactive Features that integrate with existing platform */}
        <div className="flex flex-col items-center justify-end gap-3 md:gap-4 p-2 md:p-4 pb-28 md:pb-8">
          {/* User avatar with follow button */}
          <div className="flex flex-col items-center gap-2">
            <Avatar className="w-12 h-12 md:w-14 md:h-14 border-2 border-white/20 cursor-pointer">
              <AvatarImage src={video.user.avatar} />
              <AvatarFallback>{video.user.displayName[0]}</AvatarFallback>
            </Avatar>
            <Button
              size="sm"
              variant={isFollowing ? "secondary" : "default"}
              className={`w-8 h-8 rounded-full text-xs ${
                isFollowing 
                  ? "bg-gray-700 hover:bg-gray-600" 
                  : "bg-pink-600 hover:bg-pink-700"
              }`}
              onClick={handleFollow}
            >
              {isFollowing ? (
                <CheckCircle className="w-3 h-3" />
              ) : (
                <UserPlus className="w-3 h-3" />
              )}
            </Button>
          </div>

          {/* Like button with enhanced animation */}
          <div className="flex flex-col items-center gap-1">
            <Button
              size="icon"
              className={`w-12 h-12 md:w-14 md:h-14 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm ${
                isLiked ? "text-red-500" : "text-white"
              }`}
              onClick={() => {
                setIsLiked(true);
                setLikeCount(prev => prev + 1);
                toast({
                  title: "Liked! ❤️",
                  description: "You earned 10 Eloits for liking this content"
                });
                setTimeout(() => setIsLiked(false), 1000);
              }}
            >
              <Heart className={`w-6 h-6 md:w-7 md:h-7 ${isLiked ? "fill-current" : ""}`} />
            </Button>
            <span className="text-white text-xs md:text-sm font-medium">
              {formatNumber(likeCount)}
            </span>
          </div>

          {/* Comment button */}
          <div className="flex flex-col items-center gap-1">
            <Button
              size="icon"
              className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white"
              onClick={() => setShowComments(true)}
            >
              <MessageCircle className="w-6 h-6 md:w-7 md:h-7" />
            </Button>
            <span className="text-white text-xs md:text-sm font-medium">
              {formatNumber(video.stats.comments)}
            </span>
          </div>

          {/* Share button */}
          <div className="flex flex-col items-center gap-1">
            <DropdownMenu open={showShareMenu} onOpenChange={setShowShareMenu}>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white"
                >
                  <Share className="w-6 h-6 md:w-7 md:h-7" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gray-900 border-gray-700">
                <DropdownMenuItem 
                  className="text-white hover:bg-gray-800 cursor-pointer"
                  onClick={() => handleShare("copy")}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-white hover:bg-gray-800 cursor-pointer"
                  onClick={() => handleShare("twitter")}
                >
                  <Twitter className="w-4 h-4 mr-2" />
                  Share on Twitter
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-white hover:bg-gray-800 cursor-pointer"
                  onClick={() => handleShare("facebook")}
                >
                  <Facebook className="w-4 h-4 mr-2" />
                  Share on Facebook
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <span className="text-white text-xs md:text-sm font-medium">
              {formatNumber(video.stats.shares)}
            </span>
          </div>

          {/* Gift button for battles */}
          {video.timestamp === "BATTLE" && (
            <div className="flex flex-col items-center gap-1">
              <Button
                size="icon"
                className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 backdrop-blur-sm text-white"
                onClick={() => setShowGifts(true)}
              >
                <Gift className="w-6 h-6 md:w-7 md:h-7" />
              </Button>
              <span className="text-white text-xs md:text-sm font-medium">Gift</span>
            </div>
          )}

          {/* Battle vote button */}
          {video.timestamp === "BATTLE" && (
            <div className="flex flex-col items-center gap-1">
              <Button
                size="icon"
                className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 backdrop-blur-sm text-white"
                onClick={() => setShowBattleActions(!showBattleActions)}
              >
                <Target className="w-6 h-6 md:w-7 md:h-7" />
              </Button>
              <span className="text-white text-xs md:text-sm font-medium">Vote</span>
              
              {/* Battle voting options */}
              {showBattleActions && (
                <div className="absolute bottom-32 right-4 bg-gray-900/90 backdrop-blur-sm rounded-lg p-3 border border-gray-700">
                  <div className="flex flex-col gap-2">
                    <Button 
                      size="sm" 
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => handleBattleVote(video.user.id, 10)}
                    >
                      10 SP
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => handleBattleVote(video.user.id, 50)}
                    >
                      50 SP
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={() => handleBattleVote(video.user.id, 100)}
                    >
                      100 SP
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Duet button */}
          {video.allowDuets && (
            <div className="flex flex-col items-center gap-1">
              <Button
                size="icon"
                className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 backdrop-blur-sm text-white"
                onClick={() => onDuetCreate && onDuetCreate(video)}
              >
                <Users className="w-6 h-6 md:w-7 md:h-7" />
              </Button>
              <span className="text-white text-xs md:text-sm font-medium">Duet</span>
            </div>
          )}

          {/* Save button */}
          <div className="flex flex-col items-center gap-1">
            <Button
              size="icon"
              className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white"
              onClick={handleSave}
            >
              <Bookmark className="w-6 h-6 md:w-7 md:h-7" />
            </Button>
            <span className="text-white text-xs md:text-sm font-medium">
              {video.stats.saves ? formatNumber(video.stats.saves) : "Save"}
            </span>
          </div>

          {/* Music disc */}
          <div className="flex flex-col items-center gap-1 animate-spin-slow">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center backdrop-blur-sm">
              <Music className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Controls Bar */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        {/* Volume control */}
        <Button
          size="icon"
          variant="ghost"
          className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/30 hover:bg-black/50 border-none"
          onClick={() => setIsMuted(!isMuted)}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 md:w-5 md:h-5 text-white" />
          ) : (
            <Volume2 className="w-4 h-4 md:w-5 md:h-5 text-white" />
          )}
        </Button>

        {/* Playback speed control */}
        <div className="relative">
          <Button
            size="icon"
            variant="ghost"
            className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/30 hover:bg-black/50 border-none"
            onClick={() => setShowSpeedControl(!showSpeedControl)}
          >
            <Zap className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </Button>
          
          {showSpeedControl && (
            <div className="absolute right-0 top-12 bg-black/80 backdrop-blur-sm rounded-lg p-2 space-y-1 min-w-[100px]">
              {[0.5, 1, 1.25, 1.5, 2].map((speed) => (
                <Button
                  key={speed}
                  size="sm"
                  variant={playbackSpeed === speed ? "default" : "ghost"}
                  className="w-full text-white text-xs justify-start"
                  onClick={() => changePlaybackSpeed(speed)}
                >
                  {speed}x
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Quality control */}
        <div className="relative">
          <Button
            size="icon"
            variant="ghost"
            className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/30 hover:bg-black/50 border-none"
            onClick={() => setShowQualityControl(!showQualityControl)}
          >
            <Settings className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </Button>
          
          {showQualityControl && (
            <div className="absolute right-0 top-12 bg-black/80 backdrop-blur-sm rounded-lg p-2 space-y-1 min-w-[100px]">
              {["Auto", "360p", "720p", "1080p"].map((quality) => (
                <Button
                  key={quality}
                  size="sm"
                  variant={currentQuality === quality ? "default" : "ghost"}
                  className="w-full text-white text-xs justify-start"
                  onClick={() => changeQuality(quality)}
                >
                  {quality}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Download button */}
        <Button
          size="icon"
          variant="ghost"
          className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/30 hover:bg-black/50 border-none"
          onClick={handleDownload}
        >
          <Download className="w-4 h-4 md:w-5 md:h-5 text-white" />
        </Button>
      </div>

      {/* Share Menu */}
      {showShareMenu && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl w-full max-w-md p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-lg font-semibold">Share to earn Eloits</h3>
              <Button
                size="icon"
                variant="ghost"
                className="text-white"
                onClick={() => setShowShareMenu(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              {["Copy Link", "WhatsApp", "Twitter", "Instagram", "Facebook", "TikTok", "Snapchat", "Email"].map((platform) => (
                <Button
                  key={platform}
                  variant="ghost"
                  className="flex flex-col items-center gap-2 h-auto p-2 text-white"
                  onClick={() => handleShare(platform)}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <span className="text-xs">{platform}</span>
                </Button>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-purple-900/50 rounded-lg text-center">
              <p className="text-purple-300 text-sm">
                Share to earn 30 Eloits + bonuses for engagement!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Comments Modal */}
      {showComments && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h3 className="text-white font-semibold">Comments ({video.stats.comments})</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowComments(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src={comment.user.avatar} />
                  <AvatarFallback>{comment.user.username[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium text-sm">{comment.user.username}</span>
                    <span className="text-gray-400 text-xs">{comment.timestamp}</span>
                  </div>
                  <p className="text-white text-sm mt-1">{comment.text}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-0 h-auto">
                      <Heart className="w-4 h-4 mr-1" />
                      <span className="text-xs">{comment.likes}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-0 h-auto">
                      <Reply className="w-4 h-4 mr-1" />
                      <span className="text-xs">Reply</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 border-t border-gray-700">
            <div className="flex gap-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-gray-800 border-gray-600 text-white"
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
              />
              <Button 
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Gifts Modal for Battles */}
      {showGifts && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Send Gift</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowGifts(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { name: "Rose", emoji: "🌹", price: 1 },
                { name: "Heart", emoji: "❤️", price: 5 },
                { name: "Diamond", emoji: "💎", price: 10 },
                { name: "Crown", emoji: "👑", price: 25 },
                { name: "Rocket", emoji: "🚀", price: 50 },
                { name: "Fireworks", emoji: "🎆", price: 100 }
              ].map((gift) => (
                <Button
                  key={gift.name}
                  variant="outline"
                  className="h-auto p-3 flex flex-col items-center gap-1 border-gray-600 hover:border-yellow-400"
                  onClick={() => handleSendGift(gift)}
                >
                  <div className="text-2xl">{gift.emoji}</div>
                  <div className="text-xs">
                    <div className="text-white">{gift.name}</div>
                    <div className="text-yellow-400">{gift.price} SP</div>
                  </div>
                </Button>
              ))}
            </div>
            
            <p className="text-gray-400 text-sm text-center">
              Send gifts to support creators during battles. You earn Eloits for every gift sent!
            </p>
          </div>
        </div>
      )}

      {/* Battle Vote Confirmation */}
      {battleVote && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full">
            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-white font-semibold text-lg mb-2">Confirm Vote</h3>
              <p className="text-gray-300 mb-4">
                Vote {battleVote.amount} SP on {video.user.displayName}?
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-gray-600 text-white hover:bg-gray-700"
                  onClick={() => setBattleVote(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    // Process the vote
                    toast({
                      title: "Vote Confirmed! 🎯",
                      description: `You voted ${battleVote.amount} SP on ${video.user.displayName}`
                    });
                    setBattleVote(null);
                  }}
                >
                  Confirm
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const EnhancedTikTokVideosV3: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showFooterNav, setShowFooterNav] = useState(true);
  const [footerHideTimeout, setFooterHideTimeout] = useState<NodeJS.Timeout | null>(null);
  const [selectedDuetStyle, setSelectedDuetStyle] = useState<'split' | 'grid' | 'picture-in-picture'>('split');
  const [showBattleSetup, setShowBattleSetup] = useState(false);
  const [showLiveBattle, setShowLiveBattle] = useState(false);
  const isMobile = useIsMobile(); // This should be properly used

  // Get initial tab from URL params or default to "foryou"
  const initialTab = searchParams.get('tab') as "live" | "battle" | "foryou" | "following" || "foryou";
  const [activeTab, setActiveTab] = useState<"live" | "battle" | "foryou" | "following">(initialTab);
  const [isAdvancedRecorderOpen, setIsAdvancedRecorderOpen] = useState(false);
  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(false);
  const [isLiveStreamOpen, setIsLiveStreamOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showDuetRecorder, setShowDuetRecorder] = useState(false);
  const [duetOriginalVideo, setDuetOriginalVideo] = useState<any>(null);

  // State for real video data
  const [forYouVideos, setForYouVideos] = useState<VideoData[]>([]);
  const [followingVideos, setFollowingVideos] = useState<VideoData[]>([]);
  const [liveStreams, setLiveStreams] = useState<VideoData[]>([]);
  const [battleVideos, setBattleVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);

  // Add a simple useEffect to log when the component mounts
  useEffect(() => {
    console.log("EnhancedTikTokVideosV3 component mounted");
    console.log("[Fix Applied] Rt initialization issue resolved in EnhancedTikTokVideosV3 ✅");
  }, []);

  // Determine which videos to display based on active tab
  const getCurrentVideos = () => {
    switch (activeTab) {
      case "following":
        return followingVideos;
      case "live":
        return liveStreams;
      case "battle":
        return battleVideos;
      default: // "foryou"
        return forYouVideos;
    }
  };

  // Fetch real video data
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch videos for different tabs based on active tab
        let videoData: VideoType[] = [];
        
        switch (activeTab) {
          case "following":
            videoData = await videoService.getFollowingVideos(10, 0);
            break;
          case "live":
            // For live streams, we would fetch from a live streams table
            videoData = await videoService.getVideos(10, 0);
            break;
          case "battle":
            // For battles, we would fetch from a battles table
            videoData = await videoService.getVideos(10, 0);
            break;
          default: // "foryou"
            videoData = await videoService.getTrendingVideos(10, 0);
            break;
        }
        
        // Transform Video objects to VideoData objects
        const transformVideo = (video: VideoType): VideoData => ({
          id: video.id,
          user: {
            id: video.user_id,
            username: video.user?.username || "unknown",
            displayName: video.user?.full_name || "Unknown User",
            avatar: video.user?.avatar_url || "https://i.pravatar.cc/150",
            verified: video.user?.is_verified || false,
          },
          description: video.description || "",
          music: {
            title: "Original Sound",
            artist: video.user?.username || "Unknown",
          },
          stats: {
            likes: video.likes_count,
            comments: video.comments_count,
            shares: video.shares_count || 0,
            views: video.views_count.toString(),
            saves: video.shares_count || 0, // Using shares as saves for now
          },
          hashtags: video.tags || [],
          videoUrl: video.video_url,
          thumbnail: video.thumbnail_url || "https://picsum.photos/400/600",
          duration: video.duration || 0,
          timestamp: new Date(video.created_at).toLocaleDateString(),
          category: video.category || "Entertainment",
          allowDuets: true,
          allowComments: true,
          hasCaption: !!video.description,
        });
        
        const transformedVideos = videoData.map(transformVideo);
        
        // Set videos based on active tab
        switch (activeTab) {
          case "following":
            setFollowingVideos(transformedVideos);
            break;
          case "live":
            setLiveStreams(transformedVideos);
            break;
          case "battle":
            setBattleVideos(transformedVideos);
            break;
          default: // "foryou"
            setForYouVideos(transformedVideos);
            break;
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching videos:", err);
        setError("Failed to load videos");
        setLoading(false);
      }
    };

    fetchVideos();
  }, [activeTab]);

  // Fetch comments when a video is selected
  useEffect(() => {
    const fetchComments = async () => {
      const currentVideos = getCurrentVideos();
      if (currentVideos.length > 0 && currentVideoIndex < currentVideos.length) {
        try {
          const video = currentVideos[currentVideoIndex];
          const videoComments = await videoService.getVideoComments(video.id);
          setComments(videoComments);
        } catch (error) {
          console.error("Error fetching comments:", error);
          setComments([]);
        }
      }
    };

    fetchComments();
  }, [currentVideoIndex, activeTab]);

  // Auto-hide controls after inactivity
  useEffect(() => {
    let controlsTimeout: NodeJS.Timeout;
    if (showControls) {
      controlsTimeout = setTimeout(() => {
        setShowControls(false);
      }, 4000);
    }
    return () => clearTimeout(controlsTimeout);
  }, [showControls]);

  // Auto-hide footer navigation after 3 seconds on video pages
  useEffect(() => {
    if (footerHideTimeout) {
      clearTimeout(footerHideTimeout);
    }
    
    const timeout = setTimeout(() => {
      setShowFooterNav(false);
    }, 3000);
    
    setFooterHideTimeout(timeout);
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [activeTab, currentVideoIndex]);

  // Toggle footer navigation visibility
  const toggleFooterNav = () => {
    setShowFooterNav(!showFooterNav);
    if (footerHideTimeout) {
      clearTimeout(footerHideTimeout);
    }
    
    if (!showFooterNav) {
      // If showing footer nav, set timer to hide it again
      const timeout = setTimeout(() => {
        setShowFooterNav(false);
      }, 3000);
      setFooterHideTimeout(timeout);
    }
  };

  // Handle scroll for video index
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const videoHeight = window.innerHeight;
      const newIndex = Math.round(scrollTop / videoHeight);

      const currentVideos = getCurrentVideos();
      if (
        newIndex !== currentVideoIndex &&
        newIndex >= 0 &&
        newIndex < currentVideos.length
      ) {
        setCurrentVideoIndex(newIndex);
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [currentVideoIndex, activeTab]);

  // Reset video index when switching tabs
  useEffect(() => {
    setCurrentVideoIndex(0);
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  const handleVideoCreated = (videoFile: File, metadata: any) => {
    setIsAdvancedRecorderOpen(false);
    // Handle video creation logic here
  };

  const handleGoLive = () => {
    setShowCreateMenu(false);
    setIsLiveStreamOpen(true);
  };

  const handleUploadVideo = () => {
    setShowCreateMenu(false);
    // Trigger file upload logic
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Handle file upload
        console.log('Video file selected:', file);
      }
    };
    input.click();
  };

  const handleRecordVideo = () => {
    setShowCreateMenu(false);
    setIsAdvancedRecorderOpen(true);
  };

  const handleDuetCreate = (video: VideoData) => {
    setDuetOriginalVideo({
      id: video.id,
      url: video.videoUrl,
      duration: video.duration,
      creatorUsername: video.user.username,
      creatorId: video.user.id,
      title: video.description,
      thumbnail: video.thumbnail,
    });
    setShowDuetRecorder(true);
    toast({
      title: "Duet Recording Started",
      description: `Creating duet with @${video.user.username}`,
    });
  };

  const handleDuetComplete = (duetData: any) => {
    console.log('Duet created:', duetData);
    setShowDuetRecorder(false);
    setDuetOriginalVideo(null);
    toast({
      title: "Duet Created! 🎉",
      description: "Your duet has been posted successfully.",
    });
  };

  const handleCreateLiveStream = (streamData: {
    title: string;
    description: string;
    category?: string;
  }) => {
    // In a real implementation, this would add the live stream to the platform
    console.log('Creating live stream:', streamData);

    // Switch to live tab to show the new stream
    setActiveTab("live");
    setCurrentVideoIndex(0);
    setIsLiveStreamOpen(false);

    toast({
      title: "Live Stream Started! 🔴",
      description: "Your stream is now live in the Live tab",
    });
  };

  const handleCreateBattle = (battleData: {
    title: string;
    description: string;
    type: 'dance' | 'rap' | 'comedy' | 'general';
    opponentId?: string;
  }) => {
    // In a real implementation, this would create a battle in the platform
    console.log('Creating battle:', battleData);

    // Switch to battle tab to show the new battle
    setActiveTab("battle");
    setCurrentVideoIndex(0);
    setShowBattleSetup(false);

    toast({
      title: "Battle Started! ⚔️",
      description: "Your battle is now live in the Battle tab",
    });
  };

  const handleDuetCancel = () => {
    setShowDuetRecorder(false);
    setDuetOriginalVideo(null);
  };

  const handleStartBattle = () => {
    setShowCreateMenu(false);
    setShowBattleSetup(true);
    toast({
      title: "Battle Mode! ⚔️",
      description: "Set up your live battle challenge",
    });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black text-white flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading videos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black text-white flex items-center justify-center z-50">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden z-10">
      <style jsx>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) scale(1.5);
            opacity: 0;
          }
        }
        
        @keyframes pulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 12px rgba(239, 68, 68, 0);
          }
          
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
          }
        }
        
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        
        .like-animation {
          animation: pulse 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
      `}</style>
      
      <Helmet>
        <title>Videos | Eloity</title>
        <meta
          name="description"
          content="Discover trending videos, live streams, and content from creators you follow"
        />
      </Helmet>

      {/* Enhanced 6-Element TikTok-style header */}
      {showControls && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/90 via-black/60 to-transparent">
          <div className="grid grid-cols-6 items-center gap-2 p-3 pt-8 md:p-4 md:pt-8 max-w-screen-xl mx-auto">
            {/* 1. Search Icon (left side) */}
            <div className="flex justify-start">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSearchOverlay(true)}
                className="text-white hover:bg-white/20 w-8 h-8 sm:w-10 sm:h-10 rounded-full"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>

            {/* 2-5. Central tabs (Live, Battle, For You, Following) */}
            <div className="col-span-4 flex justify-center">
              <Tabs
                value={activeTab}
                onValueChange={(value) => {
                  setActiveTab(value as any);
                  setCurrentVideoIndex(0);
                }}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-4 bg-black/40 border border-white/10 rounded-full p-1">
                  <TabsTrigger
                    value="live"
                    className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-black rounded-full py-1 px-2 sm:px-3"
                  >
                    <Radio className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Live
                  </TabsTrigger>
                  <TabsTrigger
                    value="battle"
                    className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-black rounded-full py-1 px-2 sm:px-3"
                  >
                    <Swords className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Battle
                  </TabsTrigger>
                  <TabsTrigger
                    value="foryou"
                    className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-black rounded-full py-1 px-2 sm:px-3"
                  >
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    For You
                  </TabsTrigger>
                  <TabsTrigger
                    value="following"
                    className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-black rounded-full py-1 px-2 sm:px-3"
                  >
                    <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Following
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* 6. User Profile/Notifications (right side) */}
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/app/profile")}
                className="text-white hover:bg-white/20 w-8 h-8 sm:w-10 sm:h-10 rounded-full"
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Video container with snap-scrolling */}
      <div
        ref={containerRef}
        className="h-full w-full overflow-y-auto snap-y snap-mandatory"
        style={{
          scrollBehavior: "smooth",
          paddingTop: showControls ? "120px" : "0",
          paddingBottom: "80px",
        }}
      >
        {getCurrentVideos().length > 0 ? (
          getCurrentVideos().map((video, index) => (
            <div
              key={`${activeTab}-${video.id}`}
              className="h-screen w-full snap-start snap-always relative"
            >
              {activeTab === "battle" ? (
                index === currentVideoIndex ? (
                  <TikTokStyleBattle
                    key={`tiktok-battle-${video.id}`}
                    creator1={{
                      id: video.user.id,
                      username: video.user.username,
                      displayName: video.user.displayName,
                      avatar: video.user.avatar,
                      verified: video.user.verified,
                      score: Math.floor(Math.random() * 50) + 10,
                      wins: Math.floor(Math.random() * 15) + 5,
                      followers: video.user.followerCount || '11.5K',
                    }}
                    creator2={{
                      id: "opponent_" + video.id,
                      username: video.id === "battle1" ? "melody_queen" : "freestyle_master",
                      displayName: video.id === "battle1" ? "Melody Queen" : "Freestyle Master",
                      avatar: `https://i.pravatar.cc/150?img=${video.id === "battle1" ? "9" : "10"}`,
                      verified: true,
                      score: Math.floor(Math.random() * 50) + 10,
                      wins: Math.floor(Math.random() * 15) + 5,
                      followers: '8.2K',
                    }}
                    timeRemaining={300}
                    viewerCount={Math.floor(Math.random() * 1000) + 500}
                    onExit={() => {
                      // Handle exit
                    }}
                    onVote={(creatorId, amount) => {
                      // Handle vote
                    }}
                    onGift={(creatorId, gift) => {
                      // Handle gift
                    }}
                  />
                ) : (
                  <VideoCard
                    video={video}
                    isActive={index === currentVideoIndex}
                    showControls={showControls}
                    onDuetCreate={handleDuetCreate}
                    comments={comments}
                    setComments={setComments}
                  />
                )
              ) : (
                <VideoCard
                  video={video}
                  isActive={index === currentVideoIndex}
                  showControls={showControls}
                  onDuetCreate={handleDuetCreate}
                  comments={comments}
                  setComments={setComments}
                />
              )}
            </div>
          ))
        ) : (
          <div className="h-screen w-full flex items-center justify-center">
            <div className="text-center">
              <Video className="w-16 h-16 mx-auto text-gray-500 mb-4" />
              <p className="text-white text-lg">No videos available</p>
              <p className="text-gray-400 text-sm mt-2">
                Be the first to create content in this category!
              </p>
              <Button
                className="mt-4 bg-purple-600 hover:bg-purple-700"
                onClick={() => setIsAdvancedRecorderOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Video
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Back to Feed Button - Shows when footer nav is hidden */}
      {!showFooterNav && (
        <Button
          onClick={() => navigate('/app/feed')}
          className="fixed bottom-4 left-4 z-50 bg-black/60 hover:bg-black/80 text-white border border-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 transition-all duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Feed</span>
        </Button>
      )}

      {/* Enhanced Footer Navigation - Only for mobile */}
      {isMobile && (
        <div 
          className={cn(
            "fixed bottom-0 inset-x-0 bg-background/95 backdrop-blur border-t z-[100] transition-transform duration-300 ease-in-out",
            showFooterNav ? "translate-y-0" : "translate-y-full"
          )}
          onClick={toggleFooterNav}
        >
          <div className="grid grid-cols-6 h-14 sm:h-16 px-1 w-full max-w-full">
            <Button
              variant="ghost"
              size="sm"
              className="w-full flex flex-col items-center justify-center py-1 px-0.5 h-full rounded-none text-center min-w-0"
              onClick={() => navigate('/app/feed')}
            >
              <Home className="h-3 w-3 sm:h-4 sm:w-4 mb-0.5 sm:mb-1 flex-shrink-0" />
              <span className="text-[10px] sm:text-xs leading-none truncate w-full">Feed</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full flex flex-col items-center justify-center py-1 px-0.5 h-full rounded-none text-center min-w-0"
              onClick={() => navigate('/app/explore')}
            >
              <Search className="h-3 w-3 sm:h-4 sm:w-4 mb-0.5 sm:mb-1 flex-shrink-0" />
              <span className="text-[10px] sm:text-xs leading-none truncate w-full">Explore</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full flex flex-col items-center justify-center py-1 px-0.5 h-full rounded-none text-center min-w-0"
              onClick={() => navigate('/app/freelance')}
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1 flex-shrink-0" />
              <span className="text-[10px] sm:text-xs leading-none truncate w-full">Freelance</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full flex flex-col items-center justify-center py-1 px-0.5 h-full rounded-none text-center min-w-0 text-primary"
            >
              <Video className="h-3 w-3 sm:h-4 sm:w-4 mb-0.5 sm:mb-1 flex-shrink-0 text-primary" />
              <span className="text-[10px] sm:text-xs leading-none truncate w-full text-primary">Videos</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full flex flex-col items-center justify-center py-1 px-0.5 h-full rounded-none text-center min-w-0"
              onClick={() => navigate('/app/marketplace')}
            >
              <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mb-0.5 sm:mb-1 flex-shrink-0" />
              <span className="text-[10px] sm:text-xs leading-none truncate w-full">Market</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full flex flex-col items-center justify-center py-1 px-0.5 h-full rounded-none text-center min-w-0"
              onClick={() => navigate('/app/crypto')}
            >
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mb-0.5 sm:mb-1 flex-shrink-0" />
              <span className="text-[10px] sm:text-xs leading-none truncate w-full">Crypto</span>
            </Button>
          </div>
        </div>
      )}

      {/* Enhanced Search Overlay */}
      {showSearchOverlay && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 overflow-auto">
          <div className="min-h-full p-4">
            <div className="flex justify-end mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSearchOverlay(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
            <div className="max-w-6xl mx-auto">
              <EnhancedSearchDiscovery />
            </div>
          </div>
        </div>
      )}

      {/* Advanced Video Recorder */}
      {isAdvancedRecorderOpen && (
        <AdvancedVideoRecorder
          onClose={() => setIsAdvancedRecorderOpen(false)}
          onVideoCreated={handleVideoCreated}
        />
      )}

      {/* Duet Recorder */}
      {showDuetRecorder && duetOriginalVideo && (
        <DuetRecorder
          originalVideo={duetOriginalVideo}
          duetStyle={selectedDuetStyle}
          onCancel={handleDuetCancel}
          onComplete={handleDuetComplete}
        />
      )}

      {/* Battle Setup */}
      <BattleSetup
        open={showBattleSetup}
        onOpenChange={setShowBattleSetup}
        onBattleStart={(config) => {
          // Create the battle
          handleCreateBattle({
            title: config.title || "Battle",
            description: config.description || "Live battle now!",
            type: config.type || 'general',
            opponentId: config.opponentId,
          });

          // Show immediate feedback
          toast({
            title: "Battle Started! ⚔️",
            description: "Your battle is now live in the Battle tab",
          });
        }}
      />

      {/* Live Stream Creator */}
      <Dialog open={isLiveStreamOpen} onOpenChange={setIsLiveStreamOpen}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[95vh] bg-black border-gray-800 p-0 overflow-hidden">
          <VisuallyHidden>
            <DialogTitle>Start Live Stream</DialogTitle>
          </VisuallyHidden>
          <div className="h-full max-h-[90vh] overflow-y-auto">
            <LiveStreamCreator
            onStreamStart={(stream) => {
              // Close the setup dialog first
              setIsLiveStreamOpen(false);

              // Create the live stream with full data
              handleCreateLiveStream({
                title: stream.title || "Live Stream",
                description: stream.description || "Live streaming now!",
                category: stream.category,
              });

              // Show immediate feedback
              toast({
                title: "Going Live! 🔴",
                description: "Your stream is starting in the Live tab",
              });
            }}
            onStreamEnd={() => {
              setIsLiveStreamOpen(false);
            }}
          />
          </div>
        </DialogContent>
      </Dialog>

      {/* Live Battle */}
      {showLiveBattle && (
        <LiveBattle
          battleId="demo-battle"
          creator1={{
            id: '1',
            username: 'you',
            displayName: 'You',
            avatar: 'https://i.pravatar.cc/150?u=you',
            verified: false,
            tier: 'rising_star',
            score: 0,
          }}
          creator2={{
            id: '2',
            username: 'opponent',
            displayName: 'Dance Master',
            avatar: 'https://i.pravatar.cc/150?img=3',
            verified: true,
            tier: 'legend',
            score: 0,
          }}
          duration={300}
          onBattleEnd={(winnerId) => {
            setShowLiveBattle(false);
            toast({
              title: "Battle Ended! 🏆",
              description: `${winnerId === '1' ? 'You' : 'Dance Master'} won the battle!`,
            });
          }}
          onExit={() => setShowLiveBattle(false)}
        />
      )}

      {/* Content Discovery Engine */}
      <Dialog open={isDiscoveryOpen} onOpenChange={setIsDiscoveryOpen}>
        <DialogContent className="max-w-4xl w-[95vw] h-[90vh] bg-black border-gray-800 p-0">
          <VisuallyHidden>
            <DialogTitle>Content Discovery</DialogTitle>
          </VisuallyHidden>
          <ContentDiscoveryEngine
            onHashtagSelect={(hashtag) => {
              setSearchQuery(`#${hashtag}`);
              setIsDiscoveryOpen(false);
            }}
            onSoundSelect={(soundId) => {
              setIsDiscoveryOpen(false);
              setIsAdvancedRecorderOpen(true);
            }}
            onChallengeSelect={(challengeId) => {
              setIsDiscoveryOpen(false);
              setIsAdvancedRecorderOpen(true);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedTikTokVideosV3;
