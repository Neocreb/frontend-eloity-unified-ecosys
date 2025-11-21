import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { paymentMethods, PaymentMethod } from "@/config/paymentMethods";
import {
  Plus,
  Trash2,
  Check,
  Star,
  Building2,
  AlertCircle,
} from "lucide-react";

export interface BankAccount {
  id: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  accountHolderName: string;
  accountHolderPhone?: string;
  countryCode: string;
  currency: string;
  isDefault: boolean;
  isVerified: boolean;
}

interface BankAccountManagerProps {
  countryCode?: string;
  onAccountSelected?: (account: BankAccount) => void;
  mode?: "select" | "manage";
}

const BankAccountManager = ({
  countryCode,
  onAccountSelected,
  mode = "manage",
}: BankAccountManagerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countryCode || "NG");
  const [banks, setBanks] = useState<PaymentMethod[]>([]);

  const [formData, setFormData] = useState({
    accountName: "",
    accountNumber: "",
    bankName: "",
    accountHolderName: "",
    accountHolderPhone: "",
  });

  useEffect(() => {
    loadAccounts();
    loadBanksList();
  }, [user?.id, selectedCountry]);

  const loadAccounts = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/wallet/bank-accounts?country=${selectedCountry}`);
      // const data = await response.json();
      // setAccounts(data);

      // Mock data for now
      setAccounts([
        {
          id: "1",
          accountName: "Primary Account",
          accountNumber: "****1234",
          bankName: "Access Bank",
          accountHolderName: "John Doe",
          accountHolderPhone: "+2348012345678",
          countryCode: "NG",
          currency: "NGN",
          isDefault: true,
          isVerified: true,
        },
      ]);
    } catch (error) {
      console.error("Error loading bank accounts:", error);
      toast({ title: "Error", description: "Failed to load bank accounts", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const loadBanksList = () => {
    const regionBanks = paymentMethods.getBanksByCountry(selectedCountry);
    setBanks(regionBanks);
  };

  const validateForm = () => {
    if (!formData.accountName || !formData.accountNumber || !formData.bankName || !formData.accountHolderName) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return false;
    }

    if (formData.accountNumber.length < 10) {
      toast({
        title: "Invalid Account Number",
        description: "Account number must be at least 10 digits",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleAddAccount = async () => {
    if (!validateForm()) return;

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/wallet/bank-accounts', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     ...formData,
      //     countryCode: selectedCountry,
      //     currency: paymentMethods.getRegionConfig(selectedCountry)?.currency,
      //   }),
      // });

      const newAccount: BankAccount = {
        id: Math.random().toString(),
        ...formData,
        countryCode: selectedCountry,
        currency: paymentMethods.getRegionConfig(selectedCountry)?.currency || "USD",
        isDefault: accounts.length === 0,
        isVerified: false,
      };

      setAccounts([...accounts, newAccount]);
      setFormData({
        accountName: "",
        accountNumber: "",
        bankName: "",
        accountHolderName: "",
        accountHolderPhone: "",
      });
      setIsOpen(false);

      toast({
        title: "Success",
        description: "Bank account added successfully. Please verify before using.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add bank account",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/wallet/bank-accounts/${accountId}`, { method: 'DELETE' });

      const updatedAccounts = accounts.filter((a) => a.id !== accountId);
      
      if (accounts.find((a) => a.id === accountId)?.isDefault && updatedAccounts.length > 0) {
        updatedAccounts[0].isDefault = true;
      }

      setAccounts(updatedAccounts);
      toast({ title: "Success", description: "Bank account deleted" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete bank account",
        variant: "destructive",
      });
    }
  };

  const handleSetDefault = async (accountId: string) => {
    try {
      // TODO: Replace with actual API call
      const updatedAccounts = accounts.map((a) => ({
        ...a,
        isDefault: a.id === accountId,
      }));

      setAccounts(updatedAccounts);
      toast({ title: "Success", description: "Default account updated" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update default account",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg" />
        ))}
      </div>
    );
  }

  const region = paymentMethods.getRegionConfig(selectedCountry);

  return (
    <div className="space-y-6">
      {/* Country Selector */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Country</label>
        <Select value={selectedCountry} onValueChange={setSelectedCountry}>
          <SelectTrigger className="h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {paymentMethods.getAllRegions().map((r) => (
              <SelectItem key={r.countryCode} value={r.countryCode}>
                {r.countryName} ({r.currency})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bank Accounts List */}
      {accounts.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">Saved Accounts</h3>
          {accounts.map((account) => (
            <Card key={account.id} className={account.isDefault ? "border-green-300 bg-green-50" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 flex items-start gap-3">
                    <Building2 className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">{account.bankName}</p>
                        {account.isDefault && (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Default
                          </Badge>
                        )}
                        {!account.isVerified && (
                          <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                            Unverified
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{account.accountName}</p>
                      <p className="text-xs text-gray-500 font-mono mt-1">{account.accountNumber}</p>
                      <p className="text-xs text-gray-500 mt-1">{account.accountHolderName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-2">
                    {!account.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetDefault(account.id)}
                        className="text-gray-600 hover:text-green-600"
                        title="Set as default"
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}

                    {mode === "select" && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          onAccountSelected?.(account);
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Select
                      </Button>
                    )}

                    {mode === "manage" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAccount(account.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Delete account"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-10 w-10 text-blue-500 mx-auto mb-3" />
            <p className="text-sm text-blue-900 font-medium">No bank accounts saved</p>
            <p className="text-xs text-blue-700 mt-1">Add your first bank account to start withdrawing</p>
          </CardContent>
        </Card>
      )}

      {/* Add New Account Button */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Bank Account
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Bank Account</DialogTitle>
            <DialogDescription>
              Add a new bank account for {region?.countryName} ({region?.currency})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Nickname *</label>
              <Input
                placeholder="e.g., Primary Account"
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank *</label>
              <Select value={formData.bankName} onValueChange={(value) => setFormData({ ...formData, bankName: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select bank" />
                </SelectTrigger>
                <SelectContent>
                  {banks.map((bank) => (
                    <SelectItem key={bank.id} value={bank.providerName}>
                      {bank.providerName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Number *</label>
              <Input
                placeholder="Enter account number"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name *</label>
              <Input
                placeholder="Full name on account"
                value={formData.accountHolderName}
                onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (Optional)</label>
              <Input
                type="tel"
                placeholder={region?.phonePrefix + " xxxxxxxxx"}
                value={formData.accountHolderPhone}
                onChange={(e) => setFormData({ ...formData, accountHolderPhone: e.target.value })}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleAddAccount} className="flex-1 bg-green-600 hover:bg-green-700">
                Add Account
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BankAccountManager;
