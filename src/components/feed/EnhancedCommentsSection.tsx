// @ts-nocheck
// src/components/feed/EnhancedCommentsSection.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Heart,
  Send,
  MessageCircle,
  MoreHorizontal,
  Reply,
  ThumbsUp,
  Flag,
  Gift,
} from "lucide-react";
import { Comment, feedService } from "@/services/feedService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import VirtualGiftsAndTips from "@/components/premium/VirtualGiftsAndTips";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EnhancedCommentsSectionProps {
  postId: string;
  isVisible: boolean;
  commentsCount: number;
  onCommentsCountChange: (count: number) => void;
}

export function EnhancedCommentsSection({
  postId,
  isVisible,
  commentsCount,
  onCommentsCountChange,
}: EnhancedCommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  // Load comments when section becomes visible
  useEffect(() => {
    if (isVisible && comments.length === 0) {
      loadComments();
    }
  }, [isVisible, postId]);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const loadedComments = await feedService.getComments(postId);
      setComments(loadedComments);
    } catch (error) {
      toast({
        title: "Failed to load comments",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const comment = await feedService.addComment(postId, newComment);
      setComments((prev) => [...prev, comment]);
      setNewComment("");
      onCommentsCountChange(commentsCount + 1);

      toast({
        title: "Comment added!",
        description: "Your comment has been posted.",
      });
    } catch (error) {
      toast({
        title: "Failed to add comment",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              isLiked: !comment.isLiked,
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
            }
          : comment,
      ),
    );

    // In a real app, you'd make an API call here
    try {
      // await feedService.toggleCommentLike(commentId);
    } catch (error) {
      // Revert the optimistic update on error
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                isLiked: !comment.isLiked,
                likes: comment.isLiked ? comment.likes + 1 : comment.likes - 1,
              }
            : comment,
        ),
      );
    }
  };

  const handleReply = (commentId: string, userName: string) => {
    setReplyingTo(commentId);
    setReplyText(`@${userName} `);
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const reply = await feedService.addComment(postId, replyText);
      setComments((prev) => [...prev, reply]);
      setReplyText("");
      setReplyingTo(null);
      onCommentsCountChange(commentsCount + 1);

      toast({
        title: "Reply added!",
        description: "Your reply has been posted.",
      });
    } catch (error) {
      toast({
        title: "Failed to add reply",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="space-y-4 pt-4 border-t border-gray-100">
      {/* Comments Header */}
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm text-gray-900">
          Comments ({comments.length})
        </h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={loadComments}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Refresh"}
        </Button>
      </div>

      {/* Add Comment */}
      <div className="flex items-start gap-3">
        <Avatar className="w-8 h-8">
          <AvatarImage
            src={
              user?.avatar ||
              "https://api.dicebear.com/7.x/avataaars/svg?seed=user"
            }
          />
          <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <Input
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAddComment();
              }
            }}
            className="bg-gray-50 border-none rounded-full px-4"
          />
          {newComment.trim() && (
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={handleAddComment}
                disabled={isSubmitting}
                className="bg-blue-500 hover:bg-blue-600 rounded-full px-4"
              >
                {isSubmitting ? "Posting..." : "Post"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Comments List */}
      <ScrollArea className="max-h-96">
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={comment.userAvatar} />
                <AvatarFallback>{comment.userName.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-1">
                <div className="bg-gray-50 rounded-2xl px-3 py-2">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="font-medium text-sm">
                      {comment.userName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {comment.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900">{comment.content}</p>
                </div>

                <div className="flex items-center gap-4 px-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLikeComment(comment.id)}
                    className={cn(
                      "h-auto p-0 text-xs",
                      comment.isLiked
                        ? "text-red-500 font-medium"
                        : "text-gray-500",
                    )}
                  >
                    <Heart
                      className={cn(
                        "w-3 h-3 mr-1",
                        comment.isLiked && "fill-current",
                      )}
                    />
                    {comment.likes > 0 && comment.likes}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReply(comment.id, comment.userName)}
                    className="h-auto p-0 text-xs text-gray-500"
                  >
                    <Reply className="w-3 h-3 mr-1" />
                    Reply
                  </Button>

                  <VirtualGiftsAndTips
                    recipientId={comment.userId}
                    recipientName={comment.userName}
                  />

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-gray-400"
                      >
                        <MoreHorizontal className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="text-xs">
                        <Flag className="w-3 h-3 mr-2" />
                        Report
                      </DropdownMenuItem>
                      {comment.userId === user?.id && (
                        <DropdownMenuItem className="text-xs text-red-500">
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}

          {/* Reply Input */}
          {replyingTo && (
            <div className="flex items-start gap-3 ml-11">
              <Avatar className="w-7 h-7">
                <AvatarImage
                  src={
                    user?.avatar ||
                    "https://api.dicebear.com/7.x/avataaars/svg?seed=user"
                  }
                />
                <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Input
                  placeholder="Write a reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmitReply();
                    }
                  }}
                  className="bg-gray-50 border-none rounded-full px-4 text-sm"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSubmitReply}
                    disabled={isSubmitting || !replyText.trim()}
                    className="bg-blue-500 hover:bg-blue-600 rounded-full px-3 text-xs"
                  >
                    Reply
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyText("");
                    }}
                    className="rounded-full px-3 text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && comments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No comments yet</p>
              <p className="text-xs">Be the first to comment!</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
