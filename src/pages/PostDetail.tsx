// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark,
  Gift,
  Image as ImageIcon,
  X,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import VirtualGiftsAndTips from '@/components/premium/VirtualGiftsAndTips';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface TwitterPost {
  id: string;
  content: string;
  author: {
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
  };
  createdAt: string;
  likes: number;
  comments: number;
  shares: number;
  gifts: number;
  liked?: boolean;
  bookmarked?: boolean;
  gifted?: boolean;
  media?: { type: 'image' | 'video'; url: string; alt?: string }[];
  parentId?: string;
  threadId?: string;
  replies?: TwitterPost[];
}

interface TwitterComment {
  id: string;
  content: string;
  author: {
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
  };
  createdAt: string;
  likes: number;
  replies: number;
  shares: number;
  gifts: number;
  liked?: boolean;
  bookmarked?: boolean;
  gifted?: boolean;
  media?: { type: 'image' | 'video'; url: string; alt?: string }[];
  parentId?: string;
}

const PostDetail: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [post, setPost] = useState<TwitterPost | null>(null);
  const [comments, setComments] = useState<TwitterComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentImages, setCommentImages] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data repository - in real app this would come from API
  const allPosts: Record<string, TwitterPost> = {
    '1': {
      id: '1',
      content: 'Just launched my new project! Excited to share it with everyone 🚀',
      author: {
        name: 'Sarah Chen',
        username: 'sarahc_dev',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
        verified: true,
      },
      createdAt: '2h',
      likes: 45,
      comments: 12,
      shares: 8,
      gifts: 3,
      media: [{
        type: 'image',
        url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500',
        alt: 'Project screenshot'
      }],
    },
    '2': {
      id: '2',
      content: 'Congratulations! This looks amazing. Can\'t wait to try it out! 🎉',
      author: {
        name: 'Alex Rodriguez',
        username: 'alex_codes',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        verified: false,
      },
      createdAt: '1h',
      likes: 12,
      comments: 3,
      shares: 1,
      gifts: 1,
      parentId: '1',
      threadId: '1',
    },
    '3': {
      id: '3',
      content: 'The design choices here are incredible! Love the attention to detail.',
      author: {
        name: 'Maya Patel',
        username: 'maya_design',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        verified: true,
      },
      createdAt: '45m',
      likes: 8,
      comments: 1,
      shares: 2,
      gifts: 0,
      media: [{
        type: 'image',
        url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
        alt: 'Screenshot comment'
      }],
      parentId: '1',
      threadId: '1',
    },
    '4': {
      id: '4',
      content: 'Thanks Alex! Really appreciate the support. More updates coming soon!',
      author: {
        name: 'Sarah Chen',
        username: 'sarahc_dev',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
        verified: true,
      },
      createdAt: '30m',
      likes: 5,
      comments: 0,
      shares: 0,
      gifts: 0,
      parentId: '2',
      threadId: '1',
    },
    '5': {
      id: '5',
      content: 'Thanks Alex! Really appreciate the support. More updates coming soon!',
      author: {
        name: 'Sarah Chen',
        username: 'sarahc_dev',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
        verified: true,
      },
      createdAt: '30m',
      likes: 5,
      comments: 2,
      shares: 0,
      gifts: 0,
      parentId: '2',
      threadId: '1',
    },
    '6': {
      id: '6',
      content: 'Looking forward to the updates! Will this have API integration?',
      author: {
        name: 'Tom Wilson',
        username: 'tomw_tech',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f78?w=150',
        verified: false,
      },
      createdAt: '15m',
      likes: 3,
      comments: 1,
      shares: 0,
      gifts: 0,
      parentId: '5',
      threadId: '1',
    },
    '7': {
      id: '7',
      content: 'Yes! Full REST API coming in v2.0 🚀',
      author: {
        name: 'Sarah Chen',
        username: 'sarahc_dev',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
        verified: true,
      },
      createdAt: '10m',
      likes: 8,
      comments: 0,
      shares: 1,
      gifts: 1,
      parentId: '6',
      threadId: '1',
    },
    '8': {
      id: '8',
      content: 'Working on some exciting new features. Can\'t wait to show you all what we\'re building! 💻✨',
      author: {
        name: 'Mike Johnson',
        username: 'mikej_dev',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        verified: false,
      },
      createdAt: '3h',
      likes: 23,
      comments: 7,
      shares: 3,
      gifts: 0,
    },
    'ad1': {
      id: 'ad1',
      content: '✨ Unlock Premium Features with Eloity Pro! Get advanced analytics, priority support, and exclusive tools for creators and businesses. Limited time offer - 50% off! 🎯',
      author: {
        name: 'Eloity',
        username: 'eloity_official',
        avatar: 'https://images.unsplash.com/photo-1553484771-371a605b060b?w=150',
        verified: true,
      },
      createdAt: 'Sponsored',
      likes: 1200,
      comments: 89,
      shares: 245,
      gifts: 15,
      media: [{
        type: 'image',
        url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=500',
        alt: 'Eloity Premium features'
      }],
    },
    'product1': {
      id: 'product1',
      content: '🎨 New Digital Art Collection Available! Hand-crafted NFT series featuring cyberpunk aesthetics. Each piece is unique and comes with unlockable content. Perfect for collectors and digital art enthusiasts!',
      author: {
        name: 'ArtistCo Gallery',
        username: 'artistco_nft',
        avatar: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=150',
        verified: true,
      },
      createdAt: '3h',
      likes: 156,
      comments: 23,
      shares: 34,
      gifts: 8,
      media: [{
        type: 'image',
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500',
        alt: 'Digital art NFT'
      }],
    },
    'job1': {
      id: 'job1',
      content: '💼 We\'re hiring! Looking for a talented Full-Stack Developer to join our growing startup. Work remotely, competitive salary, and equity options. Experience with React, Node.js, and cloud platforms required.',
      author: {
        name: 'TechStartup Inc',
        username: 'techstartup_co',
        avatar: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150',
        verified: true,
      },
      createdAt: '4h',
      likes: 89,
      comments: 45,
      shares: 67,
      gifts: 3,
    },
    'event1': {
      id: 'event1',
      content: '🔴 LIVE: Crypto Trading Masterclass with industry experts! Learn advanced trading strategies, technical analysis, and risk management. Q&A session included. Don\'t miss out!',
      author: {
        name: 'CryptoAcademy',
        username: 'crypto_academy',
        avatar: 'https://images.unsplash.com/photo-1559445368-92d4e08c5e8f?w=150',
        verified: true,
      },
      createdAt: 'Live now',
      likes: 342,
      comments: 128,
      shares: 89,
      gifts: 25,
      media: [{
        type: 'image',
        url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=500',
        alt: 'Crypto trading event'
      }],
    },
    'skill1': {
      id: 'skill1',
      content: '📚 Master Web3 Development in 30 Days! Comprehensive course covering Smart Contracts, DApps, and DeFi protocols. Join 5000+ students already earning in the crypto space. Early bird discount ends soon!',
      author: {
        name: 'Web3 Academy',
        username: 'web3_academy',
        avatar: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150',
        verified: true,
      },
      createdAt: '6h',
      likes: 267,
      comments: 156,
      shares: 123,
      gifts: 18,
      media: [{
        type: 'image',
        url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=500',
        alt: 'Web3 development course'
      }],
    },
  };

  const getCommentsForPost = (targetPostId: string): TwitterComment[] => {
    return Object.values(allPosts)
      .filter(p => p.parentId === targetPostId)
      .map(p => ({
        id: p.id,
        content: p.content,
        author: p.author,
        createdAt: p.createdAt,
        likes: p.likes,
        replies: p.comments,
        shares: p.shares,
        gifts: p.gifts,
        liked: p.liked,
        bookmarked: p.bookmarked,
        gifted: p.gifted,
        media: p.media,
        parentId: p.parentId,
      }));
  };

  useEffect(() => {
    if (!postId) return;

    // Simulate loading
    setIsLoading(true);
    setTimeout(() => {
      const foundPost = allPosts[postId];
      if (foundPost) {
        setPost(foundPost);
        setComments(getCommentsForPost(postId));
      }
      setIsLoading(false);
    }, 500);
  }, [postId]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setCommentImages(prev => [...prev, ...files].slice(0, 4)); // Max 4 images
  };

  const removeImage = (index: number) => {
    setCommentImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitComment = () => {
    if (!commentText.trim() && commentImages.length === 0) return;

    const newComment: TwitterComment = {
      id: Date.now().toString(),
      content: commentText,
      author: {
        name: user?.name || 'Current User',
        username: user?.username || 'currentuser',
        avatar: user?.avatar || '/placeholder.svg',
        verified: user?.verified || false,
      },
      createdAt: 'now',
      likes: 0,
      replies: 0,
      media: commentImages.map(file => ({
        type: 'image' as const,
        url: URL.createObjectURL(file),
        alt: file.name,
      })),
      parentId: postId,
    };

    setComments(prev => [newComment, ...prev]);
    setCommentText('');
    setCommentImages([]);
    
    toast({
      title: "Comment posted!",
      description: "Your comment has been added to the conversation.",
    });
  };

  const handleCommentClick = (commentId: string) => {
    // Navigate to comment as a post
    navigate(`/app/post/${commentId}`);
  };

  const handleLike = (targetId: string, isPost = false) => {
    if (isPost) {
      setPost(prev => prev ? {
        ...prev,
        liked: !prev.liked,
        likes: prev.liked ? prev.likes - 1 : prev.likes + 1,
      } : null);
    } else {
      setComments(prev => prev.map(comment =>
        comment.id === targetId ? {
          ...comment,
          liked: !comment.liked,
          likes: comment.liked ? comment.likes - 1 : comment.likes + 1,
        } : comment
      ));
    }
  };

  const handleShare = (targetId: string, isPost = false) => {
    if (isPost) {
      setPost(prev => prev ? {
        ...prev,
        shares: prev.shares + 1,
      } : null);
    } else {
      setComments(prev => prev.map(comment =>
        comment.id === targetId ? {
          ...comment,
          shares: comment.shares + 1,
        } : comment
      ));
    }
    toast({
      title: "Shared!",
      description: "Post has been shared.",
    });
  };

  const handleBookmark = (targetId: string, isPost = false) => {
    if (isPost) {
      setPost(prev => prev ? {
        ...prev,
        bookmarked: !prev.bookmarked,
      } : null);
    } else {
      setComments(prev => prev.map(comment =>
        comment.id === targetId ? {
          ...comment,
          bookmarked: !comment.bookmarked,
        } : comment
      ));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Post not found</h2>
          <Button onClick={() => navigate('/app/feed')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Feed
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/app/feed')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="font-bold text-lg">
                {post.parentId ? 'Reply' : 'Post'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {post.parentId
                  ? `Replying to ${allPosts[post.parentId]?.author.name || 'a post'}`
                  : `${post.comments} replies`
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Main Post */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-start gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={post.author.avatar} alt={post.author.name} />
                <AvatarFallback>{post.author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">{post.author.name}</span>
                  {post.author.verified && (
                    <Badge variant="default" className="px-1 py-0 h-5 bg-blue-500">
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"/>
                      </svg>
                    </Badge>
                  )}
                </div>
                <div className="text-muted-foreground">
                  <span>@{post.author.username}</span>
                  <span className="mx-1">·</span>
                  <span>{post.createdAt}</span>
                </div>
              </div>

              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Replying To Indicator for replies */}
            {post.parentId && allPosts[post.parentId] && (
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <div>
                  Replying to <span className="text-blue-500">@{allPosts[post.parentId].author.username}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/app/post/${post.threadId || post.parentId}`)}
                  className="text-blue-500 hover:text-blue-600 p-0 h-auto font-normal"
                >
                  Show this thread
                </Button>
              </div>
            )}

            {/* Post Content */}
            <div className="text-lg leading-relaxed">
              {post.content}
            </div>

            {/* Post Media */}
            {post.media && post.media.length > 0 && (
              <div className="space-y-3">
                {post.media.map((media, index) => (
                  <div key={index} className="rounded-lg overflow-hidden">
                    {media.type === 'image' && (
                      <img
                        src={media.url}
                        alt={media.alt || 'Post image'}
                        className="w-full object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Post Stats */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground pt-4 border-t">
              <span><strong>{post.likes}</strong> likes</span>
              <span><strong>{post.comments}</strong> replies</span>
              <span><strong>{post.shares}</strong> shares</span>
              <span><strong>{post.gifts}</strong> gifts</span>
            </div>

            {/* Post Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLike(post.id, true)}
                className={cn(
                  "flex items-center gap-2",
                  post.liked && "text-red-500"
                )}
              >
                <Heart className={cn("h-5 w-5", post.liked && "fill-current")} />
                <span>{post.likes}</span>
              </Button>

              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                <span>{post.comments}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => handleShare(post.id, true)}
              >
                <Share2 className="h-5 w-5" />
                <span>{post.shares}</span>
              </Button>

              <VirtualGiftsAndTips
                recipientId={post.author.username}
                recipientName={post.author.name}
                contentId={post.id}
                trigger={
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "flex items-center gap-2",
                      post.gifted && "text-purple-500"
                    )}
                  >
                    <Gift className={cn("h-5 w-5", post.gifted && "fill-current")} />
                    <span>{post.gifts}</span>
                  </Button>
                }
              />

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBookmark(post.id, true)}
              >
                <Bookmark className={cn("h-5 w-5", post.bookmarked && "fill-current")} />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Comment Form */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.avatar || '/placeholder.svg'} />
                <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-3">
                <Textarea
                  placeholder="Post your reply..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="min-h-[100px] text-lg resize-none border-none focus:ring-0 p-0"
                />

                {/* Image Preview */}
                {commentImages.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {commentImages.map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Comment image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 h-6 w-6 p-0 bg-black/50 hover:bg-black/70 text-white"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="comment-image-upload"
                    />
                    <label htmlFor="comment-image-upload">
                      <Button variant="ghost" size="sm" className="text-blue-500" asChild>
                        <span className="cursor-pointer">
                          <ImageIcon className="h-5 w-5" />
                        </span>
                      </Button>
                    </label>
                  </div>

                  <Button
                    onClick={handleSubmitComment}
                    disabled={!commentText.trim() && commentImages.length === 0}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6"
                  >
                    Reply
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comments */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <Card 
              key={comment.id} 
              className="cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => handleCommentClick(comment.id)}
            >
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={comment.author.avatar} />
                    <AvatarFallback>{comment.author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{comment.author.name}</span>
                      {comment.author.verified && (
                        <Badge variant="default" className="px-1 py-0 h-4 bg-blue-500">
                          <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"/>
                          </svg>
                        </Badge>
                      )}
                      <span className="text-muted-foreground text-sm">@{comment.author.username}</span>
                      <span className="text-muted-foreground text-sm">·</span>
                      <span className="text-muted-foreground text-sm">{comment.createdAt}</span>
                    </div>

                    <p className="mb-3">{comment.content}</p>

                    {/* Comment Media */}
                    {comment.media && comment.media.length > 0 && (
                      <div className="mb-3 grid grid-cols-2 gap-2">
                        {comment.media.map((media, index) => (
                          <img
                            key={index}
                            src={media.url}
                            alt={media.alt || 'Comment image'}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(comment.id);
                        }}
                        className={cn(
                          "flex items-center gap-1 text-muted-foreground hover:text-red-500 transition-colors",
                          comment.liked && "text-red-500"
                        )}
                      >
                        <Heart className={cn("h-4 w-4", comment.liked && "fill-current")} />
                        <span>{comment.likes}</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1 text-muted-foreground hover:text-blue-500 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>{comment.replies}</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(comment.id);
                        }}
                        className="flex items-center gap-1 text-muted-foreground hover:text-green-500 transition-colors"
                      >
                        <Share2 className="h-4 w-4" />
                        <span>{comment.shares}</span>
                      </Button>

                      <VirtualGiftsAndTips
                        recipientId={comment.author.username}
                        recipientName={comment.author.name}
                        contentId={comment.id}
                        trigger={
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "flex items-center gap-1 text-muted-foreground hover:text-purple-500 transition-colors",
                              comment.gifted && "text-purple-500"
                            )}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Gift className={cn("h-4 w-4", comment.gifted && "fill-current")} />
                            <span>{comment.gifts}</span>
                          </Button>
                        }
                      />

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookmark(comment.id);
                        }}
                        className={cn(
                          "text-muted-foreground hover:text-blue-500 transition-colors",
                          comment.bookmarked && "text-blue-500"
                        )}
                      >
                        <Bookmark className={cn("h-4 w-4", comment.bookmarked && "fill-current")} />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        {comments.length > 0 && (
          <div className="text-center py-6">
            <Button variant="outline">
              Load more replies
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostDetail;
