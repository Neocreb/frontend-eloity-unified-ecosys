// @ts-nocheck
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AdminService } from "@/services/adminService";
import { PlatformSetting, AdminUser } from "@/types/admin";
import { useNotification } from "@/hooks/use-notification";
import {
  Settings,
  Save,
  RefreshCw,
  Shield,
  CreditCard,
  Users,
  FileText,
  Globe,
  Bell,
  Eye,
  Lock,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react";

interface SettingGroup {
  category: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  settings: PlatformSetting[];
}

const PlatformSettings = () => {
  const [settingGroups, setSettingGroups] = useState<SettingGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);

  const notification = useNotification();

  useEffect(() => {
    initializeSettings();
  }, []);

  const initializeSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current admin
      const adminData = localStorage.getItem("admin_user");
      if (adminData) {
        setCurrentAdmin(JSON.parse(adminData));
      }

      // Fetch platform settings
      const settings = await AdminService.getPlatformSettings();

      // Group settings by category
      const grouped = groupSettingsByCategory(settings);
      setSettingGroups(grouped);
    } catch (error) {
      console.error("Error loading settings:", error);
      const errorMessage = error instanceof Error
        ? error.message
        : typeof error === 'string'
        ? error
        : "Failed to load platform settings";
      setError(errorMessage);
      notification.error(`Error loading settings: ${errorMessage}`);
      
      // Set mock data as fallback
      const mockSettings: PlatformSetting[] = [
        {
          id: "setting-1",
          key: "platform_name",
          value: "Eloity Platform",
          category: "general",
          description: "Platform display name",
          isPublic: true,
          lastModifiedBy: "system",
          updatedAt: new Date().toISOString(),
        },
        {
          id: "setting-2",
          key: "maintenance_mode",
          value: false,
          category: "general",
          description: "Enable maintenance mode",
          isPublic: false,
          lastModifiedBy: "system",
          updatedAt: new Date().toISOString(),
        }
      ];
      
      const grouped = groupSettingsByCategory(mockSettings);
      setSettingGroups(grouped);
    } finally {
      setIsLoading(false);
    }
  };

  const groupSettingsByCategory = (
    settings: PlatformSetting[],
  ): SettingGroup[] => {
    const categories = {
      general: {
        title: "General Settings",
        icon: <Settings className="w-5 h-5" />,
        description: "Basic platform configuration and behavior",
        settings: [] as PlatformSetting[],
      },
      security: {
        title: "Security & Privacy",
        icon: <Shield className="w-5 h-5" />,
        description: "Authentication, privacy, and security settings",
        settings: [] as PlatformSetting[],
      },
      marketplace: {
        title: "Marketplace",
        icon: <CreditCard className="w-5 h-5" />,
        description: "E-commerce and marketplace configuration",
        settings: [] as PlatformSetting[],
      },
      crypto: {
        title: "Cryptocurrency",
        icon: <Lock className="w-5 h-5" />,
        description: "Trading and wallet settings",
        settings: [] as PlatformSetting[],
      },
      freelance: {
        title: "Freelance Platform",
        icon: <Users className="w-5 h-5" />,
        description: "Job board and freelance settings",
        settings: [] as PlatformSetting[],
      },
      content: {
        title: "Content & Moderation",
        icon: <FileText className="w-5 h-5" />,
        description: "Content policies and moderation settings",
        settings: [] as PlatformSetting[],
      },
      notifications: {
        title: "Notifications",
        icon: <Bell className="w-5 h-5" />,
        description: "Email and push notification settings",
        settings: [] as PlatformSetting[],
      },
    };

    // Distribute settings into categories
    settings.forEach((setting) => {
      const category = setting.category as keyof typeof categories;
      if (categories[category]) {
        categories[category].settings.push(setting);
      }
    });

    // Add default settings if none exist
    Object.entries(categories).forEach(([key, category]) => {
      if (category.settings.length === 0) {
        category.settings = getDefaultSettings(key);
      }
    });

    return Object.entries(categories).map(([categoryKey, category]) => ({
      category: categoryKey,
      ...category,
    }));
  };

  const getDefaultSettings = (category: string): PlatformSetting[] => {
    const defaults: Record<string, Partial<PlatformSetting>[]> = {
      general: [
        {
          key: "platform_name",
          value: "SoftChat",
          description: "Platform display name",
          isPublic: true,
        },
        {
          key: "platform_description",
          value: "Social platform with integrated marketplace and crypto",
          description: "Platform description",
          isPublic: true,
        },
        {
          key: "maintenance_mode",
          value: false,
          description: "Enable maintenance mode",
          isPublic: false,
        },
        {
          key: "max_file_size",
          value: 10485760,
          description: "Maximum file upload size (bytes)",
          isPublic: false,
        },
      ],
      security: [
        {
          key: "require_email_verification",
          value: true,
          description: "Require email verification for new accounts",
          isPublic: false,
        },
        {
          key: "enable_two_factor",
          value: true,
          description: "Enable two-factor authentication",
          isPublic: false,
        },
        {
          key: "session_timeout",
          value: 86400,
          description: "Session timeout in seconds",
          isPublic: false,
        },
        {
          key: "password_min_length",
          value: 8,
          description: "Minimum password length",
          isPublic: false,
        },
      ],
      marketplace: [
        {
          key: "marketplace_enabled",
          value: true,
          description: "Enable marketplace functionality",
          isPublic: true,
        },
        {
          key: "marketplace_commission",
          value: 0.05,
          description: "Platform commission rate",
          isPublic: false,
        },
        {
          key: "min_product_price",
          value: 1,
          description: "Minimum product price",
          isPublic: false,
        },
        {
          key: "max_product_price",
          value: 10000,
          description: "Maximum product price",
          isPublic: false,
        },
      ],
      crypto: [
        {
          key: "crypto_trading_enabled",
          value: true,
          description: "Enable cryptocurrency trading",
          isPublic: true,
        },
        {
          key: "supported_cryptocurrencies",
          value: ["BTC", "ETH", "USDT"],
          description: "Supported cryptocurrencies",
          isPublic: true,
        },
        {
          key: "min_trade_amount",
          value: 10,
          description: "Minimum trade amount (USD)",
          isPublic: false,
        },
        {
          key: "trading_fee_percentage",
          value: 0.001,
          description: "Trading fee percentage",
          isPublic: false,
        },
      ],
      freelance: [
        {
          key: "freelance_enabled",
          value: true,
          description: "Enable freelance platform",
          isPublic: true,
        },
        {
          key: "freelance_commission",
          value: 0.1,
          description: "Freelance platform commission",
          isPublic: false,
        },
        {
          key: "escrow_enabled",
          value: true,
          description: "Enable escrow for projects",
          isPublic: false,
        },
        {
          key: "min_project_budget",
          value: 25,
          description: "Minimum project budget",
          isPublic: false,
        },
      ],
      content: [
        {
          key: "auto_moderation_enabled",
          value: true,
          description: "Enable automatic content moderation",
          isPublic: false,
        },
        {
          key: "content_review_required",
          value: false,
          description: "Require manual review for all content",
          isPublic: false,
        },
        {
          key: "max_post_length",
          value: 2000,
          description: "Maximum post character length",
          isPublic: true,
        },
        {
          key: "allowed_file_types",
          value: ["jpg", "png", "gif", "mp4", "webm"],
          description: "Allowed file types for uploads",
          isPublic: true,
        },
      ],
      notifications: [
        {
          key: "email_notifications_enabled",
          value: true,
          description: "Enable email notifications",
          isPublic: false,
        },
        {
          key: "push_notifications_enabled",
          value: true,
          description: "Enable push notifications",
          isPublic: false,
        },
        {
          key: "notification_digest_frequency",
          value: "daily",
          description: "Notification digest frequency",
          isPublic: false,
        },
        {
          key: "marketing_emails_enabled",
          value: false,
          description: "Enable marketing emails",
          isPublic: false,
        },
      ],
    };

    return (defaults[category] || []).map((setting, index) => ({
      id: `default-${category}-${index}`,
      category: category as any,
      key: setting.key!,
      value: setting.value!,
      description: setting.description!,
      isPublic: setting.isPublic!,
      lastModifiedBy: "system",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleSettingChange = (key: string, value: any) => {
    setPendingChanges((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const saveSettings = async () => {
    if (!currentAdmin) {
      notification.error("You must be logged in as an admin");
      return;
    }

    try {
      setIsSaving(true);

      // Save all pending changes
      const promises = Object.entries(pendingChanges).map(([key, value]) =>
        AdminService.updatePlatformSetting(key, value, currentAdmin.id),
      );

      await Promise.all(promises);

      notification.success("Settings saved successfully");
      setPendingChanges({});
      initializeSettings(); // Refresh settings
    } catch (error) {
      console.error("Error saving settings:", error);
      notification.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const resetSettings = () => {
    setPendingChanges({});
    notification.info("Changes reset");
  };

  const renderSettingInput = (setting: PlatformSetting) => {
    const currentValue = pendingChanges[setting.key] ?? setting.value;

    if (typeof currentValue === "boolean") {
      return (
        <Switch
          checked={currentValue}
          onCheckedChange={(checked) =>
            handleSettingChange(setting.key, checked)
          }
        />
      );
    }

    if (typeof currentValue === "number") {
      return (
        <Input
          type="number"
          value={currentValue}
          onChange={(e) =>
            handleSettingChange(setting.key, Number(e.target.value))
          }
          className="max-w-xs"
        />
      );
    }

    if (Array.isArray(currentValue)) {
      return (
        <Textarea
          value={JSON.stringify(currentValue, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              handleSettingChange(setting.key, parsed);
            } catch (err) {
              // Invalid JSON, ignore
            }
          }}
          className="max-w-md font-mono text-sm"
          rows={3}
        />
      );
    }

    if (typeof currentValue === "string" && currentValue.length > 100) {
      return (
        <Textarea
          value={currentValue}
          onChange={(e) => handleSettingChange(setting.key, e.target.value)}
          className="max-w-md"
          rows={3}
        />
      );
    }

    return (
      <Input
        value={currentValue}
        onChange={(e) => handleSettingChange(setting.key, e.target.value)}
        className="max-w-md"
      />
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Loading platform settings...</p>
        </div>
      </div>
    );
  }

  const hasChanges = Object.keys(pendingChanges).length > 0;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Platform Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Configure platform behavior and features
          </p>
        </div>

        <div className="flex gap-3">
          {hasChanges && (
            <Button variant="outline" onClick={resetSettings}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset Changes
            </Button>
          )}
          <Button
            onClick={saveSettings}
            disabled={!hasChanges || isSaving}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Changes Alert */}
      {hasChanges && (
        <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            You have {Object.keys(pendingChanges).length} unsaved change(s).
            Remember to save your changes.
          </AlertDescription>
        </Alert>
      )}

      {/* Settings Tabs */}
      <Tabs defaultValue={settingGroups[0]?.category} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          {settingGroups.map((group) => (
            <TabsTrigger
              key={group.category}
              value={group.category}
              className="flex items-center gap-2"
            >
              {group.icon}
              <span className="hidden sm:inline">{group.title}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {settingGroups.map((group) => (
          <TabsContent
            key={group.category}
            value={group.category}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {group.icon}
                  {group.title}
                </CardTitle>
                <CardDescription>{group.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {group.settings.map((setting, index) => (
                  <div key={setting.id} className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Label className="font-medium">
                            {setting.key
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </Label>
                          {setting.isPublic && (
                            <Badge variant="outline" className="text-xs">
                              <Globe className="w-3 h-3 mr-1" />
                              Public
                            </Badge>
                          )}
                          {pendingChanges[setting.key] !== undefined && (
                            <Badge variant="secondary" className="text-xs">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Modified
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {setting.description}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        {renderSettingInput(setting)}
                      </div>
                    </div>

                    {index < group.settings.length - 1 && <Separator />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default PlatformSettings;
