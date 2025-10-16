// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bot,
  Brain,
  Lightbulb,
  MessageSquare,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Settings,
  Sparkles,
  Zap,
  Target,
  TrendingUp,
  FileText,
  Clock,
  DollarSign,
  Star,
  Users,
  Briefcase,
  Award,
  Shield,
  Rocket,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Copy,
  Refresh,
  Share2,
  Download,
  Upload,
  Filter,
  Search,
  MoreHorizontal,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  Bookmark,
  Play,
  Pause,
  StopCircle,
  RotateCcw,
  Wand2,
  GraduationCap,
  Compass,
  MapPin,
} from "lucide-react";

interface AIMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestions?: AISuggestion[];
  tools?: AITool[];
  metadata?: Record<string, any>;
}

interface AISuggestion {
  id: string;
  title: string;
  description: string;
  action: string;
  confidence: number;
  icon: React.ReactNode;
}

interface AITool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: "analysis" | "creation" | "optimization" | "research";
  action: () => void;
}

interface AIInsight {
  id: string;
  type: "opportunity" | "warning" | "tip" | "trend" | "recommendation";
  title: string;
  description: string;
  impact: "low" | "medium" | "high";
  actionable: boolean;
  data?: any;
  timestamp: Date;
}

interface AITemplate {
  id: string;
  name: string;
  description: string;
  category:
    | "proposal"
    | "communication"
    | "project_plan"
    | "contract"
    | "marketing";
  content: string;
  variables: string[];
  usageCount: number;
}

const AIAssistantSystem: React.FC = () => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [templates, setTemplates] = useState<AITemplate[]>([]);
  const [aiSettings, setAiSettings] = useState({
    voice: true,
    autoSuggestions: true,
    proactiveInsights: true,
    learningMode: true,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeAISystem();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeAISystem = () => {
    // Initialize with welcome message
    const welcomeMessage: AIMessage = {
      id: "welcome",
      type: "assistant",
      content:
        "👋 Hi there! I'm your AI assistant, ready to help optimize your freelancing success. I can help with proposal writing, project analysis, pricing strategies, and much more. What would you like to work on today?",
      timestamp: new Date(),
      suggestions: [
        {
          id: "analyze_profile",
          title: "Analyze My Profile",
          description:
            "Get insights on how to improve your profile performance",
          action: "analyze_profile",
          confidence: 0.95,
          icon: <Target className="w-4 h-4" />,
        },
        {
          id: "pricing_help",
          title: "Pricing Strategy",
          description: "Get personalized pricing recommendations",
          action: "pricing_strategy",
          confidence: 0.9,
          icon: <DollarSign className="w-4 h-4" />,
        },
        {
          id: "proposal_tips",
          title: "Proposal Writing",
          description: "Improve your proposal success rate",
          action: "proposal_writing",
          confidence: 0.88,
          icon: <FileText className="w-4 h-4" />,
        },
      ],
    };

    setMessages([welcomeMessage]);
    initializeInsights();
    initializeTemplates();
  };

  const initializeInsights = () => {
    const sampleInsights: AIInsight[] = [
      {
        id: "insight_1",
        type: "opportunity",
        title: "High-Demand Skill Gap",
        description:
          "React Native projects are 40% more abundant in your category with 25% higher average rates",
        impact: "high",
        actionable: true,
        data: { skill: "React Native", demand: "+40%", rate_increase: "+25%" },
        timestamp: new Date(),
      },
      {
        id: "insight_2",
        type: "recommendation",
        title: "Optimize Profile Keywords",
        description:
          'Adding "TypeScript" and "Next.js" to your skills could increase profile views by 30%',
        impact: "medium",
        actionable: true,
        data: { keywords: ["TypeScript", "Next.js"], impact: "+30% views" },
        timestamp: new Date(),
      },
      {
        id: "insight_3",
        type: "trend",
        title: "Market Trend Alert",
        description:
          "AI/ML projects are trending up 60% this quarter in your skill range",
        impact: "high",
        actionable: false,
        data: { trend: "AI/ML", growth: "+60%", timeframe: "this quarter" },
        timestamp: new Date(),
      },
      {
        id: "insight_4",
        type: "tip",
        title: "Response Time Optimization",
        description:
          "Freelancers who respond within 2 hours get 45% more project invitations",
        impact: "medium",
        actionable: true,
        data: {
          metric: "response_time",
          threshold: "2 hours",
          impact: "+45% invitations",
        },
        timestamp: new Date(),
      },
    ];

    setInsights(sampleInsights);
  };

  const initializeTemplates = () => {
    const sampleTemplates: AITemplate[] = [
      {
        id: "template_1",
        name: "Professional Proposal",
        description:
          "High-converting proposal template for web development projects",
        category: "proposal",
        content: `Dear {{CLIENT_NAME}},

Thank you for considering me for your {{PROJECT_TYPE}} project. With {{YEARS_EXPERIENCE}} years of experience in {{SKILLS}}, I'm confident I can deliver exceptional results.

Project Understanding:
{{PROJECT_UNDERSTANDING}}

My Approach:
{{APPROACH}}

Timeline: {{TIMELINE}}
Budget: {{BUDGET}}

I'd love to discuss this further. When would be a good time for a brief call?

Best regards,
{{YOUR_NAME}}`,
        variables: [
          "CLIENT_NAME",
          "PROJECT_TYPE",
          "YEARS_EXPERIENCE",
          "SKILLS",
          "PROJECT_UNDERSTANDING",
          "APPROACH",
          "TIMELINE",
          "BUDGET",
          "YOUR_NAME",
        ],
        usageCount: 47,
      },
      {
        id: "template_2",
        name: "Project Milestone Update",
        description:
          "Keep clients informed with professional milestone updates",
        category: "communication",
        content: `Hi {{CLIENT_NAME}},

I wanted to update you on the progress of {{PROJECT_NAME}}.

Completed in this milestone:
{{COMPLETED_TASKS}}

Current Status: {{STATUS}}
Next Steps: {{NEXT_STEPS}}

Expected completion: {{COMPLETION_DATE}}

Please let me know if you have any questions or feedback.

Best,
{{YOUR_NAME}}`,
        variables: [
          "CLIENT_NAME",
          "PROJECT_NAME",
          "COMPLETED_TASKS",
          "STATUS",
          "NEXT_STEPS",
          "COMPLETION_DATE",
          "YOUR_NAME",
        ],
        usageCount: 32,
      },
      {
        id: "template_3",
        name: "Rate Increase Notification",
        description:
          "Professional way to communicate rate increases to existing clients",
        category: "communication",
        content: `Dear {{CLIENT_NAME}},

I hope you're doing well. I wanted to reach out regarding an important update to my service rates.

Due to increased demand and expanded expertise in {{SKILL_AREAS}}, I'll be updating my rates to {{NEW_RATE}} effective {{EFFECTIVE_DATE}}.

I truly value our working relationship and the trust you've placed in me. I'm committed to continuing to deliver the high-quality work you've come to expect.

I'm happy to discuss this change and answer any questions you might have.

Thank you for your understanding.

Best regards,
{{YOUR_NAME}}`,
        variables: [
          "CLIENT_NAME",
          "SKILL_AREAS",
          "NEW_RATE",
          "EFFECTIVE_DATE",
          "YOUR_NAME",
        ],
        usageCount: 15,
      },
    ];

    setTemplates(sampleTemplates);
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: "user",
      content: currentMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentMessage("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(currentMessage);
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string): AIMessage => {
    const lowerInput = userInput.toLowerCase();

    let response = "";
    let suggestions: AISuggestion[] = [];
    let tools: AITool[] = [];

    if (lowerInput.includes("proposal") || lowerInput.includes("bid")) {
      response =
        "I can help you create a winning proposal! Based on successful patterns I've analyzed, here are key elements that increase your chances of winning projects by up to 60%:\n\n✅ Personal connection with the client's needs\n✅ Clear project breakdown and timeline\n✅ Relevant portfolio examples\n✅ Competitive but confident pricing\n\nWould you like me to help you craft a proposal for a specific project?";

      suggestions = [
        {
          id: "create_proposal",
          title: "Create Proposal",
          description: "Use AI-powered proposal generator",
          action: "create_proposal",
          confidence: 0.92,
          icon: <FileText className="w-4 h-4" />,
        },
        {
          id: "analyze_job",
          title: "Analyze Job Post",
          description: "Get insights on job requirements",
          action: "analyze_job",
          confidence: 0.88,
          icon: <Brain className="w-4 h-4" />,
        },
      ];
    } else if (lowerInput.includes("price") || lowerInput.includes("rate")) {
      response =
        "Pricing strategy is crucial for freelance success! Based on market data and your profile, here's what I recommend:\n\n💰 Your skills are currently valued at $45-85/hour in the market\n📈 React developers with 3+ years earn 25% more\n🎯 Consider value-based pricing for complex projects\n⚡ Fast turnaround adds 15-20% premium\n\nI can provide personalized pricing recommendations based on specific project details.";

      suggestions = [
        {
          id: "pricing_calculator",
          title: "Pricing Calculator",
          description: "Calculate optimal project rates",
          action: "pricing_calculator",
          confidence: 0.95,
          icon: <DollarSign className="w-4 h-4" />,
        },
        {
          id: "market_analysis",
          title: "Market Analysis",
          description: "View current market rates",
          action: "market_analysis",
          confidence: 0.9,
          icon: <TrendingUp className="w-4 h-4" />,
        },
      ];
    } else if (
      lowerInput.includes("profile") ||
      lowerInput.includes("optimize")
    ) {
      response =
        "Let me analyze your profile optimization opportunities! Here's what I found:\n\n🔍 Profile Strength: 89/100 (Excellent!)\n📊 Keyword optimization: 75% effective\n⭐ Response rate: 95% (Top 10%)\n📈 Conversion potential: +30% with small tweaks\n\nKey recommendations:\n• Add 'TypeScript' and 'Next.js' to skills\n• Include more specific project outcomes\n• Update portfolio with recent work";

      suggestions = [
        {
          id: "profile_audit",
          title: "Full Profile Audit",
          description: "Comprehensive profile analysis",
          action: "profile_audit",
          confidence: 0.93,
          icon: <Target className="w-4 h-4" />,
        },
        {
          id: "keyword_optimization",
          title: "Keyword Optimization",
          description: "Improve search visibility",
          action: "keyword_optimization",
          confidence: 0.87,
          icon: <Search className="w-4 h-4" />,
        },
      ];
    } else {
      response =
        "I'm here to help with your freelancing success! I can assist with:\n\n🎯 Proposal writing and optimization\n💰 Pricing strategy and rate calculations\n📈 Profile optimization and SEO\n🔍 Market analysis and trends\n📋 Project management and planning\n💬 Client communication templates\n\nWhat specific challenge are you facing today?";

      suggestions = [
        {
          id: "general_tips",
          title: "Success Tips",
          description: "Get personalized freelancing advice",
          action: "general_tips",
          confidence: 0.85,
          icon: <Lightbulb className="w-4 h-4" />,
        },
        {
          id: "market_opportunities",
          title: "Market Opportunities",
          description: "Find trending opportunities",
          action: "market_opportunities",
          confidence: 0.82,
          icon: <Compass className="w-4 h-4" />,
        },
      ];
    }

    return {
      id: Date.now().toString(),
      type: "assistant",
      content: response,
      timestamp: new Date(),
      suggestions,
      tools,
    };
  };

  const handleSuggestionClick = (suggestion: AISuggestion) => {
    // Handle suggestion actions
    const responseMessage: AIMessage = {
      id: Date.now().toString(),
      type: "assistant",
      content: `Great choice! I'm initiating ${suggestion.title.toLowerCase()}. This typically helps freelancers improve their ${suggestion.action.replace("_", " ")} by ${Math.round(suggestion.confidence * 100)}%. Let me gather the relevant data...`,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, responseMessage]);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "opportunity":
        return <Target className="w-5 h-5 text-green-500" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "tip":
        return <Lightbulb className="w-5 h-5 text-blue-500" />;
      case "trend":
        return <TrendingUp className="w-5 h-5 text-purple-500" />;
      case "recommendation":
        return <Sparkles className="w-5 h-5 text-orange-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "border-l-green-500 bg-green-50";
      case "medium":
        return "border-l-yellow-500 bg-yellow-50";
      case "low":
        return "border-l-blue-500 bg-blue-50";
      default:
        return "border-l-gray-300";
    }
  };

  const AIChat = () => {
    return (
      <div className="flex flex-col h-[600px]">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] ${message.type === "user" ? "order-2" : "order-1"}`}
                >
                  {message.type === "assistant" && (
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src="/ai-avatar.png" />
                        <AvatarFallback>
                          <Bot className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-600">
                        AI Assistant
                      </span>
                    </div>
                  )}

                  <div
                    className={`rounded-lg p-3 ${
                      message.type === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>

                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.suggestions.map((suggestion) => (
                        <Button
                          key={suggestion.id}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2 w-full justify-start"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion.icon}
                          <div className="text-left">
                            <div className="font-medium">
                              {suggestion.title}
                            </div>
                            <div className="text-xs text-gray-600">
                              {suggestion.description}
                            </div>
                          </div>
                          <Badge variant="outline" className="ml-auto">
                            {Math.round(suggestion.confidence * 100)}%
                          </Badge>
                        </Button>
                      ))}
                    </div>
                  )}

                  <div className="text-xs text-gray-500 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-3">
                  <Bot className="w-4 h-4" />
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Ask me anything about freelancing..."
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1"
            />
            <Button
              onClick={() => setIsListening(!isListening)}
              variant="outline"
              className={isListening ? "bg-red-100 text-red-600" : ""}
            >
              {isListening ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!currentMessage.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const AIInsights = () => {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">AI-Powered Insights</h3>
          <Button variant="outline" size="sm">
            <Refresh className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="space-y-3">
          {insights.map((insight) => (
            <Card
              key={insight.id}
              className={`border-l-4 ${getImpactColor(insight.impact)}`}
            >
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{insight.title}</h4>
                      <Badge
                        variant="outline"
                        className={`capitalize ${
                          insight.impact === "high"
                            ? "text-green-600"
                            : insight.impact === "medium"
                              ? "text-yellow-600"
                              : "text-blue-600"
                        }`}
                      >
                        {insight.impact} impact
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {insight.description}
                    </p>

                    {insight.data && (
                      <div className="text-xs text-gray-500">
                        {Object.entries(insight.data).map(([key, value]) => (
                          <span key={key} className="mr-3">
                            {key.replace("_", " ")}: {String(value)}
                          </span>
                        ))}
                      </div>
                    )}

                    {insight.actionable && (
                      <Button size="sm" className="mt-2">
                        Take Action
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const AITemplates = () => {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Smart Templates</h3>
          <div className="flex gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="proposal">Proposals</SelectItem>
                <SelectItem value="communication">Communication</SelectItem>
                <SelectItem value="project_plan">Project Plans</SelectItem>
                <SelectItem value="contract">Contracts</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <Card
              key={template.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
            >
              <CardContent className="pt-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">{template.name}</h4>
                  <Badge variant="outline" className="capitalize">
                    {template.category.replace("_", " ")}
                  </Badge>
                </div>

                <p className="text-sm text-gray-600 mb-3">
                  {template.description}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>Used {template.usageCount} times</span>
                  <span>{template.variables.length} variables</span>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    Use Template
                  </Button>
                  <Button size="sm" variant="outline">
                    <Eye className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const AISettings = () => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>AI Assistant Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Voice Responses</Label>
                <p className="text-sm text-gray-600">
                  Enable text-to-speech for AI responses
                </p>
              </div>
              <Switch
                checked={aiSettings.voice}
                onCheckedChange={(checked) =>
                  setAiSettings((prev) => ({ ...prev, voice: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Auto Suggestions</Label>
                <p className="text-sm text-gray-600">
                  Show contextual suggestions automatically
                </p>
              </div>
              <Switch
                checked={aiSettings.autoSuggestions}
                onCheckedChange={(checked) =>
                  setAiSettings((prev) => ({
                    ...prev,
                    autoSuggestions: checked,
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Proactive Insights</Label>
                <p className="text-sm text-gray-600">
                  Receive AI-generated insights and recommendations
                </p>
              </div>
              <Switch
                checked={aiSettings.proactiveInsights}
                onCheckedChange={(checked) =>
                  setAiSettings((prev) => ({
                    ...prev,
                    proactiveInsights: checked,
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Learning Mode</Label>
                <p className="text-sm text-gray-600">
                  Allow AI to learn from your preferences and patterns
                </p>
              </div>
              <Switch
                checked={aiSettings.learningMode}
                onCheckedChange={(checked) =>
                  setAiSettings((prev) => ({ ...prev, learningMode: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Capabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border rounded-lg text-center">
                <Brain className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <h4 className="font-medium">Smart Analysis</h4>
                <p className="text-xs text-gray-600">
                  Profile and market analysis
                </p>
              </div>

              <div className="p-3 border rounded-lg text-center">
                <Wand2 className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <h4 className="font-medium">Content Generation</h4>
                <p className="text-xs text-gray-600">Proposals and templates</p>
              </div>

              <div className="p-3 border rounded-lg text-center">
                <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <h4 className="font-medium">Market Insights</h4>
                <p className="text-xs text-gray-600">
                  Trends and opportunities
                </p>
              </div>

              <div className="p-3 border rounded-lg text-center">
                <Target className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <h4 className="font-medium">Strategy Optimization</h4>
                <p className="text-xs text-gray-600">Pricing and positioning</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bot className="w-8 h-8 text-blue-500" />
            AI Assistant
          </h2>
          <p className="text-gray-600">
            Your intelligent freelancing companion
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <GraduationCap className="w-4 h-4 mr-2" />
            AI Training
          </Button>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="chat">AI Chat</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="chat">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                AI-Powered Freelancing Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <AIChat />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <AIInsights />
        </TabsContent>

        <TabsContent value="templates">
          <AITemplates />
        </TabsContent>

        <TabsContent value="settings">
          <AISettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIAssistantSystem;
