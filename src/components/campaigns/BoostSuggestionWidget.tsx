import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sparkles,
  TrendingUp,
  Target,
  Eye,
  Rocket,
  X,
  Info,
  Zap,
  Star,
  Crown,
  Diamond,
  Clock,
  Users,
  DollarSign,
  ArrowRight,
  CheckCircle2,
  Brain,
  Lightbulb,
  Flame,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";

interface BoostSuggestion {
  id: string;
  confidence: number;
  urgency: "low" | "medium" | "high";
  reason: string;
  estimatedReach: number;
  estimatedEngagement: number;
  recommendedBoost: {
    type: "basic" | "featured" | "premium" | "homepage";
    cost: number;
    currency: string;
    duration: number;
  };
  triggerFactors: string[];
  timing: {
    optimal: boolean;
    timeWindow: string;
  };
}

interface BoostSuggestionWidgetProps {
  contentType: "product" | "service" | "job" | "video" | "post" | "profile";
  contentData: {
    title: string;
    description: string;
    category: string;
    tags: string[];
    quality?: number; // 0-100
  };
  userMetrics?: {
    followers: number;
    engagement: number;
    recentPerformance: number;
  };
  onBoostApplied: (boostData: any) => void;
  onDismiss: () => void;
  className?: string;
}

const BoostSuggestionWidget: React.FC<BoostSuggestionWidgetProps> = ({
  contentType,
  contentData,
  userMetrics = { followers: 0, engagement: 0, recentPerformance: 0 },
  onBoostApplied,
  onDismiss,
  className = "",
}) => {
  const { toast } = useToast();
  const [suggestion, setSuggestion] = useState<BoostSuggestion | null>(null);
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showWidget, setShowWidget] = useState(false);

  // Generate boost suggestion based on content and user data
  useEffect(() => {
    const generateSuggestion = () => {
      // Analyze content quality and context
      const contentQuality = contentData.quality || 70;
      const hasOptimalTags = contentData.tags.length >= 3;
      const isTrendingCategory = ["technology", "crypto", "design"].includes(contentData.category.toLowerCase());
      const goodDescription = contentData.description.length > 50;

      // Calculate suggestion confidence
      let confidence = 60; // Base confidence
      if (contentQuality > 80) confidence += 20;
      if (hasOptimalTags) confidence += 10;
      if (isTrendingCategory) confidence += 15;
      if (goodDescription) confidence += 10;
      if (userMetrics.engagement > 5) confidence += 15;
      if (userMetrics.recentPerformance > 70) confidence += 10;

      // Determine if suggestion should be shown
      if (confidence < 75) return null;

      // Determine urgency
      let urgency: "low" | "medium" | "high" = "low";
      if (isTrendingCategory && contentQuality > 85) urgency = "high";
      else if (contentQuality > 80 || userMetrics.engagement > 7) urgency = "medium";

      // Recommend boost type based on content and performance
      let boostType: "basic" | "featured" | "premium" | "homepage" = "basic";
      let cost = 25;
      
      if (contentQuality > 90 && userMetrics.engagement > 8) {
        boostType = "homepage";
        cost = 150;
      } else if (contentQuality > 85 || urgency === "high") {
        boostType = "premium";
        cost = 75;
      } else if (contentQuality > 75 || urgency === "medium") {
        boostType = "featured";
        cost = 50;
      }

      // Calculate estimated metrics
      const baseReach = userMetrics.followers * 10 + 5000;
      const multipliers = { basic: 3, featured: 5, premium: 8, homepage: 15 };
      const estimatedReach = baseReach * multipliers[boostType];
      const estimatedEngagement = Math.round(estimatedReach * (userMetrics.engagement / 100 + 0.03));

      // Generate trigger factors
      const triggerFactors = [];
      if (contentQuality > 80) triggerFactors.push("High content quality detected");
      if (isTrendingCategory) triggerFactors.push("Trending category opportunity");
      if (hasOptimalTags) triggerFactors.push("Well-tagged content");
      if (userMetrics.engagement > 5) triggerFactors.push("Strong audience engagement");
      if (userMetrics.recentPerformance > 70) triggerFactors.push("Recent content performing well");

      const newSuggestion: BoostSuggestion = {
        id: Date.now().toString(),
        confidence: Math.min(confidence, 95),
        urgency,
        reason: getReasonText(boostType, urgency, isTrendingCategory),
        estimatedReach,
        estimatedEngagement,
        recommendedBoost: {
          type: boostType,
          cost,
          currency: "SOFT_POINTS",
          duration: boostType === "homepage" ? 72 : boostType === "premium" ? 48 : 24,
        },
        triggerFactors,
        timing: {
          optimal: urgency !== "low",
          timeWindow: urgency === "high" ? "Next 2 hours for best results" : "Within 24 hours",
        },
      };

      setSuggestion(newSuggestion);
      setShowWidget(true);
    };

    // Delay suggestion to avoid immediate popup
    const timer = setTimeout(generateSuggestion, 2000);
    return () => clearTimeout(timer);
  }, [contentData, userMetrics, contentType]);

  const getReasonText = (boostType: string, urgency: string, isTrending: boolean) => {
    if (urgency === "high" && isTrending) {
      return "🔥 Perfect timing! Your content aligns with trending topics and shows high quality indicators.";
    }
    if (boostType === "homepage") {
      return "⭐ Exceptional content detected! This could perform exceptionally well with maximum visibility.";
    }
    if (boostType === "premium") {
      return "📈 Great opportunity! Your content quality suggests strong potential for increased reach.";
    }
    if (boostType === "featured") {
      return "✨ Good timing! A boost could significantly improve your content's visibility.";
    }
    return "🚀 Consider boosting this content to reach more people and increase engagement.";
  };

  const getBoostIcon = (type: string) => {
    switch (type) {
      case "basic": return <Zap className="h-4 w-4" />;
      case "featured": return <Star className="h-4 w-4" />;
      case "premium": return <Crown className="h-4 w-4" />;
      case "homepage": return <Diamond className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  const getBoostColor = (type: string) => {
    switch (type) {
      case "basic": return "from-blue-500 to-cyan-500";
      case "featured": return "from-purple-500 to-pink-500";
      case "premium": return "from-yellow-500 to-orange-500";
      case "homepage": return "from-red-500 to-pink-500";
      default: return "from-gray-500 to-gray-600";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high": return "text-red-600 bg-red-50";
      case "medium": return "text-orange-600 bg-orange-50";
      case "low": return "text-blue-600 bg-blue-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const handleApplyBoost = async () => {
    if (!suggestion) return;

    setIsProcessing(true);
    try {
      // Simulate boost application
      await new Promise(resolve => setTimeout(resolve, 2000));

      const boostData = {
        contentType,
        contentData,
        appliedBoost: suggestion.recommendedBoost,
        estimatedMetrics: {
          reach: suggestion.estimatedReach,
          engagement: suggestion.estimatedEngagement,
        },
        timestamp: new Date().toISOString(),
      };

      onBoostApplied(boostData);
      
      toast({
        title: "Boost Applied Successfully! 🚀",
        description: `Your ${contentType} is now being promoted with ${suggestion.recommendedBoost.type} boost`,
      });

      setShowWidget(false);
    } catch (error) {
      toast({
        title: "Boost Application Failed",
        description: "Please try again or contact support",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDismiss = (reason?: string) => {
    if (reason === "not_now") {
      toast({
        title: "Reminder Set",
        description: "We'll suggest this again later when timing might be better",
      });
    } else if (reason === "not_interested") {
      toast({
        title: "Noted",
        description: "We'll learn from your preferences for future suggestions",
      });
    }

    setShowWidget(false);
    onDismiss();
  };

  if (!showWidget || !suggestion) {
    return null;
  }

  return (
    <>
      {/* Compact Widget */}
      <Card className={`border-2 border-dashed border-blue-300 bg-gradient-to-r from-blue-50 to-purple-50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${getBoostColor(suggestion.recommendedBoost.type)}`}>
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">Smart Boost Suggestion</h4>
                  <Badge className={getUrgencyColor(suggestion.urgency)}>
                    {suggestion.urgency === "high" && <Flame className="h-3 w-3 mr-1" />}
                    {suggestion.urgency.charAt(0).toUpperCase() + suggestion.urgency.slice(1)} Priority
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {suggestion.reason}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    {suggestion.estimatedReach.toLocaleString()} reach
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {suggestion.confidence}% confidence
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {suggestion.recommendedBoost.cost} {suggestion.recommendedBoost.currency}
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDismiss()}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetailedView(true)}
              >
                <Info className="h-3 w-3 mr-1" />
                Details
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDismiss("not_now")}
              >
                <Clock className="h-3 w-3 mr-1" />
                Maybe Later
              </Button>
            </div>
            <Button
              size="sm"
              onClick={handleApplyBoost}
              disabled={isProcessing}
              className={`bg-gradient-to-r ${getBoostColor(suggestion.recommendedBoost.type)} text-white border-0`}
            >
              {isProcessing ? (
                <>
                  <Sparkles className="h-3 w-3 mr-1 animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  {getBoostIcon(suggestion.recommendedBoost.type)}
                  <span className="ml-1">Boost Now</span>
                </>
              )}
            </Button>
          </div>

          {/* Timing indicator */}
          {suggestion.timing.optimal && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
              <div className="flex items-center gap-1 text-yellow-700">
                <Clock className="h-3 w-3" />
                <span className="font-medium">Optimal timing:</span>
                <span>{suggestion.timing.timeWindow}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed View Dialog */}
      <Dialog open={showDetailedView} onOpenChange={setShowDetailedView}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Boost Analysis
            </DialogTitle>
            <DialogDescription>
              Detailed analysis of why we recommend boosting this content
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Confidence Score */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Confidence Score</span>
                <span className="text-sm text-muted-foreground">{suggestion.confidence}%</span>
              </div>
              <Progress value={suggestion.confidence} className="h-2" />
            </div>

            {/* Recommended Boost */}
            <Card className={`bg-gradient-to-r ${getBoostColor(suggestion.recommendedBoost.type)} text-white`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    {getBoostIcon(suggestion.recommendedBoost.type)}
                  </div>
                  <div>
                    <h4 className="font-semibold capitalize">{suggestion.recommendedBoost.type} Boost</h4>
                    <p className="text-sm opacity-90">
                      {suggestion.recommendedBoost.duration} hours • {suggestion.recommendedBoost.cost} {suggestion.recommendedBoost.currency}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Expected Results */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {suggestion.estimatedReach.toLocaleString()}
                </div>
                <div className="text-sm text-blue-700">Estimated Reach</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {suggestion.estimatedEngagement.toLocaleString()}
                </div>
                <div className="text-sm text-green-700">Expected Engagement</div>
              </div>
            </div>

            {/* Analysis Factors */}
            <div>
              <h4 className="font-medium mb-2">Why We Recommend This</h4>
              <div className="space-y-2">
                {suggestion.triggerFactors.map((factor, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>{factor}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Analysis */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <h5 className="font-medium mb-2">Content Summary</h5>
              <div className="text-sm space-y-1">
                <div><strong>Type:</strong> {contentType}</div>
                <div><strong>Category:</strong> {contentData.category}</div>
                <div><strong>Tags:</strong> {contentData.tags.join(", ")}</div>
                {contentData.quality && (
                  <div><strong>Quality Score:</strong> {contentData.quality}/100</div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowDetailedView(false)}>
                Close
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowDetailedView(false);
                  handleDismiss("not_interested");
                }}
              >
                Not Interested
              </Button>
            </div>
            <Button 
              onClick={() => {
                setShowDetailedView(false);
                handleApplyBoost();
              }}
              disabled={isProcessing}
              className={`bg-gradient-to-r ${getBoostColor(suggestion.recommendedBoost.type)} text-white border-0`}
            >
              {getBoostIcon(suggestion.recommendedBoost.type)}
              <span className="ml-1">Apply Boost</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BoostSuggestionWidget;
