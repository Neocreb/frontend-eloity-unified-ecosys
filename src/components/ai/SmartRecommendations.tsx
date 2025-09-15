
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Users, Hash } from 'lucide-react';
import { aiContentService, ContentRecommendation } from '@/services/aiContentService';
import { useToast } from '@/components/ui/use-toast';

interface SmartRecommendationsProps {
  userId: string;
  onRecommendationClick: (postId: string) => void;
}

const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({ 
  userId, 
  onRecommendationClick 
}) => {
  const [recommendations, setRecommendations] = useState<ContentRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadRecommendations();
  }, [userId]);

  const loadRecommendations = async () => {
    try {
      const data = await aiContentService.getContentRecommendations(userId, 10);
      setRecommendations(data);
    } catch (error) {
      console.error('Error loading recommendations:', error);
      toast({
        title: "Error loading recommendations",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRecommendationClick = async (recommendation: ContentRecommendation) => {
    // Mark as shown and clicked
    await aiContentService.markRecommendationShown(recommendation.id);
    await aiContentService.markRecommendationClicked(recommendation.id);
    
    onRecommendationClick(recommendation.post_id);
    
    // Remove from local state
    setRecommendations(prev => prev.filter(r => r.id !== recommendation.id));
  };

  const getRecommendationIcon = (reason?: string) => {
    if (reason?.includes('trending')) return <TrendingUp className="h-4 w-4" />;
    if (reason?.includes('similar users')) return <Users className="h-4 w-4" />;
    if (reason?.includes('hashtag')) return <Hash className="h-4 w-4" />;
    return <Sparkles className="h-4 w-4" />;
  };

  const getRecommendationColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-100 text-green-800';
    if (score >= 0.6) return 'bg-blue-100 text-blue-800';
    if (score >= 0.4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No recommendations available at the moment. 
            Interact with more content to get personalized suggestions!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((recommendation) => (
          <div
            key={recommendation.id}
            className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={() => handleRecommendationClick(recommendation)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getRecommendationIcon(recommendation.reason)}
                <span className="text-sm font-medium">Recommended Post</span>
              </div>
              <Badge className={getRecommendationColor(recommendation.score)}>
                {Math.round(recommendation.score * 100)}% match
              </Badge>
            </div>
            
            {recommendation.reason && (
              <p className="text-xs text-muted-foreground mb-2">
                {recommendation.reason}
              </p>
            )}
            
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                handleRecommendationClick(recommendation);
              }}
            >
              View Post
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SmartRecommendations;
