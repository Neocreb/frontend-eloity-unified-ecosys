import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Heart,
  Share2,
  Users,
  Send,
  Settings,
  MessageCircle,
  Eye,
  Gift,
  ThumbsUp,
} from "lucide-react";
import {
  LiveStream,
  StreamMessage,
  liveStreamingService,
} from "@/services/liveStreamingService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface LiveStreamPlayerProps {
  stream: LiveStream;
  autoplay?: boolean;
  showChat?: boolean;
  className?: string;
}

export function LiveStreamPlayer({
  stream,
  autoplay = false,
  showChat = true,
  className,
}: LiveStreamPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(100);
  const [chatMessages, setChatMessages] = useState<StreamMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [localViewerCount, setLocalViewerCount] = useState(stream.viewerCount);

  const videoRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { user } = useAuth();
  const { toast } = useToast();

  // Load chat messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const messages = await liveStreamingService.getStreamMessages(
          stream.id,
        );
        setChatMessages(messages);
      } catch (error) {
        console.error("Failed to load chat messages:", error);
      }
    };

    loadMessages();

    // Simulate real-time messages
    const messageInterval = setInterval(
      () => {
        const mockMessages = [
          "Great stream! 🔥",
          "Love this content",
          "Thanks for the tips!",
          "Amazing work!",
          "Keep it up! 💪",
          "This is so helpful",
          "Wow! 😍",
          "Learning so much",
        ];

        const mockUsers = [
          {
            name: "CryptoFan",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user1",
          },
          {
            name: "TechGuru",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user2",
          },
          {
            name: "StreamLover",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user3",
          },
          {
            name: "Viewer123",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user4",
          },
        ];

        const randomUser =
          mockUsers[Math.floor(Math.random() * mockUsers.length)];
        const randomMessage =
          mockMessages[Math.floor(Math.random() * mockMessages.length)];

        const newMsg: StreamMessage = {
          id: `msg-${Date.now()}`,
          streamId: stream.id,
          userId: `user-${Date.now()}`,
          username: randomUser.name,
          userAvatar: randomUser.avatar,
          message: randomMessage,
          timestamp: new Date(),
          type: "message",
        };

        setChatMessages((prev) => [...prev, newMsg]);
      },
      5000 + Math.random() * 10000,
    ); // Random interval between 5-15 seconds

    return () => clearInterval(messageInterval);
  }, [stream.id]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Join stream when component mounts
  useEffect(() => {
    if (user) {
      liveStreamingService.joinStream(stream.id, user.id);
      setLocalViewerCount((prev) => prev + 1);
    }

    return () => {
      if (user) {
        liveStreamingService.leaveStream(stream.id, user.id);
      }
    };
  }, [stream.id, user]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume / 100;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const handleFullscreen = () => {
    if (!isFullscreen && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      const message: Omit<StreamMessage, "id" | "timestamp"> = {
        streamId: stream.id,
        userId: user.id,
        username: user.name,
        userAvatar: user.avatar || "",
        message: newMessage,
        type: "message",
      };

      const sentMessage = await liveStreamingService.sendMessage(
        stream.id,
        message,
      );
      setChatMessages((prev) => [...prev, sentMessage]);
      setNewMessage("");
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLike = async () => {
    setIsLiked(!isLiked);
    try {
      await liveStreamingService.reactToStream(stream.id, "like");
      toast({
        title: isLiked ? "Removed like" : "Liked stream",
        description: isLiked ? "Like removed" : "You liked this stream",
      });
    } catch (error) {
      console.error("Failed to react to stream:", error);
    }
  };

  const handleShare = async () => {
    try {
      await liveStreamingService.reactToStream(stream.id, "share");

      if (navigator.share) {
        await navigator.share({
          title: stream.title,
          text: stream.description,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied!",
          description: "Stream link copied to clipboard.",
        });
      }
    } catch (error) {
      console.error("Failed to share stream:", error);
    }
  };

  const formatViewerCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div
      ref={containerRef}
      className={cn("flex flex-col lg:flex-row gap-4 h-full", className)}
    >
      {/* Video Player */}
      <div className="flex-1 relative bg-black rounded-lg overflow-hidden">
        {/* Mock video placeholder - in real app this would be actual video stream */}
        <div className="relative w-full aspect-video bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
          <img
            src={stream.thumbnailUrl}
            alt={stream.title}
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{stream.title}</h3>
              <p className="text-sm opacity-80">Live Stream Simulation</p>
            </div>
          </div>
        </div>

        {/* Video Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePlayPause}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleMuteToggle}
                className="text-white hover:bg-white/20"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </Button>

              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-white text-sm">
                <Users className="w-4 h-4" />
                <span>{formatViewerCount(localViewerCount)}</span>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleFullscreen}
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

        {/* Stream Info Overlay */}
        <div className="absolute top-4 left-4 right-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border-2 border-white">
                <AvatarImage src={stream.streamerAvatar} />
                <AvatarFallback>
                  {stream.streamerName?.charAt(0) || "S"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="text-white font-semibold text-sm">
                  {stream.streamerName}
                </h4>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="text-xs">
                    LIVE
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {stream.category}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLike}
                className={cn(
                  "text-white hover:bg-white/20",
                  isLiked && "text-red-500",
                )}
              >
                <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                className="text-white hover:bg-white/20"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Section */}
      {showChat && (
        <Card className="w-full lg:w-80 flex flex-col h-96 lg:h-full">
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                <span className="font-semibold text-sm">Live Chat</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Eye className="w-3 h-3" />
                <span>{formatViewerCount(localViewerCount)}</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <ScrollArea className="flex-1 px-3">
              <div className="space-y-3 pb-4">
                {chatMessages.map((message) => (
                  <div key={message.id} className="flex items-start gap-2">
                    <Avatar className="w-6 h-6 flex-shrink-0">
                      <AvatarImage src={message.userAvatar} />
                      <AvatarFallback className="text-xs">
                        {message.username?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-xs text-blue-600">
                          {message.username}
                        </span>
                        {message.type === "system" && (
                          <Badge variant="outline" className="text-xs">
                            System
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm break-words">{message.message}</p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t p-3">
              <div className="flex items-center gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Say something..."
                  className="flex-1 text-sm"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSendMessage();
                    }
                  }}
                  maxLength={200}
                />
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="h-8 w-8"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                  <ThumbsUp className="w-3 h-3 mr-1" />
                  Like
                </Button>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                  <Gift className="w-3 h-3 mr-1" />
                  Gift
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
