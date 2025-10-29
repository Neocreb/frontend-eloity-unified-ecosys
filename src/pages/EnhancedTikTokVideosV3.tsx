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
import { useEffect, useState } from "react";

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
}> = ({ video, isActive, showControls = true, onDuetCreate }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const [isPlaying, setIsPlaying] = useState(isActive);
  const [isFollowing, setIsFollowing] = useState(video.user.isFollowing || false);
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

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const description = video.description;
  const truncatedDescription =
    description.length > 100 ? description.substring(0, 100) + "..." : description;

  return (
    <div className="relative h-screen w-full bg-black snap-start snap-always">
      {/* Enhanced Video Player */}
      <div className="absolute inset-0 w-full h-full">
        <EnhancedVideoPlayer
          videoRef={videoRef}
          src={video.videoUrl}
          poster={video.thumbnail}
          muted={isMuted}
          autoPlay={isActive && isPlaying}
          loop={true}
          className="w-full h-full object-cover"
          onClick={togglePlay}
          onMuteChange={setIsMuted}
          showControls={true}
          chapters={video.chapters || []}
          captions={video.captions || []}
          qualities={video.videoSources || []}
          onProgress={(progress) => {
            // Handle progress updates if needed
          }}
        />
      </div>

      {/* Live indicator for live streams */}
      {video.isLiveStream && (
        <div className="absolute top-4 left-4 z-30">
          <Badge className="bg-red-500 text-white animate-pulse">
            <Radio className="w-3 h-3 mr-1" />
            LIVE
          </Badge>
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
        <div className="flex-1 flex flex-col justify-end p-3 md:p-4 pb-44 md:pb-8">
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

        {/* Right side - Interactive Features */}
        <div className="flex flex-col items-center justify-end gap-3 md:gap-4 p-2 md:p-4 pb-44 md:pb-8">
          <InteractiveFeatures
            videoId={video.id}
            isLiveStream={video.isLiveStream}
            allowDuets={video.allowDuets}
            allowComments={video.allowComments}
            isBattle={video.timestamp === "BATTLE"}
            battleData={video.timestamp === "BATTLE" ? {
              creator1: {
                id: video.user.id,
                username: video.user.username,
                displayName: video.user.displayName,
                avatar: video.user.avatar,
              },
              creator2: {
                id: "opponent_" + video.id,
                username: video.id === "battle1" ? "melody_queen" : "freestyle_master",
                displayName: video.id === "battle1" ? "Melody Queen" : "Freestyle Master",
                avatar: `https://i.pravatar.cc/150?img=${video.id === "battle1" ? "9" : "10"}`,
              }
            } : undefined}
            onDuetCreate={(videoId) => {
              // Handle duet creation by opening the new duet recorder
              if (onDuetCreate) {
                onDuetCreate(video);
              }
            }}
          />
        </div>
      </div>

      {/* Volume control */}
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-4 right-4 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/30 hover:bg-black/50 border-none"
        onClick={() => setIsMuted(!isMuted)}
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4 md:w-5 md:h-5 text-white" />
        ) : (
          <Volume2 className="w-4 h-4 md:w-5 md:h-5 text-white" />
        )}
      </Button>
    </div>
  );
};

const EnhancedTikTokVideosV3: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

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

  // Fetch real video data
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch videos for different tabs
        const [forYouData, followingData] = await Promise.all([
          videoService.getVideos(10, 0), // For You tab
          videoService.getVideos(10, 0, 'following') // Following tab (this would need to be implemented)
        ]);
        
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
          },
          hashtags: video.tags || [],
          videoUrl: video.video_url,
          thumbnail: video.thumbnail_url || "https://picsum.photos/400/600",
          duration: video.duration || 0,
          timestamp: new Date(video.created_at).toLocaleDateString(),
          category: video.category || "Entertainment",
          allowDuets: true,
          allowComments: true,
        });
        
        setForYouVideos(forYouData.map(transformVideo));
        setFollowingVideos(followingData.map(transformVideo));
        
        // For live streams and battle videos, we would need specific data
        // For now, we'll use a subset of forYouVideos as placeholders
        setLiveStreams(forYouData.slice(0, 2).map(transformVideo));
        setBattleVideos(forYouData.slice(0, 2).map(transformVideo));
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching videos:", err);
        setError("Failed to load videos");
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

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
  }, [currentVideoIndex, currentVideos.length]);

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
    const streamId = addLiveStream({
      title: streamData.title,
      description: streamData.description,
      category: streamData.category,
    });

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
    const battleId = addBattle({
      title: battleData.title,
      description: battleData.description,
      category: battleData.type,
      battleData: {
        type: battleData.type,
        timeRemaining: 300, // 5 minutes
        scores: {
          user1: 0,
          user2: 0,
        },
        opponent: battleData.opponentId ? {
          id: battleData.opponentId,
          username: "opponent",
          displayName: "Opponent",
          avatar: "https://i.pravatar.cc/150?img=5",
        } : undefined,
      },
    });

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

  const videos = getCurrentVideos();

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
        className="h-full w-full overflow-y-auto snap-y snap-mandatory"
        style={{
          scrollBehavior: "smooth",
          paddingTop: showControls ? "120px" : "0",
          paddingBottom: "80px",
        }}
      >
        {videos.length > 0 ? (
          videos.map((video, index) => (
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
                    onBattleEnd={(winnerId) => {
                      toast({
                        title: "Battle Ended! 🏆",
                        description: `${winnerId === video.user.id ? 'You' : 'Opponent'} won the battle!`,
                      });
                    }}
                  />
                ) : (
                  <VideoCard
                    video={video}
                    isActive={index === currentVideoIndex}
                    showControls={showControls}
                    onDuetCreate={(video) => {
                      setDuetOriginalVideo(video);
                      setShowDuetRecorder(true);
                    }}
                  />
                )
              ) : (
                <VideoCard
                  video={video}
                  isActive={index === currentVideoIndex}
                  showControls={showControls}
                  onDuetCreate={(video) => {
                    setDuetOriginalVideo(video);
                    setShowDuetRecorder(true);
                  }}
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
