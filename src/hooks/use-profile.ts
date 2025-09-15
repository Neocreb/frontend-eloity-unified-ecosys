import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Post } from "@/components/feed/PostCard";
import { Product } from "@/types/marketplace";
import { ExtendedUser, UserProfile, MockUser } from "@/types/user";
import { profileService } from "@/services/profileService";

interface UseProfileProps {
  username?: string;
}

export const useProfile = ({ username }: UseProfileProps = {}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  // State
  const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // Determine if this is the user's own profile
  const isOwnProfile =
    !username || (user && user.profile?.username === username);

  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);

      try {
        let profile: UserProfile | null = null;

        if (isOwnProfile && user?.profile) {
          // Use current user's profile
          profile = user.profile;
        } else if (username) {
          // Fetch profile by username
          profile = await profileService.getUserByUsername(username);

          if (!profile) {
            // Generate mock user for demonstration
            console.log(`Generating mock user for username: ${username}`);
            const mockUser = profileService.generateMockUser(username);
            profile = mockUser.profile!;

            // Set mock data
            setPosts(formatPosts(mockUser.mock_data.posts));
            setProducts(formatProducts(mockUser.mock_data.products));
            setServices(mockUser.mock_data.services);
          }
        }

        if (profile) {
          setProfileUser(profile);
          await fetchUserData(profile.id);
        }
      } catch (error) {
        console.warn(
          "Error fetching profile data:",
          (error as any)?.message || error,
        );
        if (username) {
          // Generate mock profile on error
          const mockUser = profileService.generateMockUser(username);
          setProfileUser(mockUser.profile!);
          setPosts(formatPosts(mockUser.mock_data.posts));
          setProducts(formatProducts(mockUser.mock_data.products));
          setServices(mockUser.mock_data.services);

          // Set mock follower data
          setFollowerCount(Math.floor(Math.random() * 1000) + 100);
          setFollowingCount(Math.floor(Math.random() * 500) + 50);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [username, user, isOwnProfile]);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch follower counts
      const [followers, following] = await Promise.all([
        profileService.getFollowersCount(userId),
        profileService.getFollowingCount(userId),
      ]);

      setFollowerCount(followers);
      setFollowingCount(following);

      // Check if current user is following this profile
      if (user && user.id && user.id !== userId) {
        const followStatus = await profileService.isFollowing(user.id, userId);
        setIsFollowing(followStatus);
      }

      // Fetch user content
      try {
        const [userPosts, userProducts, userServices] = await Promise.all([
          profileService.getUserPosts(userId),
          profileService.getUserProducts(userId),
          profileService.getUserServices(userId),
        ]);

        // Format and set posts
        if (userPosts && userPosts.length > 0) {
          setPosts(formatPosts(userPosts));
        } else {
          setPosts(createMockPosts());
        }

        // Format and set products
        if (userProducts && userProducts.length > 0) {
          setProducts(formatProducts(userProducts));
        } else if (profileUser?.marketplace_profile) {
          setProducts(createMockProducts());
        }

        // Format and set services
        if (userServices && userServices.length > 0) {
          setServices(formatServices(userServices));
        } else if (profileUser?.freelance_profile) {
          setServices(createMockServices());
        }
      } catch (contentError: any) {
        console.warn(
          "Error fetching user content:",
          contentError?.message || contentError,
        );
        // Set mock data on error
        setPosts(createMockPosts());
        if (profileUser?.marketplace_profile) {
          setProducts(createMockProducts());
        }
        if (profileUser?.freelance_profile) {
          setServices(createMockServices());
        }
      }
    } catch (error: any) {
      console.warn("Error fetching user data:", error?.message || error);
      // Set mock data on error
      setFollowerCount(Math.floor(Math.random() * 1000) + 100);
      setFollowingCount(Math.floor(Math.random() * 500) + 50);
      setPosts(createMockPosts());
    }
  };

  // Format functions
  const formatPosts = (postsData: any[]): Post[] => {
    return postsData.map((post) => ({
      id: post.id,
      content: post.content,
      image: post.image_url || post.image,
      createdAt: post.created_at || post.createdAt || new Date().toISOString(),
      likes: post.likes || Math.floor(Math.random() * 50),
      comments: post.comments || Math.floor(Math.random() * 10),
      shares: post.shares || Math.floor(Math.random() * 5),
      author: {
        name: profileUser?.full_name || "User",
        username: profileUser?.username || "user",
        avatar: profileUser?.avatar_url || "/placeholder.svg",
        verified: profileUser?.is_verified || false,
      },
    }));
  };

  const formatProducts = (productsData: any[]): Product[] => {
    return productsData.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      discountPrice: product.discount_price,
      image:
        product.image_url ||
        product.image ||
        "https://source.unsplash.com/400x400/?product",
      category: product.category || "General",
      rating: product.rating || 4.5,
      reviewCount: product.review_count || 0,
      inStock: product.in_stock !== false,
      isNew: product.created_at
        ? new Date(product.created_at).getTime() >
          Date.now() - 7 * 24 * 60 * 60 * 1000
        : false,
      isFeatured: product.is_featured || false,
      isSponsored: product.is_sponsored || false,
      sellerId: product.seller_id || profileUser?.id || "",
      sellerName: profileUser?.full_name || "User",
      sellerAvatar: profileUser?.avatar_url || "/placeholder.svg",
      sellerVerified: profileUser?.is_verified || false,
      createdAt: product.created_at || new Date().toISOString(),
      updatedAt:
        product.updated_at || product.created_at || new Date().toISOString(),
      condition: product.condition || "new",
    }));
  };

  const formatServices = (servicesData: any[]) => {
    return servicesData.map((service) => ({
      id: service.id,
      title: service.title || service.service_name,
      description: service.description,
      category: service.category || "Development",
      price_range: service.price_range || {
        min: service.min_price || 50,
        max: service.max_price || 500,
      },
      delivery_time: service.delivery_time || 7,
      featured: service.featured || false,
    }));
  };

  // Mock data creation functions
  const createMockPosts = (): Post[] => {
    if (!profileUser) return [];

    const postTemplates = [
      "Just completed another successful project! Really excited about the results 🚀",
      "Working on something amazing. Can't wait to share it with everyone! ✨",
      "Great day at the office! Love what I do 💼",
      "Learning new technologies is always exciting. #TechLife",
      "Beautiful sunset today! Nature never fails to inspire 🌅",
    ];

    return Array.from({ length: 3 }, (_, i) => ({
      id: `mock-post-${i + 1}`,
      author: {
        name: profileUser.full_name || "User",
        username: profileUser.username || "user",
        avatar: profileUser.avatar_url || "/placeholder.svg",
        verified: profileUser.is_verified || false,
      },
      content: postTemplates[i % postTemplates.length],
      image:
        i === 0
          ? `https://source.unsplash.com/800x600/?technology,${i}`
          : undefined,
      createdAt: new Date(
        Date.now() - (i + 1) * 24 * 60 * 60 * 1000,
      ).toISOString(),
      likes: Math.floor(Math.random() * 100) + 10,
      comments: Math.floor(Math.random() * 20) + 2,
      shares: Math.floor(Math.random() * 10),
    }));
  };

  const createMockProducts = (): Product[] => {
    if (!profileUser) return [];

    const productTemplates = [
      {
        name: "Premium Wireless Headphones",
        description: "High-quality wireless headphones with noise cancellation",
        price: 199.99,
        category: "Electronics",
        image: "https://source.unsplash.com/400x400/?headphones",
      },
      {
        name: "Smart Fitness Tracker",
        description: "Advanced fitness tracker with heart rate monitoring",
        price: 149.99,
        category: "Electronics",
        image: "https://source.unsplash.com/400x400/?fitness,tracker",
      },
      {
        name: "Organic Coffee Beans",
        description: "Premium organic coffee beans from Colombia",
        price: 24.99,
        category: "Food & Beverages",
        image: "https://source.unsplash.com/400x400/?coffee,beans",
      },
    ];

    return productTemplates.map((template, i) => ({
      id: `mock-product-${i + 1}`,
      ...template,
      rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
      reviewCount: Math.floor(Math.random() * 50) + 5,
      inStock: true,
      isNew: i === 0,
      isFeatured: i === 1,
      sellerId: profileUser.id,
      sellerName: profileUser.full_name || "User",
      sellerAvatar: profileUser.avatar_url || "/placeholder.svg",
      sellerVerified: profileUser.is_verified || false,
      createdAt: new Date(
        Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      updatedAt: new Date().toISOString(),
      condition: "new" as const,
    }));
  };

  const createMockServices = () => {
    if (!profileUser) return [];

    return [
      {
        id: "mock-service-1",
        title: "Full Stack Web Development",
        description:
          "Complete web application development from design to deployment",
        category: "Development",
        price_range: { min: 500, max: 5000 },
        delivery_time: 14,
        featured: true,
      },
      {
        id: "mock-service-2",
        title: "UI/UX Design Consultation",
        description:
          "Professional UI/UX design and user experience optimization",
        category: "Design",
        price_range: { min: 200, max: 1500 },
        delivery_time: 7,
        featured: false,
      },
    ];
  };

  // Action functions
  const toggleFollow = async () => {
    if (!user || !profileUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to follow users",
      });
      return;
    }

    try {
      const newFollowingState = !isFollowing;
      setIsFollowing(newFollowingState);
      setFollowerCount((prev) => (newFollowingState ? prev + 1 : prev - 1));

      await profileService.toggleFollow(user.id, profileUser.id, isFollowing);

      toast({
        title: newFollowingState ? "Following" : "Unfollowed",
        description: `You ${newFollowingState ? "are now following" : "unfollowed"} ${profileUser.full_name}`,
      });
    } catch (error: any) {
      console.error("Error updating follow status:", error?.message || error);
      // Revert changes on error
      setIsFollowing(!isFollowing);
      setFollowerCount(followerCount);

      toast({
        title: "Error",
        description: "Could not update follow status",
        variant: "destructive",
      });
    }
  };

  const handleAddToCart = (productId: string) => {
    toast({
      title: "Added to cart",
      description: "Product added to your cart",
    });
  };

  const handleAddToWishlist = (productId: string) => {
    toast({
      title: "Added to wishlist",
      description: "Product added to your wishlist",
    });
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      // In a real implementation, this would call the API
      setProducts(products.filter((product) => product.id !== productId));

      toast({
        title: "Product deleted",
        description: "Your product has been deleted",
      });
    } catch (error: any) {
      console.error("Error deleting product:", error?.message || error);
      toast({
        title: "Error",
        description: "Could not delete product",
        variant: "destructive",
      });
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profileUser || !user) return;

    try {
      const updatedProfile = await profileService.updateProfile(
        profileUser.id,
        updates,
      );
      setProfileUser(updatedProfile);

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });

      return updatedProfile;
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Could not update profile",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    // State
    profileUser,
    isLoading,
    isOwnProfile,
    posts,
    products,
    services,
    isFollowing,
    followerCount,
    followingCount,

    // Actions
    toggleFollow,
    handleAddToCart,
    handleAddToWishlist,
    handleDeleteProduct,
    updateProfile,
  };
};
