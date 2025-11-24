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
  id: string;
  retailer: string;
  logo: string;
  minAmount: number;
  maxAmount: number;
  fee: number;
}

const BuyGiftCards = () => {
  const navigate = useNavigate();
  const { walletBalance } = useWalletContext();

  const [step, setStep] = useState<"retailer" | "amount" | "review" | "success">("retailer");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCard, setSelectedCard] = useState<GiftCard | null>(null);
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const giftCards: GiftCard[] = [
    { id: "1", retailer: "Amazon", logo: "🛒", minAmount: 10, maxAmount: 500, fee: 0 },
    { id: "2", retailer: "Google Play", logo: "🎮", minAmount: 10, maxAmount: 500, fee: 2 },
    { id: "3", retailer: "Apple iTunes", logo: "🎵", minAmount: 10, maxAmount: 500, fee: 2 },
    { id: "4", retailer: "Spotify", logo: "🎧", minAmount: 10, maxAmount: 500, fee: 2 },
    { id: "5", retailer: "Netflix", logo: "🎬", minAmount: 10, maxAmount: 500, fee: 2 },
    { id: "6", retailer: "Steam", logo: "🕹️", minAmount: 5, maxAmount: 500, fee: 3 },
  ];

  const filteredCards = giftCards.filter((card) =>
    card.retailer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCard = (card: GiftCard) => {
    setSelectedCard(card);
    setAmount("");
    setStep("amount");
  };

  const handleContinueAmount = () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    if (parseFloat(amount) < (selectedCard?.minAmount || 10)) {
      alert(`Minimum amount is $${selectedCard?.minAmount}`);
      return;
    }
    if (parseFloat(amount) > (selectedCard?.maxAmount || 500)) {
      alert(`Maximum amount is $${selectedCard?.maxAmount}`);
      return;
    }
    if (parseFloat(amount) + (selectedCard?.fee || 0) > (walletBalance?.total || 0)) {
      alert("Insufficient balance");
      return;
    }
    setStep("review");
  };

  const handleBuy = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStep("success");
    } catch (error) {
      alert("Error purchasing gift card");
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
              {filteredCards.length > 0 ? (
                filteredCards.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => handleSelectCard(card)}
                    className="w-full"
                  >
                    <Card className="border hover:border-pink-300 hover:shadow-md transition-all h-full">
                      <CardContent className="p-4 flex flex-col items-center justify-center gap-2 text-center">
                        <span className="text-4xl">{card.logo}</span>
                        <p className="font-semibold text-gray-900 text-sm">{card.retailer}</p>
                        <p className="text-xs text-gray-600">
                          ${card.minAmount}-${card.maxAmount}
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
    const fee = selectedCard ? parseFloat(amount || "0") * (selectedCard.fee / 100) : 0;
    const total = parseFloat(amount || "0") + fee;

    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <WalletActionHeader title={selectedCard?.retailer || "Amount"} />

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-6">
            {/* Selected Card */}
            <div className="text-center py-6">
              <span className="text-6xl">{selectedCard?.logo}</span>
              <p className="text-xl font-semibold text-gray-900 mt-2">
                {selectedCard?.retailer}
              </p>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-600">
                  $
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
                <span>Min: ${selectedCard?.minAmount}</span>
                <span>Max: ${selectedCard?.maxAmount}</span>
              </div>
            </div>

            {/* Quick Amounts */}
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2 uppercase">
                Quick Amount
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[25, 50, 100].map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    variant="outline"
                    onClick={() => setAmount(quickAmount.toString())}
                    className="h-10 text-sm font-semibold"
                  >
                    ${quickAmount}
                  </Button>
                ))}
              </div>
            </div>

            {/* Fee Info */}
            {amount && selectedCard && (
              <div className="p-4 bg-pink-50 border border-pink-200 rounded-lg">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-semibold text-gray-900">${parseFloat(amount).toFixed(2)}</span>
                </div>
                {fee > 0 && (
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Fee ({selectedCard.fee}%)</span>
                    <span className="font-semibold text-gray-900">${fee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm border-t border-pink-300 pt-2">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-lg text-pink-600">${total.toFixed(2)}</span>
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
    const fee = selectedCard ? parseFloat(amount) * (selectedCard.fee / 100) : 0;
    const total = parseFloat(amount) + fee;

    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <WalletActionHeader title="Review Purchase" />

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-6">
            {/* Purchase Details */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-6">
                <div className="text-center py-4">
                  <span className="text-5xl">{selectedCard?.logo}</span>
                  <p className="text-xl font-semibold text-gray-900 mt-2">
                    {selectedCard?.retailer} Gift Card
                  </p>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200" />

                {/* Amount Section */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">Amount to Purchase</p>
                  <p className="text-4xl font-bold text-gray-900">
                    ${parseFloat(amount).toFixed(2)}
                  </p>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200" />

                {/* Fees */}
                <div className="space-y-3">
                  {fee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Fee ({selectedCard?.fee}%)</span>
                      <span className="font-semibold text-gray-900">${fee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm border-t border-gray-200 pt-3">
                    <span className="font-semibold text-gray-900">Total to Pay</span>
                    <span className="font-bold text-lg text-pink-600">
                      ${total.toFixed(2)}
                    </span>
                  </div>
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
              Your {selectedCard?.retailer} gift card has been delivered
            </p>

            {/* Details */}
            <Card className="border-0 shadow-sm mb-6">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Card Value</span>
                  <span className="font-semibold text-gray-900">
                    ${parseFloat(amount).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Code</span>
                  <span className="font-mono text-sm text-gray-900">GC****1234</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="text-green-600 font-semibold">Activated</span>
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
