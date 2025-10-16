import React, { useState, useRef, useEffect } from "react";
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
  User,
  Camera,
  Mic,
  Timer,
  Sparkles,
  Music2,
  ArrowLeft,
  X,
  Upload,
  Video as VideoIcon,
  Type,
  Palette,
  Zap,
  Play,
  Pause,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/utils/utils";
import { SmartContentRecommendations } from "@/components/ai/SmartContentRecommendations";

interface VideoData {
  id: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    verified: boolean;
  };
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
  duration: number;
  stats: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
  hashtags: string[];
  music: {
    title: string;
    artist: string;
    url: string;
  };
  timestamp: string;
}

const mockVideos: VideoData[] = [
  {
    id: "1",
    user: {
      id: "user1",
      username: "creative_creator",
      displayName: "Creative Creator",
      avatar: "/placeholder.svg?height=40&width=40",
      verified: true,
    },
    title: "Amazing sunset timelapse",
    description:
      "Captured this beautiful sunset from my balcony. The colors were absolutely incredible! 🌅 #sunset #timelapse #nature",
    videoUrl: "/placeholder-video.mp4",
    thumbnail: "/placeholder.svg?height=600&width=400",
    duration: 30,
    stats: {
      views: 125400,
      likes: 8900,
      comments: 234,
      shares: 67,
    },
    hashtags: ["sunset", "timelapse", "nature", "beautiful", "sky"],
    music: {
      title: "Calm Vibes",
      artist: "Peaceful Sounds",
      url: "/music/calm-vibes.mp3",
    },
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    user: {
      id: "user2",
      username: "tech_reviewer",
      displayName: "Tech Reviewer",
      avatar: "/placeholder.svg?height=40&width=40",
      verified: false,
    },
    title: "iPhone 15 Pro Review",
    description:
      "Here's my honest review of the iPhone 15 Pro after using it for a week. The camera improvements are insane! 📱✨ #iPhone15Pro #TechReview #Apple",
    videoUrl: "/placeholder-video.mp4",
    thumbnail: "/placeholder.svg?height=600&width=400",
    duration: 45,
    stats: {
      views: 89200,
      likes: 5600,
      comments: 342,
      shares: 89,
    },
    hashtags: ["iPhone15Pro", "TechReview", "Apple", "smartphone"],
    music: {
      title: "Tech Beat",
      artist: "Electronic Vibes",
      url: "/music/tech-beat.mp3",
    },
    timestamp: "5 hours ago",
  },
  {
    id: "3",
    user: {
      id: "user3",
      username: "fitness_guru",
      displayName: "Fitness Guru",
      avatar: "/placeholder.svg?height=40&width=40",
      verified: true,
    },
    title: "5-Minute Morning Workout",
    description:
      "Start your day right with this quick but effective morning workout routine! No equipment needed 💪 #MorningWorkout #Fitness #Health",
    videoUrl: "/placeholder-video.mp4",
    thumbnail: "/placeholder.svg?height=600&width=400",
    duration: 60,
    stats: {
      views: 234500,
      likes: 18700,
      comments: 892,
      shares: 234,
    },
    hashtags: ["MorningWorkout", "Fitness", "Health", "NoEquipment"],
    music: {
      title: "Pump It Up",
      artist: "Workout Mix",
      url: "/music/pump-it-up.mp3",
    },
    timestamp: "1 day ago",
  },
  {
    id: "4",
    user: {
      id: "user4",
      username: "food_lover",
      displayName: "Food Lover",
      avatar: "/placeholder.svg?height=40&width=40",
      verified: false,
    },
    title: "60-Second Pasta Recipe",
    description:
      "The easiest and most delicious pasta recipe you'll ever make! Perfect for busy weeknights 🍝 #Pasta #QuickRecipe #FoodHack",
    videoUrl: "/placeholder-video.mp4",
    thumbnail: "/placeholder.svg?height=600&width=400",
    duration: 60,
    stats: {
      views: 156800,
      likes: 12400,
      comments: 567,
      shares: 145,
    },
    hashtags: ["Pasta", "QuickRecipe", "FoodHack", "Cooking"],
    music: {
      title: "Kitchen Vibes",
      artist: "Cooking Sounds",
      url: "/music/kitchen-vibes.mp3",
    },
    timestamp: "2 days ago",
  },
  {
    id: "5",
    user: {
      id: "user5",
      username: "travel_explorer",
      displayName: "Travel Explorer",
      avatar: "/placeholder.svg?height=40&width=40",
      verified: true,
    },
    title: "Hidden Gems in Tokyo",
    description:
      "Found some incredible hidden spots in Tokyo that most tourists don't know about! 🏯🇯🇵 #Tokyo #Travel #HiddenGems",
    videoUrl: "/placeholder-video.mp4",
    thumbnail: "/placeholder.svg?height=600&width=400",
    duration: 90,
    stats: {
      views: 298600,
      likes: 24500,
      comments: 1234,
      shares: 456,
    },
    hashtags: ["Tokyo", "Travel", "HiddenGems", "Japan"],
    music: {
      title: "Tokyo Nights",
      artist: "City Sounds",
      url: "/music/tokyo-nights.mp3",
    },
    timestamp: "3 days ago",
  },
];

interface VideoCardProps {
  video: VideoData;
  isActive: boolean;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, isActive }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.play().catch(console.error);
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [isActive]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch(console.error);
        setIsPlaying(true);
      }
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
      >
        <source src={video.videoUrl} type="video/mp4" />
      </video>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />

      {/* Play/Pause overlay for touch */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            size="icon"
            variant="ghost"
            className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 border-none"
            onClick={togglePlay}
          >
            <Play className="w-8 h-8 text-white fill-white" />
          </Button>
        </div>
      )}

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
            </div>
          </div>
        </div>

        {/* Right side - action buttons */}
        <div className="flex flex-col items-center justify-end gap-4 md:gap-6 p-2 md:p-4 pb-28 md:pb-8">
          {/* Like button */}
          <div className="flex flex-col items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                "w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 hover:bg-white/30 border-none",
                isLiked && "bg-red-500/80 hover:bg-red-500",
              )}
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart
                className={cn(
                  "w-5 h-5 md:w-6 md:h-6",
                  isLiked ? "fill-white text-white" : "text-white",
                )}
              />
            </Button>
            <span className="text-white text-[10px] md:text-xs font-medium">
              {formatNumber(video.stats.likes + (isLiked ? 1 : 0))}
            </span>
          </div>

          {/* Comment button */}
          <div className="flex flex-col items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 hover:bg-white/30 border-none"
            >
              <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </Button>
            <span className="text-white text-[10px] md:text-xs font-medium">
              {formatNumber(video.stats.comments)}
            </span>
          </div>

          {/* Share button */}
          <div className="flex flex-col items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 hover:bg-white/30 border-none"
            >
              <Share className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </Button>
            <span className="text-white text-[10px] md:text-xs font-medium">
              {formatNumber(video.stats.shares)}
            </span>
          </div>

          {/* Bookmark button */}
          <Button
            size="icon"
            variant="ghost"
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 hover:bg-white/30 border-none"
          >
            <Bookmark className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </Button>

          {/* More options */}
          <Button
            size="icon"
            variant="ghost"
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 hover:bg-white/30 border-none"
          >
            <MoreHorizontal className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </Button>
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

      {/* Views count */}
      <div className="absolute top-4 left-4">
        <Badge
          variant="secondary"
          className="bg-black/40 text-white border-none text-[10px] md:text-xs px-2 py-1"
        >
          {formatNumber(video.stats.views)} views
        </Badge>
      </div>

      {/* Timestamp */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
        <Badge
          variant="secondary"
          className="bg-black/40 text-white border-none text-[10px] md:text-xs px-2 py-1"
        >
          {video.timestamp}
        </Badge>
      </div>
    </div>
  );
};

const EnhancedVideos: React.FC = () => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
      </Helmet>

      {/* Full-screen video container */}
      <div
        ref={containerRef}
        className="h-full w-full overflow-y-auto snap-y snap-mandatory"
        style={{
          scrollBehavior: "smooth",
          paddingTop: 0,
          paddingBottom: "80px", // Account for mobile navigation
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

      {/* Create Button */}
      <Button
        onClick={() => setIsCreatorOpen(true)}
        className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-50 bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white rounded-full w-12 h-12 md:w-16 md:h-16 shadow-lg"
      >
        <Plus className="h-6 w-6 md:h-8 md:w-8" />
      </Button>

      {/* Creator Modal */}
      <Dialog open={isCreatorOpen} onOpenChange={setIsCreatorOpen}>
        <DialogContent className="max-w-2xl bg-black border border-gray-800 rounded-lg p-4">
          <VisuallyHidden>
            <DialogTitle>Create Video</DialogTitle>
          </VisuallyHidden>
          <div className="p-4">
            <div className="text-center">
              <VideoIcon className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h2 className="text-xl font-bold mb-2 text-white">
                Create Video
              </h2>
              <p className="text-gray-400 mb-6">
                Upload and share your creative content with the community
              </p>
              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full text-white border-gray-600 hover:bg-gray-800"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Video
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-white border-gray-600 hover:bg-gray-800"
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

export default EnhancedVideos;
