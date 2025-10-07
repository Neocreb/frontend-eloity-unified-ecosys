import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PostComment } from "@/types/user";
import { useAuth } from "@/contexts/AuthContext";
import {
  Heart,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  Smile,
  Gift,
  Image as ImageIcon,
  X,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import VirtualGiftsAndTips from "@/components/premium/VirtualGiftsAndTips";

interface CommentSectionProps {
  postId: string;
  comments: PostComment[];
  onAddComment: (postId: string, comment: string) => void;
}

const CommentSection = ({
  postId,
  comments,
  onAddComment,
}: CommentSectionProps) => {
  const [commentInput, setCommentInput] = useState("");
  const [commentImages, setCommentImages] = useState<File[]>([]);
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<
    Record<string, boolean>
  >({});
  const [showAllReplies, setShowAllReplies] = useState<Record<string, boolean>>(
    {},
  );
  const { user } = useAuth();

  const handleSubmit = () => {
    if (commentInput.trim() || commentImages.length > 0) {
      onAddComment(postId, commentInput);
      setCommentInput("");
      setCommentImages([]);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setCommentImages(prev => [...prev, ...files].slice(0, 4)); // Max 4 images
  };

  const removeImage = (index: number) => {
    setCommentImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleReplySubmit = (commentId: string) => {
    if (replyInputs[commentId]?.trim()) {
      // In a real app, this would call an API to add a reply
      // For now, we'll just simulate it with a notification
      console.log(`Reply to comment ${commentId}: ${replyInputs[commentId]}`);

      // Clear the input
      setReplyInputs({
        ...replyInputs,
        [commentId]: "",
      });

      // Close the reply form
      setExpandedComments({
        ...expandedComments,
        [commentId]: false,
      });
    }
  };

  const toggleReplyForm = (commentId: string) => {
    setExpandedComments({
      ...expandedComments,
      [commentId]: !expandedComments[commentId],
    });
  };

  const toggleShowAllReplies = (commentId: string) => {
    setShowAllReplies({
      ...showAllReplies,
      [commentId]: !showAllReplies[commentId],
    });
  };

  return (
    <div className="px-4 pb-2">
      {comments && comments.length > 0 && (
        <div className="py-2 space-y-3">
          {comments.map((comment) => {
            // Mock replies for demo purposes
            const mockReplies = [
              {
                id: `reply-1-${comment.id}`,
                content: "Thanks for your comment!",
                user: {
                  name: "Reply User 1",
                  avatar: "https://randomuser.me/api/portraits/women/22.jpg",
                  is_verified: false,
                },
                created_at: "10m ago",
                likes: 2,
              },
              {
                id: `reply-2-${comment.id}`,
                content: "I agree with this point.",
                user: {
                  name: "Reply User 2",
                  avatar: "https://randomuser.me/api/portraits/men/22.jpg",
                  is_verified: true,
                },
                created_at: "5m ago",
                likes: 1,
              },
              {
                id: `reply-3-${comment.id}`,
                content: "Interesting perspective!",
                user: {
                  name: "Reply User 3",
                  avatar: "https://randomuser.me/api/portraits/women/23.jpg",
                  is_verified: false,
                },
                created_at: "1m ago",
                likes: 0,
              },
            ];

            const visibleReplies = showAllReplies[comment.id]
              ? mockReplies
              : mockReplies.slice(0, 2);

            return (
              <div key={comment.id} className="space-y-2">
                <div className="flex items-start gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={comment.user.avatar}
                      alt={comment.user.name}
                    />
                    <AvatarFallback>
                      {comment.user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-muted rounded-2xl px-3 py-2">
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-sm">
                          {comment.user.name}
                        </span>
                        {comment.user.is_verified && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3 text-blue-500"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>

                    <div className="flex items-center gap-3 mt-1 ml-2 text-xs text-muted-foreground">
                      <button className="hover:text-foreground">Like</button>
                      <button
                        className="hover:text-foreground"
                        onClick={() => toggleReplyForm(comment.id)}
                      >
                        Reply
                      </button>
                      <VirtualGiftsAndTips
                        recipientId={comment.user_id}
                        recipientName={comment.author?.name || comment.author?.username || 'User'}
                      />
                      <span>2h</span>
                    </div>

                    {/* Reactions */}
                    <div className="flex items-center mt-1 ml-2">
                      <div className="flex -space-x-1">
                        <div className="h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center">
                          <ThumbsUp className="h-2 w-2 text-white" />
                        </div>
                        <div className="h-4 w-4 rounded-full bg-red-500 flex items-center justify-center">
                          <Heart className="h-2 w-2 text-white" />
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground ml-2">
                        12
                      </span>
                    </div>
                  </div>

                  {/* Comment reaction button */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 rounded-full"
                      >
                        <Smile className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="flex p-1 gap-1">
                      <DropdownMenuItem className="cursor-pointer p-1 focus:bg-transparent">
                        <div className="h-8 w-8 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center">
                          <ThumbsUp className="h-4 w-4 text-blue-500" />
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer p-1 focus:bg-transparent">
                        <div className="h-8 w-8 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center">
                          <Heart className="h-4 w-4 text-red-500" />
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Replies */}
                {visibleReplies.length > 0 && (
                  <div className="ml-10 space-y-2">
                    {visibleReplies.map((reply) => (
                      <div key={reply.id} className="flex items-start gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={reply.user.avatar}
                            alt={reply.user.name}
                          />
                          <AvatarFallback>
                            {reply.user.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-muted rounded-2xl px-3 py-2">
                            <div className="flex items-center gap-1">
                              <span className="font-medium text-xs">
                                {reply.user.name}
                              </span>
                              {reply.user.is_verified && (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-2.5 w-2.5 text-blue-500"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </div>
                            <p className="text-xs">{reply.content}</p>
                          </div>

                          <div className="flex items-center gap-3 mt-1 ml-2 text-xs text-muted-foreground">
                            <button className="hover:text-foreground text-[10px]">
                              Like
                            </button>
                            <button className="hover:text-foreground text-[10px]">
                              Reply
                            </button>
                            <span className="text-[10px]">
                              {reply.created_at}
                            </span>
                          </div>

                          {/* Reply reactions */}
                          {reply.likes > 0 && (
                            <div className="flex items-center mt-1 ml-2">
                              <div className="h-3.5 w-3.5 rounded-full bg-blue-500 flex items-center justify-center">
                                <ThumbsUp className="h-2 w-2 text-white" />
                              </div>
                              <span className="text-xs text-muted-foreground ml-1">
                                {reply.likes}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {mockReplies.length > 2 && (
                      <button
                        className="ml-2 text-xs text-blue-500 flex items-center"
                        onClick={() => toggleShowAllReplies(comment.id)}
                      >
                        {showAllReplies[comment.id] ? (
                          <>
                            <ChevronUp className="h-3 w-3 mr-1" />
                            Hide replies
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3 w-3 mr-1" />
                            View {mockReplies.length - 2} more{" "}
                            {mockReplies.length - 2 === 1 ? "reply" : "replies"}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}

                {/* Reply form */}
                {expandedComments[comment.id] && (
                  <div className="ml-10 flex items-center gap-2 mt-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={user?.avatar || "/placeholder.svg"}
                        alt={user?.name || "User"}
                      />
                      <AvatarFallback>
                        {user?.name?.substring(0, 2).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder={`Reply to ${comment.user.name}...`}
                        className="w-full rounded-full bg-muted px-4 py-1.5 text-xs"
                        value={replyInputs[comment.id] || ""}
                        onChange={(e) =>
                          setReplyInputs({
                            ...replyInputs,
                            [comment.id]: e.target.value,
                          })
                        }
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleReplySubmit(comment.id)
                        }
                      />
                      {replyInputs[comment.id]?.trim().length > 0 && (
                        <button
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 text-xs"
                          onClick={() => handleReplySubmit(comment.id)}
                        >
                          Post
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="pt-1 space-y-3">
        {/* Image Preview */}
        {commentImages.length > 0 && (
          <div className="pl-10 grid grid-cols-2 gap-2">
            {commentImages.map((file, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Comment image ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 h-5 w-5 p-0 bg-black/50 hover:bg-black/70 text-white rounded-full"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={user?.avatar || "/placeholder.svg"}
              alt={user?.name || "User"}
            />
            <AvatarFallback>
              {user?.name?.substring(0, 2).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 flex items-center gap-2 rounded-full bg-muted px-4 py-2">
            <input
              type="text"
              placeholder="Add a comment..."
              className="flex-1 bg-transparent text-sm border-none outline-none"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />

            {/* Image Upload */}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              id={`comment-image-upload-${postId}`}
            />
            <label htmlFor={`comment-image-upload-${postId}`}>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-blue-500"
                asChild
              >
                <span className="cursor-pointer">
                  <ImageIcon className="h-4 w-4" />
                </span>
              </Button>
            </label>

            {/* Submit Button */}
            {(commentInput.trim().length > 0 || commentImages.length > 0) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSubmit}
                className="h-6 w-6 p-0 text-blue-500 hover:text-blue-600"
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentSection;
