import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Users,
  Lock,
  Eye,
  Bell,
  MessageSquare,
  Shield,
  Loader,
} from "lucide-react";
import GroupService from "@/services/groupService";
import { useAuth } from "@/contexts/AuthContext";

interface GroupSettings {
  allow_all_members_post: boolean;
  allow_guest_preview: boolean;
  moderate_messages: boolean;
  require_approval: boolean;
  notification_mode: "all" | "admin" | "none";
  description?: string;
}

interface Group {
  id: string;
  name: string;
  description?: string;
  privacy: "public" | "private";
  is_owner?: boolean;
  creator_id: string;
}

const GroupSettings: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Settings state
  const [settings, setSettings] = useState<GroupSettings>({
    allow_all_members_post: true,
    allow_guest_preview: false,
    moderate_messages: false,
    require_approval: false,
    notification_mode: "all",
  });

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

        // Only allow owner to edit settings
        if (groupData.creator_id !== user.id) {
          setError("You don't have permission to edit group settings");
          return;
        }

        const transformedGroup: Group = {
          id: groupData.id,
          name: groupData.name,
          description: groupData.description || "",
          privacy: groupData.privacy as "public" | "private",
          is_owner: groupData.creator_id === user.id,
          creator_id: groupData.creator_id,
        };

        setGroup(transformedGroup);

        // Load existing settings (mocked for now)
        const groupSettings = groupData.settings || {
          allow_all_members_post: true,
          allow_guest_preview: false,
          moderate_messages: false,
          require_approval: false,
          notification_mode: "all",
        };

        setSettings(groupSettings);
      } catch (err) {
        console.error("Error fetching group data:", err);
        setError("Failed to fetch group data");
      } finally {
        setLoading(false);
      }
    };

    fetchGroupData();
  }, [groupId, user]);

  const handleSettingChange = (key: keyof GroupSettings, value: boolean | string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!group || !groupId) return;

    try {
      setSaving(true);

      await GroupService.updateGroup(groupId, {
        groupId: groupId,
        settings: settings,
      });

      toast({
        title: "Success",
        description: "Group settings updated successfully",
      });

      setHasChanges(false);
    } catch (error) {
      console.error("Error updating group settings:", error);
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center px-4">
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
            {error || "Error"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error || "Unable to load settings"}
          </p>
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
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Group Settings</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Posting Permissions */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Posting Permissions
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Control who can post in this group
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Allow all members to post */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex-1">
                <Label className="text-sm font-semibold text-gray-900 dark:text-white cursor-pointer">
                  Allow all members to post
                </Label>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  If disabled, only admins can post in this group
                </p>
              </div>
              <Switch
                checked={settings.allow_all_members_post}
                onCheckedChange={(checked) =>
                  handleSettingChange("allow_all_members_post", checked)
                }
              />
            </div>

            {/* Require post approval */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex-1">
                <Label className="text-sm font-semibold text-gray-900 dark:text-white cursor-pointer">
                  Require post approval
                </Label>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  All posts must be approved by an admin before posting
                </p>
              </div>
              <Switch
                checked={settings.require_approval}
                onCheckedChange={(checked) =>
                  handleSettingChange("require_approval", checked)
                }
              />
            </div>

            {/* Moderate messages */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex-1">
                <Label className="text-sm font-semibold text-gray-900 dark:text-white cursor-pointer">
                  Moderate messages
                </Label>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Enable content moderation to filter inappropriate messages
                </p>
              </div>
              <Switch
                checked={settings.moderate_messages}
                onCheckedChange={(checked) =>
                  handleSettingChange("moderate_messages", checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Visibility */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
              Visibility
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Control who can see this group and its content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Guest preview */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex-1">
                <Label className="text-sm font-semibold text-gray-900 dark:text-white cursor-pointer">
                  Allow guests to preview
                </Label>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Non-members can view group description and rules
                </p>
              </div>
              <Switch
                checked={settings.allow_guest_preview}
                onCheckedChange={(checked) =>
                  handleSettingChange("allow_guest_preview", checked)
                }
              />
            </div>

            {/* Current privacy level */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400">
                <Lock className="w-4 h-4" />
                <span>
                  This group is <strong>{group.privacy === "public" ? "Public" : "Private"}</strong>
                </span>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
                {group.privacy === "public"
                  ? "Anyone can discover and join this group"
                  : "Only invited members can join this group"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              Notifications
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Configure notification settings for this group
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-3">
              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700">
                <input
                  type="radio"
                  id="notify-all"
                  name="notification_mode"
                  value="all"
                  checked={settings.notification_mode === "all"}
                  onChange={(e) => handleSettingChange("notification_mode", e.target.value)}
                  className="w-4 h-4 text-blue-600 dark:text-blue-400"
                />
                <label
                  htmlFor="notify-all"
                  className="ml-3 flex-1 cursor-pointer"
                >
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    All Messages
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Notify on every new message and post
                  </p>
                </label>
              </div>

              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700">
                <input
                  type="radio"
                  id="notify-admin"
                  name="notification_mode"
                  value="admin"
                  checked={settings.notification_mode === "admin"}
                  onChange={(e) => handleSettingChange("notification_mode", e.target.value)}
                  className="w-4 h-4 text-blue-600 dark:text-blue-400"
                />
                <label
                  htmlFor="notify-admin"
                  className="ml-3 flex-1 cursor-pointer"
                >
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Admin Actions Only
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Only notify on admin announcements and changes
                  </p>
                </label>
              </div>

              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700">
                <input
                  type="radio"
                  id="notify-none"
                  name="notification_mode"
                  value="none"
                  checked={settings.notification_mode === "none"}
                  onChange={(e) => handleSettingChange("notification_mode", e.target.value)}
                  className="w-4 h-4 text-blue-600 dark:text-blue-400"
                />
                <label
                  htmlFor="notify-none"
                  className="ml-3 flex-1 cursor-pointer"
                >
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    None
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Don't notify me from this group
                  </p>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Group Rules Info */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Group Rules
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Default rules that apply to all members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-3 text-gray-600 dark:text-gray-400">
                <span className="text-purple-600 dark:text-purple-400 font-bold">1.</span>
                <span>Be respectful to all members</span>
              </li>
              <li className="flex gap-3 text-gray-600 dark:text-gray-400">
                <span className="text-purple-600 dark:text-purple-400 font-bold">2.</span>
                <span>No spam or self-promotion without permission</span>
              </li>
              <li className="flex gap-3 text-gray-600 dark:text-gray-400">
                <span className="text-purple-600 dark:text-purple-400 font-bold">3.</span>
                <span>Share knowledge and help others learn</span>
              </li>
              <li className="flex gap-3 text-gray-600 dark:text-gray-400">
                <span className="text-purple-600 dark:text-purple-400 font-bold">4.</span>
                <span>Keep discussions relevant to the group topic</span>
              </li>
              <li className="flex gap-3 text-gray-600 dark:text-gray-400">
                <span className="text-purple-600 dark:text-purple-400 font-bold">5.</span>
                <span>No harassment or offensive content</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 pb-4">
          <Button
            variant="outline"
            className="flex-1 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            onClick={() => navigate(-1)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white disabled:opacity-50"
            onClick={handleSave}
            disabled={saving || !hasChanges}
          >
            {saving ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Settings"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GroupSettings;
