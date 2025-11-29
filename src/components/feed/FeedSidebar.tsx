import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Award, Users, Gift, Star, Plus, Loader2 } from "lucide-react";
import { useQuickLinksStats, useTrendingTopicsData } from "@/hooks/use-sidebar-widgets";
import { useAuth } from "@/contexts/AuthContext";

interface TrendingTopic {
  id: string;
  topic: string;
  category?: string;
  posts?: number;
  trend_score?: number;
}

const FeedSidebar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const quickLinks = useQuickLinksStats();
  const { data: trendingTopics = [], isLoading: trendsLoading } = useTrendingTopicsData();

  const getUserRewards = () => {
    // This would be fetched from user context or API
    // For now, return mock data structure
    return {
      level: "Bronze",
      points: 2450,
      nextLevel: 5000,
      progress: 2450 / 5000,
    };
  };

  const handleTrendingClick = (topic: string) => {
    // Navigate to search results for this topic
    navigate(`/app/search?q=${encodeURIComponent(topic)}&type=trending`);
  };

  const handleQuickLinkClick = (route: string) => {
    navigate(route);
  };

  const rewards = getUserRewards();

  return (
    <div className="space-y-6">
      {/* Quick Links Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Quick Links
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          {quickLinks.map((link, index) => (
            <button
              key={index}
              onClick={() => handleQuickLinkClick(link.route)}
              className="w-full flex items-center justify-between p-2 hover:bg-muted rounded-lg transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <link.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{link.name}</span>
              </div>
              {link.count !== null && link.count !== undefined && link.count > 0 && (
                <Badge variant="secondary" className="text-xs px-2">
                  {link.count}
                </Badge>
              )}
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Trending Topics Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trending Now
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {trendsLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : trendingTopics && trendingTopics.length > 0 ? (
            trendingTopics.map((trend: TrendingTopic, index: number) => (
              <button
                key={trend.id || index}
                onClick={() => handleTrendingClick(trend.topic)}
                className="block w-full text-left space-y-1 p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <div className="text-sm font-medium hover:underline">
                  #{trend.topic}
                </div>
                <div className="flex text-xs text-muted-foreground gap-1 flex-wrap">
                  {trend.category && (
                    <>
                      <span>{trend.category}</span>
                      <span>•</span>
                    </>
                  )}
                  {trend.posts && <span>{trend.posts.toLocaleString()} posts</span>}
                  {trend.trend_score && (
                    <>
                      <span>•</span>
                      <span className="text-green-600">+{Math.round(trend.trend_score)}%</span>
                    </>
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <p className="text-sm">No trending topics available</p>
            </div>
          )}
          <Button variant="ghost" size="sm" className="w-full text-xs mt-2">
            Show more
          </Button>
        </CardContent>
      </Card>

      {/* Rewards Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Award className="h-4 w-4" />
            Your Rewards
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-eloity-primary to-eloity-accent flex items-center justify-center flex-shrink-0">
                <Star className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium">{rewards.level} Level</div>
                <div className="text-xs text-muted-foreground">{rewards.points.toLocaleString()} points</div>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1 flex-shrink-0"
              onClick={() => navigate("/app/rewards")}
            >
              <Gift className="h-3 w-3" />
              Redeem
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span>Progress to Next Level</span>
                <span className="font-medium">
                  {rewards.points.toLocaleString()} / {Math.round(rewards.nextLevel).toLocaleString()}
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-eloity-primary to-eloity-accent transition-all duration-500"
                  style={{ width: `${rewards.progress * 100}%` }}
                />
              </div>
            </div>

            <div className="rounded-md border p-3 text-xs space-y-2">
              <div className="font-medium">Earn more points!</div>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Plus className="h-3 w-3 text-eloity-accent flex-shrink-0" />
                  <span>Create a post (+10 points)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Plus className="h-3 w-3 text-eloity-accent flex-shrink-0" />
                  <span>Make a purchase (+50 points)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Plus className="h-3 w-3 text-eloity-accent flex-shrink-0" />
                  <span>Refer a friend (+200 points)</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedSidebar;
