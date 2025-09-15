import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
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
import {
  Bot,
  Brain,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  Star,
  Lightbulb,
  Zap,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Coins,
  Briefcase,
  Camera,
  Mic,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Code,
  Palette,
  Wand2,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Search,
  ArrowRight,
  Plus,
  X,
  Settings,
  HelpCircle,
  Shield,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface AIRecommendation {
  id: string;
  type: "user" | "product" | "service" | "content" | "job" | "investment";
  title: string;
  description: string;
  image?: string;
  score: number;
  reasons: string[];
  actionLabel: string;
  actionUrl: string;
  category?: string;
  price?: number;
  rating?: number;
  tags?: string[];
}

interface SmartInsight {
  id: string;
  type: "performance" | "opportunity" | "risk" | "trend" | "achievement";
  title: string;
  description: string;
  icon: React.ReactNode;
  value?: string;
  change?: number;
  actionable: boolean;
  priority: "low" | "medium" | "high";
}

interface ContentSuggestion {
  id: string;
  type: "post" | "video" | "story" | "product" | "service";
  title: string;
  description: string;
  hashtags: string[];
  estimatedReach: number;
  bestTime: string;
  confidence: number;
}

// Smart Feed Curation Component
export const SmartFeedCuration: React.FC = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>(
    [],
  );
  const [insights, setInsights] = useState<SmartInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchAIRecommendations();
  }, [filter]);

  const fetchAIRecommendations = async () => {
    setLoading(true);
    try {
      // Simulate AI recommendation API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockRecommendations: AIRecommendation[] = [
        {
          id: "1",
          type: "user",
          title: "Sarah Johnson",
          description:
            "Full Stack Developer with similar interests in React and Node.js",
          image: "/api/placeholder/40/40",
          score: 92,
          reasons: [
            "Similar skills",
            "Mutual connections",
            "Active in same communities",
          ],
          actionLabel: "Follow",
          actionUrl: "/profile/sarah-johnson",
          tags: ["React", "Node.js", "TypeScript"],
        },
        {
          id: "2",
          type: "product",
          title: "Wireless Noise-Cancelling Headphones",
          description: "Based on your recent audio equipment searches",
          image: "/api/placeholder/120/120",
          score: 88,
          reasons: [
            "Recent search history",
            "Price range match",
            "High ratings",
          ],
          actionLabel: "View Product",
          actionUrl: "/marketplace/headphones-123",
          price: 199.99,
          rating: 4.8,
          category: "Electronics",
        },
        {
          id: "3",
          type: "job",
          title: "Senior React Developer",
          description: "Remote position matching your skills and preferences",
          score: 95,
          reasons: ["Skills match", "Remote work preference", "Salary range"],
          actionLabel: "Apply Now",
          actionUrl: "/freelance/jobs/react-dev-456",
          category: "Technology",
        },
        {
          id: "4",
          type: "investment",
          title: "Ethereum (ETH)",
          description: "Strong potential based on your trading patterns",
          score: 76,
          reasons: [
            "Price trend analysis",
            "Portfolio diversification",
            "Market sentiment",
          ],
          actionLabel: "View Chart",
          actionUrl: "/crypto/eth",
          category: "Cryptocurrency",
        },
      ];

      const mockInsights: SmartInsight[] = [
        {
          id: "1",
          type: "performance",
          title: "Post Engagement Up 34%",
          description: "Your content is performing better this week",
          icon: <TrendingUp className="w-5 h-5 text-green-500" />,
          value: "+34%",
          change: 34,
          actionable: true,
          priority: "medium",
        },
        {
          id: "2",
          type: "opportunity",
          title: "Optimal Posting Time",
          description: "Post at 7 PM for 23% more engagement",
          icon: <Clock className="w-5 h-5 text-blue-500" />,
          value: "7 PM",
          actionable: true,
          priority: "high",
        },
        {
          id: "3",
          type: "achievement",
          title: "Trading Goal Achieved",
          description: "You've reached your monthly profit target",
          icon: <Target className="w-5 h-5 text-purple-500" />,
          value: "100%",
          actionable: false,
          priority: "low",
        },
      ];

      setRecommendations(mockRecommendations);
      setInsights(mockInsights);
    } catch (error) {
      console.error("Failed to fetch AI recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecommendations =
    filter === "all"
      ? recommendations
      : recommendations.filter((r) => r.type === filter);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    return "text-red-500";
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="w-12 h-12 bg-muted rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            Smart Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
            >
              {insight.icon}
              <div className="flex-1">
                <p className="font-medium text-sm">{insight.title}</p>
                <p className="text-xs text-muted-foreground">
                  {insight.description}
                </p>
              </div>
              {insight.value && (
                <Badge
                  variant={
                    insight.priority === "high" ? "default" : "secondary"
                  }
                >
                  {insight.value}
                </Badge>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            AI Recommendations
          </CardTitle>
          <div className="flex gap-2 flex-wrap">
            {["all", "user", "product", "job", "investment"].map((type) => (
              <Button
                key={type}
                variant={filter === type ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(type)}
                className="capitalize"
              >
                {type}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredRecommendations.map((rec) => (
            <Card
              key={rec.id}
              className="overflow-hidden hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex gap-3">
                  {rec.image && (
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={rec.image}
                        alt={rec.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-sm line-clamp-1">
                          {rec.title}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {rec.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <Brain className="w-3 h-3 text-purple-500" />
                        <span
                          className={`text-xs font-medium ${getScoreColor(rec.score)}`}
                        >
                          {rec.score}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-1 flex-wrap">
                        {rec.reasons.slice(0, 2).map((reason, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {reason}
                          </Badge>
                        ))}
                      </div>

                      <Button size="sm" variant="outline">
                        {rec.actionLabel}
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>

                    {rec.price && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm font-medium">
                          ${rec.price}
                        </span>
                        {rec.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            <span className="text-xs">{rec.rating}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

// AI Content Assistant
export const AIContentAssistant: React.FC = () => {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [contentType, setContentType] = useState<string>("post");
  const { toast } = useToast();

  const generateSuggestions = async () => {
    if (!input.trim()) return;

    setLoading(true);
    try {
      // Simulate AI content generation
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockSuggestions: ContentSuggestion[] = [
        {
          id: "1",
          type: "post",
          title: "Share your expertise with a how-to guide",
          description: "Create a step-by-step tutorial based on your skills",
          hashtags: ["#tutorial", "#webdev", "#coding", "#react"],
          estimatedReach: 2500,
          bestTime: "Tuesday 7 PM",
          confidence: 87,
        },
        {
          id: "2",
          type: "video",
          title: "Quick tip video for developers",
          description: "Share a 60-second coding tip or trick",
          hashtags: ["#coding", "#tips", "#developer", "#productivity"],
          estimatedReach: 3200,
          bestTime: "Wednesday 6 PM",
          confidence: 92,
        },
        {
          id: "3",
          type: "story",
          title: "Behind-the-scenes development process",
          description: "Show your workspace and current project",
          hashtags: ["#developer", "#workspace", "#coding", "#tech"],
          estimatedReach: 1800,
          bestTime: "Today 8 PM",
          confidence: 76,
        },
      ];

      setSuggestions(mockSuggestions);
      toast({
        title: "Content suggestions generated",
        description: "AI has created personalized content ideas for you",
      });
    } catch (error) {
      toast({
        title: "Failed to generate suggestions",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-purple-500" />
          AI Content Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Content Type
            </label>
            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="post">Social Post</SelectItem>
                <SelectItem value="video">Video Content</SelectItem>
                <SelectItem value="story">Story</SelectItem>
                <SelectItem value="product">Product Listing</SelectItem>
                <SelectItem value="service">Service Offering</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              What would you like to create content about?
            </label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your topic, interests, or what you want to share..."
              rows={3}
            />
          </div>

          <Button
            onClick={generateSuggestions}
            disabled={loading || !input.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating Ideas...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Content Ideas
              </>
            )}
          </Button>
        </div>

        {suggestions.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">AI Generated Suggestions</h4>
            {suggestions.map((suggestion) => (
              <Card key={suggestion.id} className="border-dashed">
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h5 className="font-medium text-sm">
                        {suggestion.title}
                      </h5>
                      <Badge variant="outline" className="text-xs">
                        {suggestion.confidence}% match
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {suggestion.description}
                    </p>

                    <div className="flex gap-1 flex-wrap">
                      {suggestion.hashtags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        Est. reach: {suggestion.estimatedReach.toLocaleString()}
                      </span>
                      <span>Best time: {suggestion.bestTime}</span>
                    </div>

                    <Button size="sm" variant="outline" className="w-full">
                      Use This Idea
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Smart Price Prediction
export const SmartPricePrediction: React.FC = () => {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrypto, setSelectedCrypto] = useState("BTC");

  useEffect(() => {
    fetchPricePredictions();
  }, [selectedCrypto]);

  const fetchPricePredictions = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockPredictions = [
        {
          timeframe: "24h",
          prediction: "up",
          confidence: 73,
          priceTarget: 46500,
          currentPrice: 45000,
          change: 3.33,
        },
        {
          timeframe: "7d",
          prediction: "up",
          confidence: 68,
          priceTarget: 48000,
          currentPrice: 45000,
          change: 6.67,
        },
        {
          timeframe: "30d",
          prediction: "down",
          confidence: 54,
          priceTarget: 42000,
          currentPrice: 45000,
          change: -6.67,
        },
      ];

      setPredictions(mockPredictions);
    } finally {
      setLoading(false);
    }
  };

  const getPredictionColor = (prediction: string) => {
    return prediction === "up" ? "text-green-500" : "text-red-500";
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 70) return "text-green-500";
    if (confidence >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-500" />
          AI Price Prediction
        </CardTitle>
        <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="BTC">Bitcoin</SelectItem>
            <SelectItem value="ETH">Ethereum</SelectItem>
            <SelectItem value="ADA">Cardano</SelectItem>
            <SelectItem value="SOL">Solana</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {predictions.map((pred, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {pred.timeframe}
                    </span>
                    <Badge
                      variant="outline"
                      className={getPredictionColor(pred.prediction)}
                    >
                      {pred.prediction.toUpperCase()}
                    </Badge>
                  </div>
                  <span
                    className={`text-sm font-medium ${getConfidenceColor(pred.confidence)}`}
                  >
                    {pred.confidence}% confidence
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-muted-foreground">Target: </span>
                    <span className="font-medium">
                      ${pred.priceTarget.toLocaleString()}
                    </span>
                  </div>
                  <div className={getPredictionColor(pred.prediction)}>
                    {pred.change > 0 ? "+" : ""}
                    {pred.change.toFixed(2)}%
                  </div>
                </div>

                <Progress value={pred.confidence} className="mt-2 h-1" />
              </div>
            ))}

            <div className="text-xs text-muted-foreground mt-4 p-2 bg-muted/50 rounded">
              <AlertTriangle className="w-3 h-3 inline mr-1" />
              AI predictions are for informational purposes only. Always do your
              own research.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Auto Content Moderation
export const AutoContentModeration: React.FC = () => {
  const [moderationResults, setModerationResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const checkContent = async (content: string) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulate AI moderation results
      const results = [
        {
          type: "toxicity",
          score: 0.12,
          threshold: 0.8,
          status: "approved",
          message: "Content appears to be non-toxic",
        },
        {
          type: "spam",
          score: 0.05,
          threshold: 0.6,
          status: "approved",
          message: "No spam indicators detected",
        },
        {
          type: "profanity",
          score: 0.02,
          threshold: 0.7,
          status: "approved",
          message: "No inappropriate language found",
        },
      ];

      setModerationResults(results);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-500" />
          AI Content Moderation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Textarea
            placeholder="Enter content to check..."
            onChange={(e) => {
              if (e.target.value.length > 10) {
                checkContent(e.target.value);
              }
            }}
          />
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Analyzing content...
          </div>
        )}

        {moderationResults.length > 0 && (
          <div className="space-y-2">
            {moderationResults.map((result, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 border rounded"
              >
                <div className="flex items-center gap-2">
                  {result.status === "approved" ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm capitalize">{result.type}</span>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">
                    Score: {result.score.toFixed(2)} / {result.threshold}
                  </div>
                  <div className="text-xs">{result.message}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// AI Personal Assistant from separate component
import AIPersonalAssistantDashboard from "./AIPersonalAssistant";

export default {
  SmartFeedCuration,
  AIContentAssistant,
  SmartPricePrediction,
  AutoContentModeration,
  AIPersonalAssistant: AIPersonalAssistantDashboard,
};
