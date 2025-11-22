import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useWalletContext } from "@/contexts/WalletContext";
import { WalletActionHeader } from "@/components/wallet/WalletActionHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle2, Lock } from "lucide-react";

interface SafeboxPlan {
  id: string;
  name: string;
  duration: string;
  interestRate: number;
  description: string;
}

const Safebox = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { walletBalance, deductBalance } = useWalletContext();
  const [step, setStep] = useState<"plan" | "amount" | "review" | "success">("plan");
  const [selectedPlan, setSelectedPlan] = useState<SafeboxPlan | null>(null);
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const plans: SafeboxPlan[] = [
    { id: "30days", name: "30 Days", duration: "30 days", interestRate: 5, description: "Monthly savings" },
    { id: "90days", name: "90 Days", duration: "90 days", interestRate: 12, description: "Quarterly plan" },
    { id: "180days", name: "180 Days", duration: "180 days", interestRate: 25, description: "6-month plan" },
    { id: "1year", name: "1 Year", duration: "365 days", interestRate: 55, description: "Annual savings" },
  ];

  const handleCreate = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStep("success");
    } finally {
      setIsLoading(false);
    }
  };

  const numAmount = parseInt(amount) || 0;
  const estimatedReturn = (numAmount * (selectedPlan?.interestRate || 0)) / 100;
  const canProceed = selectedPlan && numAmount > 0 && numAmount <= (walletBalance?.total || 0);

  if (step === "success") {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <WalletActionHeader title="Safebox Created" />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Safebox Created!</h2>
            <p className="text-gray-600">
              ${numAmount.toLocaleString()} locked in {selectedPlan?.name} plan
            </p>
            <p className="text-sm text-green-600 font-semibold">
              Estimated return: ${estimatedReturn.toLocaleString()}
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
      <WalletActionHeader title="Safebox" subtitle="Secure savings with interest" />
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 space-y-6">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-indigo-50">
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Available Balance</p>
              <p className="text-4xl font-bold text-gray-900 mt-2">
                ${walletBalance?.total.toFixed(2) || "0.00"}
              </p>
            </CardContent>
          </Card>

          {step === "plan" && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Choose Savings Plan</h3>
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                {plans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => {
                      setSelectedPlan(plan);
                      setStep("amount");
                    }}
                    className={`p-4 rounded-lg border-2 transition ${
                      selectedPlan?.id === plan.id
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-purple-500 hover:bg-purple-50"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">{plan.name}</p>
                        <p className="text-xs text-gray-600 mt-1">{plan.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{plan.duration}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">{plan.interestRate}%</p>
                        <p className="text-xs text-gray-600">interest</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "amount" && (
            <div className="space-y-4">
              <Button
                variant="ghost"
                onClick={() => setStep("plan")}
                className="text-blue-600"
              >
                ← Change Plan
              </Button>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount to Save
                </label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-lg"
                />
                <p className="text-xs text-gray-600 mt-2">
                  Max available: ${walletBalance?.total.toFixed(2) || "0.00"}
                </p>
              </div>

              {numAmount > 0 && selectedPlan && (
                <Card className="border-0 shadow-sm bg-green-50">
                  <CardContent className="pt-6 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Amount</span>
                      <span className="font-semibold">${numAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Interest Rate</span>
                      <span className="font-semibold">{selectedPlan.interestRate}%</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Estimated Return</span>
                      <span className="font-semibold text-green-600">${estimatedReturn.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {canProceed && (
                <Button
                  onClick={() => setStep("review")}
                  className="w-full bg-purple-600 hover:bg-purple-700"
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
              <Card className="border-0 shadow-sm bg-purple-50">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Lock className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-gray-900">Secure Savings</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Plan</span>
                    <span className="font-semibold">{selectedPlan?.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-semibold">{selectedPlan?.duration}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Principal Amount</span>
                    <span className="font-semibold">${numAmount.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between items-center">
                    <span className="text-gray-600">Estimated Interest</span>
                    <span className="font-semibold text-green-600">${estimatedReturn.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
              <Button
                onClick={handleCreate}
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Safebox"
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Safebox;
