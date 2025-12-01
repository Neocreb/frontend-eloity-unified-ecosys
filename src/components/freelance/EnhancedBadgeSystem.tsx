import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Award,
  Crown,
  Shield,
  Star,
  Trophy,
  Medal,
  Target,
  Zap,
  Heart,
  Flame,
  Clock,
  CheckCircle,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Eye,
  ThumbsUp,
  MessageSquare,
  Briefcase,
  GraduationCap,
  Verified,
  Lock,
  Unlock,
  Gift,
  Sparkles,
  Diamond,
  Gem,
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category:
    | "achievement"
    | "skill"
    | "reputation"
    | "milestone"
    | "special"
    | "premium";
  tier: "bronze" | "silver" | "gold" | "platinum" | "diamond";
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  isUnlocked: boolean;
  unlockedAt?: Date;
  progress?: {
    current: number;
    required: number;
    unit: string;
  };
  requirements: string[];
  benefits: string[];
  displayOrder: number;
  isVisible: boolean;
  isPremium: boolean;
}

interface ProfileStats {
  totalProjects: number;
  successRate: number;
  totalEarnings: number;
  averageRating: number;
  responseTime: number; // in hours
  completionRate: number;
  repeatClients: number;
  yearsExperience: number;
  skillsCount: number;
  testimonialsCount: number;
  hoursWorked: number;
  onTimeDelivery: number;
}

interface ProfileEnhancement {
  id: string;
  name: string;
  description: string;
  type:
    | "badge_showcase"
    | "profile_highlight"
    | "skill_verification"
    | "portfolio_boost"
    | "visibility_boost";
  icon: React.ReactNode;
  isActive: boolean;
  isPremium: boolean;
  price?: number;
  duration?: number; // in days
  benefits: string[];
}

const EnhancedBadgeSystem: React.FC = () => {
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null);
  const [profileEnhancements, setProfileEnhancements] = useState<
    ProfileEnhancement[]
  >([]);
  const [selectedBadge, setSelectedBadge] = useState<UserBadge | null>(null);
  const [activeTab, setActiveTab] = useState("earned");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [showBadgeDetails, setShowBadgeDetails] = useState(false);

  // Initialize badge system
  useEffect(() => {
    initializeBadges();
    initializeProfileStats();
    initializeProfileEnhancements();
  }, []);

  const initializeBadges = () => {
    const badges: UserBadge[] = [
      // Achievement Badges
      {
        id: "first_project",
        name: "First Steps",
        description: "Completed your first project successfully",
        icon: <Trophy className="w-6 h-6" />,
        category: "achievement",
        tier: "bronze",
        rarity: "common",
        isUnlocked: true,
        unlockedAt: new Date("2024-01-15"),
        requirements: ["Complete 1 project"],
        benefits: ["Profile credibility boost"],
        displayOrder: 1,
        isVisible: true,
        isPremium: false,
      },
      {
        id: "project_veteran",
        name: "Project Veteran",
        description: "Completed 50 projects successfully",
        icon: <Award className="w-6 h-6" />,
        category: "achievement",
        tier: "gold",
        rarity: "rare",
        isUnlocked: true,
        unlockedAt: new Date("2024-03-10"),
        requirements: ["Complete 50 projects"],
        benefits: ["Priority support", "Featured in search"],
        displayOrder: 2,
        isVisible: true,
        isPremium: false,
      },
      {
        id: "perfectionist",
        name: "Perfectionist",
        description: "Maintained 5.0 star rating across 20+ projects",
        icon: <Star className="w-6 h-6" />,
        category: "reputation",
        tier: "platinum",
        rarity: "epic",
        isUnlocked: false,
        progress: { current: 18, required: 20, unit: "projects" },
        requirements: ["Maintain 5.0 rating", "Complete 20+ projects"],
        benefits: ["Premium badge display", "Higher search ranking"],
        displayOrder: 3,
        isVisible: true,
        isPremium: false,
      },
      {
        id: "speed_demon",
        name: "Speed Demon",
        description: "Consistently delivers projects ahead of schedule",
        icon: <Zap className="w-6 h-6" />,
        category: "skill",
        tier: "silver",
        rarity: "uncommon",
        isUnlocked: true,
        unlockedAt: new Date("2024-02-20"),
        requirements: ["Deliver 10 projects early"],
        benefits: ["Fast delivery highlight"],
        displayOrder: 4,
        isVisible: true,
        isPremium: false,
      },
      {
        id: "reliable_partner",
        name: "Reliable Partner",
        description: "Zero project cancellations in 6 months",
        icon: <Shield className="w-6 h-6" />,
        category: "reputation",
        tier: "gold",
        rarity: "rare",
        isUnlocked: true,
        unlockedAt: new Date("2024-04-01"),
        requirements: ["Zero cancellations for 6 months"],
        benefits: ["Reliability badge", "Client trust indicator"],
        displayOrder: 5,
        isVisible: true,
        isPremium: false,
      },
      {
        id: "communication_master",
        name: "Communication Master",
        description: "Responds to messages within 1 hour consistently",
        icon: <MessageSquare className="w-6 h-6" />,
        category: "skill",
        tier: "silver",
        rarity: "uncommon",
        isUnlocked: false,
        progress: { current: 85, required: 95, unit: "% response rate" },
        requirements: ["95% response rate within 1 hour"],
        benefits: ["Quick response badge"],
        displayOrder: 6,
        isVisible: true,
        isPremium: false,
      },
      // Premium Badges
      {
        id: "diamond_elite",
        name: "Diamond Elite",
        description: "Exclusive premium membership badge",
        icon: <Diamond className="w-6 h-6" />,
        category: "premium",
        tier: "diamond",
        rarity: "legendary",
        isUnlocked: false,
        requirements: ["Premium subscription", "Top 1% performer"],
        benefits: [
          "VIP support",
          "Exclusive opportunities",
          "Diamond profile frame",
        ],
        displayOrder: 7,
        isVisible: true,
        isPremium: true,
      },
      {
        id: "verified_expert",
        name: "Verified Expert",
        description: "Skills verified by platform experts",
        icon: <Verified className="w-6 h-6" />,
        category: "skill",
        tier: "platinum",
        rarity: "epic",
        isUnlocked: false,
        requirements: ["Pass skill verification test"],
        benefits: ["Expert badge", "Higher rates", "Featured placement"],
        displayOrder: 8,
        isVisible: true,
        isPremium: true,
      },
      {
        id: "top_earner",
        name: "Top Earner",
        description: "Earned over 100,000 in platform earnings",
        icon: <Crown className="w-6 h-6" />,
        category: "milestone",
        tier: "platinum",
        rarity: "legendary",
        isUnlocked: false,
        progress: { current: 75000, required: 100000, unit: "currency" },
        requirements: ["Earn 100,000 total"],
        benefits: ["Elite status", "Premium features", "Success story feature"],
        displayOrder: 9,
        isVisible: true,
        isPremium: false,
      },
    ];

    setUserBadges(badges);
  };

  const initializeProfileStats = () => {
    const stats: ProfileStats = {
      totalProjects: 47,
      successRate: 98.5,
      totalEarnings: 75000,
      averageRating: 4.9,
      responseTime: 0.5,
      completionRate: 96.8,
      repeatClients: 23,
      yearsExperience: 3.5,
      skillsCount: 12,
      testimonialsCount: 38,
      hoursWorked: 2840,
      onTimeDelivery: 94.2,
    };

    setProfileStats(stats);
  };

  const initializeProfileEnhancements = () => {
    const enhancements: ProfileEnhancement[] = [
      {
        id: "badge_showcase",
        name: "Premium Badge Showcase",
        description: "Display up to 8 badges prominently on your profile",
        type: "badge_showcase",
        icon: <Award className="w-5 h-5" />,
        isActive: false,
        isPremium: true,
        price: 29.99,
        duration: 30,
        benefits: [
          "8 badge slots",
          "Animated badge effects",
          "Priority display",
        ],
      },
      {
        id: "profile_highlight",
        name: "Profile Highlight",
        description: "Golden border and premium placement in search",
        type: "profile_highlight",
        icon: <Sparkles className="w-5 h-5" />,
        isActive: false,
        isPremium: true,
        price: 19.99,
        duration: 30,
        benefits: [
          "Golden profile border",
          "Top search placement",
          "Featured badge",
        ],
      },
      {
        id: "skill_verification",
        name: "Skill Verification",
        description: "Get your skills verified by platform experts",
        type: "skill_verification",
        icon: <CheckCircle className="w-5 h-5" />,
        isActive: false,
        isPremium: true,
        price: 49.99,
        benefits: [
          "Verified skill badges",
          "Higher credibility",
          "Premium rates",
        ],
      },
      {
        id: "portfolio_boost",
        name: "Portfolio Boost",
        description: "Enhanced portfolio with premium features",
        type: "portfolio_boost",
        icon: <Briefcase className="w-5 h-5" />,
        isActive: false,
        isPremium: true,
        price: 39.99,
        duration: 60,
        benefits: [
          "Video portfolio",
          "Interactive demos",
          "Client testimonials",
        ],
      },
    ];

    setProfileEnhancements(enhancements);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "bronze":
        return "text-amber-600 bg-amber-50 border-amber-200";
      case "silver":
        return "text-gray-600 bg-gray-50 border-gray-200";
      case "gold":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "platinum":
        return "text-purple-600 bg-purple-50 border-purple-200";
      case "diamond":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "text-gray-600";
      case "uncommon":
        return "text-green-600";
      case "rare":
        return "text-blue-600";
      case "epic":
        return "text-purple-600";
      case "legendary":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  const BadgeCard = ({ badge }: { badge: UserBadge }) => {
    const isLocked = !badge.isUnlocked;

    return (
      <Card
        className={`cursor-pointer transition-all hover:shadow-lg ${
          isLocked ? "opacity-60 grayscale" : ""
        } ${badge.isPremium ? "border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50" : ""}`}
        onClick={() => {
          setSelectedBadge(badge);
          setShowBadgeDetails(true);
        }}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded-lg border ${getTierColor(badge.tier)}`}
            >
              {isLocked ? <Lock className="w-6 h-6" /> : badge.icon}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold">{badge.name}</h4>
                {badge.isPremium && (
                  <Crown className="w-4 h-4 text-yellow-500" />
                )}
              </div>

              <p className="text-sm text-gray-600 mb-2">{badge.description}</p>

              <div className="flex items-center gap-2 mb-2">
                <Badge className={getTierColor(badge.tier)} variant="outline">
                  {badge.tier.charAt(0).toUpperCase() + badge.tier.slice(1)}
                </Badge>
                <Badge
                  className={getRarityColor(badge.rarity)}
                  variant="outline"
                >
                  {badge.rarity.charAt(0).toUpperCase() + badge.rarity.slice(1)}
                </Badge>
              </div>

              {badge.progress && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Progress</span>
                    <span>
                      {badge.progress.current}/{badge.progress.required}{" "}
                      {badge.progress.unit}
                    </span>
                  </div>
                  <Progress
                    value={
                      (badge.progress.current / badge.progress.required) * 100
                    }
                    className="h-2"
                  />
                </div>
              )}

              {badge.unlockedAt && (
                <p className="text-xs text-gray-500 mt-2">
                  Earned on {badge.unlockedAt.toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const BadgeDetails = ({ badge }: { badge: UserBadge }) => {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div
            className={`inline-flex p-4 rounded-full border-4 ${getTierColor(badge.tier)} mb-4`}
          >
            {badge.isUnlocked ? badge.icon : <Lock className="w-8 h-8" />}
          </div>
          <h3 className="text-2xl font-bold mb-2">{badge.name}</h3>
          <p className="text-gray-600 mb-4">{badge.description}</p>

          <div className="flex items-center justify-center gap-4">
            <Badge className={getTierColor(badge.tier)}>
              {badge.tier.charAt(0).toUpperCase() + badge.tier.slice(1)} Tier
            </Badge>
            <Badge className={getRarityColor(badge.rarity)} variant="outline">
              {badge.rarity.charAt(0).toUpperCase() + badge.rarity.slice(1)}
            </Badge>
            {badge.isPremium && (
              <Badge className="bg-yellow-100 text-yellow-800">Premium</Badge>
            )}
          </div>
        </div>

        {badge.progress && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Current Progress</span>
                  <span className="font-semibold">
                    {badge.progress.current}/{badge.progress.required}{" "}
                    {badge.progress.unit}
                  </span>
                </div>
                <Progress
                  value={
                    (badge.progress.current / badge.progress.required) * 100
                  }
                  className="h-3"
                />
                <p className="text-sm text-gray-600">
                  {(
                    (badge.progress.current / badge.progress.required) *
                    100
                  ).toFixed(1)}
                  % complete
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {badge.requirements.map((req, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{req}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {badge.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {badge.unlockedAt && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h4 className="font-semibold mb-1">Badge Earned!</h4>
                <p className="text-sm text-gray-600">
                  Congratulations! You earned this badge on{" "}
                  {badge.unlockedAt.toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const ProfileStatsCard = ({ stats }: { stats: ProfileStats }) => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Briefcase className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <div className="text-sm text-gray-600">Projects</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.averageRating}</div>
            <div className="text-sm text-gray-600">Rating</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              ${stats.totalEarnings.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Earned</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.successRate}%</div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const earnedBadges = userBadges.filter((badge) => badge.isUnlocked);
  const availableBadges = userBadges.filter((badge) => !badge.isUnlocked);
  const filteredBadges =
    activeTab === "earned" ? earnedBadges : availableBadges;
  const categoryFilteredBadges =
    filterCategory === "all"
      ? filteredBadges
      : filteredBadges.filter((badge) => badge.category === filterCategory);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Badges & Profile</h2>
          <p className="text-gray-600">
            Showcase your achievements and enhance your profile
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Crown className="w-4 h-4" />
          Upgrade Profile
        </Button>
      </div>

      {profileStats && <ProfileStatsCard stats={profileStats} />}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="earned">
            Earned ({earnedBadges.length})
          </TabsTrigger>
          <TabsTrigger value="available">
            Available ({availableBadges.length})
          </TabsTrigger>
          <TabsTrigger value="enhancements">Enhancements</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="earned" className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Label>Category:</Label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-1 border rounded-md"
              >
                <option value="all">All Categories</option>
                <option value="achievement">Achievement</option>
                <option value="skill">Skill</option>
                <option value="reputation">Reputation</option>
                <option value="milestone">Milestone</option>
                <option value="premium">Premium</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryFilteredBadges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>

          {categoryFilteredBadges.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center">
                <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No badges in this category yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableBadges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="enhancements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profileEnhancements.map((enhancement) => (
              <Card
                key={enhancement.id}
                className={enhancement.isPremium ? "border-yellow-200" : ""}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {enhancement.icon}
                    {enhancement.name}
                    {enhancement.isPremium && (
                      <Crown className="w-4 h-4 text-yellow-500" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">{enhancement.description}</p>

                  <div className="space-y-2">
                    <h5 className="font-medium">Benefits:</h5>
                    <ul className="space-y-1">
                      {enhancement.benefits.map((benefit, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-sm"
                        >
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between">
                    {enhancement.price && (
                      <div className="text-lg font-bold text-green-600">
                        ${enhancement.price}
                        {enhancement.duration && (
                          <span className="text-sm text-gray-500">
                            /{enhancement.duration}d
                          </span>
                        )}
                      </div>
                    )}
                    <Button
                      variant={enhancement.isActive ? "secondary" : "default"}
                      disabled={enhancement.isActive}
                    >
                      {enhancement.isActive ? "Active" : "Activate"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Badge Display Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Show badges on profile</h4>
                  <p className="text-sm text-gray-600">
                    Display your earned badges prominently
                  </p>
                </div>
                <Button variant="outline">Enabled</Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Badge notifications</h4>
                  <p className="text-sm text-gray-600">
                    Get notified when you earn new badges
                  </p>
                </div>
                <Button variant="outline">Enabled</Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Privacy settings</h4>
                  <p className="text-sm text-gray-600">
                    Control badge visibility
                  </p>
                </div>
                <Button variant="outline">Public</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedBadge && (
        <Dialog open={showBadgeDetails} onOpenChange={setShowBadgeDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Badge Details</DialogTitle>
            </DialogHeader>
            <BadgeDetails badge={selectedBadge} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default EnhancedBadgeSystem;
