import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import {
  CreditCard,
  Wallet,
  Bitcoin,
  Smartphone,
  Building,
  Globe,
} from "lucide-react";
import { paymentMethods } from "@/config/paymentMethods";

const Deposit = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { walletBalance } = useWalletContext();
  const [userCountry, setUserCountry] = useState("NG");

  useEffect(() => {
    // Get country from user metadata or use default
    const country = (user?.user_metadata?.country_code as string) || "NG";
    setUserCountry(country);
  }, [user]);
  const [step, setStep] = useState<"country" | "method" | "amount" | "review" | "success">("country");
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [selectedDestination, setSelectedDestination] = useState<"ecommerce" | "crypto" | "rewards" | "freelance">("ecommerce");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const regionConfig = paymentMethods.getRegionConfig(userCountry);
  const allMethods = useMemo(() => {
    const methods = paymentMethods.getMethodsByCountry(userCountry);
    return methods.filter(m => m.isDepositEnabled);
  }, [userCountry]);

  const methodTypeIcons: Record<string, React.ReactNode> = {
    card: <CreditCard className="h-6 w-6 text-blue-600" />,
    bank: <Wallet className="h-6 w-6 text-green-600" />,
    crypto: <Bitcoin className="h-6 w-6 text-orange-600" />,
    mobile: <Smartphone className="h-6 w-6 text-purple-600" />,
    ewallet: <Building className="h-6 w-6 text-indigo-600" />,
  };

  const destinations = [
    {
      value: "ecommerce" as const,
      label: "E-Commerce Wallet",
      description: "For marketplace purchases",
      emoji: "🛒",
    },
    {
      value: "crypto" as const,
      label: "Crypto Portfolio",
      description: "For crypto trading",
      emoji: "💹",
    },
    {
      value: "rewards" as const,
      label: "Rewards Account",
      description: "For reward programs",
      emoji: "🎁",
    },
    {
      value: "freelance" as const,
      label: "Freelance Wallet",
      description: "For freelance payments",
      emoji: "💼",
    },
  ];

  const handleDeposit = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStep("success");
    } finally {
      setIsLoading(false);
    }
  };


  if (step === "country") {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <WalletActionHeader title="Add Funds to Wallet" subtitle="Deposit via card, bank, crypto & more" />
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-6">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600">Current Balance</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">
                  ${walletBalance?.total.toFixed(2) || "0.00"}
                </p>
              </CardContent>
            </Card>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Select Your Country</h3>
              <Select value={userCountry} onValueChange={(value) => setUserCountry(value)}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.getAllRegions().map((region) => (
                    <SelectItem key={region.countryCode} value={region.countryCode}>
                      {region.countryName} ({region.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 mt-6">Select Payment Method</h3>
              <p className="text-xs text-gray-600 mb-3">Fast, secure, and multiple options to fund your wallet</p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {allMethods.map((method) => {
                  const feeInfo = paymentMethods.calculateDepositFee(100, method);
                  return (
                    <button
                      key={method.id}
                      onClick={() => {
                        setSelectedMethod(method.id);
                        setStep("amount");
                      }}
                      className="w-full text-left"
                    >
                      <Card
                        className={`border-2 transition-all cursor-pointer ${
                          selectedMethod === method.id
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-green-300"
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {methodTypeIcons[method.methodType]}
                              <div>
                                <p className="font-semibold text-gray-900">{method.providerName}</p>
                                <p className="text-xs text-gray-600">
                                  {method.processingTimeMinutes > 60
                                    ? `${Math.ceil(method.processingTimeMinutes / 1440)} days`
                                    : `${method.processingTimeMinutes}m`} •
                                  {method.depositFeePercentage ? ` ${method.depositFeePercentage}%` : method.depositFlatFee ? ` ${method.depositFlatFee} fee` : ' No fee'}
                                </p>
                              </div>
                            </div>
                            <span className="text-gray-400">→</span>
                          </div>
                        </CardContent>
                      </Card>
                    </button>
                  );
                })}
              </div>
            </div>

            <Button
              onClick={() => setStep("amount")}
              disabled={!selectedMethod}
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold"
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "amount") {
    const selectedPaymentMethod = allMethods.find(m => m.id === selectedMethod);

    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <WalletActionHeader title="Deposit Amount" />
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs text-gray-600">Payment Method</p>
                <div className="flex items-center gap-2 mt-2">
                  {selectedPaymentMethod && (
                    <>
                      {methodTypeIcons[selectedPaymentMethod.methodType]}
                      <div>
                        <p className="font-semibold text-gray-900">{selectedPaymentMethod.providerName}</p>
                        <p className="text-xs text-gray-600">{selectedPaymentMethod.countryName}</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Deposit To</h3>
              <Select value={selectedDestination} onValueChange={(value: any) => setSelectedDestination(value)}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select destination wallet" />
                </SelectTrigger>
                <SelectContent>
                  {destinations.map((dest) => (
                    <SelectItem key={dest.value} value={dest.value}>
                      <div className="flex items-center gap-2">
                        <span>{dest.emoji}</span>
                        <div>
                          <div className="font-medium">{dest.label}</div>
                          <div className="text-xs text-gray-500">{dest.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <div className="mt-3 flex justify-between text-xs text-gray-600">
                <span>Min: $1</span>
                <span>No maximum</span>
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
                <p className="text-xs text-blue-700 mt-0.5">
                  {selectedMethod === "card" && "Instant"}
                  {selectedMethod === "bank" && "1-3 business days"}
                  {selectedMethod === "crypto" && "Varies by blockchain"}
                  {selectedMethod === "mobile" && "Instant"}
                  {selectedMethod === "ewallet" && "Instant"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t p-4 sm:p-6 space-y-3">
          <Button
            onClick={() => setStep("review")}
            disabled={!amount || parseFloat(amount) <= 0}
            className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold"
          >
            Continue
          </Button>
          <Button
            variant="outline"
            onClick={() => setStep("country")}
            className="w-full h-12"
          >
            Back
          </Button>
        </div>
      </div>
    );
  }

  if (step === "review") {
    const destinationInfo = destinations.find(d => d.value === selectedDestination);
    const selectedPaymentMethod = allMethods.find(m => m.id === selectedMethod);
    const depositAmount = parseFloat(amount);
    const feeCalc = selectedPaymentMethod ? paymentMethods.calculateDepositFee(depositAmount, selectedPaymentMethod) : { fee: 0, total: depositAmount };

    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <WalletActionHeader title="Review Deposit" />
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-6">
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <div className="flex items-center gap-2 mt-2">
                    {selectedPaymentMethod && (
                      <>
                        {methodTypeIcons[selectedPaymentMethod.methodType]}
                        <div>
                          <p className="font-semibold text-gray-900">{selectedPaymentMethod.providerName}</p>
                          <p className="text-xs text-gray-600">{selectedPaymentMethod.countryName}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <p className="text-sm text-gray-600">Deposit To</p>
                  <p className="font-semibold text-gray-900 mt-2">
                    {destinationInfo?.emoji} {destinationInfo?.label}
                  </p>
                  <p className="text-sm text-gray-600">{destinationInfo?.description}</p>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <div className="flex justify-between mb-3">
                    <span className="text-gray-600">Amount</span>
                    <span className="font-semibold">${depositAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 mb-3">
                    <span>Fee</span>
                    <span className="font-semibold">${feeCalc.fee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-3">
                    <span className="font-semibold">Total Charge</span>
                    <span className="font-bold text-lg">${feeCalc.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t p-4 sm:p-6 space-y-3">
          <Button
            onClick={handleDeposit}
            disabled={isLoading}
            className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Deposit $${feeCalc.total.toFixed(2)}`
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
    const destinationInfo = destinations.find(d => d.value === selectedDestination);
    return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-green-50 to-emerald-50">
        <WalletActionHeader title="Deposit Complete" />
        <div className="flex-1 flex items-center justify-center overflow-y-auto">
          <div className="px-4 sm:px-6 py-8 text-center max-w-md">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-2">Deposit Successful!</h2>
            <p className="text-gray-600 mb-8">
              ${parseFloat(amount).toFixed(2)} has been added to {destinationInfo?.emoji} {destinationInfo?.label}
            </p>

            <Card className="border-0 shadow-sm mb-6">
              <CardContent className="p-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Reference</span>
                  <span className="font-mono">DEP000001</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status</span>
                  <span className="text-green-600 font-semibold">Completed</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t p-4 sm:p-6 space-y-3">
          <Button
            onClick={() => navigate("/app/wallet")}
            className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold"
          >
            Back to Wallet
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

export default Deposit;
