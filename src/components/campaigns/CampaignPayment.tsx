import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Wallet,
  CreditCard,
  Zap,
  Bitcoin,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Info,
  Plus,
  ArrowRight,
  Shield,
  Clock,
  Star,
  Gift,
  Percent,
  Target,
  TrendingUp,
  Eye,
  MousePointer,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CampaignPaymentProps {
  campaignCost: number;
  currency: string;
  estimatedReach: number;
  estimatedROI: number;
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentError: (error: string) => void;
}

const CampaignPayment: React.FC<CampaignPaymentProps> = ({
  campaignCost,
  currency,
  estimatedReach,
  estimatedROI,
  onPaymentSuccess,
  onPaymentError,
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<string>("eloits");
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"select" | "confirm" | "processing" | "success">("select");
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [walletBalances, setWalletBalances] = useState({
    softpoints: 0,
    usdt: 0,
    btc: 0,
    eth: 0,
    sol: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fetch real wallet data
  useEffect(() => {
    const fetchWalletData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('wallets')
          .select('softpoints_balance, usdt_balance, btc_balance, eth_balance, sol_balance')
          .eq('user_id', user.id)
          .maybeSingle() as any; // Type assertion due to stale type cache

        if (error) {
          console.error('Error fetching wallet:', error);
          toast({
            title: "Error loading wallet",
            description: "Using default values",
            variant: "destructive",
          });
        } else if (data) {
          setWalletBalances({
            softpoints: data.softpoints_balance || 0,
            usdt: Number(data.usdt_balance) || 0,
            btc: Number(data.btc_balance) || 0,
            eth: Number(data.eth_balance) || 0,
            sol: Number(data.sol_balance) || 0,
          });
        }
      } catch (error) {
        console.error('Error in wallet fetch:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, [user, toast]);

  // Payment method configurations using real wallet balances
  const PAYMENT_METHODS = [
    {
      id: "eloits",
      name: "Eloits (Softpoints)",
      icon: Zap,
      description: "Use your Softpoints balance",
      available: true,
      balance: walletBalances.softpoints,
      currency: "SP",
      bonuses: [
        { type: "reach", multiplier: 1.1, description: "10% extra reach" },
        { type: "cashback", percentage: 5, description: "5% cashback on completed campaigns" }
      ],
      fees: { percentage: 0, fixed: 0 },
      processingTime: "Instant",
      color: "from-purple-500 to-blue-500",
    },
    {
      id: "usdt",
      name: "USDT (Tether)",
      icon: Bitcoin,
      description: "Pay with USDT from your crypto wallet",
      available: true,
      balance: walletBalances.usdt,
      currency: "USDT",
      bonuses: [
        { type: "discount", percentage: 3, description: "3% discount on crypto payments" }
      ],
      fees: { percentage: 2, fixed: 0 },
      processingTime: "1-3 minutes",
      color: "from-green-500 to-teal-500",
    },
    {
      id: "wallet_balance",
      name: "Unified Wallet",
      icon: Wallet,
      description: "Use your unified wallet balance",
      available: true,
      balance: walletBalances.usdt, // Using USDT as unified balance
      currency: "USD",
    bonuses: [],
    fees: { percentage: 1.5, fixed: 0 },
    processingTime: "Instant",
    color: "from-blue-500 to-indigo-500",
  },
  {
    id: "card",
    name: "Credit/Debit Card",
    icon: CreditCard,
    description: "Add funds via card payment",
    available: true,
    balance: 0,
    currency: "USD",
    bonuses: [
      { type: "firstTime", amount: 10, description: "$10 bonus for first card payment" }
    ],
      fees: { percentage: 2.9, fixed: 0.30 },
      processingTime: "Instant",
      color: "from-gray-500 to-slate-500",
      requiresTopUp: true,
    },
  ];

  const selectedPaymentMethod = PAYMENT_METHODS.find(m => m.id === selectedMethod);

  // Calculate final cost including fees and bonuses
  const calculateFinalCost = (method: typeof PAYMENT_METHODS[0]) => {
    let finalCost = campaignCost;

    // Apply discounts (narrow union)
    const discountBonus = method.bonuses.find(b => b.type === "discount");
    if (discountBonus && typeof (discountBonus as any).percentage === 'number') {
      finalCost *= (1 - (discountBonus as any).percentage / 100);
    }

    // Add fees
    const feeAmount = (finalCost * method.fees.percentage / 100) + method.fees.fixed;
    finalCost += feeAmount;

    return { finalCost, feeAmount };
  };

  const calculateEnhancedReach = (method: typeof PAYMENT_METHODS[0]) => {
    const reachBonus = method.bonuses.find(b => b.type === "reach");
    if (reachBonus && typeof (reachBonus as any).multiplier === 'number') {
      return Math.round(estimatedReach * (reachBonus as any).multiplier);
    }
    return estimatedReach;
  };

  const hasInsufficientFunds = (method: typeof PAYMENT_METHODS[0]) => {
    if (method.requiresTopUp) return false;
    const { finalCost } = calculateFinalCost(method);
    return method.balance < finalCost;
  };

  const handlePayment = async () => {
    if (!selectedPaymentMethod) return;

    setIsProcessing(true);
    setPaymentStep("processing");

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      const { finalCost } = calculateFinalCost(selectedPaymentMethod);
      const enhancedReach = calculateEnhancedReach(selectedPaymentMethod);

      const paymentData = {
        method: selectedPaymentMethod.id,
        amount: finalCost,
        currency: selectedPaymentMethod.currency,
        transactionId: `camp_${Date.now()}`,
        bonuses: selectedPaymentMethod.bonuses,
        enhancedReach,
        timestamp: new Date().toISOString(),
      };

      setPaymentStep("success");
      setTimeout(() => {
        onPaymentSuccess(paymentData);
      }, 2000);

    } catch (error) {
      onPaymentError("Payment processing failed. Please try again.");
      setPaymentStep("select");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTopUp = () => {
    const requiredAmount = campaignCost - (selectedPaymentMethod?.balance || 0);
    setDepositAmount(Math.ceil(requiredAmount));
    setShowDepositModal(true);
  };

  const formatCurrency = (amount: number, curr: string) => {
    if (curr === "ELO") return `${amount.toFixed(0)} ELO`;
    if (curr === "USDT") return `$${amount.toFixed(2)} USDT`;
    return `$${amount.toFixed(2)}`;
  };

  if (paymentStep === "processing") {
    return (
      <Card className="text-center">
        <CardContent className="pt-8 pb-8">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
            <h3 className="text-xl font-semibold">Processing Payment</h3>
            <p className="text-muted-foreground">
              Please wait while we process your payment...
            </p>
            <div className="max-w-xs mx-auto">
              <Progress value={66} className="h-2" />
            </div>
            <p className="text-sm text-muted-foreground">
              Processing time: {selectedPaymentMethod?.processingTime}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (paymentStep === "success") {
    return (
      <Card className="text-center bg-green-50 border-green-200">
        <CardContent className="pt-8 pb-8">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-green-800">Payment Successful!</h3>
            <p className="text-green-700">
              Your campaign is now live and promoting your content
            </p>
            <div className="flex justify-center gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold">{calculateEnhancedReach(selectedPaymentMethod!).toLocaleString()}</div>
                <div className="text-muted-foreground">Estimated Reach</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{estimatedROI}%</div>
                <div className="text-muted-foreground">Expected ROI</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Campaign Cost Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold">Campaign Investment</h3>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(campaignCost, currency)}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Expected Return</div>
              <div className="text-lg font-semibold text-green-600">
                {estimatedROI}% ROI
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <div className="space-y-4">
        <Label className="text-lg font-semibold">Select Payment Method</Label>
        
        {PAYMENT_METHODS.map((method) => {
          const { finalCost, feeAmount } = calculateFinalCost(method);
          const insufficientFunds = hasInsufficientFunds(method);
          const enhancedReach = calculateEnhancedReach(method);

          return (
            <Card
              key={method.id}
              className={`cursor-pointer transition-all border-2 ${
                selectedMethod === method.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              } ${insufficientFunds ? 'opacity-75' : ''}`}
              onClick={() => !insufficientFunds && setSelectedMethod(method.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${method.color}`}>
                      <method.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold flex items-center gap-2">
                        {method.name}
                        {selectedMethod === method.id && (
                          <CheckCircle2 className="h-4 w-4 text-blue-600" />
                        )}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {method.description}
                      </p>
                      
                      {/* Balance */}
                      {!method.requiresTopUp && (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-muted-foreground">Balance:</span>
                          <span className={`font-medium ${
                            insufficientFunds ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {formatCurrency(method.balance, method.currency)}
                          </span>
                        </div>
                      )}

                      {/* Bonuses */}
                      {method.bonuses.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {method.bonuses.map((bonus, index) => (
                            <Badge key={index} className="text-xs bg-yellow-100 text-yellow-800">
                              <Gift className="h-3 w-3 mr-1" />
                              {bonus.description}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Processing Time */}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {method.processingTime}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-semibold text-lg">
                      {formatCurrency(finalCost, method.currency)}
                    </div>
                    {feeAmount > 0 && (
                      <div className="text-xs text-muted-foreground">
                        +{formatCurrency(feeAmount, method.currency)} fee
                      </div>
                    )}
                    
                    {enhancedReach > estimatedReach && (
                      <Badge className="text-xs bg-green-100 text-green-800 mt-1">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {((enhancedReach / estimatedReach - 1) * 100).toFixed(0)}% more reach
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Insufficient Funds Warning */}
                {insufficientFunds && (
                  <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      <span className="text-sm text-orange-700">
                        Insufficient funds. Need {formatCurrency(finalCost - method.balance, method.currency)} more.
                      </span>
                    </div>
                    <Button size="sm" variant="outline" onClick={handleTopUp}>
                      <Plus className="h-3 w-3 mr-1" />
                      Top Up
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Payment Summary */}
      {selectedPaymentMethod && (
        <Card className="bg-gray-50">
          <CardHeader>
            <h3 className="font-semibold">Payment Summary</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Campaign Cost:</span>
                <span>{formatCurrency(campaignCost, currency)}</span>
              </div>
              
              {selectedPaymentMethod.bonuses.find(b => b.type === "discount") && (
                <div className="flex justify-between text-green-600">
                  <span>Crypto Discount:</span>
                  <span>-{formatCurrency(campaignCost * 0.03, selectedPaymentMethod.currency)}</span>
                </div>
              )}
              
              {calculateFinalCost(selectedPaymentMethod).feeAmount > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Processing Fee:</span>
                  <span>+{formatCurrency(calculateFinalCost(selectedPaymentMethod).feeAmount, selectedPaymentMethod.currency)}</span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span>{formatCurrency(calculateFinalCost(selectedPaymentMethod).finalCost, selectedPaymentMethod.currency)}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-center bg-white p-3 rounded">
                <div>
                  <div className="font-medium">{calculateEnhancedReach(selectedPaymentMethod).toLocaleString()}</div>
                  <div className="text-muted-foreground">Est. Reach</div>
                </div>
                <div>
                  <div className="font-medium">{estimatedROI}%</div>
                  <div className="text-muted-foreground">Expected ROI</div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              size="lg"
              onClick={handlePayment}
              disabled={hasInsufficientFunds(selectedPaymentMethod) || isProcessing}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Confirm Payment & Launch Campaign
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Security Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Secure Payment</h4>
              <p className="text-sm text-blue-700">
                All payments are processed securely. Your campaign will start immediately after payment confirmation.
                You can pause or modify your campaign anytime from the Campaign Center.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deposit Modal */}
      <Dialog open={showDepositModal} onOpenChange={setShowDepositModal}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add Funds</DialogTitle>
            <DialogDescription>
              Top up your wallet to complete the payment
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Amount to Add</Label>
              <Input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 0)}
                placeholder="Enter amount"
              />
            </div>

            <Card className="bg-gray-50">
              <CardContent className="p-3">
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Current Balance:</span>
                    <span>{formatCurrency(selectedPaymentMethod?.balance || 0, selectedPaymentMethod?.currency || "USD")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Adding:</span>
                    <span>+{formatCurrency(depositAmount, selectedPaymentMethod?.currency || "USD")}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>New Balance:</span>
                    <span>{formatCurrency((selectedPaymentMethod?.balance || 0) + depositAmount, selectedPaymentMethod?.currency || "USD")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDepositModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                toast({
                  title: "Funds Added!",
                  description: `${formatCurrency(depositAmount, selectedPaymentMethod?.currency || "USD")} has been added to your wallet`,
                });
                setShowDepositModal(false);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Funds
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CampaignPayment;
