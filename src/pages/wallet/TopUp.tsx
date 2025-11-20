import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { WalletActionHeader } from "@/components/wallet/WalletActionHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle2 } from "lucide-react";

const topUpMethods = [
  { id: "card", name: "Debit Card", icon: "🏧", description: "Visa, Mastercard" },
  { id: "bank", name: "Bank Transfer", icon: "🏦", description: "Direct from bank" },
  { id: "ussd", name: "USSD", icon: "☎️", description: "Via USSD code" },
  { id: "wallet", name: "Mobile Money", icon: "📱", description: "PayPal, Skrill" },
];

const TopUp = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"method" | "amount" | "review" | "success">("method");
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleTopUp = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStep("success");
    } finally {
      setIsLoading(false);
    }
  };

  const getMethodName = () => topUpMethods.find((m) => m.id === selectedMethod)?.name;
  const getMethodIcon = () => topUpMethods.find((m) => m.id === selectedMethod)?.icon;

  if (step === "method") {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <WalletActionHeader title="Top Up Wallet" subtitle="Choose payment method" />
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-3">
            {topUpMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => {
                  setSelectedMethod(method.id);
                  setStep("amount");
                }}
                className="w-full text-left"
              >
                <Card className="border hover:border-indigo-300 hover:shadow-md transition-all">
                  <CardContent className="p-4 flex items-center gap-4">
                    <span className="text-4xl">{method.icon}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{method.name}</p>
                      <p className="text-sm text-gray-600">{method.description}</p>
                    </div>
                    <span className="text-gray-400">→</span>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === "amount") {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <WalletActionHeader title={getMethodName()} />
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-6">
            <div className="text-center py-4">
              <span className="text-6xl">{getMethodIcon()}</span>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-600">$</span>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-10 h-16 text-3xl font-bold"
                />
              </div>
              <div className="mt-3 text-xs text-gray-600">
                Min: $10 | Max: $10,000
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[50, 100, 500].map((quickAmount) => (
                <Button
                  key={quickAmount}
                  variant="outline"
                  onClick={() => setAmount(quickAmount.toString())}
                  className="h-10"
                >
                  ${quickAmount}
                </Button>
              ))}
            </div>

            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-sm">
              <p className="font-semibold text-indigo-900">Processing fee</p>
              <p className="text-indigo-700 mt-1">2-2.5% depending on method</p>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t p-4 sm:p-6 space-y-3">
          <Button
            onClick={() => setStep("review")}
            disabled={!amount || parseFloat(amount) < 10}
            className="w-full h-12 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold"
          >
            Continue
          </Button>
          <Button
            variant="outline"
            onClick={() => setStep("method")}
            className="w-full h-12"
          >
            Back
          </Button>
        </div>
      </div>
    );
  }

  if (step === "review") {
    const fee = parseFloat(amount) * 0.025;
    const total = parseFloat(amount) + fee;

    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <WalletActionHeader title="Review Top Up" />
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-2xl">{getMethodIcon()}</span>
                    <p className="font-semibold text-gray-900">{getMethodName()}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Amount</span>
                    <span className="font-bold">${parseFloat(amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-3">
                    <span className="text-gray-600">Processing Fee</span>
                    <span className="font-semibold">${fee.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between">
                    <span className="font-semibold">You'll receive</span>
                    <span className="font-bold text-lg text-indigo-600">${parseFloat(amount).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t p-4 sm:p-6 space-y-3">
          <Button
            onClick={handleTopUp}
            disabled={isLoading}
            className="w-full h-12 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold"
          >
            {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing...</> : "Complete Top Up"}
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
      <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <WalletActionHeader title="Top Up Successful" />
        <div className="flex-1 flex items-center justify-center overflow-y-auto">
          <div className="px-4 sm:px-6 py-8 text-center max-w-md">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-2">Top Up Successful!</h2>
            <p className="text-gray-600 mb-8">
              ${parseFloat(amount).toFixed(2)} has been added to your wallet
            </p>

            <Card className="border-0 shadow-sm mb-6">
              <CardContent className="p-4 text-sm text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Reference</span>
                  <span className="font-mono">TU000001</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Method</span>
                  <span>{getMethodName()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="text-indigo-600 font-semibold">Confirmed</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t p-4 sm:p-6 space-y-3">
          <Button
            onClick={() => navigate("/app/wallet")}
            className="w-full h-12 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold"
          >
            Back to Wallet
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

export default TopUp;
