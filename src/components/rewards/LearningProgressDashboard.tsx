// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Trophy,
  Star,
  BookOpen,
  Clock,
  Target,
  Award,
  TrendingUp,
  Calendar,
  Zap,
  Gift,
  Medal,
  Flame,
  CheckCircle2,
  BarChart3,
  Users,
  Crown
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { courseService } from '@/services/courseService';
import { educationalArticleService } from '@/services/educationalArticleService';
import { formatDateTime } from '@/utils/formatters';

interface LearningStats {
  totalPointsEarned: number;
  coursesCompleted: number;
  articlesCompleted: number;
  certificatesEarned: number;
  currentStreak: number;
  totalTimeSpent: number;
  averageScore: number;
  perfectScores: number;
  rank: number;
  level: string;
  nextLevelProgress: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

interface RecentActivity {
  id: string;
  type: 'course_completed' | 'lesson_completed' | 'article_completed' | 'quiz_passed' | 'achievement_unlocked';
  title: string;
  description: string;
  pointsEarned: number;
  timestamp: Date;
}

const LearningProgressDashboard: React.FC = () => {
  const { user } = useAuth();
  const [learningStats, setLearningStats] = useState<LearningStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [leaderboard, setLeaderboard] = useState<Array<{userId: string; points: number; rank: number}>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadLearningData();
    }
  }, [user]);

  const loadLearningData = async () => {
    if (!user) return;

    try {
      // Get course stats
      const courseStats = courseService.getCourseStats(user.id);
      const courseLeaderboard = courseService.getLearningLeaderboard();
      
      // Get article stats  
      const articleStats = educationalArticleService.getUserStats(user.id);
      const articleLeaderboard = educationalArticleService.getEducationalLeaderboard();

      // Combine stats
      const totalPoints = courseStats.totalPointsEarned + articleStats.totalPointsEarned;
      const totalCompleted = courseStats.completedCourses + articleStats.articlesCompleted;
      const totalTime = courseStats.totalTimeSpent + articleStats.totalTimeSpent;
      
      // Calculate level and progress
      const level = calculateLevel(totalPoints);
      const nextLevelProgress = calculateNextLevelProgress(totalPoints);

      const stats: LearningStats = {
        totalPointsEarned: totalPoints,
        coursesCompleted: courseStats.completedCourses,
        articlesCompleted: articleStats.articlesCompleted,
        certificatesEarned: courseStats.certificatesEarned,
        currentStreak: calculateStreak(),
        totalTimeSpent: totalTime,
        averageScore: Math.round((courseStats.averageProgress + articleStats.averageScore) / 2),
        perfectScores: articleStats.perfectScores,
        rank: calculateRank(totalPoints, [...courseLeaderboard, ...articleLeaderboard]),
        level,
        nextLevelProgress
      };

      setLearningStats(stats);
      setAchievements(generateAchievements(stats));
      setRecentActivity(generateRecentActivity());
      setLeaderboard(combineLeaderboards(courseLeaderboard, articleLeaderboard));
    } catch (error) {
      console.error('Error loading learning data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateLevel = (points: number): string => {
    if (points >= 10000) return 'Expert';
    if (points >= 5000) return 'Advanced';
    if (points >= 2000) return 'Intermediate';
    if (points >= 500) return 'Beginner+';
    return 'Beginner';
  };

  const calculateNextLevelProgress = (points: number): number => {
    const thresholds = [0, 500, 2000, 5000, 10000];
    const currentThreshold = thresholds.find((threshold, index) => 
      points < threshold || index === thresholds.length - 1
    ) || 10000;
    
    const prevThreshold = thresholds[thresholds.indexOf(currentThreshold) - 1] || 0;
    const progress = ((points - prevThreshold) / (currentThreshold - prevThreshold)) * 100;
    
    return Math.min(Math.max(progress, 0), 100);
  };

  const calculateStreak = (): number => {
    // This would calculate actual learning streak
    return Math.floor(Math.random() * 15) + 1;
  };

  const calculateRank = (userPoints: number, leaderboard: any[]): number => {
    const sorted = leaderboard.sort((a, b) => b.points - a.points);
    const userRank = sorted.findIndex(entry => entry.userId === user?.id) + 1;
    return userRank || sorted.length + 1;
  };

  const combineLeaderboards = (courseBoard: any[], articleBoard: any[]): any[] => {
    const combined = new Map();
    
    [...courseBoard, ...articleBoard].forEach(entry => {
      if (combined.has(entry.userId)) {
        const existing = combined.get(entry.userId);
        combined.set(entry.userId, {
          ...existing,
          points: existing.points + entry.points
        });
      } else {
        combined.set(entry.userId, entry);
      }
    });
    
    return Array.from(combined.values())
      .sort((a, b) => b.points - a.points)
      .slice(0, 10)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));
  };

  const generateAchievements = (stats: LearningStats): Achievement[] => {
    return [
      {
        id: 'first_lesson',
        title: 'First Steps',
        description: 'Complete your first lesson',
        icon: 'CheckCircle2',
        color: 'green',
        unlockedAt: stats.coursesCompleted > 0 || stats.articlesCompleted > 0 ? new Date() : undefined
      },
      {
        id: 'course_master',
        title: 'Course Master',
        description: 'Complete 5 courses',
        icon: 'Trophy',
        color: 'blue',
        unlockedAt: stats.coursesCompleted >= 5 ? new Date() : undefined,
        progress: stats.coursesCompleted,
        maxProgress: 5
      },
      {
        id: 'perfect_student',
        title: 'Perfect Student', 
        description: 'Get 10 perfect quiz scores',
        icon: 'Star',
        color: 'amber',
        unlockedAt: stats.perfectScores >= 10 ? new Date() : undefined,
        progress: stats.perfectScores,
        maxProgress: 10
      },
      {
        id: 'time_scholar',
        title: 'Time Scholar',
        description: 'Spend 24 hours learning',
        icon: 'Clock',
        color: 'purple',
        unlockedAt: stats.totalTimeSpent >= 1440 ? new Date() : undefined,
        progress: Math.min(stats.totalTimeSpent, 1440),
        maxProgress: 1440
      },
      {
        id: 'streak_warrior',
        title: 'Streak Warrior',
        description: 'Maintain a 7-day learning streak',
        icon: 'Flame',
        color: 'red',
        unlockedAt: stats.currentStreak >= 7 ? new Date() : undefined,
        progress: stats.currentStreak,
        maxProgress: 7
      },
      {
        id: 'knowledge_collector',
        title: 'Knowledge Collector',
        description: 'Read 20 articles',
        icon: 'BookOpen',
        color: 'indigo',
        unlockedAt: stats.articlesCompleted >= 20 ? new Date() : undefined,
        progress: stats.articlesCompleted,
        maxProgress: 20
      }
    ];
  };

  const generateRecentActivity = (): RecentActivity[] => {
    // This would fetch actual recent activity
    return [
      {
        id: '1',
        type: 'lesson_completed',
        title: 'Lesson Completed',
        description: 'What is Cryptocurrency?',
        pointsEarned: 15,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: '2', 
        type: 'quiz_passed',
        title: 'Quiz Passed',
        description: 'Blockchain Fundamentals Quiz (85%)',
        pointsEarned: 25,
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000)
      },
      {
        id: '3',
        type: 'achievement_unlocked',
        title: 'Achievement Unlocked',
        description: 'First Steps - Complete your first lesson',
        pointsEarned: 50,
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ];
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Expert': return 'from-purple-500 to-pink-500';
      case 'Advanced': return 'from-blue-500 to-purple-500';
      case 'Intermediate': return 'from-green-500 to-blue-500';
      case 'Beginner+': return 'from-yellow-500 to-orange-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!learningStats) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">No learning data available</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Learning Dashboard</h1>
          <p className="text-muted-foreground">Track your progress and achievements</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${getLevelColor(learningStats.level)} text-white font-semibold`}>
            <Crown className="h-4 w-4 inline mr-2" />
            {learningStats.level}
          </div>
          <Badge variant="outline" className="text-lg px-3 py-1">
            #{learningStats.rank}
          </Badge>
        </div>
      </div>

      {/* Level Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Level Progress</h3>
              <p className="text-sm text-muted-foreground">
                {learningStats.totalPointsEarned} total points earned
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{Math.round(learningStats.nextLevelProgress)}%</div>
              <div className="text-sm text-muted-foreground">to next level</div>
            </div>
          </div>
          <Progress value={learningStats.nextLevelProgress} className="h-3" />
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Courses</p>
                <p className="text-2xl font-bold">{learningStats.coursesCompleted}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Articles</p>
                <p className="text-2xl font-bold">{learningStats.articlesCompleted}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Certificates</p>
                <p className="text-2xl font-bold">{learningStats.certificatesEarned}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Flame className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Streak</p>
                <p className="text-2xl font-bold">{learningStats.currentStreak} days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time Spent</p>
                <p className="text-2xl font-bold">{formatTime(learningStats.totalTimeSpent)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Score</p>
                <p className="text-2xl font-bold">{learningStats.averageScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Perfect Scores</p>
                <p className="text-2xl font-bold">{learningStats.perfectScores}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <Gift className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Points</p>
                <p className="text-2xl font-bold">{learningStats.totalPointsEarned.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for detailed views */}
      <Tabs defaultValue="achievements" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement) => {
              const IconComponent = achievement.icon === 'CheckCircle2' ? CheckCircle2 :
                                 achievement.icon === 'Trophy' ? Trophy :
                                 achievement.icon === 'Star' ? Star :
                                 achievement.icon === 'Clock' ? Clock :
                                 achievement.icon === 'Flame' ? Flame :
                                 achievement.icon === 'BookOpen' ? BookOpen : Medal;
              
              return (
                <Card key={achievement.id} className={`${achievement.unlockedAt ? 'border-green-200 bg-green-50/50 dark:bg-green-900/10' : 'opacity-60'}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        achievement.unlockedAt ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'
                      }`}>
                        <IconComponent className={`h-6 w-6 ${
                          achievement.unlockedAt ? 'text-green-600' : 'text-gray-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{achievement.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                        
                        {achievement.maxProgress && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>{achievement.progress}/{achievement.maxProgress}</span>
                              <span>{Math.round(((achievement.progress || 0) / achievement.maxProgress) * 100)}%</span>
                            </div>
                            <Progress value={((achievement.progress || 0) / achievement.maxProgress) * 100} className="h-2" />
                          </div>
                        )}
                        
                        {achievement.unlockedAt && (
                          <Badge className="mt-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Unlocked
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    {activity.type === 'lesson_completed' && <CheckCircle2 className="h-5 w-5 text-blue-600" />}
                    {activity.type === 'quiz_passed' && <Trophy className="h-5 w-5 text-blue-600" />}
                    {activity.type === 'achievement_unlocked' && <Medal className="h-5 w-5 text-blue-600" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{activity.title}</h4>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        +{activity.pointsEarned} pts
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDateTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Learning Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((entry, index) => (
                  <div key={entry.userId} className={`flex items-center gap-3 p-3 rounded-lg ${
                    entry.userId === user?.id ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200' : 'hover:bg-muted/50'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      index === 2 ? 'bg-orange-100 text-orange-800' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs">
                        {entry.userId.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">
                        {entry.userId === user?.id ? 'You' : `User ${entry.userId.slice(-4)}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{entry.points.toLocaleString()} pts</p>
                      <p className="text-xs text-muted-foreground">
                        {entry.coursesCompleted} courses • {entry.certificatesEarned} certificates
                      </p>
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

export default LearningProgressDashboard;
