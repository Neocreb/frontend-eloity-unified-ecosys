// @ts-nocheck
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Camera,
  Square,
  Play,
  Pause,
  RotateCcw,
  Scissors,
  Music,
  Type,
  Sparkles,
  Users,
  Timer,
  Download,
  Upload,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  FlashOff,
  Flash,
  Grid3X3,
  Maximize,
  Minimize,
  Zap,
  Palette,
  Smile,
  Heart,
  Star,
  X,
  Check,
  ArrowLeft,
  MoreHorizontal,
  Settings,
  VideoIcon,
  StopCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { requestCameraAccess, stopCameraStream, switchCamera, CameraError } from "@/utils/cameraPermissions";
import CameraPermissionDialog from "@/components/ui/camera-permission-dialog";

interface VideoSegment {
  id: string;
  blob: Blob;
  duration: number;
  startTime: number;
  filters: string[];
  effects: string[];
}

interface Filter {
  id: string;
  name: string;
  effect: string;
  preview: string;
}

interface Effect {
  id: string;
  name: string;
  type: "beauty" | "ar" | "sticker" | "text";
  icon: string;
  settings?: any;
}

interface SoundTrack {
  id: string;
  title: string;
  artist: string;
  duration: number;
  url: string;
  preview: string;
  trending: boolean;
  category: string;
}

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  size: number;
  color: string;
  font: string;
  animation: string;
}

interface Sticker {
  id: string;
  url: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

const filters: Filter[] = [
  { id: "none", name: "Original", effect: "none", preview: "🎬" },
  {
    id: "vintage",
    name: "Vintage",
    effect: "sepia(0.8) contrast(1.2)",
    preview: "📼",
  },
  {
    id: "cool",
    name: "Cool",
    effect: "hue-rotate(180deg) saturate(1.3)",
    preview: "❄️",
  },
  {
    id: "warm",
    name: "Warm",
    effect: "hue-rotate(30deg) brightness(1.1)",
    preview: "🔥",
  },
  {
    id: "dramatic",
    name: "Dramatic",
    effect: "contrast(1.5) brightness(0.8)",
    preview: "🎭",
  },
  {
    id: "soft",
    name: "Soft",
    effect: "blur(0.5px) brightness(1.1)",
    preview: "☁️",
  },
  {
    id: "noir",
    name: "Noir",
    effect: "grayscale(1) contrast(1.3)",
    preview: "⚫",
  },
  {
    id: "neon",
    name: "Neon",
    effect: "saturate(2) hue-rotate(270deg)",
    preview: "🌈",
  },
];

const effects: Effect[] = [
  { id: "beauty", name: "Beauty", type: "beauty", icon: "✨" },
  { id: "sparkles", name: "Sparkles", type: "ar", icon: "⭐" },
  { id: "hearts", name: "Hearts", type: "ar", icon: "💕" },
  { id: "rainbow", name: "Rainbow", type: "ar", icon: "🌈" },
  { id: "crown", name: "Crown", type: "ar", icon: "👑" },
  { id: "glasses", name: "Glasses", type: "ar", icon: "🕶️" },
  { id: "cat_ears", name: "Cat Ears", type: "ar", icon: "🐱" },
  { id: "butterfly", name: "Butterfly", type: "ar", icon: "🦋" },
];

const soundTracks: SoundTrack[] = [
  {
    id: "1",
    title: "Trending Beat #1",
    artist: "TikTok Sounds",
    duration: 30,
    url: "/api/audio/trending-1.mp3",
    preview: "🔥",
    trending: true,
    category: "trending",
  },
  {
    id: "2",
    title: "Chill Vibes",
    artist: "Lo-Fi Beats",
    duration: 45,
    url: "/api/audio/chill-vibes.mp3",
    preview: "😌",
    trending: false,
    category: "chill",
  },
  {
    id: "3",
    title: "Dance Energy",
    artist: "EDM Mix",
    duration: 60,
    url: "/api/audio/dance-energy.mp3",
    preview: "💃",
    trending: true,
    category: "dance",
  },
  {
    id: "4",
    title: "Motivational",
    artist: "Workout Mix",
    duration: 40,
    url: "/api/audio/motivation.mp3",
    preview: "💪",
    trending: false,
    category: "motivational",
  },
];

interface AdvancedVideoRecorderProps {
  onClose: () => void;
  onVideoCreated: (video: File, metadata: any) => void;
}

const AdvancedVideoRecorder: React.FC<AdvancedVideoRecorderProps> = ({
  onClose,
  onVideoCreated,
}) => {
  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedSegments, setRecordedSegments] = useState<VideoSegment[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [maxDuration] = useState(180); // 3 minutes max

  // Camera states
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">(
    "user",
  );
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [gridEnabled, setGridEnabled] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  // Creative states
  const [currentFilter, setCurrentFilter] = useState<string>("none");
  const [selectedEffects, setSelectedEffects] = useState<string[]>([]);
  const [selectedSound, setSelectedSound] = useState<SoundTrack | null>(null);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [stickers, setStickers] = useState<Sticker[]>([]);

  // Controls states
  const [speed, setSpeed] = useState(1);
  const [timer, setTimer] = useState(0);
  const [timerCountdown, setTimerCountdown] = useState(0);
  const [zoom, setZoom] = useState(1);

  // UI states
  const [activeTab, setActiveTab] = useState<
    "filters" | "effects" | "sounds" | "text" | "stickers"
  >("filters");
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cameraError, setCameraError] = useState<CameraError | null>(null);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [isInitializingCamera, setIsInitializingCamera] = useState(false);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const { toast } = useToast();

  // Initialize camera
  useEffect(() => {
    initializeCamera();
    return () => {
      cleanup();
    };
  }, [cameraFacing, micEnabled]);

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= maxDuration) {
            handleStopRecording();
            return maxDuration;
          }
          return prev + 0.1;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused, maxDuration]);

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerCountdown > 0) {
      interval = setInterval(() => {
        setTimerCountdown((prev) => {
          if (prev <= 1) {
            handleStartRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerCountdown]);

  const cleanup = useCallback(() => {
    stopCameraStream(streamRef.current);
    streamRef.current = null;

    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  }, [isRecording]);

  const initializeCamera = async () => {
    setIsInitializingCamera(true);
    setCameraError(null);

    try {
      cleanup();

      const constraints = {
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1080 },
          height: { ideal: 1920 },
          frameRate: { ideal: 30 },
        },
        audio: micEnabled,
      };

      const result = await requestCameraAccess(constraints);

      if (result.error) {
        setCameraError(result.error);
        setShowPermissionDialog(true);
        return;
      }

      if (result.stream) {
        streamRef.current = result.stream;

        if (videoRef.current) {
          // Ensure video element is ready before setting source
          videoRef.current.srcObject = result.stream;

          // Wait for stream to be ready before applying filters
          videoRef.current.onloadedmetadata = () => {
            applyFilter();
          };
        }

        toast({
          title: "Camera Ready",
          description: "Camera initialized successfully",
        });
      }
    } catch (error) {
      console.error("Unexpected camera error:", error);
      setCameraError({
        type: 'unknown',
        message: 'Unexpected error occurred',
        userAction: 'Please try refreshing the page'
      });
      setShowPermissionDialog(true);
    } finally {
      setIsInitializingCamera(false);
    }
  };

  const applyFilter = () => {
    if (videoRef.current) {
      const filter = filters.find((f) => f.id === currentFilter);
      videoRef.current.style.filter = filter ? filter.effect : "none";
    }
  };

  useEffect(() => {
    applyFilter();
  }, [currentFilter]);

  const handleStartRecording = async () => {
    if (!streamRef.current) return;

    try {
      chunksRef.current = [];
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: "video/webm;codecs=vp9",
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const segment: VideoSegment = {
          id: Date.now().toString(),
          blob,
          duration: recordingTime,
          startTime: getTotalDuration(),
          filters: [currentFilter],
          effects: selectedEffects,
        };
        setRecordedSegments((prev) => [...prev, segment]);
        setRecordingTime(0);
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setIsPaused(false);
      setShowControls(false);
    } catch (error) {
      toast({
        title: "Recording Error",
        description: "Failed to start recording",
        variant: "destructive",
      });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      setShowControls(true);
    }
  };

  const handlePauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
      }
    }
  };

  const handleTimerStart = () => {
    if (timer > 0) {
      setTimerCountdown(timer);
    } else {
      handleStartRecording();
    }
  };

  const getTotalDuration = () => {
    return recordedSegments.reduce((acc, seg) => acc + seg.duration, 0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEffectToggle = (effectId: string) => {
    setSelectedEffects((prev) =>
      prev.includes(effectId)
        ? prev.filter((id) => id !== effectId)
        : [...prev, effectId],
    );
  };

  const exportVideo = async () => {
    if (recordedSegments.length === 0) {
      toast({
        title: "No Content",
        description: "Please record some video content first",
        variant: "destructive",
      });
      return;
    }

    try {
      // Combine all segments
      const combinedBlob = new Blob(
        recordedSegments.map((seg) => seg.blob),
        { type: "video/webm" },
      );

      const metadata = {
        duration: getTotalDuration(),
        segments: recordedSegments.length,
        filters: [currentFilter],
        effects: selectedEffects,
        sound: selectedSound,
        textOverlays,
        stickers,
      };

      const file = new File([combinedBlob], `video-${Date.now()}.webm`, {
        type: "video/webm",
      });

      onVideoCreated(file, metadata);
    } catch (error) {
      toast({
        title: "Export Error",
        description: "Failed to export video",
        variant: "destructive",
      });
    }
  };

  const handleRetryCamera = () => {
    setShowPermissionDialog(false);
    setCameraError(null);
    initializeCamera();
  };

  const handleCancelCamera = () => {
    setShowPermissionDialog(false);
    if (onClose) {
      onClose();
    }
  };

  const handleCameraSwitch = async () => {
    setIsInitializingCamera(true);

    try {
      const result = await switchCamera(streamRef.current, cameraFacing, micEnabled);

      if (result.error) {
        setCameraError(result.error);
        setShowPermissionDialog(true);
        return;
      }

      if (result.stream) {
        streamRef.current = result.stream;
        setCameraFacing(result.facing);

        if (videoRef.current) {
          videoRef.current.srcObject = result.stream;
        }

        toast({
          title: "Camera Switched",
          description: `Switched to ${result.facing === 'user' ? 'front' : 'back'} camera`,
        });
      }
    } catch (error) {
      console.error('Camera switch error:', error);
      toast({
        title: "Switch Failed",
        description: "Could not switch camera. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsInitializingCamera(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/80 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-black/40 text-white">
            {formatTime(getTotalDuration() + recordingTime)} /{" "}
            {formatTime(maxDuration)}
          </Badge>
          {selectedSound && (
            <Badge variant="secondary" className="bg-black/40 text-white">
              🎵 {selectedSound.title}
            </Badge>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowControls(!showControls)}
          className="text-white"
        >
          <Settings className="w-6 h-6" />
        </Button>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          autoPlay
          muted={isMuted}
          playsInline
          className={cn(
            "w-full h-full object-cover transition-transform duration-300",
            cameraFacing === "user" && "scale-x-[-1]",
          )}
          style={{
            transform: `scale(${zoom}) ${cameraFacing === "user" ? "scaleX(-1)" : ""}`,
          }}
        />

        <canvas ref={canvasRef} className="hidden" />

        {/* Grid overlay */}
        {gridEnabled && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="w-full h-full grid grid-cols-3 grid-rows-3 border-white/30">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="border border-white/20" />
              ))}
            </div>
          </div>
        )}

        {/* Recording indicator */}
        {isRecording && (
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-white font-medium text-sm">
              {formatTime(recordingTime)}
            </span>
          </div>
        )}

        {/* Timer countdown */}
        {timerCountdown > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-white text-8xl font-bold animate-pulse">
              {timerCountdown}
            </div>
          </div>
        )}

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div
            className="h-full bg-red-500 transition-all duration-100"
            style={{
              width: `${((getTotalDuration() + recordingTime) / maxDuration) * 100}%`,
            }}
          />
        </div>

        {/* Zoom control */}
        <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
          <div className="flex flex-col items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white bg-black/20 rounded-full"
              onClick={() => setZoom(Math.min(3, zoom + 0.5))}
            >
              <Maximize className="w-4 h-4" />
            </Button>
            <div className="text-white text-xs">{zoom.toFixed(1)}x</div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white bg-black/20 rounded-full"
              onClick={() => setZoom(Math.max(1, zoom - 0.5))}
            >
              <Minimize className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Controls */}
      {showControls && (
        <div className="bg-black p-4 space-y-4">
          {/* Quick controls */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCameraSwitch}
                disabled={isInitializingCamera}
                className="text-white"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                {isInitializingCamera ? "Switching..." : "Flip"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMicEnabled(!micEnabled)}
                className="text-white"
              >
                {micEnabled ? (
                  <Mic className="w-4 h-4 mr-1" />
                ) : (
                  <MicOff className="w-4 h-4 mr-1" />
                )}
                Mic
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setGridEnabled(!gridEnabled)}
                className="text-white"
              >
                <Grid3X3 className="w-4 h-4 mr-1" />
                Grid
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTimer(timer === 0 ? 3 : timer === 3 ? 10 : 0)}
                className="text-white"
              >
                <Timer className="w-4 h-4 mr-1" />
                {timer > 0 ? `${timer}s` : "Timer"}
              </Button>
            </div>
          </div>

          {/* Speed control */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-white text-sm">Speed:</span>
            {[0.5, 1, 1.5, 2].map((speedValue) => (
              <Button
                key={speedValue}
                variant={speed === speedValue ? "default" : "ghost"}
                size="sm"
                className="text-xs px-3"
                onClick={() => setSpeed(speedValue)}
              >
                {speedValue}x
              </Button>
            ))}
          </div>

          {/* Creative tools tabs */}
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: "filters", icon: Palette, label: "Filters" },
              { id: "effects", icon: Sparkles, label: "Effects" },
              { id: "sounds", icon: Music, label: "Sounds" },
              { id: "text", icon: Type, label: "Text" },
              { id: "stickers", icon: Smile, label: "Stickers" },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                size="sm"
                className="flex-shrink-0 text-xs"
                onClick={() => setActiveTab(tab.id as any)}
              >
                <tab.icon className="w-3 h-3 mr-1" />
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Creative tools content */}
          <div className="max-h-24 overflow-y-auto">
            {activeTab === "filters" && (
              <div className="grid grid-cols-4 gap-2">
                {filters.map((filter) => (
                  <Button
                    key={filter.id}
                    variant={currentFilter === filter.id ? "default" : "ghost"}
                    size="sm"
                    className="aspect-square text-xs flex flex-col p-2"
                    onClick={() => setCurrentFilter(filter.id)}
                  >
                    <div className="text-lg mb-1">{filter.preview}</div>
                    <span className="text-xs">{filter.name}</span>
                  </Button>
                ))}
              </div>
            )}

            {activeTab === "effects" && (
              <div className="grid grid-cols-4 gap-2">
                {effects.map((effect) => (
                  <Button
                    key={effect.id}
                    variant={
                      selectedEffects.includes(effect.id) ? "default" : "ghost"
                    }
                    size="sm"
                    className="aspect-square text-xs flex flex-col p-2"
                    onClick={() => handleEffectToggle(effect.id)}
                  >
                    <div className="text-lg mb-1">{effect.icon}</div>
                    <span className="text-xs">{effect.name}</span>
                  </Button>
                ))}
              </div>
            )}

            {activeTab === "sounds" && (
              <div className="space-y-2">
                {soundTracks.map((sound) => (
                  <Button
                    key={sound.id}
                    variant={
                      selectedSound?.id === sound.id ? "default" : "ghost"
                    }
                    className="w-full justify-start text-left p-2"
                    onClick={() =>
                      setSelectedSound(
                        selectedSound?.id === sound.id ? null : sound,
                      )
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-lg">{sound.preview}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{sound.title}</div>
                        <div className="text-xs text-gray-400">
                          {sound.artist} • {sound.duration}s
                        </div>
                      </div>
                      {sound.trending && (
                        <Badge variant="secondary" className="text-xs">
                          🔥
                        </Badge>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Main recording controls */}
          <div className="flex items-center justify-center gap-6 pt-4">
            <div className="flex flex-col items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white"
                disabled={recordedSegments.length === 0}
                onClick={exportVideo}
              >
                <Check className="w-4 h-4 mr-1" />
                Done
              </Button>
            </div>

            <div className="flex flex-col items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "w-20 h-20 rounded-full border-4 transition-all duration-200",
                  isRecording
                    ? "border-red-500 bg-red-500/20"
                    : "border-white bg-white/10 hover:bg-white/20",
                )}
                onClick={
                  timer > 0
                    ? handleTimerStart
                    : isRecording
                      ? handleStopRecording
                      : handleStartRecording
                }
                disabled={getTotalDuration() + recordingTime >= maxDuration}
              >
                {isRecording ? (
                  <Square className="w-8 h-8 text-white" fill="white" />
                ) : (
                  <div className="w-6 h-6 bg-red-500 rounded-full" />
                )}
              </Button>

              {isRecording && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePauseRecording}
                  className="text-white"
                >
                  {isPaused ? (
                    <Play className="w-4 h-4" />
                  ) : (
                    <Pause className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>

            <div className="flex flex-col items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white"
                disabled={recordedSegments.length === 0}
                onClick={() => {
                  setRecordedSegments([]);
                  setRecordingTime(0);
                }}
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            </div>
          </div>

          {/* Segments preview */}
          {recordedSegments.length > 0 && (
            <div className="border-t border-gray-700 pt-4">
              <div className="flex items-center gap-2 mb-2">
                <VideoIcon className="w-4 h-4 text-white" />
                <span className="text-white text-sm">
                  {recordedSegments.length} segment(s)
                </span>
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {recordedSegments.map((segment, index) => (
                  <div
                    key={segment.id}
                    className="flex-shrink-0 bg-gray-800 rounded p-2 min-w-[80px]"
                  >
                    <div className="text-white text-xs text-center">
                      {index + 1}
                    </div>
                    <div className="text-gray-400 text-xs text-center">
                      {formatTime(segment.duration)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Camera Permission Dialog */}
      <CameraPermissionDialog
        open={showPermissionDialog}
        onOpenChange={setShowPermissionDialog}
        error={cameraError}
        onRetry={handleRetryCamera}
        onCancel={handleCancelCamera}
      />
    </div>
  );
};

export default AdvancedVideoRecorder;
