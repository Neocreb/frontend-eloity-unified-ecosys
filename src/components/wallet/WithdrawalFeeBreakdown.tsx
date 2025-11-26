import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export interface FeeBreakdownProps {
  amount: number;
  category?: 'marketplace' | 'crypto' | 'creator' | 'freelance';
  showDetails?: boolean;
  currency?: string;
}

const FEE_CONFIGS = {
  marketplace: {
    percentage: 1.5,
    min: 0.25,
    max: 100,
    description: 'Marketplace seller withdrawal fee'
  },
  crypto: {
    percentage: 0.3,
    min: 0.1,
    max: 50,
    description: 'Crypto withdrawal fee'
  },
  creator: {
    percentage: 3.0,
    min: 0.5,
    max: 200,
    description: 'Creator fund withdrawal fee'
  },
  freelance: {
    percentage: 2.0,
    min: 0.25,
    max: 75,
    description: 'Freelance earnings withdrawal fee'
  }
};

export const WithdrawalFeeBreakdown: React.FC<FeeBreakdownProps> = ({
  amount,
  category = 'creator',
  showDetails = true,
  currency = 'USD'
}) => {
  const config = FEE_CONFIGS[category];

  const feeCalculation = useMemo(() => {
    const feeAmount = Math.max(
      config.min,
      Math.min(config.max, amount * (config.percentage / 100))
    );

    return {
      feeAmount: Math.round(feeAmount * 100) / 100,
      netAmount: Math.round((amount - feeAmount) * 100) / 100,
      percentage: config.percentage
    };
  }, [amount, category]);

  const percentageOfGross = ((feeCalculation.feeAmount / amount) * 100).toFixed(2);

  return (
    <div className="space-y-4">
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base">Withdrawal Fees</CardTitle>
              <CardDescription>{config.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main breakdown */}
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-sm font-medium">Gross Amount</span>
              <span className="text-lg font-semibold">
                {currency} {amount.toFixed(2)}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">
                  Fee ({feeCalculation.percentage}%)
                </span>
                <span className="font-medium text-red-600">
                  - {currency} {feeCalculation.feeAmount.toFixed(2)}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                {percentageOfGross}% of gross amount
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t-2 border-primary/20">
              <span className="text-base font-bold">Net Amount</span>
              <span className="text-xl font-bold text-green-600">
                {currency} {feeCalculation.netAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Fee details */}
          {showDetails && (
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm text-blue-800">
                The fee helps us maintain platform security, process payments, and provide customer support.
                Fee rates vary by withdrawal category and are applied to your gross amount before processing.
              </AlertDescription>
            </Alert>
          )}

          {/* Fee limits info */}
          <div className="bg-gray-50 rounded p-3 text-xs space-y-1">
            <p className="font-medium text-gray-700">Fee Range</p>
            <p className="text-gray-600">
              Minimum: {currency} {config.min.toFixed(2)} | Maximum: {currency} {config.max.toFixed(2)}
            </p>
            <p className="text-gray-500 mt-2">
              The actual fee is calculated as {config.percentage}% of your withdrawal amount,
              but never less than {currency} {config.min.toFixed(2)} or more than {currency} {config.max.toFixed(2)}.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Processing information */}
      <Alert>
        <AlertDescription className="text-sm">
          <strong>Processing:</strong> Once approved, you'll receive {currency} {feeCalculation.netAmount.toFixed(2)} 
          after fees are deducted. Processing typically takes 1-3 business days depending on your withdrawal method.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export interface WithdrawalFeeCalculatorProps {
  onAmountChange?: (breakdown: {
    grossAmount: number;
    feeAmount: number;
    netAmount: number;
  }) => void;
}

export const WithdrawalFeeCalculator: React.FC<WithdrawalFeeCalculatorProps> = ({ onAmountChange }) => {
  const [amount, setAmount] = React.useState<number>(0);
  const [category, setCategory] = React.useState<'marketplace' | 'crypto' | 'creator' | 'freelance'>('creator');

  const calculation = useMemo(() => {
    const config = FEE_CONFIGS[category];
    const feeAmount = Math.max(
      config.min,
      Math.min(config.max, amount * (config.percentage / 100))
    );

    const breakdown = {
      grossAmount: amount,
      feeAmount: Math.round(feeAmount * 100) / 100,
      netAmount: Math.round((amount - feeAmount) * 100) / 100
    };

    onAmountChange?.(breakdown);
    return breakdown;
  }, [amount, category]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Withdrawal Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as any)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="creator">Creator Fund (3% fee)</option>
          <option value="marketplace">Marketplace Sales (1.5% fee)</option>
          <option value="freelance">Freelance Earnings (2% fee)</option>
          <option value="crypto">Crypto Withdrawals (0.3% fee)</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Withdrawal Amount</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
            placeholder="0.00"
            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <WithdrawalFeeBreakdown
        amount={amount}
        category={category}
        showDetails={true}
      />
    </div>
  );
};
