// @ts-nocheck
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Trophy,
  ArrowLeft,
  Target,
  Users,
  Award,
  Star,
  TrendingUp,
  Medal,
  Zap,
  Flame,
  Crown,
  Calendar,
  MapPin,
  Search,
  Filter,
  Play,
} from "lucide-react";
import { formatNumber } from "@/utils/formatters";

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  participants: number;
  prize: number;
  status: "active" | "upcoming" | "completed";
  startDate: string;
  endDate: string;
  category: string;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar: string;
  points: number;
  challenges: number;
  wins: number;
  trend: "up" | "down" | "stable";
}

const EventsRewards = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("challenges");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Mock challenges data
  const challenges: Challenge[] = [
    {
      id: "1",
      title: "#DanceChallenge",
      description: "Show your best dance moves",
      icon: "💃",
      participants: 1250,
      prize: 500,
      status: "active",
      startDate: "2024-01-15",
      endDate: "2024-01-31",
      category: "Entertainment",
    },
    {
      id: "2",
      title: "#CodingChallenge",
      description: "Build a feature in 48 hours",
      icon: "💻",
      participants: 856,
      prize: 1000,
      status: "active",
      startDate: "2024-01-20",
      endDate: "2024-02-10",
      category: "Technology",
    },
    {
      id: "3",
      title: "#PhotographyChallenge",
      description: "Capture the beauty of nature",
      icon: "📸",
      participants: 2100,
      prize: 750,
      status: "active",
      startDate: "2024-01-10",
      endDate: "2024-02-28",
      category: "Art",
    },
    {
      id: "4",
      title: "#FitnessChallenge",
      description: "Complete 30 days of workout",
      icon: "💪",
      participants: 3400,
      prize: 250,
      status: "upcoming",
      startDate: "2024-02-01",
      endDate: "2024-03-02",
      category: "Health",
    },
    {
      id: "5",
      title: "#RecipeChallenge",
      description: "Cook a dish with 5 ingredients",
      icon: "🍳",
      participants: 1875,
      prize: 300,
      status: "active",
      startDate: "2024-01-18",
      endDate: "2024-02-15",
      category: "Lifestyle",
    },
  ];

  // Mock leaderboard data
  const leaderboard: LeaderboardEntry[] = [
    {
      rank: 1,
      userId: "user1",
      username: "Alex Chen",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      points: 4850,
      challenges: 12,
      wins: 8,
      trend: "up",
    },
    {
      rank: 2,
      userId: "user2",
      username: "Sarah Johnson",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      points: 4320,
      challenges: 10,
      wins: 7,
      trend: "stable",
    },
    {
      rank: 3,
      userId: "user3",
      username: "Marcus Lee",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
      points: 4100,
      challenges: 11,
      wins: 6,
      trend: "down",
    },
    {
      rank: 4,
      userId: "user4",
      username: "Emma Davis",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      points: 3950,
      challenges: 9,
      wins: 5,
      trend: "up",
    },
    {
      rank: 5,
      userId: "user5",
      username: "David Wilson",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      points: 3800,
      challenges: 8,
      wins: 5,
      trend: "stable",
    },
    {
      rank: 6,
      userId: "user6",
      username: "Jessica Martinez",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69be5f?w=100&h=100&fit=crop",
      points: 3650,
      challenges: 7,
      wins: 4,
      trend: "up",
    },
    {
      rank: 7,
      userId: "user7",
      username: "Michael Brown",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
      points: 3520,
      challenges: 6,
      wins: 3,
      trend: "down",
    },
    {
      rank: 8,
      userId: "user8",
      username: "Lisa Anderson",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      points: 3400,
      challenges: 8,
      wins: 4,
      trend: "stable",
    },
  ];

  const categories = ["All", "Entertainment", "Technology", "Art", "Health", "Lifestyle"];

  const filteredChallenges = challenges.filter(c => {
    const matchesCategory = categoryFilter === "all" || c.category === categoryFilter;
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-orange-400" />;
    return null;
  };

  const getTrendIcon = (trend: string) => {
    if (trend === "up") return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend === "down") return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
    return <div className="w-4 h-4 text-gray-400">─</div>;
  };

  return (
    <>
      <Helmet>
        <title>Challenges & Leaderboard | Eloity</title>
        <meta
          name="description"
          content="Participate in challenges and compete on the leaderboard"
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate("/app/events")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Trophy className="w-8 h-8 text-yellow-500" />
                Challenges & Leaderboard
              </h1>
              <p className="text-muted-foreground">
                Participate in competitions and climb the ranks
              </p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Target className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Challenges</p>
                    <p className="text-2xl font-bold">{challenges.filter(c => c.status === "active").length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Participants</p>
                    <p className="text-2xl font-bold">{formatNumber(challenges.reduce((sum, c) => sum + c.participants, 0))}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Award className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Prize Pool</p>
                    <p className="text-2xl font-bold">${formatNumber(challenges.reduce((sum, c) => sum + c.prize, 0))}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <Zap className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Trending</p>
                    <p className="text-2xl font-bold flex items-center gap-1">
                      <Flame className="w-5 h-5" /> Hot
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="challenges">
                <Target className="w-4 h-4 mr-2" />
                Challenges
              </TabsTrigger>
              <TabsTrigger value="leaderboard">
                <Trophy className="w-4 h-4 mr-2" />
                Leaderboard
              </TabsTrigger>
            </TabsList>

            {/* Challenges Tab */}
            <TabsContent value="challenges" className="space-y-6">
              {/* Search and Filters */}
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search challenges..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="w-4 h-4" />
                      Filters
                    </Button>
                  </div>

                  {/* Category Filter */}
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                      <Button
                        key={cat}
                        variant={categoryFilter === cat.toLowerCase() ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCategoryFilter(cat.toLowerCase())}
                      >
                        {cat}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Challenges Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredChallenges.map((challenge) => (
                  <Card key={challenge.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-32 bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
                      <div className="text-6xl">{challenge.icon}</div>
                      <Badge className={`absolute top-2 right-2 ${
                        challenge.status === "active"
                          ? "bg-green-600"
                          : "bg-orange-600"
                      }`}>
                        {challenge.status === "active" ? "Active" : "Coming Soon"}
                      </Badge>
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <h3 className="font-bold text-lg">{challenge.title}</h3>
                        <p className="text-sm text-muted-foreground">{challenge.description}</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-blue-500" />
                          <span>{formatNumber(challenge.participants)} participants</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Trophy className="w-4 h-4 text-yellow-500" />
                          <span>${challenge.prize} Prize Pool</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span>{new Date(challenge.startDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <Button className="w-full gap-2">
                        <Play className="w-4 h-4" />
                        Join Challenge
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Leaderboard Tab */}
            <TabsContent value="leaderboard" className="space-y-6">
              {/* Period Selection */}
              <div className="flex gap-2">
                <Button variant="default" size="sm">This Month</Button>
                <Button variant="outline" size="sm">This Year</Button>
                <Button variant="outline" size="sm">All Time</Button>
              </div>

              {/* Leaderboard Table */}
              <div className="space-y-2">
                {leaderboard.map((entry) => (
                  <Card key={entry.userId} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Rank */}
                        <div className="flex-shrink-0 w-12 flex items-center justify-center">
                          <div className="flex flex-col items-center">
                            {getRankBadge(entry.rank)}
                            <span className="text-lg font-bold text-center">#{entry.rank}</span>
                          </div>
                        </div>

                        {/* User Info */}
                        <div className="flex items-center gap-3 flex-1">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={entry.avatar} alt={entry.username} />
                            <AvatarFallback>{entry.username.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-semibold">{entry.username}</p>
                            <p className="text-sm text-muted-foreground">
                              {entry.challenges} challenges completed
                            </p>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="hidden md:flex items-center gap-4 text-sm">
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Points</p>
                            <p className="font-bold text-lg">{formatNumber(entry.points)}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Wins</p>
                            <p className="font-bold text-lg">{entry.wins}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {getTrendIcon(entry.trend)}
                          </div>
                        </div>

                        {/* Mobile Stats */}
                        <div className="md:hidden text-right">
                          <p className="font-bold">{formatNumber(entry.points)}</p>
                          <p className="text-xs text-muted-foreground">{entry.wins} wins</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* View All Button */}
              <Button variant="outline" className="w-full">
                View Full Leaderboard
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default EventsRewards;
