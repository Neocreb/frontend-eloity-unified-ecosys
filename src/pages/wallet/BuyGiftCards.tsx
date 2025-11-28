import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useWalletContext } from "@/contexts/WalletContext";
import { WalletActionHeader } from "@/components/wallet/WalletActionHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
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

const BuyGiftCards = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { walletBalance } = useWalletContext();

  const [step, setStep] = useState<"retailer" | "amount" | "review" | "success">("retailer");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<GiftCardProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<GiftCardProduct | null>(null);
  const [amount, setAmount] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [commissionData, setCommissionData] = useState<any>(null);

  // Fetch gift card products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setError("");
      const token = session?.access_token;
      
      const response = await fetch('/api/reloadly/gift-cards/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      if (result.success && result.products) {
        setProducts(result.products);
      } else {
        throw new Error('Failed to load gift card products');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load gift card products';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('Fetch products error:', err);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCard = (product: GiftCardProduct) => {
    setSelectedProduct(product);
    setAmount("");
    setStep("amount");
  };

  const handleContinueAmount = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (parseFloat(amount) < (selectedProduct?.minAmount || 0)) {
      toast.error(`Minimum amount is ${selectedProduct?.currencyCode || "$"}${selectedProduct?.minAmount}`);
      return;
    }
    if (parseFloat(amount) > (selectedProduct?.maxAmount || 0)) {
      toast.error(`Maximum amount is ${selectedProduct?.currencyCode || "$"}${selectedProduct?.maxAmount}`);
      return;
    }

    setIsLoading(true);
    try {
      const token = session?.access_token;

      // Calculate commission
      const commissionResponse = await fetch('/api/commission/calculate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          serviceType: 'gift_cards',
          baseAmount: parseFloat(amount),
          operatorId: selectedProduct?.id
        })
      });

      const commissionCalcData = await commissionResponse.json();
      if (!commissionResponse.ok || !commissionCalcData.success) {
        throw new Error(commissionCalcData.error || 'Failed to calculate commission');
      }

      setCommissionData(commissionCalcData);

      if (commissionCalcData.total_charged > (walletBalance?.total || 0)) {
        toast.error("Insufficient balance for this purchase");
        return;
      }

      setStep("review");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to calculate commission';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('Commission calculation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuy = async () => {
    if (!selectedProduct || !amount || !email) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      setError("");
      const token = session?.access_token;

      const totalAmount = commissionData?.total_charged || parseFloat(amount);

      const response = await fetch('/api/reloadly/gift-cards/purchase', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: selectedProduct.id,
          amount: totalAmount,
          email: email
        })
      });

      const result = await response.json();

      if (result.success) {
        setTransactionId(result.transactionId);
        setStep("success");
        toast.success('Gift card purchased successfully!');
      } else {
        const errorMsg = result.error || 'Purchase failed';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Purchase failed. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('Purchase error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "retailer") {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <WalletActionHeader title="Buy Gift Cards" subtitle="Purchase digital gift cards" />

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-6">
            {/* Balance Card */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-pink-50 to-rose-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Available Balance</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      ${walletBalance?.total.toFixed(2) || "0.00"}
                    </p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">🎁</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {error && (
              <Card className="border-2 border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Search */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Find Gift Card
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Amazon, Netflix, Spotify..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 border-gray-300"
                />
              </div>
            </div>

            {/* Gift Cards Grid */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Available Gift Cards</h3>
              {products.length === 0 ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="pt-6">
                    <p className="text-center text-gray-600">Loading gift cards...</p>
                  </CardContent>
                </Card>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleSelectCard(product)}
                    className="w-full text-left"
                  >
                    <Card className="border-2 border-gray-200 hover:border-pink-400 hover:shadow-md transition-all">
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
                          <p className="text-xs text-gray-500 mt-1">
                            {product.currencyCode} {product.minAmount}-{product.maxAmount}
                          </p>
                        </div>
                        <span className="text-gray-400">→</span>
                      </CardContent>
                    </Card>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No gift cards found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "amount") {
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
              <p className="text-gray-600 text-sm">{selectedProduct?.name}</p>
            </Card>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Select Amount
                </label>
                {selectedProduct?.fixedAmounts && selectedProduct.fixedAmounts.length > 0 ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      {selectedProduct.fixedAmounts.slice(0, 9).map((fixedAmount) => (
                        <button
                          key={fixedAmount}
                          onClick={() => setAmount(fixedAmount.toString())}
                          className={`p-3 rounded-lg border-2 font-semibold ${
                            parseFloat(amount) === fixedAmount
                              ? "border-purple-500 bg-purple-50 text-purple-600"
                              : "border-gray-200 hover:border-purple-300 text-gray-900"
                          }`}
                        >
                          {fixedAmount}
                        </button>
                      ))}
                    </div>
                    {selectedProduct.fixedAmounts.length > 9 && (
                      <p className="text-xs text-gray-500">
                        + {selectedProduct.fixedAmounts.length - 9} more fixed amounts available
                      </p>
                    )}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="px-2 bg-gray-50 text-gray-600">Or enter custom amount</span>
                      </div>
                    </div>
                  </div>
                ) : null}
                <Input
                  type="number"
                  placeholder="Enter custom amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-12 text-lg"
                  min={selectedProduct?.minAmount}
                  max={selectedProduct?.maxAmount}
                />
                <p className="text-xs text-gray-500 mt-2">
                  {selectedProduct?.minAmount && selectedProduct?.maxAmount
                    ? `Min: ${selectedProduct.currencyCode} ${selectedProduct.minAmount} | Max: ${selectedProduct.currencyCode} ${selectedProduct.maxAmount}`
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
            onClick={handleContinueAmount}
            disabled={!amount || !email || isLoading}
            className="w-full h-12 bg-purple-500 hover:bg-purple-600 text-white font-semibold"
          >
            Continue
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setStep("retailer");
              setAmount("");
              setEmail("");
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
                    <span className="text-gray-600">Gift Card Amount</span>
                    <span className="font-bold">{selectedProduct?.currencyCode} {parseFloat(amount).toFixed(2)}</span>
                  </div>
                  {commissionData && commissionData.commission_amount > 0 && (
                    <div className="flex justify-between mb-2 text-orange-600">
                      <span className="text-gray-600">Commission ({commissionData.commission_type === 'percentage' ? commissionData.percentage_value + '%' : 'Fixed'})</span>
                      <span className="font-semibold">{selectedProduct?.currencyCode} {commissionData.commission_amount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="font-semibold">Total Charged</span>
                    <span className="text-2xl font-bold text-purple-600">{selectedProduct?.currencyCode} {(commissionData?.total_charged || parseFloat(amount)).toFixed(2)}</span>
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
            onClick={handleBuy}
            disabled={isLoading}
            className="w-full h-12 bg-purple-500 hover:bg-purple-600 text-white font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Purchase ${selectedProduct?.currencyCode} ${parseFloat(amount).toFixed(2)} Gift Card`
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setStep("amount")}
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
          <div className="px-4 sm:px-6 py-8 text-center max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-2">Success!</h2>
            <p className="text-gray-600 mb-8">
              Your {selectedProduct?.brandName} gift card has been purchased and sent to {email}
            </p>

            <Card className="border-0 shadow-sm mb-6">
              <CardContent className="p-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Product</span>
                  <span className="font-semibold">{selectedProduct?.brandName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-bold">{selectedProduct?.currencyCode} {parseFloat(amount).toFixed(2)}</span>
                </div>
                {transactionId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID</span>
                    <span className="font-mono text-xs">{transactionId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="text-green-600 font-semibold">Purchased</span>
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
              setStep("retailer");
              setSelectedProduct(null);
              setAmount("");
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

export default BuyGiftCards;
