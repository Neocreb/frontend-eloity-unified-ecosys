import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Product } from "@/types/marketplace";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import ProductCard from "./ProductCard";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { MarketplaceService } from "@/services/marketplaceService";

interface ProductGridProps {
  category?: string;
  searchQuery?: string;
  sortBy?: "recent" | "popular" | "price-low" | "price-high";
  onAddToCart: (productId: string) => void;
  onAddToWishlist: (productId: string) => void;
  limit?: number;
  products?: Product[]; // Make 'products' prop optional
}

const ProductGrid = ({
  category = "all",
  searchQuery = "",
  sortBy,
  onAddToCart,
  onAddToWishlist,
  limit,
  products: propProducts, // Rename to avoid conflict with context products
}: ProductGridProps) => {
  const [loading, setLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const { products: contextProducts, setActiveProduct } = useMarketplace();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [sponsoredProducts, setSponsoredProducts] = useState<any[]>([]);

  // Load sponsored products
  useEffect(() => {
    const loadSponsoredProducts = async () => {
      try {
        const sponsoredData = await MarketplaceService.getSponsoredProducts();
        setSponsoredProducts(sponsoredData);
      } catch (error) {
        console.error("Error loading sponsored products:", error);
      }
    };

    loadSponsoredProducts();
  }, []);

  // Use the products prop if provided, otherwise use products from context
  const sourceProducts = propProducts || contextProducts;

  useEffect(() => {
    // Simulate API fetch delay
    const timer = setTimeout(() => {
      let filtered = [...sourceProducts];

      // Mark sponsored products
      filtered = filtered.map(product => {
        const isSponsored = sponsoredProducts.some((sp: any) => sp.product_id === product.id && sp.is_active);
        return {
          ...product,
          isSponsored
        };
      });

      // Filter by category if not "all"
      if (category !== "all") {
        filtered = filtered.filter((product) => product.category === category);
      }

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (product) =>
            product.name.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query) ||
            (product.tags &&
              product.tags.some((tag) => tag.toLowerCase().includes(query))),
        );
      }

      // Sort products
      if (sortBy) {
        switch (sortBy) {
          case "recent":
            filtered.sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            );
            break;
          case "popular":
            filtered.sort(
              (a, b) =>
                b.rating * (b.reviewCount || 1) -
                a.rating * (a.reviewCount || 1),
            );
            break;
          case "price-low":
            filtered.sort(
              (a, b) =>
                (a.discountPrice || a.price) - (b.discountPrice || b.price),
            );
            break;
          case "price-high":
            filtered.sort(
              (a, b) =>
                (b.discountPrice || b.price) - (a.discountPrice || a.price),
            );
            break;
        }
      }

      // Apply limit if specified
      if (limit && limit > 0) {
        filtered = filtered.slice(0, limit);
      }

      setFilteredProducts(filtered);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [category, searchQuery, sortBy, sourceProducts, limit, sponsoredProducts]);

  const handleViewProduct = (product: Product) => {
    setActiveProduct(product);
    // TODO: Navigate to product detail page once created
    // navigate(`/marketplace/product/${product.id}`);
  };

  const handleMessageSeller = (sellerId: string, productId: string) => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    navigate("/app/chat");
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index}>
            <div className="pt-[100%] relative">
              <Skeleton className="absolute inset-0" />
            </div>
            <div className="p-4 space-y-3">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex justify-between">
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-9 w-1/3" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-10 border rounded-lg bg-gray-50 p-8">
        <h3 className="text-lg font-medium">No products found</h3>
        <p className="text-muted-foreground mt-2 mb-6">
          Try changing your search or filter criteria
        </p>
        <Button
          variant="outline"
          onClick={() => {
            // Reset filters
            navigate("/app/marketplace");
          }}
        >
          Browse all products
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredProducts.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onAddToWishlist={onAddToWishlist}
          onViewProduct={handleViewProduct}
          onMessageSeller={handleMessageSeller}
          showSellerInfo={true}
          sponsored={product.isSponsored}
          featured={product.isFeatured}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
