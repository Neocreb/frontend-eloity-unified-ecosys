import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gift, Heart, MessageCircle, Settings, Shield, Users, Camera, Mic, 
  BarChart2, X, Swords, Trophy, Crown, Flame, Target, Play, Pause, 
  Volume2, VolumeX, Maximize, Minimize, PhoneOff, Send, Zap, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface BattleParticipant {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  verified: boolean;
  score: number;
  color: 'red' | 'blue';
  isLive: boolean;
  viewerCount: number;
  likeCount: number;
  isFollowing: boolean;
  tier: 'rising_star' | 'pro_creator' | 'legend';
  winRate: number;
  totalVotes: number;
  isLeading: boolean;
  currentScore: number;
}

interface GiftItem {
  id: string;
  name: string;
  price: number;
  icon: string;
  animation: string;
  color: string;
}

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
  isGift?: boolean;
  giftName?: string;
  isSystemMessage?: boolean;
  likes?: number;
  userLiked?: boolean;
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

const EnhancedTikTokBattle: React.FC<{
  battleId?: string;
  onExit?: () => void;
  onVote?: (creatorId: string, amount: number) => void;
  onGift?: (creatorId: string, gift: GiftItem) => void;
}> = ({ battleId, onExit, onVote, onGift }) => {
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes in seconds
  const [isBattleActive, setIsBattleActive] = useState<boolean>(true);
  const [showGiftPanel, setShowGiftPanel] = useState<boolean>(false);
  const [activeGift, setActiveGift] = useState<GiftItem | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      username: 'system',
      message: 'LIVE Match has started! Cheer on your creator, like the match, and send Gifts.',
      timestamp: new Date(),
      isSystemMessage: true,
    },
    {
      id: '2',
      username: 'PRINCE',
      message: '👑 OF GHANA 🇬🇭 🇵🇸 joined',
      timestamp: new Date(),
      isSystemMessage: true,
    },
  ]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [participants, setParticipants] = useState<BattleParticipant[]>([
    {
      id: '1',
      username: 'battleking',
      displayName: 'Battle King',
      avatar: 'https://i.pravatar.cc/150?u=battleking',
      verified: true,
      score: 1250,
      color: 'red',
      isLive: true,
      viewerCount: 2450,
      likeCount: 8920,
      isFollowing: false,
      tier: 'pro_creator',
      winRate: 75,
      totalVotes: 145,
      isLeading: true,
      currentScore: 1250,
    },
    {
      id: '2',
      username: 'epicfighter',
      displayName: 'Epic Fighter',
      avatar: 'https://i.pravatar.cc/150?u=epicfighter',
      verified: true,
      score: 980,
      color: 'blue',
      isLive: true,
      viewerCount: 2100,
      likeCount: 7650,
      isFollowing: true,
      tier: 'pro_creator',
      winRate: 68,
      totalVotes: 89,
      isLeading: false,
      currentScore: 980,
    },
  ]);
  const [userVote, setUserVote] = useState<string | null>(null);
  const [showStreamerControls, setShowStreamerControls] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [showChat, setShowChat] = useState<boolean>(true);
  const [userVotes, setUserVotes] = useState<Vote[]>([]);
  const [userBalance] = useState(2500); // Mock user balance
  const [votingPool, setVotingPool] = useState({
    creator1Total: 450,
    creator2Total: 780,
    totalPool: 1230,
    totalVoters: 23,
  });
  const [giftEffects, setGiftEffects] = useState<Array<{ id: string; creatorId: string; gift: GiftItem; timestamp: Date }>>([]);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [comboCount, setComboCount] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [battlePhase, setBattlePhase] = useState<'active' | 'ending' | 'ended'>('active');
  const [battleResults, setBattleResults] = useState<{
    winnerId: string;
    totalPool: number;
    winningCreatorBonus: number;
    platformFee: number;
    userWinnings: number;
    userVoteOutcome: 'won' | 'lost' | 'none';
  } | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [chatMessageLikes, setChatMessageLikes] = useState<Record<string, { likes: number; userLiked: boolean }>>({});
  
  // Fetch battle data when battleId changes
  useEffect(() => {
    const fetchBattleData = async () => {
      if (!battleId) return;
      
      try {
        // In a real implementation, we would fetch the actual battle data
        // For now, we'll keep using mock data but in a real app this would be:
        // const battleData = await liveStreamService.getLiveStreamById(battleId);
        // setParticipants(transformBattleData(battleData));
        // setTimeLeft(battleData.battle.time_remaining);
        console.log('Fetching battle data for ID:', battleId);
      } catch (error) {
        console.error('Error fetching battle data:', error);
        toast({
          title: "Error",
          description: "Failed to load battle data",
          variant: "destructive",
        });
      }
    };
    
    fetchBattleData();
  }, [battleId, toast]);

  // Transform battle data to participant format
  const transformBattleData = (battleData: any): BattleParticipant[] => {
    // In a real implementation, this would transform the actual battle data
    // For now, we'll return the mock data but this shows how it would work
    return [
      {
        id: '1',
        username: battleData.user?.username || 'challenger',
        displayName: battleData.user?.full_name || 'Challenger',
        avatar: battleData.user?.avatar_url || 'https://i.pravatar.cc/150?u=challenger',
        verified: battleData.user?.is_verified || false,
        score: battleData.battle?.challenger_score || 0,
        color: 'red',
        isLive: true,
        viewerCount: battleData.viewer_count || 0,
        likeCount: 0, // This would need to be fetched separately
        isFollowing: false, // This would need to be fetched separately
        tier: 'pro_creator',
        winRate: 0, // This would need to be calculated
        totalVotes: 0, // This would need to be fetched separately
        isLeading: true, // This would need to be calculated
        currentScore: battleData.battle?.challenger_score || 0,
      },
      {
        id: '2',
        username: 'opponent',
        displayName: 'Opponent',
        avatar: 'https://i.pravatar.cc/150?u=opponent',
        verified: true,
        score: battleData.battle?.opponent_score || 0,
        color: 'blue',
        isLive: true,
        viewerCount: battleData.viewer_count || 0,
        likeCount: 0, // This would need to be fetched separately
        isFollowing: false, // This would need to be fetched separately
        tier: 'pro_creator',
        winRate: 0, // This would need to be calculated
        totalVotes: 0, // This would need to be fetched separately
        isLeading: false, // This would need to be calculated
        currentScore: battleData.battle?.opponent_score || 0,
      }
    ];
  };
  
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Sample gifts data
  const gifts: GiftItem[] = [
    { id: '1', name: 'Rose', price: 1, icon: '🌹', animation: 'float', color: 'text-pink-400' },
    { id: '2', name: 'Heart', price: 5, icon: '❤️', animation: 'spin', color: 'text-red-400' },
    { id: '3', name: 'Diamond', price: 10, icon: '💎', animation: 'zoom', color: 'text-blue-400' },
    { id: '4', name: 'Crown', price: 25, icon: '👑', animation: 'sparkle', color: 'text-yellow-400' },
    { id: '5', name: 'Rocket', price: 50, icon: '🚀', animation: 'zoom', color: 'text-purple-400' },
    { id: '6', name: 'Galaxy', price: 100, icon: '🌌', animation: 'spin', color: 'text-indigo-400' },
  ];

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isBattleActive && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsBattleActive(false);
      setBattlePhase('ended');
      
      // Calculate battle results
      const winnerId = participants[0].score > participants[1].score ? participants[0].id : participants[1].id;
      const totalPool = votingPool.totalPool;
      const platformFee = totalPool * 0.1;
      const winningCreatorBonus = totalPool * 0.2;
      const winnersPool = totalPool * 0.7;
      
      // Calculate user winnings
      const userWinningVotes = userVotes.filter(vote => vote.creatorId === winnerId);
      const totalWinningVotes = winnerId === participants[0].id ? votingPool.creator1Total : votingPool.creator2Total;
      const userWinnings = totalWinningVotes > 0
        ? userWinningVotes.reduce((sum, vote) => sum + vote.amount, 0) * (winnersPool / totalWinningVotes)
        : 0;
        
      const userVoteOutcome = userVotes.length === 0 ? 'none' :
        userWinningVotes.length > 0 ? 'won' : 'lost';
        
      setBattleResults({
        winnerId,
        totalPool,
        winningCreatorBonus,
        platformFee,
        userWinnings,
        userVoteOutcome
      });
      
      setShowResults(true);
    }
    return () => clearTimeout(timer);
  }, [isBattleActive, timeLeft, participants, userVotes, votingPool]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Format time for display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle sending a chat message
  const handleSendMessage = () => {
    if (newMessage.trim() !== '') {
      const message: ChatMessage = {
        id: Date.now().toString(),
        username: 'You',
        message: newMessage,
        timestamp: new Date(),
      };
      setChatMessages([...chatMessages, message]);
      setNewMessage('');
    }
  };

  // Handle sending a gift
  const handleSendGift = (gift: GiftItem) => {
    // Add gift animation
    setActiveGift(gift);
    setTimeout(() => setActiveGift(null), 3000);

    // Update participant score
    setParticipants(prev => 
      prev.map(p => 
        p.id === (userVote || participants[0].id) 
          ? { ...p, score: p.score + gift.price } 
          : p
      )
    );

    // Add gift message to chat
    const giftMessage: ChatMessage = {
      id: `gift-${Date.now()}`,
      username: 'You',
      message: `sent a ${gift.name}!`,
      timestamp: new Date(),
      isGift: true,
      giftName: gift.name,
    };
    setChatMessages([...chatMessages, giftMessage]);
    setShowGiftPanel(false);
    
    // Call onGift callback if provided
    if (onGift) {
      onGift(userVote || participants[0].id, gift);
    }
  };

  // Handle voting for a participant
  const handleVote = (participantId: string, amount: number = 10) => {
    setUserVote(participantId);
    
    // Update participant score
    setParticipants(prev => 
      prev.map(p => 
        p.id === participantId 
          ? { ...p, score: p.score + amount } 
          : p
      )
    );
    
    // Add to user votes
    const newVote: Vote = {
      id: Date.now().toString(),
      amount,
      creatorId: participantId,
      odds: 1.5, // Mock odds
      potentialWinning: amount * 1.5, // Mock potential winnings
      timestamp: new Date(),
      status: 'active'
    };
    
    setUserVotes(prev => [...prev, newVote]);
    
    // Update voting pool
    setVotingPool(prev => {
      const isCreator1 = participantId === participants[0].id;
      return {
        ...prev,
        creator1Total: isCreator1 ? prev.creator1Total + amount : prev.creator1Total,
        creator2Total: !isCreator1 ? prev.creator2Total + amount : prev.creator2Total,
        totalPool: prev.totalPool + amount,
        totalVoters: prev.totalVoters + 1
      };
    });
    
    // Show vote confirmation
    toast({
      title: "Vote Placed! 🎯",
      description: `You voted ${amount} SP on this creator. You earned 15 Eloits!`
    });
    
    // Call onVote callback if provided
    if (onVote) {
      onVote(participantId, amount);
    }
  };

  // Handle liking a participant
  const handleLike = (participantId: string) => {
    setParticipants(prev => 
      prev.map(p => 
        p.id === participantId 
          ? { ...p, likeCount: p.likeCount + 1 } 
          : p
      )
    );
  };

  // Toggle follow status
  const toggleFollow = (participantId: string) => {
    setParticipants(prev => 
      prev.map(p => 
        p.id === participantId 
          ? { ...p, isFollowing: !p.isFollowing } 
          : p
      )
    );
  };

  // Calculate progress bar percentages
  const totalScore = participants[0].score + participants[1].score;
  const redPercentage = totalScore > 0 ? (participants[0].score / totalScore) * 100 : 50;
  const bluePercentage = 100 - redPercentage;

  // Handle exiting the battle
  const handleExit = () => {
    if (onExit) {
      onExit();
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Video feeds - split screen */}
      <div className="flex-1 flex relative">
        {/* Left participant video */}
        <div 
          className="w-1/2 h-full relative bg-gradient-to-r from-red-900/20 to-transparent"
          style={{ backgroundColor: 'rgba(255, 0, 0, 0.1)' }}
        >
          {/* Video placeholder */}
          <div className="absolute inset-0 bg-gradient-to-b from-red-500/10 to-transparent"></div>
          
          {/* Top overlay - Left participant info */}
          <div className="absolute top-4 left-4 flex items-center space-x-2 z-10">
            <img 
              src={participants[0].avatar} 
              alt={participants[0].username} 
              className="w-10 h-10 rounded-full border-2 border-red-500"
            />
            <div>
              <div className="text-white font-bold flex items-center">
                @{participants[0].username}
                {participants[0].verified && (
                  <div className="w-3 h-3 md:w-4 md:h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 ml-1">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full" />
                  </div>
                )}
              </div>
              <div className="text-white/80 text-xs">
                {participants[0].displayName}
              </div>
            </div>
          </div>
          
          {/* Like button */}
          <button 
            className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm rounded-full p-2 z-10"
            onClick={() => handleLike(participants[0].id)}
          >
            <Heart className="text-white" size={20} />
          </button>
          
          {/* Follow button */}
          <button 
            className={`absolute bottom-20 left-4 rounded-full px-3 py-1 text-xs font-bold z-10 ${
              participants[0].isFollowing 
                ? 'bg-gray-700 text-white' 
                : 'bg-red-500 text-white'
            }`}
            onClick={() => toggleFollow(participants[0].id)}
          >
            {participants[0].isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>
        
        {/* Right participant video */}
        <div 
          className="w-1/2 h-full relative bg-gradient-to-l from-blue-900/20 to-transparent"
          style={{ backgroundColor: 'rgba(0, 0, 255, 0.1)' }}
        >
          {/* Video placeholder */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent"></div>
          
          {/* Top overlay - Right participant info */}
          <div className="absolute top-4 right-4 flex items-center space-x-2 z-10 flex-row-reverse">
            <img 
              src={participants[1].avatar} 
              alt={participants[1].username} 
              className="w-10 h-10 rounded-full border-2 border-blue-500"
            />
            <div className="text-right">
              <div className="text-white font-bold flex items-center justify-end">
                {participants[1].verified && (
                  <div className="w-3 h-3 md:w-4 md:h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mr-1">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full" />
                  </div>
                )}
                @{participants[1].username}
              </div>
              <div className="text-white/80 text-xs">
                {participants[1].displayName}
              </div>
            </div>
          </div>
          
          {/* Like button */}
          <button 
            className="absolute top-4 left-4 bg-black/30 backdrop-blur-sm rounded-full p-2 z-10"
            onClick={() => handleLike(participants[1].id)}
          >
            <Heart className="text-white" size={20} />
          </button>
          
          {/* Follow button */}
          <button 
            className={`absolute bottom-20 right-4 rounded-full px-3 py-1 text-xs font-bold z-10 ${
              participants[1].isFollowing 
                ? 'bg-gray-700 text-white' 
                : 'bg-blue-500 text-white'
            }`}
            onClick={() => toggleFollow(participants[1].id)}
          >
            {participants[1].isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>
        
        {/* Exit button */}
        <button 
          className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-full p-2 z-20"
          onClick={handleExit}
        >
          <X className="text-white" size={20} />
        </button>
        
        {/* Battle bar - center */}
        <div className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2 z-10 px-4">
          {/* Progress bar */}
          <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-red-500 transition-all duration-500 ease-out"
              style={{ width: `${redPercentage}%` }}
            ></div>
            <div 
              className="absolute top-0 right-0 h-full bg-blue-500 transition-all duration-500 ease-out"
              style={{ width: `${bluePercentage}%` }}
            ></div>
          </div>
          
          {/* Scores and timer */}
          <div className="flex justify-between items-center mt-2">
            <div className="text-red-500 font-bold text-lg">
              {participants[0].score.toLocaleString()}
            </div>
            <div className="text-white font-bold text-xl bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
              {formatTime(timeLeft)}
            </div>
            <div className="text-blue-500 font-bold text-lg">
              {participants[1].score.toLocaleString()}
            </div>
          </div>
        </div>
        
        {/* Battle title */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <Badge
            variant="secondary"
            className="bg-purple-500/20 text-purple-400 border-none text-sm px-3 py-1.5 animate-pulse"
          >
            <div className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" />
              <span className="font-bold">LIVE BATTLE</span>
            </div>
          </Badge>
        </div>
        
        {/* Viewer count */}
        <div className="absolute top-4 right-1/2 transform translate-x-1/2 z-10">
          <Badge
            variant="secondary"
            className="bg-black/40 text-white border-none text-sm px-3 py-1.5 backdrop-blur-sm"
          >
            <Users className="w-4 h-4 mr-2" />
            2.4K
          </Badge>
        </div>
      </div>
      
      {/* Bottom section - chat and controls */}
      <div className="h-1/3 bg-gradient-to-t from-black/90 to-transparent relative">
        {/* Chat messages */}
        <div 
          ref={chatContainerRef}
          className="absolute top-0 left-0 right-0 h-3/4 overflow-y-auto p-4 space-y-2"
        >
          <AnimatePresence>
            {chatMessages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`text-sm ${
                  msg.isGift ? 'text-yellow-400 font-bold' : 
                  msg.isSystemMessage ? 'text-purple-400' : 
                  'text-white'
                }`}
              >
                <span className="font-bold">{msg.username}:</span> {msg.message}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {/* Gift animation overlay */}
        <AnimatePresence>
          {activeGift && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center z-20"
            >
              <div className="text-8xl animate-bounce">{activeGift.icon}</div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Input area */}
        <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center space-x-2">
          <button 
            className="bg-black/50 backdrop-blur-sm rounded-full p-2"
            onClick={() => setShowStreamerControls(!showStreamerControls)}
          >
            <Settings className="text-white" size={20} />
          </button>
          
          <div className="flex-1 bg-black/50 backdrop-blur-sm rounded-full flex items-center px-4 py-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Send a message..."
              className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <MessageCircle className="text-gray-400 ml-2" size={20} />
          </div>
          
          <button 
            className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-3"
            onClick={() => setShowGiftPanel(true)}
          >
            <Gift className="text-white" size={20} />
          </button>
          
          {/* Voting buttons */}
          <div className="flex space-x-2">
            <button
              className={`rounded-full p-2 ${
                userVote === participants[0].id
                  ? 'bg-red-500'
                  : 'bg-black/50 backdrop-blur-sm'
              }`}
              onClick={() => handleVote(participants[0].id)}
            >
              <Heart 
                className={userVote === participants[0].id ? 'text-white' : 'text-red-500'} 
                size={20} 
                fill={userVote === participants[0].id ? 'currentColor' : 'none'} 
              />
            </button>
            <button
              className={`rounded-full p-2 ${
                userVote === participants[1].id
                  ? 'bg-blue-500'
                  : 'bg-black/50 backdrop-blur-sm'
              }`}
              onClick={() => handleVote(participants[1].id)}
            >
              <Heart 
                className={userVote === participants[1].id ? 'text-white' : 'text-blue-500'} 
                size={20} 
                fill={userVote === participants[1].id ? 'currentColor' : 'none'} 
              />
            </button>
          </div>
        </div>
      </div>
      
      {/* Gift panel */}
      <AnimatePresence>
        {showGiftPanel && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="absolute bottom-0 left-0 right-0 bg-gray-900 rounded-t-2xl p-4 z-30 h-1/2"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-bold text-lg">Send Gift</h3>
              <button 
                className="text-gray-400"
                onClick={() => setShowGiftPanel(false)}
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {gifts.map((gift) => (
                <button
                  key={gift.id}
                  className="flex flex-col items-center p-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors"
                  onClick={() => handleSendGift(gift)}
                >
                  <div className="text-3xl mb-2">{gift.icon}</div>
                  <div className="text-white text-sm font-bold">{gift.name}</div>
                  <div className="text-yellow-400 text-xs">{gift.price} coins</div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Streamer controls */}
      <AnimatePresence>
        {showStreamerControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-20 left-4 bg-black/80 backdrop-blur-sm rounded-xl p-4 z-20"
          >
            <div className="space-y-3">
              <button className="flex items-center text-white">
                <Camera className="mr-2" size={20} />
                <span>Camera</span>
              </button>
              <button className="flex items-center text-white">
                <Mic className="mr-2" size={20} />
                <span>Microphone</span>
              </button>
              <button className="flex items-center text-white">
                <Shield className="mr-2" size={20} />
                <span>Moderation</span>
              </button>
              <button className="flex items-center text-white">
                <BarChart2 className="mr-2" size={20} />
                <span>Analytics</span>
              </button>
              <button className="flex items-center text-white">
                <Users className="mr-2" size={20} />
                <span>Viewers</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Battle Results Modal */}
      <AnimatePresence>
        {showResults && battleResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-700"
            >
              <div className="text-center">
                <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Battle Complete!</h2>
                
                <div className="bg-gray-800 rounded-xl p-4 mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-400">Winner</span>
                    <span className="text-white font-bold">
                      @{participants.find(p => p.id === battleResults.winnerId)?.username}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {battleResults.totalPool.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400">Total Pool</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">
                        {battleResults.platformFee.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400">Platform Fee</div>
                    </div>
                  </div>
                </div>
                
                {battleResults.userVoteOutcome !== 'none' && (
                  <div className="bg-gray-800 rounded-xl p-4 mb-4">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        battleResults.userVoteOutcome === 'won' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {battleResults.userVoteOutcome === 'won' ? '+' : ''}
                        {battleResults.userWinnings.toFixed(2)} SP
                      </div>
                      <div className="text-sm text-gray-400">
                        {battleResults.userVoteOutcome === 'won' ? 'You Won!' : 'Better luck next time'}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-gray-600 text-white hover:bg-gray-700"
                    onClick={() => setShowResults(false)}
                  >
                    Close
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    onClick={() => {
                      setShowResults(false);
                      // Could navigate to another battle or creator economy
                    }}
                  >
                    Next Battle
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedTikTokBattle;