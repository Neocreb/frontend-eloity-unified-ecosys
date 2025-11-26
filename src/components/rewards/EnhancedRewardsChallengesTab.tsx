import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Target,
  Trophy,
  Clock,
  Star,
  Users,
  Zap,
  Gift,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Play,
  RefreshCw,
  Flame,
  Lock,
} from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { useChallengesProgress } from "@/hooks/useChallengesProgress";

const EnhancedRewardsChallengesTab = () => {
  const { toast } = useToast();
  const { challenges, isLoading, error, updateProgress, claimReward, refresh } = useChallengesProgress();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isClaimingReward, setIsClaimingReward] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const categories = [
    { value: "all", label: "All Challenges", icon: Target },
    { value: "daily", label: "Daily", icon: Clock },
    { value: "content", label: "Content", icon: Zap },
    { value: "engagement", label: "Engagement", icon: TrendingUp },
    { value: "referral", label: "Referral", icon: Users },
    { value: "marketplace", label: "Marketplace", icon: Gift },
    { value: "challenge", label: "Challenge", icon: Trophy },
  ];

  const filteredChallenges = selectedCategory === "all" 
    ? challenges 
    : challenges.filter((c) => c.type === selectedCategory);

  const getDifficultyColor = (difficulty?: string): string => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const getDifficultyIcon = (difficulty?: string) => {
    switch (difficulty) {
      case "easy":
        return "🟢";
      case "medium":
        return "🟡";
      case "hard":
        return "🔴";
      default:
        return "⚪";
    }
  };

  const getStatusIcon = (isCompleted: boolean) => {
    return isCompleted ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <Play className="h-5 w-5 text-blue-500" />
    );
  };

  const totalActiveRewards = filteredChallenges
    .filter((c) => !c.userProgress?.is_completed)
    .reduce((sum, c) => sum + c.points_reward, 0);

  const completedCount = filteredChallenges.filter(
    (c) => c.userProgress?.status === "completed"
  ).length;

  const handleClaimReward = async (challengeId: string) => {
    setIsClaimingReward(challengeId);
    const success = await claimReward(challengeId);

    if (success) {
      toast({
        title: "🎉 Reward Claimed!",
        description: `You've earned points for completing this challenge!`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to claim reward. Please try again.",
        variant: "destructive",
      });
    }

    setIsClaimingReward(null);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    toast({
      title: "✓ Refreshed",
      description: "Challenge progress updated",
    });
    setIsRefreshing(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
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

        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <Card key={i} className="h-64">
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-2 w-full mb-4" />
                    <Skeleton className="h-8 w-32" />
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
        <div className="text-red-600 dark:text-red-400 mb-2">Error loading challenges</div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{error.message}</p>
        <Button onClick={handleRefresh} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Challenge Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Challenges</p>
                <p className="text-2xl font-bold mt-1">
                  {filteredChallenges.filter((c) => c.userProgress?.status !== "completed").length}
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold mt-1">{completedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Potential Rewards</p>
                <p className="text-2xl font-bold mt-1">{totalActiveRewards}</p>
              </div>
              <Gift className="h-8 w-8 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold mt-1">
                  {challenges.length > 0
                    ? Math.round((completedCount / challenges.length) * 100)
                    : 0}%
                </p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.value)}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {category.label}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Active Challenges */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Available Challenges
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredChallenges.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredChallenges.map((challenge) => {
                const progress = challenge.userProgress;
                const isCompleted = progress?.status === "completed";
                const isRewardClaimed = progress?.reward_claimed;
                const currentProgress = progress?.progress || 0;
                const targetValue = progress?.target_value || challenge.target_value;
                const progressPercentage = Math.min((currentProgress / targetValue) * 100, 100);

                return (
                  <Card
                    key={challenge.id}
                    className={`relative overflow-hidden transition-all ${
                      isCompleted ? "border-green-300 dark:border-green-700" : ""
                    }`}
                  >
                    {isCompleted && (
                      <div className="absolute inset-0 bg-green-50 dark:bg-green-900/10 z-0" />
                    )}

                    <CardContent className="p-6 relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{challenge.title}</h3>
                            {challenge.difficulty && (
                              <Badge className={getDifficultyColor(challenge.difficulty)}>
                                {getDifficultyIcon(challenge.difficulty)} {challenge.difficulty}
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground text-sm">{challenge.description}</p>
                        </div>
                        <div className="text-right ml-4">
                          <div className="flex items-center gap-1 mb-1">
                            {getStatusIcon(isCompleted)}
                            <span className="text-sm capitalize text-muted-foreground">
                              {isCompleted ? "completed" : "active"}
                            </span>
                          </div>
                          <div className="text-green-600 dark:text-green-400 font-bold">
                            +{challenge.points_reward} pts
                          </div>
                        </div>
                      </div>

                      {!isCompleted && progress ? (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress: {currentProgress}/{targetValue}</span>
                            <span>{Math.round(progressPercentage)}%</span>
                          </div>
                          <Progress value={progressPercentage} className="h-2" />
                        </div>
                      ) : isCompleted ? (
                        <div className="mb-3">
                          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium">
                            <CheckCircle className="h-4 w-4" />
                            Challenge Completed!
                          </div>
                        </div>
                      ) : (
                        <div className="mb-3">
                          <p className="text-xs text-muted-foreground">
                            Not started yet. Make progress to begin tracking.
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />
                          No time limit
                        </div>
                        {isCompleted && !isRewardClaimed ? (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleClaimReward(challenge.id)}
                            disabled={isClaimingReward === challenge.id}
                          >
                            {isClaimingReward === challenge.id ? (
                              <>
                                <span className="animate-spin">⏳</span> Claiming...
                              </>
                            ) : (
                              <>
                                <Gift className="h-4 w-4 mr-2" />
                                Claim Reward
                              </>
                            )}
                          </Button>
                        ) : isCompleted && isRewardClaimed ? (
                          <Button size="sm" variant="secondary" disabled>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Reward Claimed
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline">
                            <ArrowRight className="h-4 w-4 ml-1" />
                            View Details
                          </Button>
                        )}
                      </div>

                      {/* Reward Info */}
                      <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                        <p>
                          Reward: <span className="font-medium text-green-600">{challenge.points_reward} Eloits</span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No challenges in this category</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* How to Complete Challenges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            How Challenges Work
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Play className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">1. Choose & Start</h3>
              <p className="text-sm text-muted-foreground">
                Pick a challenge and start making progress towards the goal
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">2. Build Progress</h3>
              <p className="text-sm text-muted-foreground">
                Complete actions related to the challenge to increase progress
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Gift className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">3. Claim Rewards</h3>
              <p className="text-sm text-muted-foreground">
                Once completed, claim your reward points instantly
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips Section */}
      <Card className="bg-blue-50 dark:bg-blue-900/20">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Flame className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm mb-1">💡 Pro Tips</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Complete multiple challenges daily for bonus multipliers</li>
                <li>• Harder challenges offer better rewards</li>
                <li>• Track your progress in real-time as you complete actions</li>
                <li>• Some challenges can be completed multiple times</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedRewardsChallengesTab;
