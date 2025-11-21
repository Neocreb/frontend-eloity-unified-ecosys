import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MoreHorizontal,
  Flag,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Bell,
  EyeOff,
  UserMinus,
  UserPlus,
  Trash2,
  Edit,
  Clock,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import PostActionsService from "@/services/postActionsService";
import { useNavigate } from "react-router-dom";

interface PostOptionsModalProps {
  postId: string;
  postAuthorId: string;
  postAuthorName: string;
  postAuthorUsername: string;
  postContent: string;
  isFollowing?: boolean;
  isBlocked?: boolean;
  onBlockChange?: (blocked: boolean) => void;
  onFollowChange?: (following: boolean) => void;
  onPostDelete?: () => void;
  onPostEdit?: (content: string) => void;
  trigger?: React.ReactNode;
}

export const PostOptionsModal: React.FC<PostOptionsModalProps> = ({
  postId,
  postAuthorId,
  postAuthorName,
  postAuthorUsername,
  postContent,
  isFollowing = false,
  isBlocked = false,
  onBlockChange,
  onFollowChange,
  onPostDelete,
  onPostEdit,
  trigger,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isOwnPost = user?.id === postAuthorId;

  const [open, setOpen] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditHistoryDialog, setShowEditHistoryDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [editContent, setEditContent] = useState(postContent);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [editHistory, setEditHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [localBlocked, setLocalBlocked] = useState(isBlocked);
  const [localFollowing, setLocalFollowing] = useState(isFollowing);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [preferences, setPreferences] = useState<any>(null);

  useEffect(() => {
    if (open && user?.id) {
      loadPostPreferences();
    }
  }, [open, user?.id, postId]);

  const loadPostPreferences = async () => {
    try {
      const prefs = await PostActionsService.getPostPreferences(postId, user!.id);
      setPreferences(prefs);
      setNotificationsEnabled(prefs?.notifications_enabled || false);
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
  };

  const handleReportPost = async () => {
    if (!user?.id) return;
    if (!reportReason.trim()) {
      toast({
        title: "Error",
        description: "Please select a reason for reporting",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await PostActionsService.reportPost(
        postId,
        user.id,
        reportReason,
        reportDescription
      );

      if (result.success) {
        toast({
          title: "Report Submitted",
          description:
            "Thank you for your report. Our team will review it shortly.",
        });
        setShowReportDialog(false);
        setReportReason("");
        setReportDescription("");
        setOpen(false);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to report post",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkInterested = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const result = await PostActionsService.markInterested(postId, user.id);
      if (result.success) {
        toast({
          title: "Interest Recorded",
          description: "You'll see more posts like this in your feed.",
        });
        await loadPostPreferences();
        setOpen(false);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to record interest",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkNotInterested = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const result = await PostActionsService.markNotInterested(postId, user.id);
      if (result.success) {
        toast({
          title: "Noted",
          description: "You'll see fewer posts like this.",
        });
        await loadPostPreferences();
        setOpen(false);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update preference",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleNotifications = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const result = await PostActionsService.togglePostNotifications(
        postId,
        user.id,
        !notificationsEnabled
      );
      if (result.success) {
        setNotificationsEnabled(!notificationsEnabled);
        toast({
          title: notificationsEnabled ? "Notifications Disabled" : "Notifications Enabled",
          description: notificationsEnabled
            ? "You won't get notifications for this post"
            : "You'll get notifications for new comments and interactions",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update notifications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleHidePost = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const result = await PostActionsService.hidePost(postId, user.id);
      if (result.success) {
        toast({
          title: "Post Hidden",
          description: "This post has been hidden from your feed.",
        });
        setOpen(false);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to hide post",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlockUser = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const result = await PostActionsService.blockUser(user.id, postAuthorId);
      if (result.success) {
        setLocalBlocked(true);
        onBlockChange?.(true);
        toast({
          title: "User Blocked",
          description: `You won't see posts from ${postAuthorName} anymore.`,
        });
        setOpen(false);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to block user",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnblockUser = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const result = await PostActionsService.unblockUser(user.id, postAuthorId);
      if (result.success) {
        setLocalBlocked(false);
        onBlockChange?.(false);
        toast({
          title: "User Unblocked",
          description: `You can now see posts from ${postAuthorName}.`,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to unblock user",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowUser = async () => {
    // Import the follow function from profileService
    try {
      const { toggleFollow } = await import("@/services/profileService");
      if (user?.id) {
        await toggleFollow(user.id, postAuthorId, localFollowing);
        setLocalFollowing(!localFollowing);
        onFollowChange?.(!localFollowing);
        toast({
          title: localFollowing ? "Unfollowed" : "Following",
          description: localFollowing
            ? `You unfollowed ${postAuthorName}`
            : `You are now following ${postAuthorName}`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    }
  };

  const handleViewEditHistory = async () => {
    try {
      const history = await PostActionsService.getPostEditHistory(postId);
      setEditHistory(history);
      setShowEditHistoryDialog(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load edit history",
        variant: "destructive",
      });
    }
  };

  const handleEditPost = async () => {
    if (!editContent.trim()) {
      toast({
        title: "Error",
        description: "Post content cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await PostActionsService.updatePost(postId, {
        content: editContent,
      });

      if (result.success) {
        toast({
          title: "Post Updated",
          description: "Your post has been successfully edited.",
        });
        onPostEdit?.(editContent);
        setShowEditDialog(false);
        setOpen(false);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update post",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePost = async () => {
    setIsLoading(true);
    try {
      const result = await PostActionsService.deletePost(postId);
      if (result.success) {
        toast({
          title: "Post Deleted",
          description: "Your post has been deleted.",
        });
        onPostDelete?.();
        setShowDeleteDialog(false);
        setOpen(false);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete post",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          {trigger || (
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          )}
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          {isOwnPost ? (
            <>
              <DropdownMenuItem
                onClick={() => {
                  setShowEditDialog(true);
                  setEditContent(postContent);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                <span>Edit Post</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
                <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                <span className="text-red-500">Delete Post</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleViewEditHistory}>
                <Clock className="h-4 w-4 mr-2" />
                <span>View Edit History</span>
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem onClick={() => setShowReportDialog(true)}>
                <Flag className="h-4 w-4 mr-2 text-orange-500" />
                <span>Report Post</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleMarkInterested}>
                <ThumbsUp className="h-4 w-4 mr-2 text-green-500" />
                <span>I'm Interested</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleMarkNotInterested}>
                <ThumbsDown className="h-4 w-4 mr-2 text-red-500" />
                <span>Not Interested</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleToggleNotifications}>
                <Bell className="h-4 w-4 mr-2" />
                <span>
                  {notificationsEnabled ? "Disable" : "Enable"} Notifications
                </span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleHidePost}>
                <EyeOff className="h-4 w-4 mr-2" />
                <span>Hide Post</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleFollowUser}>
                {localFollowing ? (
                  <>
                    <UserMinus className="h-4 w-4 mr-2" />
                    <span>Unfollow {postAuthorName}</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    <span>Follow {postAuthorName}</span>
                  </>
                )}
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleBlockUser} disabled={localBlocked}>
                <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                <span className="text-red-500">
                  {localBlocked ? "Blocked" : "Block User"}
                </span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Post Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
            <DialogDescription>
              Make changes to your post content
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Edit your post..."
              className="min-h-32"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleEditPost} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Post Alert Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePost}
              disabled={isLoading}
              className="bg-red-500 hover:bg-red-600"
            >
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Report Post Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Report Post</DialogTitle>
            <DialogDescription>
              Help us understand why you're reporting this post
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">Reason</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm"
              >
                <option value="">Select a reason...</option>
                <option value="spam">Spam or Scam</option>
                <option value="inappropriate">Inappropriate Content</option>
                <option value="harassment">Harassment or Bullying</option>
                <option value="hate_speech">Hate Speech</option>
                <option value="misinformation">Misinformation</option>
                <option value="violence">Violence or Dangerous Behavior</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">
                Additional Details (Optional)
              </label>
              <Textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Provide more context..."
                className="min-h-24"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowReportDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReportPost}
                disabled={isLoading || !reportReason}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {isLoading ? "Submitting..." : "Submit Report"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit History Dialog */}
      <Dialog
        open={showEditHistoryDialog}
        onOpenChange={setShowEditHistoryDialog}
      >
        <DialogContent className="max-w-md max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit History</DialogTitle>
            <DialogDescription>
              View all changes made to this post
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {editHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No edits yet
              </p>
            ) : (
              editHistory.map((edit, index) => (
                <div key={index} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      {new Date(edit.edited_at).toLocaleString()}
                    </span>
                    {index === 0 && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        Latest
                      </span>
                    )}
                  </div>
                  <p className="text-sm">{edit.content}</p>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PostOptionsModal;
