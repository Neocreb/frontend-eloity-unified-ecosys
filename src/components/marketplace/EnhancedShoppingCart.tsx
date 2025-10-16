// @ts-nocheck
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ShoppingCart,
  Plus,
  Minus,
  X,
  Heart,
  Truck,
  CreditCard,
  Wallet,
  Bitcoin,
  DollarSign,
  Package,
  Clock,
  MapPin,
  Shield,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Gift,
  Percent,
} from "lucide-react";
import { useEnhancedMarketplace } from "@/contexts/EnhancedMarketplaceContext";
import { useWallet } from "@/contexts/WalletContext";
import { useToast } from "@/components/ui/use-toast";
import { CartItem, Address, PaymentMethod } from "@/types/enhanced-marketplace";

interface EnhancedShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
}

const EnhancedShoppingCart: React.FC<EnhancedShoppingCartProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    cart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    moveToWishlist,
    calculateShipping,
    calculateTax,
    applyPromotion,
    removePromotion,
    validateCart,
    checkout,
    expressCheckout,
  } = useEnhancedMarketplace();

  const { balances, sendPayment, getPaymentMethods } = useWallet();

  const { toast } = useToast();

  const [step, setStep] = useState<"cart" | "shipping" | "payment" | "review">(
    "cart",
  );
  const [shippingAddress, setShippingAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [orderNotes, setOrderNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);

  const subtotal = getCartTotal();
  const total =
    subtotal + shippingCost + taxAmount - (appliedPromo?.discountAmount || 0);

  const handleQuantityChange = (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(cartItemId);
    } else {
      updateCartItem(cartItemId, { quantity: newQuantity });
    }
  };

  const handleMoveToWishlist = async (cartItemId: string) => {
    try {
      await moveToWishlist(cartItemId);
      toast({
        title: "Moved to Wishlist",
        description: "Item has been moved to your wishlist",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to move item to wishlist",
        variant: "destructive",
      });
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;

    try {
      const promotion = await applyPromotion(promoCode);
      setAppliedPromo(promotion);
      toast({
        title: "Promo Code Applied",
        description: `You saved $${promotion.value || 0}!`,
      });
    } catch (error) {
      toast({
        title: "Invalid Promo Code",
        description: "The promo code you entered is not valid",
        variant: "destructive",
      });
    }
  };

  const handleRemovePromo = () => {
    removePromotion();
    setAppliedPromo(null);
    setPromoCode("");
  };

  const handleProceedToShipping = async () => {
    const validation = await validateCart();
    if (!validation.valid) {
      toast({
        title: "Cart Validation Failed",
        description: validation.issues.join(", "),
        variant: "destructive",
      });
      return;
    }
    setStep("shipping");
  };

  const handleProceedToPayment = async () => {
    if (!shippingAddress) {
      toast({
        title: "Shipping Address Required",
        description: "Please select a shipping address",
        variant: "destructive",
      });
      return;
    }

    // Calculate shipping and tax
    const shipping = await calculateShipping(cart, shippingAddress);
    const tax = await calculateTax(cart, shippingAddress);
    setShippingCost(shipping);
    setTaxAmount(tax);
    setStep("payment");
  };

  const handleProceedToReview = () => {
    if (!paymentMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method",
        variant: "destructive",
      });
      return;
    }
    setStep("review");
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    try {
      const order = await checkout(
        paymentMethod,
        shippingAddress?.id,
        shippingAddress?.id,
        promoCode,
      );

      toast({
        title: "Order Placed Successfully!",
        description: `Order #${order.orderNumber} has been created`,
      });

      // Reset cart and close
      clearCart();
      onClose();
      setStep("cart");
    } catch (error) {
      toast({
        title: "Order Failed",
        description: "There was an error processing your order",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const renderCartStep = () => (
    <div className="space-y-4">
      {cart.length === 0 ? (
        <div className="text-center py-8">
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
          <p className="text-muted-foreground mb-4">
            Add some products to get started
          </p>
          <Button onClick={onClose}>Continue Shopping</Button>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="space-y-3 max-h-[50vh] sm:max-h-[400px] overflow-y-auto">
            {cart.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <img
                      src={item.product?.image}
                      alt={item.product?.name}
                      className="w-full sm:w-16 h-32 sm:h-16 rounded object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm sm:text-base line-clamp-2">
                        {item.product?.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        ${item.priceSnapshot.toFixed(2)} each
                      </p>
                      {item.variantId && (
                        <Badge variant="secondary" className="mt-1">
                          Variant: {item.variantId}
                        </Badge>
                      )}
                      {item.customOptions &&
                        Object.keys(item.customOptions).length > 0 && (
                          <div className="mt-1">
                            {Object.entries(item.customOptions).map(
                              ([key, value]) => (
                                <Badge
                                  key={key}
                                  variant="outline"
                                  className="mr-1 text-xs"
                                >
                                  {key}: {String(value)}
                                </Badge>
                              ),
                            )}
                          </div>
                        )}
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2">
                      <div className="flex items-center gap-2 order-2 sm:order-1">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          className="h-8 w-8"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity + 1)
                          }
                          className="h-8 w-8"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex flex-col items-end order-1 sm:order-2 gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(item.id)}
                          className="h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <p className="font-semibold text-sm sm:text-base">
                          ${(item.priceSnapshot * item.quantity).toFixed(2)}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMoveToWishlist(item.id)}
                          className="text-xs p-1 h-auto"
                        >
                          <Heart className="h-3 w-3 mr-1" />
                          <span className="hidden sm:inline">
                            Save for Later
                          </span>
                          <span className="sm:hidden">Save</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                  {item.notes && (
                    <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                      <strong>Notes:</strong> {item.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Promo Code */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    disabled={!!appliedPromo}
                  />
                </div>
                {appliedPromo ? (
                  <Button variant="outline" onClick={handleRemovePromo}>
                    Remove
                  </Button>
                ) : (
                  <Button onClick={handleApplyPromo}>Apply</Button>
                )}
              </div>
              {appliedPromo && (
                <div className="mt-2 flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">
                    Promo code applied! You saved ${appliedPromo.value || 0}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal ({getCartItemsCount()} items)</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedPromo.code})</span>
                    <span>
                      -${appliedPromo.discountAmount?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>
                    $
                    {(subtotal - (appliedPromo?.discountAmount || 0)).toFixed(
                      2,
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button variant="outline" onClick={clearCart} className="flex-1">
              Clear Cart
            </Button>
            <Button onClick={handleProceedToShipping} className="flex-1">
              Proceed to Checkout
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </>
      )}
    </div>
  );

  const renderShippingStep = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Shipping Address</h3>
      </div>

      {/* Quick address form - in real app this would be address selection */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" placeholder="John" />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" placeholder="Doe" />
            </div>
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input id="address" placeholder="123 Main St" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" placeholder="New York" />
            </div>
            <div>
              <Label htmlFor="zip">ZIP Code</Label>
              <Input id="zip" placeholder="10001" />
            </div>
          </div>
          <div>
            <Label htmlFor="country">Country</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="us">United States</SelectItem>
                <SelectItem value="ca">Canada</SelectItem>
                <SelectItem value="uk">United Kingdom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Options */}
      <Card>
        <CardHeader>
          <h4 className="font-medium flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Shipping Options
          </h4>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <div>
              <p className="font-medium">Standard Shipping</p>
              <p className="text-sm text-muted-foreground">5-7 business days</p>
            </div>
            <span className="font-semibold">Free</span>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <div>
              <p className="font-medium">Express Shipping</p>
              <p className="text-sm text-muted-foreground">2-3 business days</p>
            </div>
            <span className="font-semibold">$12.99</span>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <div>
              <p className="font-medium">Next Day Delivery</p>
              <p className="text-sm text-muted-foreground">1 business day</p>
            </div>
            <span className="font-semibold">$24.99</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setStep("cart")}
          className="flex-1"
        >
          Back to Cart
        </Button>
        <Button
          onClick={handleProceedToPayment}
          className="flex-1"
          disabled={!shippingAddress}
        >
          Continue to Payment
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Payment Method</h3>
      </div>

      {/* Wallet Balance */}
      <Card>
        <CardHeader>
          <h4 className="font-medium flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Wallet Balance
          </h4>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span>USDT</span>
              </div>
              <span className="font-semibold">{balances?.usdt || "0.00"}</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Bitcoin className="h-4 w-4 text-orange-600" />
                <span>BTC</span>
              </div>
              <span className="font-semibold">
                {balances?.btc || "0.000000"}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-blue-600" />
              <span>Eloity Points</span>
            </div>
            <span className="font-semibold">{balances?.eloityPoints || "0"}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div
            className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
              paymentMethod === "wallet_usdt"
                ? "border-blue-500 bg-blue-50"
                : ""
            }`}
            onClick={() => setPaymentMethod("wallet_usdt")}
          >
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Pay with USDT</p>
                <p className="text-sm text-muted-foreground">
                  Balance: {balances?.usdt || "0.00"} USDT
                </p>
              </div>
            </div>
            {parseFloat(balances?.usdt || "0") >= total && (
              <CheckCircle className="h-5 w-5 text-green-600" />
            )}
          </div>

          <div
            className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
              paymentMethod === "eloity_points"
                ? "border-blue-500 bg-blue-50"
                : ""
            }`}
            onClick={() => setPaymentMethod("eloity_points")}
          >
            <div className="flex items-center gap-3">
              <Gift className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Pay with Eloity Points</p>
                <p className="text-sm text-muted-foreground">
                  Balance: {balances?.eloityPoints || "0"} SP
                </p>
              </div>
            </div>
            {parseFloat(balances?.eloityPoints || "0") >= total && (
              <CheckCircle className="h-5 w-5 text-green-600" />
            )}
          </div>

          <div
            className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
              paymentMethod === "wallet_btc" ? "border-blue-500 bg-blue-50" : ""
            }`}
            onClick={() => setPaymentMethod("wallet_btc")}
          >
            <div className="flex items-center gap-3">
              <Bitcoin className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium">Pay with Bitcoin</p>
                <p className="text-sm text-muted-foreground">
                  Balance: {balances?.btc || "0.000000"} BTC
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Notes */}
      <Card>
        <CardContent className="p-4">
          <Label htmlFor="notes">Order Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Special instructions for your order..."
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
            className="mt-2"
          />
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setStep("shipping")}
          className="flex-1"
        >
          Back to Shipping
        </Button>
        <Button onClick={handleProceedToReview} className="flex-1">
          Review Order
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Review Your Order</h3>
      </div>

      {/* Order Items Summary */}
      <Card>
        <CardHeader>
          <h4 className="font-medium">Order Items</h4>
        </CardHeader>
        <CardContent className="space-y-3">
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between">
              <div>
                <p className="font-medium">{item.product?.name}</p>
                <p className="text-sm text-muted-foreground">
                  Qty: {item.quantity}
                </p>
              </div>
              <span>${(item.priceSnapshot * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Final Order Summary */}
      <Card>
        <CardHeader>
          <h4 className="font-medium">Order Summary</h4>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>${shippingCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>${taxAmount.toFixed(2)}</span>
          </div>
          {appliedPromo && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-${appliedPromo.discountAmount?.toFixed(2) || "0.00"}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setStep("payment")}
          className="flex-1"
        >
          Back to Payment
        </Button>
        <Button
          onClick={handlePlaceOrder}
          className="flex-1"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </div>
          ) : (
            <>
              Place Order
              <Shield className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (step) {
      case "cart":
        return renderCartStep();
      case "shipping":
        return renderShippingStep();
      case "payment":
        return renderPaymentStep();
      case "review":
        return renderReviewStep();
      default:
        return renderCartStep();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full h-full sm:w-auto sm:h-auto sm:max-w-[600px] lg:max-w-[800px] max-h-[100vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            {step === "cart" && "Shopping Cart"}
            {step === "shipping" && "Shipping Information"}
            {step === "payment" && "Payment Method"}
            {step === "review" && "Review Order"}
          </DialogTitle>
          <DialogDescription>
            {step === "cart" && `${getCartItemsCount()} items in your cart`}
            {step === "shipping" && "Enter your shipping details"}
            {step === "payment" && "Choose your payment method"}
            {step === "review" && "Review your order before placing it"}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-4 md:mb-6 px-2">
          {["cart", "shipping", "payment", "review"].map((stepName, index) => (
            <div key={stepName} className="flex items-center">
              <div
                className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-medium ${
                  step === stepName
                    ? "bg-blue-500 text-white"
                    : ["cart", "shipping", "payment", "review"].indexOf(step) >
                        index
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-600"
                }`}
              >
                {index + 1}
              </div>
              {index < 3 && (
                <div
                  className={`w-6 md:w-12 h-1 mx-1 md:mx-2 ${
                    ["cart", "shipping", "payment", "review"].indexOf(step) >
                    index
                      ? "bg-green-500"
                      : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {renderStepContent()}
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedShoppingCart;
