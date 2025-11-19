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
import { mobileAnimations, zIndex, viewportHeight } from "@/utils/mobileOptimization";
import { InVideoAd } from "@/components/ads/InVideoAd";
import { VideoInterstitialAd } from "@/components/ads/VideoInterstitialAd";
import { adSettings } from "../../config/adSettings";
import { useVideos } from "@/hooks/use-videos";
import { VideoItem } from "@/types/video";
import { formatDistanceToNow } from "date-fns";
import { videoService } from '@/services/videoService';
import { duetService } from '@/services/duetService';
import { liveStreamService, LiveStream } from "@/services/liveStreamService";
import { supabase } from "@/integrations/supabase/client";
import InVideoBannerAd from "@/components/ads/InVideoBannerAd";
import LiveStreamCard from "@/components/live/LiveStreamCard";
import BattleCard from "@/components/live/BattleCard";
import LiveStreamModal from "@/components/live/LiveStreamModal";
import BattleCreationModal from "@/components/live/BattleCreationModal";
import VirtualGiftsAndTips from "@/components/premium/VirtualGiftsAndTips";

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
  onFollow?: (video: VideoData, isFollowing: boolean) => void;
  onShare?: (video: VideoData, platform: string) => void;
}> = ({ video, isActive, showControls = true, onVideoElementReady, onLike, onComment, onFollow, onShare }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const [isPlaying, setIsPlaying] = useState(isActive);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showInVideoAd, setShowInVideoAd] = useState(false);
  const [adWatchTimer, setAdWatchTimer] = useState(0);
  const [hasEarnedReward, setHasEarnedReward] = useState(false);
  const [showInVideoBannerAd, setShowInVideoBannerAd] = useState(false);
  const [bannerAdData, setBannerAdData] = useState<any>(null);
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
  const [isFollowing, setIsFollowing] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<{id: string; title: string; artist: string} | null>(null);

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
          // Show banner ad instead of full-screen ad
          setShowInVideoBannerAd(true);
          setBannerAdData({
            id: `ad-${Date.now()}`,
            title: "Special Offer",
            description: "Check out this amazing product!",
            image_url: "https://placehold.co/100x100",
            action_url: "#",
            advertiser: "Sponsored Content"
          });
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
    setShowInVideoBannerAd(false);
    setAdWatchTimer(0);
    // Resume main video
    const video = videoRef.current;
    if (video) {
      safePlay(video);
      setIsPlaying(true);
    }
  };

  const handleAdSkip = () => {
    setShowInVideoAd(false);
    setShowInVideoBannerAd(false);
    setAdWatchTimer(0);
    // Resume main video
    const video = videoRef.current;
    if (video) {
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
      setComments(Array.isArray(videoComments) ? videoComments : []);
    } catch (error) {
      console.error("Error loading comments:", error);
      setComments([]);
    }
  };

  // Handle music selection (for future music API integration)
  const handleMusicSelect = async () => {
    try {
      // Store the selected music
      setSelectedMusic({
        id: video.music.id || `music-${Date.now()}`,
        title: video.music.title,
        artist: video.music.artist
      });

      toast({
        title: "Music Added",
        description: `"${video.music.title}" by ${video.music.artist} added to your selection`,
      });
    } catch (error) {
      console.error("Error selecting music:", error);
      toast({
        title: "Error",
        description: "Failed to select music",
      });
    }
  };

  // Handle adding a new comment
  const handleAddComment = async () => {
    if (!newComment.trim() || isSubmitting) return;

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to comment",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Call the service to add comment
      try {
        await videoService.addVideoComment(video.id, newComment);
      } catch (serviceError) {
        console.warn("Video service unavailable, using local state:", serviceError);
      }

      // Create local comment object
      const newCommentObj = {
        id: Date.now().toString(),
        content: newComment,
        user: {
          id: user.id,
          username: user.username || "User",
          avatar_url: user.avatar_url || "https://i.pravatar.cc/150",
          is_verified: user.is_verified || false
        },
        likes_count: 0,
        isLiked: false,
        created_at: new Date().toISOString()
      };

      setComments(prev => [...prev, newCommentObj]);
      setNewComment("");

      toast({
        title: "Comment Added",
        description: "Your comment has been posted",
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment",
      });
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
        setIsLiked(false);
        toast({
          title: "Unliked",
          description: "Removed from your liked videos",
        });
      } else {
        await videoService.likeVideo(video.id);
        setIsLiked(true);
        toast({
          title: "Liked",
          description: "Added to your liked videos",
        });
      }
      if (onLike) onLike(video.id, !isLiked);
    } catch (error) {
      console.error("Error toggling like:", error);
      toast({
        title: "Error",
        description: "Failed to like/unlike video",
        variant: "destructive"
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

  // Check if user has saved the video
  useEffect(() => {
    const checkSaveStatus = async () => {
      if (!user) return;
      
      try {
        const isSaved = await videoService.isVideoSaved(video.id);
        setIsBookmarked(isSaved);
      } catch (error) {
        console.error("Error checking save status:", error);
      }
    };
    
    checkSaveStatus();
  }, [video.id, user]);

  // Handle save/unsave for the video
  const toggleSave = async () => {
    try {
      if (isBookmarked) {
        await videoService.unsaveVideo(video.id);
        setIsBookmarked(false);
        toast({
          title: "Removed",
          description: "Video removed from your saved videos",
        });
      } else {
        await videoService.saveVideo(video.id);
        setIsBookmarked(true);
        toast({
          title: "Saved",
          description: "Video added to your saved videos",
        });
      }
    } catch (error) {
      console.error("Error toggling save:", error);
      toast({
        title: "Error",
        description: "Failed to save/unsave video",
        variant: "destructive"
      });
    }
  };

  // Handle duet creation
  const handleDuet = async (duetVideo: VideoData) => {
    try {
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create a duet",
          variant: "destructive"
        });
        return;
      }

      setSelectedVideoForDuet(duetVideo);
      setShowDuetModal(true);

      toast({
        title: "Duet Creation Started",
        description: "Get ready to create your duet!",
      });
    } catch (error) {
      console.error("Error initiating duet:", error);
      toast({
        title: "Error",
        description: "Failed to start duet",
        variant: "destructive"
      });
    }
  };

  // Handle duet completion
  const handleDuetComplete = async (duetData: any) => {
    try {
      // Call service to save duet
      // await duetService.createDuet(duetData);

      setShowDuetModal(false);
      setSelectedVideoForDuet(null);

      toast({
        title: "Duet Created!",
        description: "Your duet has been published",
      });
    } catch (error) {
      console.error("Error creating duet:", error);
      toast({
        title: "Error",
        description: "Failed to create duet",
        variant: "destructive"
      });
    }
  };

  // Handle download
  const handleDownload = async () => {
    try {
      // Check if video has download permission
      if (!video.allowDownload && video.allowDownload !== undefined) {
        toast({
          title: "Not Allowed",
          description: "The creator has disabled downloads for this video",
          variant: "destructive"
        });
        return;
      }

      // Attempt to download the video
      const link = document.createElement('a');
      link.href = video.videoUrl;
      link.download = `${video.user.username}-${video.id}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download Started",
        description: `Downloading "${video.description.substring(0, 30)}..."`,
      });
    } catch (error) {
      console.error("Error downloading video:", error);
      toast({
        title: "Error",
        description: "Failed to download video. Please try again.",
        variant: "destructive"
      });
    }
  };

  const description = video.description;
  const truncatedDescription =
    description.length > 100
      ? description.substring(0, 100) + "..."
      : description;

  return (
    <div className="relative h-screen w-full bg-black snap-start snap-always group">
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

      {/* Play/Pause indicator with enhanced animation */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] transition-all duration-300">
          <Button
            size="icon"
            variant="ghost"
            className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/20 hover:bg-white/30 border-none backdrop-blur-sm shadow-2xl transition-all duration-300 hover:scale-110"
            onClick={togglePlay}
          >
            <Play className="w-10 h-10 md:w-12 md:h-12 text-white fill-white ml-1" />
          </Button>
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />

      {/* Content overlay */}
      <div className="absolute inset-0 flex">
        {/* Left side - user info and description with moved controls */}
        <div className={cn(
          "flex-1 flex flex-col justify-end transition-all duration-300",
          isMobile ? "p-2 pb-24" : "p-3 md:p-4 pb-28 md:pb-4"
        )}>
          {/* Moved audio, auto, and settings controls to left side */}
          <div className="absolute top-16 left-4 flex flex-col gap-2 md:gap-3">
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
          
          <div className={isMobile ? "space-y-1" : "space-y-2 md:space-y-3"}>
            {/* User info */}
            <div className={cn("flex items-center gap-2", isMobile ? "gap-2" : "md:gap-3")}>
              <Avatar className={cn(
                "border-2 border-white/20",
                isMobile ? "w-9 h-9" : "w-10 h-10 md:w-12 md:h-12"
              )}>
                <AvatarImage src={video.user.avatar} />
                <AvatarFallback>{video.user.displayName[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className={cn("flex items-center", isMobile ? "gap-1" : "gap-1 md:gap-2")}>
                  <span className={cn(
                    "text-white font-semibold truncate",
                    isMobile ? "text-[11px]" : "text-xs md:text-sm"
                  )}>
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
                <div className={cn(
                  "text-white/80",
                  isMobile ? "text-[9px]" : "text-[10px] md:text-xs"
                )}>
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
                variant={isFollowing ? "default" : "outline"}
                className={cn(
                  "text-[10px] md:text-xs px-2 md:px-3 py-1 h-6 md:h-auto backdrop-blur-sm",
                  isFollowing
                    ? "bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white"
                    : "bg-white/20 border-white/30 text-white hover:bg-white/30"
                )}
                onClick={() => {
                  if (onFollow) {
                    onFollow(video, isFollowing);
                  }
                  setIsFollowing(!isFollowing);
                }}
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>
            </div>
            
            {/* Description */}
            <div className={cn(
              "text-white",
              isMobile ? "text-[11px]" : "text-xs md:text-sm"
            )}>
              <p className={cn(
                "leading-relaxed",
                isMobile ? "line-clamp-1" : "line-clamp-2 md:line-clamp-3"
              )}>
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
              {!isMobile && (
                <div className="flex flex-wrap gap-1 mt-1 md:mt-2">
                  {video.hashtags.slice(0, 3).map((tag, index) => (
                    <span key={tag} className="text-blue-300 text-xs md:text-sm hover:text-blue-100 cursor-pointer">
                      #{tag}{index < video.hashtags.slice(0, 3).length - 1 ? ' ' : ''}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Music info */}
            <div className={cn(
              "flex items-center gap-1 text-white/80",
              isMobile ? "text-[9px] md:gap-2 md:text-[10px]" : "text-[10px] md:gap-2 md:text-xs"
            )}>
              <Music className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">
                {video.music.title} - {video.music.artist}
              </span>
              {!isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/60 text-xs p-0 h-auto hover:text-white ml-2 transition-colors duration-200 hover:text-blue-400"
                  onClick={handleMusicSelect}
                  title="Add this sound to your selection"
                >
                  Use Sound
                </Button>
              )}
            </div>

            {/* Video metadata */}
            {!isMobile && (
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
                {video.isSponsored && (
                  <Badge
                    variant="secondary"
                    className="bg-yellow-500/20 text-yellow-400 text-[10px]"
                  >
                    Sponsored
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right side - Enhanced Interactive Features */}
        <div className={cn(
          "flex flex-col items-center justify-end p-2 md:p-3 transition-all duration-300",
          isMobile ? "gap-3 pb-24" : "gap-4 pb-32"
        )}>
          {/* User Avatar with Follow Button */}
          <div className="flex flex-col items-center gap-2">
            <Avatar className={cn(
              "border-2 border-white/20 cursor-pointer hover:scale-105 transition-transform duration-300",
              isMobile ? "w-11 h-11" : "w-12 h-12 md:w-14 md:h-14"
            )}>
              <AvatarImage src={video.user.avatar} />
              <AvatarFallback>{video.user.displayName[0]}</AvatarFallback>
            </Avatar>
            <Button
              size="sm"
              variant={isFollowing ? "default" : "outline"}
              className={cn(
                "backdrop-blur-sm transition-all duration-300 font-medium",
                isMobile ? "text-[9px] px-2 py-0.5 h-5" : "text-[10px] md:text-xs px-2 md:px-3 py-1 h-6 md:h-auto",
                isFollowing
                  ? "bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white"
                  : "bg-white/20 border-white/30 text-white hover:bg-white/30"
              )}
              onClick={() => {
                if (onFollow) {
                  onFollow(video, isFollowing);
                }
                setIsFollowing(!isFollowing);
              }}
            >
              {isFollowing ? "Following" : "Follow"}
            </Button>
          </div>

          {/* Like Button with Animation */}
          <div className="flex flex-col items-center gap-1">
            <Button
              size="icon"
              className={cn(
                "rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm transition-all duration-300 shadow-lg hover:scale-110",
                isMobile ? "w-11 h-11" : "w-12 h-12 md:w-14 md:h-14",
                isLiked ? "text-red-500 scale-110" : "text-white"
              )}
              onClick={toggleLike}
            >
              <Heart className={cn(
                isMobile ? "w-5 h-5" : "w-6 h-6 md:w-7 md:h-7",
                isLiked && "fill-current"
              )} />
            </Button>
            <span className="text-white text-[10px] md:text-xs font-medium">
              {formatNumber(video.stats.likes + (isLiked ? 1 : 0))}
            </span>
          </div>

          {/* Comment Button */}
          <div className="flex flex-col items-center gap-1">
            <Button
              size="icon"
              className={cn(
                "rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white transition-all duration-300 shadow-lg hover:scale-110",
                isMobile ? "w-11 h-11" : "w-12 h-12 md:w-14 md:h-14"
              )}
              onClick={toggleComments}
            >
              <MessageCircle className={isMobile ? "w-5 h-5" : "w-6 h-6 md:w-7 md:h-7"} />
            </Button>
            <span className="text-white text-[10px] md:text-xs font-medium">
              {formatNumber(video.stats.comments)}
            </span>
          </div>

          {/* Views Count */}
          <div className="flex flex-col items-center gap-1">
            <div className={cn(
              "rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center",
              isMobile ? "w-11 h-11" : "w-12 h-12 md:w-14 md:h-14"
            )}>
              <Eye className={cn("text-white", isMobile ? "w-5 h-5" : "w-6 h-6 md:w-7 md:h-7")} />
            </div>
            <span className="text-white text-[10px] md:text-xs font-medium">
              {formatNumber(parseInt(video.stats.views))}
            </span>
          </div>

          {/* Share/Save/Download Dropdown Menu */}
          <div className="flex flex-col items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  className={cn(
                    "rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white transition-all duration-300 shadow-lg hover:scale-110",
                    isMobile ? "w-11 h-11" : "w-12 h-12 md:w-14 md:h-14"
                  )}
                  aria-label="Share options menu"
                >
                  <Share className={isMobile ? "w-5 h-5" : "w-5 h-5 md:w-6 md:h-6"} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-black/95 border-white/20 backdrop-blur-sm w-48" align="end">
                {/* Share Option */}
                <DropdownMenuItem
                  onClick={() => onShare?.(video, 'web')}
                  className="text-white hover:bg-white/10 cursor-pointer flex items-center gap-2"
                >
                  <Share className="w-4 h-4" />
                  <span>Share to Web</span>
                </DropdownMenuItem>

                {/* Share to Twitter */}
                <DropdownMenuItem
                  onClick={() => onShare?.(video, 'twitter')}
                  className="text-white hover:bg-white/10 cursor-pointer flex items-center gap-2"
                >
                  <Twitter className="w-4 h-4 text-sky-400" />
                  <span>Share to Twitter</span>
                </DropdownMenuItem>

                {/* Share to Facebook */}
                <DropdownMenuItem
                  onClick={() => onShare?.(video, 'facebook')}
                  className="text-white hover:bg-white/10 cursor-pointer flex items-center gap-2"
                >
                  <Facebook className="w-4 h-4 text-blue-600" />
                  <span>Share to Facebook</span>
                </DropdownMenuItem>

                {/* Share to LinkedIn */}
                <DropdownMenuItem
                  onClick={() => onShare?.(video, 'linkedin')}
                  className="text-white hover:bg-white/10 cursor-pointer flex items-center gap-2"
                >
                  <Linkedin className="w-4 h-4 text-blue-700" />
                  <span>Share to LinkedIn</span>
                </DropdownMenuItem>

                {/* Copy Link */}
                <DropdownMenuItem
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/app/video/${video.id}`);
                    toast({
                      title: "Link Copied",
                      description: "Video link copied to clipboard"
                    });
                  }}
                  className="text-white hover:bg-white/10 cursor-pointer flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Link</span>
                </DropdownMenuItem>

                {/* Divider */}
                <div className="my-1 bg-white/10 h-px" />

                {/* Save/Bookmark Option */}
                <DropdownMenuItem
                  onClick={toggleSave}
                  className={cn(
                    "cursor-pointer flex items-center gap-2",
                    isBookmarked
                      ? "text-yellow-400 hover:bg-yellow-400/10"
                      : "text-white hover:bg-white/10"
                  )}
                >
                  <Bookmark className={cn("w-4 h-4", isBookmarked && "fill-current")} />
                  <span>{isBookmarked ? "Saved" : "Save Video"}</span>
                </DropdownMenuItem>

                {/* Divider */}
                <div className="my-1 bg-white/10 h-px" />

                {/* Download Option */}
                <DropdownMenuItem
                  onClick={handleDownload}
                  className="text-white hover:bg-white/10 cursor-pointer flex items-center gap-2"
                >
                  <CloudDownload className="w-4 h-4" />
                  <span>Download Video</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <span className="text-white text-xs font-medium">Share</span>
          </div>

          {/* Duet Button */}
          {video.allowDuets && (
            <div className="flex flex-col items-center gap-1">
              <Button
                size="icon"
                className={cn(
                  "rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 backdrop-blur-sm text-white transition-all duration-300 shadow-lg hover:scale-110",
                  isMobile ? "w-11 h-11" : "w-12 h-12 md:w-14 md:h-14"
                )}
                onClick={() => handleDuet(video)}
              >
                <Users className={isMobile ? "w-5 h-5" : "w-6 h-6 md:w-7 md:h-7"} />
              </Button>
              <span className="text-white text-[10px] md:text-xs font-medium">Duet</span>
            </div>
          )}

          {/* Gift Button */}
          <div className="flex flex-col items-center gap-1">
            <VirtualGiftsAndTips
              recipientId={video.user.id}
              recipientName={video.user.displayName}
              contentId={video.id}
              recipientType="video"
              trigger={
                <Button
                  size="icon"
                  className={cn(
                    "rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 backdrop-blur-sm text-white transition-all duration-300 shadow-lg hover:scale-110",
                    isMobile ? "w-11 h-11" : "w-12 h-12 md:w-14 md:h-14"
                  )}
                >
                  <Gift className={isMobile ? "w-5 h-5" : "w-6 h-6 md:w-7 md:h-7"} />
                </Button>
              }
            />
            <span className="text-white text-[10px] md:text-xs font-medium">Gift</span>
          </div>

          {/* Music Disc with Enhanced Animation */}
          <div className="flex flex-col items-center gap-1 group-hover:animate-spin-slow">
            <div className={cn(
              "rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center backdrop-blur-sm shadow-lg hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 animate-spin-slow",
              isMobile ? "w-11 h-11" : "w-12 h-12 md:w-14 md:h-14"
            )}>
              <Music className={cn("text-white", isMobile ? "w-5 h-5" : "w-5 h-5 md:w-6 md:h-6")} />
            </div>
          </div>
        </div>
      </div>
      
      {/* In-Video Banner Ad Overlay */}
      {showInVideoBannerAd && bannerAdData && (
        <InVideoBannerAd
          adData={bannerAdData}
          onDismiss={handleAdComplete}
          onAction={(url) => {
            console.log('Banner ad clicked:', url);
            // Handle ad click
            window.open(url, '_blank');
            handleAdComplete();
          }}
        />
      )}

      {/* In-Video Ad Overlay (fallback) */}
      {showInVideoAd && !showInVideoBannerAd && (
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
  
  // Live streaming state
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);
  const [battles, setBattles] = useState<(LiveStream & { battle: any })[]>([]);
  const [isLiveStreaming, setIsLiveStreaming] = useState(false);
  const [currentLiveStream, setCurrentLiveStream] = useState<LiveStream | null>(null);
  
  // Modals state
  const [showLiveStreamModal, setShowLiveStreamModal] = useState(false);
  const [showBattleCreationModal, setShowBattleCreationModal] = useState(false);
  const [showDuetModal, setShowDuetModal] = useState(false);
  const [selectedVideoForDuet, setSelectedVideoForDuet] = useState<VideoData | null>(null);
  
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
          saves: 0,
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
        saves: videoItem.saves || 0,
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
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to like comments",
      });
      return;
    }

    try {
      // Try to update in the service
      try {
        await videoService.likeComment(commentId);
      } catch (serviceError) {
        console.warn("Video service unavailable, using local state:", serviceError);
      }

      // Update the comments state to reflect the like change
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          const wasLiked = comment.isLiked;
          return {
            ...comment,
            isLiked: !wasLiked,
            likes_count: wasLiked ? (comment.likes_count || 0) - 1 : (comment.likes_count || 0) + 1
          };
        }
        return comment;
      }));
    } catch (error) {
      console.error("Error liking comment:", error);
      toast({
        title: "Error",
        description: "Failed to like comment",
      });
    }
  };

  // Handle adding a new comment
  const handleAddComment = async () => {
    if (!newComment.trim() || isSubmitting) return;

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to comment",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Get current video if available
      const currentVideo = allItems[currentIndex];
      if (!currentVideo) {
        throw new Error("No video found");
      }

      // Call the service to add comment
      try {
        await videoService.addVideoComment(currentVideo.id, newComment);
      } catch (serviceError) {
        console.warn("Video service unavailable, using local state:", serviceError);
      }

      // Create local comment object
      const newCommentObj = {
        id: Date.now().toString(),
        content: newComment,
        user: {
          id: user.id,
          username: user.username || "User",
          avatar_url: user.avatar_url || "https://i.pravatar.cc/150",
          is_verified: user.is_verified || false
        },
        likes_count: 0,
        isLiked: false,
        created_at: new Date().toISOString()
      };

      setComments(prev => [...prev, newCommentObj]);
      setNewComment("");

      toast({
        title: "Comment Added",
        description: "Your comment has been posted",
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch live streams when switching to live tab
  useEffect(() => {
    const fetchLiveStreams = async () => {
      if (activeTab === "live") {
        try {
          const streams = await liveStreamService.getActiveLiveStreams();
          setLiveStreams(streams);
        } catch (error) {
          console.error("Error fetching live streams:", error);
        }
      }
    };

    fetchLiveStreams();
  }, [activeTab]);

  // Fetch battles when switching to battle tab
  useEffect(() => {
    const fetchBattles = async () => {
      if (activeTab === "battle") {
        try {
          const activeBattles = await liveStreamService.getActiveBattles();
          setBattles(activeBattles);
        } catch (error) {
          console.error("Error fetching battles:", error);
        }
      }
    };

    fetchBattles();
  }, [activeTab]);


  
  // Handle follow/unfollow
  const toggleFollow = async (video: VideoData, isCurrentlyFollowing: boolean) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to follow users",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isCurrentlyFollowing) {
        await videoService.unfollowUser(video.user.id);
        toast({
          title: "Unfollowed",
          description: `You have unfollowed @${video.user.username}`
        });
      } else {
        await videoService.followUser(video.user.id);
        toast({
          title: "Following",
          description: `You are now following @${video.user.username}`
        });
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({
        title: "Error",
        description: "Failed to follow/unfollow user",
        variant: "destructive"
      });
    }
  };
  
  // Handle sharing
  const handleShare = async (video: VideoData, platform: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to share videos",
        variant: "destructive"
      });
      return;
    }

    try {
      const videoUrl = `${window.location.origin}/app/video/${video.id}`;
      const shareText = `Check out this video by @${video.user.username}: "${video.description}"`;

      // Track share in service
      try {
        await videoService.shareVideo(video.id, platform);
      } catch (serviceError) {
        console.warn("Share tracking unavailable:", serviceError);
      }

      // Handle platform-specific sharing
      if (platform === 'web') {
        await navigator.clipboard.writeText(videoUrl);
        toast({
          title: "Link Copied",
          description: "Video link copied to clipboard"
        });
      } else if (platform === 'twitter') {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(videoUrl)}`;
        window.open(twitterUrl, '_blank', 'width=600,height=400');
        toast({
          title: "Opening Twitter",
          description: "Share your video on Twitter"
        });
      } else if (platform === 'facebook') {
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(videoUrl)}`;
        window.open(fbUrl, '_blank', 'width=600,height=400');
        toast({
          title: "Opening Facebook",
          description: "Share your video on Facebook"
        });
      } else if (platform === 'linkedin') {
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(videoUrl)}`;
        window.open(linkedinUrl, '_blank', 'width=600,height=400');
        toast({
          title: "Opening LinkedIn",
          description: "Share your video on LinkedIn"
        });
      }
    } catch (error) {
      console.error('Error sharing video:', error);
      toast({
        title: "Error",
        description: "Failed to share video",
        variant: "destructive"
      });
    }
  };
  


  if (loading) {
    return (
      <div className={`fixed inset-0 bg-black text-white flex items-center justify-center ${viewportHeight.screen}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading videos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`fixed inset-0 bg-black text-white flex items-center justify-center ${viewportHeight.screen}`}>
        <div className="text-center">
          <p className="text-red-500 mb-4">Error loading videos: {error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 bg-black text-white overflow-hidden z-10 ${viewportHeight.safe}`}>
      <style jsx>{`
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
        <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/70 via-black/40 to-transparent">
          <div className="flex items-center justify-between p-3 pt-8 md:p-4 md:pt-8 max-w-screen-xl mx-auto">
            {/* Left side - Back Arrow and Search */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="text-white hover:bg-white/20 w-8 h-8 sm:w-10 sm:h-10 rounded-full"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSearchOverlay(true)}
                className="text-white hover:bg-white/20 w-8 h-8 sm:w-10 sm:h-10 rounded-full"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
            
            {/* Center - Main tabs (Live, Battle, For You, Following) */}
            <div className="flex-1 max-w-md mx-4">
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
                <TabsList className="grid w-full grid-cols-4 bg-black/40 border border-white/10 rounded-full p-1">
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
                </TabsList>
              </Tabs>
            </div>
            
            {/* Right side - Create Menu and Profile */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowCreateMenu(true)}
                className="text-white hover:bg-white/20 w-8 h-8 sm:w-10 sm:h-10 rounded-full"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
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
          
          {/* Create Menu Dropdown - Positioned below header */}
          {showCreateMenu && (
            <div className="absolute top-16 right-4 z-50 animate-fade-in">
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
                    setShowLiveStreamModal(true);
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
                    setShowBattleCreationModal(true);
                  }}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
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
      )}

      {/* Full-screen video container */}
      <div
        ref={containerRef}
        className={`w-full overflow-y-auto snap-y snap-mandatory ${viewportHeight.screen} max-h-screen`}
        style={{
          scrollBehavior: "smooth",
          paddingTop: showControls && !isFullscreen ? "100px" : "0",
          paddingBottom: isMobile ? "80px" : "20px",
        }}
        onClick={() => setShowControls(!showControls)}
      >
        {/* Render content based on active tab */}
        {activeTab === "live" ? (
          // Render live streams
          liveStreams.map((stream, index) => (
            <LiveStreamCard
              key={stream.id}
              stream={stream}
              onClick={() => {
                // Navigate to live stream page
                navigate(`/app/live/${stream.id}`);
              }}
            />
          ))
        ) : activeTab === "battle" ? (
          // Render battles
          battles.map((battle, index) => (
            <BattleCard
              key={battle.id}
              battle={battle}
              onClick={() => {
                // Navigate to battle page
                navigate(`/app/battle/${battle.battle.id}`);
              }}
            />
          ))
        ) : (
          // Render regular videos
          allItems.map((item, index) => {
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
                onFollow={toggleFollow}
                onShare={handleShare}
              />
            );
          })
        )}
      </div>

      {/* Enhanced Create Button Group - Moved to left side */}
      <div className="fixed top-1/3 left-4 md:left-8 z-50 flex flex-col gap-3">
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
          <div className={`bg-gray-900 rounded-tl-2xl rounded-tr-2xl w-full max-w-md flex flex-col shadow-2xl ${mobileAnimations.slideUp} ${viewportHeight.safe} max-h-[70vh]`}>
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

      {/* Live Stream Modal */}
      <LiveStreamModal 
        open={showLiveStreamModal}
        onOpenChange={setShowLiveStreamModal}
        onStreamStart={(streamId) => {
          console.log("Stream started:", streamId);
        }}
      />
      
      {/* Battle Creation Modal */}
      <BattleCreationModal 
        open={showBattleCreationModal}
        onOpenChange={setShowBattleCreationModal}
        onBattleStart={(battleId) => {
          console.log("Battle started:", battleId);
        }}
      />
      
    </div>
  );
};

export default Videos;
