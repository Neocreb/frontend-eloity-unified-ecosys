import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useNotificationSettings } from "@/hooks/useNotificationSettings";
import { useToast } from "@/components/ui/use-toast";
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Monitor, 
  Clock, 
  Globe, 
  UserX,
  Save
} from "lucide-react";

export const NotificationSettings = () => {
  const { 
    preferences, 
    loading, 
    updatePreferences,
    unsubscribeAll
  } = useNotificationSettings();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const [settings, setSettings] = useState({
    global_enabled: true,
    push_enabled: true,
    email_enabled: true,
    sms_enabled: false,
    in_app_enabled: true,
    quiet_hours_enabled: false,
    quiet_hours_start: "22:00",
    quiet_hours_end: "08:00",
    frequency: "instant",
    language: "en",
  });

  // Initialize settings from preferences
  useEffect(() => {
    if (preferences) {
      setSettings({
        global_enabled: preferences.global_enabled ?? true,
        push_enabled: preferences.push_enabled ?? true,
        email_enabled: preferences.email_enabled ?? true,
        sms_enabled: preferences.sms_enabled ?? false,
        in_app_enabled: preferences.in_app_enabled ?? true,
        quiet_hours_enabled: !!preferences.quiet_hours_start && !!preferences.quiet_hours_end,
        quiet_hours_start: preferences.quiet_hours_start || "22:00",
        quiet_hours_end: preferences.quiet_hours_end || "08:00",
        frequency: preferences.frequency || "instant",
        language: preferences.language || "en",
      });
    }
  }, [preferences]);

  const handleSave = async () => {
    if (!preferences) return;

    try {
      setIsSaving(true);
      
      const updateData: any = {
        global_enabled: settings.global_enabled,
        push_enabled: settings.push_enabled,
        email_enabled: settings.email_enabled,
        sms_enabled: settings.sms_enabled,
        in_app_enabled: settings.in_app_enabled,
        frequency: settings.frequency,
        language: settings.language,
      };

      // Handle quiet hours
      if (settings.quiet_hours_enabled) {
        updateData.quiet_hours_start = settings.quiet_hours_start;
        updateData.quiet_hours_end = settings.quiet_hours_end;
      } else {
        updateData.quiet_hours_start = null;
        updateData.quiet_hours_end = null;
      }

      const success = await updatePreferences(updateData);
      
      if (success) {
        toast({
          title: "Settings saved",
          description: "Your notification preferences have been updated.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to save notification preferences.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnsubscribeAll = async () => {
    if (window.confirm("Are you sure you want to unsubscribe from all notifications?")) {
      const success = await unsubscribeAll();
      
      if (success) {
        toast({
          title: "Unsubscribed",
          description: "You have been unsubscribed from all notifications.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to unsubscribe from notifications.",
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Notification Settings</h1>
        <p className="text-muted-foreground">
          Manage how and when you receive notifications
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Customize your notification settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Global Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Enable Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Turn all notifications on or off
              </p>
            </div>
            <Switch
              checked={settings.global_enabled}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, global_enabled: checked }))
              }
            />
          </div>

          {/* Delivery Methods */}
          <div className="space-y-4">
            <h3 className="font-medium">Delivery Methods</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    In-App Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Show notifications within the app
                  </p>
                </div>
                <Switch
                  checked={settings.in_app_enabled}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, in_app_enabled: checked }))
                  }
                  disabled={!settings.global_enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    Push Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Send notifications to your device
                  </p>
                </div>
                <Switch
                  checked={settings.push_enabled}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, push_enabled: checked }))
                  }
                  disabled={!settings.global_enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Send notifications to your email
                  </p>
                </div>
                <Switch
                  checked={settings.email_enabled}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, email_enabled: checked }))
                  }
                  disabled={!settings.global_enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    SMS Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Send text messages to your phone
                  </p>
                </div>
                <Switch
                  checked={settings.sms_enabled}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, sms_enabled: checked }))
                  }
                  disabled={!settings.global_enabled}
                />
              </div>
            </div>
          </div>

          {/* Frequency */}
          <div className="space-y-4">
            <h3 className="font-medium">Frequency</h3>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Notification Frequency</Label>
                <p className="text-sm text-muted-foreground">
                  How often you receive notifications
                </p>
              </div>
              <Select
                value={settings.frequency}
                onValueChange={(value) => 
                  setSettings(prev => ({ ...prev, frequency: value }))
                }
                disabled={!settings.global_enabled}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instant">Instant</SelectItem>
                  <SelectItem value="hourly">Hourly Digest</SelectItem>
                  <SelectItem value="daily">Daily Digest</SelectItem>
                  <SelectItem value="weekly">Weekly Digest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quiet Hours */}
          <div className="space-y-4">
            <h3 className="font-medium">Quiet Hours</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Enable Quiet Hours
                </Label>
                <p className="text-sm text-muted-foreground">
                  Pause notifications during specific hours
                </p>
              </div>
              <Switch
                checked={settings.quiet_hours_enabled}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, quiet_hours_enabled: checked }))
                }
                disabled={!settings.global_enabled}
              />
            </div>

            {settings.quiet_hours_enabled && (
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={settings.quiet_hours_start}
                    onChange={(e) => 
                      setSettings(prev => ({ ...prev, quiet_hours_start: e.target.value }))
                    }
                    disabled={!settings.global_enabled}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={settings.quiet_hours_end}
                    onChange={(e) => 
                      setSettings(prev => ({ ...prev, quiet_hours_end: e.target.value }))
                    }
                    disabled={!settings.global_enabled}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Language */}
          <div className="space-y-4">
            <h3 className="font-medium">Language</h3>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Notification Language
                </Label>
                <p className="text-sm text-muted-foreground">
                  Language for notification content
                </p>
              </div>
              <Select
                value={settings.language}
                onValueChange={(value) => 
                  setSettings(prev => ({ ...prev, language: value }))
                }
                disabled={!settings.global_enabled}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button 
              onClick={handleSave}
              disabled={isSaving || !preferences}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleUnsubscribeAll}
              className="flex items-center gap-2"
            >
              <UserX className="h-4 w-4" />
              Unsubscribe All
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};