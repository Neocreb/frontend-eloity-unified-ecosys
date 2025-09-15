import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Bot,
  Sparkles,
  TrendingUp,
  FileText,
  Coins,
  Clock,
  ArrowRight,
  X,
  Lightbulb,
  Target,
  BarChart3,
  Zap,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import useAIAssistant from "@/hooks/use-ai-assistant";

interface AIInsightPreview {
  id: string;
  type: string;
  title: string;
  description: string;
  priority: string;
  actionUrl?: string;
}

const AIAssistantFAB: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const { insights, dashboardSummary, isLoading } = useAIAssistant();

  // Pages where the FAB should be visible
  const visiblePaths = [
    "/app/feed",
    "/app/create",
    "/app/crypto",
    "/app/marketplace",
    "/app/videos",
    "/app/profile",
  ];

  // Pages where the FAB should be hidden
  const hiddenPaths = ["/app/ai-assistant", "/app/settings", "/auth"];

  const shouldShow =
    visiblePaths.some((path) => location.pathname.startsWith(path)) &&
    !hiddenPaths.some((path) => location.pathname.startsWith(path));

  // Get high priority insights for preview
  const urgentInsights = insights
    .filter(
      (insight) => insight.priority === "urgent" || insight.priority === "high",
    )
    .slice(0, 3);

  useEffect(() => {
    // Show notification when there are new urgent insights
    if (urgentInsights.length > 0) {
      setShowNotification(true);
      const timer = setTimeout(() => setShowNotification(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [urgentInsights.length]);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Zap className="w-3 h-3 text-red-500" />;
      case "high":
        return <Target className="w-3 h-3 text-orange-500" />;
      case "medium":
        return <Clock className="w-3 h-3 text-yellow-500" />;
      default:
        return <Lightbulb className="w-3 h-3 text-blue-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "content":
        return <FileText className="w-3 h-3" />;
      case "trading":
        return <Coins className="w-3 h-3" />;
      case "performance":
        return <BarChart3 className="w-3 h-3" />;
      case "opportunity":
        return <Target className="w-3 h-3" />;
      case "scheduling":
        return <Clock className="w-3 h-3" />;
      default:
        return <Lightbulb className="w-3 h-3" />;
    }
  };

  if (!shouldShow || !user) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            size="lg"
            className={cn(
              "rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300",
              "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600",
              "relative overflow-hidden group",
              isOpen && "scale-110",
            )}
          >
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Bot icon */}
            <Bot className="w-6 h-6 relative z-10 text-white" />

            {/* Crown for premium feature */}
            <Crown className="w-3 h-3 absolute -top-1 -right-1 text-yellow-400" />

            {/* Notification dot */}
            {showNotification && urgentInsights.length > 0 && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {urgentInsights.length}
                </span>
              </div>
            )}

            {/* Pulse animation for notifications */}
            {showNotification && (
              <div className="absolute inset-0 rounded-full border-2 border-purple-400 animate-ping" />
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-80 p-0 mr-6 mb-2"
          side="top"
          align="end"
          sideOffset={8}
        >
          <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-purple-900">AI Assistant</h3>
                <Crown className="w-4 h-4 text-yellow-500" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            <p className="text-xs text-purple-700 mt-1">
              Your personal AI companion for optimized performance
            </p>
          </div>

          <div className="p-4 space-y-4">
            {/* Quick Stats */}
            {dashboardSummary && (
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-2 bg-purple-50 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">
                    {dashboardSummary.performance?.views?.toLocaleString() ||
                      "0"}
                  </div>
                  <div className="text-xs text-purple-700">Views</div>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">
                    $
                    {dashboardSummary.performance?.earnings?.toFixed(2) ||
                      "0.00"}
                  </div>
                  <div className="text-xs text-blue-700">Earnings</div>
                </div>
              </div>
            )}

            {/* Urgent Insights */}
            {urgentInsights.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  Urgent Insights
                </h4>
                <div className="space-y-2">
                  {urgentInsights.map((insight) => (
                    <div
                      key={insight.id}
                      className="p-2 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => {
                        if (insight.actionUrl) {
                          navigate(insight.actionUrl);
                        }
                        setIsOpen(false);
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex items-center gap-1 mt-0.5">
                          {getPriorityIcon(insight.priority)}
                          {getTypeIcon(insight.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium line-clamp-1">
                            {insight.title}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {insight.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-auto p-2 flex flex-col items-center gap-1"
                  onClick={() => {
                    navigate("/app/freelance/post-job");
                    setIsOpen(false);
                  }}
                >
                  <FileText className="w-4 h-4" />
                  <span className="text-xs">Create</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-auto p-2 flex flex-col items-center gap-1"
                  onClick={() => {
                    navigate("/app/crypto");
                    setIsOpen(false);
                  }}
                >
                  <Coins className="w-4 h-4" />
                  <span className="text-xs">Trade</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-auto p-2 flex flex-col items-center gap-1"
                  onClick={() => {
                    navigate("/app/analytics");
                    setIsOpen(false);
                  }}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-xs">Analytics</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-auto p-2 flex flex-col items-center gap-1"
                  onClick={() => {
                    navigate("/app/unified-creator-studio");
                    setIsOpen(false);
                  }}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs">Studio</span>
                </Button>
              </div>
            </div>

            {/* Open Full Assistant */}
            <Button
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              onClick={() => {
                navigate("/app/ai-assistant");
                setIsOpen(false);
              }}
            >
              Open AI Assistant
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-4">
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  Loading insights...
                </div>
              </div>
            )}

            {/* No Insights State */}
            {!isLoading && urgentInsights.length === 0 && (
              <div className="text-center py-4">
                <Bot className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No urgent insights right now. Check back later!
                </p>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default AIAssistantFAB;
