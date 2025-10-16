import React, { useState, useRef, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import {
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  MoreHorizontal,
  Play,
  Volume2,
  VolumeX,
  Plus,
  Upload,
  Camera,
  Music,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { cn } from "@/utils/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface VideoData {
  id: string;
  user: {
    username: string;
    displayName: string;
    avatar: string;
    verified: boolean;
  };
  description: string;
  hashtags: string[];
  music: {
    title: string;
    artist: string;
  };
  stats: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  thumbnail: string;
  videoUrl: string;
  timestamp: string;
}

const mockVideos: VideoData[] = [
  {
    id: "1",
    user: {
      username: "creator1",
      displayName: "Sarah Wilson",
      avatar: "/placeholder.jpg",
      verified: true,
    },
    description:
      "Amazing sunset timelapse from the mountains! 🌅 Nature is incredible #sunset #mountains #timelapse",
    hashtags: ["sunset", "mountains", "timelapse", "nature"],
    music: {
      title: "Epic Cinematic",
      artist: "AudioLibrary",
    },
    stats: {
      likes: 12500,
      comments: 834,
      shares: 392,
      views: 45600,
    },
    thumbnail: "/placeholder.jpg",
    videoUrl: "/placeholder-video.mp4",
    timestamp: "2h",
  },
  {
    id: "2",
    user: {
      username: "foodie_chef",
      displayName: "Chef Marcus",
      avatar: "/placeholder.jpg",
      verified: false,
    },
    description:
      "Quick 5-minute pasta recipe that'll blow your mind! 🍝 Perfect for busy weeknights #cooking #pasta #quickrecipes",
    hashtags: ["cooking", "pasta", "quickrecipes", "food"],
    music: {
      title: "Upbeat Cooking",
      artist: "FoodBeats",
    },
    stats: {
      likes: 8900,
      comments: 567,
      shares: 289,
      views: 32100,
    },
    thumbnail: "/placeholder.jpg",
    videoUrl: "/placeholder-video.mp4",
    timestamp: "5h",
  },
  // Add more mock videos...
];

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
};

interface VideoCardProps {
  video: VideoData;
  isActive: boolean;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, isActive }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(isActive);
  const [isMuted, setIsMuted] = useState(true);
  const [showDescription, setShowDescription] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (videoRef.current) {
      if (isActive && isPlaying) {
        videoRef.current.play().catch(console.error);
      } else {
        videoRef.current.pause();
      }
    }
  }, [isActive, isPlaying]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(console.error);
      }
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const description = showDescription
    ? video.description
    : video.description.length > (isMobile ? 80 : 100)
      ? video.description.substring(0, isMobile ? 80 : 100) + "..."
      : video.description;

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
        style={{ touchAction: "manipulation" }}
      >
        <source src={video.videoUrl} type="video/mp4" />
      </video>

      {/* Gradient overlays for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent" />

      {/* Play/Pause overlay */}
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

      {/* Content Layout */}
      <div className="absolute inset-0 flex">
        {/* Left side - User info and description */}
        <div className="flex-1 flex flex-col justify-end">
          <div className="p-3 md:p-4 pb-20 md:pb-24 space-y-2 md:space-y-3">
            {/* User info */}
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 md:w-12 md:h-12 border-2 border-white/30 flex-shrink-0">
                <AvatarImage src={video.user.avatar} />
                <AvatarFallback className="bg-gray-600 text-white">
                  {video.user.displayName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold text-sm md:text-base truncate">
                    @{video.user.username}
                  </span>
                  {video.user.verified && (
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>
                <div className="text-white/80 text-xs md:text-sm">
                  {video.user.displayName}
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="bg-transparent border-white/40 text-white hover:bg-white/20 text-xs px-3 py-1 h-8"
              >
                Follow
              </Button>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <p className="text-white text-sm md:text-base leading-relaxed">
                {description}
                {video.description.length > (isMobile ? 80 : 100) && (
                  <button
                    onClick={() => setShowDescription(!showDescription)}
                    className="text-white/70 ml-2 text-sm hover:text-white transition-colors"
                  >
                    {showDescription ? "Show less" : "more"}
                  </button>
                )}
              </p>

              {/* Hashtags */}
              <div className="flex flex-wrap gap-1">
                {video.hashtags.slice(0, isMobile ? 2 : 3).map((tag) => (
                  <span key={tag} className="text-blue-300 text-xs md:text-sm">
                    #{tag}
                  </span>
                ))}
                {video.hashtags.length > (isMobile ? 2 : 3) && (
                  <span className="text-white/60 text-xs md:text-sm">
                    +{video.hashtags.length - (isMobile ? 2 : 3)} more
                  </span>
                )}
              </div>

              {/* Music info */}
              <div className="flex items-center gap-2 text-white/80 text-xs md:text-sm">
                <Music className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">
                  {video.music.title} - {video.music.artist}
                </span>
              </div>

              {/* Video stats */}
              <div className="flex items-center gap-4 text-white/60 text-xs">
                <span>{formatNumber(video.stats.views)} views</span>
                <span>{video.timestamp}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Action buttons */}
        <div className="flex flex-col items-center justify-end gap-3 md:gap-4 p-2 md:p-4 pb-20 md:pb-24">
          {/* Like button */}
          <div className="flex flex-col items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                "w-11 h-11 md:w-12 md:h-12 rounded-full border-none transition-all duration-200",
                isLiked
                  ? "bg-red-500/90 hover:bg-red-500 scale-110"
                  : "bg-white/20 hover:bg-white/30 backdrop-blur-sm",
              )}
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart
                className={cn(
                  "w-5 h-5 md:w-6 md:h-6 transition-all duration-200",
                  isLiked ? "fill-white text-white scale-110" : "text-white",
                )}
              />
            </Button>
            <span className="text-white text-xs font-medium drop-shadow-sm">
              {formatNumber(video.stats.likes + (isLiked ? 1 : 0))}
            </span>
          </div>

          {/* Comment button */}
          <div className="flex flex-col items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/20 hover:bg-white/30 border-none backdrop-blur-sm"
            >
              <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </Button>
            <span className="text-white text-xs font-medium drop-shadow-sm">
              {formatNumber(video.stats.comments)}
            </span>
          </div>

          {/* Share button */}
          <div className="flex flex-col items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/20 hover:bg-white/30 border-none backdrop-blur-sm"
            >
              <Share className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </Button>
            <span className="text-white text-xs font-medium drop-shadow-sm">
              {formatNumber(video.stats.shares)}
            </span>
          </div>

          {/* Bookmark button */}
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "w-11 h-11 md:w-12 md:h-12 rounded-full border-none transition-all duration-200",
              isBookmarked
                ? "bg-yellow-500/90 hover:bg-yellow-500"
                : "bg-white/20 hover:bg-white/30 backdrop-blur-sm",
            )}
            onClick={() => setIsBookmarked(!isBookmarked)}
          >
            <Bookmark
              className={cn(
                "w-5 h-5 md:w-6 md:h-6 transition-all duration-200",
                isBookmarked ? "fill-white text-white" : "text-white",
              )}
            />
          </Button>

          {/* More options */}
          <Button
            size="icon"
            variant="ghost"
            className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/20 hover:bg-white/30 border-none backdrop-blur-sm"
          >
            <MoreHorizontal className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </Button>
        </div>
      </div>

      {/* Volume control */}
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 border-none backdrop-blur-sm"
        onClick={toggleMute}
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5 text-white" />
        ) : (
          <Volume2 className="w-5 h-5 text-white" />
        )}
      </Button>

      {/* Scroll indicators for mobile */}
      {isMobile && (
        <>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="flex flex-col items-center gap-2 opacity-30">
              <ChevronUp className="w-6 h-6 text-white animate-bounce" />
              <span className="text-white text-xs">Swipe</span>
              <ChevronDown className="w-6 h-6 text-white animate-bounce" />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const ImprovedVideos: React.FC = () => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const videoHeight = window.innerHeight;
      const scrollTop = container.scrollTop;
      const newIndex = Math.round(scrollTop / videoHeight);

      if (
        newIndex !== currentVideoIndex &&
        newIndex >= 0 &&
        newIndex < mockVideos.length
      ) {
        setCurrentVideoIndex(newIndex);
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [currentVideoIndex]);

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden z-10">
      <Helmet>
        <title>Videos | Eloity</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </Helmet>

      {/* Video container with improved mobile handling */}
      <div
        ref={containerRef}
        className="h-full w-full overflow-y-auto snap-y snap-mandatory overscroll-y-contain"
        style={{
          scrollBehavior: "smooth",
          paddingBottom: isMobile ? "80px" : "20px",
          // Prevent elastic scrolling on iOS
          WebkitOverflowScrolling: "touch",
          // Improve scroll performance
          willChange: "scroll-position",
        }}
      >
        {mockVideos.map((video, index) => (
          <VideoCard
            key={video.id}
            video={video}
            isActive={index === currentVideoIndex}
          />
        ))}
      </div>

      {/* Create Button with improved mobile positioning */}
      <Button
        onClick={() => setIsCreatorOpen(true)}
        className={cn(
          "fixed z-50 bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110",
          isMobile
            ? "bottom-24 right-4 w-12 h-12"
            : "bottom-8 right-8 w-16 h-16",
        )}
        aria-label="Create new video"
      >
        <Plus className={cn(isMobile ? "h-6 w-6" : "h-8 w-8")} />
      </Button>

      {/* Improved Creator Modal */}
      <Dialog open={isCreatorOpen} onOpenChange={setIsCreatorOpen}>
        <DialogContent
          className={cn(
            "bg-black border border-gray-800 rounded-lg",
            isMobile ? "w-[95vw] max-w-sm mx-2 p-4" : "max-w-2xl p-6",
          )}
        >
          <VisuallyHidden>
            <DialogTitle>Create Video</DialogTitle>
          </VisuallyHidden>
          <div className={cn(isMobile ? "p-2" : "p-4")}>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full flex items-center justify-center">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h2
                className={cn(
                  "font-bold mb-2 text-white",
                  isMobile ? "text-lg" : "text-xl",
                )}
              >
                Create Video
              </h2>
              <p
                className={cn(
                  "text-gray-400 mb-6",
                  isMobile ? "text-sm" : "text-base",
                )}
              >
                Upload and share your creative content with the community
              </p>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full text-white border-gray-600 hover:bg-gray-800 transition-colors"
                  size={isMobile ? "sm" : "default"}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Video
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-white border-gray-600 hover:bg-gray-800 transition-colors"
                  size={isMobile ? "sm" : "default"}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Record Video
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImprovedVideos;
