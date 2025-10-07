// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Trophy,
  Star,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Gift,
  Zap,
} from "lucide-react";
import { formatNumber } from "@/utils/formatters";
import { useToast } from "@/hooks/use-toast";
import { PioneerBadgeService, PioneerSessionTracker } from "@/services/pioneerBadgeService";

export default function PioneerBadgeWidget() {
  const { toast } = useToast();
  const [badge, setBadge] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [availableSlots, setAvailableSlots] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    loadPioneerData();
    // Start session tracking for pioneer badge calculation
    PioneerSessionTracker.startSession();

    return () => {
      PioneerSessionTracker.endSession();
    };
  }, []);

  const loadPioneerData = async () => {
    try {
      setIsLoading(true);
      const [badgeData, eligibilityData, slotsData] = await Promise.all([
        PioneerBadgeService.getPioneerBadge(),
        PioneerBadgeService.checkEligibility(),
        PioneerBadgeService.getAvailableSlots(),
      ]);

      setBadge(badgeData);
      setEligibility(eligibilityData);
      setAvailableSlots(slotsData);
    } catch (error) {
      console.error('Failed to load pioneer data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimBadge = async () => {
    try {
      setIsClaiming(true);
      const result = await PioneerBadgeService.claimPioneerBadge();

      if (result.success && result.badge) {
        setBadge(result.badge);
        toast({
          title: "🏆 Pioneer Badge Earned!",
          description: PioneerBadgeService.formatBadgeNotification(result.badgeNumber || 0),
          duration: 5000,
        });
        // Refresh data
        await loadPioneerData();
      } else {
        toast({
          title: "Unable to Claim Badge",
          description: result.error || "You don't meet the requirements yet",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error claiming badge:', error);
      toast({
        title: "Error",
        description: "Failed to claim pioneer badge. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsClaiming(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Pioneer Badge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // User already has a pioneer badge
  if (badge) {
    return (
      <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Pioneer Badge #{badge.badge_number}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4">
              <Star className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Congratulations!</h3>
            <p className="text-sm text-gray-600">
              You're Pioneer #{badge.badge_number} - one of the first {badge.badge_number} verified active users on Eloity!
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center p-3 bg-white rounded-lg border">
              <p className="font-semibold text-gray-900">{badge.eligibility_score}/100</p>
              <p className="text-gray-600">Eligibility Score</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border">
              <p className="font-semibold text-gray-900">
                {new Date(badge.earned_at).toLocaleDateString()}
              </p>
              <p className="text-gray-600">Earned Date</p>
            </div>
          </div>

          <Alert className="border-yellow-200 bg-yellow-50">
            <Gift className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Pioneer Perks:</strong> As a Pioneer Badge holder, you have special recognition 
              in the community and may be eligible for exclusive features as they become available.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // No slots remaining
  if (availableSlots && availableSlots.remainingSlots <= 0) {
    return (
      <Card className="border-gray-200 bg-gray-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-gray-400" />
            Pioneer Badge Program
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-700">All Badges Awarded</h3>
            <p className="text-sm text-gray-600">
              All 500 Pioneer Badges have been claimed by our early active community members.
            </p>
          </div>

          <div className="p-4 bg-white rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Pioneer Badges Awarded</span>
              <span className="text-sm font-bold text-gray-900">500/500</span>
            </div>
            <Progress value={100} className="h-2" />
          </div>

          <p className="text-xs text-gray-500 text-center">
            Thank you for being part of our community! While Pioneer Badges are no longer available, 
            you can still participate in our referral program and other community initiatives.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Show eligibility status and claim option
  return (
    <Card className={`border-blue-200 ${eligibility?.isEligible ? 'bg-gradient-to-br from-blue-50 to-purple-50' : 'bg-blue-50'}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-blue-500" />
          Pioneer Badge Program
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mb-4">
            <Star className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">
            {eligibility?.isEligible ? 'You\'re Eligible!' : 'Become a Pioneer'}
          </h3>
          <p className="text-sm text-gray-600">
            Join the first 500 verified active users on Eloity
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Eligibility Score</span>
            <span className="text-sm font-bold text-gray-900">
              {eligibility?.currentScore || 0}/{eligibility?.requiredScore || 75}
            </span>
          </div>
          <Progress 
            value={((eligibility?.currentScore || 0) / (eligibility?.requiredScore || 75)) * 100} 
            className="h-2"
          />
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Remaining Slots</span>
            <span className="text-sm font-bold text-gray-900">
              {availableSlots?.remainingSlots || 0}/500
            </span>
          </div>
          <Progress 
            value={((500 - (availableSlots?.remainingSlots || 0)) / 500) * 100} 
            className="h-2"
          />
        </div>

        {eligibility?.isEligible ? (
          <Button 
            onClick={handleClaimBadge}
            disabled={isClaiming}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {isClaiming ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Claiming Badge...
              </>
            ) : (
              <>
                <Trophy className="w-4 h-4 mr-2" />
                Claim Pioneer Badge #{availableSlots?.nextBadgeNumber || '?'}
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 text-sm">To become eligible:</h4>
            <div className="space-y-2">
              {eligibility?.improvements?.slice(0, 3).map((improvement, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">{improvement.category}:</span> {improvement.description}
                  </div>
                </div>
              ))}
            </div>
            <Alert className="border-blue-200">
              <Zap className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 text-xs">
                Keep being active on Eloity! Create content, engage with the community, 
                and complete quality sessions to improve your eligibility score.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
