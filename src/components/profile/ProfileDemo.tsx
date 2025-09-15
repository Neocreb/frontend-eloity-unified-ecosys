import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import { mockUsers } from "@/data/mockUsers";

export const ProfileDemo: React.FC = () => {
  const navigate = useNavigate();

  const demoUsers = [
    {
      key: "sarah_tech",
      user: mockUsers.sarah_tech,
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
      key: "alex_dev",
      user: mockUsers.alex_dev,
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
      key: "mike_crypto",
      user: mockUsers.mike_crypto,
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
      key: "emma_creates",
      user: mockUsers.emma_creates,
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

  const handleViewProfile = (username: string) => {
    navigate(`/app/profile/${username}`);
  };

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
        {demoUsers.map((demo) => (
          <Card key={demo.key} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage
                    src={demo.user.profile?.avatar_url}
                    alt={demo.user.profile?.full_name}
                  />
                  <AvatarFallback className="text-lg">
                    {demo.user.profile?.full_name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("") || "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {demo.icon}
                    <CardTitle className="text-lg">{demo.title}</CardTitle>
                  </div>
                  <h3 className="font-semibold text-lg mb-1">
                    {demo.user.profile?.full_name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    @{demo.user.profile?.username}
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
                    {demo.user.profile?.followers_count || 0} followers
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{demo.user.profile?.reputation || 0} rating</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  <span>{demo.user.profile?.profile_views || 0} views</span>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Profile Features:</h4>
                <div className="grid grid-cols-2 gap-1">
                  {demo.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2">
                {demo.user.profile?.bio}
              </p>

              <Button
                className="w-full"
                onClick={() =>
                  handleViewProfile(demo.user.profile?.username || "")
                }
              >
                View Profile
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-muted/50 rounded-lg p-6 text-center">
        <h2 className="text-xl font-semibold mb-2">Try It Out!</h2>
        <p className="text-muted-foreground mb-4">
          Click on any profile above to see the comprehensive profile system in
          action. You can also try visiting /profile/any_username to see how
          mock users are generated.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigate("/app/profile/john_doe")}
          >
            Try: john_doe
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/app/profile/jane_smith")}
          >
            Try: jane_smith
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/app/profile/crypto_master")}
          >
            Try: crypto_master
          </Button>
          <Button variant="outline" onClick={() => navigate("/app/explore")}>
            Explore More Users
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileDemo;
