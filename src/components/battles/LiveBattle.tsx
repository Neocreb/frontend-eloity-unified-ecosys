import React, { useState, useEffect, useRef } from 'react';
import {
  Crown,
  Gift,
  Users,
  Clock,
  X,
  Volume2,
  VolumeX,
  Maximize,
  MessageCircle,
  Heart,
  Flame,
  Trophy,
  Zap,
  Target,
  Star,
  Settings,
  Camera,
  Mic,
  MicOff,
  Share2,
  DollarSign,
  TrendingUp,
  Lock,
  CheckCircle,
  XCircle,
  Coins,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import BattleVoting from '@/components/voting/BattleVoting';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Creator {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  verified: boolean;
  tier: 'rising_star' | 'pro_creator' | 'legend';
  score: number;
}

interface Gift {
  id: string;
  name: string;
  icon: string;
  value: number;
  color: string;
}

interface Comment {
  id: string;
  user: {
    username: string;
    avatar: string;
  };
  message: string;
  timestamp: Date;
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

interface BattleResults {
  winnerId: string;
  totalPool: number;
  winningCreatorBonus: number;
  platformFee: number;
  userWinnings: number;
  userVoteOutcome: 'won' | 'lost' | 'none';
}

interface LiveBattleProps {
  battleId: string;
  creator1: Creator;
  creator2: Creator;
  duration: number;
  onBattleEnd: (winnerId: string) => void;
  onExit: () => void;
}

const gifts: Gift[] = [
  { id: '1', name: 'Rose', icon: '🌹', value: 1, color: 'text-pink-400' },
  { id: '2', name: 'Heart', icon: '❤��', value: 5, color: 'text-red-400' },
  { id: '3', name: 'Diamond', icon: '💎', value: 10, color: 'text-blue-400' },
  { id: '4', name: 'Crown', icon: '👑', value: 25, color: 'text-yellow-400' },
  { id: '5', name: 'Rocket', icon: '🚀', value: 50, color: 'text-purple-400' },
  { id: '6', name: 'Fireworks', icon: '🎆', value: 100, color: 'text-rainbow' },
];

const LiveBattle: React.FC<LiveBattleProps> = ({
  battleId,
  creator1,
  creator2,
  duration,
  onBattleEnd,
  onExit,
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [viewers, setViewers] = useState(1247);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [showGifts, setShowGifts] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [scores, setScores] = useState({
    creator1: creator1.score,
    creator2: creator2.score,
  });
  const [comboCount, setComboCount] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [battlePhase, setBattlePhase] = useState<'active' | 'ending' | 'ended'>('active');

  // Voting state
  const [showVoting, setShowVoting] = useState(false);
  const [userBalance] = useState(2500); // Mock user balance
  const [userVotes, setUserVotes] = useState<Vote[]>([]);
  const [votingPool, setVotingPool] = useState({
    creator1Total: 450,
    creator2Total: 780,
    totalPool: 1230,
    totalVoters: 23,
  });
  const [battleResults, setBattleResults] = useState<BattleResults | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showCommentsOverlay, setShowCommentsOverlay] = useState(false);
  const [isMobile] = useState(window.innerWidth < 768);
  
  const commentsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setBattlePhase('ending');
          setTimeout(() => {
            setBattlePhase('ended');
            const winnerId = scores.creator1 > scores.creator2 ? creator1.id : creator2.id;

            // Calculate battle results
            const totalPool = votingPool.totalPool;
            const platformFee = totalPool * 0.1;
            const winningCreatorBonus = totalPool * 0.2;
            const winnersPool = totalPool * 0.7;

            // Calculate user winnings
            const userWinningVotes = userVotes.filter(vote => vote.creatorId === winnerId);
            const totalWinningVotes = winnerId === creator1.id ? votingPool.creator1Total : votingPool.creator2Total;
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
              userVoteOutcome,
            });

            setTimeout(() => {
              setShowResults(true);
            }, 1000);

            setTimeout(() => {
              onBattleEnd(winnerId);
            }, 5000);
          }, 3000);
          return 0;
        }

        // Battle ending warning and voting lock
        if (prev === 30) {
          toast({
            title: "30 seconds left! ⏰",
            description: "Voting is now locked!",
          });
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [votingPool, userVotes, scores, creator1.id, creator2.id, onBattleEnd, toast]);

  // Simulate live updates
  useEffect(() => {
    const updateInterval = setInterval(() => {
      // Random viewer count changes
      setViewers(prev => prev + Math.floor(Math.random() * 10 - 3));
      
      // Random score updates
      if (Math.random() > 0.7) {
        const isCreator1 = Math.random() > 0.5;
        const points = Math.floor(Math.random() * 20) + 1;
        
        setScores(prev => ({
          ...prev,
          [isCreator1 ? 'creator1' : 'creator2']: prev[isCreator1 ? 'creator1' : 'creator2'] + points
        }));
      }
      
      // Random comments
      if (Math.random() > 0.8) {
        const mockComments = [
          "Amazing battle! 🔥",
          "Go go go!",
          "This is insane! 💯",
          "Team blue! 💙",
          "Epic moves! 🚀",
        ];
        
        const newComment: Comment = {
          id: Date.now().toString(),
          user: {
            username: `user${Math.floor(Math.random() * 1000)}`,
            avatar: `https://i.pravatar.cc/32?u=${Math.random()}`,
          },
          message: mockComments[Math.floor(Math.random() * mockComments.length)],
          timestamp: new Date(),
        };
        
        setComments(prev => [...prev.slice(-20), newComment]);
      }
    }, 2000);

    return () => clearInterval(updateInterval);
  }, []);

  // Auto-scroll comments
  useEffect(() => {
    if (commentsRef.current) {
      commentsRef.current.scrollTop = commentsRef.current.scrollHeight;
    }
  }, [comments]);

  const sendGift = (gift: Gift, recipientId: string) => {
    const points = gift.value;
    setScores(prev => ({
      ...prev,
      [recipientId === creator1.id ? 'creator1' : 'creator2']: 
        prev[recipientId === creator1.id ? 'creator1' : 'creator2'] + points
    }));

    // Combo system
    setComboCount(prev => prev + 1);
    setShowCombo(true);
    setTimeout(() => setShowCombo(false), 2000);

    toast({
      title: `${gift.icon} ${gift.name} sent!`,
      description: `+${points} SP to ${recipientId === creator1.id ? creator1.displayName : creator2.displayName}`,
    });

    setShowGifts(false);
  };

  const sendComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      user: {
        username: 'you',
        avatar: 'https://i.pravatar.cc/32?u=you',
      },
      message: newComment,
      timestamp: new Date(),
    };

    setComments(prev => [...prev, comment]);
    setNewComment('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Voting functions
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

    toast({
      title: "Vote Placed! 🎯",
      description: `${vote.amount} SP on ${vote.creatorId === creator1.id ? creator1.displayName : creator2.displayName}`,
    });
  };

  const getLeadingCreator = () => {
    return scores.creator1 > scores.creator2 ? creator1 : creator2;
  };

  const getScorePercentage = (creatorScore: number) => {
    const total = scores.creator1 + scores.creator2;
    return total > 0 ? (creatorScore / total) * 100 : 50;
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-600/20 to-blue-600/20 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onExit}>
            <X className="w-5 h-5 text-white" />
          </Button>
          
          <Badge className="bg-red-500 text-white animate-pulse">
            <Flame className="w-3 h-3 mr-1" />
            LIVE BATTLE
          </Badge>
          
          <div className="flex items-center gap-2 text-white">
            <Users className="w-4 h-4" />
            <span className="font-medium">{viewers.toLocaleString()}</span>
          </div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {formatTime(timeLeft)}
          </div>
          {battlePhase === 'ending' && (
            <div className="text-yellow-400 text-sm animate-pulse">
              Battle Ending!
            </div>
          )}
          {timeLeft > 30 && (
            <div className="text-xs text-gray-300 mt-1">
              Voting closes in {Math.max(0, timeLeft - 30)}s
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Voting button - only show if voting is still open */}
          {timeLeft > 30 && (
            <Button
              onClick={() => setShowVoting(true)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4"
            >
              <DollarSign className="w-4 h-4 mr-1" />
              Place Vote
            </Button>
          )}

          <Button variant="ghost" size="icon" onClick={() => setIsMuted(!isMuted)}>
            {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
          </Button>

          <Button variant="ghost" size="icon">
            <Share2 className="w-5 h-5 text-white" />
          </Button>

          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5 text-white" />
          </Button>
        </div>
      </div>

      {/* Voting Stats Panel */}
      {votingPool.totalPool > 0 && (
        <div className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 p-3">
          <div className="flex items-center justify-between text-sm mb-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Coins className="w-4 h-4 text-yellow-400" />
                <span className="text-white font-medium">{votingPool.totalPool} SP Pool</span>
              </div>
              <div className="text-gray-300">
                {votingPool.totalVoters} voters
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-red-400 font-medium">
                  {Math.round((votingPool.creator1Total / votingPool.totalPool) * 100)}%
                </div>
                <div className="text-xs text-gray-400">{creator1.displayName}</div>
              </div>

              <div className="text-center">
                <div className="text-blue-400 font-medium">
                  {Math.round((votingPool.creator2Total / votingPool.totalPool) * 100)}%
                </div>
                <div className="text-xs text-gray-400">{creator2.displayName}</div>
              </div>
            </div>
          </div>

          {/* Visual voting distribution */}
          <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-red-500 transition-all duration-500"
              style={{ width: `${(votingPool.creator1Total / votingPool.totalPool) * 100}%` }}
            />
            <div
              className="absolute right-0 top-0 h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${(votingPool.creator2Total / votingPool.totalPool) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Battle Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Split Screen */}
        <div className="grid grid-cols-2 h-full">
          {/* Creator 1 */}
          <div className="relative bg-gradient-to-br from-red-600/20 to-red-800/20">
            {/* Mock video feed */}
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <div className="text-center text-white">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={creator1.avatar} />
                  <AvatarFallback>{creator1.displayName[0]}</AvatarFallback>
                </Avatar>
                <div className="text-sm opacity-50">Camera feed would be here</div>
              </div>
            </div>

            {/* Creator 1 Info */}
            <div className="absolute top-4 left-4">
              <div className="bg-black/50 rounded-lg p-3 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={creator1.avatar} />
                    <AvatarFallback>{creator1.displayName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-white font-medium text-sm">{creator1.displayName}</div>
                    <div className="text-red-400 text-xs">@{creator1.username}</div>
                  </div>
                  {creator1.verified && (
                    <div className="w-4 h-4 bg-blue-500 rounded-full" />
                  )}
                </div>
                
                <div className="flex items-center gap-1 text-red-400 text-sm">
                  <Trophy className="w-3 h-3" />
                  <span className="font-bold">{scores.creator1}</span>
                  <span className="text-xs">SP</span>
                </div>
              </div>
            </div>

            {/* Gift Button for Creator 1 */}
            <div className="absolute bottom-4 right-4">
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => {
                  setSelectedGift(null);
                  setShowGifts(true);
                }}
              >
                <Gift className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Gift</span>
              </Button>
            </div>
          </div>

          {/* Creator 2 */}
          <div className="relative bg-gradient-to-br from-blue-600/20 to-blue-800/20">
            {/* Mock video feed */}
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <div className="text-center text-white">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={creator2.avatar} />
                  <AvatarFallback>{creator2.displayName[0]}</AvatarFallback>
                </Avatar>
                <div className="text-sm opacity-50">Camera feed would be here</div>
              </div>
            </div>

            {/* Creator 2 Info */}
            <div className="absolute top-4 right-4">
              <div className="bg-black/50 rounded-lg p-3 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-right">
                    <div className="text-white font-medium text-sm">{creator2.displayName}</div>
                    <div className="text-blue-400 text-xs">@{creator2.username}</div>
                  </div>
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={creator2.avatar} />
                    <AvatarFallback>{creator2.displayName[0]}</AvatarFallback>
                  </Avatar>
                  {creator2.verified && (
                    <div className="w-4 h-4 bg-blue-500 rounded-full" />
                  )}
                </div>
                
                <div className="flex items-center justify-end gap-1 text-blue-400 text-sm">
                  <span className="font-bold">{scores.creator2}</span>
                  <span className="text-xs">SP</span>
                  <Trophy className="w-3 h-3" />
                </div>
              </div>
            </div>

            {/* Gift Button for Creator 2 */}
            <div className="absolute bottom-4 left-4">
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  setSelectedGift(null);
                  setShowGifts(true);
                }}
              >
                <Gift className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Gift</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Center Line & Score Bar */}
        <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-red-500 to-blue-500" />
        
        {/* Score Progress Bar */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80">
          <div className="bg-black/50 rounded-full p-2 backdrop-blur-sm">
            <div className="relative h-6 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="absolute left-0 top-0 h-full bg-red-500 transition-all duration-1000"
                style={{ width: `${getScorePercentage(scores.creator1)}%` }}
              />
              <div 
                className="absolute right-0 top-0 h-full bg-blue-500 transition-all duration-1000"
                style={{ width: `${getScorePercentage(scores.creator2)}%` }}
              />
              
              {/* Leader indicator */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-bold">
                  {getLeadingCreator().displayName} LEADS
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Combo Display */}
        {showCombo && comboCount > 1 && (
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            <div className="bg-yellow-400 text-black px-6 py-3 rounded-full font-bold text-xl animate-bounce">
              🔥 COMBO x{comboCount}!
            </div>
          </div>
        )}

        {/* Battle End Animation */}
        {battlePhase === 'ending' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-40">
            <div className="text-center text-white">
              <div className="text-6xl mb-4 animate-pulse">⏰</div>
              <div className="text-2xl font-bold">Time's Up!</div>
              <div className="text-lg">Calculating results...</div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Buttons */}
      <div className={cn(
        "absolute right-4 flex flex-col gap-2 z-[102] transition-all duration-300",
        showCommentsOverlay ? "bottom-96 md:bottom-60" : "bottom-20 md:bottom-4"
      )}>
        {/* Comments Toggle */}
        <Button
          size="icon"
          className="rounded-full bg-gray-900/90 hover:bg-gray-800 text-white border border-gray-600"
          onClick={() => setShowCommentsOverlay(!showCommentsOverlay)}
        >
          {showCommentsOverlay ? <ChevronDown className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
        </Button>

        {/* Gift Button */}
        <Button
          size="icon"
          className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          onClick={() => setShowGifts(true)}
        >
          <Gift className="w-5 h-5" />
        </Button>
      </div>

      {/* Comments Overlay */}
      {showCommentsOverlay && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm z-[105] border-t border-gray-600 pb-16 md:pb-0">
          <div className="p-4 max-h-[50vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Live Chat
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowCommentsOverlay(false)}
                className="text-white hover:bg-white/10"
              >
                <ChevronDown className="w-5 h-5" />
              </Button>
            </div>

            {/* Comments */}
            <div className="flex-1 overflow-y-auto mb-3 space-y-2 min-h-[120px] max-h-[200px]" ref={commentsRef}>
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-2 text-sm">
                    <Avatar className="w-6 h-6 flex-shrink-0">
                      <AvatarImage src={comment.user.avatar} />
                      <AvatarFallback className="text-xs">{comment.user.username[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <span className="text-yellow-400 font-medium">{comment.user.username}: </span>
                      <span className="text-white break-words">{comment.message}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No messages yet. Be the first to chat!</p>
                </div>
              )}
            </div>

            {/* Comment Input */}
            <div className="flex gap-2 mb-3">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Send a message..."
                className="bg-gray-800 border-gray-600 text-white"
                onKeyPress={(e) => e.key === 'Enter' && sendComment()}
              />
              <Button size="sm" onClick={sendComment}>
                <MessageCircle className="w-4 h-4" />
              </Button>
            </div>

            {/* Quick Gifts Grid */}
            <div>
              <div className="text-white text-sm font-medium mb-2">Quick Gifts</div>
              <div className="grid grid-cols-6 gap-2">
                {gifts.slice(0, 6).map((gift) => (
                  <Button
                    key={gift.id}
                    variant="outline"
                    size="sm"
                    className="aspect-square p-1 text-lg border-gray-600 hover:bg-gray-700"
                    onClick={() => {
                      setSelectedGift(gift);
                      setShowGifts(true);
                    }}
                  >
                    {gift.icon}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gift Selection Modal */}
      {showGifts && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-[110] p-4 pb-20 md:pb-4">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full max-h-[85vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Send Gift</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowGifts(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-4">
              {gifts.map((gift) => (
                <Button
                  key={gift.id}
                  variant="outline"
                  className={cn(
                    "aspect-square p-4 flex flex-col items-center gap-1",
                    selectedGift?.id === gift.id && "border-yellow-400 bg-yellow-400/10"
                  )}
                  onClick={() => setSelectedGift(gift)}
                >
                  <div className="text-2xl">{gift.icon}</div>
                  <div className="text-xs text-center">
                    <div className="font-medium">{gift.name}</div>
                    <div className={gift.color}>{gift.value} SP</div>
                  </div>
                </Button>
              ))}
            </div>

            {selectedGift && (
              <div className="space-y-2">
                <div className="text-center text-white mb-4">
                  <div className="text-3xl mb-2">{selectedGift.icon}</div>
                  <div className="font-medium">{selectedGift.name}</div>
                  <div className="text-yellow-400">{selectedGift.value} SoftPoints</div>
                </div>
                
                <div className="text-white text-sm mb-4">Send to:</div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => sendGift(selectedGift, creator1.id)}
                  >
                    {creator1.displayName}
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => sendGift(selectedGift, creator2.id)}
                  >
                    {creator2.displayName}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Battle Voting Modal */}
      {showVoting && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-[110] p-4 pb-20 md:pb-4">
          <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[85vh] overflow-auto">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-white font-semibold text-lg">Battle Voting</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowVoting(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-4">
              <BattleVoting
                battleId={battleId}
                creator1={{
                  ...creator1,
                  currentScore: scores.creator1,
                  winRate: 75,
                  totalVotes: 145,
                  isLeading: scores.creator1 > scores.creator2,
                }}
                creator2={{
                  ...creator2,
                  currentScore: scores.creator2,
                  winRate: 68,
                  totalVotes: 89,
                  isLeading: scores.creator2 > scores.creator1,
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
        </div>
      )}

      {/* Battle Results Modal */}
      {showResults && battleResults && (
        <Dialog open={showResults} onOpenChange={setShowResults}>
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md z-[110]">
            <DialogHeader>
              <DialogTitle className="text-center text-xl">Battle Results 🏆</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Winner Announcement */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4">
                  <Avatar className="w-full h-full">
                    <AvatarImage
                      src={battleResults.winnerId === creator1.id ? creator1.avatar : creator2.avatar}
                    />
                    <AvatarFallback className="text-2xl">
                      {battleResults.winnerId === creator1.id ? creator1.displayName[0] : creator2.displayName[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  {battleResults.winnerId === creator1.id ? creator1.displayName : creator2.displayName} Wins!
                </h3>
                <div className="text-gray-400">
                  +{battleResults.winningCreatorBonus.toFixed(0)} SP Creator Bonus
                </div>
              </div>

              {/* Pool Stats */}
              <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Pool</span>
                  <span className="text-white font-bold">{battleResults.totalPool} SP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Platform Fee (10%)</span>
                  <span className="text-gray-400">{battleResults.platformFee.toFixed(0)} SP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Winners Share (70%)</span>
                  <span className="text-green-400">{(battleResults.totalPool * 0.7).toFixed(0)} SP</span>
                </div>
              </div>

              {/* User Results */}
              <div className="text-center">
                {battleResults.userVoteOutcome === 'won' ? (
                  <div className="space-y-2">
                    <div className="text-6xl">🎉</div>
                    <h4 className="text-xl font-bold text-green-400">You Won!</h4>
                    <div className="text-2xl font-bold text-yellow-400">
                      +{battleResults.userWinnings.toFixed(0)} SP
                    </div>
                    <p className="text-gray-400 text-sm">
                      Your winnings have been added to your balance
                    </p>
                  </div>
                ) : battleResults.userVoteOutcome === 'lost' ? (
                  <div className="space-y-2">
                    <div className="text-6xl">❌</div>
                    <h4 className="text-xl font-bold text-red-400">You Lost</h4>
                    <p className="text-gray-400 text-sm">
                      Better luck next time!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-6xl">👀</div>
                    <h4 className="text-xl font-bold text-gray-400">You Watched</h4>
                    <p className="text-gray-400 text-sm">
                      Join the voting next time for a chance to win!
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
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
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default LiveBattle;
