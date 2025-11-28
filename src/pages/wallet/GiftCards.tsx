import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useWalletContext } from "@/contexts/WalletContext";
import { WalletActionHeader } from "@/components/wallet/WalletActionHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";

interface GiftCardProduct {
  id: number;
  name: string;
  brandName: string;
  logoUrls: string[];
  denominationType: string;
  minAmount: number;
  maxAmount: number;
  currencyCode: string;
  fixedAmounts: number[];
}

interface CommissionData {
  original_amount: number;
  commission_value: number;
  commission_type: string;
  commission_rate: number;
  final_amount: number;
  reloadly_amount: number;
}

const GiftCards = () => {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const { walletBalance } = useWalletContext();
  const [step, setStep] = useState<"products" | "select" | "review" | "success">("products");
  const [products, setProducts] = useState<GiftCardProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<GiftCardProduct | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [commissionData, setCommissionData] = useState<CommissionData | null>(null);

  // Fetch gift card products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = session?.access_token;
        
        const response = await fetch('/api/reloadly/gift-cards/products', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const result = await response.json();
        if (result.success) {
          setProducts(result.products);
        }
      } catch (error) {
        console.error('Failed to fetch gift card products:', error);
        toast.error('Failed to load gift card products');
      }
    };

    fetchProducts();
  }, [session]);

  const handlePurchase = async () => {
    setIsLoading(true);
    try {
      const token = session?.access_token;
      
      const response = await fetch('/api/reloadly/gift-cards/purchase', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: selectedProduct?.id,
          amount: amount,
          email: email
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setStep("success");
        toast.success('Gift card purchased successfully!');
      } else {
        toast.error(result.error || 'Purchase failed');
      }
    } catch (error) {
      console.error('Gift card purchase error:', error);
      toast.error('Purchase failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "products") {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <WalletActionHeader title="Gift Cards" subtitle="Buy digital gift cards" />
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-6">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-pink-50">
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600">Available Balance</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">
                  ${walletBalance?.total.toFixed(2) || "0.00"}
                </p>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Select Gift Card</h3>
              
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => {
                    setSelectedProduct(product);
                    setStep("select");
                  }}
                  className="w-full text-left"
                >
                  <Card className="border-2 border-gray-200 hover:border-purple-400 hover:shadow-md transition-all">
                    <CardContent className="p-4 flex items-center gap-4">
                      {product.logoUrls && product.logoUrls.length > 0 ? (
                        <img 
                          src={product.logoUrls[0]} 
                          alt={product.brandName} 
                          className="w-12 h-12 object-contain"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-xl">🎁</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{product.brandName}</p>
                        <p className="text-sm text-gray-600">{product.name}</p>
                      </div>
                      <span className="text-gray-400">→</span>
                    </CardContent>
                  </Card>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "select") {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <WalletActionHeader title={selectedProduct?.brandName || "Gift Card"} />
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-6">
            <Card className="border-0 shadow-sm text-center py-6">
              {selectedProduct?.logoUrls && selectedProduct.logoUrls.length > 0 ? (
                <img 
                  src={selectedProduct.logoUrls[0]} 
                  alt={selectedProduct.brandName} 
                  className="w-24 h-24 mx-auto object-contain"
                />
              ) : (
                <span className="text-6xl">🎁</span>
              )}
              <p className="text-lg font-semibold text-gray-900 mt-3">{selectedProduct?.brandName}</p>
              <p className="text-gray-600">{selectedProduct?.name}</p>
            </Card>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Select Amount
                </label>
                {selectedProduct?.fixedAmounts && selectedProduct.fixedAmounts.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {selectedProduct.fixedAmounts.map((fixedAmount) => (
                      <button
                        key={fixedAmount}
                        onClick={() => setAmount(fixedAmount)}
                        className={`p-3 rounded-lg border-2 ${
                          amount === fixedAmount
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-200 hover:border-purple-300"
                        }`}
                      >
                        <p className="font-semibold">${fixedAmount}</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={amount || ""}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="h-12 text-lg"
                    min={selectedProduct?.minAmount}
                    max={selectedProduct?.maxAmount}
                  />
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {selectedProduct?.minAmount && selectedProduct?.maxAmount
                    ? `Min: $${selectedProduct.minAmount} | Max: $${selectedProduct.maxAmount}`
                    : ""}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 text-lg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Gift card will be sent to this email
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t p-4 sm:p-6 space-y-3">
          <Button
            onClick={async () => {
              try {
                const token = session?.access_token;
                const response = await fetch('/api/commission/calculate', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    service_type: 'gift_cards',
                    amount: amount,
                    operator_id: selectedProduct?.id
                  })
                });

                const result = await response.json();
                if (result.success) {
                  setCommissionData(result.data);
                  setStep("review");
                } else {
                  toast.error('Failed to calculate price');
                }
              } catch (error) {
                console.error('Error calculating commission:', error);
                toast.error('Failed to calculate price');
              }
            }}
            disabled={!amount || !email || isLoading}
            className="w-full h-12 bg-purple-500 hover:bg-purple-600 text-white font-semibold"
          >
            Continue
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setStep("products");
              setSelectedProduct(null);
            }}
            className="w-full h-12"
          >
            Back
          </Button>
        </div>
      </div>
    );
  }

  if (step === "review") {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <WalletActionHeader title="Review Purchase" />
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Gift Card</p>
                  <div className="flex items-center gap-2 mt-2">
                    {selectedProduct?.logoUrls && selectedProduct.logoUrls.length > 0 ? (
                      <img 
                        src={selectedProduct.logoUrls[0]} 
                        alt={selectedProduct.brandName} 
                        className="w-10 h-10 object-contain"
                      />
                    ) : (
                      <span className="text-2xl">🎁</span>
                    )}
                    <p className="font-semibold text-gray-900">{selectedProduct?.brandName}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-600">Recipient Email</p>
                  <p className="font-semibold text-gray-900 mt-2">{email}</p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Service Amount</span>
                    <span className="font-bold">${commissionData?.original_amount.toFixed(2) || amount.toFixed(2)}</span>
                  </div>
                  {commissionData?.commission_value > 0 && (
                    <div className="flex justify-between mb-2 text-purple-600">
                      <span className="text-sm">Commission ({commissionData?.commission_rate}%)</span>
                      <span className="font-semibold">${commissionData?.commission_value.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="font-semibold">Total You Pay</span>
                    <span className="text-2xl font-bold text-purple-600">${commissionData?.final_amount.toFixed(2) || amount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Digital delivery</p>
                    <p className="text-xs text-blue-700 mt-0.5">Gift card will be emailed immediately</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t p-4 sm:p-6 space-y-3">
          <Button
            onClick={handlePurchase}
            disabled={isLoading}
            className="w-full h-12 bg-purple-500 hover:bg-purple-600 text-white font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Purchase $${(commissionData?.final_amount || amount).toFixed(2)} Gift Card`
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setStep("select")}
            disabled={isLoading}
            className="w-full h-12"
          >
            Back
          </Button>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <WalletActionHeader title="Purchase Successful" />
        <div className="flex-1 flex items-center justify-center overflow-y-auto">
          <div className="px-4 sm:px-6 py-8 text-center max-w-md">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-2">Success!</h2>
            <p className="text-gray-600 mb-8">
              Your {selectedProduct?.brandName} gift card has been purchased
            </p>

            <Card className="border-0 shadow-sm mb-6">
              <CardContent className="p-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Reference</span>
                  <span className="font-mono">GC{String(Date.now()).slice(-6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-bold">${amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="text-green-600 font-semibold">Purchased</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sent to</span>
                  <span className="font-semibold">{email}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t p-4 sm:p-6 space-y-3">
          <Button
            onClick={() => navigate("/app/wallet")}
            className="w-full h-12 bg-purple-500 hover:bg-purple-600 text-white font-semibold"
          >
            Back to Wallet
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setStep("products");
              setSelectedProduct(null);
              setAmount(0);
              setEmail("");
            }}
            className="w-full h-12"
          >
            Buy Another Gift Card
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

export default GiftCards;
