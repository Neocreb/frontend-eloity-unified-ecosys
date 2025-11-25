// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Users,
  Copy,
  Share2,
  DollarSign,
  TrendingUp,
  Star,
  ExternalLink,
  Heart,
  Info,
  Gift,
  Zap,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { formatCurrency, formatNumber } from "@/utils/formatters";
import { useToast } from "@/hooks/use-toast";
import { AutomaticRewardSharingService } from "@/services/automaticRewardSharingService";

const SafeReferralComponent: React.FC = () => {
  const { toast } = useToast();
  const [sharingStats, setSharingStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  const referralLink = "https://eloity.app/join?ref=DEMO123";

  useEffect(() => {
    loadSharingStats();
  }, []);

  const loadSharingStats = async () => {
    try {
      setIsLoading(true);
      const stats = await AutomaticRewardSharingService.getSharingStats();
      setSharingStats(stats);
    } catch (error) {
      console.error('Failed to load sharing stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopiedLink(true);
      toast({
        title: "✓ Copied!",
        description: "Referral link copied to clipboard",
      });
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const shareReferralLink = (platform: string) => {
    const message = "Join Eloity and start earning! Use my referral link:";
    const url = encodeURIComponent(referralLink);
    const text = encodeURIComponent(message);
    
    let shareUrl = "";
    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${text}%20${url}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, "_blank");
  };

  return (
    <div className="space-y-8">
      {/* Header Section - Premium Design */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 p-8 text-white shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Gift className="w-6 h-6" />
                <span className="text-sm font-semibold text-white/90 uppercase tracking-wide">Referral Program</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">Grow Your Network</h1>
              <p className="text-white/90 text-lg">Earn rewards by inviting friends to join Eloity and unlock exclusive benefits</p>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <Zap className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-semibold">Silver Tier</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Overview - Featured Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-5 h-5 opacity-80" />
            <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">Active</span>
          </div>
          <p className="text-sm opacity-90 mb-1">Total Referrals</p>
          <p className="text-3xl font-bold">23</p>
          <p className="text-xs opacity-75 mt-2">18 active referrals</p>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-5 h-5 opacity-80" />
            <TrendingUp className="w-4 h-4 opacity-80" />
          </div>
          <p className="text-sm opacity-90 mb-1">Total Earnings</p>
          <p className="text-3xl font-bold">{formatCurrency(340.50)}</p>
          <p className="text-xs opacity-75 mt-2">{formatCurrency(45.2)} this month</p>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <Heart className="w-5 h-5 opacity-80" />
            <CheckCircle2 className="w-4 h-4 opacity-80" />
          </div>
          <p className="text-sm opacity-90 mb-1">Auto Shared</p>
          <p className="text-3xl font-bold">{isLoading ? "..." : formatCurrency(sharingStats?.totalShared || 0)}</p>
          <p className="text-xs opacity-75 mt-2">0.5% auto-shared</p>
        </div>
      </div>

      {/* Automatic Reward Sharing - Premium Alert */}
      <Alert className="border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 shadow-md">
        <Zap className="h-5 w-5 text-blue-600" />
        <AlertDescription className="text-blue-900">
          <div className="flex items-center justify-between flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <strong className="text-blue-900">🎁 Community Sharing Active</strong>
              <p className="text-sm text-blue-800 mt-1">0.5% of your creator economy earnings are automatically shared with your referrals — keep them motivated!</p>
              <div className="flex items-center gap-2 text-sm bg-blue-100 px-3 py-1 rounded-full">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-blue-900">{isLoading ? "..." : formatCurrency(sharingStats?.thisMonthShared || 0)} shared this month</span>
              </div>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* Primary CTA - Share Your Link Section */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white pb-6">
          <div className="flex items-center gap-3">
            <Share2 className="w-6 h-6" />
            <div>
              <CardTitle className="text-white text-2xl">Start Sharing Your Link</CardTitle>
              <p className="text-white/90 text-sm mt-1">One click to share with friends and start earning</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-5">
            {/* Link Copy Section */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Your Unique Referral Link</label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    value={referralLink}
                    readOnly
                    className="pr-12 bg-white text-sm font-mono"
                  />
                </div>
                <Button
                  onClick={copyReferralLink}
                  className={`transition-all ${
                    copiedLink
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                  size="lg"
                >
                  {copiedLink ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">Share this link with friends to earn rewards</p>
            </div>

            {/* Social Share Buttons */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Share on Social Media</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  onClick={() => shareReferralLink("twitter")}
                  className="hover:bg-blue-50 hover:border-blue-300 transition-colors h-12"
                  size="lg"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Share on Twitter
                </Button>
                <Button
                  variant="outline"
                  onClick={() => shareReferralLink("facebook")}
                  className="hover:bg-blue-50 hover:border-blue-400 transition-colors h-12"
                  size="lg"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Share on Facebook
                </Button>
                <Button
                  variant="outline"
                  onClick={() => shareReferralLink("whatsapp")}
                  className="hover:bg-green-50 hover:border-green-300 transition-colors h-12"
                  size="lg"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Share on WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Recent Referral Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: "Alice Johnson", action: "signed up", reward: "$10", time: "2 hours ago", status: "completed" },
              { name: "Mike Smith", action: "made first purchase", reward: "$5", time: "1 day ago", status: "completed" },
              { name: "Sarah Wilson", action: "signed up", reward: "$10", time: "3 days ago", status: "pending" }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {activity.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{activity.name} {activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">{activity.reward}</p>
                  <Badge variant={activity.status === "completed" ? "default" : "secondary"} className="text-xs">
                    {activity.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* How it Works */}
      <Card>
        <CardHeader>
          <CardTitle>How Referrals Work</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="font-semibold">1. Share Your Link</h3>
              <p className="text-sm text-muted-foreground">
                Share your unique referral link with friends and family
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-full">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-semibold">2. Friends Join</h3>
              <p className="text-sm text-muted-foreground">
                When someone signs up using your link, they become your referral
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 text-purple-600 rounded-full">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="font-semibold">3. Earn Rewards</h3>
              <p className="text-sm text-muted-foreground">
                Both you and your friend earn rewards for activities and purchases
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Automatic Reward Sharing Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Automatic Reward Sharing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-2">How It Works</h3>
              <p className="text-sm text-gray-700 mb-3">
                0.5% of creator economy earnings are automatically shared with your referrals.
              </p>
              <div className="grid grid-cols-2 gap-6 text-xs">
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">✅ Included</h4>
                  <p className="text-gray-600">Content, engagement, ads, challenges</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">❌ Excluded</h4>
                  <p className="text-gray-600">Freelance, marketplace, crypto trading</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">Your Sharing Impact</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Total Shared:</span>
                    <span className="font-medium text-green-900">
                      {isLoading ? "Loading..." : formatCurrency(sharingStats?.totalShared || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Transactions:</span>
                    <span className="font-medium text-green-900">
                      {isLoading ? "..." : (sharingStats?.sharingTransactionsCount || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">This Month:</span>
                    <span className="font-medium text-green-900">
                      {isLoading ? "..." : formatCurrency(sharingStats?.thisMonthShared || 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">You've Received</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Total Received:</span>
                    <span className="font-medium text-blue-900">
                      {isLoading ? "Loading..." : formatCurrency(sharingStats?.totalReceived || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">From Others:</span>
                    <span className="font-medium text-blue-900">
                      {isLoading ? "..." : (sharingStats?.receivingTransactionsCount || 0)} people
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">This Month:</span>
                    <span className="font-medium text-blue-900">
                      {isLoading ? "..." : formatCurrency(sharingStats?.thisMonthReceived || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-yellow-700">
                    Automatic sharing is part of our Terms of Service.
                    <a href="/terms" className="underline hover:text-yellow-800 ml-1">Terms of Service</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral Tiers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Referral Tiers & Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg bg-orange-50 border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-orange-500" />
                  <span className="font-semibold text-orange-700">Bronze (0-4 referrals)</span>
                </div>
                <ul className="text-sm text-orange-600 space-y-1">
                  <li>• 10 Eloity Points per referral</li>
                  <li>• 5% revenue share</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg bg-gray-50 border-gray-300">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-gray-500" />
                  <span className="font-semibold text-gray-700">Silver (5-24 referrals)</span>
                  <Badge className="bg-gray-500 text-white text-xs">Current</Badge>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 25 Eloity Points per referral</li>
                  <li>• 7.5% revenue share</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-300">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="font-semibold text-yellow-700">Gold (25+ referrals)</span>
                </div>
                <ul className="text-sm text-yellow-600 space-y-1">
                  <li>• 50 Eloity Points per referral</li>
                  <li>• 10% revenue share</li>
                  <li>• Priority support</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SafeReferralComponent;
