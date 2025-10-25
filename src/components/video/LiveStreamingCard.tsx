import React, { useState, useRef, useEffect } from 'react';
import {
  Heart,
  MessageCircle,
  Share,
  Volume2,
  VolumeX,
  MoreHorizontal,
  Play,
  Pause,
  Users,
  Eye,
  Gift,
  Settings,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Square,
  Radio,
  Crown,
  Flame,
  Target,
  Clock,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Input } from '../ui/input';
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { requestCameraAccess, stopCameraStream } from "@/utils/cameraPermissions";

interface LiveStreamingCardProps {
  content: LiveStreamData;
  isActive: boolean;
  isUserOwned?: boolean;
  onEndStream?: () => void;
  className?: string;
}

const LiveStreamingCard: React.FC<LiveStreamingCardProps> = ({
  content,
  isActive,
  isUserOwned = false,
  onEndStream,
  className,
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [isPlaying, setIsPlaying] = useState(isActive);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [localViewerCount, setLocalViewerCount] = useState(content.viewerCount);
  const [localLikes, setLocalLikes] = useState(Math.floor(content.viewerCount * 0.8));
  const [streamDuration, setStreamDuration] = useState(0);
  
  // Stream controls for owner
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  // Calculate stream duration
  useEffect(() => {
    if (content.startedAt) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - content.startedAt.getTime()) / 1000);
        setStreamDuration(elapsed);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [content.startedAt]);

  // Simulate real-time updates for viewer count and likes
  useEffect(() => {
    if (content.isActive) {
      const interval = setInterval(() => {
        const viewerChange = Math.floor(Math.random() * 5 - 1);
        if (viewerChange > 0 && isUserOwned) {
          // Show viewer join notification for stream owner
          toast({
            title: `+${viewerChange} viewer${viewerChange > 1 ? 's' : ''} joined!`,
            description: "Your stream is growing",
          });
        }
        setLocalViewerCount(prev => Math.max(1, prev + viewerChange));

        if (Math.random() > 0.7) {
          setLocalLikes(prev => prev + Math.floor(Math.random() * 3));
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [content.isActive, isUserOwned, toast]);

  // Start camera if user owns this stream
  useEffect(() => {
    if (isUserOwned && isActive && videoRef.current) {
      requestCameraAccess({ video: true, audio: true })
        .then(result => {
          if (result.error) {
            throw new Error(result.error.message);
          }

          if (result.stream) {
            if (videoRef.current) {
              videoRef.current.srcObject = result.stream;
              videoRef.current.play().catch(console.error);
            }
            toast({
              title: "Camera Started! 📹",
              description: "Your live stream is now broadcasting",
            });
          }
        })
        .catch(error => {
          console.error('Camera access failed:', error);
          toast({
            title: "Camera Access Issue",
            description: "Using demo mode. Check camera permissions.",
            variant: "destructive",
          });
        });
    }
  }, [isUserOwned, isActive, toast]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (!isLiked) {
      setLocalLikes(prev => prev + 1);
    }
    toast({
      title: isLiked ? "Removed like" : "Liked!",
      description: `${content.user.displayName}'s ${content.type}`,
    });
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    toast({
      title: isFollowing ? "Unfollowed" : "Following!",
      description: `@${content.user.username}`,
    });
  };

  const handleSendChat = () => {
    if (chatMessage.trim()) {
      // Simulate sending chat message
      toast({
        title: "Message sent!",
        description: chatMessage,
      });
      setChatMessage('');
    }
  };

  const handleEndStream = () => {
    if (onEndStream) {
      onEndStream();
      toast({
        title: "Stream Ended",
        description: "Your live stream has been ended",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const hours = Math.floor(mins / 60);
    
    if (hours > 0) {
      return `${hours}:${(mins % 60).toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getBattleProgress = () => {
    if (!content.battleData?.scores) return 50;
    const total = content.battleData.scores.user1 + content.battleData.scores.user2;
    if (total === 0) return 50;
    return (content.battleData.scores.user1 / total) * 100;
  };

  return (
    <div className={cn("relative h-screen w-full bg-black overflow-hidden", className)}>
      {/* Video Background */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted={isMuted}
        playsInline
        poster={`https://images.unsplash.com/photo-${content.type === 'battle' ? '1571019613454-1cb2f99b2d8b' : '1639762681485-074b7f938ba0'}?w=400`}
      />

      {/* Fallback background for when camera isn't available */}
      {isUserOwned && (
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-${content.type === 'battle' ? '1571019613454-1cb2f99b2d8b' : '1639762681485-074b7f938ba0'}?w=800)`,
            zIndex: -1
          }}
        />
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

      {/* Debug Info (only for user-owned streams) */}
      {isUserOwned && (
        <div className="absolute top-2 left-2 z-40 bg-black/80 text-white p-2 rounded text-xs">
          <div>Stream ID: {content.id}</div>
          <div>Active: {isActive ? 'Yes' : 'No'}</div>
          <div>User Owned: {isUserOwned ? 'Yes' : 'No'}</div>
          <div>Camera: {videoRef.current?.srcObject ? 'Connected' : 'Not Connected'}</div>
        </div>
      )}

      {/* Live/Battle Indicator */}
      <div className="absolute top-4 left-4 z-30 flex gap-2">
        <Badge
          className={cn(
            "text-white font-semibold px-3 py-1 animate-pulse border-0",
            content.type === 'battle' ? "bg-red-600" : "bg-red-500"
          )}
        >
          {content.type === 'battle' ? (
            <>
              <Target className="w-3 h-3 mr-1" />
              LIVE BATTLE
            </>
          ) : (
            <>
              <Radio className="w-3 h-3 mr-1" />
              LIVE
            </>
          )}
        </Badge>
        
        <Badge className="bg-black/50 text-white border-0">
          <Clock className="w-3 h-3 mr-1" />
          {formatTime(streamDuration)}
        </Badge>
      </div>

      {/* Stats */}
      <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
        <div className="bg-black/50 rounded-full px-3 py-1 backdrop-blur-sm">
          <div className="flex items-center text-white text-sm">
            <Users className="w-4 h-4 mr-1" />
            <span>{localViewerCount.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="bg-black/50 rounded-full px-3 py-1 backdrop-blur-sm">
          <div className="flex items-center text-white text-sm">
            <Heart className="w-4 h-4 mr-1" />
            <span>{localLikes.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Battle-specific UI */}
      {content.type === 'battle' && content.battleData && (
        <div className="absolute top-1/2 left-4 right-4 transform -translate-y-1/2 z-30">
          <div className="bg-black/70 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8 border-2 border-blue-400">
                  <AvatarImage src={content.user.avatar} />
                  <AvatarFallback>{content.user.displayName[0]}</AvatarFallback>
                </Avatar>
                <span className="text-white font-medium">{content.battleData.scores?.user1 || 0}</span>
              </div>
              <div className="text-white font-bold">VS</div>
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">{content.battleData.scores?.user2 || 0}</span>
                <Avatar className="w-8 h-8 border-2 border-red-400">
                  <AvatarImage src={content.battleData.opponent?.avatar} />
                  <AvatarFallback>{content.battleData.opponent?.displayName[0]}</AvatarFallback>
                </Avatar>
              </div>
            </div>
            <Progress 
              value={getBattleProgress()} 
              className="h-2 bg-gray-600"
            />
            {content.battleData.timeRemaining && (
              <div className="text-center mt-2">
                <span className="text-yellow-400 font-bold">
                  {formatTime(content.battleData.timeRemaining)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stream Owner Controls */}
      {isUserOwned && (
        <div className="absolute bottom-20 left-4 z-30 flex gap-2">
          <Button
            onClick={() => setVideoEnabled(!videoEnabled)}
            size="icon"
            className={cn(
              "rounded-full",
              !videoEnabled && "bg-red-500 hover:bg-red-600"
            )}
          >
            {videoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
          </Button>
          
          <Button
            onClick={() => setAudioEnabled(!audioEnabled)}
            size="icon"
            className={cn(
              "rounded-full",
              !audioEnabled && "bg-red-500 hover:bg-red-600"
            )}
          >
            {audioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </Button>
          
          <Button
            onClick={handleEndStream}
            size="icon"
            className="rounded-full bg-red-600 hover:bg-red-700"
          >
            <Square className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Content Info */}
      <div className="absolute bottom-16 left-4 right-20 z-30">
        <div className="space-y-3">
          {/* User Info */}
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border-2 border-white">
              <AvatarImage src={content.user.avatar} />
              <AvatarFallback>{content.user.displayName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold">@{content.user.username}</span>
                {content.user.verified && (
                  <Badge variant="secondary" className="bg-blue-500 text-white text-xs px-1 py-0 border-0">
                    ✓
                  </Badge>
                )}
                {isUserOwned && (
                  <Badge className="bg-green-500 text-white text-xs">
                    YOU
                  </Badge>
                )}
              </div>
            </div>
            {!isUserOwned && (
              <Button
                onClick={handleFollow}
                variant={isFollowing ? "secondary" : "outline"}
                size="sm"
                className={cn(
                  "text-white font-medium border-white hover:bg-white hover:text-black",
                  isFollowing && "bg-white text-black"
                )}
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>
            )}
          </div>

          {/* Title */}
          <h3 className="text-white text-lg font-bold">{content.title}</h3>

          {/* Description */}
          <div className="text-white/90 text-sm">
            <p className={cn(!showMore && "line-clamp-2")}>
              {content.description}
            </p>
            {content.description.length > 100 && (
              <button
                onClick={() => setShowMore(!showMore)}
                className="text-white/60 hover:text-white text-xs mt-1"
              >
                {showMore ? "Show less" : "Show more"}
              </button>
            )}
          </div>

          {/* Chat Input */}
          {!isUserOwned && (
            <div className="flex gap-2">
              <Input
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Say something..."
                className="bg-black/50 border-white/20 text-white placeholder:text-white/60"
                onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
              />
              <Button 
                onClick={handleSendChat}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Send
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-16 right-4 z-30">
        <div className="flex flex-col gap-4">
          {/* Like Button */}
          <Button
            onClick={handleLike}
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-full bg-black/30 hover:bg-black/50 text-white flex flex-col items-center"
          >
            <Heart className={cn("w-6 h-6", isLiked && "fill-red-500 text-red-500")} />
            <span className="text-xs mt-1">{(localLikes / 1000).toFixed(1)}K</span>
          </Button>

          {/* Comment Button */}
          <Button
            onClick={() => setShowChat(!showChat)}
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-full bg-black/30 hover:bg-black/50 text-white flex flex-col items-center"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-xs mt-1">{Math.floor(localViewerCount * 0.3)}</span>
          </Button>

          {/* Share Button */}
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-full bg-black/30 hover:bg-black/50 text-white flex flex-col items-center"
          >
            <Share className="w-6 h-6" />
            <span className="text-xs mt-1">{Math.floor(localViewerCount * 0.1)}</span>
          </Button>

          {/* Gift Button (for battles) */}
          {content.type === 'battle' && (
            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 rounded-full bg-black/30 hover:bg-black/50 text-white flex flex-col items-center"
            >
              <Gift className="w-6 h-6 text-yellow-400" />
              <span className="text-xs mt-1">Gift</span>
            </Button>
          )}

          {/* Volume Button */}
          <Button
            onClick={() => setIsMuted(!isMuted)}
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-full bg-black/30 hover:bg-black/50 text-white"
          >
            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LiveStreamingCard;
