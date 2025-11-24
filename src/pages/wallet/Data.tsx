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

interface Provider {
  id: number;
  name: string;
  icon: string;
  description: string;
}

interface DataPlan {
  id: string;
  name: string;
  volume: string;
  validity: string;
  price: number;
}

const Data = () => {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const { walletBalance, deductBalance } = useWalletContext();
  const [step, setStep] = useState<"provider" | "plan" | "phone" | "review" | "success">("provider");
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [operators, setOperators] = useState<any[]>([]);
  const [selectedOperatorId, setSelectedOperatorId] = useState<number | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);

  // Fetch operators on component mount
  useEffect(() => {
    const fetchOperators = async () => {
      if (!user || !session) return;

      try {
        const token = session?.access_token;
        const countryCode = 'NG'; // Default to Nigeria

        const response = await fetch(`/api/reloadly/operators/${countryCode}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json();
        if (result.success && result.operators) {
          // Map operators to provider format, filter for those supporting data
          const mappedProviders = result.operators
            .filter((op: any) => op.data)
            .map((op: any) => ({
              id: op.id,
              name: op.name + ' Data',
              icon: '📊',
              description: op.name
            }));
          setProviders(mappedProviders);
          if (mappedProviders.length > 0) {
            setSelectedOperatorId(mappedProviders[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch operators:', error);
        toast.error('Failed to load service providers');
      }
    };

    fetchOperators();
  }, [user, session]);

  const dataPlans: DataPlan[] = [
    { id: "d500mb", name: "500MB", volume: "500MB", validity: "1 day", price: 100 },
    { id: "d1gb", name: "1GB", volume: "1GB", validity: "7 days", price: 250 },
    { id: "d2gb", name: "2GB", volume: "2GB", validity: "7 days", price: 400 },
    { id: "d5gb", name: "5GB", volume: "5GB", validity: "30 days", price: 800 },
    { id: "d10gb", name: "10GB", volume: "10GB", validity: "30 days", price: 1500 },
  ];

  const handlePurchase = async () => {
    setIsLoading(true);
    try {
      const token = session?.access_token;

      const response = await fetch('/api/reloadly/data/bundle', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          operatorId: selectedOperatorId,
          amount: selectedPlan?.price,
          recipientPhone: phoneNumber
        })
      });

      const result = await response.json();

      if (result.success) {
        setStep("success");
        toast.success('Data purchase successful!');
      } else {
        toast.error(result.error || 'Transaction failed');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Transaction failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = selectedProvider && selectedPlan && phoneNumber.length >= 10;

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
              {selectedPlan?.volume} {selectedPlan?.validity} plan activated on {phoneNumber}
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

          {step === "provider" && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Select Network</h3>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {providers.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => {
                      setSelectedProvider(provider);
                      setStep("plan");
                    }}
                    className="p-4 rounded-lg border-2 border-gray-200 hover:border-cyan-500 hover:bg-cyan-50 transition text-center"
                  >
                    <div className="text-3xl mb-2">{provider.icon}</div>
                    <p className="font-semibold text-gray-900">{provider.name}</p>
                    <p className="text-xs text-gray-600 mt-1">{provider.description}</p>
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
                ← Change Network
              </Button>
              <h3 className="text-sm font-semibold text-gray-900">Select Plan</h3>
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                {dataPlans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => {
                      setSelectedPlan(plan);
                      setStep("phone");
                    }}
                    className={`p-4 rounded-lg border-2 transition ${
                      selectedPlan?.id === plan.id
                        ? "border-cyan-500 bg-cyan-50"
                        : "border-gray-200 hover:border-cyan-500 hover:bg-cyan-50"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">{plan.volume}</p>
                        <p className="text-xs text-gray-600">{plan.validity}</p>
                      </div>
                      <p className="font-semibold text-gray-900">₦{plan.price.toLocaleString()}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "phone" && (
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
                    <span className="font-semibold">{selectedProvider?.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Plan</span>
                    <span className="font-semibold">{selectedPlan?.volume}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Validity</span>
                    <span className="font-semibold">{selectedPlan?.validity}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Phone</span>
                    <span className="font-semibold">{phoneNumber}</span>
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
