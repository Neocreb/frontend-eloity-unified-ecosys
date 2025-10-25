import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreVertical,
  Camera,
  Video,
  MapPin,
  Smile,
  Image as ImageIcon,
  Calendar,
  Users,
  Globe,
  Lock,
  UserPlus,
  ThumbsUp,
  Laugh,
  Angry,
  Frown,
  Check,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PostService } from '@/services/postService';
import { storiesService } from '@/services/storiesService';
import { useAuth } from '@/contexts/AuthContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Reaction {
  type: 'like' | 'love' | 'laugh' | 'angry' | 'sad' | 'wow';
  count: number;
  userReacted: boolean;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
  replies: Comment[];
  userLiked: boolean;
}

interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userVerified: boolean;
  content: string;
  images: string[];
  video?: string;
  location?: string;
  timestamp: string;
  reactions: Record<string, Reaction>;
  comments: Comment[];
  shares: number;
  privacy: 'public' | 'friends' | 'private';
  type: 'text' | 'photo' | 'video' | 'event' | 'poll' | 'link';
  taggedUsers?: string[];
  event?: {
    title: string;
    date: string;
    location: string;
    attendees: number;
    userAttending: boolean;
  };
  poll?: {
    question: string;
    options: Array<{
      id: string;
      text: string;
      votes: number;
      userVoted: boolean;
    }>;
    totalVotes: number;
  };
  link?: {
    url: string;
    title: string;
    description: string;
    image: string;
  };
}

interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  image: string;
  timestamp: string;
  viewed: boolean;
}

const EnhancedSocialFeed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImages, setNewPostImages] = useState<string[]>([]);
  const [newPostLocation, setNewPostLocation] = useState('');
  const [newPostPrivacy, setNewPostPrivacy] = useState<'public' | 'friends' | 'private'>('public');
  const [selectedPostType, setSelectedPostType] = useState<'text' | 'photo' | 'event' | 'poll'>('text');
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const reactionEmojis = {
    like: '👍',
    love: '❤️',
    laugh: '😂',
    angry: '😠',
    sad: '😢',
    wow: '😮'
  };

  useEffect(() => {
    loadFeedData();
  }, []);

  const loadFeedData = async () => {
    try {
      setLoading(true);
      
      // Fetch real stories data
      let storiesData: any[] = [];
      if (user?.id) {
        storiesData = await storiesService.getActiveStories(user.id);
      }
      
      const transformedStories: Story[] = storiesData.map((story: any) => ({
        id: story.id,
        userId: story.user_id,
        userName: "User", // Would be fetched from user service in a real app
        userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user", // Placeholder
        image: story.media_url,
        timestamp: new Date(story.created_at).toLocaleDateString(),
        viewed: false // This would come from user's view history in a real app
      }));

      // Fetch real posts data
      let postsData: any[] = [];
      if (user?.id) {
        postsData = await PostService.getFeedPosts(user.id);
      }
      
      const transformedPosts: Post[] = postsData.map((post: any) => ({
        id: post.id,
        userId: post.user_id,
        userName: post.author?.full_name || post.author?.username || "Unknown User",
        userAvatar: post.author?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
        userVerified: post.author?.is_verified || false,
        content: post.content,
        images: post.images || [],
        timestamp: new Date(post.created_at).toLocaleDateString(),
        reactions: post.reactions || {},
        comments: post.comments || [],
        shares: post.shares_count || 0,
        privacy: post.privacy || 'public',
        type: post.post_type || 'text'
      }));

      setStories(transformedStories);
      setPosts(transformedPosts);
    } catch (error) {
      console.error("Error loading feed data:", error);
      toast({
        title: "Error",
        description: "Failed to load feed data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = () => {
    if (!newPostContent.trim()) {
      toast({
        title: "Empty Post",
        description: "Please write something to share",
        variant: "destructive"
      });
      return;
    }

    // In a real implementation, this would call the PostService to create a post
    const newPost: Post = {
      id: `post-${Date.now()}`,
      userId: user?.id || 'current-user',
      userName: user?.name || 'You',
      userAvatar: user?.avatar || '/api/placeholder/40/40',
      userVerified: false,
      content: newPostContent,
      images: newPostImages,
      location: newPostLocation,
      timestamp: 'Just now',
      reactions: {},
      comments: [],
      shares: 0,
      privacy: newPostPrivacy,
      type: selectedPostType
    };

    setPosts(prev => [newPost, ...prev]);
    setNewPostContent('');
    setNewPostImages([]);
    setNewPostLocation('');
    
    toast({
      title: "Post Created",
      description: "Your post has been shared successfully"
    });
  };

  const handleReaction = (postId: string, reactionType: keyof typeof reactionEmojis) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const currentReaction = post.reactions[reactionType];
        const updatedReactions = { ...post.reactions };
        
        if (currentReaction?.userReacted) {
          // Remove reaction
          updatedReactions[reactionType] = {
            ...currentReaction,
            count: Math.max(0, currentReaction.count - 1),
            userReacted: false
          };
        } else {
          // Add reaction
          updatedReactions[reactionType] = {
            type: reactionType,
            count: (currentReaction?.count || 0) + 1,
            userReacted: true
          };
        }
        
        return { ...post, reactions: updatedReactions };
      }
      return post;
    }));
    
    setShowReactionPicker(null);
  };

  const handleComment = (postId: string, content: string) => {
    if (!content.trim()) return;

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      userId: user?.id || 'current-user',
      userName: user?.name || 'You',
      userAvatar: user?.avatar || '/api/placeholder/40/40',
      content,
      timestamp: 'Just now',
      likes: 0,
      replies: [],
      userLiked: false
    };

    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return { ...post, comments: [...post.comments, newComment] };
      }
      return post;
    }));
  };

  const handleVotePoll = (postId: string, optionId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId && post.poll) {
        const updatedOptions = post.poll.options.map(option => {
          if (option.id === optionId) {
            return { ...option, votes: option.votes + 1, userVoted: true };
          }
          return { ...option, userVoted: false };
        });
        
        return {
          ...post,
          poll: {
            ...post.poll,
            options: updatedOptions,
            totalVotes: post.poll.totalVotes + 1
          }
        };
      }
      return post;
    }));
  };

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const formatReactionCount = (reactions: Record<string, Reaction>) => {
    const totalCount = Object.values(reactions).reduce((sum, reaction) => sum + reaction.count, 0);
    return totalCount > 0 ? `${totalCount}` : '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4">
      {/* Stories Section */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {/* Your Story */}
            <div className="flex-shrink-0 text-center cursor-pointer">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-0.5">
                <div className="bg-white rounded-full p-1">
                  <img
                    src="/api/placeholder/40/40"
                    alt="Your story"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>
              <span className="text-xs text-gray-600">Your Story</span>
            </div>
            
            {/* Stories */}
            {stories.map(story => (
              <div key={story.id} className="flex-shrink-0 text-center cursor-pointer">
                <div className={`w-16 h-16 rounded-full p-0.5 ${story.viewed ? 'bg-gray-300' : 'bg-gradient-to-r from-purple-500 to-pink-500'}`}>
                  <img
                    src={story.userAvatar}
                    alt={story.userName}
                    className="w-full h-full rounded-full border-2 border-white object-cover"
                  />
                </div>
                <span className="text-xs text-gray-600 block mt-1 truncate w-16">
                  {story.userName.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Post */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3 mb-4">
            <img
              src="/api/placeholder/40/40"
              alt="Your avatar"
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <Textarea
                placeholder="What's on your mind?"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          
          {newPostImages.length > 0 && (
            <div className="mb-4 grid grid-cols-3 gap-2">
              {newPostImages.map((img, index) => (
                <div key={index} className="relative">
                  <img
                    src={img}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-1 right-1 h-6 w-6 p-0"
                    onClick={() => setNewPostImages(prev => prev.filter((_, i) => i !== index))}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">
                <Camera className="h-4 w-4 mr-1" />
                Photo
              </Button>
              <Button variant="ghost" size="sm">
                <Video className="h-4 w-4 mr-1" />
                Video
              </Button>
              <Button variant="ghost" size="sm">
                <Smile className="h-4 w-4 mr-1" />
                Feeling
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Select value={newPostPrivacy} onValueChange={(value) => setNewPostPrivacy(value as 'public' | 'friends' | 'private')}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      Public
                    </div>
                  </SelectItem>
                  <SelectItem value="friends">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Friends
                    </div>
                  </SelectItem>
                  <SelectItem value="private">
                    <div className="flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      Private
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleCreatePost}>Post</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      {posts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No posts yet</h3>
            <p className="text-gray-500">Be the first to share something with your network!</p>
          </CardContent>
        </Card>
      ) : (
        posts.map((post) => (
          <Card key={post.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={post.userAvatar}
                    alt={post.userName}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{post.userName}</h4>
                      {post.userVerified && (
                        <Badge variant="secondary" className="px-1 py-0">
                          <Check className="h-3 w-3" />
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{post.timestamp}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="pb-3">
              <p className="mb-3">{post.content}</p>
              
              {post.images.length > 0 && (
                <div className="mb-3">
                  <img
                    src={post.images[0]}
                    alt="Post image"
                    className="w-full rounded-lg"
                  />
                </div>
              )}

              {post.location && (
                <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                  <MapPin className="h-4 w-4" />
                  {post.location}
                </div>
              )}

              {post.poll && (
                <div className="bg-gray-50 rounded-lg p-4 mb-3">
                  <h4 className="font-medium mb-3">{post.poll.question}</h4>
                  <div className="space-y-2">
                    {post.poll.options.map((option) => (
                      <Button
                        key={option.id}
                        variant="outline"
                        className="w-full justify-between"
                        onClick={() => handleVotePoll(post.id, option.id)}
                      >
                        <span>{option.text}</span>
                        <span className="text-sm">
                          {option.userVoted ? '✓ ' : ''}
                          {option.votes > 0 ? `${Math.round((option.votes / post.poll!.totalVotes) * 100)}%` : ''}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{formatReactionCount(post.reactions)} reactions</span>
                <span>{post.comments.length} comments</span>
                <span>{post.shares} shares</span>
              </div>
            </CardContent>

            <div className="border-t">
              <div className="flex">
                <Button
                  variant="ghost"
                  className="flex-1 rounded-none"
                  onClick={() => setShowReactionPicker(showReactionPicker === post.id ? null : post.id)}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Like
                </Button>
                <Button
                  variant="ghost"
                  className="flex-1 rounded-none"
                  onClick={() => toggleComments(post.id)}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Comment
                </Button>
                <Button variant="ghost" className="flex-1 rounded-none">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>

              {showReactionPicker === post.id && (
                <div className="flex justify-center gap-1 p-2 border-t">
                  {Object.entries(reactionEmojis).map(([type, emoji]) => (
                    <Button
                      key={type}
                      variant="ghost"
                      size="sm"
                      className="text-2xl hover:bg-gray-100"
                      onClick={() => handleReaction(post.id, type as keyof typeof reactionEmojis)}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              )}

              {expandedComments.has(post.id) && (
                <div className="border-t p-4">
                  <div className="space-y-3 mb-4">
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-2">
                        <img
                          src={comment.userAvatar}
                          alt={comment.userName}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="bg-gray-100 rounded-lg p-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{comment.userName}</span>
                              <span className="text-xs text-gray-500">{comment.timestamp}</span>
                            </div>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                          <div className="flex gap-3 mt-1 text-xs text-gray-500">
                            <Button variant="ghost" size="sm" className="h-6 p-0">
                              Like ({comment.likes})
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 p-0">
                              Reply
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <img
                      src="/api/placeholder/32/32"
                      alt="Your avatar"
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1 flex gap-2">
                      <Input placeholder="Write a comment..." className="flex-1" />
                      <Button size="sm">Post</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))
      )}
    </div>
  );
};

export default EnhancedSocialFeed;