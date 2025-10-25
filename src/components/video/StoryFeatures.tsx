// @ts-nocheck
import React, { useState, useRef, useEffect } from "react";
import {
  Plus,
  X,
  Camera,
  Image as ImageIcon,
  Type,
  Palette,
  Music,
  Smile,
  Sticker,
  Timer,
  Eye,
  EyeOff,
  Settings,
  Download,
  Share2,
  Heart,
  MessageCircle,
  Send,
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipForward,
  SkipBack,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Clock,
  Users,
  Star,
  Zap,
  Sparkles,
  ArrowLeft,
  Check,
  Lock,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { requestCameraAccess, stopCameraStream } from "@/utils/cameraPermissions";

interface Story {
  id: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    verified: boolean;
  };
  content: {
    type: "image" | "video" | "text";
    url?: string;
    text?: string;
    backgroundColor?: string;
    textColor?: string;
    font?: string;
  };
  duration: number; // in seconds
  timestamp: Date;
  expiresAt: Date;
  isViewed: boolean;
  viewers: StoryViewer[];
  reactions: StoryReaction[];
  privacy: "public" | "followers" | "close_friends";
  music?: {
    title: string;
    artist: string;
    url: string;
  };
  stickers?: StorySticker[];
  textOverlays?: TextOverlay[];
}

interface StoryViewer {
  id: string;
  username: string;
  avatar: string;
  viewedAt: Date;
}

interface StoryReaction {
  id: string;
  user: {
    username: string;
    avatar: string;
  };
  emoji: string;
  timestamp: Date;
}

interface StorySticker {
  id: string;
  type:
    | "emoji"
    | "location"
    | "music"
    | "poll"
    | "question"
    | "quiz"
    | "countdown";
  x: number;
  y: number;
  scale: number;
  rotation: number;
  data: any;
}

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  font: string;
  backgroundColor?: string;
  animation?: string;
}

interface StoryCreatorConfig {
  duration: number;
  privacy: "public" | "followers" | "close_friends";
  allowReplies: boolean;
  hideViewers: boolean;
  saveToGallery: boolean;
}

const mockStories: Story[] = [
  {
    id: "1",
    user: {
      id: "user1",
      username: "sarah_creator",
      displayName: "Sarah Wilson",
      avatar: "https://i.pravatar.cc/150?u=sarah",
      verified: true,
    },
    content: {
      type: "image",
      url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
    },
    duration: 5,
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 23.5),
    isViewed: false,
    viewers: [],
    reactions: [],
    privacy: "public",
    textOverlays: [
      {
        id: "1",
        text: "Beautiful sunset! 🌅",
        x: 50,
        y: 80,
        fontSize: 24,
        color: "#ffffff",
        font: "Arial",
        backgroundColor: "rgba(0,0,0,0.5)",
      },
    ],
  },
  {
    id: "2",
    user: {
      id: "user2",
      username: "tech_guru",
      displayName: "Tech Guru",
      avatar: "https://i.pravatar.cc/150?u=tech",
      verified: false,
    },
    content: {
      type: "video",
      url: "https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4",
    },
    duration: 15,
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 23),
    isViewed: true,
    viewers: [
      {
        id: "viewer1",
        username: "fan123",
        avatar: "https://i.pravatar.cc/150?u=fan123",
        viewedAt: new Date(Date.now() - 1000 * 60 * 30),
      },
    ],
    reactions: [
      {
        id: "reaction1",
        user: {
          username: "fan123",
          avatar: "https://i.pravatar.cc/150?u=fan123",
        },
        emoji: "❤️",
        timestamp: new Date(Date.now() - 1000 * 60 * 25),
      },
    ],
    privacy: "followers",
    music: {
      title: "Tech Beats",
      artist: "Electronic Mix",
      url: "/music/tech-beats.mp3",
    },
  },
];

const backgroundGradients = [
  "linear-gradient(45deg, #FF6B6B, #4ECDC4)",
  "linear-gradient(45deg, #A8E6CF, #FFD93D)",
  "linear-gradient(45deg, #FF8A80, #FFD180)",
  "linear-gradient(45deg, #CE93D8, #90CAF9)",
  "linear-gradient(45deg, #81C784, #FFF176)",
  "linear-gradient(45deg, #FF7043, #FFAB40)",
];

const textFonts = [
  { name: "Default", value: "Arial, sans-serif" },
  { name: "Serif", value: "Georgia, serif" },
  { name: "Mono", value: "Courier New, monospace" },
  { name: "Script", value: "Brush Script MT, cursive" },
  { name: "Impact", value: "Impact, fantasy" },
];

interface StoryFeaturesProps {
  stories?: Story[];
  currentUserId?: string;
  onCreateStory?: (story: Partial<Story>) => void;
  onViewStory?: (storyId: string) => void;
}

const StoryFeatures: React.FC<StoryFeaturesProps> = ({
  stories = mockStories,
  currentUserId = "current_user",
  onCreateStory,
  onViewStory,
}) => {
  const [showCreator, setShowCreator] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [creatorMode, setCreatorMode] = useState<"camera" | "gallery" | "text">(
    "camera",
  );
  const [creatorConfig, setCreatorConfig] = useState<StoryCreatorConfig>({
    duration: 5,
    privacy: "public",
    allowReplies: true,
    hideViewers: false,
    saveToGallery: true,
  });

  // Story creator states
  const [capturedMedia, setCapturedMedia] = useState<string | null>(null);
  const [textContent, setTextContent] = useState("");
  const [selectedBackground, setSelectedBackground] = useState(
    backgroundGradients[0],
  );
  const [textColor, setTextColor] = useState("#ffffff");
  const [selectedFont, setSelectedFont] = useState(textFonts[0]);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [stickers, setStickers] = useState<StorySticker[]>([]);

  // Viewer states
  const [replyText, setReplyText] = useState("");
  const [showReactions, setShowReactions] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Auto-progress for story viewer
  useEffect(() => {
    if (showViewer && isPlaying) {
      const currentStory = stories[currentStoryIndex];
      if (currentStory) {
        intervalRef.current = setInterval(() => {
          setProgress((prev) => {
            const newProgress = prev + 100 / (currentStory.duration * 10);
            if (newProgress >= 100) {
              nextStory();
              return 0;
            }
            return newProgress;
          });
        }, 100);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [showViewer, isPlaying, currentStoryIndex]);

  // Handle video playback state changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlaybackChange = async () => {
      try {
        if (isPlaying && showViewer) {
          if (video.paused) {
            await video.play();
          }
        } else {
          if (!video.paused) {
            video.pause();
          }
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Story video playback error:", error);
        }
      }
    };

    handlePlaybackChange();
  }, [isPlaying, showViewer, currentStoryIndex]);

  const initializeCamera = async () => {
    try {
      const result = await requestCameraAccess({
        video: { facingMode: "user", width: 720, height: 1280 },
        audio: false,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (result.stream) {
        streamRef.current = result.stream;
        if (cameraRef.current) {
          cameraRef.current.srcObject = result.stream;
        }
      }
    } catch (error: any) {
      toast({
        title: "Camera Error",
        description: error.message || "Unable to access camera",
        variant: "destructive",
      });
    }
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  const capturePhoto = () => {
    if (cameraRef.current) {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (context) {
        canvas.width = cameraRef.current.videoWidth;
        canvas.height = cameraRef.current.videoHeight;
        context.drawImage(cameraRef.current, 0, 0);
        const imageData = canvas.toDataURL("image/jpeg");
        setCapturedMedia(imageData);
        cleanup();
      }
    }
  };

  const nextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      setShowViewer(false);
      setCurrentStoryIndex(0);
      setProgress(0);
    }
  };

  const prevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
      setProgress(0);
    }
  };

  const handleStoryView = (index: number) => {
    setCurrentStoryIndex(index);
    setShowViewer(true);
    setProgress(0);
    if (onViewStory) {
      onViewStory(stories[index].id);
    }
  };

  const handleCreateStory = () => {
    const newStory: Partial<Story> = {
      user: {
        id: currentUserId,
        username: "you",
        displayName: "You",
        avatar: "https://i.pravatar.cc/150?u=current",
        verified: false,
      },
      content:
        creatorMode === "text"
          ? {
              type: "text",
              text: textContent,
              backgroundColor: selectedBackground,
              textColor: textColor,
              font: selectedFont.value,
            }
          : {
              type: capturedMedia?.includes("data:video") ? "video" : "image",
              url: capturedMedia || undefined,
            },
      duration: creatorConfig.duration,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      privacy: creatorConfig.privacy,
      textOverlays,
      stickers,
    };

    if (onCreateStory) {
      onCreateStory(newStory);
    }

    // Reset creator state
    setShowCreator(false);
    setCapturedMedia(null);
    setTextContent("");
    setTextOverlays([]);
    setStickers([]);
    cleanup();

    toast({
      title: "Story Created",
      description: "Your story has been shared!",
    });
  };

  const addTextOverlay = () => {
    if (!textContent.trim()) return;

    const overlay: TextOverlay = {
      id: Date.now().toString(),
      text: textContent,
      x: 50,
      y: 50,
      fontSize: 24,
      color: textColor,
      font: selectedFont.value,
    };

    setTextOverlays((prev) => [...prev, overlay]);
    setTextContent("");
  };

  const sendReaction = (emoji: string) => {
    // Add reaction logic here
    toast({
      title: "Reaction Sent",
      description: `Sent ${emoji} reaction`,
    });
    setShowReactions(false);
  };

  const sendReply = () => {
    if (!replyText.trim()) return;

    // Add reply logic here
    toast({
      title: "Reply Sent",
      description: "Your message was sent to the creator",
    });
    setReplyText("");
  };

  const currentStory = stories[currentStoryIndex];

  return (
    <>
      {/* Story Timeline */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {/* Add Story Button */}
        <div
          onClick={() => setShowCreator(true)}
          className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
        >
          <Plus className="w-6 h-6 text-white" />
        </div>

        {/* User Stories */}
        {stories.map((story, index) => (
          <div
            key={story.id}
            onClick={() => handleStoryView(index)}
            className="flex-shrink-0 relative cursor-pointer hover:scale-105 transition-transform"
          >
            <div
              className={cn(
                "w-16 h-16 rounded-full p-0.5",
                story.isViewed
                  ? "bg-gray-300"
                  : "bg-gradient-to-br from-purple-500 to-pink-500",
              )}
            >
              <Avatar className="w-full h-full border-2 border-white">
                <AvatarImage src={story.user.avatar} />
                <AvatarFallback>{story.user.displayName[0]}</AvatarFallback>
              </Avatar>
            </div>
            <div className="absolute -bottom-1 -right-1">
              {story.user.verified && (
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Story Creator */}
      <Dialog open={showCreator} onOpenChange={setShowCreator}>
        <DialogContent className="max-w-md w-[95vw] h-[90vh] bg-black border-gray-800 p-0">
          <VisuallyHidden>
            <DialogTitle>Create Story</DialogTitle>
          </VisuallyHidden>

          <div className="h-full flex flex-col">
            {/* Creator Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowCreator(false);
                  cleanup();
                }}
                className="text-white"
              >
                <X className="w-5 h-5" />
              </Button>
              <div className="flex gap-2">
                <Button
                  variant={creatorMode === "camera" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setCreatorMode("camera");
                    initializeCamera();
                  }}
                >
                  <Camera className="w-4 h-4 mr-1" />
                  Camera
                </Button>
                <Button
                  variant={creatorMode === "gallery" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCreatorMode("gallery")}
                >
                  <ImageIcon className="w-4 h-4 mr-1" />
                  Gallery
                </Button>
                <Button
                  variant={creatorMode === "text" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCreatorMode("text")}
                >
                  <Type className="w-4 h-4 mr-1" />
                  Text
                </Button>
              </div>
              <Button
                onClick={handleCreateStory}
                disabled={!capturedMedia && !textContent.trim()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Share
              </Button>
            </div>

            {/* Creator Content */}
            <div className="flex-1 relative">
              {creatorMode === "camera" && !capturedMedia && (
                <div className="relative h-full">
                  <video
                    ref={cameraRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <Button
                    onClick={capturePhoto}
                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full bg-white"
                  >
                    <div className="w-12 h-12 rounded-full border-2 border-gray-400" />
                  </Button>
                </div>
              )}

              {creatorMode === "text" && (
                <div
                  className="h-full flex items-center justify-center p-8"
                  style={{ background: selectedBackground }}
                >
                  <div className="text-center">
                    <Textarea
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      placeholder="What's on your mind?"
                      className="bg-transparent border-none text-center text-2xl resize-none"
                      style={{
                        color: textColor,
                        fontFamily: selectedFont.value,
                      }}
                    />
                  </div>
                </div>
              )}

              {capturedMedia && (
                <div className="relative h-full">
                  <img
                    src={capturedMedia}
                    alt="Captured"
                    className="w-full h-full object-cover"
                  />

                  {/* Text overlays */}
                  {textOverlays.map((overlay) => (
                    <div
                      key={overlay.id}
                      className="absolute"
                      style={{
                        left: `${overlay.x}%`,
                        top: `${overlay.y}%`,
                        transform: "translate(-50%, -50%)",
                        color: overlay.color,
                        fontSize: `${overlay.fontSize}px`,
                        fontFamily: overlay.font,
                        backgroundColor: overlay.backgroundColor,
                        padding: overlay.backgroundColor ? "4px 8px" : "0",
                        borderRadius: overlay.backgroundColor ? "4px" : "0",
                      }}
                    >
                      {overlay.text}
                    </div>
                  ))}

                  {/* Stickers */}
                  {stickers.map((sticker) => (
                    <div
                      key={sticker.id}
                      className="absolute"
                      style={{
                        left: `${sticker.x}%`,
                        top: `${sticker.y}%`,
                        transform: `translate(-50%, -50%) scale(${sticker.scale}) rotate(${sticker.rotation}deg)`,
                      }}
                    >
                      {sticker.type === "emoji" && (
                        <span className="text-4xl">{sticker.data.emoji}</span>
                      )}
                      {sticker.type === "location" && (
                        <div className="bg-black/60 text-white px-2 py-1 rounded text-sm">
                          📍 {sticker.data.location}
                        </div>
                      )}
                      {sticker.type === "music" && (
                        <div className="bg-black/60 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
                          <Music className="w-3 h-3" />
                          {sticker.data.title}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Creator Tools */}
            <div className="p-4 border-t border-gray-800 space-y-4">
              {creatorMode === "text" && (
                <div className="flex gap-2 overflow-x-auto">
                  {backgroundGradients.map((gradient, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedBackground(gradient)}
                      className={cn(
                        "w-10 h-10 rounded cursor-pointer border-2",
                        selectedBackground === gradient
                          ? "border-white"
                          : "border-transparent",
                      )}
                      style={{ background: gradient }}
                    />
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-white text-sm">
                  Duration: {creatorConfig.duration}s
                </span>
                <Slider
                  value={[creatorConfig.duration]}
                  onValueChange={([value]) =>
                    setCreatorConfig((prev) => ({ ...prev, duration: value }))
                  }
                  min={3}
                  max={15}
                  step={1}
                  className="w-32"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white text-sm">Privacy</span>
                <select
                  value={creatorConfig.privacy}
                  onChange={(e) =>
                    setCreatorConfig((prev) => ({
                      ...prev,
                      privacy: e.target.value as any,
                    }))
                  }
                  className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                >
                  <option value="public">Public</option>
                  <option value="followers">Followers</option>
                  <option value="close_friends">Close Friends</option>
                </select>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Story Viewer */}
      <Dialog open={showViewer} onOpenChange={setShowViewer}>
        <DialogContent className="max-w-md w-[95vw] h-[90vh] bg-black border-none p-0">
          <VisuallyHidden>
            <DialogTitle>View Story</DialogTitle>
          </VisuallyHidden>

          {currentStory && (
            <div className="h-full relative">
              {/* Progress bars */}
              <div className="absolute top-2 left-2 right-2 z-10 flex gap-1">
                {stories.map((_, index) => (
                  <div key={index} className="flex-1 h-0.5 bg-white/30 rounded">
                    <div
                      className="h-full bg-white rounded transition-all duration-100"
                      style={{
                        width:
                          index < currentStoryIndex
                            ? "100%"
                            : index === currentStoryIndex
                              ? `${progress}%`
                              : "0%",
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Story header */}
              <div className="absolute top-8 left-2 right-2 z-10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={currentStory.user.avatar} />
                    <AvatarFallback>
                      {currentStory.user.displayName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="text-white text-sm font-medium">
                      {currentStory.user.username}
                    </span>
                    <div className="text-white/70 text-xs">
                      {formatDistanceToNow(currentStory.timestamp)} ago
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {currentStory.privacy !== "public" && (
                    <Badge
                      variant="secondary"
                      className="bg-black/40 text-white text-xs"
                    >
                      {currentStory.privacy === "followers" ? (
                        <Users className="w-3 h-3" />
                      ) : (
                        <Lock className="w-3 h-3" />
                      )}
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="text-white"
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowViewer(false)}
                    className="text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Story content */}
              <div className="h-full relative">
                {currentStory.content.type === "image" && (
                  <img
                    src={currentStory.content.url}
                    alt="Story"
                    className="w-full h-full object-cover"
                  />
                )}

                {currentStory.content.type === "video" && (
                  <video
                    ref={videoRef}
                    src={currentStory.content.url}
                    muted={isMuted}
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                    onLoadedData={() => {
                      // Auto-play when video is loaded
                      if (videoRef.current && isPlaying) {
                        videoRef.current.play().catch((error) => {
                          if (error.name !== "AbortError") {
                            console.error("Story video play error:", error);
                          }
                        });
                      }
                    }}
                  />
                )}

                {currentStory.content.type === "text" && (
                  <div
                    className="h-full flex items-center justify-center p-8"
                    style={{
                      background: currentStory.content.backgroundColor,
                      color: currentStory.content.textColor,
                      fontFamily: currentStory.content.font,
                    }}
                  >
                    <div className="text-center text-2xl font-medium">
                      {currentStory.content.text}
                    </div>
                  </div>
                )}

                {/* Text overlays */}
                {currentStory.textOverlays?.map((overlay) => (
                  <div
                    key={overlay.id}
                    className="absolute"
                    style={{
                      left: `${overlay.x}%`,
                      top: `${overlay.y}%`,
                      transform: "translate(-50%, -50%)",
                      color: overlay.color,
                      fontSize: `${overlay.fontSize}px`,
                      fontFamily: overlay.font,
                      backgroundColor: overlay.backgroundColor,
                      padding: overlay.backgroundColor ? "4px 8px" : "0",
                      borderRadius: overlay.backgroundColor ? "4px" : "0",
                    }}
                  >
                    {overlay.text}
                  </div>
                ))}

                {/* Navigation areas */}
                <div
                  className="absolute left-0 top-0 w-1/3 h-full z-20"
                  onClick={prevStory}
                />
                <div
                  className="absolute right-0 top-0 w-1/3 h-full z-20"
                  onClick={nextStory}
                />
                <div
                  className="absolute left-1/3 top-0 w-1/3 h-full z-20"
                  onClick={() => setIsPlaying(!isPlaying)}
                />
              </div>

              {/* Story reactions and reply */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowReactions(!showReactions)}
                    className="text-white"
                  >
                    <Heart className="w-5 h-5" />
                  </Button>

                  <Input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Send message..."
                    className="flex-1 bg-black/40 border-white/20 text-white placeholder-white/60"
                    onKeyPress={(e) => e.key === "Enter" && sendReply()}
                  />

                  <Button
                    onClick={sendReply}
                    disabled={!replyText.trim()}
                    size="icon"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>

                {/* Quick reactions */}
                {showReactions && (
                  <div className="flex justify-center gap-2 mt-2">
                    {["❤️", "😂", "😮", "😢", "😡", "👏"].map((emoji) => (
                      <Button
                        key={emoji}
                        variant="ghost"
                        onClick={() => sendReaction(emoji)}
                        className="text-2xl hover:scale-125 transition-transform"
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              {/* Volume control for videos */}
              {currentStory.content.type === "video" && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMuted(!isMuted)}
                  className="absolute top-16 right-2 text-white"
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StoryFeatures;
