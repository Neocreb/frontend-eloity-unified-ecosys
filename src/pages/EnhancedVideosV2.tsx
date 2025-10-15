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
  Filter,
  TrendingUp,
  Sparkles,
  Users,
  Video,
  Camera,
  X,
  ArrowLeft,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Settings,
  Grid3X3,
  Shuffle,
  Clock,
  Eye,
  Target,
  Hash,
  Globe,
  Star,
  Award,
  Zap,
  Download,
  ExternalLink,
  Flag,
  ChevronUp,
  ChevronDown,
  Mic,
  MicOff,
  Maximize,
  Minimize,
  Calendar,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useVideoPlayback } from "@/hooks/use-video-playback";
import AdvancedVideoRecorder from "@/components/video/AdvancedVideoRecorder";
import ContentDiscoveryEngine from "@/components/video/ContentDiscoveryEngine";
import InteractiveFeatures from "@/components/video/InteractiveFeatures";
import CreatorDashboard from "@/components/video/CreatorDashboard";

interface EnhancedVideoData {
  id: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    verified: boolean;
    followerCount: number;
  };
  description: string;
  music: {
    title: string;
    artist: string;
    id: string;
    duration: number;
  };
  stats: {
    likes: number;
    comments: number;
    shares: number;
    views: string;
    saves: number;
  };
  hashtags: string[];
  videoUrl: string;
  thumbnail: string;
  duration: number;
  timestamp: string;
  category: string;
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

const mockEnhancedVideos: EnhancedVideoData[] = [
  {
    id: "1",
    user: {
      id: "1",
      username: "tech_innovator",
      displayName: "Tech Innovator",
      avatar: "https://i.pravatar.cc/150?img=1",
      verified: true,
      followerCount: 234567,
    },
    description:
      "Mind-blowing AI art creation process! 🤖🎨 Using the latest neural networks to generate stunning visuals. Who else is experimenting with AI? #AIArt #TechInnovation #DigitalArt #Future",
    music: {
      title: "Futuristic Beats",
      artist: "TechnoVibes",
      id: "music1",
      duration: 45,
    },
    stats: {
      likes: 25400,
      comments: 1892,
      shares: 3445,
      views: "2.8M",
      saves: 8934,
    },
    hashtags: ["AIArt", "TechInnovation", "DigitalArt", "Future", "CreativeAI"],
    videoUrl:
      "https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400",
    duration: 45,
    timestamp: "2h",
    category: "Technology",
    allowDuets: true,
    allowComments: true,
    hasCaption: true,
    challenge: {
      id: "ai-art-challenge",
      title: "AI Art Challenge",
      hashtag: "AIArtChallenge2024",
    },
  },
  {
    id: "2",
    user: {
      id: "2",
      username: "culinary_master",
      displayName: "Chef Maria",
      avatar: "https://i.pravatar.cc/150?img=2",
      verified: true,
      followerCount: 892456,
    },
    description:
      "30-second pasta that will change your life! 🍝✨ This technique from my nonna's kitchen has been perfected over generations. Save this recipe! #QuickPasta #ItalianCooking #FoodHacks #Delicious",
    music: {
      title: "Italian Kitchen",
      artist: "Cooking Sounds",
      id: "music2",
      duration: 30,
    },
    stats: {
      likes: 89200,
      comments: 5670,
      shares: 12890,
      views: "5.2M",
      saves: 45600,
    },
    hashtags: [
      "QuickPasta",
      "ItalianCooking",
      "FoodHacks",
      "Delicious",
      "Recipe",
    ],
    videoUrl:
      "https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
    duration: 30,
    timestamp: "4h",
    category: "Food & Cooking",
    allowDuets: true,
    allowComments: true,
    hasCaption: true,
    isSponsored: true,
  },
  {
    id: "3",
    user: {
      id: "3",
      username: "fitness_guru",
      displayName: "Fitness Pro Alex",
      avatar: "https://i.pravatar.cc/150?img=3",
      verified: false,
      followerCount: 156789,
    },
    description:
      "HIIT workout that burns calories even after you stop! 🔥💪 No equipment needed, just 15 minutes. Who's joining the challenge? #HIIT #FitnessChallenge #HomeWorkout #BurnCalories",
    music: {
      title: "High Energy Workout",
      artist: "Fitness Beats",
      id: "music3",
      duration: 60,
    },
    stats: {
      likes: 34567,
      comments: 2234,
      shares: 1890,
      views: "1.8M",
      saves: 12340,
    },
    hashtags: [
      "HIIT",
      "FitnessChallenge",
      "HomeWorkout",
      "BurnCalories",
      "Motivation",
    ],
    videoUrl:
      "https://assets.mixkit.co/videos/preview/mixkit-woman-running-through-the-city-32952-large.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
    duration: 60,
    timestamp: "6h",
    category: "Sports & Fitness",
    allowDuets: true,
    allowComments: true,
    hasCaption: false,
  },
  {
    id: "4",
    user: {
      id: "4",
      username: "travel_wanderer",
      displayName: "Travel Wanderer",
      avatar: "https://i.pravatar.cc/150?img=4",
      verified: true,
      followerCount: 445678,
    },
    description:
      "Hidden gem in Japan that tourists don't know about! 🏯🌸 This secret temple has the most incredible views. Adding to my Japan travel guide series! #Japan #HiddenGems #Travel #Culture",
    music: {
      title: "Peaceful Japan",
      artist: "Traditional Sounds",
      id: "music4",
      duration: 75,
    },
    stats: {
      likes: 67890,
      comments: 4567,
      shares: 8901,
      views: "3.4M",
      saves: 23456,
    },
    hashtags: ["Japan", "HiddenGems", "Travel", "Culture", "Adventure"],
    videoUrl:
      "https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400",
    duration: 75,
    timestamp: "12h",
    category: "Travel",
    isLiveStream: false,
    allowDuets: true,
    allowComments: true,
    hasCaption: true,
  },
  {
    id: "5",
    user: {
      id: "5",
      username: "live_creator",
      displayName: "Live Creator",
      avatar: "https://i.pravatar.cc/150?img=5",
      verified: true,
      followerCount: 123456,
    },
    description:
      "🔴 LIVE: Creating digital art in real-time! Join me as I paint this landscape from scratch. Drop your suggestions in the comments! #LiveArt #DigitalPainting #Interactive #CreateWithMe",
    music: {
      title: "Creative Flow",
      artist: "Ambient Sounds",
      id: "music5",
      duration: 180,
    },
    stats: {
      likes: 12890,
      comments: 890,
      shares: 234,
      views: "45.6K",
      saves: 1234,
    },
    hashtags: [
      "LiveArt",
      "DigitalPainting",
      "Interactive",
      "CreateWithMe",
      "ArtStream",
    ],
    videoUrl:
      "https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400",
    duration: 180,
    timestamp: "Live",
    category: "Art & Design",
    isLiveStream: true,
    allowDuets: false,
    allowComments: true,
    hasCaption: false,
  },
];

const EnhancedVideosV2: React.FC = () => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videos, setVideos] = useState<EnhancedVideoData[]>(mockEnhancedVideos);
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);
  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [activeCreativeMode, setActiveCreativeMode] = useState<
    "create" | "discover" | "dashboard" | null
  >(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

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

  const handleVideoCreated = useCallback((videoFile: File, metadata: any) => {
    // Create new video entry
    const newVideo: EnhancedVideoData = {
      id: `new-${Date.now()}`,
      user: {
        id: "current-user",
        username: "current_user",
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
    setIsRecorderOpen(false);
    setCurrentVideoIndex(0);
  }, []);

  const handleHashtagSelect = useCallback((hashtag: string) => {
    setSearchQuery(`#${hashtag}`);
    setIsDiscoveryOpen(false);
    // Filter videos by hashtag logic here
  }, []);

  const handleSoundSelect = useCallback((soundId: string) => {
    setIsDiscoveryOpen(false);
    setIsRecorderOpen(true);
    // Pre-select sound in recorder
  }, []);

  const handleChallengeSelect = useCallback((challengeId: string) => {
    setIsDiscoveryOpen(false);
    setIsRecorderOpen(true);
    // Pre-configure challenge in recorder
  }, []);

  const navigateToVideo = (direction: "next" | "prev") => {
    const container = containerRef.current;
    if (!container) return;

    let newIndex;
    if (direction === "next" && currentVideoIndex < videos.length - 1) {
      newIndex = currentVideoIndex + 1;
    } else if (direction === "prev" && currentVideoIndex > 0) {
      newIndex = currentVideoIndex - 1;
    } else {
      return;
    }

    setCurrentVideoIndex(newIndex);
    container.scrollTo({
      top: newIndex * window.innerHeight,
      behavior: "smooth",
    });
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

  const currentVideo = videos[currentVideoIndex];

  if (!currentVideo) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden z-10">
      <Helmet>
        <title>Enhanced Videos | Softchat</title>
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
              {currentVideo.isLiveStream && (
                <Badge
                  variant="secondary"
                  className="bg-red-500/20 text-red-400 animate-pulse"
                >
                  🔴 LIVE
                </Badge>
              )}
              {currentVideo.hasCaption && (
                <Badge
                  variant="secondary"
                  className="bg-blue-500/20 text-blue-400"
                >
                  CC
                </Badge>
              )}
              {currentVideo.isSponsored && (
                <Badge
                  variant="secondary"
                  className="bg-yellow-500/20 text-yellow-400"
                >
                  Sponsored
                </Badge>
              )}
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
          {/* Cross-Navigation Quick Access */}
          <div className="px-4 pb-2">
            <div className="flex items-center gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("/live-streaming", "_blank")}
                className="bg-red-600/20 border-red-400 text-red-300 hover:bg-red-600/30 flex items-center gap-2"
              >
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                Go Live
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("/events", "_blank")}
                className="bg-blue-600/20 border-blue-400 text-blue-300 hover:bg-blue-600/30 flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Events
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("/premium", "_blank")}
                className="bg-purple-600/20 border-purple-400 text-purple-300 hover:bg-purple-600/30 flex items-center gap-2"
              >
                <Crown className="w-4 h-4" />
                Premium
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Video Container */}
      <div
        ref={containerRef}
        className="h-full w-full overflow-y-auto snap-y snap-mandatory"
        style={{
          scrollBehavior: "smooth",
          paddingBottom: isMobile ? "80px" : "20px",
        }}
        onClick={() => setShowControls(!showControls)}
      >
        {videos.map((video, index) => (
          <VideoCard
            key={video.id}
            video={video}
            isActive={index === currentVideoIndex}
            showControls={showControls}
            playbackSpeed={playbackSpeed}
            onSpeedChange={setPlaybackSpeed}
          />
        ))}
      </div>

      {/* Navigation Controls */}
      {showControls && !isMobile && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 flex flex-col gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateToVideo("prev")}
            disabled={currentVideoIndex === 0}
            className="text-white bg-black/20 hover:bg-black/40 rounded-full"
          >
            <ChevronUp className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateToVideo("next")}
            disabled={currentVideoIndex === videos.length - 1}
            className="text-white bg-black/20 hover:bg-black/40 rounded-full"
          >
            <ChevronDown className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Enhanced Create Button */}
      <div className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-50 flex flex-col gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => { const navigate = (window as any).__reactNavigate || null; if (navigate) navigate('/app/unified-creator-studio'); else window.location.href = '/app/unified-creator-studio'; }}
          className="w-12 h-12 rounded-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30"
        >
          <Award className="w-6 h-6" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsDiscoveryOpen(true)}
          className="w-12 h-12 rounded-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30"
        >
          <Sparkles className="w-6 h-6" />
        </Button>

        <Button
          onClick={() => setIsRecorderOpen(true)}
          className="bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white rounded-full w-14 h-14 shadow-lg transition-all duration-200 hover:scale-110"
        >
          <Plus className="h-7 w-7" />
        </Button>
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

            {searchQuery && (
              <Card className="mt-4 bg-gray-900 border-gray-700">
                <CardContent className="p-4">
                  <p className="text-gray-400 text-sm">
                    Search results for "{searchQuery}"
                  </p>
                  <div className="mt-2 text-white">
                    {/* Search results would go here */}
                    <p className="text-sm">
                      No results found. Try a different search term.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Advanced Video Recorder */}
      {isRecorderOpen && (
        <AdvancedVideoRecorder
          onClose={() => setIsRecorderOpen(false)}
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
            <CreatorDashboard />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface VideoCardProps {
  video: EnhancedVideoData;
  isActive: boolean;
  showControls: boolean;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({
  video,
  isActive,
  showControls,
  playbackSpeed,
  onSpeedChange,
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(isActive);
  const [showMore, setShowMore] = useState(false);
  const [showSpeedControl, setShowSpeedControl] = useState(false);

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
        // Set playback speed first
        video.playbackRate = playbackSpeed;

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
  }, [isActive, isPlaying, playbackSpeed, safePlay, safePause]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const togglePlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    await togglePlayback(video, isPlaying, setIsPlaying);
  }, [isPlaying, togglePlayback]);

  const description = video.description;
  const truncatedDescription =
    description.length > (isMobile ? 80 : 120)
      ? description.substring(0, isMobile ? 80 : 120) + "..."
      : description;

  return (
    <div className="relative h-screen w-full bg-black snap-start snap-always overflow-hidden">
      {/* Video Element */}
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

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />

      {/* Challenge Banner */}
      {video.challenge && showControls && (
        <div className="absolute top-20 left-4 right-4 z-30">
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-400" />
              <span className="text-white text-sm font-medium">
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

      {/* Play/Pause Indicator */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <Button
            size="icon"
            variant="ghost"
            className="w-20 h-20 rounded-full bg-white/20 hover:bg-white/30 border-none backdrop-blur-sm"
            onClick={togglePlay}
          >
            <Play className="w-10 h-10 text-white fill-white ml-1" />
          </Button>
        </div>
      )}

      {/* Content Layout */}
      <div className="absolute inset-0 flex">
        {/* Left Side - Content Info */}
        <div className="flex-1 flex flex-col justify-end p-4 pb-24 md:pb-8">
          {/* User Info */}
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-12 h-12 border-2 border-white/30">
              <AvatarImage src={video.user.avatar} />
              <AvatarFallback>{video.user.displayName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold text-sm">
                  @{video.user.username}
                </span>
                {video.user.verified && (
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
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
              <div className="text-white/80 text-xs">
                {video.user.displayName} •{" "}
                {formatNumber(video.user.followerCount)} followers
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="bg-transparent border-white/40 text-white hover:bg-white/20 text-xs px-3"
            >
              Follow
            </Button>
          </div>

          {/* Description */}
          <div className="space-y-2 mb-3">
            <p className="text-white text-sm leading-relaxed">
              {showMore ? description : truncatedDescription}
              {description.length > (isMobile ? 80 : 120) && (
                <button
                  onClick={() => setShowMore(!showMore)}
                  className="text-white/70 ml-2 text-sm hover:text-white"
                >
                  {showMore ? "less" : "more"}
                </button>
              )}
            </p>

            {/* Hashtags */}
            <div className="flex flex-wrap gap-1">
              {video.hashtags.slice(0, isMobile ? 2 : 4).map((tag) => (
                <Button
                  key={tag}
                  variant="ghost"
                  size="sm"
                  className="text-blue-300 text-xs p-0 h-auto hover:text-blue-200"
                  onClick={() => {
                    /* Handle hashtag click */
                  }}
                >
                  #{tag}
                </Button>
              ))}
            </div>

            {/* Music Info */}
            <div className="flex items-center gap-2 text-white/80 text-xs">
              <Music className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">
                {video.music.title} - {video.music.artist}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/60 text-xs p-0 h-auto hover:text-white"
              >
                Use Sound
              </Button>
            </div>

            {/* Video Stats */}
            <div className="flex items-center gap-4 text-white/60 text-xs">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {video.stats.views} views
              </span>
              <span>{video.timestamp}</span>
              <Badge
                variant="secondary"
                className="bg-black/40 text-white text-xs"
              >
                {video.category}
              </Badge>
            </div>
          </div>
        </div>

        {/* Right Side - Action Buttons */}
        <div className="flex flex-col items-center justify-end gap-4 p-4 pb-24 md:pb-8">
          <InteractiveFeatures
            videoId={video.id}
            isLiveStream={video.isLiveStream}
            allowDuets={video.allowDuets}
            allowComments={video.allowComments}
          />
        </div>
      </div>

      {/* Enhanced Controls */}
      {showControls && (
        <>
          {/* Volume Control */}
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 border-none backdrop-blur-sm"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-white" />
            ) : (
              <Volume2 className="w-5 h-5 text-white" />
            )}
          </Button>

          {/* Speed Control */}
          <div className="absolute top-16 right-4">
            <Button
              size="sm"
              variant="ghost"
              className="bg-black/40 hover:bg-black/60 text-white border-none backdrop-blur-sm text-xs"
              onClick={() => setShowSpeedControl(!showSpeedControl)}
            >
              {playbackSpeed}x
            </Button>

            {showSpeedControl && (
              <div className="absolute top-full right-0 mt-2 bg-black/80 backdrop-blur-sm rounded-lg p-2 space-y-1">
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                  <Button
                    key={speed}
                    size="sm"
                    variant={playbackSpeed === speed ? "default" : "ghost"}
                    className="w-full text-xs"
                    onClick={() => {
                      onSpeedChange(speed);
                      setShowSpeedControl(false);
                    }}
                  >
                    {speed}x
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Duration Indicator */}
          <div className="absolute bottom-4 left-4">
            <Badge
              variant="secondary"
              className="bg-black/40 text-white text-xs"
            >
              {video.duration}s
            </Badge>
          </div>
        </>
      )}
    </div>
  );
};

export default EnhancedVideosV2;
