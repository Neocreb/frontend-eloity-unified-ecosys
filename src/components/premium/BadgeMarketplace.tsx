import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, Lock, Zap, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BadgeProduct {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  price: number;
  billingCycle: 'monthly' | 'yearly' | 'one-time';
  color: string;
  features: string[];
  requirements: string[];
  popularity: 'popular' | 'trending' | 'new' | 'standard';
  bundleDiscount?: {
    withBadges: string[];
    discountPercent: number;
  };
}

const AVAILABLE_BADGES: BadgeProduct[] = [
  {
    id: 'freelance_badge',
    name: 'Freelance Badge',
    description: 'Boost your visibility as a verified freelancer',
    icon: '💼',
    price: 2.99,
    billingCycle: 'monthly',
    color: 'bg-blue-100 text-blue-800',
    features: [
      'Verified badge on profile',
      'Priority in freelance searches',
      'Boost visibility 50%',
      'Special freelancer profile design',
      'Customer testimonial highlights'
    ],
    requirements: [
      'Tier 2 verification (KYC completed)',
      'At least one completed job',
      '4+ star average rating'
    ],
    popularity: 'popular'
  },
  {
    id: 'ecommerce_badge',
    name: 'E-commerce Badge',
    description: 'Build trust and increase sales on the marketplace',
    icon: '🛍️',
    price: 4.99,
    billingCycle: 'monthly',
    color: 'bg-green-100 text-green-800',
    features: [
      'Verified seller badge',
      'Featured store banner',
      'Boost in search results 75%',
      'Trust seal on all listings',
      'Buyer confidence indicators',
      'Sales analytics dashboard'
    ],
    requirements: [
      'Tier 2 verification (KYC completed)',
      'Active store with products',
      '4.5+ seller rating'
    ],
    popularity: 'popular'
  },
  {
    id: 'crypto_badge',
    name: 'Crypto Badge',
    description: 'Show credibility as a verified crypto trader',
    icon: '₿',
    price: 9.99,
    billingCycle: 'monthly',
    color: 'bg-purple-100 text-purple-800',
    features: [
      'Verified crypto trader badge',
      'Priority in P2P order matching',
      'Higher trade limits',
      'Featured in trader directory',
      'Crypto analytics tools',
      'Advanced order types',
      'Risk management tools'
    ],
    requirements: [
      'Tier 2 verification (KYC completed)',
      'At least 10 completed trades',
      '4+ trading reputation score'
    ],
    popularity: 'trending'
  },
  {
    id: 'creator_verified',
    name: 'Creator Verified Badge',
    description: 'Unlock creator monetization and rewards',
    icon: '⭐',
    price: 1.99,
    billingCycle: 'monthly',
    color: 'bg-yellow-100 text-yellow-800',
    features: [
      'Creator verified badge',
      'Access to creator fund',
      '1.5x earnings multiplier',
      'Early access to creator programs',
      'Creator analytics',
      'Content promotion tools'
    ],
    requirements: [
      'Tier 2 verification (KYC completed)',
      '1000+ followers',
      'Minimum engagement rate'
    ],
    popularity: 'trending'
  },
  {
    id: 'business_verified',
    name: 'Business Verified Badge',
    description: 'Professional business credential',
    icon: '🏢',
    price: 7.99,
    billingCycle: 'monthly',
    color: 'bg-indigo-100 text-indigo-800',
    features: [
      'Business verified badge',
      'B2B marketplace access',
      'Bulk pricing tools',
      'Business account features',
      'Tax invoice generation',
      'Business analytics'
    ],
    requirements: [
      'Business registration documents',
      'Tier 2 verification (KYC completed)',
      'Active business account'
    ],
    popularity: 'new'
  },
  {
    id: 'super_seller',
    name: 'Super Seller Badge',
    description: 'Elite seller status with premium benefits',
    icon: '👑',
    price: 19.99,
    billingCycle: 'monthly',
    color: 'bg-red-100 text-red-800',
    features: [
      'Super seller elite badge',
      'Premium support 24/7',
      'Custom storefront design',
      'Advanced marketing tools',
      'Dedicated account manager',
      'Monthly growth consulting',
      'Marketing credits ($100/month)',
      'Free featured listings'
    ],
    requirements: [
      'E-commerce badge required',
      '100+ completed sales',
      '4.8+ seller rating',
      'Account in good standing'
    ],
    popularity: 'standard'
  }
];

interface BadgeMarketplaceProps {
  currentBadges?: string[];
  onBadgePurchase?: (badgeId: string) => void;
}

export default function BadgeMarketplace({
  currentBadges = [],
  onBadgePurchase
}: BadgeMarketplaceProps) {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'freelance' | 'seller' | 'crypto' | 'creator'>('all');
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredBadges = AVAILABLE_BADGES.filter(badge => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'freelance') return badge.id.includes('freelance');
    if (selectedCategory === 'seller') return ['ecommerce_badge', 'super_seller', 'business_verified'].includes(badge.id);
    if (selectedCategory === 'crypto') return badge.id.includes('crypto');
    if (selectedCategory === 'creator') return ['creator_verified'].includes(badge.id);
    return true;
  });

  const cartTotal = cartItems.reduce((sum, badgeId) => {
    const badge = AVAILABLE_BADGES.find(b => b.id === badgeId);
    return sum + (badge?.price || 0);
  }, 0);

  const calculateBundleDiscount = () => {
    const cartBadgeIds = new Set(cartItems);
    if (cartBadgeIds.size === 2) return 0.1; // 10%
    if (cartBadgeIds.size >= 3) return 0.2; // 20%
    return 0;
  };

  const bundleDiscount = calculateBundleDiscount();
  const discountAmount = cartTotal * bundleDiscount;
  const finalPrice = cartTotal - discountAmount;

  const toggleCartItem = (badgeId: string) => {
    setCartItems(prev => 
      prev.includes(badgeId)
        ? prev.filter(id => id !== badgeId)
        : [...prev, badgeId]
    );
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast({
        title: 'Empty Cart',
        description: 'Please select at least one badge to purchase'
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Redirect to checkout with selected badges
      // window.location.href = `/checkout?badges=${cartItems.join(',')}`;
      
      toast({
        title: 'Success',
        description: `Processing purchase of ${cartItems.length} badge(s)...`
      });
      
      // Clear cart after successful checkout
      setTimeout(() => {
        setCartItems([]);
        setIsProcessing(false);
      }, 2000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process checkout',
        variant: 'destructive'
      });
      setIsProcessing(false);
    }
  };

  const getPopularityBadge = (popularity: string) => {
    const styles: Record<string, string> = {
      popular: 'bg-red-100 text-red-800',
      trending: 'bg-orange-100 text-orange-800',
      new: 'bg-green-100 text-green-800',
      standard: 'bg-gray-100 text-gray-800'
    };
    return (
      <Badge className={styles[popularity]}>
        {popularity.charAt(0).toUpperCase() + popularity.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Badge Marketplace</h2>
        <p className="text-gray-600">
          Boost your credibility with verification badges. Get discounts when buying multiple badges!
        </p>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={(v: any) => setSelectedCategory(v)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Badges</TabsTrigger>
          <TabsTrigger value="freelance">Freelance</TabsTrigger>
          <TabsTrigger value="seller">Seller</TabsTrigger>
          <TabsTrigger value="crypto">Crypto</TabsTrigger>
          <TabsTrigger value="creator">Creator</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-6 mt-6">
          {/* Discount Alert */}
          {cartItems.length > 1 && (
            <Alert className="border-green-200 bg-green-50">
              <Zap className="h-4 w-4 text-green-600" />
              <AlertDescription className="ml-2 text-green-900">
                💚 Bundle Discount Applied! Save {(bundleDiscount * 100).toFixed(0)}% on your purchase
              </AlertDescription>
            </Alert>
          )}

          {/* Badges Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredBadges.map((badge) => {
              const isOwned = currentBadges.includes(badge.id);
              const isInCart = cartItems.includes(badge.id);

              return (
                <Card key={badge.id} className={isInCart ? 'ring-2 ring-blue-500' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-4xl">{badge.icon}</span>
                      {getPopularityBadge(badge.popularity)}
                    </div>
                    <CardTitle className="text-lg">{badge.name}</CardTitle>
                    <CardDescription>{badge.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Price */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold">${badge.price}</span>
                      <span className="text-gray-600">/{badge.billingCycle === 'monthly' ? 'month' : 'one-time'}</span>
                    </div>

                    {/* Features */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Features:</h4>
                      <ul className="space-y-1">
                        {badge.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Requirements */}
                    <div className="space-y-2 p-3 bg-gray-50 rounded">
                      <h4 className="font-semibold text-xs text-gray-900">Requirements:</h4>
                      <ul className="space-y-1">
                        {badge.requirements.map((req, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                            <Lock className="w-3 h-3 flex-shrink-0 mt-0.5" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* CTA */}
                    {isOwned ? (
                      <Button disabled className="w-full" variant="outline">
                        ✓ Already Owned
                      </Button>
                    ) : (
                      <Button
                        onClick={() => toggleCartItem(badge.id)}
                        variant={isInCart ? 'default' : 'outline'}
                        className="w-full"
                      >
                        {isInCart ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            In Cart
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Add to Cart
                          </>
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Shopping Cart Summary */}
      {cartItems.length > 0 && (
        <Card className="sticky bottom-0 bg-white border-t-2 border-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Items */}
              <div className="space-y-2">
                {cartItems.map(badgeId => {
                  const badge = AVAILABLE_BADGES.find(b => b.id === badgeId);
                  return (
                    <div key={badgeId} className="flex justify-between items-center text-sm">
                      <span>{badge?.name}</span>
                      <div className="flex items-center gap-3">
                        <span>${badge?.price}</span>
                        <button
                          onClick={() => toggleCartItem(badgeId)}
                          className="text-red-600 hover:text-red-800 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                {bundleDiscount > 0 && (
                  <div className="flex justify-between items-center text-green-600 mb-2">
                    <span>Bundle Discount ({(bundleDiscount * 100).toFixed(0)}%):</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total:</span>
                  <span>${finalPrice.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700 h-10"
              >
                {isProcessing ? 'Processing...' : `Checkout - ${cartItems.length} Badge${cartItems.length !== 1 ? 's' : ''}`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
