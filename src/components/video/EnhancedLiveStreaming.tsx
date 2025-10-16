// @ts-nocheck
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  Users,
  UserPlus,
  Settings,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  MessageCircle,
  Heart,
  Gift,
  Star,
  Eye,
  Wifi,
  WifiOff,
  Radio,
  Square,
  Play,
  Pause,
  MoreHorizontal,
  Share2,
  Download,
  Upload,
  Camera,
  CameraOff,
  Headphones,
  Speaker,
  Cast,
  Record,
  StopCircle,
  Zap,
  Sparkles,
  Palette,
  Filter,
  Grid3X3,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Blend,
  Layers,
  Sun,
  Moon,
  CloudRain,
  Snowflake,
  Flame,
  Waves,
  Crown,
  ShoppingBag,
  DollarSign,
  Target,
  Bell,
  BellOff,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface StreamParticipant {
  id: string;
  name: string;
  avatar: string;
  role: "host" | "co-host" | "guest" | "viewer";
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  joinedAt: Date;
  viewerCount?: number;
  isModerator: boolean;
}

interface StreamSettings {
  quality: "720p" | "1080p" | "4K";
  bitrate: number;
  fps: number;
  audioQuality: "low" | "medium" | "high";
  enableChat: boolean;
  enableDonations: boolean;
  enableViewerReactions: boolean;
  maxGuests: number;
  moderationEnabled: boolean;
  recordStream: boolean;
  simulcastPlatforms: string[];
  virtualBackground: string;
  beautyFilter: boolean;
  noiseReduction: boolean;
}

interface ChatMessage {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    role: "viewer" | "subscriber" | "moderator" | "host";
  };
  message: string;
  timestamp: Date;
  type: "message" | "donation" | "reaction" | "system";
  amount?: number;
  emoji?: string;
}

interface VirtualBackground {
  id: string;
  name: string;
  type: "image" | "video" | "blur" | "color";
  thumbnail: string;
  url?: string;
  color?: string;
  category: string;
}

interface LiveProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  inStock: boolean;
  featured: boolean;
}

interface EnhancedLiveStreamingProps {
  streamId?: string;
  isHost?: boolean;
  onStreamStart?: (settings: StreamSettings) => void;
  onStreamEnd?: () => void;
  onGuestInvite?: (guestId: string) => void;
  className?: string;
}

const EnhancedLiveStreaming: React.FC<EnhancedLiveStreamingProps> = ({
  streamId,
  isHost = false,
  onStreamStart,
  onStreamEnd,
  onGuestInvite,
  className,
}) => {
  // Stream state
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [streamTitle, setStreamTitle] = useState("");
  const [streamDescription, setStreamDescription] = useState("");
  const [streamCategory, setStreamCategory] = useState("Just Chatting");

  // Media state
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState<string>("default");
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>("default");
  const [audioLevel, setAudioLevel] = useState(0);

  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showShoppingPanel, setShowShoppingPanel] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "guests" | "products" | "analytics">("chat");

  // Stream participants and guests
  const [participants, setParticipants] = useState<StreamParticipant[]>([]);
  const [pendingGuests, setPendingGuests] = useState<string[]>([]);
  const [maxGuests] = useState(3);

  // Settings
  const [streamSettings, setStreamSettings] = useState<StreamSettings>({
    quality: "1080p",
    bitrate: 4500,
    fps: 30,
    audioQuality: "high",
    enableChat: true,
    enableDonations: true,
    enableViewerReactions: true,
    maxGuests: 3,
    moderationEnabled: true,
    recordStream: true,
    simulcastPlatforms: [],
    virtualBackground: "none",
    beautyFilter: false,
    noiseReduction: true,
  });

  // Chat and interactions
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showReactions, setShowReactions] = useState(false);

  // Virtual backgrounds
  const [virtualBackgrounds] = useState<VirtualBackground[]>([
    {
      id: "none",
      name: "None",
      type: "color",
      thumbnail: "🚫",
      category: "basic",
      color: "transparent",
    },
    {
      id: "blur",
      name: "Blur",
      type: "blur",
      thumbnail: "🌫️",
      category: "basic",
    },
    {
      id: "office",
      name: "Modern Office",
      type: "image",
      thumbnail: "🏢",
      category: "professional",
      url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920",
    },
    {
      id: "beach",
      name: "Tropical Beach",
      type: "image",
      thumbnail: "🏖️",
      category: "nature",
      url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920",
    },
    {
      id: "space",
      name: "Space",
      type: "video",
      thumbnail: "🚀",
      category: "creative",
      url: "/backgrounds/space.mp4",
    },
  ]);

  // Live shopping products
  const [liveProducts, setLiveProducts] = useState<LiveProduct[]>([
    {
      id: "1",
      name: "Creator Merch T-Shirt",
      price: 25,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300",
      description: "Limited edition creator merchandise",
      inStock: true,
      featured: true,
    },
    {
      id: "2",
      name: "Streaming Setup Guide",
      price: 15,
      image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=300",
      description: "Complete guide to professional streaming",
      inStock: true,
      featured: false,
    },
  ]);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { toast } = useToast();

  // Initialize media devices
  useEffect(() => {
    if (isHost) {
      initializeMediaDevices();
    }
    
    // Mock viewer count updates
    if (isLive) {
      const interval = setInterval(() => {
        setViewerCount(prev => prev + Math.floor(Math.random() * 5) - 2);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isHost, isLive]);

  // Audio level monitoring
  useEffect(() => {
    if (isAudioEnabled && streamRef.current) {
      startAudioLevelMonitoring();
    }
  }, [isAudioEnabled]);

  const initializeMediaDevices = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: streamSettings.noiseReduction,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

    } catch (error) {
      console.error("Failed to initialize media devices:", error);
      toast({
        title: "Camera Error",
        description: "Failed to access camera and microphone",
        variant: "destructive",
      });
    }
  };

  const startAudioLevelMonitoring = () => {
    if (!streamRef.current) return;

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(streamRef.current);
    
    microphone.connect(analyser);
    analyser.fftSize = 256;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateAudioLevel = () => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
      setAudioLevel(average);
      
      if (isAudioEnabled) {
        requestAnimationFrame(updateAudioLevel);
      }
    };

    updateAudioLevel();
    audioContextRef.current = audioContext;
  };

  const handleStartStream = async () => {
    if (!streamTitle.trim()) {
      toast({
        title: "Stream Title Required",
        description: "Please enter a title for your stream",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsStreaming(true);
      
      // Simulate stream setup
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsLive(true);
      setViewerCount(Math.floor(Math.random() * 50) + 1);

      if (onStreamStart) {
        onStreamStart(streamSettings);
      }

      // Add host as participant
      const hostParticipant: StreamParticipant = {
        id: "host",
        name: "You",
        avatar: "https://i.pravatar.cc/150?u=host",
        role: "host",
        isAudioEnabled,
        isVideoEnabled,
        isScreenSharing,
        joinedAt: new Date(),
        isModerator: true,
      };

      setParticipants([hostParticipant]);

      toast({
        title: "Stream Started",
        description: "You are now live!",
      });

    } catch (error) {
      setIsStreaming(false);
      toast({
        title: "Stream Failed",
        description: "Failed to start stream. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEndStream = () => {
    setIsLive(false);
    setIsStreaming(false);
    setViewerCount(0);
    setParticipants([]);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    if (onStreamEnd) {
      onStreamEnd();
    }

    toast({
      title: "Stream Ended",
      description: "Your stream has been ended successfully",
    });
  };

  const handleToggleVideo = async () => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !isVideoEnabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const handleToggleAudio = async () => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !isAudioEnabled;
      });
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  const handleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

        // Replace video track with screen share
        if (streamRef.current && videoRef.current) {
          const videoTrack = screenStream.getVideoTracks()[0];
          const sender = new RTCPeerConnection().addTrack(videoTrack, screenStream);
          
          videoRef.current.srcObject = screenStream;
          setIsScreenSharing(true);

          videoTrack.onended = () => {
            setIsScreenSharing(false);
            // Restore camera
            initializeMediaDevices();
          };
        }
      } catch (error) {
        toast({
          title: "Screen Share Failed",
          description: "Could not start screen sharing",
          variant: "destructive",
        });
      }
    } else {
      setIsScreenSharing(false);
      initializeMediaDevices();
    }
  };

  const handleInviteGuest = (guestId: string) => {
    if (participants.length >= maxGuests + 1) {
      toast({
        title: "Guest Limit Reached",
        description: `Maximum ${maxGuests} guests allowed`,
        variant: "destructive",
      });
      return;
    }

    setPendingGuests(prev => [...prev, guestId]);
    
    if (onGuestInvite) {
      onGuestInvite(guestId);
    }

    toast({
      title: "Guest Invited",
      description: "Invitation sent to guest",
    });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      user: {
        id: "current-user",
        name: "You",
        avatar: "https://i.pravatar.cc/150?u=current",
        role: "host",
      },
      message: newMessage,
      timestamp: new Date(),
      type: "message",
    };

    setChatMessages(prev => [...prev, message]);
    setNewMessage("");
  };

  const handleVirtualBackgroundChange = (backgroundId: string) => {
    setStreamSettings(prev => ({ ...prev, virtualBackground: backgroundId }));
    toast({
      title: "Background Changed",
      description: "Virtual background applied",
    });
  };

  const formatViewerCount = (count: number): string => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + "M";
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + "K";
    }
    return count.toString();
  };

  const reactions = ["❤️", "👏", "😍", "🔥", "💯", "👍", "😊", "🎉"];

  return (
    <div className={cn("fixed inset-0 bg-black text-white z-50 flex flex-col", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {isLive && (
              <Badge className="bg-red-500 animate-pulse">
                <Radio className="w-3 h-3 mr-1" />
                LIVE
              </Badge>
            )}
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4 text-red-400" />
              <span className="font-medium">{formatViewerCount(viewerCount)}</span>
            </div>
          </div>
          
          <Separator orientation="vertical" className="h-6" />
          
          <div>
            <div className="font-medium">{streamTitle || "Untitled Stream"}</div>
            <div className="text-sm text-gray-400">{streamCategory}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="w-5 h-5" />
          </Button>
          
          {isHost && (
            <>
              {!isLive ? (
                <Button
                  onClick={handleStartStream}
                  disabled={isStreaming}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isStreaming ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Radio className="w-4 h-4 mr-2" />
                  )}
                  {isStreaming ? "Starting..." : "Go Live"}
                </Button>
              ) : (
                <Button
                  onClick={handleEndStream}
                  variant="destructive"
                >
                  <Square className="w-4 h-4 mr-2" />
                  End Stream
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 relative bg-gray-900">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />

          {/* Video Overlay Controls */}
          {isHost && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-black/50 backdrop-blur-sm rounded-full px-6 py-3">
              <Button
                size="icon"
                variant="ghost"
                onClick={handleToggleVideo}
                className={cn(
                  "rounded-full",
                  !isVideoEnabled && "bg-red-500 hover:bg-red-600"
                )}
              >
                {isVideoEnabled ? (
                  <Video className="w-5 h-5" />
                ) : (
                  <VideoOff className="w-5 h-5" />
                )}
              </Button>

              <Button
                size="icon"
                variant="ghost"
                onClick={handleToggleAudio}
                className={cn(
                  "rounded-full",
                  !isAudioEnabled && "bg-red-500 hover:bg-red-600"
                )}
              >
                {isAudioEnabled ? (
                  <Mic className="w-5 h-5" />
                ) : (
                  <MicOff className="w-5 h-5" />
                )}
              </Button>

              {/* Audio Level Indicator */}
              {isAudioEnabled && (
                <div className="flex items-center gap-1">
                  <div className="w-8 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-100"
                      style={{ width: `${(audioLevel / 128) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              <Button
                size="icon"
                variant="ghost"
                onClick={handleScreenShare}
                className={cn(
                  "rounded-full",
                  isScreenSharing && "bg-blue-500 hover:bg-blue-600"
                )}
              >
                {isScreenSharing ? (
                  <MonitorOff className="w-5 h-5" />
                ) : (
                  <Monitor className="w-5 h-5" />
                )}
              </Button>

              <Separator orientation="vertical" className="h-6" />

              <Popover>
                <PopoverTrigger asChild>
                  <Button size="icon" variant="ghost" className="rounded-full">
                    <Palette className="w-5 h-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 bg-gray-800 border-gray-700">
                  <div className="space-y-3">
                    <Label>Virtual Backgrounds</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {virtualBackgrounds.map((bg) => (
                        <Button
                          key={bg.id}
                          variant={streamSettings.virtualBackground === bg.id ? "default" : "outline"}
                          size="sm"
                          className="aspect-square p-2"
                          onClick={() => handleVirtualBackgroundChange(bg.id)}
                        >
                          <span className="text-lg">{bg.thumbnail}</span>
                        </Button>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="beauty-filter">Beauty Filter</Label>
                      <Switch
                        id="beauty-filter"
                        checked={streamSettings.beautyFilter}
                        onCheckedChange={(checked) => 
                          setStreamSettings(prev => ({ ...prev, beautyFilter: checked }))
                        }
                      />
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="rounded-full"
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5" />
                ) : (
                  <Maximize className="w-5 h-5" />
                )}
              </Button>
            </div>
          )}

          {/* Guest Video Grid */}
          {participants.length > 1 && (
            <div className="absolute top-4 right-4 space-y-2">
              {participants.filter(p => p.role !== "host").map((participant) => (
                <div
                  key={participant.id}
                  className="w-32 h-24 bg-gray-800 rounded-lg overflow-hidden relative"
                >
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={participant.avatar} />
                      <AvatarFallback>{participant.name[0]}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-1">
                    <div className="text-xs text-white truncate">{participant.name}</div>
                  </div>
                  {!participant.isAudioEnabled && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      <MicOff className="w-2 h-2" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Reactions Overlay */}
          {showReactions && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute bottom-20 right-4 animate-bounce text-4xl">
                ❤️
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab as any} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800">
              <TabsTrigger value="chat" className="text-xs">
                <MessageCircle className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="guests" className="text-xs">
                <Users className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="products" className="text-xs">
                <ShoppingBag className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs">
                <Eye className="w-4 h-4" />
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="chat" className="h-full flex flex-col">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {chatMessages.map((message) => (
                    <div key={message.id} className="flex gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={message.user.avatar} />
                        <AvatarFallback>{message.user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium">{message.user.name}</span>
                          {message.user.role === "host" && (
                            <Crown className="w-3 h-3 text-yellow-400" />
                          )}
                        </div>
                        <div className="text-sm text-gray-300 break-words">
                          {message.message}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reactions Bar */}
                <div className="p-2 border-t border-gray-700">
                  <div className="flex gap-1 mb-2">
                    {reactions.map((emoji) => (
                      <Button
                        key={emoji}
                        size="sm"
                        variant="ghost"
                        className="text-lg p-1 w-8 h-8"
                        onClick={() => setShowReactions(true)}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Chat Input */}
                <div className="p-3 border-t border-gray-700">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="bg-gray-800 border-gray-600"
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    />
                    <Button size="icon" onClick={handleSendMessage}>
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="guests" className="h-full p-3">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Guests ({participants.length - 1}/{maxGuests})</h3>
                    {isHost && (
                      <Button size="sm">
                        <UserPlus className="w-4 h-4 mr-1" />
                        Invite
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {participants.filter(p => p.role !== "host").map((participant) => (
                      <div key={participant.id} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={participant.avatar} />
                            <AvatarFallback>{participant.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium">{participant.name}</div>
                            <div className="text-xs text-gray-400">{participant.role}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            participant.isAudioEnabled ? "bg-green-500" : "bg-red-500"
                          )} />
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            participant.isVideoEnabled ? "bg-blue-500" : "bg-gray-500"
                          )} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="products" className="h-full p-3">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Live Shopping</h3>
                    <Button size="sm" variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {liveProducts.map((product) => (
                      <Card key={product.id} className="bg-gray-800 border-gray-700">
                        <CardContent className="p-3">
                          <div className="flex gap-3">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{product.name}</h4>
                              <p className="text-xs text-gray-400 mb-2">{product.description}</p>
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-green-400">
                                  ${product.price}
                                </span>
                                <Button size="sm" className="text-xs">
                                  Buy Now
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="h-full p-3">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="bg-gray-800 border-gray-700">
                      <CardContent className="p-3 text-center">
                        <Eye className="w-6 h-6 mx-auto mb-1 text-blue-400" />
                        <div className="text-lg font-bold">{formatViewerCount(viewerCount)}</div>
                        <div className="text-xs text-gray-400">Current Viewers</div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gray-800 border-gray-700">
                      <CardContent className="p-3 text-center">
                        <Heart className="w-6 h-6 mx-auto mb-1 text-red-400" />
                        <div className="text-lg font-bold">{chatMessages.length}</div>
                        <div className="text-xs text-gray-400">Messages</div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-sm">Stream Quality</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Bitrate</span>
                        <span>{streamSettings.bitrate} kbps</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>FPS</span>
                        <span>{streamSettings.fps}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Resolution</span>
                        <span>{streamSettings.quality}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Stream Setup Dialog */}
      {!isLive && isHost && (
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="max-w-2xl bg-black border-gray-800 text-white">
            <DialogHeader>
              <DialogTitle>Stream Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="stream-title">Stream Title</Label>
                <Input
                  id="stream-title"
                  value={streamTitle}
                  onChange={(e) => setStreamTitle(e.target.value)}
                  placeholder="Enter stream title..."
                  className="bg-gray-800 border-gray-600 mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="stream-description">Description</Label>
                <Textarea
                  id="stream-description"
                  value={streamDescription}
                  onChange={(e) => setStreamDescription(e.target.value)}
                  placeholder="Describe your stream..."
                  className="bg-gray-800 border-gray-600 mt-1"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Quality</Label>
                  <Select
                    value={streamSettings.quality}
                    onValueChange={(value: any) => 
                      setStreamSettings(prev => ({ ...prev, quality: value }))
                    }
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-600 mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="720p">720p HD</SelectItem>
                      <SelectItem value="1080p">1080p Full HD</SelectItem>
                      <SelectItem value="4K">4K Ultra HD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Category</Label>
                  <Select
                    value={streamCategory}
                    onValueChange={setStreamCategory}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-600 mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="Just Chatting">Just Chatting</SelectItem>
                      <SelectItem value="Gaming">Gaming</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Music">Music</SelectItem>
                      <SelectItem value="Art">Art</SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enable-chat">Enable Chat</Label>
                  <Switch
                    id="enable-chat"
                    checked={streamSettings.enableChat}
                    onCheckedChange={(checked) => 
                      setStreamSettings(prev => ({ ...prev, enableChat: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="record-stream">Record Stream</Label>
                  <Switch
                    id="record-stream"
                    checked={streamSettings.recordStream}
                    onCheckedChange={(checked) => 
                      setStreamSettings(prev => ({ ...prev, recordStream: checked }))
                    }
                  />
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default EnhancedLiveStreaming;
