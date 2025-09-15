import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Users,
  Gift,
  X,
  Send,
  Smile,
  Diamond,
  Play,
  Pause,
  UserPlus,
  Flag,
  Crown,
  Radio,
  Target,
  Clock,
  Eye,
  Coins,
  DollarSign,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { cn } from '../../lib/utils';
import { LiveStreamData } from '../../hooks/use-live-content';
import { useToast } from '../../hooks/use-toast';
import { useAuth } from '../../contexts/AuthContext';
import BattleVoting from '../voting/BattleVoting';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import VirtualGiftsAndTips from '../premium/VirtualGiftsAndTips';

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
  type: 'message' | 'gift' | 'join' | 'follow' | 'system' | 'reaction' | 'like';
}

interface MobileLiveStreamLayoutProps {
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
      username: 'eucilides_vaz',
      displayName: 'Eucilides Vaz',
      avatar: 'https://i.pravatar.cc/150?img=1',
      verified: false,
      tier: 'gold',
    },
    message: 'good cooking 😂😂😂',
    timestamp: new Date(Date.now() - 10000),
    type: 'message',
  },
  {
    id: '2',
    user: {
      id: 'user2',
      username: 'brAvO',
      displayName: 'Tez On The Run',
      avatar: 'https://i.pravatar.cc/150?img=2',
      verified: true,
      tier: 'diamond',
    },
    message: '',
    timestamp: new Date(Date.now() - 5000),
    type: 'system',
  },
  {
    id: '3',
    user: {
      id: 'user3',
      username: 'miahzinspire',
      displayName: 'Miahzinspire',
      avatar: 'https://i.pravatar.cc/150?img=3',
      verified: false,
      tier: 'silver',
    },
    message: 'joined',
    timestamp: new Date(Date.now() - 3000),
    type: 'join',
  },
  {
    id: '4',
    user: {
      id: 'user4',
      username: 'sam',
      displayName: 'Sam',
      avatar: 'https://i.pravatar.cc/150?img=4',
      verified: false,
      tier: 'bronze',
    },
    message: 'liked the LIVE',
    timestamp: new Date(Date.now() - 1000),
    type: 'like',
  },
];

const quickReactions = ['❤️', '😂', '😮', '���', '��', '💎', '🚀', '👑'];

export const MobileLiveStreamLayout: React.FC<MobileLiveStreamLayoutProps> = ({
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
  const [isFollowing, setIsFollowing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(isActive);
  const [localViewerCount, setLocalViewerCount] = useState(content.viewerCount);
  const [localLikes, setLocalLikes] = useState(Math.floor(content.viewerCount * 0.8));
  
  // Chat and interactions
  const [chatMessages, setChatMessages] = useState<LiveChatMessage[]>(mockChatMessages);
  const [chatMessage, setChatMessage] = useState('');
  const [showGifts, setShowGifts] = useState(false);
  const [showVoting, setShowVoting] = useState(false);
  const [showQuickReactions, setShowQuickReactions] = useState(false);
  
  // Battle voting state
  const [userBalance] = useState(2500);
  const [userVotes, setUserVotes] = useState<any[]>([]);
  const [votingPool, setVotingPool] = useState({
    creator1Total: 450,
    creator2Total: 780,
    totalPool: 1230,
    totalVoters: 23,
  });
  
  const videoRef = useRef<HTMLVideoElement>(null);

  // Simulate real-time updates
  useEffect(() => {
    if (!isActive || !content.isActive) return;

    const interval = setInterval(() => {
      // Random chat messages
      if (Math.random() < 0.4) {
        const mockUsers = [
          { username: 'viewer123', displayName: 'Viewer 123', avatar: 'https://i.pravatar.cc/150?img=5', verified: false, tier: 'bronze' as const },
          { username: 'crypto_fan', displayName: 'Crypto Fan', avatar: 'https://i.pravatar.cc/150?img=6', verified: true, tier: 'gold' as const },
          { username: 'stream_lover', displayName: 'Stream Lover', avatar: 'https://i.pravatar.cc/150?img=7', verified: false, tier: 'silver' as const },
        ];
        
        const mockMessages = [
          'Amazing! 🚀',
          'Love this! ❤️',
          'Keep it up! 💪',
          'So cool! 😍',
          'Great work! 👏',
          'Fire content! 🔥',
          'joined',
          'liked the LIVE',
        ];

        const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
        const randomMessage = mockMessages[Math.floor(Math.random() * mockMessages.length)];
        
        const messageType = randomMessage === 'joined' ? 'join' : 
                           randomMessage === 'liked the LIVE' ? 'like' : 'message';
        
        const newMessage: LiveChatMessage = {
          id: `msg-${Date.now()}`,
          user: {
            id: `user-${Date.now()}`,
            ...randomUser,
          },
          message: randomMessage,
          timestamp: new Date(),
          type: messageType,
        };

        setChatMessages(prev => [...prev.slice(-10), newMessage]); // Keep last 10 messages
      }

      // Random viewer count changes
      const viewerChange = Math.floor(Math.random() * 5 - 2);
      setLocalViewerCount(prev => Math.max(1, prev + viewerChange));

      // Random likes
      if (Math.random() < 0.3) {
        setLocalLikes(prev => prev + Math.floor(Math.random() * 3) + 1);
      }
    }, 2000 + Math.random() * 3000);

    return () => clearInterval(interval);
  }, [isActive, content.isActive]);

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

    setChatMessages(prev => [...prev.slice(-10), newMessage]);
    setChatMessage('');
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (!isLiked) {
      setLocalLikes(prev => prev + 1);
      
      if (user) {
        const likeMessage: LiveChatMessage = {
          id: `like-${Date.now()}`,
          user: {
            id: user.id,
            username: user.username || 'user',
            displayName: user.name || 'User',
            avatar: user.avatar || '',
            verified: false,
            tier: 'bronze',
          },
          message: 'liked the LIVE',
          timestamp: new Date(),
          type: 'like',
        };

        setChatMessages(prev => [...prev.slice(-10), likeMessage]);
      }
    }
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);

    toast({
      title: isFollowing ? 'Unfollowed' : 'Following!',
      description: `@${content.user.username}`,
    });
  };

  const handleQuickReaction = (emoji: string) => {
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

    setChatMessages(prev => [...prev.slice(-10), reactionMessage]);

    toast({
      title: `Reaction sent! ${emoji}`,
      description: "Your reaction was added to the live chat",
    });
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getTierIcon = (tier?: string) => {
    switch (tier) {
      case 'diamond': return <Diamond className="w-3 h-3 text-blue-400" />;
      case 'gold': return <Crown className="w-3 h-3 text-yellow-400" />;
      default: return null;
    }
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
        muted
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

      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/50 to-transparent p-4">
        <div className="flex items-center justify-between">
          {/* Left: Profile Info */}
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border-2 border-white">
              <AvatarImage src={content.user.avatar} />
              <AvatarFallback>{content.user.displayName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold">{content.user.username}</span>
                <div className="flex items-center text-white/70 text-sm">
                  <Heart className="w-3 h-3 mr-1" />
                  {formatNumber(localLikes)}
                </div>
              </div>
            </div>
            {!isUserOwned && (
              <Button
                onClick={handleFollow}
                size="sm"
                className={cn(
                  "bg-red-500 hover:bg-red-600 text-white font-medium px-4 rounded-full",
                  isFollowing && "bg-gray-600 hover:bg-gray-700"
                )}
              >
                {isFollowing ? "Following" : "+ Follow"}
              </Button>
            )}
          </div>

          {/* Right: Viewer Count & Close */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-black/30 rounded-full px-3 py-1">
              <Users className="w-4 h-4 text-white mr-1" />
              <span className="text-white text-sm font-medium">{formatNumber(localViewerCount)}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onEndStream}
              className="text-white hover:bg-white/20 rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Live Badges */}
      <div className="absolute top-20 left-0 right-0 z-30 flex items-center justify-between px-4">
        <Badge
          className="bg-yellow-500/90 text-black font-semibold px-3 py-1.5 rounded-full border-0 shadow-lg cursor-pointer hover:bg-yellow-400/90 transition-colors"
          onClick={() => {
            toast({
              title: "Daily Ranking 👑",
              description: "View today's top creators and streamers",
            });
          }}
        >
          <Crown className="w-3 h-3 mr-1" />
          Daily Ranking
        </Badge>
        <Badge
          className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold px-3 py-1.5 rounded-full border-0 shadow-lg cursor-pointer hover:from-pink-600 hover:to-purple-600 transition-colors"
          onClick={() => {
            toast({
              title: "Explore Content 🌟",
              description: "Discover trending streams and creators",
            });
          }}
        >
          Explore →
        </Badge>
      </div>

      {/* Live Indicator */}
      <div className="absolute top-14 left-4 z-30">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-75"></div>
          </div>
          <span className="text-white text-sm font-semibold">LIVE</span>
        </div>
      </div>

      {/* Battle UI (if battle) */}
      {content.type === 'battle' && content.battleData && (
        <div className="absolute top-32 left-4 right-4 z-30">
          <div className="bg-black/70 rounded-lg p-3 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6 border border-blue-400">
                  <AvatarImage src={content.user.avatar} />
                  <AvatarFallback className="text-xs">{content.user.displayName[0]}</AvatarFallback>
                </Avatar>
                <span className="text-white text-sm font-medium">{content.battleData.scores?.user1 || 0}</span>
              </div>
              <div className="text-white font-bold text-sm">VS</div>
              <div className="flex items-center gap-2">
                <span className="text-white text-sm font-medium">{content.battleData.scores?.user2 || 0}</span>
                <Avatar className="w-6 h-6 border border-red-400">
                  <AvatarImage src={content.battleData.opponent?.avatar} />
                  <AvatarFallback className="text-xs">{content.battleData.opponent?.displayName[0]}</AvatarFallback>
                </Avatar>
              </div>
            </div>
            
            <div className="flex justify-center mt-2">
              <Button
                onClick={() => setShowVoting(true)}
                size="sm"
                className="bg-green-500 hover:bg-green-600 text-white px-4 rounded-full"
              >
                <DollarSign className="w-3 h-3 mr-1" />
                Vote
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Live Chat Messages Overlay */}
      <div className="absolute left-4 bottom-36 right-20 z-30 space-y-2">
        {chatMessages.slice(-4).map((msg, index) => (
          <div
            key={msg.id}
            className="flex items-start gap-2 animate-in slide-in-from-bottom-2 duration-300"
            style={{
              animationDelay: `${index * 100}ms`,
              opacity: 0.9 + (index * 0.025) // Slightly more opacity for newer messages
            }}
          >
            <Avatar className="w-7 h-7 border border-white/30 flex-shrink-0">
              <AvatarImage src={msg.user.avatar} />
              <AvatarFallback className="text-xs">{msg.user.displayName[0]}</AvatarFallback>
            </Avatar>
            <div className="bg-black/60 rounded-2xl px-3 py-1.5 backdrop-blur-sm max-w-xs border border-white/10">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-white text-xs font-semibold">{msg.user.username}</span>
                {getTierIcon(msg.user.tier)}
                {msg.user.verified && (
                  <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                )}
                {msg.type === 'join' && (
                  <span className="text-green-400 text-xs font-medium">joined</span>
                )}
                {msg.type === 'like' && (
                  <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                )}
              </div>
              {msg.message && msg.type === 'message' && (
                <p className="text-white text-sm leading-tight">{msg.message}</p>
              )}
              {msg.type === 'like' && (
                <p className="text-white text-sm leading-tight">liked the LIVE</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        <div className="p-4 pt-8">
          <div className="flex items-center gap-3">
            {/* Message Input */}
            <div className="flex-1">
              <div className="relative">
                <Input
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Say something..."
                  className="bg-white/15 border-white/20 text-white placeholder:text-white/60 rounded-full px-4 py-3 text-sm backdrop-blur-md shadow-lg"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                />
                {chatMessage && (
                  <Button
                    onClick={handleSendChat}
                    size="sm"
                    className="absolute right-1 top-1 bg-blue-500 hover:bg-blue-600 rounded-full w-8 h-8 p-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              <Button
                onClick={() => setShowQuickReactions(!showQuickReactions)}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 rounded-full w-10 h-10 backdrop-blur-sm"
                title="Reactions"
              >
                <Smile className="w-5 h-5" />
              </Button>

              <Button
                onClick={() => {
                  toast({
                    title: "Guests Feature 👥",
                    description: "View and invite guests to your live stream",
                  });
                }}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 rounded-full w-10 h-10 backdrop-blur-sm"
                title="Guests"
              >
                <Users className="w-5 h-5" />
              </Button>

              <Button
                onClick={() => {
                  toast({
                    title: "Recharge Wallet 💰",
                    description: "Add SoftPoints to your wallet",
                  });
                }}
                variant="ghost"
                size="icon"
                className="text-yellow-400 hover:bg-white/20 rounded-full w-10 h-10 backdrop-blur-sm"
                title="Recharge"
              >
                <Coins className="w-5 h-5" />
              </Button>

              <VirtualGiftsAndTips
                recipientId={content.user.id}
                recipientName={content.type === 'battle' ? "Battle Creators" : content.user.displayName}
                contentId={content.id}
                recipientType={content.type === 'battle' ? "battle" : "livestream"}
                battleData={content.type === 'battle' && content.battleData ? {
                  creator1: {
                    id: content.user.id,
                    username: content.user.username,
                    displayName: content.user.displayName,
                    avatar: content.user.avatar,
                  },
                  creator2: {
                    id: content.battleData.opponent?.id || 'opponent',
                    username: content.battleData.opponent?.username || 'opponent',
                    displayName: content.battleData.opponent?.displayName || 'Opponent',
                    avatar: content.battleData.opponent?.avatar || '',
                  }
                } : undefined}
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-pink-400 hover:bg-white/20 rounded-full w-10 h-10 backdrop-blur-sm"
                    title="Gift"
                  >
                    <Gift className="w-5 h-5" />
                  </Button>
                }
              />

              <Button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: content.title,
                      text: content.description,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    toast({
                      title: "Link Copied! 📋",
                      description: "Share link copied to clipboard",
                    });
                  }
                }}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 rounded-full w-10 h-10 backdrop-blur-sm"
                title="Share"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom safe area for mobile */}
        <div className="h-20 bg-black/50"></div>
      </div>

      {/* Right Side Actions */}
      <div className="absolute bottom-48 right-4 z-30 flex flex-col gap-3">
        {/* Like Button */}
        <Button
          onClick={handleLike}
          variant="ghost"
          size="icon"
          className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex flex-col items-center backdrop-blur-sm"
        >
          <Heart className={cn("w-6 h-6", isLiked && "fill-red-500 text-red-500")} />
        </Button>
      </div>

      {/* Quick Reactions Popup */}
      {showQuickReactions && (
        <div className="absolute bottom-32 left-4 right-4 z-50 bg-black/80 rounded-2xl p-4 backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-semibold">Quick Reactions</h4>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowQuickReactions(false)}
              className="text-white hover:bg-white/20 rounded-full w-8 h-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {quickReactions.map((emoji, index) => (
              <Button
                key={index}
                variant="ghost"
                size="lg"
                onClick={() => {
                  handleQuickReaction(emoji);
                  setShowQuickReactions(false);
                }}
                className="text-4xl hover:scale-125 transition-transform p-3 h-auto bg-white/10 hover:bg-white/20 rounded-xl"
              >
                {emoji}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Battle Voting Modal */}
      {showVoting && content.type === 'battle' && content.battleData && (
        <Dialog open={showVoting} onOpenChange={setShowVoting}>
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-sm mx-4 rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-center">Battle Voting</DialogTitle>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto">
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
    </div>
  );
};

export default MobileLiveStreamLayout;
