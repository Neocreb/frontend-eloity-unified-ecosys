import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWalletContext } from "@/contexts/WalletContext";
import { WalletActionHeader } from "@/components/wallet/WalletActionHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle2, AlertCircle, Mail, User, Smartphone } from "lucide-react";
import BankAccountManager, { BankAccount } from "@/components/wallet/BankAccountManager";
import { paymentMethods } from "@/config/paymentMethods";

type RecipientType = "bank" | "username" | "email" | "mobile";

interface RecipientData {
  type: RecipientType;
  bankAccount?: BankAccount;
  username?: string;
  email?: string;
  mobile?: string;
}

const Withdraw = () => {
  const navigate = useNavigate();
  const { walletBalance } = useWalletContext();
  const [step, setStep] = useState<"recipient" | "amount" | "review" | "success">("recipient");
  const [recipientType, setRecipientType] = useState<RecipientType>("bank");
  const [recipient, setRecipient] = useState<RecipientData>({ type: "bank" });
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userCountry] = useState("NG"); // TODO: Get from user profile

  const validateRecipient = () => {
    if (recipientType === "bank" && !recipient.bankAccount) {
      return false;
    }
    if (recipientType === "username" && !recipient.username?.trim()) {
      return false;
    }
    if (recipientType === "email" && !recipient.email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return false;
    }
    if (recipientType === "mobile" && !recipient.mobile?.trim()) {
      return false;
    }
    return true;
  };

  const handleContinue = () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    if (parseFloat(amount) > (walletBalance?.total || 0)) {
      alert("Insufficient balance");
      return;
    }
    setStep("review");
  };

  const handleWithdraw = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStep("success");
    } finally {
      setIsLoading(false);
    }
  };

  const getRecipientDisplay = () => {
    switch (recipientType) {
      case "bank":
        return { label: "Bank Account", value: `${recipient.bankAccount?.bankName} - ${recipient.bankAccount?.accountNumber}` };
      case "username":
        return { label: "Username", value: `@${recipient.username}` };
      case "email":
        return { label: "Email", value: recipient.email };
      case "mobile":
        return { label: "Mobile Money", value: recipient.mobile };
    }
  };

  const getRecipientIcon = () => {
    const icons = { bank: "🏦", username: "👤", email: "✉️", mobile: "📱" };
    return icons[recipientType];
  };

  if (step === "recipient") {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <WalletActionHeader title="Withdraw Funds" />
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

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Send Money To</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { type: "bank" as RecipientType, label: "Bank Account", icon: "🏦" },
                  { type: "username" as RecipientType, label: "Username", icon: "👤" },
                  { type: "email" as RecipientType, label: "Email", icon: "✉️" },
                  { type: "mobile" as RecipientType, label: "Mobile Money", icon: "📱" },
                ].map((option) => (
                  <button
                    key={option.type}
                    onClick={() => setRecipientType(option.type)}
                    className="w-full"
                  >
                    <Card
                      className={`border-2 transition-all cursor-pointer h-full ${
                        recipientType === option.type
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-purple-300"
                      }`}
                    >
                      <CardContent className="p-4 flex flex-col items-center justify-center">
                        <span className="text-3xl mb-2">{option.icon}</span>
                        <p className="text-xs sm:text-sm font-semibold text-center text-gray-900">
                          {option.label}
                        </p>
                      </CardContent>
                    </Card>
                  </button>
                ))}
              </div>
            </div>

            {recipientType === "bank" && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Select Bank Account</h3>
                <BankAccountManager
                  countryCode={userCountry}
                  onAccountSelected={(account) => {
                    setRecipient({ type: "bank", bankAccount: account });
                  }}
                  mode="select"
                />
              </div>
            )}

            {recipientType === "username" && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Enter Username</label>
                <Input
                  placeholder="@username"
                  value={recipient.username || ""}
                  onChange={(e) =>
                    setRecipient({ ...recipient, username: e.target.value })
                  }
                  className="h-12"
                />
              </div>
            )}

            {recipientType === "email" && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Enter Email Address</label>
                <Input
                  type="email"
                  placeholder="recipient@example.com"
                  value={recipient.email || ""}
                  onChange={(e) =>
                    setRecipient({ ...recipient, email: e.target.value })
                  }
                  className="h-12"
                />
              </div>
            )}

            {recipientType === "mobile" && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Mobile Money Number</label>
                <Input
                  type="tel"
                  placeholder={`${paymentMethods.getRegionConfig(userCountry)?.phonePrefix} xxxxxxxxx`}
                  value={recipient.mobile || ""}
                  onChange={(e) =>
                    setRecipient({ ...recipient, mobile: e.target.value })
                  }
                  className="h-12"
                />
              </div>
            )}

            <Button
              onClick={() => setStep("amount")}
              disabled={!validateRecipient()}
              className="w-full h-12 bg-purple-500 hover:bg-purple-600 text-white font-semibold disabled:opacity-50"
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "amount") {
    const regionConfig = paymentMethods.getRegionConfig(userCountry);
    const recipientDisplay = getRecipientDisplay();

    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <WalletActionHeader title="Withdrawal Amount" />
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getRecipientIcon()}</span>
                  <div>
                    <p className="text-xs text-gray-600">{recipientDisplay?.label}</p>
                    <p className="font-semibold text-gray-900">{recipientDisplay?.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

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
              <div className="mt-3 flex justify-between text-xs text-gray-600">
                <span>Min: $10</span>
                <span>Max: ${walletBalance?.total.toFixed(2) || "0.00"}</span>
              </div>
            </div>

            <div className="space-y-2">
              {[50, 100, 200].map((quickAmount) => (
                <Button
                  key={quickAmount}
                  variant="outline"
                  onClick={() => setAmount(quickAmount.toString())}
                  className="w-full"
                >
                  ${quickAmount}
                </Button>
              ))}
            </div>

            <div className="flex gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900">Processing time</p>
                <p className="text-xs text-blue-700 mt-0.5">1-2 business days</p>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t p-4 sm:p-6 space-y-3">
          <Button
            onClick={handleContinue}
            disabled={!amount}
            className="w-full h-12 bg-purple-500 hover:bg-purple-600 text-white font-semibold"
          >
            Continue
          </Button>
          <Button
            variant="outline"
            onClick={() => setStep("recipient")}
            className="w-full h-12"
          >
            Back
          </Button>
        </div>
      </div>
    );
  }

  if (step === "review") {
    const recipientDisplay = getRecipientDisplay();
    const amountNum = parseFloat(amount);
    let fee = 0;
    let processingTime = "1-2 business days";

    if (recipientType === "bank" && recipient.bankAccount) {
      const bankMethod = paymentMethods.getBanksByCountry(userCountry).find(
        (b) => b.providerName === recipient.bankAccount?.bankName
      );
      if (bankMethod) {
        const feeCalc = paymentMethods.calculateWithdrawalFee(amountNum, bankMethod);
        fee = feeCalc.fee;
        processingTime = `${bankMethod.processingTimeMinutes > 60 ? Math.ceil(bankMethod.processingTimeMinutes / 1440) + " business days" : bankMethod.processingTimeMinutes + " minutes"}`;
      }
    } else if (recipientType === "username") {
      fee = 0;
      processingTime = "Instant";
    } else if (recipientType === "email") {
      fee = 0;
      processingTime = "5-10 minutes";
    } else if (recipientType === "mobile") {
      const mobileMethod = paymentMethods.getMobileProvidersByCountry(userCountry)[0];
      if (mobileMethod) {
        const feeCalc = paymentMethods.calculateWithdrawalFee(amountNum, mobileMethod);
        fee = feeCalc.fee;
        processingTime = `${mobileMethod.processingTimeMinutes} minutes`;
      }
    }

    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <WalletActionHeader title="Review Withdrawal" />
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-6">
                <div>
                  <p className="text-sm text-gray-600">From your wallet</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">${amountNum.toFixed(2)}</p>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <p className="text-sm text-gray-600">{recipientDisplay?.label}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xl">{getRecipientIcon()}</span>
                    <p className="font-semibold text-gray-900">{recipientDisplay?.value}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <div className="flex justify-between mb-3">
                    <span className="text-gray-600">Amount</span>
                    <span className="font-semibold">${amountNum.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 mb-3">
                    <span>Fee</span>
                    <span>${fee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-3">
                    <span className="font-semibold">You Receive</span>
                    <span className="font-bold text-lg text-green-600">${(amountNum - fee).toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Processing time</p>
                    <p className="text-xs text-blue-700 mt-0.5">{processingTime}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t p-4 sm:p-6 space-y-3">
          <Button
            onClick={handleWithdraw}
            disabled={isLoading}
            className="w-full h-12 bg-purple-500 hover:bg-purple-600 text-white font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Withdraw ${(parseFloat(amount) - (recipientType === "bank" ? (parseFloat(amount) * 0.05) : 0)).toFixed(2)}`
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
    return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
        <WalletActionHeader title="Withdrawal Initiated" />
        <div className="flex-1 flex items-center justify-center overflow-y-auto">
          <div className="px-4 sm:px-6 py-8 text-center max-w-md">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-2">Withdrawal Initiated!</h2>
            <p className="text-gray-600 mb-8">
              ${parseFloat(amount).toFixed(2)} will be transferred in 1-2 business days
            </p>

            <Card className="border-0 shadow-sm mb-6">
              <CardContent className="p-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Reference</span>
                  <span className="font-mono">WD000001</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status</span>
                  <span className="text-purple-600 font-semibold">Pending</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t p-4 sm:p-6 space-y-3">
          <Button
            onClick={() => navigate("/app/wallet")}
            className="w-full h-12 bg-purple-500 hover:bg-purple-600 text-white font-semibold"
          >
            Back to Wallet
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

export default Withdraw;
