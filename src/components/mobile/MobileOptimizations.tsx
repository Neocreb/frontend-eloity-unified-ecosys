// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  SwipeUp,
  SwipeDown,
  SwipeLeft,
  SwipeRight,
  Vibrate,
  Share2,
  Download,
  Bookmark,
  Heart,
  MessageCircle,
  MoreVertical,
  ChevronUp,
  ChevronDown,
  Maximize2,
  Minimize2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Move,
  Camera,
  Mic,
  Video,
  Image as ImageIcon,
  X,
  Check,
  Plus,
  Minus,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Battery,
  Signal,
  Gauge,
  Monitor,
  Settings,
  Eye,
  EyeOff,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  networkOptimizer,
  memoryManager,
  performanceMonitor,
  shouldReduceAnimations,
} from "@/utils/mobilePerformance";

// Hook for detecting mobile device and capabilities
export const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState<string>("");
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [memoryInfo, setMemoryInfo] = useState<any>(null);

  useEffect(() => {
    const checkMobile = () => {
      const mobile =
        /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
        window.innerWidth < 768;
      const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const android = /Android/.test(navigator.userAgent);
      const pwa =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window as any).navigator.standalone === true;

      setIsMobile(mobile);
      setIsIOS(ios);
      setIsAndroid(android);
      setIsPWA(pwa);
    };

    const handleOnlineStatus = () => setIsOnline(navigator.onLine);

    const handleConnectionChange = () => {
      const connection =
        (navigator as any).connection ||
        (navigator as any).mozConnection ||
        (navigator as any).webkitConnection;
      if (connection) {
        setConnectionType(connection.effectiveType);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOnlineStatus);

    // Performance monitoring
    const updatePerformance = () => {
      setPerformanceMetrics(performanceMonitor.getAllMetrics());
      setMemoryInfo(memoryManager.getMemoryInfo());
    };

    updatePerformance();
    const perfInterval = setInterval(updatePerformance, 5000);

    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener("change", handleConnectionChange);
      handleConnectionChange();
    }

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOnlineStatus);
      if (connection) {
        connection.removeEventListener("change", handleConnectionChange);
      }
      clearInterval(perfInterval);
    };
  }, []);

  return {
    isMobile,
    isIOS,
    isAndroid,
    isPWA,
    isOnline,
    connectionType,
    performanceMetrics,
    memoryInfo,
    networkQuality: networkOptimizer.isSlowConnection()
      ? "slow"
      : networkOptimizer.isFastConnection()
        ? "fast"
        : "medium",
  };
};

// Swipe gesture hook
export const useSwipeGesture = (
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  onSwipeUp?: () => void,
  onSwipeDown?: () => void,
  threshold = 50,
) => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(
    null,
  );

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > threshold;
    const isRightSwipe = distanceX < -threshold;
    const isUpSwipe = distanceY > threshold;
    const isDownSwipe = distanceY < -threshold;

    if (Math.abs(distanceX) > Math.abs(distanceY)) {
      if (isLeftSwipe && onSwipeLeft) onSwipeLeft();
      if (isRightSwipe && onSwipeRight) onSwipeRight();
    } else {
      if (isUpSwipe && onSwipeUp) onSwipeUp();
      if (isDownSwipe && onSwipeDown) onSwipeDown();
    }
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
};

// Pull-to-refresh component
interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  threshold = 100,
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const startY = useRef<number>(0);
  const { toast } = useToast();

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling) return;

    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, (currentY - startY.current) * 0.5);

    if (distance > 0) {
      e.preventDefault();
      setPullDistance(distance);
    }
  };

  const handleTouchEnd = async () => {
    setIsPulling(false);

    if (pullDistance > threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
        toast({
          title: "Refreshed",
          description: "Content has been updated",
        });
      } catch (error) {
        toast({
          title: "Refresh failed",
          description: "Please try again",
          variant: "destructive",
        });
      } finally {
        setIsRefreshing(false);
      }
    }

    setPullDistance(0);
  };

  const refreshProgress = Math.min(pullDistance / threshold, 1);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {(isPulling || isRefreshing) && (
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-center bg-background border-b transition-all duration-200 z-10"
          style={{
            transform: `translateY(${pullDistance - 60}px)`,
            height: "60px",
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-6 h-6 border-2 border-primary rounded-full transition-all duration-200 ${
                isRefreshing ? "animate-spin border-t-transparent" : ""
              }`}
              style={{
                transform: `rotate(${refreshProgress * 360}deg)`,
              }}
            />
            <span className="text-sm font-medium">
              {isRefreshing
                ? "Refreshing..."
                : refreshProgress >= 1
                  ? "Release to refresh"
                  : "Pull to refresh"}
            </span>
          </div>
        </div>
      )}

      <div
        style={{
          transform: `translateY(${isPulling ? pullDistance : 0}px)`,
          transition: isPulling ? "none" : "transform 0.3s ease",
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Touch-optimized action sheet
interface TouchActionSheetProps {
  trigger: React.ReactNode;
  title?: string;
  description?: string;
  actions: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: "default" | "destructive";
  }[];
}

export const TouchActionSheet: React.FC<TouchActionSheetProps> = ({
  trigger,
  title,
  description,
  actions,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="bottom" className="h-fit max-h-[80vh]">
        <SheetHeader className="text-left">
          {title && <SheetTitle>{title}</SheetTitle>}
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>

        <div className="grid gap-2 mt-4">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || "ghost"}
              className="justify-start h-12 text-left"
              onClick={() => {
                action.onClick();
                setOpen(false);
              }}
            >
              {action.icon && <span className="mr-3">{action.icon}</span>}
              {action.label}
            </Button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

// Haptic feedback utilities
export const useHapticFeedback = () => {
  const { isMobile } = useMobileDetection();

  const light = useCallback(() => {
    if (isMobile && "vibrate" in navigator) {
      navigator.vibrate(10);
    }
  }, [isMobile]);

  const medium = useCallback(() => {
    if (isMobile && "vibrate" in navigator) {
      navigator.vibrate(50);
    }
  }, [isMobile]);

  const heavy = useCallback(() => {
    if (isMobile && "vibrate" in navigator) {
      navigator.vibrate(100);
    }
  }, [isMobile]);

  const success = useCallback(() => {
    if (isMobile && "vibrate" in navigator) {
      navigator.vibrate([50, 50, 50]);
    }
  }, [isMobile]);

  const error = useCallback(() => {
    if (isMobile && "vibrate" in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  }, [isMobile]);

  return { light, medium, heavy, success, error };
};

// Touch-optimized image viewer with gestures
interface TouchImageViewerProps {
  src: string;
  alt: string;
  onClose: () => void;
}

export const TouchImageViewer: React.FC<TouchImageViewerProps> = ({
  src,
  alt,
  onClose,
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastTouch, setLastTouch] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [lastDistance, setLastDistance] = useState<number | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();

    if (e.touches.length === 1) {
      setIsDragging(true);
      setLastTouch({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      });
    } else if (e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      setLastDistance(distance);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();

    if (e.touches.length === 1 && isDragging && lastTouch) {
      const deltaX = e.touches[0].clientX - lastTouch.x;
      const deltaY = e.touches[0].clientY - lastTouch.y;

      setPosition((prev) => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }));

      setLastTouch({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      });
    } else if (e.touches.length === 2 && lastDistance) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );

      const scaleChange = distance / lastDistance;
      const newScale = Math.min(Math.max(scale * scaleChange, 0.5), 3);

      setScale(newScale);
      setLastDistance(distance);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setLastTouch(null);
    setLastDistance(null);
  };

  const resetTransform = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev * 1.5, 3));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev / 1.5, 0.5));
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Controls */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-white"
        >
          <X className="w-5 h-5" />
        </Button>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={zoomOut}
            className="text-white"
          >
            <ZoomOut className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetTransform}
            className="text-white"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={zoomIn}
            className="text-white"
          >
            <ZoomIn className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Image */}
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className="max-w-full max-h-full object-contain touch-none"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transition: isDragging ? "none" : "transform 0.2s ease",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        draggable={false}
      />

      {/* Zoom indicator */}
      {scale !== 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <Badge variant="secondary" className="text-white bg-black/50">
            {Math.round(scale * 100)}%
          </Badge>
        </div>
      )}
    </div>
  );
};

// Mobile-optimized video player
interface TouchVideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
}

export const TouchVideoPlayer: React.FC<TouchVideoPlayerProps> = ({
  src,
  poster,
  autoPlay = false,
  loop = false,
  muted = true,
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(muted);
  const [showControls, setShowControls] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const progress = (video.currentTime / video.duration) * 100;
      setProgress(isNaN(progress) ? 0 : progress);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVideoClick = () => {
    togglePlayPause();
    showControlsTemporarily();
  };

  const showControlsTemporarily = () => {
    setShowControls(true);

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const handleProgressClick = (e: React.MouseEvent) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickRatio = clickX / rect.width;
    const newTime = clickRatio * video.duration;

    video.currentTime = newTime;
  };

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        loop={loop}
        muted={muted}
        playsInline
        className="w-full h-full object-cover"
        onClick={handleVideoClick}
      />

      {/* Play/Pause overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <Button
            variant="ghost"
            size="lg"
            onClick={togglePlayPause}
            className="text-white bg-black/50 hover:bg-black/70 rounded-full w-16 h-16"
          >
            <Play className="w-8 h-8 ml-1" fill="white" />
          </Button>
        </div>
      )}

      {/* Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${
          showControls || !isPlaying ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Progress bar */}
        <div
          className="h-1 bg-white/30 cursor-pointer mx-4 mb-2"
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-white transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={togglePlayPause}
            className="text-white"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMute}
            className="text-white"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Connection status indicator
export const ConnectionStatus: React.FC = () => {
  const { isOnline, connectionType } = useMobileDetection();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-2 text-sm z-50">
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="w-4 h-4" />
        <span>You're offline</span>
      </div>
    </div>
  );
};

// Install PWA prompt
export const PWAInstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const { isPWA } = useMobileDetection();

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowPrompt(false);
    }

    setDeferredPrompt(null);
  };

  if (!showPrompt || isPWA) return null;

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-lg">
            <Download className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-sm">Install Eloity</h4>
            <p className="text-xs text-muted-foreground">
              Add to home screen for faster access
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowPrompt(false)}
            >
              <X className="w-4 h-4" />
            </Button>
            <Button size="sm" onClick={installPWA}>
              Install
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Enhanced performance dashboard
export const MobilePerformanceDashboard: React.FC = () => {
  const {
    isMobile,
    isIOS,
    isAndroid,
    isPWA,
    isOnline,
    connectionType,
    performanceMetrics,
    memoryInfo,
    networkQuality,
  } = useMobileDetection();

  const [optimizationSettings, setOptimizationSettings] = useState({
    reduceAnimations: shouldReduceAnimations(),
    compressImages: networkOptimizer.isSlowConnection(),
    preloadContent: networkOptimizer.shouldPreloadImages(),
    enableVibration: isMobile,
  });

  const getPerformanceScore = () => {
    if (!performanceMetrics || !memoryInfo) return 0;

    let score = 100;

    // Network quality impact
    if (networkQuality === "slow") score -= 30;
    else if (networkQuality === "medium") score -= 10;

    // Memory usage impact
    if (memoryInfo) {
      const memoryUsage =
        memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit;
      if (memoryUsage > 0.8) score -= 25;
      else if (memoryUsage > 0.6) score -= 10;
    }

    return Math.max(0, score);
  };

  const updateOptimizationSetting = (key: string, value: boolean) => {
    setOptimizationSettings((prev) => ({ ...prev, [key]: value }));

    // Apply settings immediately
    switch (key) {
      case "reduceAnimations":
        document.documentElement.style.setProperty(
          "--animation-duration",
          value ? "0ms" : "300ms",
        );
        break;
    }
  };

  const performanceScore = getPerformanceScore();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Mobile Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Performance Score */}
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                {performanceScore}
                <span className="text-xl text-muted-foreground">/100</span>
              </div>
              <p className="text-muted-foreground">Performance Score</p>
              <Progress value={performanceScore} className="mt-2" />
            </div>

            {/* Device Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Device</Label>
                <p className="text-sm">
                  {isMobile ? "📱 Mobile" : "💻 Desktop"}
                  {isIOS && " (iOS)"}
                  {isAndroid && " (Android)"}
                  {isPWA && " - PWA"}
                </p>
              </div>

              <div>
                <Label>Connection</Label>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      !isOnline
                        ? "bg-red-500"
                        : networkQuality === "fast"
                          ? "bg-green-500"
                          : networkQuality === "medium"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                    }`}
                  />
                  <span className="text-sm capitalize">
                    {!isOnline ? "Offline" : networkQuality}{" "}
                    {connectionType && `(${connectionType})`}
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            {memoryInfo && (
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Memory Usage</span>
                      <span>
                        {Math.round(
                          (memoryInfo.usedJSHeapSize /
                            memoryInfo.jsHeapSizeLimit) *
                            100,
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        (memoryInfo.usedJSHeapSize /
                          memoryInfo.jsHeapSizeLimit) *
                        100
                      }
                    />
                    <div className="text-xs text-muted-foreground">
                      {Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024)}MB /
                      {Math.round(memoryInfo.jsHeapSizeLimit / 1024 / 1024)}MB
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Signal
                    className={`h-6 w-6 mx-auto mb-2 ${
                      networkQuality === "fast"
                        ? "text-green-500"
                        : networkQuality === "medium"
                          ? "text-yellow-500"
                          : "text-red-500"
                    }`}
                  />
                  <p className="text-sm font-medium capitalize">
                    {networkQuality}
                  </p>
                  <p className="text-xs text-muted-foreground">Network</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Gauge
                    className={`h-6 w-6 mx-auto mb-2 ${
                      performanceScore > 80
                        ? "text-green-500"
                        : performanceScore > 60
                          ? "text-yellow-500"
                          : "text-red-500"
                    }`}
                  />
                  <p className="text-sm font-medium">
                    {performanceScore > 80
                      ? "Excellent"
                      : performanceScore > 60
                        ? "Good"
                        : "Needs Work"}
                  </p>
                  <p className="text-xs text-muted-foreground">Overall</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="reduce-animations">Reduce Animations</Label>
                  <p className="text-xs text-muted-foreground">
                    Improve performance on slower devices
                  </p>
                </div>
                <Switch
                  id="reduce-animations"
                  checked={optimizationSettings.reduceAnimations}
                  onCheckedChange={(checked) =>
                    updateOptimizationSetting("reduceAnimations", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="compress-images">Compress Images</Label>
                  <p className="text-xs text-muted-foreground">
                    Reduce image quality to save bandwidth
                  </p>
                </div>
                <Switch
                  id="compress-images"
                  checked={optimizationSettings.compressImages}
                  onCheckedChange={(checked) =>
                    updateOptimizationSetting("compressImages", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="preload-content">Preload Content</Label>
                  <p className="text-xs text-muted-foreground">
                    Load content in advance (uses more data)
                  </p>
                </div>
                <Switch
                  id="preload-content"
                  checked={optimizationSettings.preloadContent}
                  onCheckedChange={(checked) =>
                    updateOptimizationSetting("preloadContent", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enable-vibration">Enable Vibration</Label>
                  <p className="text-xs text-muted-foreground">
                    Haptic feedback for interactions
                  </p>
                </div>
                <Switch
                  id="enable-vibration"
                  checked={optimizationSettings.enableVibration}
                  onCheckedChange={(checked) =>
                    updateOptimizationSetting("enableVibration", checked)
                  }
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default {
  useMobileDetection,
  useSwipeGesture,
  useHapticFeedback,
  PullToRefresh,
  TouchActionSheet,
  TouchImageViewer,
  TouchVideoPlayer,
  ConnectionStatus,
  PWAInstallPrompt,
  MobilePerformanceDashboard,
};
