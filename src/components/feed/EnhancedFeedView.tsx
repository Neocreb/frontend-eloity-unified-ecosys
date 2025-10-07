// @ts-nocheck
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Bookmark,
  ChevronDown,
  Filter
} from 'lucide-react';
import { useEnhancedFeed } from '@/contexts/EnhancedFeedContext';
import PostCard from './PostCard';
import SavedContent from './SavedContent';
import CreatePostCard from './CreatePostCard';
import CommentSection from './CommentSection';
import { cn } from '@/utils/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EnhancedFeedViewProps {
  currentView?: 'feed' | 'saved';
  onNavigateToView?: (view: 'feed' | 'saved') => void;
}

const EnhancedFeedView: React.FC<EnhancedFeedViewProps> = ({
  currentView = 'feed',
  onNavigateToView
}) => {
  const { 
    posts, 
    addPost 
  } = useEnhancedFeed();
  
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'trending'>('recent');

  // Convert posts to legacy format for classic view
  const convertToLegacyPost = (post: any) => ({
    id: post.id,
    author: {
      name: post.author.name,
      username: post.author.username,
      avatar: post.author.avatar,
      verified: post.author.verified,
    },
    content: post.content,
    image: post.image,
    createdAt: post.createdAt,
    likes: post.likes,
    comments: post.comments,
    shares: post.shares,
    liked: post.liked,
    bookmarked: post.bookmarked,
  });

  // Get posts based on current view
  const getDisplayPosts = () => {
    if (currentView === 'saved') {
      return []; // SavedContent component handles this
    }

    let filteredPosts = posts;
    
    // Sort posts
    const sortedPosts = [...filteredPosts].sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.likes + b.shares + b.comments) - (a.likes + a.shares + a.comments);
        case 'trending':
          return b.likes - a.likes;
        case 'recent':
        default:
          return b.createdAt === 'now' ? 1 : a.createdAt === 'now' ? -1 : 0;
      }
    });

    return sortedPosts;
  };

  const displayPosts = getDisplayPosts();

  const handleCreatePost = (content: string, image?: string) => {
    addPost({
      content,
      image,
      author: {
        name: 'Current User',
        username: 'currentuser',
        avatar: '/placeholder.svg',
        verified: false,
      },
      type: 'post',
      likes: 0,
      comments: 0,
      shares: 0,
      gifts: 0,
    });
  };

  const mockComments = [
    {
      id: '1',
      content: 'Great post! Thanks for sharing.',
      userId: 'user1',
      username: 'johndoe',
      user: {
        name: 'John Doe',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        is_verified: false,
      },
      createdAt: '2h',
      likes: 5,
    },
  ];

  // If saved view is requested, show SavedContent component
  if (currentView === 'saved') {
    return <SavedContent />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">Home</h1>
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {displayPosts.length} posts
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={currentView === 'saved' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onNavigateToView?.('saved')}
              className="flex items-center gap-2"
            >
              <Bookmark className="h-4 w-4" />
              Saved
            </Button>
          </div>
        </div>

        {/* Feed controls */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="popular">Popular</SelectItem>
                <SelectItem value="trending">Trending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Classic Feed</span>
          </div>
        </div>
      </div>

      {/* Create post */}
      <CreatePostCard onSubmit={handleCreatePost} />

      {/* Posts Feed */}
      <div className="space-y-4">
        {displayPosts.length === 0 ? (
          <Card className="p-8 text-center">
            <CardContent>
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
              <p className="text-muted-foreground">
                Be the first to share something!
              </p>
            </CardContent>
          </Card>
        ) : (
          displayPosts.map((post) => (
            <div key={post.id}>
              <PostCard post={convertToLegacyPost(post)} />
              <CommentSection
                postId={post.id}
                comments={mockComments}
                onAddComment={(postId, content) => {
                  console.log('Add comment:', postId, content);
                }}
              />
            </div>
          ))
        )}
      </div>

      {/* Load more */}
      {displayPosts.length > 0 && (
        <div className="text-center py-8">
          <Button variant="outline" className="flex items-center gap-2">
            <ChevronDown className="h-4 w-4" />
            Load more posts
          </Button>
        </div>
      )}
    </div>
  );
};

export default EnhancedFeedView;
