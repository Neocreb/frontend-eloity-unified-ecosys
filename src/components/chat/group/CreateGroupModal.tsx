import React, { useState } from 'react';
import { Search, Users, Settings2, Camera, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { CreateGroupRequest, GroupChatSettings } from '@/types/group-chat';
import { ChatParticipant } from '@/types/chat';

interface CreateGroupModalProps {
  trigger: React.ReactNode;
  contacts: ChatParticipant[];
  onCreateGroup: (request: CreateGroupRequest) => Promise<void>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  trigger,
  contacts,
  onCreateGroup,
  isOpen,
  onOpenChange,
}) => {
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

    setIsCreating(true);
    try {
      const request: CreateGroupRequest = {
        name: groupInfo.name.trim(),
        description: groupInfo.description.trim(),
        avatar: groupInfo.avatar,
        participants: selectedParticipants,
        settings: groupSettings,
        createdBy: 'current-user-id', // Should come from auth context
      };

      await onCreateGroup(request);
      
      // Reset form
      setStep('participants');
      setSelectedParticipants([]);
      setGroupInfo({ name: '', description: '', avatar: '' });
      setSearchQuery('');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create group:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const canProceedFromParticipants = selectedParticipants.length > 0;
  const canProceedFromInfo = groupInfo.name.trim().length > 0;
  const canCreateGroup = canProceedFromParticipants && canProceedFromInfo;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {trigger}
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Create New Group
            </DialogTitle>
            <DialogDescription>
              Create a group chat with your contacts
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* Step Navigation */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className={cn(
              "h-2 w-8 rounded-full transition-colors",
              step === 'participants' ? "bg-primary" : "bg-muted"
            )} />
            <div className={cn(
              "h-2 w-8 rounded-full transition-colors",
              step === 'info' ? "bg-primary" : "bg-muted"
            )} />
            <div className={cn(
              "h-2 w-8 rounded-full transition-colors",
              step === 'settings' ? "bg-primary" : "bg-muted"
            )} />
          </div>

          {/* Step Content */}
          <div className="flex-1 overflow-hidden">
            {step === 'participants' && (
              <div className="space-y-4 h-full flex flex-col">
                <div>
                  <Label>Add Participants</Label>
                  <p className="text-sm text-muted-foreground">
                    Select contacts to add to your group
                  </p>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search contacts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {selectedParticipants.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm">Selected ({selectedParticipants.length})</Label>
                    <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                      {selectedParticipants.map(participantId => {
                        const participant = contacts.find(c => c.id === participantId);
                        if (!participant) return null;
                        return (
                          <Badge
                            key={participantId}
                            variant="secondary"
                            className="flex items-center gap-1 pr-1"
                          >
                            <span className="truncate max-w-20">{participant.name}</span>
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

                <ScrollArea className="flex-1">
                  <div className="space-y-1 pr-4">
                    {filteredContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleParticipantToggle(contact.id)}
                      >
                        <Checkbox
                          checked={selectedParticipants.includes(contact.id)}
                          onChange={() => handleParticipantToggle(contact.id)}
                        />
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={contact.avatar} alt={contact.name} />
                          <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
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
                </ScrollArea>
              </div>
            )}

            {step === 'info' && (
              <div className="space-y-4">
                <div>
                  <Label>Group Information</Label>
                  <p className="text-sm text-muted-foreground">
                    Set up your group's basic information
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={groupInfo.avatar} alt="Group" />
                      <AvatarFallback>
                        <Camera className="h-6 w-6 text-muted-foreground" />
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full p-0"
                      onClick={() => {
                        // Handle image upload
                      }}
                    >
                      <Camera className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div>
                      <Label htmlFor="group-name">Group Name *</Label>
                      <Input
                        id="group-name"
                        placeholder="Enter group name..."
                        value={groupInfo.name}
                        onChange={(e) => setGroupInfo(prev => ({ ...prev, name: e.target.value }))}
                        maxLength={50}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {groupInfo.name.length}/50
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="group-description">Description (Optional)</Label>
                  <Textarea
                    id="group-description"
                    placeholder="What's this group about?"
                    value={groupInfo.description}
                    onChange={(e) => setGroupInfo(prev => ({ ...prev, description: e.target.value }))}
                    maxLength={200}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {groupInfo.description.length}/200
                  </p>
                </div>
              </div>
            )}

            {step === 'settings' && (
              <ScrollArea className="h-full">
                <div className="space-y-6 pr-4">
                  <div>
                    <Label>Group Settings</Label>
                    <p className="text-sm text-muted-foreground">
                      Configure permissions and features for your group
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Who can send messages</Label>
                      <Select
                        value={groupSettings.whoCanSendMessages}
                        onValueChange={(value: 'everyone' | 'admins_only') =>
                          setGroupSettings(prev => ({ ...prev, whoCanSendMessages: value }))
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="everyone">Everyone</SelectItem>
                          <SelectItem value="admins_only">Admins only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Who can add members</Label>
                      <Select
                        value={groupSettings.whoCanAddMembers}
                        onValueChange={(value: 'everyone' | 'admins_only') =>
                          setGroupSettings(prev => ({ ...prev, whoCanAddMembers: value }))
                        }
                      >
                        <SelectTrigger className="mt-1">
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
                          <Label className="text-sm">Allow member invites</Label>
                          <p className="text-xs text-muted-foreground">
                            Let members share invite links
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
                          <Label className="text-sm">Show join notifications</Label>
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
                          <Label className="text-sm">Show leave notifications</Label>
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

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm">Disappearing messages</Label>
                          <p className="text-xs text-muted-foreground">
                            Auto-delete messages after time
                          </p>
                        </div>
                        <Switch
                          checked={groupSettings.disappearingMessages}
                          onCheckedChange={(checked) =>
                            setGroupSettings(prev => ({ ...prev, disappearingMessages: checked }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                if (step === 'participants') {
                  onOpenChange(false);
                } else if (step === 'info') {
                  setStep('participants');
                } else {
                  setStep('info');
                }
              }}
            >
              {step === 'participants' ? 'Cancel' : 'Back'}
            </Button>

            {step === 'participants' && (
              <Button
                onClick={() => setStep('info')}
                disabled={!canProceedFromParticipants}
              >
                Next
              </Button>
            )}

            {step === 'info' && (
              <Button
                onClick={() => setStep('settings')}
                disabled={!canProceedFromInfo}
              >
                Next
              </Button>
            )}

            {step === 'settings' && (
              <Button
                onClick={handleCreateGroup}
                disabled={!canCreateGroup || isCreating}
                className="min-w-20"
              >
                {isCreating ? 'Creating...' : 'Create'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};