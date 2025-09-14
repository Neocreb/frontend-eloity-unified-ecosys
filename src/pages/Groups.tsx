import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatNumber } from "@/utils/formatters";
import { useToast } from "@/hooks/use-toast";
import { chatInitiationService } from "@/services/chatInitiationService";
import {
  Plus,
  Search,
  Users,
  Crown,
  Shield,
  Lock,
  Globe,
  MapPin,
  Calendar,
  TrendingUp,
  MessageSquare,
  UserPlus,
  UserMinus,
  Settings,
  Eye,
  Filter,
  SortAsc,
  ArrowLeft,
  MoreHorizontal,
  Star,
  ThumbsUp,
  Share2,
  BookOpen,
  Activity,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Real groups hook to replace mock data
const useGroups = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('groups')
          .select(`id, name, member_count, cover_url, avatar_url, description, privacy, created_at, creator_id`)
          .eq('privacy', 'public')
          .order('member_count', { ascending: false });

        if (error) throw error;

        // Fetch creators in batch to avoid relying on DB relationship mapping
        const creatorIds = Array.from(new Set((data || []).map((g: any) => g.creator_id).filter(Boolean)));
        let creatorsMap: Record<string, any> = {};
        if (creatorIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, username, avatar_url')
            .in('id', creatorIds);
          creatorsMap = (profiles || []).reduce((acc: any, p: any) => {
            acc[p.id] = p;
            return acc;
          }, {} as Record<string, any>);
        }

        const formattedGroups = (data || []).map((group: any) => ({
          id: group.id,
          name: group.name,
          members: group.member_count || 0,
          category: 'Community', // Default category
          cover: group.cover_url || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop",
          description: group.description,
          privacy: group.privacy,
          isJoined: false, // Will be determined by checking group_members
          isOwner: false,
          isAdmin: false,
          location: 'Global',
          createdAt: group.created_at,
          avatar: group.avatar_url || "https://api.dicebear.com/7.x/initials/svg?seed=" + group.name,
          creator: creatorsMap[group.creator_id] || null,
        }));

        setGroups(formattedGroups);
      } catch (err) {
        console.error('Error fetching groups:', err);
        setError('Failed to load groups');
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  return { groups, loading, error };
};

interface Group {
  id: string;
  name: string;
  members: number;
  category: string;
  cover: string;
  description?: string;
  privacy: "public" | "private";
  isJoined?: boolean;
  isOwner?: boolean;
  isAdmin?: boolean;
  location?: string;
  createdAt?: string;
}

const Groups = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { groups: realGroups, loading: groupsLoading, error: groupsError } = useGroups();
  const [groups, setGroups] = useState<Group[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"members" | "recent" | "name">("members");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Update local groups when real groups are loaded
  useEffect(() => {
    if (realGroups.length > 0) {
      setGroups(realGroups);
    }
  }, [realGroups]);

  // Filter and sort groups
  const filteredGroups = groups
    .filter((group) => {
      const matchesSearch =
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || group.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "members":
          return b.members - a.members;
        case "recent":
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const categories = [
    "Technology",
    "Finance", 
    "Travel",
    "Food",
    "Business",
    "Art & Design",
    "Music",
    "Gaming",
    "Sports",
    "Health & Fitness",
    "Education",
    "Lifestyle",
  ];

  const GroupCard = ({ group }: { group: Group }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 group cursor-pointer">
      <div className="relative h-48 overflow-hidden">
        <img
          src={group.cover}
          alt={group.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        <div className="absolute top-3 left-3 flex gap-2">
          {group.privacy === "private" && (
            <Badge variant="secondary" className="bg-gray-900/80 text-white">
              <Lock className="w-3 h-3 mr-1" />
              Private
            </Badge>
          )}
        </div>

        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-bold text-white text-lg mb-1 line-clamp-2">
            {group.name}
          </h3>
          <div className="flex items-center text-white/80 text-sm gap-2">
            <Users className="w-4 h-4" />
            <span>{formatNumber(group.members)} members</span>
            {group.location && (
              <>
                <span>•</span>
                <MapPin className="w-3 h-3" />
                <span>{group.location}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              {group.category}
            </Badge>
            {group.privacy === "public" ? (
              <Globe className="w-4 h-4 text-green-500" />
            ) : (
              <Lock className="w-4 h-4 text-gray-500" />
            )}
          </div>

          {group.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {group.description}
            </p>
          )}

          <Button 
            className="w-full" 
            size="sm"
            onClick={() => navigate(`/app/groups/${group.id}`)}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {group.privacy === "private" ? "Request to Join" : "Join Group"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (groupsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading groups...</p>
        </div>
      </div>
    );
  }

  if (groupsError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Error Loading Groups</h2>
            <p className="text-muted-foreground mb-4">{groupsError}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Groups</h1>
                <p className="text-muted-foreground">
                  Connect with communities that share your interests
                </p>
              </div>
            </div>

            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Group
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search groups..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="members">Most Members</SelectItem>
                    <SelectItem value="recent">Recently Created</SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {searchQuery && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Found {filteredGroups.length} groups matching "{searchQuery}"
                </span>
                <Badge variant="secondary">
                  {filteredGroups.length} results
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGroups.length > 0 ? (
            filteredGroups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No groups found
              </h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or browse different categories
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Groups;
