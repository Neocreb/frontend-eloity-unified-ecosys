// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import LiveCommunityEvents from "@/components/community/LiveCommunityEvents";
import LiveEventRoom from "@/components/community/LiveEventRoom";
import VirtualGiftsAndTips, {
  QuickTipButton,
} from "@/components/premium/VirtualGiftsAndTips";
import {
  useCommunityEvents,
  useEventAnalytics,
} from "@/hooks/use-community-events";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatNumber } from "@/utils/formatters";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Calendar,
  TrendingUp,
  Users,
  Award,
  DollarSign,
  Eye,
  MessageSquare,
  Plus,
  BarChart3,
  Clock,
  Star,
  Filter,
  SortDesc,
  Grid,
  List,
  Play,
  Bookmark,
  Share2,
  Settings,
  Video,
  Mic,
  Gift,
  Crown,
  Zap,
  Target,
  Globe,
  Lock,
  AlertCircle,
  CheckCircle2,
  Camera,
  Heart,
  Coffee,
  Sparkles,
} from "lucide-react";

const CommunityEvents = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showCreateTypeChoice, setShowCreateTypeChoice] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [newEventData, setNewEventData] = useState({
    title: "",
    description: "",
    type: "workshop",
    startTime: "",
    duration: 60,
    maxParticipants: 100,
    isPrivate: false,
    requiresPayment: false,
    price: 0,
    tags: "",
  });
  const { events, loading, searchEvents, createEvent } = useCommunityEvents();
  const { user } = useAuth();
  const { analytics } = useEventAnalytics(undefined, user?.id);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchEvents(searchQuery);
    }
  };

  const handleJoinLiveEvent = (eventId: string) => {
    setSelectedEvent(eventId);
  };

  const handleCategoryClick = (type: string) => {
    // Filter events by the selected category type
    searchEvents("", { type });

    // Show success message
    toast({
      title: `Filtered to ${type.charAt(0).toUpperCase() + type.slice(1)} Events`,
      description: `Showing all ${type} events in the community`,
    });
  };

  const liveEvent = events.find((e) => e.id === selectedEvent);

  // Analytics summary
  const analyticsStats = analytics
    ? {
        totalEvents: analytics.totalEvents || 0,
        totalViewers: analytics.totalViewers || 0,
        avgEngagement: analytics.averageEngagement || 0,
        revenue: analytics.revenue || 0,
      }
    : null;

  if (selectedEvent && liveEvent) {
    return (
      <LiveEventRoom
        eventId={selectedEvent}
        eventTitle={liveEvent.title}
        eventType={liveEvent.type}
        isHost={liveEvent.host.id === user?.id}
      />
    );
  }

  return (
    <>
      <Helmet>
        <title>Live Community Events | Eloity</title>
        <meta
          name="description"
          content="Join real-time collaborative experiences with the Eloity community"
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                  Live Community Events
                </h1>
                <p className="text-muted-foreground text-lg">
                  Join real-time collaborative experiences with the community
                </p>

                {/* Cross-Navigation Quick Links */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/app/videos")}
                    className="flex items-center gap-2"
                  >
                    <Video className="h-4 w-4" />
                    Watch Videos
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/app/live-streaming")}
                    className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    Start Live Stream
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/app/premium")}
                    className="flex items-center gap-2 border-purple-200 text-purple-600 hover:bg-purple-50"
                  >
                    <Crown className="h-4 w-4" />
                    Premium Events
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {user && (
                  <Button
                    variant="outline"
                    onClick={() => setShowAnalytics(!showAnalytics)}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                  </Button>
                )}
                <Button
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  onClick={() => setShowCreateTypeChoice(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Live Now</p>
                      <p className="text-2xl font-bold">
                        {formatNumber(events.filter((e) => e.isLive).length)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Viewers
                      </p>
                      <p className="text-2xl font-bold">
                        {formatNumber(
                          events.reduce((acc, e) => acc + e.participants, 0),
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">This Week</p>
                      <p className="text-2xl font-bold">
                        {formatNumber(
                          events.filter((e) => {
                            const eventDate = new Date(e.startTime);
                            const now = new Date();
                            const weekAgo = new Date(
                              now.getTime() - 7 * 24 * 60 * 60 * 1000,
                            );
                            return eventDate >= weekAgo;
                          }).length,
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Trending</p>
                      <p className="text-2xl font-bold">🔥</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Analytics Panel */}
          {showAnalytics && analyticsStats && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Your Event Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-500">
                      {analyticsStats.totalEvents}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Events Created
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-500">
                      {formatNumber(analyticsStats.totalViewers)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Total Viewers
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-500">
                      {analyticsStats.avgEngagement.toFixed(1)}%
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Avg. Engagement
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-500">
                      ${formatNumber(analyticsStats.revenue)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Revenue Generated
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <form onSubmit={handleSearch} className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search events, topics, or hosts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4"
                    />
                  </div>
                </form>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                  <Button variant="outline" size="sm">
                    <SortDesc className="w-4 h-4 mr-2" />
                    Sort
                  </Button>
                  <div className="flex border border-border rounded-md">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="rounded-r-none"
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className="rounded-l-none"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Create Type Choice Dialog */}
          <Dialog open={showCreateTypeChoice} onOpenChange={setShowCreateTypeChoice}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  What would you like to create?
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-40 flex flex-col items-center justify-center gap-3 p-6 hover:bg-blue-50 hover:border-blue-300 transition-all"
                  onClick={() => {
                    setShowCreateTypeChoice(false);
                    navigate('/app/community/create-event');
                  }}
                >
                  <Calendar className="h-8 w-8 text-blue-600" />
                  <div className="text-center">
                    <div className="font-semibold text-lg">Create Event</div>
                    <div className="text-sm text-muted-foreground">Workshop, meetup, or live session</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-40 flex flex-col items-center justify-center gap-3 p-6 hover:bg-purple-50 hover:border-purple-300 transition-all"
                  onClick={() => {
                    setShowCreateTypeChoice(false);
                    navigate('/app/challenges/create');
                  }}
                >
                  <Target className="h-8 w-8 text-purple-600" />
                  <div className="text-center">
                    <div className="font-semibold text-lg">Create Challenge</div>
                    <div className="text-sm text-muted-foreground">Competition with prizes</div>
                  </div>
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Create Event Dialog */}
          <Dialog open={showCreateEvent} onOpenChange={setShowCreateEvent}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create New Event
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="event-title">Event Title</Label>
                    <Input
                      id="event-title"
                      value={newEventData.title}
                      onChange={(e) =>
                        setNewEventData({
                          ...newEventData,
                          title: e.target.value,
                        })
                      }
                      placeholder="Enter event title..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="event-type">Event Type</Label>
                    <Select
                      value={newEventData.type}
                      onValueChange={(value) =>
                        setNewEventData({ ...newEventData, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="workshop">📚 Workshop</SelectItem>
                        <SelectItem value="trading">
                          📈 Trading Session
                        </SelectItem>
                        <SelectItem value="marketplace">
                          🛒 Shopping Event
                        </SelectItem>
                        <SelectItem value="social">❤️ Social Meetup</SelectItem>
                        <SelectItem value="challenge">🏆 Challenge</SelectItem>
                        <SelectItem value="freelance">
                          💼 Freelance Session
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="event-description">Description</Label>
                  <Textarea
                    id="event-description"
                    value={newEventData.description}
                    onChange={(e) =>
                      setNewEventData({
                        ...newEventData,
                        description: e.target.value,
                      })
                    }
                    placeholder="Describe your event..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="start-time">Start Time</Label>
                    <Input
                      id="start-time"
                      type="datetime-local"
                      value={newEventData.startTime}
                      onChange={(e) =>
                        setNewEventData({
                          ...newEventData,
                          startTime: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="15"
                      max="480"
                      value={newEventData.duration}
                      onChange={(e) =>
                        setNewEventData({
                          ...newEventData,
                          duration: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="max-participants">Max Participants</Label>
                    <Input
                      id="max-participants"
                      type="number"
                      min="2"
                      max="1000"
                      value={newEventData.maxParticipants}
                      onChange={(e) =>
                        setNewEventData({
                          ...newEventData,
                          maxParticipants: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="private-event">Private Event</Label>
                      <p className="text-xs text-muted-foreground">
                        Only invited users can join
                      </p>
                    </div>
                    <Switch
                      id="private-event"
                      checked={newEventData.isPrivate}
                      onCheckedChange={(checked) =>
                        setNewEventData({ ...newEventData, isPrivate: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="paid-event">Paid Event</Label>
                      <p className="text-xs text-muted-foreground">
                        Charge participants to join
                      </p>
                    </div>
                    <Switch
                      id="paid-event"
                      checked={newEventData.requiresPayment}
                      onCheckedChange={(checked) =>
                        setNewEventData({
                          ...newEventData,
                          requiresPayment: checked,
                        })
                      }
                    />
                  </div>

                  {newEventData.requiresPayment && (
                    <div>
                      <Label htmlFor="event-price">Price ($)</Label>
                      <Input
                        id="event-price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={newEventData.price}
                        onChange={(e) =>
                          setNewEventData({
                            ...newEventData,
                            price: parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="event-tags">Tags (comma-separated)</Label>
                  <Input
                    id="event-tags"
                    value={newEventData.tags}
                    onChange={(e) =>
                      setNewEventData({ ...newEventData, tags: e.target.value })
                    }
                    placeholder="e.g., beginner, crypto, live-trading"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      // Handle create event
                      toast({
                        title: "Event created!",
                        description:
                          "Your event has been scheduled successfully.",
                      });
                      setShowCreateEvent(false);
                    }}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateEvent(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Advanced Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1">
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="trading">📈 Trading</SelectItem>
                      <SelectItem value="marketplace">🛒 Shopping</SelectItem>
                      <SelectItem value="workshop">📚 Workshops</SelectItem>
                      <SelectItem value="social">❤️ Social</SelectItem>
                      <SelectItem value="challenge">🏆 Challenges</SelectItem>
                      <SelectItem value="freelance">💼 Freelance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">🕒 Most Recent</SelectItem>
                      <SelectItem value="popular">🔥 Most Popular</SelectItem>
                      <SelectItem value="upcoming">⏰ Starting Soon</SelectItem>
                      <SelectItem value="participants">
                        👥 Most Participants
                      </SelectItem>
                      <SelectItem value="price-low">
                        💰 Price: Low to High
                      </SelectItem>
                      <SelectItem value="price-high">
                        💰 Price: High to Low
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedCategory("all");
                      setSortBy("recent");
                      setSearchQuery("");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Events Section */}
          <LiveCommunityEvents />

          {/* Challenges Section */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">🎯 Challenges & Competitions</h2>
              <Button onClick={() => navigate('rewards')} variant="outline">
                View Leaderboard
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Challenge Cards */}
              <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                <div className="relative">
                  <div className="w-full h-48 bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <Target className="w-12 h-12 text-white" />
                  </div>
                  <Badge className="absolute top-3 left-3 bg-purple-600 text-white">
                    ACTIVE
                  </Badge>
                  <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs">
                    🏆 500 SP Prize
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2">#DanceChallenge</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    Show off your best dance moves! Winner gets 500 Eloity Points.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">2 days left</span>
                    <Button size="sm">Join Challenge</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                <div className="relative">
                  <div className="w-full h-48 bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Zap className="w-12 h-12 text-white" />
                  </div>
                  <Badge className="absolute top-3 left-3 bg-blue-600 text-white">
                    FEATURED
                  </Badge>
                  <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs">
                    🎁 1000 SP Prize
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2">#TalentShowcase</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    Share your unique talent and win big! Sponsored challenge.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">5 days left</span>
                    <Button size="sm">Join Challenge</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                <div className="relative">
                  <div className="w-full h-48 bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                    <Crown className="w-12 h-12 text-white" />
                  </div>
                  <Badge className="absolute top-3 left-3 bg-green-600 text-white">
                    NEW
                  </Badge>
                  <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs">
                    🏅 Badge Reward
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2">#CreativityBoost</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    Create something amazing and unlock exclusive creator badge!
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">1 week left</span>
                    <Button size="sm">Join Challenge</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Button
                onClick={() => navigate('rewards')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                View All Challenges & Leaderboard
              </Button>
            </div>
          </div>

          {/* Featured Live Events Spotlight */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">🔴 Live Right Now</h2>
              <Button variant="outline">View All Live</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events
                .filter((event) => event.isLive)
                .slice(0, 3)
                .map((event) => (
                  <Card
                    key={event.id}
                    className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer"
                  >
                    <div className="relative">
                      <img
                        src={event.thumbnail}
                        alt={event.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      <Badge className="absolute top-3 left-3 bg-red-500 text-white animate-pulse">
                        <Eye className="w-3 h-3 mr-1" />
                        LIVE
                      </Badge>

                      <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {formatNumber(event.participants)} watching
                      </div>

                      <Button
                        className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 m-4 rounded-lg"
                        onClick={() => handleJoinLiveEvent(event.id)}
                      >
                        <Play className="w-8 h-8" />
                      </Button>
                    </div>

                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                        {event.title}
                      </h3>

                      <div className="flex items-center gap-2 mb-3">
                        <img
                          src={event.host.avatar}
                          alt={event.host.name}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-sm font-medium">
                          {event.host.name}
                        </span>
                        {event.host.verified && (
                          <Badge variant="secondary" className="px-1 py-0">
                            ✓
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {event.type}
                          </Badge>
                          {event.isPremium && (
                            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                              <Crown className="w-3 h-3 mr-1" />
                              Premium
                            </Badge>
                          )}
                          {event.price && event.price > 0 && (
                            <Badge variant="secondary">
                              <DollarSign className="w-3 h-3 mr-1" />$
                              {event.price}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <VirtualGiftsAndTips
                            recipientId={event.host.id}
                            recipientName={event.host.name}
                            trigger={
                              <Button variant="ghost" size="sm">
                                <Gift className="w-4 h-4" />
                              </Button>
                            }
                          />
                          <QuickTipButton
                            recipientId={event.host.id}
                            recipientName={event.host.name}
                            amount={2}
                          />
                          <Button variant="ghost" size="sm">
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Bookmark className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>

          {/* Event Types Overview */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">
              What You Can Do in Events
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card
                className="hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => setSelectedCategory("trading")}
              >
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-medium">Trading Events</h3>
                  <p className="text-sm text-muted-foreground">
                    Live crypto trading with experts
                  </p>
                  <div className="mt-2 flex items-center justify-center gap-1">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs font-medium">
                      Premium Available
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => setSelectedCategory("marketplace")}
              >
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-medium">Shopping Events</h3>
                  <p className="text-sm text-muted-foreground">
                    Group buying & flash sales
                  </p>
                  <div className="mt-2 flex items-center justify-center gap-1">
                    <Gift className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-medium">Send Gifts</span>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => setSelectedCategory("challenge")}
              >
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-medium">Challenge Events</h3>
                  <p className="text-sm text-muted-foreground">
                    Community competitions with rewards
                  </p>
                  <div className="mt-2 flex items-center justify-center gap-1">
                    <Crown className="w-4 h-4 text-orange-500" />
                    <span className="text-xs font-medium">Win Prizes</span>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => setSelectedCategory("workshop")}
              >
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-medium">Workshop Events</h3>
                  <p className="text-sm text-muted-foreground">
                    Learn new skills with creators
                  </p>
                  <div className="mt-2 flex items-center justify-center gap-1">
                    <Video className="w-4 h-4 text-purple-500" />
                    <span className="text-xs font-medium">
                      Interactive Learning
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Event Categories Quick Access */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                {
                  type: "trading",
                  label: "Trading",
                  icon: "📈",
                  color: "bg-green-500",
                },
                {
                  type: "marketplace",
                  label: "Shopping",
                  icon: "🛒",
                  color: "bg-blue-500",
                },
                {
                  type: "workshop",
                  label: "Workshops",
                  icon: "🎨",
                  color: "bg-purple-500",
                },
                {
                  type: "freelance",
                  label: "Freelance",
                  icon: "💼",
                  color: "bg-orange-500",
                },
                {
                  type: "challenge",
                  label: "Challenges",
                  icon: "🏆",
                  color: "bg-red-500",
                },
                {
                  type: "social",
                  label: "Social",
                  icon: "❤️",
                  color: "bg-pink-500",
                },
              ].map((category) => (
                <Card
                  key={category.type}
                  className="hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => handleCategoryClick(category.type)}
                >
                  <CardContent className="p-4 text-center">
                    <div
                      className={`w-12 h-12 ${category.color} rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}
                    >
                      <span className="text-2xl">{category.icon}</span>
                    </div>
                    <h3 className="font-medium">{category.label}</h3>
                    <p className="text-sm text-muted-foreground">
                      {events.filter((e) => e.type === category.type).length}{" "}
                      events
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Premium Event Features */}
          <div className="mt-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">
                <Crown className="h-6 w-6 text-yellow-500" />
                Premium Event Features
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Unlock advanced features to create more engaging and profitable
                events
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-yellow-400 to-transparent opacity-20"></div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-yellow-100 rounded-full">
                      <Mic className="h-5 w-5 text-yellow-600" />
                    </div>
                    <h3 className="font-semibold">Professional Audio/Video</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      4K video streaming
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Noise cancellation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Screen sharing with annotations
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Multi-camera support
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-purple-400 to-transparent opacity-20"></div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-100 rounded-full">
                      <DollarSign className="h-5 w-5 text-purple-600" />
                    </div>
                    <h3 className="font-semibold">Monetization Tools</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Paid event tickets
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Virtual gifts & tips
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Sponsored content slots
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Revenue analytics
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-blue-400 to-transparent opacity-20"></div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Zap className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold">Advanced Features</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      AI-powered moderation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Real-time polls & quizzes
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Breakout rooms
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Event recordings
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-8">
              <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Premium
              </Button>
            </div>
          </div>

          {/* Event Statistics */}
          <div className="mt-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Platform Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-500">
                      {formatNumber(1234)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Total Events
                    </p>
                    <div className="text-xs text-green-500 flex items-center justify-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3" />
                      +12% this week
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-500">
                      {formatNumber(45678)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Total Participants
                    </p>
                    <div className="text-xs text-green-500 flex items-center justify-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3" />
                      +8% this week
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-500">
                      ${formatNumber(98765)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Total Earnings
                    </p>
                    <div className="text-xs text-green-500 flex items-center justify-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3" />
                      +23% this week
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-500">
                      {formatNumber(234)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Active Creators
                    </p>
                    <div className="text-xs text-green-500 flex items-center justify-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3" />
                      +5% this week
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default CommunityEvents;
