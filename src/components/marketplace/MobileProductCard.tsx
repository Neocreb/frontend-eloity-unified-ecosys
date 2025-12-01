import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  ShoppingCart,
  Star,
  Zap,
  Share,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import type { EnhancedProduct } from "../../types/enhanced-marketplace";

interface MobileProductCardProps {
  product: EnhancedProduct;
  onAddToCart?: (productId: string) => void;
  onAddToWishlist?: (productId: string) => void;
  onShare?: (productId: string) => void;
  showCompactView?: boolean;
  isInWishlist?: boolean;
}

export const MobileProductCard: React.FC<MobileProductCardProps> = ({
  product,
  onAddToCart,
  onAddToWishlist,
  onShare,
  showCompactView = false,
  isInWishlist = false,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const { formatCurrency } = useCurrency();

  const images = Array.isArray(product.images)
    ? product.images
    : [product.images];
  const hasMultipleImages = images.length > 1;

  const handlePreviousImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart?.(product.id);
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToWishlist?.(product.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onShare?.(product.id);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const discountPercentage = product.discountPrice
    ? Math.round(
        ((product.price - product.discountPrice) / product.price) * 100,
      )
    : 0;

  if (showCompactView) {
    return (
      <Link
        to={`/marketplace/products/${product.id}`}
        className="flex bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow active:bg-gray-50"
      >
        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          <img
            src={images[0] || "/placeholder-product.png"}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="ml-3 flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
            {product.name}
          </h3>
          <div className="flex items-center mb-1">
            <div className="flex items-center">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="text-xs text-gray-600 ml-1">
                {product.averageRating?.toFixed(1)} ({product.totalReviews})
              </span>
            </div>
            {product.boostLevel > 0 && (
              <div className="ml-2 px-1 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">
                <Zap className="w-3 h-3 inline" />
              </div>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              {product.discountPrice ? (
                <>
                  <span className="text-sm font-bold text-green-600">
                    {formatPrice(product.discountPrice)}
                  </span>
                  <span className="text-xs text-gray-500 line-through">
                    {formatPrice(product.price)}
                  </span>
                </>
              ) : (
                <span className="text-sm font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            <button
              onClick={handleAddToWishlist}
              className="p-1.5 rounded-full hover:bg-gray-100"
            >
              <Heart
                className={`w-4 h-4 ${
                  isInWishlist ? "text-red-500 fill-current" : "text-gray-400"
                }`}
              />
            </button>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/marketplace/products/${product.id}`} className="block">
        <div className="relative">
          {/* Image Container */}
          <div className="aspect-square bg-gray-100 relative overflow-hidden">
            {imageLoading && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
            <img
              src={images[currentImageIndex] || "/placeholder-product.png"}
              alt={product.name}
              className={`w-full h-full object-cover transition-opacity ${
                imageLoading ? "opacity-0" : "opacity-100"
              }`}
              onLoad={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
            />

            {/* Image Navigation */}
            {hasMultipleImages && (
              <>
                <button
                  onClick={handlePreviousImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {images.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentImageIndex
                          ? "bg-white"
                          : "bg-white bg-opacity-50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col space-y-1">
              {product.boostLevel > 0 && (
                <div className="px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full flex items-center">
                  <Zap className="w-3 h-3 mr-1" />
                  Boosted
                </div>
              )}
              {discountPercentage > 0 && (
                <div className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                  -{discountPercentage}%
                </div>
              )}
              {!product.inStock && (
                <div className="px-2 py-1 bg-gray-500 text-white text-xs font-medium rounded-full">
                  Out of Stock
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="absolute top-2 right-2 flex flex-col space-y-1">
              <button
                onClick={handleShare}
                className="w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-sm"
              >
                <Share className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={handleAddToWishlist}
                className="w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-sm"
              >
                <Heart
                  className={`w-4 h-4 ${
                    isInWishlist ? "text-red-500 fill-current" : "text-gray-600"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-3">
        <Link to={`/marketplace/products/${product.id}`}>
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3 h-3 ${
                  star <= (product.averageRating || 0)
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-600 ml-1">
            ({product.totalReviews || 0})
          </span>
          <div className="ml-auto flex items-center text-xs text-gray-500">
            <Eye className="w-3 h-3 mr-1" />
            {product.viewCount || 0}
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <div>
            {product.discountPrice ? (
              <div>
                <span className="text-lg font-bold text-green-600">
                  {formatPrice(product.discountPrice)}
                </span>
                <span className="text-sm text-gray-500 line-through ml-2">
                  {formatPrice(product.price)}
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center ${
              product.inStock
                ? "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            {product.inStock ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>

        {/* Product Type & Shipping */}
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span className="capitalize">{product.productType}</span>
          {product.productType === "physical" && (
            <span>Free shipping over {formatCurrency(50)}</span>
          )}
          {product.productType === "digital" && <span>Instant download</span>}
        </div>
      </div>
    </div>
  );
};
