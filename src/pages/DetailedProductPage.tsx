import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import {
  Star,
  ShoppingCart,
  Heart,
  Share2,
  ArrowLeft,
  Plus,
  Minus,
  AlertCircle,
  Truck,
  Shield,
  RotateCcw,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/hooks/use-notification';
import { UnifiedActivityService } from '@/services/unifiedActivityService';

interface ProductDetails {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  currency: string;
  images: string[];
  seller: {
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
    rating: number;
    totalSales: number;
  };
  category: string;
  tags: string[];
  specifications: { label: string; value: string }[];
  reviews: {
    average: number;
    total: number;
    breakdown: { stars: number; count: number }[];
  };
  shipping: {
    free: boolean;
    cost?: number;
    estimatedDays: string;
  };
  stock: number;
  isAvailable: boolean;
  features: string[];
}

interface SuggestedProduct {
  id: string;
  name: string;
  price: number;
  currency: string;
  image: string;
  seller: string;
  rating: number;
}

const DetailedProductPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const notification = useNotification();
  
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [suggestedProducts, setSuggestedProducts] = useState<SuggestedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    loadProductDetails();
  }, [productId]);

  const loadProductDetails = async () => {
    setLoading(true);
    
    try {
      // Mock data based on productId
      if (productId === 'product1' || productId?.includes('nft')) {
        setProduct({
          id: productId || 'product1',
          name: 'Cyberpunk Digital Art NFT Collection',
          description: 'Hand-crafted NFT series featuring cyberpunk aesthetics. Each piece is unique and comes with unlockable content. Perfect for collectors and digital art enthusiasts. This collection represents the future of digital ownership and artistic expression.',
          price: 0.25,
          originalPrice: 0.35,
          currency: 'ETH',
          images: [
            'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
            'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
            'https://images.unsplash.com/photo-1642104704074-907c0698cbd9?w=800'
          ],
          seller: {
            name: 'ArtistCo Gallery',
            username: 'artistco_nft',
            avatar: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=150',
            verified: true,
            rating: 4.9,
            totalSales: 156
          },
          category: 'Digital Art',
          tags: ['NFT', 'Cyberpunk', 'Digital Art', 'Collectible', 'Exclusive'],
          specifications: [
            { label: 'Format', value: 'NFT (ERC-721)' },
            { label: 'Resolution', value: '4K (3840x2160)' },
            { label: 'File Type', value: 'PNG with metadata' },
            { label: 'Blockchain', value: 'Ethereum' },
            { label: 'Rights', value: 'Commercial use allowed' }
          ],
          reviews: {
            average: 4.8,
            total: 23,
            breakdown: [
              { stars: 5, count: 18 },
              { stars: 4, count: 4 },
              { stars: 3, count: 1 },
              { stars: 2, count: 0 },
              { stars: 1, count: 0 }
            ]
          },
          shipping: {
            free: true,
            estimatedDays: 'Instant digital delivery'
          },
          stock: 5,
          isAvailable: true,
          features: [
            'Unique 1-of-1 digital artwork',
            'High-resolution 4K quality',
            'Unlockable bonus content',
            'Commercial usage rights included',
            'Certificate of authenticity',
            'Lifetime ownership guarantee'
          ]
        });

        setSuggestedProducts([
          { id: 'product2', name: 'Abstract Digital Art', price: 0.15, currency: 'ETH', image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300', seller: 'DigitalArtist', rating: 4.7 },
          { id: 'product3', name: 'Futuristic Cityscape NFT', price: 0.3, currency: 'ETH', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300', seller: 'CyberCreator', rating: 4.6 },
          { id: 'product4', name: 'Neon Dreams Collection', price: 0.2, currency: 'ETH', image: 'https://images.unsplash.com/photo-1546074177-ffdda98d214f?w=300', seller: 'NeonArt', rating: 4.8 }
        ]);
      } else {
        // Product not found
        setProduct({
          id: productId || '',
          name: 'Product Not Available',
          description: 'This product is no longer available or has been removed.',
          price: 0,
          currency: 'USD',
          images: [],
          seller: {
            name: 'Unknown',
            username: 'unknown',
            avatar: '',
            verified: false,
            rating: 0,
            totalSales: 0
          },
          category: '',
          tags: [],
          specifications: [],
          reviews: { average: 0, total: 0, breakdown: [] },
          shipping: { free: false, estimatedDays: '' },
          stock: 0,
          isAvailable: false,
          features: []
        });

        setSuggestedProducts([
          { id: 'product5', name: 'Premium Digital Package', price: 49.99, currency: 'USD', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300', seller: 'TechStore', rating: 4.5 },
          { id: 'product6', name: 'Creative Software Bundle', price: 89.99, currency: 'USD', image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=300', seller: 'SoftwarePro', rating: 4.7 },
          { id: 'product7', name: 'Design Template Pack', price: 29.99, currency: 'USD', image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=300', seller: 'DesignHub', rating: 4.4 }
        ]);
      }
    } catch (error) {
      console.error('Failed to load product details:', error);
      notification.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      notification.error('Please log in to add items to cart');
      navigate('/auth');
      return;
    }

    if (!product?.isAvailable) {
      notification.error('This product is not available');
      return;
    }

    try {
      // Add to cart logic here
      notification.success('Added to cart!', {
        description: `${quantity} x ${product.name} added to your cart`
      });

      // Track activity
      await UnifiedActivityService.trackProductListing(
        user.id,
        product.id,
        {
          action: 'add_to_cart',
          quantity,
          price: product.price,
          currency: product.currency,
          source: 'detailed_page'
        }
      );

      // Navigate to cart
      navigate('/app/marketplace/cart');
    } catch (error) {
      notification.error('Failed to add to cart');
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      notification.error('Please log in to make purchases');
      navigate('/auth');
      return;
    }

    if (!product?.isAvailable) {
      notification.error('This product is not available');
      return;
    }

    try {
      const totalAmount = product.price * quantity;
      
      // Note: Purchase rewards will be awarded upon payment completion
      notification.success('Proceeding to checkout...', {
        description: 'Complete payment to earn Eloity Points rewards'
      });

      // Navigate to checkout with product data
      navigate('/app/marketplace/checkout', {
        state: {
          items: [{
            productId: product.id,
            name: product.name,
            price: product.price,
            currency: product.currency,
            quantity,
            seller: product.seller.name
          }]
        }
      });
    } catch (error) {
      notification.error('Failed to initiate purchase');
    }
  };

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
    notification.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleSuggestedProductClick = (suggestedProductId: string) => {
    navigate(`/app/marketplace/product/${suggestedProductId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <p className="text-muted-foreground mb-4">The product you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/app/marketplace')}>
            Browse Other Products
          </Button>
        </div>
      </div>
    );
  }

  if (!product.isAvailable) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <Card className="border-red-200 bg-red-50 mb-8">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-800 mb-2">Product No Longer Available</h2>
              <p className="text-red-600 mb-4">
                This product is out of stock or has been removed from our marketplace.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Similar Products You Might Like
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suggestedProducts.map((suggestedProduct) => (
                  <Card key={suggestedProduct.id} className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => handleSuggestedProductClick(suggestedProduct.id)}>
                    <CardContent className="p-4">
                      <img
                        src={suggestedProduct.image}
                        alt={suggestedProduct.name}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                      <h3 className="font-semibold mb-2">{suggestedProduct.name}</h3>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-bold text-green-600">
                          {suggestedProduct.price} {suggestedProduct.currency}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">{suggestedProduct.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">by {suggestedProduct.seller}</p>
                      <Button size="sm" className="w-full">
                        View Product
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={product.images[selectedImageIndex] || product.images[0]}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg"
              />
              {product.images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={() => setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))}
                    disabled={selectedImageIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={() => setSelectedImageIndex(Math.min(product.images.length - 1, selectedImageIndex + 1))}
                    disabled={selectedImageIndex === product.images.length - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className={`w-20 h-20 object-cover rounded cursor-pointer border-2 ${
                      selectedImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{product.category}</Badge>
                {product.seller.verified && (
                  <Badge className="bg-blue-500 text-white">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified Seller
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={product.seller.avatar} alt={product.seller.name} />
                    <AvatarFallback>{product.seller.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{product.seller.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span>{product.seller.rating} ({product.seller.totalSales} sales)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium">{product.reviews.average}</span>
                  <span className="text-muted-foreground">({product.reviews.total} reviews)</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-green-600">
                    {product.price} {product.currency}
                  </span>
                  {product.originalPrice && (
                    <span className="text-lg text-muted-foreground line-through">
                      {product.originalPrice} {product.currency}
                    </span>
                  )}
                </div>
                {product.originalPrice && (
                  <Badge variant="destructive">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Truck className="h-4 w-4 text-green-600" />
                <span>{product.shipping.free ? 'Free delivery' : `$${product.shipping.cost} shipping`}</span>
                <span className="text-muted-foreground">• {product.shipping.estimatedDays}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-blue-600" />
                <span>Secure payment & buyer protection</span>
              </div>

              <div className="text-sm">
                <span className="font-medium">Stock: </span>
                <span className={product.stock > 5 ? 'text-green-600' : 'text-orange-600'}>
                  {product.stock > 5 ? 'In stock' : `Only ${product.stock} left`}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center border-0"
                    min="1"
                    max={product.stock}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">
                  Max {product.stock} items
                </span>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleBuyNow}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  Buy Now - {(product.price * quantity).toFixed(2)} {product.currency}
                </Button>
                <Button
                  onClick={handleAddToCart}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleWishlistToggle}
                  className={isWishlisted ? 'text-red-500 border-red-500' : ''}
                >
                  <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {product.description}
                </p>

                <div className="space-y-4">
                  <h3 className="font-semibold">Key Features</h3>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator className="my-6" />

                <div>
                  <h3 className="font-semibold mb-4">Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.specifications.map((spec, index) => (
                      <div key={index} className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-muted-foreground">{spec.label}</span>
                        <span className="font-medium">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Similar Products</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {suggestedProducts.map((suggestedProduct) => (
                  <Card key={suggestedProduct.id} className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleSuggestedProductClick(suggestedProduct.id)}>
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <img
                          src={suggestedProduct.image}
                          alt={suggestedProduct.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm mb-1">{suggestedProduct.name}</h4>
                          <p className="text-xs text-muted-foreground mb-1">by {suggestedProduct.seller}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-green-600">
                              {suggestedProduct.price} {suggestedProduct.currency}
                            </span>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              <span className="text-xs">{suggestedProduct.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Seller Protection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>Money-back guarantee</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <RotateCcw className="h-4 w-4 text-blue-600" />
                  <span>30-day return policy</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                  <span>Verified seller</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedProductPage;
