// @ts-nocheck
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  MoreHorizontal, 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark,
  Gift,
  Quote,
  Reply,
  ArrowUpRight,
  MessageSquareQuote,
  Sparkles,
  Play,
  Volume2,
  VolumeX
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useHybridFeed, type HybridPost } from "@/contexts/HybridFeedContext";
import { useAuth } from "@/contexts/AuthContext";
import { CompactFollowButton } from "./FollowButton";
import { useEntityFollowHandlers } from "./UnifiedFeedHandlers";
import { useNavigate } from 'react-router-dom';
import VirtualGiftsAndTips from "@/components/premium/VirtualGiftsAndTips";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface HybridPostCardProps {
  post: HybridPost;
  showThread?: boolean;
  isInThread?: boolean;
  onNavigateToPost?: (postId: string) => void;
  viewMode: 'classic' | 'threaded';
}

const HybridPostCard: React.FC<HybridPostCardProps> = ({ 
  post, 
  showThread = false,
  isInThread = false,
  onNavigateToPost,
  viewMode
}) => {
  const {
    toggleLike,
    toggleBookmark,
    toggleGift,
    incrementShares,
    createReplyPost,
    createQuotePost,
    getPostReplies
  } = useHybridFeed();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { handleUserFollow } = useEntityFollowHandlers();
  
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [quoteContent, setQuoteContent] = useState("");
  const [isVideoMuted, setIsVideoMuted] = useState(true);

  const replies = getPostReplies(post.id);
  const isRootPost = !post.parentId;
  const indentLevel = Math.min(post.depth || 0, 3); // Max 3 levels of indentation

  const handleReply = () => {
    if (!user || !replyContent.trim()) return;
    
    createReplyPost(post.id, replyContent, {
      name: user.name || 'User',
      username: user.username || 'user',
      avatar: user.avatar || '/placeholder.svg',
      verified: user.verified || false,
    });
    
    setReplyContent("");
    setShowReplyForm(false);
  };

  const handleQuote = () => {
    if (!user || !quoteContent.trim()) return;
    
    createQuotePost(post.id, quoteContent, {
      name: user.name || 'User',
      username: user.username || 'user',
      avatar: user.avatar || '/placeholder.svg',
      verified: user.verified || false,
    });
    
    setQuoteContent("");
    setShowQuoteForm(false);
  };

  const handleShare = () => {
    incrementShares(post.id);
    navigator.clipboard?.writeText(`/post/${post.id}`);
  };

  const handleNavigateToPost = () => {
    onNavigateToPost?.(post.id);
  };

  const renderMedia = () => {
    if (!post.media || post.media.length === 0) return null;

    return (
      <div className="space-y-3 mt-3">
        {post.media.map((media, index) => (
          <div key={index} className="overflow-hidden rounded-lg">
            {media.type === 'image' ? (
              <img
                src={media.url}
                alt={media.alt || 'Post media'}
                className="w-full object-cover transition-all hover:scale-105"
              />
            ) : media.type === 'video' ? (
              <div className="relative">
                <video
                  src={media.url}
                  poster={media.thumbnail}
                  className="w-full object-cover"
                  muted={isVideoMuted}
                  loop
                  autoPlay
                />
                <div className="absolute bottom-2 right-2 flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-black/50 text-white hover:bg-black/70"
                    onClick={() => setIsVideoMuted(!isVideoMuted)}
                  >
                    {isVideoMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                </div>
                {media.duration && (
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    {media.duration}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={cn(
      "relative",
      viewMode === 'threaded' && indentLevel > 0 && "ml-6 border-l-2 border-muted pl-4",
      viewMode === 'threaded' && post.type === 'reply' && "ml-2"
    )}>
      {/* Thread connection line for replies in threaded mode */}
      {viewMode === 'threaded' && post.isReply && !isInThread && (
        <div className="absolute -left-6 -top-2 w-6 h-4 border-l-2 border-b-2 border-muted rounded-bl-lg" />
      )}

      <Card className={cn(
        "overflow-hidden max-w-full transition-all duration-200",
        viewMode === 'threaded' && post.type === 'reply' && "bg-muted/30",
        viewMode === 'threaded' && post.type === 'quote' && "border-primary/30",
        "hover:shadow-md"
      )}>
        <CardHeader className="pb-3 pt-4 px-4 flex flex-row gap-3 items-start">
          <Avatar
            className="h-9 w-9 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/app/profile/${post.author.username}`);
            }}
          >
            <AvatarImage src={post.author.avatar} alt={post.author.name} />
            <AvatarFallback>{post.author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <span
                className="font-semibold truncate cursor-pointer hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/app/profile/${post.author.username}`);
                }}
              >
                {post.author.name}
              </span>
              {post.author.verified && (
                <Badge variant="default" className="px-1 py-0 h-5 bg-blue-500 hover:bg-blue-600 flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-3 w-3"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Badge>
              )}
              
              {/* Post type indicator for threaded mode */}
              {viewMode === 'threaded' && post.type === 'reply' && (
                <Badge variant="outline" className="px-2 py-0.5 text-xs">
                  <Reply className="h-3 w-3 mr-1" />
                  Reply
                </Badge>
              )}
              {viewMode === 'threaded' && post.type === 'quote' && (
                <Badge variant="outline" className="px-2 py-0.5 text-xs">
                  <Quote className="h-3 w-3 mr-1" />
                  Quote
                </Badge>
              )}
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <span className="truncate">@{post.author.username}</span>
              <span className="mx-1 flex-shrink-0">·</span>
              <span className="flex-shrink-0">{post.createdAt}</span>
              {viewMode === 'threaded' && post.isReply && (
                <>
                  <span className="mx-1 flex-shrink-0">·</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-xs text-blue-500 hover:text-blue-600"
                    onClick={handleNavigateToPost}
                  >
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    View thread
                  </Button>
                </>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 flex-shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {viewMode === 'threaded' && (
                <>
                  <DropdownMenuItem onClick={() => setShowReplyForm(true)}>
                    <Reply className="h-4 w-4 mr-2" />
                    Reply to this post
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowQuoteForm(true)}>
                    <MessageSquareQuote className="h-4 w-4 mr-2" />
                    Quote this post
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleNavigateToPost}>
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    View full thread
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent className="px-4 py-3 text-sm">
          {/* Feeling/Activity */}
          {post.feeling && (
            <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
              <span>{post.feeling.emoji}</span>
              <span>feeling {post.feeling.text}</span>
            </div>
          )}

          <p className="mb-3 break-words leading-relaxed">{post.content}</p>
          
          {/* Quoted post display for threaded mode */}
          {viewMode === 'threaded' && post.type === 'quote' && post.originalPost && (
            <Card className="border border-muted bg-muted/30 p-3 mt-3">
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={post.originalPost.author.avatar} />
                  <AvatarFallback>{post.originalPost.author.name[0]}</AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium">{post.originalPost.author.name}</span>
                <span className="text-xs text-muted-foreground">@{post.originalPost.author.username}</span>
              </div>
              <p className="text-xs">{post.originalPost.content}</p>
            </Card>
          )}
          
          {/* Media content */}
          {renderMedia()}

          {/* Location */}
          {post.location && (
            <div className="flex items-center gap-1 mt-3 text-sm text-muted-foreground">
              <span>📍</span>
              <span>{post.location}</span>
            </div>
          )}
        </CardContent>

        <CardFooter className="px-4 pt-1 pb-3 border-t flex justify-between">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "flex items-center gap-1 text-muted-foreground hover:text-red-500 transition-colors",
              post.liked && "text-red-500"
            )}
            onClick={() => toggleLike(post.id)}
          >
            <Heart className={cn("h-4 w-4", post.liked && "fill-current")} />
            <span>{post.likes}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 text-muted-foreground hover:text-blue-500 transition-colors"
            onClick={() => viewMode === 'threaded' ? setShowReplyForm(true) : undefined}
          >
            <MessageCircle className="h-4 w-4" />
            <span>{post.comments}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 text-muted-foreground hover:text-green-500 transition-colors"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
            <span>{post.shares}</span>
          </Button>

          {/* Enhanced Gift Button with VirtualGiftsAndTips */}
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
              >
                <Gift className={cn("h-4 w-4", post.gifted && "fill-current")} />
                <span>{post.gifts}</span>
              </Button>
            }
          />

          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "text-muted-foreground hover:text-blue-500 transition-colors",
              post.bookmarked && "text-blue-500"
            )}
            onClick={() => toggleBookmark(post.id)}
          >
            <Bookmark className={cn("h-4 w-4", post.bookmarked && "fill-current")} />
          </Button>
        </CardFooter>
      </Card>

      {/* Reply Form Dialog for threaded mode */}
      {viewMode === 'threaded' && (
        <>
          <Dialog open={showReplyForm} onOpenChange={setShowReplyForm}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reply to {post.author.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={post.author.avatar} />
                      <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{post.author.name}</span>
                  </div>
                  <p className="text-sm">{post.content}</p>
                </div>
                <Textarea
                  placeholder="Write your reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowReplyForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleReply} disabled={!replyContent.trim()}>
                    <Reply className="h-4 w-4 mr-2" />
                    Reply
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showQuoteForm} onOpenChange={setShowQuoteForm}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Quote {post.author.name}'s post</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  placeholder="Add your thoughts..."
                  value={quoteContent}
                  onChange={(e) => setQuoteContent(e.target.value)}
                  rows={3}
                />
                <div className="bg-muted p-3 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={post.author.avatar} />
                      <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{post.author.name}</span>
                    <span className="text-sm text-muted-foreground">@{post.author.username}</span>
                  </div>
                  <p className="text-sm">{post.content}</p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowQuoteForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleQuote} disabled={!quoteContent.trim()}>
                    <Quote className="h-4 w-4 mr-2" />
                    Quote Post
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}

      {/* Show thread replies if enabled and in threaded mode */}
      {viewMode === 'threaded' && showThread && replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {replies.slice(0, 3).map((reply) => (
            <HybridPostCard
              key={reply.id}
              post={reply}
              showThread={false}
              isInThread={true}
              onNavigateToPost={onNavigateToPost}
              viewMode={viewMode}
            />
          ))}
          {replies.length > 3 && (
            <Button
              variant="ghost"
              size="sm"
              className="ml-6 text-blue-500"
              onClick={handleNavigateToPost}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              View {replies.length - 3} more replies
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default HybridPostCard;
