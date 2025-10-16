import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
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
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Trash2,
  Edit,
  Lock,
  Globe,
  Users,
  Eye,
  EyeOff,
  Pin,
  Flag,
  Copy,
  Download,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PostActionsMenuProps {
  postId: string;
  isOwnPost: boolean;
  currentPrivacy?: string;
  onDelete?: () => void;
  onPrivacyChange?: (privacy: string) => void;
  onEdit?: () => void;
}

export const PostActionsMenu = ({
  postId,
  isOwnPost,
  currentPrivacy = "public",
  onDelete,
  onPrivacyChange,
  onEdit,
}: PostActionsMenuProps) => {
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;

      toast({
        title: "Post deleted",
        description: "Your post has been successfully deleted.",
      });

      onDelete?.();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handlePrivacyChange = async (privacy: string) => {
    try {
      const { error } = await supabase
        .from("posts")
        .update({ privacy })
        .eq("id", postId);

      if (error) throw error;

      toast({
        title: "Privacy updated",
        description: `Post is now ${privacy}.`,
      });

      onPrivacyChange?.(privacy);
    } catch (error) {
      console.error("Error updating privacy:", error);
      toast({
        title: "Error",
        description: "Failed to update privacy. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied",
      description: "Post link copied to clipboard.",
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {isOwnPost ? (
            <>
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit post
              </DropdownMenuItem>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Eye className="mr-2 h-4 w-4" />
                  Privacy
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem
                    onClick={() => handlePrivacyChange("public")}
                    className={currentPrivacy === "public" ? "bg-accent" : ""}
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    Public
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handlePrivacyChange("friends")}
                    className={currentPrivacy === "friends" ? "bg-accent" : ""}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Friends only
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handlePrivacyChange("private")}
                    className={currentPrivacy === "private" ? "bg-accent" : ""}
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    Only me
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuItem onClick={handleCopyLink}>
                <Copy className="mr-2 h-4 w-4" />
                Copy link
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete post
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem onClick={handleCopyLink}>
                <Copy className="mr-2 h-4 w-4" />
                Copy link
              </DropdownMenuItem>

              <DropdownMenuItem>
                <Flag className="mr-2 h-4 w-4" />
                Report post
              </DropdownMenuItem>

              <DropdownMenuItem>
                <EyeOff className="mr-2 h-4 w-4" />
                Hide post
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your post
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
