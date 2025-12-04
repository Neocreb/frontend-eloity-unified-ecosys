import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Star,
  Crown,
  Award,
  Medal,
  Zap,
  Target,
  Clock,
  Users,
  TrendingUp,
  Gift,
  Sparkles,
  CheckCircle,
  Calendar,
  DollarSign,
  MessageSquare,
  ThumbsUp,
  Flame,
  Shield,
  Briefcase,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";

interface FreelanceAchievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category:
    | "projects"
    | "reviews"
    | "earnings"
    | "skills"
    | "client-relations"
    | "special";
  tier: "bronze" | "silver" | "gold" | "platinum" | "diamond";
  points: number;
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  target: number;
  rarity: "common" | "rare" | "epic" | "legendary";
  rewardType?: "badge" | "privilege" | "monetary" | "feature";
  rewardValue?: string;
}

interface TalentSpotlight {
  id: string;
  freelancer: {
    id: string;
    name: string;
    avatar: string;
    title: string;
    rating: number;
    completedProjects: number;
    specialization: string[];
  };
  month: string;
  year: number;
  achievements: string[];
  metrics: {
    clientSatisfaction: number;
    onTimeDelivery: number;
    responseTime: string;
    repeatClients: number;
  };
  testimonial?: string;
  clientName?: string;
}

interface ClientLoyaltyProgram {
  tier: "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond";
  totalSpent: number;
  projectsCompleted: number;
  currentBenefits: string[];
  nextTierBenefits: string[];
  progressToNext: number;
  pointsEarned: number;
  availableRewards: Array<{
    id: string;
    name: string;
    cost: number;
    type: "discount" | "priority" | "feature" | "consultation";
    description: string;
  }>;
}

const freelanceAchievements: FreelanceAchievement[] = [
  {
    id: "first-gig",
    title: "First Steps",
    description: "Complete your first freelance project",
    icon: <Briefcase className="w-6 h-6" />,
    category: "projects",
    tier: "bronze",
    points: 50,
    unlocked: true,
    progress: 1,
    target: 1,
    rarity: "common",
    rewardType: "badge",
    rewardValue: "First Project Badge",
  },
  {
    id: "perfect-scores",
    title: "Perfect Performer",
    description: "Receive 10 consecutive 5-star reviews",
    icon: <Star className="w-6 h-6" />,
    category: "reviews",
    tier: "gold",
    points: 200,
    unlocked: false,
    progress: 7,
    target: 10,
    rarity: "rare",
    rewardType: "privilege",
    rewardValue: "Priority Support Access",
  },
  // Will be updated with formatCurrency in component
  {
    id: "century-club",
    title: "Century Club",
    description: "Complete 100 successful projects",
    icon: <Trophy className="w-6 h-6" />,
    category: "projects",
    tier: "platinum",
    points: 1000,
    unlocked: false,
    progress: 47,
    target: 100,
    rarity: "epic",
    rewardType: "monetary",
    rewardValue: "500", // Store as number, will format in component
  },
  {
    id: "speed-demon",
    title: "Lightning Fast",
    description: "Complete 5 projects ahead of schedule",
    icon: <Zap className="w-6 h-6" />,
    category: "projects",
    tier: "silver",
    points: 150,
    unlocked: true,
    progress: 5,
    target: 5,
    rarity: "common",
    rewardType: "badge",
    rewardValue: "Fast Delivery Badge",
  },
  {
    id: "six-figure",
    title: "Six Figure Freelancer",
    description: "Earn $100,000 in total project payments",
    icon: <DollarSign className="w-6 h-6" />,
    category: "earnings",
    tier: "diamond",
    points: 2500,
    unlocked: false,
    progress: 67500,
    target: 100000,
    rarity: "legendary",
    rewardType: "feature",
    rewardValue: "Exclusive Portfolio Showcase",
  },
  // Move this note to clarify that $100,000 target is fixed and will be converted based on selected currency
  {
    id: "client-whisperer",
    title: "Client Whisperer",
    description: "Maintain 95%+ client satisfaction across 50+ projects",
    icon: <ThumbsUp className="w-6 h-6" />,
    category: "client-relations",
    tier: "gold",
    points: 300,
    unlocked: false,
    progress: 32,
    target: 50,
    rarity: "rare",
    rewardType: "privilege",
    rewardValue: "VIP Client Matching",
  },
];

const mockTalentSpotlight: TalentSpotlight[] = [
  {
    id: "1",
    freelancer: {
      id: "1",
      name: "Sarah Johnson",
      avatar: "/api/placeholder/64/64",
      title: "Senior React Developer",
      rating: 4.9,
      completedProjects: 87,
      specialization: ["React", "Node.js", "TypeScript"],
    },
    month: "January",
    year: 2024,
    achievements: [
      "Completed 12 projects with perfect ratings",
      "Helped 3 startups launch their MVPs",
      "Mentored 2 junior developers",
    ],
    metrics: {
      clientSatisfaction: 98,
      onTimeDelivery: 100,
      responseTime: "< 1 hour",
      repeatClients: 67,
    },
    testimonial:
      "Sarah's expertise in React development is unmatched. She delivered our project ahead of schedule and exceeded all expectations.",
    clientName: "Mike Chen, TechStart Inc.",
  },
];

export const FreelanceGamification: React.FC = () => {
  const [achievements, setAchievements] = useState(freelanceAchievements);
  const [talentSpotlight, setTalentSpotlight] = useState(mockTalentSpotlight);
  const [loyaltyProgram, setLoyaltyProgram] = useState<ClientLoyaltyProgram>({
    tier: "Gold",
    totalSpent: 45000,
    projectsCompleted: 23,
    currentBenefits: [
      "Priority project matching",
      "10% discount on platform fees",
      "Dedicated account manager",
      "Advanced analytics dashboard",
    ],
    nextTierBenefits: [
      "White-glove onboarding",
      "15% discount on platform fees",
      "Exclusive freelancer access",
      "Custom contract templates",
    ],
    progressToNext: 75,
    pointsEarned: 4500,
    availableRewards: [
      {
        id: "1",
        name: "20% Project Discount",
        cost: 1000,
        type: "discount",
        description: "Get 20% off your next project budget",
      },
      {
        id: "2",
        name: "Priority Support",
        cost: 500,
        type: "priority",
        description: "24/7 priority customer support for 30 days",
      },
      {
        id: "3",
        name: "Expert Consultation",
        cost: 2000,
        type: "consultation",
        description: "1-hour consultation with industry expert",
      },
    ],
  });

  const { user } = useAuth();
  const { toast } = useToast();

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "bronze":
        return "text-amber-600 bg-amber-50 border-amber-200";
      case "silver":
        return "text-gray-600 bg-gray-50 border-gray-200";
      case "gold":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "platinum":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "diamond":
        return "text-purple-600 bg-purple-50 border-purple-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "border-gray-300";
      case "rare":
        return "border-blue-400 shadow-blue-100 shadow-lg";
      case "epic":
        return "border-purple-400 shadow-purple-100 shadow-lg";
      case "legendary":
        return "border-yellow-400 shadow-yellow-100 shadow-lg";
      default:
        return "border-gray-300";
    }
  };

  const claimAchievement = (achievementId: string) => {
    const achievement = achievements.find((a) => a.id === achievementId);
    if (!achievement || achievement.unlocked) return;

    if (achievement.progress >= achievement.target) {
      setAchievements((prev) =>
        prev.map((a) =>
          a.id === achievementId
            ? { ...a, unlocked: true, unlockedAt: new Date() }
            : a,
        ),
      );

      toast({
        title: "🏆 Achievement Unlocked!",
        description: `You've earned "${achievement.title}" and ${achievement.points} points!`,
      });
    }
  };

  const redeemLoyaltyReward = (rewardId: string) => {
    const reward = loyaltyProgram.availableRewards.find(
      (r) => r.id === rewardId,
    );
    if (!reward || loyaltyProgram.pointsEarned < reward.cost) return;

    setLoyaltyProgram((prev) => ({
      ...prev,
      pointsEarned: prev.pointsEarned - reward.cost,
    }));

    toast({
      title: "🎁 Reward Redeemed!",
      description: `You've redeemed "${reward.name}"`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-600" />
            Freelance Achievements & Recognition
          </h2>
          <p className="text-muted-foreground">
            Track your progress and earn rewards
          </p>
        </div>
      </div>

      <Tabs defaultValue="achievements" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="spotlight">Talent Spotlight</TabsTrigger>
          <TabsTrigger value="loyalty">Client Loyalty</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="space-y-4">
          {/* Achievement Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Trophy className="h-8 w-8 text-yellow-600" />
                  <div>
                    <div className="text-2xl font-bold">
                      {achievements.filter((a) => a.unlocked).length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Unlocked
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Target className="h-8 w-8 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold">
                      {
                        achievements.filter(
                          (a) => !a.unlocked && a.progress > 0,
                        ).length
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">
                      In Progress
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-8 w-8 text-purple-600" />
                  <div>
                    <div className="text-2xl font-bold">
                      {
                        achievements.filter(
                          (a) => a.rarity === "legendary" && a.unlocked,
                        ).length
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Legendary
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Star className="h-8 w-8 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold">
                      {achievements
                        .filter((a) => a.unlocked)
                        .reduce((sum, a) => sum + a.points, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Points
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Achievements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <Card
                key={achievement.id}
                className={`relative overflow-hidden ${getRarityColor(achievement.rarity)} ${achievement.unlocked ? "" : "opacity-80"}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg ${achievement.unlocked ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                    >
                      {achievement.unlocked ? (
                        achievement.icon
                      ) : (
                        <Shield className="w-6 h-6" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm line-clamp-1">
                          {achievement.title}
                        </h4>
                        <Badge
                          className={`text-xs ${getTierColor(achievement.tier)}`}
                        >
                          {achievement.tier}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {achievement.description}
                      </p>

                      {!achievement.unlocked && (
                        <div className="space-y-1 mb-2">
                          <div className="flex justify-between text-xs">
                            <span>Progress</span>
                            <span>
                              {achievement.progress}/{achievement.target}
                            </span>
                          </div>
                          <Progress
                            value={
                              (achievement.progress / achievement.target) * 100
                            }
                            className="h-1"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span className="text-xs font-medium">
                            {achievement.points}
                          </span>
                        </div>

                        {achievement.unlocked ? (
                          <Badge
                            variant="outline"
                            className="text-xs text-green-600 border-green-200"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Unlocked
                          </Badge>
                        ) : achievement.progress >= achievement.target ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => claimAchievement(achievement.id)}
                          >
                            Claim
                          </Button>
                        ) : null}
                      </div>

                      {achievement.rewardType && achievement.rewardValue && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                          <strong>Reward:</strong> {achievement.rewardValue}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>

                {achievement.rarity === "legendary" && (
                  <div className="absolute top-2 right-2">
                    <Crown className="w-4 h-4 text-yellow-500" />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="spotlight" className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            {talentSpotlight.map((spotlight) => (
              <Card key={spotlight.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                  <div className="flex items-center gap-4">
                    <Crown className="h-8 w-8 text-yellow-400" />
                    <div>
                      <CardTitle className="text-xl">
                        🌟 Talent Spotlight
                      </CardTitle>
                      <p className="text-purple-100">
                        {spotlight.month} {spotlight.year}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Freelancer Info */}
                    <div className="lg:col-span-1">
                      <div className="text-center">
                        <Avatar className="h-24 w-24 mx-auto mb-4">
                          <AvatarImage src={spotlight.freelancer.avatar} />
                          <AvatarFallback>
                            {spotlight.freelancer.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <h3 className="text-xl font-bold">
                          {spotlight.freelancer.name}
                        </h3>
                        <p className="text-muted-foreground">
                          {spotlight.freelancer.title}
                        </p>

                        <div className="flex items-center justify-center gap-4 mt-3">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">
                              {spotlight.freelancer.rating}
                            </span>
                          </div>
                          <Badge variant="secondary">
                            {spotlight.freelancer.completedProjects} projects
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-1 mt-3 justify-center">
                          {spotlight.freelancer.specialization.map(
                            (skill, i) => (
                              <Badge
                                key={i}
                                variant="outline"
                                className="text-xs"
                              >
                                {skill}
                              </Badge>
                            ),
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Achievements & Metrics */}
                    <div className="lg:col-span-2 space-y-4">
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Award className="h-5 w-5 text-yellow-600" />
                          Outstanding Achievements
                        </h4>
                        <ul className="space-y-2">
                          {spotlight.achievements.map((achievement, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Medal className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{achievement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {spotlight.metrics.clientSatisfaction}%
                          </div>
                          <div className="text-sm text-green-700">
                            Client Satisfaction
                          </div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {spotlight.metrics.onTimeDelivery}%
                          </div>
                          <div className="text-sm text-blue-700">
                            On-Time Delivery
                          </div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">
                            {spotlight.metrics.responseTime}
                          </div>
                          <div className="text-sm text-purple-700">
                            Response Time
                          </div>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">
                            {spotlight.metrics.repeatClients}%
                          </div>
                          <div className="text-sm text-orange-700">
                            Repeat Clients
                          </div>
                        </div>
                      </div>

                      {spotlight.testimonial && (
                        <div className="p-4 bg-gray-50 rounded-lg italic">
                          <p className="text-muted-foreground">
                            "{spotlight.testimonial}"
                          </p>
                          {spotlight.clientName && (
                            <p className="text-sm font-medium mt-2">
                              — {spotlight.clientName}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="loyalty" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Loyalty Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-600" />
                  Client Loyalty Program
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div
                    className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-bold ${getTierColor(loyaltyProgram.tier.toLowerCase())}`}
                  >
                    {loyaltyProgram.tier} Member
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    ${loyaltyProgram.totalSpent.toLocaleString()} total spent •{" "}
                    {loyaltyProgram.projectsCompleted} projects completed
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress to Platinum</span>
                    <span className="font-medium">
                      {loyaltyProgram.progressToNext}%
                    </span>
                  </div>
                  <Progress
                    value={loyaltyProgram.progressToNext}
                    className="h-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {loyaltyProgram.pointsEarned.toLocaleString()}
                    </div>
                    <div className="text-sm text-blue-700">Loyalty Points</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {loyaltyProgram.currentBenefits.length}
                    </div>
                    <div className="text-sm text-green-700">
                      Active Benefits
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Current Benefits</h4>
                  <ul className="space-y-1">
                    {loyaltyProgram.currentBenefits.map((benefit, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Unlock at Next Tier</h4>
                  <ul className="space-y-1">
                    {loyaltyProgram.nextTierBenefits.map((benefit, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <Clock className="h-4 w-4" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Rewards Store */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-purple-600" />
                  Rewards Store
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loyaltyProgram.availableRewards.map((reward) => (
                  <div key={reward.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{reward.name}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{reward.cost} points</Badge>
                        <Button
                          size="sm"
                          disabled={loyaltyProgram.pointsEarned < reward.cost}
                          onClick={() => redeemLoyaltyReward(reward.id)}
                        >
                          Redeem
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {reward.description}
                    </p>
                    <Badge variant="secondary" className="mt-2 text-xs">
                      {reward.type}
                    </Badge>
                  </div>
                ))}

                <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                  <h4 className="font-medium mb-1">Earn More Points</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Complete projects and leave reviews to earn loyalty points
                  </p>
                  <Button variant="outline" size="sm">
                    View Ways to Earn
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
