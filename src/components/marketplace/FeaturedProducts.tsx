
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import ProductCard from "./ProductCard";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { useAuth } from "@/contexts/AuthContext";

interface FeaturedProductsProps {
  onAddToCart: (productId: string) => void;
  onAddToWishlist: (productId: string) => void;
  showAll?: boolean;
}

const FeaturedProducts = ({ 
  onAddToCart, 
  onAddToWishlist,
  showAll = false 
}: FeaturedProductsProps) => {
  const { featuredProducts, setActiveProduct } = useMarketplace();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const displayProducts = showAll 
    ? featuredProducts 
    : featuredProducts.slice(0, 4);
  
  const handleViewProduct = (product: any) => {
    setActiveProduct(product);
    // TODO: Navigate to product detail page once created
    // navigate(`/marketplace/product/${product.id}`);
  };

  const handleMessageSeller = (sellerId: string, productId: string) => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    
    navigate('/chat');
  };
  
  if (displayProducts.length === 0) {
    return null;
  }
  
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Featured Products</h2>
        {!showAll && featuredProducts.length > 4 && (
          <Button variant="link" className="flex items-center" 
            onClick={() => navigate('/marketplace')}
          >
            View all <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            onAddToWishlist={onAddToWishlist}
            onViewProduct={handleViewProduct}
            onMessageSeller={handleMessageSeller}
            showSellerInfo={true}
            featured={true}
          />
        ))}
      </div>
    </section>
  );
};

export default FeaturedProducts;
