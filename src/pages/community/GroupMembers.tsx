import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Crown,
  Shield,
  Search,
  UserMinus,
  UserPlus,
  MessageSquare,
  MoreVertical,
} from "lucide-react";
import { format } from "date-fns";
import GroupService from "@/services/groupService";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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

interface Member {
  id: string;
  user_id: string;
  name: string;
  avatar: string;
  role: "owner" | "admin" | "member";
  joinedAt: string;
  isOnline?: boolean;
}

const GroupMembers: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [actionType, setActionType] = useState<"promote" | "demote" | "remove" | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!groupId || !user) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch all members
        const membersData = await GroupService.getGroupMembers(groupId);
        const transformedMembers: Member[] = membersData.map((member) => ({
          id: member.id,
          user_id: member.user_id,
          name: member.user.full_name || member.user.username || "Unknown User",
          avatar: member.user.avatar_url || "",
          role: member.role as "owner" | "admin" | "member",
          joinedAt: member.joined_at,
          isOnline: Math.random() > 0.5, // Mock online status
        }));

        setMembers(transformedMembers);

        // Determine current user's role
        const currentUserMember = transformedMembers.find((m) => m.user_id === user.id);
        if (currentUserMember) {
          setIsOwner(currentUserMember.role === "owner");
          setIsAdmin(
            currentUserMember.role === "owner" || currentUserMember.role === "admin"
          );
        }
      } catch (err) {
        console.error("Error fetching members:", err);
        setError("Failed to fetch group members");
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [groupId, user]);

  const handleMemberAction = async () => {
    if (!selectedMember || !actionType || !groupId) return;

    try {
      setIsProcessing(true);

      switch (actionType) {
        case "promote":
          await GroupService.promoteMember(groupId, selectedMember.user_id);
          setMembers((prev) =>
            prev.map((m) =>
              m.id === selectedMember.id ? { ...m, role: "admin" } : m
            )
          );
          toast({
            title: "Member Promoted",
            description: `${selectedMember.name} is now an admin.`,
          });
          break;

        case "demote":
          await GroupService.demoteMember(groupId, selectedMember.user_id);
          setMembers((prev) =>
            prev.map((m) =>
              m.id === selectedMember.id ? { ...m, role: "member" } : m
            )
          );
          toast({
            title: "Member Demoted",
            description: `${selectedMember.name} is no longer an admin.`,
          });
          break;

        case "remove":
          await GroupService.removeMember(groupId, selectedMember.user_id);
          setMembers((prev) => prev.filter((m) => m.id !== selectedMember.id));
          toast({
            title: "Member Removed",
            description: `${selectedMember.name} has been removed from the group.`,
          });
          break;
      }
    } catch (error) {
      console.error(`Error performing ${actionType}:`, error);
      toast({
        title: "Error",
        description: `Failed to ${actionType} member. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setShowConfirmDialog(false);
      setSelectedMember(null);
      setActionType(null);
    }
  };

  const handlePromote = (member: Member) => {
    setSelectedMember(member);
    setActionType("promote");
    setShowConfirmDialog(true);
  };

  const handleDemote = (member: Member) => {
    setSelectedMember(member);
    setActionType("demote");
    setShowConfirmDialog(true);
  };

  const handleRemove = (member: Member) => {
    setSelectedMember(member);
    setActionType("remove");
    setShowConfirmDialog(true);
  };

  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onlineCount = members.filter((m) => m.isOnline).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading members...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center px-4">
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{error}</h2>
          <Button
            onClick={() => navigate(-1)}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700";
      case "admin":
        return "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600";
    }
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
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Members
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {members.length} members • {onlineCount} online
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <Input
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        {/* Member Stats Card */}
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-900 dark:to-blue-800 border-0 text-white">
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold">{members.length}</p>
                <p className="text-blue-100 text-sm">Total Members</p>
              </div>
              <div>
                <p className="text-3xl font-bold">
                  {members.filter((m) => m.role === "owner").length}
                </p>
                <p className="text-blue-100 text-sm">Owner</p>
              </div>
              <div>
                <p className="text-3xl font-bold">
                  {members.filter((m) => m.role === "admin").length}
                </p>
                <p className="text-blue-100 text-sm">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Members List */}
        {filteredMembers.length > 0 ? (
          <div className="space-y-3">
            {filteredMembers.map((member) => (
              <Card
                key={member.id}
                className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
              >
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <Avatar className="w-12 h-12 border-2 border-gray-200 dark:border-gray-700">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {member.name}
                          </h3>
                          {member.isOnline && (
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge
                            variant="outline"
                            className={getRoleBadgeColor(member.role)}
                          >
                            {member.role === "owner" && <Crown className="w-3 h-3 mr-1" />}
                            {member.role === "admin" && <Shield className="w-3 h-3 mr-1" />}
                            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                          </Badge>
                          <span className="text-xs text-gray-500 dark:text-gray-500">
                            Joined {format(new Date(member.joinedAt), "MMM d")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        title="Message"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Button>

                      {isAdmin && member.role !== "owner" && member.user_id !== user?.id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                          >
                            {member.role === "member" && (
                              <DropdownMenuItem
                                onClick={() => handlePromote(member)}
                                className="text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              >
                                <UserPlus className="w-4 h-4 mr-2" />
                                Promote to Admin
                              </DropdownMenuItem>
                            )}

                            {member.role === "admin" && (
                              <DropdownMenuItem
                                onClick={() => handleDemote(member)}
                                className="text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/20"
                              >
                                <UserMinus className="w-4 h-4 mr-2" />
                                Demote to Member
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />

                            <DropdownMenuItem
                              onClick={() => handleRemove(member)}
                              className="text-red-600 dark:text-red-400 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <UserMinus className="w-4 h-4 mr-2" />
                              Remove Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="pt-6 text-center">
              <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">No members found</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-white">
              Confirm Action
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              {actionType === "promote" &&
                `Promote ${selectedMember?.name} to admin? They will have permission to manage the group.`}
              {actionType === "demote" &&
                `Demote ${selectedMember?.name} to member? They will lose admin privileges.`}
              {actionType === "remove" &&
                `Remove ${selectedMember?.name} from the group? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-gray-700 dark:text-gray-300">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleMemberAction}
              disabled={isProcessing}
              className={
                actionType === "remove"
                  ? "bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                  : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
              }
            >
              {isProcessing ? "Processing..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GroupMembers;
