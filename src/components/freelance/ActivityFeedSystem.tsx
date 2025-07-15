import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Bell,
  Activity,
  MessageSquare,
  Briefcase,
  DollarSign,
  CheckCircle,
  Star,
  Award,
  Users,
  Clock,
  Calendar,
  Eye,
  ThumbsUp,
  Heart,
  Share2,
  Bookmark,
  Filter,
  Search,
  Settings,
  Volume2,
  VolumeX,
  Smartphone,
  Mail,
  Globe,
  Zap,
  TrendingUp,
  Flag,
  Gift,
  CreditCard,
  Shield,
  FileText,
  Link,
  ExternalLink,
  MoreHorizontal,
  Pin,
  Archive,
  Trash2,
  RefreshCw,
  Download,
  Upload,
  PlayCircle,
  PauseCircle,
} from "lucide-react";

interface ActivityItem {
  id: string;
  type:
    | "project_update"
    | "message"
    | "payment"
    | "review"
    | "milestone"
    | "system"
    | "social"
    | "achievement";
  title: string;
  description: string;
  actor: {
    id: string;
    name: string;
    avatar?: string;
    type: "user" | "client" | "freelancer" | "system";
  };
  target?: {
    id: string;
    name: string;
    type: "project" | "user" | "milestone" | "payment";
  };
  metadata?: Record<string, any>;
  timestamp: Date;
  isRead: boolean;
  isPinned: boolean;
  priority: "low" | "medium" | "high" | "urgent";
  category: string[];
  actions?: ActivityAction[];
}

interface ActivityAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  type: "primary" | "secondary" | "danger";
  onClick: () => void;
}

interface NotificationPreferences {
  projectUpdates: boolean;
  messages: boolean;
  payments: boolean;
  reviews: boolean;
  milestones: boolean;
  marketing: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  frequency: "real_time" | "hourly" | "daily" | "weekly";
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

interface NotificationChannel {
  id: string;
  name: string;
  type: "email" | "push" | "sms" | "in_app";
  enabled: boolean;
  icon: React.ReactNode;
  description: string;
}

const ActivityFeedSystem: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [notifications, setNotifications] = useState<ActivityItem[]>([]);
  const [preferences, setPreferences] =
    useState<NotificationPreferences | null>(null);
  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  const [activeTab, setActiveTab] = useState("feed");
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(
    null,
  );
  const [showActivityDetails, setShowActivityDetails] = useState(false);

  useEffect(() => {
    initializeActivityFeed();
    initializeNotificationPreferences();
    initializeNotificationChannels();
  }, []);

  const initializeActivityFeed = () => {
    const sampleActivities: ActivityItem[] = [
      {
        id: "activity_1",
        type: "project_update",
        title: "New Project Proposal",
        description:
          'TechCorp Inc. submitted a proposal for "E-commerce Website Development"',
        actor: {
          id: "client_1",
          name: "TechCorp Inc.",
          avatar: "/avatars/techcorp.png",
          type: "client",
        },
        target: {
          id: "proj_1",
          name: "E-commerce Website Development",
          type: "project",
        },
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        isRead: false,
        isPinned: false,
        priority: "high",
        category: ["projects", "proposals"],
        actions: [
          {
            id: "view_proposal",
            label: "View Proposal",
            icon: <Eye className="w-4 h-4" />,
            type: "primary",
            onClick: () => console.log("View proposal"),
          },
          {
            id: "respond",
            label: "Respond",
            icon: <MessageSquare className="w-4 h-4" />,
            type: "secondary",
            onClick: () => console.log("Respond"),
          },
        ],
      },
      {
        id: "activity_2",
        type: "payment",
        title: "Payment Received",
        description:
          'You received $2,500 for milestone completion in "Mobile App UI Design"',
        actor: {
          id: "system",
          name: "System",
          type: "system",
        },
        target: {
          id: "payment_1",
          name: "Milestone Payment",
          type: "payment",
        },
        metadata: {
          amount: 2500,
          currency: "USD",
          projectTitle: "Mobile App UI Design",
        },
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isRead: true,
        isPinned: true,
        priority: "medium",
        category: ["payments", "milestones"],
      },
      {
        id: "activity_3",
        type: "review",
        title: "New Review Received",
        description:
          'Jane Client gave you a 5-star review for "Website Redesign Project"',
        actor: {
          id: "client_2",
          name: "Jane Client",
          avatar: "/avatars/jane.png",
          type: "client",
        },
        metadata: {
          rating: 5,
          projectTitle: "Website Redesign Project",
          comment: "Excellent work and great communication!",
        },
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        isRead: false,
        isPinned: false,
        priority: "medium",
        category: ["reviews", "feedback"],
        actions: [
          {
            id: "view_review",
            label: "View Review",
            icon: <Star className="w-4 h-4" />,
            type: "primary",
            onClick: () => console.log("View review"),
          },
          {
            id: "respond_review",
            label: "Respond",
            icon: <MessageSquare className="w-4 h-4" />,
            type: "secondary",
            onClick: () => console.log("Respond to review"),
          },
        ],
      },
      {
        id: "activity_4",
        type: "achievement",
        title: "Badge Unlocked!",
        description:
          'You earned the "Project Veteran" badge for completing 50 projects',
        actor: {
          id: "system",
          name: "System",
          type: "system",
        },
        metadata: {
          badgeName: "Project Veteran",
          badgeType: "achievement",
          tier: "gold",
        },
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        isRead: true,
        isPinned: false,
        priority: "low",
        category: ["achievements", "badges"],
      },
      {
        id: "activity_5",
        type: "message",
        title: "New Message",
        description:
          "StartupXYZ sent you a direct message about potential collaboration",
        actor: {
          id: "client_3",
          name: "StartupXYZ",
          avatar: "/avatars/startup.png",
          type: "client",
        },
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
        isRead: false,
        isPinned: false,
        priority: "medium",
        category: ["messages", "communication"],
        actions: [
          {
            id: "read_message",
            label: "Read Message",
            icon: <MessageSquare className="w-4 h-4" />,
            type: "primary",
            onClick: () => console.log("Read message"),
          },
        ],
      },
      {
        id: "activity_6",
        type: "milestone",
        title: "Milestone Approved",
        description:
          'TechCorp Inc. approved milestone 2 of "E-commerce Website Development"',
        actor: {
          id: "client_1",
          name: "TechCorp Inc.",
          avatar: "/avatars/techcorp.png",
          type: "client",
        },
        target: {
          id: "milestone_2",
          name: "Backend API Development",
          type: "milestone",
        },
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        isRead: true,
        isPinned: false,
        priority: "medium",
        category: ["milestones", "projects"],
        actions: [
          {
            id: "continue_project",
            label: "Continue Project",
            icon: <PlayCircle className="w-4 h-4" />,
            type: "primary",
            onClick: () => console.log("Continue project"),
          },
        ],
      },
    ];

    setActivities(sampleActivities);
    setNotifications(sampleActivities.filter((a) => !a.isRead));
  };

  const initializeNotificationPreferences = () => {
    const prefs: NotificationPreferences = {
      projectUpdates: true,
      messages: true,
      payments: true,
      reviews: true,
      milestones: true,
      marketing: false,
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      frequency: "real_time",
      quietHours: {
        enabled: true,
        start: "22:00",
        end: "08:00",
      },
    };

    setPreferences(prefs);
  };

  const initializeNotificationChannels = () => {
    const channelData: NotificationChannel[] = [
      {
        id: "in_app",
        name: "In-App Notifications",
        type: "in_app",
        enabled: true,
        icon: <Bell className="w-5 h-5" />,
        description: "Real-time notifications within the platform",
      },
      {
        id: "email",
        name: "Email Notifications",
        type: "email",
        enabled: true,
        icon: <Mail className="w-5 h-5" />,
        description: "Email alerts for important updates",
      },
      {
        id: "push",
        name: "Push Notifications",
        type: "push",
        enabled: true,
        icon: <Smartphone className="w-5 h-5" />,
        description: "Mobile and desktop push notifications",
      },
      {
        id: "sms",
        name: "SMS Notifications",
        type: "sms",
        enabled: false,
        icon: <MessageSquare className="w-5 h-5" />,
        description: "Text message alerts for urgent updates",
      },
    ];

    setChannels(channelData);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "project_update":
        return <Briefcase className="w-5 h-5 text-blue-500" />;
      case "message":
        return <MessageSquare className="w-5 h-5 text-green-500" />;
      case "payment":
        return <DollarSign className="w-5 h-5 text-green-600" />;
      case "review":
        return <Star className="w-5 h-5 text-yellow-500" />;
      case "milestone":
        return <CheckCircle className="w-5 h-5 text-purple-500" />;
      case "achievement":
        return <Award className="w-5 h-5 text-orange-500" />;
      case "system":
        return <Shield className="w-5 h-5 text-gray-500" />;
      case "social":
        return <Users className="w-5 h-5 text-pink-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "border-l-red-500 bg-red-50";
      case "high":
        return "border-l-orange-500 bg-orange-50";
      case "medium":
        return "border-l-blue-500 bg-blue-50";
      case "low":
        return "border-l-gray-500 bg-gray-50";
      default:
        return "border-l-gray-300";
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return timestamp.toLocaleDateString();
  };

  const markAsRead = (activityId: string) => {
    setActivities((prev) =>
      prev.map((activity) =>
        activity.id === activityId ? { ...activity, isRead: true } : activity,
      ),
    );
    setNotifications((prev) => prev.filter((n) => n.id !== activityId));
  };

  const markAllAsRead = () => {
    setActivities((prev) =>
      prev.map((activity) => ({ ...activity, isRead: true })),
    );
    setNotifications([]);
  };

  const togglePin = (activityId: string) => {
    setActivities((prev) =>
      prev.map((activity) =>
        activity.id === activityId
          ? { ...activity, isPinned: !activity.isPinned }
          : activity,
      ),
    );
  };

  const ActivityCard = ({ activity }: { activity: ActivityItem }) => {
    return (
      <Card
        className={`cursor-pointer hover:shadow-md transition-all border-l-4 ${getPriorityColor(activity.priority)} ${
          !activity.isRead ? "bg-blue-50 border-blue-200" : ""
        }`}
        onClick={() => {
          if (!activity.isRead) markAsRead(activity.id);
          setSelectedActivity(activity);
          setShowActivityDetails(true);
        }}
      >
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {activity.actor.type === "system" ? (
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  {getActivityIcon(activity.type)}
                </div>
              ) : (
                <Avatar>
                  <AvatarImage src={activity.actor.avatar} />
                  <AvatarFallback>
                    {activity.actor.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-sm truncate">
                  {activity.title}
                </h4>
                {!activity.isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                )}
                {activity.isPinned && (
                  <Pin className="w-3 h-3 text-orange-500 flex-shrink-0" />
                )}
              </div>

              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {activity.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{formatTimestamp(activity.timestamp)}</span>
                  <span className="capitalize">
                    {activity.type.replace("_", " ")}
                  </span>
                  {activity.metadata?.amount && (
                    <Badge variant="outline" className="text-green-600">
                      ${activity.metadata.amount.toLocaleString()}
                    </Badge>
                  )}
                  {activity.metadata?.rating && (
                    <Badge variant="outline" className="text-yellow-600">
                      ★ {activity.metadata.rating}
                    </Badge>
                  )}
                </div>

                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePin(activity.id);
                    }}
                  >
                    <Pin
                      className={`w-3 h-3 ${activity.isPinned ? "text-orange-500" : "text-gray-400"}`}
                    />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {activity.actions && activity.actions.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {activity.actions.map((action) => (
                    <Button
                      key={action.id}
                      variant={
                        action.type === "primary" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        action.onClick();
                      }}
                      className="flex items-center gap-1"
                    >
                      {action.icon}
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const NotificationSettings = () => {
    if (!preferences) return null;

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Notification Channels</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {channels.map((channel) => (
              <div
                key={channel.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {channel.icon}
                  <div>
                    <h4 className="font-medium">{channel.name}</h4>
                    <p className="text-sm text-gray-600">
                      {channel.description}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={channel.enabled}
                  onCheckedChange={(checked) => {
                    setChannels((prev) =>
                      prev.map((c) =>
                        c.id === channel.id ? { ...c, enabled: checked } : c,
                      ),
                    );
                  }}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Types</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Project Updates</Label>
                <p className="text-sm text-gray-600">
                  New proposals, milestones, and project changes
                </p>
              </div>
              <Switch
                checked={preferences.projectUpdates}
                onCheckedChange={(checked) => {
                  setPreferences((prev) =>
                    prev ? { ...prev, projectUpdates: checked } : null,
                  );
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Messages</Label>
                <p className="text-sm text-gray-600">
                  Direct messages and chat notifications
                </p>
              </div>
              <Switch
                checked={preferences.messages}
                onCheckedChange={(checked) => {
                  setPreferences((prev) =>
                    prev ? { ...prev, messages: checked } : null,
                  );
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Payments</Label>
                <p className="text-sm text-gray-600">
                  Payment confirmations and escrow updates
                </p>
              </div>
              <Switch
                checked={preferences.payments}
                onCheckedChange={(checked) => {
                  setPreferences((prev) =>
                    prev ? { ...prev, payments: checked } : null,
                  );
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Reviews & Ratings</Label>
                <p className="text-sm text-gray-600">
                  New reviews and rating notifications
                </p>
              </div>
              <Switch
                checked={preferences.reviews}
                onCheckedChange={(checked) => {
                  setPreferences((prev) =>
                    prev ? { ...prev, reviews: checked } : null,
                  );
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Marketing Updates</Label>
                <p className="text-sm text-gray-600">
                  Platform news and promotional content
                </p>
              </div>
              <Switch
                checked={preferences.marketing}
                onCheckedChange={(checked) => {
                  setPreferences((prev) =>
                    prev ? { ...prev, marketing: checked } : null,
                  );
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Frequency</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Delivery Frequency</Label>
              <Select
                value={preferences.frequency}
                onValueChange={(value: any) => {
                  setPreferences((prev) =>
                    prev ? { ...prev, frequency: value } : null,
                  );
                }}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="real_time">Real-time</SelectItem>
                  <SelectItem value="hourly">Hourly Digest</SelectItem>
                  <SelectItem value="daily">Daily Summary</SelectItem>
                  <SelectItem value="weekly">Weekly Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Quiet Hours</Label>
                <Switch
                  checked={preferences.quietHours.enabled}
                  onCheckedChange={(checked) => {
                    setPreferences((prev) =>
                      prev
                        ? {
                            ...prev,
                            quietHours: {
                              ...prev.quietHours,
                              enabled: checked,
                            },
                          }
                        : null,
                    );
                  }}
                />
              </div>

              {preferences.quietHours.enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">Start Time</Label>
                    <Input
                      type="time"
                      value={preferences.quietHours.start}
                      onChange={(e) => {
                        setPreferences((prev) =>
                          prev
                            ? {
                                ...prev,
                                quietHours: {
                                  ...prev.quietHours,
                                  start: e.target.value,
                                },
                              }
                            : null,
                        );
                      }}
                    />
                  </div>
                  <div>
                    <Label className="text-sm">End Time</Label>
                    <Input
                      type="time"
                      value={preferences.quietHours.end}
                      onChange={(e) => {
                        setPreferences((prev) =>
                          prev
                            ? {
                                ...prev,
                                quietHours: {
                                  ...prev.quietHours,
                                  end: e.target.value,
                                },
                              }
                            : null,
                        );
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const filteredActivities = activities.filter((activity) => {
    const matchesType = filterType === "all" || activity.type === filterType;
    const matchesSearch =
      searchTerm === "" ||
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesReadFilter = !showUnreadOnly || !activity.isRead;

    return matchesType && matchesSearch && matchesReadFilter;
  });

  const pinnedActivities = filteredActivities.filter((a) => a.isPinned);
  const regularActivities = filteredActivities.filter((a) => !a.isPinned);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Activity & Notifications</h2>
          <p className="text-gray-600">
            Stay updated with your freelance activities
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={markAllAsRead}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="feed">
            Activity Feed
            {notifications.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {notifications.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="notifications">
            Notifications
            {notifications.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {notifications.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center justify-between bg-gray-50 p-4 rounded-lg">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="project_update">Projects</SelectItem>
                  <SelectItem value="message">Messages</SelectItem>
                  <SelectItem value="payment">Payments</SelectItem>
                  <SelectItem value="review">Reviews</SelectItem>
                  <SelectItem value="milestone">Milestones</SelectItem>
                  <SelectItem value="achievement">Achievements</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Switch
                  checked={showUnreadOnly}
                  onCheckedChange={setShowUnreadOnly}
                />
                <Label className="text-sm">Unread only</Label>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              {filteredActivities.length} activities
            </div>
          </div>

          <div className="space-y-4">
            {pinnedActivities.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Pin className="w-5 h-5 text-orange-500" />
                  Pinned
                </h3>
                <div className="space-y-3">
                  {pinnedActivities.map((activity) => (
                    <ActivityCard key={activity.id} activity={activity} />
                  ))}
                </div>
                <Separator className="my-6" />
              </div>
            )}

            {regularActivities.length > 0 ? (
              <div className="space-y-3">
                {regularActivities.map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No activities found</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <ActivityCard key={notification.id} activity={notification} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  All caught up! No new notifications.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <NotificationSettings />
        </TabsContent>
      </Tabs>

      {/* Activity Details Dialog */}
      {selectedActivity && (
        <Dialog
          open={showActivityDetails}
          onOpenChange={setShowActivityDetails}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getActivityIcon(selectedActivity.type)}
                {selectedActivity.title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={selectedActivity.actor.avatar} />
                  <AvatarFallback>
                    {selectedActivity.actor.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedActivity.actor.name}</p>
                  <p className="text-sm text-gray-600">
                    {formatTimestamp(selectedActivity.timestamp)}
                  </p>
                </div>
              </div>

              <p className="text-gray-700">{selectedActivity.description}</p>

              {selectedActivity.metadata && (
                <div className="space-y-2">
                  {Object.entries(selectedActivity.metadata).map(
                    ([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-sm text-gray-600 capitalize">
                          {key.replace("_", " ")}:
                        </span>
                        <span className="text-sm font-medium">
                          {String(value)}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              )}

              {selectedActivity.actions &&
                selectedActivity.actions.length > 0 && (
                  <div className="flex gap-2">
                    {selectedActivity.actions.map((action) => (
                      <Button
                        key={action.id}
                        variant={
                          action.type === "primary" ? "default" : "outline"
                        }
                        onClick={action.onClick}
                        className="flex items-center gap-2"
                      >
                        {action.icon}
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ActivityFeedSystem;
