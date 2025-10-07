// @ts-nocheck
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Info, 
  Sparkles, 
  Gift,
  Heart,
  Share2,
  Bookmark
} from 'lucide-react';
import { useLocation } from 'wouter';
import PostCard from '@/components/feed/PostCard';
import CommentSection from '@/components/feed/CommentSection';
import CreatePostCard from '@/components/feed/CreatePostCard';

// Mock data for demo
const mockPosts = [
  {
    id: '1',
    author: {
      name: 'Sarah Chen',
      username: 'sarahc_dev',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
      verified: true,
    },
    content: 'Just launched my new project! Excited to share it with everyone 🚀',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500',
    createdAt: '2h',
    likes: 45,
    comments: 12,
    shares: 8,
    liked: false,
    bookmarked: false,
  },
  {
    id: '2',
    author: {
      name: 'Alex Rodriguez',
      username: 'alex_codes',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      verified: false,
    },
    content: 'Working on some exciting new features. Can\'t wait to show you all what we\'re building! 💻✨',
    createdAt: '4h',
    likes: 23,
    comments: 7,
    shares: 3,
    liked: true,
    bookmarked: false,
  },
  {
    id: '3',
    author: {
      name: 'Maya Patel',
      username: 'maya_design',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      verified: true,
    },
    content: 'Beautiful sunset from today\'s design session. Sometimes inspiration comes from the simplest moments.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500',
    createdAt: '6h',
    likes: 67,
    comments: 15,
    shares: 12,
    liked: false,
    bookmarked: true,
  }
];

const mockComments = [
  {
    id: '1',
    content: 'This looks amazing! Great work 👏',
    userId: 'user1',
    username: 'johndoe',
    user: {
      name: 'John Doe',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      is_verified: false,
    },
    createdAt: '1h',
    likes: 5,
  }
];

const IntegratedFeedDemo: React.FC = () => {
  const [, setLocation] = useLocation();
  const [feedMode, setFeedMode] = useState<'classic' | 'saved'>('classic');
  const [posts, setPosts] = useState(mockPosts);

  const handleCreatePost = (content: string, image?: string) => {
    const newPost = {
      id: Date.now().toString(),
      author: {
        name: 'You',
        username: 'you',
        avatar: '/placeholder.svg',
        verified: false,
      },
      content,
      image,
      createdAt: 'now',
      likes: 0,
      comments: 0,
      shares: 0,
      liked: false,
      bookmarked: false,
    };
    setPosts(prev => [newPost, ...prev]);
  };

  const handleAddComment = (postId: string, comment: string) => {
    console.log('Add comment:', postId, comment);
    // In a real implementation, this would add the comment to the post
  };

  return (
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
                <h1 className="text-xl font-bold">Integrated Feed Toggle Demo</h1>
                <p className="text-sm text-muted-foreground">
                  Experience both feed views with existing components
                </p>
              </div>
            </div>
            
            <Badge variant="outline" className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Demo
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        
        {/* Demo Introduction */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Feed Toggle Demo</p>
              <p className="text-sm">
                Switch between Classic and Threaded views. All features including 
                <Gift className="h-4 w-4 inline mx-1 text-purple-500" />
                gifts work in both modes!
              </p>
            </div>
          </AlertDescription>
        </Alert>

        {/* Feed Controls */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Feed Controls</CardTitle>
              <Button
                variant={feedMode === 'saved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFeedMode(feedMode === 'classic' ? 'saved' : 'classic')}
                className="flex items-center gap-2"
              >
                <Bookmark className="h-4 w-4" />
                {feedMode === 'saved' ? 'Show Feed' : 'Show Saved'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <Heart className="h-5 w-5 text-red-500" />
                <div>
                  <p className="font-medium text-sm">Current Mode</p>
                  <p className="text-xs text-muted-foreground">
                    {feedMode === 'classic' ? 'Classic Feed' : 'Saved Content'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <Gift className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="font-medium text-sm">All Features</p>
                  <p className="text-xs text-muted-foreground">
                    Gifts, likes, shares work
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Create Post */}
        <CreatePostCard onSubmit={handleCreatePost} />

        {/* Current Mode Display */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <CardContent className="p-4">
            <div className="text-center">
              <h3 className="font-semibold mb-2">
                Current View: {feedMode === 'classic' ? 'Classic Feed' : 'Threaded View'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feedMode === 'classic' 
                  ? 'Traditional social media layout with nested comments under each post.'
                  : 'Twitter-style threading where replies become standalone content.'
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Feed Posts */}
        <div className="space-y-6">
          {posts.filter(post => feedMode === 'saved' ? post.bookmarked : true).map((post) => (
            <div key={post.id} className="space-y-4">
              <PostCard post={post} />
              
              {feedMode === 'classic' && (
                <CommentSection
                  postId={post.id}
                  comments={mockComments}
                  onAddComment={handleAddComment}
                />
              )}
              
              {feedMode === 'saved' && post.bookmarked && (
                <div className="ml-6 border-l-2 border-blue-200 pl-4 space-y-4">
                  <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                    📚 This post is saved to your collection
                  </div>
                  <Card className="bg-muted/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <img 
                          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40" 
                          alt="Reply author"
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="font-medium text-sm">John Doe</p>
                          <p className="text-xs text-muted-foreground">@johndoe • 1h</p>
                        </div>
                      </div>
                      <p className="text-sm">This looks amazing! Great work 👏</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <button className="flex items-center gap-1">
                          <Heart className="h-4 w-4" /> 5
                        </button>
                        <button className="flex items-center gap-1">
                          <Share2 className="h-4 w-4" /> 1
                        </button>
                        <button className="flex items-center gap-1">
                          <Gift className="h-4 w-4 text-purple-500" /> Gift
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Feature Summary */}
        <Card>
          <CardHeader>
            <CardTitle>✨ What's Different?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Classic Mode</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Comments nested under posts</li>
                  <li>• Familiar social media feel</li>
                  <li>• Optimized for quick browsing</li>
                  <li>• All features preserved</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Threaded Mode</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Replies become standalone posts</li>
                  <li>• Better conversation discovery</li>
                  <li>• Enhanced engagement potential</li>
                  <li>• Gifts work on every level</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Return Button */}
        <div className="text-center py-8">
          <Button onClick={() => setLocation('/app')} className="flex items-center gap-2 mx-auto">
            <ArrowLeft className="h-4 w-4" />
            Return to Main App
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IntegratedFeedDemo;
