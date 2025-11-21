import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Brain,
  TrendingUp,
  Plus,
  Clock,
  Download,
  Share2,
  Archive,
  Heart,
  AlertCircle,
  CheckCircle,
  Zap,
  Target,
  Users,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { aiGenerationHistoryService } from '@/services/aiGenerationHistoryService';
import { aiAssistantService } from '@/services/aiAssistantService';
import { aiInsightsService } from '@/services/aiInsightsService';
import EdithAIGenerator from './EdithAIGenerator';

const UnifiedAIStudio: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('content');
  const [loading, setLoading] = useState(true);

  // Generation state
  const [generatedContent, setGeneratedContent] = useState<any[]>([]);
  const [showGenerator, setShowGenerator] = useState(false);

  // Assistant state
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);

  // Insights state
  const [insights, setInsights] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  // Load data on mount
  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadGeneratedContent(),
        loadConversations(),
        loadInsights(),
      ]);
    } catch (error) {
      console.error('Error loading AI studio data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGeneratedContent = async () => {
    if (!user?.id) return;
    const content = await aiGenerationHistoryService.getUserGeneratedContent(user.id, { is_archived: false }, 20);
    setGeneratedContent(content || []);
  };

  const loadConversations = async () => {
    if (!user?.id) return;
    const convs = await aiAssistantService.getUserConversations(user.id, 10, false);
    setConversations(convs || []);
  };

  const loadInsights = async () => {
    if (!user?.id) return;
    const userInsights = await aiInsightsService.getInsights(user.id, {}, 10);
    setInsights(userInsights || []);

    const recs = await aiInsightsService.getContentRecommendations(user.id, { status: 'new' }, 10);
    setRecommendations(recs || []);
  };

  const handleFavorite = async (contentId: string, isFavorite: boolean) => {
    try {
      await aiGenerationHistoryService.toggleFavorite(contentId, isFavorite);
      loadGeneratedContent();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleArchive = async (contentId: string) => {
    try {
      await aiGenerationHistoryService.toggleArchive(contentId, true);
      loadGeneratedContent();
    } catch (error) {
      console.error('Error archiving content:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-purple-600" />
            AI Studio
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create content, chat with AI, and get intelligent recommendations
          </p>
        </div>
        <Button size="lg" onClick={() => setShowGenerator(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Generate Content
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Content Generator</span>
            <span className="sm:hidden">Content</span>
          </TabsTrigger>
          <TabsTrigger value="assistant" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            <span className="hidden sm:inline">AI Assistant</span>
            <span className="sm:hidden">Chat</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Insights</span>
            <span className="sm:hidden">Data</span>
          </TabsTrigger>
        </TabsList>

        {/* Content Generator Tab */}
        <TabsContent value="content" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Image Generation</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Create stunning AI-generated images for your posts and products
                </p>
                <Button variant="outline" size="sm" onClick={() => setShowGenerator(true)}>
                  Generate Image
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="font-semibold mb-2">Video Creation</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Generate engaging short videos with AI technology
                </p>
                <Button variant="outline" size="sm" onClick={() => setShowGenerator(true)}>
                  Generate Video
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Smart Editing</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Enhance and upscale your AI-generated content
                </p>
                <Button variant="outline" size="sm" onClick={() => setShowGenerator(true)}>
                  Enhance Content
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Generated Content History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Generations
              </CardTitle>
              <CardDescription>Your AI-generated content history</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="p-8 text-center">Loading...</div>
              ) : generatedContent.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {generatedContent.map((content) => (
                    <Card key={content.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      {content.thumbnail_url && (
                        <img
                          src={content.thumbnail_url}
                          alt={content.title}
                          className="w-full h-40 object-cover"
                        />
                      )}
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium truncate">{content.title || 'Untitled'}</h4>
                            <Badge variant="outline" className="text-xs mt-1">
                              {content.type}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFavorite(content.id, !content.is_favorite)}
                          >
                            <Heart
                              className={`w-4 h-4 ${
                                content.is_favorite ? 'fill-red-500 text-red-500' : ''
                              }`}
                            />
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">
                          {new Date(content.created_at).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleArchive(content.id)}
                          >
                            <Archive className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No generated content yet. Create your first AI-powered content!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Assistant Tab */}
        <TabsContent value="assistant" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-600" />
                Chat with Edith AI
              </CardTitle>
              <CardDescription>Get personalized guidance and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversations.length > 0 ? (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm mb-3">Recent Conversations</h4>
                    {conversations.map((conv) => (
                      <div
                        key={conv.id}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => setSelectedConversation(conv)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{conv.title || 'Untitled Conversation'}</p>
                            <p className="text-xs text-gray-500">
                              {conv.message_count || 0} messages
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {conv.context}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No conversations yet. Start chatting with Edith!</p>
                  </div>
                )}
                <Button className="w-full" onClick={() => setShowGenerator(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Start New Conversation
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  Smart Insights
                </CardTitle>
                <CardDescription>AI-powered recommendations for your success</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="p-8 text-center">Loading...</div>
                ) : insights.length > 0 ? (
                  <div className="space-y-3">
                    {insights.slice(0, 5).map((insight) => (
                      <div
                        key={insight.id}
                        className={`p-3 border rounded-lg ${getPriorityColor(insight.priority)}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{insight.title}</p>
                            <p className="text-xs mt-1 line-clamp-2">
                              {insight.insight_text}
                            </p>
                            {insight.is_actionable && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={() => (window.location.href = insight.action_url || '#')}
                              >
                                {insight.action_label || 'Take Action'}
                              </Button>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs whitespace-nowrap">
                            {insight.confidence || 0}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No insights available yet. Keep engaging to unlock insights!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  Recommendations
                </CardTitle>
                <CardDescription>Suggested actions to grow your presence</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="p-8 text-center">Loading...</div>
                ) : recommendations.length > 0 ? (
                  <div className="space-y-3">
                    {recommendations.slice(0, 5).map((rec) => (
                      <div key={rec.id} className="p-3 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{rec.title}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {rec.suggestion_text}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              {rec.confidence_level && (
                                <Badge variant="secondary" className="text-xs">
                                  {rec.confidence_level}% confidence
                                </Badge>
                              )}
                              {rec.effort_level && (
                                <Badge variant="outline" className="text-xs">
                                  {rec.effort_level} effort
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No recommendations yet. Complete more actions to get suggestions!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Generator Modal */}
      {showGenerator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-[90%] max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edith AI Generator</h3>
              <Button variant="outline" size="sm" onClick={() => setShowGenerator(false)}>
                Close
              </Button>
            </div>
            <EdithAIGenerator
              onGenerate={() => {
                loadGeneratedContent();
                setShowGenerator(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedAIStudio;
