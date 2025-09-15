import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Volume2,
  VolumeX,
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
  Send,
  Star,
  Zap,
  Coffee,
  Diamond,
  Play,
  Pause,
  MoreHorizontal,
  UserPlus,
  Flag,
  DollarSign,
  Trophy,
  ThumbsUp,
  Smile,
  Music,
  Sparkles,
  X,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Card, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';
import { LiveStreamData } from '../../hooks/use-live-content';
import { useToast } from '../../hooks/use-toast';
import { useAuth } from '../../contexts/AuthContext';
import BattleVoting from '../voting/BattleVoting';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

interface LiveChatMessage {
  id: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    verified: boolean;
    tier?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  };
  message: string;
  timestamp: Date;
  type: 'message' | 'gift' | 'join' | 'follow' | 'system' | 'reaction';
  giftInfo?: {
    giftType: string;
    value: number;
    animation: string;
  };
}

interface LiveReaction {
  id: string;
  emoji: string;
  x: number;
  y: number;
  timestamp: number;
}

interface FullScreenLiveStreamProps {
  content: LiveStreamData;
  isActive: boolean;
  isUserOwned?: boolean;
  onEndStream?: () => void;
  className?: string;
}

const mockChatMessages: LiveChatMessage[] = [
  {
    id: '1',
    user: {
      id: 'user1',
      username: 'crypto_king',
      displayName: 'Crypto King',
      avatar: 'https://i.pravatar.cc/150?img=1',
      verified: true,
      tier: 'gold',
    },
    message: 'This stream is fire! 🔥',
    timestamp: new Date(Date.now() - 10000),
    type: 'message',
  },
  {
    id: '2',
    user: {
      id: 'user2',
      username: 'trader_pro',
      displayName: 'Trading Pro',
      avatar: 'https://i.pravatar.cc/150?img=2',
      verified: false,
      tier: 'silver',
    },
    message: 'Just sent a gift! 🎁',
    timestamp: new Date(Date.now() - 5000),
    type: 'gift',
    giftInfo: {
      giftType: 'diamond',
      value: 100,
      animation: 'sparkle',
    },
  },
];

const giftTypes = [
  { id: 'heart', emoji: '❤️', name: 'Heart', value: 1, color: 'text-red-400' },
  { id: 'star', emoji: '⭐', name: 'Star', value: 5, color: 'text-yellow-400' },
  { id: 'diamond', emoji: '💎', name: 'Diamond', value: 10, color: 'text-blue-400' },
  { id: 'crown', emoji: '👑', name: 'Crown', value: 25, color: 'text-purple-400' },
  { id: 'rocket', emoji: '🚀', name: 'Rocket', value: 50, color: 'text-green-400' },
  { id: 'fire', emoji: '🔥', name: 'Fire', value: 100, color: 'text-orange-400' },
];

const quickReactions = ['❤️', '😂', '😮', '👏', '🔥', '💎', '🚀', '👑'];

export const FullScreenLiveStream: React.FC<FullScreenLiveStreamProps> = ({
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
  const [localLikes, setLocalLikes] = useState(Math.floor(content.viewerCount * 0.8));
  const [streamDuration, setStreamDuration] = useState(0);
  
  // Chat and interactions
  const [chatMessages, setChatMessages] = useState<LiveChatMessage[]>(mockChatMessages);
  const [chatMessage, setChatMessage] = useState('');
  const [showChat, setShowChat] = useState(true);
  const [showGifts, setShowGifts] = useState(false);
  const [reactions, setReactions] = useState<LiveReaction[]>([]);
  const [showQuickReactions, setShowQuickReactions] = useState(false);
  
  // Stream controls for owner
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  // Battle voting state
  const [showVoting, setShowVoting] = useState(false);
  const [userBalance] = useState(2500); // Mock user balance
  const [userVotes, setUserVotes] = useState<any[]>([]);
  const [votingPool, setVotingPool] = useState({
    creator1Total: 450,
    creator2Total: 780,
    totalPool: 1230,
    totalVoters: 23,
  });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
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

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Simulate real-time chat messages and interactions
  useEffect(() => {
    if (!isActive || !content.isActive) return;

    const interval = setInterval(() => {
      // Random chat messages
      if (Math.random() < 0.3) {
        const mockUsers = [
          { username: 'viewer123', displayName: 'Viewer 123', avatar: 'https://i.pravatar.cc/150?img=3', verified: false, tier: 'bronze' as const },
          { username: 'crypto_fan', displayName: 'Crypto Fan', avatar: 'https://i.pravatar.cc/150?img=4', verified: true, tier: 'silver' as const },
          { username: 'stream_lover', displayName: 'Stream Lover', avatar: 'https://i.pravatar.cc/150?img=5', verified: false, tier: 'gold' as const },
        ];
        
        const mockMessages = [
          'Amazing content! 🚀',
          'Love this stream!',
          'Keep it up! 💪',
          'This is so helpful',
          'Great insights!',
          'Following now! 🔥',
          'Thanks for the tips!',
          'Wow! 😍',
        ];

        const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
        const randomMessage = mockMessages[Math.floor(Math.random() * mockMessages.length)];
        
        const newMessage: LiveChatMessage = {
          id: `msg-${Date.now()}`,
          user: {
            id: `user-${Date.now()}`,
            ...randomUser,
          },
          message: randomMessage,
          timestamp: new Date(),
          type: 'message',
        };

        setChatMessages(prev => [...prev.slice(-50), newMessage]); // Keep last 50 messages
      }

      // Random viewer count changes
      const viewerChange = Math.floor(Math.random() * 3 - 1);
      setLocalViewerCount(prev => Math.max(1, prev + viewerChange));

      // Random likes
      if (Math.random() < 0.2) {
        setLocalLikes(prev => prev + Math.floor(Math.random() * 3) + 1);
      }
    }, 3000 + Math.random() * 4000); // Random interval 3-7 seconds

    return () => clearInterval(interval);
  }, [isActive, content.isActive]);

  // Start camera if user owns this stream
  useEffect(() => {
    if (isUserOwned && isActive && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(console.error);
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

    const newMessage: LiveChatMessage = {
      id: `msg-${Date.now()}`,
      user: {
        id: user.id,
        username: user.username || 'user',
        displayName: user.name || 'User',
        avatar: user.avatar || '',
        verified: false,
        tier: 'bronze',
      },
      message: chatMessage,
      timestamp: new Date(),
      type: 'message',
    };

    setChatMessages(prev => [...prev.slice(-50), newMessage]);
    setChatMessage('');
    
    toast({
      title: 'Message sent!',
      description: 'Your message was sent to the live chat',
    });
  };

  const handleSendGift = (gift: typeof giftTypes[0]) => {
    if (!user) return;

    const giftMessage: LiveChatMessage = {
      id: `gift-${Date.now()}`,
      user: {
        id: user.id,
        username: user.username || 'user',
        displayName: user.name || 'User',
        avatar: user.avatar || '',
        verified: false,
        tier: 'bronze',
      },
      message: `Sent ${gift.name} ${gift.emoji}`,
      timestamp: new Date(),
      type: 'gift',
      giftInfo: {
        giftType: gift.id,
        value: gift.value,
        animation: 'sparkle',
      },
    };

    setChatMessages(prev => [...prev.slice(-50), giftMessage]);
    addReaction(gift.emoji, 80, 50);
    setShowGifts(false);
    
    toast({
      title: `${gift.name} sent! 🎁`,
      description: `You sent a ${gift.name} worth ${gift.value} coins`,
    });
  };

  const handleQuickReaction = (emoji: string) => {
    addReaction(emoji);
    setShowQuickReactions(false);
    
    if (!user) return;
    
    const reactionMessage: LiveChatMessage = {
      id: `reaction-${Date.now()}`,
      user: {
        id: user.id,
        username: user.username || 'user',
        displayName: user.name || 'User',
        avatar: user.avatar || '',
        verified: false,
        tier: 'bronze',
      },
      message: emoji,
      timestamp: new Date(),
      type: 'reaction',
    };

    setChatMessages(prev => [...prev.slice(-50), reactionMessage]);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (!isLiked) {
      setLocalLikes(prev => prev + 1);
      addReaction('❤️', 85, 30);
    }
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    
    if (!isFollowing && user) {
      const followMessage: LiveChatMessage = {
        id: `follow-${Date.now()}`,
        user: {
          id: user.id,
          username: user.username || 'user',
          displayName: user.name || 'User',
          avatar: user.avatar || '',
          verified: false,
          tier: 'bronze',
        },
        message: `Started following ${content.user.displayName}! 🎉`,
        timestamp: new Date(),
        type: 'follow',
      };

      setChatMessages(prev => [...prev.slice(-50), followMessage]);
    }
    
    toast({
      title: isFollowing ? 'Unfollowed' : 'Following!',
      description: `@${content.user.username}`,
    });
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
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

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getTierColor = (tier?: string) => {
    switch (tier) {
      case 'diamond': return 'text-blue-400 border-blue-400';
      case 'platinum': return 'text-purple-400 border-purple-400';
      case 'gold': return 'text-yellow-400 border-yellow-400';
      case 'silver': return 'text-gray-300 border-gray-300';
      default: return 'text-orange-400 border-orange-400';
    }
  };

  const getBattleProgress = () => {
    if (!content.battleData?.scores) return 50;
    const total = content.battleData.scores.user1 + content.battleData.scores.user2;
    if (total === 0) return 50;
    return (content.battleData.scores.user1 / total) * 100;
  };

  // Handle placing a vote in battle
  const handlePlaceVote = (vote: any) => {
    if (userVotes.length > 0) {
      toast({
        title: "Vote Already Placed! 🚫",
        description: "You can only vote once per battle",
        variant: "destructive",
      });
      return;
    }

    const newVote = {
      ...vote,
      id: Date.now().toString(),
      timestamp: new Date(),
      status: 'active',
    };

    setUserVotes(prev => [...prev, newVote]);

    // Update voting pool
    setVotingPool(prev => ({
      ...prev,
      creator1Total: vote.creatorId === content.user.id ? prev.creator1Total + vote.amount : prev.creator1Total,
      creator2Total: vote.creatorId === content.battleData?.opponent?.id ? prev.creator2Total + vote.amount : prev.creator2Total,
      totalPool: prev.totalPool + vote.amount,
      totalVoters: prev.totalVoters + 1,
    }));

    toast({
      title: "Vote Placed! 🎯",
      description: `${vote.amount} SP placed`,
    });

    setShowVoting(false);
  };

  return (
    <div className={cn("relative h-screen w-full bg-black overflow-hidden snap-start snap-always", className)}>
      {/* Video Background */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted={isMuted}
        playsInline
        poster={`https://images.unsplash.com/photo-${content.type === 'battle' ? '1571019613454-1cb2f99b2d8b' : '1639762681485-074b7f938ba0'}?w=800`}
        onClick={togglePlayPause}
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
              <span>{formatNumber(localViewerCount)}</span>
            </div>
          </div>
          
          <div className="bg-black/50 rounded-full px-3 py-1 backdrop-blur-sm">
            <div className="flex items-center text-white text-sm">
              <Heart className="w-4 h-4 mr-1" />
              <span>{formatNumber(localLikes)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Battle UI */}
      {content.type === 'battle' && content.battleData && (
        <div className="absolute top-20 left-4 right-4 z-30">
          <Card className="bg-black/70 border-gray-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8 border-2 border-blue-400">
                    <AvatarImage src={content.user.avatar} />
                    <AvatarFallback>{content.user.displayName[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-white font-medium">{content.battleData.scores?.user1 || 0}</span>
                </div>
                <div className="text-white font-bold text-lg">VS</div>
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
                className="h-3 bg-gray-600"
              />
              {content.battleData.timeRemaining && (
                <div className="text-center mt-2">
                  <span className="text-yellow-400 font-bold text-lg">
                    {formatTime(content.battleData.timeRemaining)}
                  </span>
                </div>
              )}

              {/* Vote Button */}
              <div className="mt-3 flex justify-center">
                <Button
                  onClick={() => setShowVoting(true)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Place Vote
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stream Owner Controls */}
      {isUserOwned && (
        <div className="absolute bottom-28 left-4 z-30 flex gap-2">
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
            onClick={() => setShowSettings(!showSettings)}
            size="icon"
            className="rounded-full"
          >
            <Settings className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={onEndStream}
            size="icon"
            className="rounded-full bg-red-600 hover:bg-red-700"
          >
            <Square className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Live Chat */}
      {showChat && (
        <div className="absolute right-4 top-32 bottom-28 w-72 z-30">
          <Card className="h-full bg-black/70 border-gray-600 backdrop-blur-sm">
            <CardContent className="p-0 h-full flex flex-col">
              <div className="p-3 border-b border-gray-600">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Live Chat
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowChat(false)}
                    className="text-white/60 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-2">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className="flex items-start gap-2">
                      <Avatar className={cn("w-6 h-6 border", getTierColor(msg.user.tier))}>
                        <AvatarImage src={msg.user.avatar} />
                        <AvatarFallback className="text-xs">
                          {msg.user.displayName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className={cn("font-medium text-xs", getTierColor(msg.user.tier))}>
                            {msg.user.username}
                          </span>
                          {msg.user.verified && (
                            <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                              <div className="w-1.5 h-1.5 bg-white rounded-full" />
                            </div>
                          )}
                          {msg.type === 'gift' && (
                            <Badge variant="secondary" className="text-xs bg-yellow-500/20 text-yellow-400">
                              Gift
                            </Badge>
                          )}
                          {msg.type === 'follow' && (
                            <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400">
                              Follow
                            </Badge>
                          )}
                        </div>
                        <p className="text-white text-xs break-words">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
              </ScrollArea>
              
              {!isUserOwned && (
                <div className="p-3 border-t border-gray-600">
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="Say something..."
                      className="flex-1 bg-gray-800 border-gray-600 text-white text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                    />
                    <Button 
                      onClick={handleSendChat}
                      size="sm"
                      disabled={!chatMessage.trim()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Quick actions */}
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowQuickReactions(!showQuickReactions)}
                      className="text-white/60 hover:text-white px-2 py-1 h-auto"
                    >
                      <Smile className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowGifts(!showGifts)}
                      className="text-yellow-400 hover:text-yellow-300 px-2 py-1 h-auto"
                    >
                      <Gift className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Reactions Popup */}
      {showQuickReactions && (
        <div className="absolute right-4 bottom-32 z-40 bg-black/80 rounded-lg p-2 backdrop-blur-sm">
          <div className="grid grid-cols-4 gap-1">
            {quickReactions.map((emoji, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={() => handleQuickReaction(emoji)}
                className="text-2xl hover:scale-125 transition-transform p-1"
              >
                {emoji}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Gifts Popup */}
      {showGifts && (
        <div className="absolute right-4 bottom-32 z-40 bg-black/80 rounded-lg p-3 backdrop-blur-sm">
          <h4 className="text-white font-semibold mb-2 text-sm">Send Gift</h4>
          <div className="grid grid-cols-2 gap-2">
            {giftTypes.map((gift) => (
              <Button
                key={gift.id}
                variant="ghost"
                onClick={() => handleSendGift(gift)}
                className="flex flex-col items-center gap-1 p-2 text-white hover:bg-white/10"
              >
                <span className="text-lg">{gift.emoji}</span>
                <span className="text-xs">{gift.value}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Stream Info and Controls */}
      <div className="absolute bottom-0 left-0 right-80 z-30 p-4">
        {/* User Info */}
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="w-12 h-12 border-2 border-white">
            <AvatarImage src={content.user.avatar} />
            <AvatarFallback>{content.user.displayName[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold text-lg">@{content.user.username}</span>
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
            <div className="text-white/80 text-sm">
              {content.user.displayName} • {formatNumber(localViewerCount)} watching
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
              <UserPlus className="w-4 h-4 mr-1" />
              {isFollowing ? "Following" : "Follow"}
            </Button>
          )}
        </div>

        {/* Title and Description */}
        <div className="mb-4">
          <h3 className="text-white text-xl font-bold mb-1">{content.title}</h3>
          <p className="text-white/90 text-sm line-clamp-2">{content.description}</p>
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="absolute bottom-4 right-4 z-30">
        {!showChat && (
          <Button
            onClick={() => setShowChat(true)}
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white mb-3"
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
        )}
        
        <div className="flex flex-col gap-3">
          {/* Like Button */}
          <Button
            onClick={handleLike}
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex flex-col items-center"
          >
            <Heart className={cn("w-6 h-6", isLiked && "fill-red-500 text-red-500")} />
            <span className="text-xs mt-1">{formatNumber(localLikes)}</span>
          </Button>

          {/* Share Button */}
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex flex-col items-center"
          >
            <Share2 className="w-6 h-6" />
            <span className="text-xs mt-1">Share</span>
          </Button>

          {/* Volume Button */}
          <Button
            onClick={() => setIsMuted(!isMuted)}
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white"
          >
            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Battle Voting Modal */}
      {showVoting && content.type === 'battle' && content.battleData && (
        <Dialog open={showVoting} onOpenChange={setShowVoting}>
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl z-[110]">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">Battle Voting</DialogTitle>
            </DialogHeader>
            <div className="max-h-[70vh] overflow-y-auto">
              <BattleVoting
                battleId={content.id}
                creator1={{
                  id: content.user.id,
                  username: content.user.username,
                  displayName: content.user.displayName,
                  avatar: content.user.avatar,
                  tier: 'pro_creator' as const,
                  verified: content.user.verified,
                  currentScore: content.battleData.scores?.user1 || 0,
                  winRate: 75,
                  totalVotes: 145,
                  isLeading: (content.battleData.scores?.user1 || 0) > (content.battleData.scores?.user2 || 0),
                }}
                creator2={{
                  id: content.battleData.opponent?.id || 'opponent',
                  username: content.battleData.opponent?.username || 'opponent',
                  displayName: content.battleData.opponent?.displayName || 'Opponent',
                  avatar: content.battleData.opponent?.avatar || '',
                  tier: 'pro_creator' as const,
                  verified: content.battleData.opponent?.verified || false,
                  currentScore: content.battleData.scores?.user2 || 0,
                  winRate: 68,
                  totalVotes: 89,
                  isLeading: (content.battleData.scores?.user2 || 0) > (content.battleData.scores?.user1 || 0),
                }}
                isLive={content.isActive}
                timeRemaining={content.battleData.timeRemaining || 300}
                userBalance={userBalance}
                onPlaceVote={handlePlaceVote}
                userVotes={userVotes}
                votingPool={votingPool}
              />
            </div>
          </DialogContent>
        </Dialog>
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
    </div>
  );
};

export default FullScreenLiveStream;
