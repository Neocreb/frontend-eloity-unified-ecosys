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

      {/* Recent Activity - Enhanced */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <CardTitle className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span>Recent Referral Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {!isLoading && (
            <div className="space-y-3">
              {[
                { name: "Alice Johnson", action: "signed up", reward: "$10", time: "2 hours ago", status: "completed" },
                { name: "Mike Smith", action: "made first purchase", reward: "$5", time: "1 day ago", status: "completed" },
                { name: "Sarah Wilson", action: "signed up", reward: "$10", time: "3 days ago", status: "pending" }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white border rounded-xl hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                      {activity.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{activity.name}</p>
                      <p className="text-xs text-gray-500">{activity.action} • {activity.time}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p className="font-bold text-green-600 text-lg">{activity.reward}</p>
                      <Badge variant={activity.status === "completed" ? "default" : "secondary"} className="text-xs">
                        {activity.status === "completed" ? "✓ Completed" : "⏳ Pending"}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {isLoading && (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-3 border-gray-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-500">Loading activity...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* How it Works - Improved */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <CardTitle className="text-xl">How Referrals Work</CardTitle>
          <p className="text-sm text-gray-600 mt-1">Three simple steps to start earning</p>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: 1,
                icon: Share2,
                title: "Share Your Link",
                desc: "Share your unique referral link with friends and family via email, social media, or messaging"
              },
              {
                step: 2,
                icon: Users,
                title: "Friends Join",
                desc: "When someone signs up using your link, they become your referral and you both get bonuses"
              },
              {
                step: 3,
                icon: DollarSign,
                title: "Earn Rewards",
                desc: "Both you and your friend earn rewards for activities, purchases, and milestones"
              }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="relative text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center mb-4 shadow-lg">
                      <Icon className="w-7 h-7" />
                    </div>
                    <Badge className="mb-3 bg-purple-100 text-purple-700">Step {item.step}</Badge>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                  </div>
                  {item.step < 3 && (
                    <div className="hidden md:block absolute top-1/4 -right-6 transform">
                      <ArrowRight className="w-5 h-5 text-purple-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Automatic Reward Sharing - Enhanced Premium Design */}
      <Card className="shadow-xl border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-red-50 via-pink-50 to-rose-50 border-b">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Heart className="w-6 h-6 text-red-500" />
            Automatic Reward Sharing
          </CardTitle>
          <p className="text-gray-600 mt-2">Grow your network while supporting your referrals</p>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-6">
            {/* How It Works Section */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                How It Works
              </h3>
              <p className="text-gray-700 font-semibold mb-4">
                0.5% of your creator economy earnings are automatically shared with your referrals
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-2">
                  <h4 className="font-bold text-green-700 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    ✅ Included Earnings
                  </h4>
                  <div className="bg-white/60 p-3 rounded-lg border border-green-200">
                    <p className="text-gray-700">Content, engagement, ads, challenges</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-red-700">❌ Excluded Earnings</h4>
                  <div className="bg-white/60 p-3 rounded-lg border border-red-200">
                    <p className="text-gray-700">Freelance, marketplace, crypto trading</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <h4 className="font-bold text-green-900">Your Sharing Impact</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                    <span className="text-gray-700">Total Shared</span>
                    <span className="font-bold text-lg text-green-700">
                      {isLoading ? "..." : formatCurrency(sharingStats?.totalShared || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                    <span className="text-gray-700">Transactions</span>
                    <span className="font-bold text-lg text-green-700">
                      {isLoading ? "..." : (sharingStats?.sharingTransactionsCount || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg border border-green-300">
                    <span className="text-gray-700">This Month</span>
                    <span className="font-bold text-lg text-green-700">
                      {isLoading ? "..." : formatCurrency(sharingStats?.thisMonthShared || 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Gift className="w-5 h-5 text-blue-600" />
                  <h4 className="font-bold text-blue-900">You've Received</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                    <span className="text-gray-700">Total Received</span>
                    <span className="font-bold text-lg text-blue-700">
                      {isLoading ? "..." : formatCurrency(sharingStats?.totalReceived || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                    <span className="text-gray-700">From Others</span>
                    <span className="font-bold text-lg text-blue-700">
                      {isLoading ? "..." : (sharingStats?.receivingTransactionsCount || 0)} people
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg border border-blue-300">
                    <span className="text-gray-700">This Month</span>
                    <span className="font-bold text-lg text-blue-700">
                      {isLoading ? "..." : formatCurrency(sharingStats?.thisMonthReceived || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Banner */}
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex gap-3">
              <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-900">
                  <strong>Automatic sharing</strong> is part of our commitment to community growth.
                  <a href="/terms" className="underline font-semibold hover:text-amber-700 ml-1">Learn more in our Terms of Service</a>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral Tiers - Premium Design */}
      <Card className="shadow-xl border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Star className="w-6 h-6 text-yellow-500" />
            Referral Tiers & Benefits
          </CardTitle>
          <p className="text-gray-600 mt-2">Unlock better rewards as you grow</p>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bronze Tier */}
            <div className="relative group rounded-xl overflow-hidden border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50 p-6 hover:shadow-lg transition-all duration-300">
              <div className="absolute top-4 right-4">
                <Badge className="bg-orange-500 text-white">Bronze</Badge>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-bold text-orange-900">Bronze Tier</h3>
                  <p className="text-xs text-orange-700">0-4 referrals</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-orange-800">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>10 Eloity Points per referral</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-orange-800">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>5% revenue share</span>
                </div>
              </div>
            </div>

            {/* Silver Tier - Current */}
            <div className="relative group rounded-xl overflow-hidden border-2 border-gray-400 bg-gradient-to-br from-gray-50 to-slate-50 p-6 shadow-lg hover:shadow-xl transition-all duration-300 ring-2 ring-purple-500 ring-offset-2">
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">Current</Badge>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Silver Tier</h3>
                  <p className="text-xs text-gray-700">5-24 referrals</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-800">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  <span className="font-semibold">25 Eloity Points per referral</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-800">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  <span className="font-semibold">7.5% revenue share</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-300">
                <p className="text-xs font-semibold text-purple-600">Keep inviting to reach Gold!</p>
              </div>
            </div>

            {/* Gold Tier */}
            <div className="relative group rounded-xl overflow-hidden border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-50 p-6 hover:shadow-lg transition-all duration-300">
              <div className="absolute top-4 right-4">
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">Premium</Badge>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-bold text-yellow-900">Gold Tier</h3>
                  <p className="text-xs text-yellow-700">25+ referrals</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-yellow-800">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>50 Eloity Points per referral</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-yellow-800">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>10% revenue share</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-yellow-800">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Priority support 🎁</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SafeReferralComponent;
