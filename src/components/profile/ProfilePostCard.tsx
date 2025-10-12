import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageSquare, Share2, Gift, Bookmark, Lock, Users, Globe } from "lucide-react";
import { cn } from "@/utils/utils";
import { PostActionsMenu } from "./PostActionsMenu";
import EnhancedShareDialog from "@/components/feed/EnhancedShareDialog";
import { EnhancedCommentsSection } from "@/components/feed/EnhancedCommentsSection";
import VirtualGiftsAndTips from "@/components/premium/VirtualGiftsAndTips";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface PostAuthor {
  id: string;
  name: string;
  username: string;
  avatar: string;
  verified: boolean;
}

interface Post {
  id: string;
  content: string;
  image?: string;
  createdAt: string;
  likes: number;
  comments: number;
  shares: number;
  privacy: string;
  author: PostAuthor;
  _liked?: boolean;
  _saved?: boolean;
}

interface ProfilePostCardProps {
  post: Post;
  isOwnPost: boolean;
  onDelete?: (postId: string) => void;
  onPrivacyChange?: (postId: string, privacy: string) => void;
  onLikeToggle?: (postId: string, newLikeCount: number, isLiked: boolean) => void;
  onSaveToggle?: (postId: string, isSaved: boolean) => void;
}

export const ProfilePostCard = ({
  post,
  isOwnPost,
  onDelete,
  onPrivacyChange,
  onLikeToggle,
  onSaveToggle,
}: ProfilePostCardProps) => {
  const { toast } = useToast();
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(post._liked || false);
  const [isSaved, setIsSaved] = useState(post._saved || false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const { user } = useAuth();

  const handleLike = async () => {
    const newIsLiked = !isLiked;
    const newCount = newIsLiked ? likeCount + 1 : Math.max(0, likeCount - 1);

    // Optimistic UI update
    setIsLiked(newIsLiked);
    setLikeCount(newCount);
    onLikeToggle?.(post.id, newCount, newIsLiked);

    const likerId = user?.id || post.author.id;

    try {
      if (newIsLiked) {
        await supabase.from("post_likes").insert({
          post_id: post.id,
          user_id: likerId,
        });
      } else {
        await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", likerId);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      // Revert on error
      setIsLiked(!newIsLiked);
      setLikeCount(post.likes ?? 0);
      onLikeToggle?.(post.id, post.likes ?? 0, !newIsLiked);
    }
  };

  const handleSave = async () => {
    const newIsSaved = !isSaved;
    setIsSaved(newIsSaved);
    onSaveToggle?.(post.id, newIsSaved);

    toast({
      title: newIsSaved ? "Post saved" : "Post unsaved",
      description: newIsSaved
        ? "Added to your saved posts"
        : "Removed from saved posts",
    });
  };

  const getPrivacyIcon = () => {
    switch (post.privacy.toLowerCase()) {
      case "public":
        return <Globe className="h-3 w-3" />;
      case "friends":
        return <Users className="h-3 w-3" />;
      case "private":
        return <Lock className="h-3 w-3" />;
      default:
        return <Globe className="h-3 w-3" />;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={post.author.avatar} alt={post.author.name} />
            <AvatarFallback>
              {post.author.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm flex-wrap">
                  <span className="font-medium">{post.author.name}</span>
                  <span className="text-muted-foreground">
                    @{post.author.username}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">
                    {post.createdAt}
                  </span>
                  <Badge
                    variant="outline"
                    className="h-5 px-1.5 text-xs flex items-center gap-1"
                  >
                    {getPrivacyIcon()}
                    {post.privacy}
                  </Badge>
                </div>
                <PostActionsMenu
                  postId={post.id}
                  isOwnPost={isOwnPost}
                  currentPrivacy={post.privacy}
                  onDelete={() => onDelete?.(post.id)}
                  onPrivacyChange={(privacy: string) =>
                    onPrivacyChange?.(post.id, privacy)
                  }
                  onEdit={() => {}}
                />
              </div>
              {post.content && <p className="mt-2">{post.content}</p>}
            </div>

            {post.image && (
              <div className="rounded-lg overflow-hidden">
                <img
                  src={post.image}
                  alt="Post image"
                  className="w-full h-auto max-h-96 object-cover"
                />
              </div>
            )}

            <div className="pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 sm:gap-3 flex-wrap">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "flex items-center gap-1 px-2 py-1.5 h-auto",
                      isLiked && "text-red-500"
                    )}
                    onClick={handleLike}
                  >
                    <Heart
                      className={cn("w-4 h-4", isLiked && "fill-current")}
                    />
                    <span className="text-xs sm:text-sm">{likeCount}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowComments(!showComments)}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1.5 h-auto",
                      showComments && "text-blue-500"
                    )}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-xs sm:text-sm">{post.comments}</span>
                  </Button>

                  <EnhancedShareDialog
                    postId={post.id}
                    postContent={post.content}
                    postAuthor={{
                      name: post.author.name,
                      username: post.author.username,
                    }}
                    trigger={
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1 px-2 py-1.5 h-auto hover:text-green-500 transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                        <span className="text-xs sm:text-sm">{post.shares}</span>
                      </Button>
                    }
                  />

                  <VirtualGiftsAndTips
                    recipientId={post.author.id}
                    recipientName={post.author.name}
                    trigger={
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1 px-2 py-1.5 h-auto text-yellow-600 hover:text-yellow-700"
                      >
                        <Gift className="w-4 h-4" />
                        <span className="text-xs sm:text-sm hidden sm:inline">
                          Gift
                        </span>
                      </Button>
                    }
                  />
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "px-2 py-1.5 h-auto",
                    isSaved && "text-blue-500"
                  )}
                  onClick={handleSave}
                >
                  <Bookmark
                    className={cn("w-4 h-4", isSaved && "fill-current")}
                  />
                </Button>
              </div>

              {showComments && (
                <div className="mt-4 border-t pt-4">
                  <EnhancedCommentsSection
                    postId={post.id}
                    isVisible={showComments}
                    commentsCount={post.comments}
                    onCommentsCountChange={() => {}}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
