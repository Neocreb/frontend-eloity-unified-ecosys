import React, { useState } from "react";
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
  DollarSign,
  Eye,
  MousePointer,
  ShoppingCart,
  Clock,
  Zap,
  Star,
  Crown,
  Diamond,
  Rocket,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertCircle,
  Info,
  Brain,
  Lightbulb,
  ThumbsUp,
  Flame,
  Award,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";

interface SmartBoostSuggestion {
  id: string;
  type: "ai_recommended" | "trending" | "performance_based" | "seasonal";
  title: string;
  description: string;
  contentItem: {
    id: string;
    name: string;
    image: string;
    type: string;
    currentPerformance: {
      views: number;
      engagement: number;
      conversions?: number;
    };
  };
  recommendation: {
    boostType: string;
    estimatedReach: number;
    estimatedEngagement: number;
    estimatedROI: number;
    confidence: number; // 0-100
    cost: number;
    currency: string;
    duration: number; // hours
  };
  reasoning: string[];
  priority: "high" | "medium" | "low";
  urgency?: "urgent" | "normal" | "low";
  timeLimit?: string;
}

const mockSuggestions: SmartBoostSuggestion[] = [
  {
    id: "1",
    type: "ai_recommended",
    title: "🔥 High-Potential Product Detected",
    description: "Your Wireless Headphones show strong engagement signals",
    contentItem: {
      id: "prod1",
      name: "Premium Wireless Headphones",
      image: "/placeholder.svg",
      type: "marketplace_product",
      currentPerformance: {
        views: 1234,
        engagement: 8.5,
        conversions: 23,
      },
    },
    recommendation: {
      boostType: "featured",
      estimatedReach: 15000,
      estimatedEngagement: 850,
      estimatedROI: 340,
      confidence: 92,
      cost: 50,
      currency: "SOFT_POINTS",
      duration: 72,
    },
    reasoning: [
      "Engagement rate 40% above average",
      "Similar products trending in your category",
      "High conversion rate with organic traffic",
      "Optimal timing based on audience activity",
    ],
    priority: "high",
    urgency: "urgent",
    timeLimit: "Next 6 hours for best results",
  },
  {
    id: "2",
    type: "trending",
    title: "📈 Trending Category Opportunity",
    description: "Ride the wave of trending tech accessories",
    contentItem: {
      id: "prod2",
      name: "Smart Watch Series",
      image: "/placeholder.svg",
      type: "marketplace_product",
      currentPerformance: {
        views: 567,
        engagement: 6.2,
        conversions: 8,
      },
    },
    recommendation: {
      boostType: "premium",
      estimatedReach: 25000,
      estimatedEngagement: 1200,
      estimatedROI: 280,
      confidence: 85,
      cost: 75,
      currency: "USDT",
      duration: 48,
    },
    reasoning: [
      "Tech accessories category up 67% this week",
      "Your product aligns with trending searches",
      "Competitor analysis shows opportunity gap",
      "Seasonal demand peak approaching",
    ],
    priority: "high",
    urgency: "normal",
  },
  {
    id: "3",
    type: "performance_based",
    title: "⚡ Underperforming Content Rescue",
    description: "Boost struggling content with high potential",
    contentItem: {
      id: "service1",
      name: "Logo Design Service",
      image: "/placeholder.svg",
      type: "freelance_service",
      currentPerformance: {
        views: 234,
        engagement: 3.1,
        conversions: 2,
      },
    },
    recommendation: {
      boostType: "basic",
      estimatedReach: 8000,
      estimatedEngagement: 400,
      estimatedROI: 180,
      confidence: 78,
      cost: 25,
      currency: "SOFT_POINTS",
      duration: 24,
    },
    reasoning: [
      "Low visibility despite quality indicators",
      "Similar services performing 3x better",
      "Small boost could significantly improve reach",
      "Cost-effective opportunity for growth",
    ],
    priority: "medium",
    urgency: "normal",
  },
  {
    id: "4",
    type: "seasonal",
    title: "🎯 Seasonal Timing Perfect",
    description: "Capitalize on seasonal demand patterns",
    contentItem: {
      id: "video1",
      name: "New Year Productivity Tips",
      image: "/placeholder.svg",
      type: "video_content",
      currentPerformance: {
        views: 890,
        engagement: 12.3,
      },
    },
    recommendation: {
      boostType: "homepage",
      estimatedReach: 50000,
      estimatedEngagement: 3500,
      estimatedROI: 450,
      confidence: 95,
      cost: 150,
      currency: "USDT",
      duration: 96,
    },
    reasoning: [
      "New Year content peaks in next 2 weeks",
      "Productivity niche highly engaged currently",
      "Your content quality score: 9.2/10",
      "Historical data shows 4x performance during this period",
    ],
    priority: "high",
    urgency: "urgent",
    timeLimit: "Act within 24 hours for peak timing",
  },
  {
    id: "5",
    type: "ai_recommended",
    title: "🚀 Cross-Platform Synergy",
    description: "Amplify successful content across platforms",
    contentItem: {
      id: "post1",
      name: "Crypto Trading Tips Post",
      image: "/placeholder.svg",
      type: "social_post",
      currentPerformance: {
        views: 2340,
        engagement: 18.7,
      },
    },
    recommendation: {
      boostType: "featured",
      estimatedReach: 20000,
      estimatedEngagement: 2800,
      estimatedROI: 520,
      confidence: 88,
      cost: 40,
      currency: "SOFT_POINTS",
      duration: 48,
    },
    reasoning: [
      "Exceptional organic performance (18.7% engagement)",
      "Crypto content trending 89% above baseline",
      "Audience overlap analysis shows untapped potential",
      "Similar content performed 5x better with boost",
    ],
    priority: "high",
    urgency: "normal",
  },
];

interface SmartBoostSuggestionsProps {
  context?: "seller" | "freelancer" | "client";
  entityId?: string;
  entityType?: "product" | "profile" | "job" | "service";
}

const SmartBoostSuggestions: React.FC<SmartBoostSuggestionsProps> = ({
  context = "seller",
  entityId,
  entityType,
}) => {
  const { toast } = useToast();
  const [suggestions] = useState<SmartBoostSuggestion[]>(mockSuggestions);
  const [selectedSuggestion, setSelectedSuggestion] = useState<SmartBoostSuggestion | null>(null);
  const [showBoostModal, setShowBoostModal] = useState(false);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "ai_recommended": return <Brain className="h-5 w-5 text-purple-600" />;
      case "trending": return <TrendingUp className="h-5 w-5 text-green-600" />;
      case "performance_based": return <Target className="h-5 w-5 text-blue-600" />;
      case "seasonal": return <Clock className="h-5 w-5 text-orange-600" />;
      default: return <Lightbulb className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "ai_recommended": return "border-purple-200 bg-purple-50";
      case "trending": return "border-green-200 bg-green-50";
      case "performance_based": return "border-blue-200 bg-blue-50";
      case "seasonal": return "border-orange-200 bg-orange-50";
      default: return "border-gray-200 bg-gray-50";
    }
  };

  const getPriorityColor = (priority: string, urgency?: string) => {
    if (urgency === "urgent") return "bg-red-500 text-white";
    switch (priority) {
      case "high": return "bg-orange-500 text-white";
      case "medium": return "bg-yellow-500 text-white";
      case "low": return "bg-gray-500 text-white";
      default: return "bg-blue-500 text-white";
    }
  };

  const getBoostIcon = (boostType: string) => {
    switch (boostType) {
      case "basic": return <Zap className="h-4 w-4" />;
      case "featured": return <Star className="h-4 w-4" />;
      case "premium": return <Crown className="h-4 w-4" />;
      case "homepage": return <Diamond className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  const handleApplySuggestion = (suggestion: SmartBoostSuggestion) => {
    setSelectedSuggestion(suggestion);
    setShowBoostModal(true);
  };

  const handleConfirmBoost = () => {
    if (!selectedSuggestion) return;

    toast({
      title: "Boost Applied!",
      description: `${selectedSuggestion.contentItem.name} is now being promoted`,
    });

    setShowBoostModal(false);
    setSelectedSuggestion(null);
  };

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === "SOFT_POINTS") return `${amount} SP`;
    return `$${amount}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">🧠 Smart Boost Suggestions</h2>
        <p className="text-muted-foreground">
          AI-powered recommendations to maximize your content's potential
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{suggestions.length}</div>
            <div className="text-sm text-muted-foreground">Active Suggestions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {suggestions.filter(s => s.priority === "high").length}
            </div>
            <div className="text-sm text-muted-foreground">High Priority</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {suggestions.filter(s => s.urgency === "urgent").length}
            </div>
            <div className="text-sm text-muted-foreground">Time Sensitive</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(suggestions.reduce((sum, s) => sum + s.recommendation.confidence, 0) / suggestions.length)}%
            </div>
            <div className="text-sm text-muted-foreground">Avg Confidence</div>
          </CardContent>
        </Card>
      </div>

      {/* Suggestions Grid */}
      <div className="space-y-4">
        {suggestions.map((suggestion) => (
          <Card 
            key={suggestion.id} 
            className={`transition-all hover:shadow-lg ${getTypeColor(suggestion.type)}`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  {getTypeIcon(suggestion.type)}
                  <div>
                    <h3 className="font-semibold text-lg">{suggestion.title}</h3>
                    <p className="text-muted-foreground">{suggestion.description}</p>
                    {suggestion.timeLimit && (
                      <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                        <Clock className="h-3 w-3" />
                        {suggestion.timeLimit}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge className={getPriorityColor(suggestion.priority, suggestion.urgency)}>
                    {suggestion.urgency === "urgent" ? "Urgent" : suggestion.priority}
                  </Badge>
                  <Badge variant="outline">
                    {suggestion.recommendation.confidence}% confidence
                  </Badge>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-6">
                {/* Content Item */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <img 
                    src={suggestion.contentItem.image}
                    alt={suggestion.contentItem.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium truncate">{suggestion.contentItem.name}</h4>
                    <div className="text-sm text-muted-foreground capitalize">
                      {suggestion.contentItem.type.replace("_", " ")}
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                      <span>{suggestion.contentItem.currentPerformance.views} views</span>
                      <span>{suggestion.contentItem.currentPerformance.engagement}% engagement</span>
                      {suggestion.contentItem.currentPerformance.conversions && (
                        <span>{suggestion.contentItem.currentPerformance.conversions} conversions</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Recommendation Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-blue-600">
                      {suggestion.recommendation.estimatedReach.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Est. Reach</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-green-600">
                      {suggestion.recommendation.estimatedROI}%
                    </div>
                    <div className="text-xs text-muted-foreground">Est. ROI</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-purple-600">
                      {formatCurrency(suggestion.recommendation.cost, suggestion.recommendation.currency)}
                    </div>
                    <div className="text-xs text-muted-foreground">Cost</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-orange-600">
                      {suggestion.recommendation.duration}h
                    </div>
                    <div className="text-xs text-muted-foreground">Duration</div>
                  </div>
                </div>
              </div>

              {/* AI Reasoning */}
              <div className="mt-4 p-3 bg-white/50 rounded-lg">
                <h5 className="font-medium mb-2 flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  AI Analysis
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {suggestion.reasoning.map((reason, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confidence Score */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Confidence Score</span>
                  <span className="text-sm text-muted-foreground">
                    {suggestion.recommendation.confidence}%
                  </span>
                </div>
                <Progress value={suggestion.recommendation.confidence} className="h-2" />
              </div>
            </CardContent>

            <CardFooter className="border-t bg-white/30 p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {getBoostIcon(suggestion.recommendation.boostType)}
                  <span className="ml-1 capitalize">{suggestion.recommendation.boostType} Boost</span>
                </Badge>
                {suggestion.urgency === "urgent" && (
                  <Badge className="bg-red-500 text-white text-xs">
                    <Flame className="h-3 w-3 mr-1" />
                    Act Fast
                  </Badge>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    toast({
                      title: "Suggestion Dismissed",
                      description: "We'll learn from your preferences for future suggestions",
                    });
                  }}
                >
                  Dismiss
                </Button>
                <Button 
                  size="sm"
                  onClick={() => handleApplySuggestion(suggestion)}
                  className={suggestion.urgency === "urgent" ? "bg-red-600 hover:bg-red-700" : ""}
                >
                  <Rocket className="h-4 w-4 mr-2" />
                  Apply Boost
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Empty State (shown when no suggestions) */}
      {suggestions.length === 0 && (
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <Brain className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold">No Suggestions Available</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Our AI is analyzing your content performance. Check back soon for personalized boost recommendations.
              </p>
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Analyze My Content
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Boost Confirmation Modal */}
      <Dialog open={showBoostModal} onOpenChange={setShowBoostModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Confirm Boost Application</DialogTitle>
            <DialogDescription>
              Review the details before applying this boost
            </DialogDescription>
          </DialogHeader>

          {selectedSuggestion && (
            <div className="space-y-4">
              {/* Content Item */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={selectedSuggestion.contentItem.image}
                      alt={selectedSuggestion.contentItem.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <h4 className="font-medium">{selectedSuggestion.contentItem.name}</h4>
                      <p className="text-sm text-muted-foreground capitalize">
                        {selectedSuggestion.contentItem.type.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Boost Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Boost Type</label>
                  <div className="p-2 bg-gray-50 rounded flex items-center gap-2">
                    {getBoostIcon(selectedSuggestion.recommendation.boostType)}
                    <span className="capitalize">{selectedSuggestion.recommendation.boostType}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration</label>
                  <div className="p-2 bg-gray-50 rounded">
                    {selectedSuggestion.recommendation.duration} hours
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cost</label>
                  <div className="p-2 bg-gray-50 rounded">
                    {formatCurrency(
                      selectedSuggestion.recommendation.cost, 
                      selectedSuggestion.recommendation.currency
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Est. Reach</label>
                  <div className="p-2 bg-gray-50 rounded">
                    {selectedSuggestion.recommendation.estimatedReach.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Expectations */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h5 className="font-medium mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    Expected Results
                  </h5>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Estimated Reach:</span>
                      <div className="font-medium">
                        {selectedSuggestion.recommendation.estimatedReach.toLocaleString()} people
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Estimated ROI:</span>
                      <div className="font-medium text-green-600">
                        {selectedSuggestion.recommendation.estimatedROI}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Method</label>
                <div className="p-3 border rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    <span>SoftPoints Wallet</span>
                  </div>
                  <span className="text-green-600 font-medium">
                    Balance: 1,250 SP
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBoostModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmBoost}>
              <Rocket className="h-4 w-4 mr-2" />
              Apply Boost
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SmartBoostSuggestions;
