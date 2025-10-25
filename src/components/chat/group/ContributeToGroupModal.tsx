import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { GroupContributionService } from "@/services/groupContributionService";
import { useAuth } from "@/contexts/AuthContext";
import { Coins, Wallet } from "lucide-react";
import { GroupContributionWithDetails } from "@/types/group-contributions";

interface ContributeToGroupModalProps {
  contribution: GroupContributionWithDetails;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onContributionMade?: () => void;
}

export const ContributeToGroupModal: React.FC<ContributeToGroupModalProps> = ({
  contribution,
  isOpen,
  onOpenChange,
  onContributionMade,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [currency, setCurrency] = useState(contribution.currency);
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "flutterwave" | "bybit">("wallet");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'ELOITY') {
      return `${amount.toFixed(2)} ELOITY`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'NGN' ? 'NGN' : 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to contribute",
        variant: "destructive",
      });
      return;
    }

    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid contribution amount",
        variant: "destructive",
      });
      return;
    }

    // Check if amount exceeds target for fixed contributions
    if (contribution.type === "fixed" && contribution.target_amount) {
      const remaining = contribution.target_amount - contribution.total_contributed;
      if (amount > remaining) {
        toast({
          title: "Amount Too High",
          description: `You can only contribute up to ${formatCurrency(remaining, currency)}`,
          variant: "destructive",
        });
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      const result = await GroupContributionService.contributeToGroup({
        contribution_id: contribution.id,
        amount,
        currency,
        payment_method: paymentMethod,
      }, user.id);

      if (result) {
        toast({
          title: "Contribution Successful",
          description: `You've successfully contributed ${formatCurrency(amount, currency)}!`,
        });
        
        setAmount(undefined);
        onOpenChange(false);
        onContributionMade?.();
      } else {
        throw new Error("Failed to process contribution");
      }
    } catch (error) {
      console.error("Error contributing:", error);
      toast({
        title: "Error",
        description: "Failed to process contribution. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5" />
            Contribute to "{contribution.title}"
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="flex gap-2">
              <Input
                id="amount"
                type="number"
                value={amount || ""}
                onChange={(e) => setAmount(Number(e.target.value) || undefined)}
                placeholder="Enter amount"
                min="0.01"
                step="0.01"
                required
              />
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ELOITY">ELOITY</SelectItem>
                  <SelectItem value="NGN">Naira (₦)</SelectItem>
                  <SelectItem value="USDT">USDT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select 
              value={paymentMethod} 
              onValueChange={(value: "wallet" | "flutterwave" | "bybit") => setPaymentMethod(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wallet">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    Eloity Wallet
                  </div>
                </SelectItem>
                <SelectItem value="flutterwave">Flutterwave</SelectItem>
                <SelectItem value="bybit">Bybit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-medium mb-2">Contribution Details</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Current Total:</span>
                <span className="font-medium">
                  {formatCurrency(contribution.total_contributed, contribution.currency)}
                </span>
              </div>
              {contribution.target_amount && (
                <div className="flex justify-between">
                  <span>Target:</span>
                  <span className="font-medium">
                    {formatCurrency(contribution.target_amount, contribution.currency)}
                  </span>
                </div>
              )}
              {contribution.type === "fixed" && contribution.target_amount && (
                <div className="flex justify-between">
                  <span>Remaining:</span>
                  <span className="font-medium">
                    {formatCurrency(
                      contribution.target_amount - contribution.total_contributed,
                      contribution.currency
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="pt-4 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Contribute"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};