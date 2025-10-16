import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Users,
  Settings,
  Edit3,
  Camera,
  Phone,
  Video,
  Link,
  Share,
  Star,
  Archive,
  Trash2,
  ExternalLink,
  Copy,
  MoreVertical,
  Crown,
  Shield,
  Calendar,
  MessageSquare,
  X,
  Check,
  UserMinus,
  UserPlus,
  Volume2,
  VolumeX,
  Pin,
  PinOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { GroupChatThread, GroupParticipant, UpdateGroupRequest } from "@/types/group-chat";
import { useWebSocketChat } from "@/hooks/use-websocket-chat";

interface GroupInfoModalProps {
  trigger: React.ReactNode;
  group: GroupChatThread;
  currentUserId: string;
  onUpdateGroup?: (request: UpdateGroupRequest) => Promise<void>;
  onLeaveGroup?: (groupId: string) => Promise<void>;
  onDeleteGroup?: (groupId: string) => Promise<void>;
  onRemoveMember?: (groupId: string, userId: string) => Promise<void>;
  onPromoteMember?: (groupId: string, userId: string) => Promise<void>;
  onDemoteMember?: (groupId: string, userId: string) => Promise<void>;
  onToggleMute?: (groupId: string, mute: boolean) => Promise<void>;
  onTogglePin?: (groupId: string, pin: boolean) => Promise<void>;
  onCreateInviteLink?: (groupId: string) => Promise<string>;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const GroupInfoModal: React.FC<GroupInfoModalProps> = ({
  trigger,
  group,
  currentUserId,
  onUpdateGroup,
  onLeaveGroup,
  onDeleteGroup,
  onRemoveMember,
  onPromoteMember,
  onDemoteMember,
  onToggleMute,
  onTogglePin,
  onCreateInviteLink,
  isOpen: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Modal state
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const onOpenChange = controlledOnOpenChange || setInternalOpen;

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(group.groupName || "");
  const [editDescription, setEditDescription] = useState(group.groupDescription || "");
  const [editAvatar, setEditAvatar] = useState(group.groupAvatar);
  const [isUpdating, setIsUpdating] = useState(false);

  // Invite link state
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [isCreatingLink, setIsCreatingLink] = useState(false);

  // Check permissions
  const currentUser = (group.participants || []).find(p => p.id === currentUserId);
  const isAdmin = currentUser?.role === 'admin';
  const isCreator = group.createdBy === currentUserId;
  const canEditInfo = isAdmin && group.settings?.whoCanEditGroupInfo === 'admins_only';
  const canRemoveMembers = isAdmin;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please choose an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setEditAvatar(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async () => {
    if (!onUpdateGroup) return;

    setIsUpdating(true);
    try {
      await onUpdateGroup({
        groupId: group.id,
        name: editName.trim(),
        description: editDescription.trim() || undefined,
        avatar: editAvatar || undefined,
      });

      setIsEditing(false);
      toast({
        title: "Group updated",
        description: "Group information has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating group:", error);
      toast({
        title: "Update failed",
        description: "Failed to update group information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditName(group.groupName || "");
    setEditDescription(group.groupDescription || "");
    setEditAvatar(group.groupAvatar);
    setIsEditing(false);
  };

  const handleCreateInviteLink = async () => {
    if (!onCreateInviteLink) return;

    setIsCreatingLink(true);
    try {
      const link = await onCreateInviteLink(group.id);
      setInviteLink(link);
      toast({
        title: "Invite link created",
        description: "Share this link to invite people to the group.",
      });
    } catch (error) {
      console.error("Error creating invite link:", error);
      toast({
        title: "Failed to create invite link",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingLink(false);
    }
  };

  const handleCopyInviteLink = async () => {
    if (inviteLink) {
      try {
        await navigator.clipboard.writeText(inviteLink);
        toast({
          title: "Link copied",
          description: "Invite link has been copied to clipboard.",
        });
      } catch (error) {
        console.error("Error copying link:", error);
        toast({
          title: "Copy failed",
          description: "Failed to copy link to clipboard.",
          variant: "destructive",
        });
      }
    }
  };

  const handleMemberAction = async (action: string, userId: string) => {
    try {
      switch (action) {
        case "remove":
          if (onRemoveMember) {
            await onRemoveMember(group.id, userId);
            toast({
              title: "Member removed",
              description: "Member has been removed from the group.",
            });
          }
          break;
        case "promote":
          if (onPromoteMember) {
            await onPromoteMember(group.id, userId);
            toast({
              title: "Member promoted",
              description: "Member has been promoted to admin.",
            });
          }
          break;
        case "demote":
          if (onDemoteMember) {
            await onDemoteMember(group.id, userId);
            toast({
              title: "Member demoted",
              description: "Admin has been demoted to member.",
            });
          }
          break;
      }
    } catch (error) {
      console.error(`Error ${action} member:`, error);
      toast({
        title: `Failed to ${action} member`,
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const activeMembers = (group.participants || []).filter(p => p.isActive);
  const onlineMembers = activeMembers.filter(p => p.isOnline);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Group Info
            </DialogTitle>
            <div className="flex items-center gap-2">
              {(canEditInfo || isCreator) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  {isEditing ? "Cancel" : "Edit"}
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onTogglePin?.(group.id, !group.isPinned)}>
                    {group.isPinned ? <PinOff className="h-4 w-4 mr-2" /> : <Pin className="h-4 w-4 mr-2" />}
                    {group.isPinned ? "Unpin Group" : "Pin Group"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onToggleMute?.(group.id, !group.isMuted)}>
                    {group.isMuted ? <Volume2 className="h-4 w-4 mr-2" /> : <VolumeX className="h-4 w-4 mr-2" />}
                    {group.isMuted ? "Unmute" : "Mute"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Archive className="h-4 w-4 mr-2" />
                    Archive Group
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onLeaveGroup?.(group.id)} className="text-destructive">
                    <UserMinus className="h-4 w-4 mr-2" />
                    Leave Group
                  </DropdownMenuItem>
                  {isCreator && (
                    <>
                      <DropdownMenuSeparator />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Group
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Group</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{group.groupName}"? This action cannot be undone and all messages will be lost.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDeleteGroup?.(group.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete Group
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6 p-1">
            {/* Group Header */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={isEditing ? editAvatar : group.groupAvatar} alt={group.groupName} />
                  <AvatarFallback className="text-2xl">
                    {getInitials(isEditing ? editName : (group.groupName || "Group"))}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1.5 hover:bg-primary/90"
                  >
                    <Camera className="h-3 w-3" />
                  </button>
                )}
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Group name"
                      className="font-semibold text-lg"
                    />
                    <Textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Group description..."
                      className="min-h-16 resize-none"
                      rows={2}
                    />
                  </div>
                ) : (
                  <div>
                    <h2 className="text-xl font-semibold">{group.groupName || "Unnamed Group"}</h2>
                    {group.groupDescription && (
                      <p className="text-muted-foreground mt-1">{group.groupDescription}</p>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-muted-foreground">
                    {activeMembers.length} members
                  </span>
                  {onlineMembers.length > 0 && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-sm text-green-600">
                        {onlineMembers.length} online
                      </span>
                    </>
                  )}
                  <Badge variant="outline" className="text-xs capitalize">
                    {group.category || 'general'}
                  </Badge>
                  <Badge variant="outline" className="text-xs capitalize">
                    {group.groupType ? group.groupType.replace('_', ' ') : 'private'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Edit Actions */}
            {isEditing && (
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button onClick={handleSaveChanges} disabled={isUpdating}>
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-3">
              <Button
                variant="outline"
                className="flex flex-col gap-2 h-auto py-3 hover:bg-muted/50 transition-colors"
                onClick={() => {
                  // Check if WebSocket is available, otherwise show fallback message
                  if (typeof window !== 'undefined' && 'WebSocket' in window) {
                    toast({
                      title: "Voice Call",
                      description: "Starting voice call...",
                    });
                    // Call functionality will be implemented with WebSocket
                  } else {
                    toast({
                      title: "Voice Call",
                      description: "Voice calls will be available when WebSocket is connected",
                    });
                  }
                }}
              >
                <Phone className="h-5 w-5" />
                <span className="text-xs">Call</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col gap-2 h-auto py-3 hover:bg-muted/50 transition-colors"
                onClick={() => {
                  // Check if WebSocket is available, otherwise show fallback message
                  if (typeof window !== 'undefined' && 'WebSocket' in window) {
                    toast({
                      title: "Video Call",
                      description: "Starting video call...",
                    });
                    // Video call functionality will be implemented with WebSocket
                  } else {
                    toast({
                      title: "Video Call",
                      description: "Video calls will be available when WebSocket is connected",
                    });
                  }
                }}
              >
                <Video className="h-5 w-5" />
                <span className="text-xs">Video</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col gap-2 h-auto py-3 hover:bg-muted/50 transition-colors"
                onClick={handleCreateInviteLink}
                disabled={isCreatingLink}
              >
                <Link className="h-5 w-5" />
                <span className="text-xs">
                  {isCreatingLink ? "..." : "Invite"}
                </span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col gap-2 h-auto py-3 hover:bg-muted/50 transition-colors"
                onClick={async () => {
                  try {
                    const shareData = {
                      title: `Join ${group.groupName}`,
                      text: `You're invited to join ${group.groupName} on Eloity`,
                      url: inviteLink || window.location.href,
                    };

                    if (navigator.share && navigator.canShare?.(shareData)) {
                      await navigator.share(shareData);
                    } else {
                      // Fallback: copy to clipboard
                      const shareText = `Join ${group.groupName} on Eloity: ${inviteLink || window.location.href}`;
                      await navigator.clipboard.writeText(shareText);
                      toast({
                        title: "Share link copied",
                        description: "Group share link copied to clipboard",
                      });
                    }
                  } catch (error) {
                    console.error('Share failed:', error);
                    toast({
                      title: "Share failed",
                      description: "Could not share group link",
                      variant: "destructive",
                    });
                  }
                }}
              >
                <Share className="h-5 w-5" />
                <span className="text-xs">Share</span>
              </Button>
            </div>

            {/* Invite Link */}
            {inviteLink && (
              <div className="p-4 border border-border rounded-lg bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">Invite Link</h4>
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {inviteLink}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={handleCopyInviteLink}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <Separator />

            {/* Group Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{group.totalMessages || 0}</div>
                <div className="text-xs text-muted-foreground">Messages</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{activeMembers.length}</div>
                <div className="text-xs text-muted-foreground">Members</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {group.createdAt ? format(new Date(group.createdAt), 'MMM d') : 'N/A'}
                </div>
                <div className="text-xs text-muted-foreground">Created</div>
              </div>
            </div>

            <Separator />

            {/* Members List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Members</h3>
                {canRemoveMembers && (
                  <Button size="sm" variant="outline">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Members
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {activeMembers.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                      </Avatar>
                      {member.isOnline && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{member.name}</span>
                        {member.role === 'admin' && (
                          <Crown className="h-4 w-4 text-yellow-500" />
                        )}
                        {member.id === group.createdBy && (
                          <Badge variant="outline" className="text-xs">Creator</Badge>
                        )}
                        {member.id === currentUserId && (
                          <Badge variant="outline" className="text-xs">You</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {member.customTitle || (member.role === 'admin' ? 'Admin' : 'Member')}
                        {member.joinedAt && ` • Joined ${format(new Date(member.joinedAt), 'MMM d, yyyy')}`}
                      </p>
                    </div>
                    {canRemoveMembers && member.id !== currentUserId && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {member.role === 'member' ? (
                            <DropdownMenuItem onClick={() => handleMemberAction('promote', member.id)}>
                              <Crown className="h-4 w-4 mr-2" />
                              Promote to Admin
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleMemberAction('demote', member.id)}>
                              <Shield className="h-4 w-4 mr-2" />
                              Remove Admin
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleMemberAction('remove', member.id)}
                            className="text-destructive"
                          >
                            <UserMinus className="h-4 w-4 mr-2" />
                            Remove from Group
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Group Details */}
            <div className="space-y-4 text-sm">
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground">Created by</span>
                  <div className="font-medium mt-1">
                    {activeMembers.find(m => m.id === group.createdBy)?.name || 'Unknown'}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Created on</span>
                  <div className="font-medium mt-1">
                    {group.createdAt ? format(new Date(group.createdAt), 'MMM d, yyyy') : 'Unknown'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </DialogContent>
    </Dialog>
  );
};
