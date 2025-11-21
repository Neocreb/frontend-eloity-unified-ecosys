// @ts-nocheck
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import UserListModal from "@/components/profile/UserListModal";
import { ProfilePostCard } from "@/components/profile/ProfilePostCard";
import { EnhancedCommentsSection } from "@/components/feed/EnhancedCommentsSection";
import VirtualGiftsAndTips from "@/components/premium/VirtualGiftsAndTips";
import { Bookmark } from "lucide-react";
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
  Send,
  Truck,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { UserProfile } from "@/types/user";
import { Product } from "@/types/marketplace";
import { profileService } from "@/services/profileService";

interface EnhancedProfileProps {
  username?: string;
}

const EnhancedProfile: React.FC<EnhancedProfileProps> = ({
  username: propUsername,
}) => {
  const { username: paramUsername } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const targetUsername = propUsername || paramUsername;
  const resolvedUsername = targetUsername || user?.profile?.username || (user as any)?.username || "user";
  const pageUsername = (targetUsername && targetUsername !== "unknown" && targetUsername !== "user")
    ? targetUsername
    : (user?.profile?.username || (user as any)?.username || resolvedUsername);

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
  const [isEditingCover, setIsEditingCover] = useState(false);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [coverPhotoUrl, setCoverPhotoUrl] = useState("");

  // Relationship and UI state
  const [viewerFollowsOwner, setViewerFollowsOwner] = useState(false);
  const [ownerFollowsViewer, setOwnerFollowsViewer] = useState(false);
  const [openCommentsFor, setOpenCommentsFor] = useState<string | null>(null);

  // New state for enhanced features
  const [mediaFilter, setMediaFilter] = useState("all");
  const [mediaViewMode, setMediaViewMode] = useState("grid");

  // User list modal states
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [showViewersModal, setShowViewersModal] = useState(false);
  const [profileViewers, setProfileViewers] = useState(1256);

  // Mock user type states
  const [isDeliveryProvider, setIsDeliveryProvider] = useState(false); // This would come from user profile data

  const isOwnProfile =
    !targetUsername || (user && user.profile?.username === targetUsername);

  // Enhanced mock profile data
  const createMockProfile = (profile: UserProfile) => ({
    id: profile.id,
    username: profile.username,
    displayName: profile.full_name,
    bio:
      profile.bio ||
      "Software Developer | Tech Enthusiast | Coffee Lover ☕\nBuilding the future one line of code at a time 🚀\n\n��� Passionate about creating amazing user experiences\n��� Mobile-first developer\n🎯 Always learning new technologies",
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
    profileViews: 15620,
    jobTitle: "Senior Full Stack Developer",
    company: "TechCorp Inc.",
    education: "Stanford University",
    relationshipStatus: "Single",
    languages: ["English", "Spanish", "French"],
    skills: [
      "React",
      "TypeScript",
      "Node.js",
      "Python",
      "AWS",
      "Docker",
      "GraphQL",
      "PostgreSQL",
      "MongoDB",
      "React Native",
    ],
    interests: ["Technology", "Travel", "Photography", "Coffee", "Hiking"],
    achievements: [
      { title: "Top Contributor", date: "2024", icon: Trophy },
      { title: "Verified Creator", date: "2023", icon: Verified },
      { title: "Early Adopter", date: "2020", icon: Star },
    ],
    creatorStats: {
      totalViews: 125000,
      totalLikes: 8940,
      totalShares: 1230,
      engagementRate: 7.8,
      subscriberGrowth: 12.5,
      avgViewDuration: "3:42",
    },
  });

  // Enhanced mock data
  const mockPosts = [
    {
      id: 1,
      content:
        "Just shipped a new feature! 🚀 Excited to see how users engage with it. Building in public is such a rewarding experience.",
      timestamp: "2 hours ago",
      likes: 24,
      comments: 8,
      shares: 3,
      image:
        "https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80",
    },
    {
      id: 2,
      content:
        "Coffee and code - the perfect combination for a productive morning ☕💻",
      timestamp: "1 day ago",
      likes: 42,
      comments: 12,
      shares: 5,
    },
    {
      id: 3,
      content:
        "Attending the tech conference today! Looking forward to networking and learning about the latest trends in AI and web development.",
      timestamp: "3 days ago",
      likes: 67,
      comments: 23,
      shares: 8,
    },
  ];

  const mockMedia = [
    {
      id: 1,
      type: "image",
      url: "https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80",
      title: "New Feature Launch",
      description: "Screenshot of our latest feature",
      date: "2 hours ago",
      likes: 24,
      views: 156,
    },
    {
      id: 2,
      type: "video",
      url: "https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80",
      title: "Coding Tutorial",
      description: "How to build a React component",
      date: "1 day ago",
      likes: 67,
      views: 892,
      duration: "5:23",
    },
    {
      id: 3,
      type: "image",
      url: "https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80",
      title: "Workspace Setup",
      description: "My current development setup",
      date: "3 days ago",
      likes: 89,
      views: 234,
    },
    {
      id: 4,
      type: "video",
      url: "https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80",
      title: "Conference Talk",
      description: "Speaking about modern web development",
      date: "1 week ago",
      likes: 156,
      views: 1240,
      duration: "25:14",
    },
  ];

  const mockActivity = [
    {
      id: 1,
      type: "post",
      action: "Published a new post",
      content: "Just shipped a new feature!",
      timestamp: "2 hours ago",
      engagement: { likes: 24, comments: 8, shares: 3 },
    },
    {
      id: 2,
      type: "video",
      action: "Uploaded a video",
      content: "Coding Tutorial: React Components",
      timestamp: "1 day ago",
      engagement: { likes: 67, views: 892, duration: "5:23" },
    },
    {
      id: 3,
      type: "achievement",
      action: "Earned an achievement",
      content: "Top Contributor Badge",
      timestamp: "3 days ago",
      icon: Trophy,
    },
    {
      id: 4,
      type: "follow",
      action: "Gained 25 new followers",
      content: "Profile growth milestone",
      timestamp: "1 week ago",
      engagement: { followers: 25 },
    },
  ];

  const viewerCanSee = (privacy?: string) => {
    const v = (privacy || "public").toLowerCase();
    if (v === "public") return true;
    if (isOwnProfile) return true;
    if (v === "private") return false;
    if (v === "friends") return viewerFollowsOwner && ownerFollowsViewer;
    return true;
  };

  const derivedMedia = (posts || [])
    .map((p: any) => {
      const privacy = p.privacy || p.audience || p.content?.audience || "public";
      if (!viewerCanSee(privacy)) return [] as any[];
      const postId = String(p.id ?? p.post_id ?? p.uuid ?? p.id);
      const arr: any[] = [];

      // Get image from image_url or media_urls
      if (p.image_url) {
        arr.push({ id: `${postId}-img`, type: "image", url: p.image_url, postId });
      } else if (p.media_urls && Array.isArray(p.media_urls)) {
        p.media_urls.forEach((url: string, idx: number) => {
          arr.push({ id: `${postId}-${idx}`, type: "image", url, postId });
        });
      }

      // Add media from content object
      const mediaArr = p.content?.media || [];
      mediaArr.forEach((m: any, idx: number) => {
        if (m?.url && (m.type === "image" || m.type === "video")) {
          arr.push({ id: `${postId}-${idx}`, type: m.type, url: m.url, postId });
        }
      });
      return arr;
    })
    .flat();

  const mediaSource: any[] = derivedMedia;

  const filteredMedia = mediaSource
    .filter((item: any) => {
      if (mediaFilter === "all") return true;
      if (mediaFilter === "images") return item.type === "image";
      if (mediaFilter === "videos") return item.type === "video";
      return true;
    })
    .slice(0, 50); // Limit to 50 items for performance

  // Mock data for followers, following, and viewers
  const mockFollowers = [
    {
      id: "1",
      username: "sarah_johnson",
      displayName: "Sarah Johnson",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b977?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      verified: true,
      isFollowing: false,
      followsBack: true,
      isOnline: true,
      bio: "UI/UX Designer passionate about creating beautiful experiences",
      followers: 1240,
    },
    {
      id: "2",
      username: "mike_chen",
      displayName: "Mike Chen",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      verified: false,
      isFollowing: true,
      followsBack: false,
      isOnline: false,
      bio: "Full-stack developer and crypto enthusiast",
      followers: 567,
    },
    {
      id: "3",
      username: "emma_davis",
      displayName: "Emma Davis",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      verified: true,
      isFollowing: false,
      followsBack: false,
      isOnline: true,
      bio: "Product Manager | Tech Leader | Coffee Addict",
      followers: 2134,
    },
    {
      id: "4",
      username: "alex_wilson",
      displayName: "Alex Wilson",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      verified: false,
      isFollowing: true,
      followsBack: true,
      isOnline: false,
      bio: "Freelance developer building the future",
      followers: 789,
    },
  ];

  const mockFollowing = [
    {
      id: "5",
      username: "tech_guru",
      displayName: "Tech Guru",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      verified: true,
      isFollowing: true,
      followsBack: true,
      isOnline: true,
      bio: "Technology insights and trends",
      followers: 15600,
    },
    {
      id: "6",
      username: "crypto_analyst",
      displayName: "Crypto Analyst",
      avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      verified: true,
      isFollowing: true,
      followsBack: false,
      isOnline: false,
      bio: "Crypto market analysis and trading insights",
      followers: 8900,
    },
  ];

  const mockViewers = [
    {
      id: "7",
      username: "jane_doe",
      displayName: "Jane Doe",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b977?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      verified: false,
      isOnline: true,
      lastSeen: "2 minutes ago",
      bio: "Marketing professional",
      followers: 340,
    },
    {
      id: "8",
      username: "john_smith",
      displayName: "John Smith",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      verified: false,
      isOnline: false,
      lastSeen: "1 hour ago",
      bio: "Software engineer at TechCorp",
      followers: 567,
    },
    {
      id: "9",
      username: "lisa_wang",
      displayName: "Lisa Wang",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      verified: true,
      isOnline: true,
      lastSeen: "5 minutes ago",
      bio: "Entrepreneur and investor",
      followers: 1890,
    },
  ];

  // Mock profile data
  const mockProfile = profileUser
    ? createMockProfile(profileUser)
    : {
        id: "1",
        username: "johndoe",
        displayName: "John Doe",
        bio: "Software Developer | Tech Enthusiast | Coffee Lover ☕\nBuilding the future one line of code at a time 🚀\n\n🌟 Passionate about creating amazing user experiences\n📱 Mobile-first developer\n🎯 Always learning new technologies",
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
        profileViews: 15620,
        jobTitle: "Senior Full Stack Developer",
        company: "TechCorp Inc.",
        education: "Stanford University",
        relationshipStatus: "Single",
        languages: ["English", "Spanish", "French"],
        skills: [
          "React",
          "TypeScript",
          "Node.js",
          "Python",
          "AWS",
          "Docker",
          "GraphQL",
          "PostgreSQL",
          "MongoDB",
          "React Native",
        ],
        interests: ["Technology", "Travel", "Photography", "Coffee", "Hiking"],
        achievements: [
          { title: "Top Contributor", date: "2024", icon: Trophy },
          { title: "Verified Creator", date: "2023", icon: Verified },
          { title: "Early Adopter", date: "2020", icon: Star },
        ],
        creatorStats: {
          totalViews: 125000,
          totalLikes: 8940,
          totalShares: 1230,
          engagementRate: 7.8,
          subscriberGrowth: 12.5,
          avgViewDuration: "3:42",
        },
      };

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        let profileToLoad: UserProfile | null = null;

        if (isOwnProfile && user?.profile) {
          profileToLoad = user.profile;
        } else if (targetUsername) {
          profileToLoad = await profileService.getUserByUsername(targetUsername);
        }

        if (profileToLoad) {
          setProfileUser(profileToLoad);

          // Fetch real content data
          const [userPosts, userProducts, userServices] = await Promise.all([
            profileService.getUserPosts(profileToLoad.id).catch(() => []),
            profileService.getUserProducts(profileToLoad.id).catch(() => []),
            profileService.getUserServices(profileToLoad.id).catch(() => []),
          ]);

          // Always set the real data, no mock fallbacks
          setPosts(userPosts || []);
          setProducts(userProducts || []);
          setServices(userServices || []);

          // Set follower counts
          setFollowerCount(profileToLoad.followers_count || 0);
          setFollowingCount(profileToLoad.following_count || 0);
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

  useEffect(() => {
    const checkRelationship = async () => {
      try {
        if (!user?.id || !profileUser?.id) return;
        const [vf, of] = await Promise.all([
          profileService.isFollowing(user.id, profileUser.id),
          profileService.isFollowing(profileUser.id, user.id),
        ]);
        setViewerFollowsOwner(!!vf);
        setOwnerFollowsViewer(!!of);
      } catch (e) {
        setViewerFollowsOwner(false);
        setOwnerFollowsViewer(false);
      }
    };
    checkRelationship();
  }, [user?.id, profileUser?.id]);

  const handleFollow = async () => {
    setIsFollowing(!isFollowing);
    setFollowerCount((prev) => (isFollowing ? prev - 1 : prev + 1));
    toast({
      title: isFollowing ? "Unfollowed" : "Following",
      description: `You are ${isFollowing ? "no longer" : "now"} following ${profileUser?.full_name || "this user"}`,
    });
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
      <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-4 lg:py-6">
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

          {/* Profile Header */}
          <Card className="overflow-hidden">
            <div className="relative">
              {/* Banner */}
              <div
                className="h-28 sm:h-40 lg:h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative bg-cover bg-center"
                style={{ backgroundImage: `url(${profileUser?.banner_url || "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"})` }}
              >
                <div className="absolute inset-0 bg-black/20" />
                {isOwnProfile && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute top-2 right-2 sm:top-4 sm:right-4 backdrop-blur-sm bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs sm:text-sm"
                    onClick={() => setIsEditingCover(true)}
                  >
                    <Camera className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Edit Cover</span>
                    <span className="sm:hidden">Edit</span>
                  </Button>
                )}
              </div>

              {/* Profile Info */}
              <CardContent className="relative pt-0 px-3 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-10 sm:-mt-12 lg:-mt-16">
                  <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
                    {/* Avatar */}
                    <div className="relative">
                      <Avatar className="h-20 w-20 sm:h-28 sm:w-28 lg:h-32 lg:w-32 border-3 sm:border-4 border-white shadow-lg">
                        <AvatarImage
                          src={profileUser?.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                          alt={profileUser?.full_name || "User"}
                        />
                        <AvatarFallback className="text-lg sm:text-xl lg:text-2xl font-bold">
                          {(profileUser?.full_name || "User")
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      {isOwnProfile && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 h-6 w-6 sm:h-8 sm:w-8 rounded-full p-0"
                          onClick={() => setIsEditingAvatar(true)}
                        >
                          <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      )}
                    </div>

                    {/* Name and Basic Info */}
                    <div className="flex-1 space-y-1 sm:space-y-2 mt-3 sm:mt-4 lg:mt-0 sm:mb-2">
                      <div className="flex items-center gap-2">
                        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold truncate">
                          {profileUser?.full_name || "User"}
                        </h1>
                        {profileUser?.is_verified && (
                          <Verified className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 fill-current flex-shrink-0" />
                        )}
                        {/* Premium Status Indicator */}
                        <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500 fill-current flex-shrink-0" />
                        {/* KYC Status Indicator */}
                        <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 fill-current flex-shrink-0" />
                      </div>

                      {/* Status Badges */}
                      <div className="flex flex-wrap gap-1 mb-1">
                        <Badge
                          variant="secondary"
                          className="text-xs bg-purple-100 text-purple-700 border-purple-200"
                        >
                          <Crown className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="text-xs bg-green-100 text-green-700 border-green-200"
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          KYC Verified
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="text-xs bg-blue-100 text-blue-700 border-blue-200"
                        >
                          <Star className="h-3 w-3 mr-1" />
                          Creator Level 8
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="text-xs bg-emerald-100 text-emerald-700 border-emerald-200"
                        >
                          <Store className="h-3 w-3 mr-1" />
                          Pro Seller
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="text-xs bg-indigo-100 text-indigo-700 border-indigo-200"
                        >
                          <Code className="h-3 w-3 mr-1" />
                          Top Freelancer
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="text-xs bg-orange-100 text-orange-700 border-orange-200"
                        >
                          <Coins className="h-3 w-3 mr-1" />
                          Crypto Trader
                        </Badge>
                      </div>

                      <p className="text-sm sm:text-base text-muted-foreground">
                        @{profileUser?.username || "user"}
                      </p>
                      <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                        {profileUser?.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="truncate">
                              {profileUser.location}
                            </span>
                          </div>
                        )}
                        {profileUser?.created_at && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="whitespace-nowrap">
                              Joined {new Date(profileUser.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="whitespace-nowrap">
                            {(profileUser?.profile_views || 0).toLocaleString()} views
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 sm:gap-2 mt-3 sm:mt-4 lg:mt-0">
                    {isOwnProfile ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowEditModal(true)}
                          className="text-xs sm:text-sm"
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Edit Profile</span>
                          <span className="sm:hidden">Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-2 sm:px-3"
                        >
                          <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          onClick={handleFollow}
                          size="sm"
                          className="px-3 sm:px-6 text-xs sm:text-sm"
                        >
                          {isFollowing ? (
                            <>
                              <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                              <span className="hidden sm:inline">
                                Following
                              </span>
                              <span className="sm:hidden">✓</span>
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                              Follow
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs sm:text-sm"
                          onClick={() => navigate(`/app/chat?user=${targetUsername}`)}
                        >
                          <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Message</span>
                          <span className="sm:hidden">Chat</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs sm:text-sm"
                          onClick={() => navigate(`/app/wallet?action=send&recipient=${targetUsername}`)}
                        >
                          <Send className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Send Money</span>
                          <span className="sm:hidden">Pay</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-2 sm:px-3"
                        >
                          <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <div className="mt-4 sm:mt-6">
                  <p className="text-xs sm:text-sm whitespace-pre-line leading-relaxed">
                    {profileUser?.bio || ""}
                  </p>
                  {profileUser?.website && (
                    <a
                      href={profileUser.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:underline mt-2 text-xs sm:text-sm"
                    >
                      <Globe className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="truncate">
                        {profileUser.website.replace("https://", "")}
                      </span>
                    </a>
                  )}
                </div>

                {/* Profile Stats - Horizontal Scrollable Cards */}
                <div className="mt-6">
                  <div className="relative">
                    {/* Gradient fade effects */}
                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

                    {/* Scrollable stats container */}
                    <div className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide py-4 px-1">
                      {/* Posts */}
                      <div
                        className="flex-shrink-0 text-center cursor-pointer group"
                        onClick={() => {
                          setActiveTab("posts");
                          // Scroll to tabs section smoothly
                          setTimeout(() => {
                            const tabsElement = document.querySelector('[role="tablist"]');
                            if (tabsElement) {
                              tabsElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                          }, 100);
                        }}
                      >
                        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 rounded-3xl bg-gradient-to-br from-blue-100 to-blue-200 border-0 flex items-center justify-center group hover:shadow-xl hover:scale-105 transition-all duration-300">
                          <div className="text-center">
                            <div className="text-xl sm:text-2xl font-bold text-blue-600">
                              {(posts || []).length}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                          Posts
                        </div>
                      </div>

                      {/* Followers */}
                      <div
                        className="flex-shrink-0 text-center cursor-pointer group"
                        onClick={() => navigate(`/app/profile/${pageUsername}/followers`)}
                      >
                        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 rounded-3xl bg-gradient-to-br from-purple-100 to-purple-200 border-0 flex items-center justify-center hover:shadow-xl hover:scale-105 transition-all duration-300">
                          <div className="text-center">
                            <div className="text-xl sm:text-2xl font-bold text-purple-600">
                              {followerCount > 999 ? `${(followerCount/1000).toFixed(1)}k` : followerCount}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-700 group-hover:text-purple-600 transition-colors">
                          Followers
                        </div>
                      </div>

                      {/* Following */}
                      <div
                        className="flex-shrink-0 text-center cursor-pointer group"
                        onClick={() => navigate(`/app/profile/${pageUsername}/following`)}
                      >
                        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 rounded-3xl bg-gradient-to-br from-indigo-100 to-indigo-200 border-0 flex items-center justify-center hover:shadow-xl hover:scale-105 transition-all duration-300">
                          <div className="text-center">
                            <div className="text-xl sm:text-2xl font-bold text-indigo-600">
                              {followingCount > 999 ? `${(followingCount/1000).toFixed(1)}k` : followingCount}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">
                          Following
                        </div>
                      </div>

                      {/* Profile Views */}
                      <div
                        className="flex-shrink-0 text-center cursor-pointer group"
                        onClick={() => navigate(`/app/profile/${pageUsername}/views`)}
                      >
                        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 rounded-3xl bg-gradient-to-br from-pink-100 to-pink-200 border-0 flex items-center justify-center hover:shadow-xl hover:scale-105 transition-all duration-300">
                          <div className="text-center">
                            <Eye className="h-5 w-5 text-pink-600 mx-auto mb-1" />
                            <div className="text-lg sm:text-xl font-bold text-pink-600">
                              {profileViewers > 999 ? `${(profileViewers/1000).toFixed(1)}k` : profileViewers}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-700 group-hover:text-pink-600 transition-colors">
                          Views
                        </div>
                      </div>

                      {/* Wallet Balance (Own Profile Only) */}
                      {isOwnProfile && (
                        <div
                          className="flex-shrink-0 text-center cursor-pointer group"
                          onClick={() => navigate("/app/wallet")}
                        >
                          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 rounded-3xl bg-gradient-to-br from-green-100 to-green-200 border-0 flex items-center justify-center hover:shadow-xl hover:scale-105 transition-all duration-300">
                            <div className="text-center">
                              <Wallet className="h-5 w-5 text-green-600 mx-auto mb-1" />
                              <div className="text-lg sm:text-xl font-bold text-green-600">
                                $2.5k
                              </div>
                            </div>
                          </div>
                          <div className="text-sm font-medium text-gray-700 group-hover:text-green-600 transition-colors">
                            Balance
                          </div>
                        </div>
                      )}

                      {/* Trust Level */}
                      <div
                        className="flex-shrink-0 text-center cursor-pointer group"
                        onClick={() => navigate(`/app/profile/${pageUsername}/trust`)}
                      >
                        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 rounded-3xl bg-gradient-to-br from-amber-100 to-amber-200 border-0 flex items-center justify-center hover:shadow-xl hover:scale-105 transition-all duration-300">
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <Shield className="h-3 w-3 text-amber-600" />
                              <Trophy className="h-3 w-3 text-amber-600" />
                            </div>
                            <div className="text-lg sm:text-xl font-bold text-amber-600">
                              L8·9.2
                            </div>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-700 group-hover:text-amber-600 transition-colors">
                          Trust Level
                        </div>
                      </div>

                      {/* Marketplace Sales */}
                      <div
                        className="flex-shrink-0 text-center cursor-pointer group"
                        onClick={() => navigate(`/app/profile/${pageUsername}/store`)}
                      >
                        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 rounded-3xl bg-gradient-to-br from-orange-100 to-orange-200 border-0 flex items-center justify-center hover:shadow-xl hover:scale-105 transition-all duration-300">
                          <div className="text-center">
                            <Store className="h-5 w-5 text-orange-600 mx-auto mb-1" />
                            <div className="text-lg sm:text-xl font-bold text-orange-600">
                              156
                            </div>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-700 group-hover:text-orange-600 transition-colors">
                          Sales
                        </div>
                      </div>

                      {/* Freelance Projects */}
                      <div
                        className="flex-shrink-0 text-center cursor-pointer group"
                        onClick={() => navigate(`/app/profile/${pageUsername}/projects`)}
                      >
                        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 rounded-3xl bg-gradient-to-br from-cyan-100 to-cyan-200 border-0 flex items-center justify-center hover:shadow-xl hover:scale-105 transition-all duration-300">
                          <div className="text-center">
                            <Code className="h-5 w-5 text-cyan-600 mx-auto mb-1" />
                            <div className="text-lg sm:text-xl font-bold text-cyan-600">
                              23
                            </div>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-700 group-hover:text-cyan-600 transition-colors">
                          Projects
                        </div>
                      </div>

                      {/* Crypto Trades */}
                      <div
                        className="flex-shrink-0 text-center cursor-pointer group"
                        onClick={() => navigate(`/app/profile/${pageUsername}/trades`)}
                      >
                        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 rounded-3xl bg-gradient-to-br from-yellow-100 to-yellow-200 border-0 flex items-center justify-center hover:shadow-xl hover:scale-105 transition-all duration-300">
                          <div className="text-center">
                            <Coins className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
                            <div className="text-lg sm:text-xl font-bold text-yellow-600">
                              89
                            </div>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-700 group-hover:text-yellow-600 transition-colors">
                          Trades
                        </div>
                      </div>

                      {/* Delivery Rating - Only for approved delivery providers */}
                      {isDeliveryProvider && (
                        <div
                          className="flex-shrink-0 text-center cursor-pointer group"
                          onClick={() => navigate("/app/delivery")}
                        >
                          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 rounded-3xl bg-gradient-to-br from-violet-100 to-violet-200 border-0 flex items-center justify-center hover:shadow-xl hover:scale-105 transition-all duration-300">
                            <div className="text-center">
                              <Truck className="h-5 w-5 text-violet-600 mx-auto mb-1" />
                              <div className="text-lg sm:text-xl font-bold text-violet-600">
                                4.8
                              </div>
                            </div>
                          </div>
                          <div className="text-sm font-medium text-gray-700 group-hover:text-violet-600 transition-colors">
                            Delivery
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Scroll indicator dots */}
                    <div className="flex justify-center mt-2 gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>

          {/* Modern Beautiful Button Tabs */}
          <Card className="backdrop-blur-sm bg-white/95 border border-gray-100/50 shadow-xl">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              {/* Beautiful tab header with gradient background */}
              <div className="relative overflow-hidden bg-gradient-to-r from-slate-50/80 via-white to-slate-50/80 p-2 sm:p-3">
                {/* Animated background decoration */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-purple-50/20 to-pink-50/30 opacity-50"></div>
                <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-radial from-blue-100/40 to-transparent rounded-full blur-2xl transform -translate-x-16 -translate-y-16"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-radial from-purple-100/40 to-transparent rounded-full blur-2xl transform translate-x-16 translate-y-16"></div>

                <TabsList className="relative flex w-full overflow-x-auto gap-1 sm:gap-2 p-1 sm:p-2 h-auto bg-white/60 backdrop-blur-md rounded-xl border border-white/20 shadow-lg">
                  {/* Posts Tab */}
                  <TabsTrigger
                    value="posts"
                    className="group relative flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold whitespace-nowrap rounded-lg border-0 bg-transparent transition-all duration-300 ease-out data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/25 hover:bg-gray-50/80 min-w-fit flex-shrink-0"
                  >
                    <div className="relative">
                      <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 transition-transform duration-300 group-data-[state=active]:scale-110" />
                      {activeTab === "posts" && (
                        <div className="absolute inset-0 bg-white/30 rounded-full animate-ping"></div>
                      )}
                    </div>
                    <span className="font-medium">Posts</span>
                    <Badge
                      variant="secondary"
                      className="ml-1 sm:ml-2 text-xs h-5 px-2 bg-white/20 border-white/30 text-current backdrop-blur-sm group-data-[state=active]:bg-white/25 group-data-[state=active]:text-white transition-all duration-300"
                    >
                      {(posts || []).length}
                    </Badge>
                    {activeTab === "posts" && (
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400/20 to-blue-600/20 animate-pulse"></div>
                    )}
                  </TabsTrigger>

                  {/* Media Tab */}
                  <TabsTrigger
                    value="media"
                    className="group relative flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold whitespace-nowrap rounded-lg border-0 bg-transparent transition-all duration-300 ease-out data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/25 hover:bg-gray-50/80 min-w-fit flex-shrink-0"
                  >
                    <div className="relative">
                      <Camera className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 transition-transform duration-300 group-data-[state=active]:scale-110" />
                      {activeTab === "media" && (
                        <div className="absolute inset-0 bg-white/30 rounded-full animate-ping"></div>
                      )}
                    </div>
                    <span className="font-medium">Media</span>
                    <Badge
                      variant="secondary"
                      className="ml-1 sm:ml-2 text-xs h-5 px-2 bg-white/20 border-white/30 text-current backdrop-blur-sm group-data-[state=active]:bg-white/25 group-data-[state=active]:text-white transition-all duration-300"
                    >
                      {mediaSource.length}
                    </Badge>
                    {activeTab === "media" && (
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-400/20 to-purple-600/20 animate-pulse"></div>
                    )}
                  </TabsTrigger>

                  {/* Studio Tab */}
                  <TabsTrigger
                    value="studio"
                    className="group relative flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold whitespace-nowrap rounded-lg border-0 bg-transparent transition-all duration-300 ease-out data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/25 hover:bg-gray-50/80 min-w-fit flex-shrink-0"
                    onClick={() => navigate("/app/unified-creator-studio")}
                  >
                    <div className="relative">
                      <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 transition-transform duration-300 group-data-[state=active]:scale-110" />
                      {activeTab === "studio" && (
                        <div className="absolute inset-0 bg-white/30 rounded-full animate-ping"></div>
                      )}
                    </div>
                    <span className="font-medium hidden sm:inline">Creator Studio</span>
                    <span className="font-medium sm:hidden">Studio</span>
                    {activeTab === "studio" && (
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-400/20 to-indigo-600/20 animate-pulse"></div>
                    )}
                  </TabsTrigger>

                  {/* Activity Tab */}
                  <TabsTrigger
                    value="activity"
                    className="group relative flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold whitespace-nowrap rounded-lg border-0 bg-transparent transition-all duration-300 ease-out data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/25 hover:bg-gray-50/80 min-w-fit flex-shrink-0"
                  >
                    <div className="relative">
                      <Activity className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 transition-transform duration-300 group-data-[state=active]:scale-110" />
                      {activeTab === "activity" && (
                        <div className="absolute inset-0 bg-white/30 rounded-full animate-ping"></div>
                      )}
                    </div>
                    <span className="font-medium">Activity</span>
                    <Badge
                      variant="secondary"
                      className="ml-1 sm:ml-2 text-xs h-5 px-2 bg-white/20 border-white/30 text-current backdrop-blur-sm group-data-[state=active]:bg-white/25 group-data-[state=active]:text-white transition-all duration-300"
                    >
                      {mockActivity.length}
                    </Badge>
                    {activeTab === "activity" && (
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-emerald-400/20 to-emerald-600/20 animate-pulse"></div>
                    )}
                  </TabsTrigger>

                  {/* About Tab */}
                  <TabsTrigger
                    value="about"
                    className="group relative flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold whitespace-nowrap rounded-lg border-0 bg-transparent transition-all duration-300 ease-out data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-orange-500/25 hover:bg-gray-50/80 min-w-fit flex-shrink-0"
                  >
                    <div className="relative">
                      <Users className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 transition-transform duration-300 group-data-[state=active]:scale-110" />
                      {activeTab === "about" && (
                        <div className="absolute inset-0 bg-white/30 rounded-full animate-ping"></div>
                      )}
                    </div>
                    <span className="font-medium">About</span>
                    {activeTab === "about" && (
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-orange-400/20 to-orange-600/20 animate-pulse"></div>
                    )}
                  </TabsTrigger>
                </TabsList>

                {/* Scroll indicator dots */}
                <div className="flex justify-center mt-3 gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-60"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-40"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-pink-400 to-orange-400 opacity-60"></div>
                </div>
              </div>

              {/* Enhanced Tab Contents */}
              <div className="relative p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-white via-gray-50/30 to-white">
                {/* Subtle background pattern */}
                <div className="absolute inset-0 opacity-[0.02]">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  }}></div>
                </div>
                {/* Posts Tab */}
                <TabsContent value="posts" className="space-y-6 mt-0 tab-content-animate">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Posts</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{(posts || []).length} posts</span>
                      <span>•</span>
                      <span>
                        {((posts || []) as any[]).reduce((sum, p: any) => sum + (p.likes || p.interactions?.likes || 0), 0)} total likes
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {(() => {
                      const privacyAllowed = (privacy?: string) => {
                        const v = (privacy || "public").toLowerCase();
                        if (v === "public") return true;
                        if (isOwnProfile) return true;
                        if (v === "private") return false;
                        if (v === "friends") return viewerFollowsOwner && ownerFollowsViewer;
                        return true;
                      };
                      const normalized = (posts || []).map((p: any) => {
                        const authorProfile = p.profiles || {};
                        return {
                          id: String(p.id ?? p.post_id ?? p.uuid ?? p.id),
                          content: p.content || p.text || p.content?.text || "",
                          image: p.image_url || p.image || (p.content?.media?.[0]?.url ?? undefined),
                          createdAt: p.created_at || p.timestamp || new Date().toISOString(),
                          likes: p.likes || p.interactions?.likes || 0,
                          comments: p.comments || p.interactions?.comments || 0,
                          shares: p.shares || p.interactions?.shares || 0,
                          privacy: (p.privacy || p.audience || p.content?.audience || "public") as string,
                          author: {
                            id: authorProfile.user_id || profileUser?.id || "",
                            name: authorProfile.full_name || profileUser?.full_name || "User",
                            username: authorProfile.username || profileUser?.username || "user",
                            avatar: authorProfile.avatar_url || profileUser?.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
                            verified: !!authorProfile.is_verified || !!profileUser?.is_verified,
                          },
                          _liked: !!p._liked,
                          _saved: !!p._saved,
                        };
                      }).filter((p) => privacyAllowed(p.privacy));

                      const handlePostDelete = (postId: string) => {
                        setPosts((prev) => prev.filter((p: any) => String(p.id ?? p.post_id ?? p.uuid ?? p.id) !== postId));
                        toast({
                          title: "Post deleted",
                          description: "Your post has been removed from your profile.",
                        });
                      };

                      const handlePrivacyChange = (postId: string, privacy: string) => {
                        setPosts((prev) =>
                          prev.map((p: any) =>
                            String(p.id ?? p.post_id ?? p.uuid ?? p.id) === postId
                              ? { ...p, privacy }
                              : p
                          )
                        );
                      };

                      const handleLikeToggle = (postId: string, newCount: number, isLiked: boolean) => {
                        setPosts((prev) =>
                          prev.map((p: any) =>
                            String(p.id ?? p.post_id ?? p.uuid ?? p.id) === postId
                              ? { ...p, likes: newCount, _liked: isLiked }
                              : p
                          )
                        );
                      };

                      const handleSaveToggle = (postId: string, isSaved: boolean) => {
                        setPosts((prev) =>
                          prev.map((p: any) =>
                            String(p.id ?? p.post_id ?? p.uuid ?? p.id) === postId
                              ? { ...p, _saved: isSaved }
                              : p
                          )
                        );
                      };

                      return normalized.length > 0 ? (
                        normalized.map((post) => (
                          <ProfilePostCard
                            key={post.id}
                            post={post}
                            isOwnPost={isOwnProfile}
                            onDelete={handlePostDelete}
                            onPrivacyChange={handlePrivacyChange}
                            onLikeToggle={handleLikeToggle}
                            onSaveToggle={handleSaveToggle}
                          />
                        ))
                      ) : (
                        <Card className="p-8 text-center">
                          <p className="text-muted-foreground">No posts yet</p>
                        </Card>
                      );
                    })()}
                  </div>
                </TabsContent>

                {/* Enhanced Media Tab */}
                <TabsContent value="media" className="space-y-6 mt-0 tab-content-animate">
                  <div className="flex flex-col gap-3 sm:gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold">
                          Media
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Photos and videos
                        </p>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3">
                        {/* Filter Controls */}
                        <Select
                          value={mediaFilter}
                          onValueChange={setMediaFilter}
                        >
                          <SelectTrigger className="w-24 sm:w-32 h-8 sm:h-10 text-xs sm:text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="images">Images</SelectItem>
                            <SelectItem value="videos">Videos</SelectItem>
                          </SelectContent>
                        </Select>

                        {/* View Mode Toggle */}
                        <div className="flex border rounded-lg p-0.5 sm:p-1">
                          <Button
                            variant={
                              mediaViewMode === "grid" ? "default" : "ghost"
                            }
                            size="sm"
                            onClick={() => setMediaViewMode("grid")}
                            className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                          >
                            <Grid3X3 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            variant={
                              mediaViewMode === "list" ? "default" : "ghost"
                            }
                            size="sm"
                            onClick={() => setMediaViewMode("list")}
                            className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                          >
                            <List className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {filteredMedia.length > 0 ? (
                    mediaViewMode === "grid" ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                        {filteredMedia.map((item) => (
                          <div
                            key={item.id}
                            className="relative aspect-square rounded-md sm:rounded-lg overflow-hidden group cursor-pointer"
                          >
                            <img
                              src={item.url}
                              alt={item.title}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="text-white text-center px-2">
                                <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1">
                                  {item.type === "video" ? (
                                    <>
                                      <Play className="h-3 w-3 sm:h-4 sm:w-4" />
                                      <span className="text-xs sm:text-sm">
                                        {item.duration}
                                      </span>
                                    </>
                                  ) : (
                                    <ImageIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                                  )}
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3 text-xs">
                                  <span className="flex items-center gap-0.5 sm:gap-1">
                                    <Heart className="h-2 w-2 sm:h-3 sm:w-3" />
                                    {item.likes}
                                  </span>
                                  <span className="flex items-center gap-0.5 sm:gap-1">
                                    <Eye className="h-2 w-2 sm:h-3 sm:w-3" />
                                    {item.views}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Badge
                              variant={
                                item.type === "video" ? "default" : "secondary"
                              }
                              className="absolute top-1 left-1 sm:top-2 sm:left-2 text-xs h-5 px-1.5"
                            >
                              {item.type === "video" ? "Video" : "Image"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredMedia.map((item) => (
                          <Card
                            key={item.id}
                            className="hover:shadow-md transition-shadow"
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-4">
                                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                  <img
                                    src={item.url}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-medium truncate">
                                        {item.title}
                                      </h4>
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {item.description}
                                      </p>
                                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                        <span>{item.date}</span>
                                        <span className="flex items-center gap-1">
                                          <Heart className="h-3 w-3" />
                                          {item.likes}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <Eye className="h-3 w-3" />
                                          {item.views}
                                        </span>
                                        {item.type === "video" && (
                                          <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {item.duration}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <Badge
                                      variant={
                                        item.type === "video"
                                          ? "default"
                                          : "secondary"
                                      }
                                    >
                                      {item.type === "video"
                                        ? "Video"
                                        : "Image"}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )
                  ) : (
                    <div className="text-center py-12">
                      <Camera className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h4 className="text-lg font-medium mb-2">
                        No media found
                      </h4>
                      <p className="text-muted-foreground">
                        {mediaFilter === "all"
                          ? "No photos or videos have been shared yet"
                          : `No ${mediaFilter} found`}
                      </p>
                    </div>
                  )}
                </TabsContent>

                {/* Enhanced Activity Tab */}
                <TabsContent value="activity" className="space-y-6 mt-0 tab-content-animate">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">
                        Activity Overview
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Recent activity and performance insights
                      </p>
                    </div>
                  </div>

                  {/* Activity Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {mockPosts.length}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Posts This Month
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {mockPosts.reduce((sum, post) => sum + post.likes, 0)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Total Likes
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {mockProfile.profileViews.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Profile Views
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Timeline */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {mockActivity.map((activity, index) => (
                          <div
                            key={activity.id}
                            className="flex items-start gap-4"
                          >
                            <div className="relative">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                {activity.type === "post" && (
                                  <MessageSquare className="h-4 w-4 text-white" />
                                )}
                                {activity.type === "video" && (
                                  <Video className="h-4 w-4 text-white" />
                                )}
                                {activity.type === "achievement" && (
                                  <Trophy className="h-4 w-4 text-white" />
                                )}
                                {activity.type === "follow" && (
                                  <Users className="h-4 w-4 text-white" />
                                )}
                              </div>
                              {index < mockActivity.length - 1 && (
                                <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-0.5 h-6 bg-gray-200"></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium">
                                    {activity.action}
                                  </p>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {activity.content}
                                  </p>
                                  {activity.engagement && (
                                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                      {activity.engagement.likes && (
                                        <span>
                                          {activity.engagement.likes} likes
                                        </span>
                                      )}
                                      {activity.engagement.views && (
                                        <span>
                                          {activity.engagement.views} views
                                        </span>
                                      )}
                                      {activity.engagement.followers && (
                                        <span>
                                          +{activity.engagement.followers}{" "}
                                          followers
                                        </span>
                                      )}
                                      {activity.engagement.duration && (
                                        <span>
                                          {activity.engagement.duration}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                                  {activity.timestamp}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Enhanced About Tab */}
                <TabsContent value="about" className="space-y-6 mt-0 tab-content-animate">
                  <div>
                    <h3 className="text-lg font-semibold">
                      About {profileUser?.full_name || "User"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Personal and professional information
                    </p>
                  </div>

                  {/* Personal Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {profileUser?.location && (
                          <div className="flex items-center gap-3">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="text-sm font-medium">Location</div>
                              <div className="text-sm text-muted-foreground">
                                {profileUser.location}
                              </div>
                            </div>
                          </div>
                        )}

                        {profileUser?.website && (
                          <div className="flex items-center gap-3">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="text-sm font-medium">Website</div>
                              <a
                                href={profileUser.website}
                                className="text-sm text-blue-600 hover:underline"
                              >
                                {profileUser.website?.replace("https://", "")}
                              </a>
                            </div>
                          </div>
                        )}

                        {profileUser?.created_at && (
                          <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="text-sm font-medium">Joined</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(profileUser.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-3">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm font-medium">
                              Profile Views
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {(profileUser?.profile_views || 0).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Skills & Expertise */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Skills & Expertise</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-3">
                          Technical Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {mockProfile.skills.map((skill) => (
                            <Badge key={skill} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="text-sm font-medium mb-3">Interests</h4>
                        <div className="flex flex-wrap gap-2">
                          {mockProfile.interests.map((interest) => (
                            <Badge key={interest} variant="outline">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="text-sm font-medium mb-3">Languages</h4>
                        <div className="flex flex-wrap gap-2">
                          {mockProfile.languages.map((language) => (
                            <Badge key={language} variant="outline">
                              {language}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Professional Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Professional</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Briefcase className="h-4 w-4 flex-shrink-0 mt-0.5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {mockProfile.jobTitle}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {mockProfile.company}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <GraduationCap className="h-4 w-4 flex-shrink-0 mt-0.5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Education</div>
                          <div className="text-sm text-muted-foreground">
                            Computer Science, {mockProfile.education}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Achievements & Badges */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Achievements & Badges</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {mockProfile.achievements.map((achievement) => (
                          <div
                            key={achievement.title}
                            className="flex items-center gap-3 p-4 rounded-lg border bg-gradient-to-r from-blue-50 to-purple-50"
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                              <achievement.icon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <div className="font-medium">
                                {achievement.title}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {achievement.date}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Studio Tab - Redirects to Creator Studio */}
                <TabsContent value="studio" className="space-y-6 mt-0 tab-content-animate">
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      Creator Studio
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Manage your content, analytics, and creator tools in one
                      place
                    </p>
                    <Button
                      onClick={() => navigate("/app/unified-creator-studio")}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Open Creator Studio
                    </Button>
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

      {/* Followers Modal */}
      <UserListModal
        isOpen={showFollowersModal}
        onClose={() => setShowFollowersModal(false)}
        title="Followers"
        type="followers"
        users={mockFollowers}
        currentUser={user?.profile?.username}
      />

      {/* Following Modal */}
      <UserListModal
        isOpen={showFollowingModal}
        onClose={() => setShowFollowingModal(false)}
        title="Following"
        type="following"
        users={mockFollowing}
        currentUser={user?.profile?.username}
      />

      {/* Profile Viewers Modal */}
      <UserListModal
        isOpen={showViewersModal}
        onClose={() => setShowViewersModal(false)}
        title="Profile Views"
        type="viewers"
        users={mockViewers}
        currentUser={user?.profile?.username}
      />
    </div>
  );
};

export default EnhancedProfile;
