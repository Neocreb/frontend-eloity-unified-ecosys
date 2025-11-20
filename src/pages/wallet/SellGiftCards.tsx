import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { WalletActionHeader } from "@/components/wallet/WalletActionHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface GiftCard {
  id: string;
  retailer: string;
  logo: string;
  rate: number;
}

const SellGiftCards = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<"retailer" | "amount" | "code" | "review" | "success">(
    "retailer"
  );
  const [selectedCard, setSelectedCard] = useState<GiftCard | null>(null);
  const [amount, setAmount] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const giftCards: GiftCard[] = [
    { id: "1", retailer: "Amazon", logo: "🛒", rate: 92 },
    { id: "2", retailer: "Google Play", logo: "🎮", rate: 88 },
    { id: "3", retailer: "Apple iTunes", logo: "🎵", rate: 85 },
    { id: "4", retailer: "Spotify", logo: "🎧", rate: 90 },
    { id: "5", retailer: "Netflix", logo: "🎬", rate: 85 },
    { id: "6", retailer: "Steam", logo: "🕹️", rate: 80 },
  ];

  const handleSelectCard = (card: GiftCard) => {
    setSelectedCard(card);
    setAmount("");
    setCode("");
    setStep("amount");
  };

  const handleContinueAmount = () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    if (parseFloat(amount) < 10) {
      alert("Minimum amount is $10");
      return;
    }
    setStep("code");
  };

  const handleContinueCode = () => {
    if (!code || code.length < 10) {
      alert("Please enter a valid gift card code");
      return;
    }
    setStep("review");
  };

  const handleSell = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStep("success");
    } catch (error) {
      alert("Error selling gift card");
    } finally {
      setIsLoading(false);
    }
  };

  const payout = parseFloat(amount) * (selectedCard?.rate ?? 90) / 100;

  if (step === "retailer") {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <WalletActionHeader title="Sell Gift Cards" />

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-6">
            {/* Info Card */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-teal-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Instant Cash Out</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      80-92% Rate
                    </p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">💳</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Retailers */}
            <div className="grid grid-cols-2 gap-3">
              {giftCards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => handleSelectCard(card)}
                  className="w-full"
                >
                  <Card className="border hover:border-emerald-300 hover:shadow-md transition-all h-full">
                    <CardContent className="p-4 flex flex-col items-center justify-center gap-2 text-center">
                      <span className="text-4xl">{card.logo}</span>
                      <p className="font-semibold text-gray-900 text-sm">{card.retailer}</p>
                      <p className="text-xs text-emerald-600 font-semibold">
                        {card.rate}% Rate
                      </p>
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

  if (step === "amount") {
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
              <p className="text-sm text-emerald-600 font-semibold mt-1">
                {selectedCard?.rate}% Rate
              </p>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Gift Card Value
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
              <p className="mt-3 text-xs text-gray-600">Minimum: $10</p>
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

            {/* Payout Preview */}
            {amount && selectedCard && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-xs font-semibold text-gray-600 mb-2">You'll Receive</p>
                <p className="text-3xl font-bold text-emerald-600">
                  ${payout.toFixed(2)}
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  At {selectedCard.rate}% rate
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 sm:p-6 space-y-3">
          <Button
            onClick={handleContinueAmount}
            disabled={!amount || parseFloat(amount) < 10}
            className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-lg"
          >
            Continue
          </Button>
          <Button
            variant="outline"
            onClick={() => setStep("retailer")}
            className="w-full h-12"
          >
            Back
          </Button>
        </div>
      </div>
    );
  }

  if (step === "code") {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <WalletActionHeader title="Gift Card Code" />

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-6">
            {/* Summary */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <span className="text-4xl">{selectedCard?.logo}</span>
                <div>
                  <p className="text-xs text-gray-600">Card</p>
                  <p className="font-semibold text-gray-900">{selectedCard?.retailer}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    ${parseFloat(amount).toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Code Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Gift Card Code
              </label>
              <Input
                placeholder="Enter the gift card code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="h-12 font-mono text-center text-lg tracking-widest border-gray-300"
              />
              <p className="mt-3 text-xs text-gray-600">
                Found on the back of your card or receipt
              </p>
            </div>

            {/* Info Alert */}
            <div className="flex gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900">Keep it safe</p>
                <p className="text-xs text-blue-700 mt-0.5">
                  Never share your code with anyone else
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 sm:p-6 space-y-3">
          <Button
            onClick={handleContinueCode}
            disabled={!code || code.length < 10}
            className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-lg"
          >
            Continue
          </Button>
          <Button
            variant="outline"
            onClick={() => setStep("amount")}
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
        <WalletActionHeader title="Review Sale" />

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-6">
            {/* Sale Details */}
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
                  <p className="text-sm text-gray-600 mb-2">Card Value</p>
                  <p className="text-4xl font-bold text-gray-900">
                    ${parseFloat(amount).toFixed(2)}
                  </p>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200" />

                {/* Payout */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Exchange Rate</span>
                    <span className="font-semibold">{selectedCard?.rate}%</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-gray-200 pt-3">
                    <span className="font-semibold text-gray-900">You'll Receive</span>
                    <span className="font-bold text-lg text-emerald-600">
                      ${payout.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Info Alert */}
            <div className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-900">Code will be verified</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Processing takes 1-2 minutes
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 sm:p-6 space-y-3">
          <Button
            onClick={handleSell}
            disabled={isLoading}
            className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Sell Gift Card"
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setStep("code")}
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
      <div className="flex flex-col h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
        <WalletActionHeader title="Sale Complete" />

        <div className="flex-1 flex items-center justify-center overflow-y-auto">
          <div className="px-4 sm:px-6 py-8 text-center max-w-md mx-auto">
            {/* Success Icon */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>

            {/* Success Message */}
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Sale Successful!
            </h2>
            <p className="text-gray-600 mb-8">
              ${payout.toFixed(2)} has been added to your wallet
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
                  <span className="text-gray-600">Received</span>
                  <span className="font-bold text-lg text-emerald-600">
                    ${payout.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="text-green-600 font-semibold">Confirmed</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 sm:p-6 space-y-3">
          <Button
            onClick={() => navigate("/app/wallet")}
            className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-lg"
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

export default SellGiftCards;
