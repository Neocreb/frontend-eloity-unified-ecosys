import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DollarSign,
  Star,
  Lightbulb,
  Zap,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  BarChart3,
  LineChart,
  Activity,
  Coins,
  Camera,
  FileText,
  Video,
  Wand2,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  Plus,
  X,
  Settings,
  HelpCircle,
  Calendar,
  Mic,
  Send,
  BellRing,
  TrendingDown,
  AlertCircle,
  Crown,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  aiPersonalAssistantService,
  type AIInsight,
  type ContentSuggestion,
  type TradingInsight,
  type PerformanceAnalysis,
  type AIPersonalAssistant,
} from "@/services/aiPersonalAssistantService";

const AIPersonalAssistantDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [assistant, setAssistant] = useState<AIPersonalAssistant | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [contentSuggestions, setContentSuggestions] = useState<
    ContentSuggestion[]
  >([]);
  const [tradingInsights, setTradingInsights] = useState<TradingInsight[]>([]);
  const [performance, setPerformance] = useState<PerformanceAnalysis | null>(
    null,
  );
  const [dashboardSummary, setDashboardSummary] = useState<any>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      initializeAssistant();
    }
  }, [user?.id]);

  const initializeAssistant = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Initialize AI assistant
      const assistantData =
        await aiPersonalAssistantService.initializeAssistant(user.id);
      setAssistant(assistantData);

      // Load all AI data
      const [
        insightsData,
        contentData,
        tradingData,
        performanceData,
        summaryData,
      ] = await Promise.all([
        aiPersonalAssistantService.getAIInsights(user.id),
        aiPersonalAssistantService.generateContentSuggestions(user.id),
        aiPersonalAssistantService.generateTradingInsights(user.id),
        aiPersonalAssistantService.generatePerformanceAnalysis(user.id),
        aiPersonalAssistantService.getDashboardSummary(user.id),
      ]);

      setInsights(insightsData);
      setContentSuggestions(contentData);
      setTradingInsights(tradingData);
      setPerformance(performanceData);
      setDashboardSummary(summaryData);

      // Initialize chat with welcome message
      setChatMessages([
        {
          id: "welcome",
          type: "assistant",
          content: `Hi ${user.username || user.email}! I'm ${assistantData.name}, your AI personal assistant. I'm here to help you optimize your content, trading, and overall platform performance. What would you like to work on today?`,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Error initializing AI assistant:", error);
      toast({
        title: "Error",
        description: "Failed to initialize AI assistant",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !user?.id) return;

    const userMessage = {
      id: `msg-${Date.now()}`,
      type: "user",
      content: chatInput,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: `ai-${Date.now()}`,
        type: "assistant",
        content: generateAIResponse(chatInput),
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, aiResponse]);
    }, 1000);

    // Track interaction
    await aiPersonalAssistantService.trackInteraction(user.id, "chat", {
      message: chatInput,
    });
  };

  const generateAIResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes("content") || lowerInput.includes("post")) {
      return "I can help you create engaging content! Based on your recent performance, I'd recommend focusing on React tutorials or crypto analysis posts. Your Tuesday evening posts get the best engagement. Would you like me to generate specific content ideas?";
    }

    if (lowerInput.includes("trading") || lowerInput.includes("crypto")) {
      return "For trading insights, I'm currently tracking Bitcoin's support at $43,500 and Ethereum's strong fundamentals. Your trading content performs 2x better than general posts. Would you like detailed analysis on any specific assets?";
    }

    if (
      lowerInput.includes("analytics") ||
      lowerInput.includes("performance")
    ) {
      return "Your performance is trending upward! Views increased 18.5% this week, and engagement is up 12.3%. Your video content strategy is particularly effective. Would you like me to dive deeper into any specific metrics?";
    }

    if (lowerInput.includes("schedule") || lowerInput.includes("time")) {
      return "Based on your audience activity, the best times to post are Tuesday 7 PM for maximum engagement and Sunday 6 PM for crypto analysis. Avoid Saturday afternoons. Would you like me to create a posting schedule?";
    }

    return "I'm here to help with content creation, trading analysis, performance optimization, and scheduling. Just let me know what specific area you'd like to focus on, and I'll provide personalized recommendations based on your data!";
  };

  const acceptSuggestion = async (suggestionId: string, type: string) => {
    if (!user?.id) return;

    await aiPersonalAssistantService.trackInteraction(
      user.id,
      "accept_suggestion",
      {
        suggestionId,
        type,
      },
    );

    toast({
      title: "Suggestion accepted",
      description: "I'll learn from your preference for future recommendations",
    });
  };

  const dismissSuggestion = async (suggestionId: string, type: string) => {
    if (!user?.id) return;

    await aiPersonalAssistantService.trackInteraction(
      user.id,
      "dismiss_suggestion",
      {
        suggestionId,
        type,
      },
    );

    toast({
      title: "Suggestion dismissed",
      description: "I'll adjust future recommendations based on your feedback",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-500 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-500 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-green-500 bg-green-50 border-green-200";
      case "urgent":
        return "text-purple-500 bg-purple-50 border-purple-200";
      default:
        return "text-gray-500 bg-gray-50 border-gray-200";
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "content":
        return <FileText className="w-4 h-4" />;
      case "trading":
        return <Coins className="w-4 h-4" />;
      case "performance":
        return <BarChart3 className="w-4 h-4" />;
      case "opportunity":
        return <Target className="w-4 h-4" />;
      case "scheduling":
        return <Clock className="w-4 h-4" />;
      case "analytics":
        return <LineChart className="w-4 h-4" />;
      default:
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Bot className="w-12 h-12 mx-auto mb-4 text-purple-500 animate-pulse" />
          <p className="text-muted-foreground">
            Initializing your AI assistant...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Assistant Header */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 bg-purple-500">
                <AvatarFallback className="bg-purple-500 text-white">
                  <Bot className="w-6 h-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {assistant?.name || "Edith"}
                  <Crown className="w-4 h-4 text-yellow-500" />
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Your AI Personal Assistant • {assistant?.personality} mode
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm">
                <HelpCircle className="w-4 h-4 mr-2" />
                Help
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {dashboardSummary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {dashboardSummary.performance.views.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Total Views</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {dashboardSummary.performance.engagement.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Engagement</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${dashboardSummary.performance.earnings.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">Earnings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  +{dashboardSummary.performance.growth}
                </div>
                <div className="text-xs text-muted-foreground">
                  New Followers
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="trading">Trading</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="chat">AI Chat</TabsTrigger>
        </TabsList>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            {insights.map((insight) => (
              <Card
                key={insight.id}
                className={`border-l-4 ${getPriorityColor(insight.priority)}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        {getInsightIcon(insight.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">
                            {insight.title}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {insight.confidence}% confidence
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {insight.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="capitalize">{insight.type}</span>
                          <span>•</span>
                          <span className="capitalize">
                            {insight.priority} priority
                          </span>
                          <span>•</span>
                          <span>{insight.timestamp.toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {insight.actionable && (
                        <Button size="sm" variant="outline">
                          {insight.actionLabel}
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => dismissSuggestion(insight.id, "insight")}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Content Suggestions Tab */}
        <TabsContent value="content" className="space-y-4">
          <div className="grid gap-4">
            {contentSuggestions.map((suggestion) => (
              <Card
                key={suggestion.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="capitalize">
                            {suggestion.type}
                          </Badge>
                          <Badge variant="secondary">
                            {suggestion.confidence}% match
                          </Badge>
                        </div>
                        <h4 className="font-medium">{suggestion.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {suggestion.description}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            acceptSuggestion(suggestion.id, "content")
                          }
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Use Idea
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            dismissSuggestion(suggestion.id, "content")
                          }
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm">{suggestion.content}</p>
                    </div>

                    <div className="flex gap-1 flex-wrap">
                      {suggestion.hashtags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-medium text-purple-600">
                          {suggestion.estimatedReach.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Est. Reach
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-blue-600">
                          {suggestion.estimatedEngagement}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Est. Engagement
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-green-600">
                          {suggestion.bestTime}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Best Time
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-medium">Why post this:</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {suggestion.reasonsToPost.map((reason, index) => (
                          <li key={index} className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Trading Insights Tab */}
        <TabsContent value="trading" className="space-y-4">
          <div className="grid gap-4">
            {tradingInsights.map((insight) => (
              <Card
                key={insight.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold">
                          {insight.asset}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                insight.type === "buy"
                                  ? "default"
                                  : insight.type === "sell"
                                    ? "destructive"
                                    : "secondary"
                              }
                              className="uppercase"
                            >
                              {insight.type}
                            </Badge>
                            <Badge variant="outline">
                              {insight.confidence}% confidence
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {insight.riskLevel} risk
                            </Badge>
                          </div>
                          <h4 className="font-medium mt-1">
                            {insight.recommendation}
                          </h4>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        View Chart
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {insight.priceTarget && (
                        <div className="text-center">
                          <div className="font-medium text-green-600">
                            ${insight.priceTarget.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Price Target
                          </div>
                        </div>
                      )}
                      {insight.stopLoss && (
                        <div className="text-center">
                          <div className="font-medium text-red-600">
                            ${insight.stopLoss.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Stop Loss
                          </div>
                        </div>
                      )}
                      <div className="text-center">
                        <div className="font-medium text-blue-600 capitalize">
                          {insight.timeframe}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Timeframe
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-purple-600 capitalize">
                          {insight.riskLevel}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Risk Level
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-medium">Analysis:</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {insight.reasoning.map((reason, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1 h-1 rounded-full bg-current mt-2 flex-shrink-0" />
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <div className="font-medium">
                          {insight.marketAnalysis.technicalScore}
                        </div>
                        <div className="text-muted-foreground">Technical</div>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <div className="font-medium">
                          {insight.marketAnalysis.fundamentalScore}
                        </div>
                        <div className="text-muted-foreground">Fundamental</div>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <div className="font-medium">
                          {insight.marketAnalysis.sentimentScore}
                        </div>
                        <div className="text-muted-foreground">Sentiment</div>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <div className="font-medium text-green-600">●</div>
                        <div className="text-muted-foreground">Volume</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          {performance && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Eye className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                    <div className="text-2xl font-bold">
                      {performance.metrics.totalViews.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Total Views
                    </div>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-500">
                        +{performance.trends.viewsTrend}%
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <Heart className="w-8 h-8 mx-auto mb-2 text-red-500" />
                    <div className="text-2xl font-bold">
                      {performance.metrics.totalEngagement.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Engagement
                    </div>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-500">
                        +{performance.trends.engagementTrend}%
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <div className="text-2xl font-bold">
                      ${performance.metrics.totalEarnings.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Earnings
                    </div>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-500">
                        +{performance.trends.earningsTrend}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Goal Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {performance.goalProgress.map((goal, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{goal.goal}</span>
                        <span className="text-muted-foreground">
                          {goal.progress.toLocaleString()} /{" "}
                          {goal.target.toLocaleString()}
                        </span>
                      </div>
                      <Progress
                        value={(goal.progress / goal.target) * 100}
                        className="h-2"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">AI Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {performance.insights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{insight}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {performance.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{rec}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* AI Chat Tab */}
        <TabsContent value="chat" className="space-y-4">
          <Card className="h-96 flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-500" />
                Chat with {assistant?.name || "Edith"}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.type === "user"
                          ? "bg-purple-500 text-white"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleChatSubmit} className="flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask me anything about your content, trading, or performance..."
                  className="flex-1"
                />
                <Button type="submit" size="sm">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIPersonalAssistantDashboard;
