import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Input,
  Label,
  Badge,
  Progress,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Card,
  CardContent,
  Alert,
  AlertDescription,
} from "@/components/ui";
import {
  ArrowRight,
  Wallet,
  Star,
  Shield,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  ChevronLeft,
} from "lucide-react";
import { formatCurrency, formatNumber } from "@/utils/formatters";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface WithdrawRewardsProps {
  currentEloits?: number;
  availableToWithdraw?: number;
  trustScore?: {
    current: number;
    level: string;
    multiplier: number;
  };
  currency?: string;
  onWithdrawalSuccess?: (amount: number, method: string) => void;
}

export default function WithdrawRewards({
  currentEloits = 15000,
  availableToWithdraw = 150,
  trustScore = {
    current: 85,
    level: "Gold",
    multiplier: 1.5,
  },
  currency = "USD",
  onWithdrawalSuccess,
}: WithdrawRewardsProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [withdrawalMethod, setWithdrawalMethod] = useState("unified-wallet");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);

  const processingSteps = [
    "Validating withdrawal...",
    "Converting Eloits...",
    "Processing transaction...",
    "Updating wallet balance...",
    "Finalizing transfer...",
  ];

  const conversionRate = 100;
  const withdrawalAmountNumber = parseFloat(withdrawalAmount) || 0;
  const requiredEloits = withdrawalAmountNumber * conversionRate;
  const fees = Math.max(withdrawalAmountNumber * 0.02, 0.5);
  const netAmount = withdrawalAmountNumber - fees;

  const canWithdraw = 
    withdrawalAmountNumber > 0 && 
    withdrawalAmountNumber <= availableToWithdraw &&
    withdrawalAmountNumber >= 5;

  const handleWithdraw = async () => {
    if (!canWithdraw) return;

    setIsProcessing(true);
    setProcessingStep(0);

    try {
      for (let i = 0; i < processingSteps.length; i++) {
        setProcessingStep(i);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      toast({
        title: "Withdrawal Successful!",
        description: `${formatCurrency(netAmount, currency)} has been transferred to your unified wallet. Check the Rewards section in your wallet.`,
      });

      onWithdrawalSuccess?.(netAmount, withdrawalMethod);
      navigate(-1);
      setWithdrawalAmount("");
    } catch (error) {
      toast({
        title: "Withdrawal Failed",
        description: "Please try again later or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProcessingStep(0);
    }
  };

  const quickAmounts = [5, 10, 25, 50, 100];

  return (
    <div className="min-h-screen bg-background flex flex-col dark:bg-gray-950">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-10 w-10"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 flex items-center gap-3">
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
              <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold">Withdraw Rewards</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
          {isProcessing ? (
            <div className="space-y-6 py-8">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <Clock className="h-8 w-8 text-green-600 animate-spin" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Processing Withdrawal</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    {processingSteps[processingStep]}
                  </p>
                </div>
              </div>
              <Progress value={(processingStep + 1) / processingSteps.length * 100} className="h-2" />
            </div>
          ) : (
            <div className="space-y-6 sm:space-y-8">
              {/* Current Balance Display */}
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-900/50">
                <CardContent className="p-4 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-green-600/10">
                        <Star className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Eloits</p>
                        <p className="text-2xl sm:text-3xl font-bold">{formatNumber(currentEloits)} ELO</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="flex items-center gap-1 text-sm">
                      <Shield className="h-4 w-4" />
                      {trustScore.level}
                    </Badge>
                  </div>
                  <div className="pt-4 border-t border-green-200 dark:border-green-900/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold">Trust Score</span>
                      <span className="text-sm font-semibold text-green-600">{trustScore.current}%</span>
                    </div>
                    <Progress value={trustScore.current} className="h-2" />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Available to withdraw: <span className="font-semibold text-foreground">{formatCurrency(availableToWithdraw, currency)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Withdrawal Amount */}
              <div className="space-y-4 sm:space-y-5">
                <div>
                  <Label htmlFor="amount" className="text-base font-semibold">
                    Withdrawal Amount ({currency})
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">Minimum: {formatCurrency(5, currency)}, Maximum: {formatCurrency(availableToWithdraw, currency)}</p>
                </div>
                <div className="space-y-3">
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    className="text-lg sm:text-xl font-semibold h-12"
                    min="5"
                    max={availableToWithdraw}
                    step="0.01"
                  />
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {quickAmounts.map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => setWithdrawalAmount(String(amount))}
                        disabled={amount > availableToWithdraw}
                        className="text-xs sm:text-sm"
                      >
                        {formatCurrency(amount, currency)}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setWithdrawalAmount(String(availableToWithdraw))}
                      className="text-xs sm:text-sm col-span-3 sm:col-span-1"
                    >
                      Max
                    </Button>
                  </div>
                </div>
              </div>

              {/* Conversion Info */}
              {withdrawalAmountNumber > 0 && (
                <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/50">
                  <CardContent className="p-4 space-y-3">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Conversion Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Eloits Required:</span>
                        <span className="font-medium">{formatNumber(requiredEloits)} ELO</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Processing Fee (2%):</span>
                        <span className="font-medium">{formatCurrency(fees, currency)}</span>
                      </div>
                      <div className="flex justify-between font-semibold pt-2 border-t border-blue-200 dark:border-blue-900/50">
                        <span>You'll Receive:</span>
                        <span className="text-green-600 dark:text-green-400">{formatCurrency(netAmount, currency)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Withdrawal Method */}
              <div className="space-y-3">
                <Label htmlFor="method" className="text-base font-semibold">
                  Transfer To
                </Label>
                <Select value={withdrawalMethod} onValueChange={setWithdrawalMethod}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select withdrawal method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unified-wallet">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        <span>Unified Wallet</span>
                        <Badge variant="secondary" className="text-xs ml-2">Instant</Badge>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Validation Messages */}
              <div className="space-y-3">
                {withdrawalAmountNumber > 0 && (
                  <>
                    {withdrawalAmountNumber < 5 && (
                      <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-900/50">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-sm text-amber-800 dark:text-amber-200">
                          Minimum withdrawal amount is {formatCurrency(5, currency)}
                        </AlertDescription>
                      </Alert>
                    )}
                    {withdrawalAmountNumber > availableToWithdraw && (
                      <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-900/50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-sm text-red-800 dark:text-red-200">
                          Insufficient balance. Maximum: {formatCurrency(availableToWithdraw, currency)}
                        </AlertDescription>
                      </Alert>
                    )}
                    {canWithdraw && (
                      <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-900/50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-sm text-green-800 dark:text-green-200">
                          Ready to withdraw
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                )}
              </div>

              {/* Information Alert */}
              <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-900/50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
                  Withdrawal requests are processed within 24-48 hours. Your unified wallet balance will be updated immediately upon approval.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Footer */}
      {!isProcessing && (
        <div className="sticky bottom-0 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 py-4 px-4">
          <div className="max-w-2xl mx-auto flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isProcessing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleWithdraw}
              disabled={!canWithdraw || isProcessing}
              className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Withdraw Now</span>
              <span className="sm:hidden">Withdraw</span>
              <ArrowRight className="h-4 w-4 sm:ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
