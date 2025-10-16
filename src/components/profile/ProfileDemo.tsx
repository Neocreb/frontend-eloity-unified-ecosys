// @ts-nocheck
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  Store,
  Code,
  TrendingUp,
  Camera,
  Briefcase,
  Star,
  ArrowRight,
  Eye,
  Loader2,
} from "lucide-react";
import { UserService, UserWithProfile } from "@/services/userService";

// Simple Badge component since import is failing
const SimpleBadge = ({ children, variant = "secondary", className = "" }: { 
  children: React.ReactNode; 
  variant?: string; 
  className?: string; 
}) => (
  <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors 
    ${variant === "secondary" ? "bg-secondary text-secondary-foreground hover:bg-secondary/80" : ""} 
    ${className}`}>
    {children}
  </div>
);

export const ProfileDemo: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch up to 4 users from the database
        const fetchedUsers = await UserService.searchUsers("", 4);
        
        if (fetchedUsers && fetchedUsers.length > 0) {
          setUsers(fetchedUsers);
        } else {
          setError("No users found in the database");
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Define demo categories based on user index or role
  const getDemoCategory = (index: number) => {
    const categories = [
      {
        title: "Tech Entrepreneur & Seller",
        description: "Marketplace seller with verified business account",
        features: [
          "Store Management",
          "Product Listings",
          "Customer Reviews",
          "Business Analytics",
        ],
        icon: <Store className="w-6 h-6 text-green-600" />,
      },
      {
        title: "Full Stack Developer",
        description: "Professional freelancer offering development services",
        features: [
          "Service Offerings",
          "Portfolio Showcase",
          "Client Reviews",
          "Project History",
        ],
        icon: <Code className="w-6 h-6 text-blue-600" />,
      },
      {
        title: "Crypto Trader",
        description: "Experienced trader with P2P marketplace access",
        features: [
          "Trading History",
          "P2P Rating",
          "Security Settings",
          "Portfolio Tracking",
        ],
        icon: <TrendingUp className="w-6 h-6 text-orange-600" />,
      },
      {
        title: "Content Creator",
        description: "Digital artist sharing creative content",
        features: [
          "Content Portfolio",
          "Social Stats",
          "Brand Partnerships",
          "Creator Tools",
        ],
        icon: <Camera className="w-6 h-6 text-purple-600" />,
      },
    ];
    
    return categories[index % categories.length];
  };

  const handleViewProfile = (username: string) => {
    navigate(`/app/profile/${username}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Comprehensive Profile System</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Explore our enhanced profile system that connects all platform
          features. Each user can have specialized profiles for marketplace
          selling, freelancing, crypto trading, and content creation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {users.map((user, index) => {
          const demo = getDemoCategory(index);
          return (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage
                    src={user.avatar_url || ""}
                    alt={user.full_name || "User"}
                  />
                  <AvatarFallback className="text-lg">
                    {user.full_name
                      ?.split(" ")
                      .map((n: string) => n[0])
                      .join("") || user.username?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {demo.icon}
                    <CardTitle className="text-lg">{demo.title}</CardTitle>
                  </div>
                  <h3 className="font-semibold text-lg mb-1">
                    {user.full_name || user.username}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    @{user.username}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {demo.description}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {user.profile?.followers_count || 0} followers
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{user.profile?.reputation || user.points || 0} rating</span>
                </div>
                {user.is_verified && (
                  <SimpleBadge variant="secondary" className="text-xs">
                    Verified
                  </SimpleBadge>
                )}
              </div>

              <div>
                <h4 className="font-medium mb-2">Profile Features:</h4>
                <div className="grid grid-cols-2 gap-1">
                  {demo.features.map((feature, index) => (
                    <SimpleBadge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </SimpleBadge>
                  ))}
                </div>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2">
                {user.bio || "No bio available"}
              </p>

              <Button
                className="w-full"
                onClick={() =>
                  handleViewProfile(user.username || "")
                }
              >
                View Profile
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )})}
      </div>

      {users.length > 0 && (
        <div className="bg-muted/50 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Try It Out!</h2>
          <p className="text-muted-foreground mb-4">
            Click on any profile above to see the comprehensive profile system in action.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {users.slice(0, 3).map((user) => (
              <Button
                key={user.id}
                variant="outline"
                onClick={() => navigate(`/app/profile/${user.username}`)}
              >
                Try: {user.username}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDemo;
