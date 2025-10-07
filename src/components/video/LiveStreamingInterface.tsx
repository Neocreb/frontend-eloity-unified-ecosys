// @ts-nocheck
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Users,
  MessageCircle,
  Heart,
  Share2,
  Settings,
  Monitor,
  Smartphone,
  Radio,
  Gift,
  Star,
  Eye,
  X,
  Send,
  Smile,
  DollarSign,
  Crown,
  Zap,
  Clock,
  Camera,
  StopCircle,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Filter,
  Music,
  Sparkles,
  AlertCircle,
  Check,
  ChevronDown,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface LiveStreamConfig {
  quality: "720p" | "1080p" | "4K";
  framerate: 30 | 60;
  bitrate: number;
  enableChat: boolean;
  enableDonations: boolean;
  moderationMode: "auto" | "manual" | "off";
  maxViewers: number;
  category: string;
}

interface LiveComment {
  id: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    isSubscriber: boolean;
    isModerator: boolean;
    isVip: boolean;
  };
  message: string;
  timestamp: Date;
  type: "message" | "donation" | "subscription" | "follow" | "system";
  amount?: number;
  isHighlighted?: boolean;
  reactions?: { emoji: string; count: number }[];
}

interface LiveViewer {
  id: string;
  username: string;
  avatar: string;
  joinedAt: Date;
  isSubscriber: boolean;
  isModerator: boolean;
}

interface Donation {
  id: string;
  user: {
    username: string;
    avatar: string;
  };
  amount: number;
  message: string;
  timestamp: Date;
  currency: string;
}

interface StreamStats {
  viewers: number;
  peakViewers: number;
  duration: number;
  totalDonations: number;
  newFollowers: number;
  chatMessages: number;
  engagement: number;
}

const mockComments: LiveComment[] = [
  {
    id: "1",
    user: {
      id: "user1",
      username: "sarah_fan",
      displayName: "Sarah Wilson",
      avatar: "https://i.pravatar.cc/150?u=sarah",
      isSubscriber: true,
      isModerator: false,
      isVip: true,
    },
    message: "Love this stream! 💖",
    timestamp: new Date(Date.now() - 1000 * 30),
    type: "message",
    reactions: [{ emoji: "❤️", count: 5 }],
  },
  {
    id: "2",
    user: {
      id: "user2",
      username: "generous_viewer",
      displayName: "Generous Viewer",
      avatar: "https://i.pravatar.cc/150?u=generous",
      isSubscriber: false,
      isModerator: false,
      isVip: false,
    },
    message: "Keep up the great work!",
    timestamp: new Date(Date.now() - 1000 * 60),
    type: "donation",
    amount: 10,
    isHighlighted: true,
  },
  {
    id: "3",
    user: {
      id: "user3",
      username: "new_follower",
      displayName: "New Follower",
      avatar: "https://i.pravatar.cc/150?u=newbie",
      isSubscriber: false,
      isModerator: false,
      isVip: false,
    },
    message: "just followed!",
    timestamp: new Date(Date.now() - 1000 * 90),
    type: "follow",
  },
];

interface LiveStreamingInterfaceProps {
  isStreaming?: boolean;
  isHost?: boolean;
  streamTitle?: string;
  streamCategory?: string;
  onStartStream?: (config: LiveStreamConfig) => void;
  onEndStream?: () => void;
}

const LiveStreamingInterface: React.FC<LiveStreamingInterfaceProps> = ({
  isStreaming = false,
  isHost = false,
  streamTitle = "Live Stream",
  streamCategory = "Just Chatting",
  onStartStream,
  onEndStream,
}) => {
  // Stream states
  const [isStreamActive, setIsStreamActive] = useState(isStreaming);
  const [isPaused, setIsPaused] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Chat states
  const [comments, setComments] = useState<LiveComment[]>(mockComments);
  const [newComment, setNewComment] = useState("");
  const [chatVisible, setChatVisible] = useState(true);
  const [onlyFollowers, setOnlyFollowers] = useState(false);
  const [slowMode, setSlowMode] = useState(0);

  // Stream config
  const [streamConfig, setStreamConfig] = useState<LiveStreamConfig>({
    quality: "1080p",
    framerate: 30,
    bitrate: 2500,
    enableChat: true,
    enableDonations: true,
    moderationMode: "auto",
    maxViewers: 1000,
    category: "Technology",
  });

  // UI states
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  // Mock data
  const [viewers, setViewers] = useState<LiveViewer[]>([]);
  const [viewerCount, setViewerCount] = useState(247);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [streamStats, setStreamStats] = useState<StreamStats>({
    viewers: 247,
    peakViewers: 543,
    duration: 2847, // seconds
    totalDonations: 125.5,
    newFollowers: 23,
    chatMessages: 1892,
    engagement: 78.4,
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isHost && isStreamActive) {
      initializeStream();
    }
    return () => {
      cleanup();
    };
  }, [isHost, isStreamActive]);

  const initializeStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: streamConfig.framerate },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Handle video element load to prevent playback issues
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current && isStreamActive) {
            videoRef.current.play().catch((error) => {
              if (error.name !== "AbortError") {
                console.error("Stream video play error:", error);
              }
            });
          }
        };
      }
    } catch (error) {
      console.error("Failed to initialize stream:", error);
      toast({
        title: "Stream Error",
        description: "Failed to access camera/microphone",
        variant: "destructive",
      });
    }
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  const handleStartStream = () => {
    if (onStartStream) {
      onStartStream(streamConfig);
    }
    setIsStreamActive(true);
    toast({
      title: "Stream Started",
      description: "You're now live!",
    });
  };

  const handleEndStream = () => {
    if (onEndStream) {
      onEndStream();
    }
    setIsStreamActive(false);
    cleanup();
    toast({
      title: "Stream Ended",
      description: "Your live stream has ended",
    });
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: LiveComment = {
      id: Date.now().toString(),
      user: {
        id: "current_user",
        username: isHost ? "host" : "viewer",
        displayName: isHost ? "Host" : "You",
        avatar: "https://i.pravatar.cc/150?u=current",
        isSubscriber: false,
        isModerator: isHost,
        isVip: false,
      },
      message: newComment,
      timestamp: new Date(),
      type: "message",
    };

    setComments((prev) => [...prev, comment]);
    setNewComment("");
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  return (
    <div className="fixed inset-0 bg-black text-white flex">
      {/* Main Stream Area */}
      <div className="flex-1 relative">
        {/* Video Stream */}
        <video
          ref={videoRef}
          autoPlay
          muted={isMuted}
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Stream Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50">
          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isStreamActive && (
                <Badge
                  variant="secondary"
                  className="bg-red-500/20 text-red-400 animate-pulse"
                >
                  🔴 LIVE
                </Badge>
              )}
              <Badge variant="secondary" className="bg-black/40 text-white">
                <Eye className="w-3 h-3 mr-1" />
                {formatNumber(viewerCount)}
              </Badge>
              <Badge variant="secondary" className="bg-black/40 text-white">
                <Clock className="w-3 h-3 mr-1" />
                {formatDuration(streamStats.duration)}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowStats(!showStats)}
                className="text-white bg-black/20 hover:bg-black/40"
              >
                <BarChart3 className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="text-white bg-black/20 hover:bg-black/40"
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5" />
                ) : (
                  <Maximize className="w-5 h-5" />
                )}
              </Button>
              {isHost && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSettings(true)}
                  className="text-white bg-black/20 hover:bg-black/40"
                >
                  <Settings className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>

          {/* Stream Info */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="space-y-2">
              <h1 className="text-xl font-bold">{streamTitle}</h1>
              <Badge
                variant="secondary"
                className="bg-purple-500/20 text-purple-400"
              >
                {streamCategory}
              </Badge>
            </div>
          </div>

          {/* Host Controls */}
          {isHost && isStreamActive && (
            <div className="absolute bottom-4 right-4 flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCameraOn(!isCameraOn)}
                className={cn(
                  "rounded-full",
                  isCameraOn
                    ? "bg-white/20 text-white"
                    : "bg-red-500/80 text-white",
                )}
              >
                {isCameraOn ? (
                  <Video className="w-5 h-5" />
                ) : (
                  <VideoOff className="w-5 h-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMicOn(!isMicOn)}
                className={cn(
                  "rounded-full",
                  isMicOn
                    ? "bg-white/20 text-white"
                    : "bg-red-500/80 text-white",
                )}
              >
                {isMicOn ? (
                  <Mic className="w-5 h-5" />
                ) : (
                  <MicOff className="w-5 h-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsPaused(!isPaused)}
                className="bg-white/20 text-white rounded-full"
              >
                {isPaused ? (
                  <Play className="w-5 h-5" />
                ) : (
                  <Pause className="w-5 h-5" />
                )}
              </Button>
              <Button
                variant="destructive"
                onClick={handleEndStream}
                className="rounded-full"
              >
                <StopCircle className="w-5 h-5 mr-2" />
                End Stream
              </Button>
            </div>
          )}
        </div>

        {/* Stream Stats Overlay */}
        {showStats && (
          <div className="absolute top-20 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 space-y-3 min-w-[200px]">
            <h3 className="font-semibold text-white">Live Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Current Viewers:</span>
                <span className="text-white">
                  {formatNumber(streamStats.viewers)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Peak Viewers:</span>
                <span className="text-white">
                  {formatNumber(streamStats.peakViewers)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">New Followers:</span>
                <span className="text-green-400">
                  +{streamStats.newFollowers}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Donations:</span>
                <span className="text-yellow-400">
                  ${streamStats.totalDonations}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Chat Messages:</span>
                <span className="text-blue-400">
                  {formatNumber(streamStats.chatMessages)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Engagement:</span>
                <span className="text-purple-400">
                  {streamStats.engagement}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Sidebar */}
      {chatVisible && (
        <div className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Live Chat
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setChatVisible(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {isHost && (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOnlyFollowers(!onlyFollowers)}
                  className={cn(
                    "text-xs",
                    onlyFollowers && "bg-purple-500/20 text-purple-400",
                  )}
                >
                  Followers Only
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSlowMode(slowMode > 0 ? 0 : 30)}
                  className={cn(
                    "text-xs",
                    slowMode > 0 && "bg-blue-500/20 text-blue-400",
                  )}
                >
                  Slow Mode {slowMode > 0 && `(${slowMode}s)`}
                </Button>
              </div>
            )}
          </div>

          {/* Chat Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className={cn(
                    "p-2 rounded",
                    comment.isHighlighted &&
                      "bg-yellow-500/10 border border-yellow-500/30",
                    comment.type === "donation" &&
                      "bg-green-500/10 border border-green-500/30",
                    comment.type === "follow" &&
                      "bg-blue-500/10 border border-blue-500/30",
                  )}
                >
                  <div className="flex items-start gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={comment.user.avatar} />
                      <AvatarFallback>
                        {comment.user.displayName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-1">
                        <span
                          className={cn(
                            "text-xs font-medium truncate",
                            comment.user.isModerator && "text-green-400",
                            comment.user.isSubscriber && "text-purple-400",
                            comment.user.isVip && "text-yellow-400",
                          )}
                        >
                          {comment.user.username}
                        </span>
                        {comment.user.isModerator && (
                          <Badge
                            variant="secondary"
                            className="bg-green-500/20 text-green-400 text-xs px-1 py-0"
                          >
                            MOD
                          </Badge>
                        )}
                        {comment.user.isSubscriber && (
                          <Crown className="w-3 h-3 text-purple-400" />
                        )}
                        {comment.user.isVip && (
                          <Star className="w-3 h-3 text-yellow-400" />
                        )}
                        {comment.type === "donation" && comment.amount && (
                          <Badge
                            variant="secondary"
                            className="bg-green-500/20 text-green-400 text-xs"
                          >
                            ${comment.amount}
                          </Badge>
                        )}
                        {comment.type === "follow" && (
                          <Badge
                            variant="secondary"
                            className="bg-blue-500/20 text-blue-400 text-xs"
                          >
                            NEW FOLLOWER
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-white break-words">
                        {comment.message}
                      </p>
                      {comment.reactions && comment.reactions.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {comment.reactions.map((reaction, index) => (
                            <span
                              key={index}
                              className="text-xs bg-gray-800 rounded px-1"
                            >
                              {reaction.emoji} {reaction.count}
                            </span>
                          ))}
                        </div>
                      )}
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(comment.timestamp)} ago
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-700">
            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Say something..."
                className="flex-1 bg-gray-800 border-gray-600 text-white"
                maxLength={500}
              />
              <Button type="submit" size="sm" disabled={!newComment.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Start Stream Button (for hosts not streaming) */}
      {isHost && !isStreamActive && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <Card className="bg-gray-900 border-gray-700 p-6 max-w-md">
            <CardHeader className="text-center">
              <Radio className="w-12 h-12 mx-auto mb-4 text-purple-400" />
              <CardTitle>Ready to Go Live?</CardTitle>
              <p className="text-gray-400">
                Start your live stream and connect with your audience
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Stream Title</label>
                <Input
                  placeholder="What's your stream about?"
                  className="bg-gray-800 border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select className="w-full p-2 bg-gray-800 border border-gray-600 rounded">
                  <option>Just Chatting</option>
                  <option>Gaming</option>
                  <option>Music</option>
                  <option>Art</option>
                  <option>Technology</option>
                  <option>Education</option>
                </select>
              </div>
              <Button
                onClick={handleStartStream}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Radio className="w-4 h-4 mr-2" />
                Start Live Stream
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stream Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Stream Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Quality</label>
                <select
                  value={streamConfig.quality}
                  onChange={(e) =>
                    setStreamConfig((prev) => ({
                      ...prev,
                      quality: e.target.value as any,
                    }))
                  }
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
                >
                  <option value="720p">720p (HD)</option>
                  <option value="1080p">1080p (Full HD)</option>
                  <option value="4K">4K (Ultra HD)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Frame Rate</label>
                <select
                  value={streamConfig.framerate}
                  onChange={(e) =>
                    setStreamConfig((prev) => ({
                      ...prev,
                      framerate: parseInt(e.target.value) as any,
                    }))
                  }
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
                >
                  <option value={30}>30 FPS</option>
                  <option value={60}>60 FPS</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Bitrate: {streamConfig.bitrate} kbps
              </label>
              <Slider
                value={[streamConfig.bitrate]}
                onValueChange={([value]) =>
                  setStreamConfig((prev) => ({ ...prev, bitrate: value }))
                }
                min={1000}
                max={6000}
                step={100}
                className="w-full"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Enable Chat</label>
                <Switch
                  checked={streamConfig.enableChat}
                  onCheckedChange={(checked) =>
                    setStreamConfig((prev) => ({
                      ...prev,
                      enableChat: checked,
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Enable Donations</label>
                <Switch
                  checked={streamConfig.enableDonations}
                  onCheckedChange={(checked) =>
                    setStreamConfig((prev) => ({
                      ...prev,
                      enableDonations: checked,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Moderation Mode</label>
              <select
                value={streamConfig.moderationMode}
                onChange={(e) =>
                  setStreamConfig((prev) => ({
                    ...prev,
                    moderationMode: e.target.value as any,
                  }))
                }
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
              >
                <option value="off">Off</option>
                <option value="auto">Auto Moderation</option>
                <option value="manual">Manual Review</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setShowSettings(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={() => setShowSettings(false)} className="flex-1">
                Save Settings
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LiveStreamingInterface;
