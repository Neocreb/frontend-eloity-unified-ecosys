import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GroupChatSettings } from "@/types/group-chat";

interface GroupSettingsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  settings: GroupChatSettings;
  onSaveSettings: (settings: GroupChatSettings) => Promise<void>;
  isAdmin: boolean;
}

export const GroupSettingsModal: React.FC<GroupSettingsModalProps> = ({
  isOpen,
  onOpenChange,
  settings: initialSettings,
  onSaveSettings,
  isAdmin,
}) => {
  const [settings, setSettings] = useState<GroupChatSettings>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveSettings(settings);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Group Settings</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Only admins can modify group settings.
          </p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Group Settings</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium">Who can send messages</Label>
              <Select
                value={settings.whoCanSendMessages}
                onValueChange={(value: 'everyone' | 'admins_only') =>
                  setSettings(prev => ({ ...prev, whoCanSendMessages: value }))
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
                value={settings.whoCanAddMembers}
                onValueChange={(value: 'everyone' | 'admins_only') =>
                  setSettings(prev => ({ ...prev, whoCanAddMembers: value }))
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
                  checked={settings.allowMemberInvites}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({ ...prev, allowMemberInvites: checked }))
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
                  checked={settings.showMemberAddNotifications}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({ ...prev, showMemberAddNotifications: checked }))
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
                  checked={settings.showMemberExitNotifications}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({ ...prev, showMemberExitNotifications: checked }))
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
                  checked={settings.disappearingMessages}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({ ...prev, disappearingMessages: checked }))
                  }
                />
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
