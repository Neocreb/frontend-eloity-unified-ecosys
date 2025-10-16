import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Users,
  Share2,
  Copy,
  DollarSign,
  TrendingUp,
  Gift,
  Crown,
  Star,
  ArrowRight,
  Calendar,
  Eye,
  Target,
  Zap,
  Award,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  MessageCircle,
  Mail,
  Link2,
  BarChart3,
  Percent,
  Clock,
  CheckCircle,
  Trophy,
  Sparkles,
  Building,
  Handshake,
  Globe,
  QrCode,
  Download,
  Filter,
  RefreshCw,
  ExternalLink,
  Wallet,
  CreditCard,
  Plus,
  TrendingDown,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface ReferralData {
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: number;
  monthlyEarnings: number;
  conversionRate: number;
  tier: "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond";
  tierProgress: number;
  nextTierRequirement: number;
  referralCode: string;
  customLink: string;
}

interface ReferralStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
  allTime: number;
  pending: number;
  converted: number;
}

interface Partnership {
  id: string;
  name: string;
  type: "brand" | "influencer" | "business" | "affiliate";
  status: "active" | "pending" | "expired";
  commission: number;
  requirements: string[];
  benefits: string[];
  icon: string;
  earnings: number;
  conversions: number;
}

interface ReferralActivity {
  id: string;
  type: "signup" | "conversion" | "purchase" | "milestone";
  user: string;
  amount: number;
  date: string;
  status: "completed" | "pending" | "cancelled";
}

const mockReferralData: ReferralData = {
  totalReferrals: 47,
  activeReferrals: 32,
  totalEarnings: 2840,
  monthlyEarnings: 450,
  conversionRate: 68,
  tier: "Gold",
  tierProgress: 75,
  nextTierRequirement: 100,
  referralCode: "ELOITY2024",
  customLink: "https://eloity.com/join/johndoe",
};

const mockPartnerships: Partnership[] = [
  {
    id: "1",
    name: "Eloity Pro",
    type: "brand",
    status: "active",
    commission: 30,
    requirements: ["5+ referrals/month", "Pro subscriber"],
    benefits: ["30% commission", "Priority support", "Exclusive content"],
    icon: "💎",
    earnings: 1250,
    conversions: 8,
  },
  {
    id: "2",
    name: "Crypto Exchange Partner",
    type: "affiliate",
    status: "active",
    commission: 15,
    requirements: ["10+ crypto referrals", "KYC verified"],
    benefits: ["15% trading fees", "Premium tools access"],
    icon: "₿",
    earnings: 890,
    conversions: 15,
  },
  {
    id: "3",
    name: "Business Network",
    type: "business",
    status: "pending",
    commission: 25,
    requirements: ["Business account", "50+ team referrals"],
    benefits: ["25% commission", "Enterprise features", "Custom branding"],
    icon: "🏢",
    earnings: 0,
    conversions: 0,
  },
];

const mockActivities: ReferralActivity[] = [
  {
    id: "1",
    type: "signup",
    user: "Alice Johnson",
    amount: 50,
    date: "2024-01-15",
    status: "completed",
  },
  {
    id: "2",
    type: "conversion",
    user: "Bob Smith",
    amount: 100,
    date: "2024-01-14",
    status: "completed",
  },
  {
    id: "3",
    type: "purchase",
    user: "Carol Davis",
    amount: 25,
    date: "2024-01-13",
    status: "pending",
  },
];

export function PartnershipSystem() {
  const [referralData, setReferralData] =
    useState<ReferralData>(mockReferralData);
  const [partnerships, setPartnerships] =
    useState<Partnership[]>(mockPartnerships);
  const [activities, setActivities] =
    useState<ReferralActivity[]>(mockActivities);
  const [activeTab, setActiveTab] = useState("overview");
  const [showCustomLinkDialog, setShowCustomLinkDialog] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [selectedTimeRange, setSelectedTimeRange] = useState("month");

  const { toast } = useToast();
  const { user } = useAuth();

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Bronze":
        return "text-orange-600 bg-orange-100";
      case "Silver":
        return "text-gray-600 bg-gray-100";
      case "Gold":
        return "text-yellow-600 bg-yellow-100";
      case "Platinum":
        return "text-purple-600 bg-purple-100";
      case "Diamond":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralData.customLink);
    toast({
      title: "Referral link copied!",
      description: "Share it with friends to start earning rewards",
    });
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralData.referralCode);
    toast({
      title: "Referral code copied!",
      description: "Your friends can use this code during signup",
    });
  };

  const shareOnSocial = (platform: string) => {
    const message = encodeURIComponent(
      `Join me on Eloity! Use my referral link to get started: ${referralData.customLink}`,
    );
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${message}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${referralData.customLink}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${referralData.customLink}`,
      whatsapp: `https://wa.me/?text=${message}`,
    };

    window.open(urls[platform as keyof typeof urls], "_blank");
  };

  const requestPayout = () => {
    toast({
      title: "Payout requested",
      description:
        "Your payout request is being processed. You'll receive it within 3-5 business days.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Partnership Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="h-auto">
          <CardContent className="p-4 h-full">
            <div className="flex items-start justify-between gap-3 h-full">
              <div className="flex-1 min-w-0 space-y-2">
                <p className="text-sm text-muted-foreground truncate">
                  Total Referrals
                </p>
                <p className="text-2xl font-bold leading-none">
                  {referralData.totalReferrals}
                </p>
                <p className="text-xs text-green-600">+12% this month</p>
              </div>
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 flex-shrink-0 mt-1" />
            </div>
          </CardContent>
        </Card>

        <Card className="h-auto">
          <CardContent className="p-4 h-full">
            <div className="flex items-start justify-between gap-3 h-full">
              <div className="flex-1 min-w-0 space-y-2">
                <p className="text-sm text-muted-foreground truncate">
                  Total Earnings
                </p>
                <p className="text-2xl font-bold leading-none">
                  ${referralData.totalEarnings.toLocaleString()}
                </p>
                <p className="text-xs text-green-600 truncate">
                  +${referralData.monthlyEarnings} this month
                </p>
              </div>
              <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 flex-shrink-0 mt-1" />
            </div>
          </CardContent>
        </Card>

        <Card className="h-auto">
          <CardContent className="p-4 h-full">
            <div className="flex items-start justify-between gap-3 h-full">
              <div className="flex-1 min-w-0 space-y-2">
                <p className="text-sm text-muted-foreground truncate">
                  Conversion Rate
                </p>
                <p className="text-2xl font-bold leading-none">
                  {referralData.conversionRate}%
                </p>
                <p className="text-xs text-green-600">Above average</p>
              </div>
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 flex-shrink-0 mt-1" />
            </div>
          </CardContent>
        </Card>

        <Card className="h-auto">
          <CardContent className="p-4 h-full">
            <div className="flex items-start justify-between gap-3 h-full">
              <div className="flex-1 min-w-0 space-y-2">
                <p className="text-sm text-muted-foreground truncate">
                  Partnership Tier
                </p>
                <div className="flex flex-col gap-1">
                  <Badge
                    className={cn(
                      "text-xs font-medium w-fit",
                      getTierColor(referralData.tier),
                    )}
                  >
                    {referralData.tier}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {referralData.tierProgress}% to next
                  </p>
                </div>
              </div>
              <Crown className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 flex-shrink-0 mt-1" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Partnership Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="share">Share & Earn</TabsTrigger>
          <TabsTrigger value="partnerships">Partnerships</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tier Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Partnership Tier Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    Current: {referralData.tier}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {referralData.totalReferrals}/
                    {referralData.nextTierRequirement} referrals
                  </span>
                </div>
                <Progress value={referralData.tierProgress} className="h-3" />
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <p className="text-muted-foreground font-medium">
                        Current Benefits
                      </p>
                      <ul className="space-y-1 text-xs leading-relaxed">
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">•</span>
                          <span>20% commission rate</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">•</span>
                          <span>Weekly payouts</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">•</span>
                          <span>Priority support</span>
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <p className="text-muted-foreground font-medium">
                        Next Tier Benefits
                      </p>
                      <ul className="space-y-1 text-xs leading-relaxed">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500 mt-0.5">•</span>
                          <span>30% commission rate</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500 mt-0.5">•</span>
                          <span>Daily payouts</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500 mt-0.5">•</span>
                          <span>Exclusive content</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activities.slice(0, 5).map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start justify-between p-3 border rounded-lg gap-3"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                            activity.status === "completed"
                              ? "bg-green-500"
                              : activity.status === "pending"
                                ? "bg-yellow-500"
                                : "bg-red-500",
                          )}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">
                            {activity.user}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize break-words">
                            {activity.type} • {activity.date}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 space-y-1">
                        <p className="font-medium text-green-600 text-sm">
                          +${activity.amount}
                        </p>
                        <div>
                          <Badge
                            variant={
                              activity.status === "completed"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {activity.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button onClick={copyReferralLink} className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Share Referral Link
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCustomLinkDialog(true)}
                  className="gap-2"
                >
                  <Link2 className="h-4 w-4" />
                  Create Custom Link
                </Button>
                <Button
                  variant="outline"
                  onClick={requestPayout}
                  className="gap-2"
                >
                  <Wallet className="h-4 w-4" />
                  Request Payout
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Share & Earn Tab */}
        <TabsContent value="share" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Referral Tools */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Referral Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Referral Link */}
                <div>
                  <label className="text-sm font-medium">
                    Your Referral Link
                  </label>
                  <div className="flex mt-1">
                    <Input
                      value={referralData.customLink}
                      readOnly
                      className="rounded-r-none"
                    />
                    <Button
                      onClick={copyReferralLink}
                      className="rounded-l-none"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Referral Code */}
                <div>
                  <label className="text-sm font-medium">Referral Code</label>
                  <div className="flex mt-1">
                    <Input
                      value={referralData.referralCode}
                      readOnly
                      className="rounded-r-none"
                    />
                    <Button
                      onClick={copyReferralCode}
                      className="rounded-l-none"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Custom Message */}
                <div>
                  <label className="text-sm font-medium">
                    Custom Message (Optional)
                  </label>
                  <Textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Add a personal message to your referral..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Social Sharing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Social Sharing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => shareOnSocial("twitter")}
                    className="gap-2"
                  >
                    <Twitter className="h-4 w-4" />
                    Twitter
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => shareOnSocial("facebook")}
                    className="gap-2"
                  >
                    <Facebook className="h-4 w-4" />
                    Facebook
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => shareOnSocial("linkedin")}
                    className="gap-2"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => shareOnSocial("whatsapp")}
                    className="gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </Button>
                </div>

                {/* QR Code */}
                <div className="mt-6 text-center">
                  <div className="w-32 h-32 bg-gray-100 rounded-lg mx-auto flex items-center justify-center mb-3">
                    <QrCode className="h-16 w-16 text-gray-400" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    QR Code for your referral link
                  </p>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Download QR Code
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Referral Rewards Structure */}
          <Card>
            <CardHeader>
              <CardTitle>Referral Rewards Structure</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    $50
                  </div>
                  <p className="font-medium">User Signup</p>
                  <p className="text-sm text-muted-foreground">
                    When someone joins using your link
                  </p>
                </div>
                <div className="border rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    $100
                  </div>
                  <p className="font-medium">First Purchase</p>
                  <p className="text-sm text-muted-foreground">
                    When they make their first transaction
                  </p>
                </div>
                <div className="border rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-2">
                    5%
                  </div>
                  <p className="font-medium">Lifetime Earnings</p>
                  <p className="text-sm text-muted-foreground">
                    From all their platform activities
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Partnerships Tab */}
        <TabsContent value="partnerships" className="space-y-6">
          <div className={'grid grid-cols-1 lg:grid-cols-2 gap-6"'}>
            <h3 className="text-lg font-semibold">Partnership Programs</h3>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Apply for Partnership
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {partnerships.map((partnership) => (
              <Card key={partnership.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <span className="text-2xl flex-shrink-0">
                        {partnership.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base leading-tight truncate">
                          {partnership.name}
                        </CardTitle>
                        <Badge
                          variant={
                            partnership.status === "active"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs mt-1"
                        >
                          {partnership.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-bold text-green-600 leading-tight">
                        {partnership.commission}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        commission
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Requirements</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {partnership.requirements.map((req, index) => (
                        <li key={index} className="break-words leading-relaxed">
                          • {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Benefits</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {partnership.benefits.map((benefit, index) => (
                        <li key={index} className="break-words leading-relaxed">
                          • {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {partnership.status === "active" && (
                    <div className="pt-2 border-t">
                      <div className="flex justify-between text-sm">
                        <span>Total Earnings:</span>
                        <span className="font-medium">
                          ${partnership.earnings}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Conversions:</span>
                        <span className="font-medium">
                          {partnership.conversions}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold">127</p>
                  <p className="text-sm text-muted-foreground">
                    Clicks This Month
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold">43</p>
                  <p className="text-sm text-muted-foreground">
                    Signups This Month
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold">68%</p>
                  <p className="text-sm text-muted-foreground">
                    Conversion Rate
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold">$450</p>
                  <p className="text-sm text-muted-foreground">
                    Earnings This Month
                  </p>
                </div>
              </div>

              {/* Chart Placeholder */}
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">
                    Analytics chart would appear here
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payouts Tab */}
        <TabsContent value="payouts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payout Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payout Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Available Balance
                    </p>
                    <p className="text-2xl font-bold text-green-600">$1,240</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">$350</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Minimum payout:</span>
                    <span>$50</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Processing time:</span>
                    <span>3-5 business days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Next payout date:</span>
                    <span>January 20, 2024</span>
                  </div>
                </div>
                <Button onClick={requestPayout} className="w-full gap-2">
                  <Wallet className="h-4 w-4" />
                  Request Payout ($1,240)
                </Button>
              </CardContent>
            </Card>

            {/* Payout History */}
            <Card>
              <CardHeader>
                <CardTitle>Payout History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { date: "Jan 15, 2024", amount: 580, status: "completed" },
                    { date: "Jan 8, 2024", amount: 320, status: "completed" },
                    { date: "Jan 1, 2024", amount: 150, status: "completed" },
                    { date: "Dec 25, 2023", amount: 275, status: "processing" },
                  ].map((payout, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">${payout.amount}</p>
                        <p className="text-sm text-muted-foreground">
                          {payout.date}
                        </p>
                      </div>
                      <Badge
                        variant={
                          payout.status === "completed"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {payout.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Custom Link Dialog */}
      <Dialog
        open={showCustomLinkDialog}
        onOpenChange={setShowCustomLinkDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Custom Referral Link</DialogTitle>
            <DialogDescription>
              Create a personalized referral link that's easier to share
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Custom Path</label>
              <div className="flex mt-1">
                <span className="flex items-center px-3 bg-gray-100 border border-r-0 rounded-l-md text-sm">
                  eloity.com/join/
                </span>
                <Input placeholder="your-name" className="rounded-l-none" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1">Create Link</Button>
              <Button
                variant="outline"
                onClick={() => setShowCustomLinkDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
