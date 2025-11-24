import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useWalletContext } from "@/contexts/WalletContext";
import { WalletActionHeader } from "@/components/wallet/WalletActionHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle2, AlertCircle, Phone } from "lucide-react";
import { toast } from "react-hot-toast";

interface Provider {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
}

const Airtime = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { walletBalance, deductBalance } = useWalletContext();
  const [step, setStep] = useState<"provider" | "amount" | "phone" | "review" | "success">("provider");
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const providers: Provider[] = [
    { id: "mtn", name: "MTN", icon: "🟡", description: "Nigeria, Ghana, Cameroon" },
    { id: "airtel", name: "Airtel", icon: "🔴", description: "Fast & reliable" },
    { id: "glo", name: "Globacom", icon: "🟢", description: "Nigeria's largest network" },
    { id: "9mobile", name: "9Mobile", icon: "🔵", description: "Best rates" },
  ];

  const amounts: Plan[] = [
    { id: "500", name: "₦500", price: 500 },
    { id: "1000", name: "₦1,000", price: 1000 },
    { id: "2000", name: "₦2,000", price: 2000 },
    { id: "5000", name: "₦5,000", price: 5000 },
    { id: "10000", name: "₦10,000", price: 10000 },
  ];

  const handlePurchase = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStep("success");
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = selectedProvider && selectedAmount && phoneNumber.length >= 10;

  if (step === "success") {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <WalletActionHeader title="Airtime Purchase" />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Purchase Successful!</h2>
            <p className="text-gray-600">
              {selectedAmount} sent to {selectedProvider?.name} {phoneNumber}
            </p>
            <Button onClick={() => navigate("/app/wallet")} className="w-full mt-6">
              Back to Wallet
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <WalletActionHeader title="Buy Airtime" subtitle="Send credit to any network" />
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 space-y-6">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-red-50">
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Available Balance</p>
              <p className="text-4xl font-bold text-gray-900 mt-2">
                ${walletBalance?.total.toFixed(2) || "0.00"}
              </p>
            </CardContent>
          </Card>

          {step === "provider" && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Select Network</h3>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {providers.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => {
                      setSelectedProvider(provider);
                      setStep("amount");
                    }}
                    className="p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition text-center"
                  >
                    <div className="text-3xl mb-2">{provider.icon}</div>
                    <p className="font-semibold text-gray-900">{provider.name}</p>
                    <p className="text-xs text-gray-600 mt-1">{provider.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "amount" && (
            <div className="space-y-4">
              <Button
                variant="ghost"
                onClick={() => setStep("provider")}
                className="text-blue-600"
              >
                ← Change Network
              </Button>
              <h3 className="text-sm font-semibold text-gray-900">Select Amount</h3>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {amounts.map((amount) => (
                  <button
                    key={amount.id}
                    onClick={() => {
                      setSelectedAmount(amount.price);
                      setStep("phone");
                    }}
                    className={`p-4 rounded-lg border-2 transition ${
                      selectedAmount === amount.price
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-500 hover:bg-blue-50"
                    }`}
                  >
                    <p className="font-semibold text-gray-900">{amount.name}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "phone" && (
            <div className="space-y-4">
              <Button
                variant="ghost"
                onClick={() => setStep("amount")}
                className="text-blue-600"
              >
                ← Back
              </Button>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  placeholder="Enter phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="text-lg"
                />
              </div>
              {canProceed && (
                <Button
                  onClick={() => setStep("review")}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  Continue
                </Button>
              )}
            </div>
          )}

          {step === "review" && (
            <div className="space-y-4">
              <Button
                variant="ghost"
                onClick={() => setStep("phone")}
                className="text-blue-600"
              >
                ← Back
              </Button>
              <Card className="border-0 shadow-sm bg-blue-50">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Network</span>
                    <span className="font-semibold">{selectedProvider?.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Amount</span>
                    <span className="font-semibold">₦{selectedAmount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Phone</span>
                    <span className="font-semibold">{phoneNumber}</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between items-center">
                    <span className="text-gray-600">Fee</span>
                    <span className="font-semibold">₦0</span>
                  </div>
                </CardContent>
              </Card>
              <Button
                onClick={handlePurchase}
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm Purchase"
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Airtime;
