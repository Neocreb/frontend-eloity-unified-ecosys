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
  ArrowLeft,
  Camera,
  Video,
  Mic,
  UserPlus,
  Crown,
  Flame,
  Coffee,
  Gift,
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
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EnhancedVideoCreator from "@/components/video/EnhancedVideoCreator";
import AdvancedVideoRecorder from "@/components/video/AdvancedVideoRecorder";
import ContentDiscoveryEngine from "@/components/video/ContentDiscoveryEngine";
import InteractiveFeatures from "@/components/video/InteractiveFeatures";
import CreatorDashboard from "@/components/video/CreatorDashboard";
import { cn } from "@/utils/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useVideoPlayback } from "@/hooks/use-video-playback";
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

// Mock data for "For You" tab (trending/algorithm-based videos)
const forYouVideos: VideoData[] = [
  {
    id: "fy1",
    user: {
      id: "1",
      username: "crypto_king",
      displayName: "Crypto King",
      avatar: "https://i.pravatar.cc/150?img=1",
      verified: true,
      followerCount: 234567,
      isFollowing: false,
    },
    description:
      "Bitcoin to the moon! 🚀 Who else is holding? This AI-powered analysis shows why we're still early! #crypto #bitcoin #hodl #ai",
    music: {
      title: "Crypto Anthem",
      artist: "Digital Dreams",
      id: "crypto-anthem-1",
      duration: 30,
    },
    stats: {
      likes: 15400,
      comments: 892,
      shares: 445,
      views: "2.1M",
      saves: 3240,
    },
    hashtags: ["crypto", "bitcoin", "hodl", "moon", "ai"],
    videoUrl:
      "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=400",
    duration: 30,
    timestamp: "2h",
    category: "Finance & Crypto",
    allowDuets: true,
    allowComments: true,
    hasCaption: true,
    challenge: {
      id: "crypto-prediction-2024",
      title: "Crypto Prediction Challenge",
      hashtag: "CryptoPrediction2024",
    },
  },
  {
    id: "fy2",
    user: {
      id: "2",
      username: "dance_queen",
      displayName: "Dance Queen",
      avatar: "https://i.pravatar.cc/150?img=15",
      verified: true,
      followerCount: 1200000,
      isFollowing: false,
    },
    description:
      "Teaching you the hottest dance moves! 💃 Follow for more dance tutorials #dance #viral #tutorial",
    music: {
      title: "Viral Hit 2024",
      artist: "DJ TrendMaker",
      id: "viral-hit-1",
      duration: 45,
    },
    stats: {
      likes: 89000,
      comments: 5670,
      shares: 2340,
      views: "8.9M",
      saves: 12000,
    },
    hashtags: ["dance", "viral", "tutorial", "trending"],
    videoUrl:
      "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1524863479829-916d8e77f114?w=400",
    duration: 45,
    timestamp: "4h",
    category: "Dance & Entertainment",
    allowDuets: true,
    allowComments: true,
    hasCaption: false,
  },
  {
    id: "fy3",
    user: {
      id: "3",
      username: "tech_guru",
      displayName: "Tech Guru",
      avatar: "https://i.pravatar.cc/150?img=8",
      verified: true,
      followerCount: 567890,
      isFollowing: false,
    },
    description:
      "Mind-blowing AI tools you NEED to try! ��� This changes everything! Link in bio #ai #tech #tools",
    music: {
      title: "Future Tech",
      artist: "Synthwave Studios",
    },
    stats: {
      likes: 45600,
      comments: 2890,
      shares: 1230,
      views: "3.4M",
    },
    hashtags: ["ai", "tech", "tools", "mindblown"],
    videoUrl:
      "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400",
    duration: 35,
    timestamp: "6h",
    category: "Technology",
  },
];

// Mock data for "Following" tab (videos from followed users)
const followingVideos: VideoData[] = [
  {
    id: "fl1",
    user: {
      id: "4",
      username: "my_friend_alex",
      displayName: "Alex Johnson",
      avatar: "https://i.pravatar.cc/150?img=12",
      verified: false,
      followerCount: 1234,
      isFollowing: true,
    },
    description:
      "Just got my new camera! Testing it out 📸 What do you think? #photography #newgear",
    music: {
      title: "Chill Vibes",
      artist: "Lofi Beats",
    },
    stats: {
      likes: 234,
      comments: 45,
      shares: 12,
      views: "2.3K",
    },
    hashtags: ["photography", "newgear", "test"],
    videoUrl:
      "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400",
    duration: 25,
    timestamp: "1h",
    category: "Photography",
  },
  {
    id: "fl2",
    user: {
      id: "5",
      username: "fitness_sarah",
      displayName: "Sarah Fit",
      avatar: "https://i.pravatar.cc/150?img=20",
      verified: false,
      followerCount: 8900,
      isFollowing: true,
    },
    description:
      "Morning workout routine! Who's joining me? 💪 #fitness #workout #morning",
    music: {
      title: "Pump It Up",
      artist: "Workout Beats",
    },
    stats: {
      likes: 1200,
      comments: 189,
      shares: 67,
      views: "12K",
    },
    hashtags: ["fitness", "workout", "morning", "motivation"],
    videoUrl:
      "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
    duration: 40,
    timestamp: "3h",
    category: "Fitness",
  },
];

const VideoCard: React.FC<{
  video: VideoData;
  isActive: boolean;
  showControls?: boolean;
}> = ({ video, isActive, showControls = true }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const [isPlaying, setIsPlaying] = useState(isActive);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(
    video.user.isFollowing || false,
  );
  const videoRef = useRef<HTMLVideoElement>(null);
  const isMobile = useIsMobile();
  const { safePlay, safePause, togglePlayback } = useVideoPlayback();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

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
  }, [isActive, isPlaying, safePlay, safePause]);

  const togglePlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    await togglePlayback(video, isPlaying, setIsPlaying);
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
    description.length > 100
      ? description.substring(0, 100) + "..."
      : description;

  const handleLike = () => {
    setIsLiked(!isLiked);
    // Add haptic feedback on mobile
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    // Add heart animation class temporarily
    const button = document.querySelector(
      `[data-video-id="${video.id}"] .like-button`,
    );
    if (button) {
      button.classList.add("tiktok-heart-animation");
      setTimeout(() => button.classList.remove("tiktok-heart-animation"), 600);
    }
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  return (
    <div
      className="relative h-screen w-full bg-black snap-start snap-always"
      data-video-id={video.id}
    >
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

      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/40" />

      {/* Challenge Banner - TikTok style */}
      {video.challenge && showControls && (
        <div className="absolute top-12 left-4 right-24 z-30">
          <div className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 backdrop-blur-md border border-white/20 rounded-full px-3 py-2">
            <div className="flex items-center gap-2">
              <Flame className="w-3 h-3 text-orange-400" />
              <span className="text-white text-sm font-semibold">
                #{video.challenge.hashtag}
              </span>
              <Badge
                variant="secondary"
                className="bg-white/20 text-white text-xs border-0"
              >
                Trending
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Play/Pause overlay - TikTok style */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            size="icon"
            variant="ghost"
            className="w-20 h-20 rounded-full bg-black/40 hover:bg-black/60 border-2 border-white/30 backdrop-blur-sm"
            onClick={togglePlay}
          >
            <Play className="w-10 h-10 text-white fill-white ml-1" />
          </Button>
        </div>
      )}

      {/* Main content overlay - TikTok layout */}
      <div className="absolute inset-0 flex">
        {/* Left side - User info and description */}
        <div className="flex-1 flex flex-col justify-end p-4 pb-32 md:pb-8">
          <div className="space-y-3 max-w-[75%]">
            {/* User info with follow button */}
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 border-2 border-white/30">
                <AvatarImage src={video.user.avatar} />
                <AvatarFallback>{video.user.displayName[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-base truncate">
                    @{video.user.username}
                  </span>
                  {video.user.verified && (
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                  {video.isLiveStream && (
                    <Badge className="bg-red-500 text-white text-xs animate-pulse border-0">
                      LIVE
                    </Badge>
                  )}
                </div>
                {video.user.followerCount && (
                  <div className="text-white/80 text-sm">
                    {formatNumber(video.user.followerCount)} followers
                  </div>
                )}
              </div>
              {!isFollowing && (
                <Button
                  size="sm"
                  onClick={handleFollow}
                  className="bg-red-500 hover:bg-red-600 text-white border-0 rounded-md px-4 py-1.5 text-sm font-semibold tiktok-follow-pulse"
                >
                  Follow
                </Button>
              )}
            </div>

            {/* Description */}
            <div className="text-white">
              <p className="text-base leading-relaxed mb-2">
                {showMore ? description : truncatedDescription}
                {description.length > 100 && (
                  <button
                    onClick={() => setShowMore(!showMore)}
                    className="text-white/80 ml-1 underline text-sm"
                  >
                    {showMore ? "less" : "more"}
                  </button>
                )}
              </p>

              {/* Hashtags */}
              <div className="flex flex-wrap gap-1">
                {video.hashtags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="text-blue-300 text-base font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Music info - TikTok style */}
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-3 py-2 w-fit">
              <Music className="w-4 h-4 text-white flex-shrink-0" />
              <span className="text-white text-sm truncate max-w-[200px]">
                {video.music.title} - {video.music.artist}
              </span>
            </div>

            {/* Video metadata */}
            <div className="flex items-center gap-3 text-white/70 text-sm">
              {video.timestamp && <span>{video.timestamp}</span>}
              {video.category && (
                <Badge
                  variant="secondary"
                  className="bg-white/20 text-white border-0 text-xs"
                >
                  {video.category}
                </Badge>
              )}
              {video.hasCaption && (
                <Badge
                  variant="secondary"
                  className="bg-blue-500/30 text-blue-200 border-0 text-xs"
                >
                  CC
                </Badge>
              )}
              {video.isSponsored && (
                <Badge
                  variant="secondary"
                  className="bg-yellow-500/30 text-yellow-200 border-0 text-xs"
                >
                  Sponsored
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Right side - Action buttons (TikTok style) */}
        <div className="flex flex-col items-center justify-end gap-3 p-2 pb-28 md:pb-8 w-14">
          {/* User avatar with follow button overlay */}
          <div className="relative mb-3">
            <Avatar className="w-10 h-10 border-2 border-white">
              <AvatarImage src={video.user.avatar} />
              <AvatarFallback>{video.user.displayName[0]}</AvatarFallback>
            </Avatar>
            {!isFollowing && (
              <Button
                size="sm"
                onClick={handleFollow}
                className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-red-500 hover:bg-red-600 p-0 border-2 border-white"
              >
                <Plus className="w-2.5 h-2.5 text-white" />
              </Button>
            )}
          </div>

          {/* Like button */}
          <div className="flex flex-col items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleLike}
              className={cn(
                "like-button w-12 h-12 rounded-full transition-all duration-200",
                isLiked
                  ? "bg-red-500/20 text-red-500 scale-105"
                  : "bg-black/30 text-white hover:bg-black/50 backdrop-blur-sm",
              )}
            >
              <Heart
                className={cn(
                  "w-7 h-7",
                  isLiked ? "fill-red-500 text-red-500" : "",
                )}
              />
            </Button>
            <span className="text-white text-xs font-semibold">
              {formatNumber(video.stats.likes + (isLiked ? 1 : 0))}
            </span>
          </div>

          {/* Comments */}
          <div className="flex flex-col items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="w-12 h-12 rounded-full bg-black/30 text-white hover:bg-black/50 backdrop-blur-sm"
            >
              <MessageCircle className="w-7 h-7" />
            </Button>
            <span className="text-white text-xs font-semibold">
              {formatNumber(video.stats.comments)}
            </span>
          </div>

          {/* Gift button */}
          <div className="flex flex-col items-center gap-1">
            <VirtualGiftsAndTips
              recipientId={video.user.id}
              recipientName={video.user.displayName}
              trigger={
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-12 h-12 rounded-full bg-black/30 text-white hover:bg-black/50 backdrop-blur-sm"
                >
                  <Gift className="w-7 h-7" />
                </Button>
              }
            />
            <span className="text-white text-xs font-semibold">Gift</span>
          </div>

          {/* Bookmark */}
          <div className="flex flex-col items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={cn(
                "w-12 h-12 rounded-full transition-all duration-200 backdrop-blur-sm",
                isBookmarked
                  ? "bg-yellow-500/20 text-yellow-500"
                  : "bg-black/30 text-white hover:bg-black/50",
              )}
            >
              <Bookmark
                className={cn(
                  "w-7 h-7",
                  isBookmarked ? "fill-yellow-500 text-yellow-500" : "",
                )}
              />
            </Button>
            {video.stats.saves && (
              <span className="text-white text-xs font-semibold">
                {formatNumber(video.stats.saves)}
              </span>
            )}
          </div>

          {/* Share */}
          <div className="flex flex-col items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="w-12 h-12 rounded-full bg-black/30 text-white hover:bg-black/50 backdrop-blur-sm"
            >
              <Share className="w-7 h-7" />
            </Button>
            <span className="text-white text-xs font-semibold">
              {formatNumber(video.stats.shares)}
            </span>
          </div>

          {/* More options */}
          <Button
            size="icon"
            variant="ghost"
            className="w-12 h-12 rounded-full bg-black/30 text-white hover:bg-black/50 backdrop-blur-sm"
          >
            <MoreHorizontal className="w-7 h-7" />
          </Button>

          {/* Rotating disc for music - TikTok style */}
          <div className="relative mt-2">
            <div className="w-11 h-11 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center tiktok-disc-spin">
              <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center">
                <div className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Volume control */}
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-16 right-3 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 border-none z-30"
        onClick={() => setIsMuted(!isMuted)}
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4 text-white" />
        ) : (
          <Volume2 className="w-4 h-4 text-white" />
        )}
      </Button>

      {/* Views badge */}
      <div className="absolute top-4 left-4 z-30">
        <Badge className="bg-black/50 text-white border-0 backdrop-blur-sm text-xs">
          <Eye className="w-3 h-3 mr-1" />
          {video.stats.views}
        </Badge>
      </div>
    </div>
  );
};

const TikTokStyleVideos: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"foryou" | "following">("foryou");
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isAdvancedRecorderOpen, setIsAdvancedRecorderOpen] = useState(false);
  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const currentVideos = activeTab === "foryou" ? forYouVideos : followingVideos;

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

  // Handle scroll to change videos
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
    // Handle video creation - would typically upload to server
    setIsAdvancedRecorderOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden z-10">
      <Helmet>
        <title>Videos | Eloity</title>
        <meta
          name="description"
          content="Discover trending videos and content from creators you follow"
        />
      </Helmet>

      {/* TikTok-style header with tabs */}
      {showControls && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          <div className="flex items-center justify-between p-4 pt-8">
            {/* Search and Live buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
              >
                <Users className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSearchOverlay(true)}
                className="text-white hover:bg-white/20"
              >
                <Search className="w-5 h-5" />
              </Button>
            </div>

            {/* Central tabs - TikTok style */}
            <div className="flex-1 flex justify-center">
              <Tabs
                value={activeTab}
                onValueChange={(value) =>
                  setActiveTab(value as "foryou" | "following")
                }
                className="w-auto"
              >
                <TabsList className="bg-transparent border-0 h-auto p-0 space-x-8">
                  <TabsTrigger
                    value="foryou"
                    className={cn(
                      "bg-transparent border-0 text-lg font-semibold px-0 pb-2 data-[state=active]:bg-transparent",
                      "data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white",
                      "text-white/60 hover:text-white transition-colors",
                    )}
                  >
                    For You
                  </TabsTrigger>
                  <TabsTrigger
                    value="following"
                    className={cn(
                      "bg-transparent border-0 text-lg font-semibold px-0 pb-2 data-[state=active]:bg-transparent",
                      "data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white",
                      "text-white/60 hover:text-white transition-colors",
                    )}
                  >
                    Following
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Right side buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
              >
                <Coffee className="w-5 h-5" />
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
          <TabsContent value="foryou" className="h-full mt-0">
            {forYouVideos.map((video, index) => (
              <VideoCard
                key={video.id}
                video={video}
                isActive={index === currentVideoIndex && activeTab === "foryou"}
                showControls={showControls}
              />
            ))}
          </TabsContent>
          <TabsContent value="following" className="h-full mt-0">
            {followingVideos.length > 0 ? (
              followingVideos.map((video, index) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  isActive={
                    index === currentVideoIndex && activeTab === "following"
                  }
                  showControls={showControls}
                />
              ))
            ) : (
              <div className="h-screen flex flex-col items-center justify-center text-white p-8">
                <UserPlus className="w-24 h-24 text-white/40 mb-6" />
                <h3 className="text-2xl font-bold mb-4">No videos yet</h3>
                <p className="text-white/70 text-center text-lg leading-relaxed mb-8 max-w-sm">
                  Follow creators to see their latest videos here. Discover
                  amazing creators in the For You tab!
                </p>
                <Button
                  onClick={() => setActiveTab("foryou")}
                  className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 text-lg font-semibold rounded-xl"
                >
                  Discover creators
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Create button and quick actions - TikTok style */}
      <div className="fixed bottom-28 md:bottom-12 right-2 z-40 flex flex-col gap-2">
        {/* Creator Dashboard */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/app/unified-creator-studio')}
          className="w-11 h-11 rounded-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 backdrop-blur-sm"
          title="Creator Studio"
        >
          <Crown className="w-5 h-5" />
        </Button>

        {/* Discover */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsDiscoveryOpen(true)}
          className="w-11 h-11 rounded-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 backdrop-blur-sm"
          title="Discover Trends"
        >
          <TrendingUp className="w-5 h-5" />
        </Button>

        {/* Main create button - TikTok style */}
        <Button
          onClick={() => setIsAdvancedRecorderOpen(true)}
          className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-2xl w-14 h-14 shadow-xl transition-all duration-200 hover:scale-105 relative overflow-hidden"
          title="Create Video"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-pink-400 opacity-30 animate-pulse"></div>
          <Plus className="h-7 w-7 relative z-10" />
        </Button>
      </div>

      {/* Navigation hint */}
      {showControls && currentVideos.length > 1 && (
        <div className="absolute bottom-36 md:bottom-20 left-1/2 transform -translate-x-1/2 z-30">
          <div className="flex flex-col items-center gap-1 text-white/50">
            <ChevronUp className="w-5 h-5 animate-bounce" />
            <span className="text-xs">Swipe up</span>
          </div>
        </div>
      )}

      {/* Search Overlay */}
      {showSearchOverlay && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-60 flex flex-col">
          <div className="flex items-center gap-3 p-4 pt-12">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSearchOverlay(false)}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search videos, sounds, or creators"
                className="pl-10 pr-4 py-3 bg-gray-800 border-gray-600 text-white text-lg rounded-xl"
                autoFocus
              />
            </div>
          </div>

          {/* Search suggestions */}
          <div className="flex-1 p-4">
            {searchQuery ? (
              <div>
                <p className="text-gray-400 text-sm mb-4">
                  Search results for "{searchQuery}"
                </p>
                <p className="text-white">
                  No results found. Try a different search term.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-white font-semibold mb-3">Trending</h3>
                  <div className="space-y-2">
                    {["#crypto", "#dance", "#ai", "#tech", "#viral"].map(
                      (tag) => (
                        <div
                          key={tag}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10"
                        >
                          <Hash className="w-5 h-5 text-blue-400" />
                          <span className="text-white">{tag}</span>
                          <TrendingUp className="w-4 h-4 text-green-400 ml-auto" />
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            )}
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

export default TikTokStyleVideos;
