import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  MessageCircle,
  Heart,
  Share2,
  Users,
  Clock,
  X,
  Camera,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Gift,
  Crown,
  Target,
  Trophy,
  Flame,
  Star,
  Settings,
  ThumbsUp,
  ThumbsDown,
  Reply,
  Send,
  Smile,
  MoreHorizontal,
  Plus,
  Minimize,
  DollarSign,
  Zap,
  Award,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { requestCameraAccess } from '@/utils/media';
import { useAuth } from '@/contexts/AuthContext';
import VirtualGiftsAndTips from '@/components/premium/VirtualGiftsAndTips';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface LiveReaction {
  id: string;
  emoji: string;
  x: number;
  y: number;
  timestamp: number;
}

interface ChatMessage {
  id: string;
  user: {
    username: string;
    avatar: string;
    verified?: boolean;
    tier?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'rising_star' | 'pro_creator' | 'legend';
  };
  message: string;
  timestamp: Date;
  likes?: number;
  userLiked?: boolean;
  isSystemMessage?: boolean;
}

interface LiveStreamData {
  id: string;
  type: 'live' | 'battle';
  user: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    verified: boolean;
    followerCount: number;
  };
  title: string;
  description: string;
  viewerCount: number;
  isActive: boolean;
  startedAt: Date;
  isUserOwned?: boolean;
  category?: string;
  streamKey?: string;
  battleData?: {
    opponent?: {
      id: string;
      username: string;
      displayName: string;
      avatar: string;
      verified?: boolean;
    };
    type: 'dance' | 'rap' | 'comedy' | 'general';
    timeRemaining?: number;
    scores?: {
      user1: number;
      user2: number;
    };
  };
}

interface FullScreenLiveStreamProps {
  content: LiveStreamData;
  isActive: boolean;
  isUserOwned?: boolean;
  onEndStream: () => void;
  className?: string;
}

const mockReactions: LiveReaction[] = [
  { id: '1', emoji: '❤️', x: 20, y: 30, timestamp: Date.now() },
  { id: '2', emoji: '🔥', x: 70, y: 50, timestamp: Date.now() },
  { id: '3', emoji: '👏', x: 40, y: 70, timestamp: Date.now() },
  { id: '4', emoji: '😂', x: 80, y: 20, timestamp: Date.now() },
];

const mockChatMessages: ChatMessage[] = [
  {
    id: '1',
    user: { username: 'stream_fan', avatar: 'https://i.pravatar.cc/32?img=1', verified: true, tier: 'gold' },
    message: 'Amazing stream! 🔥',
    timestamp: new Date(Date.now() - 10000),
  },
  {
    id: '2',
    user: { username: 'crypto_enthusiast', avatar: 'https://i.pravatar.cc/32?img=2', tier: 'pro_creator' },
    message: 'Love this content! ❤️',
    timestamp: new Date(Date.now() - 5000),
  },
  {
    id: '3',
    user: { username: 'new_viewer', avatar: 'https://i.pravatar.cc/32?img=3' },
    message: 'Just joined! 👋',
    timestamp: new Date(),
    isSystemMessage: true,
  },
];

const mockGifts = [
  { id: '1', name: 'Rose', icon: '🌹', value: 1, color: 'text-pink-400' },
  { id: '2', name: 'Heart', icon: '❤️', value: 5, color: 'text-red-400' },
  { id: '3', name: 'Diamond', icon: '💎', value: 10, color: 'text-blue-400' },
  { id: '4', name: 'Crown', icon: '👑', value: 25, color: 'text-yellow-400' },
  { id: '5', name: 'Rocket', icon: '🚀', value: 50, color: 'text-purple-400' },
  { id: '6', name: 'Fireworks', icon: '🎆', value: 100, color: 'text-rainbow' },
];

const FullScreenLiveStream: React.FC<FullScreenLiveStreamProps> = ({
  content,
  isActive,
  isUserOwned = false,
  onEndStream,
  className,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Stream state
  const [isLiked, setIsLiked] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(isActive);
  const [localViewerCount, setLocalViewerCount] = useState(content.viewerCount);
  const [streamDuration, setStreamDuration] = useState(0);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(mockChatMessages);
  const [reactions, setReactions] = useState<LiveReaction[]>(mockReactions);
  const [showChat, setShowChat] = useState(true);
  const [showGifts, setShowGifts] = useState(false);
  const [selectedGift, setSelectedGift] = useState<any>(null);
  const [giftEffects, setGiftEffects] = useState<Array<{ id: string; emoji: string; x: number; y: number }>>([]);
  const [showQuickReactions, setShowQuickReactions] = useState(false);
  const [chatMessageLikes, setChatMessageLikes] = useState<Record<string, { likes: number; userLiked: boolean }>>({});
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // Simulate stream duration
  useEffect(() => {
    const interval = setInterval(() => {
      setStreamDuration(prev => prev + 1);
      // Randomly increase viewer count
      if (Math.random() > 0.7) {
        setLocalViewerCount(prev => prev + Math.floor(Math.random() * 3));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, content.isActive]);

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
          }
        })
        .catch(error => {
          console.error('Camera access failed:', error);
        });
    }
  }, [isUserOwned, isActive]);

  // Handle reactions animation
  const addReaction = useCallback((emoji: string, x?: number, y?: number) => {
    const reaction: LiveReaction = {
      id: `reaction-${Date.now()}`,
      emoji,
      x: x || Math.random() * 100,
      y: y || Math.random() * 100,
      timestamp: Date.now(),
    };
    
    setReactions(prev => [...prev, reaction]);
    
    // Remove reaction after animation
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== reaction.id));
    }, 3000);
  }, []);

  const handleSendChat = () => {
    if (!chatMessage.trim() || !user) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      user: {
        username: user.username || 'you',
        avatar: user.avatar_url || 'https://i.pravatar.cc/32?u=you',
      },
      message: chatMessage,
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, newMessage]);
    setChatMessage('');
  };

  const handleLikeMessage = (messageId: string) => {
    setChatMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { 
              ...msg, 
              likes: (msg.likes || 0) + 1,
              userLiked: true
            } 
          : msg
      )
    );
    
    setChatMessageLikes(prev => ({
      ...prev,
      [messageId]: {
        likes: (prev[messageId]?.likes || 0) + 1,
        userLiked: true
      }
    }));
  };

  const handleLike = () => {
    setIsLiked(true);
    toast({
      title: "Liked! ❤️",
      description: "You earned 10 Eloits for liking this stream"
    });
    setTimeout(() => setIsLiked(false), 1000);
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(console.error);
      }
      setIsPlaying(!isPlaying);
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

  const sendGift = (gift: any) => {
    // Add gift effect
    const effectId = Date.now().toString();
    const effect = {
      id: effectId,
      emoji: gift.icon,
      x: Math.random() * 80 + 10, // Random position
      y: Math.random() * 30 + 10,
    };
    
    setGiftEffects(prev => [...prev, effect]);
    
    // Remove effect after animation
    setTimeout(() => {
      setGiftEffects(prev => prev.filter(e => e.id !== effectId));
    }, 3000);
    
    toast({
      title: `${gift.icon} ${gift.name} sent!`,
      description: `You earned 5 Eloits for sending a gift`
    });
    
    setShowGifts(false);
    setSelectedGift(null);
  };

  return (
    <div className={cn("relative h-screen w-full bg-black overflow-hidden", className)}>
      {/* Video */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted={isMuted}
        playsInline
        poster={`https://images.unsplash.com/photo-${content.type === 'battle' ? '1571019613454-1cb2f99b2d8b' : '1639762681485-074b7f938ba0'}?w=800`}
      />

      {/* Fallback background */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{
          backgroundImage: `url(https://images.unsplash.com/photo-${content.type === 'battle' ? '1571019613454-1cb2f99b2d8b' : '1639762681485-074b7f938ba0'}?w=800)`,
          zIndex: -1
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

      {/* Play/Pause overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <Button
            size="icon"
            variant="ghost"
            className="w-20 h-20 rounded-full bg-white/20 hover:bg-white/30 border-none backdrop-blur-sm"
            onClick={togglePlayPause}
          >
            <Play className="w-10 h-10 text-white fill-white ml-1" />
          </Button>
        </div>
      )}

      {/* Live Reactions Animation */}
      {reactions.map((reaction) => (
        <div
          key={reaction.id}
          className="absolute pointer-events-none animate-pulse"
          style={{
            left: `${reaction.x}%`,
            top: `${reaction.y}%`,
            animation: 'float-up 3s ease-out forwards',
          }}
        >
          <span className="text-3xl">{reaction.emoji}</span>
        </div>
      ))}

      {/* Gift Effects */}
      {giftEffects.map((effect) => (
        <div
          key={effect.id}
          className="absolute pointer-events-none animate-bounce"
          style={{
            left: `${effect.x}%`,
            top: `${effect.y}%`,
          }}
        >
          <span className="text-4xl">{effect.emoji}</span>
        </div>
      ))}

      {/* Top Status Bar */}
      <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between">
        {/* Live indicator and stats */}
        <div className="flex items-center gap-2">
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

        {/* Viewer count and stats */}
        <div className="flex items-center gap-2">
          <div className="bg-black/50 rounded-full px-3 py-1 backdrop-blur-sm">
            <div className="flex items-center text-white text-sm">
              <Users className="w-4 h-4 mr-1" />
              <span>{localViewerCount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Left Side - Stream Info */}
      <div className="absolute bottom-24 left-4 z-30">
        <div className="bg-black/50 rounded-lg p-3 backdrop-blur-sm max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="w-10 h-10">
              <AvatarImage src={content.user.avatar} />
              <AvatarFallback>{content.user.displayName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-white font-semibold">{content.user.displayName}</div>
              <div className="text-gray-300 text-sm">@{content.user.username}</div>
            </div>
            <Button
              size="sm"
              variant={isFollowing ? "secondary" : "default"}
              className="ml-2"
              onClick={() => setIsFollowing(!isFollowing)}
            >
              {isFollowing ? "Following" : "Follow"}
            </Button>
          </div>
          
          <div className="text-white text-sm mb-2">
            <div className="font-medium">{content.title}</div>
            <div className="text-gray-300">{content.description}</div>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-300">
            <span>{content.category}</span>
            <span>•</span>
            <span>{content.user.followerCount.toLocaleString()} followers</span>
          </div>
        </div>
      </div>

      {/* Right Side - Interactive Controls */}
      <div className="absolute right-4 bottom-24 z-30 flex flex-col gap-3">
        {/* Like Button */}
        <Button
          onClick={handleLike}
          variant="ghost"
          size="icon"
          className="w-14 h-14 rounded-full bg-black/30 hover:bg-black/50 text-white flex flex-col items-center backdrop-blur-sm"
        >
          <Heart className={cn("w-6 h-6", isLiked && "fill-red-500 text-red-500")} />
          <span className="text-xs mt-1">Like</span>
        </Button>

        {/* Comment Button */}
        <Button
          onClick={() => setShowChat(!showChat)}
          variant="ghost"
          size="icon"
          className="w-14 h-14 rounded-full bg-black/30 hover:bg-black/50 text-white flex flex-col items-center backdrop-blur-sm"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="text-xs mt-1">Chat</span>
        </Button>

        {/* Gift Button */}
        <Button
          onClick={() => setShowGifts(true)}
          variant="ghost"
          size="icon"
          className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white flex flex-col items-center backdrop-blur-sm"
        >
          <Gift className="w-6 h-6" />
          <span className="text-xs mt-1">Gift</span>
        </Button>

        {/* Share Button */}
        <Button
          variant="ghost"
          size="icon"
          className="w-14 h-14 rounded-full bg-black/30 hover:bg-black/50 text-white flex flex-col items-center backdrop-blur-sm"
        >
          <Share2 className="w-6 h-6" />
          <span className="text-xs mt-1">Share</span>
        </Button>

        {/* Quick Reactions */}
        <Button
          onClick={() => setShowQuickReactions(!showQuickReactions)}
          variant="ghost"
          size="icon"
          className="w-14 h-14 rounded-full bg-black/30 hover:bg-black/50 text-white flex flex-col items-center backdrop-blur-sm"
        >
          <Sparkles className="w-6 h-6" />
          <span className="text-xs mt-1">React</span>
        </Button>
      </div>

      {/* Quick Reactions Panel */}
      {showQuickReactions && (
        <div className="absolute right-24 bottom-24 z-30 bg-black/70 backdrop-blur-sm rounded-lg p-3">
          <div className="grid grid-cols-3 gap-2">
            {['❤️', '🔥', '👏', '😂', '😮', '🎉'].map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="icon"
                className="w-10 h-10 text-2xl hover:bg-white/20"
                onClick={() => addReaction(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Overlay */}
      {showChat && (
        <div className="absolute bottom-24 left-4 w-80 h-64 bg-black/70 backdrop-blur-sm rounded-lg border border-gray-700 z-30 flex flex-col">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-700">
            <h3 className="text-white font-medium text-sm">Live Chat</h3>
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6 text-gray-400 hover:text-white"
              onClick={() => setShowChat(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Chat Messages */}
          <div 
            ref={chatRef}
            className="flex-1 overflow-y-auto p-2 space-y-2"
          >
            {chatMessages.map((msg) => (
              <div key={msg.id} className="text-xs">
                {msg.isSystemMessage ? (
                  <div className="text-center text-gray-400">
                    {msg.message}
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <Avatar className="w-5 h-5 flex-shrink-0">
                      <AvatarImage src={msg.user.avatar} />
                      <AvatarFallback className="text-[8px]">{msg.user.username[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-gray-200 truncate">{msg.user.username}</span>
                        {msg.user.verified && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                        )}
                        {msg.user.tier && (
                          <Badge variant="secondary" className="px-1 py-0 text-[6px]">
                            {msg.user.tier}
                          </Badge>
                        )}
                      </div>
                      <p className="text-white break-words">{msg.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 p-0 text-gray-400 hover:text-white"
                          onClick={() => handleLikeMessage(msg.id)}
                        >
                          <ThumbsUp className="w-2 h-2" />
                          <span className="text-[8px] ml-1">{msg.likes || 0}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 p-0 text-gray-400 hover:text-white"
                        >
                          <ThumbsDown className="w-2 h-2" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 p-0 text-gray-400 hover:text-white"
                        >
                          <Reply className="w-2 h-2" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-2 border-t border-gray-700 flex gap-1">
            <Input
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Send a message..."
              className="flex-1 h-7 text-xs bg-gray-800 border-gray-600 text-white"
              onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
            />
            <Button 
              size="sm" 
              className="h-7 px-2"
              onClick={handleSendChat}
            >
              <Send className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Stream Owner Controls */}
      {isUserOwned && (
        <div className="absolute bottom-20 left-4 z-30 flex gap-2">
          <Button
            size="icon"
            className={cn(
              "rounded-full",
              !isMuted && "bg-red-500 hover:bg-red-600"
            )}
          >
            {isMuted ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </Button>
          
          <Button
            size="icon"
            className={cn(
              "rounded-full",
              !videoRef.current?.srcObject && "bg-red-500 hover:bg-red-600"
            )}
          >
            {videoRef.current?.srcObject ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
          </Button>
          
          <Button
            onClick={onEndStream}
            size="icon"
            className="rounded-full bg-red-600 hover:bg-red-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Battle-specific UI */}
      {content.type === 'battle' && content.battleData && (
        <div className="absolute top-1/2 left-4 right-4 transform -translate-y-1/2 z-30">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 max-w-md mx-auto">
            <div className="text-center text-white mb-3">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="w-5 h-5 text-red-500" />
                <span className="font-bold">LIVE BATTLE</span>
              </div>
              <div className="text-sm text-gray-300">
                {content.battleData.type?.toUpperCase()} BATTLE
              </div>
            </div>
            
            {content.battleData.timeRemaining && (
              <div className="text-center mb-3">
                <div className="text-yellow-400 font-bold text-lg">
                  {formatTime(content.battleData.timeRemaining)}
                </div>
                <div className="text-xs text-gray-400">Time Remaining</div>
              </div>
            )}
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={content.user.avatar} />
                    <AvatarFallback>{content.user.displayName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-white text-sm font-medium">{content.user.displayName}</div>
                    <div className="text-xs text-gray-400">
                      {content.battleData.scores?.user1 || 0} SP
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-white font-bold">VS</div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-white text-sm font-medium">
                      {content.battleData.opponent?.displayName || 'Opponent'}
                    </div>
                    <div className="text-xs text-gray-400">
                      {content.battleData.scores?.user2 || 0} SP
                    </div>
                  </div>
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={content.battleData.opponent?.avatar || ''} />
                    <AvatarFallback>
                      {content.battleData.opponent?.displayName?.[0] || 'O'}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              
              {content.battleData.scores && (
                <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="absolute left-0 top-0 h-full bg-red-500"
                    style={{ 
                      width: `${(content.battleData.scores.user1 / (content.battleData.scores.user1 + content.battleData.scores.user2 || 1)) * 100}%` 
                    }}
                  />
                  <div 
                    className="absolute right-0 top-0 h-full bg-blue-500"
                    style={{ 
                      width: `${(content.battleData.scores.user2 / (content.battleData.scores.user1 + content.battleData.scores.user2 || 1)) * 100}%` 
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float-up {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-100px) scale(1.5);
          }
        }
      `}</style>

      {/* Virtual Gifts Modal */}
      {showGifts && (
        <Dialog open={showGifts} onOpenChange={setShowGifts}>
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
            <VisuallyHidden>
              <DialogTitle>Send Gift</DialogTitle>
            </VisuallyHidden>
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold">Send Gift</h3>
                <p className="text-gray-400 text-sm">Support the streamer with virtual gifts</p>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {mockGifts.map((gift) => (
                  <Button
                    key={gift.id}
                    variant="outline"
                    className={cn(
                      "h-auto p-3 flex flex-col items-center gap-1 border-gray-600 hover:border-yellow-400",
                      selectedGift?.id === gift.id && "border-yellow-400 bg-yellow-400/10"
                    )}
                    onClick={() => setSelectedGift(gift)}
                  >
                    <div className="text-2xl">{gift.icon}</div>
                    <div className="text-xs">
                      <div className="text-white">{gift.name}</div>
                      <div className={gift.color}>{gift.value} SP</div>
                    </div>
                  </Button>
                ))}
              </div>
              
              {selectedGift && (
                <div className="text-center pt-4 border-t border-gray-700">
                  <div className="text-4xl mb-2">{selectedGift.icon}</div>
                  <div className="font-medium">{selectedGift.name}</div>
                  <div className="text-yellow-400 mb-4">{selectedGift.value} SP</div>
                  <Button
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    onClick={() => sendGift(selectedGift)}
                  >
                    Send Gift
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default FullScreenLiveStream;