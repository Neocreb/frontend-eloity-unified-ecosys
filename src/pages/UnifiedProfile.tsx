// @ts-nocheck
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useWalletContext } from "@/contexts/WalletContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Settings,
  Calendar,
  MapPin,
  Globe,
  Users,
  Heart,
  MessageSquare,
  Star,
  TrendingUp,
  Award,
  Camera,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Gift,
  Shield,
  Verified,
  Crown,
  Edit,
  Share2,
  MoreHorizontal,
  UserPlus,
  MessageCircle,
  Image as ImageIcon,
  Upload,
  Check,
  X,
  Eye,
  Clock,
  Store,
  Code,
  Coins,
  DollarSign,
  Video,
  Grid3X3,
  List,
  Filter,
  BarChart3,
  Target,
  Lightbulb,
  Calendar as CalendarIcon,
  Activity,
  Trophy,
  Zap,
  Play,
  Wallet,
  Bell,
  CreditCard,
  Send,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Minus,
  TrendingDown,
  Smartphone,
  Lock,
  Unlock,
  Copy,
  QrCode,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { UserProfile } from "@/types/user";
import { Product } from "@/types/marketplace";
import { profileService } from "@/services/profileService";

interface UnifiedProfileProps {
  username?: string;
}

const UnifiedProfile: React.FC<UnifiedProfileProps> = ({
  username: propUsername,
}) => {
  const { username: paramUsername } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { walletBalance, transactions, isLoading: walletLoading } = useWalletContext();
  const { toast } = useToast();

  const targetUsername = propUsername || paramUsername;

  // State management
  const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [posts, setPosts] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [mediaFilter, setMediaFilter] = useState("all");
  const [mediaViewMode, setMediaViewMode] = useState("grid");
  const [notifications, setNotifications] = useState<any[]>([]);

  const isOwnProfile =
    !targetUsername || (user && user.profile?.username === targetUsername);

  // Enhanced mock profile data with unified features
  const createMockProfile = (profile: UserProfile) => ({
    id: profile.id,
    username: profile.username,
    displayName: profile.full_name,
    bio:
      profile.bio ||
      "Software Developer | Tech Enthusiast | Coffee Lover ☕\nBuilding the future one line of code at a time 🚀\n\n🌟 Passionate about creating amazing user experiences\n📱 Mobile-first developer\n🎯 Always learning new technologies",
    avatar:
      profile.avatar_url ||
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    banner:
      profile.banner_url ||
      "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    location: "San Francisco, CA",
    website: "https://johndoe.dev",
    joinDate: "January 2020",
    verified: true,
    followers: 2847,
    following: 892,
    posts: 156,
    engagement: 94,
    profileViews: 15620,
    walletBalance: walletBalance?.total || 0,
    recentTransactions: transactions?.slice(0, 3) || [],
    unreadNotifications: 5,
    onlineStatus: "online",
    trustScore: 9.2,
    achievements: [
      { title: "Top Contributor", date: "2024", icon: Trophy },
      { title: "Verified Creator", date: "2023", icon: Verified },
      { title: "Early Adopter", date: "2020", icon: Star },
      { title: "Premium Member", date: "2023", icon: Crown },
      { title: "Trusted Seller", date: "2024", icon: Shield },
    ],
    walletFeatures: {
      eloityPoints: 1250,
      cryptoBalance: 0.05,
      totalEarnings: 5420,
      pendingPayments: 150,
    },
    quickActions: [
      { label: "Send Money", icon: Send, action: () => navigate("/app/wallet") },
      { label: "Request Payment", icon: Plus, action: () => navigate("/app/wallet") },
      { label: "View Transactions", icon: CreditCard, action: () => navigate("/app/wallet") },
      { label: "Notifications", icon: Bell, action: () => navigate("/app/notifications") },
    ],
  });

  // Mock notification data
  const mockNotifications = [
    {
      id: 1,
      type: "payment",
      title: "Payment Received",
      message: "You received $50 from John Doe",
      time: "2 hours ago",
      icon: DollarSign,
      color: "text-green-500",
      unread: true,
    },
    {
      id: 2,
      type: "follow",
      title: "New Follower",
      message: "Sarah Johnson started following you",
      time: "5 hours ago",
      icon: UserPlus,
      color: "text-blue-500",
      unread: true,
    },
    {
      id: 3,
      type: "chat",
      title: "New Message",
      message: "You have a new message from Alex",
      time: "1 day ago",
      icon: MessageCircle,
      color: "text-purple-500",
      unread: false,
    },
  ];

  // Mock data
  const mockProfile = profileUser
    ? createMockProfile(profileUser)
    : {
        id: "1",
        username: "johndoe",
        displayName: "John Doe",
        bio: "Software Developer | Tech Enthusiast | Coffee Lover ☕\nBuilding the future one line of code at a time 🚀",
        avatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        banner:
          "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        location: "San Francisco, CA",
        website: "https://johndoe.dev",
        joinDate: "January 2020",
        verified: true,
        followers: 2847,
        following: 892,
        posts: 156,
        engagement: 94,
        profileViews: 15620,
        walletBalance: 1250.50,
        recentTransactions: [
          { id: 1, type: "received", amount: 50, from: "John Doe", date: "2h ago" },
          { id: 2, type: "sent", amount: 25, to: "Alice Smith", date: "1d ago" },
          { id: 3, type: "earned", amount: 10, from: "Platform Reward", date: "3d ago" },
        ],
        unreadNotifications: 5,
        onlineStatus: "online",
        trustScore: 9.2,
        walletFeatures: {
          eloityPoints: 1250,
          cryptoBalance: 0.05,
          totalEarnings: 5420,
          pendingPayments: 150,
        },
        quickActions: [
          { label: "Send Money", icon: Send, action: () => navigate("/app/wallet") },
          { label: "Request Payment", icon: Plus, action: () => navigate("/app/wallet") },
          { label: "View Transactions", icon: CreditCard, action: () => navigate("/app/wallet") },
          { label: "Notifications", icon: Bell, action: () => navigate("/app/notifications") },
        ],
      };

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        if (isOwnProfile && user?.profile) {
          setProfileUser(user.profile);
          setNotifications(mockNotifications);
        } else if (targetUsername) {
          const profile = await profileService.getUserByUsername(targetUsername);
          if (profile) {
            setProfileUser(profile);
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [targetUsername, isOwnProfile, user, toast]);

  const handleFollow = async () => {
    setIsFollowing(!isFollowing);
    setFollowerCount((prev) => (isFollowing ? prev - 1 : prev + 1));
    toast({
      title: isFollowing ? "Unfollowed" : "Following",
      description: `You are ${isFollowing ? "no longer" : "now"} following ${mockProfile.displayName}`,
    });
  };

  const handleQuickAction = (action: () => void) => {
    action();
  };

  const handleStartChat = () => {
    navigate(`/app/chat?user=${targetUsername}`);
  };

  const handleSendMoney = () => {
    navigate(`/app/wallet?action=send&recipient=${targetUsername}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-lg" />
            <div className="flex gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-4 lg:py-6">
        <div className="space-y-4 sm:space-y-6">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {/* Enhanced Profile Header */}
          <Card className="overflow-hidden">
            <div className="relative">
              {/* Banner */}
              <div
                className="h-32 sm:h-48 lg:h-56 bg-gradient-to-r from-blue-500 to-purple-600 relative bg-cover bg-center"
                style={{ backgroundImage: `url(${mockProfile.banner})` }}
              >
                <div className="absolute inset-0 bg-black/20" />
                
                {/* Online Status Indicator */}
                {isOwnProfile && (
                  <div className="absolute top-3 left-3 flex items-center gap-2 bg-green-500/90 text-white px-2 py-1 rounded-full text-xs">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    Online
                  </div>
                )}

                {/* Quick Action Menu */}
                {isOwnProfile && (
                  <div className="absolute top-3 right-3 flex gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="sm" className="backdrop-blur-sm bg-white/10 hover:bg-white/20 text-white border-white/20">
                          <Zap className="h-4 w-4 mr-2" />
                          Quick Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {mockProfile.quickActions?.map((action, index) => (
                          <DropdownMenuItem
                            key={index}
                            onClick={action.action}
                            className="flex items-center gap-2"
                          >
                            <action.icon className="h-4 w-4" />
                            {action.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <CardContent className="relative pt-0 px-3 sm:px-6">
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between -mt-12 sm:-mt-16 lg:-mt-20">
                  <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
                    {/* Avatar */}
                    <div className="relative">
                      <Avatar className="h-24 w-24 sm:h-32 sm:w-32 lg:h-36 lg:w-36 border-4 border-white shadow-lg">
                        <AvatarImage
                          src={mockProfile.avatar}
                          alt={mockProfile.displayName}
                        />
                        <AvatarFallback className="text-xl sm:text-2xl lg:text-3xl font-bold">
                          {mockProfile.displayName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Trust Score Badge */}
                      <div className="absolute -bottom-2 -right-2 bg-green-100 border-2 border-white rounded-full px-2 py-1 text-xs font-bold text-green-700">
                        <Shield className="h-3 w-3 inline mr-1" />
                        {mockProfile.trustScore}
                      </div>
                    </div>

                    {/* Name and Basic Info */}
                    <div className="flex-1 space-y-2 mt-3 sm:mt-4 lg:mt-0 sm:mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
                          {mockProfile.displayName}
                        </h1>
                        {mockProfile.verified && (
                          <Verified className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 fill-current" />
                        )}
                        <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500 fill-current" />
                      </div>

                      <p className="text-sm sm:text-base text-muted-foreground">
                        @{mockProfile.username}
                      </p>

                      {/* Enhanced Status Badges */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 border-purple-200">
                          <Crown className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-200">
                          <Shield className="h-3 w-3 mr-1" />
                          Trust Score {mockProfile.trustScore}
                        </Badge>
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                          <Star className="h-3 w-3 mr-1" />
                          Level 8
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>{mockProfile.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>Joined {mockProfile.joinDate}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>{mockProfile.profileViews.toLocaleString()} views</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 mt-4 lg:mt-0">
                    {isOwnProfile ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowEditModal(true)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate("/app/wallet")}
                        >
                          <Wallet className="h-4 w-4 mr-2" />
                          Wallet
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button onClick={handleFollow} size="sm">
                          {isFollowing ? (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Following
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Follow
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleStartChat}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSendMoney}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Send Money
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <div className="mt-6">
                  <p className="text-sm whitespace-pre-line leading-relaxed">
                    {mockProfile.bio}
                  </p>
                  {mockProfile.website && (
                    <a
                      href={mockProfile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:underline mt-2 text-sm"
                    >
                      <Globe className="h-4 w-4" />
                      {mockProfile.website.replace("https://", "")}
                    </a>
                  )}
                </div>

                {/* Enhanced Stats with Wallet Integration */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mt-6 py-4 border-t">
                  <div className="text-center">
                    <div className="text-lg sm:text-xl font-bold">{mockProfile.posts}</div>
                    <div className="text-xs text-muted-foreground">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg sm:text-xl font-bold">{followerCount.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg sm:text-xl font-bold">{followingCount.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Following</div>
                  </div>
                  {isOwnProfile && (
                    <>
                      <div className="text-center cursor-pointer" onClick={() => navigate("/app/wallet")}>
                        <div className="text-lg sm:text-xl font-bold text-green-600">${mockProfile.walletBalance}</div>
                        <div className="text-xs text-muted-foreground">Balance</div>
                      </div>
                      <div className="text-center cursor-pointer" onClick={() => navigate("/app/notifications")}>
                        <div className="text-lg sm:text-xl font-bold text-blue-600 relative">
                          {mockProfile.unreadNotifications}
                          {mockProfile.unreadNotifications > 0 && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">Notifications</div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </div>
          </Card>

          {/* Unified Wallet Overview (Own Profile Only) */}
          {isOwnProfile && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-green-600" />
                  Wallet Overview
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/app/wallet")}
                    className="ml-auto"
                  >
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    View Full Wallet
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-600" />
                    <div className="text-xl font-bold text-green-700">${mockProfile.walletBalance}</div>
                    <div className="text-xs text-green-600">Total Balance</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <Coins className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                    <div className="text-xl font-bold text-purple-700">{mockProfile.walletFeatures?.eloityPoints}</div>
                    <div className="text-xs text-purple-600">Eloity Points</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                    <div className="text-xl font-bold text-blue-700">${mockProfile.walletFeatures?.totalEarnings}</div>
                    <div className="text-xs text-blue-600">Total Earnings</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <Clock className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                    <div className="text-xl font-bold text-orange-700">${mockProfile.walletFeatures?.pendingPayments}</div>
                    <div className="text-xs text-orange-600">Pending</div>
                  </div>
                </div>

                {/* Recent Transactions */}
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Recent Transactions
                  </h4>
                  <div className="space-y-2">
                    {mockProfile.recentTransactions?.slice(0, 3).map((transaction: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {transaction.type === "received" ? (
                            <ArrowDownLeft className="h-4 w-4 text-green-500" />
                          ) : transaction.type === "sent" ? (
                            <ArrowUpRight className="h-4 w-4 text-red-500" />
                          ) : (
                            <Gift className="h-4 w-4 text-blue-500" />
                          )}
                          <div>
                            <div className="text-sm font-medium">
                              {transaction.type === "received" ? `From ${transaction.from}` :
                               transaction.type === "sent" ? `To ${transaction.to}` :
                               transaction.from}
                            </div>
                            <div className="text-xs text-muted-foreground">{transaction.date}</div>
                          </div>
                        </div>
                        <div className={cn(
                          "text-sm font-medium",
                          transaction.type === "received" || transaction.type === "earned" ? "text-green-600" : "text-red-600"
                        )}>
                          {transaction.type === "sent" ? "-" : "+"}${transaction.amount}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Unified Notifications Overview (Own Profile Only) */}
          {isOwnProfile && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-blue-600" />
                  Recent Notifications
                  <Badge variant="secondary" className="ml-2">
                    {notifications.filter(n => n.unread).length} unread
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/app/notifications")}
                    className="ml-auto"
                  >
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    View All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications.slice(0, 3).map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                        notification.unread ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"
                      )}
                    >
                      <div className={cn("p-2 rounded-full", notification.unread ? "bg-blue-100" : "bg-gray-100")}>
                        <notification.icon className={cn("h-4 w-4", notification.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-sm font-medium">{notification.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                          </div>
                          {notification.unread && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Enhanced Tabs with better integration */}
          <Card>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b px-6">
                <TabsList className="h-auto p-0 bg-transparent w-full justify-start gap-0">
                  <TabsTrigger
                    value="posts"
                    className="px-4 py-3 border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 bg-transparent rounded-none"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Posts
                  </TabsTrigger>
                  <TabsTrigger
                    value="activity"
                    className="px-4 py-3 border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 bg-transparent rounded-none"
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Activity
                  </TabsTrigger>
                  {isOwnProfile && (
                    <TabsTrigger
                      value="earnings"
                      className="px-4 py-3 border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 bg-transparent rounded-none"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Earnings
                    </TabsTrigger>
                  )}
                  <TabsTrigger
                    value="about"
                    className="px-4 py-3 border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 bg-transparent rounded-none"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    About
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6">
                <TabsContent value="posts" className="mt-0">
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No posts yet</h3>
                    <p className="text-muted-foreground mb-4">Start sharing your thoughts with the community</p>
                    {isOwnProfile && (
                      <Button onClick={() => navigate("/app/create")}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Post
                      </Button>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="activity" className="mt-0">
                  <div className="text-center py-12">
                    <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">Activity Timeline</h3>
                    <p className="text-muted-foreground">Recent actions and interactions</p>
                  </div>
                </TabsContent>

                {isOwnProfile && (
                  <TabsContent value="earnings" className="mt-0">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="p-4 text-center">
                            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                            <div className="text-2xl font-bold text-green-700">${mockProfile.walletFeatures?.totalEarnings}</div>
                            <div className="text-sm text-muted-foreground">Total Earnings</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                            <div className="text-2xl font-bold text-blue-700">$230</div>
                            <div className="text-sm text-muted-foreground">This Month</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <Clock className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                            <div className="text-2xl font-bold text-orange-700">${mockProfile.walletFeatures?.pendingPayments}</div>
                            <div className="text-sm text-muted-foreground">Pending</div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div className="text-center">
                        <Button onClick={() => navigate("/app/wallet")}>
                          <Wallet className="h-4 w-4 mr-2" />
                          View Detailed Earnings
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                )}

                <TabsContent value="about" className="mt-0">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>About {mockProfile.displayName}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex items-center gap-3">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="text-sm font-medium">Location</div>
                              <div className="text-sm text-muted-foreground">{mockProfile.location}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="text-sm font-medium">Joined</div>
                              <div className="text-sm text-muted-foreground">{mockProfile.joinDate}</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Achievements</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {mockProfile.achievements?.map((achievement, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-3 p-4 rounded-lg border bg-gradient-to-r from-blue-50 to-purple-50"
                            >
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                <achievement.icon className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <div className="font-medium">{achievement.title}</div>
                                <div className="text-xs text-muted-foreground">{achievement.date}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </Card>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        profile={mockProfile}
      />
    </div>
  );
};

export default UnifiedProfile;
