import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { cryptoService } from "@/services/cryptoService";
import { cryptoNotificationService } from "@/services/cryptoNotificationService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, AlertCircle, Building, Globe, CreditCard, Smartphone, DollarSign, CheckCircle2 } from "lucide-react";

const CreateP2POffer = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const assets = ["BTC", "ETH", "USDT", "BNB", "ADA", "SOL", "DOT", "AVAX"];
  const fiatCurrencies = [
    "USD", "EUR", "GBP", "NGN", "KES", "GHS", "ZAR", "EGP",
  ];
  const paymentMethods = [
    { id: "bank", name: "Bank Transfer", icon: Building },
    { id: "wise", name: "Wise", icon: Globe },
    { id: "paypal", name: "PayPal", icon: CreditCard },
    { id: "revolut", name: "Revolut", icon: Smartphone },
    { id: "mobile", name: "Mobile Money", icon: Smartphone },
    { id: "cash", name: "Cash", icon: DollarSign },
  ];

  const [formData, setFormData] = useState({
    type: "SELL" as "BUY" | "SELL",
    asset: "BTC",
    fiatCurrency: "USD",
    price: "",
    minAmount: "",
    maxAmount: "",
    totalAmount: "",
    paymentMethods: [] as string[],
    terms: "",
    autoReply: "",
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePaymentMethodToggle = (methodId: string) => {
    setFormData(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(methodId)
        ? prev.paymentMethods.filter(id => id !== methodId)
        : [...prev.paymentMethods, methodId]
    }));
  };

  const handleCreateOffer = async () => {
    if (!formData.price || !formData.totalAmount || !formData.minAmount || !formData.maxAmount) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all amount fields",
        variant: "destructive"
      });
      return;
    }

    if (formData.paymentMethods.length === 0) {
      toast({
        title: "Select Payment Methods",
        description: "Please select at least one payment method",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const offerData = {
        crypto_type: formData.asset,
        offer_type: formData.type.toLowerCase(),
        amount: parseFloat(formData.totalAmount),
        price_per_unit: parseFloat(formData.price),
        payment_method: formData.paymentMethods.join(','),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        notes: formData.terms || undefined,
      };

      await cryptoService.createP2POffer(offerData);

      if (user?.id) {
        await cryptoNotificationService.notifyP2PTrade(
          user.id,
          "offer created",
          formData.asset,
          parseFloat(formData.totalAmount)
        );
      }

      toast({
        title: "Success",
        description: "Your P2P offer has been created successfully",
      });

      navigate("/app/crypto-p2p");
    } catch (error) {
      console.error("Error creating offer:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create offer",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const cryptoAmount = formData.price && formData.totalAmount
    ? (parseFloat(formData.totalAmount) / parseFloat(formData.price)).toFixed(8)
    : "0";

  const paymentMethodsList = paymentMethods.filter(m => 
    formData.paymentMethods.includes(m.id)
  );

  return (
    <>
      <Helmet>
        <title>Create P2P Offer - Eloity</title>
        <meta name="description" content="Create a new cryptocurrency P2P trading offer" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-blue-950/30 flex flex-col">
        {/* Sticky Header */}
        <div className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="flex-shrink-0 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Create P2P Offer
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Set up a new cryptocurrency trading offer
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto pb-32 sm:pb-40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
            {/* Info Card */}
            <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                      Create a P2P trading offer
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-400 mt-1">
                      Your offer will be visible to other traders. Choose your terms carefully and set appropriate payment methods.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Offer Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">I want to</CardTitle>
                <CardDescription>Choose whether you're buying or selling</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs
                  value={formData.type.toLowerCase()}
                  onValueChange={(value) =>
                    handleInputChange("type", value.toUpperCase())
                  }
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="sell" className="text-green-600 dark:text-green-400">
                      Sell {formData.asset}
                    </TabsTrigger>
                    <TabsTrigger value="buy" className="text-red-600 dark:text-red-400">
                      Buy {formData.asset}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>

            {/* Asset and Currency */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Asset & Currency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Asset
                    </label>
                    <Select
                      value={formData.asset}
                      onValueChange={(value) => handleInputChange("asset", value)}
                    >
                      <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                        {assets.map((asset) => (
                          <SelectItem key={asset} value={asset}>
                            {asset}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Fiat Currency
                    </label>
                    <Select
                      value={formData.fiatCurrency}
                      onValueChange={(value) => handleInputChange("fiatCurrency", value)}
                    >
                      <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                        {fiatCurrencies.map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Price and Amounts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pricing</CardTitle>
                <CardDescription>Set your price and total amount</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Price per {formData.asset} ({formData.fiatCurrency})
                    </label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => handleInputChange("price", e.target.value)}
                      className="dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Total Amount ({formData.fiatCurrency})
                    </label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      value={formData.totalAmount}
                      onChange={(e) => handleInputChange("totalAmount", e.target.value)}
                      className="dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>
                </div>

                {formData.price && formData.totalAmount && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                      You will {formData.type.toLowerCase()} ~{cryptoAmount} {formData.asset}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Limits */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Limits</CardTitle>
                <CardDescription>Set minimum and maximum order amounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Min Order ({formData.fiatCurrency})
                    </label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      value={formData.minAmount}
                      onChange={(e) => handleInputChange("minAmount", e.target.value)}
                      className="dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Max Order ({formData.fiatCurrency})
                    </label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      value={formData.maxAmount}
                      onChange={(e) => handleInputChange("maxAmount", e.target.value)}
                      className="dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Methods</CardTitle>
                <CardDescription>Select all payment methods you accept</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.paymentMethods.includes(method.id)
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.paymentMethods.includes(method.id)}
                        onChange={() => handlePaymentMethodToggle(method.id)}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <method.icon className="h-5 w-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 flex-1">
                        {method.name}
                      </span>
                      {formData.paymentMethods.includes(method.id) && (
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                      )}
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Terms and Messages */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Optional Details</CardTitle>
                <CardDescription>Add terms and auto-reply message</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Terms (Optional)
                  </label>
                  <Input
                    placeholder="e.g., Payment within 15 minutes required"
                    value={formData.terms}
                    onChange={(e) => handleInputChange("terms", e.target.value)}
                    className="dark:bg-slate-800 dark:border-slate-700"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Traders will see this when viewing your offer
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Auto Reply Message (Optional)
                  </label>
                  <Input
                    placeholder="e.g., Thank you for your order. Please make payment within 15 minutes."
                    value={formData.autoReply}
                    onChange={(e) => handleInputChange("autoReply", e.target.value)}
                    className="dark:bg-slate-800 dark:border-slate-700"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    This message will be sent when someone accepts your offer
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Summary Card */}
            {formData.price && formData.totalAmount && (
              <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
                <CardHeader>
                  <CardTitle className="text-base text-green-900 dark:text-green-300">Offer Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">You will {formData.type.toLowerCase()}:</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {cryptoAmount} {formData.asset}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-green-200 dark:border-green-800 pt-3">
                    <span className="text-gray-700 dark:text-gray-300">For:</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {parseFloat(formData.totalAmount).toFixed(2)} {formData.fiatCurrency}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-green-200 dark:border-green-800 pt-3">
                    <span className="text-gray-700 dark:text-gray-300">Rate:</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {parseFloat(formData.price).toFixed(2)} {formData.fiatCurrency}/{formData.asset}
                    </span>
                  </div>
                  {paymentMethodsList.length > 0 && (
                    <div className="border-t border-green-200 dark:border-green-800 pt-3">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Accepted Payment Methods:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {paymentMethodsList.map((method) => (
                          <span
                            key={method.id}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-white dark:bg-slate-800 rounded text-xs font-medium text-gray-700 dark:text-gray-300"
                          >
                            <method.icon className="h-3 w-3" />
                            {method.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="fixed sm:sticky bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
                className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateOffer}
                disabled={
                  isSubmitting ||
                  !formData.price ||
                  !formData.totalAmount ||
                  !formData.minAmount ||
                  !formData.maxAmount ||
                  formData.paymentMethods.length === 0
                }
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white min-w-[120px]"
              >
                {isSubmitting ? "Creating..." : "Create Offer"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateP2POffer;
