import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Flame, Target, Award } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/utils/utils";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points_reward: number;
  badge_color: string;
  requirements: any;
  earned?: boolean;
  progress?: number;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: string;
  target_value: number;
  points_reward: number;
  current_progress: number;
  completed: boolean;
}

interface UserStreak {
  streak_type: string;
  current_streak: number;
  longest_streak: number;
}

const AchievementSystem = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [streaks, setStreaks] = useState<UserStreak[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [activeTab, setActiveTab] = useState<'achievements' | 'challenges' | 'streaks'>('achievements');

  useEffect(() => {
    if (user) {
      fetchAchievements();
      fetchChallenges();
      fetchStreaks();
      fetchUserPoints();
    }
  }, [user]);

  const fetchAchievements = async () => {
    try {
      // Fetch all achievements using direct query
      const { data: allAchievements, error: achievementsError } = await supabase
        .from('achievements' as any)
        .select('*');

      if (achievementsError) throw achievementsError;

      // Fetch user's achievements progress using direct query
      const { data: userAchievements, error: userError } = await supabase
        .from('user_achievements' as any)
        .select('achievement_id, progress, earned_at')
        .eq('user_id', user?.id);

      if (userError) throw userError;

      if (allAchievements) {
        const enhancedAchievements = allAchievements.map((achievement: any) => {
          const userProgress = userAchievements?.find((ua: any) => ua.achievement_id === achievement.id);
          return {
            ...achievement,
            earned: !!userProgress?.earned_at,
            progress: userProgress?.progress || 0
          };
        });
        setAchievements(enhancedAchievements);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  const fetchChallenges = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch today's challenges using direct query
      const { data: dailyChallenges, error: challengesError } = await supabase
        .from('challenges' as any)
        .select('*')
        .eq('is_daily', true)
        .eq('active_date', today);

      if (challengesError) throw challengesError;

      // Fetch user's progress for today's challenges using direct query
      const { data: userProgress, error: progressError } = await supabase
        .from('user_challenge_progress' as any)
        .select('*')
        .eq('user_id', user?.id)
        .eq('date', today);

      if (progressError) throw progressError;

      if (dailyChallenges) {
        const enhancedChallenges = dailyChallenges.map((challenge: any) => {
          const progress = userProgress?.find((up: any) => up.challenge_id === challenge.id);
          return {
            ...challenge,
            current_progress: progress?.current_progress || 0,
            completed: progress?.completed || false
          };
        });
        setChallenges(enhancedChallenges);
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
    }
  };

  const fetchStreaks = async () => {
    try {
      const { data, error } = await supabase
        .from('user_streaks' as any)
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;

      if (data) {
        setStreaks(data);
      }
    } catch (error) {
      console.error('Error fetching streaks:', error);
    }
  };

  const fetchUserPoints = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('points')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setUserPoints(data.points || 0);
      }
    } catch (error) {
      console.error('Error fetching user points:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'content': return <Star className="h-5 w-5" />;
      case 'social': return <Award className="h-5 w-5" />;
      case 'engagement': return <Target className="h-5 w-5" />;
      case 'trading': return <Trophy className="h-5 w-5" />;
      case 'consistency': return <Flame className="h-5 w-5" />;
      default: return <Trophy className="h-5 w-5" />;
    }
  };

  const getStreakIcon = (type: string) => {
    switch (type) {
      case 'posting': return '📝';
      case 'login': return '🗓️';
      case 'engagement': return '❤️';
      case 'trading': return '💰';
      default: return '🔥';
    }
  };

  return (
    <div className="space-y-6">
      {/* Points display */}
      <Card className="bg-gradient-to-r from-purple-500 to-blue-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Your Points</h2>
              <p className="text-3xl font-bold">{userPoints.toLocaleString()}</p>
            </div>
            <Trophy className="h-16 w-16 opacity-20" />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {(['achievements', 'challenges', 'streaks'] as const).map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "default" : "ghost"}
            className="flex-1 capitalize"
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </Button>
        ))}
      </div>

      {/* Achievements tab */}
      {activeTab === 'achievements' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {achievements.map((achievement) => (
            <Card key={achievement.id} className={cn(
              "transition-all duration-200",
              achievement.earned ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200" : ""
            )}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-full",
                    achievement.earned ? "bg-yellow-100" : "bg-muted"
                  )}>
                    {getCategoryIcon(achievement.category)}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base">{achievement.name}</CardTitle>
                    <Badge variant={achievement.earned ? "default" : "secondary"} className="mt-1">
                      {achievement.points_reward} points
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                {!achievement.earned && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{achievement.progress}%</span>
                    </div>
                    <Progress value={achievement.progress} className="h-2" />
                  </div>
                )}
                {achievement.earned && (
                  <div className="flex items-center gap-2 text-yellow-600">
                    <Trophy className="h-4 w-4" />
                    <span className="text-sm font-medium">Completed!</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Challenges tab */}
      {activeTab === 'challenges' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Today's Challenges</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {challenges.map((challenge) => (
              <Card key={challenge.id} className={cn(
                "transition-all duration-200",
                challenge.completed ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200" : ""
              )}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{challenge.title}</CardTitle>
                    <Badge variant={challenge.completed ? "default" : "secondary"}>
                      {challenge.points_reward} pts
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{challenge.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{challenge.current_progress} / {challenge.target_value}</span>
                    </div>
                    <Progress 
                      value={(challenge.current_progress / challenge.target_value) * 100} 
                      className="h-2" 
                    />
                  </div>
                  {challenge.completed && (
                    <div className="flex items-center gap-2 text-green-600 mt-3">
                      <Trophy className="h-4 w-4" />
                      <span className="text-sm font-medium">Completed!</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Streaks tab */}
      {activeTab === 'streaks' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Your Streaks</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {streaks.map((streak) => (
              <Card key={streak.streak_type}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getStreakIcon(streak.streak_type)}</span>
                    <CardTitle className="capitalize">{streak.streak_type} Streak</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Streak</p>
                      <p className="text-2xl font-bold text-orange-500">{streak.current_streak} days</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Best Streak</p>
                      <p className="text-lg font-semibold">{streak.longest_streak} days</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementSystem;
