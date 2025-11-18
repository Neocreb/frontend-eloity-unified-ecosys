// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  Eye,
  Heart,
  Share2,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface PerformanceInsight {
  id: string;
  title: string;
  description: string;
  currentValue: number;
  previousValue: number;
  change: number;
  trend: "up" | "down" | "neutral";
  priority: "high" | "medium" | "low";
  actionable: boolean;
  recommendation?: string;
}

interface AIPerformanceData {
  overallScore: number;
  insights: PerformanceInsight[];
  predictions: {
    nextPeriod: string;
    predictedGrowth: number;
    confidence: number;
  };
}

const AIPerformanceInsights: React.FC = () => {
  const { user } = useAuth();
  const [performanceData, setPerformanceData] = useState<AIPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      // Simulate API call to AI performance service
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Mock data - in a real app, this would come from an API
      const mockData: AIPerformanceData = {
        overallScore: 87,
        predictions: {
          nextPeriod: "Next 30 days",
          predictedGrowth: 12.5,
          confidence: 84,
        },
        insights: [
          {
            id: "1",
            title: "Content Engagement",
            description: "Your video content is performing 23% above average for your niche",
            currentValue: 85,
            previousValue: 72,
            change: 18.1,
            trend: "up",
            priority: "high",
            actionable: true,
            recommendation: "Continue creating similar content and post during peak hours"
          },
          {
            id: "2",
            title: "Audience Growth",
            description: "Follower count increased by 342 new followers this week",
            currentValue: 12450,
            previousValue: 12108,
            change: 2.8,
            trend: "up",
            priority: "medium",
            actionable: true,
            recommendation: "Engage more with comments to boost retention"
          },
          {
            id: "3",
            title: "Revenue Optimization",
            description: "Potential to increase earnings by 15% with suggested pricing adjustments",
            currentValue: 1250,
            previousValue: 1250,
            change: 0,
            trend: "neutral",
            priority: "high",
            actionable: true,
            recommendation: "Review marketplace pricing strategy for premium products"
          },
          {
            id: "4",
            title: "Content Consistency",
            description: "Posting frequency dropped 30% compared to last month",
            currentValue: 12,
            previousValue: 17,
            change: -30,
            trend: "down",
            priority: "high",
            actionable: true,
            recommendation: "Schedule content in advance to maintain consistency"
          },
          {
            id: "5",
            title: "Platform Utilization",
            description: "Underutilizing 3 platform features that could boost engagement",
            currentValue: 65,
            previousValue: 65,
            change: 0,
            trend: "neutral",
            priority: "medium",
            actionable: true,
            recommendation: "Explore Events and Rewards features to engage audience"
          }
        ]
      };
      
      setPerformanceData(mockData);
    } catch (error) {
      console.error("Failed to fetch AI performance insights:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPerformanceData();
    setRefreshing(false);
  };

  const getTrendIcon = (trend: "up" | "down" | "neutral") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Zap className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
          </CardContent>
        </Card>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-4/5 animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!performanceData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Unable to load insights</h3>
          <p className="text-gray-600 mb-4">We couldn't fetch your AI performance insights at the moment.</p>
          <Button onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Performance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              AI Performance Insights
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6">
            <div className="relative w-48 h-48 mb-6">
              <svg viewBox="0 0 36 36" className="w-full h-full">
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#eee"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#8B5CF6"
                  strokeWidth="3"
                  strokeDasharray={`${performanceData.overallScore}, 100`}
                />
                <text x="18" y="20.5" textAnchor="middle" fill="#8B5CF6" fontSize="8" fontWeight="bold">
                  {performanceData.overallScore}%
                </text>
              </svg>
            </div>
            <h3 className="text-xl font-bold">Overall Performance Score</h3>
            <p className="text-gray-600 text-center mt-2">
              Based on AI analysis of your content, engagement, and growth metrics
            </p>
            
            {performanceData.predictions && (
              <div className="mt-6 p-4 bg-purple-50 rounded-lg w-full">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-700 font-medium">{performanceData.predictions.nextPeriod}</p>
                    <p className="text-xs text-purple-600">AI Prediction</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-purple-700">
                      +{performanceData.predictions.predictedGrowth}%
                    </p>
                    <p className="text-xs text-purple-600">
                      {performanceData.predictions.confidence}% confidence
                    </p>
                  </div>
                </div>
                <Progress 
                  value={performanceData.predictions.confidence} 
                  className="mt-2" 
                  indicatorClassName="bg-purple-500" 
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {performanceData.insights.map((insight) => (
          <Card key={insight.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-start justify-between">
                <span className="flex items-center gap-2">
                  {getTrendIcon(insight.trend)}
                  {insight.title}
                </span>
                <Badge className={getPriorityColor(insight.priority)}>
                  {insight.priority}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{insight.description}</p>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">Current Value</span>
                <span className="font-medium">
                  {typeof insight.currentValue === 'number' && insight.currentValue > 1000 
                    ? `${(insight.currentValue / 1000).toFixed(1)}k` 
                    : insight.currentValue}
                </span>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">Change</span>
                <span className={`flex items-center gap-1 font-medium ${
                  insight.trend === "up" ? "text-green-600" : 
                  insight.trend === "down" ? "text-red-600" : "text-gray-600"
                }`}>
                  {getTrendIcon(insight.trend)}
                  {Math.abs(insight.change).toFixed(1)}%
                </span>
              </div>
              
              {insight.actionable && insight.recommendation && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Recommendation:</span> {insight.recommendation}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actionable Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-green-500" />
            Recommended Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceData.insights
              .filter(insight => insight.actionable)
              .slice(0, 3)
              .map((insight) => (
                <div key={`action-${insight.id}`} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="mt-0.5">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{insight.title}</h4>
                    <p className="text-sm text-gray-600">{insight.recommendation}</p>
                  </div>
                  <Button size="sm" variant="outline">Implement</Button>
                </div>
              ))
            }
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIPerformanceInsights;