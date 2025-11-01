import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Calendar,
  CheckCircle,
  Play
} from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { rewardsNotificationService } from "@/services/rewardsNotificationService";
import { rewardsChallengesService, ChallengeWithProgress } from "@/services/rewardsChallengesService";

const RewardsChallengesTab = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [challenges, setChallenges] = useState<ChallengeWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch challenges data
  useEffect(() => {
    const fetchChallenges = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const challengesWithProgress = await rewardsChallengesService.getChallengesWithProgress(user.id);
        setChallenges(challengesWithProgress);
      } catch (err) {
        console.error("Error fetching challenges:", err);
        setError("Failed to load challenges");
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, [user?.id]);

  const categories = [
    { value: "all", label: "All Challenges", icon: Target },
    { value: "daily", label: "Daily", icon: Calendar },
    { value: "content", label: "Content", icon: Zap },
    { value: "engagement", label: "Engagement", icon: TrendingUp },
    { value: "community", label: "Community", icon: Users }
  ];

  const filteredChallenges = selectedCategory === "all" 
    ? challenges 
    : challenges.filter(challenge => challenge.type === selectedCategory);

  const getDifficultyColor = (type: string) => {
    switch (type) {
      case 'daily': return 'bg-green-100 text-green-800';
      case 'content': return 'bg-blue-100 text-blue-800';
      case 'engagement': return 'bg-yellow-100 text-yellow-800';
      case 'community': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (isCompleted: boolean) => {
    return isCompleted ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <Play className="h-4 w-4 text-blue-500" />;
  };

  const totalActiveRewards = challenges
    .filter(c => !c.is_completed)
    .reduce((sum, c) => sum + c.points_reward, 0);

  const completedToday = challenges.filter(c => c.is_completed).length;

  const handleClaimReward = async (challengeId: string) => {
    if (!user?.id) return;
    
    try {
      const result = await rewardsChallengesService.claimChallengeReward(user.id, challengeId);
      if (result) {
        // Update local state
        setChallenges(prev => prev.map(c => 
          c.id === challengeId ? { ...c, reward_claimed: true } : c
        ));
        
        // Show notification
        const challenge = challenges.find(c => c.id === challengeId);
        if (challenge) {
          rewardsNotificationService.notifyChallengeCompleted(
            challenge.title,
            challenge.points_reward
          );
        }
      }
    } catch (err) {
      console.error("Error claiming reward:", err);
    }
  };

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <Card key={i} className="h-48">
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
        <div className="text-red-500 mb-2">Error loading challenges</div>
        <div className="text-sm text-gray-500">{error}</div>
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
                <p className="text-2xl font-bold">{challenges.filter(c => !c.is_completed).length}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed Today</p>
                <p className="text-2xl font-bold">{completedToday}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Potential Rewards</p>
                <p className="text-2xl font-bold">{formatCurrency(totalActiveRewards)}</p>
              </div>
              <Gift className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">87%</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
                className="flex items-center gap-2"
              >
                <category.icon className="h-4 w-4" />
                {category.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Challenges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Active Challenges
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredChallenges.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredChallenges.map((challenge) => (
                <Card key={challenge.id} className="relative">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{challenge.title}</h3>
                        <p className="text-muted-foreground text-sm mb-3">{challenge.description}</p>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="secondary" className={getDifficultyColor(challenge.type)}>
                            {challenge.type.charAt(0).toUpperCase() + challenge.type.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          {getStatusIcon(challenge.is_completed)}
                          <span className="text-sm capitalize">
                            {challenge.is_completed ? 'completed' : 'active'}
                          </span>
                        </div>
                        <div className="text-green-600 font-bold">
                          +{formatCurrency(challenge.points_reward)}
                        </div>
                      </div>
                    </div>

                    {!challenge.is_completed && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress: {challenge.progress}/{challenge.target_value}</span>
                          <span>{Math.round((challenge.progress / challenge.target_value) * 100)}%</span>
                        </div>
                        <Progress 
                          value={(challenge.progress / challenge.target_value) * 100} 
                          className="h-2"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        No limit
                      </div>
                      <Button
                        size="sm"
                        variant={challenge.is_completed ? "secondary" : "default"}
                        disabled={challenge.is_completed}
                        onClick={() => {
                          if (challenge.is_completed) {
                            handleClaimReward(challenge.id);
                          }
                        }}
                      >
                        {challenge.is_completed ? 
                          (challenge.reward_claimed ? 'Reward Claimed' : 'Claim Reward') :
                          'View Details'}
                        {!challenge.is_completed && <ArrowRight className="h-4 w-4 ml-1" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No challenges found in this category
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suggested Challenges */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Suggested for You
            </CardTitle>
            <Badge variant="secondary">New Opportunities</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            More challenges coming soon!
          </div>
          
          <div className="mt-6 text-center">
            <Button variant="outline" disabled>
              <TrendingUp className="h-4 w-4 mr-2" />
              View More Challenges
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RewardsChallengesTab;