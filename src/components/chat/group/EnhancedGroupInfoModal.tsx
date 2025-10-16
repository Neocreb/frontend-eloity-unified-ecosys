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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
  Search,
  Bell,
  BellOff,
  Image,
  ChevronRight,
  Info,
  Lock,
  Globe,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { GroupChatThread, GroupParticipant, UpdateGroupRequest } from "@/types/group-chat";

interface EnhancedGroupInfoModalProps {
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

export const EnhancedGroupInfoModal: React.FC<EnhancedGroupInfoModalProps> = ({
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

  // View states
  const [currentView, setCurrentView] = useState<'main' | 'members' | 'media' | 'settings' | 'edit'>('main');
  const [searchMembers, setSearchMembers] = useState("");

  // Edit state
  const [editName, setEditName] = useState(group.groupName);
  const [editDescription, setEditDescription] = useState(group.groupDescription || "");
  const [editAvatar, setEditAvatar] = useState(group.groupAvatar);
  const [isUpdating, setIsUpdating] = useState(false);

  // Settings state
  const [groupSettings, setGroupSettings] = useState(group.settings);

  // Invite link state
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [isCreatingLink, setIsCreatingLink] = useState(false);

  // Check permissions
  const currentUser = group.participants.find(p => p.id === currentUserId);
  const isAdmin = currentUser?.role === 'admin';
  const isCreator = group.createdBy === currentUserId;
  const canEditInfo = isAdmin;
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
        settings: groupSettings,
      });

      setCurrentView('main');
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

  const activeMembers = group.participants.filter(p => p.isActive);
  const onlineMembers = activeMembers.filter(p => p.isOnline);
  const filteredMembers = activeMembers.filter(member =>
    member.name.toLowerCase().includes(searchMembers.toLowerCase())
  );

  const renderHeader = () => (
    <DialogHeader className="border-b pb-4 px-6 pt-6 flex-shrink-0">
      <div className="flex items-center justify-between">
        <DialogTitle className="flex items-center gap-2">
          {currentView === 'main' && <Users className="h-5 w-5" />}
          {currentView === 'members' && <Users className="h-5 w-5" />}
          {currentView === 'settings' && <Settings className="h-5 w-5" />}
          {currentView === 'edit' && <Edit3 className="h-5 w-5" />}
          {currentView === 'media' && <Image className="h-5 w-5" />}

          {currentView === 'main' && "Group Info"}
          {currentView === 'members' && `Members (${activeMembers.length})`}
          {currentView === 'settings' && "Group Settings"}
          {currentView === 'edit' && "Edit Group"}
          {currentView === 'media' && "Media & Files"}
        </DialogTitle>

        <div className="flex items-center gap-2">
          {currentView !== 'main' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView('main')}
            >
              Back
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </DialogHeader>
  );

  const renderMainView = () => (
    <div className="space-y-6">
      {/* Group Header */}
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={group.groupAvatar} alt={group.groupName} />
          <AvatarFallback className="text-2xl">
            {getInitials(group.groupName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{group.groupName}</h2>
          {group.groupDescription && (
            <p className="text-muted-foreground mt-1">{group.groupDescription}</p>
          )}
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span>{activeMembers.length} members</span>
            <span>•</span>
            <span>{onlineMembers.length} online</span>
            <span>•</span>
            <span>Created {format(new Date(group.createdAt), 'MMM d, yyyy')}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3">
        <Button
          variant="outline"
          className="flex flex-col gap-2 h-auto py-4 hover:bg-muted/50 transition-colors"
          onClick={() => {
            // Implement voice call functionality when WebSocket is ready
            toast({
              title: "Voice Call",
              description: "Voice call feature will be available when WebSocket is connected",
            });
          }}
        >
          <Phone className="h-5 w-5" />
          <span className="text-xs">Audio</span>
        </Button>
        <Button
          variant="outline"
          className="flex flex-col gap-2 h-auto py-4 hover:bg-muted/50 transition-colors"
          onClick={() => {
            // Implement video call functionality when WebSocket is ready
            toast({
              title: "Video Call",
              description: "Video call feature will be available when WebSocket is connected",
            });
          }}
        >
          <Video className="h-5 w-5" />
          <span className="text-xs">Video</span>
        </Button>
        <Button
          variant="outline"
          className="flex flex-col gap-2 h-auto py-4 hover:bg-muted/50 transition-colors"
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
          className="flex flex-col gap-2 h-auto py-4 hover:bg-muted/50 transition-colors"
          onClick={async () => {
            try {
              if (navigator.share) {
                await navigator.share({
                  title: `Join ${group.groupName}`,
                  text: `You're invited to join ${group.groupName} on Eloity`,
                  url: inviteLink || window.location.href,
                });
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

      {/* Menu Options */}
      <div className="space-y-1">
        {/* Members */}
        <Button
          variant="ghost"
          className="w-full justify-between h-12"
          onClick={() => setCurrentView('members')}
        >
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5" />
            <span>Members</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{activeMembers.length}</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </Button>

        {/* Media & Files */}
        <Button
          variant="ghost"
          className="w-full justify-between h-12"
          onClick={() => setCurrentView('media')}
        >
          <div className="flex items-center gap-3">
            <Image className="h-5 w-5" />
            <span>Media & Files</span>
          </div>
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Group Settings */}
        {isAdmin && (
          <Button
            variant="ghost"
            className="w-full justify-between h-12"
            onClick={() => setCurrentView('settings')}
          >
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5" />
              <span>Group Settings</span>
            </div>
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}

        <Separator className="my-2" />

        {/* Edit Group */}
        {canEditInfo && (
          <Button
            variant="ghost"
            className="w-full justify-between h-12"
            onClick={() => setCurrentView('edit')}
          >
            <div className="flex items-center gap-3">
              <Edit3 className="h-5 w-5" />
              <span>Edit Group</span>
            </div>
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}

        {/* Mute/Unmute */}
        <Button
          variant="ghost"
          className="w-full justify-between h-12"
          onClick={() => onToggleMute?.(group.id, !group.isMuted)}
        >
          <div className="flex items-center gap-3">
            {group.isMuted ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            <span>{group.isMuted ? "Unmute Group" : "Mute Group"}</span>
          </div>
        </Button>

        {/* Leave Group */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start h-12 text-destructive hover:text-destructive"
            >
              <div className="flex items-center gap-3">
                <UserMinus className="h-5 w-5" />
                <span>Leave Group</span>
              </div>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Leave Group</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to leave "{group.groupName}"? You won't be able to receive messages from this group anymore.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onLeaveGroup?.(group.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Leave Group
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Group (Creator only) */}
        {isCreator && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start h-12 text-destructive hover:text-destructive"
              >
                <div className="flex items-center gap-3">
                  <Trash2 className="h-5 w-5" />
                  <span>Delete Group</span>
                </div>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Group</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{group.groupName}"? This action cannot be undone and all messages will be lost permanently.
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
        )}
      </div>
    </div>
  );

  const renderMembersView = () => (
    <div className="space-y-4">
      {/* Search Members */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search members..."
          value={searchMembers}
          onChange={(e) => setSearchMembers(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Add Members Button */}
      {canRemoveMembers && (
        <Button className="w-full" variant="outline">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Members
        </Button>
      )}

      {/* Members List */}
      <div className="space-y-2">
        {filteredMembers.map((member) => (
          <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50">
            <div className="relative">
              <Avatar className="h-12 w-12">
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

            {/* Member Actions */}
            {canRemoveMembers && member.id !== currentUserId && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message {member.name}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Info className="h-4 w-4 mr-2" />
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {member.role === 'member' ? (
                    <DropdownMenuItem onClick={() => handleMemberAction('promote', member.id)}>
                      <Crown className="h-4 w-4 mr-2" />
                      Make Admin
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
  );

  const renderSettingsView = () => (
    <div className="space-y-6">
      {/* Group Privacy */}
      <div className="space-y-4">
        <h3 className="font-semibold">Group Privacy</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {group.groupType === 'private' ? <Lock className="h-5 w-5" /> : <Globe className="h-5 w-5" />}
              <div>
                <p className="font-medium">Group Type</p>
                <p className="text-sm text-muted-foreground">
                  {group.groupType === 'private' ? 'Private Group' : 'Public Group'}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="capitalize">
              {group.groupType}
            </Badge>
          </div>
        </div>
      </div>

      <Separator />

      {/* Message Permissions */}
      <div className="space-y-4">
        <h3 className="font-semibold">Message Permissions</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Who can send messages</p>
              <p className="text-sm text-muted-foreground">Control who can send messages</p>
            </div>
            <Switch
              checked={groupSettings.whoCanSendMessages === 'everyone'}
              onCheckedChange={(checked) =>
                setGroupSettings(prev => ({
                  ...prev,
                  whoCanSendMessages: checked ? 'everyone' : 'admins_only'
                }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Who can add members</p>
              <p className="text-sm text-muted-foreground">Control who can add new members</p>
            </div>
            <Switch
              checked={groupSettings.whoCanAddMembers === 'everyone'}
              onCheckedChange={(checked) =>
                setGroupSettings(prev => ({
                  ...prev,
                  whoCanAddMembers: checked ? 'everyone' : 'admins_only'
                }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Who can edit group info</p>
              <p className="text-sm text-muted-foreground">Control who can edit group name and description</p>
            </div>
            <Switch
              checked={groupSettings.whoCanEditGroupInfo === 'everyone'}
              onCheckedChange={(checked) =>
                setGroupSettings(prev => ({
                  ...prev,
                  whoCanEditGroupInfo: checked ? 'everyone' : 'admins_only'
                }))
              }
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Advanced Settings */}
      <div className="space-y-4">
        <h3 className="font-semibold">Advanced Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Disappearing messages</p>
              <p className="text-sm text-muted-foreground">Messages disappear after a set time</p>
            </div>
            <Switch
              checked={groupSettings.disappearingMessages}
              onCheckedChange={(checked) =>
                setGroupSettings(prev => ({
                  ...prev,
                  disappearingMessages: checked
                }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Show member notifications</p>
              <p className="text-sm text-muted-foreground">Notify when members join or leave</p>
            </div>
            <Switch
              checked={groupSettings.showMemberAddNotifications}
              onCheckedChange={(checked) =>
                setGroupSettings(prev => ({
                  ...prev,
                  showMemberAddNotifications: checked,
                  showMemberExitNotifications: checked,
                }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Allow member invites</p>
              <p className="text-sm text-muted-foreground">Let members invite others via link</p>
            </div>
            <Switch
              checked={groupSettings.allowMemberInvites}
              onCheckedChange={(checked) =>
                setGroupSettings(prev => ({
                  ...prev,
                  allowMemberInvites: checked
                }))
              }
            />
          </div>
        </div>
      </div>

      {/* Save Settings */}
      <Button
        onClick={handleSaveChanges}
        disabled={isUpdating}
        className="w-full"
      >
        {isUpdating ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );

  const renderEditView = () => (
    <div className="space-y-6">
      {/* Edit Group Photo */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="h-20 w-20">
            <AvatarImage src={editAvatar} alt={editName} />
            <AvatarFallback className="text-2xl">
              {getInitials(editName)}
            </AvatarFallback>
          </Avatar>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-2 hover:bg-primary/90"
          >
            <Camera className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1">
          <h3 className="font-medium">Group Photo</h3>
          <p className="text-sm text-muted-foreground">
            Add a photo to help members identify this group
          </p>
        </div>
      </div>

      {/* Edit Group Name */}
      <div className="space-y-2">
        <Label htmlFor="group-name">Group Name</Label>
        <Input
          id="group-name"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          placeholder="Enter group name"
          maxLength={64}
        />
        <p className="text-xs text-muted-foreground">
          {editName.length}/64 characters
        </p>
      </div>

      {/* Edit Group Description */}
      <div className="space-y-2">
        <Label htmlFor="group-description">Group Description</Label>
        <Textarea
          id="group-description"
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          placeholder="Add a group description..."
          className="min-h-20 resize-none"
          maxLength={500}
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          {editDescription.length}/500 characters
        </p>
      </div>

      {/* Save Changes */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => {
            setEditName(group.groupName);
            setEditDescription(group.groupDescription || "");
            setEditAvatar(group.groupAvatar);
            setCurrentView('main');
          }}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSaveChanges}
          disabled={isUpdating || !editName.trim()}
          className="flex-1"
        >
          {isUpdating ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );

  const renderMediaView = () => (
    <div className="space-y-6">
      <div className="text-center py-12">
        <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <h3 className="font-medium mb-2">No media yet</h3>
        <p className="text-sm text-muted-foreground">
          Photos, videos and files shared in this group will appear here
        </p>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col p-0 gap-0">
        {renderHeader()}
        
        <ScrollArea className="flex-1 px-6 pb-6">
          {currentView === 'main' && renderMainView()}
          {currentView === 'members' && renderMembersView()}
          {currentView === 'settings' && renderSettingsView()}
          {currentView === 'edit' && renderEditView()}
          {currentView === 'media' && renderMediaView()}
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
