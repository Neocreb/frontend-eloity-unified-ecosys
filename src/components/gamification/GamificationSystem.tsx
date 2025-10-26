// @ts-nocheck
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Star,
  Zap,
  Target,
  Award,
  Medal,
  Crown,
  Gift,
  Flame,
  Calendar,
  Users,
  TrendingUp,
  Heart,
  MessageSquare,
  Share2,
  ShoppingCart,
  DollarSign,
  Coins,
  Clock,
  CheckCircle,
  Lock,
  Unlock,
  ArrowRight,
  Plus,
  Sparkles,
  Gem,
  Shield,
  Sword,
  Magic,
  Rocket,
  Camera,
  Mic,
  Video,
  Code,
  Palette,
  Briefcase,
  BookOpen,
  Globe,
  Home,
  Settings,
  Compass,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category:
    | "social"
    | "trading"
    | "marketplace"
    | "freelance"
    | "content"
    | "special";
  tier: "bronze" | "silver" | "gold" | "platinum" | "diamond";
  points: number;
  unlocked: boolean;
  unlockedAt?: Date;
  requirements: {
    type: string;
    current: number;
    target: number;
  }[];
  rarity: "common" | "rare" | "epic" | "legendary";
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  earnedAt: Date;
}

interface Level {
  level: number;
  title: string;
  minPoints: number;
  maxPoints: number;
  perks: string[];
  icon: React.ReactNode;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: "daily" | "weekly" | "monthly" | "special";
  icon: React.ReactNode;
  reward: {
    points: number;
    badges?: string[];
    special?: string;
  };
  progress: {
    current: number;
    target: number;
  };
  expiresAt: Date;
  completed: boolean;
}

interface Leaderboard {
  id: string;
  name: string;
  avatar?: string;
  level: number;
  points: number;
  rank: number;
  change: number;
  badges: number;
}

const mockAchievements: Achievement[] = [
  {
    id: "first-post",
    title: "First Steps",
    description: "Create your first post",
    icon: <Camera className="w-6 h-6" />,
    category: "social",
    tier: "bronze",
    points: 10,
    unlocked: true,
    unlockedAt: new Date("2024-01-10"),
    requirements: [{ type: "posts_created", current: 1, target: 1 }],
    rarity: "common",
  },
  {
    id: "social-butterfly",
    title: "Social Butterfly",
    description: "Get 100 likes on your posts",
    icon: <Heart className="w-6 h-6" />,
    category: "social",
    tier: "silver",
    points: 50,
    unlocked: true,
    unlockedAt: new Date("2024-01-15"),
    requirements: [{ type: "total_likes", current: 156, target: 100 }],
    rarity: "common",
  },
  {
    id: "crypto-trader",
    title: "Crypto Trader",
    description: "Complete your first cryptocurrency trade",
    icon: <TrendingUp className="w-6 h-6" />,
    category: "trading",
    tier: "bronze",
    points: 25,
    unlocked: false,
    requirements: [{ type: "trades_completed", current: 0, target: 1 }],
    rarity: "common",
  },
  {
    id: "marketplace-seller",
    title: "Marketplace Seller",
    description: "Sell your first product",
    icon: <ShoppingCart className="w-6 h-6" />,
    category: "marketplace",
    tier: "bronze",
    points: 30,
    unlocked: false,
    requirements: [{ type: "products_sold", current: 0, target: 1 }],
    rarity: "common",
  },
  {
    id: "influencer",
    title: "Rising Influencer",
    description: "Gain 1000 followers",
    icon: <Crown className="w-6 h-6" />,
    category: "social",
    tier: "gold",
    points: 200,
    unlocked: false,
    requirements: [{ type: "followers", current: 456, target: 1000 }],
    rarity: "rare",
  },
  {
    id: "content-creator",
    title: "Content Creator",
    description: "Upload 10 videos",
    icon: <Video className="w-6 h-6" />,
    category: "content",
    tier: "silver",
    points: 75,
    unlocked: false,
    requirements: [{ type: "videos_uploaded", current: 3, target: 10 }],
    rarity: "common",
  },
  {
    id: "crypto-whale",
    title: "Crypto Whale",
    description: "Trade over $10,000 in cryptocurrency",
    icon: <Coins className="w-6 h-6" />,
    category: "trading",
    tier: "platinum",
    points: 500,
    unlocked: false,
    requirements: [{ type: "trading_volume", current: 2450, target: 10000 }],
    rarity: "epic",
  },
  {
    id: "community-leader",
    title: "Community Leader",
    description: "Help 50 community members",
    icon: <Users className="w-6 h-6" />,
    category: "special",
    tier: "diamond",
    points: 1000,
    unlocked: false,
    requirements: [{ type: "helped_users", current: 12, target: 50 }],
    rarity: "legendary",
  },
];

const mockBadges: Badge[] = [
  {
    id: "early-adopter",
    name: "Early Adopter",
    description: "Joined during beta phase",
    icon: <Rocket className="w-4 h-4" />,
    color: "bg-blue-500",
    earnedAt: new Date("2024-01-01"),
  },
  {
    id: "streak-master",
    name: "Streak Master",
    description: "7-day activity streak",
    icon: <Flame className="w-4 h-4" />,
    color: "bg-orange-500",
    earnedAt: new Date("2024-01-08"),
  },
  {
    id: "helpful-member",
    name: "Helpful Member",
    description: "Received 10+ helpful votes",
    icon: <Heart className="w-4 h-4" />,
    color: "bg-red-500",
    earnedAt: new Date("2024-01-12"),
  },
];

const levels: Level[] = [
  {
    level: 1,
    title: "Newbie",
    minPoints: 0,
    maxPoints: 99,
    perks: ["Basic profile features"],
    icon: <Shield className="w-5 h-5" />,
  },
  {
    level: 2,
    title: "Explorer",
    minPoints: 100,
    maxPoints: 249,
    perks: ["Custom profile themes", "Priority support"],
    icon: <Compass className="w-5 h-5" />,
  },
  {
    level: 3,
    title: "Achiever",
    minPoints: 250,
    maxPoints: 499,
    perks: ["Advanced analytics", "Beta features access"],
    icon: <Star className="w-5 h-5" />,
  },
  {
    level: 4,
    title: "Expert",
    minPoints: 500,
    maxPoints: 999,
    perks: ["Verified badge", "Higher earning rates"],
    icon: <Award className="w-5 h-5" />,
  },
  {
    level: 5,
    title: "Master",
    minPoints: 1000,
    maxPoints: 2499,
    perks: ["Exclusive events", "Personal manager"],
    icon: <Crown className="w-5 h-5" />,
  },
  {
    level: 6,
    title: "Legend",
    minPoints: 2500,
    maxPoints: Infinity,
    perks: ["Hall of fame", "Platform governance voting"],
    icon: <Trophy className="w-5 h-5" />,
  },
];

const mockChallenges: Challenge[] = [
  {
    id: "daily-post",
    title: "Daily Creator",
    description: "Create a post today",
    type: "daily",
    icon: <Camera className="w-5 h-5" />,
    reward: { points: 10 },
    progress: { current: 0, target: 1 },
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    completed: false,
  },
  {
    id: "weekly-engagement",
    title: "Engagement Master",
    description: "Get 100 interactions this week",
    type: "weekly",
    icon: <Heart className="w-5 h-5" />,
    reward: { points: 50, badges: ["engagement-master"] },
    progress: { current: 67, target: 100 },
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    completed: false,
  },
  {
    id: "monthly-trader",
    title: "Monthly Trader",
    description: "Complete 20 trades this month",
    type: "monthly",
    icon: <TrendingUp className="w-5 h-5" />,
    reward: { points: 200, special: "Exclusive trading indicator" },
    progress: { current: 8, target: 20 },
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    completed: false,
  },
];

const mockLeaderboard: Leaderboard[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    avatar: "/api/placeholder/32/32",
    level: 5,
    points: 1250,
    rank: 1,
    change: 0,
    badges: 12,
  },
  {
    id: "2",
    name: "Alex Developer",
    avatar: "/api/placeholder/32/32",
    level: 4,
    points: 890,
    rank: 2,
    change: 1,
    badges: 8,
  },
  {
    id: "3",
    name: "Mike Crypto",
    avatar: "/api/placeholder/32/32",
    level: 4,
    points: 756,
    rank: 3,
    change: -1,
    badges: 7,
  },
  {
    id: "4",
    name: "Emma Creator",
    avatar: "/api/placeholder/32/32",
    level: 3,
    points: 445,
    rank: 4,
    change: 2,
    badges: 5,
  },
  {
    id: "5",
    name: "You",
    level: 2,
    points: 185,
    rank: 8,
    change: 3,
    badges: 3,
  },
];

export const GamificationSystem: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userPoints, setUserPoints] = useState(185);
  const [userLevel, setUserLevel] = useState(2);
  const [activeStreak, setActiveStreak] = useState(7);
  const [achievements, setAchievements] = useState(mockAchievements);
  const [challenges, setChallenges] = useState(mockChallenges);
  const [leaderboard, setLeaderboard] = useState(mockLeaderboard);
  const [showAchievementDialog, setShowAchievementDialog] =
    useState<Achievement | null>(null);

  useEffect(() => {
    checkForNewAchievements();
  }, [userPoints]);

  const checkForNewAchievements = () => {
    // Simulate checking for newly unlocked achievements
    achievements.forEach((achievement) => {
      if (!achievement.unlocked) {
        const allRequirementsMet = achievement.requirements.every(
          (req) => req.current >= req.target,
        );

        if (allRequirementsMet) {
          unlockAchievement(achievement);
        }
      }
    });
  };

  const unlockAchievement = (achievement: Achievement) => {
    setAchievements((prev) =>
      prev.map((a) =>
        a.id === achievement.id
          ? { ...a, unlocked: true, unlockedAt: new Date() }
          : a,
      ),
    );

    setUserPoints((prev) => prev + achievement.points);
    setShowAchievementDialog(achievement);

    toast({
      title: "🏆 Achievement Unlocked!",
      description: `You've earned "${achievement.title}" and ${achievement.points} points!`,
    });
  };

  const completeChallenge = (challengeId: string) => {
    const challenge = challenges.find((c) => c.id === challengeId);
    if (!challenge || challenge.completed) return;

    setChallenges((prev) =>
      prev.map((c) =>
        c.id === challengeId
          ? {
              ...c,
              completed: true,
              progress: { ...c.progress, current: c.progress.target },
            }
          : c,
      ),
    );

    setUserPoints((prev) => prev + challenge.reward.points);

    toast({
      title: "🎯 Challenge Completed!",
      description: `You've earned ${challenge.reward.points} points!`,
    });
  };

  const getCurrentLevel = () => {
    return (
      levels.find(
        (level) =>
          userPoints >= level.minPoints && userPoints <= level.maxPoints,
      ) || levels[0]
    );
  };

  const getNextLevel = () => {
    const currentLevel = getCurrentLevel();
    const nextLevelIndex =
      levels.findIndex((l) => l.level === currentLevel.level) + 1;
    return nextLevelIndex < levels.length ? levels[nextLevelIndex] : null;
  };

  const getProgressToNextLevel = () => {
    const currentLevel = getCurrentLevel();
    const nextLevel = getNextLevel();

    if (!nextLevel) return 100;

    const progress =
      ((userPoints - currentLevel.minPoints) /
        (nextLevel.minPoints - currentLevel.minPoints)) *
      100;
    return Math.min(progress, 100);
  };

  const getTierColor = (tier: Achievement["tier"]) => {
    switch (tier) {
      case "bronze":
        return "text-amber-600";
      case "silver":
        return "text-gray-500";
      case "gold":
        return "text-yellow-500";
      case "platinum":
        return "text-blue-500";
      case "diamond":
        return "text-purple-500";
      default:
        return "text-gray-400";
    }
  };

  const getRarityColor = (rarity: Achievement["rarity"]) => {
    switch (rarity) {
      case "common":
        return "border-gray-300";
      case "rare":
        return "border-blue-400";
      case "epic":
        return "border-purple-400";
      case "legendary":
        return "border-yellow-400";
      default:
        return "border-gray-300";
    }
  };

  const formatTimeRemaining = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();

  return (
    <div className="space-y-6">
      {/* User Progress Overview */}
      <Card className="bg-gradient-to-r from-purple-500 to-blue-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-full">
              {currentLevel.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold">{currentLevel.title}</h3>
                <Badge
                  variant="secondary"
                  className="bg-white/20 text-white border-white/30"
                >
                  Level {currentLevel.level}
                </Badge>
              </div>
              <p className="text-white/80 text-sm mb-3">
                {userPoints.toLocaleString()} points
                {nextLevel &&
                  ` • ${nextLevel.minPoints - userPoints} to next level`}
              </p>
              {nextLevel && (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Progress to {nextLevel.title}</span>
                    <span>{getProgressToNextLevel().toFixed(0)}%</span>
                  </div>
                  <Progress
                    value={getProgressToNextLevel()}
                    className="bg-white/20"
                  />
                </div>
              )}
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 mb-2">
                <Flame className="w-5 h-5 text-orange-400" />
                <span className="text-2xl font-bold">{activeStreak}</span>
              </div>
              <p className="text-white/80 text-xs">Day Streak</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="achievements" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
        </TabsList>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          {/* Achievement Categories */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {["all", "social", "trading", "marketplace", "content"].map(
              (category) => (
                <Button
                  key={category}
                  variant="outline"
                  size="sm"
                  className="capitalize"
                >
                  {category === "all" ? "All" : category}
                </Button>
              ),
            )}
          </div>

          {/* Achievements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <Card
                key={achievement.id}
                className={`relative overflow-hidden ${getRarityColor(achievement.rarity)} ${
                  achievement.unlocked ? "border-2" : "opacity-75"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        achievement.unlocked
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {achievement.unlocked ? (
                        achievement.icon
                      ) : (
                        <Lock className="w-6 h-6" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm line-clamp-1">
                          {achievement.title}
                        </h4>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getTierColor(achievement.tier)}`}
                        >
                          {achievement.tier}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {achievement.description}
                      </p>

                      {!achievement.unlocked && (
                        <div className="space-y-1">
                          {achievement.requirements.map((req, index) => (
                            <div key={index} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="capitalize">
                                  {req.type.replace("_", " ")}
                                </span>
                                <span>
                                  {req.current}/{req.target}
                                </span>
                              </div>
                              <Progress
                                value={(req.current / req.target) * 100}
                                className="h-1"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                          <Coins className="w-3 h-3 text-yellow-500" />
                          <span className="text-xs font-medium">
                            {achievement.points}
                          </span>
                        </div>
                        {achievement.unlocked && achievement.unlockedAt && (
                          <span className="text-xs text-muted-foreground">
                            {achievement.unlockedAt.toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>

                {achievement.rarity === "legendary" && (
                  <div className="absolute top-2 right-2">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {challenges.map((challenge) => (
              <Card
                key={challenge.id}
                className={
                  challenge.completed ? "bg-green-50 border-green-200" : ""
                }
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        challenge.completed
                          ? "bg-green-500 text-white"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      {challenge.completed ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        challenge.icon
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">
                          {challenge.title}
                        </h4>
                        <Badge
                          variant={
                            challenge.type === "daily" ? "default" : "secondary"
                          }
                          className="text-xs"
                        >
                          {challenge.type}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground mb-3">
                        {challenge.description}
                      </p>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Progress</span>
                          <span>
                            {challenge.progress.current}/
                            {challenge.progress.target}
                          </span>
                        </div>
                        <Progress
                          value={
                            (challenge.progress.current /
                              challenge.progress.target) *
                            100
                          }
                          className="h-2"
                        />
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1">
                          <Coins className="w-3 h-3 text-yellow-500" />
                          <span className="text-xs font-medium">
                            {challenge.reward.points}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeRemaining(challenge.expiresAt)}
                        </span>
                      </div>

                      {!challenge.completed &&
                        challenge.progress.current >=
                          challenge.progress.target && (
                          <Button
                            size="sm"
                            className="w-full mt-2"
                            onClick={() => completeChallenge(challenge.id)}
                          >
                            Claim Reward
                          </Button>
                        )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Global Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {leaderboard.map((user, index) => (
                <div
                  key={user.id}
                  className={`flex items-center gap-4 p-3 rounded-lg ${
                    user.name === "You"
                      ? "bg-primary/10 border border-primary/20"
                      : "bg-muted/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        user.rank === 1
                          ? "bg-yellow-500 text-white"
                          : user.rank === 2
                            ? "bg-gray-400 text-white"
                            : user.rank === 3
                              ? "bg-amber-600 text-white"
                              : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {user.rank <= 3 ? (
                        user.rank === 1 ? (
                          <Crown className="w-4 h-4" />
                        ) : user.rank === 2 ? (
                          <Medal className="w-4 h-4" />
                        ) : (
                          <Award className="w-4 h-4" />
                        )
                      ) : (
                        user.rank
                      )}
                    </div>

                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{user.name}</span>
                      {user.name === "You" && (
                        <Badge variant="outline" className="text-xs">
                          You
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>Level {user.level}</span>
                      <span>{user.badges} badges</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-medium text-sm">
                      {user.points.toLocaleString()} pts
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      {user.change > 0 ? (
                        <>
                          <TrendingUp className="w-3 h-3 text-green-500" />
                          <span className="text-green-500">+{user.change}</span>
                        </>
                      ) : user.change < 0 ? (
                        <>
                          <TrendingDown className="w-3 h-3 text-red-500" />
                          <span className="text-red-500">{user.change}</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {mockBadges.map((badge) => (
              <Card key={badge.id} className="text-center">
                <CardContent className="p-4">
                  <div
                    className={`w-12 h-12 rounded-full ${badge.color} text-white flex items-center justify-center mx-auto mb-2`}
                  >
                    {badge.icon}
                  </div>
                  <h4 className="font-medium text-sm mb-1">{badge.name}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {badge.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {badge.earnedAt.toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Achievement Unlock Dialog */}
      <Dialog
        open={!!showAchievementDialog}
        onOpenChange={() => setShowAchievementDialog(null)}
      >
        <DialogContent className="text-center">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              🏆 Achievement Unlocked!
            </DialogTitle>
            <DialogDescription className="sr-only">
              You've unlocked a new achievement in the gamification system
            </DialogDescription>
          </DialogHeader>

          {showAchievementDialog && (
            <div className="space-y-4">
              <div className="p-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg">
                <div className="text-4xl mb-2">
                  {showAchievementDialog.icon}
                </div>
                <h3 className="text-xl font-bold">
                  {showAchievementDialog.title}
                </h3>
                <p className="text-yellow-100">
                  {showAchievementDialog.description}
                </p>
              </div>

              <div className="flex items-center justify-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Coins className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium">
                    +{showAchievementDialog.points} points
                  </span>
                </div>
                <Badge className={getTierColor(showAchievementDialog.tier)}>
                  {showAchievementDialog.tier} tier
                </Badge>
              </div>

              <Button
                onClick={() => setShowAchievementDialog(null)}
                className="w-full"
              >
                Continue
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GamificationSystem;
