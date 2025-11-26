import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Play,
  Clock,
  Trophy,
  Flame,
  Target,
  DollarSign,
  TrendingUp,
  Eye,
  RefreshCw,
  AlertCircle,
  Zap,
} from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import BattleVoting from "@/components/voting/BattleVoting";
import { rewardsNotificationService } from "@/services/rewardsNotificationService";
import { rewardsBattlesService, LiveBattle, BattleVote } from "@/services/rewardsBattlesService";
import { useRewardsSummary } from "@/hooks/useRewardsSummary";

interface Creator {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  verified: boolean;
  tier: "rising_star" | "pro_creator" | "legend";
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

const EnhancedRewardsBattleTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { summary, isLoading: summaryLoading } = useRewardsSummary();
  
  const [selectedBattle, setSelectedBattle] = useState<LiveBattle | null>(null);
  const [showVotingModal, setShowVotingModal] = useState(false);
  const [battlesWithVotes, setBattlesWithVotes] = useState<BattleWithVotes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "live" | "upcoming">("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch battles data
  useEffect(() => {
    const fetchBattles = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        setError(null);
        const data = await rewardsBattlesService.getBattlesWithVotes(user.id);
        setBattlesWithVotes(data);
      } catch (err) {
        console.error("Error fetching battles:", err);
        setError("Failed to load battles. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBattles();

    // Refresh battles every 10 seconds for live updates
    const interval = setInterval(fetchBattles, 10000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      if (!user?.id) return;
      const data = await rewardsBattlesService.getBattlesWithVotes(user.id);
      setBattlesWithVotes(data);
      toast({
        title: "✓ Refreshed",
        description: "Battle data updated",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to refresh battles",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredBattles = filter === "all"
    ? battlesWithVotes
    : battlesWithVotes.filter((battle) => {
        if (filter === "live") {
          return battle.battle.status === "live" || battle.battle.status === "active";
        }
        if (filter === "upcoming") {
          return battle.battle.status === "pending";
        }
        return true;
      });

  const formatTime = (seconds: number | null) => {
    if (seconds === null || seconds <= 0) return "0s";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
      case "active":
        return "bg-red-500 text-white animate-pulse";
      case "pending":
      case "upcoming":
        return "bg-blue-500 text-white";
      case "ended":
      case "completed":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const handleVoteBattle = (battle: LiveBattle) => {
    // Check if user has sufficient balance
    if (!summary || summary.available_balance <= 0) {
      toast({
        title: "Insufficient Balance",
        description: "You need balance to place a vote. Earn some rewards first!",
        variant: "destructive",
      });
      return;
    }

    setSelectedBattle(battle);
    setShowVotingModal(true);
  };

  const handlePlaceVote = async (voteData: {
    amount: number;
    creatorId: string;
    odds: number;
    potentialWinning: number;
  }) => {
    if (!user?.id || !selectedBattle) return;

    // Validate balance
    if (!summary || summary.available_balance < voteData.amount) {
      toast({
        title: "Insufficient Balance",
        description: `You need ${formatCurrency(voteData.amount, summary?.currency_code)} but only have ${formatCurrency(summary?.available_balance || 0, summary?.currency_code)}`,
        variant: "destructive",
      });
      return;
    }

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
        setBattlesWithVotes((prev) =>
          prev.map((battleWithVotes) => {
            if (battleWithVotes.battle.id === selectedBattle.id) {
              return {
                ...battleWithVotes,
                userVotes: [...battleWithVotes.userVotes, vote],
              };
            }
            return battleWithVotes;
          })
        );

        setShowVotingModal(false);

        // Trigger notification
        rewardsNotificationService.addRewardsNotification({
          type: "battle",
          title: "🎯 Battle Vote Placed!",
          message: `Voted ${formatCurrency(voteData.amount, summary.currency_code)} - Potential win: ${formatCurrency(voteData.potentialWinning, summary.currency_code)}`,
          amount: voteData.amount,
          priority: "medium",
          actionUrl: "/app/rewards?tab=battles",
          actionLabel: "View Battle",
        });

        toast({
          title: "✓ Vote Placed",
          description: `You've bet ${formatCurrency(voteData.amount, summary.currency_code)} on this battle!`,
        });
      }
    } catch (err) {
      console.error("Error placing vote:", err);
      toast({
        title: "Error",
        description: "Failed to place vote. Please try again.",
        variant: "destructive",
      });
    }
  };

  const totalEarnings = battlesWithVotes
    .flatMap((b) => b.userVotes)
    .filter((vote) => vote.status === "won")
    .reduce((sum, vote) => sum + vote.potential_winning, 0);

  const activeVotes = battlesWithVotes
    .flatMap((b) => b.userVotes)
    .filter((vote) => vote.status === "active").length;

  // Get user balance - use real balance from summary or default to 0
  const userBalance = summary?.available_balance || 0;

  if (loading || summaryLoading) {
    return (
      <div className="space-y-6">
        {/* Stats skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-6 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Battles skeleton */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <Card key={i} className="h-64">
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-2 w-full mb-4" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-24 flex-1" />
                      <Skeleton className="h-8 w-24 flex-1" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
        <Button onClick={handleRefresh} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Balance Alert */}
      {userBalance <= 0 && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-900 dark:text-amber-100">No Balance Available</p>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Earn rewards to get balance for battle voting
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Battle Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Your Balance</p>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(userBalance, summary?.currency_code || "USD")}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500 opacity-20" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Available to vote</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Live Battles</p>
                <p className="text-2xl font-bold mt-1">
                  {battlesWithVotes.filter(
                    (b) => b.battle.status === "live" || b.battle.status === "active"
                  ).length}
                </p>
              </div>
              <Flame className="h-8 w-8 text-red-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Votes</p>
                <p className="text-2xl font-bold mt-1">{activeVotes}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(totalEarnings, summary?.currency_code || "USD")}
                </p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2 items-center flex-wrap">
            {[
              { value: "all", label: "All Battles", icon: Trophy },
              { value: "live", label: "Live Now", icon: Flame },
              { value: "upcoming", label: "Upcoming", icon: Clock },
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

            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="ml-auto"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Battle List */}
      {filteredBattles.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredBattles.map(({ battle }) => {
            const isLive = battle.status === "live" || battle.status === "active";

            return (
              <Card key={battle.id} className="relative overflow-hidden">
                {isLive && (
                  <div className="absolute top-0 right-0 w-1 h-full bg-red-500 animate-pulse" />
                )}

                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{battle.title}</CardTitle>
                    <Badge className={getStatusColor(battle.status)}>
                      {isLive ? (
                        <Flame className="h-3 w-3 mr-1" />
                      ) : null}
                      {battle.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {battle.status === "pending"
                        ? "Starts soon"
                        : isLive
                        ? `${formatTime(battle.duration)} left`
                        : "Ended"}
                    </div>
                    {isLive && (
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {(battle.total_viewers || 0).toLocaleString()} viewers
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Voting Pool Info */}
                  <div className="bg-gray-50 dark:bg-gray-900/30 p-3 rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Voting Pool</span>
                      <span className="font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(battle.bet_pool || 0, summary?.currency_code || "USD")}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{(battle.total_bets || 0)} voters</span>
                      <span>
                        Potential: +
                        {formatCurrency(
                          (battle.bet_pool || 0) * 0.9,
                          summary?.currency_code || "USD"
                        )}
                      </span>
                    </div>
                    {battle.status !== "ended" && battle.status !== "completed" && (
                      <Progress value={50} className="h-2" />
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {isLive && (
                      <Button size="sm" variant="outline" className="flex-1">
                        <Play className="h-4 w-4 mr-2" />
                        Watch Live
                      </Button>
                    )}
                    {battle.status !== "ended" && battle.status !== "completed" && (
                      <Button
                        size="sm"
                        className={`flex-1 ${
                          userBalance > 0
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-gray-400 cursor-not-allowed"
                        }`}
                        onClick={() => handleVoteBattle(battle)}
                        disabled={userBalance <= 0}
                      >
                        <Target className="h-4 w-4 mr-2" />
                        {userBalance > 0 ? "Vote & Earn" : "No Balance"}
                      </Button>
                    )}
                    {(battle.status === "ended" || battle.status === "completed") && (
                      <Button size="sm" variant="secondary" className="flex-1" disabled>
                        <Trophy className="h-4 w-4 mr-2" />
                        Battle Ended
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8 text-muted-foreground">
            <Zap className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No battles found in this category</p>
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
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">1. Choose Creator</h3>
              <p className="text-sm text-muted-foreground">
                Select which creator you think will win based on their stats
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">2. Place Vote</h3>
              <p className="text-sm text-muted-foreground">
                Vote with your balance. Higher odds = higher potential rewards
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold mb-2">3. Earn Rewards</h3>
              <p className="text-sm text-muted-foreground">
                Winners share 90% of pool, 10% goes to platform
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
              <h3 className="font-semibold text-lg">Battle Voting: {selectedBattle.title}</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowVotingModal(false)}
                className="text-gray-400 hover:text-foreground"
              >
                ✕
              </Button>
            </div>

            <div className="bg-muted rounded-lg p-4">
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
                  isLeading: selectedBattle.creator1_score > selectedBattle.creator2_score,
                  followers: "0",
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
                  isLeading: selectedBattle.creator2_score > selectedBattle.creator1_score,
                  followers: "0",
                }}
                isLive={selectedBattle.status === "live" || selectedBattle.status === "active"}
                timeRemaining={selectedBattle.duration || 0}
                userBalance={userBalance}
                onPlaceVote={handlePlaceVote}
                userVotes={
                  battlesWithVotes
                    .find((b) => b.battle.id === selectedBattle.id)
                    ?.userVotes.map((v) => ({
                      id: v.id,
                      amount: v.amount,
                      creatorId: v.creator_id,
                      odds: v.odds,
                      potentialWinning: v.potential_winning,
                      timestamp: new Date(v.created_at),
                      status: v.status as "active" | "won" | "lost" | "refunded",
                    })) || []
                }
                votingPool={{
                  creator1Total: selectedBattle.creator1_score,
                  creator2Total: selectedBattle.creator2_score,
                  totalPool: selectedBattle.bet_pool || 0,
                  totalVoters: selectedBattle.total_bets || 0,
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedRewardsBattleTab;
