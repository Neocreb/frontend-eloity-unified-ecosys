import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Megaphone,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Star,
  Crown,
  Flame,
  ExternalLink,
  Info,
  Flag,
  ThumbsDown,
  ShoppingCart,
  Play,
  User,
  MapPin,
  Clock,
  TrendingUp,
  Target,
  Zap,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface SponsoredItem {
  id: string;
  type: "product" | "service" | "job" | "video" | "post" | "profile";
  title: string;
  description: string;
  image: string;
  author: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  campaign: {
    id: string;
    boostType: "basic" | "featured" | "premium" | "homepage";
    goal: string;
    targetAudience: string[];
  };
  metrics: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    clicks: number;
    conversions?: number;
  };
  pricing?: {
    price: number;
    currency: string;
    originalPrice?: number;
    discount?: number;
  };
  location?: string;
  category: string;
  tags: string[];
  createdAt: string;
  url: string;
  isPromoted: boolean;
  promotedUntil: string;
}

interface SponsoredContentProps {
  variant: "feed" | "sidebar" | "banner" | "grid" | "list";
  placement: "home" | "marketplace" | "freelance" | "social" | "videos";
  maxItems?: number;
  showAnalytics?: boolean;
  className?: string;
}

// Mock sponsored content data
const mockSponsoredContent: SponsoredItem[] = [
  {
    id: "sp1",
    type: "product",
    title: "Premium Wireless Headphones - 50% Off!",
    description: "Professional grade wireless headphones with noise cancellation. Perfect for work and entertainment.",
    image: "/placeholder.svg",
    author: {
      name: "TechStore Pro",
      avatar: "/placeholder.svg",
      verified: true,
    },
    campaign: {
      id: "camp1",
      boostType: "featured",
      goal: "Increase Sales",
      targetAudience: ["technology", "music", "freelancers"],
    },
    metrics: {
      views: 15420,
      likes: 892,
      comments: 134,
      shares: 67,
      clicks: 2340,
      conversions: 156,
    },
    pricing: {
      price: 79.99,
      currency: "USD",
      originalPrice: 159.99,
      discount: 50,
    },
    location: "Nigeria",
    category: "Electronics",
    tags: ["headphones", "wireless", "tech", "sale"],
    createdAt: "2024-01-20T10:00:00Z",
    url: "/marketplace/premium-headphones",
    isPromoted: true,
    promotedUntil: "2024-01-27T10:00:00Z",
  },
  {
    id: "sp2",
    type: "service",
    title: "Professional Logo Design - Get Noticed!",
    description: "Stand out with a professional logo that represents your brand. Quick turnaround, unlimited revisions.",
    image: "/placeholder.svg",
    author: {
      name: "Sarah Design Studio",
      avatar: "/placeholder.svg",
      verified: true,
    },
    campaign: {
      id: "camp2",
      boostType: "premium",
      goal: "Get Applications",
      targetAudience: ["business", "startups", "entrepreneurs"],
    },
    metrics: {
      views: 8750,
      likes: 234,
      comments: 45,
      shares: 23,
      clicks: 567,
      conversions: 34,
    },
    pricing: {
      price: 150,
      currency: "USD",
    },
    location: "Ghana",
    category: "Design",
    tags: ["logo", "design", "branding", "professional"],
    createdAt: "2024-01-19T14:30:00Z",
    url: "/freelance/logo-design-service",
    isPromoted: true,
    promotedUntil: "2024-01-26T14:30:00Z",
  },
  {
    id: "sp3",
    type: "video",
    title: "Master Crypto Trading in 2024 - Complete Guide",
    description: "Learn proven strategies from successful traders. From beginner to advanced techniques.",
    image: "/placeholder.svg",
    author: {
      name: "CryptoMaster101",
      avatar: "/placeholder.svg",
      verified: false,
    },
    campaign: {
      id: "camp3",
      boostType: "homepage",
      goal: "Get More Views",
      targetAudience: ["cryptocurrency", "trading", "finance"],
    },
    metrics: {
      views: 45600,
      likes: 2100,
      comments: 890,
      shares: 445,
      clicks: 8900,
    },
    location: "Worldwide",
    category: "Education",
    tags: ["crypto", "trading", "tutorial", "finance"],
    createdAt: "2024-01-18T09:15:00Z",
    url: "/videos/crypto-trading-guide",
    isPromoted: true,
    promotedUntil: "2024-01-25T09:15:00Z",
  },
  {
    id: "sp4",
    type: "job",
    title: "Senior React Developer - Remote Position",
    description: "Join our growing team! Work on exciting projects with modern tech stack. Competitive salary and benefits.",
    image: "/placeholder.svg",
    author: {
      name: "TechFlow Solutions",
      avatar: "/placeholder.svg",
      verified: true,
    },
    campaign: {
      id: "camp4",
      boostType: "featured",
      goal: "Get Applications",
      targetAudience: ["developers", "react", "remote work"],
    },
    metrics: {
      views: 12300,
      likes: 456,
      comments: 78,
      shares: 34,
      clicks: 890,
      conversions: 45,
    },
    location: "Remote",
    category: "Technology",
    tags: ["react", "developer", "remote", "senior"],
    createdAt: "2024-01-21T11:00:00Z",
    url: "/freelance/senior-react-developer",
    isPromoted: true,
    promotedUntil: "2024-01-28T11:00:00Z",
  },
];

const SponsoredContent: React.FC<SponsoredContentProps> = ({
  variant,
  placement,
  maxItems = 3,
  showAnalytics = false,
  className = "",
}) => {
  const { toast } = useToast();
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SponsoredItem | null>(null);

  // Filter content based on placement
  const getFilteredContent = () => {
    let filtered = mockSponsoredContent;
    
    switch (placement) {
      case "marketplace":
        filtered = filtered.filter(item => item.type === "product");
        break;
      case "freelance":
        filtered = filtered.filter(item => ["service", "job"].includes(item.type));
        break;
      case "videos":
        filtered = filtered.filter(item => item.type === "video");
        break;
      case "social":
        filtered = filtered.filter(item => ["post", "profile"].includes(item.type));
        break;
      default:
        // Home shows all types
        break;
    }

    return filtered.slice(0, maxItems);
  };

  const filteredContent = getFilteredContent();

  const getBoostIcon = (boostType: string) => {
    switch (boostType) {
      case "basic": return <Zap className="h-3 w-3" />;
      case "featured": return <Star className="h-3 w-3" />;
      case "premium": return <Crown className="h-3 w-3" />;
      case "homepage": return <Flame className="h-3 w-3" />;
      default: return <Megaphone className="h-3 w-3" />;
    }
  };

  const getBoostColor = (boostType: string) => {
    switch (boostType) {
      case "basic": return "bg-blue-500";
      case "featured": return "bg-purple-500";
      case "premium": return "bg-gold-500";
      case "homepage": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const handleItemClick = (item: SponsoredItem) => {
    // Track click for analytics
    console.log(`Clicked sponsored item: ${item.id}`);
    
    // Navigate to item
    window.open(item.url, '_blank');
  };

  const handleInteraction = (item: SponsoredItem, action: string) => {
    console.log(`Interaction: ${action} on ${item.id}`);
    
    switch (action) {
      case "like":
        toast({
          title: "Liked!",
          description: "Your feedback helps improve recommendations",
        });
        break;
      case "share":
        navigator.clipboard.writeText(window.location.origin + item.url);
        toast({
          title: "Link Copied!",
          description: "Share this with your friends",
        });
        break;
      case "hide":
        toast({
          title: "Content Hidden",
          description: "We'll show fewer ads like this",
        });
        break;
    }
  };

  const handleFeedback = (item: SponsoredItem, feedback: string) => {
    setSelectedItem(item);
    setShowFeedbackDialog(true);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatPrice = (price: number, currency: string) => {
    if (currency === "USD") return `$${price}`;
    return `${price} ${currency}`;
  };

  // Render based on variant
  if (variant === "banner" && filteredContent.length > 0) {
    const item = filteredContent[0];
    return (
      <Card className={`border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Badge className="bg-blue-600 text-white">
              <Megaphone className="h-3 w-3 mr-1" />
              Sponsored
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleFeedback(item, "irrelevant")}>
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  Not Interested
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleInteraction(item, "hide")}>
                  <Flag className="h-4 w-4 mr-2" />
                  Hide Ad
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Info className="h-4 w-4 mr-2" />
                  Why This Ad?
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => handleItemClick(item)}>
            <img 
              src={item.image}
              alt={item.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{item.title}</h3>
              <p className="text-muted-foreground text-sm">{item.description}</p>
              {item.pricing && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-bold text-green-600">
                    {formatPrice(item.pricing.price, item.pricing.currency)}
                  </span>
                  {item.pricing.originalPrice && (
                    <>
                      <span className="text-sm line-through text-muted-foreground">
                        {formatPrice(item.pricing.originalPrice, item.pricing.currency)}
                      </span>
                      <Badge className="bg-red-100 text-red-800">
                        {item.pricing.discount}% OFF
                      </Badge>
                    </>
                  )}
                </div>
              )}
            </div>
            <Button>
              <ExternalLink className="h-4 w-4 mr-2" />
              {item.type === "product" ? "Shop Now" : 
               item.type === "service" ? "Learn More" :
               item.type === "job" ? "Apply Now" : "View"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === "sidebar") {
    return (
      <div className={`space-y-3 ${className}`}>
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Sponsored
        </h3>
        {filteredContent.map((item) => (
          <Card key={item.id} className="cursor-pointer hover:shadow-md transition-all">
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                <img 
                  src={item.image}
                  alt={item.title}
                  className="w-12 h-12 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm line-clamp-2">{item.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    by {item.author.name}
                  </p>
                  {item.pricing && (
                    <div className="text-sm font-medium text-green-600 mt-1">
                      {formatPrice(item.pricing.price, item.pricing.currency)}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <Badge variant="outline" className="text-xs">
                  {getBoostIcon(item.campaign.boostType)}
                  <span className="ml-1">Sponsored</span>
                </Badge>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInteraction(item, "like");
                    }}
                  >
                    <Heart className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInteraction(item, "share");
                    }}
                  >
                    <Share2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (variant === "grid") {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
        {filteredContent.map((item) => (
          <Card key={item.id} className="cursor-pointer hover:shadow-lg transition-all">
            <div className="relative">
              <img 
                src={item.image}
                alt={item.title}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <Badge className={`absolute top-2 left-2 ${getBoostColor(item.campaign.boostType)} text-white`}>
                {getBoostIcon(item.campaign.boostType)}
                <span className="ml-1">Sponsored</span>
              </Badge>
              {item.type === "video" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center">
                    <Play className="h-6 w-6 text-white ml-1" />
                  </div>
                </div>
              )}
            </div>
            
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <img 
                    src={item.author.avatar}
                    alt={item.author.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm text-muted-foreground">{item.author.name}</span>
                  {item.author.verified && (
                    <Badge className="bg-blue-500 text-white p-1">
                      <Star className="h-2 w-2" />
                    </Badge>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleFeedback(item, "irrelevant")}>
                      <ThumbsDown className="h-4 w-4 mr-2" />
                      Not Interested
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleInteraction(item, "hide")}>
                      <Flag className="h-4 w-4 mr-2" />
                      Hide Ad
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <h3 className="font-semibold mb-2 line-clamp-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
              
              {item.pricing && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-bold text-lg text-green-600">
                    {formatPrice(item.pricing.price, item.pricing.currency)}
                  </span>
                  {item.pricing.originalPrice && (
                    <>
                      <span className="text-sm line-through text-muted-foreground">
                        {formatPrice(item.pricing.originalPrice, item.pricing.currency)}
                      </span>
                      <Badge className="bg-red-100 text-red-800">
                        {item.pricing.discount}% OFF
                      </Badge>
                    </>
                  )}
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {formatNumber(item.metrics.views)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    {formatNumber(item.metrics.likes)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    {formatNumber(item.metrics.comments)}
                  </span>
                </div>
                {item.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {item.location}
                  </span>
                )}
              </div>
              
              {showAnalytics && item.metrics.conversions && (
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    {item.metrics.clicks} clicks
                  </span>
                  <span className="flex items-center gap-1">
                    <ShoppingCart className="h-3 w-3" />
                    {item.metrics.conversions} conversions
                  </span>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="pt-0 px-4 pb-4">
              <Button 
                className="w-full" 
                onClick={() => handleItemClick(item)}
              >
                {item.type === "product" ? "Shop Now" : 
                 item.type === "service" ? "Order Now" :
                 item.type === "job" ? "Apply Now" : 
                 item.type === "video" ? "Watch Now" : "View"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  // Default feed variant
  return (
    <div className={`space-y-4 ${className}`}>
      {filteredContent.map((item) => (
        <Card key={item.id} className="cursor-pointer hover:shadow-md transition-all">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={item.author.avatar}
                  alt={item.author.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.author.name}</span>
                    {item.author.verified && (
                      <Badge className="bg-blue-500 text-white p-1">
                        <Star className="h-3 w-3" />
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <Badge className={`${getBoostColor(item.campaign.boostType)} text-white`}>
                      {getBoostIcon(item.campaign.boostType)}
                      <span className="ml-1">Sponsored</span>
                    </Badge>
                  </div>
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleFeedback(item, "irrelevant")}>
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    Not Interested
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleInteraction(item, "hide")}>
                    <Flag className="h-4 w-4 mr-2" />
                    Hide Ad
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Info className="h-4 w-4 mr-2" />
                    Why This Ad?
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          
          <CardContent onClick={() => handleItemClick(item)}>
            <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
            <p className="text-muted-foreground mb-3">{item.description}</p>
            
            {item.image && (
              <div className="relative mb-3">
                <img 
                  src={item.image}
                  alt={item.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
                {item.type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
                      <Play className="h-8 w-8 text-white ml-1" />
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {item.pricing && (
              <div className="flex items-center gap-2 mb-3">
                <span className="font-bold text-xl text-green-600">
                  {formatPrice(item.pricing.price, item.pricing.currency)}
                </span>
                {item.pricing.originalPrice && (
                  <>
                    <span className="text-lg line-through text-muted-foreground">
                      {formatPrice(item.pricing.originalPrice, item.pricing.currency)}
                    </span>
                    <Badge className="bg-red-100 text-red-800">
                      {item.pricing.discount}% OFF
                    </Badge>
                  </>
                )}
              </div>
            )}
            
            <div className="flex flex-wrap gap-1 mb-3">
              {item.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          </CardContent>
          
          <CardFooter className="pt-0">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <button 
                  className="flex items-center gap-1 hover:text-blue-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInteraction(item, "like");
                  }}
                >
                  <Heart className="h-4 w-4" />
                  {formatNumber(item.metrics.likes)}
                </button>
                <button 
                  className="flex items-center gap-1 hover:text-blue-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInteraction(item, "comment");
                  }}
                >
                  <MessageCircle className="h-4 w-4" />
                  {formatNumber(item.metrics.comments)}
                </button>
                <button 
                  className="flex items-center gap-1 hover:text-blue-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInteraction(item, "share");
                  }}
                >
                  <Share2 className="h-4 w-4" />
                  {formatNumber(item.metrics.shares)}
                </button>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {formatNumber(item.metrics.views)}
                </span>
              </div>
              
              <Button onClick={() => handleItemClick(item)}>
                {item.type === "product" ? "Shop Now" : 
                 item.type === "service" ? "Order Now" :
                 item.type === "job" ? "Apply Now" : 
                 item.type === "video" ? "Watch Now" : "View"}
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}

      {/* Feedback Dialog */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Ad Feedback</DialogTitle>
            <DialogDescription>
              Help us improve your ad experience
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-sm">Why don't you want to see this ad?</p>
            <div className="space-y-2">
              {[
                "Not relevant to me",
                "Seen this too many times",
                "Inappropriate content",
                "Misleading or false",
                "Low quality",
                "Other"
              ].map((reason) => (
                <label key={reason} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="feedback" value={reason} />
                  <span className="text-sm">{reason}</span>
                </label>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFeedbackDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast({
                title: "Feedback Received",
                description: "Thank you for helping us improve your experience",
              });
              setShowFeedbackDialog(false);
            }}>
              Submit Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SponsoredContent;
