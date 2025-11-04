import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PageLoading } from "@/components/ui/loading-states";
import {
  ArrowLeft,
  Users,
  MessageSquare,
  Eye,
  DollarSign,
  Star,
  ShoppingBag,
  Briefcase,
  TrendingUp,
  Truck,
  Heart,
  Share,
} from "lucide-react";
import { profileService } from "@/services/profileService";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  gradient: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  gradient,
  onClick,
}) => (
  <Card 
    className={`cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 ${gradient} border-0 text-white`}
    onClick={onClick}
  >
    <CardContent className="p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {icon}
            <h3 className="font-semibold text-sm sm:text-base">{title}</h3>
          </div>
          <div className="text-2xl sm:text-3xl font-bold mb-1">{value}</div>
          {description && (
            <p className="text-xs sm:text-sm opacity-90">{description}</p>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

const ProfileStats: React.FC = () => {
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();

  const [profile, setProfile] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchProfile = async () => {
      if (!username) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const userProfile = await profileService.getUserByUsername(username);
        setProfile(userProfile);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  // Show loading state while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageLoading message="Loading profile statistics..." />
      </div>
    );
  }

  // Show error if loading failed
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = [
    {
      title: "Posts",
      value: profile?.posts_count || 0,
      description: "Content shared",
      icon: <MessageSquare className="h-5 w-5" />,
      gradient: "bg-gradient-to-br from-blue-500 to-blue-600",
      onClick: () => navigate(`/app/profile/${username}/posts`),
    },
    {
      title: "Followers",
      value: profile?.followers_count?.toLocaleString() || 0,
      description: "People following you",
      icon: <Users className="h-5 w-5" />,
      gradient: "bg-gradient-to-br from-purple-500 to-purple-600",
      onClick: () => navigate(`/app/profile/${username}/followers`),
    },
    {
      title: "Following",
      value: profile?.following_count?.toLocaleString() || 0,
      description: "People you follow",
      icon: <Users className="h-5 w-5" />,
      gradient: "bg-gradient-to-br from-indigo-500 to-indigo-600",
      onClick: () => navigate(`/app/profile/${username}/following`),
    },
    {
      title: "Profile Views",
      value: profile?.profile_views?.toLocaleString() || 0,
      description: "Times viewed",
      icon: <Eye className="h-5 w-5" />,
      gradient: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      onClick: () => navigate(`/app/profile/${username}/views`),
    },
    {
      title: "Wallet Balance",
      value: `$${profile?.wallet_balance || 0}`,
      description: "Available funds",
      icon: <DollarSign className="h-5 w-5" />,
      gradient: "bg-gradient-to-br from-amber-500 to-amber-600",
      onClick: () => navigate(`/app/wallet`),
    },
    {
      title: "Trust Level",
      value: `${profile?.trust_level || 0}/5`,
      description: "Community rating",
      icon: <Star className="h-5 w-5" />,
      gradient: "bg-gradient-to-br from-orange-500 to-orange-600",
      onClick: () => navigate(`/app/profile/${username}/trust`),
    },
    {
      title: "Marketplace Sales",
      value: profile?.marketplace_sales || 0,
      description: "Items sold",
      icon: <ShoppingBag className="h-5 w-5" />,
      gradient: "bg-gradient-to-br from-pink-500 to-pink-600",
      onClick: () => navigate(`/app/marketplace/seller/${username}`),
    },
    {
      title: "Freelance Projects",
      value: profile?.freelance_projects || 0,
      description: "Completed projects",
      icon: <Briefcase className="h-5 w-5" />,
      gradient: "bg-gradient-to-br from-violet-500 to-violet-600",
      onClick: () => navigate(`/app/freelance/profile/${username}`),
    },
    {
      title: "Crypto Trades",
      value: profile?.crypto_trades || 0,
      description: "Successful trades",
      icon: <TrendingUp className="h-5 w-5" />,
      gradient: "bg-gradient-to-br from-cyan-500 to-cyan-600",
      onClick: () => navigate(`/app/crypto/profile/${username}`),
    },
    {
      title: "Delivery Rating",
      value: `${profile?.delivery_rating || 0}/5`,
      description: "Service quality",
      icon: <Truck className="h-5 w-5" />,
      gradient: "bg-gradient-to-br from-teal-500 to-teal-600",
      onClick: () => navigate(`/app/delivery/profile/${username}`),
    },
    {
      title: "Total Likes",
      value: profile?.likes_count?.toLocaleString() || 0,
      description: "Across all content",
      icon: <Heart className="h-5 w-5" />,
      gradient: "bg-gradient-to-br from-rose-500 to-rose-600",
      onClick: () => navigate(`/app/profile/${username}/likes`),
    },
    {
      title: "Shares",
      value: profile?.shares_count?.toLocaleString() || 0,
      description: "Content shared by others",
      icon: <Share className="h-5 w-5" />,
      gradient: "bg-gradient-to-br from-slate-500 to-slate-600",
      onClick: () => navigate(`/app/profile/${username}/shares`),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/app/profile/${username}`)}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-3 flex-1">
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} alt={profile?.full_name || profile?.username || "User"} />
                <AvatarFallback>
                  {profile?.full_name ? profile.full_name.split(" ").map((n: string) => n[0]).join("") : (profile?.username ? profile.username.substring(0, 2).toUpperCase() : "U")}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold">{profile?.full_name || profile?.username || "User"}</h1>
                  {profile?.is_verified && (
                    <Badge variant="secondary" className="text-xs">
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">@{profile?.username || "unknown"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Statistics</h2>
          <p className="text-gray-600">Comprehensive overview of your platform activity</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Summary Section */}
        <Card className="mt-8 border-0 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Activity Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{(profile?.posts_count || 0) + (profile?.marketplace_sales || 0)}</div>
                <div className="text-sm text-gray-600">Total Content</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{((profile?.followers_count || 0) + (profile?.following_count || 0)).toLocaleString()}</div>
                <div className="text-sm text-gray-600">Network Size</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-600">{((profile?.likes_count || 0) + (profile?.shares_count || 0)).toLocaleString()}</div>
                <div className="text-sm text-gray-600">Engagement</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-600">{(profile?.freelance_projects || 0) + (profile?.crypto_trades || 0)}</div>
                <div className="text-sm text-gray-600">Transactions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileStats;
