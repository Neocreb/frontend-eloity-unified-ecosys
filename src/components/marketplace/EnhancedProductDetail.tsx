import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Heart, Share2, ShoppingCart, Eye, MessageCircle, ChevronLeft, ChevronRight, Zap, Shield, Truck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ProductService } from '@/services/productService';
import { ReviewService } from '@/services/reviewService';
import { QAService } from '@/services/qaService';
import DigitalProductDetail from './DigitalProductDetail';

interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
}

interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  content: string;
  images?: string[];
  verified: boolean;
  helpful: number;
  reported: boolean;
  sellerResponse?: {
    content: string;
    createdAt: string;
  };
  createdAt: string;
  updatedAt?: string;
}

interface ProductQA {
  id: string;
  question: string;
  answer?: string;
  userId: string;
  userName: string;
  answeredBy?: string;
  answeredAt?: string;
  createdAt: string;
  helpful: number;
}

interface RelatedProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  reviewCount?: number;
}

interface EnhancedProductDetailProps {
  productId: string;
}

const EnhancedProductDetail: React.FC<EnhancedProductDetailProps> = ({ productId }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [questions, setQuestions] = useState<ProductQA[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, title: '', content: '', images: [] });
  const [newQuestion, setNewQuestion] = useState('');
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadProductData();
  }, [productId]);

  const loadProductData = async () => {
    try {
      setLoading(true);
      
      // Load product data
      const productData = await ProductService.getProductById(productId);
      setProduct(productData);
      
      // Load reviews
      const reviewsData = await ReviewService.getProductReviews(productId);
      setReviews(reviewsData as ProductReview[]);
      
      // Load Q&A
      const qaData = await QAService.getProductQuestions(productId);
      setQuestions(qaData);
      
      // Load related products
      const relatedData = await ProductService.getRelatedProducts(productId);
      setRelatedProducts(relatedData.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        rating: product.rating,
        reviewCount: product.reviewCount
      })));
    } catch (error) {
      console.error("Error loading product data:", error);
      toast({
        title: "Error",
        description: "Failed to load product data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    toast({
      title: "Added to Cart",
      description: `${quantity} ${product?.name} added to your cart`
    });
  };

  const handleBuyNow = () => {
    toast({
      title: "Quick Purchase",
      description: "Redirecting to checkout..."
    });
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? "Removed from Wishlist" : "Added to Wishlist",
      description: isWishlisted ? "Item removed from your wishlist" : "Item saved to your wishlist"
    });
  };

  const handleSubmitReview = () => {
    if (!newReview.title || !newReview.content) {
      toast({
        title: "Error",
        description: "Please fill in all review fields",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Review Submitted",
      description: "Thank you for your review!"
    });
    setNewReview({ rating: 5, title: '', content: '', images: [] });
  };

  const handleSubmitQuestion = () => {
    if (!newQuestion.trim()) {
      toast({
        title: "Error",
        description: "Please enter your question",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Question Submitted",
      description: "Your question has been submitted and will be answered soon."
    });
    setNewQuestion('');
  };

  const nextImage = () => {
    if (product?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product?.images) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-gray-500">Product not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
            <img
              src={product.images?.[currentImageIndex]?.url || product.image}
              alt={product.images?.[currentImageIndex]?.alt || product.name}
              className="w-full h-full object-cover transition-transform duration-300"
              style={{ transform: `scale(${zoomLevel})` }}
            />
            
            {/* Image Navigation */}
            {product.images && product.images.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={prevImage}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={nextImage}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}
            
            {/* Zoom Controls */}
            <div className="absolute bottom-2 right-2 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoomLevel(Math.max(1, zoomLevel - 0.2))}
              >
                -
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.2))}
              >
                +
              </Button>
            </div>
          </div>
          
          {/* Thumbnail Images */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((image: ProductImage, index: number) => (
                <button
                  key={image.id}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    index === currentImageIndex ? 'border-blue-500' : 'border-gray-200'
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <img src={image.url} alt={image.alt} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{product.brand}</Badge>
              {product.seller?.verified && (
                <Badge variant="outline" className="text-green-600">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified Seller
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                {renderStars(product.rating)}
                <span className="text-sm text-gray-600 ml-1">
                  {product.rating} ({product.reviewCount} reviews)
                </span>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-green-600">
              {product.discountPrice ? `$${product.discountPrice}` : `$${product.price}`}
            </span>
            {product.originalPrice && product.discountPrice && (
              <>
                <span className="text-xl text-gray-500 line-through">${product.originalPrice}</span>
                <Badge variant="destructive">
                  {Math.round(((product.originalPrice - product.discountPrice) / product.originalPrice) * 100)}% OFF
                </Badge>
              </>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            {product.inStock ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-600">In Stock ({product.stockCount || 'Available'} available)</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-red-600">Out of Stock</span>
              </>
            )}
          </div>

          {/* Shipping Info */}
          {product.shipping && (
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
              <Truck className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium">
                  {product.shipping.free ? 'Free Shipping' : 'Shipping Available'}
                </p>
                <p className="text-sm text-gray-600">
                  Estimated delivery: {product.shipping.estimatedDays} business days
                </p>
              </div>
            </div>
          )}

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">Color</h3>
              <div className="flex gap-2">
                {product.variants.map((variant: any) => (
                  <button
                    key={variant.id}
                    className={`w-10 h-10 rounded-full border-2 ${
                      selectedVariant === variant.id ? 'border-blue-500' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: variant.color }}
                    onClick={() => setSelectedVariant(variant.id)}
                    title={variant.name}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Actions */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label htmlFor="quantity" className="font-medium">Quantity:</label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={product.stockCount}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20"
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={handleAddToCart} className="flex-1">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
              <Button onClick={handleBuyNow} variant="outline" className="flex-1">
                <Zap className="w-4 h-4 mr-2" />
                Buy Now
              </Button>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleWishlist} className="flex-1">
                <Heart className={`w-4 h-4 mr-2 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
              </Button>
              <Button variant="outline" size="icon">
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setIsComparing(!isComparing)}>
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <Tabs defaultValue="description" className="mb-8">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({product.reviewCount})</TabsTrigger>
          <TabsTrigger value="qa">Q&A ({questions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-700 mb-4">{product.description}</p>
              {product.features && (
                <>
                  <h4 className="font-medium mb-3">Key Features:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {product.features.map((feature: string, index: number) => (
                      <li key={index} className="text-gray-700">{feature}</li>
                    ))}
                  </ul>
                </>
              )}
              
              {/* Digital Product Details */}
              {product.productType === 'digital' && (
                <div className="mt-6">
                  <DigitalProductDetail product={product} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specifications" className="mt-4">
          <Card>
            <CardContent className="p-6">
              {product.specifications ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b">
                      <span className="font-medium">{key}:</span>
                      <span className="text-gray-700">{String(value)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No specifications available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="mt-4">
          <div className="space-y-6">
            {/* Review Summary */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold">{product.rating}</div>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      {renderStars(product.rating)}
                    </div>
                    <div className="text-sm text-gray-600">{product.reviewCount} reviews</div>
                  </div>
                  <div className="flex-1">
                    {[5, 4, 3, 2, 1].map((stars) => (
                      <div key={stars} className="flex items-center gap-2 mb-1">
                        <span className="text-sm">{stars}</span>
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full" 
                            style={{ width: `${Math.random() * 80 + 10}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Write Review */}
                <div className="border-t pt-6">
                  <h4 className="font-medium mb-3">Write a Review</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Rating</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setNewReview({ ...newReview, rating: star })}
                          >
                            <Star
                              className={`w-5 h-5 ${
                                star <= newReview.rating 
                                  ? 'fill-yellow-400 text-yellow-400' 
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <Input
                      placeholder="Review title"
                      value={newReview.title}
                      onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                    />
                    <Textarea
                      placeholder="Share your experience with this product..."
                      value={newReview.content}
                      onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                    />
                    <Button onClick={handleSubmitReview}>Submit Review</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews List */}
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <img
                      src={review.userAvatar}
                      alt={review.userName}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{review.userName}</span>
                        {review.verified && (
                          <Badge variant="outline" className="text-xs">Verified Purchase</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex gap-1">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-sm text-gray-600">{review.createdAt}</span>
                      </div>
                      <p className="text-gray-700 mb-3">{review.content}</p>
                      {review.images && review.images.length > 0 && (
                        <div className="flex gap-2 mb-3">
                          {review.images.map((img, index) => (
                            <img
                              key={index}
                              src={img}
                              alt="Review"
                              className="w-16 h-16 rounded object-cover"
                            />
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm">
                          👍 Helpful ({review.helpful})
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="qa" className="mt-4">
          <div className="space-y-6">
            {/* Ask Question */}
            <Card>
              <CardContent className="p-6">
                <h4 className="font-medium mb-3">Ask a Question</h4>
                <div className="flex gap-3">
                  <Input
                    placeholder="What would you like to know about this product?"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleSubmitQuestion}>Ask</Button>
                </div>
              </CardContent>
            </Card>

            {/* Q&A List */}
            {questions.map((qa) => (
              <Card key={qa.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">Q:</span>
                        <span className="text-gray-700">{qa.question}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Asked by {qa.userName} on {qa.createdAt}
                      </div>
                    </div>
                    {qa.answer && (
                      <div className="pl-4 border-l-2 border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-blue-600">A:</span>
                          <span className="text-gray-700">{qa.answer}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Answered by {qa.answeredBy} on {qa.answeredAt}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-4 pt-2">
                      <Button variant="ghost" size="sm">
                        👍 Helpful ({qa.helpful})
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Related Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((product) => (
                <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full aspect-square object-cover rounded mb-3"
                  />
                  <h4 className="font-medium mb-2 line-clamp-2">{product.name}</h4>
                  <div className="flex items-center gap-1 mb-2">
                    {renderStars(product.rating)}
                    <span className="text-xs text-gray-600">({product.reviewCount || 0})</span>
                  </div>
                  <p className="font-bold text-green-600">{product.price}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedProductDetail;