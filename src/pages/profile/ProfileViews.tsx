import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Search,
  Eye,
  Clock,
  Users,
  TrendingUp,
  MapPin,
  Smartphone,
  Monitor,
  Tablet,
} from "lucide-react";
import { profileService } from "@/services/profileService";

interface Viewer {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  verified: boolean;
  isOnline?: boolean;
  lastViewed?: string;
  viewCount?: number;
  location?: string;
  device?: string;
  referrer?: string;
  timeSpent?: string;
}

interface ViewStats {
  totalViews: number;
  uniqueViewers: number;
  avgViewTime: string;
  topLocation: string;
  peakHour: string;
  deviceBreakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
}

const ProfileViews: React.FC = () => {
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredViewers, setFilteredViewers] = useState<Viewer[]>([]);
  const [filter, setFilter] = useState<"all" | "verified" | "recent">("all");

  const [viewers, setViewers] = useState<Viewer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchViewers = async () => {
      if (!username) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Get user profile first
        const userProfile = await profileService.getUserByUsername(username);
        if (!userProfile) {
          setError("User not found");
          return;
        }
        
        // TODO: Fetch real viewer data from analytics service
        // For now, we'll set empty data since we don't have a real analytics service
        setViewers([]);
        
        // Set initial view stats
        setViewStats({
          totalViews: 0,
          uniqueViewers: 0,
          avgViewTime: "0m 0s",
          topLocation: "",
          peakHour: "",
          deviceBreakdown: {
            mobile: 0,
            desktop: 0,
            tablet: 0,
          },
        });
      } catch (err) {
        console.error("Error fetching viewers:", err);
        setError("Failed to load viewer data");
      } finally {
        setLoading(false);
      }
    };

    fetchViewers();
  }, [username]);

  const [viewStats, setViewStats] = useState<ViewStats>({
    totalViews: 0,
    uniqueViewers: 0,
    avgViewTime: "0m 0s",
    topLocation: "",
    peakHour: "",
    deviceBreakdown: {
      mobile: 0,
      desktop: 0,
      tablet: 0,
    },
  });

  // Show loading state while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile views...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Profile Views</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    let filtered = viewers.filter(
      (viewer: Viewer) =>
        viewer.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        viewer.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (viewer.location && viewer.location.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Apply filters
    if (filter === "verified") {
      filtered = filtered.filter((viewer: Viewer) => viewer.verified);
    } else if (filter === "recent") {
      filtered = filtered.filter((viewer: Viewer) => {
        const viewedTime = viewer.lastViewed || "";
        return viewedTime.includes("minute") || (viewedTime.includes("hour") && parseInt(viewedTime) <= 1);
      });
    }

    setFilteredViewers(filtered);
  }, [searchQuery, filter, viewers]);

  const handleUserClick = (userUsername: string) => {
    navigate(`/app/profile/${userUsername}`);
  };

  const getDeviceIcon = (device: string) => {
    switch (device?.toLowerCase()) {
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'desktop': return <Monitor className="h-4 w-4" />;
      case 'tablet': return <Tablet className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  const getReferrerColor = (referrer: string) => {
    switch (referrer?.toLowerCase()) {
      case 'direct': return 'bg-blue-100 text-blue-800';
      case 'search': return 'bg-green-100 text-green-800';
      case 'social media': return 'bg-purple-100 text-purple-800';
      case 'freelance platform': return 'bg-orange-100 text-orange-800';
      case 'marketplace': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/app/profile/${username}`)}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-2 flex-1">
              <Eye className="h-5 w-5 text-pink-600" />
              <h1 className="text-lg sm:text-xl font-bold">Profile Views Analytics</h1>
              <Badge variant="secondary" className="text-xs">
                {viewStats.totalViews} total views
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Analytics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full bg-pink-100">
                <Eye className="h-6 w-6 text-pink-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{viewStats.totalViews.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Views</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{viewStats.uniqueViewers}</div>
              <div className="text-sm text-gray-600">Unique Viewers</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full bg-green-100">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{viewStats.avgViewTime}</div>
              <div className="text-sm text-gray-600">Avg View Time</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{viewStats.peakHour}</div>
              <div className="text-sm text-gray-600">Peak Hour</div>
            </CardContent>
          </Card>
        </div>

        {/* Device Breakdown & Top Location */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Device Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Mobile</span>
                    </div>
                    <span className="text-sm text-gray-600">{viewStats.deviceBreakdown.mobile}%</span>
                  </div>
                  <Progress value={viewStats.deviceBreakdown.mobile} className="h-2" />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Desktop</span>
                    </div>
                    <span className="text-sm text-gray-600">{viewStats.deviceBreakdown.desktop}%</span>
                  </div>
                  <Progress value={viewStats.deviceBreakdown.desktop} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Tablet className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">Tablet</span>
                    </div>
                    <span className="text-sm text-gray-600">{viewStats.deviceBreakdown.tablet}%</span>
                  </div>
                  <Progress value={viewStats.deviceBreakdown.tablet} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Geographic Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Top Location</div>
                  <div className="text-lg font-semibold">{viewStats.topLocation}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Countries Reached</div>
                  <div className="text-lg font-semibold">12 Countries</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Cities</div>
                  <div className="text-lg font-semibold">45 Cities</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Viewers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Recent Viewers
              </div>
              <Badge variant="outline">{filteredViewers.length} viewers</Badge>
            </CardTitle>
            
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search viewers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("all")}
                  className="text-xs"
                >
                  All
                </Button>
                <Button
                  variant={filter === "recent" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("recent")}
                  className="text-xs"
                >
                  Recent
                </Button>
                <Button
                  variant={filter === "verified" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("verified")}
                  className="text-xs"
                >
                  Verified
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {filteredViewers.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">
                  {searchQuery ? "No viewers match your search" : "No viewers yet"}
                </h3>
                <p className="text-gray-600 text-sm">
                  {searchQuery ? "Try adjusting your search terms" : "Your profile views will appear here!"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredViewers.map((viewer) => (
                  <div
                    key={viewer.id}
                    className="flex items-center gap-3 p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    {/* Avatar with online status */}
                    <div className="relative flex-shrink-0">
                      <Avatar
                        className="h-12 w-12 cursor-pointer"
                        onClick={() => handleUserClick(viewer.username)}
                      >
                        <AvatarImage src={viewer.avatar} alt={viewer.displayName} />
                        <AvatarFallback className="text-sm">
                          {viewer.displayName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      {viewer.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                      )}
                    </div>

                    {/* Viewer Info */}
                    <div className="flex-1 min-w-0">
                      <div
                        className="cursor-pointer"
                        onClick={() => handleUserClick(viewer.username)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm truncate">
                            {viewer.displayName}
                          </span>
                          {viewer.verified && (
                            <Badge variant="secondary" className="text-xs px-2 py-0 h-5">
                              ✓
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mb-1">@{viewer.username}</div>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{viewer.lastViewed}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{viewer.location}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {getDeviceIcon(viewer.device || '')}
                            <span>{viewer.device}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            <span>{viewer.viewCount} views</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="flex flex-col gap-2 items-end text-xs">
                      <Badge className={`text-xs px-2 py-1 ${getReferrerColor(viewer.referrer || '')}`}>
                        {viewer.referrer}
                      </Badge>
                      <div className="text-gray-500">
                        {viewer.timeSpent} spent
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileViews;
