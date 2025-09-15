import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  Gift,
  Share2,
  MessageCircle,
  Users,
  Clock,
  ArrowLeft,
  Volume2,
  VolumeX,
  Crown,
  Trophy,
  Flame,
  Star,
  DollarSign,
  ChevronUp,
  ChevronDown,
  Coins,
  Target,
  Sparkles,
  Plus,
  Send,
  Smile,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import BattleVoting from '@/components/voting/BattleVoting';

interface Creator {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  verified: boolean;
  score: number;
  wins: number;
  followers?: string | number;
  tier: 'rising_star' | 'pro_creator' | 'legend';
  winRate: number;
  totalVotes: number;
  isLeading: boolean;
  currentScore: number;
}

interface Vote {
  id: string;
  amount: number;
  creatorId: string;
  odds: number;
  potentialWinning: number;
  timestamp: Date;
  status: 'active' | 'won' | 'lost' | 'refunded';
}

interface Gift {
  id: string;
  name: string;
  icon: string;
  value: number;
  color: string;
}

interface ChatMessage {
  id: string;
  user: {
    username: string;
    avatar: string;
  };
  message: string;
  timestamp: Date;
  isSystemMessage?: boolean;
}

interface TikTokStyleBattleProps {
  creator1: Creator;
  creator2: Creator;
  timeRemaining: number; // in seconds
  viewerCount: number;
  onExit: () => void;
  onVote?: (creatorId: string, amount: number) => void;
  onGift?: (creatorId: string, gift: Gift) => void;
}

const gifts: Gift[] = [
  { id: '1', name: 'Rose', icon: '🌹', value: 1, color: 'text-pink-400' },
  { id: '2', name: 'Heart', icon: '❤️', value: 5, color: 'text-red-400' },
  { id: '3', name: 'Diamond', icon: '💎', value: 10, color: 'text-blue-400' },
  { id: '4', name: 'Crown', icon: '👑', value: 25, color: 'text-yellow-400' },
  { id: '5', name: 'Rocket', icon: '🚀', value: 50, color: 'text-purple-400' },
  { id: '6', name: 'Galaxy', icon: '🌌', value: 100, color: 'text-indigo-400' },
];

const TikTokStyleBattle: React.FC<TikTokStyleBattleProps> = ({
  creator1,
  creator2,
  timeRemaining: initialTime,
  viewerCount: initialViewers,
  onExit,
  onVote,
  onGift,
}) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [viewers, setViewers] = useState(initialViewers);
  const [isMuted, setIsMuted] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      user: { username: 'system', avatar: '' },
      message: 'LIVE Match has started! Cheer on your creator, like the match, and send Gifts.',
      timestamp: new Date(),
      isSystemMessage: true,
    },
    {
      id: '2',
      user: { username: 'PRINCE', avatar: 'https://i.pravatar.cc/32?img=1' },
      message: '👑 OF GHANA 🇬🇭 🇵🇸 joined',
      timestamp: new Date(),
      isSystemMessage: true,
    },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [showGifts, setShowGifts] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<string | null>(null);
  const [scores, setScores] = useState({
    creator1: creator1.score,
    creator2: creator2.score,
  });
  const [totalVotes, setTotalVotes] = useState({ creator1: 12, creator2: 6 });
  const [giftEffects, setGiftEffects] = useState<Array<{ id: string; creatorId: string; gift: Gift; timestamp: Date }>>([]);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [userVotes, setUserVotes] = useState<Vote[]>([]);
  const [userBalance] = useState(2500); // Mock user balance
  const [votingPool, setVotingPool] = useState({
    creator1Total: 450,
    creator2Total: 780,
    totalPool: 1230,
    totalVoters: 23,
  });

  const chatRef = useRef<HTMLDivElement>(null);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Battle ended
          toast({
            title: "Battle Ended! 🏆",
            description: `${scores.creator1 > scores.creator2 ? creator1.displayName : creator2.displayName} wins!`,
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, scores, creator1.displayName, creator2.displayName, toast]);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Random viewer changes
      setViewers(prev => Math.max(100, prev + Math.floor(Math.random() * 20 - 5)));
      
      // Random score updates
      if (Math.random() > 0.8) {
        const isCreator1 = Math.random() > 0.5;
        const points = Math.floor(Math.random() * 15) + 1;
        
        setScores(prev => ({
          ...prev,
          [isCreator1 ? 'creator1' : 'creator2']: prev[isCreator1 ? 'creator1' : 'creator2'] + points
        }));
      }
      
      // Random chat messages
      if (Math.random() > 0.85) {
        const messages = [
          "🔥 This is insane!",
          "Go go go!",
          "Amazing battle! 💯",
          "Team Red! ❤️",
          "Team Blue! 💙",
          "Epic moves! 🚀",
          "Who's winning? ���",
          "Send more gifts! 🎁",
        ];
        
        const newMsg: ChatMessage = {
          id: Date.now().toString(),
          user: {
            username: `user${Math.floor(Math.random() * 1000)}`,
            avatar: `https://i.pravatar.cc/32?u=${Math.random()}`,
          },
          message: messages[Math.floor(Math.random() * messages.length)],
          timestamp: new Date(),
        };
        
        setChatMessages(prev => [...prev.slice(-15), newMsg]);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getLeadingCreator = () => {
    return scores.creator1 > scores.creator2 ? creator1 : creator2;
  };

  const getScorePercentage = (creatorScore: number) => {
    const total = scores.creator1 + scores.creator2;
    return total > 0 ? (creatorScore / total) * 100 : 50;
  };

  const handleSendGift = (gift: Gift) => {
    if (!selectedCreator) return;
    
    // Add gift effect
    const effectId = Date.now().toString();
    setGiftEffects(prev => [...prev, {
      id: effectId,
      creatorId: selectedCreator,
      gift,
      timestamp: new Date(),
    }]);
    
    // Remove effect after animation
    setTimeout(() => {
      setGiftEffects(prev => prev.filter(effect => effect.id !== effectId));
    }, 3000);
    
    // Update scores
    setScores(prev => ({
      ...prev,
      [selectedCreator === creator1.id ? 'creator1' : 'creator2']: 
        prev[selectedCreator === creator1.id ? 'creator1' : 'creator2'] + gift.value
    }));
    
    setShowGifts(false);
    setSelectedCreator(null);
    
    if (onGift) {
      onGift(selectedCreator, gift);
    }
    
    toast({
      title: `${gift.icon} ${gift.name} sent!`,
      description: `+${gift.value} SP to ${selectedCreator === creator1.id ? creator1.displayName : creator2.displayName}`,
    });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      user: {
        username: 'you',
        avatar: 'https://i.pravatar.cc/32?u=you',
      },
      message: newMessage,
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleLike = () => {
    // Add some points to a random creator
    const isCreator1 = Math.random() > 0.5;
    setScores(prev => ({
      ...prev,
      [isCreator1 ? 'creator1' : 'creator2']: prev[isCreator1 ? 'creator1' : 'creator2'] + 2
    }));

    toast({
      title: "❤️ Liked!",
      description: "+2 SP added to the battle",
    });
  };

  const handleVote = () => {
    // Open voting modal with proper BattleVoting component
    setShowVoteModal(true);
  };

  const handlePlaceVote = (vote: Omit<Vote, 'id' | 'timestamp' | 'status'>) => {
    // Check if user has already voted in this battle
    if (userVotes.length > 0) {
      toast({
        title: "Vote Already Placed! 🚫",
        description: "You can only vote once per battle",
        variant: "destructive",
      });
      return;
    }

    const newVote: Vote = {
      ...vote,
      id: Date.now().toString(),
      timestamp: new Date(),
      status: 'active',
    };

    setUserVotes(prev => [...prev, newVote]);

    // Update voting pool
    setVotingPool(prev => ({
      ...prev,
      creator1Total: vote.creatorId === creator1.id ? prev.creator1Total + vote.amount : prev.creator1Total,
      creator2Total: vote.creatorId === creator2.id ? prev.creator2Total + vote.amount : prev.creator2Total,
      totalPool: prev.totalPool + vote.amount,
      totalVoters: prev.totalVoters + 1,
    }));

    if (onVote) {
      onVote(vote.creatorId, vote.amount);
    }

    toast({
      title: "🎯 Vote Placed!",
      description: `${vote.amount} SP on ${vote.creatorId === creator1.id ? creator1.displayName : creator2.displayName}`,
    });
  };

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden">
      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/90 to-transparent">
        <div className="flex items-center justify-between p-4 pt-8">
          {/* Left side - Back button and Live indicator */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onExit}
              className="text-white hover:bg-white/20 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center gap-2">
              <Badge className="bg-red-500 text-white animate-pulse px-2 py-1">
                <Flame className="w-3 h-3 mr-1" />
                LIVE
              </Badge>
              
              <div className="flex items-center gap-1 text-white text-sm">
                <Users className="w-4 h-4" />
                <span>{viewers.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Center - Timer and Battle Status */}
          <div className="text-center">
            <div className="text-white text-2xl font-bold">
              {formatTime(timeLeft)}
            </div>
            <div className="text-white/70 text-xs">
              0/{Math.floor(timeLeft / 60 + 1)}
            </div>
          </div>

          {/* Right side - Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMuted(!isMuted)}
              className="text-white hover:bg-white/20 rounded-full"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 rounded-full"
            >
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Battle Score Bar */}
        <div className="px-4 pb-4">
          <div className="bg-black/50 rounded-full p-1 backdrop-blur-sm">
            <div className="relative h-8 bg-gray-800 rounded-full overflow-hidden">
              {/* Creator 1 Score */}
              <div 
                className="absolute left-0 top-0 h-full bg-red-500 transition-all duration-1000 flex items-center justify-start pl-2"
                style={{ width: `${getScorePercentage(scores.creator1)}%` }}
              >
                <span className="text-white text-xs font-bold">
                  WIN x {totalVotes.creator1}
                </span>
              </div>
              
              {/* Creator 2 Score */}
              <div 
                className="absolute right-0 top-0 h-full bg-blue-500 transition-all duration-1000 flex items-center justify-end pr-2"
                style={{ width: `${getScorePercentage(scores.creator2)}%` }}
              >
                <span className="text-white text-xs font-bold">
                  WIN x {totalVotes.creator2}
                </span>
              </div>
              
              {/* Center Timer */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black rounded-full px-3 py-1 flex items-center gap-2">
                  <Clock className="w-3 h-3 text-white" />
                  <span className="text-white text-xs font-bold">
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Split Screen Battle Area */}
      <div className="absolute inset-0 pt-32">
        <div className="grid grid-cols-2 h-full">
          {/* Creator 1 Side */}
          <div className="relative bg-gradient-to-br from-red-900/20 to-red-800/20">
            {/* Mock video background */}
            <div className="absolute inset-0 bg-gray-900">
              <img 
                src={creator1.avatar}
                alt={creator1.displayName}
                className="w-full h-full object-cover opacity-50"
              />
            </div>
            
            {/* Creator Info Overlay */}
            <div className="absolute top-4 left-4 right-4">
              <div className="bg-black/60 rounded-lg p-3 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="w-8 h-8 ring-2 ring-red-500">
                    <AvatarImage src={creator1.avatar} />
                    <AvatarFallback>{creator1.displayName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-white font-semibold text-sm">{creator1.displayName}</div>
                    <div className="text-red-400 text-xs">♥ {creator1.followers || '11.5K'}</div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1"
                  >
                    + Follow
                  </Button>
                </div>
                
                <div className="text-red-400 text-xs font-bold">
                  WIN x {totalVotes.creator1}
                </div>
              </div>
            </div>

            {/* Top gifters */}
            <div className={cn(
              "absolute left-4 flex gap-1",
              isMobile ? "bottom-32" : "bottom-4"
            )}>
              {[1, 2, 3].map((i) => (
                <Avatar key={i} className="w-6 h-6 ring-1 ring-white/30">
                  <AvatarImage src={`https://i.pravatar.cc/32?img=${i + 10}`} />
                  <AvatarFallback>{i}</AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>

          {/* Creator 2 Side */}
          <div className="relative bg-gradient-to-br from-blue-900/20 to-blue-800/20">
            {/* Mock video background */}
            <div className="absolute inset-0 bg-gray-900">
              <img 
                src={creator2.avatar}
                alt={creator2.displayName}
                className="w-full h-full object-cover opacity-50"
              />
            </div>
            
            {/* Creator Info Overlay */}
            <div className="absolute top-4 left-4 right-4">
              <div className="bg-black/60 rounded-lg p-3 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="w-8 h-8 ring-2 ring-blue-500">
                    <AvatarImage src={creator2.avatar} />
                    <AvatarFallback>{creator2.displayName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-white font-semibold text-sm">{creator2.displayName}</div>
                    <div className="text-blue-400 text-xs">♥ {creator2.followers || '10.1K'}</div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1"
                  >
                    + Follow
                  </Button>
                </div>
                
                <div className="text-blue-400 text-xs font-bold">
                  WIN x {totalVotes.creator2}
                </div>
              </div>
            </div>

            {/* Top gifters */}
            <div className={cn(
              "absolute right-4 flex gap-1",
              isMobile ? "bottom-32" : "bottom-4"
            )}>
              {[4, 5, 6].map((i) => (
                <Avatar key={i} className="w-6 h-6 ring-1 ring-white/30">
                  <AvatarImage src={`https://i.pravatar.cc/32?img=${i + 10}`} />
                  <AvatarFallback>{i}</AvatarFallback>
                </Avatar>
              ))}
            </div>

            {/* Mute indicator */}
            <div className={cn(
              "absolute left-4",
              isMobile ? "bottom-32" : "bottom-4"
            )}>
              <div className="bg-black/60 rounded-full p-2">
                <VolumeX className="w-4 h-4 text-white" />
              </div>
              <div className="text-white text-xs mt-1">NAUG...</div>
            </div>
          </div>
        </div>

        {/* Center divider line */}
        <div className="absolute inset-y-0 left-1/2 transform -translate-x-0.5 w-1 bg-gradient-to-b from-red-500 via-white to-blue-500 opacity-60" />
      </div>

      {/* Floating Action Buttons (Right Side) */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-4 z-30">
        <Button
          size="icon"
          className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-0"
          onClick={handleLike}
        >
          <Heart className="w-6 h-6" />
        </Button>

        <Button
          size="icon"
          className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500/30 to-emerald-500/30 hover:from-green-500/50 hover:to-emerald-500/50 backdrop-blur-sm text-white border border-green-500/50 hover:border-green-400 transition-all duration-200 hover:scale-105 shadow-lg"
          onClick={handleVote}
        >
          <Target className="w-6 h-6" />
        </Button>

        <Button
          size="icon"
          className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-0"
          onClick={() => setShowGifts(true)}
        >
          <Gift className="w-6 h-6" />
        </Button>
        
        <Button
          size="icon"
          className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-0"
        >
          <Share2 className="w-6 h-6" />
        </Button>
        
        <Button
          size="icon"
          className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-0"
          onClick={() => setShowChat(!showChat)}
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>

      {/* Chat Interface */}
      {showChat && (
        <div className={cn(
          "absolute left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-gray-600 z-40 h-80",
          isMobile ? "bottom-32" : "bottom-0"
        )}>
          {/* Chat Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-600">
            <h3 className="text-white font-semibold text-sm">Live Chat</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowChat(false)}
              className="text-white hover:bg-white/20 w-6 h-6"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages */}
          <div 
            ref={chatRef}
            className="flex-1 overflow-y-auto p-3 space-y-2 h-48"
          >
            {chatMessages.map((msg) => (
              <div 
                key={msg.id} 
                className={cn(
                  "text-sm",
                  msg.isSystemMessage ? "text-center text-gray-300" : "flex items-start gap-2"
                )}
              >
                {!msg.isSystemMessage && (
                  <Avatar className="w-5 h-5 flex-shrink-0">
                    <AvatarImage src={msg.user.avatar} />
                    <AvatarFallback className="text-xs">{msg.user.username[0]}</AvatarFallback>
                  </Avatar>
                )}
                <div className={cn(
                  msg.isSystemMessage ? "text-xs" : "flex-1"
                )}>
                  {!msg.isSystemMessage && (
                    <span className="text-yellow-400 font-medium">{msg.user.username}: </span>
                  )}
                  <span className="text-white">{msg.message}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t border-gray-600">
            <div className="flex items-center gap-2 mb-3">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type..."
                className="flex-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400 h-8"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button
                size="icon"
                onClick={handleSendMessage}
                className="bg-gray-700 hover:bg-gray-600 w-8 h-8"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {/* Bottom Action Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 p-2"
                >
                  <Star className="w-4 h-4" />
                  <span className="text-xs ml-1">Subscri...</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 p-2"
                >
                  <Smile className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 p-2"
                  onClick={() => setShowGifts(true)}
                >
                  <Gift className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 p-2"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 p-2"
                >
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs ml-1">Rechar...</span>
                </Button>
                
                <div className="text-white text-xs bg-gray-700 px-2 py-1 rounded">
                  6
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gift Selection Modal */}
      {showGifts && (
        <div className={cn(
          "absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4",
          isMobile && "pb-36"
        )}>
          <div className="bg-gray-900 rounded-lg p-6 max-w-sm w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Send Gift</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowGifts(false)}
                className="text-white hover:bg-white/20"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>

            {!selectedCreator ? (
              <div>
                <p className="text-white/70 text-sm mb-4">Choose a creator to send gift to:</p>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    className="bg-red-600 hover:bg-red-700 h-auto p-3 flex flex-col items-center gap-2"
                    onClick={() => setSelectedCreator(creator1.id)}
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={creator1.avatar} />
                      <AvatarFallback>{creator1.displayName[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{creator1.displayName}</span>
                  </Button>
                  
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 h-auto p-3 flex flex-col items-center gap-2"
                    onClick={() => setSelectedCreator(creator2.id)}
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={creator2.avatar} />
                      <AvatarFallback>{creator2.displayName[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{creator2.displayName}</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-center mb-4">
                  <Avatar className="w-16 h-16 mx-auto mb-2">
                    <AvatarImage src={selectedCreator === creator1.id ? creator1.avatar : creator2.avatar} />
                    <AvatarFallback>
                      {selectedCreator === creator1.id ? creator1.displayName[0] : creator2.displayName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-white font-medium">
                    Send gift to {selectedCreator === creator1.id ? creator1.displayName : creator2.displayName}
                  </p>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  {gifts.map((gift) => (
                    <Button
                      key={gift.id}
                      variant="outline"
                      className="h-auto p-3 flex flex-col items-center gap-1 border-gray-600 hover:border-yellow-400"
                      onClick={() => handleSendGift(gift)}
                    >
                      <div className="text-2xl">{gift.icon}</div>
                      <div className="text-xs">
                        <div className="text-white">{gift.name}</div>
                        <div className={gift.color}>{gift.value} SP</div>
                      </div>
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="ghost"
                  className="w-full mt-3 text-white hover:bg-white/20"
                  onClick={() => setSelectedCreator(null)}
                >
                  Back
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Battle Voting Modal */}
      {showVoteModal && (
        <div className={cn(
          "absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4",
          isMobile && "pb-36"
        )}>
          <div className="bg-gray-900 rounded-lg p-4 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-lg">Battle Voting</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowVoteModal(false)}
                className="text-white hover:bg-white/20"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>

            <BattleVoting
              battleId={`battle-${creator1.id}-${creator2.id}`}
              creator1={{
                ...creator1,
                tier: creator1.tier || 'rising_star',
                winRate: creator1.winRate || 75,
                totalVotes: creator1.totalVotes || 145,
                isLeading: scores.creator1 > scores.creator2,
                currentScore: scores.creator1,
              }}
              creator2={{
                ...creator2,
                tier: creator2.tier || 'pro_creator',
                winRate: creator2.winRate || 68,
                totalVotes: creator2.totalVotes || 89,
                isLeading: scores.creator2 > scores.creator1,
                currentScore: scores.creator2,
              }}
              isLive={timeLeft > 0}
              timeRemaining={timeLeft}
              userBalance={userBalance}
              onPlaceVote={handlePlaceVote}
              userVotes={userVotes}
              votingPool={votingPool}
            />
          </div>
        </div>
      )}

      {/* Gift Effects */}
      {giftEffects.map((effect) => (
        <div
          key={effect.id}
          className={cn(
            "absolute top-1/2 transform -translate-y-1/2 z-30 pointer-events-none animate-bounce",
            effect.creatorId === creator1.id ? "left-1/4" : "right-1/4"
          )}
        >
          <div className="text-6xl animate-pulse">
            {effect.gift.icon}
          </div>
          <div className="text-center text-white font-bold text-sm mt-2">
            +{effect.gift.value} SP
          </div>
        </div>
      ))}
    </div>
  );
};

export default TikTokStyleBattle;
