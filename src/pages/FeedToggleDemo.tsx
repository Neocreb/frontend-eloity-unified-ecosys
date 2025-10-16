// @ts-nocheck
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Info, 
  Sparkles, 
  MessageSquare,
  List,
  Users,
  Gift,
  Heart,
  Share2
} from 'lucide-react';
import EnhancedFeedProvider from '@/contexts/EnhancedFeedContext';
import EnhancedFeedView from '@/components/feed/EnhancedFeedView';
import { useLocation } from 'wouter';
import { Alert, AlertDescription } from '@/components/ui/alert';

const FeedToggleDemo: React.FC = () => {
  const [, setLocation] = useLocation();
  const [currentThread, setCurrentThread] = useState<string | null>(null);

  const handleNavigateToThread = (threadId: string) => {
    setCurrentThread(threadId);
  };

  const handleNavigateBack = () => {
    setCurrentThread(null);
  };

  return (
    <EnhancedFeedProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation('/app')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to App
                </Button>
                <div>
                  <h1 className="text-xl font-bold">Feed View Toggle Demo</h1>
                  <p className="text-sm text-muted-foreground">
                    Experience both classic and threaded feed views
                  </p>
                </div>
              </div>
              
              <Badge variant="outline" className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Demo Mode
              </Badge>
            </div>
          </div>
        </div>

        {/* Demo Introduction */}
        {!currentThread && (
          <div className="max-w-4xl mx-auto px-4 py-6">
            <Alert className="mb-6">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Welcome to the Feed Toggle Demo!</p>
                  <p className="text-sm">
                    Use the toggle in the top right to switch between <strong>Classic Feed</strong> and <strong>Threaded View</strong>. 
                    All features including likes, shares, comments, and gifts work in both modes.
                  </p>
                </div>
              </AlertDescription>
            </Alert>

            {/* Feature Comparison */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <List className="h-5 w-5 text-blue-500" />
                    Classic Feed
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Familiar social media layout
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Nested comment sections
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <Gift className="h-3 w-3 text-purple-500" />
                    Full gift system support
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Optimized for quick browsing
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-purple-500" />
                    Threaded View
                    <Badge variant="secondary" className="ml-2">
                      <Sparkles className="h-3 w-3 mr-1" />
                      New
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    Reply posts become standalone content
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    Enhanced conversation flow
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    <Gift className="h-3 w-3 text-purple-500" />
                    Gifts work on every post level
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    Better content discoverability
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sample Interactions */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Try These Interactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                    <Heart className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="font-medium text-sm">Like Posts</p>
                      <p className="text-xs text-muted-foreground">Works in both views</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                    <Gift className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="font-medium text-sm">Send Gifts</p>
                      <p className="text-xs text-muted-foreground">Full gift system</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <Share2 className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-sm">Share & Reply</p>
                      <p className="text-xs text-muted-foreground">Enhanced in threaded</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Feed */}
        <EnhancedFeedView
          currentThreadId={currentThread}
          onNavigateToThread={handleNavigateToThread}
          onNavigateBack={handleNavigateBack}
        />

        {/* Footer */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="text-center p-6">
            <CardContent>
              <h3 className="font-semibold mb-2">Ready to implement?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This demo shows how users can seamlessly switch between feed views while preserving all features.
              </p>
              <Button onClick={() => setLocation('/app')} className="flex items-center gap-2 mx-auto">
                <ArrowLeft className="h-4 w-4" />
                Return to Main App
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </EnhancedFeedProvider>
  );
};

export default FeedToggleDemo;
