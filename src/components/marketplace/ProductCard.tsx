
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Heart,
  Star,
  MessageCircle,
  Eye,
  Check
} from "lucide-react";
import { Product } from "@/types/marketplace";
import { cn } from "@/utils/utils";

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
  onAddToWishlist: (productId: string) => void;
  onViewProduct?: (product: Product) => void;
  onMessageSeller?: (sellerId: string, productId: string) => void;
  className?: string;
  showSellerInfo?: boolean;
  featured?: boolean;
  sponsored?: boolean;
}

const ProductCard = ({
  product,
  onAddToCart,
  onAddToWishlist,
  onViewProduct,
  onMessageSeller,
  className,
  showSellerInfo = false,
  featured = false,
  sponsored = false
}: ProductCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    onAddToWishlist(product.id);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product.id);
  };

  const handleViewProduct = () => {
    if (onViewProduct) {
      onViewProduct(product);
    } else {
      // Navigate to product detail page once it exists
      // navigate(`/marketplace/product/${product.id}`);
    }
  };

  const handleMessageSeller = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMessageSeller) {
      onMessageSeller(product.sellerId, product.id);
    }
  };

  const discountPercentage = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <Card
      className={cn(
        "overflow-hidden h-full flex flex-col transition-all duration-200 hover:shadow-md cursor-pointer relative",
        featured && "border-blue-300 shadow-md",
        sponsored && "border-amber-300 shadow-md",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleViewProduct}
    >
      {sponsored && (
        <div className="absolute top-0 right-0 left-0 bg-amber-100 text-amber-800 z-10 text-xs font-medium py-0.5 px-2 text-center">
          Sponsored
        </div>
      )}
      
      {featured && !sponsored && (
        <div className="absolute top-0 right-0 left-0 bg-blue-100 text-blue-800 z-10 text-xs font-medium py-0.5 px-2 text-center">
          Featured
        </div>
      )}

      <div className="relative pt-[100%] overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-300 ${isHovered ? "scale-110" : "scale-100"
            }`}
        />

        {product.isNew && (
          <Badge className="absolute top-2 left-2 bg-blue-500">New</Badge>
        )}

        {product.discountPrice && (
          <Badge className="absolute top-2 right-2 bg-red-500">-{discountPercentage}%</Badge>
        )}

        <Button
          variant="outline"
          size="icon"
          className={`absolute top-2 right-2 h-8 w-8 rounded-full ${product.discountPrice ? "right-16" : ""} ${isLiked ? "bg-red-100 text-red-500 border-red-200" : "bg-white/80 backdrop-blur-sm"
            }`}
          onClick={handleLike}
        >
          <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
        </Button>
      </div>

      <CardHeader className="p-3 pb-0">
        {showSellerInfo && (
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-shrink-0 h-6 w-6 rounded-full overflow-hidden">
              <img
                src={product.sellerAvatar}
                alt={product.sellerName}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex items-center text-sm">
              <span className="font-medium">{product.sellerName}</span>
              {product.sellerVerified && (
                <Check className="h-3 w-3 text-blue-500 ml-1" />
              )}
            </div>
          </div>
        )}
        <div className="text-sm text-muted-foreground">{product.category}</div>
        <h3 className="font-medium line-clamp-2 h-12">{product.name}</h3>
      </CardHeader>

      <CardContent className="p-3 pt-1 flex-grow">
        <div className="flex items-center gap-1 text-sm">
          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
          <span>{product.rating.toFixed(1)}</span>
          {product.reviewCount && (
            <span className="text-muted-foreground">({product.reviewCount})</span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-3 pt-0 flex justify-between items-center">
        <div>
          {product.discountPrice ? (
            <div className="flex items-center gap-2">
              <span className="font-semibold">${product.discountPrice.toFixed(2)}</span>
              <span className="text-sm text-muted-foreground line-through">${product.price.toFixed(2)}</span>
            </div>
          ) : (
            <span className="font-semibold">${product.price.toFixed(2)}</span>
          )}
        </div>

        <div className="flex gap-1">
          {onMessageSeller && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2"
              onClick={handleMessageSeller}
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          )}

          <Button
            size="sm"
            className="h-8"
            onClick={handleAddToCart}
            disabled={!product.inStock}
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            {product.inStock ? "Add" : "Sold Out"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
