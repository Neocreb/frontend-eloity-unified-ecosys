// @ts-nocheck
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
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
  Target,
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
  Subtitles,
  Cast,
  Gauge,
  PictureInPicture2,
  MonitorSpeaker,
  Headphones,
  Smartphone,
  Tv,
  Wifi,
  WifiOff,
  CloudDownload,
  Repeat,
  Shuffle,
  Flag,
  Copy,
  ExternalLink,
  Radio,
  Swords,
  Upload,
  Camera,
  Gift,
  ArrowLeft,
  Facebook,
  Twitter,
  Linkedin,
  Check,
  ThumbsUp,
  ThumbsDown,
  Reply,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import EnhancedVideoCreator from "@/components/video/EnhancedVideoCreator";
import AdvancedVideoRecorder from "@/components/video/AdvancedVideoRecorder";
import ContentDiscoveryEngine from "@/components/video/ContentDiscoveryEngine";
import InteractiveFeatures from "@/components/video/InteractiveFeatures";
import EnhancedVideoPlayer from "@/components/video/EnhancedVideoPlayer";
import AdvancedSharingHub from "@/components/video/AdvancedSharingHub";
import AutoCaptionsEngine from "@/components/video/AutoCaptionsEngine";
import SmartContentEngine from "@/components/video/SmartContentEngine";
import VideoEditingSuite from "@/components/video/VideoEditingSuite";
import VideoMonetizationHub from "@/components/video/VideoMonetizationHub";
import CreatorDashboard from "@/components/video/CreatorDashboard";
import EnhancedCreatorAnalytics from "@/components/video/EnhancedCreatorAnalytics";
import AccessibilityFAB from "@/components/accessibility/AccessibilityFAB";
import EnhancedSearchDiscovery from "@/components/search/EnhancedSearchDiscovery";
import { cn } from "@/utils/utils";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useVideoPlayback } from "@/hooks/use-video-playback";
import { useAuth } from "@/contexts/AuthContext";
import { InVideoAd } from "@/components/ads/InVideoAd";
import { VideoInterstitialAd } from "@/components/ads/VideoInterstitialAd";
import { adSettings } from "../../config/adSettings";
import { useVideos } from "@/hooks/use-videos";
import { VideoItem } from "@/types/video";
import { formatDistanceToNow } from "date-fns";
import { videoService } from "@/services/videoService";
import { supabase } from "@/integrations/supabase/client";

interface VideoData {
  id: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    verified: boolean;
    followerCount?: number;
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
  onVideoElementReady?: (element: HTMLVideoElement | null) => void;
  onLike?: (videoId: string, isLiked: boolean) => void;
  onComment?: (videoId: string) => void;
}> = ({ video, isActive, showControls = true, onVideoElementReady, onLike, onComment }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const [isPlaying, setIsPlaying] = useState(isActive);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showInVideoAd, setShowInVideoAd] = useState(false);
  const [adWatchTimer, setAdWatchTimer] = useState(0);
  const [hasEarnedReward, setHasEarnedReward] = useState(false);
  const [currentQuality, setCurrentQuality] = useState("auto");
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);
  const [isOfflineAvailable, setIsOfflineAvailable] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState<"good" | "poor" | "offline">("good");
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isMobile = useIsMobile();
  const { safePlay, safePause, togglePlayback } = useVideoPlayback();
  const { user } = useAuth();

  // Check if user has liked the video
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('video_likes')
          .select('id')
          .eq('video_id', video.id)
          .eq('user_id', user.id)
          .single();
        
        if (!error && data) {
          setIsLiked(true);
        }
      } catch (error) {
        console.error("Error checking like status:", error);
      }
    };
    
    checkLikeStatus();
  }, [video.id, user]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Notify parent component about the current video element
    if (isActive && onVideoElementReady) {
      onVideoElementReady(video);
    }

    let isComponentMounted = true;

    const handleVideoPlayback = async () => {
      if (!isComponentMounted) return;

      try {
        if (isActive && isPlaying) {
          await safePlay(video);
        } else {
          safePause(video);
        }
      } catch (error) {
        // Errors are already handled in the hook
      }
    };

    handleVideoPlayback();

    return () => {
      isComponentMounted = false;
      if (video) {
        safePause(video);
      }
    };
  }, [isActive, isPlaying, safePlay, safePause, onVideoElementReady]);

  // In-video ad timer
  useEffect(() => {
    if (!isActive || !isPlaying || showInVideoAd || !adSettings.enableAds) return;

    const timer = setInterval(() => {
      setAdWatchTimer(prev => {
        const newTime = prev + 1;
        if (newTime >= adSettings.inVideoAdDelay && !showInVideoAd) {
          setShowInVideoAd(true);
          // Pause the main video when ad starts
          const video = videoRef.current;
          if (video) {
            safePause(video);
          }
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, isPlaying, showInVideoAd, safePause]);

  const togglePlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    await togglePlayback(video, isPlaying, setIsPlaying);
  }, [isPlaying, togglePlayback]);

  const handleAdComplete = () => {
    setShowInVideoAd(false);
    setAdWatchTimer(0);
    // Resume main video
    const video = videoRef.current;
    if (video && isActive) {
      safePlay(video);
      setIsPlaying(true);
    }
  };

  const handleAdSkip = () => {
    setShowInVideoAd(false);
    setAdWatchTimer(0);
    // Resume main video
    const video = videoRef.current;
    if (video && isActive) {
      safePlay(video);
      setIsPlaying(true);
    }
  };

  const handleRewardEarned = (rewardAmount: number, message: string) => {
    if (!hasEarnedReward) {
      setHasEarnedReward(true);
      console.log(`Reward earned: ${message}`);
      // You could show a toast notification here
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  // Load comments for the video
  const loadComments = async () => {
    try {
      const videoComments = await videoService.getVideoComments(video.id);
      setComments(videoComments);
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  };

  // Handle adding a new comment
  const handleAddComment = async () => {
    if (!newComment.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const newCommentObj = await videoService.addComment(video.id, newComment);
      setComments(prev => [newCommentObj, ...prev]);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle liking a comment
  const handleLikeComment = async (commentId: string) => {
    try {
      // In a real implementation, this would connect to the backend
      // For now, we'll just update the UI
      setComments(prev => 
        prev.map(comment => {
          if (comment.id === commentId) {
            const isLiked = !comment.isLiked;
            const likes = isLiked ? comment.likes + 1 : comment.likes - 1;
            return { ...comment, isLiked, likes };
          }
          return comment;
        })
      );
      
      // TODO: Implement real comment liking functionality
      // This would require adding a likeComment method to the videoService
      // and updating the backend accordingly
    } catch (error) {
      console.error("Error liking comment:", error);
      toast({
        title: "Error",
        description: "Failed to like comment",
      });
    }
  };

  // Toggle like for the video
  const toggleLike = async () => {
    try {
      if (isLiked) {
        await videoService.unlikeVideo(video.id);
      } else {
        await videoService.likeVideo(video.id);
      }
      setIsLiked(!isLiked);
      if (onLike) onLike(video.id, !isLiked);
    } catch (error) {
      console.error("Error toggling like:", error);
      toast({
        title: "Error",
        description: "Failed to like/unlike video",
      });
    }
  };

  // Toggle comments visibility and load comments if needed
  const toggleComments = () => {
    const newShowComments = !showComments;
    setShowComments(newShowComments);
      
    if (newShowComments && comments.length === 0) {
      loadComments();
    }
  };

  const description = video.description;
  const truncatedDescription =
    description.length > 100
      ? description.substring(0, 100) + "..."
      : description;

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
        onClick={togglePlay}
        onLoadedMetadata={() => {
          // Set initial playback speed
          if (videoRef.current) {
            videoRef.current.playbackRate = playbackSpeed;
          }
        }}
        onProgress={() => {
          // Update buffer progress
          if (videoRef.current && videoRef.current.buffered.length > 0) {
            const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
            const duration = videoRef.current.duration;
            if (duration > 0) {
              const bufferedPercent = (bufferedEnd / duration) * 100;
              // Use this for adaptive quality if needed
              if (bufferedPercent < 25 && connectionQuality === "good") {
                setConnectionQuality("poor");
              }
            }
          }
        }}
        onWaiting={() => {
          // Video is buffering
          setConnectionQuality("poor");
        }}
        onCanPlayThrough={() => {
          // Video can play through without interruptions
          if (connectionQuality === "poor") {
            setConnectionQuality("good");
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

      {/* Challenge Banner */}
      {video.challenge && showControls && (
        <div className="absolute top-4 left-4 right-16 z-30">
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 rounded-lg p-2">
            <div className="flex items-center gap-2">
              <Target className="w-3 h-3 text-purple-400" />
              <span className="text-white text-xs font-medium">
                {video.challenge.title}
              </span>
              <Badge
                variant="secondary"
                className="bg-purple-500/20 text-purple-400 text-xs"
              >
                #{video.challenge.hashtag}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Play/Pause indicator */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <Button
            size="icon"
            variant="ghost"
            className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 hover:bg-white/30 border-none backdrop-blur-sm"
            onClick={togglePlay}
          >
            <Play className="w-8 h-8 md:w-10 md:h-10 text-white fill-white ml-1" />
          </Button>
        </div>
      )}

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
                  {video.isLiveStream && (
                    <Badge
                      variant="secondary"
                      className="bg-red-500/20 text-red-400 text-xs animate-pulse"
                    >
                      LIVE
                    </Badge>
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
              >
                Follow
              </Button>
            </div>

            {/* Description */}
            <div className="text-white text-xs md:text-sm">
              <p className="leading-relaxed line-clamp-2 md:line-clamp-3">
                {showMore ? description : truncatedDescription}
                {description.length > 100 && (
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
                {video.hashtags.slice(0, 3).map((tag, index) => (
                  <span key={tag} className="text-blue-300 text-xs md:text-sm hover:text-blue-100 cursor-pointer">
                    #{tag}{index < video.hashtags.slice(0, 3).length - 1 ? ' ' : ''}
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
              <Button
                variant="ghost"
                size="sm"
                className="text-white/60 text-xs p-0 h-auto hover:text-white ml-2"
              >
                Use Sound
              </Button>
            </div>

            {/* Video metadata */}
            <div className="flex items-center gap-3 text-white/60 text-[10px] md:text-xs mt-1">
              {video.timestamp && <span>{video.timestamp}</span>}
              {video.category && (
                <Badge
                  variant="secondary"
                  className="bg-black/40 text-white text-[10px]"
                >
                  {video.category}
                </Badge>
              )}
              {video.hasCaption && (
                <Badge
                  variant="secondary"
                  className="bg-blue-500/20 text-blue-400 text-[10px]"
                >
                  CC
                </Badge>
              )}
              {video.isSponsored && (
                <Badge
                  variant="secondary"
                  className="bg-yellow-500/20 text-yellow-400 text-[10px]"
                >
                  Sponsored
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Right side - Enhanced Interactive Features */}
        <div className="flex flex-col items-center justify-end gap-4 p-3 pb-32">
          {/* User Avatar with Follow Button */}
          <div className="flex flex-col items-center gap-2">
            <Avatar className="w-12 h-12 md:w-14 md:h-14 border-2 border-white/20 cursor-pointer">
              <AvatarImage src={video.user.avatar} />
              <AvatarFallback>{video.user.displayName[0]}</AvatarFallback>
            </Avatar>
            <Button
              size="sm"
              variant="default"
              className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-xs font-bold shadow-lg"
            >
              +
            </Button>
          </div>

          {/* Like Button with Animation */}
          <div className="flex flex-col items-center gap-1">
            <Button
              size="icon"
              className={cn(
                "w-12 h-12 md:w-14 md:h-14 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm transition-all duration-300 shadow-lg",
                isLiked ? "text-red-500 scale-110" : "text-white"
              )}
              onClick={toggleLike}
            >
              <Heart className={cn("w-6 h-6 md:w-7 md:h-7", isLiked && "fill-current")} />
            </Button>
            <span className="text-white text-xs font-medium">
              {formatNumber(video.stats.likes + (isLiked ? 1 : 0))}
            </span>
          </div>

          {/* Comment Button */}
          <div className="flex flex-col items-center gap-1">
            <Button
              size="icon"
              className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white transition-all duration-300 shadow-lg"
              onClick={toggleComments}
            >
              <MessageCircle className="w-6 h-6 md:w-7 md:h-7" />
            </Button>
            <span className="text-white text-xs font-medium">
              {formatNumber(video.stats.comments)}
            </span>
          </div>

          {/* Share Button */}
          <div className="flex flex-col items-center gap-1">
            <Button
              size="icon"
              className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white transition-all duration-300 shadow-lg"
            >
              <Share className="w-6 h-6 md:w-7 md:h-7" />
            </Button>
            <span className="text-white text-xs font-medium">Share</span>
          </div>

          {/* Gift Button */}
          <div className="flex flex-col items-center gap-1">
            <Button
              size="icon"
              className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 backdrop-blur-sm text-white transition-all duration-300 shadow-lg"
              onClick={() => {
                // Handle gift sending functionality
                toast({
                  title: "Send Gift",
                  description: "Gift feature coming soon!",
                });
              }}
            >
              <Gift className="w-6 h-6 md:w-7 md:h-7" />
            </Button>
            <span className="text-white text-xs font-medium">Gift</span>
          </div>

          {/* Music Disc with Animation */}
          <div className="flex flex-col items-center gap-1 animate-spin-slow">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center backdrop-blur-sm shadow-lg">
              <Music className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Controls Bar */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 md:gap-3">
        {/* Connection Quality Indicator */}
        <div className="flex items-center gap-1">
          {connectionQuality === "good" && (
            <Wifi className="w-4 h-4 text-green-400" />
          )}
          {connectionQuality === "poor" && (
            <WifiOff className="w-4 h-4 text-yellow-400" />
          )}
          {connectionQuality === "offline" && isOfflineAvailable && (
            <CloudDownload className="w-4 h-4 text-blue-400" />
          )}
          <Badge variant="secondary" className="bg-black/40 text-white text-xs">
            {currentQuality}
          </Badge>
        </div>

        {/* Volume control */}
        <Button
          size="icon"
          variant="ghost"
          className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/30 hover:bg-black/50 border-none shadow-lg"
          onClick={() => setIsMuted(!isMuted)}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 md:w-5 md:h-5 text-white" />
          ) : (
            <Volume2 className="w-4 h-4 md:w-5 md:h-5 text-white" />
          )}
        </Button>

        {/* Advanced Controls Toggle */}
        <Button
          size="icon"
          variant="ghost"
          className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/30 hover:bg-black/50 border-none shadow-lg"
          onClick={() => setShowAdvancedControls(!showAdvancedControls)}
        >
          <Settings className="w-4 h-4 md:w-5 md:h-5 text-white" />
        </Button>
      </div>

      {/* Advanced Controls Panel */}
      {showAdvancedControls && (
        <div className="absolute top-20 right-4 md:top-24 md:right-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 space-y-3 min-w-[200px] z-10 shadow-2xl">
          {/* Quality Selector */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white text-sm">
              <MonitorSpeaker className="w-4 h-4" />
              <span>Quality</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {["auto", "720p", "1080p"].map((quality) => (
                <Button
                  key={quality}
                  size="sm"
                  variant={currentQuality === quality ? "default" : "ghost"}
                  className="text-xs h-8"
                  onClick={() => setCurrentQuality(quality)}
                >
                  {quality}
                </Button>
              ))}
            </div>
          </div>

          {/* Playback Speed */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white text-sm">
              <Gauge className="w-4 h-4" />
              <span>Speed</span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {[0.5, 1, 1.5, 2].map((speed) => (
                <Button
                  key={speed}
                  size="sm"
                  variant={playbackSpeed === speed ? "default" : "ghost"}
                  className="text-xs h-8"
                  onClick={() => {
                    setPlaybackSpeed(speed);
                    if (videoRef.current) {
                      videoRef.current.playbackRate = speed;
                    }
                  }}
                >
                  {speed}x
                </Button>
              ))}
            </div>
          </div>

          {/* Additional Features */}
          <div className="space-y-2 border-t border-gray-600 pt-3">
            <Button
              size="sm"
              variant="ghost"
              className="w-full justify-start text-white text-xs"
              onClick={() => {
                // Enable Picture-in-Picture
                if (videoRef.current && "requestPictureInPicture" in videoRef.current) {
                  videoRef.current.requestPictureInPicture();
                }
              }}
            >
              <PictureInPicture2 className="w-4 h-4 mr-2" />
              Picture-in-Picture
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="w-full justify-start text-white text-xs"
            >
              <Subtitles className="w-4 h-4 mr-2" />
              Captions
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="w-full justify-start text-white text-xs"
              onClick={() => {
                setDownloadProgress(1);
                // Simulate download progress
                const interval = setInterval(() => {
                  setDownloadProgress(prev => {
                    if (prev >= 100) {
                      clearInterval(interval);
                      setIsOfflineAvailable(true);
                      return 100;
                    }
                    return prev + 10;
                  });
                }, 200);
              }}
            >
              <CloudDownload className="w-4 h-4 mr-2" />
              Download Offline
              {downloadProgress > 0 && downloadProgress < 100 && (
                <span className="ml-auto text-xs">{downloadProgress}%</span>
              )}
              {isOfflineAvailable && (
                <span className="ml-auto text-xs text-green-400">✓</span>
              )}
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="w-full justify-start text-white text-xs"
            >
              <Cast className="w-4 h-4 mr-2" />
              Cast to Device
            </Button>
          </div>
        </div>
      )}

      {/* Views count */}
      <div className="absolute top-4 left-4">
        <Badge
          variant="secondary"
          className="bg-black/40 text-white border-none text-[10px] md:text-xs px-2 py-1"
        >
          {video.stats.views} views
        </Badge>
      </div>

      {/* In-Video Ad Overlay */}
      {showInVideoAd && (
        <InVideoAd
          onAdComplete={handleAdComplete}
          onSkip={handleAdSkip}
          onRewardEarned={handleRewardEarned}
          userId={user?.id || 'guest'}
        />
      )}
    </div>
  );
};

const Videos: React.FC = () => {
  const { user } = useAuth();
  const { allItems, currentIndex, setCurrentIndex, loading, error } = useVideos();
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [isAdvancedRecorderOpen, setIsAdvancedRecorderOpen] = useState(false);
  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<"foryou" | "following" | "live" | "battle">("foryou");
  const navigate = useNavigate();
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentVideoElement, setCurrentVideoElement] = useState<HTMLVideoElement | null>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Transform ContentItem to VideoData for compatibility with VideoCard
  const transformToVideoData = (item: any): VideoData => {
    if (item.isAd) {
      // Return a placeholder for ad items
      return {
        id: item.ad.id,
        user: {
          id: "ad",
          username: "ad",
          displayName: "Advertisement",
          avatar: item.ad.image,
          verified: false,
        },
        description: item.ad.description,
        music: {
          title: "Ad Music",
          artist: "Ad Artist",
        },
        stats: {
          likes: 0,
          comments: 0,
          shares: 0,
          views: "0",
        },
        hashtags: [],
        videoUrl: "", // No video for ads
        thumbnail: item.ad.image,
        duration: 30,
        timestamp: "now",
        category: "Advertisement",
        isSponsored: true,
      };
    }

    // Transform VideoItem to VideoData
    const videoItem = item as VideoItem;
    return {
      id: videoItem.id,
      user: {
        id: videoItem.author.id || "user-" + videoItem.id,
        username: videoItem.author.username,
        displayName: videoItem.author.name,
        avatar: videoItem.author.avatar,
        verified: videoItem.author.verified,
        followerCount: videoItem.author.followerCount,
      },
      description: videoItem.description,
      music: {
        title: "Original Sound",
        artist: videoItem.author.username,
      },
      stats: {
        likes: videoItem.likes,
        comments: videoItem.comments,
        shares: videoItem.shares,
        views: videoItem.views?.toString() || "0",
      },
      hashtags: videoItem.tags || ["video", "trending"],
      videoUrl: videoItem.url,
      thumbnail: videoItem.thumbnail,
      duration: videoItem.duration || 0,
      timestamp: videoItem.timestamp || "now",
      category: videoItem.category || "Entertainment",
      allowDuets: videoItem.allowDuets || true,
      allowComments: videoItem.allowComments || true,
      hasCaption: videoItem.hasCaption || false,
      isLiveStream: videoItem.isLiveStream || false,
    };
  };

  // Handle video like/unlike
  const handleVideoLike = async (videoId: string, isLiked: boolean) => {
    try {
      // Update the videos state to reflect the like change
      setVideos(prev => prev.map(video => {
        if (video.id === videoId) {
          return {
            ...video,
            likes: isLiked ? video.likes + 1 : video.likes - 1
          };
        }
        return video;
      }));
      
      // Also update the allItems state through the useVideos hook
      // This will require updating the useVideos hook to expose a method for updating videos
    } catch (error) {
      console.error("Error updating video like status:", error);
    }
  };

  // Handle comment button click
  const handleCommentClick = (videoId: string) => {
    // This will be handled by the VideoCard component
    console.log("Comment clicked for video:", videoId);
  };

  // Auto-hide controls after inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showControls) {
      timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [showControls]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const videoHeight = window.innerHeight;
      const newIndex = Math.round(scrollTop / videoHeight);

      if (
        newIndex !== currentIndex &&
        newIndex >= 0 &&
        newIndex < allItems.length
      ) {
        setCurrentIndex(newIndex);
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [currentIndex, allItems.length, setCurrentIndex]);

  const handleVideoCreated = (videoFile: File, metadata: any) => {
    // In a real implementation, this would add the new video to the list
    console.log("New video created:", videoFile, metadata);
    setIsAdvancedRecorderOpen(false);
  };

  const handleHashtagSelect = (hashtag: string) => {
    setSearchQuery(`#${hashtag}`);
    setIsDiscoveryOpen(false);
    // Filter videos by hashtag logic here
  };

  const handleSoundSelect = (soundId: string) => {
    setIsDiscoveryOpen(false);
    setIsAdvancedRecorderOpen(true);
    // Pre-select sound in recorder
  };

  const handleChallengeSelect = (challengeId: string) => {
    setIsDiscoveryOpen(false);
    setIsAdvancedRecorderOpen(true);
    // Pre-configure challenge in recorder
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Handle liking a comment
  const handleLikeComment = async (commentId: string) => {
    try {
      // In a real implementation, this would update the comment likes in the database
      console.log("Liking comment:", commentId);
      // Update the comments state to reflect the like change
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            isLiked: !comment.isLiked,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
          };
        }
        return comment;
      }));
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  // Handle adding a new comment
  const handleAddComment = async () => {
    if (!newComment.trim() || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      // In a real implementation, this would add the comment to the database
      const newCommentObj = {
        id: Date.now().toString(),
        content: newComment,
        user: {
          username: user?.username || "You",
          avatar_url: user?.avatar_url || "https://i.pravatar.cc/150"
        },
        likes: 0,
        isLiked: false,
        created_at: new Date().toISOString()
      };
      
      setComments(prev => [...prev, newCommentObj]);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading videos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error loading videos: {error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden z-10">
      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out forwards;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }
        
        @keyframes spinSlow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spinSlow 8s linear infinite;
        }
      `}</style>
      <Helmet>
        <title>Videos | Eloity</title>
        <meta
          name="description"
          content="Discover, create, and share amazing videos with advanced tools"
        />
      </Helmet>

      {/* Enhanced 6-Element TikTok-style header */}
      {showControls && !isFullscreen && (
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

            {/* 2-5. Central tabs (Live, Battle, For You, Following) + Create Menu */}
            <div className="col-span-4 flex justify-center">
              <Tabs
                value={activeTab}
                onValueChange={(value) => {
                  setActiveTab(value as any);
                  // Reset to first video when switching tabs
                  setCurrentIndex(0);
                  if (containerRef.current) {
                    containerRef.current.scrollTop = 0;
                  }
                }}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-5 bg-black/40 border border-white/10 rounded-full p-1">
                  <TabsTrigger
                    value="live"
                    className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-orange-500 data-[state=active]:text-white rounded-full py-1 px-2 sm:px-3 transition-all duration-300 shadow-lg"
                  >
                    <Radio className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Live</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="battle"
                    className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-full py-1 px-2 sm:px-3 transition-all duration-300 shadow-lg"
                  >
                    <Swords className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Battle</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="foryou"
                    className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white rounded-full py-1 px-2 sm:px-3 transition-all duration-300 shadow-lg"
                  >
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">For You</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="following"
                    className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white rounded-full py-1 px-2 sm:px-3 transition-all duration-300 shadow-lg"
                  >
                    <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Following</span>
                  </TabsTrigger>
                  {/* Create Menu Tab */}
                  <TabsTrigger
                    value="create"
                    className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-500 data-[state=active]:text-white rounded-full py-1 px-2 sm:px-3 cursor-pointer transition-all duration-300 shadow-lg"
                    onClick={() => setShowCreateMenu(true)}
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              {/* Create Menu Dropdown - Positioned absolutely next to tabs */}
              {showCreateMenu && (
                <div className="absolute top-16 md:top-20 right-1/2 transform translate-x-1/2 z-50 animate-fade-in">
                  <div className="bg-gray-900 border border-gray-700 rounded-xl w-56 py-3 shadow-2xl backdrop-blur-lg">
                    <div 
                      className="flex items-center gap-3 px-4 py-3 text-white hover:bg-gray-800 cursor-pointer rounded-lg mx-2 transition-colors"
                      onClick={() => {
                        setShowCreateMenu(false);
                        setIsAdvancedRecorderOpen(true);
                      }}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                        <Camera className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-medium">Create Video</div>
                        <div className="text-xs text-gray-400">Record or upload a video</div>
                      </div>
                    </div>
                    <div 
                      className="flex items-center gap-3 px-4 py-3 text-white hover:bg-gray-800 cursor-pointer rounded-lg mx-2 transition-colors"
                      onClick={() => {
                        setShowCreateMenu(false);
                        // Handle go live functionality
                        toast({
                          title: "Go Live",
                          description: "Live streaming feature coming soon!",
                        });
                      }}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
                        <Radio className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-medium">Go Live</div>
                        <div className="text-xs text-gray-400">Start live streaming</div>
                      </div>
                    </div>
                    <div 
                      className="flex items-center gap-3 px-4 py-3 text-white hover:bg-gray-800 cursor-pointer rounded-lg mx-2 transition-colors"
                      onClick={() => {
                        setShowCreateMenu(false);
                        // Handle start battle functionality
                        toast({
                          title: "Start Battle",
                          description: "Battle feature coming soon!",
                        });
                      }}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <Swords className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-medium">Start Battle</div>
                        <div className="text-xs text-gray-400">Create a creator battle</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 6. Profile/Menu (right side) */}
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 w-8 h-8 sm:w-10 sm:h-10 rounded-full"
                onClick={() => navigate('/app/profile')}
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Full-screen video container */}
      <div
        ref={containerRef}
        className="h-full w-full overflow-y-auto snap-y snap-mandatory"
        style={{
          scrollBehavior: "smooth",
          paddingTop: showControls && !isFullscreen ? "120px" : "0",
          paddingBottom: isMobile ? "80px" : "20px",
        }}
        onClick={() => setShowControls(!showControls)}
      >
        {allItems.map((item, index) => {
          // Render interstitial ad
          if (item.isAd) {
            return (
              <div key={item.ad.id} className="h-screen w-full bg-black snap-start snap-always flex items-center justify-center p-4">
                <VideoInterstitialAd
                  onClick={() => {
                    console.log('Interstitial ad clicked');
                    // Handle ad click
                  }}
                  className="max-w-md w-full"
                />
              </div>
            );
          }

          // Transform item to VideoData for compatibility
          const videoData = transformToVideoData(item);

          // Render regular video
          return (
            <VideoCard
              key={videoData.id}
              video={videoData}
              isActive={index === currentIndex}
              showControls={showControls}
              onVideoElementReady={index === currentIndex ? setCurrentVideoElement : undefined}
              onLike={handleVideoLike}
              onComment={handleCommentClick}
            />
          );
        })}
      </div>

      {/* Enhanced Create Button Group */}
      <div className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-50 flex flex-col gap-3">
        <AccessibilityFAB
          videoElement={currentVideoElement}
          className="w-12 h-12"
        />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/app/unified-creator-studio')}
          className="w-12 h-12 rounded-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30"
          title="Creator Dashboard"
        >
          <Award className="w-6 h-6" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsDiscoveryOpen(true)}
          className="w-12 h-12 rounded-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30"
          title="Discover Content"
        >
          <Sparkles className="w-6 h-6" />
        </Button>

        <Button
          onClick={() => setIsAdvancedRecorderOpen(true)}
          className="bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white rounded-full w-14 h-14 shadow-lg transition-all duration-200 hover:scale-110"
          title="Create Video"
        >
          <Plus className="h-7 w-7" />
        </Button>
      </div>

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

      {/* Creator Modal - Original */}
      <Dialog open={isCreatorOpen} onOpenChange={setIsCreatorOpen}>
        <DialogContent className="max-w-2xl bg-black border border-gray-800 rounded-lg p-4">
          <VisuallyHidden>
            <DialogTitle>Create Video</DialogTitle>
          </VisuallyHidden>
          <EnhancedVideoCreator onClose={() => setIsCreatorOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Advanced Video Recorder */}
      {isAdvancedRecorderOpen && (
        <AdvancedVideoRecorder
          onClose={() => setIsAdvancedRecorderOpen(false)}
          onVideoCreated={handleVideoCreated}
        />
      )}

      {/* Content Discovery Engine */}
      <Dialog open={isDiscoveryOpen} onOpenChange={setIsDiscoveryOpen}>
        <DialogContent className="max-w-4xl w-[95vw] h-[90vh] bg-black border-gray-800 p-0">
          <VisuallyHidden>
            <DialogTitle>Content Discovery</DialogTitle>
          </VisuallyHidden>
          <ContentDiscoveryEngine
            onHashtagSelect={handleHashtagSelect}
            onSoundSelect={handleSoundSelect}
            onChallengeSelect={handleChallengeSelect}
          />
        </DialogContent>
      </Dialog>

      {/* Comments Section - TikTok Style (slides up from bottom) */}
      {showComments && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center p-0">
          <div className="bg-gray-900 rounded-tl-2xl rounded-tr-2xl w-full h-2/3 max-w-md flex flex-col animate-slide-up shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-white font-semibold">Comments ({comments.length})</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowComments(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={comment.user?.avatar_url || "https://i.pravatar.cc/150"} />
                    <AvatarFallback>{comment.user?.username?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium text-sm">{comment.user?.username || "User"}</span>
                      {comment.user?.is_verified && (
                        <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        </div>
                      )}
                      <span className="text-gray-400 text-xs">
                        {formatDistanceToNow(new Date(comment.created_at))} ago
                      </span>
                    </div>
                    <p className="text-white text-sm mt-1">{comment.content}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-400 hover:text-white p-0 h-auto"
                        onClick={() => handleLikeComment(comment.id)}
                      >
                        <Heart className={`w-4 h-4 mr-1 ${comment.isLiked ? "fill-current text-red-500" : ""}`} />
                        <span className="text-xs">{comment.likes_count || comment.likes || 0}</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-400 hover:text-white p-0 h-auto"
                      >
                        <Reply className="w-4 h-4 mr-1" />
                        <span className="text-xs">Reply</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Add Comment */}
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
                  disabled={!newComment.trim() || isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Videos;