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
  Zap,
  Grid3X3,
  Maximize,
  Minimize,
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
import EdithAIGenerator from "@/components/ai/EdithAIGenerator";

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
    category: "workout",
  },
];

interface AdvancedVideoRecorderProps {
  onClose: () => void;
  onVideoCreated: (videoFile: File, metadata: any) => void;
}

const AdvancedVideoRecorder: React.FC<AdvancedVideoRecorderProps> = ({
  onClose,
  onVideoCreated,
}) => {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [timer, setTimer] = useState(0);
  const [maxDuration] = useState(60); // 60 seconds max
  const [recordedSegments, setRecordedSegments] = useState<VideoSegment[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("none");
  const [selectedEffect, setSelectedEffect] = useState<string | null>(null);
  const [selectedSound, setSelectedSound] = useState<SoundTrack | null>(null);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [cameraError, setCameraError] = useState<CameraError | null>(null);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "filters" | "effects" | "sounds" | "text" | "stickers"
  >("filters");
  const [currentCamera, setCurrentCamera] = useState<"front" | "back">("back");
  const [flashOn, setFlashOn] = useState(false);
  const [gridOn, setGridOn] = useState(false);
  const [audioOn, setAudioOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [aiGeneratedVideo, setAiGeneratedVideo] = useState<string | null>(null);

  // Timer effect for recording
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, isPaused]);

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            handleStartRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  const getTotalDuration = () => {
    return recordedSegments.reduce((sum, segment) => sum + segment.duration, 0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAIContentGenerated = (content: { type: "image" | "video"; url: string; prompt: string }) => {
    if (content.type === "video") {
      // For now, we'll just show a toast. In a real implementation, you might want to:
      // 1. Download the content from the URL
      // 2. Convert it to a File object
      // 3. Set it as the AI generated video
      toast({
        title: "AI Video Generated!",
        description: "Your video has been generated. You can now use it in your creation.",
      });
      
      // In a full implementation, you would:
      // 1. Fetch the content from the URL
      // 2. Convert it to a File object
      // 3. Set it as aiGeneratedVideo
      // 4. Use it in the video creation process
    } else {
      toast({
        title: "AI Content Generated!",
        description: `Your ${content.type} has been generated. You can now use it in your video.`,
      });
    }
  };

  const initializeCamera = useCallback(async () => {
    try {
      const stream = await requestCameraAccess(currentCamera);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      setCameraError(null);
    } catch (error) {
      console.error("Camera error:", error);
      setCameraError(error as CameraError);
      setShowPermissionDialog(true);
    }
  }, [currentCamera]);

  useEffect(() => {
    initializeCamera();
    
    return () => {
      if (streamRef.current) {
        stopCameraStream(streamRef.current);
      }
    };
  }, [initializeCamera]);

  const handleRetryCamera = () => {
    setShowPermissionDialog(false);
    initializeCamera();
  };

  const handleCancelCamera = () => {
    setShowPermissionDialog(false);
    onClose();
  };

  const handleStartRecording = async () => {
    if (!streamRef.current) return;
    
    try {
      recordedChunksRef.current = [];
      
      const options = { mimeType: "video/webm;codecs=vp9" };
      const mediaRecorder = new MediaRecorder(streamRef.current, options);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        const duration = recordingTime;
        
        const newSegment: VideoSegment = {
          id: Date.now().toString(),
          blob,
          duration,
          startTime: getTotalDuration(),
          filters: [selectedFilter],
          effects: selectedEffect ? [selectedEffect] : [],
        };
        
        setRecordedSegments((prev) => [...prev, newSegment]);
        setRecordingTime(0);
        setIsRecording(false);
        setIsPaused(false);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
    } catch (error) {
      console.error("Recording error:", error);
      toast({
        title: "Recording Error",
        description: "Failed to start recording. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const handlePauseRecording = () => {
    if (mediaRecorderRef.current) {
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
    setTimer(3); // 3 second countdown
  };

  const exportVideo = async () => {
    if (recordedSegments.length === 0) return;
    
    try {
      // Combine all segments
      const blobs = recordedSegments.map((segment) => segment.blob);
      const combinedBlob = new Blob(blobs, { type: "video/webm" });
      
      // Create a file
      const fileName = `video_${Date.now()}.webm`;
      const videoFile = new File([combinedBlob], fileName, {
        type: "video/webm",
      });
      
      // Create metadata
      const metadata = {
        duration: getTotalDuration(),
        filters: recordedSegments.flatMap((s) => s.filters),
        effects: recordedSegments.flatMap((s) => s.effects),
        sound: selectedSound,
        textOverlays,
        stickers,
      };
      
      onVideoCreated(videoFile, metadata);
      onClose();
      
      toast({
        title: "Video Created!",
        description: "Your video has been successfully created.",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Error",
        description: "Failed to export video. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="text-white"
            onClick={onClose}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white"
              onClick={() => setShowAIGenerator(true)}
            >
              <Sparkles className="w-5 h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-white"
              onClick={() => setGridOn(!gridOn)}
            >
              <Grid3X3 className="w-5 h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-white"
              onClick={() => setFlashOn(!flashOn)}
            >
              {flashOn ? (
                <Zap className="w-5 h-5" />
              ) : (
                <FlashOff className="w-5 h-5" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-white"
              onClick={() => switchCamera(streamRef.current, currentCamera, setCurrentCamera)}
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        {/* Timer and duration */}
        <div className="flex items-center justify-center mt-2">
          {timer > 0 && (
            <div className="text-4xl font-bold text-white bg-red-500 rounded-full w-16 h-16 flex items-center justify-center">
              {timer}
            </div>
          )}
          
          <div className="text-white text-sm mx-4">
            {formatTime(getTotalDuration() + recordingTime)} / {formatTime(maxDuration)}
          </div>
          
          {isRecording && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-white text-sm">REC</span>
            </div>
          )}
        </div>
      </div>

      {/* Video preview */}
      <div className="relative w-full h-full">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{
            filter: selectedFilter !== "none" 
              ? filters.find(f => f.id === selectedFilter)?.effect || "none" 
              : "none"
          }}
        />
        
        {/* Grid overlay */}
        {gridOn && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="grid grid-cols-3 grid-rows-3 w-full h-full">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="border border-white/20" />
              ))}
            </div>
          </div>
        )}
        
        {/* Text overlays */}
        {textOverlays.map((overlay) => (
          <div
            key={overlay.id}
            className="absolute text-white font-bold"
            style={{
              left: `${overlay.x}%`,
              top: `${overlay.y}%`,
              fontSize: `${overlay.size}px`,
              color: overlay.color,
              fontFamily: overlay.font,
            }}
          >
            {overlay.text}
          </div>
        ))}
        
        {/* Stickers */}
        {stickers.map((sticker) => (
          <img
            key={sticker.id}
            src={sticker.url}
            alt="Sticker"
            className="absolute w-16 h-16"
            style={{
              left: `${sticker.x}%`,
              top: `${sticker.y}%`,
              transform: `scale(${sticker.scale}) rotate(${sticker.rotation}deg)`,
            }}
          />
        ))}
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        {/* Tab selector */}
        <div className="flex justify-center mb-4">
          <div className="flex bg-black/50 rounded-full p-1">
            {(["filters", "effects", "sounds", "text", "stickers"] as const).map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? "default" : "ghost"}
                size="sm"
                className="rounded-full px-3 text-xs"
                onClick={() => setActiveTab(tab)}
              >
                {tab === "filters" && "🎨"}
                {tab === "effects" && "✨"}
                {tab === "sounds" && "🎵"}
                {tab === "text" && "🔤"}
                {tab === "stickers" && "😊"}
              </Button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="max-h-32 overflow-y-auto mb-4">
          {activeTab === "filters" && (
            <div className="flex gap-2">
              {filters.map((filter) => (
                <Button
                  key={filter.id}
                  variant={selectedFilter === filter.id ? "default" : "ghost"}
                  size="sm"
                  className="flex flex-col items-center gap-1 min-w-[60px]"
                  onClick={() => setSelectedFilter(filter.id)}
                >
                  <div className="text-lg">{filter.preview}</div>
                  <span className="text-xs">{filter.name}</span>
                </Button>
              ))}
            </div>
          )}

          {activeTab === "effects" && (
            <div className="flex gap-2">
              {effects.map((effect) => (
                <Button
                  key={effect.id}
                  variant={selectedEffect === effect.id ? "default" : "ghost"}
                  size="sm"
                  className="flex flex-col items-center gap-1 min-w-[60px]"
                  onClick={() =>
                    setSelectedEffect(
                      selectedEffect === effect.id ? null : effect.id,
                    )
                  }
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

      {/* Camera Permission Dialog */}
      <CameraPermissionDialog
        open={showPermissionDialog}
        onOpenChange={setShowPermissionDialog}
        error={cameraError}
        onRetry={handleRetryCamera}
        onCancel={handleCancelCamera}
      />
      
      {/* Edith AI Generator Modal */}
      {showAIGenerator && (
        <EdithAIGenerator
          onContentGenerated={handleAIContentGenerated}
          onClose={() => setShowAIGenerator(false)}
        />
      )}
    </div>
  );
};

export default AdvancedVideoRecorder;