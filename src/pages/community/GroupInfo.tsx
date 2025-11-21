import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Users,
  Lock,
  Globe,
  Shield,
  Settings,
  Edit,
  Trash2,
  LogOut,
  Calendar,
  Copy,
  Check,
  Link as LinkIcon,
} from "lucide-react";
import { format } from "date-fns";
import GroupService from "@/services/groupService";
import { useAuth } from "@/contexts/AuthContext";
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

interface Group {
  id: string;
  name: string;
  description?: string;
  cover_url?: string;
  member_count: number;
  privacy: "public" | "private";
  is_joined?: boolean;
  is_owner?: boolean;
  is_admin?: boolean;
  created_at?: string;
  creator_id: string;
}

const GroupInfo: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const fetchGroupData = async () => {
      if (!groupId || !user) return;

      try {
        setLoading(true);
        setError(null);

        const groupData = await GroupService.getGroupById(groupId, user.id);

        if (!groupData) {
          setError("Group not found");
          return;
        }

        const transformedGroup: Group = {
          id: groupData.id,
          name: groupData.name,
          description: groupData.description || undefined,
          cover_url: groupData.cover_url || undefined,
          member_count: groupData.member_count,
          privacy: groupData.privacy as "public" | "private",
          is_joined: await GroupService.isGroupMember(groupId, user.id),
          is_owner: groupData.creator_id === user.id,
          is_admin: false,
          created_at: groupData.created_at,
          creator_id: groupData.creator_id,
        };

        setGroup(transformedGroup);
      } catch (err) {
        console.error("Error fetching group data:", err);
        setError("Failed to fetch group data");
      } finally {
        setLoading(false);
      }
    };

    fetchGroupData();
  }, [groupId, user]);

  const handleDeleteGroup = async () => {
    if (!groupId) return;

    try {
      setIsDeleting(true);
      await GroupService.deleteGroup(groupId);

      toast({
        title: "Group Deleted",
        description: "The group has been successfully deleted.",
      });

      navigate("/app/community");
    } catch (error) {
      console.error("Error deleting group:", error);
      toast({
        title: "Error",
        description: "Failed to delete group. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!groupId || !user) return;

    try {
      setIsLeaving(true);
      await GroupService.leaveGroup(groupId, user.id);

      toast({
        title: "Left Group",
        description: "You have left the group.",
      });

      navigate("/app/community");
    } catch (error) {
      console.error("Error leaving group:", error);
      toast({
        title: "Error",
        description: "Failed to leave group. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLeaving(false);
      setShowLeaveDialog(false);
    }
  };

  const copyInviteLink = async () => {
    if (!groupId) return;
    const inviteLink = `${window.location.origin}/invite/group/${groupId}`;

    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopiedLink(true);
      toast({
        title: "Link Copied",
        description: "Invite link copied to clipboard.",
      });
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading group information...</p>
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center px-4">
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
            {error || "Group Not Found"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The group you're looking for doesn't exist or couldn't be loaded.
          </p>
          <Button
            onClick={() => navigate("/app/community")}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Community
          </Button>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Group Information</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Group Header Card */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Cover Image */}
          {group.cover_url && (
            <div className="h-32 bg-gradient-to-r from-blue-400 to-blue-600 dark:from-blue-900 dark:to-blue-800 overflow-hidden">
              <img
                src={group.cover_url}
                alt={group.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <Avatar className="w-16 h-16 border-2 border-white dark:border-gray-700">
                  <AvatarImage src={group.cover_url} alt={group.name} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-bold">
                    {getInitials(group.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white break-words">
                    {group.name}
                  </h2>

                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge
                      variant={group.privacy === "public" ? "outline" : "secondary"}
                      className={
                        group.privacy === "public"
                          ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700"
                          : "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700"
                      }
                    >
                      {group.privacy === "public" ? (
                        <>
                          <Globe className="w-3 h-3 mr-1" />
                          Public
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3 mr-1" />
                          Private
                        </>
                      )}
                    </Badge>

                    <Badge variant="outline" className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600">
                      <Users className="w-3 h-3 mr-1" />
                      {group.member_count} Members
                    </Badge>
                  </div>

                  {group.description && (
                    <p className="text-gray-600 dark:text-gray-400 mt-3 text-sm">
                      {group.description}
                    </p>
                  )}

                  {group.created_at && (
                    <div className="flex items-center gap-2 mt-3 text-sm text-gray-500 dark:text-gray-500">
                      <Calendar className="w-4 h-4" />
                      Created {format(new Date(group.created_at), "MMM d, yyyy")}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {group.is_owner || group.is_admin ? (
                <>
                  <Button
                    variant="outline"
                    className="border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    onClick={() => navigate(`/app/community/group/${groupId}/edit`)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Group
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    onClick={() => navigate(`/app/community/group/${groupId}/settings`)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </>
              ) : null}

              <Button
                variant="outline"
                className="border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                onClick={() => navigate(`/app/community/group/${groupId}/members`)}
              >
                <Users className="w-4 h-4 mr-2" />
                Members
              </Button>

              <Button
                variant="outline"
                className="border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                onClick={copyInviteLink}
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Copy Link
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Group Rules Section */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Group Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex gap-3 text-sm">
                <span className="text-blue-600 dark:text-blue-400 font-semibold">1.</span>
                <span className="text-gray-600 dark:text-gray-400">Be respectful to all members</span>
              </li>
              <li className="flex gap-3 text-sm">
                <span className="text-blue-600 dark:text-blue-400 font-semibold">2.</span>
                <span className="text-gray-600 dark:text-gray-400">
                  No spam or self-promotion without permission
                </span>
              </li>
              <li className="flex gap-3 text-sm">
                <span className="text-blue-600 dark:text-blue-400 font-semibold">3.</span>
                <span className="text-gray-600 dark:text-gray-400">
                  Share knowledge and help others learn
                </span>
              </li>
              <li className="flex gap-3 text-sm">
                <span className="text-blue-600 dark:text-blue-400 font-semibold">4.</span>
                <span className="text-gray-600 dark:text-gray-400">
                  Keep discussions relevant to the group topic
                </span>
              </li>
              <li className="flex gap-3 text-sm">
                <span className="text-blue-600 dark:text-blue-400 font-semibold">5.</span>
                <span className="text-gray-600 dark:text-gray-400">
                  No harassment or offensive content
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-red-700 dark:text-red-400">
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {group.is_owner && (
              <Button
                variant="outline"
                className="w-full border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isDeleting ? "Deleting..." : "Delete Group"}
              </Button>
            )}

            {group.is_joined && !group.is_owner && (
              <Button
                variant="outline"
                className="w-full border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                onClick={() => setShowLeaveDialog(true)}
                disabled={isLeaving}
              >
                <LogOut className="w-4 h-4 mr-2" />
                {isLeaving ? "Leaving..." : "Leave Group"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-white">Delete Group</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              Are you sure you want to delete "{group.name}"? This action cannot be undone. All group
              content will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-gray-700 dark:text-gray-300">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGroup}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Leave Confirmation Dialog */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-white">Leave Group</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              Are you sure you want to leave "{group.name}"? You can rejoin anytime if the group is
              public.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-gray-700 dark:text-gray-300">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLeaveGroup}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
            >
              Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GroupInfo;
