import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Trophy,
  Star,
  Flame,
  Zap,
  Award,
  Crown,
  Target,
  Gift,
  TrendingUp,
  Calendar,
  Clock,
  ShoppingCart,
  CheckCircle,
  Lock,
  Sparkles,
  Rocket,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  LevelsBoostsService,
  type UserProgress,
  type UserLevel,
  type BoostItem,
  type ActiveBoost,
  type Achievement,
} from "@/services/levelsBoostsService";
import { formatNumber } from "@/utils/formatters";

const LevelsBoostsDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [levels, setLevels] = useState<UserLevel[]>([]);
  const [boostItems, setBoostItems] = useState<BoostItem[]>([]);
  const [activeBoosts, setActiveBoosts] = useState<ActiveBoost[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [progress, levelsData, boosts, activeBoostsData, achievementsData] =
        await Promise.all([
          LevelsBoostsService.getUserProgress(),
          LevelsBoostsService.getLevels(),
          LevelsBoostsService.getBoostItems(),
          LevelsBoostsService.getActiveBoosts(),
          LevelsBoostsService.getAchievements(),
        ]);

      setUserProgress(progress);
      setLevels(levelsData);
      setBoostItems(boosts);
      setActiveBoosts(activeBoostsData);
      setAchievements(achievementsData);
    } catch (error) {
      console.error("Error loading levels and boosts data:", error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const purchaseBoost = async (boostId: string) => {
    setIsPurchasing(boostId);
    try {
      const result = await LevelsBoostsService.purchaseBoost(boostId);

      if (result.success) {
        toast({
          title: "Boost Activated!",
          description: result.message,
        });
        loadData(); // Refresh data
      } else {
        toast({
          title: "Purchase Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to purchase boost",
        variant: "destructive",
      });
    } finally {
      setIsPurchasing(null);
    }
  };

  const claimAchievement = async (achievementId: string) => {
    try {
      const result = await LevelsBoostsService.claimAchievement(achievementId);

      if (result.success) {
        toast({
          title: "Achievement Unlocked!",
          description: result.message,
        });
        loadData(); // Refresh data
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to claim achievement",
        variant: "destructive",
      });
    }
  };

  const filteredBoosts =
    selectedCategory === "all"
      ? boostItems
      : boostItems.filter((boost) => boost.category === selectedCategory);

  const canAffordBoost = (boost: BoostItem) => {
    if (!userProgress) return false;
    return LevelsBoostsService.isBoostAffordable(
      boost,
      userProgress.currentPoints,
      userProgress.currentLevel.level,
    );
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();

    if (diff <= 0) return "Expired";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Levels & Boosts</h1>
          <p className="text-muted-foreground">
            Level up and boost your earning potential
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            className={`text-white`}
            style={{ backgroundColor: userProgress?.currentLevel.color }}
          >
            {userProgress?.currentLevel.badge} {userProgress?.currentLevel.name}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Level Progress */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold"
                style={{ backgroundColor: userProgress?.currentLevel.color }}
              >
                {userProgress?.currentLevel.badge}
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {userProgress?.currentLevel.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Level {userProgress?.currentLevel.level}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-purple-600">
                {formatNumber(userProgress?.currentPoints || 0)} SP
              </p>
              <p className="text-xs text-muted-foreground">
                {userProgress?.streakDays || 0} day streak 🔥
              </p>
            </div>
          </div>

          {userProgress?.nextLevel && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to {userProgress.nextLevel.name}</span>
                <span>{userProgress.pointsToNext} SP remaining</span>
              </div>
              <Progress
                value={userProgress.progressPercentage}
                className="h-3"
              />
              <p className="text-xs text-muted-foreground">
                Next level unlocks: {userProgress.nextLevel.benefits.join(", ")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Boosts */}
      {activeBoosts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Active Boosts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeBoosts.map((boost) => (
                <div
                  key={boost.id}
                  className="p-3 border rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{boost.boostItem.icon}</span>
                      <div>
                        <p className="font-medium text-sm">
                          {boost.boostItem.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getTimeRemaining(boost.expiresAt)} remaining
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="levels">Levels</TabsTrigger>
          <TabsTrigger value="boosts">Boost Shop</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Level Benefits */}
            <Card>
              <CardHeader>
                <CardTitle>Current Level Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium">
                      Reward Multiplier
                    </span>
                    <Badge className="bg-green-100 text-green-800">
                      {userProgress?.currentLevel.rewardMultiplier}x
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium">Daily SP Cap</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {userProgress?.currentLevel.dailyCap} SP
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Exclusive Benefits:</h4>
                    <ul className="space-y-1">
                      {userProgress?.currentLevel.benefits.map(
                        (benefit, index) => (
                          <li
                            key={index}
                            className="flex items-center gap-2 text-sm"
                          >
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            {benefit}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  <div className="space-y-3">
                    {achievements
                      .filter((a) => a.unlockedAt)
                      .slice(0, 5)
                      .map((achievement) => (
                        <div
                          key={achievement.id}
                          className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                        >
                          <span className="text-lg">{achievement.icon}</span>
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {achievement.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {achievement.description}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            +{achievement.reward.eloityPoints} SP
                          </Badge>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Levels Tab */}
        <TabsContent value="levels" className="space-y-6">
          <div className="grid gap-4">
            {levels.map((level, index) => {
              const isCurrentLevel = userProgress?.currentLevel.id === level.id;
              const isUnlocked =
                (userProgress?.currentPoints || 0) >= level.minPoints;

              return (
                <Card
                  key={level.id}
                  className={`${
                    isCurrentLevel
                      ? "ring-2 ring-purple-500 bg-purple-50"
                      : isUnlocked
                        ? "bg-white"
                        : "bg-gray-50"
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold ${
                            isUnlocked ? "" : "grayscale opacity-50"
                          }`}
                          style={{ backgroundColor: level.color }}
                        >
                          {isUnlocked ? (
                            level.badge
                          ) : (
                            <Lock className="w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">
                              {level.name}
                            </h3>
                            {isCurrentLevel && (
                              <Badge className="bg-purple-100 text-purple-800">
                                Current
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Level {level.level} • {level.minPoints} -{" "}
                            {level.maxPoints === 999999 ? "∞" : level.maxPoints}{" "}
                            SP
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs">
                            <span className="text-green-600">
                              {level.rewardMultiplier}x rewards
                            </span>
                            <span className="text-blue-600">
                              {level.dailyCap} SP daily cap
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="space-y-1">
                          {level.benefits.map((benefit, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-1 text-xs"
                            >
                              <Star className="w-3 h-3 text-yellow-500" />
                              {benefit}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Boosts Tab */}
        <TabsContent value="boosts" className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <p className="text-sm text-muted-foreground">Filter by category:</p>
            {["all", "content", "earnings", "profile", "social"].map(
              (category) => (
                <Button
                  key={category}
                  variant={
                    selectedCategory === category ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Button>
              ),
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBoosts.map((boost) => {
              const affordable = canAffordBoost(boost);
              const rarityColor = LevelsBoostsService.getRarityColor(
                boost.rarity,
              );

              return (
                <Card
                  key={boost.id}
                  className={`relative overflow-hidden ${
                    affordable
                      ? "hover:shadow-lg transition-shadow"
                      : "opacity-75"
                  }`}
                >
                  <div
                    className="absolute top-0 right-0 w-16 h-16 opacity-10"
                    style={{ backgroundColor: rarityColor }}
                  />
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className="text-xs capitalize"
                        style={{ borderColor: rarityColor, color: rarityColor }}
                      >
                        {boost.rarity}
                      </Badge>
                      <span className="text-2xl">{boost.icon}</span>
                    </div>
                    <CardTitle className="text-lg">{boost.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {boost.description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Effect Details */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {boost.effect.multiplier && (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-green-500" />
                            {boost.effect.multiplier}x multiplier
                          </div>
                        )}
                        {boost.effect.duration && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-blue-500" />
                            {LevelsBoostsService.formatDuration(
                              boost.effect.duration,
                            )}
                          </div>
                        )}
                        {boost.maxUses && (
                          <div className="flex items-center gap-1">
                            <Target className="w-3 h-3 text-purple-500" />
                            {boost.maxUses} uses
                          </div>
                        )}
                        {boost.cooldown && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-orange-500" />
                            {LevelsBoostsService.formatDuration(
                              boost.cooldown,
                            )}{" "}
                            cooldown
                          </div>
                        )}
                      </div>

                      <Separator />

                      {/* Cost and Purchase */}
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <span className="font-medium">
                            {boost.cost.eloityPoints} SP
                          </span>
                          {boost.cost.walletCost && (
                            <span className="text-muted-foreground">
                              {" "}
                              + ${boost.cost.walletCost}
                            </span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          disabled={!affordable || isPurchasing === boost.id}
                          onClick={() => purchaseBoost(boost.id)}
                          className="text-xs"
                        >
                          {isPurchasing === boost.id ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : affordable ? (
                            <>
                              <ShoppingCart className="w-3 h-3 mr-1" />
                              Buy
                            </>
                          ) : (
                            <>
                              <Lock className="w-3 h-3 mr-1" />
                              Locked
                            </>
                          )}
                        </Button>
                      </div>

                      {!affordable && (
                        <p className="text-xs text-red-500">
                          {userProgress &&
                          userProgress.currentLevel.level < boost.requiredLevel
                            ? `Requires level ${boost.requiredLevel}`
                            : "Insufficient Eloity Points"}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => {
              const isCompleted = achievement.progress >= achievement.target;
              const progressPercentage =
                (achievement.progress / achievement.target) * 100;

              return (
                <Card
                  key={achievement.id}
                  className={`${
                    isCompleted
                      ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                      : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-2xl ${isCompleted ? "" : "grayscale opacity-50"}`}
                        >
                          {achievement.icon}
                        </span>
                        <div>
                          <h3 className="font-medium">{achievement.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                      {isCompleted && !achievement.unlockedAt && (
                        <Button
                          size="sm"
                          onClick={() => claimAchievement(achievement.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Gift className="w-3 h-3 mr-1" />
                          Claim
                        </Button>
                      )}
                    </div>

                    {!isCompleted && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>
                            {achievement.progress} / {achievement.target}
                          </span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                      <div className="text-sm">
                        <span className="text-green-600 font-medium">
                          +{achievement.reward.eloityPoints} SP
                        </span>
                        {achievement.reward.badge && (
                          <span className="text-purple-600 ml-2">+Badge</span>
                        )}
                        {achievement.reward.multiplier && (
                          <span className="text-blue-600 ml-2">
                            +{achievement.reward.multiplier}x multiplier
                          </span>
                        )}
                      </div>
                      {achievement.unlockedAt && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Unlocked
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LevelsBoostsDashboard;
