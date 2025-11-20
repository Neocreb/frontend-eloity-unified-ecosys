import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWalletContext } from "@/contexts/WalletContext";
import { WalletActionHeader } from "@/components/wallet/WalletActionHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle2 } from "lucide-react";

const Transfer = () => {
  const navigate = useNavigate();
  const { walletBalance } = useWalletContext();
  const [step, setStep] = useState<"from" | "to" | "amount" | "review" | "success">("from");
  const [fromAccount, setFromAccount] = useState<string>("");
  const [toAccount, setToAccount] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const accounts = [
    { id: "main", name: "Main Wallet", balance: walletBalance?.total || 0, icon: "💰" },
    { id: "ecommerce", name: "E-commerce", balance: walletBalance?.ecommerce || 0, icon: "🛍️" },
    { id: "crypto", name: "Crypto", balance: walletBalance?.crypto || 0, icon: "🪙" },
    { id: "rewards", name: "Rewards", balance: walletBalance?.rewards || 0, icon: "⭐" },
  ];

  const handleTransfer = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStep("success");
    } finally {
      setIsLoading(false);
    }
  };

  const getFromAccountDetails = () => accounts.find((a) => a.id === fromAccount);
  const getToAccountDetails = () => accounts.find((a) => a.id === toAccount);

  if (step === "from") {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <WalletActionHeader title="Transfer From" />
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-3">
            {accounts.map((account) => (
              <button
                key={account.id}
                onClick={() => {
                  setFromAccount(account.id);
                  setStep("to");
                }}
                className="w-full text-left"
              >
                <Card className="border hover:border-orange-300 hover:shadow-md transition-all">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{account.icon}</span>
                      <div>
                        <p className="font-semibold text-gray-900">{account.name}</p>
                        <p className="text-sm text-gray-600">${account.balance.toFixed(2)}</p>
                      </div>
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

  if (step === "to") {
    const availableAccounts = accounts.filter((a) => a.id !== fromAccount);
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <WalletActionHeader title="Transfer To" />
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-3">
            {availableAccounts.map((account) => (
              <button
                key={account.id}
                onClick={() => {
                  setToAccount(account.id);
                  setStep("amount");
                }}
                className="w-full text-left"
              >
                <Card className="border hover:border-orange-300 hover:shadow-md transition-all">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{account.icon}</span>
                      <div>
                        <p className="font-semibold text-gray-900">{account.name}</p>
                        <p className="text-sm text-gray-600">${account.balance.toFixed(2)}</p>
                      </div>
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
    const fromDetails = getFromAccountDetails();
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <WalletActionHeader title="Transfer Amount" />
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-6">
            <div className="flex items-center justify-center gap-2">
              <div className="text-center">
                <p className="text-2xl">{fromDetails?.icon}</p>
                <p className="text-xs font-semibold text-gray-900">{fromDetails?.name}</p>
              </div>
              <span className="text-gray-400">→</span>
              <div className="text-center">
                <p className="text-2xl">{getToAccountDetails()?.icon}</p>
                <p className="text-xs font-semibold text-gray-900">{getToAccountDetails()?.name}</p>
              </div>
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
                Available: ${fromDetails?.balance.toFixed(2) || "0.00"}
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t p-4 sm:p-6 space-y-3">
          <Button
            onClick={() => setStep("review")}
            disabled={!amount || parseFloat(amount) <= 0}
            className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold"
          >
            Review
          </Button>
          <Button
            variant="outline"
            onClick={() => setStep("to")}
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
        <WalletActionHeader title="Review Transfer" />
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">From</p>
                    <p className="font-semibold text-gray-900">{getFromAccountDetails()?.name}</p>
                  </div>
                  <span>→</span>
                  <div>
                    <p className="text-xs text-gray-600">To</p>
                    <p className="font-semibold text-gray-900">{getToAccountDetails()?.name}</p>
                  </div>
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
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t p-4 sm:p-6 space-y-3">
          <Button
            onClick={handleTransfer}
            disabled={isLoading}
            className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold"
          >
            {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing...</> : "Transfer"}
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
      <div className="flex flex-col h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <WalletActionHeader title="Transfer Complete" />
        <div className="flex-1 flex items-center justify-center overflow-y-auto">
          <div className="px-4 sm:px-6 py-8 text-center max-w-md">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-2">Transferred!</h2>
            <p className="text-gray-600 mb-8">
              ${parseFloat(amount).toFixed(2)} moved to {getToAccountDetails()?.name}
            </p>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t p-4 sm:p-6">
          <Button
            onClick={() => navigate("/app/wallet")}
            className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold"
          >
            Back to Wallet
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

export default Transfer;
