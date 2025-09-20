import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatNumber } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import {
  Plus,
  Search,
  Calendar,
  Heart,
  MessageCircle,
  Share2,
  Filter,
  SortAsc,
  ArrowLeft,
  MoreHorizontal,
  Image as ImageIcon,
  Video,
  MapPin,
  Users,
  Lock,
  Globe,
  Camera,
  Loader2,
} from "lucide-react";

// Simple Badge component since import is having issues
interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive';
}

const Badge: React.FC<BadgeProps> = ({ children, className, variant }) => {
  const baseClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold";
  
  const variantClasses = {
    default: "border-transparent bg-primary text-primary-foreground",
    outline: "border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300",
    secondary: "border-transparent bg-secondary text-secondary-foreground",
    destructive: "border-transparent bg-destructive text-destructive-foreground",
  }[variant || 'default'] || "";
  
  return (
    <span className={`${baseClasses} ${variantClasses} ${className || ''}`}>
      {children}
    </span>
  );
};

interface Memory {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
  };
  createdAt: string;
  media?: {
    type: 'image' | 'video';
    url: string;
  }[];
  location?: string;
  likes: number;
  comments: number;
  shares: number;
  privacy: 'public' | 'friends' | 'private';
  tags: string[];
  isLiked?: boolean;
  isBookmarked?: boolean;
}

const Memories = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [memoryForm, setMemoryForm] = useState({
    title: "",
    content: "",
    location: "",
    privacy: "public" as 'public' | 'friends' | 'private',
    tags: "",
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from the API
      // const response = await apiClient.getMemories();
      
      // For now, we'll use the existing mock data but structure it properly
      const mockMemories: Memory[] = [
        {
          id: "mem1",
          title: "Summer Vacation 2023",
          content: "Amazing time at the beach with friends. The sunset was absolutely breathtaking!",
          author: {
            id: "user1",
            name: "Alex Johnson",
            username: "alexj",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
            verified: true,
          },
          createdAt: "2023-07-15T14:30:00Z",
          media: [
            {
              type: "image",
              url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400"
            }
          ],
          location: "Malibu, CA",
          likes: 124,
          comments: 23,
          shares: 8,
          privacy: "public",
          tags: ["vacation", "beach", "summer"],
          isLiked: true,
        },
        {
          id: "mem2",
          title: "Graduation Day",
          content: "Finally graduated! So proud of all the hard work and dedication over these years.",
          author: {
            id: "user2",
            name: "Sarah Williams",
            username: "sarahw",
            avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100",
            verified: false,
          },
          createdAt: "2023-05-20T10:15:00Z",
          media: [
            {
              type: "image",
              url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400"
            },
            {
              type: "image",
              url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400"
            }
          ],
          location: "University of California",
          likes: 356,
          comments: 42,
          shares: 15,
          privacy: "friends",
          tags: ["graduation", "achievement", "milestone"],
        },
        {
          id: "mem3",
          title: "New Year Celebration",
          content: "What a way to start the new year! Celebrating with family and friends.",
          author: {
            id: "user3",
            name: "Michael Chen",
            username: "michaelc",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
            verified: true,
          },
          createdAt: "2023-01-01T00:30:00Z",
          media: [
            {
              type: "video",
              url: "https://example.com/newyear.mp4"
            }
          ],
          location: "New York, NY",
          likes: 289,
          comments: 31,
          shares: 12,
          privacy: "public",
          tags: ["newyear", "celebration", "family"],
        },
        {
          id: "mem4",
          title: "Hiking Adventure",
          content: "Conquered the mountain trail today! The view from the top was worth every step.",
          author: {
            id: "user4",
            name: "Emma Rodriguez",
            username: "emmar",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
            verified: false,
          },
          createdAt: "2023-09-12T16:45:00Z",
          media: [
            {
              type: "image",
              url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400"
            }
          ],
          location: "Rocky Mountains",
          likes: 178,
          comments: 19,
          shares: 5,
          privacy: "friends",
          tags: ["hiking", "outdoors", "adventure"],
        },
        {
          id: "mem5",
          title: "Birthday Surprise",
          content: "Didn't expect this amazing surprise party! Thank you to everyone who made it special.",
          author: {
            id: "user5",
            name: "David Kim",
            username: "davidk",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
            verified: true,
          },
          createdAt: "2023-11-05T20:00:00Z",
          media: [
            {
              type: "image",
              url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400"
            },
            {
              type: "image",
              url: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=400"
            }
          ],
          location: "Los Angeles, CA",
          likes: 245,
          comments: 37,
          shares: 9,
          privacy: "public",
          tags: ["birthday", "party", "friends"],
        }
      ];

      setMemories(mockMemories);
    } catch (error) {
      console.error('Error loading memories:', error);
      toast({
        title: "Error",
        description: "Failed to load memories",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort memories
  const filteredMemories = memories
    .filter((memory) => {
      const matchesSearch =
        memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        memory.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        memory.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "popular":
          const popularityA = a.likes + a.comments + a.shares;
          const popularityB = b.likes + b.comments + b.shares;
          return popularityB - popularityA;
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const handleCreateMemory = async () => {
    if (!memoryForm.title || !memoryForm.content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      // In a real implementation, this would call the API
      // const response = await apiClient.createMemory(memoryForm);
      
      const newMemory: Memory = {
        id: `memory-${Date.now()}`,
        title: memoryForm.title,
        content: memoryForm.content,
        author: {
          id: "current-user",
          name: "You",
          username: "you",
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
          verified: true,
        },
        createdAt: new Date().toISOString(),
        location: memoryForm.location,
        likes: 0,
        comments: 0,
        shares: 0,
        privacy: memoryForm.privacy,
        tags: memoryForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      };

      setMemories(prev => [newMemory, ...prev]);
      setMemoryForm({
        title: "",
        content: "",
        location: "",
        privacy: "public",
        tags: "",
      });
      setShowCreateDialog(false);

      toast({
        title: "Memory Created",
        description: "Your memory has been created successfully!",
      });
    } catch (error) {
      console.error('Error creating memory:', error);
      toast({
        title: "Error",
        description: "Failed to create memory",
        variant: "destructive",
      });
    }
  };

  const handleLikeMemory = async (memoryId: string) => {
    try {
      // In a real implementation, this would call the API
      // await apiClient.likeMemory(memoryId);
      
      setMemories(prev => prev.map(memory => 
        memory.id === memoryId 
          ? { 
              ...memory, 
              likes: memory.isLiked ? memory.likes - 1 : memory.likes + 1,
              isLiked: !memory.isLiked
            } 
          : memory
      ));

      toast({
        title: "Success",
        description: "Memory updated!",
      });
    } catch (error) {
      console.error('Error liking memory:', error);
      toast({
        title: "Error",
        description: "Failed to like memory",
        variant: "destructive",
      });
    }
  };

  const getPrivacyIcon = (privacy: string) => {
    switch (privacy) {
      case "public":
        return <Globe className="w-4 h-4" />;
      case "friends":
        return <Users className="w-4 h-4" />;
      case "private":
        return <Lock className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderMemoryCard = (memory: Memory) => {
    return (
      <Card key={memory.id} className="hover:shadow-lg transition-all duration-200 group overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12 border-2 border-gray-100">
              <AvatarImage src={memory.author.avatar} alt={memory.author.name} />
              <AvatarFallback className="text-lg font-bold">
                {memory.author.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg truncate">{memory.author.name}</h3>
                {memory.author.verified && (
                  <svg className="h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"/>
                  </svg>
                )}
                <span className="text-muted-foreground text-sm">@{memory.author.username}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(memory.createdAt)}</span>
                {memory.location && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{memory.location}</span>
                    </div>
                  </>
                )}
                <span>•</span>
                <div className="flex items-center gap-1">
                  {getPrivacyIcon(memory.privacy)}
                  <span className="capitalize">{memory.privacy}</span>
                </div>
              </div>
            </div>

            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="mb-4">
            <h4 className="font-bold text-xl mb-2">{memory.title}</h4>
            <p className="text-muted-foreground">{memory.content}</p>
          </div>

          {/* Media */}
          {memory.media && memory.media.length > 0 && (
            <div className={`grid gap-2 mb-4 ${memory.media.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {memory.media.map((media, index) => (
                <div key={index} className="relative rounded-lg overflow-hidden">
                  {media.type === 'image' ? (
                    <img 
                      src={media.url} 
                      alt={`Memory media ${index + 1}`} 
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <Video className="w-12 h-12 text-gray-500" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Tags */}
          {memory.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {memory.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Engagement stats */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex items-center gap-2 ${memory.isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
                onClick={() => handleLikeMemory(memory.id)}
              >
                <Heart className={`w-4 h-4 ${memory.isLiked ? 'fill-current' : ''}`} />
                <span>{formatNumber(memory.likes)}</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground">
                <MessageCircle className="w-4 h-4" />
                <span>{formatNumber(memory.comments)}</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground">
                <Share2 className="w-4 h-4" />
                <span>{formatNumber(memory.shares)}</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
                <h1 className="text-3xl font-bold">Memories</h1>
                <p className="text-muted-foreground">
                  Cherish and share your special moments
                </p>
              </div>
            </div>

            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create Memory
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Memory</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="memoryTitle">Title *</Label>
                    <Input
                      id="memoryTitle"
                      value={memoryForm.title}
                      onChange={(e) =>
                        setMemoryForm((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="Enter memory title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="memoryContent">Content *</Label>
                    <Textarea
                      id="memoryContent"
                      value={memoryForm.content}
                      onChange={(e) =>
                        setMemoryForm((prev) => ({
                          ...prev,
                          content: e.target.value,
                        }))
                      }
                      placeholder="Describe your memory"
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="memoryLocation">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="memoryLocation"
                        value={memoryForm.location}
                        onChange={(e) =>
                          setMemoryForm((prev) => ({
                            ...prev,
                            location: e.target.value,
                          }))
                        }
                        placeholder="Add location"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="memoryTags">Tags</Label>
                    <Input
                      id="memoryTags"
                      value={memoryForm.tags}
                      onChange={(e) =>
                        setMemoryForm((prev) => ({
                          ...prev,
                          tags: e.target.value,
                        }))
                      }
                      placeholder="Add tags separated by commas"
                    />
                  </div>

                  <div>
                    <Label htmlFor="memoryPrivacy">Privacy</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <Button
                        variant={memoryForm.privacy === "public" ? "default" : "outline"}
                        onClick={() => setMemoryForm(prev => ({ ...prev, privacy: "public" }))}
                        className="flex flex-col items-center gap-1 h-auto py-3"
                      >
                        <Globe className="w-5 h-5" />
                        <span className="text-xs">Public</span>
                      </Button>
                      <Button
                        variant={memoryForm.privacy === "friends" ? "default" : "outline"}
                        onClick={() => setMemoryForm(prev => ({ ...prev, privacy: "friends" }))}
                        className="flex flex-col items-center gap-1 h-auto py-3"
                      >
                        <Users className="w-5 h-5" />
                        <span className="text-xs">Friends</span>
                      </Button>
                      <Button
                        variant={memoryForm.privacy === "private" ? "default" : "outline"}
                        onClick={() => setMemoryForm(prev => ({ ...prev, privacy: "private" }))}
                        className="flex flex-col items-center gap-1 h-auto py-3"
                      >
                        <Lock className="w-5 h-5" />
                        <span className="text-xs">Private</span>
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleCreateMemory} className="flex-1">
                      Create Memory
                    </Button>
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

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search memories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="title">Title A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {searchQuery && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Found {filteredMemories.length} memories matching "{searchQuery}"
                </span>
                <Badge variant="secondary">
                  {filteredMemories.length} results
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Page Tabs */}
        {!loading && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                All Memories
              </TabsTrigger>
              <TabsTrigger value="photos" className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Photos
              </TabsTrigger>
              <TabsTrigger value="videos" className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                Videos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              {filteredMemories.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {filteredMemories.map((memory) => renderMemoryCard(memory))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No memories found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search criteria or create a new memory
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Memory
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="photos" className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMemories
                  .filter(memory => memory.media?.some(media => media.type === 'image'))
                  .map((memory) => (
                    <Card key={memory.id} className="overflow-hidden">
                      <img 
                        src={memory.media?.find(media => media.type === 'image')?.url || ''} 
                        alt={memory.title} 
                        className="w-full h-48 object-cover"
                      />
                      <CardContent className="p-4">
                        <h4 className="font-semibold truncate">{memory.title}</h4>
                        <p className="text-sm text-muted-foreground truncate">{memory.content}</p>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="videos" className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMemories
                  .filter(memory => memory.media?.some(media => media.type === 'video'))
                  .map((memory) => (
                    <Card key={memory.id} className="overflow-hidden">
                      <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <Video className="w-12 h-12 text-gray-500" />
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-semibold truncate">{memory.title}</h4>
                        <p className="text-sm text-muted-foreground truncate">{memory.content}</p>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Memories;