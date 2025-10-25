import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Settings,
  Users,
  Eye,
  Heart,
  Share2,
  Monitor,
  Smartphone,
  Globe,
  Lock,
  Radio,
  Square,
  Play,
  Camera,
  Upload,
  Zap,
  AlertCircle,
  CheckCircle,
  Calendar,
  Crown,
  BarChart3,
} from "lucide-react";
import {
  LiveStream,
  liveStreamingService,
} from "@/services/liveStreamingService";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { requestCameraAccess, stopCameraStream } from "@/utils/cameraPermissions";

interface LiveStreamCreatorProps {
  onStreamStart?: (stream: LiveStream) => void;
  onStreamEnd?: () => void;
  className?: string;
}

export function LiveStreamCreator({
  onStreamStart,
  onStreamEnd,
  className,
}: LiveStreamCreatorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [streamTitle, setStreamTitle] = useState("");
  const [streamDescription, setStreamDescription] = useState("");
  const [streamCategory, setStreamCategory] = useState("");
  const [streamTags, setStreamTags] = useState("");
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [recordingEnabled, setRecordingEnabled] = useState(false);
  const [privacy, setPrivacy] = useState<"public" | "unlisted" | "private">(
    "public",
  );
  const [quality, setQuality] = useState<"low" | "medium" | "high" | "ultra">(
    "high",
  );
  const [currentStream, setCurrentStream] = useState<LiveStream | null>(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [likes, setLikes] = useState(0);
  const [streamDuration, setStreamDuration] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStreaming) {
      interval = setInterval(() => {
        setStreamDuration((prev) => prev + 1);
        // Simulate viewer changes
        setViewerCount((prev) =>
          Math.max(0, prev + Math.floor(Math.random() * 5) - 2),
        );
        // Simulate occasional likes
        if (Math.random() < 0.1) {
          setLikes((prev) => prev + 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStreaming]);

  const startPreview = async () => {
    try {
      const result = await requestCameraAccess({
        video: videoEnabled,
        audio: audioEnabled,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (result.stream) {
        if (videoRef.current) {
          videoRef.current.srcObject = result.stream;
          streamRef.current = result.stream;
          setIsPreviewing(true);
        }
      }
    } catch (error: any) {
      console.error("Error accessing media devices:", error);
      toast({
        title: "Camera/Microphone Error",
        description: error.message || "Please allow camera and microphone access to start streaming.",
        variant: "destructive",
      });
    }
  };

  const stopPreview = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsPreviewing(false);
  };

  const startStream = async () => {
    if (!streamTitle.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your stream.",
        variant: "destructive",
      });
      return;
    }

    if (!isPreviewing) {
      await startPreview();
    }

    try {
      const streamData = {
        title: streamTitle,
        description: streamDescription,
        streamerId: user?.id || "user-1",
        streamerName: user?.name || "Anonymous",
        streamerAvatar: user?.avatar || "",
        category: streamCategory || "general",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop",
        streamUrl: "wss://stream.example.com/live-stream",
        viewerCount: 0,
        tags: streamTags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        chatEnabled,
        settings: {
          quality,
          privacy,
          allowRecording: recordingEnabled,
          moderationEnabled: true,
        },
      };

      const newStream = await liveStreamingService.startStreamDemo(streamData);
      setCurrentStream(newStream);
      setIsStreaming(true);
      setViewerCount(1); // Start with 1 viewer
      setLikes(0);
      setStreamDuration(0);

      onStreamStart?.(newStream);

      toast({
        title: "Stream Started!",
        description: "Your live stream is now broadcasting.",
      });
    } catch (error) {
      console.error("Error starting stream:", error);
      toast({
        title: "Stream Error",
        description: "Failed to start stream. Please try again.",
        variant: "destructive",
      });
    }
  };

  const endStream = async () => {
    if (currentStream) {
      try {
        console.log("Ending demo stream:", currentStream.id);
        setIsStreaming(false);
        setCurrentStream(null);
        stopPreview();
        onStreamEnd?.();

        toast({
          title: "Stream Ended",
          description: `Your stream lasted ${Math.floor(streamDuration / 60)}:${(streamDuration % 60).toString().padStart(2, "0")} with ${viewerCount} viewers.`,
        });
      } catch (error) {
        console.error("Error ending stream:", error);
      }
    }
  };

  const toggleVideo = async () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoEnabled;
        setVideoEnabled(!videoEnabled);
      }
    }
  };

  const toggleAudio = async () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioEnabled;
        setAudioEnabled(!audioEnabled);
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatViewerCount = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const categories = [
    "Technology",
    "Gaming",
    "Music",
    "Art",
    "Education",
    "Business",
    "Finance",
    "Fitness",
    "Cooking",
    "Travel",
    "Lifestyle",
    "Other",
  ];

  return (
    <div className={cn("p-4 md:p-6 min-h-0 overflow-y-auto", className)}>
      {/* Navigation Header with Breadcrumbs and Cross-links */}
      <div className="mb-4 md:mb-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-1 md:space-x-2 text-sm text-muted-foreground mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="p-0 h-auto font-normal"
          >
            ← Back
          </Button>
          <span>/</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/app/feed")}
            className="p-0 h-auto font-normal hover:text-foreground"
          >
            Feed
          </Button>
          <span>/</span>
          <span className="text-foreground font-medium">Live Streaming</span>
        </nav>

        {/* Quick Navigation to Related Features */}
        <div className="flex flex-wrap gap-2 mb-4 overflow-x-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/app/videos")}
            className="flex items-center gap-2"
          >
            <Video className="h-4 w-4" />
            Watch Videos
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/app/events")}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Upcoming Events
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/app/premium")}
            className="flex items-center gap-2 text-purple-600 border-purple-200 hover:bg-purple-50"
          >
            <Crown className="h-4 w-4" />
            Premium Features
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/app/unified-creator-studio")}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Creator Analytics
          </Button>
        </div>

        {/* Feature Description */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3 md:p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Radio className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">
                Professional Live Streaming
              </h3>
              <p className="text-sm text-blue-700 mb-2">
                Broadcast to your audience in real-time with professional
                streaming tools, chat interaction, and monetization features.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">
                  HD Quality
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Live Chat
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Recording
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Analytics
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5" />
            {isStreaming ? "Live Streaming" : "Start Live Stream"}
            {isStreaming && (
              <Badge className="bg-red-500 text-white animate-pulse">
                LIVE
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6">
          {/* Stream Preview */}
          <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video max-w-full">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />

            {!isPreviewing && !isStreaming && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <div className="text-center text-white">
                  <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">Camera Preview</p>
                  <p className="text-sm opacity-75">
                    Click "Start Preview" to see your camera
                  </p>
                </div>
              </div>
            )}

            {/* Overlay Controls */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30">
              {/* Top Stats (when streaming) */}
              {isStreaming && (
                <div className="absolute top-2 md:top-4 left-2 md:left-4 right-2 md:right-4 flex flex-wrap justify-between items-start gap-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-red-500 text-white">
                      LIVE • {formatDuration(streamDuration)}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      {formatViewerCount(viewerCount)}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <Heart className="h-3 w-3" />
                      {likes}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Bottom Controls */}
              <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 right-2 md:right-4 flex flex-wrap justify-between items-center gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={toggleVideo}
                    variant="secondary"
                    size="sm"
                    className={cn(
                      "opacity-80",
                      !videoEnabled && "bg-red-500 text-white",
                    )}
                  >
                    {videoEnabled ? (
                      <Video className="h-4 w-4" />
                    ) : (
                      <VideoOff className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    onClick={toggleAudio}
                    variant="secondary"
                    size="sm"
                    className={cn(
                      "opacity-80",
                      !audioEnabled && "bg-red-500 text-white",
                    )}
                  >
                    {audioEnabled ? (
                      <Mic className="h-4 w-4" />
                    ) : (
                      <MicOff className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <Dialog open={showSettings} onOpenChange={setShowSettings}>
                  <DialogTrigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="opacity-80"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md w-[90vw] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Stream Settings</DialogTitle>
                      <DialogDescription>
                        Configure your stream preferences
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Quality</label>
                        <Select
                          value={quality}
                          onValueChange={(value: any) => setQuality(value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low (720p)</SelectItem>
                            <SelectItem value="medium">
                              Medium (1080p)
                            </SelectItem>
                            <SelectItem value="high">High (1440p)</SelectItem>
                            <SelectItem value="ultra">Ultra (4K)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Privacy</label>
                        <Select
                          value={privacy}
                          onValueChange={(value: any) => setPrivacy(value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="public">
                              <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                Public
                              </div>
                            </SelectItem>
                            <SelectItem value="unlisted">
                              <div className="flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                Unlisted
                              </div>
                            </SelectItem>
                            <SelectItem value="private">
                              <div className="flex items-center gap-2">
                                <Lock className="h-4 w-4" />
                                Private
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">
                            Enable Chat
                          </label>
                          <Switch
                            checked={chatEnabled}
                            onCheckedChange={setChatEnabled}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">
                            Allow Recording
                          </label>
                          <Switch
                            checked={recordingEnabled}
                            onCheckedChange={setRecordingEnabled}
                          />
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Stream Information */}
          {!isStreaming && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Stream Title *
                </label>
                <Input
                  value={streamTitle}
                  onChange={(e) => setStreamTitle(e.target.value)}
                  placeholder="What's your stream about?"
                  maxLength={100}
                  className="min-h-[44px] text-base"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {streamTitle.length}/100
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Description
                </label>
                <Textarea
                  value={streamDescription}
                  onChange={(e) => setStreamDescription(e.target.value)}
                  placeholder="Tell viewers what to expect..."
                  rows={3}
                  maxLength={500}
                  className="min-h-[80px] text-base resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {streamDescription.length}/500
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Category
                  </label>
                  <Select
                    value={streamCategory}
                    onValueChange={setStreamCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem
                          key={category}
                          value={category.toLowerCase()}
                        >
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Tags</label>
                  <Input
                    value={streamTags}
                    onChange={(e) => setStreamTags(e.target.value)}
                    placeholder="tag1, tag2, tag3"
                    className="min-h-[44px] text-base"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Stream Info (when streaming) */}
          {isStreaming && currentStream && (
            <Card>
              <CardContent className="p-3 md:p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback>
                      {user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg">
                      {currentStream.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {currentStream.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-2 text-xs md:text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {formatViewerCount(viewerCount)} viewers
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {likes} likes
                      </span>
                      <span>Duration: {formatDuration(streamDuration)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            {!isStreaming ? (
              <>
                {!isPreviewing ? (
                  <Button
                    onClick={startPreview}
                    variant="outline"
                    className="flex-1 w-full sm:w-auto"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Preview
                  </Button>
                ) : (
                  <Button
                    onClick={stopPreview}
                    variant="outline"
                    className="flex-1 w-full sm:w-auto"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Stop Preview
                  </Button>
                )}
                <Button
                  onClick={startStream}
                  className="flex-1 w-full sm:w-auto bg-red-500 hover:bg-red-600"
                  disabled={!streamTitle.trim()}
                >
                  <Radio className="h-4 w-4 mr-2" />
                  Go Live
                </Button>
              </>
            ) : (
              <Button
                onClick={endStream}
                variant="destructive"
                className="flex-1 w-full sm:w-auto"
              >
                <Square className="h-4 w-4 mr-2" />
                End Stream
              </Button>
            )}
          </div>

          {/* Quick Tips */}
          <div className="bg-blue-50 rounded-lg p-3 md:p-4">
            <div className="flex items-start gap-2">
              <Zap className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">
                  Streaming Tips
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Ensure good lighting and stable internet connection</li>
                  <li>• Interact with your audience through chat</li>
                  <li>
                    • Choose a clear, descriptive title for better discovery
                  </li>
                  <li>• Test your setup with a preview before going live</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
