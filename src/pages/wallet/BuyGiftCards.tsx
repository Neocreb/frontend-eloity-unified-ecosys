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

interface GiftCard {
  id: number;
  name: string;
  brandName: string;
  minAmount: number;
  maxAmount: number;
  currencyCode: string;
}

const BuyGiftCards = () => {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const { walletBalance } = useWalletContext();

  const [step, setStep] = useState<"retailer" | "amount" | "review" | "success">("retailer");
  const [searchQuery, setSearchQuery] = useState("");
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<GiftCard | null>(null);
  const [amount, setAmount] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);

  // Fetch gift card products from Reloadly API
  useEffect(() => {
    const fetchProducts = async () => {
      if (!user || !session) return;

      try {
        const token = session?.access_token;

        const response = await fetch('/api/reloadly/gift-cards/products', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json();
        if (result.success && result.products) {
          setGiftCards(result.products);
        }
      } catch (error) {
        console.error('Failed to fetch gift card products:', error);
        toast.error('Failed to load gift card products');
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, [user, session]);

  const filteredCards = giftCards.filter((card) =>
    card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.brandName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCard = (card: GiftCard) => {
    setSelectedCard(card);
    setAmount("");
    setEmail("");
    setStep("amount");
  };

  const handleContinueAmount = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (parseFloat(amount) < (selectedCard?.minAmount || 10)) {
      toast.error(`Minimum amount is ${selectedCard?.currencyCode} ${selectedCard?.minAmount}`);
      return;
    }
    if (parseFloat(amount) > (selectedCard?.maxAmount || 500)) {
      toast.error(`Maximum amount is ${selectedCard?.currencyCode} ${selectedCard?.maxAmount}`);
      return;
    }
    if (parseFloat(amount) > (walletBalance?.total || 0)) {
      toast.error("Insufficient balance");
      return;
    }
    setStep("review");
  };

  const handleBuy = async () => {
    if (!email || !email.includes('@')) {
      toast.error("Please enter a valid email");
      return;
    }

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
          productId: selectedCard?.id,
          amount: parseFloat(amount),
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

  if (step === "retailer") {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <WalletActionHeader title="Buy Gift Cards" />

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

            {/* Search */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Find Retailer
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Amazon, Spotify, Netflix..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 border-gray-300"
                />
              </div>
            </div>

            {/* Gift Cards Grid */}
            <div className="grid grid-cols-2 gap-3">
              {productsLoading ? (
                <div className="col-span-2 text-center py-8 text-gray-500">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  Loading gift cards...
                </div>
              ) : filteredCards.length > 0 ? (
                filteredCards.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => handleSelectCard(card)}
                    className="w-full"
                  >
                    <Card className="border hover:border-pink-300 hover:shadow-md transition-all h-full">
                      <CardContent className="p-4 flex flex-col items-center justify-center gap-2 text-center">
                        <span className="text-4xl">🎁</span>
                        <p className="font-semibold text-gray-900 text-sm">{card.brandName}</p>
                        <p className="text-xs text-gray-600">
                          {card.currencyCode} {card.minAmount}-{card.maxAmount}
                        </p>
                      </CardContent>
                    </Card>
                  </button>
                ))
              ) : (
                <div className="col-span-2 text-center py-8 text-gray-500">
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
    const total = parseFloat(amount || "0");

    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <WalletActionHeader title={selectedCard?.retailer || "Amount"} />

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-6">
            {/* Selected Card */}
            <div className="text-center py-6">
              <span className="text-6xl">🎁</span>
              <p className="text-xl font-semibold text-gray-900 mt-2">
                {selectedCard?.brandName}
              </p>
            </div>

            {/* Amount Input */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Amount ({selectedCard?.currencyCode})
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-600">
                    {selectedCard?.currencyCode}
                  </span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-10 h-16 text-3xl font-bold border-gray-300"
                  />
                </div>
                <div className="mt-3 flex justify-between text-xs text-gray-600">
                  <span>Min: {selectedCard?.minAmount}</span>
                  <span>Max: {selectedCard?.maxAmount}</span>
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 border-gray-300"
                />
                <p className="text-xs text-gray-600 mt-2">Gift card code will be sent to this email</p>
              </div>
            </div>

            {/* Quick Amounts */}
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2 uppercase">
                Quick Amount
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[10, 25, 50].map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    variant="outline"
                    onClick={() => setAmount(quickAmount.toString())}
                    className="h-10 text-sm font-semibold"
                  >
                    {quickAmount}
                  </Button>
                ))}
              </div>
            </div>

            {/* Amount Summary */}
            {amount && selectedCard && (
              <div className="p-4 bg-pink-50 border border-pink-200 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="font-bold text-lg text-pink-600">
                    {selectedCard.currencyCode} {parseFloat(amount).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 sm:p-6 space-y-3">
          <Button
            onClick={handleContinueAmount}
            disabled={!amount || parseFloat(amount) <= 0}
            className="w-full h-12 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-semibold rounded-lg"
          >
            Continue
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setStep("retailer");
              setAmount("");
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
    const total = parseFloat(amount);

    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <WalletActionHeader title="Review Purchase" />

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-6">
            {/* Purchase Details */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-6">
                <div className="text-center py-4">
                  <span className="text-5xl">🎁</span>
                  <p className="text-xl font-semibold text-gray-900 mt-2">
                    {selectedCard?.brandName} Gift Card
                  </p>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200" />

                {/* Amount Section */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">Amount to Purchase</p>
                  <p className="text-4xl font-bold text-gray-900">
                    {selectedCard?.currencyCode} {parseFloat(amount).toFixed(2)}
                  </p>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200" />

                {/* Email */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">Delivery Email</p>
                  <p className="font-semibold text-gray-900">{email}</p>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200" />

                {/* Total */}
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-gray-900">Total to Pay</span>
                  <span className="font-bold text-lg text-pink-600">
                    {selectedCard?.currencyCode} {total.toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Info Alert */}
            <div className="flex gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900">Instant Delivery</p>
                <p className="text-xs text-blue-700 mt-0.5">
                  Gift card code will be delivered instantly
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 sm:p-6 space-y-3">
          <Button
            onClick={handleBuy}
            disabled={isLoading}
            className="w-full h-12 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-semibold rounded-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Buy Gift Card"
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
    const fee = selectedCard ? parseFloat(amount) * (selectedCard.fee / 100) : 0;
    const total = parseFloat(amount) + fee;

    return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-pink-50 to-rose-50">
        <WalletActionHeader title="Purchase Complete" />

        <div className="flex-1 flex items-center justify-center overflow-y-auto">
          <div className="px-4 sm:px-6 py-8 text-center max-w-md mx-auto">
            {/* Success Icon */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 to-rose-600 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>

            {/* Success Message */}
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Gift Card Purchased!
            </h2>
            <p className="text-gray-600 mb-8">
              Your {selectedCard?.brandName} gift card has been sent to {email}
            </p>

            {/* Details */}
            <Card className="border-0 shadow-sm mb-6">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Card Value</span>
                  <span className="font-semibold text-gray-900">
                    {selectedCard?.currencyCode} {parseFloat(amount).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Recipient</span>
                  <span className="font-mono text-sm text-gray-900">{email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="text-green-600 font-semibold">Delivered</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 sm:p-6 space-y-3">
          <Button
            onClick={() => navigate("/app/wallet")}
            className="w-full h-12 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-semibold rounded-lg"
          >
            Back to Wallet
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/app/wallet/gift-cards")}
            className="w-full h-12"
          >
            View All Gift Cards
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

export default BuyGiftCards;
