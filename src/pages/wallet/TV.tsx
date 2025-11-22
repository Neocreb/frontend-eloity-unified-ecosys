import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useWalletContext } from "@/contexts/WalletContext";
import { WalletActionHeader } from "@/components/wallet/WalletActionHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle2 } from "lucide-react";

interface Provider {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface TVPlan {
  id: string;
  name: string;
  channels: string;
  duration: string;
  price: number;
}

const TV = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { walletBalance } = useWalletContext();
  const [step, setStep] = useState<"provider" | "plan" | "account" | "review" | "success">("provider");
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<TVPlan | null>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const providers: Provider[] = [
    { id: "dstv", name: "DStv", icon: "📺", description: "Multichoice channels" },
    { id: "gotv", name: "GOtv", icon: "📡", description: "Entertainment bundles" },
    { id: "startimes", name: "StarTimes", icon: "⭐", description: "African content" },
  ];

  const tvPlans: TVPlan[] = [
    { id: "basic", name: "Basic", channels: "30+ channels", duration: "30 days", price: 5000 },
    { id: "standard", name: "Standard", channels: "60+ channels", duration: "30 days", price: 10000 },
    { id: "premium", name: "Premium", channels: "120+ channels", duration: "30 days", price: 20000 },
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

  const canProceed = selectedProvider && selectedPlan && accountNumber.length >= 5;

  if (step === "success") {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <WalletActionHeader title="TV Subscription" />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Subscription Active!</h2>
            <p className="text-gray-600">
              {selectedPlan?.name} plan activated on {accountNumber}
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
      <WalletActionHeader title="TV Subscription" subtitle="Subscribe to your favorite channels" />
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 space-y-6">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-pink-50 to-red-50">
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Available Balance</p>
              <p className="text-4xl font-bold text-gray-900 mt-2">
                ${walletBalance?.total.toFixed(2) || "0.00"}
              </p>
            </CardContent>
          </Card>

          {step === "provider" && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Select Provider</h3>
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                {providers.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => {
                      setSelectedProvider(provider);
                      setStep("plan");
                    }}
                    className="p-4 rounded-lg border-2 border-gray-200 hover:border-pink-500 hover:bg-pink-50 transition text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{provider.icon}</div>
                      <div>
                        <p className="font-semibold text-gray-900">{provider.name}</p>
                        <p className="text-xs text-gray-600">{provider.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "plan" && (
            <div className="space-y-4">
              <Button
                variant="ghost"
                onClick={() => setStep("provider")}
                className="text-blue-600"
              >
                ← Change Provider
              </Button>
              <h3 className="text-sm font-semibold text-gray-900">Select Plan</h3>
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                {tvPlans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => {
                      setSelectedPlan(plan);
                      setStep("account");
                    }}
                    className={`p-4 rounded-lg border-2 transition ${
                      selectedPlan?.id === plan.id
                        ? "border-pink-500 bg-pink-50"
                        : "border-gray-200 hover:border-pink-500 hover:bg-pink-50"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">{plan.name}</p>
                        <p className="text-xs text-gray-600 mt-1">{plan.channels}</p>
                        <p className="text-xs text-gray-500">{plan.duration}</p>
                      </div>
                      <p className="font-semibold text-gray-900">₦{plan.price.toLocaleString()}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "account" && (
            <div className="space-y-4">
              <Button
                variant="ghost"
                onClick={() => setStep("plan")}
                className="text-blue-600"
              >
                ← Back
              </Button>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number
                </label>
                <Input
                  type="text"
                  placeholder="Enter your account number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="text-lg"
                />
              </div>
              {canProceed && (
                <Button
                  onClick={() => setStep("review")}
                  className="w-full bg-pink-600 hover:bg-pink-700"
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
                onClick={() => setStep("account")}
                className="text-blue-600"
              >
                ← Back
              </Button>
              <Card className="border-0 shadow-sm bg-pink-50">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Provider</span>
                    <span className="font-semibold">{selectedProvider?.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Plan</span>
                    <span className="font-semibold">{selectedPlan?.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Account</span>
                    <span className="font-semibold">{accountNumber}</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between items-center">
                    <span className="text-gray-600">Amount</span>
                    <span className="font-semibold">₦{selectedPlan?.price.toLocaleString()}</span>
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
                  "Confirm Subscription"
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TV;
