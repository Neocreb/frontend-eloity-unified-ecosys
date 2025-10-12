import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MessageSquare,
  Heart,
  Share2,
  Star,
  Store,
  Code,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Eye,
  Clock,
  Calendar,
  Users,
  Award,
  Image as ImageIcon,
  Play,
  BookOpen,
  Camera,
  Briefcase,
  MapPin,
  Globe,
  BarChart3,
  Video,
  Sparkles,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { UserProfile } from "@/types/user";
import { Product } from "@/types/marketplace";
import CreatorDashboard from "@/components/video/CreatorDashboard";
import CreatorStudioAccess from "@/components/video/CreatorStudioAccess";
import { ProfilePostCard } from "@/components/profile/ProfilePostCard";

interface EnhancedProfileContentProps {
  profile: UserProfile;
  isOwnProfile?: boolean;
  posts?: any[];
  products?: Product[];
  services?: any[];
  onAddToCart?: (productId: string) => void;
  onAddToWishlist?: (productId: string) => void;
  onContactSeller?: (productId: string) => void;
}

export const EnhancedProfileContent: React.FC<EnhancedProfileContentProps> = ({
  profile,
  isOwnProfile = false,
  posts = [],
  products = [],
  services = [],
  onAddToCart,
  onAddToWishlist,
  onContactSeller,
}) => {
  const [activeTab, setActiveTab] = useState("posts");

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };


  const ProductCard: React.FC<{ product: Product }> = ({ product }) => (
    <Card className="group hover:shadow-lg transition-all duration-200">
      <div className="relative overflow-hidden rounded-t-lg">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
        />
        {product.isNew && (
          <Badge className="absolute top-2 left-2 bg-green-500">New</Badge>
        )}
        {product.isFeatured && (
          <Badge className="absolute top-2 right-2 bg-purple-500">
            Featured
          </Badge>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onAddToCart?.(product.id)}
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            Add to Cart
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onAddToWishlist?.(product.id)}
          >
            <Heart className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{product.rating}</span>
            <span className="text-sm text-muted-foreground">
              ({product.reviewCount || 0})
            </span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {product.category}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {product.discountPrice ? (
              <>
                <span className="text-lg font-bold text-green-600">
                  ${product.discountPrice}
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  ${product.price}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold">${product.price}</span>
            )}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onContactSeller?.(product.id)}
          >
            Contact
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const ServiceCard: React.FC<{ service: any }> = ({ service }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Code className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-2">
              {service.title || service.service_name}
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              {service.description}
            </p>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{service.category}</Badge>
                {service.featured && (
                  <Badge
                    variant="outline"
                    className="border-purple-400 text-purple-600"
                  >
                    Featured
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {service.delivery_time} days delivery
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold">
                ${service.price_range?.min || 0} - $
                {service.price_range?.max || 0}
              </div>
              <Button size="sm">View Details</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ActivityCard: React.FC<{ activity: any }> = ({ activity }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            {activity.type === "post" && <MessageSquare className="w-4 h-4" />}
            {activity.type === "product" && <Store className="w-4 h-4" />}
            {activity.type === "service" && <Code className="w-4 h-4" />}
            {activity.type === "follow" && <Users className="w-4 h-4" />}
            {activity.type === "achievement" && <Award className="w-4 h-4" />}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{activity.description}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(activity.timestamp))} ago
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const MediaGrid: React.FC<{ items: any[] }> = ({ items }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {items.map((item, index) => (
        <div
          key={index}
          className="aspect-square rounded-lg overflow-hidden bg-muted hover:scale-105 transition-transform cursor-pointer group relative"
        >
          <img
            src={item.url || item.image}
            alt="Media content"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            {item.type === "video" ? (
              <Play className="w-8 h-8 text-white" />
            ) : (
              <ImageIcon className="w-8 h-8 text-white" />
            )}
          </div>
        </div>
      ))}
    </div>
  );

  // Generate mock activities
  const generateActivities = () => {
    const activities = [];

    if (posts.length > 0) {
      activities.push({
        type: "post",
        description: "Published a new post",
        timestamp: posts[0].created_at || posts[0].createdAt,
      });
    }

    if (products.length > 0) {
      activities.push({
        type: "product",
        description: "Listed a new product",
        timestamp: products[0].createdAt,
      });
    }

    if (profile.achievements?.length) {
      activities.push({
        type: "achievement",
        description: `Earned "${profile.achievements[0].name}" achievement`,
        timestamp: profile.achievements[0].earned_at,
      });
    }

    return activities.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  };

  const activities = generateActivities();

  // Generate mock media from posts and products
  const generateMedia = () => {
    const media = [];

    posts.forEach((post) => {
      if (post.image) {
        media.push({ url: post.image, type: "image" });
      }
    });

    products.forEach((product) => {
      if (product.image) {
        media.push({ url: product.image, type: "image" });
      }
    });

    // Add some mock media if none exists
    if (media.length === 0) {
      for (let i = 0; i < 6; i++) {
        media.push({
          url: `https://source.unsplash.com/400x400/?technology,${i}`,
          type: "image",
        });
      }
    }

    return media;
  };

  const media = generateMedia();

  const getTabCounts = () => ({
    posts: posts.length,
    products: products.length,
    services: services.length,
    media: media.length,
    activity: activities.length,
  });

  const counts = getTabCounts();

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="posts" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Posts</span>
            {counts.posts > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {counts.posts}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Store className="w-4 h-4" />
            <span className="hidden sm:inline">Products</span>
            {counts.products > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {counts.products}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            <span className="hidden sm:inline">Services</span>
            {counts.services > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {counts.services}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center gap-2">
            <Camera className="w-4 h-4" />
            <span className="hidden sm:inline">Media</span>
            {counts.media > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {counts.media}
              </Badge>
            )}
          </TabsTrigger>
          {isOwnProfile && (
            <TabsTrigger value="creator" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Creator</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Activity</span>
            {counts.activity > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {counts.activity}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4 mt-6">
          {posts.length > 0 ? (
            posts.map((post, index) => {
              const mappedPost = {
                id: post.id ?? post.post_id ?? String(post.id ?? index),
                content: post.content ?? post.text ?? (post.content && post.content.text) ?? "",
                image: post.image ?? post.image_url ?? post.imageUrl ?? null,
                createdAt: post.created_at ?? post.createdAt ?? new Date().toISOString(),
                likes: post.likes ?? post.likes_count ?? 0,
                comments: post.comments ?? post.comments_count ?? 0,
                shares: post.shares ?? 0,
                privacy: post.privacy ?? "public",
                author: {
                  id: post.user_id ?? post.author?.id ?? profile.id,
                  name: post.author?.full_name ?? profile.full_name ?? profile.displayName,
                  username: post.author?.username ?? profile.username,
                  avatar: post.author?.avatar_url ?? profile.avatar_url ?? profile.avatar,
                  verified: false,
                },
                _liked: post.liked_by_user ?? false,
                _saved: post._saved ?? false,
              };

              return (
                <ProfilePostCard
                  key={mappedPost.id || index}
                  post={mappedPost as any}
                  isOwnPost={String(mappedPost.author.id) === String(profile.id)}
                  onLikeToggle={(postId, newCount, isLiked) => {
                    setPosts((prev) =>
                      prev.map((p) =>
                        (p.id ?? p.post_id ?? String(p.id)) === postId
                          ? { ...p, likes: newCount, _liked: isLiked }
                          : p
                      )
                    );
                  }}
                  onSaveToggle={(postId, isSaved) => {
                    setPosts((prev) =>
                      prev.map((p) =>
                        (p.id ?? p.post_id ?? String(p.id)) === postId
                          ? { ...p, _saved: isSaved }
                          : p
                      )
                    );
                  }}
                />
              );
            })
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No posts yet</h3>
                <p className="text-muted-foreground">
                  {isOwnProfile
                    ? "Share your first post to get started!"
                    : "This user hasn't posted anything yet."}
                </p>
                {isOwnProfile && <Button className="mt-4">Create Post</Button>}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="products" className="mt-6">
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Store className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No products listed</h3>
                <p className="text-muted-foreground">
                  {isOwnProfile
                    ? "List your first product to start selling!"
                    : "This user hasn't listed any products yet."}
                </p>
                {isOwnProfile && <Button className="mt-4">List Product</Button>}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="services" className="space-y-4 mt-6">
          {services.length > 0 ? (
            services.map((service, index) => (
              <ServiceCard key={service.id || index} service={service} />
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Code className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No services offered</h3>
                <p className="text-muted-foreground">
                  {isOwnProfile
                    ? "Offer your first service to start freelancing!"
                    : "This user doesn't offer any services yet."}
                </p>
                {isOwnProfile && (
                  <Button className="mt-4">Create Service</Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="media" className="mt-6">
          {media.length > 0 ? (
            <MediaGrid items={media} />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No media shared</h3>
                <p className="text-muted-foreground">
                  {isOwnProfile
                    ? "Share photos and videos to showcase your work!"
                    : "This user hasn't shared any media yet."}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {isOwnProfile && (
          <TabsContent value="creator" className="space-y-4 mt-6">
            {/* Creator Studio Quick Access */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Creator Hub
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Quick overview and access to your creator tools
                </p>
              </CardHeader>
              <CardContent>
                <CreatorStudioAccess />
              </CardContent>
            </Card>

            {/* Detailed Dashboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Detailed Analytics
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Comprehensive performance metrics and insights
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <CreatorDashboard
                  isOwnProfile={isOwnProfile}
                  userId={profile.id}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="activity" className="space-y-4 mt-6">
          {activities.length > 0 ? (
            activities.map((activity, index) => (
              <ActivityCard key={index} activity={activity} />
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No recent activity</h3>
                <p className="text-muted-foreground">
                  Activity will appear here as the user interacts with the
                  platform.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedProfileContent;
