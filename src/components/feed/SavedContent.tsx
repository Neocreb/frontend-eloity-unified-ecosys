// @ts-nocheck
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bookmark, 
  History, 
  Heart, 
  MessageCircle, 
  Share2, 
  Gift,
  Clock,
  Trash2,
  Eye,
  Calendar,
  TrendingUp,
  BookmarkX
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useHybridFeed } from '@/contexts/HybridFeedContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import VirtualGiftsAndTips from '@/components/premium/VirtualGiftsAndTips';
import EnhancedShareDialog from './EnhancedShareDialog';
import { useNavigate } from 'react-router-dom';

interface SavedContentProps {
  feedType?: string;
}

const SavedContent: React.FC<SavedContentProps> = ({ feedType = "all" }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    savedPosts, 
    viewHistory, 
    unsavePost, 
    clearHistory,
    toggleLike,
    toggleGift,
    incrementShares
  } = useHybridFeed();
  
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'popular'>('recent');

  const formatHistoryDate = (createdAt: string) => {
    if (createdAt === 'now') return 'Just now';
    
    // For real timestamps, you'd parse them properly
    // This is a simplified version for the demo
    const timeUnits = ['s', 'm', 'h', 'd'];
    const timeValue = parseInt(createdAt);
    const timeUnit = createdAt.slice(-1);
    
    if (timeUnit === 'h' && timeValue <= 24) {
      return isToday(new Date()) ? 'Today' : 'Yesterday';
    }
    
    return createdAt;
  };

  const getSortedPosts = (posts: any[]) => {
    const sorted = [...posts];
    switch (sortBy) {
      case 'oldest':
        return sorted.reverse();
      case 'popular':
        return sorted.sort((a, b) => (b.likes + b.shares + b.comments) - (a.likes + a.shares + a.comments));
      case 'recent':
      default:
        return sorted;
    }
  };

  const handlePostClick = (postId: string) => {
    navigate(`/app/post/${postId}`);
  };

  const handleLike = (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike(postId);
  };

  const handleShare = (postId: string) => {
    incrementShares(postId);
  };

  const handleRepost = (originalPostId: string, content: string) => {
    // Handle repost logic
    handleShare(originalPostId);
  };

  const handleQuotePost = (originalPostId: string, content: string) => {
    // Handle quote post logic
    handleShare(originalPostId);
  };

  const handleUnsave = (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    unsavePost(postId);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bookmark className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">📚 Your Saved Content</h3>
                <p className="text-sm text-blue-700 dark:text-blue-200">
                  Your bookmarked posts and viewing history
                </p>
              </div>
            </div>
            <div className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
              SAVED & HISTORY
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="saved" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="saved" className="flex items-center gap-2">
            <Bookmark className="h-4 w-4" />
            Saved Posts
            {savedPosts.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {savedPosts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            View History
            {viewHistory.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {viewHistory.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Saved Posts Tab */}
        <TabsContent value="saved" className="space-y-4">
          {/* Sort Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {sortBy === 'recent' ? 'Most Recent' : 
                     sortBy === 'oldest' ? 'Oldest First' : 'Most Popular'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSortBy('recent')}>
                    <Clock className="h-4 w-4 mr-2" />
                    Most Recent
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('oldest')}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Oldest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('popular')}>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Most Popular
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {savedPosts.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {savedPosts.length} saved post{savedPosts.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Saved Posts List */}
          {savedPosts.length === 0 ? (
            <Card className="p-8 text-center">
              <CardContent>
                <Bookmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No saved posts yet</h3>
                <p className="text-muted-foreground">
                  Bookmark posts to save them for later reading.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {getSortedPosts(savedPosts).map((post) => (
                <Card 
                  key={post.id}
                  className="cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => handlePostClick(post.id)}
                >
                  <CardHeader className="pb-3 pt-4 px-4">
                    <div className="flex gap-3">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={post.author.avatar} alt={post.author.name} />
                        <AvatarFallback>{post.author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold">{post.author.name}</span>
                          {post.author.verified && (
                            <Badge variant="default" className="px-1 py-0 h-4 bg-blue-500">
                              <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"/>
                              </svg>
                            </Badge>
                          )}

                          <span className="text-muted-foreground text-sm">@{post.author.username}</span>
                          <span className="text-muted-foreground text-sm">·</span>
                          <span className="text-muted-foreground text-sm">{post.createdAt}</span>

                          <Badge variant="outline" className="ml-auto">
                            <Bookmark className="h-3 w-3 mr-1" />
                            Saved
                          </Badge>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={(e) => handleUnsave(post.id, e)}
                      >
                        <BookmarkX className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="px-4 py-0 pb-3">
                    {/* Post Content */}
                    <div className="mb-3 leading-relaxed">
                      {post.content}
                    </div>

                    {/* Post Media */}
                    {post.image && (
                      <div className="mb-3 rounded-lg overflow-hidden">
                        <img
                          src={post.image}
                          alt="Post image"
                          className="w-full object-cover max-h-64"
                        />
                      </div>
                    )}

                    {/* Post Actions */}
                    <div className="flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleLike(post.id, e)}
                        className={cn(
                          "flex items-center gap-1 text-muted-foreground hover:text-red-500 transition-colors",
                          post.liked && "text-red-500"
                        )}
                      >
                        <Heart className={cn("h-4 w-4", post.liked && "fill-current")} />
                        <span>{post.likes}</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/app/post/${post.id}`);
                        }}
                        className="flex items-center gap-1 text-muted-foreground hover:text-blue-500 transition-colors"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.comments}</span>
                      </Button>

                      <EnhancedShareDialog
                        postId={post.id}
                        postContent={post.content}
                        postAuthor={post.author}
                        onRepost={handleRepost}
                        onQuotePost={handleQuotePost}
                        trigger={
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1 text-muted-foreground hover:text-green-500 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Share2 className="h-4 w-4" />
                            <span>{post.shares}</span>
                          </Button>
                        }
                      />

                      <VirtualGiftsAndTips
                        recipientId={post.author.username}
                        recipientName={post.author.name}
                        contentId={post.id}
                        trigger={
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "flex items-center gap-1 text-muted-foreground hover:text-purple-500 transition-colors",
                              post.gifted && "text-purple-500"
                            )}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Gift className={cn("h-4 w-4", post.gifted && "fill-current")} />
                            <span>{post.gifts}</span>
                          </Button>
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* View History Tab */}
        <TabsContent value="history" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Your viewing history</span>
            </div>
            
            {viewHistory.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearHistory}
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Clear History
              </Button>
            )}
          </div>

          {/* View History List */}
          {viewHistory.length === 0 ? (
            <Card className="p-8 text-center">
              <CardContent>
                <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No viewing history</h3>
                <p className="text-muted-foreground">
                  Posts you view will appear here for easy access.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {viewHistory.map((post) => (
                <Card 
                  key={`history-${post.id}`}
                  className="cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => handlePostClick(post.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={post.author.avatar} alt={post.author.name} />
                        <AvatarFallback className="text-xs">{post.author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{post.author.name}</span>
                          <span className="text-muted-foreground text-xs">@{post.author.username}</span>
                          <span className="text-muted-foreground text-xs">·</span>
                          <span className="text-muted-foreground text-xs">{formatHistoryDate(post.createdAt)}</span>
                        </div>
                        
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {post.content}
                        </p>
                        
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {post.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            {post.comments}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            Viewed
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SavedContent;
