import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { WalletActionHeader } from "@/components/wallet/WalletActionHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle2 } from "lucide-react";

const billCategories = [
  { id: "electricity", name: "Electricity", icon: "⚡" },
  { id: "water", name: "Water", icon: "💧" },
  { id: "internet", name: "Internet", icon: "📡" },
  { id: "phone", name: "Phone Bill", icon: "📱" },
  { id: "insurance", name: "Insurance", icon: "🛡️" },
  { id: "rent", name: "Rent", icon: "🏠" },
];

const PayBills = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"category" | "amount" | "review" | "success">("category");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePay = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStep("success");
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryName = () => billCategories.find((c) => c.id === selectedCategory)?.name;
  const getCategoryIcon = () => billCategories.find((c) => c.id === selectedCategory)?.icon;

  if (step === "category") {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <WalletActionHeader title="Pay Bills" />
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-2 gap-3">
              {billCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setStep("amount");
                  }}
                  className="text-left"
                >
                  <Card className="border hover:border-red-300 hover:shadow-md transition-all h-full">
                    <CardContent className="p-4 flex flex-col items-center justify-center gap-2 text-center">
                      <span className="text-3xl">{category.icon}</span>
                      <p className="text-sm font-semibold text-gray-900">{category.name}</p>
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
        <WalletActionHeader title={getCategoryName()} />
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-6">
            <div className="text-center py-4">
              <span className="text-6xl">{getCategoryIcon()}</span>
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
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Reference/Account Number</label>
              <Input
                placeholder="Enter bill reference or account number"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="h-12"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[50, 100, 200].map((quickAmount) => (
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
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t p-4 sm:p-6 space-y-3">
          <Button
            onClick={() => setStep("review")}
            disabled={!amount || !reference}
            className="w-full h-12 bg-red-500 hover:bg-red-600 text-white font-semibold"
          >
            Continue
          </Button>
          <Button
            variant="outline"
            onClick={() => setStep("category")}
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
        <WalletActionHeader title="Review Payment" />
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="text-center py-4">
                  <span className="text-5xl">{getCategoryIcon()}</span>
                  <p className="text-xl font-semibold text-gray-900 mt-2">{getCategoryName()}</p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-600 mb-2">Reference</p>
                  <p className="font-semibold text-gray-900">{reference}</p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Amount</span>
                    <span className="font-bold">${parseFloat(amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fee</span>
                    <span>Free</span>
                  </div>
                  <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-lg">${parseFloat(amount).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t p-4 sm:p-6 space-y-3">
          <Button
            onClick={handlePay}
            disabled={isLoading}
            className="w-full h-12 bg-red-500 hover:bg-red-600 text-white font-semibold"
          >
            {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing...</> : "Pay Now"}
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
      <div className="flex flex-col h-screen bg-gradient-to-br from-green-50 to-emerald-50">
        <WalletActionHeader title="Payment Confirmed" />
        <div className="flex-1 flex items-center justify-center overflow-y-auto">
          <div className="px-4 sm:px-6 py-8 text-center max-w-md">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Confirmed!</h2>
            <p className="text-gray-600 mb-4">
              ${parseFloat(amount).toFixed(2)} paid for {getCategoryName()}
            </p>

            <Card className="border-0 shadow-sm mb-6">
              <CardContent className="p-4 text-sm text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID</span>
                  <span className="font-mono">PB000001</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="text-green-600 font-semibold">Confirmed</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t p-4 sm:p-6">
          <Button
            onClick={() => navigate("/app/wallet")}
            className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-semibold"
          >
            Back to Wallet
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

export default PayBills;
