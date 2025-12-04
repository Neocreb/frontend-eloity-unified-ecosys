// @ts-nocheck
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WalletBalance, BankAccount } from "@/types/wallet";
import { walletService } from "@/services/walletService";
import { africanPaymentService, type PaymentResponse, type BankTransferRequest } from "@/services/africanPaymentService";
import { useToast } from "@/components/ui/use-toast";
import AfricanCountryCurrencySelector from "./AfricanCountryCurrencySelector";
import { useCurrency } from "@/contexts/CurrencyContext";
import {
  Loader2,
  CreditCard,
  AlertCircle,
  Wallet,
  ShoppingCart,
  Bitcoin,
  Gift,
  Briefcase,
} from "lucide-react";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletBalance: WalletBalance | null;
  onSuccess: () => void;
}

const WithdrawModal = ({
  isOpen,
  onClose,
  walletBalance,
  onSuccess,
}: WithdrawModalProps) => {
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState<
    "total" | "ecommerce" | "crypto" | "rewards" | "freelance"
  >("total");
  const [selectedBank, setSelectedBank] = useState("");
  const [description, setDescription] = useState("");
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [showCountrySelector, setShowCountrySelector] = useState(false);
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);
  const { toast } = useToast();
  const { formatCurrency, userCurrency } = useCurrency();

  useEffect(() => {
    if (isOpen) {
      loadBankAccounts();
    }
  }, [isOpen]);

  // Mock African banks if no accounts loaded
  const mockAfricanBanks = [
    {
      id: "mock_gtbank",
      name: "GTBank",
      bankName: "Guaranty Trust Bank",
      accountNumber: "****1234",
      isDefault: false,
      isVerified: true,
    },
    {
      id: "mock_access",
      name: "Access Bank",
      bankName: "Access Bank Nigeria",
      accountNumber: "****5678",
      isDefault: true,
      isVerified: true,
    },
    {
      id: "mock_zenith",
      name: "Zenith Bank",
      bankName: "Zenith Bank",
      accountNumber: "****9012",
      isDefault: false,
      isVerified: true,
    },
  ];

  const displayBanks = bankAccounts.length > 0 ? bankAccounts : mockAfricanBanks;

  const loadBankAccounts = async () => {
    setIsLoadingBanks(true);
    try {
      const accounts = await walletService.getBankAccounts();
      setBankAccounts(accounts);

      // Auto-select default bank
      const defaultBank = accounts.find((acc) => acc.isDefault);
      if (defaultBank) {
        setSelectedBank(defaultBank.id);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load bank accounts",
        variant: "destructive",
      });
    } finally {
      setIsLoadingBanks(false);
    }
  };

  const getAvailableBalance = () => {
    if (!walletBalance) return 0;
    if (source === "total") return walletBalance.total;
    return walletBalance[source];
  };

  const getSourceInfo = () => {
    const sources = {
      total: {
        name: "Total Balance",
        icon: <Wallet className="w-4 h-4" />,
        color: "bg-blue-500",
      },
      ecommerce: {
        name: "E-Commerce Earnings",
        icon: <ShoppingCart className="w-4 h-4" />,
        color: "bg-green-500",
      },
      crypto: {
        name: "Crypto Portfolio",
        icon: <Bitcoin className="w-4 h-4" />,
        color: "bg-orange-500",
      },
      rewards: {
        name: "Rewards System",
        icon: <Gift className="w-4 h-4" />,
        color: "bg-purple-500",
      },
      freelance: {
        name: "Freelance Income",
        icon: <Briefcase className="w-4 h-4" />,
        color: "bg-indigo-500",
      },
    };
    return sources[source];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const withdrawAmount = parseFloat(amount);
    const availableBalance = getAvailableBalance();

    if (!withdrawAmount || withdrawAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive",
      });
      return;
    }

    if (withdrawAmount > availableBalance) {
      toast({
        title: "Insufficient Funds",
        description: `You only have ${formatCurrency(availableBalance)} available`,
        variant: "destructive",
      });
      return;
    }

    if (!selectedBank) {
      toast({
        title: "Bank Account Required",
        description: "Please select a bank account for withdrawal",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const selectedAccount = displayBanks.find(acc => acc.id === selectedBank);

      if (!selectedAccount) {
        throw new Error("Please select a valid bank account");
      }

      // Create bank transfer request
      const bankTransferRequest: BankTransferRequest = {
        bankName: selectedAccount.bankName || selectedAccount.name || "Unknown Bank",
        accountNumber: selectedAccount.accountNumber,
        accountName: selectedAccount.name || "Account Holder",
        amount: withdrawAmount,
        currency: "USD",
        reference: `WTH_${Date.now()}`,
        swiftCode: "MOCK123", // This would come from the bank data
      };

      const result = await africanPaymentService.processWithdrawalToBankAccount(bankTransferRequest);

      if (result.success) {
        toast({
          title: "Withdrawal Successful",
          description: `${result.message}${result.fees ? ` (Fee: ${formatCurrency(result.fees)})` : ""}`,
        });
        onSuccess();
        onClose();
        resetForm();
      } else {
        toast({
          title: "Withdrawal Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process withdrawal",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setAmount("");
    setSource("total");
    setDescription("");
    setSelectedBank("");
  };

  const selectedBankAccount = displayBanks.find(
    (acc) => acc.id === selectedBank,
  );
  const sourceInfo = getSourceInfo();
  const availableBalance = getAvailableBalance();

  // Don't render the modal content if walletBalance is null
  if (!walletBalance) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-red-100">
                <CreditCard className="h-5 w-5 text-red-600" />
              </div>
              Withdraw Funds
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading wallet data...
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-red-100">
              <CreditCard className="h-5 w-5 text-red-600" />
            </div>
            Withdraw Funds
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Country & Currency Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Regional Banking Settings</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCountrySelector(!showCountrySelector)}
              >
                {selectedCountry ? `${selectedCountry.flag} ${selectedCountry.name}` : "Select Country"}
              </Button>
            </div>
            {showCountrySelector && (
              <AfricanCountryCurrencySelector
                selectedCountry={selectedCountry?.code}
                onCountryChange={(country) => {
                  setSelectedCountry(country);
                  setShowCountrySelector(false);
                }}
                showPaymentMethods={true}
              />
            )}
          </div>

          {/* Source Selection */}
          <div className="space-y-3">
            <Label htmlFor="source">Withdraw From</Label>
            <Select
              value={source}
              onValueChange={(value: any) => setSource(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select funding source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="total">
                  💰 Total Balance - {formatCurrency(walletBalance.total)}
                </SelectItem>
                <SelectItem value="ecommerce">
                  🛒 E-Commerce - {formatCurrency(walletBalance.ecommerce)}
                </SelectItem>
                <SelectItem value="crypto">
                  💹 Crypto Portfolio - {formatCurrency(walletBalance.crypto)}
                </SelectItem>
                <SelectItem value="rewards">
                  🎁 Rewards - {formatCurrency(walletBalance.rewards)}
                </SelectItem>
                <SelectItem value="freelance">
                  💼 Freelance - {formatCurrency(walletBalance.freelance)}
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Selected Source Info */}
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{sourceInfo.icon}</span>
                    <span className="font-medium">{sourceInfo.name}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-green-600 border-green-200"
                  >
                    {formatCurrency(availableBalance)} available
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Withdrawal Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                {userCurrency?.symbol || '$'}
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                max={availableBalance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pl-8"
                required
              />
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Minimum: {formatCurrency(0.01)}</span>
              <span>Maximum: {formatCurrency(availableBalance)}</span>
            </div>
          </div>

          {/* Bank Account Selection */}
          <div className="space-y-3">
            <Label htmlFor="bank">Withdraw To</Label>
            {isLoadingBanks ? (
              <div className="flex items-center justify-center p-4 border rounded-md">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading bank accounts...
              </div>
            ) : displayBanks.length > 0 ? (
              <Select value={selectedBank} onValueChange={setSelectedBank}>
                <SelectTrigger>
                  <SelectValue placeholder="Select bank account" />
                </SelectTrigger>
                <SelectContent>
                  {displayBanks.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>
                          {account.name} - {account.accountNumber}
                        </span>
                        {account.isDefault && (
                          <Badge variant="secondary" className="ml-2">
                            Default
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center p-4 border rounded-md border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                <span className="text-sm text-yellow-800">
                  No bank accounts found. Please add a bank account first.
                </span>
              </div>
            )}

            {selectedBankAccount && (
              <Card className="bg-gray-50">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">
                        {selectedBankAccount.bankName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedBankAccount.accountNumber}
                      </p>
                    </div>
                    {selectedBankAccount.isDefault && (
                      <Badge variant="secondary">Default</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a note for this withdrawal..."
              rows={2}
            />
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !selectedBank || displayBanks.length === 0}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                `Withdraw $${amount || "0.00"}`
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawModal;
