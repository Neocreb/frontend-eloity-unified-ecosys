// @ts-nocheck
import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Clock,
  TrendingUp,
  Heart,
  Eye,
  Calendar,
  Hash,
  Music,
  User,
  Globe,
  Sparkles,
  Target,
  BarChart3,
  Shuffle,
  RefreshCw,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface SearchFilters {
  duration: {
    min: number;
    max: number;
  };
  dateRange: "today" | "week" | "month" | "year" | "all";
  sortBy: "relevance" | "recent" | "popular" | "trending";
  categories: string[];
  hasMusic: boolean;
  verified: boolean;
  minViews: number;
  minLikes: number;
}

interface TrendingHashtag {
  id: string;
  tag: string;
  count: number;
  growth: number;
  category: string;
  isNew: boolean;
}

interface TrendingSound {
  id: string;
  title: string;
  artist: string;
  videoCount: number;
  growth: number;
  preview: string;
  duration: number;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  hashtag: string;
  participantCount: number;
  prize?: string;
  endDate: string;
  thumbnail: string;
  difficulty: "easy" | "medium" | "hard";
}

interface ContentDiscoveryEngineProps {
  onVideoSelect?: (videoId: string) => void;
  onHashtagSelect?: (hashtag: string) => void;
  onSoundSelect?: (soundId: string) => void;
  onChallengeSelect?: (challengeId: string) => void;
}

const trendingHashtags: TrendingHashtag[] = [
  {
    id: "1",
    tag: "fyp",
    count: 2500000,
    growth: 15.2,
    category: "general",
    isNew: false,
  },
  {
    id: "2",
    tag: "viral",
    count: 1800000,
    growth: 28.5,
    category: "general",
    isNew: false,
  },
  {
    id: "3",
    tag: "dance",
    count: 950000,
    growth: 12.1,
    category: "entertainment",
    isNew: false,
  },
  {
    id: "4",
    tag: "comedy",
    count: 720000,
    growth: 8.7,
    category: "entertainment",
    isNew: false,
  },
  {
    id: "5",
    tag: "tutorial",
    count: 680000,
    growth: 22.3,
    category: "education",
    isNew: false,
  },
  {
    id: "6",
    tag: "cooking",
    count: 540000,
    growth: 18.9,
    category: "lifestyle",
    isNew: false,
  },
  {
    id: "7",
    tag: "aiart",
    count: 320000,
    growth: 45.2,
    category: "technology",
    isNew: true,
  },
  {
    id: "8",
    tag: "sustainability",
    count: 280000,
    growth: 35.8,
    category: "lifestyle",
    isNew: true,
  },
  {
    id: "9",
    tag: "webdev",
    count: 190000,
    growth: 42.1,
    category: "technology",
    isNew: false,
  },
  {
    id: "10",
    tag: "mindfulness",
    count: 150000,
    growth: 38.4,
    category: "wellness",
    isNew: true,
  },
];

const trendingSounds: TrendingSound[] = [
  {
    id: "1",
    title: "Trending Beat #1",
    artist: "Viral Sounds",
    videoCount: 125000,
    growth: 89.2,
    preview: "https://audio-preview.com/1",
    duration: 30,
  },
  {
    id: "2",
    title: "Chill Vibes",
    artist: "Lo-Fi Masters",
    videoCount: 98000,
    growth: 67.5,
    preview: "https://audio-preview.com/2",
    duration: 45,
  },
  {
    id: "3",
    title: "Energy Boost",
    artist: "EDM Collective",
    videoCount: 87000,
    growth: 112.8,
    preview: "https://audio-preview.com/3",
    duration: 60,
  },
  {
    id: "4",
    title: "Acoustic Dreams",
    artist: "Indie Folk",
    videoCount: 76000,
    growth: 34.2,
    preview: "https://audio-preview.com/4",
    duration: 40,
  },
];

const challenges: Challenge[] = [
  {
    id: "1",
    title: "30-Day Creativity Challenge",
    description: "Create something new every day for 30 days",
    hashtag: "creativity30",
    participantCount: 45000,
    prize: "$1000 cash prize",
    endDate: "2024-02-15",
    thumbnail: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0",
    difficulty: "medium",
  },
  {
    id: "2",
    title: "Quick Recipe Challenge",
    description: "Show your best 60-second recipe",
    hashtag: "quickrecipe",
    participantCount: 28000,
    endDate: "2024-01-31",
    thumbnail: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136",
    difficulty: "easy",
  },
  {
    id: "3",
    title: "Tech Innovation Showcase",
    description: "Demonstrate cutting-edge technology",
    hashtag: "techinnovation",
    participantCount: 12000,
    prize: "Tech startup mentorship",
    endDate: "2024-03-01",
    thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af2176",
    difficulty: "hard",
  },
];

const categories = [
  "Entertainment",
  "Education",
  "Technology",
  "Lifestyle",
  "Wellness",
  "Food & Cooking",
  "Travel",
  "Fashion",
  "Art & Design",
  "Business",
  "Sports & Fitness",
  "Music",
  "Gaming",
  "News & Politics",
  "Science",
];

const ContentDiscoveryEngine: React.FC<ContentDiscoveryEngineProps> = ({
  onVideoSelect,
  onHashtagSelect,
  onSoundSelect,
  onChallengeSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({
    duration: { min: 0, max: 180 },
    dateRange: "all",
    sortBy: "relevance",
    categories: [],
    hasMusic: false,
    verified: false,
    minViews: 0,
    minLikes: 0,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState("discover");

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const getDaysUntilEnd = (endDate: string): number => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleCategoryToggle = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Search Header */}
      <div className="sticky top-0 bg-black/95 backdrop-blur-sm border-b border-gray-800 z-10">
        <div className="p-4 space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search videos, creators, sounds..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-900 border-gray-700 text-white"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className="text-white"
            >
              <Filter className="w-5 h-5" />
            </Button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Duration
                    </label>
                    <div className="space-y-2">
                      <Slider
                        value={[filters.duration.min, filters.duration.max]}
                        onValueChange={([min, max]) =>
                          setFilters((prev) => ({
                            ...prev,
                            duration: { min, max },
                          }))
                        }
                        max={180}
                        step={10}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>{filters.duration.min}s</span>
                        <span>{filters.duration.max}s</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Date Range
                    </label>
                    <Select
                      value={filters.dateRange}
                      onValueChange={(value: any) =>
                        setFilters((prev) => ({ ...prev, dateRange: value }))
                      }
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="year">This Year</SelectItem>
                        <SelectItem value="all">All Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Categories
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={
                          filters.categories.includes(category)
                            ? "default"
                            : "ghost"
                        }
                        size="sm"
                        onClick={() => handleCategoryToggle(category)}
                        className="text-xs"
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasMusic"
                      checked={filters.hasMusic}
                      onCheckedChange={(checked) =>
                        setFilters((prev) => ({
                          ...prev,
                          hasMusic: checked as boolean,
                        }))
                      }
                    />
                    <label htmlFor="hasMusic" className="text-sm">
                      Has Music
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="verified"
                      checked={filters.verified}
                      onCheckedChange={(checked) =>
                        setFilters((prev) => ({
                          ...prev,
                          verified: checked as boolean,
                        }))
                      }
                    />
                    <label htmlFor="verified" className="text-sm">
                      Verified Only
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList className="w-full bg-black border-b border-gray-800 rounded-none">
          <TabsTrigger value="discover" className="flex-1">
            <Sparkles className="w-4 h-4 mr-2" />
            For You
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex-1">
            <TrendingUp className="w-4 h-4 mr-2" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="sounds" className="flex-1">
            <Music className="w-4 h-4 mr-2" />
            Sounds
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex-1">
            <Target className="w-4 h-4 mr-2" />
            Challenges
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">AI-Curated For You</h2>
            <Button variant="ghost" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Personalized Content Categories */}
          <div className="space-y-4">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Based on your interests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {["Technology", "Cooking", "Art"].map((category) => (
                    <Button
                      key={category}
                      variant="ghost"
                      className="h-16 flex flex-col text-center border border-gray-700"
                    >
                      <div className="text-lg mb-1">
                        {category === "Technology" && "💻"}
                        {category === "Cooking" && "👨‍🍳"}
                        {category === "Art" && "🎨"}
                      </div>
                      <span className="text-xs">{category}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Similar to videos you liked
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-400">
                  Discovering content similar to your recent likes and
                  interactions...
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trending" className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Trending Hashtags</h2>
            <Badge variant="secondary" className="bg-red-500/20 text-red-400">
              Live
            </Badge>
          </div>

          <div className="space-y-3">
            {trendingHashtags.map((hashtag, index) => (
              <Card
                key={hashtag.id}
                className="bg-gray-900 border-gray-700 hover:bg-gray-800 cursor-pointer transition-colors"
                onClick={() => onHashtagSelect?.(hashtag.tag)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-medium text-gray-400">
                        #{index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4 text-blue-400" />
                          <span className="font-medium">#{hashtag.tag}</span>
                          {hashtag.isNew && (
                            <Badge
                              variant="secondary"
                              className="bg-green-500/20 text-green-400 text-xs"
                            >
                              NEW
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-400">
                          {formatNumber(hashtag.count)} videos
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={cn(
                          "text-sm font-medium",
                          hashtag.growth > 0
                            ? "text-green-400"
                            : "text-red-400",
                        )}
                      >
                        +{hashtag.growth}%
                      </div>
                      <div className="text-xs text-gray-400">growth</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sounds" className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Trending Sounds</h2>
            <Button variant="ghost" size="sm">
              <Shuffle className="w-4 h-4 mr-2" />
              Shuffle
            </Button>
          </div>

          <div className="space-y-3">
            {trendingSounds.map((sound, index) => (
              <Card
                key={sound.id}
                className="bg-gray-900 border-gray-700 hover:bg-gray-800 cursor-pointer transition-colors"
                onClick={() => onSoundSelect?.(sound.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Music className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{sound.title}</div>
                      <div className="text-sm text-gray-400">
                        {sound.artist}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatNumber(sound.videoCount)} videos •{" "}
                        {sound.duration}s
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-400">
                        +{sound.growth}%
                      </div>
                      <div className="text-xs text-gray-400">trending</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Active Challenges</h2>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          <div className="space-y-4">
            {challenges.map((challenge) => (
              <Card
                key={challenge.id}
                className="bg-gray-900 border-gray-700 hover:bg-gray-800 cursor-pointer transition-colors"
                onClick={() => onChallengeSelect?.(challenge.id)}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <img
                      src={challenge.thumbnail}
                      alt={challenge.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{challenge.title}</h3>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-xs",
                            challenge.difficulty === "easy" &&
                              "bg-green-500/20 text-green-400",
                            challenge.difficulty === "medium" &&
                              "bg-yellow-500/20 text-yellow-400",
                            challenge.difficulty === "hard" &&
                              "bg-red-500/20 text-red-400",
                          )}
                        >
                          {challenge.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">
                        {challenge.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {formatNumber(challenge.participantCount)}{" "}
                          participants
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {getDaysUntilEnd(challenge.endDate)} days left
                        </span>
                      </div>
                      {challenge.prize && (
                        <Badge
                          variant="secondary"
                          className="bg-yellow-500/20 text-yellow-400 text-xs mt-2"
                        >
                          🏆 {challenge.prize}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentDiscoveryEngine;
