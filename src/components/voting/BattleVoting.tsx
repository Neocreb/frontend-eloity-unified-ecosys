import React, { useState, useEffect } from 'react';
import {
  Target,
  TrendingUp,
  TrendingDown,
  Coins,
  Timer,
  Users,
  Trophy,
  AlertTriangle,
  Lock,
  Unlock,
  Zap,
  Star,
  Crown,
  Flame,
  Calculator,
  History,
  Wallet,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Award,
  Sparkles,
  Send,
  Smile,
  MoreHorizontal,
  Plus,
  Minimize,
  Maximize
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Creator {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  tier: 'rising_star' | 'pro_creator' | 'legend';
  verified: boolean;
  currentScore: number;
  winRate: number;
  totalVotes: number;
  isLeading: boolean;
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

interface BattleVotingProps {
  battleId: string;
  creator1: Creator;
  creator2: Creator;
  isLive: boolean;
  timeRemaining: number;
  userBalance: number;
  onPlaceVote: (vote: Omit<Vote, 'id' | 'timestamp' | 'status'>) => void;
  userVotes: Vote[];
  votingPool: {
    creator1Total: number;
    creator2Total: number;
    totalPool: number;
    totalVoters: number;
  };
}

const quickVoteAmounts = [10, 20, 50, 100, 250];

const BattleVoting: React.FC<BattleVotingProps> = ({
  battleId,
  creator1,
  creator2,
  isLive,
  timeRemaining,
  userBalance,
  onPlaceVote,
  userVotes,
  votingPool,
}) => {
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [voteAmount, setVoteAmount] = useState(20);
  const [customAmount, setCustomAmount] = useState('');
  const [showVoteConfirm, setShowVoteConfirm] = useState(false);
  const [votingLocked, setVotingLocked] = useState(false);
  const [activeTab, setActiveTab] = useState('vote');
  const [showOddsExplanation, setShowOddsExplanation] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  
  const { toast } = useToast();

  // Lock voting 30 seconds before battle ends
  useEffect(() => {
    if (timeRemaining <= 30 && isLive) {
      setVotingLocked(true);
    }
  }, [timeRemaining, isLive]);

  const calculateOdds = (creator: Creator) => {
    const totalVotes = votingPool.creator1Total + votingPool.creator2Total;
    if (totalVotes === 0) return 2.0;
    
    const creatorVotes = creator.id === creator1.id ? votingPool.creator1Total : votingPool.creator2Total;
    const opponentVotes = creator.id === creator1.id ? votingPool.creator2Total : votingPool.creator1Total;
    
    if (creatorVotes === 0) return 3.0;
    
    const odds = (totalVotes * 0.9) / creatorVotes; // 90% of pool for winners, 10% platform fee
    return Math.max(1.1, Math.min(odds, 5.0)); // Cap between 1.1x and 5.0x
  };

  const calculatePotentialWinning = (amount: number, creator: Creator) => {
    const odds = calculateOdds(creator);
    return amount * odds;
  };

  const getCreatorPopularity = (creator: Creator) => {
    const creatorVotes = creator.id === creator1.id ? votingPool.creator1Total : votingPool.creator2Total;
    const totalVotes = votingPool.creator1Total + votingPool.creator2Total;
    return totalVotes > 0 ? (creatorVotes / totalVotes) * 100 : 50;
  };

  const placeVote = () => {
    if (!selectedCreator || voteAmount <= 0 || voteAmount > userBalance) {
      toast({
        title: 'Invalid Vote',
        description: 'Please check your vote amount and selected creator',
        variant: 'destructive',
      });
      return;
    }

    if (votingLocked) {
      toast({
        title: 'Voting Locked',
        description: 'Voting is locked for the final 30 seconds',
        variant: 'destructive',
      });
      return;
    }

    if (userVotes.length > 0) {
      toast({
        title: 'Vote Already Placed',
        description: 'You can only vote once per battle',
        variant: 'destructive',
      });
      return;
    }

    const vote = {
      amount: voteAmount,
      creatorId: selectedCreator.id,
      odds: calculateOdds(selectedCreator),
      potentialWinning: calculatePotentialWinning(voteAmount, selectedCreator),
    };

    onPlaceVote(vote);
    setShowVoteConfirm(false);
    setSelectedCreator(null);
    setVoteAmount(20);

    toast({
      title: 'Vote Placed! 🎯',
      description: `${voteAmount} SP on ${selectedCreator.displayName}`,
    });
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'legend':
        return <Crown className="w-4 h-4 text-yellow-400" />;
      case 'pro_creator':
        return <Trophy className="w-4 h-4 text-purple-400" />;
      case 'rising_star':
        return <Star className="w-4 h-4 text-blue-400" />;
      default:
        return null;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalUserVotes = () => {
    return userVotes.reduce((sum, vote) => sum + vote.amount, 0);
  };

  const getPotentialWinnings = () => {
    return userVotes
      .filter(vote => vote.status === 'active')
      .reduce((sum, vote) => sum + vote.potentialWinning, 0);
  };

  return (
    <div className="space-y-4">
      {/* Battle Status */}
      <Card className="bg-gradient-to-r from-blue-600/20 to-red-600/20 border-gray-700">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className={cn(
                "animate-pulse",
                isLive ? "bg-red-500" : "bg-gray-500"
              )}>
                {isLive ? "🔴 LIVE" : "⏹️ ENDED"}
              </Badge>
              <div className="text-white">
                <Timer className="w-4 h-4 inline mr-1" />
                {formatTime(timeRemaining)}
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-400">Total Pool</div>
              <div className="text-lg font-bold text-yellow-400">
                {votingPool.totalPool.toLocaleString()} SP
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Creator Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Creator 1 */}
        <Card className={cn(
          "border-2 cursor-pointer transition-all hover:scale-105",
          selectedCreator?.id === creator1.id ? "border-blue-500 bg-blue-500/10" : "border-gray-700",
          (votingLocked || userVotes.length > 0) && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => !votingLocked && userVotes.length === 0 && setSelectedCreator(creator1)}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={creator1.avatar} />
                <AvatarFallback>{creator1.displayName[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white">{creator1.displayName}</h3>
                  {creator1.verified && <Badge variant="secondary">✓</Badge>}
                  {getTierIcon(creator1.tier)}
                </div>
                <div className="text-sm text-gray-400">@{creator1.username}</div>
              </div>
              {creator1.isLeading && <Crown className="w-5 h-5 text-yellow-400" />}
            </div>
            
            {/* Stats */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Odds</span>
                <span className="text-green-400 font-bold">{calculateOdds(creator1).toFixed(2)}x</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Win Rate</span>
                <span className="text-white">{creator1.winRate}%</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Current Score</span>
                <span className="text-white">{creator1.currentScore} SP</span>
              </div>
              
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">Vote Distribution</span>
                  <span className="text-blue-400">{getCreatorPopularity(creator1).toFixed(1)}%</span>
                </div>
                <Progress value={getCreatorPopularity(creator1)} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Creator 2 */}
        <Card className={cn(
          "border-2 cursor-pointer transition-all hover:scale-105",
          selectedCreator?.id === creator2.id ? "border-red-500 bg-red-500/10" : "border-gray-700",
          (votingLocked || userVotes.length > 0) && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => !votingLocked && userVotes.length === 0 && setSelectedCreator(creator2)}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={creator2.avatar} />
                <AvatarFallback>{creator2.displayName[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white">{creator2.displayName}</h3>
                  {creator2.verified && <Badge variant="secondary">✓</Badge>}
                  {getTierIcon(creator2.tier)}
                </div>
                <div className="text-sm text-gray-400">@{creator2.username}</div>
              </div>
              {creator2.isLeading && <Crown className="w-5 h-5 text-yellow-400" />}
            </div>
            
            {/* Stats */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Odds</span>
                <span className="text-green-400 font-bold">{calculateOdds(creator2).toFixed(2)}x</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Win Rate</span>
                <span className="text-white">{creator2.winRate}%</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Current Score</span>
                <span className="text-white">{creator2.currentScore} SP</span>
              </div>
              
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">Vote Distribution</span>
                  <span className="text-red-400">{getCreatorPopularity(creator2).toFixed(1)}%</span>
                </div>
                <Progress value={getCreatorPopularity(creator2)} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {votingLocked && (
        <div className="mt-4 p-3 bg-yellow-400/10 border border-yellow-400 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-400">
            <Lock className="w-4 h-4" />
            <span className="font-medium">Voting Locked</span>
          </div>
          <div className="text-xs text-gray-300 mt-1">
            Voting closes 30 seconds before battle ends
          </div>
        </div>
      )}

      {userVotes.length > 0 && !votingLocked && (
        <div className="mt-4 p-3 bg-green-400/10 border border-green-400 rounded-lg">
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle className="w-4 h-4" />
            <span className="font-medium">Vote Already Placed</span>
          </div>
          <div className="text-xs text-gray-300 mt-1">
            You can only vote once per battle. Check "My Votes" tab to see your vote.
          </div>
        </div>
      )}

      {/* Voting Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800">
          <TabsTrigger value="vote">Place Vote</TabsTrigger>
          <TabsTrigger value="myvotes">My Votes ({userVotes.length})</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="vote" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Place Your Vote
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedCreator ? (
                <>
                  <div className="p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={selectedCreator.avatar} />
                        <AvatarFallback>{selectedCreator.displayName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">Voting on {selectedCreator.displayName}</div>
                        <div className="text-sm text-gray-400">
                          {calculateOdds(selectedCreator).toFixed(2)}x odds
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm text-gray-300">Vote Amount</Label>
                    <div className="grid grid-cols-5 gap-2 mt-2">
                      {quickVoteAmounts.map((amount) => (
                        <Button
                          key={amount}
                          variant={voteAmount === amount ? "default" : "outline"}
                          size="sm"
                          onClick={() => setVoteAmount(amount)}
                          disabled={amount > userBalance}
                          className="text-xs"
                        >
                          {amount} SP
                        </Button>
                      ))}
                    </div>

                    <div className="mt-3">
                      <Input
                        type="number"
                        placeholder="Custom amount"
                        value={customAmount}
                        onChange={(e) => {
                          setCustomAmount(e.target.value);
                          setVoteAmount(parseInt(e.target.value) || 0);
                        }}
                        className="bg-gray-700 border-gray-600"
                      />
                    </div>

                    <div className="mt-3">
                      <Slider
                        value={[voteAmount]}
                        onValueChange={([value]) => {
                          setVoteAmount(value);
                          setCustomAmount(value.toString());
                        }}
                        max={Math.min(userBalance, 500)}
                        min={10}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>10 SP</span>
                        <span>{Math.min(userBalance, 500)} SP</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-700/50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Vote Amount</span>
                      <span className="text-white">{voteAmount} SP</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Odds</span>
                      <span className="text-green-400">{calculateOdds(selectedCreator).toFixed(2)}x</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Potential Winning</span>
                      <span className="text-yellow-400 font-bold">
                        {calculatePotentialWinning(voteAmount, selectedCreator).toFixed(0)} SP
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Your Balance</span>
                      <span className="text-white">{userBalance} SP</span>
                    </div>
                  </div>

                  <Button
                    onClick={placeVote}
                    disabled={votingLocked || voteAmount <= 0 || voteAmount > userBalance || userVotes.length > 0}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {votingLocked ? (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Voting Locked
                      </>
                    ) : userVotes.length > 0 ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Vote Already Placed
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Place Vote ({voteAmount} SP)
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <div className="text-center py-8">
                  {userVotes.length > 0 ? (
                    <>
                      <CheckCircle className="w-12 h-12 mx-auto text-green-400 mb-4" />
                      <h3 className="font-medium text-green-300 mb-2">Vote Already Placed</h3>
                      <p className="text-sm text-gray-400">
                        You can only vote once per battle. Check "My Votes" tab to see your vote.
                      </p>
                    </>
                  ) : (
                    <>
                      <Target className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="font-medium text-gray-300 mb-2">Select a Creator</h3>
                      <p className="text-sm text-gray-400">
                        Choose which creator you think will win to place your vote
                      </p>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="myvotes" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  My Votes
                </div>
                <Badge variant="secondary">
                  {getTotalUserVotes()} SP total
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userVotes.length > 0 ? (
                <div className="space-y-3">
                  {userVotes.map((vote) => {
                    const creator = vote.creatorId === creator1.id ? creator1 : creator2;
                    return (
                      <div key={vote.id} className="bg-gray-700/50 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={creator.avatar} />
                              <AvatarFallback>{creator.displayName[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{creator.displayName}</div>
                              <div className="text-xs text-gray-400">
                                {vote.amount} SP at {vote.odds.toFixed(2)}x odds
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-yellow-400 font-medium">
                              +{vote.potentialWinning.toFixed(0)} SP
                            </div>
                            <Badge
                              variant={
                                vote.status === 'won' ? 'default' :
                                vote.status === 'lost' ? 'destructive' :
                                vote.status === 'refunded' ? 'secondary' : 'outline'
                              }
                              className="text-xs"
                            >
                              {vote.status.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  <div className="border-t border-gray-600 pt-3 mt-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Total Voted</span>
                      <span className="text-white">{getTotalUserVotes()} SP</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Potential Winnings</span>
                      <span className="text-yellow-400 font-bold">
                        {getPotentialWinnings().toFixed(0)} SP
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <History className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="font-medium text-gray-300 mb-2">No Votes Yet</h3>
                  <p className="text-sm text-gray-400">
                    Place your first vote to start earning!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Top Voters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Mock leaderboard data */}
                {[
                  { username: 'lucky_voter', amount: 2500, winRate: 78 },
                  { username: 'crypto_king', amount: 1800, winRate: 65 },
                  { username: 'battle_pro', amount: 1200, winRate: 82 },
                  { username: 'risk_taker', amount: 950, winRate: 45 },
                  { username: 'smart_money', amount: 800, winRate: 90 },
                ].map((voter, index) => (
                  <div key={voter.username} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700/50">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                      index === 0 && "bg-yellow-400 text-black",
                      index === 1 && "bg-gray-400 text-black",
                      index === 2 && "bg-amber-600 text-white",
                      index > 2 && "bg-gray-600 text-white"
                    )}>
                      {index + 1}
                    </div>
                    
                    <div className="flex-1">
                      <div className="font-medium">{voter.username}</div>
                      <div className="text-xs text-gray-400">
                        {voter.winRate}% win rate
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold text-yellow-400">
                        {voter.amount.toLocaleString()} SP
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BattleVoting;