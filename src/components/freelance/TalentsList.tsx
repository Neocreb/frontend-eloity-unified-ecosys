import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Star,
  MapPin,
  DollarSign,
  Users,
  Award,
  Search,
  Filter,
  Verified,
  Clock,
  Heart,
  MessageCircle,
  Eye,
} from "lucide-react";
import { useFreelance } from "@/hooks/use-freelance";
import { FreelancerProfile } from "@/types/freelance";

export interface Talent {
  id: string;
  name: string;
  avatar: string;
  title: string;
  description: string;
  skills: string[];
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  location: string;
  availability: "available" | "busy" | "offline";
  verified: boolean;
  completedJobs: number;
  responseTime: string;
  successRate: number;
  portfolio: {
    id: string;
    title: string;
    image: string;
    category: string;
  }[];
  badges: string[];
  languages: string[];
  joinedDate: string;
  lastSeen: string;
}

interface TalentsListProps {
  onTalentSelect?: (talent: Talent) => void;
  filters?: {
    category?: string;
    skills?: string[];
    minRating?: number;
    maxRate?: number;
    availability?: string;
  };
  showFilters?: boolean;
}

// Define categories and availability options
const categories = [
  "All Categories",
  "Web Development",
  "Mobile Development",
  "UI/UX Design",
  "Digital Marketing",
  "Data Science",
  "Writing & Content",
  "DevOps & Cloud",
];

const availabilityOptions = [
  { value: "all", label: "All Availability" },
  { value: "available", label: "Available Now" },
  { value: "busy", label: "Busy" },
  { value: "offline", label: "Offline" },
];

export const TalentsList: React.FC<TalentsListProps> = ({
  onTalentSelect,
  filters,
  showFilters = true,
}) => {
  const [talents, setTalents] = useState<Talent[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedAvailability, setSelectedAvailability] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  const [loading, setLoading] = useState(true);
  const { searchFreelancers } = useFreelance();

  // Fetch real talents data
  useEffect(() => {
    const fetchTalents = async () => {
      try {
        setLoading(true);
        const searchFilters = {
          query: searchQuery,
          category: selectedCategory !== "All Categories" ? selectedCategory : undefined,
          skills: filters?.skills,
        };
        
        const freelancerProfiles = await searchFreelancers(searchFilters);
        
        if (freelancerProfiles) {
          // Transform FreelancerProfile to Talent interface
          const transformedTalents: Talent[] = freelancerProfiles.map((profile: FreelancerProfile) => ({
            id: profile.id,
            name: profile.userId, // In a real app, this would come from a user profile
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user", // Placeholder
            title: profile.title,
            description: profile.description,
            skills: profile.skills,
            hourlyRate: profile.hourlyRate,
            rating: profile.rating,
            reviewCount: profile.reviewCount,
            location: "San Francisco, CA", // Placeholder
            availability: profile.availability === "available" ? "available" : "busy",
            verified: true, // Placeholder
            completedJobs: profile.completedProjects,
            responseTime: "1 hour", // Placeholder
            successRate: 95, // Placeholder
            portfolio: profile.portfolio.map((url, index) => ({
              id: index.toString(),
              title: `Project ${index + 1}`,
              image: url,
              category: "Web Development"
            })),
            badges: ["Top Rated", "Verified"], // Placeholder
            languages: profile.languages,
            joinedDate: profile.createdAt.toISOString(), // Placeholder
            lastSeen: "Online now" // Placeholder
          }));
          
          setTalents(transformedTalents);
        }
      } catch (error) {
        console.error("Error fetching talents:", error);
        // Fallback to mock data if real data fetch fails
        setTalents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTalents();
  }, [searchQuery, selectedCategory, selectedAvailability, sortBy, filters, searchFreelancers]);

  // Filter and sort talents
  useEffect(() => {
    // Apply external filters
    if (filters) {
      let filtered = [...talents];
      
      if (filters.minRating) {
        filtered = filtered.filter(
          (talent) => talent.rating >= filters.minRating!,
        );
      }
      if (filters.maxRate) {
        filtered = filtered.filter(
          (talent) => talent.hourlyRate <= filters.maxRate!,
        );
      }
      if (filters.skills) {
        filtered = filtered.filter((talent) =>
          filters.skills!.some((skill) =>
            talent.skills.some((ts) =>
              ts.toLowerCase().includes(skill.toLowerCase()),
            ),
          ),
        );
      }
      
      setTalents(filtered);
    }
  }, [filters, talents]);

  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case "available":
        return <Badge className="bg-green-100 text-green-800">Available</Badge>;
      case "busy":
        return <Badge className="bg-yellow-100 text-yellow-800">Busy</Badge>;
      case "offline":
        return <Badge className="bg-gray-100 text-gray-800">Offline</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showFilters && (
        <Card>
          <CardHeader>
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search talents by name, skills, or title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedAvailability}
                  onValueChange={setSelectedAvailability}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availabilityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="rate">Lowest Rate</SelectItem>
                    <SelectItem value="experience">Most Experience</SelectItem>
                    <SelectItem value="recent">Recently Joined</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          {talents.length} talent{talents.length !== 1 ? "s" : ""} found
        </p>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          More Filters
        </Button>
      </div>

      {/* Talents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {talents.map((talent) => (
          <Card
            key={talent.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
          >
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={talent.avatar} alt={talent.name} />
                    <AvatarFallback>
                      {talent.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{talent.name}</h3>
                      {talent.verified && (
                        <Verified className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {talent.title}
                    </p>
                  </div>
                </div>
                {getAvailabilityBadge(talent.availability)}
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {talent.description}
              </p>

              {/* Skills */}
              <div className="flex flex-wrap gap-2 mb-4">
                {talent.skills.slice(0, 4).map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {talent.skills.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{talent.skills.length - 4} more
                  </Badge>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{talent.rating}</span>
                  <span className="text-sm text-muted-foreground">
                    ({talent.reviewCount} reviews)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">
                    ${talent.hourlyRate}/hr
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">{talent.completedJobs} jobs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span className="text-sm">
                    {talent.responseTime} response
                  </span>
                </div>
              </div>

              {/* Location and badges */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {talent.location}
                </div>
                <div className="flex gap-1">
                  {talent.badges.map((badge) => (
                    <Badge
                      key={badge}
                      className="text-xs bg-blue-100 text-blue-800"
                    >
                      {badge}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Portfolio Preview */}
              {talent.portfolio.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Recent Work</p>
                  <div className="flex gap-2">
                    {talent.portfolio.slice(0, 2).map((item) => (
                      <img
                        key={item.id}
                        src={item.image}
                        alt={item.title}
                        className="w-16 h-12 rounded object-cover"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => onTalentSelect?.(talent)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Profile
                </Button>
                <Button variant="outline" size="icon">
                  <MessageCircle className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Heart className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      {talents.length > 0 && (
        <div className="text-center">
          <Button variant="outline">Load More Talents</Button>
        </div>
      )}

      {/* No Results */}
      {talents.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No talents found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or filters
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All Categories");
                setSelectedAvailability("all");
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TalentsList;