import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
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
import { useToast } from "@/components/ui/use-toast";
import { useWalletContext } from "@/contexts/WalletContext";
import { useAuth } from "@/contexts/AuthContext";
import { africanPaymentService } from "@/services/africanPaymentService";
import {
  Send,
  ArrowDownLeft,
  ArrowUpRight,
  Repeat,
  CreditCard,
  Smartphone,
  User,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Clock,
  Building,
  Receipt,
} from "lucide-react";

interface SendMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RequestMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PayBillModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Send Money Modal
export const SendMoneyModal = ({ isOpen, onClose }: SendMoneyModalProps) => {
  const { toast } = useToast();
  const { walletBalance } = useWalletContext();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    recipient: "",
    amount: "",
    source: "total",
    message: "",
    recipientType: "email", // email, phone, username
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [recentContacts] = useState([
    { id: "1", name: "John Doe", email: "john@example.com", avatar: "" },
    { id: "2", name: "Sarah Smith", email: "sarah@example.com", avatar: "" },
    { id: "3", name: "Mike Johnson", email: "mike@example.com", avatar: "" },
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate amount
      const amount = parseFloat(formData.amount);
      if (!amount || amount <= 0) {
        throw new Error("Please enter a valid amount");
      }

      // Check balance
      const sourceBalance = walletBalance?.[formData.source as keyof typeof walletBalance] || 0;
      if (amount > sourceBalance) {
        throw new Error("Insufficient balance in selected source");
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Money Sent Successfully",
        description: `$${amount.toFixed(2)} sent to ${formData.recipient}`,
      });

      onClose();
      setFormData({
        recipient: "",
        amount: "",
        source: "total",
        message: "",
        recipientType: "email",
      });
    } catch (error) {
      toast({
        title: "Transfer Failed",
        description: error instanceof Error ? error.message : "Failed to send money",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectContact = (contact: any) => {
    setFormData(prev => ({
      ...prev,
      recipient: contact.email,
      recipientType: "email",
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-blue-600" />
            Send Money
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Recent Contacts */}
          <div>
            <Label className="text-sm font-medium">Recent Contacts</Label>
            <div className="flex gap-2 mt-2 overflow-x-auto">
              {recentContacts.map((contact) => (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => selectContact(contact)}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 min-w-16"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={contact.avatar} />
                    <AvatarFallback>
                      {contact.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-center">{contact.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recipient Input */}
          <div className="space-y-2">
            <Label htmlFor="recipient">Send To</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={formData.recipientType} onValueChange={(value) =>
                setFormData(prev => ({ ...prev, recipientType: value }))
              }>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="username">Username</SelectItem>
                </SelectContent>
              </Select>
              <Input
                id="recipient"
                placeholder={
                  formData.recipientType === "email" ? "Enter email address" :
                  formData.recipientType === "phone" ? "Enter phone number" :
                  "Enter username"
                }
                value={formData.recipient}
                onChange={(e) => setFormData(prev => ({ ...prev, recipient: e.target.value }))}
                className="flex-1"
                required
              />
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Source Selection */}
          <div className="space-y-2">
            <Label htmlFor="source">Payment Source</Label>
            <Select value={formData.source} onValueChange={(value) => 
              setFormData(prev => ({ ...prev, source: value }))
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="total">
                  Total Balance (${walletBalance?.total.toFixed(2) || "0.00"})
                </SelectItem>
                <SelectItem value="ecommerce">
                  E-commerce (${walletBalance?.ecommerce.toFixed(2) || "0.00"})
                </SelectItem>
                <SelectItem value="crypto">
                  Crypto (${walletBalance?.crypto.toFixed(2) || "0.00"})
                </SelectItem>
                <SelectItem value="rewards">
                  Rewards (${walletBalance?.rewards.toFixed(2) || "0.00"})
                </SelectItem>
                <SelectItem value="freelance">
                  Freelance (${walletBalance?.freelance.toFixed(2) || "0.00"})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a note..."
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-11">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1 h-11">
              {isLoading ? "Sending..." : "Send Money"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Request Money Modal
export const RequestMoneyModal = ({ isOpen, onClose }: RequestMoneyModalProps) => {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    from: "",
    amount: "",
    reason: "",
    fromType: "email",
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const amount = parseFloat(formData.amount);
      if (!amount || amount <= 0) {
        throw new Error("Please enter a valid amount");
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: "Request Sent",
        description: `Money request for $${amount.toFixed(2)} sent to ${formData.from}`,
      });

      onClose();
      setFormData({
        from: "",
        amount: "",
        reason: "",
        fromType: "email",
      });
    } catch (error) {
      toast({
        title: "Request Failed",
        description: error instanceof Error ? error.message : "Failed to send request",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowDownLeft className="h-5 w-5 text-green-600" />
            Request Money
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="from">Request From</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={formData.fromType} onValueChange={(value) =>
                setFormData(prev => ({ ...prev, fromType: value }))
              }>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="username">Username</SelectItem>
                </SelectContent>
              </Select>
              <Input
                id="from"
                placeholder={
                  formData.fromType === "email" ? "Enter email address" :
                  formData.fromType === "phone" ? "Enter phone number" :
                  "Enter username"
                }
                value={formData.from}
                onChange={(e) => setFormData(prev => ({ ...prev, from: e.target.value }))}
                className="flex-1"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              placeholder="What's this request for?"
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              rows={3}
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-11">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1 h-11">
              {isLoading ? "Sending..." : "Send Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Transfer Modal
export const TransferModal = ({ isOpen, onClose }: TransferModalProps) => {
  const { toast } = useToast();
  const { walletBalance } = useWalletContext();
  
  const [formData, setFormData] = useState({
    from: "total",
    to: "ecommerce",
    amount: "",
    note: "",
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const walletSources = [
    { value: "total", label: "Total Balance", balance: walletBalance?.total || 0 },
    { value: "ecommerce", label: "E-commerce", balance: walletBalance?.ecommerce || 0 },
    { value: "crypto", label: "Crypto", balance: walletBalance?.crypto || 0 },
    { value: "rewards", label: "Rewards", balance: walletBalance?.rewards || 0 },
    { value: "freelance", label: "Freelance", balance: walletBalance?.freelance || 0 },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const amount = parseFloat(formData.amount);
      if (!amount || amount <= 0) {
        throw new Error("Please enter a valid amount");
      }

      if (formData.from === formData.to) {
        throw new Error("Source and destination cannot be the same");
      }

      const sourceBalance = walletSources.find(s => s.value === formData.from)?.balance || 0;
      if (amount > sourceBalance) {
        throw new Error("Insufficient balance in source wallet");
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: "Transfer Completed",
        description: `$${amount.toFixed(2)} transferred successfully`,
      });

      onClose();
      setFormData({
        from: "total",
        to: "ecommerce",
        amount: "",
        note: "",
      });
    } catch (error) {
      toast({
        title: "Transfer Failed",
        description: error instanceof Error ? error.message : "Failed to transfer funds",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Repeat className="h-5 w-5 text-orange-600" />
            Internal Transfer
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="from">Transfer From</Label>
            <Select value={formData.from} onValueChange={(value) => 
              setFormData(prev => ({ ...prev, from: value }))
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {walletSources.map((source) => (
                  <SelectItem key={source.value} value={source.value}>
                    {source.label} (${source.balance.toFixed(2)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="to">Transfer To</Label>
            <Select value={formData.to} onValueChange={(value) => 
              setFormData(prev => ({ ...prev, to: value }))
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {walletSources.filter(s => s.value !== formData.from).map((source) => (
                  <SelectItem key={source.value} value={source.value}>
                    {source.label} (${source.balance.toFixed(2)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note (Optional)</Label>
            <Textarea
              id="note"
              placeholder="Transfer note..."
              value={formData.note}
              onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
              rows={2}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-11">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1 h-11">
              {isLoading ? "Processing..." : "Transfer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Pay Bill Modal
export const PayBillModal = ({ isOpen, onClose }: PayBillModalProps) => {
  const { toast } = useToast();
  const { walletBalance } = useWalletContext();
  
  const [formData, setFormData] = useState({
    billType: "",
    provider: "",
    accountNumber: "",
    amount: "",
    source: "total",
  });
  
  const [isLoading, setIsLoading] = useState(false);
  
  const billTypes = {
    utilities: {
      label: "Utilities & Electricity",
      providers: [
        // Nigerian Electricity Companies
        "EEDC (Enugu Electricity)",
        "EKEDC (Eko Electricity)",
        "IKEDC (Ikeja Electric)",
        "AEDC (Abuja Electricity)",
        "PHED (Port Harcourt Electricity)",
        "KEDCO (Kano Electricity)",
        "YEDC (Yola Electricity)",
        "JEDC (Jos Electricity)",
        // Other African Utilities
        "KPLC (Kenya Power)",
        "ECG (Electricity Company of Ghana)",
        "ZESCO (Zambia Electricity)",
        "ESKOM (South Africa)",
        "JIRAMA (Madagascar)",
        "BEL (Botswana Energy)",
        // US/International
        "Electric Company",
        "Gas Company",
        "Water Department",
      ],
    },
    internet: {
      label: "Internet & Cable",
      providers: [
        // African ISPs
        "MTN Fiber",
        "Airtel Broadband",
        "Vodafone Fiber",
        "Safaricom Home Fiber",
        "Liquid Telecom",
        "MainOne",
        "Spectranet",
        "Swift Networks",
        "Smile Communications",
        "Rain (South Africa)",
        // US/International
        "Comcast",
        "Verizon",
        "AT&T",
        "Spectrum",
      ],
    },
    phone: {
      label: "Mobile Phone",
      providers: [
        // African Mobile Providers
        "MTN",
        "Airtel",
        "Vodafone",
        "Glo",
        "9mobile",
        "Safaricom",
        "Tigo",
        "Orange Africa",
        "Celtel",
        "Cell C",
        "Telkom Mobile",
        "Econet",
        "Telecel",
        // US/International
        "Verizon",
        "AT&T",
        "T-Mobile",
        "Sprint",
      ],
    },
    cable_tv: {
      label: "Cable TV & Entertainment",
      providers: [
        // African Pay-TV
        "DStv",
        "GOtv",
        "StarTimes",
        "Kwesé TV",
        "MyTV",
        "TStv",
        "Zuku",
        "DSTV Premium",
        "DSTV Compact",
        "DSTV Family",
        // International
        "Netflix",
        "Amazon Prime",
        "Hulu",
        "Disney+",
      ],
    },
    insurance: {
      label: "Insurance",
      providers: [
        // African Insurance
        "AIICO Insurance",
        "AXA Mansard",
        "Old Mutual",
        "Sanlam",
        "Liberty Life",
        "Leadway Assurance",
        "Coronation Insurance",
        "NICON Insurance",
        "Custodian Insurance",
        "Jubilee Insurance",
        // US/International
        "State Farm",
        "Allstate",
        "GEICO",
        "Progressive",
      ],
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const amount = parseFloat(formData.amount);
      if (!amount || amount <= 0) {
        throw new Error("Please enter a valid amount");
      }

      const sourceBalance = walletBalance?.[formData.source as keyof typeof walletBalance] || 0;
      if (amount > sourceBalance) {
        throw new Error("Insufficient balance in selected source");
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Bill Payment Successful",
        description: `$${amount.toFixed(2)} paid to ${formData.provider}`,
      });

      onClose();
      setFormData({
        billType: "",
        provider: "",
        accountNumber: "",
        amount: "",
        source: "total",
      });
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Failed to pay bill",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-red-600" />
            Pay Bill
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="billType">Bill Type</Label>
            <Select value={formData.billType} onValueChange={(value) => 
              setFormData(prev => ({ ...prev, billType: value, provider: "" }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Select bill type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(billTypes).map(([key, type]) => (
                  <SelectItem key={key} value={key}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.billType && (
            <div className="space-y-2">
              <Label htmlFor="provider">Service Provider</Label>
              <Select value={formData.provider} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, provider: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  {billTypes[formData.billType as keyof typeof billTypes].providers.map((provider) => (
                    <SelectItem key={provider} value={provider}>
                      {provider}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              placeholder="Enter account number"
              value={formData.accountNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">Payment Source</Label>
            <Select value={formData.source} onValueChange={(value) => 
              setFormData(prev => ({ ...prev, source: value }))
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="total">
                  Total Balance (${walletBalance?.total.toFixed(2) || "0.00"})
                </SelectItem>
                <SelectItem value="ecommerce">
                  E-commerce (${walletBalance?.ecommerce.toFixed(2) || "0.00"})
                </SelectItem>
                <SelectItem value="crypto">
                  Crypto (${walletBalance?.crypto.toFixed(2) || "0.00"})
                </SelectItem>
                <SelectItem value="rewards">
                  Rewards (${walletBalance?.rewards.toFixed(2) || "0.00"})
                </SelectItem>
                <SelectItem value="freelance">
                  Freelance (${walletBalance?.freelance.toFixed(2) || "0.00"})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-11">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1 h-11">
              {isLoading ? "Processing..." : "Pay Bill"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Top Up Modal
export const TopUpModal = ({ isOpen, onClose }: TopUpModalProps) => {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    service: "",
    phoneNumber: "",
    amount: "",
    paymentMethod: "total",
  });
  
  const [isLoading, setIsLoading] = useState(false);
  
  const services = [
    // African Mobile Networks (Primary)
    { value: "mtn", label: "MTN" },
    { value: "airtel", label: "Airtel" },
    { value: "vodafone", label: "Vodafone" },
    { value: "glo", label: "Glo" },
    { value: "9mobile", label: "9mobile (Etisalat)" },
    { value: "safaricom", label: "Safaricom (Kenya)" },
    { value: "tigo", label: "Tigo" },
    { value: "orange", label: "Orange Africa" },
    { value: "celtel", label: "Celtel" },
    { value: "cellc", label: "Cell C (South Africa)" },
    { value: "telkom", label: "Telkom Mobile" },
    { value: "econet", label: "Econet Wireless" },
    { value: "telecel", label: "Telecel" },
    { value: "moov", label: "Moov Africa" },
    { value: "expresso", label: "Expresso" },

    // Country-Specific Networks
    { value: "mtn_ng", label: "MTN Nigeria" },
    { value: "mtn_za", label: "MTN South Africa" },
    { value: "mtn_gh", label: "MTN Ghana" },
    { value: "mtn_ug", label: "MTN Uganda" },
    { value: "airtel_ng", label: "Airtel Nigeria" },
    { value: "airtel_ke", label: "Airtel Kenya" },
    { value: "airtel_tz", label: "Airtel Tanzania" },
    { value: "airtel_ug", label: "Airtel Uganda" },

    // US/International (for global users)
    { value: "verizon", label: "Verizon (US)" },
    { value: "att", label: "AT&T (US)" },
    { value: "tmobile", label: "T-Mobile (US)" },
    { value: "sprint", label: "Sprint (US)" },
    { value: "cricket", label: "Cricket (US)" },
    { value: "boost", label: "Boost Mobile (US)" },
  ];

  const amounts = [
    // Standard amounts
    { value: "5", label: "$5" },
    { value: "10", label: "$10" },
    { value: "20", label: "$20" },
    { value: "50", label: "$50" },
    { value: "100", label: "$100" },

    // African-friendly amounts (converted from local currencies)
    { value: "2", label: "$2 (₦800)" },
    { value: "3", label: "$3 (₦1,200)" },
    { value: "7", label: "$7 (₦2,800)" },
    { value: "15", label: "$15 (₦6,000)" },
    { value: "25", label: "$25 (₦10,000)" },
    { value: "1", label: "$1 (KES 150)" },
    { value: "3.5", label: "$3.50 (KES 500)" },
    { value: "12", label: "$12 (KES 1,800)" },
    { value: "14", label: "$14 (KES 2,000)" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const amount = parseFloat(formData.amount);
      if (!amount || amount <= 0) {
        throw new Error("Please enter a valid amount");
      }

      // Validate phone number (supports various African formats)
      const cleanPhone = formData.phoneNumber.replace(/\D/g, "");
      const phoneRegex = /^(\d{10,15})$/; // Support 10-15 digits for international formats

      if (!phoneRegex.test(cleanPhone)) {
        throw new Error("Please enter a valid phone number (10-15 digits)");
      }

      // Additional validation for common African formats
      const isValidAfrican =
        cleanPhone.length >= 10 &&
        (cleanPhone.startsWith("234") || // Nigeria
         cleanPhone.startsWith("254") || // Kenya
         cleanPhone.startsWith("233") || // Ghana
         cleanPhone.startsWith("27") ||  // South Africa
         cleanPhone.startsWith("256") || // Uganda
         cleanPhone.startsWith("255") || // Tanzania
         cleanPhone.startsWith("260") || // Zambia
         cleanPhone.length === 10 ||     // Local format
         cleanPhone.length === 11);      // Local with area code

      if (!isValidAfrican && cleanPhone.length < 10) {
        throw new Error("Please enter a valid African phone number");
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Top-up Successful",
        description: `$${amount.toFixed(2)} added to ${formData.phoneNumber}`,
      });

      onClose();
      setFormData({
        service: "",
        phoneNumber: "",
        amount: "",
        paymentMethod: "total",
      });
    } catch (error) {
      toast({
        title: "Top-up Failed",
        description: error instanceof Error ? error.message : "Failed to top up",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-indigo-600" />
            Mobile Top-up
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="service">Mobile Service Provider</Label>
            <Select value={formData.service} onValueChange={(value) =>
              setFormData(prev => ({ ...prev, service: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Select service provider" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                <div className="px-2 py-1 text-xs font-medium text-gray-500 border-b">
                  African Networks (Primary)
                </div>
                {services.slice(0, 15).map((service) => (
                  <SelectItem key={service.value} value={service.value}>
                    {service.label}
                  </SelectItem>
                ))}
                <div className="px-2 py-1 text-xs font-medium text-gray-500 border-b border-t mt-1">
                  Country-Specific Networks
                </div>
                {services.slice(15, 23).map((service) => (
                  <SelectItem key={service.value} value={service.value}>
                    {service.label}
                  </SelectItem>
                ))}
                <div className="px-2 py-1 text-xs font-medium text-gray-500 border-b border-t mt-1">
                  International Networks
                </div>
                {services.slice(23).map((service) => (
                  <SelectItem key={service.value} value={service.value}>
                    {service.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Supports major African networks including MTN, Airtel, Vodafone, Glo, and more
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              placeholder="e.g. +234 801 234 5678, 0801 234 5678, or (555) 123-4567"
              value={formData.phoneNumber}
              onChange={(e) => {
                let value = e.target.value.replace(/[^\d+\-\s\(\)]/g, "");

                // Smart formatting based on input
                if (value.startsWith("+234")) {
                  // Nigerian format: +234 XXX XXX XXXX
                  value = value.replace(/(\+234)(\d{3})(\d{3})(\d{4})/, "$1 $2 $3 $4");
                } else if (value.startsWith("+254")) {
                  // Kenyan format: +254 XXX XXX XXX
                  value = value.replace(/(\+254)(\d{3})(\d{3})(\d{3})/, "$1 $2 $3 $4");
                } else if (value.startsWith("0")) {
                  // Local African format: 0XXX XXX XXXX
                  value = value.replace(/(\d{4})(\d{3})(\d{4})/, "$1 $2 $3");
                } else if (!value.startsWith("+") && value.length === 10) {
                  // US format: (XXX) XXX-XXXX
                  value = value.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
                }

                setFormData(prev => ({ ...prev, phoneNumber: value }));
              }}
              maxLength={20}
              required
            />
            <p className="text-xs text-gray-500">
              Supports African (+234, +254, +233, etc.) and US formats
            </p>
          </div>

          <div className="space-y-3">
            <Label>Quick Amounts</Label>

            {/* Standard USD amounts */}
            <div>
              <p className="text-xs text-gray-600 mb-2">Standard Amounts (USD)</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {amounts.slice(0, 5).map((amt) => (
                  <Button
                    key={amt.value}
                    type="button"
                    variant={formData.amount === amt.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, amount: amt.value }))}
                  >
                    {amt.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* African currency equivalent amounts */}
            <div>
              <p className="text-xs text-gray-600 mb-2">African Local Currency Equivalents</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {amounts.slice(5).map((amt, index) => (
                  <Button
                    key={`african_${index}_${amt.value}`}
                    type="button"
                    variant={formData.amount === amt.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, amount: amt.value }))}
                    className="text-xs"
                  >
                    {amt.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customAmount">Custom Amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                id="customAmount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-11">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1 h-11">
              {isLoading ? "Processing..." : "Top Up"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
