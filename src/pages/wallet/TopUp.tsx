import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useWalletContext } from "@/contexts/WalletContext";
import { WalletActionHeader } from "@/components/wallet/WalletActionHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle2, AlertCircle, Phone, Zap, FileText, Grid3x3 } from "lucide-react";

interface ServiceProvider {
  id: string;
  name: string;
  icon: string;
  category: "airtime" | "data" | "utilities" | "bills";
  description: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  validity?: string;
}

const TopUp = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { walletBalance } = useWalletContext();
  const [step, setStep] = useState<"category" | "provider" | "plan" | "phone" | "review" | "success">("category");
  const [selectedCategory, setSelectedCategory] = useState<"airtime" | "data" | "utilities" | "bills" | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Mock providers
  const airimeProviders: ServiceProvider[] = [
    { id: "mtn", name: "MTN", icon: "🟡", category: "airtime", description: "Nigeria, Ghana, Cameroon" },
    { id: "airtel", name: "Airtel", icon: "🔴", category: "airtime", description: "Fast & reliable" },
    { id: "glo", name: "Globacom", icon: "🟢", category: "airtime", description: "Nigeria's largest network" },
    { id: "9mobile", name: "9Mobile", icon: "🔵", category: "airtime", description: "Best rates" },
  ];

  const dataProviders: ServiceProvider[] = [
    { id: "mtn-data", name: "MTN Data", icon: "📊", category: "data", description: "Fast 4G/5G" },
    { id: "airtel-data", name: "Airtel Data", icon: "📈", category: "data", description: "Premium speeds" },
    { id: "glo-data", name: "Glo Data", icon: "📉", category: "data", description: "Affordable bundles" },
    { id: "9mobile-data", name: "9Mobile Data", icon: "📡", category: "data", description: "Best value" },
  ];

  const billsProviders: ServiceProvider[] = [
    { id: "electric", name: "Electricity Bills", icon: "⚡", category: "bills", description: "Pay power bills" },
    { id: "water", name: "Water Utilities", icon: "💧", category: "bills", description: "Water services" },
    { id: "internet", name: "Internet Providers", icon: "🌐", category: "bills", description: "ISP payments" },
    { id: "cable", name: "Cable TV", icon: "📺", category: "bills", description: "DStv, GOtv, etc" },
  ];

  const utilityProviders: ServiceProvider[] = [
    { id: "school", name: "School Fees", icon: "🎓", category: "utilities", description: "Pay tuition" },
    { id: "transport", name: "Transport Vouchers", icon: "🚍", category: "utilities", description: "Bus tickets" },
    { id: "insurance", name: "Insurance", icon: "🛡️", category: "utilities", description: "Policy payments" },
    { id: "betting", name: "Betting Credits", icon: "🎰", category: "utilities", description: "Gaming accounts" },
  ];

  const allProviders = useMemo(() => {
    switch (selectedCategory) {
      case "airtime":
        return airimeProviders;
      case "data":
        return dataProviders;
      case "bills":
        return billsProviders;
      case "utilities":
        return utilityProviders;
      default:
        return [];
    }
  }, [selectedCategory]);

  const airtimePlans: Plan[] = [
    { id: "500", name: "₦500", price: 500 },
    { id: "1000", name: "₦1,000", price: 1000 },
    { id: "2000", name: "₦2,000", price: 2000 },
    { id: "5000", name: "₦5,000", price: 5000 },
    { id: "10000", name: "₦10,000", price: 10000 },
  ];

  const dataPlans: Plan[] = [
    { id: "d500", name: "500MB - 1 day", price: 100, validity: "1 day" },
    { id: "d1gb", name: "1GB - 7 days", price: 250, validity: "7 days" },
    { id: "d2gb", name: "2GB - 7 days", price: 400, validity: "7 days" },
    { id: "d5gb", name: "5GB - 30 days", price: 800, validity: "30 days" },
    { id: "d10gb", name: "10GB - 30 days", price: 1500, validity: "30 days" },
  ];

  const billsPlans: Plan[] = [
    { id: "b1000", name: "₦1,000", price: 1000 },
    { id: "b5000", name: "₦5,000", price: 5000 },
    { id: "b10000", name: "₦10,000", price: 10000 },
    { id: "b20000", name: "₦20,000", price: 20000 },
  ];

  const getPlansByProvider = () => {
    if (selectedCategory === "airtime") return airtimePlans;
    if (selectedCategory === "data") return dataPlans;
    if (selectedCategory === "bills" || selectedCategory === "utilities") return billsPlans;
    return [];
  };

  const handleTopUp = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStep("success");
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryTitle = () => {
    const titles = {
      airtime: "Buy Airtime",
      data: "Buy Data Bundle",
      bills: "Pay Bills",
      utilities: "Utilities & Services",
    };
    return titles[selectedCategory as keyof typeof titles] || "";
  };

  if (step === "category") {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <WalletActionHeader title="Top Up Services" subtitle="Quick access to local services" />
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-6">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-red-50">
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600">Available Balance</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">
                  ${walletBalance?.total.toFixed(2) || "0.00"}
                </p>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Select Service</h3>

              {[
                { category: "airtime" as const, label: "Buy Airtime", icon: "📞", desc: "Mobile credit" },
                { category: "data" as const, label: "Buy Data", icon: "📊", desc: "Internet bundles" },
                { category: "bills" as const, label: "Pay Bills", icon: "⚡", desc: "Utilities & services" },
                { category: "utilities" as const, label: "Other Services", icon: "🎓", desc: "Schools, betting, etc" },
              ].map((cat) => (
                <button
                  key={cat.category}
                  onClick={() => {
                    setSelectedCategory(cat.category);
                    setStep("provider");
                  }}
                  className="w-full text-left"
                >
                  <Card className="border-2 border-gray-200 hover:border-orange-400 hover:shadow-md transition-all">
                    <CardContent className="p-4 flex items-center gap-4">
                      <span className="text-4xl">{cat.icon}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{cat.label}</p>
                        <p className="text-sm text-gray-600">{cat.desc}</p>
                      </div>
                      <span className="text-gray-400">→</span>
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

  if (step === "provider") {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <WalletActionHeader title={getCategoryTitle()} subtitle="Select provider" />
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-3">
            {allProviders.map((provider) => (
              <button
                key={provider.id}
                onClick={() => {
                  setSelectedProvider(provider);
                  setStep(selectedCategory === "data" ? "plan" : "phone");
                }}
                className="w-full text-left"
              >
                <Card className="border-2 border-gray-200 hover:border-orange-400 hover:shadow-md transition-all">
                  <CardContent className="p-4 flex items-center gap-4">
                    <span className="text-4xl">{provider.icon}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{provider.name}</p>
                      <p className="text-sm text-gray-600">{provider.description}</p>
                    </div>
                    <span className="text-gray-400">→</span>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t p-4 sm:p-6">
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

  if (step === "phone") {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <WalletActionHeader title={selectedProvider?.name || "Enter Phone"} />
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-6">
            <Card className="border-0 shadow-sm text-center py-6">
              <span className="text-6xl">{selectedProvider?.icon}</span>
              <p className="text-lg font-semibold text-gray-900 mt-3">{selectedProvider?.name}</p>
            </Card>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                {selectedCategory === "bills" || selectedCategory === "utilities"
                  ? "Reference/Account Number"
                  : "Phone Number"}
              </label>
              <Input
                placeholder={selectedCategory === "bills" ? "e.g., 12345678901" : "e.g., 08012345678"}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="h-12 text-lg"
              />
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t p-4 sm:p-6 space-y-3">
          <Button
            onClick={() => setStep("plan")}
            disabled={!phoneNumber}
            className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold"
          >
            Continue
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setStep("provider");
              setSelectedProvider(null);
            }}
            className="w-full h-12"
          >
            Back
          </Button>
        </div>
      </div>
    );
  }

  if (step === "plan") {
    const plans = getPlansByProvider();

    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <WalletActionHeader title="Select Plan" />
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-3">
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => {
                  setSelectedPlan(plan);
                  setStep("review");
                }}
                className="w-full text-left"
              >
                <Card className="border-2 border-gray-200 hover:border-orange-400 hover:shadow-md transition-all">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{plan.name}</p>
                      {plan.validity && <p className="text-sm text-gray-600">Valid for {plan.validity}</p>}
                    </div>
                    <span className="text-xl font-bold text-orange-600">${plan.price}</span>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t p-4 sm:p-6">
          <Button
            variant="outline"
            onClick={() => {
              setStep("phone");
              setSelectedProvider(null);
            }}
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
        <WalletActionHeader title="Review Transaction" />
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Service Provider</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-3xl">{selectedProvider?.icon}</span>
                    <p className="font-semibold text-gray-900">{selectedProvider?.name}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-600">Recipient</p>
                  <p className="font-semibold text-gray-900 mt-2">{phoneNumber}</p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-600">Plan</p>
                  <p className="font-semibold text-gray-900 mt-2">{selectedPlan?.name}</p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Amount</span>
                    <span className="font-bold">${selectedPlan?.price}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="font-semibold">Total</span>
                    <span className="text-2xl font-bold text-orange-600">${selectedPlan?.price}</span>
                  </div>
                </div>

                <div className="flex gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Instant delivery</p>
                    <p className="text-xs text-blue-700 mt-0.5">Service will be activated immediately</p>
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
            className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Top Up ₦${selectedPlan?.price}`
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setStep("plan")}
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
      <div className="flex flex-col h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <WalletActionHeader title="Transaction Successful" />
        <div className="flex-1 flex items-center justify-center overflow-y-auto">
          <div className="px-4 sm:px-6 py-8 text-center max-w-md">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-2">Success!</h2>
            <p className="text-gray-600 mb-8">
              Your {selectedProvider?.name} service has been activated
            </p>

            <Card className="border-0 shadow-sm mb-6">
              <CardContent className="p-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Reference</span>
                  <span className="font-mono">TU{String(Date.now()).slice(-6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-bold">${selectedPlan?.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="text-green-600 font-semibold">Activated</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t p-4 sm:p-6 space-y-3">
          <Button
            onClick={() => navigate("/app/wallet")}
            className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold"
          >
            Back to Wallet
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setStep("category");
              setSelectedCategory(null);
              setSelectedProvider(null);
              setSelectedPlan(null);
              setPhoneNumber("");
            }}
            className="w-full h-12"
          >
            Top Up Again
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

export default TopUp;
