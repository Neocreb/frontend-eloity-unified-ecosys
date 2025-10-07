// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  XCircle,
  Shield,
  Crown,
  Zap,
  Upload,
  Video,
  BarChart3,
  Users,
  Sparkles,
  Star,
  Award,
  Clock,
  Database,
  Camera,
  FileText,
  Phone,
  Mail,
  CreditCard,
  AlertTriangle,
  Info,
  Calendar,
  PlayCircle,
  Settings,
  MessageSquare,
  ShoppingBag,
  TrendingUp,
  Globe,
  Verified,
  DollarSign,
  RefreshCw,
  AlertCircle,
  Gift,
  Target,
  Palette,
  Brain,
  Rocket,
  Filter,
  Wallet,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useWalletContext } from "@/contexts/WalletContext";
import { useNavigate } from "react-router-dom";
import KYCVerificationModal from "@/components/kyc/KYCVerificationModal";

interface PremiumUser {
  id: string;
  isVerified: boolean;
  isPremium: boolean;
  subscriptionExpiry?: Date;
  storageUsed: number; // in GB
  storageLimit: number; // in GB
  videosUploadedThisMonth: number;
  nextBillingDate?: Date;
}

const mockPremiumUser: PremiumUser = {
  id: "user123",
  isVerified: false,
  isPremium: false,
  storageUsed: 3.2,
  storageLimit: 5,
  videosUploadedThisMonth: 7,
};

const Premium: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { walletBalance, refreshWallet } = useWalletContext();
  const navigate = useNavigate();
  const [userPremium, setUserPremium] = useState<PremiumUser>(mockPremiumUser);
  const [showKYC, setShowKYC] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [kycLevel, setKycLevel] = useState(user?.profile?.kyc_level || 0);

  // Calculate storage percentage
  const storagePercentage = (userPremium.storageUsed / userPremium.storageLimit) * 100;
  const videoLimitPercentage = (userPremium.videosUploadedThisMonth / 10) * 100;

  // Check if storage is running low
  const isStorageLow = storagePercentage > 80;
  const isVideoLimitNear = videoLimitPercentage > 80;

  // Get real wallet balance
  const currentWalletBalance = walletBalance?.total || 0;

  // Check KYC status - level 2 or higher is considered verified for premium
  const isKYCVerified = kycLevel >= 2;

  const freePlanFeatures = [
    { feature: "Monetization tools", included: true },
    { feature: "Ad Manager", included: true },
    { feature: "Freelance platform", included: true },
    { feature: "Marketplace access", included: true },
    { feature: "Crypto P2P trading", included: true },
    { feature: "Unified Chat & Video", included: true },
    { feature: "Video uploads", included: true, limit: "10/month" },
    { feature: "Storage", included: true, limit: "5GB" },
    { feature: "Video retention", included: true, limit: "90 days" },
    { feature: "Video quality", included: true, limit: "Standard" },
    { feature: "Support", included: true, limit: "Community" },
    { feature: "Verified badge", included: false },
  ];

  const premiumFeatures = [
    { feature: "Blue Verified Badge", included: true, highlight: true },
    { feature: "Unlimited video uploads", included: true, highlight: true },
    { feature: "Storage", included: true, limit: "100GB", highlight: true },
    { feature: "No content auto-deletion", included: true, highlight: true },
    { feature: "HD/4K upload & streaming", included: true, highlight: true },
    { feature: "Priority support", included: true },
    { feature: "Custom thumbnails", included: true },
    { feature: "AI Credits", included: true, limit: "100/month" },
    { feature: "SoftPoints bonus", included: true, highlight: true },
    { feature: "SoftPoints cashback", included: true, highlight: true },
    { feature: "Scheduled content", included: true },
    { feature: "Advanced analytics", included: true },
    { feature: "Verified Spotlight", included: true },
    { feature: "Verified collaborations", included: true },
    { feature: "Co-host & stitched videos", included: true },
  ];

  const handleUpgrade = async () => {
    const requiredAmount = selectedPlan === 'monthly' ? 9.99 : 99.99;

    // Check wallet balance
    if (currentWalletBalance < requiredAmount) {
      toast({
        title: "Insufficient Balance",
        description: `You need $${requiredAmount.toFixed(2)} but only have $${currentWalletBalance.toFixed(2)} in your wallet.`,
        variant: "destructive",
      });
      setShowDepositModal(true);
      return;
    }

    // Check KYC verification status
    if (!isKYCVerified) {
      toast({
        title: "KYC Verification Required",
        description: "Complete identity verification to activate your verified badge.",
        variant: "default",
      });
      setShowKYC(true);
      return;
    }

    setIsProcessing(true);

    // Simulate API call for premium upgrade
    setTimeout(async () => {
      // Update user premium status
      setUserPremium(prev => ({
        ...prev,
        isPremium: true,
        isVerified: true,
        subscriptionExpiry: new Date(Date.now() + (selectedPlan === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000),
        nextBillingDate: new Date(Date.now() + (selectedPlan === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000),
        storageLimit: 100,
      }));

      // Refresh wallet to reflect payment
      await refreshWallet();

      setIsProcessing(false);
      toast({
        title: "Welcome to Premium!",
        description: "Your verified badge and premium features are now active.",
      });
    }, 2000);
  };

  const handleKYCComplete = (newLevel: number) => {
    setKycLevel(newLevel);
    setShowKYC(false);
    if (newLevel >= 2) {
      toast({
        title: "KYC Verified!",
        description: "Your identity has been verified. You can now upgrade to Premium.",
      });
    }
  };

  const openKYCInSettings = () => {
    // Navigate to settings with KYC tab or open existing KYC route
    navigate('/app/kyc');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Crown className="h-12 w-12 text-yellow-500 mr-3" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Eloity Premium
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            All users can earn, but verified users enjoy more trust, storage, and flexibility
          </p>
        </div>

        {/* Current Status */}
        {userPremium.isPremium && (
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Verified className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-800">Premium Active</h3>
                    <p className="text-green-600">
                      Next billing: {userPremium.nextBillingDate?.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge className="bg-green-600 text-white">
                  <Crown className="h-4 w-4 mr-1" />
                  Verified
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Storage & Usage Warnings */}
        {(isStorageLow || isVideoLimitNear) && !userPremium.isPremium && (
          <div className="mb-8 space-y-4">
            {isStorageLow && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-orange-800">Storage Running Low</h4>
                      <p className="text-orange-600 text-sm">
                        You've used {userPremium.storageUsed}GB of {userPremium.storageLimit}GB
                      </p>
                      <Progress value={storagePercentage} className="mt-2 h-2" />
                    </div>
                    <Button size="sm" onClick={() => setShowPayment(true)}>
                      Upgrade for More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {isVideoLimitNear && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Video className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-blue-800">Video Limit Nearly Reached</h4>
                      <p className="text-blue-600 text-sm">
                        {userPremium.videosUploadedThisMonth} of 10 videos uploaded this month
                      </p>
                      <Progress value={videoLimitPercentage} className="mt-2 h-2" />
                    </div>
                    <Button size="sm" onClick={() => setShowPayment(true)}>
                      Upgrade for Unlimited
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Plan Comparison */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Free Plan */}
          <Card className="relative">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-gray-100 rounded-full w-fit">
                <Users className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="text-2xl font-bold">Free Plan</h3>
              <p className="text-gray-600">Perfect for getting started</p>
              <div className="text-3xl font-bold mt-4">$0</div>
              <p className="text-sm text-gray-500">Forever free</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {freePlanFeatures.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  {item.included ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  )}
                  <span className={`flex-1 ${!item.included ? 'text-gray-400 line-through' : ''}`}>
                    {item.feature}
                  </span>
                  {item.limit && (
                    <Badge variant="outline" className="text-xs">
                      {item.limit}
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full" 
                disabled={!userPremium.isPremium}
              >
                {userPremium.isPremium ? 'Current Plan' : 'Active Plan'}
              </Button>
            </CardFooter>
          </Card>

          {/* Premium Plan */}
          <Card className="relative border-2 border-yellow-400 shadow-lg">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-yellow-500 text-white px-4 py-1">
                <Star className="h-4 w-4 mr-1" />
                Most Popular
              </Badge>
            </div>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full w-fit">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold">Verified Premium</h3>
              <p className="text-gray-600">More trust, storage, and power</p>
              
              <Tabs value={selectedPlan} onValueChange={(value) => setSelectedPlan(value as 'monthly' | 'yearly')}>
                <TabsList className="mt-4">
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  <TabsTrigger value="yearly">Yearly</TabsTrigger>
                </TabsList>
                <TabsContent value="monthly">
                  <div className="text-3xl font-bold mt-4">$9.99</div>
                  <p className="text-sm text-gray-500">₦9,999/month</p>
                </TabsContent>
                <TabsContent value="yearly">
                  <div className="text-3xl font-bold mt-4">$99.99</div>
                  <p className="text-sm text-gray-500">₦99,999/year</p>
                  <Badge className="bg-green-100 text-green-800 mt-2">
                    Save 2 months!
                  </Badge>
                </TabsContent>
              </Tabs>
            </CardHeader>
            <CardContent className="space-y-4">
              {premiumFeatures.map((item, index) => (
                <div key={index} className={`flex items-center gap-3 ${item.highlight ? 'bg-yellow-50 p-2 rounded-lg border border-yellow-200' : ''}`}>
                  <CheckCircle2 className={`h-5 w-5 flex-shrink-0 ${item.highlight ? 'text-yellow-600' : 'text-green-500'}`} />
                  <span className={`flex-1 ${item.highlight ? 'font-semibold text-yellow-800' : ''}`}>
                    {item.feature}
                  </span>
                  {item.limit && (
                    <Badge variant="outline" className="text-xs">
                      {item.limit}
                    </Badge>
                  )}
                  {item.highlight && (
                    <Sparkles className="h-4 w-4 text-yellow-600" />
                  )}
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
                onClick={handleUpgrade}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : userPremium.isPremium ? (
                  'Current Plan'
                ) : (
                  'Upgrade to Premium'
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* KYC Requirement Notice */}
        {!userPremium.isPremium && (
          <Card className={`mb-8 ${isKYCVerified ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'}`}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-full ${isKYCVerified ? 'bg-green-100' : 'bg-blue-100'}`}>
                  <Shield className={`h-6 w-6 ${isKYCVerified ? 'text-green-600' : 'text-blue-600'}`} />
                </div>
                <div>
                  <h3 className={`font-semibold mb-2 ${isKYCVerified ? 'text-green-800' : 'text-blue-800'}`}>
                    {isKYCVerified ? 'KYC Verification Complete' : 'KYC Verification Required'}
                  </h3>
                  <p className={`mb-4 ${isKYCVerified ? 'text-green-600' : 'text-blue-600'}`}>
                    {isKYCVerified
                      ? 'Your identity has been verified! You can now upgrade to Premium and get your verified badge.'
                      : 'Before your verified badge activates, complete our secure identity verification process:'
                    }
                  </p>
                  {!isKYCVerified && (
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-blue-700">
                        <FileText className="h-4 w-4" />
                        Upload valid Government-issued ID (front & back)
                      </div>
                      <div className="flex items-center gap-2 text-sm text-blue-700">
                        <Camera className="h-4 w-4" />
                        Real-time selfie with liveness detection
                      </div>
                      <div className="flex items-center gap-2 text-sm text-blue-700">
                        <Phone className="h-4 w-4" />
                        Phone and email verification
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    {kycLevel === 0 && (
                      <Button
                        variant="outline"
                        onClick={openKYCInSettings}
                        className="border-blue-300 text-blue-700 hover:bg-blue-100"
                      >
                        Start Verification
                      </Button>
                    )}
                    {kycLevel === 1 && (
                      <>
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Clock className="h-4 w-4 mr-1" />
                          Level {kycLevel} - In Progress
                        </Badge>
                        <Button
                          variant="outline"
                          onClick={openKYCInSettings}
                          size="sm"
                        >
                          Continue Verification
                        </Button>
                      </>
                    )}
                    {kycLevel >= 2 && (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Level {kycLevel} - Verified ✓
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Premium Benefits Showcase */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                <Verified className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Verified Badge</h3>
              <p className="text-gray-600 text-sm">
                Blue checkmark appears on your profile, posts, products, freelance gigs, videos, and chats
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="mx-auto mb-4 p-3 bg-purple-100 rounded-full w-fit">
                <Database className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">100GB Storage</h3>
              <p className="text-gray-600 text-sm">
                20x more storage space with no content auto-deletion after 90 days
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
                <Video className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Unlimited Videos</h3>
              <p className="text-gray-600 text-sm">
                Upload unlimited videos in HD/4K quality with custom thumbnails
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="mx-auto mb-4 p-3 bg-yellow-100 rounded-full w-fit">
                <Brain className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="font-semibold mb-2">AI Credits</h3>
              <p className="text-gray-600 text-sm">
                100 AI credits monthly for content generation and smart recommendations
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
                <Target className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="font-semibold mb-2">Verified Spotlight</h3>
              <p className="text-gray-600 text-sm">
                Priority placement in feeds, search results, and collaboration filters
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="mx-auto mb-4 p-3 bg-indigo-100 rounded-full w-fit">
                <Gift className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="font-semibold mb-2">SoftPoints Rewards</h3>
              <p className="text-gray-600 text-sm">
                Bonus SoftPoints on upgrade plus cashback on every renewal
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Payment Logic Info */}
        <Card className="mb-8">
          <CardHeader>
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment & Billing
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium">Unified Wallet Balance</h4>
                <p className="text-sm text-gray-600">Current balance available for subscription</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">${currentWalletBalance.toFixed(2)}</div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-1"
                  onClick={() => setShowDepositModal(true)}
                >
                  Add Funds
                </Button>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Billing Terms
                </h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Automatic renewal from unified wallet</li>
                  <li>• 5-day grace period for failed payments</li>
                  <li>• 3-day advance expiration notifications</li>
                  <li>• Instant activation upon payment</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Your Protection
                </h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Cancel anytime, no penalties</li>
                  <li>• Pro-rated refunds available</li>
                  <li>• Secure encrypted payments</li>
                  <li>• Data protection guaranteed</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">Frequently Asked Questions</h3>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium mb-2">What happens to my content if I don't upgrade?</h4>
              <p className="text-gray-600 text-sm">
                Free users have a 90-day content retention policy. Videos older than 90 days are automatically deleted, 
                but you'll receive notifications before deletion. Upgrade to Premium to keep all content forever.
              </p>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium mb-2">How does the verified badge work?</h4>
              <p className="text-gray-600 text-sm">
                The blue verified badge appears across the entire platform - on your profile, posts, marketplace products, 
                freelance gigs, videos, and in chats. It builds trust and helps you stand out to potential clients and collaborators.
              </p>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium mb-2">Can I upgrade/downgrade anytime?</h4>
              <p className="text-gray-600 text-sm">
                Yes! You can upgrade to Premium anytime. If you cancel, you'll retain Premium features until your current 
                billing period ends, then automatically switch to the Free plan.
              </p>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium mb-2">What's included in the KYC verification?</h4>
              <p className="text-gray-600 text-sm">
                KYC includes uploading a government-issued ID, taking a real-time selfie with liveness detection, and 
                verifying your phone and email. This ensures the verified badge represents a real, authenticated person.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KYC Modal - Using existing system */}
      {showKYC && (
        <KYCVerificationModal
          userId={user?.id || ""}
          currentLevel={kycLevel}
          onLevelUpdate={handleKYCComplete}
        />
      )}

      {/* Add Funds Dialog */}
      <Dialog open={showDepositModal} onOpenChange={setShowDepositModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Funds for Premium Upgrade</DialogTitle>
            <DialogDescription>
              Add funds to your unified wallet to complete the Premium upgrade
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Required amount:</p>
              <p className="text-2xl font-bold text-blue-600">
                ${(selectedPlan === 'monthly' ? 9.99 : 99.99).toFixed(2)}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Current balance: ${currentWalletBalance.toFixed(2)}
              </p>
              <p className="text-sm text-red-600 mt-1">
                Need: ${Math.max(0, (selectedPlan === 'monthly' ? 9.99 : 99.99) - currentWalletBalance).toFixed(2)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setShowDepositModal(false);
                  navigate('/wallet');
                }}
                className="flex-1"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Go to Wallet
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDepositModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Premium;
