import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  Clock,
  Trophy,
  Flame,
  Target,
  Star,
  DollarSign,
  TrendingUp,
  Crown,
  Eye
} from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import BattleVoting from "@/components/voting/BattleVoting";
import { rewardsNotificationService } from "@/services/rewardsNotificationService";
import { rewardsBattlesService, LiveBattle, BattleVote } from "@/services/rewardsBattlesService";

// Helper function to convert BattleVote to Vote
const convertBattleVoteToVote = (battleVote: BattleVote): any => ({
  id: battleVote.id,
  amount: battleVote.amount,
  creatorId: battleVote.creator_id,
  odds: battleVote.odds,
  potentialWinning: battleVote.potential_winning,
  timestamp: new Date(battleVote.created_at),
  status: battleVote.status as 'active' | 'won' | 'lost' | 'refunded'
});

interface Creator {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  verified: boolean;
  tier: 'rising_star' | 'pro_creator' | 'legend';
  winRate: number;
  totalVotes: number;
  isLeading: boolean;
  currentScore: number;
  followers: string;
}

interface BattleWithVotes {
  battle: LiveBattle;
  userVotes: BattleVote[];
}

const RewardsBattleTab = () => {
  const { user } = useAuth();
  const [selectedBattle, setSelectedBattle] = useState<LiveBattle | null>(null);
  const [showVotingModal, setShowVotingModal] = useState(false);
  const [battlesWithVotes, setBattlesWithVotes] = useState<BattleWithVotes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'live' | 'upcoming'>('all');

  // Fetch battles data
  useEffect(() => {
    const fetchBattles = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const data = await rewardsBattlesService.getBattlesWithVotes(user.id);
        setBattlesWithVotes(data);
      } catch (err) {
        console.error("Error fetching battles:", err);
        setError("Failed to load battles");
      } finally {
        setLoading(false);
      }
    };

    fetchBattles();
  }, [user?.id]);

  const filteredBattles = filter === 'all' 
    ? battlesWithVotes 
    : battlesWithVotes.filter(battle => {
        if (filter === 'live') {
          return battle.battle.status === 'live' || battle.battle.status === 'active';
        }
        if (filter === 'upcoming') {
          return battle.battle.status === 'pending';
        }
        return true;
      });

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return '0s';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${secs}s`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
      case 'active':
        return 'bg-red-500 text-white animate-pulse';
      case 'pending':
      case 'upcoming':
        return 'bg-blue-500 text-white';
      case 'ended':
      case 'completed':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const handleVoteBattle = (battle: LiveBattle) => {
    setSelectedBattle(battle);
    setShowVotingModal(true);
  };

  const handlePlaceVote = async (voteData: { 
    amount: number; 
    creatorId: string; 
    odds: number; 
    potentialWinning: number 
  }) => {
    if (!user?.id || !selectedBattle) return;
    
    try {
      const vote = await rewardsBattlesService.placeBattleVote(
        user.id,
        selectedBattle.id,
        voteData.creatorId,
        voteData.amount,
        voteData.odds,
        voteData.potentialWinning
      );
      
      if (vote) {
        // Update local state
        setBattlesWithVotes(prev => prev.map(battleWithVotes => {
          if (battleWithVotes.battle.id === selectedBattle.id) {
            return {
              ...battleWithVotes,
              userVotes: [...battleWithVotes.userVotes, vote]
            };
          }
          return battleWithVotes;
        }));
        
        setShowVotingModal(false);
        
        // Trigger notification for vote placed
        rewardsNotificationService.addRewardsNotification({
          type: 'battle',
          title: 'Battle Vote Placed! 🎯',
          message: `Voted ${formatCurrency(voteData.amount)} - Potential win: ${formatCurrency(voteData.potentialWinning)}`,
          amount: voteData.amount,
          priority: 'medium',
          actionUrl: '/app/rewards?tab=battles',
          actionLabel: 'View Battle'
        });
      }
    } catch (err) {
      console.error("Error placing vote:", err);
    }
  };

  const totalEarnings = battlesWithVotes
    .flatMap(b => b.userVotes)
    .filter(vote => vote.status === 'won')
    .reduce((sum, vote) => sum + vote.potential_winning, 0);

  const activeVotes = battlesWithVotes
    .flatMap(b => b.userVotes)
    .filter(vote => vote.status === 'active').length;

  // Mock user balance - in a real app this would come from user's wallet
  const userBalance = 2500;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <Card key={i} className="h-64">
                    <CardContent className="p-4">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                      <div className="h-2 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-2">Error loading battles</div>
        <div className="text-sm text-gray-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Battle Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Live Battles</p>
                <p className="text-2xl font-bold">{battlesWithVotes.filter(b => b.battle.status === 'live' || b.battle.status === 'active').length}</p>
              </div>
              <Flame className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Votes</p>
                <p className="text-2xl font-bold">{activeVotes}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold">{formatCurrency(totalEarnings)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Balance</p>
                <p className="text-2xl font-bold">{formatCurrency(userBalance)}</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'All Battles', icon: Trophy },
              { value: 'live', label: 'Live Now', icon: Flame },
              { value: 'upcoming', label: 'Upcoming', icon: Clock }
            ].map((option) => (
              <Button
                key={option.value}
                variant={filter === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(option.value as any)}
                className="flex items-center gap-2"
              >
                <option.icon className="h-4 w-4" />
                {option.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Battle List */}
      {filteredBattles.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredBattles.map(({ battle }) => (
            <Card key={battle.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{battle.title}</CardTitle>
                  <Badge className={getStatusColor(battle.status)}>
                    {battle.status === 'live' || battle.status === 'active' ? (
                      <Flame className="h-3 w-3 mr-1" />
                    ) : null}
                    {battle.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {battle.status === 'pending' ? `Starts soon` : 
                     battle.status === 'live' || battle.status === 'active' ? 
                     `${formatTime(battle.duration)} left` : 'Ended'}
                  </div>
                  {(battle.status === 'live' || battle.status === 'active') && (
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {battle.total_viewers.toLocaleString()} viewers
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Voting Pool Info */}
                <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Voting Pool</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(battle.bet_pool)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{battle.total_bets} voters</span>
                    <span>Potential: +{formatCurrency(battle.bet_pool * 0.9)}</span>
                  </div>
                  {battle.status !== 'ended' && battle.status !== 'completed' && (
                    <Progress 
                      value={50} 
                      className="h-2"
                    />
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {(battle.status === 'live' || battle.status === 'active') && (
                    <Button size="sm" variant="outline" className="flex-1">
                      <Play className="h-4 w-4 mr-2" />
                      Watch Live
                    </Button>
                  )}
                  {battle.status !== 'ended' && battle.status !== 'completed' && (
                    <Button 
                      size="sm" 
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleVoteBattle(battle)}
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Vote & Earn
                    </Button>
                  )}
                  {(battle.status === 'ended' || battle.status === 'completed') && (
                    <Button size="sm" variant="secondary" className="flex-1" disabled>
                      <Trophy className="h-4 w-4 mr-2" />
                      Battle Ended
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8 text-muted-foreground">
            No battles found in this category
          </CardContent>
        </Card>
      )}

      {/* How Battle Voting Works */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            How Battle Voting Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Choose Your Creator</h3>
              <p className="text-sm text-muted-foreground">
                Select which creator you think will win the battle based on their stats and performance.
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Place Your Vote</h3>
              <p className="text-sm text-muted-foreground">
                Vote with your Eloits. Higher odds mean higher potential rewards.
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold mb-2">Earn Rewards</h3>
              <p className="text-sm text-muted-foreground">
                Win based on odds calculation. Winners share 90% of the pool, 10% platform fee.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Battle Voting Modal */}
      {showVotingModal && selectedBattle && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg p-4 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-lg">Battle Voting: {selectedBattle.title}</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowVotingModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </Button>
            </div>

            <div className="bg-gray-900 rounded-lg p-4">
              <BattleVoting
                battleId={selectedBattle.id}
                creator1={{
                  id: selectedBattle.creator1_id,
                  username: "creator1",
                  displayName: "Creator 1",
                  avatar: "",
                  tier: "rising_star",
                  verified: false,
                  currentScore: selectedBattle.creator1_score,
                  winRate: 0,
                  totalVotes: 0,
                  isLeading: selectedBattle.creator1_score > selectedBattle.creator2_score
                }}
                creator2={{
                  id: selectedBattle.creator2_id || "",
                  username: "creator2",
                  displayName: "Creator 2",
                  avatar: "",
                  tier: "rising_star",
                  verified: false,
                  currentScore: selectedBattle.creator2_score,
                  winRate: 0,
                  totalVotes: 0,
                  isLeading: selectedBattle.creator2_score > selectedBattle.creator1_score
                }}
                isLive={selectedBattle.status === 'live' || selectedBattle.status === 'active'}
                timeRemaining={selectedBattle.duration || 0}
                userBalance={userBalance}
                onPlaceVote={handlePlaceVote}
                userVotes={battlesWithVotes.find(b => b.battle.id === selectedBattle.id)?.userVotes.map(convertBattleVoteToVote) || []}
                votingPool={{
                  creator1Total: selectedBattle.creator1_score,
                  creator2Total: selectedBattle.creator2_score,
                  totalPool: selectedBattle.bet_pool,
                  totalVoters: selectedBattle.total_bets
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RewardsBattleTab;