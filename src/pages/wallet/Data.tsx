import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useWalletContext } from "@/contexts/WalletContext";
import { WalletActionHeader } from "@/components/wallet/WalletActionHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";

interface Operator {
  id: number;
  name: string;
  bundle: boolean;
  data: boolean;
  pin: boolean;
  supportsLocalAmounts: boolean;
  denominationType: string;
  senderCurrencyCode: string;
  senderCurrencySymbol: string;
  destinationCurrencyCode: string;
  destinationCurrencySymbol: string;
  commission: number;
  fxRate: number;
  logoUrls: string[];
}

const Data = () => {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const { walletBalance, deductBalance } = useWalletContext();
  const [step, setStep] = useState<"provider" | "amount" | "phone" | "review" | "success">("provider");
  const [operators, setOperators] = useState<Operator[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [error, setError] = useState("");
  const [commissionData, setCommissionData] = useState<any>(null);

  // Fetch operators on component mount
  useEffect(() => {
    fetchOperators();
  }, []);

  const fetchOperators = async () => {
    try {
      setError("");
      const token = session?.access_token;
      const response = await fetch('/api/reloadly/operators/NG', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch operators');
      }

      const data = await response.json();
      if (data.success && data.operators) {
        // Filter only data operators
        const dataOperators = data.operators.filter((op: Operator) => op.data);
        setOperators(dataOperators);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load providers';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('Fetch operators error:', err);
    }
  };

  const handlePurchase = async () => {
    if (!selectedOperator || !customAmount || !phoneNumber) {
      toast.error('Please fill in all fields');
      return;
    }

    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    try {
      setError("");
      const token = session?.access_token;
      
      const response = await fetch('/api/reloadly/data/bundle', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          operatorId: selectedOperator.id,
          amount: amount,
          recipientPhone: phoneNumber
        })
      });

      const result = await response.json();

      if (result.success) {
        setTransactionId(result.transactionId);
        setStep("success");
        toast.success('Data bundle purchased successfully!');
      } else {
        const errorMsg = result.error || 'Purchase failed';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Purchase failed. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('Purchase error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = selectedOperator && customAmount && phoneNumber.length >= 10;

  if (step === "success") {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <WalletActionHeader title="Data Purchase" />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Purchase Successful!</h2>
            <p className="text-gray-600">
              Data bundle of {selectedOperator?.destinationCurrencySymbol}{parseFloat(customAmount).toLocaleString()} activated on {phoneNumber}
            </p>
            {transactionId && (
              <p className="text-sm text-gray-500">
                Transaction ID: {transactionId}
              </p>
            )}
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
      <WalletActionHeader title="Buy Data" subtitle="Get fast internet bundles" />
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 space-y-6">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Available Balance</p>
              <p className="text-4xl font-bold text-gray-900 mt-2">
                ${walletBalance?.total.toFixed(2) || "0.00"}
              </p>
            </CardContent>
          </Card>

          {error && (
            <Card className="border-2 border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {step === "provider" && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Select Network Provider</h3>
              {operators.length === 0 ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="pt-6">
                    <p className="text-center text-gray-600">Loading providers...</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:gap-4 max-h-96 overflow-y-auto">
                  {operators.map((operator) => (
                    <button
                      key={operator.id}
                      onClick={() => {
                        setSelectedOperator(operator);
                        setStep("amount");
                      }}
                      className="p-4 rounded-lg border-2 border-gray-200 hover:border-cyan-500 hover:bg-cyan-50 transition text-center"
                    >
                      {operator.logoUrls && operator.logoUrls.length > 0 ? (
                        <img 
                          src={operator.logoUrls[0]} 
                          alt={operator.name}
                          className="h-12 w-12 mx-auto mb-2 object-contain"
                        />
                      ) : (
                        <div className="text-3xl mb-2">📊</div>
                      )}
                      <p className="font-semibold text-gray-900 text-sm">{operator.name}</p>
                      <p className="text-xs text-gray-600 mt-1">{operator.destinationCurrencySymbol}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === "amount" && (
            <div className="space-y-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setStep("provider");
                  setSelectedOperator(null);
                }}
                className="text-blue-600"
              >
                ← Change Network
              </Button>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Enter Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-gray-600">
                    {selectedOperator?.destinationCurrencySymbol || '₦'}
                  </span>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="pl-10 text-lg h-12"
                    min="1"
                  />
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Enter the amount you want to spend on data
                </p>
              </div>
              {customAmount && (
                <Button
                  onClick={() => setStep("phone")}
                  className="w-full bg-cyan-600 hover:bg-cyan-700"
                  size="lg"
                >
                  Continue
                </Button>
              )}
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
                  Recipient Phone Number
                </label>
                <Input
                  type="tel"
                  placeholder="Enter phone number (e.g., 2348012345678)"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="text-lg"
                />
                <p className="text-xs text-gray-600 mt-2">
                  Include country code (e.g., 234 for Nigeria)
                </p>
              </div>
              {canProceed && (
                <Button
                  onClick={() => setStep("review")}
                  className="w-full bg-cyan-600 hover:bg-cyan-700"
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
              <Card className="border-0 shadow-sm bg-cyan-50">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Network</span>
                    <span className="font-semibold">{selectedOperator?.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Amount</span>
                    <span className="font-semibold">{selectedOperator?.destinationCurrencySymbol}{parseFloat(customAmount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Phone</span>
                    <span className="font-semibold">{phoneNumber}</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between items-center">
                    <span className="text-gray-600">Commission</span>
                    <span className="font-semibold">{(selectedOperator?.commission || 0).toFixed(2)}%</span>
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

export default Data;
