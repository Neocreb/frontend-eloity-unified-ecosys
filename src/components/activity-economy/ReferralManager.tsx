import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  Link,
  Copy,
  Share2,
  Gift,
  TrendingUp,
  DollarSign,
  Star,
  Award,
  ExternalLink,
  QrCode,
  Mail,
  MessageCircle,
  Twitter,
  Facebook,
  Instagram,
  CheckCircle,
  Clock,
  ArrowRight,
  Target,
  Zap,
  Crown,
  Flame,
} from "lucide-react";
import { formatCurrency, formatNumber } from "@/utils/formatters";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface ReferralLink {
  id: string;
  referralCode: string;
  referralUrl: string;
  type: string;
  clickCount: number;
  signupCount: number;
  conversionCount: number;
  referrerReward: number;
  refereeReward: number;
  revenueSharePercentage: number;
  isActive: boolean;
  createdAt: string;
}

interface ReferralEvent {
  id: string;
  eventType: string;
  refereeId?: string;
  eventData: any;
  referrerReward: number;
  refereeReward: number;
  rewardStatus: string;
  createdAt: string;
  referee?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface ReferralStats {
  totalReferrals: number;
  totalEarnings: number;
  conversionRate: number;
  activeReferrals: number;
  monthlyEarnings: number;
  tier: string;
  nextTierProgress: number;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const ReferralManager: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);

  // State
  const [referralLinks, setReferralLinks] = useState<ReferralLink[]>([]);
  const [referralEvents, setReferralEvents] = useState<ReferralEvent[]>([]);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(
    null,
  );
  const [selectedLink, setSelectedLink] = useState<string>("");

  useEffect(() => {
    if (user) {
      loadReferralData();
    }
  }, [user]);

  // =============================================================================
  // DATA LOADING
  // =============================================================================

  const loadReferralData = async () => {
    try {
      setIsLoading(true);

      // Import ReferralService
      const { ReferralService } = await import('@/services/referralService');

      // Fetch real data from API
      const [links, stats] = await Promise.all([
        ReferralService.getReferralLinks(),
        ReferralService.getReferralStats(),
      ]);

      // Transform API data to match local interface
      const transformedLinks: ReferralLink[] = links.map(link => ({
        id: link.id,
        referralCode: link.referralCode,
        referralUrl: link.referralUrl,
        type: link.type,
        clickCount: link.clickCount,
        signupCount: link.signupCount,
        conversionCount: link.conversionCount,
        referrerReward: link.referrerReward,
        refereeReward: link.refereeReward,
        revenueSharePercentage: link.revenueSharePercentage,
        isActive: link.isActive,
        createdAt: link.createdAt,
      }));

      setReferralLinks(transformedLinks);

      // Transform stats data
      if (stats) {
        const transformedStats: ReferralStats = {
          totalReferrals: stats.totalReferrals,
          totalEarnings: stats.totalEarnings,
          conversionRate: stats.conversionRate,
          activeReferrals: stats.activeReferrals,
          monthlyEarnings: stats.thisMonthEarnings,
          tier: "Bronze", // Default tier - could be enhanced with partnership status
          nextTierProgress: Math.min((stats.totalReferrals / 25) * 100, 100), // Progress to Silver (25 referrals)
        };
        setReferralStats(transformedStats);
      }

      // For now, keep events as demo data since there's no specific events API
      // In a full implementation, you'd have a separate endpoint for referral events
      setReferralEvents([]);
    } catch (error) {
      console.error("Error loading referral data:", error);
      toast({
        title: "Error",
        description: "Failed to load referral data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // =============================================================================
  // ACTIONS
  // =============================================================================

  const copyReferralLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
  };

  const shareReferralLink = (url: string, platform: string) => {
    const message = "Join Eloity and start earning! Use my referral link:";
    const encodedMessage = encodeURIComponent(message);
    const encodedUrl = encodeURIComponent(url);

    let shareUrl = "";
    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodedMessage} ${encodedUrl}`;
        break;
      case "telegram":
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedMessage}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
    }
  };

  const generateNewLink = async () => {
    try {
      // Import ReferralService
      const { ReferralService } = await import('@/services/referralService');

      // Generate new link via API
      const newLink = await ReferralService.generateReferralLink({
        type: "general",
        description: "Personal referral link",
      });

      if (newLink) {
        // Transform API response to match local interface
        const transformedLink: ReferralLink = {
          id: newLink.id,
          referralCode: newLink.referralCode,
          referralUrl: newLink.referralUrl,
          type: newLink.type,
          clickCount: newLink.clickCount,
          signupCount: newLink.signupCount,
          conversionCount: newLink.conversionCount,
          referrerReward: newLink.referrerReward,
          refereeReward: newLink.refereeReward,
          revenueSharePercentage: newLink.revenueSharePercentage,
          isActive: newLink.isActive,
          createdAt: newLink.createdAt,
        };

        setReferralLinks([...referralLinks, transformedLink]);
        toast({
          title: "New Link Created",
          description: "Your new referral link is ready to use",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to create new referral link",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generating new link:", error);
      toast({
        title: "Error",
        description: "Failed to create new referral link",
        variant: "destructive",
      });
    }
  };

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case "diamond":
        return "bg-gradient-to-r from-blue-400 to-purple-500 text-white";
      case "platinum":
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
      case "gold":
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
      case "silver":
        return "bg-gradient-to-r from-gray-200 to-gray-400 text-gray-800";
      default:
        return "bg-gradient-to-r from-orange-400 to-red-500 text-white";
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "signup":
        return <Users className="w-4 h-4 text-blue-500" />;
      case "first_purchase":
        return <DollarSign className="w-4 h-4 text-green-500" />;
      case "milestone_reached":
        return <Target className="w-4 h-4 text-purple-500" />;
      default:
        return <Star className="w-4 h-4 text-gray-500" />;
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Referral Program</h3>
        <p className="text-gray-600">Please sign in to access the referral program.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
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
          <h1 className="text-2xl font-bold">Referral Program</h1>
          <p className="text-muted-foreground">
            Earn rewards by inviting friends to join Eloity
          </p>
        </div>
        <Button
          onClick={generateNewLink}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Link className="w-4 h-4 mr-2" />
          Generate New Link
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">
                  Total Referrals
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatNumber(referralStats?.totalReferrals || 0)}
                </p>
                <p className="text-xs text-blue-600">
                  {referralStats?.activeReferrals || 0} active
                </p>
              </div>
              <div className="p-3 bg-blue-200 rounded-full">
                <Users className="w-6 h-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">
                  Total Earnings
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(referralStats?.totalEarnings || 0)}
                </p>
                <p className="text-xs text-green-600">
                  {formatCurrency(referralStats?.monthlyEarnings || 0)} this
                  month
                </p>
              </div>
              <div className="p-3 bg-green-200 rounded-full">
                <DollarSign className="w-6 h-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">
                  Conversion Rate
                </p>
                <p className="text-2xl font-bold text-purple-900">
                  {referralStats?.conversionRate?.toFixed(1) || 0}%
                </p>
                <p className="text-xs text-purple-600">Above average!</p>
              </div>
              <div className="p-3 bg-purple-200 rounded-full">
                <TrendingUp className="w-6 h-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">
                  Current Tier
                </p>
                <Badge
                  className={`text-sm ${getTierColor(referralStats?.tier || "Bronze")}`}
                >
                  <Crown className="w-4 h-4 mr-1" />
                  {referralStats?.tier || "Bronze"}
                </Badge>
                <Progress
                  value={referralStats?.nextTierProgress || 0}
                  className="h-2 mt-2"
                />
              </div>
              <div className="p-3 bg-orange-200 rounded-full">
                <Award className="w-6 h-6 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="links">My Links</TabsTrigger>
          <TabsTrigger value="network">My Network</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Share */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Quick Share
                </CardTitle>
              </CardHeader>
              <CardContent>
                {referralLinks.length > 0 && (
                  <div className="space-y-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          Your Referral Link
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            copyReferralLink(referralLinks[0].referralUrl)
                          }
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <Input
                        value={referralLinks[0].referralUrl}
                        readOnly
                        className="text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          shareReferralLink(
                            referralLinks[0].referralUrl,
                            "twitter",
                          )
                        }
                        className="flex items-center gap-2"
                      >
                        <Twitter className="w-4 h-4 text-blue-500" />
                        Twitter
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          shareReferralLink(
                            referralLinks[0].referralUrl,
                            "facebook",
                          )
                        }
                        className="flex items-center gap-2"
                      >
                        <Facebook className="w-4 h-4 text-blue-600" />
                        Facebook
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          shareReferralLink(
                            referralLinks[0].referralUrl,
                            "whatsapp",
                          )
                        }
                        className="flex items-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4 text-green-500" />
                        WhatsApp
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          shareReferralLink(
                            referralLinks[0].referralUrl,
                            "telegram",
                          )
                        }
                        className="flex items-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4 text-blue-400" />
                        Telegram
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tier Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Tier Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <Badge
                      className={`text-lg px-4 py-2 ${getTierColor(referralStats?.tier || "Bronze")}`}
                    >
                      {referralStats?.tier || "Bronze"} Tier
                    </Badge>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Progress to Gold
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {referralStats?.nextTierProgress || 0}%
                      </span>
                    </div>
                    <Progress
                      value={referralStats?.nextTierProgress || 0}
                      className="h-3"
                    />
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Current Referrals:</span>
                      <span className="font-medium">
                        {referralStats?.totalReferrals || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Need for Gold:</span>
                      <span className="font-medium">20</span>
                    </div>
                  </div>

                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-sm mb-1">
                      Gold Tier Benefits:
                    </h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• 15 SP per referral (vs 10 SP)</li>
                      <li>• 7.5% revenue share (vs 5%)</li>
                      <li>• Exclusive Gold badge</li>
                      <li>• Priority support</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Referral Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {referralEvents.slice(0, 5).map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getEventIcon(event.eventType)}
                      <div className="flex items-center gap-2">
                        {event.referee && (
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={event.referee.avatar} />
                            <AvatarFallback>
                              {event.referee.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div>
                          <p className="font-medium text-sm">
                            {event.referee?.name || "Unknown User"}{" "}
                            {event.eventType.replace("_", " ")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(event.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Badge
                          variant={
                            event.rewardStatus === "paid"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {event.rewardStatus === "paid" ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <Clock className="w-3 h-3 mr-1" />
                          )}
                          {event.rewardStatus}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-green-600 mt-1">
                        +{formatCurrency(event.referrerReward)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Links Tab */}
        <TabsContent value="links" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Referral Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {referralLinks.map((link) => (
                  <div key={link.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium">{link.referralCode}</p>
                        <p className="text-sm text-muted-foreground">
                          Created{" "}
                          {new Date(link.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={link.isActive ? "default" : "secondary"}
                        >
                          {link.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyReferralLink(link.referralUrl)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <p className="text-lg font-bold text-blue-600">
                          {link.clickCount}
                        </p>
                        <p className="text-xs text-blue-600">Clicks</p>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <p className="text-lg font-bold text-green-600">
                          {link.signupCount}
                        </p>
                        <p className="text-xs text-green-600">Signups</p>
                      </div>
                      <div className="text-center p-2 bg-purple-50 rounded">
                        <p className="text-lg font-bold text-purple-600">
                          {link.conversionCount}
                        </p>
                        <p className="text-xs text-purple-600">Active</p>
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded">
                      <Input
                        value={link.referralUrl}
                        readOnly
                        className="text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Network Tab */}
        <TabsContent value="network" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Referral Network</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {referralEvents
                  .filter(
                    (event) => event.eventType === "signup" && event.referee,
                  )
                  .map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={event.referee?.avatar} />
                          <AvatarFallback>
                            {event.referee?.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{event.referee?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Joined{" "}
                            {new Date(event.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="default" className="mb-1">
                          Active
                        </Badge>
                        <p className="text-sm text-green-600">
                          {formatCurrency(event.referrerReward)} earned
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Referral Rewards History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {referralEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getEventIcon(event.eventType)}
                      <div>
                        <p className="font-medium text-sm">
                          {event.eventType.replace("_", " ").toUpperCase()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {event.referee?.name} •{" "}
                          {new Date(event.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">
                        +{formatCurrency(event.referrerReward)}
                      </p>
                      <Badge
                        variant={
                          event.rewardStatus === "paid"
                            ? "default"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {event.rewardStatus}
                      </Badge>
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

export default ReferralManager;
