import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import { useUserPremiumStatus } from "@/hooks/useUserPremiumStatus";
import {
  Verified,
  MapPin,
  Globe,
  Calendar,
  Star,
  Users,
  MessageCircle,
  Share2,
  Edit,
  Camera,
  Shield,
  Award,
  Briefcase,
  GraduationCap,
  Coins,
  TrendingUp,
  Store,
  Code,
  DollarSign,
  Heart,
  UserPlus,
  MessageSquare,
  Eye,
  Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { UserProfile, Achievement, Badge as UserBadge } from "@/types/user";

interface EnhancedProfileHeaderProps {
  profile: UserProfile;
  isOwnProfile?: boolean;
  isFollowing?: boolean;
  followerCount?: number;
  followingCount?: number;
  onFollow?: () => void;
  onMessage?: () => void;
  onEdit?: () => void;
  onShare?: () => void;
}

export const EnhancedProfileHeader: React.FC<EnhancedProfileHeaderProps> = ({
  profile,
  isOwnProfile = false,
  isFollowing = false,
  followerCount = 0,
  followingCount = 0,
  onFollow,
  onMessage,
  onEdit,
  onShare,
}) => {
  const { isPremium, isVerified } = useUserPremiumStatus();
  const [activeTab, setActiveTab] = useState("overview");

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getLevelColor = (level: string) => {
    const colors = {
      bronze: "text-amber-600 border-amber-200 bg-amber-50",
      silver: "text-gray-600 border-gray-200 bg-gray-50",
      gold: "text-yellow-600 border-yellow-200 bg-yellow-50",
      platinum: "text-blue-600 border-blue-200 bg-blue-50",
      diamond: "text-purple-600 border-purple-200 bg-purple-50",
    };
    return colors[level as keyof typeof colors] || colors.bronze;
  };

  const getProfileCompletionPercentage = () => {
    const fields = [
      profile.bio,
      profile.location,
      profile.website,
      profile.skills?.length,
      profile.avatar_url,
      profile.banner_url,
    ];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  return (
    <div className="relative">
      {/* Banner Section */}
      <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 overflow-hidden rounded-b-lg">
        {profile.banner_url && (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${profile.banner_url})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

        {/* Online Status */}
        {profile.is_online && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-green-500/90 text-white px-3 py-1 rounded-full text-sm">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            Online
          </div>
        )}

        {/* Action Buttons - Top Right */}
        <div className="absolute top-4 right-4 flex gap-2">
          {isOwnProfile && (
            <Button size="sm" variant="secondary" onClick={onEdit}>
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          )}
          <Button size="sm" variant="secondary" onClick={onShare}>
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Profile Information Section */}
      <div className="px-4 md:px-6">
        <div className="relative -mt-12 sm:-mt-16 md:-mt-20">
          {/* Avatar */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6">
            <div className="relative">
              <Avatar className="w-24 h-24 sm:w-28 sm:w-28 md:w-32 md:h-32 lg:w-36 lg:h-36 border-4 border-white shadow-xl">
                <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                <AvatarFallback className="text-2xl font-bold">
                  {profile.full_name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || "U"}
                </AvatarFallback>
              </Avatar>
              {profile.is_online && (
                <div className="absolute bottom-2 right-2 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 border-2 border-white rounded-full" />
              )}
              {isOwnProfile && (
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-0 right-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full"
                >
                  <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                  {profile.full_name}
                </h1>
                <VerifiedBadge 
                  isVerified={profile.is_verified}
                  isPremium={isPremium}
                  size="md"
                />
              </div>

              <p className="text-muted-foreground mb-2">@{profile.username}</p>

              {/* Role-specific titles */}
              <div className="flex flex-wrap gap-2 mb-3">
                {profile.marketplace_profile && (
                  <Badge
                    variant="outline"
                    className="border-green-400 text-green-600"
                  >
                    <Store className="w-3 h-3 mr-1" />
                    Seller
                  </Badge>
                )}
                {profile.freelance_profile && (
                  <Badge
                    variant="outline"
                    className="border-blue-400 text-blue-600"
                  >
                    <Code className="w-3 h-3 mr-1" />
                    Freelancer
                  </Badge>
                )}
                {profile.crypto_profile && (
                  <Badge
                    variant="outline"
                    className="border-orange-400 text-orange-600"
                  >
                    <Coins className="w-3 h-3 mr-1" />
                    Trader
                  </Badge>
                )}
                {profile.business_profile && (
                  <Badge
                    variant="outline"
                    className="border-purple-400 text-purple-600"
                  >
                    <Briefcase className="w-3 h-3 mr-1" />
                    Business
                  </Badge>
                )}
              </div>

              {/* Stats Row */}
              <div className="flex flex-wrap gap-4 sm:gap-6 text-sm sm:text-base">
                <div className="text-center">
                  <div className="font-bold text-lg">
                    {profile.posts_count || 0}
                  </div>
                  <div className="text-muted-foreground text-xs sm:text-sm">
                    Posts
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">
                    {formatNumber(followerCount)}
                  </div>
                  <div className="text-muted-foreground text-xs sm:text-sm">
                    Followers
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">
                    {formatNumber(followingCount)}
                  </div>
                  <div className="text-muted-foreground text-xs sm:text-sm">
                    Following
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg flex items-center gap-1 justify-center">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    {profile.reputation || 0}
                  </div>
                  <div className="text-muted-foreground text-xs sm:text-sm">
                    Rating
                  </div>
                </div>
                {profile.profile_views && (
                  <div className="text-center">
                    <div className="font-bold text-lg">
                      {formatNumber(profile.profile_views)}
                    </div>
                    <div className="text-muted-foreground text-xs sm:text-sm">
                      Views
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {!isOwnProfile && (
              <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                <Button
                  onClick={onFollow}
                  className={cn(
                    "flex-1 sm:flex-none",
                    isFollowing &&
                      "bg-gray-200 text-gray-800 hover:bg-gray-300",
                  )}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {isFollowing ? "Following" : "Follow"}
                </Button>
                <Button
                  variant="outline"
                  onClick={onMessage}
                  className="flex-1 sm:flex-none"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Info Tabs */}
      <div className="px-4 md:px-6 mt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 sm:grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            {profile.marketplace_profile && (
              <TabsTrigger value="store">Store</TabsTrigger>
            )}
            {profile.freelance_profile && (
              <TabsTrigger value="freelance">Services</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Bio & Basic Info */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">About</h3>
                  {profile.bio ? (
                    <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed mb-4">
                      {profile.bio}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic mb-4">
                      No bio available
                    </p>
                  )}

                  <div className="space-y-2 text-sm">
                    {profile.location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    {profile.website && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Globe className="w-4 h-4" />
                        <a
                          href={profile.website}
                          className="text-blue-500 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {profile.website}
                        </a>
                      </div>
                    )}
                    {profile.join_date && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Joined{" "}
                          {formatDistanceToNow(new Date(profile.join_date))} ago
                        </span>
                      </div>
                    )}
                    {profile.last_active && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>
                          Last seen{" "}
                          {formatDistanceToNow(new Date(profile.last_active))}{" "}
                          ago
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Level & Progress */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Progress</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Level</span>
                        <Badge
                          className={cn(
                            "text-xs",
                            getLevelColor(profile.level || "bronze"),
                          )}
                        >
                          {profile.level?.toUpperCase() || "BRONZE"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium">
                          {profile.points || 0} points
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          Profile Completion
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {getProfileCompletionPercentage()}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${getProfileCompletionPercentage()}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="mt-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Eye className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold">
                    {formatNumber(profile.profile_views || 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Profile Views
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Heart className="w-6 h-6 mx-auto mb-2 text-red-500" />
                  <div className="text-2xl font-bold">
                    {formatNumber(followerCount)}
                  </div>
                  <div className="text-sm text-muted-foreground">Followers</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <MessageSquare className="w-6 h-6 mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold">
                    {profile.posts_count || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Posts</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Star className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                  <div className="text-2xl font-bold">
                    {profile.reputation || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Reputation
                  </div>
                </CardContent>
              </Card>

              {/* Role-specific stats */}
              {profile.marketplace_profile && (
                <>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <DollarSign className="w-6 h-6 mx-auto mb-2 text-green-600" />
                      <div className="text-2xl font-bold">
                        {formatNumber(
                          profile.marketplace_profile.total_sales || 0,
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Sales
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                      <div className="text-2xl font-bold">
                        {profile.marketplace_profile.response_rate || 0}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Response Rate
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {profile.freelance_profile && (
                <>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Award className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                      <div className="text-2xl font-bold">
                        {profile.freelance_profile.completed_projects || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Projects Completed
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <Users className="w-6 h-6 mx-auto mb-2 text-indigo-600" />
                      <div className="text-2xl font-bold">
                        {profile.freelance_profile.client_satisfaction || 0}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Client Satisfaction
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="badges" className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.achievements?.map((achievement: Achievement) => (
                <Card key={achievement.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-medium">{achievement.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {achievement.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(achievement.earned_at))}{" "}
                          ago
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {profile.badges?.map((badge: UserBadge) => (
                <Card key={badge.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{badge.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-medium">{badge.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {badge.description}
                        </p>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {badge.type}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {!profile.achievements?.length && !profile.badges?.length && (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  No badges earned yet
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="skills" className="mt-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Skills & Expertise</h3>
                {profile.skills?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No skills listed</p>
                )}

                {profile.interests?.length && (
                  <>
                    <h4 className="font-medium mt-6 mb-3">Interests</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map((interest, index) => (
                        <Badge key={index} variant="outline">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </>
                )}

                {profile.languages?.length && (
                  <>
                    <h4 className="font-medium mt-6 mb-3">Languages</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.languages.map((language, index) => (
                        <Badge key={index} variant="outline">
                          {language}
                        </Badge>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {profile.marketplace_profile && (
            <TabsContent value="store" className="mt-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Store className="w-6 h-6 text-green-600" />
                    <div>
                      <h3 className="font-semibold">
                        {profile.marketplace_profile.store_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {profile.marketplace_profile.business_type ===
                        "business"
                          ? "Business"
                          : "Individual"}{" "}
                        Seller
                      </p>
                    </div>
                  </div>

                  {profile.marketplace_profile.store_description && (
                    <p className="text-sm text-muted-foreground mb-4">
                      {profile.marketplace_profile.store_description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-xl font-bold">
                        {profile.marketplace_profile.total_sales || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Total Sales
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold">
                        {profile.marketplace_profile.total_orders || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Orders
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold flex items-center justify-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        {profile.marketplace_profile.store_rating || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Store Rating
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold">
                        {profile.marketplace_profile.response_rate || 0}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Response Rate
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {profile.freelance_profile && (
            <TabsContent value="freelance" className="mt-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Code className="w-6 h-6 text-blue-600" />
                    <div>
                      <h3 className="font-semibold">
                        {profile.freelance_profile.professional_title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {profile.freelance_profile.experience_level} •{" "}
                        {profile.freelance_profile.years_experience} years
                        experience
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-xl font-bold">
                        ${profile.freelance_profile.hourly_rate || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Hourly Rate
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold">
                        {profile.freelance_profile.completed_projects || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Projects
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold">
                        {profile.freelance_profile.client_satisfaction || 0}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Satisfaction
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold flex items-center justify-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        {profile.freelance_profile.freelance_rating || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Rating
                      </div>
                    </div>
                  </div>

                  {profile.freelance_profile.specializations?.length && (
                    <div>
                      <h4 className="font-medium mb-2">Specializations</h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.freelance_profile.specializations.map(
                          (spec, index) => (
                            <Badge key={index} variant="secondary">
                              {spec}
                            </Badge>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          profile.freelance_profile.availability === "available"
                            ? "bg-green-500"
                            : profile.freelance_profile.availability === "busy"
                              ? "bg-yellow-500"
                              : "bg-red-500",
                        )}
                      />
                      <span className="font-medium">
                        {profile.freelance_profile.availability === "available"
                          ? "Available for hire"
                          : profile.freelance_profile.availability === "busy"
                            ? "Busy"
                            : "Unavailable"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedProfileHeader;
