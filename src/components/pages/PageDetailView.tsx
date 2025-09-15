import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { formatNumber } from "@/utils/formatters";
import { useToast } from "@/hooks/use-toast";
import { QuickMessageButton } from "@/components/chat/QuickMessageButton";
import {
  ArrowLeft,
  Users,
  Building,
  Verified,
  Star,
  Heart,
  MessageSquare,
  Share2,
  MoreHorizontal,
  Image as ImageIcon,
  Video,
  Calendar,
  MapPin,
  ThumbsUp,
  Send,
  Bookmark,
  Flag,
  Edit,
  Trash2,
  Camera,
  Paperclip,
  Smile,
  Search,
  Filter,
  SortDesc,
  Pin,
  Globe,
  Phone,
  Mail,
  ExternalLink,
  BarChart3,
  Settings,
  UserPlus,
  Clock,
  TrendingUp,
  Eye,
  Plus,
  Store,
  Briefcase,
} from "lucide-react";

import { pages } from "@/data/mockExploreData";
import { marketplaceSyncService, SyncProduct } from "@/services/marketplaceSyncService";
import { chatInitiationService } from "@/services/chatInitiationService";

interface Page {
  id: string;
  name: string;
  followers: number;
  category: string;
  verified: boolean;
  avatar: string;
  cover: string;
  description?: string;
  pageType: "business" | "brand" | "public_figure" | "community" | "organization";
  isFollowing?: boolean;
  isOwner?: boolean;
  ownerId?: string;
  website?: string;
  location?: string;
  email?: string;
  phone?: string;
  createdAt?: string;
  posts?: number;
  engagement?: number;
  hours?: string;
  about?: string;
}

interface Post {
  id: string;
  content: string;
  images?: string[];
  video?: string;
  timestamp: string;
  likes: number;
  comments: Comment[];
  shares: number;
  isLiked: boolean;
  isPinned?: boolean;
  isPromoted?: boolean;
  isEdited?: boolean;
}

interface Comment {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  replies?: Comment[];
}

interface Review {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  rating: number;
  content: string;
  timestamp: string;
  isVerified: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  inStock: boolean;
}

const PageDetailView = () => {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("posts");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImages, setNewPostImages] = useState<string[]>([]);
  const [newComment, setNewComment] = useState("");
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newReview, setNewReview] = useState({ rating: 5, content: "" });

  // Find the specific page based on the route parameter
  const page = pages.find(p => p.id === pageId);

  // If page not found, redirect or show error
  if (!page) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
          <p className="text-muted-foreground mb-4">The page you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/app/pages")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Pages
          </Button>
        </div>
      </div>
    );
  }

  // Extend the page data with additional properties for the detail view
  const extendedPage = {
    ...page,
    cover: page.avatar || "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
    hours: "Mon-Fri 9AM-6PM PST",
    about: page.description || `Learn more about ${page.name} and what we do.`
  };

  // Mock posts data
  const [posts, setPosts] = useState<Post[]>([
    {
      id: "1",
      content: "🚀 Exciting News! We're launching our new AI-powered analytics platform next week! This revolutionary tool will help businesses make data-driven decisions faster than ever before.\n\nKey features:\n• Real-time data processing\n��� Predictive analytics\n• Custom dashboards\n• Advanced ML algorithms\n\nStay tuned for the official launch! #AI #Analytics #Innovation",
      images: ["https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600"],
      timestamp: "2024-01-15T14:30:00Z",
      likes: 342,
      shares: 87,
      isLiked: false,
      isPinned: true,
      isPromoted: true,
      comments: [
        {
          id: "1",
          author: {
            id: "1",
            name: "Sarah Johnson",
            avatar: "https://images.unsplash.com/photo-1494790108755-2616b2bab1d3?w=100"
          },
          content: "This looks amazing! When will it be available for beta testing?",
          timestamp: "2024-01-15T15:00:00Z",
          likes: 12,
          isLiked: false
        }
      ]
    },
    {
      id: "2",
      content: "Behind the scenes at our innovation lab! Our team is working on breakthrough technologies that will shape the future of business automation. 🔬💡\n\n#Innovation #Technology #TeamWork",
      images: ["https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600"],
      timestamp: "2024-01-14T10:15:00Z",
      likes: 198,
      shares: 45,
      isLiked: true,
      comments: []
    }
  ]);

  // Mock reviews data
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: "1",
      author: {
        id: "1",
        name: "Mike Chen",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100"
      },
      rating: 5,
      content: "Excellent service and innovative solutions! TechCorp helped us modernize our entire infrastructure. Highly recommended!",
      timestamp: "2024-01-10T16:30:00Z",
      isVerified: true
    },
    {
      id: "2", 
      author: {
        id: "2",
        name: "Lisa Rodriguez",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100"
      },
      rating: 4,
      content: "Great experience working with their team. Professional, knowledgeable, and responsive to our needs.",
      timestamp: "2024-01-08T11:20:00Z",
      isVerified: false
    }
  ]);

  // Mock products data
  const products: Product[] = [
    {
      id: "1",
      name: "AI Analytics Pro",
      price: 299,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300",
      description: "Advanced AI-powered analytics platform for enterprise businesses",
      inStock: true
    },
    {
      id: "2",
      name: "Cloud Infrastructure Suite",
      price: 499,
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300", 
      description: "Complete cloud infrastructure management solution",
      inStock: true
    }
  ];

  const getPageTypeIcon = (type: string) => {
    switch (type) {
      case "business": return Building;
      case "brand": return Star;
      case "public_figure": return Users;
      case "community": return Heart;
      case "organization": return Briefcase;
      default: return Building;
    }
  };

  const PageTypeIcon = getPageTypeIcon(extendedPage.pageType);

  const handleCreatePost = () => {
    if (!newPostContent.trim()) {
      toast({
        title: "Error",
        description: "Please write something to post",
        variant: "destructive"
      });
      return;
    }

    const newPost: Post = {
      id: Date.now().toString(),
      content: newPostContent,
      images: newPostImages,
      timestamp: new Date().toISOString(),
      likes: 0,
      shares: 0,
      isLiked: false,
      comments: []
    };

    setPosts(prev => [newPost, ...prev]);
    setNewPostContent("");
    setNewPostImages([]);
    setShowCreatePost(false);

    toast({
      title: "Post Created",
      description: "Your post has been published!"
    });
  };

  const handleLikePost = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            isLiked: !post.isLiked 
          }
        : post
    ));
  };

  const handleAddComment = (postId: string) => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: {
        id: "current",
        name: "You",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
      },
      content: newComment,
      timestamp: new Date().toISOString(),
      likes: 0,
      isLiked: false
    };

    setPosts(prev => prev.map(post =>
      post.id === postId
        ? { ...post, comments: [...post.comments, comment] }
        : post
    ));

    setNewComment("");
  };

  const handleAddReview = () => {
    if (!newReview.content.trim()) {
      toast({
        title: "Error",
        description: "Please write a review",
        variant: "destructive"
      });
      return;
    }

    const review: Review = {
      id: Date.now().toString(),
      author: {
        id: "current",
        name: "You",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
      },
      rating: newReview.rating,
      content: newReview.content,
      timestamp: new Date().toISOString(),
      isVerified: false
    };

    setReviews(prev => [review, ...prev]);
    setNewReview({ rating: 5, content: "" });
    setShowReviewModal(false);

    toast({
      title: "Review Added",
      description: "Thank you for your review!"
    });
  };

  const handleFollowPage = () => {
    extendedPage.isFollowing = !extendedPage.isFollowing;
    extendedPage.followers += extendedPage.isFollowing ? 1 : -1;

    toast({
      title: extendedPage.isFollowing ? "Following Page" : "Unfollowed Page",
      description: extendedPage.isFollowing
        ? `You're now following ${extendedPage.name}!`
        : `You've unfollowed ${extendedPage.name}`
    });
  };

  const handleManagePage = () => {
    if (!extendedPage.isOwner) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to manage this page",
        variant: "destructive"
      });
      return;
    }

    // Navigate to page management interface
    navigate(`/app/pages/${pageId}/manage`);

    toast({
      title: "Page Management",
      description: "Opening page management interface..."
    });
  };



  const handleAddProduct = async (productData: any) => {
    try {
      // Add product to page
      const newProduct: Product = {
        id: Date.now().toString(),
        name: productData.name,
        price: productData.price,
        image: productData.image || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300",
        description: productData.description,
        inStock: true
      };

      // Sync with main marketplace
      await marketplaceSyncService.syncPageProduct(
        extendedPage.id,
        extendedPage.name,
        {
          name: productData.name,
          price: productData.price,
          image: productData.image,
          description: productData.description,
          category: productData.category || extendedPage.category,
          tags: [extendedPage.category.toLowerCase(), 'page-product'],
          seller: {
            id: extendedPage.id,
            name: extendedPage.name,
            avatar: extendedPage.avatar,
            verified: extendedPage.verified
          },
          shippingInfo: productData.shippingInfo || {
            freeShipping: false,
            estimatedDays: 5,
            cost: 9.99
          }
        }
      );

      toast({
        title: "Product Added",
        description: "Product added and synced with marketplace!"
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive"
      });
    }
  };

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  const renderPost = (post: Post) => (
    <Card key={post.id} className="w-full">
      <CardContent className="p-4">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={extendedPage.avatar} alt={extendedPage.name} />
              <AvatarFallback>{extendedPage.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm">{extendedPage.name}</h4>
                {extendedPage.verified && (
                  <Verified className="w-4 h-4 text-blue-500" fill="currentColor" />
                )}
                {post.isPinned && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <Pin className="w-3 h-3 mr-1" />
                    Pinned
                  </Badge>
                )}
                {post.isPromoted && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Promoted
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(post.timestamp).toLocaleDateString()} at {new Date(post.timestamp).toLocaleTimeString()}
                {post.isEdited && " (edited)"}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {/* Post Content */}
        <div className="mb-3">
          <p className="text-sm whitespace-pre-wrap mb-3">{post.content}</p>
          
          {/* Post Images */}
          {post.images && post.images.length > 0 && (
            <div className="grid gap-2 mb-3">
              {post.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt="Post content"
                  className="rounded-lg max-h-96 w-full object-cover"
                />
              ))}
            </div>
          )}
        </div>

        {/* Post Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-b py-2 mb-3">
          <div className="flex items-center gap-4">
            <span>{post.likes} likes</span>
            <span>{post.comments.length} comments</span>
            <span>{post.shares} shares</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{Math.floor(Math.random() * 1000) + 500} views</span>
          </div>
        </div>

        {/* Post Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleLikePost(post.id)}
              className={`gap-2 ${post.isLiked ? 'text-blue-600' : ''}`}
            >
              <ThumbsUp className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
              Like
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
              className="gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Comment
            </Button>
            <Button variant="ghost" size="sm" className="gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
          <Button variant="ghost" size="sm">
            <Bookmark className="w-4 h-4" />
          </Button>
        </div>

        {/* Comments Section */}
        {expandedPost === post.id && (
          <div className="mt-4 space-y-3 border-t pt-3">
            {/* Add Comment */}
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100" alt="You" />
                <AvatarFallback>YO</AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                  className="flex-1"
                />
                <Button size="icon" onClick={() => handleAddComment(post.id)}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Comments List */}
            {post.comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                  <AvatarFallback>{comment.author.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h5 className="font-semibold text-sm mb-1">{comment.author.name}</h5>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <span>{new Date(comment.timestamp).toLocaleDateString()}</span>
                    <Button variant="ghost" size="sm" className="h-auto p-0 text-xs">
                      Like ({comment.likes})
                    </Button>
                    <Button variant="ghost" size="sm" className="h-auto p-0 text-xs">
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderReview = (review: Review) => (
    <Card key={review.id}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={review.author.avatar} alt={review.author.name} />
            <AvatarFallback>{review.author.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-sm">{review.author.name}</h4>
              {review.isVerified && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                  <Verified className="w-3 h-3 mr-1" />
                  Verified Purchase
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="text-sm text-muted-foreground">
                {new Date(review.timestamp).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm">{review.content}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Page Header */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={extendedPage.cover}
          alt={extendedPage.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        
        <div className="absolute top-4 left-4 z-10">
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            className="gap-2 text-sm sm:text-base"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        </div>

        <div className="absolute bottom-6 left-4 right-4 sm:left-6 sm:right-6 text-white">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-4 border-white flex-shrink-0">
                  <AvatarImage src={extendedPage.avatar} alt={extendedPage.name} />
                  <AvatarFallback className="text-lg sm:text-2xl">{extendedPage.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">{extendedPage.name}</h1>
                    {extendedPage.verified && (
                      <Verified className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 flex-shrink-0" fill="currentColor" />
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm opacity-90">
                    <div className="flex items-center gap-1">
                      <PageTypeIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="truncate">{extendedPage.category}</span>
                    </div>
                    <span className="hidden sm:inline">•</span>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="whitespace-nowrap">{formatNumber(extendedPage.followers)} followers</span>
                    </div>
                    {extendedPage.location && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <div className="flex items-center gap-1 min-w-0">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate">{extendedPage.location}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:flex-wrap">
              <Button
                onClick={handleFollowPage}
                variant={extendedPage.isFollowing ? "outline" : "default"}
                className={`gap-2 text-sm sm:text-base ${extendedPage.isFollowing ? "bg-white/20 border-white/30 text-white hover:bg-white/30" : ""}`}
                size="sm"
              >
                {extendedPage.isFollowing ? (
                  <>
                    <Heart className="w-4 h-4 fill-current" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Follow</span>
                  </>
                )}
              </Button>
              <QuickMessageButton
                type="page"
                targetId={pageId!}
                targetName={extendedPage.name}
                ownerId={extendedPage.ownerId || `page-owner-${pageId}`}
                context="page inquiry"
                variant="outline"
                size="sm"
                className="gap-2 bg-white/20 border-white/30 text-white hover:bg-white/30 text-sm sm:text-base"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Message</span>
              </QuickMessageButton>
              {extendedPage.isOwner && (
                <Button
                  variant="outline"
                  className="gap-2 bg-white/20 border-white/30 text-white hover:bg-white/30 text-sm sm:text-base"
                  onClick={handleManagePage}
                  size="sm"
                >
                  <Settings className="w-4 h-4" />
                  <span>Manage</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Page Info */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">About</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{extendedPage.about || extendedPage.description}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{formatNumber(extendedPage.followers)} followers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Created {new Date(extendedPage.createdAt!).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PageTypeIcon className="w-4 h-4 text-muted-foreground" />
                    <span>{extendedPage.pageType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Contact Information</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                {extendedPage.website && (
                  <div className="flex items-center gap-2 text-sm">
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    <a
                      href={extendedPage.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {extendedPage.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                )}
                {extendedPage.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{extendedPage.email}</span>
                  </div>
                )}
                {extendedPage.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{extendedPage.phone}</span>
                  </div>
                )}
                {extendedPage.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{extendedPage.location}</span>
                  </div>
                )}
                {extendedPage.hours && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{extendedPage.hours}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Page Stats */}
            {extendedPage.isOwner && (
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">Page Insights</h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">{extendedPage.posts}</div>
                      <div className="text-xs text-muted-foreground">Posts</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">{extendedPage.engagement}%</div>
                      <div className="text-xs text-muted-foreground">Engagement</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Reviews Summary */}
            {reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">Reviews</h3>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-2xl font-bold">{avgRating.toFixed(1)}</div>
                    <div>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {reviews.length} reviews
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="w-full" onClick={() => setShowReviewModal(true)}>
                    Write a Review
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Create Post Section (Page Owner Only) */}
            {extendedPage.isOwner && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={extendedPage.avatar} alt={extendedPage.name} />
                      <AvatarFallback>{extendedPage.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex-1 justify-start text-muted-foreground">
                          Share an update with your followers...
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Create Post</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Textarea
                            placeholder="What would you like to share with your followers?"
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            rows={4}
                          />
                          <div className="flex justify-between items-center">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <ImageIcon className="w-4 h-4 mr-2" />
                                Photo
                              </Button>
                              <Button variant="outline" size="sm">
                                <Video className="w-4 h-4 mr-2" />
                                Video
                              </Button>
                              <Button variant="outline" size="sm">
                                <Calendar className="w-4 h-4 mr-2" />
                                Event
                              </Button>
                            </div>
                            <Button onClick={handleCreatePost}>
                              Post
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="photos">Photos</TabsTrigger>
              </TabsList>

              <TabsContent value="posts" className="space-y-4">
                {/* Posts Filter */}
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <SortDesc className="w-4 h-4 mr-2" />
                      Recent
                    </Button>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search posts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>

                {/* Posts Feed */}
                <div className="space-y-4">
                  {posts.map(renderPost)}
                </div>
              </TabsContent>

              <TabsContent value="about" className="space-y-4">
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">About {extendedPage.name}</h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{extendedPage.about || extendedPage.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">General Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Page Type:</span>
                            <span>{extendedPage.pageType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Category:</span>
                            <span>{extendedPage.category}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Created:</span>
                            <span>{new Date(extendedPage.createdAt!).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Followers:</span>
                            <span>{formatNumber(extendedPage.followers)}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Contact Details</h4>
                        <div className="space-y-2 text-sm">
                          {extendedPage.website && (
                            <div className="flex justify-between">
                              <span>Website:</span>
                              <a href={extendedPage.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                Visit
                              </a>
                            </div>
                          )}
                          {extendedPage.email && (
                            <div className="flex justify-between">
                              <span>Email:</span>
                              <span>{extendedPage.email}</span>
                            </div>
                          )}
                          {extendedPage.phone && (
                            <div className="flex justify-between">
                              <span>Phone:</span>
                              <span>{extendedPage.phone}</span>
                            </div>
                          )}
                          {extendedPage.location && (
                            <div className="flex justify-between">
                              <span>Location:</span>
                              <span>{extendedPage.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">Customer Reviews</h3>
                    <p className="text-muted-foreground">
                      {avgRating.toFixed(1)} average based on {reviews.length} reviews
                    </p>
                  </div>
                  <Button onClick={() => setShowReviewModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Write Review
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {reviews.map(renderReview)}
                </div>
              </TabsContent>

              <TabsContent value="products" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Products & Services</h3>
                  {page.isOwner && (
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Product
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <Card key={product.id}>
                      <div className="aspect-square overflow-hidden rounded-t-lg">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-2">{product.name}</h4>
                        <p className="text-sm text-muted-foreground mb-3">{product.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="text-lg font-bold">${product.price}</div>
                          <Badge variant={product.inStock ? "default" : "secondary"}>
                            {product.inStock ? "In Stock" : "Out of Stock"}
                          </Badge>
                        </div>
                        <Button
                          className="w-full mt-3"
                          disabled={!product.inStock}
                          onClick={() => {
                            if (product.inStock) {
                              // Navigate to marketplace with product search
                              navigate(`/app/marketplace?search=${encodeURIComponent(product.name)}&seller=${encodeURIComponent(extendedPage.name)}`);
                              toast({
                                title: "Redirecting to Marketplace",
                                description: `Finding ${product.name} in the marketplace...`
                              });
                            }
                          }}
                        >
                          <Store className="w-4 h-4 mr-2" />
                          {product.inStock ? "Buy Now" : "Notify Me"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="photos" className="space-y-4">
                <div className="text-center py-12">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">No photos yet</h3>
                      <p className="text-muted-foreground">Photos from posts will appear here</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Rating</Label>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    variant="ghost"
                    size="sm"
                    onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                    className="p-1"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= newReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Label>Review</Label>
              <Textarea
                placeholder="Share your experience..."
                value={newReview.content}
                onChange={(e) => setNewReview(prev => ({ ...prev, content: e.target.value }))}
                rows={4}
                className="mt-2"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddReview} className="flex-1">
                Submit Review
              </Button>
              <Button variant="outline" onClick={() => setShowReviewModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PageDetailView;
