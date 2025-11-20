import React, { useState } from 'react';
import { Search, Users, Settings2, Camera, X, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { CreateGroupRequest, GroupChatSettings } from '@/types/group-chat';
import { ChatParticipant } from '@/types/chat';
import { groupChatService } from '@/services/groupChatService';
import { friendsService } from '@/services/friendsService';

export const CreateGroup: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
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

  // Load contacts on mount
  React.useEffect(() => {
    const loadContacts = async () => {
      try {
        setLoadingContacts(true);
        // Replace this with your actual service call
        const fetchedContacts = await groupChatService.getContacts?.() || [];
        setContacts(fetchedContacts);
      } catch (error) {
        console.error('Failed to load contacts:', error);
        toast({
          title: 'Error',
          description: 'Failed to load contacts. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoadingContacts(false);
      }
    };

    loadContacts();
  }, []);

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
    if (!groupInfo.name.trim() || selectedParticipants.length === 0) return;

    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to create a group',
        variant: 'destructive',
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

      await groupChatService.createGroup(request);

      toast({
        title: 'Group Created',
        description: `${groupInfo.name} has been created successfully!`,
      });

      navigate(-1);
    } catch (error) {
      console.error('Failed to create group:', error);
      toast({
        title: 'Error',
        description: 'Failed to create group. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const canProceedFromParticipants = selectedParticipants.length > 0;
  const canProceedFromInfo = groupInfo.name.trim().length > 0;
  const canCreateGroup = canProceedFromParticipants && canProceedFromInfo;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b p-4 flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />
              Create Group
            </h1>
            <p className="text-xs text-muted-foreground">
              Add participants to your group
            </p>
          </div>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="flex items-center justify-center gap-2 py-4 px-4 bg-white border-b">
        <div
          className={cn(
            'h-1.5 w-6 rounded-full transition-colors',
            step === 'participants' ? 'bg-primary' : 'bg-muted'
          )}
        />
        <div
          className={cn(
            'h-1.5 w-6 rounded-full transition-colors',
            step === 'info' ? 'bg-primary' : 'bg-muted'
          )}
        />
        <div
          className={cn(
            'h-1.5 w-6 rounded-full transition-colors',
            step === 'settings' ? 'bg-primary' : 'bg-muted'
          )}
        />
      </div>

      {/* Step Content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {step === 'participants' && (
          <div className="space-y-3 h-full flex flex-col p-4">
            <div>
              <Label className="text-sm">Add Participants</Label>
              <p className="text-xs text-muted-foreground">
                Select contacts to add to your group
              </p>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9 text-sm"
              />
            </div>

            {selectedParticipants.length > 0 && (
              <div className="space-y-2">
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

            {loadingContacts ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Loading contacts...</p>
              </div>
            ) : (
              <div className="flex-1 min-h-0 overflow-y-auto space-y-1">
                {filteredContacts.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-muted-foreground">
                      {searchQuery ? 'No contacts found' : 'No contacts available'}
                    </p>
                  </div>
                ) : (
                  filteredContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleParticipantToggle(contact.id)}
                    >
                      <Checkbox
                        checked={selectedParticipants.includes(contact.id)}
                        onChange={() => handleParticipantToggle(contact.id)}
                        className="h-4 w-4"
                      />
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={contact.avatar} alt={contact.name} />
                        <AvatarFallback className="text-xs">{contact.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{contact.name}</p>
                        {contact.username && (
                          <p className="text-xs text-muted-foreground">@{contact.username}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {step === 'info' && (
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
                  <Label htmlFor="group-name" className="text-xs">
                    Group Name *
                  </Label>
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
              <Label htmlFor="group-description" className="text-xs">
                Description (Optional)
              </Label>
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
        )}

        {step === 'settings' && (
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
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-3 border-t p-4 flex-shrink-0 bg-white gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (step === 'participants') {
              navigate(-1);
            } else if (step === 'info') {
              setStep('participants');
            } else {
              setStep('info');
            }
          }}
          className="h-8 px-3 text-sm flex-1"
        >
          {step === 'participants' ? 'Cancel' : 'Back'}
        </Button>

        {step === 'participants' && (
          <Button
            size="sm"
            onClick={() => setStep('info')}
            disabled={!canProceedFromParticipants}
            className="h-8 px-4 text-sm flex-1"
          >
            Next
          </Button>
        )}

        {step === 'info' && (
          <Button
            size="sm"
            onClick={() => setStep('settings')}
            disabled={!canProceedFromInfo}
            className="h-8 px-4 text-sm flex-1"
          >
            Next
          </Button>
        )}

        {step === 'settings' && (
          <Button
            size="sm"
            onClick={handleCreateGroup}
            disabled={!canCreateGroup || isCreating}
            className="h-8 px-4 text-sm flex-1"
          >
            {isCreating ? 'Creating...' : 'Create'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default CreateGroup;
