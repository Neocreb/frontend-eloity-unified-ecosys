import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { formatNumber } from "@/utils/formatters";
import {
  Calendar,
  Clock,
  Users,
  Video,
  TrendingUp,
  ShoppingCart,
  Briefcase,
  Trophy,
  Play,
  Plus,
  Radio,
  MessageSquare,
  Share2,
  Bookmark,
  Star,
  Gift,
  Zap,
  MapPin,
  Eye,
  DollarSign,
  Palette,
  Code,
  Music,
  Camera,
  Gamepad2,
  Heart,
  ChevronRight,
  Bell,
  Settings,
} from "lucide-react";

interface LiveEvent {
  id: string;
  title: string;
  description: string;
  type:
    | "trading"
    | "marketplace"
    | "workshop"
    | "freelance"
    | "challenge"
    | "social";
  host: {
    id: string;
    name: string;
    avatar: string;
    verified: boolean;
  };
  startTime: string;
  duration: number; // in minutes
  participants: number;
  maxParticipants: number;
  isLive: boolean;
  isPremium: boolean;
  tags: string[];
  thumbnail: string;
  category: string;
  rewards?: {
    type: "points" | "crypto" | "nft" | "discount";
    amount: number;
    description: string;
  };
  requirements?: string[];
  featured?: boolean;
}

const LiveCommunityEvents = () => {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [activeTab, setActiveTab] = useState("featured");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [joinedEvents, setJoinedEvents] = useState<string[]>([]);
  const [savedEvents, setSavedEvents] = useState<string[]>([]);
  const { toast } = useToast();

  // Mock events data
  const mockEvents: LiveEvent[] = [
    {
      id: "1",
      title: "Live Crypto Trading Session: DeFi Strategies",
      description:
        "Join expert traders as we analyze DeFi opportunities in real-time. Learn advanced trading strategies and see live portfolio management.",
      type: "trading",
      host: {
        id: "1",
        name: "Alex Rivera",
        avatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
        verified: true,
      },
      startTime: "2024-02-15T18:00:00Z",
      duration: 120,
      participants: 234,
      maxParticipants: 500,
      isLive: true,
      isPremium: true,
      tags: ["DeFi", "Trading", "Crypto", "Live"],
      thumbnail:
        "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400",
      category: "Finance",
      rewards: {
        type: "crypto",
        amount: 50,
        description: "50 SOFT tokens for active participants",
      },
      featured: true,
    },
    {
      id: "2",
      title: "Flash Marketplace Sale: Tech Gadgets",
      description:
        "Limited-time group buying event with exclusive discounts. Bid together, save together!",
      type: "marketplace",
      host: {
        id: "2",
        name: "TechDeals Store",
        avatar:
          "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100",
        verified: true,
      },
      startTime: "2024-02-15T20:00:00Z",
      duration: 60,
      participants: 89,
      maxParticipants: 200,
      isLive: false,
      isPremium: false,
      tags: ["Shopping", "Deals", "Tech", "Flash Sale"],
      thumbnail:
        "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400",
      category: "Shopping",
      rewards: {
        type: "discount",
        amount: 25,
        description: "Up to 25% group discount",
      },
    },
    {
      id: "3",
      title: "AI Art Creation Workshop",
      description:
        "Learn to create stunning AI art with industry experts. Interactive session with live demonstrations.",
      type: "workshop",
      host: {
        id: "3",
        name: "Sarah Chen",
        avatar:
          "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100",
        verified: true,
      },
      startTime: "2024-02-16T15:00:00Z",
      duration: 90,
      participants: 156,
      maxParticipants: 300,
      isLive: false,
      isPremium: false,
      tags: ["AI", "Art", "Workshop", "Creative"],
      thumbnail:
        "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400",
      category: "Creative",
      requirements: ["Basic Photoshop knowledge", "Stable internet connection"],
    },
    {
      id: "4",
      title: "Freelance Pitch Battle",
      description:
        "Present your services live to potential clients. Real projects, real opportunities, real-time feedback.",
      type: "freelance",
      host: {
        id: "4",
        name: "FreelanceHub",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
        verified: true,
      },
      startTime: "2024-02-16T19:00:00Z",
      duration: 180,
      participants: 45,
      maxParticipants: 100,
      isLive: false,
      isPremium: false,
      tags: ["Freelance", "Networking", "Pitch", "Opportunity"],
      thumbnail:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400",
      category: "Professional",
    },
    {
      id: "5",
      title: "Community Building Challenge",
      description:
        "Team up with other members to complete collaborative challenges and earn exclusive rewards!",
      type: "challenge",
      host: {
        id: "5",
        name: "SoftChat Team",
        avatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
        verified: true,
      },
      startTime: "2024-02-17T16:00:00Z",
      duration: 240,
      participants: 312,
      maxParticipants: 1000,
      isLive: false,
      isPremium: false,
      tags: ["Challenge", "Community", "Team", "Rewards"],
      thumbnail:
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400",
      category: "Community",
      rewards: {
        type: "nft",
        amount: 1,
        description: "Exclusive community NFT badge",
      },
      featured: true,
    },
  ];

  useEffect(() => {
    setEvents(mockEvents);
  }, []);

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "trading":
        return <TrendingUp className="w-4 h-4" />;
      case "marketplace":
        return <ShoppingCart className="w-4 h-4" />;
      case "workshop":
        return <Palette className="w-4 h-4" />;
      case "freelance":
        return <Briefcase className="w-4 h-4" />;
      case "challenge":
        return <Trophy className="w-4 h-4" />;
      case "social":
        return <Heart className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "trading":
        return "bg-green-500";
      case "marketplace":
        return "bg-blue-500";
      case "workshop":
        return "bg-purple-500";
      case "freelance":
        return "bg-orange-500";
      case "challenge":
        return "bg-red-500";
      case "social":
        return "bg-pink-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatEventTime = (startTime: string) => {
    const date = new Date(startTime);
    const now = new Date();
    const diffInHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1 && diffInHours > 0) {
      return `Starting in ${Math.ceil(diffInHours * 60)} minutes`;
    } else if (diffInHours < 24 && diffInHours > 0) {
      return `Starting in ${Math.ceil(diffInHours)} hours`;
    } else {
      return (
        date.toLocaleDateString() +
        " at " +
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    }
  };

  const handleJoinEvent = (eventId: string) => {
    if (!joinedEvents.includes(eventId)) {
      setJoinedEvents((prev) => [...prev, eventId]);
      toast({
        title: "Joined Event!",
        description: "You'll receive a notification when the event starts.",
      });
    }
  };

  const handleSaveEvent = (eventId: string) => {
    if (savedEvents.includes(eventId)) {
      setSavedEvents((prev) => prev.filter((id) => id !== eventId));
      toast({
        title: "Event Removed",
        description: "Event removed from your saved list.",
      });
    } else {
      setSavedEvents((prev) => [...prev, eventId]);
      toast({
        title: "Event Saved!",
        description: "Event added to your saved list.",
      });
    }
  };

  const filterEvents = (type: string) => {
    switch (type) {
      case "featured":
        return events.filter((event) => event.featured || event.isLive);
      case "live":
        return events.filter((event) => event.isLive);
      case "upcoming":
        return events.filter(
          (event) => !event.isLive && new Date(event.startTime) > new Date(),
        );
      case "saved":
        return events.filter((event) => savedEvents.includes(event.id));
      default:
        return events.filter((event) => event.type === type);
    }
  };

  const renderEventCard = (event: LiveEvent) => (
    <Card
      key={event.id}
      className="overflow-hidden hover:shadow-lg transition-all duration-300 group"
    >
      <div className="relative">
        <img
          src={event.thumbnail}
          alt={event.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Event Type Badge */}
        <Badge
          className={`absolute top-3 left-3 ${getEventTypeColor(event.type)} text-white`}
        >
          {getEventTypeIcon(event.type)}
          <span className="ml-1 capitalize">{event.type}</span>
        </Badge>

        {/* Live Indicator */}
        {event.isLive && (
          <Badge className="absolute top-3 right-3 bg-red-500 text-white animate-pulse">
            <Radio className="w-3 h-3 mr-1" />
            LIVE
          </Badge>
        )}

        {/* Premium Badge */}
        {event.isPremium && (
          <Badge className="absolute bottom-3 right-3 bg-yellow-500 text-black">
            <Star className="w-3 h-3 mr-1" />
            Premium
          </Badge>
        )}

        {/* Participants Overlay */}
        <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center">
          <Users className="w-3 h-3 mr-1" />
          {formatNumber(event.participants)}/
          {formatNumber(event.maxParticipants)}
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
            {event.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {event.description}
          </p>
        </div>

        {/* Host Info */}
        <div className="flex items-center gap-2">
          <img
            src={event.host.avatar}
            alt={event.host.name}
            className="w-6 h-6 rounded-full"
          />
          <span className="text-sm font-medium">{event.host.name}</span>
          {event.host.verified && (
            <Badge variant="secondary" className="px-1 py-0">
              ✓
            </Badge>
          )}
        </div>

        {/* Event Time & Duration */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {formatEventTime(event.startTime)}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {event.duration}min
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {event.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {event.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{event.tags.length - 3} more
            </Badge>
          )}
        </div>

        {/* Rewards */}
        {event.rewards && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 p-2 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Gift className="w-4 h-4 text-yellow-600" />
              <span className="font-medium text-yellow-800 dark:text-yellow-200">
                Reward: {event.rewards.description}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {event.isLive ? (
            <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white">
              <Play className="w-4 h-4 mr-2" />
              Join Live
            </Button>
          ) : (
            <Button
              className="flex-1"
              variant={joinedEvents.includes(event.id) ? "outline" : "default"}
              onClick={() => handleJoinEvent(event.id)}
            >
              {joinedEvents.includes(event.id) ? (
                <>
                  <Bell className="w-4 h-4 mr-2" />
                  Joined
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  Join Event
                </>
              )}
            </Button>
          )}

          <Button
            variant="outline"
            size="icon"
            onClick={() => handleSaveEvent(event.id)}
          >
            <Bookmark
              className={`w-4 h-4 ${savedEvents.includes(event.id) ? "fill-current" : ""}`}
            />
          </Button>

          <Button variant="outline" size="icon">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Live Community Events
          </h1>
          <p className="text-muted-foreground">
            Join real-time collaborative experiences with the community
          </p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Live Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Event Title</label>
                <Input placeholder="Enter event title" />
              </div>
              <div>
                <label className="text-sm font-medium">Event Type</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trading">Trading Session</SelectItem>
                    <SelectItem value="marketplace">
                      Marketplace Event
                    </SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="freelance">Freelance Pitch</SelectItem>
                    <SelectItem value="challenge">
                      Community Challenge
                    </SelectItem>
                    <SelectItem value="social">Social Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea rows={3} placeholder="Describe your event" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Start Time</label>
                  <Input type="datetime-local" />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Duration (minutes)
                  </label>
                  <Input type="number" placeholder="60" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1">Create Event</Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="w-full overflow-x-auto">
          <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground min-w-full md:w-full">
            <TabsTrigger value="featured" className="whitespace-nowrap">
              Featured
            </TabsTrigger>
            <TabsTrigger value="live" className="whitespace-nowrap">
              Live Now
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="whitespace-nowrap">
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="trading" className="whitespace-nowrap">
              Trading
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="whitespace-nowrap">
              Shopping
            </TabsTrigger>
            <TabsTrigger value="workshop" className="whitespace-nowrap">
              Workshops
            </TabsTrigger>
            <TabsTrigger value="saved" className="whitespace-nowrap">
              Saved
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Event Grid */}
        {[
          "featured",
          "live",
          "upcoming",
          "trading",
          "marketplace",
          "workshop",
          "freelance",
          "challenge",
          "saved",
        ].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterEvents(tab).length > 0 ? (
                filterEvents(tab).map((event) => renderEventCard(event))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No events found</h3>
                  <p className="text-muted-foreground mb-4">
                    {tab === "saved"
                      ? "You haven't saved any events yet"
                      : `No ${tab} events available right now`}
                  </p>
                  {tab !== "saved" && (
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateDialog(true)}
                    >
                      Create the first event
                    </Button>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default LiveCommunityEvents;
