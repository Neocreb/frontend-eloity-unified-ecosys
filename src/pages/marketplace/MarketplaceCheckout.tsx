// @ts-nocheck
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  ChevronLeft,
  CreditCard,
  CheckCircle,
  ArrowRight,
  Wallet,
  Banknote,
  Package,
  Bitcoin,
  Zap,
  Truck,
  MapPin,
  Clock,
  Star,
  Shield,
  Info
} from "lucide-react";
import { useEnhancedMarketplace } from "@/contexts/EnhancedMarketplaceContext";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import UniversalCryptoPaymentModal from "@/components/payments/UniversalCryptoPaymentModal";
import DeliveryProviderSelection from "@/components/delivery/DeliveryProviderSelection";
import { type PaymentRequest } from "@/services/unifiedCryptoPaymentService";

const MarketplaceCheckout = () => {
  const { cart, getCartTotal, checkout, clearCart } = useEnhancedMarketplace();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [showCryptoPayment, setShowCryptoPayment] = useState(false);
  const [showDeliverySelection, setShowDeliverySelection] = useState(false);
  const [selectedDeliveryProvider, setSelectedDeliveryProvider] = useState<any>(null);
  const [deliveryServiceType, setDeliveryServiceType] = useState<string>("standard");
  const [deliveryMethod, setDeliveryMethod] = useState("delivery"); // "pickup" or "delivery"
  const [shippingInfo, setShippingInfo] = useState({
    name: user?.user_metadata?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "United States"
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeliveryProviderSelect = (provider: any, serviceType: string) => {
    setSelectedDeliveryProvider(provider);
    setDeliveryServiceType(serviceType);
    setShowDeliverySelection(false);
    toast({
      title: "Delivery Provider Selected",
      description: `${provider.businessName} - ${serviceType.replace('_', ' ')} delivery`,
    });
  };

  const calculateDeliveryFee = () => {
    if (deliveryMethod === "pickup") return 0;
    if (!selectedDeliveryProvider) return 5.99; // Default shipping

    const serviceMultiplier = {
      standard: 1.0,
      express: 1.5,
      same_day: 1.3,
    }[deliveryServiceType] || 1.0;

    return selectedDeliveryProvider.estimatedFee * serviceMultiplier;
  };
  
  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty. Add some products before checking out.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate shipping info
    const requiredFields = ['name', 'email', 'phone', 'address', 'city', 'state', 'zip', 'country'];
    const missingFields = requiredFields.filter(field => !shippingInfo[field as keyof typeof shippingInfo]);

    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required shipping information",
        variant: "destructive"
      });
      return;
    }

    // Handle crypto payment
    if (paymentMethod === 'crypto') {
      setShowCryptoPayment(true);
      return;
    }

    setIsProcessing(true);
    
    try {
      const order = await checkout();
      clearCart();
      navigate('/app/marketplace');
      toast({
        title: "Order Placed Successfully",
        description: "Thank you for your purchase!",
      });
    } catch (error) {
      toast({
        title: "Checkout Failed",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCryptoPaymentSuccess = async () => {
    setShowCryptoPayment(false);
    setIsProcessing(true);

    try {
      const order = await checkout();
      clearCart();
      navigate('/app/marketplace');
      toast({
        title: "Order Placed Successfully",
        description: "Thank you for your cryptocurrency purchase!",
      });
    } catch (error) {
      toast({
        title: "Order Processing Failed",
        description: "Payment was successful but order processing failed. Please contact support.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const createCryptoPaymentRequest = (): PaymentRequest => {
    return {
      amount: total,
      purpose: 'marketplace',
      recipientId: 'marketplace',
      metadata: {
        cartItems: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
        })),
        shippingInfo,
        orderId: 'order_' + Date.now(),
      },
    };
  };
  
  const subTotal = getCartTotal();
  const shippingCost = subTotal > 0 ? calculateDeliveryFee() : 0;
  const tax = subTotal * 0.08; // 8% tax
  const total = subTotal + shippingCost + tax;
  
  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };
  
  return (
    <div className="container py-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/app/marketplace/cart")}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Checkout</h1>
      </div>
      
      {cart.length === 0 ? (
        <Card className="bg-gray-50">
          <CardContent className="pt-6 text-center">
            <div className="py-12 space-y-4">
              <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto" />
              <h3 className="text-xl font-medium">Your Cart is Empty</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                You haven't added any products to your cart yet. Browse the marketplace to find products you love.
              </p>
              <Button
                className="mt-4"
                onClick={() => navigate('/app/marketplace')}
              >
                Browse Products
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Method Selection */}
            <Card>
              <CardHeader className="border-b">
                <h2 className="text-lg font-medium">Delivery Method</h2>
              </CardHeader>

              <CardContent className="pt-6">
                <RadioGroup
                  value={deliveryMethod}
                  onValueChange={setDeliveryMethod}
                >
                  <div className="flex items-center space-x-2 border rounded-md p-3 mb-3 cursor-pointer hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="delivery" id="delivery-method" />
                    <Label htmlFor="delivery-method" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Truck className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium">Home Delivery</div>
                        <div className="text-sm text-gray-500">Get your items delivered to your doorstep</div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="pickup" id="pickup-method" />
                    <Label htmlFor="pickup-method" className="flex items-center gap-2 cursor-pointer flex-1">
                      <MapPin className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium">Store Pickup</div>
                        <div className="text-sm text-gray-500">Pick up from nearest store location</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                {deliveryMethod === "delivery" && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">Delivery Provider</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDeliverySelection(true)}
                      >
                        {selectedDeliveryProvider ? "Change Provider" : "Select Provider"}
                      </Button>
                    </div>

                    {selectedDeliveryProvider ? (
                      <div className="bg-white p-3 rounded border">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{selectedDeliveryProvider.businessName}</span>
                              {selectedDeliveryProvider.isVerified && (
                                <Badge variant="secondary" className="text-xs">
                                  <Shield className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                <span>{selectedDeliveryProvider.rating}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>~{selectedDeliveryProvider.estimatedDeliveryTime}h</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {deliveryServiceType.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-green-600">
                              ${calculateDeliveryFee().toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500">delivery fee</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <Truck className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p>Select a delivery provider to see pricing and delivery times</p>
                      </div>
                    )}
                  </div>
                )}

                {deliveryMethod === "pickup" && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Free Pickup Available</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      Pick up your order from our store locations within 3-5 business days.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card>
              <CardHeader className="border-b">
                <h2 className="text-lg font-medium">
                  {deliveryMethod === "delivery" ? "Delivery Information" : "Pickup Information"}
                </h2>
              </CardHeader>
              
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      placeholder="John Doe" 
                      value={shippingInfo.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      placeholder="john@example.com" 
                      value={shippingInfo.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    placeholder="(123) 456-7890" 
                    value={shippingInfo.phone}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">
                    {deliveryMethod === "delivery" ? "Delivery Address" : "Contact Address"}
                  </Label>
                  <Textarea
                    id="address"
                    name="address"
                    placeholder={deliveryMethod === "delivery" ? "123 Main St, Apt 4B" : "Your contact address"}
                    value={shippingInfo.address}
                    onChange={handleInputChange}
                  />
                  {deliveryMethod === "pickup" && (
                    <p className="text-sm text-gray-500">
                      We'll notify you when your order is ready for pickup at the selected store location.
                    </p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2 col-span-2 md:col-span-1">
                    <Label htmlFor="city">City</Label>
                    <Input 
                      id="city" 
                      name="city" 
                      placeholder="New York" 
                      value={shippingInfo.city}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input 
                      id="state" 
                      name="state" 
                      placeholder="NY" 
                      value={shippingInfo.state}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="zip">Zip Code</Label>
                    <Input 
                      id="zip" 
                      name="zip" 
                      placeholder="10001" 
                      value={shippingInfo.zip}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2 col-span-2 md:col-span-1">
                    <Label htmlFor="country">Country</Label>
                    <Input 
                      id="country" 
                      name="country" 
                      placeholder="United States" 
                      value={shippingInfo.country}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Payment Method */}
            <Card>
              <CardHeader className="border-b">
                <h2 className="text-lg font-medium">Payment Method</h2>
              </CardHeader>
              
              <CardContent className="pt-6">
                <RadioGroup 
                  value={paymentMethod} 
                  onValueChange={setPaymentMethod}
                >
                  <div className="flex items-center space-x-2 border rounded-md p-3 mb-3 cursor-pointer hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="card" id="payment-card" />
                    <Label htmlFor="payment-card" className="flex items-center gap-2 cursor-pointer">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      Credit / Debit Card
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 border rounded-md p-3 mb-3 cursor-pointer hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="wallet" id="payment-wallet" />
                    <Label htmlFor="payment-wallet" className="flex items-center gap-2 cursor-pointer">
                      <Wallet className="h-5 w-5 text-purple-600" />
                      Digital Wallet
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 border rounded-md p-3 mb-3 cursor-pointer hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="crypto" id="payment-crypto" />
                    <Label htmlFor="payment-crypto" className="flex items-center gap-2 cursor-pointer">
                      <Bitcoin className="h-5 w-5 text-orange-500" />
                      <div className="flex flex-col">
                        <span>Cryptocurrency</span>
                        <span className="text-xs text-muted-foreground">Pay with Bitcoin, Ethereum, USDT, or Solana</span>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="cash" id="payment-cash" />
                    <Label htmlFor="payment-cash" className="flex items-center gap-2 cursor-pointer">
                      <Banknote className="h-5 w-5 text-green-600" />
                      Cash on Delivery
                    </Label>
                  </div>
                </RadioGroup>
                
                {paymentMethod === 'card' && (
                  <div className="mt-4 border rounded-md p-4 bg-gray-50">
                    <p className="text-muted-foreground text-sm">
                      For demo purposes, no actual payment will be processed.
                    </p>
                  </div>
                )}

                {paymentMethod === 'crypto' && (
                  <div className="mt-4 border rounded-md p-4 bg-orange-50 border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-orange-600" />
                      <span className="font-medium text-orange-800">Fast & Secure Crypto Payment</span>
                    </div>
                    <p className="text-orange-700 text-sm">
                      Pay instantly with your crypto wallet. Transactions are secured by blockchain technology and typically confirm within minutes.
                    </p>
                    <div className="mt-2 text-sm text-orange-600">
                      • No chargebacks or payment disputes
                      • Lower transaction fees
                      • Enhanced privacy protection
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader className="border-b">
                <h2 className="text-lg font-medium">Order Summary</h2>
              </CardHeader>
              
              <CardContent className="pt-6 divide-y">
                <div className="space-y-4 pb-4">
                  {cart.map(item => (
                    <div key={item.productId || item.id} className="flex gap-3">
                      <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden">
                        <img
                          src={item.product?.image || ""}
                          alt={item.product?.name || "Product"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium line-clamp-1">{item.product?.name || "Product"}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        <p className="font-semibold">
                          ${(item.priceSnapshot * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-4 py-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(subTotal)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {deliveryMethod === "delivery" ? (
                        selectedDeliveryProvider ?
                        `Delivery (${deliveryServiceType.replace('_', ' ')})` :
                        "Delivery"
                      ) : "Pickup"}
                    </span>
                    <span className={deliveryMethod === "pickup" ? "text-green-600" : ""}>
                      {deliveryMethod === "pickup" ? "FREE" : formatCurrency(shippingCost)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (8%)</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                </div>
                
                <div className="flex justify-between pt-4 font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </CardContent>
              
              <CardFooter className="border-t bg-gray-50 flex-col gap-3">
                <Button 
                  className="w-full flex items-center gap-2"
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Package className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : paymentMethod === 'crypto' ? (
                    <>
                      <Bitcoin className="h-4 w-4" />
                      Pay with Crypto
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Place Order
                    </>
                  )}
                </Button>
                
                <div className="text-xs text-center text-muted-foreground">
                  By placing your order, you agree to our terms of service and privacy policy.
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}

      {/* Crypto Payment Modal */}
      <UniversalCryptoPaymentModal
        isOpen={showCryptoPayment}
        onClose={() => setShowCryptoPayment(false)}
        paymentRequest={createCryptoPaymentRequest()}
        onSuccess={handleCryptoPaymentSuccess}
        onError={(error) => {
          console.error('Crypto payment error:', error);
          setShowCryptoPayment(false);
        }}
        title="Complete Your Purchase"
        description="Pay for your marketplace order using cryptocurrency"
      />

      {/* Delivery Provider Selection Modal */}
      <DeliveryProviderSelection
        open={showDeliverySelection}
        onClose={() => setShowDeliverySelection(false)}
        pickupAddress={{ address: "Store Location" }} // In real app, this would be seller's address
        deliveryAddress={{ address: shippingInfo.address }}
        packageDetails={{
          weight: cart.reduce((total, item) => total + (item.quantity * 0.5), 0), // Estimate 0.5kg per item
          value: subTotal,
          description: `${cart.length} item(s) from marketplace`
        }}
        onProviderSelect={handleDeliveryProviderSelect}
      />
    </div>
  );
};

export default MarketplaceCheckout;
