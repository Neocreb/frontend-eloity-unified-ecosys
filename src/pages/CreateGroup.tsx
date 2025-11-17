import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from "react-helmet-async";
import { Search, Users, Settings2, Camera, X, ArrowLeft } from 'lucide-react';
import {
  Button,
} from '@/components/ui/button';
import {
  Input,
} from '@/components/ui/input';
import {
  Label,
} from '@/components/ui/label';
import {
  Textarea,
} from '@/components/ui/textarea';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  Checkbox,
} from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Switch,
} from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { CreateGroupRequest, GroupChatSettings } from '@/types/group-chat';
import { ChatParticipant } from '@/types/chat';
import { groupChatService } from '@/services/groupChatService';
import { useAuth } from '@/contexts/AuthContext';
import { UserService } from '@/services/userService';

const CreateGroup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [step, setStep] = useState<'participants' | 'info' | 'settings'>('participants');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupInfo, setGroupInfo] = useState({
    name: '',
    description: '',
    avatar: '',
  });
  const [groupSettings, setGroupSettings] = useState<GroupChatSettings>({
    whoCanSendMessages: 'everyone' as const,
    whoCanAddMembers: 'admins_only' as const,
    whoCanEditGroupInfo: 'admins_only' as const,
    whoCanRemoveMembers: 'admins_only' as const,
    disappearingMessages: false,
    allowMemberInvites: true,
    showMemberAddNotifications: true,
    showMemberExitNotifications: true,
    muteNonAdminMessages: false,
  });
  const [isCreating, setIsCreating] = useState(false);
  const [contacts, setContacts] = useState<ChatParticipant[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);

  // Fetch real contacts (followers and followings) instead of mock data
  useEffect(() => {
    const fetchContacts = async () => {
      if (!user?.id) return;
      
      try {
        setLoadingContacts(true);
        // Fetch followers and followings for the current user
        const [followers, following] = await Promise.all([
          UserService.getUserFollowers(user.id),
          UserService.getUserFollowing(user.id)
        ]);
        
        // Combine and deduplicate followers and followings
        const allContactsMap = new Map();
        
        // Add followers
        followers.forEach((follower: any) => {
          const contactId = follower.id;
          if (contactId && contactId !== user.id) {
            allContactsMap.set(contactId, {
              id: contactId,
              name: follower.full_name || follower.username || 'Unknown User',
              username: follower.username || '',
              avatar: follower.avatar_url || follower.avatar || '',
              status: 'online', // In a real app, this would come from presence service
              lastSeen: new Date().toISOString()
            });
          }
        });
        
        // Add following
        following.forEach((followed: any) => {
          const contactId = followed.id;
          if (contactId && contactId !== user.id) {
            allContactsMap.set(contactId, {
              id: contactId,
              name: followed.full_name || followed.username || 'Unknown User',
              username: followed.username || '',
              avatar: followed.avatar_url || followed.avatar || '',
              status: 'online', // In a real app, this would come from presence service
              lastSeen: new Date().toISOString()
            });
          }
        });
        
        // Convert map to array
        const allContacts = Array.from(allContactsMap.values());
        setContacts(allContacts);
      } catch (error) {
        console.error('Error fetching contacts:', error);
        toast({
          title: "Error",
          description: "Failed to load your contacts. Please try again.",
          variant: "destructive"
        });
        setContacts([]);
      } finally {
        setLoadingContacts(false);
      }
    };

    fetchContacts();
  }, [user?.id]);

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleParticipantToggle = (participantId: string) => {
    setSelectedParticipants(prev =>
      prev.includes(participantId)
        ? prev.filter(id => id !== participantId)
        : [...prev, participantId]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupInfo.name.trim() || selectedParticipants.length === 0) {
      toast({
        title: "Cannot Create Group",
        description: "Please enter a group name and select at least one participant.",
        variant: "destructive"
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to create a group.",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      const request: CreateGroupRequest = {
        name: groupInfo.name.trim(),
        description: groupInfo.description.trim(),
        avatar: groupInfo.avatar,
        participants: selectedParticipants,
        settings: groupSettings,
        createdBy: user.id,
      };

      const newGroup = await groupChatService.createGroup(request);
      
      toast({
        title: "Group Created",
        description: `Successfully created group "${newGroup.groupName}"!`,
      });
      
      // Navigate to the new group chat
      navigate(`/app/chat/${newGroup.id}`);
    } catch (error) {
      console.error('Failed to create group:', error);
      toast({
        title: "Error",
        description: "Failed to create group. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const canProceedFromParticipants = selectedParticipants.length > 0;
  const canProceedFromInfo = groupInfo.name.trim().length > 0;
  const canCreateGroup = canProceedFromParticipants && canProceedFromInfo;

  return (
    <>
      <Helmet>
        <title>Create Group | Eloity</title>
        <meta
          name="description"
          content="Create a new group chat on Eloity"
        />
      </Helmet>
      <div className="h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="border-b p-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="p-1 flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h3 className="text-lg font-semibold">Create Group</h3>
              <p className="text-xs text-muted-foreground">
                {step === 'participants' && 'Add participants to your group'}
                {step === 'info' && 'Set up your group information'}
                {step === 'settings' && 'Configure group settings'}
              </p>
            </div>
          </div>
        </div>

        {/* Step Navigation */}
        <div className="flex items-center justify-center gap-2 py-2 border-b">
          <div className={cn(
            "h-1.5 w-6 rounded-full transition-colors",
            step === 'participants' ? "bg-primary" : "bg-muted"
          )} />
          <div className={cn(
            "h-1.5 w-6 rounded-full transition-colors",
            step === 'info' ? "bg-primary" : "bg-muted"
          )} />
          <div className={cn(
            "h-1.5 w-6 rounded-full transition-colors",
            step === 'settings' ? "bg-primary" : "bg-muted"
          )} />
        </div>

        {/* Step Content */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {step === 'participants' && (
            <div className="space-y-3 h-full flex flex-col">
              <div className="px-4 pt-3">
                <Label className="text-sm">Add Participants</Label>
                <p className="text-xs text-muted-foreground">
                  Select contacts to add to your group
                </p>
              </div>

              <div className="relative px-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-9 text-sm"
                />
              </div>

              {selectedParticipants.length > 0 && (
                <div className="space-y-2 px-4">
                  <Label className="text-xs">Selected ({selectedParticipants.length})</Label>
                  <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                    {selectedParticipants.map(participantId => {
                      const participant = contacts.find(c => c.id === participantId);
                      if (!participant) return null;
                      return (
                        <Badge
                          key={participantId}
                          variant="secondary"
                          className="flex items-center gap-1 pr-1 py-1"
                        >
                          <span className="truncate max-w-16 text-xs">{participant.name}</span>
                          <button
                            onClick={() => handleParticipantToggle(participantId)}
                            className="h-3 w-3 rounded-full bg-muted-foreground/20 flex items-center justify-center hover:bg-muted-foreground/40"
                          >
                            <X className="h-2 w-2" />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex-1 min-h-0 overflow-y-auto">
                {loadingContacts ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-sm text-muted-foreground">Loading your contacts...</p>
                    </div>
                  </div>
                ) : filteredContacts.length > 0 ? (
                  <div className="space-y-1 pr-2 pl-4 pb-4">
                    {filteredContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleParticipantToggle(contact.id)}
                      >
                        <Checkbox
                          checked={selectedParticipants.includes(contact.id)}
                          onCheckedChange={() => handleParticipantToggle(contact.id)}
                          className="h-4 w-4"
                        />
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={contact.avatar} alt={contact.name} />
                          <AvatarFallback className="text-xs">
                            {contact.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{contact.name}</p>
                          {contact.username && (
                            <p className="text-xs text-muted-foreground">@{contact.username}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        {searchQuery ? 'No contacts found matching your search' : 'You have no contacts yet'}
                      </p>
                      {!searchQuery && (
                        <Button 
                          variant="link" 
                          className="mt-2 text-sm"
                          onClick={() => navigate('/app/explore')}
                        >
                          Find people to connect with
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 'info' && (
            <div className="min-h-0">
              <div className="space-y-4 p-4">
                <div>
                  <Label className="text-sm">Group Information</Label>
                  <p className="text-xs text-muted-foreground">
                    Set up your group's basic information
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={groupInfo.avatar} alt="Group" />
                      <AvatarFallback>
                        <Camera className="h-5 w-5 text-muted-foreground" />
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full p-0"
                      onClick={() => {
                        // Handle image upload
                      }}
                    >
                      <Camera className="h-2.5 w-2.5" />
                    </Button>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div>
                      <Label htmlFor="group-name" className="text-xs">Group Name *</Label>
                      <Input
                        id="group-name"
                        placeholder="Enter group name..."
                        value={groupInfo.name}
                        onChange={(e) => setGroupInfo(prev => ({ ...prev, name: e.target.value }))}
                        maxLength={50}
                        className="h-8 text-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {groupInfo.name.length}/50
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="group-description" className="text-xs">Description (Optional)</Label>
                  <Textarea
                    id="group-description"
                    placeholder="What's this group about?"
                    value={groupInfo.description}
                    onChange={(e) => setGroupInfo(prev => ({ ...prev, description: e.target.value }))}
                    maxLength={200}
                    rows={2}
                    className="text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {groupInfo.description.length}/200
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 'settings' && (
            <div className="min-h-0">
              <div className="space-y-5 p-4">
                <div>
                  <Label className="text-sm">Group Settings</Label>
                  <p className="text-xs text-muted-foreground">
                    Configure permissions and features
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-medium">Who can send messages</Label>
                    <Select
                      value={groupSettings.whoCanSendMessages}
                      onValueChange={(value: 'everyone' | 'admins_only') =>
                        setGroupSettings(prev => ({ ...prev, whoCanSendMessages: value }))
                      }
                    >
                      <SelectTrigger className="mt-1 h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="everyone">Everyone</SelectItem>
                        <SelectItem value="admins_only">Admins only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs font-medium">Who can add members</Label>
                    <Select
                      value={groupSettings.whoCanAddMembers}
                      onValueChange={(value: 'everyone' | 'admins_only') =>
                        setGroupSettings(prev => ({ ...prev, whoCanAddMembers: value }))
                      }
                    >
                      <SelectTrigger className="mt-1 h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="everyone">Everyone</SelectItem>
                        <SelectItem value="admins_only">Admins only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-xs">Allow member invites</Label>
                        <p className="text-xs text-muted-foreground">
                          Members can share invite links
                        </p>
                      </div>
                      <Switch
                        checked={groupSettings.allowMemberInvites}
                        onCheckedChange={(checked) =>
                          setGroupSettings(prev => ({ ...prev, allowMemberInvites: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-xs">Join notifications</Label>
                        <p className="text-xs text-muted-foreground">
                          Notify when someone joins
                        </p>
                      </div>
                      <Switch
                        checked={groupSettings.showMemberAddNotifications}
                        onCheckedChange={(checked) =>
                          setGroupSettings(prev => ({ ...prev, showMemberAddNotifications: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-xs">Leave notifications</Label>
                        <p className="text-xs text-muted-foreground">
                          Notify when someone leaves
                        </p>
                      </div>
                      <Switch
                        checked={groupSettings.showMemberExitNotifications}
                        onCheckedChange={(checked) =>
                          setGroupSettings(prev => ({ ...prev, showMemberExitNotifications: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-3 border-t p-4 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (step === 'participants') {
                navigate('/app/chat');
              } else if (step === 'info') {
                setStep('participants');
              } else {
                setStep('info');
              }
            }}
            className="h-8 px-3 text-sm"
          >
            {step === 'participants' ? 'Cancel' : 'Back'}
          </Button>

          {step === 'participants' && (
            <Button
              size="sm"
              onClick={() => setStep('info')}
              disabled={!canProceedFromParticipants || loadingContacts}
              className="h-8 px-4 text-sm"
            >
              Next
            </Button>
          )}

          {step === 'info' && (
            <Button
              size="sm"
              onClick={() => setStep('settings')}
              disabled={!canProceedFromInfo}
              className="h-8 px-4 text-sm"
            >
              Next
            </Button>
          )}

          {step === 'settings' && (
            <Button
              size="sm"
              onClick={handleCreateGroup}
              disabled={!canCreateGroup || isCreating}
              className="h-8 px-4 text-sm"
            >
              {isCreating ? 'Creating...' : 'Create'}
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

export default CreateGroup;