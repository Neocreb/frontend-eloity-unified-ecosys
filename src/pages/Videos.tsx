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

const mockVideos: VideoData[] = [
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
    id: "2",
    user: {
      id: "2",
      username: "tech_trader",
      displayName: "Tech Trader",
      avatar: "https://i.pravatar.cc/150?img=2",
      verified: false,
      followerCount: 89456,
    },
    description:
      "Day trading tips that actually work! Follow for more 💰 Using AI to predict market movements #trading #stocks #daytrading #ai",
    music: {
      title: "Success Vibes",
      artist: "Motivation Mix",
      id: "success-vibes-1",
      duration: 45,
    },
    stats: {
      likes: 8900,
      comments: 567,
      shares: 234,
      views: "890K",
      saves: 1890,
    },
    hashtags: ["trading", "stocks", "daytrading", "money", "ai"],
    videoUrl:
      "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400",
    duration: 45,
    timestamp: "5h",
    category: "Finance & Trading",
    allowDuets: true,
    allowComments: true,
    hasCaption: false,
    isSponsored: true,
  },
  {
    id: "3",
    user: {
      id: "3",
      username: "nft_creator",
      displayName: "NFT Creator",
      avatar: "https://i.pravatar.cc/150?img=3",
      verified: true,
    },
    description:
      "Just dropped my latest NFT collection! Link in bio 🎨 #nft #digitalart #opensea",
    music: {
      title: "Digital Dreams",
      artist: "Electronic Beats",
    },
    stats: {
      likes: 12600,
      comments: 445,
      shares: 789,
      views: "1.5M",
    },
    hashtags: ["nft", "digitalart", "opensea", "blockchain"],
    videoUrl:
      "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=400",
    duration: 25,
  },
  {
    id: "4",
    user: {
      id: "4",
      username: "defi_guru",
      displayName: "DeFi Guru",
      avatar: "https://i.pravatar.cc/150?img=4",
      verified: true,
    },
    description:
      "Yield farming strategies for 2024! This is not financial advice 📈 #defi #yield #farming",
    music: {
      title: "Future Finance",
      artist: "Crypto Sounds",
    },
    stats: {
      likes: 9800,
      comments: 321,
      shares: 156,
      views: "750K",
    },
    hashtags: ["defi", "yield", "farming", "protocol"],
    videoUrl:
      "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400",
    duration: 60,
  },
  {
    id: "5",
    user: {
      id: "5",
      username: "web3_dev",
      displayName: "Web3 Developer",
      avatar: "https://i.pravatar.cc/150?img=5",
      verified: false,
    },
    description:
      "Building the future of the internet! Check out my latest dApp 🌐 #web3 #blockchain #dapp",
    music: {
      title: "Code & Create",
      artist: "Dev Beats",
    },
    stats: {
      likes: 7200,
      comments: 189,
      shares: 95,
      views: "420K",
    },
    hashtags: ["web3", "blockchain", "dapp", "coding"],
    videoUrl:
      "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=400",
    duration: 40,
  },
];

const VideoCard: React.FC<{
  video: VideoData;
  isActive: boolean;
  showControls?: boolean;
  onVideoElementReady?: (element: HTMLVideoElement | null) => void;
}> = ({ video, isActive, showControls = true, onVideoElementReady }) => {
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const isMobile = useIsMobile();
  const { safePlay, safePause, togglePlayback } = useVideoPlayback();
  const { user } = useAuth();

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
        <div className="flex flex-col items-center justify-end gap-3 md:gap-4 p-2 md:p-4 pb-28 md:pb-8">
          <InteractiveFeatures
            videoId={video.id}
            isLiveStream={video.isLiveStream}
            allowDuets={video.allowDuets}
            allowComments={video.allowComments}
          />

          {/* Enhanced Sharing Hub */}
          <AdvancedSharingHub
            videoId={video.id}
            videoTitle={video.description}
            videoUrl={video.videoUrl}
            videoThumbnail={video.thumbnail}
            videoDuration={video.duration}
            currentUser={user ? {
              id: user.id,
              name: user.displayName || user.username,
              avatar: user.avatar || 'https://i.pravatar.cc/150?u=' + user.id
            } : undefined}
          />

          {/* Video Monetization Hub */}
          <VideoMonetizationHub
            videoId={video.id}
            creatorId={video.user.id}
            videoMetrics={{
              views: parseInt(video.stats.views.replace(/[^0-9]/g, '')) || 0,
              likes: video.stats.likes,
              comments: video.stats.comments,
              shares: video.stats.shares,
              duration: video.duration
            }}
            onTipSent={(amount) => {
              toast({
                title: "Tip Sent!",
                description: `You sent $${amount.toFixed(2)} to support this creator`,
              });
            }}
            onSubscribe={(tier) => {
              toast({
                title: "Subscription Active",
                description: `You subscribed to ${tier} tier`,
              });
            }}
            onPurchaseMerchandise={(itemId) => {
              toast({
                title: "Purchase Successful",
                description: "Item added to your cart",
              });
            }}
          />
        </div>
      </div>

      {/* Enhanced Controls Bar */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
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
          className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/30 hover:bg-black/50 border-none"
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
          className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/30 hover:bg-black/50 border-none"
          onClick={() => setShowAdvancedControls(!showAdvancedControls)}
        >
          <Settings className="w-4 h-4 md:w-5 md:h-5 text-white" />
        </Button>
      </div>

      {/* Advanced Controls Panel */}
      {showAdvancedControls && (
        <div className="absolute top-20 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 space-y-3 min-w-[200px] z-10">
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
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [isAdvancedRecorderOpen, setIsAdvancedRecorderOpen] = useState(false);
  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentVideoElement, setCurrentVideoElement] = useState<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Create video list with interstitial ads
  useEffect(() => {
    const videosWithAds = [];
    let adCounter = 0;

    for (let i = 0; i < mockVideos.length; i++) {
      videosWithAds.push(mockVideos[i]);

      // Insert interstitial ad after every 4 videos
      if ((i + 1) % adSettings.interstitialFrequency === 0 && adSettings.enableAds) {
        adCounter++;
        videosWithAds.push({
          id: `interstitial-ad-${adCounter}`,
          isAd: true,
          adType: 'interstitial'
        } as any);
      }
    }

    setVideos(videosWithAds);
  }, []);

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
        newIndex !== currentVideoIndex &&
        newIndex >= 0 &&
        newIndex < videos.length
      ) {
        setCurrentVideoIndex(newIndex);
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [currentVideoIndex, videos.length]);

  const handleVideoCreated = (videoFile: File, metadata: any) => {
    // Create new video entry
    const newVideo: VideoData = {
      id: `new-${Date.now()}`,
      user: {
        id: "current-user",
        username: "you",
        displayName: "You",
        avatar: "https://i.pravatar.cc/150?u=current",
        verified: false,
        followerCount: 0,
      },
      description: "My new creation! 🎥✨",
      music: metadata.sound || {
        title: "Original Sound",
        artist: "You",
        id: "original",
        duration: metadata.duration || 30,
      },
      stats: {
        likes: 0,
        comments: 0,
        shares: 0,
        views: "0",
        saves: 0,
      },
      hashtags: ["NewVideo", "Creative", "Original"],
      videoUrl: URL.createObjectURL(videoFile),
      thumbnail:
        "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=400",
      duration: metadata.duration || 30,
      timestamp: "now",
      category: "Entertainment",
      allowDuets: true,
      allowComments: true,
      hasCaption: false,
    };

    setVideos((prev) => [newVideo, ...prev]);
    setIsAdvancedRecorderOpen(false);
    setCurrentVideoIndex(0);
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

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden z-10">
      <Helmet>
        <title>Videos | Softchat</title>
        <meta
          name="description"
          content="Discover, create, and share amazing videos with advanced tools"
        />
      </Helmet>

      {/* Enhanced Header */}
      {showControls && !isFullscreen && (
        <div className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSearchOverlay(true)}
                className="text-white hover:bg-white/20"
              >
                <Search className="w-5 h-5" />
              </Button>
              <Badge variant="secondary" className="bg-black/40 text-white">
                {currentVideoIndex + 1} / {videos.length}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20"
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5" />
                ) : (
                  <Maximize className="w-5 h-5" />
                )}
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
          paddingTop: 0,
          paddingBottom: isMobile ? "80px" : "20px",
        }}
        onClick={() => setShowControls(!showControls)}
      >
        {videos.map((video, index) => {
          // Render interstitial ad
          if ((video as any).isAd) {
            return (
              <div key={video.id} className="h-screen w-full bg-black snap-start snap-always flex items-center justify-center p-4">
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

          // Render regular video
          return (
            <VideoCard
              key={video.id}
              video={video}
              isActive={index === currentVideoIndex}
              showControls={showControls}
              onVideoElementReady={index === currentVideoIndex ? setCurrentVideoElement : undefined}
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

      {/* Creator Dashboard */}
      <Dialog open={isDashboardOpen} onOpenChange={setIsDashboardOpen}>
        <DialogContent className="max-w-6xl w-[95vw] h-[90vh] bg-gray-900 border-gray-700 p-0">
          <VisuallyHidden>
            <DialogTitle>Creator Dashboard</DialogTitle>
          </VisuallyHidden>
          <div className="h-full overflow-auto p-6">
            <div className="space-y-6">
              <CreatorDashboard />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Videos;
