import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sparkles,
  TrendingUp,
  Users,
  Clock,
  Eye,
  ThumbsUp,
  Share2,
  MessageCircle,
  Star,
  Zap,
  Target,
  ArrowRight,
  RefreshCw,
  Filter,
} from "lucide-react";
import { aiRecommendationService } from "@/services/aiRecommendationService";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface SmartContentRecommendationsProps {
  contentType: "posts" | "videos" | "products" | "blogs" | "mixed";
  availableContent: any[];
  onContentSelect?: (content: any) => void;
  maxItems?: number;
  showReasons?: boolean;
  className?: string;
  layout?: "grid" | "list" | "carousel";
}

export function SmartContentRecommendations({
  contentType,
  availableContent,
  onContentSelect,
  maxItems = 6,
  showReasons = true,
  className,
  layout = "grid",
}: SmartContentRecommendationsProps) {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRecommendations();
  }, [contentType, availableContent, user?.id]);

  const loadRecommendations = async () => {
    if (!availableContent.length) {
      setLoading(false);
      return;
    }

    // For unauthenticated users, show basic recommendations
    if (!user?.id) {
      try {
        let recs: any[] = [];

        switch (contentType) {
          case "blogs":
            recs = availableContent
              .map((blog, index) => ({
                ...blog,
                id: blog.id || `blog-${index}-${Date.now()}`,
                aiScore: Math.floor(Math.random() * 50) + 50, // Random score 50-100
                reason: "Popular content",
              }))
              .sort((a, b) => b.aiScore - a.aiScore);
            break;
          default:
            recs = availableContent.slice(0, maxItems);
        }

        setRecommendations(recs.slice(0, maxItems));
      } catch (error) {
        console.error("Error loading basic recommendations:", error);
        setRecommendations(availableContent.slice(0, maxItems));
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      let recs: any[] = [];

      switch (contentType) {
        case "posts":
          recs = await aiRecommendationService.getPersonalizedPosts(
            user.id,
            availableContent,
          );
          break;
        case "videos":
          recs = await aiRecommendationService.getPersonalizedVideos(
            user.id,
            availableContent,
          );
          break;
        case "products":
          recs = await aiRecommendationService.getPersonalizedProducts(
            user.id,
            availableContent,
          );
          break;
        case "blogs":
          recs = availableContent
            .map((blog) => ({
              ...blog,
              aiScore: Math.floor(Math.random() * 100),
              reason: "Based on your interests",
            }))
            .sort((a, b) => b.aiScore - a.aiScore);
          break;
        case "mixed":
          recs = await aiRecommendationService.getSmartFeed(
            user.id,
            availableContent,
          );
          break;
        default:
          recs = availableContent.slice(0, maxItems);
      }

      setRecommendations(recs.slice(0, maxItems));
    } catch (error) {
      console.error("Error loading recommendations:", error);
      setRecommendations(availableContent.slice(0, maxItems));
    } finally {
      setLoading(false);
    }
  };

  const refreshRecommendations = async () => {
    setRefreshing(true);

    // Simulate AI refresh with slight delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await loadRecommendations();

    setRefreshing(false);
  };

  const handleContentClick = (content: any) => {
    // Track interaction for better recommendations
    if (user?.id) {
      aiRecommendationService.trackInteraction(user.id, {
        type: "view",
        contentId: content.id,
        contentType:
          contentType === "mixed"
            ? content.type || "post"
            : contentType.slice(0, -1),
        category: content.category,
        creatorId: content.author?.id || content.userId,
        timestamp: new Date(),
      });
    }

    onContentSelect?.(content);
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case "posts":
        return <MessageCircle className="h-4 w-4" />;
      case "videos":
        return <Eye className="h-4 w-4" />;
      case "products":
        return <Star className="h-4 w-4" />;
      case "blogs":
        return <Target className="h-4 w-4" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  const formatContentStats = (content: any) => {
    const stats = [];
    if (content.likes) stats.push(`${content.likes} likes`);
    if (content.views) stats.push(`${content.views} views`);
    if (content.comments) stats.push(`${content.comments} comments`);
    if (content.rating) stats.push(`${content.rating}⭐`);
    return stats.join(" • ");
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: maxItems }).map((_, i) => (
              <div
                key={`loading-skeleton-${i}-${Date.now()}`}
                className="animate-pulse"
              >
                <div className="bg-gray-200 rounded-lg h-40 mb-3"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations.length) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No recommendations available yet.</p>
            <p className="text-sm text-gray-400">
              Interact with more content to get personalized suggestions!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI Recommendations
            {getContentIcon(contentType)}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshRecommendations}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw
              className={cn("h-4 w-4", refreshing && "animate-spin")}
            />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "gap-4 p-2",
            layout === "grid" &&
              "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",
            layout === "list" && "space-y-6",
            layout === "carousel" && "flex gap-6 overflow-x-auto pb-4 px-2",
          )}
        >
          {recommendations.map((content, index) => (
            <div
              key={`${content.id}-${index}-${contentType}`}
              className={cn(
                "group cursor-pointer transition-all duration-200 hover:scale-105",
                layout === "carousel" && "flex-shrink-0 w-80",
              )}
              onClick={() => handleContentClick(content)}
            >
              <Card
                key={`card-${content.id}-${index}`}
                className="h-full border-0 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative">
                  {/* Content Image/Thumbnail */}
                  <div className="aspect-video bg-gradient-to-br from-purple-100 to-blue-100 rounded-t-lg overflow-hidden">
                    {content.thumbnail || content.image ? (
                      <img
                        src={content.thumbnail || content.image}
                        alt={content.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {getContentIcon(contentType)}
                      </div>
                    )}
                  </div>

                  {/* AI Score Badge */}
                  {content.aiScore && typeof content.aiScore === "number" && (
                    <Badge className="absolute top-2 right-2 bg-purple-500 text-white">
                      <Sparkles className="h-3 w-3 mr-1" />
                      {Math.round(content.aiScore)}%
                    </Badge>
                  )}

                  {/* Trending Badge */}
                  {typeof content.aiScore === "number" &&
                    content.aiScore > 90 && (
                      <Badge className="absolute top-2 left-2 bg-orange-500 text-white">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Hot
                      </Badge>
                    )}
                </div>

                <CardContent className="p-4 h-auto">
                  <div className="space-y-3 min-h-0">
                    {/* Title */}
                    <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-purple-600 transition-colors break-words">
                      {content.title || "Untitled Content"}
                    </h3>

                    {/* Author/Creator */}
                    {(content.author || content.creator) && (
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Avatar className="h-6 w-6 flex-shrink-0">
                          <AvatarImage
                            src={(content.author || content.creator)?.avatar}
                          />
                          <AvatarFallback className="text-xs">
                            {(
                              (content.author || content.creator)?.name || "U"
                            ).charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-600 truncate">
                          {(content.author || content.creator)?.name ||
                            "Unknown Author"}
                        </span>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="text-xs text-gray-500">
                      {formatContentStats(content)}
                    </div>

                    {/* AI Recommendation Reason */}
                    {showReasons &&
                      content.reason &&
                      typeof content.reason === "string" && (
                        <div className="flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                          <Target className="h-3 w-3" />
                          {content.reason}
                        </div>
                      )}

                    {/* Category */}
                    {content.category && (
                      <Badge variant="secondary" className="text-xs">
                        {typeof content.category === "string"
                          ? content.category
                          : content.category?.name || "Category"}
                      </Badge>
                    )}

                    {/* Time */}
                    {content.createdAt && (
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />
                        {new Date(content.createdAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* See More Button */}
        {recommendations.length >= maxItems && (
          <div className="text-center mt-6">
            <Button variant="outline" className="gap-2">
              See More Recommendations
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
