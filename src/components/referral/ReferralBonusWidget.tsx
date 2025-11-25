import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Copy,
  Share2,
  Twitter,
  MessageCircle,
  Mail,
  DollarSign,
  Users,
  TrendingUp,
  Gift,
  Check,
  Clock,
  AlertCircle,
} from "lucide-react";
import { ReferralBonusService } from "@/services/referralBonusService";
import { formatCurrency, formatNumber } from "@/utils/formatters";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ReferralBonusWidgetProps {
  userTier?: "tier_1" | "tier_2";
  onBonusApplied?: () => void;
}

export default function ReferralBonusWidget({
  userTier = "tier_1",
  onBonusApplied,
}: ReferralBonusWidgetProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [referralCode, setReferralCode] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [bonuses, setBonuses] = useState<any[]>([]);
  const [isApplyingCode, setIsApplyingCode] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    setIsLoading(true);
    try {
      const [code, stats, bonuses] = await Promise.all([
        ReferralBonusService.getReferralCode(),
        ReferralBonusService.getReferralStats(),
        ReferralBonusService.getBonuses(),
      ]);

      setReferralCode(code);
      setStats(stats);
      setBonuses(bonuses);
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

  const handleCopyCode = async () => {
    if (referralCode?.code) {
      try {
        const shareUrl = ReferralBonusService.generateShareUrl(referralCode.code);
        await navigator.clipboard.writeText(shareUrl);
        setCopiedCode(true);
        toast({
          title: "Copied!",
          description: "Referral link copied to clipboard",
        });
        setTimeout(() => setCopiedCode(false), 2000);
      } catch (error) {
        console.error("Error copying code:", error);
      }
    }
  };

  const handleShareCode = (platform: "twitter" | "whatsapp" | "email") => {
    if (referralCode?.code) {
      ReferralBonusService.shareReferralCode(referralCode.code, platform);
      toast({
        title: "Sharing...",
        description: `Opening ${platform} to share your referral code`,
      });
    }
  };

  const handleApplyCode = async () => {
    if (!codeInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter a referral code",
        variant: "destructive",
      });
      return;
    }

    setIsApplyingCode(true);
    try {
      const success = await ReferralBonusService.applyReferralCode(codeInput);
      if (success) {
        toast({
          title: "Success!",
          description: "Referral code applied successfully",
        });
        setCodeInput("");
        onBonusApplied?.();
        await loadReferralData();
      } else {
        toast({
          title: "Error",
          description: "Failed to apply referral code",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error applying code:", error);
      toast({
        title: "Error",
        description: "Failed to apply referral code",
        variant: "destructive",
      });
    } finally {
      setIsApplyingCode(false);
    }
  };

  const handleClaimBonus = async (bonusId: string) => {
    try {
      const success = await ReferralBonusService.claimBonus(bonusId);
      if (success) {
        toast({
          title: "Success!",
          description: "Bonus claimed successfully",
        });
        await loadReferralData();
      } else {
        toast({
          title: "Error",
          description: "Failed to claim bonus",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error claiming bonus:", error);
      toast({
        title: "Error",
        description: "Failed to claim bonus",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg animate-pulse" />
        <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  const tierConfig = ReferralBonusService.calculateBonuses(userTier);
  const currentTierConfig =
    userTier === "tier_2" ? tierConfig.tier2 : tierConfig.tier1;

  return (
    <div className="space-y-6">
      {/* Main Referral Card */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-6 w-6 text-purple-600" />
              Referral Program
            </CardTitle>
            <Badge
              variant="secondary"
              className={cn(
                userTier === "tier_2"
                  ? "bg-gold-100 text-gold-900"
                  : "bg-blue-100 text-blue-900"
              )}
            >
              {userTier === "tier_2" ? "Tier 2 Benefits" : "Tier 1"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Referral Code Section */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Your Referral Code</Label>
            <div className="flex gap-2">
              <div className="flex-1 bg-white rounded-lg p-4 border border-purple-200 flex items-center justify-between">
                <code className="font-mono text-lg font-bold text-purple-600">
                  {referralCode?.code || "LOADING..."}
                </code>
                <Button
                  size="sm"
                  variant={copiedCode ? "default" : "outline"}
                  onClick={handleCopyCode}
                  className={cn(
                    copiedCode && "bg-green-500 hover:bg-green-600"
                  )}
                >
                  {copiedCode ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShareCode("twitter")}
                className="flex-1"
              >
                <Twitter className="h-4 w-4 mr-2" />
                Twitter
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShareCode("whatsapp")}
                className="flex-1"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShareCode("email")}
                className="flex-1"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
            </div>
          </div>

          {/* Referral Benefits */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              Your Referral Benefits
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3 border border-purple-200">
                <p className="text-sm text-gray-600">Referrer Bonus</p>
                <p className="text-2xl font-bold text-purple-600">
                  {currentTierConfig.referrerBonus}
                </p>
                <p className="text-xs text-gray-500">Eloity Tokens</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-purple-200">
                <p className="text-sm text-gray-600">Referee Bonus</p>
                <p className="text-2xl font-bold text-purple-600">
                  {currentTierConfig.refereeBonus}
                </p>
                <p className="text-xs text-gray-500">
                  {userTier === "tier_2" ? "+ 7 Days Premium" : "Tokens"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats & Bonuses Tabs */}
      <Tabs defaultValue="stats" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Stats</span>
          </TabsTrigger>
          <TabsTrigger value="bonuses" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            <span className="hidden sm:inline">Bonuses</span>
          </TabsTrigger>
          <TabsTrigger value="apply" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Apply Code</span>
          </TabsTrigger>
        </TabsList>

        {/* Stats Tab */}
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Referral Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {stats ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Total Referrals</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stats.totalReferrals}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Successful</p>
                      <p className="text-3xl font-bold text-green-600">
                        {stats.successfulReferrals}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Total Earned</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {stats.totalBonusEarned}
                      </p>
                      <p className="text-xs text-gray-500">Eloity Tokens</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Pending</p>
                      <p className="text-3xl font-bold text-yellow-600">
                        {stats.pendingBonuses}
                      </p>
                    </div>
                  </div>

                  {/* Conversion Rate Progress */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-700">
                        Conversion Rate
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {stats.totalReferrals > 0
                          ? Math.round(
                              (stats.successfulReferrals / stats.totalReferrals) *
                                100
                            )
                          : 0}
                        %
                      </p>
                    </div>
                    <Progress
                      value={
                        stats.totalReferrals > 0
                          ? (stats.successfulReferrals / stats.totalReferrals) *
                            100
                          : 0
                      }
                      className="h-2"
                    />
                  </div>

                  {/* Recent Referrals */}
                  {stats.recentReferrals && stats.recentReferrals.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-gray-900">
                        Recent Referrals
                      </p>
                      <div className="space-y-2">
                        {stats.recentReferrals.slice(0, 5).map((referral: any) => (
                          <div
                            key={referral.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-gray-500" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {referral.bonusType === "tokens"
                                    ? `${referral.bonusValue} Tokens`
                                    : referral.bonusValue}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(
                                    referral.createdAt
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Badge
                              variant={
                                referral.status === "credited"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {referral.status === "credited" ? (
                                <>
                                  <Check className="h-3 w-3 mr-1" />
                                  Credited
                                </>
                              ) : (
                                <>
                                  <Clock className="h-3 w-3 mr-1" />
                                  Pending
                                </>
                              )}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No referral data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bonuses Tab */}
        <TabsContent value="bonuses">
          <Card>
            <CardHeader>
              <CardTitle>Available Bonuses</CardTitle>
            </CardHeader>
            <CardContent>
              {bonuses && bonuses.length > 0 ? (
                <div className="space-y-3">
                  {bonuses.map((bonus) => (
                    <div
                      key={bonus.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900">
                            {ReferralBonusService.getBonusDisplay(bonus)}
                          </p>
                          <Badge
                            variant={
                              bonus.status === "pending"
                                ? "secondary"
                                : "default"
                            }
                          >
                            {bonus.status === "pending" ? (
                              <>
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </>
                            ) : (
                              <>
                                <Check className="h-3 w-3 mr-1" />
                                Claimed
                              </>
                            )}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Created:{" "}
                          {new Date(bonus.createdAt).toLocaleDateString()}
                        </p>
                        {bonus.expiresAt && (
                          <p className="text-xs text-gray-500">
                            Expires:{" "}
                            {new Date(bonus.expiresAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {bonus.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => handleClaimBonus(bonus.id)}
                          className="ml-4"
                        >
                          Claim
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Gift className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No bonuses yet</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Share your referral code to earn bonuses
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Apply Code Tab */}
        <TabsContent value="apply">
          <Card>
            <CardHeader>
              <CardTitle>Apply Referral Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Enter a referral code from another user to claim bonus rewards
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <Label htmlFor="referral-code">Referral Code</Label>
                <Input
                  id="referral-code"
                  placeholder="Enter referral code (e.g., REF123456)"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !isApplyingCode) {
                      handleApplyCode();
                    }
                  }}
                  disabled={isApplyingCode}
                />
              </div>

              <Button
                onClick={handleApplyCode}
                disabled={isApplyingCode || !codeInput.trim()}
                className="w-full"
              >
                {isApplyingCode ? "Applying..." : "Apply Code"}
              </Button>

              <div className="space-y-3 pt-4">
                <h4 className="font-semibold text-gray-900">
                  What you'll receive:
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-purple-600" />
                    <span className="text-sm text-gray-700">
                      {currentTierConfig.refereeBonus} Eloity Tokens
                    </span>
                  </div>
                  {userTier === "tier_2" && (
                    <div className="flex items-center gap-2">
                      <Gift className="h-4 w-4 text-purple-600" />
                      <span className="text-sm text-gray-700">
                        7 Days Premium Access
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Referral Rules */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-base">Program Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex gap-2">
              <span className="text-blue-600">•</span>
              <span>Each referral code can be used once per user</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">•</span>
              <span>Bonuses expire after 90 days if not claimed</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">•</span>
              <span>
                {userTier === "tier_2"
                  ? "Tier 2 users earn double rewards"
                  : "Upgrade to Tier 2 for higher rewards"}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">•</span>
              <span>No self-referrals or duplicate accounts allowed</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
