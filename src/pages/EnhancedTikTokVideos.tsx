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

import CreatorDashboard from "@/components/video/CreatorDashboard";
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
}

// Mock data for different tabs
const forYouVideos: VideoData[] = [
  {
    id: "1",
    user: {
      id: "1",
      username: "crypto_king",
      displayName: "Crypto King",
      avatar: "https://i.pravatar.cc/150?img=1",
      verified: true,
      followerCount: 234567,
    },
    description: "Bitcoin to the moon! 🚀 Who else is holding? #crypto #bitcoin #hodl",
    music: { title: "Crypto Anthem", artist: "Digital Dreams" },
    stats: { likes: 15400, comments: 892, shares: 445, views: "2.1M" },
    hashtags: ["crypto", "bitcoin", "hodl"],
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    thumbnail: "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=400",
    duration: 30,
    timestamp: "2h",
    allowDuets: true,
    allowComments: true,
  },
  {
    id: "2",
    user: {
      id: "2",
      username: "tech_trader",
      displayName: "Tech Trader",
      avatar: "https://i.pravatar.cc/150?img=2",
      verified: false,
      followerCount: 89456,
    },
    description: "Day trading tips that actually work! Follow for more 💰 #trading #stocks",
    music: { title: "Success Vibes", artist: "Motivation Mix" },
    stats: { likes: 8900, comments: 567, shares: 234, views: "890K" },
    hashtags: ["trading", "stocks", "daytrading"],
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
    thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400",
    duration: 45,
    timestamp: "5h",
    allowDuets: true,
    allowComments: true,
  },
];

const followingVideos: VideoData[] = [
  {
    id: "fl1",
    user: {
      id: "4",
      username: "photo_pro",
      displayName: "Photo Pro",
      avatar: "https://i.pravatar.cc/150?img=15",
      verified: true,
      followerCount: 15600,
      isFollowing: true,
    },
    description: "Testing my new camera setup! What do you think? 📸 #photography #newgear",
    music: { title: "Camera Click", artist: "Sound Effects" },
    stats: { likes: 450, comments: 78, shares: 12, views: "2.3K" },
    hashtags: ["photography", "newgear", "test"],
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    thumbnail: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400",
    duration: 25,
    timestamp: "1h",
    allowDuets: true,
    allowComments: true,
  },
];

const liveStreams: VideoData[] = [
  {
    id: "live1",
    user: {
      id: "live1",
      username: "crypto_guru",
      displayName: "Crypto Guru",
      avatar: "https://i.pravatar.cc/150?img=10",
      verified: true,
      followerCount: 50000,
    },
    description: "LIVE: Bitcoin analysis and market predictions! 🔴 Join the discussion",
    music: { title: "Live Stream", artist: "Real Time" },
    stats: { likes: 1250, comments: 345, shares: 89, views: "12.5K watching" },
    hashtags: ["live", "crypto", "bitcoin", "analysis"],
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    thumbnail: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400",
    duration: 0, // Live streams don't have fixed duration
    timestamp: "LIVE",
    isLiveStream: true,
    allowDuets: false,
    allowComments: true,
  },
  {
    id: "live2",
    user: {
      id: "live2",
      username: "trading_live",
      displayName: "Trading Live",
      avatar: "https://i.pravatar.cc/150?img=11",
      verified: false,
      followerCount: 25000,
    },
    description: "🔴 LIVE Trading Session - Day Trading with $10K! Come learn!",
    music: { title: "Live Stream", artist: "Real Time" },
    stats: { likes: 890, comments: 234, shares: 45, views: "8.9K watching" },
    hashtags: ["live", "trading", "daytrading", "learn"],
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
    thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400",
    duration: 0,
    timestamp: "LIVE",
    isLiveStream: true,
    allowDuets: false,
    allowComments: true,
  },
  {
    id: "battle1",
    user: {
      id: "battle1",
      username: "dance_master",
      displayName: "Dance Master",
      avatar: "https://i.pravatar.cc/150?img=3",
      verified: true,
      followerCount: 892000,
    },
    description: "��� LIVE BATTLE: Epic Dance Battle vs @melody_queen! Vote with gifts! ⚡",
    music: { title: "Battle Theme", artist: "Epic Beats" },
    stats: { likes: 3240, comments: 890, shares: 234, views: "24.8K watching" },
    hashtags: ["livebattle", "dance", "epic", "compete"],
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
    duration: 0,
    timestamp: "BATTLE",
    isLiveStream: true,
    allowDuets: false,
    allowComments: true,
  },
  {
    id: "battle2",
    user: {
      id: "battle2",
      username: "rap_king",
      displayName: "Rap King",
      avatar: "https://i.pravatar.cc/150?img=8",
      verified: true,
      followerCount: 567000,
    },
    description: "🎤 LIVE RAP BATTLE: Freestyle showdown! Drop bars and win SoftPoints! 💰",
    music: { title: "Hip Hop Battle", artist: "Street Beats" },
    stats: { likes: 1890, comments: 567, shares: 123, views: "15.2K watching" },
    hashtags: ["rapbattle", "freestyle", "hiphop", "bars"],
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
    thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
    duration: 0,
    timestamp: "BATTLE",
    isLiveStream: true,
    allowDuets: false,
    allowComments: true,
  },
  {
    id: "battle3",
    user: {
      id: "battle3",
      username: "comedy_clash",
      displayName: "Comedy Clash",
      avatar: "https://i.pravatar.cc/150?img=7",
      verified: false,
      followerCount: 234000,
    },
    description: "😂 COMEDY BATTLE: Who's funnier? Laugh and support your favorite! 🤣",
    music: { title: "Comedy Battle", artist: "Funny Sounds" },
    stats: { likes: 945, comments: 234, shares: 78, views: "8.9K watching" },
    hashtags: ["comedybattle", "funny", "laugh", "humor"],
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    thumbnail: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400",
    duration: 0,
    timestamp: "BATTLE",
    isLiveStream: true,
    allowDuets: false,
    allowComments: true,
  },
];

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
      >
        <source src={video.videoUrl} type="video/mp4" />
      </video>

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

const EnhancedTikTokVideos: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  // Get initial tab from URL params or default to "foryou"
  const initialTab = searchParams.get('tab') as "live" | "foryou" | "following" || "foryou";
  const [activeTab, setActiveTab] = useState<"live" | "foryou" | "following">(initialTab);
  const [isAdvancedRecorderOpen, setIsAdvancedRecorderOpen] = useState(false);
  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isLiveStreamOpen, setIsLiveStreamOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showDuetRecorder, setShowDuetRecorder] = useState(false);
  const [duetOriginalVideo, setDuetOriginalVideo] = useState<any>(null);
  const [selectedDuetStyle, setSelectedDuetStyle] = useState<'side-by-side' | 'react-respond' | 'picture-in-picture'>('side-by-side');
  const [showBattleSetup, setShowBattleSetup] = useState(false);
  const [showLiveBattle, setShowLiveBattle] = useState(false);

  const [userBalance] = useState(2500); // Mock user balance
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { allLiveContent, addLiveStream, addBattle, removeLiveContent } = useLiveContentContext();

  // Get current videos based on active tab
  const getCurrentVideos = () => {
    switch (activeTab) {
      case "live":
        // Convert live content to video format for compatibility
        return allLiveContent.map(liveContentToVideoData);
      case "following":
        return followingVideos;
      default:
        return forYouVideos;
    }
  };

  const currentVideos = getCurrentVideos();

  // Auto-hide controls after inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showControls) {
      timeout = setTimeout(() => {
        setShowControls(false);
      }, 4000);
    }
    return () => clearTimeout(timeout);
  }, [showControls]);

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
    // Refresh the feed or navigate to the new duet
    // You could add logic here to add the new duet to the current videos list
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
      description: "Your stream is now live in the Live/Battle tab",
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

    // Switch to live tab to show the new battle
    setActiveTab("live");
    setCurrentVideoIndex(0);
    setShowBattleSetup(false);

    toast({
      title: "Battle Started! ⚔��",
      description: "Your battle is now live in the Live/Battle tab",
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

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden z-10">
      <Helmet>
        <title>Videos | SoftChat</title>
        <meta
          name="description"
          content="Discover trending videos, live streams, and content from creators you follow"
        />
      </Helmet>

      {/* Enhanced TikTok-style header with Live, For You, Following tabs */}
      {showControls && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/90 via-black/60 to-transparent">
          <div className="flex items-center justify-between p-4 pt-8">
            {/* Left side buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSearchOverlay(true)}
                className="text-white hover:bg-white/20"
              >
                <Search className="w-5 h-5" />
              </Button>
            </div>

            {/* Central tabs - Enhanced TikTok style with Live tab and Create button */}
            <div className="flex-1 flex justify-center items-center gap-8">
              <Tabs
                value={activeTab}
                onValueChange={(value) =>
                  setActiveTab(value as "live" | "foryou" | "following")
                }
                className="w-auto"
              >
                <TabsList className="bg-transparent border-0 h-auto p-0 space-x-6">
                  <TabsTrigger
                    value="live"
                    className={cn(
                      "bg-transparent border-0 text-base font-semibold px-0 pb-2 data-[state=active]:bg-transparent",
                      "data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-red-500",
                      "text-white/60 hover:text-white transition-colors flex items-center gap-1"
                    )}
                  >
                    <Radio className="w-4 h-4" />
                    Live/Battle
                  </TabsTrigger>
                  <TabsTrigger
                    value="foryou"
                    className={cn(
                      "bg-transparent border-0 text-base font-semibold px-0 pb-2 data-[state=active]:bg-transparent",
                      "data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white",
                      "text-white/60 hover:text-white transition-colors"
                    )}
                  >
                    For You
                  </TabsTrigger>
                  <TabsTrigger
                    value="following"
                    className={cn(
                      "bg-transparent border-0 text-base font-semibold px-0 pb-2 data-[state=active]:bg-transparent",
                      "data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white",
                      "text-white/60 hover:text-white transition-colors"
                    )}
                  >
                    Following
                  </TabsTrigger>

                </TabsList>
              </Tabs>

              {/* Create Button in Header */}
              <DropdownMenu open={showCreateMenu} onOpenChange={setShowCreateMenu}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Create
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-gray-900 border-gray-700 text-white mb-2"
                >
                  <DropdownMenuItem onClick={handleRecordVideo} className="hover:bg-gray-800">
                    <Camera className="w-4 h-4 mr-2" />
                    Record Video
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleUploadVideo} className="hover:bg-gray-800">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Video
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleGoLive} className="hover:bg-gray-800">
                    <Radio className="w-4 h-4 mr-2" />
                    Go Live
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleStartBattle} className="hover:bg-gray-800">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Start Battle
                  </DropdownMenuItem>

                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Right side buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => setIsDashboardOpen(true)}
              >
                <Award className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
              >
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Video content area */}
      <div
        ref={containerRef}
        className="h-full w-full overflow-y-auto snap-y snap-mandatory scrollbar-hide"
        style={{
          scrollBehavior: "smooth",
          paddingBottom: isMobile ? "80px" : "20px",
        }}
        onClick={() => setShowControls(!showControls)}
      >
        <Tabs value={activeTab} className="h-full">
          <TabsContent value="live" className="h-full mt-0">
            {allLiveContent.length > 0 ? (
              allLiveContent.map((liveContent, index) => {
                // Use MobileLiveStreamLayout for mobile-optimized live experience
                return (
                  <MobileLiveStreamLayout
                    key={liveContent.id}
                    content={liveContent}
                    isActive={index === currentVideoIndex && activeTab === "live"}
                    isUserOwned={liveContent.isUserOwned}
                    onEndStream={() => {
                      removeLiveContent(liveContent.id);
                      toast({
                        title: "Stream Ended",
                        description: "Your live stream has been ended",
                      });
                    }}
                  />
                );
              })
            ) : (
              <div className="h-screen flex items-center justify-center">
                <div className="text-center text-white/60">
                  <Radio className="w-12 h-12 mx-auto mb-4 text-red-500" />
                  <p className="text-lg font-medium mb-2">No live content right now</p>
                  <p className="text-sm">Start a live stream or battle to see content here!</p>
                  <div className="mt-4">
                    <Button
                      onClick={() => setIsLiveStreamOpen(true)}
                      className="bg-red-500 hover:bg-red-600 text-white mr-2"
                    >
                      <Radio className="w-4 h-4 mr-2" />
                      Go Live
                    </Button>
                    <Button
                      onClick={() => setShowBattleSetup(true)}
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Start Battle
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          <TabsContent value="foryou" className="h-full mt-0">
            {forYouVideos.map((video, index) => (
              <VideoCard
                key={video.id}
                video={video}
                isActive={index === currentVideoIndex && activeTab === "foryou"}
                showControls={showControls}
                onDuetCreate={handleDuetCreate}
              />
            ))}
          </TabsContent>
          <TabsContent value="following" className="h-full mt-0">
            {followingVideos.length > 0 ? (
              followingVideos.map((video, index) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  isActive={index === currentVideoIndex && activeTab === "following"}
                  showControls={showControls}
                  onDuetCreate={handleDuetCreate}
                />
              ))
            ) : (
              <div className="h-screen flex items-center justify-center">
                <div className="text-center text-white/60">
                  <Users className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">No videos yet</p>
                  <p className="text-sm">Follow creators to see their content here!</p>
                </div>
              </div>
            )}
          </TabsContent>

        </Tabs>
      </div>



      {/* Search Overlay */}
      {showSearchOverlay && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
          <div className="w-full max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search videos, creators, sounds..."
                className="pl-10 pr-12 py-3 bg-gray-900 border-gray-700 text-white text-lg"
                autoFocus
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSearchOverlay(false)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                <X className="w-5 h-5" />
              </Button>
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
            description: "Your battle is now live in the Live/Battle tab",
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
                description: "Your stream is starting in the Live/Battle tab",
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

      {/* Creator Dashboard */}
      <Dialog open={isDashboardOpen} onOpenChange={setIsDashboardOpen}>
        <DialogContent className="max-w-6xl w-[95vw] h-[90vh] bg-gray-900 border-gray-700 p-0">
          <VisuallyHidden>
            <DialogTitle>Creator Dashboard</DialogTitle>
          </VisuallyHidden>
          <div className="h-full overflow-auto p-6">
            <CreatorDashboard />
          </div>
        </DialogContent>
      </Dialog>


    </div>
  );
};

export default EnhancedTikTokVideos;
