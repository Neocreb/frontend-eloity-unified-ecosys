// @ts-nocheck
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Crown,
  Zap,
  Star,
  TrendingUp,
  Eye,
  MessageSquare,
  Calendar,
  Clock,
  DollarSign,
  Target,
  Rocket,
  Diamond,
  Gem,
  Sparkles,
  Award,
  Shield,
  Users,
  BarChart3,
  Settings,
  CreditCard,
  Gift,
  Flame,
  Lightning,
  Magnet,
  Megaphone,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Plus,
  Minus,
  RefreshCw,
  ArrowUp,
  ArrowRight,
  Timer,
} from "lucide-react";

interface PremiumPlan {
  id: string;
  name: string;
  price: number;
  duration: number; // in days
  features: string[];
  popular: boolean;
  color: string;
  icon: React.ReactNode;
}

interface BoostFeature {
  id: string;
  name: string;
  description: string;
  type:
    | "visibility"
    | "priority"
    | "highlight"
    | "analytics"
    | "support"
    | "tools";
  icon: React.ReactNode;
  isActive: boolean;
  price: number;
  duration: number;
  benefits: string[];
  metrics?: {
    views: number;
    clicks: number;
    conversions: number;
  };
  expiresAt?: Date;
}

interface ProfileAnalytics {
  totalViews: number;
  weeklyViews: number;
  profileStrength: number;
  searchRanking: number;
  responseRate: number;
  conversionRate: number;
  averageResponseTime: number;
  bookmarkCount: number;
  directContacts: number;
  proposalViews: number;
}

interface PromotionCampaign {
  id: string;
  name: string;
  type:
    | "profile_boost"
    | "featured_listing"
    | "search_priority"
    | "category_spotlight";
  budget: number;
  duration: number;
  targetAudience: string[];
  status: "draft" | "active" | "paused" | "completed";
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    cost: number;
  };
  createdAt: Date;
  startsAt: Date;
  endsAt: Date;
}

const BoostedProfilesSystem: React.FC = () => {
  const [premiumPlans, setPremiumPlans] = useState<PremiumPlan[]>([]);
  const [boostFeatures, setBoostFeatures] = useState<BoostFeature[]>([]);
  const [analytics, setAnalytics] = useState<ProfileAnalytics | null>(null);
  const [campaigns, setCampaigns] = useState<PromotionCampaign[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PremiumPlan | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showCampaign, setShowCampaign] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [currentPlan, setCurrentPlan] = useState<string>("free");

  useEffect(() => {
    initializePremiumPlans();
    initializeBoostFeatures();
    initializeAnalytics();
    initializeCampaigns();
  }, []);

  const initializePremiumPlans = () => {
    const plans: PremiumPlan[] = [
      {
        id: "basic",
        name: "Basic Boost",
        price: 19.99,
        duration: 30,
        features: [
          "Profile highlight for 30 days",
          "Priority in search results",
          "Basic analytics dashboard",
          "2x proposal visibility",
          "Remove ads",
          "Basic support",
        ],
        popular: false,
        color: "from-blue-400 to-blue-600",
        icon: <Zap className="w-6 h-6" />,
      },
      {
        id: "professional",
        name: "Professional",
        price: 49.99,
        duration: 30,
        features: [
          "Everything in Basic",
          "Featured badge",
          "Advanced analytics",
          "5x proposal visibility",
          "Custom portfolio themes",
          "Priority support",
          "Skill verification",
          "Video introduction",
        ],
        popular: true,
        color: "from-purple-500 to-purple-700",
        icon: <Crown className="w-6 h-6" />,
      },
      {
        id: "enterprise",
        name: "Enterprise Elite",
        price: 99.99,
        duration: 30,
        features: [
          "Everything in Professional",
          "Top search placement",
          "Dedicated account manager",
          "10x proposal visibility",
          "Custom branding",
          "White-glove onboarding",
          "API access",
          "Advanced integrations",
          "Premium support",
        ],
        popular: false,
        color: "from-yellow-400 to-orange-500",
        icon: <Diamond className="w-6 h-6" />,
      },
    ];

    setPremiumPlans(plans);
  };

  const initializeBoostFeatures = () => {
    const features: BoostFeature[] = [
      {
        id: "profile_highlight",
        name: "Profile Highlight",
        description: "Golden border and premium placement",
        type: "highlight",
        icon: <Sparkles className="w-5 h-5" />,
        isActive: true,
        price: 29.99,
        duration: 30,
        benefits: [
          "Golden profile border",
          "Top search results",
          "3x more views",
        ],
        metrics: { views: 1247, clicks: 342, conversions: 23 },
        expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      },
      {
        id: "featured_badge",
        name: "Featured Badge",
        description: "Stand out with a featured freelancer badge",
        type: "visibility",
        icon: <Award className="w-5 h-5" />,
        isActive: false,
        price: 19.99,
        duration: 7,
        benefits: [
          "Featured badge display",
          "Category spotlight",
          "Increased trust",
        ],
      },
      {
        id: "search_priority",
        name: "Search Priority",
        description: "Appear first in search results",
        type: "priority",
        icon: <Target className="w-5 h-5" />,
        isActive: true,
        price: 39.99,
        duration: 14,
        benefits: [
          "Top search placement",
          "Category priority",
          "5x more visibility",
        ],
        metrics: { views: 2156, clicks: 578, conversions: 47 },
        expiresAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      },
      {
        id: "advanced_analytics",
        name: "Advanced Analytics",
        description: "Detailed insights and performance metrics",
        type: "analytics",
        icon: <BarChart3 className="w-5 h-5" />,
        isActive: false,
        price: 14.99,
        duration: 30,
        benefits: [
          "Detailed visitor analytics",
          "Performance insights",
          "Conversion tracking",
        ],
      },
      {
        id: "premium_support",
        name: "Premium Support",
        description: "24/7 priority customer support",
        type: "support",
        icon: <Shield className="w-5 h-5" />,
        isActive: false,
        price: 24.99,
        duration: 30,
        benefits: ["24/7 support", "Priority response", "Dedicated manager"],
      },
      {
        id: "proposal_boost",
        name: "Proposal Boost",
        description: "Highlight your proposals to clients",
        type: "tools",
        icon: <Rocket className="w-5 h-5" />,
        isActive: false,
        price: 9.99,
        duration: 7,
        benefits: [
          "Proposal highlighting",
          "Fast-track review",
          "Priority placement",
        ],
      },
    ];

    setBoostFeatures(features);
  };

  const initializeAnalytics = () => {
    const analyticsData: ProfileAnalytics = {
      totalViews: 15647,
      weeklyViews: 2341,
      profileStrength: 89,
      searchRanking: 3,
      responseRate: 95.2,
      conversionRate: 12.8,
      averageResponseTime: 2.5,
      bookmarkCount: 127,
      directContacts: 89,
      proposalViews: 4523,
    };

    setAnalytics(analyticsData);
  };

  const initializeCampaigns = () => {
    const campaignData: PromotionCampaign[] = [
      {
        id: "campaign_1",
        name: "Web Development Spotlight",
        type: "category_spotlight",
        budget: 150,
        duration: 14,
        targetAudience: ["startups", "small-business", "e-commerce"],
        status: "active",
        metrics: {
          impressions: 12547,
          clicks: 432,
          conversions: 18,
          cost: 67.5,
        },
        createdAt: new Date("2024-01-15"),
        startsAt: new Date("2024-01-20"),
        endsAt: new Date("2024-02-03"),
      },
      {
        id: "campaign_2",
        name: "Featured Profile Boost",
        type: "profile_boost",
        budget: 200,
        duration: 30,
        targetAudience: ["enterprise", "agencies"],
        status: "completed",
        metrics: {
          impressions: 8934,
          clicks: 289,
          conversions: 12,
          cost: 156.8,
        },
        createdAt: new Date("2024-01-01"),
        startsAt: new Date("2024-01-05"),
        endsAt: new Date("2024-02-05"),
      },
    ];

    setCampaigns(campaignData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTimeRemaining = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();

    if (diff <= 0) return "Expired";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const PlanCard = ({ plan }: { plan: PremiumPlan }) => {
    const isCurrentPlan = currentPlan === plan.id;

    return (
      <Card
        className={`relative ${plan.popular ? "border-2 border-purple-500 shadow-lg" : ""}`}
      >
        {plan.popular && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-purple-500 text-white px-4 py-1">
              Most Popular
            </Badge>
          </div>
        )}

        <CardHeader className="text-center pb-4">
          <div
            className={`w-16 h-16 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center mx-auto mb-4 text-white`}
          >
            {plan.icon}
          </div>
          <CardTitle className="text-xl">{plan.name}</CardTitle>
          <div className="text-3xl font-bold">
            ${plan.price}
            <span className="text-sm font-normal text-gray-500">
              /{plan.duration}d
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <ul className="space-y-3">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          <Button
            className="w-full"
            variant={isCurrentPlan ? "secondary" : "default"}
            disabled={isCurrentPlan}
            onClick={() => {
              setSelectedPlan(plan);
              setShowUpgrade(true);
            }}
          >
            {isCurrentPlan ? "Current Plan" : "Upgrade Now"}
          </Button>
        </CardContent>
      </Card>
    );
  };

  const BoostFeatureCard = ({ feature }: { feature: BoostFeature }) => {
    const timeRemaining = feature.expiresAt
      ? formatTimeRemaining(feature.expiresAt)
      : null;

    return (
      <Card
        className={`${feature.isActive ? "border-green-500 bg-green-50" : ""}`}
      >
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${feature.isActive ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"}`}
              >
                {feature.icon}
              </div>
              <div>
                <h4 className="font-semibold flex items-center gap-2">
                  {feature.name}
                  {feature.isActive && (
                    <Badge className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  )}
                </h4>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            </div>

            <div className="text-right">
              <div className="font-semibold">${feature.price}</div>
              <div className="text-xs text-gray-500">{feature.duration}d</div>
            </div>
          </div>

          {feature.isActive && timeRemaining && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium">
                  Expires in {timeRemaining}
                </span>
              </div>
            </div>
          )}

          {feature.metrics && (
            <div className="mb-4 grid grid-cols-3 gap-4 p-3 bg-blue-50 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {feature.metrics.views.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">Views</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {feature.metrics.clicks.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">Clicks</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {feature.metrics.conversions}
                </div>
                <div className="text-xs text-gray-600">Conversions</div>
              </div>
            </div>
          )}

          <div className="space-y-2 mb-4">
            {feature.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span className="text-xs">{benefit}</span>
              </div>
            ))}
          </div>

          <Button
            className="w-full"
            variant={feature.isActive ? "secondary" : "default"}
            onClick={() => {
              if (feature.isActive) {
                setBoostFeatures((prev) =>
                  prev.map((f) =>
                    f.id === feature.id
                      ? { ...f, isActive: false, expiresAt: undefined }
                      : f,
                  ),
                );
              } else {
                const expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + feature.duration);
                setBoostFeatures((prev) =>
                  prev.map((f) =>
                    f.id === feature.id
                      ? { ...f, isActive: true, expiresAt }
                      : f,
                  ),
                );
              }
            }}
          >
            {feature.isActive ? "Deactivate" : "Activate Boost"}
          </Button>
        </CardContent>
      </Card>
    );
  };

  const AnalyticsDashboard = ({
    analytics,
  }: {
    analytics: ProfileAnalytics;
  }) => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <Eye className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {analytics.totalViews.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Views</div>
              <div className="text-xs text-green-600 mt-1">
                +{analytics.weeklyViews} this week
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <Target className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">
                #{analytics.searchRanking}
              </div>
              <div className="text-sm text-gray-600">Search Ranking</div>
              <div className="text-xs text-blue-600 mt-1">in category</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {analytics.conversionRate}%
              </div>
              <div className="text-sm text-gray-600">Conversion Rate</div>
              <div className="text-xs text-green-600 mt-1">
                +2.3% vs last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <Clock className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {analytics.averageResponseTime}h
              </div>
              <div className="text-sm text-gray-600">Response Time</div>
              <div className="text-xs text-orange-600 mt-1">avg response</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Strength</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Overall Score</span>
                  <span className="font-semibold">
                    {analytics.profileStrength}/100
                  </span>
                </div>
                <Progress value={analytics.profileStrength} className="h-3" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Response Rate</span>
                    <span className="text-green-600">
                      {analytics.responseRate}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Profile Completeness</span>
                    <span className="text-blue-600">95%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Verification Status</span>
                    <span className="text-purple-600">Verified</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Engagement Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Profile Bookmarks</span>
                  <span className="font-semibold">
                    {analytics.bookmarkCount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Direct Contacts</span>
                  <span className="font-semibold">
                    {analytics.directContacts}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Proposal Views</span>
                  <span className="font-semibold">
                    {analytics.proposalViews.toLocaleString()}
                  </span>
                </div>

                <Separator />

                <div className="text-center">
                  <Button variant="outline" size="sm">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Detailed Reports
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const CampaignCard = ({ campaign }: { campaign: PromotionCampaign }) => {
    const roi = (
      (campaign.metrics.conversions * 100) /
      campaign.metrics.cost
    ).toFixed(1);
    const ctr = (
      (campaign.metrics.clicks / campaign.metrics.impressions) *
      100
    ).toFixed(2);

    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="font-semibold">{campaign.name}</h4>
              <p className="text-sm text-gray-600 capitalize">
                {campaign.type.replace("_", " ")}
              </p>
            </div>
            <Badge className={getStatusColor(campaign.status)}>
              {campaign.status.charAt(0).toUpperCase() +
                campaign.status.slice(1)}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-lg font-bold">
                {campaign.metrics.impressions.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600">Impressions</div>
            </div>
            <div>
              <div className="text-lg font-bold">
                {campaign.metrics.clicks.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600">Clicks</div>
            </div>
            <div>
              <div className="text-lg font-bold">
                {campaign.metrics.conversions}
              </div>
              <div className="text-xs text-gray-600">Conversions</div>
            </div>
            <div>
              <div className="text-lg font-bold">
                ${campaign.metrics.cost.toFixed(2)}
              </div>
              <div className="text-xs text-gray-600">Spent</div>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>CTR:</span>
              <span className="font-medium">{ctr}%</span>
            </div>
            <div className="flex justify-between">
              <span>ROI:</span>
              <span className="font-medium text-green-600">{roi}%</span>
            </div>
            <div className="flex justify-between">
              <span>Budget:</span>
              <span className="font-medium">${campaign.budget}</span>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" className="flex-1">
              View Details
            </Button>
            {campaign.status === "active" && (
              <Button variant="outline" size="sm">
                Pause
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const activeBoosts = boostFeatures.filter((f) => f.isActive);
  const availableBoosts = boostFeatures.filter((f) => !f.isActive);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Premium Features</h2>
          <p className="text-gray-600">
            Boost your profile and unlock premium tools
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowCampaign(true)}>
            <Megaphone className="w-4 h-4 mr-2" />
            Create Campaign
          </Button>
          <Button onClick={() => setShowUpgrade(true)}>
            <Crown className="w-4 h-4 mr-2" />
            Upgrade Plan
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="boosts">Boosts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Current Plan</h3>
                    <p className="text-2xl font-bold">Free</p>
                    <p className="text-sm opacity-90">
                      Basic features included
                    </p>
                  </div>
                  <Crown className="w-12 h-12 opacity-80" />
                </div>
                <Button variant="secondary" className="w-full mt-4">
                  Upgrade Now
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Active Boosts</h3>
                    <p className="text-2xl font-bold">{activeBoosts.length}</p>
                    <p className="text-sm text-gray-600">Currently running</p>
                  </div>
                  <Zap className="w-12 h-12 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Profile Views</h3>
                    <p className="text-2xl font-bold">
                      {analytics?.weeklyViews.toLocaleString()}
                    </p>
                    <p className="text-sm text-green-600">+15% this week</p>
                  </div>
                  <Eye className="w-12 h-12 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {activeBoosts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  Active Boosts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeBoosts.map((boost) => (
                    <div
                      key={boost.id}
                      className="flex items-center gap-3 p-3 border rounded-lg"
                    >
                      <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                        {boost.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{boost.name}</h4>
                        <p className="text-sm text-gray-600">
                          Expires in{" "}
                          {boost.expiresAt
                            ? formatTimeRemaining(boost.expiresAt)
                            : "N/A"}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Extend
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {premiumPlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="boosts" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {boostFeatures.map((feature) => (
              <BoostFeatureCard key={feature.id} feature={feature} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {analytics && <AnalyticsDashboard analytics={analytics} />}
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>

          {campaigns.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center">
                <Megaphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No promotion campaigns yet</p>
                <Button className="mt-4" onClick={() => setShowCampaign(true)}>
                  Create Your First Campaign
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgrade} onOpenChange={setShowUpgrade}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upgrade to {selectedPlan?.name}</DialogTitle>
          </DialogHeader>
          {selectedPlan && (
            <div className="space-y-4">
              <div className="text-center">
                <div
                  className={`w-16 h-16 rounded-full bg-gradient-to-r ${selectedPlan.color} flex items-center justify-center mx-auto mb-4 text-white`}
                >
                  {selectedPlan.icon}
                </div>
                <div className="text-3xl font-bold">${selectedPlan.price}</div>
                <div className="text-sm text-gray-600">
                  for {selectedPlan.duration} days
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Payment Method</h4>
                <div className="flex items-center gap-2 p-3 border rounded-lg">
                  <CreditCard className="w-5 h-5" />
                  <span>**** **** **** 1234</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowUpgrade(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    setCurrentPlan(selectedPlan.id);
                    setShowUpgrade(false);
                  }}
                >
                  Upgrade Now
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BoostedProfilesSystem;
