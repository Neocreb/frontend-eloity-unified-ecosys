
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, MessageSquare, Heart, Share, Hash } from 'lucide-react';
import { aiContentService, UserScores } from '@/services/aiContentService';

interface ContentAnalyticsDashboardProps {
  userId: string;
}

const ContentAnalyticsDashboard: React.FC<ContentAnalyticsDashboardProps> = ({ userId }) => {
  const [userScores, setUserScores] = useState<UserScores | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserScores();
  }, [userId]);

  const loadUserScores = async () => {
    try {
      const scores = await aiContentService.getUserScores(userId);
      setUserScores(scores);
    } catch (error) {
      console.error('Error loading user scores:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !userScores) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-16 bg-gray-100 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const scoreData = [
    { name: 'Trading', value: userScores.trading_score, color: '#8884d8' },
    { name: 'Content', value: userScores.content_score, color: '#82ca9d' },
    { name: 'Reputation', value: userScores.reputation_score, color: '#ffc658' },
    { name: 'Risk', value: userScores.risk_score, color: '#ff7c7c' }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-blue-600';
    if (score >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.8) return 'Excellent';
    if (score >= 0.6) return 'Good';
    if (score >= 0.4) return 'Average';
    return 'Needs Improvement';
  };

  return (
    <div className="space-y-6">
      {/* Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trading Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">
              {Math.round(userScores.trading_score * 100)}%
            </div>
            <p className={`text-sm ${getScoreColor(userScores.trading_score)}`}>
              {getScoreLabel(userScores.trading_score)}
            </p>
            <Progress 
              value={userScores.trading_score * 100} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Content Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">
              {Math.round(userScores.content_score * 100)}%
            </div>
            <p className={`text-sm ${getScoreColor(userScores.content_score)}`}>
              {getScoreLabel(userScores.content_score)}
            </p>
            <Progress 
              value={userScores.content_score * 100} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Reputation Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">
              {Math.round(userScores.reputation_score * 100)}%
            </div>
            <p className={`text-sm ${getScoreColor(userScores.reputation_score)}`}>
              {getScoreLabel(userScores.reputation_score)}
            </p>
            <Progress 
              value={userScores.reputation_score * 100} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Share className="h-4 w-4" />
              Risk Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">
              {Math.round(userScores.risk_score * 100)}%
            </div>
            <p className={`text-sm ${getScoreColor(1 - userScores.risk_score)}`}>
              {userScores.risk_score < 0.2 ? 'Low Risk' : 
               userScores.risk_score < 0.5 ? 'Medium Risk' : 'High Risk'}
            </p>
            <Progress 
              value={userScores.risk_score * 100} 
              className="mt-2" 
            />
          </CardContent>
        </Card>
      </div>

      {/* Score Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Score Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={scoreData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${Math.round(value * 100)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {scoreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>AI Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {userScores.content_score < 0.5 && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-800">
                Improve Content Quality
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Try adding more engaging content with images and relevant hashtags.
              </p>
            </div>
          )}
          
          {userScores.trading_score < 0.5 && (
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-green-800">
                Enhance Trading Performance
              </p>
              <p className="text-xs text-green-600 mt-1">
                Complete more successful trades and maintain good ratings.
              </p>
            </div>
          )}
          
          {userScores.reputation_score < 0.5 && (
            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm font-medium text-yellow-800">
                Build Your Reputation
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                Engage more with the community and provide valuable content.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentAnalyticsDashboard;
