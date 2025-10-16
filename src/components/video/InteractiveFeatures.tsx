import React, { useState, useRef, useEffect } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Users,
  Camera,
  Plus,
  Video,
  MessageSquare,
  Send,
  Smile,
  Gift,
  Star,
  Flag,
  MoreHorizontal,
  Reply,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Download,
  ExternalLink,
  PlayCircle,
  Pause,
  Volume2,
  VolumeX,
  Settings,
  X,
  ArrowUp,
  ArrowDown,
  Eye,
  Clock,
  Bookmark,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import VirtualGiftsAndTips from "@/components/premium/VirtualGiftsAndTips";

interface Comment {
  id: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    verified: boolean;
  };
  content: string;
  timestamp: Date;
  likes: number;
  isLiked: boolean;
  replies: Comment[];
  isReported: boolean;
  isPinned: boolean;
}

interface Reaction {
  id: string;
  emoji: string;
  count: number;
  isActive: boolean;
}

interface ShareOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  action: () => void;
}

interface DuetRequest {
  id: string;
  fromUser: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    verified: boolean;
  };
  message: string;
  timestamp: Date;
  status: "pending" | "accepted" | "declined";
}

interface LiveViewerInfo {
  id: string;
  username: string;
  avatar: string;
  joinedAt: Date;
}

interface InteractiveFeaturesProps {
  videoId: string;
  isLiveStream?: boolean;
  allowDuets?: boolean;
  allowComments?: boolean;
  onDuetCreate?: (originalVideoId: string) => void;
  onReplyCreate?: (originalVideoId: string) => void;
  isBattle?: boolean;
  battleData?: {
    creator1: {
      id: string;
      username: string;
      displayName: string;
      avatar: string;
    };
    creator2: {
      id: string;
      username: string;
      displayName: string;
      avatar: string;
    };
  };
}

const mockComments: Comment[] = [
  {
    id: "1",
    user: {
      id: "user1",
      username: "sarah_creator",
      displayName: "Sarah Wilson",
      avatar: "https://i.pravatar.cc/150?u=sarah",
      verified: true,
    },
    content: "This is absolutely amazing! How did you achieve this effect? 🤩",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    likes: 42,
    isLiked: false,
    replies: [
      {
        id: "1-1",
        user: {
          id: "creator",
          username: "video_creator",
          displayName: "Video Creator",
          avatar: "https://i.pravatar.cc/150?u=creator",
          verified: true,
        },
        content:
          "Thanks! I used a combination of lighting and post-processing ✨",
        timestamp: new Date(Date.now() - 1000 * 60 * 3),
        likes: 12,
        isLiked: true,
        replies: [],
        isReported: false,
        isPinned: false,
      },
    ],
    isReported: false,
    isPinned: true,
  },
  {
    id: "2",
    user: {
      id: "user2",
      username: "tech_lover",
      displayName: "Tech Enthusiast",
      avatar: "https://i.pravatar.cc/150?u=tech",
      verified: false,
    },
    content: "Can you make a tutorial on this? Would love to learn! 📚",
    timestamp: new Date(Date.now() - 1000 * 60 * 8),
    likes: 28,
    isLiked: true,
    replies: [],
    isReported: false,
    isPinned: false,
  },
];

const reactions: Reaction[] = [
  { id: "like", emoji: "❤️", count: 1520, isActive: true },
  { id: "laugh", emoji: "😂", count: 340, isActive: false },
  { id: "wow", emoji: "😮", count: 180, isActive: false },
  { id: "angry", emoji: "😡", count: 12, isActive: false },
  { id: "love", emoji: "😍", count: 890, isActive: false },
  { id: "clap", emoji: "👏", count: 450, isActive: false },
];

const InteractiveFeatures: React.FC<InteractiveFeaturesProps> = ({
  videoId,
  isLiveStream = false,
  allowDuets = true,
  allowComments = true,
  onDuetCreate,
  onReplyCreate,
  isBattle = false,
  battleData,
}) => {
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showDuetDialog, setShowDuetDialog] = useState(false);
  const [liveViewers, setLiveViewers] = useState<LiveViewerInfo[]>([]);
  const [viewerCount, setViewerCount] = useState(1247);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<string | null>(null);

  const { toast } = useToast();

  const shareOptions: ShareOption[] = [
    {
      id: "copy",
      name: "Copy Link",
      icon: <Copy className="w-4 h-4" />,
      action: () => {
        navigator.clipboard.writeText(`https://eloity.com/video/${videoId}`);
        toast({ title: "Link copied to clipboard!" });
      },
    },
    {
      id: "whatsapp",
      name: "Share to WhatsApp",
      icon: <MessageCircle className="w-4 h-4" />,
      action: () => {
        window.open(`https://wa.me/?text=Check out this video! https://eloity.com/video/${videoId}`, '_blank');
      },
    },
    {
      id: "telegram",
      name: "Share to Telegram",
      icon: <Send className="w-4 h-4" />,
      action: () => {
        window.open(`https://t.me/share/url?url=https://eloity.com/video/${videoId}&text=Check out this video!`, '_blank');
      },
    },
    {
      id: "twitter",
      name: "Share to Twitter",
      icon: <Share2 className="w-4 h-4" />,
      action: () => {
        window.open(`https://twitter.com/intent/tweet?url=https://eloity.com/video/${videoId}&text=Check out this amazing video!`, '_blank');
      },
    },
    {
      id: "facebook",
      name: "Share to Facebook",
      icon: <Users className="w-4 h-4" />,
      action: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=https://eloity.com/video/${videoId}`, '_blank');
      },
    },
    {
      id: "download",
      name: "Download Video",
      icon: <Download className="w-4 h-4" />,
      action: () => {
        toast({ title: "Download started" });
      },
    },
    {
      id: "embed",
      name: "Embed Code",
      icon: <ExternalLink className="w-4 h-4" />,
      action: () => {
        const embedCode = `<iframe src="https://eloity.com/embed/${videoId}" width="560" height="315" frameborder="0"></iframe>`;
        navigator.clipboard.writeText(embedCode);
        toast({ title: "Embed code copied!" });
      },
    },
    {
      id: "qr",
      name: "Generate QR Code",
      icon: <Star className="w-4 h-4" />,
      action: () => {
        toast({ title: "QR code generated" });
      },
    },
  ];

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      user: {
        id: "current_user",
        username: "current_user",
        displayName: "You",
        avatar: "https://i.pravatar.cc/150?u=current",
        verified: false,
      },
      content: newComment,
      timestamp: new Date(),
      likes: 0,
      isLiked: false,
      replies: [],
      isReported: false,
      isPinned: false,
    };

    if (replyingTo) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === replyingTo ? { ...c, replies: [...c.replies, comment] } : c,
        ),
      );
      setReplyingTo(null);
    } else {
      setComments((prev) => [comment, ...prev]);
    }

    setNewComment("");
    toast({ title: "Comment posted!" });
  };

  const handleCommentLike = (
    commentId: string,
    isReply = false,
    parentId?: string,
  ) => {
    if (isReply && parentId) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? {
                ...c,
                replies: c.replies.map((r) =>
                  r.id === commentId
                    ? {
                        ...r,
                        isLiked: !r.isLiked,
                        likes: r.isLiked ? r.likes - 1 : r.likes + 1,
                      }
                    : r,
                ),
              }
            : c,
        ),
      );
    } else {
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? {
                ...c,
                isLiked: !c.isLiked,
                likes: c.isLiked ? c.likes - 1 : c.likes + 1,
              }
            : c,
        ),
      );
    }
  };

  const handleReactionToggle = (reactionId: string) => {
    // Toggle reaction
    toast({
      title: `Reacted with ${reactions.find((r) => r.id === reactionId)?.emoji}`,
    });
  };

  const handleDuetRequest = (duetStyle: 'side-by-side' | 'react-respond' | 'picture-in-picture') => {
    if (onDuetCreate) {
      onDuetCreate(videoId);
    }
    setShowDuetDialog(false);
    toast({ title: `${duetStyle.replace('-', ' ')} duet creation started!` });
  };

  const handleReplyVideo = () => {
    if (onReplyCreate) {
      onReplyCreate(videoId);
    }
    toast({ title: "Video reply started!" });
  };

  const handleReport = (targetId: string) => {
    setReportTarget(targetId);
    setIsReportDialogOpen(true);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  return (
    <>
      {/* Main Interaction Buttons */}
      <div className="space-y-4">
        {/* Reactions */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm"
            onClick={() => setShowReactions(!showReactions)}
          >
            <Heart className="w-6 h-6" />
          </Button>
          <span className="text-white text-xs mt-1 text-center block">
            {formatNumber(reactions.reduce((sum, r) => sum + r.count, 0))}
          </span>

          {/* Reactions Popup */}
          {showReactions && (
            <div className="absolute bottom-full right-0 mb-2 bg-black/80 backdrop-blur-sm rounded-full p-2 flex gap-1">
              {reactions.map((reaction) => (
                <Button
                  key={reaction.id}
                  variant="ghost"
                  size="sm"
                  className="text-lg hover:scale-125 transition-transform"
                  onClick={() => handleReactionToggle(reaction.id)}
                >
                  {reaction.emoji}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Comments */}
        {allowComments && (
          <div>
            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm"
              onClick={() => setShowComments(true)}
            >
              <MessageCircle className="w-6 h-6" />
            </Button>
            <span className="text-white text-xs mt-1 text-center block">
              {formatNumber(comments.length)}
            </span>
          </div>
        )}

        {/* Share */}
        <div>
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm"
            onClick={() => setShowShareDialog(true)}
          >
            <Share2 className="w-6 h-6" />
          </Button>
          <span className="text-white text-xs mt-1 text-center block">
            Share
          </span>
        </div>

        {/* Gift */}
        <VirtualGiftsAndTips
          recipientId={videoId}
          recipientName={isBattle ? "Battle Creators" : "Creator"}
          contentId={videoId}
          recipientType={isBattle ? "battle" : isLiveStream ? "livestream" : "video"}
          battleData={isBattle ? battleData : undefined}
          trigger={
            <div>
              <Button
                variant="ghost"
                size="icon"
                className="w-12 h-12 rounded-full bg-yellow-500/30 hover:bg-yellow-500/50 text-yellow-200 border-none backdrop-blur-sm"
              >
                <Gift className="w-6 h-6" />
              </Button>
              <span className="text-white text-xs mt-1 text-center block">
                Support
              </span>
            </div>
          }
        />

        {/* Duet/Collaboration */}
        {allowDuets && (
          <div>
            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm"
              onClick={() => {
                if (onDuetCreate) {
                  onDuetCreate(videoId);
                } else {
                  setShowDuetDialog(true);
                }
              }}
            >
              <Users className="w-6 h-6" />
            </Button>
            <span className="text-white text-xs mt-1 text-center block">
              Duet
            </span>
          </div>
        )}



        {/* Live Stream Viewers (if live) */}
        {isLiveStream && (
          <div>
            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 rounded-full bg-red-500/20 hover:bg-red-500/30 text-white border-none backdrop-blur-sm"
            >
              <Eye className="w-6 h-6" />
            </Button>
            <span className="text-white text-xs mt-1 text-center block">
              {formatNumber(viewerCount)}
            </span>
          </div>
        )}
      </div>

      {/* Comments Dialog */}
      <Dialog open={showComments} onOpenChange={setShowComments}>
        <DialogContent className="bg-black border-gray-800 text-white max-w-md h-[600px] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Comments ({comments.length})
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 px-1">
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="space-y-2">
                  <div className="flex gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={comment.user.avatar} />
                      <AvatarFallback>
                        {comment.user.displayName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {comment.user.username}
                        </span>
                        {comment.user.verified && (
                          <div className="w-3 h-3 bg-blue-500 rounded-full" />
                        )}
                        {comment.isPinned && (
                          <Badge variant="secondary" className="text-xs">
                            Pinned
                          </Badge>
                        )}
                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(comment.timestamp)} ago
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-6 px-2"
                          onClick={() => handleCommentLike(comment.id)}
                        >
                          <ThumbsUp
                            className={cn(
                              "w-3 h-3 mr-1",
                              comment.isLiked && "fill-current text-blue-400",
                            )}
                          />
                          {comment.likes}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-6 px-2"
                          onClick={() => setReplyingTo(comment.id)}
                        >
                          <Reply className="w-3 h-3 mr-1" />
                          Reply
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-6 px-2"
                          onClick={() => handleReport(comment.id)}
                        >
                          <Flag className="w-3 h-3" />
                        </Button>
                      </div>

                      {/* Replies */}
                      {comment.replies.length > 0 && (
                        <div className="ml-4 mt-3 space-y-2 border-l border-gray-700 pl-3">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={reply.user.avatar} />
                                <AvatarFallback>
                                  {reply.user.displayName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-xs">
                                    {reply.user.username}
                                  </span>
                                  {reply.user.verified && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                  )}
                                  <span className="text-xs text-gray-400">
                                    {formatDistanceToNow(reply.timestamp)} ago
                                  </span>
                                </div>
                                <p className="text-xs">{reply.content}</p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs h-5 px-1 mt-1"
                                  onClick={() =>
                                    handleCommentLike(
                                      reply.id,
                                      true,
                                      comment.id,
                                    )
                                  }
                                >
                                  <ThumbsUp
                                    className={cn(
                                      "w-2 h-2 mr-1",
                                      reply.isLiked &&
                                        "fill-current text-blue-400",
                                    )}
                                  />
                                  {reply.likes}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Comment Input */}
          <form
            onSubmit={handleCommentSubmit}
            className="flex gap-2 pt-3 border-t border-gray-700"
          >
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={replyingTo ? "Write a reply..." : "Add a comment..."}
              className="flex-1 bg-gray-800 border-gray-600"
            />
            <Button type="submit" size="sm" disabled={!newComment.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>

          {replyingTo && (
            <div className="flex items-center justify-between bg-gray-800 p-2 rounded">
              <span className="text-sm">Replying to comment</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="bg-black border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Share Video</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {shareOptions.map((option) => (
              <Button
                key={option.id}
                variant="ghost"
                className="w-full justify-start"
                onClick={option.action}
              >
                {option.icon}
                <span className="ml-3">{option.name}</span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Duet Dialog */}
      <Dialog open={showDuetDialog} onOpenChange={setShowDuetDialog}>
        <DialogContent className="bg-black border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Create Duet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-400">
              Create a duet video alongside this original content. Choose your
              style:
            </p>
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleDuetRequest('side-by-side')}
              >
                <Users className="w-4 h-4 mr-3" />
                Side-by-side Duet
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleDuetRequest('react-respond')}
              >
                <PlayCircle className="w-4 h-4 mr-3" />
                React & Respond
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleDuetRequest('picture-in-picture')}
              >
                <Camera className="w-4 h-4 mr-3" />
                Picture-in-Picture
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="bg-black border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Report Content</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-400">Why are you reporting this content?</p>
            <div className="space-y-2">
              {[
                "Spam or misleading",
                "Harassment or bullying",
                "Inappropriate content",
                "Copyright violation",
                "Violence or dangerous content",
                "Other",
              ].map((reason) => (
                <Button
                  key={reason}
                  variant="ghost"
                  className="w-full justify-start text-sm"
                  onClick={() => {
                    toast({ title: "Report submitted" });
                    setIsReportDialogOpen(false);
                  }}
                >
                  <AlertCircle className="w-4 h-4 mr-3" />
                  {reason}
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InteractiveFeatures;
