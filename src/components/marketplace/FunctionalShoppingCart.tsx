import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingCart,
  Plus,
  Minus,
  X,
  Heart,
  Truck,
  CreditCard,
  ArrowRight,
  ArrowLeft,
  Package,
  Clock,
  Shield,
  Percent,
  Save,
  Bell,
  Trash2,
  Share2,
  Gift,
  AlertCircle,
} from "lucide-react";
import { useEnhancedMarketplace } from "@/contexts/EnhancedMarketplaceContext";
import { useToast } from "@/components/ui/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";
import { cn } from "@/lib/utils";

interface FunctionalShoppingCartProps {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

interface PriceAlert {
  productId: string;
  targetPrice: number;
  emailNotification: boolean;
}

export const FunctionalShoppingCart: React.FC<FunctionalShoppingCartProps> = ({
  isOpen,
  onClose,
  className,
}) => {
  const navigate = useNavigate();
  const {
    cart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    moveToWishlist,
    applyPromotion,
    removePromotion,
    validateCart,
  } = useEnhancedMarketplace();

  const { toast } = useToast();
  const { formatCurrency } = useCurrency();

  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bulkAction, setBulkAction] = useState<"save" | "delete" | null>(null);
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});
  const [priceAlerts, setPriceAlerts] = useState<Record<string, PriceAlert>>({});
  const [showPriceAlertForm, setShowPriceAlertForm] = useState<string | null>(null);
  const [targetPrice, setTargetPrice] = useState("");

  // Initialize selected items
  useEffect(() => {
    const initialSelected: Record<string, boolean> = {};
    cart.forEach(item => {
      initialSelected[item.id] = false;
    });
    setSelectedItems(initialSelected);
  }, [cart]);

  const subtotal = getCartTotal();
  const shippingCost = subtotal > 50 ? 0 : subtotal > 0 ? 9.99 : 0;
  const taxAmount = subtotal * 0.08; // 8% tax
  const discountAmount = appliedPromo?.discountAmount || 0;
  const total = subtotal + shippingCost + taxAmount - discountAmount;

  const handleQuantityChange = (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(cartItemId);
      return;
    }

    updateCartItem(cartItemId, { quantity: newQuantity });
  };

  const handleRemoveItem = (cartItemId: string) => {
    removeFromCart(cartItemId);
    toast({
      title: "Item Removed",
      description: "Item has been removed from your cart",
    });
  };

  const handleMoveToWishlist = async (cartItemId: string) => {
    const cartItem = cart.find((item) => item.id === cartItemId);
    if (cartItem) {
      await moveToWishlist(cartItemId);
      toast({
        title: "Moved to Wishlist",
        description: `${cartItem.product?.name} moved to your wishlist`,
      });
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;

    try {
      const promotion = await applyPromotion(promoCode);
      if (promotion && promotion.active) {
        setAppliedPromo({
          code: promoCode.toUpperCase(),
          discountAmount: promotion.value,
          description: promotion.description,
        });
        toast({
          title: "Promo Applied",
          description: promotion.description,
        });
      } else {
        toast({
          title: "Invalid Promo Code",
          description: "Please check your promo code and try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to apply promo code. Please try again",
        variant: "destructive",
      });
    }
  };

  const handleRemovePromo = () => {
    removePromotion();
    setAppliedPromo(null);
    setPromoCode("");
    toast({
      title: "Promo Removed",
      description: "Promo code has been removed from your cart",
    });
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart before checkout",
        variant: "destructive",
      });
      return;
    }

    // Validate cart before checkout
    try {
      const validation = await validateCart();
      if (!validation.valid) {
        toast({
          title: "Cart Validation Failed",
          description: validation.issues.join(", "),
          variant: "destructive",
        });
        return;
      }

      setIsProcessing(true);

      // Simulate checkout process
      setTimeout(() => {
        setIsProcessing(false);
        navigate("/app/marketplace/checkout");
      }, 1000);
    } catch (error) {
      toast({
        title: "Checkout Error",
        description: "Failed to process checkout. Please try again",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const handleBulkAction = () => {
    if (!bulkAction) return;

    const selectedIds = Object.keys(selectedItems).filter(id => selectedItems[id]);

    if (selectedIds.length === 0) {
      toast({
        title: "No Items Selected",
        description: "Please select items to perform bulk action",
        variant: "destructive",
      });
      return;
    }

    if (bulkAction === "delete") {
      selectedIds.forEach(id => removeFromCart(id));
      toast({
        title: "Items Removed",
        description: `${selectedIds.length} items removed from cart`,
      });
    } else if (bulkAction === "save") {
      selectedIds.forEach(id => handleMoveToWishlist(id));
      toast({
        title: "Items Saved",
        description: `${selectedIds.length} items moved to wishlist`,
      });
    }

    // Reset selection
    const resetSelected: Record<string, boolean> = {};
    cart.forEach(item => {
      resetSelected[item.id] = false;
    });
    setSelectedItems(resetSelected);
    setBulkAction(null);
  };

  const handleSetPriceAlert = (productId: string) => {
    if (!targetPrice) return;

    const alert: PriceAlert = {
      productId,
      targetPrice: parseFloat(targetPrice),
      emailNotification: true,
    };

    setPriceAlerts(prev => ({ ...prev, [productId]: alert }));
    setShowPriceAlertForm(null);
    setTargetPrice("");
    
    toast({
      title: "Price Alert Set",
      description: "You'll be notified when the price drops to your target",
    });
  };

  const areAllSelected = Object.values(selectedItems).every(selected => selected);
  const isAnySelected = Object.values(selectedItems).some(selected => selected);

  const toggleSelectAll = () => {
    const newSelected: Record<string, boolean> = {};
    const shouldSelectAll = !areAllSelected;
    
    cart.forEach(item => {
      newSelected[item.id] = shouldSelectAll;
    });
    
    setSelectedItems(newSelected);
  };

  if (cart.length === 0) {
    return (
      <div className={cn("max-w-4xl mx-auto p-6", className)}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-bold">Your Cart</h1>
              <p className="text-gray-600">Ready to checkout?</p>
            </div>
          </div>
        </div>

        <Card className="text-center py-16">
          <CardContent>
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-6">
              Add some amazing products to get started!
            </p>
            <Button
              onClick={() => navigate("/app/marketplace")}
              className="bg-black hover:bg-gray-800 text-white"
            >
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("max-w-6xl mx-auto p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold">Your Cart</h1>
            <p className="text-gray-600">
              {getCartItemsCount()}{" "}
              {getCartItemsCount() === 1 ? "item" : "items"}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate("/app/marketplace/wishlist")}
        >
          <Heart className="w-4 h-4 mr-2" />
          View Wishlist
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {/* Bulk Actions */}
          {cart.length > 1 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={areAllSelected}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                    />
                    <span className="text-sm font-medium">
                      {areAllSelected ? "Deselect all" : "Select all"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={bulkAction || ""}
                      onChange={(e) => setBulkAction(e.target.value as "save" | "delete" | null)}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="">Bulk actions</option>
                      <option value="save">Save for later</option>
                      <option value="delete">Delete selected</option>
                    </select>
                    <Button 
                      size="sm" 
                      onClick={handleBulkAction}
                      disabled={!isAnySelected || !bulkAction}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Cart Items</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Cart
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedItems[item.id] || false}
                      onChange={(e) => setSelectedItems(prev => ({
                        ...prev,
                        [item.id]: e.target.checked
                      }))}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                    />
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.product?.image}
                        alt={item.product?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {item.product?.name}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      {item.product?.shortDescription ||
                        item.product?.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-semibold text-green-600">
                        {formatPrice(item.priceSnapshot)}
                      </span>
                      {item.product?.price && item.product.price > item.priceSnapshot && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(item.product.price)}
                        </span>
                      )}
                    </div>
                    
                    {/* Price Alert */}
                    {priceAlerts[item.productId] ? (
                      <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                        <Bell className="w-4 h-4" />
                        <span>
                          Price alert set at {formatPrice(priceAlerts[item.productId].targetPrice)}
                        </span>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPriceAlertForm(
                          showPriceAlertForm === item.productId ? null : item.productId
                        )}
                        className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                      >
                        <Bell className="w-3 h-3 mr-1" />
                        Set price alert
                      </Button>
                    )}
                    
                    {/* Price Alert Form */}
                    {showPriceAlertForm === item.productId && (
                      <div className="mt-2 flex gap-2">
                        <Input
                          type="number"
                          placeholder="Target price"
                          value={targetPrice}
                          onChange={(e) => setTargetPrice(e.target.value)}
                          className="w-24 text-sm"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleSetPriceAlert(item.productId)}
                        >
                          Set
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-gray-400 hover:text-red-600 w-8 h-8"
                    >
                      <X className="w-4 h-4" />
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                        className="w-8 h-8"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity + 1)
                        }
                        className="w-8 h-8"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveToWishlist(item.id)}
                      className="text-xs text-gray-600 hover:text-gray-800"
                    >
                      <Heart className="w-3 h-3 mr-1" />
                      Save for later
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  <span>Shipping</span>
                </div>
                <span className={shippingCost === 0 ? "text-green-600" : ""}>
                  {shippingCost === 0 ? "FREE" : formatPrice(shippingCost)}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatPrice(taxAmount)}</span>
              </div>

              {appliedPromo && (
                <div className="flex justify-between items-center text-green-600">
                  <div>
                    <span>Discount ({appliedPromo.code})</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemovePromo}
                      className="ml-2 h-4 w-4 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  <span>-{formatPrice(appliedPromo.discountAmount)}</span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>

              {/* Promo Code */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={handleApplyPromo}>
                    Apply
                  </Button>
                </div>
                {appliedPromo && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Percent className="w-4 h-4" />
                    <span>{appliedPromo.description}</span>
                  </div>
                )}
              </div>

              {/* Security Badge */}
              <div className="flex items-center gap-2 text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
                <Shield className="w-4 h-4 text-green-600" />
                <span>Secure 256-bit SSL encryption</span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full bg-black hover:bg-gray-800 text-white h-12"
              >
                {isProcessing ? (
                  "Processing..."
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/app/marketplace")}
                className="w-full"
              >
                Continue Shopping
              </Button>
            </CardFooter>
          </Card>

          {/* Shipping Info */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Truck className="w-4 h-4 text-green-600" />
                  <span>Free shipping on orders over {formatCurrency(50)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Estimated delivery: 3-5 business days</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Package className="w-4 h-4 text-purple-600" />
                  <span>30-day return policy</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Options */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Gift className="w-4 h-4 mr-2" />
                Add gift wrapping
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Share2 className="w-4 h-4 mr-2" />
                Share cart
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Save className="w-4 h-4 mr-2" />
                Save cart for later
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FunctionalShoppingCart;
