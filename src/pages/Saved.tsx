// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatNumber } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";
import { apiClient } from "@/lib/api";

interface SelectTrigger extends React.ReactHTMLAttributes<HTMLDivElement> {}
interface SelectValue extends React.ReactHTMLAttributes<HTMLDivElement> {}
interface SelectContent extends React.ReactHTMLAttributes<HTMLDivElement> {}
interface SelectItem extends React.ReactHTMLAttributes<HTMLDivElement> {
  value?: string;
}

const Select: React.FC<any> = ({ children, value, onValueChange }) => (
  <div>{children}</div>
);
const SelectTrigger: React.FC<SelectTrigger> = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);
const SelectValue: React.FC<SelectValue> = ({ placeholder }) => <span>{placeholder}</span>;
const SelectContent: React.FC<SelectContent> = ({ children }) => (
  <div>{children}</div>
);
const SelectItem: React.FC<SelectItem & { children?: React.ReactNode }> = ({
  children,
  value,
}) => <div>{children}</div>;
import {
  Bookmark,
  Search,
  Heart,
  MessageCircle,
  Share2,
  Filter,
  SortAsc,
  ArrowLeft,
  MoreHorizontal,
  Image as ImageIcon,
  Video,
  ShoppingBag,
  Users,
  Briefcase,
  Coins,
  Loader2,
  Tag,
  Calendar,
  TrendingUp,
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

interface SavedItem {
  id: string;
  type: 'post' | 'product' | 'service' | 'crypto' | 'user' | 'group';
  title: string;
  content?: string;
  author?: {
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
  likes?: number;
  comments?: number;
  shares?: number;
  price?: number;
  currency?: string;
  category?: string;
  tags?: string[];
  isLiked?: boolean;
  isBookmarked?: boolean;
}

const Saved = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from the API
      // const response = await apiClient.getSavedItems();
      
      // For now, we'll use the existing mock data but structure it properly
      const mockSavedItems: SavedItem[] = [
        {
          id: "post1",
          type: "post",
          title: "Beautiful sunset at the beach",
          content: "The colors were absolutely stunning today. Nature never fails to amaze me!",
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
          likes: 124,
          comments: 23,
          shares: 8,
          tags: ["sunset", "beach", "nature"],
          isLiked: true,
        },
        {
          id: "product1",
          type: "product",
          title: "Wireless Noise Cancelling Headphones",
          content: "Premium sound quality with 30-hour battery life",
          price: 299.99,
          currency: "USD",
          category: "Electronics",
          createdAt: "2023-07-10T09:15:00Z",
          media: [
            {
              type: "image",
              url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"
            }
          ],
          tags: ["electronics", "audio", "headphones"],
        },
        {
          id: "service1",
          type: "service",
          title: "Professional Web Design Services",
          content: "Custom websites designed to grow your business",
          price: 1500,
          currency: "USD",
          category: "Freelance",
          createdAt: "2023-07-05T16:45:00Z",
          author: {
            id: "user2",
            name: "Sarah Williams",
            username: "sarahw",
            avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100",
            verified: false,
          },
          tags: ["webdesign", "freelance", "development"],
        },
        {
          id: "crypto1",
          type: "crypto",
          title: "Bitcoin Investment Analysis",
          content: "Comprehensive analysis of BTC market trends",
          price: 35000,
          currency: "USD",
          category: "Cryptocurrency",
          createdAt: "2023-07-01T12:30:00Z",
          tags: ["bitcoin", "crypto", "investment"],
        },
        {
          id: "user1",
          type: "user",
          title: "Michael Chen",
          content: "Verified Premium User • Software Engineer",
          author: {
            id: "user3",
            name: "Michael Chen",
            username: "michaelc",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
            verified: true,
          },
          createdAt: "2023-06-28T08:20:00Z",
          tags: ["developer", "engineer", "tech"],
        },
        {
          id: "group1",
          type: "group",
          title: "Photography Enthusiasts",
          content: "12.5K members • Share your best shots and get feedback",
          media: [
            {
              type: "image",
              url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400"
            }
          ],
          createdAt: "2023-06-25T14:15:00Z",
          tags: ["photography", "art", "community"],
        }
      ];

      setSavedItems(mockSavedItems);
    } catch (error) {
      console.error('Error loading saved items:', error);
      toast({
        title: "Error",
        description: "Failed to load saved items",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort saved items
  const filteredItems = savedItems
    .filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.content && item.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
      return matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "popular":
          const popularityA = (a.likes || 0) + (a.comments || 0) + (a.shares || 0);
          const popularityB = (b.likes || 0) + (b.comments || 0) + (b.shares || 0);
          return popularityB - popularityA;
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "post":
        return <MessageCircle className="w-4 h-4" />;
      case "product":
        return <ShoppingBag className="w-4 h-4" />;
      case "service":
        return <Briefcase className="w-4 h-4" />;
      case "crypto":
        return <Coins className="w-4 h-4" />;
      case "user":
        return <Users className="w-4 h-4" />;
      case "group":
        return <Users className="w-4 h-4" />;
      default:
        return <Bookmark className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "post":
        return "Post";
      case "product":
        return "Product";
      case "service":
        return "Service";
      case "crypto":
        return "Crypto";
      case "user":
        return "User";
      case "group":
        return "Group";
      default:
        return "Item";
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

  const renderSavedItem = (item: SavedItem) => {
    return (
      <Card key={item.id} className="hover:shadow-lg transition-all duration-200 group overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-4">
            {item.author ? (
              <Avatar className="h-12 w-12 border-2 border-gray-100">
                <AvatarImage src={item.author.avatar} alt={item.author.name} />
                <AvatarFallback className="text-lg font-bold">
                  {item.author.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ) : item.media && item.media.length > 0 ? (
              <div className="h-12 w-12 rounded-lg overflow-hidden">
                <img 
                  src={item.media[0].url} 
                  alt={item.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                {getTypeIcon(item.type)}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg truncate">{item.title}</h3>
                {item.author?.verified && (
                  <svg className="h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"/>
                  </svg>
                )}
                {item.author && (
                  <span className="text-muted-foreground text-sm">@{item.author.username}</span>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <div className="flex items-center gap-1">
                  {getTypeIcon(item.type)}
                  <span>{getTypeLabel(item.type)}</span>
                </div>
                <span>•</span>
                <Calendar className="w-4 h-4" />
                <span>{formatDate(item.createdAt)}</span>
              </div>

              {item.content && (
                <p className="text-muted-foreground line-clamp-2">{item.content}</p>
              )}

              {item.price !== undefined && (
                <div className="mt-2">
                  <span className="font-bold text-lg">
                    {formatCurrency(item.price)}
                  </span>
                </div>
              )}

              {item.category && (
                <Badge variant="outline" className="mt-2">
                  {item.category}
                </Badge>
              )}
            </div>

            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Media */}
          {item.media && item.media.length > 0 && (
            <div className="mb-4">
              {item.media[0].type === 'image' ? (
                <img 
                  src={item.media[0].url} 
                  alt={item.title} 
                  className="w-full h-48 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <Video className="w-12 h-12 text-gray-500" />
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {item.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Engagement stats for posts */}
          {item.type === "post" && (
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`flex items-center gap-2 ${item.isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
                >
                  <Heart className={`w-4 h-4 ${item.isLiked ? 'fill-current' : ''}`} />
                  <span>{formatNumber(item.likes || 0)}</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground">
                  <MessageCircle className="w-4 h-4" />
                  <span>{formatNumber(item.comments || 0)}</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground">
                  <Share2 className="w-4 h-4" />
                  <span>{formatNumber(item.shares || 0)}</span>
                </Button>
              </div>
              
              <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground">
                <Bookmark className="w-4 h-4 fill-current" />
                Saved
              </Button>
            </div>
          )}

          {/* Action buttons for other types */}
          {item.type !== "post" && (
            <div className="flex gap-2">
              <Button className="flex-1" size="sm">
                View Details
              </Button>
              <Button variant="outline" size="sm">
                <Bookmark className="w-4 h-4 fill-current" />
              </Button>
            </div>
          )}
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
                <h1 className="text-3xl font-bold">Saved Items</h1>
                <p className="text-muted-foreground">
                  Your bookmarked posts, products, services, and more
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search saved items..."
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
                  Found {filteredItems.length} items matching "{searchQuery}"
                </span>
                <Badge variant="secondary">
                  {filteredItems.length} results
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
            <TabsList className="grid w-full grid-cols-6 mb-6">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Bookmark className="w-4 h-4" />
                All
              </TabsTrigger>
              <TabsTrigger value="posts" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Posts
              </TabsTrigger>
              <TabsTrigger value="products" className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                Products
              </TabsTrigger>
              <TabsTrigger value="services" className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Services
              </TabsTrigger>
              <TabsTrigger value="crypto" className="flex items-center gap-2">
                <Coins className="w-4 h-4" />
                Crypto
              </TabsTrigger>
              <TabsTrigger value="people" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                People
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              {filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {filteredItems.map((item) => renderSavedItem(item))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Bookmark className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No saved items found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search criteria or save some items
                  </p>
                  <Button onClick={() => navigate("/app/feed")}>
                    Browse Content
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="posts" className="space-y-6">
              {filteredItems.filter(item => item.type === "post").length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {filteredItems
                    .filter(item => item.type === "post")
                    .map((item) => renderSavedItem(item))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No saved posts</h3>
                  <p className="text-muted-foreground mb-4">
                    Save posts from your feed to see them here
                  </p>
                  <Button onClick={() => navigate("/app/feed")}>
                    Browse Posts
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="products" className="space-y-6">
              {filteredItems.filter(item => item.type === "product").length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {filteredItems
                    .filter(item => item.type === "product")
                    .map((item) => renderSavedItem(item))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No saved products</h3>
                  <p className="text-muted-foreground mb-4">
                    Save products from the marketplace to see them here
                  </p>
                  <Button onClick={() => navigate("/app/marketplace")}>
                    Browse Products
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="services" className="space-y-6">
              {filteredItems.filter(item => item.type === "service").length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {filteredItems
                    .filter(item => item.type === "service")
                    .map((item) => renderSavedItem(item))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Briefcase className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No saved services</h3>
                  <p className="text-muted-foreground mb-4">
                    Save services from the freelance platform to see them here
                  </p>
                  <Button onClick={() => navigate("/app/freelance")}>
                    Browse Services
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="crypto" className="space-y-6">
              {filteredItems.filter(item => item.type === "crypto").length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {filteredItems
                    .filter(item => item.type === "crypto")
                    .map((item) => renderSavedItem(item))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Coins className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No saved crypto items</h3>
                  <p className="text-muted-foreground mb-4">
                    Save cryptocurrency information to see them here
                  </p>
                  <Button onClick={() => navigate("/app/crypto")}>
                    Browse Crypto
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="people" className="space-y-6">
              {filteredItems.filter(item => item.type === "user" || item.type === "group").length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {filteredItems
                    .filter(item => item.type === "user" || item.type === "group")
                    .map((item) => renderSavedItem(item))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No saved people or groups</h3>
                  <p className="text-muted-foreground mb-4">
                    Save user profiles or groups to see them here
                  </p>
                  <Button onClick={() => navigate("/app/explore")}>
                    Browse People
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Saved;import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatNumber } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import {
  Bookmark,
  Search,
  Heart,
  MessageCircle,
  Share2,
  Filter,
  SortAsc,
  ArrowLeft,
  MoreHorizontal,
  Image as ImageIcon,
  Video,
  ShoppingBag,
  Users,
  Briefcase,
  Coins,
  Loader2,
  Tag,
  Calendar,
  TrendingUp,
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

interface SavedItem {
  id: string;
  type: 'post' | 'product' | 'service' | 'crypto' | 'user' | 'group';
  title: string;
  content?: string;
  author?: {
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
  likes?: number;
  comments?: number;
  shares?: number;
  price?: number;
  currency?: string;
  category?: string;
  tags?: string[];
  isLiked?: boolean;
  isBookmarked?: boolean;
}

const Saved = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from the API
      // const response = await apiClient.getSavedItems();
      
      // For now, we'll use the existing mock data but structure it properly
      const mockSavedItems: SavedItem[] = [
        {
          id: "post1",
          type: "post",
          title: "Beautiful sunset at the beach",
          content: "The colors were absolutely stunning today. Nature never fails to amaze me!",
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
          likes: 124,
          comments: 23,
          shares: 8,
          tags: ["sunset", "beach", "nature"],
          isLiked: true,
        },
        {
          id: "product1",
          type: "product",
          title: "Wireless Noise Cancelling Headphones",
          content: "Premium sound quality with 30-hour battery life",
          price: 299.99,
          currency: "USD",
          category: "Electronics",
          createdAt: "2023-07-10T09:15:00Z",
          media: [
            {
              type: "image",
              url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"
            }
          ],
          tags: ["electronics", "audio", "headphones"],
        },
        {
          id: "service1",
          type: "service",
          title: "Professional Web Design Services",
          content: "Custom websites designed to grow your business",
          price: 1500,
          currency: "USD",
          category: "Freelance",
          createdAt: "2023-07-05T16:45:00Z",
          author: {
            id: "user2",
            name: "Sarah Williams",
            username: "sarahw",
            avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100",
            verified: false,
          },
          tags: ["webdesign", "freelance", "development"],
        },
        {
          id: "crypto1",
          type: "crypto",
          title: "Bitcoin Investment Analysis",
          content: "Comprehensive analysis of BTC market trends",
          price: 35000,
          currency: "USD",
          category: "Cryptocurrency",
          createdAt: "2023-07-01T12:30:00Z",
          tags: ["bitcoin", "crypto", "investment"],
        },
        {
          id: "user1",
          type: "user",
          title: "Michael Chen",
          content: "Verified Premium User • Software Engineer",
          author: {
            id: "user3",
            name: "Michael Chen",
            username: "michaelc",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
            verified: true,
          },
          createdAt: "2023-06-28T08:20:00Z",
          tags: ["developer", "engineer", "tech"],
        },
        {
          id: "group1",
          type: "group",
          title: "Photography Enthusiasts",
          content: "12.5K members • Share your best shots and get feedback",
          media: [
            {
              type: "image",
              url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400"
            }
          ],
          createdAt: "2023-06-25T14:15:00Z",
          tags: ["photography", "art", "community"],
        }
      ];

      setSavedItems(mockSavedItems);
    } catch (error) {
      console.error('Error loading saved items:', error);
      toast({
        title: "Error",
        description: "Failed to load saved items",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort saved items
  const filteredItems = savedItems
    .filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.content && item.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
      return matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "popular":
          const popularityA = (a.likes || 0) + (a.comments || 0) + (a.shares || 0);
          const popularityB = (b.likes || 0) + (b.comments || 0) + (b.shares || 0);
          return popularityB - popularityA;
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "post":
        return <MessageCircle className="w-4 h-4" />;
      case "product":
        return <ShoppingBag className="w-4 h-4" />;
      case "service":
        return <Briefcase className="w-4 h-4" />;
      case "crypto":
        return <Coins className="w-4 h-4" />;
      case "user":
        return <Users className="w-4 h-4" />;
      case "group":
        return <Users className="w-4 h-4" />;
      default:
        return <Bookmark className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "post":
        return "Post";
      case "product":
        return "Product";
      case "service":
        return "Service";
      case "crypto":
        return "Crypto";
      case "user":
        return "User";
      case "group":
        return "Group";
      default:
        return "Item";
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

  const renderSavedItem = (item: SavedItem) => {
    return (
      <Card key={item.id} className="hover:shadow-lg transition-all duration-200 group overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-4">
            {item.author ? (
              <Avatar className="h-12 w-12 border-2 border-gray-100">
                <AvatarImage src={item.author.avatar} alt={item.author.name} />
                <AvatarFallback className="text-lg font-bold">
                  {item.author.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ) : item.media && item.media.length > 0 ? (
              <div className="h-12 w-12 rounded-lg overflow-hidden">
                <img 
                  src={item.media[0].url} 
                  alt={item.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                {getTypeIcon(item.type)}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg truncate">{item.title}</h3>
                {item.author?.verified && (
                  <svg className="h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"/>
                  </svg>
                )}
                {item.author && (
                  <span className="text-muted-foreground text-sm">@{item.author.username}</span>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <div className="flex items-center gap-1">
                  {getTypeIcon(item.type)}
                  <span>{getTypeLabel(item.type)}</span>
                </div>
                <span>•</span>
                <Calendar className="w-4 h-4" />
                <span>{formatDate(item.createdAt)}</span>
              </div>

              {item.content && (
                <p className="text-muted-foreground line-clamp-2">{item.content}</p>
              )}

              {item.price !== undefined && (
                <div className="mt-2">
                  <span className="font-bold text-lg">
                    {formatCurrency(item.price)}
                  </span>
                </div>
              )}

              {item.category && (
                <Badge variant="outline" className="mt-2">
                  {item.category}
                </Badge>
              )}
            </div>

            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Media */}
          {item.media && item.media.length > 0 && (
            <div className="mb-4">
              {item.media[0].type === 'image' ? (
                <img 
                  src={item.media[0].url} 
                  alt={item.title} 
                  className="w-full h-48 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <Video className="w-12 h-12 text-gray-500" />
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {item.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Engagement stats for posts */}
          {item.type === "post" && (
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`flex items-center gap-2 ${item.isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
                >
                  <Heart className={`w-4 h-4 ${item.isLiked ? 'fill-current' : ''}`} />
                  <span>{formatNumber(item.likes || 0)}</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground">
                  <MessageCircle className="w-4 h-4" />
                  <span>{formatNumber(item.comments || 0)}</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground">
                  <Share2 className="w-4 h-4" />
                  <span>{formatNumber(item.shares || 0)}</span>
                </Button>
              </div>
              
              <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground">
                <Bookmark className="w-4 h-4 fill-current" />
                Saved
              </Button>
            </div>
          )}

          {/* Action buttons for other types */}
          {item.type !== "post" && (
            <div className="flex gap-2">
              <Button className="flex-1" size="sm">
                View Details
              </Button>
              <Button variant="outline" size="sm">
                <Bookmark className="w-4 h-4 fill-current" />
              </Button>
            </div>
          )}
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
                <h1 className="text-3xl font-bold">Saved Items</h1>
                <p className="text-muted-foreground">
                  Your bookmarked posts, products, services, and more
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search saved items..."
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
                  Found {filteredItems.length} items matching "{searchQuery}"
                </span>
                <Badge variant="secondary">
                  {filteredItems.length} results
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
            <TabsList className="grid w-full grid-cols-6 mb-6">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Bookmark className="w-4 h-4" />
                All
              </TabsTrigger>
              <TabsTrigger value="posts" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Posts
              </TabsTrigger>
              <TabsTrigger value="products" className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                Products
              </TabsTrigger>
              <TabsTrigger value="services" className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Services
              </TabsTrigger>
              <TabsTrigger value="crypto" className="flex items-center gap-2">
                <Coins className="w-4 h-4" />
                Crypto
              </TabsTrigger>
              <TabsTrigger value="people" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                People
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              {filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {filteredItems.map((item) => renderSavedItem(item))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Bookmark className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No saved items found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search criteria or save some items
                  </p>
                  <Button onClick={() => navigate("/app/feed")}>
                    Browse Content
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="posts" className="space-y-6">
              {filteredItems.filter(item => item.type === "post").length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {filteredItems
                    .filter(item => item.type === "post")
                    .map((item) => renderSavedItem(item))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No saved posts</h3>
                  <p className="text-muted-foreground mb-4">
                    Save posts from your feed to see them here
                  </p>
                  <Button onClick={() => navigate("/app/feed")}>
                    Browse Posts
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="products" className="space-y-6">
              {filteredItems.filter(item => item.type === "product").length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {filteredItems
                    .filter(item => item.type === "product")
                    .map((item) => renderSavedItem(item))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No saved products</h3>
                  <p className="text-muted-foreground mb-4">
                    Save products from the marketplace to see them here
                  </p>
                  <Button onClick={() => navigate("/app/marketplace")}>
                    Browse Products
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="services" className="space-y-6">
              {filteredItems.filter(item => item.type === "service").length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {filteredItems
                    .filter(item => item.type === "service")
                    .map((item) => renderSavedItem(item))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Briefcase className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No saved services</h3>
                  <p className="text-muted-foreground mb-4">
                    Save services from the freelance platform to see them here
                  </p>
                  <Button onClick={() => navigate("/app/freelance")}>
                    Browse Services
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="crypto" className="space-y-6">
              {filteredItems.filter(item => item.type === "crypto").length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {filteredItems
                    .filter(item => item.type === "crypto")
                    .map((item) => renderSavedItem(item))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Coins className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No saved crypto items</h3>
                  <p className="text-muted-foreground mb-4">
                    Save cryptocurrency information to see them here
                  </p>
                  <Button onClick={() => navigate("/app/crypto")}>
                    Browse Crypto
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="people" className="space-y-6">
              {filteredItems.filter(item => item.type === "user" || item.type === "group").length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {filteredItems
                    .filter(item => item.type === "user" || item.type === "group")
                    .map((item) => renderSavedItem(item))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No saved people or groups</h3>
                  <p className="text-muted-foreground mb-4">
                    Save user profiles or groups to see them here
                  </p>
                  <Button onClick={() => navigate("/app/explore")}>
                    Browse People
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Saved;
