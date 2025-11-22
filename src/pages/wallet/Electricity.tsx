import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useWalletContext } from "@/contexts/WalletContext";
import { WalletActionHeader } from "@/components/wallet/WalletActionHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle2, Zap } from "lucide-react";

interface Provider {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const Electricity = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { walletBalance, deductBalance } = useWalletContext();
  const [step, setStep] = useState<"provider" | "meterNumber" | "amount" | "review" | "success">("provider");
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [meterNumber, setMeterNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const providers: Provider[] = [
    { id: "eko", name: "Eko Disco", icon: "⚡", description: "Eko Distribution" },
    { id: "ikeja", name: "Ikeja Electric", icon: "💡", description: "Ikeja Distribution" },
    { id: "abuja", name: "Abuja Disco", icon: "🔌", description: "Abuja Distribution" },
    { id: "kaduna", name: "Kaduna Disco", icon: "🔋", description: "Kaduna Distribution" },
  ];

  const handlePay = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStep("success");
    } finally {
      setIsLoading(false);
    }
  };

  const numAmount = parseInt(amount) || 0;
  const canProceed = selectedProvider && meterNumber.length >= 11 && numAmount > 0 && numAmount <= (walletBalance?.total || 0);

  if (step === "success") {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <WalletActionHeader title="Payment Successful" />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Payment Successful!</h2>
            <p className="text-gray-600">
              ₦{numAmount.toLocaleString()} paid to {selectedProvider?.name}
            </p>
            <p className="text-sm text-gray-500">Meter: {meterNumber}</p>
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
      <WalletActionHeader title="Pay Electricity" subtitle="Quick bill payment" />
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 space-y-6">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-orange-50">
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Available Balance</p>
              <p className="text-4xl font-bold text-gray-900 mt-2">
                ${walletBalance?.total.toFixed(2) || "0.00"}
              </p>
            </CardContent>
          </Card>

          {step === "provider" && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Select Electricity Provider</h3>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {providers.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => {
                      setSelectedProvider(provider);
                      setStep("meterNumber");
                    }}
                    className="p-4 rounded-lg border-2 border-gray-200 hover:border-yellow-500 hover:bg-yellow-50 transition text-center"
                  >
                    <div className="text-3xl mb-2">{provider.icon}</div>
                    <p className="font-semibold text-gray-900 text-sm">{provider.name}</p>
                    <p className="text-xs text-gray-600 mt-1">{provider.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "meterNumber" && (
            <div className="space-y-4">
              <Button
                variant="ghost"
                onClick={() => setStep("provider")}
                className="text-blue-600"
              >
                ← Change Provider
              </Button>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meter Number
                </label>
                <Input
                  type="text"
                  placeholder="Enter 11-digit meter number"
                  value={meterNumber}
                  onChange={(e) => setMeterNumber(e.target.value.slice(0, 11))}
                  className="text-lg font-mono"
                  maxLength={11}
                />
                <p className="text-xs text-gray-600 mt-2">{meterNumber.length}/11 digits</p>
              </div>
              {meterNumber.length === 11 && (
                <Button
                  onClick={() => setStep("amount")}
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
                  size="lg"
                >
                  Continue
                </Button>
              )}
            </div>
          )}

          {step === "amount" && (
            <div className="space-y-4">
              <Button
                variant="ghost"
                onClick={() => setStep("meterNumber")}
                className="text-blue-600"
              >
                ← Back
              </Button>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount to Pay
                </label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-lg"
                />
                <p className="text-xs text-gray-600 mt-2">
                  Max available: ₦{(walletBalance?.total || 0).toLocaleString()}
                </p>
              </div>
              {canProceed && (
                <Button
                  onClick={() => setStep("review")}
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
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
                onClick={() => setStep("amount")}
                className="text-blue-600"
              >
                ← Back
              </Button>
              <Card className="border-0 shadow-sm bg-yellow-50">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Provider</span>
                    <span className="font-semibold">{selectedProvider?.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Meter Number</span>
                    <span className="font-semibold font-mono">{meterNumber}</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between items-center">
                    <span className="text-gray-600">Amount to Pay</span>
                    <span className="font-semibold">₦{numAmount.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
              <Button
                onClick={handlePay}
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
                  "Confirm Payment"
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Electricity;
