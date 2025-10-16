import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  DollarSign,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Timer,
  Coins,
  History,
  Settings,
  FileText,
  Gavel,
  CreditCard,
  Wallet,
  ArrowRight,
  ArrowDown,
  Info,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

interface EscrowContract {
  id: string;
  projectId: string;
  projectTitle: string;
  clientId: string;
  freelancerId: string;
  amount: number;
  currency: "USDT" | "BTC" | "ETH" | "Eloity Points";
  status: "pending" | "funded" | "released" | "disputed" | "cancelled";
  autoReleaseDate: Date;
  autoReleaseEnabled: boolean;
  autoReleaseHours: number;
  platformFeePercent: number;
  milestoneId?: string;
  createdAt: Date;
  fundedAt?: Date;
  releasedAt?: Date;
  disputeId?: string;
  conditions: string[];
  warningsSent: number;
  nextWarningAt?: Date;
}

interface EscrowActivity {
  id: string;
  escrowId: string;
  type:
    | "created"
    | "funded"
    | "warning_sent"
    | "released"
    | "disputed"
    | "cancelled";
  description: string;
  amount?: number;
  currency?: string;
  performedBy: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface DisputeCase {
  id: string;
  escrowId: string;
  raisedBy: "client" | "freelancer";
  reason: string;
  description: string;
  evidence: string[];
  status: "open" | "investigating" | "resolved";
  resolution?: string;
  resolvedBy?: string;
  createdAt: Date;
  resolvedAt?: Date;
}

const EnhancedEscrowSystem: React.FC = () => {
  const [contracts, setContracts] = useState<EscrowContract[]>([]);
  const [activities, setActivities] = useState<EscrowActivity[]>([]);
  const [disputes, setDisputes] = useState<DisputeCase[]>([]);
  const [selectedContract, setSelectedContract] =
    useState<EscrowContract | null>(null);
  const [showCreateContract, setShowCreateContract] = useState(false);
  const [showDispute, setShowDispute] = useState(false);
  const [activeTab, setActiveTab] = useState("active");

  // Auto-release monitoring
  useEffect(() => {
    const checkAutoRelease = () => {
      const now = new Date();

      contracts.forEach((contract) => {
        if (
          contract.status === "funded" &&
          contract.autoReleaseEnabled &&
          contract.autoReleaseDate <= now
        ) {
          handleAutoRelease(contract.id);
        }

        // Check for warning notifications
        if (
          contract.status === "funded" &&
          contract.autoReleaseEnabled &&
          contract.nextWarningAt &&
          contract.nextWarningAt <= now
        ) {
          sendAutoReleaseWarning(contract.id);
        }
      });
    };

    const interval = setInterval(checkAutoRelease, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [contracts]);

  const handleAutoRelease = async (contractId: string) => {
    try {
      const contract = contracts.find((c) => c.id === contractId);
      if (!contract) return;

      // Simulate auto-release API call
      const updatedContract = {
        ...contract,
        status: "released" as const,
        releasedAt: new Date(),
      };

      setContracts((prev) =>
        prev.map((c) => (c.id === contractId ? updatedContract : c)),
      );

      // Add activity log
      const activity: EscrowActivity = {
        id: Date.now().toString(),
        escrowId: contractId,
        type: "released",
        description: "Funds auto-released after timeout period",
        amount: contract.amount,
        currency: contract.currency,
        performedBy: "system",
        timestamp: new Date(),
      };

      setActivities((prev) => [activity, ...prev]);
    } catch (error) {
      console.error("Auto-release failed:", error);
    }
  };

  const sendAutoReleaseWarning = async (contractId: string) => {
    const contract = contracts.find((c) => c.id === contractId);
    if (!contract) return;

    const timeLeft = contract.autoReleaseDate.getTime() - Date.now();
    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));

    // Update warning count and next warning time
    const updatedContract = {
      ...contract,
      warningsSent: contract.warningsSent + 1,
      nextWarningAt:
        hoursLeft > 24 ? new Date(Date.now() + 24 * 60 * 60 * 1000) : undefined,
    };

    setContracts((prev) =>
      prev.map((c) => (c.id === contractId ? updatedContract : c)),
    );

    // Add activity log
    const activity: EscrowActivity = {
      id: Date.now().toString(),
      escrowId: contractId,
      type: "warning_sent",
      description: `Auto-release warning sent (${hoursLeft} hours remaining)`,
      performedBy: "system",
      timestamp: new Date(),
      metadata: { hoursLeft, warningCount: updatedContract.warningsSent },
    };

    setActivities((prev) => [activity, ...prev]);
  };

  const calculatePlatformFee = (amount: number, feePercent: number) => {
    return (amount * feePercent) / 100;
  };

  const calculateNetAmount = (amount: number, feePercent: number) => {
    return amount - calculatePlatformFee(amount, feePercent);
  };

  const formatTimeRemaining = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();

    if (diff <= 0) return "Expired";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "funded":
        return "bg-blue-100 text-blue-800";
      case "released":
        return "bg-green-100 text-green-800";
      case "disputed":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCurrencyIcon = (currency: string) => {
    switch (currency) {
      case "USDT":
        return "₮";
      case "BTC":
        return "₿";
      case "ETH":
        return "Ξ";
      case "Eloity Points":
        return "SP";
      default:
        return "$";
    }
  };

  const CreateContractForm = () => {
    const [formData, setFormData] = useState({
      projectTitle: "",
      amount: "",
      currency: "USDT" as const,
      autoReleaseHours: "72",
      autoReleaseEnabled: true,
      conditions: ["Milestone completion", "Quality standards met"],
      platformFeePercent: 5,
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      const autoReleaseDate = new Date();
      autoReleaseDate.setHours(
        autoReleaseDate.getHours() + parseInt(formData.autoReleaseHours),
      );

      const newContract: EscrowContract = {
        id: Date.now().toString(),
        projectId: "proj_" + Date.now(),
        projectTitle: formData.projectTitle,
        clientId: "current_user",
        freelancerId: "freelancer_" + Date.now(),
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        status: "pending",
        autoReleaseDate,
        autoReleaseEnabled: formData.autoReleaseEnabled,
        autoReleaseHours: parseInt(formData.autoReleaseHours),
        platformFeePercent: formData.platformFeePercent,
        createdAt: new Date(),
        conditions: formData.conditions,
        warningsSent: 0,
      };

      setContracts((prev) => [newContract, ...prev]);
      setShowCreateContract(false);

      // Reset form
      setFormData({
        projectTitle: "",
        amount: "",
        currency: "USDT",
        autoReleaseHours: "72",
        autoReleaseEnabled: true,
        conditions: ["Milestone completion", "Quality standards met"],
        platformFeePercent: 5,
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="projectTitle">Project Title</Label>
            <Input
              id="projectTitle"
              value={formData.projectTitle}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  projectTitle: e.target.value,
                }))
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, amount: e.target.value }))
              }
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="currency">Currency</Label>
            <Select
              value={formData.currency}
              onValueChange={(value: any) =>
                setFormData((prev) => ({ ...prev, currency: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USDT">USDT</SelectItem>
                <SelectItem value="BTC">Bitcoin</SelectItem>
                <SelectItem value="ETH">Ethereum</SelectItem>
                <SelectItem value="Eloity Points">Eloity Points</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="autoReleaseHours">Auto-Release (Hours)</Label>
            <Select
              value={formData.autoReleaseHours}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, autoReleaseHours: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24">24 Hours</SelectItem>
                <SelectItem value="48">48 Hours</SelectItem>
                <SelectItem value="72">72 Hours</SelectItem>
                <SelectItem value="168">1 Week</SelectItem>
                <SelectItem value="336">2 Weeks</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Platform Fee</Label>
          <div className="flex items-center gap-2 mt-1">
            <Input
              type="number"
              step="0.1"
              value={formData.platformFeePercent}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  platformFeePercent: parseFloat(e.target.value),
                }))
              }
              className="w-20"
            />
            <span className="text-sm text-gray-600">%</span>
            <span className="text-sm text-gray-500">
              (Fee: {getCurrencyIcon(formData.currency)}
              {calculatePlatformFee(
                parseFloat(formData.amount) || 0,
                formData.platformFeePercent,
              ).toFixed(2)}
              )
            </span>
          </div>
        </div>

        <div>
          <Label>Release Conditions</Label>
          <div className="mt-2 space-y-2">
            {formData.conditions.map((condition, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={condition}
                  onChange={(e) => {
                    const newConditions = [...formData.conditions];
                    newConditions[index] = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      conditions: newConditions,
                    }));
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newConditions = formData.conditions.filter(
                      (_, i) => i !== index,
                    );
                    setFormData((prev) => ({
                      ...prev,
                      conditions: newConditions,
                    }));
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  conditions: [...prev.conditions, ""],
                }))
              }
            >
              Add Condition
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowCreateContract(false)}
          >
            Cancel
          </Button>
          <Button type="submit">Create Escrow Contract</Button>
        </div>
      </form>
    );
  };

  const ContractDetails = ({ contract }: { contract: EscrowContract }) => {
    const timeRemaining = formatTimeRemaining(contract.autoReleaseDate);
    const isExpiringSoon =
      contract.autoReleaseDate.getTime() - Date.now() < 24 * 60 * 60 * 1000;
    const platformFee = calculatePlatformFee(
      contract.amount,
      contract.platformFeePercent,
    );
    const netAmount = calculateNetAmount(
      contract.amount,
      contract.platformFeePercent,
    );

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wallet className="w-5 h-5" />
                Contract Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <Badge className={getStatusColor(contract.status)}>
                  {contract.status.charAt(0).toUpperCase() +
                    contract.status.slice(1)}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold">
                  {getCurrencyIcon(contract.currency)}
                  {contract.amount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Platform Fee:</span>
                <span className="text-red-600">
                  -{getCurrencyIcon(contract.currency)}
                  {platformFee.toFixed(2)} ({contract.platformFeePercent}%)
                </span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Net Amount:</span>
                <span className="text-green-600">
                  {getCurrencyIcon(contract.currency)}
                  {netAmount.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Timer className="w-5 h-5" />
                Auto-Release Timer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {contract.autoReleaseEnabled ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time Remaining:</span>
                    <span
                      className={`font-semibold ${isExpiringSoon ? "text-red-600" : "text-blue-600"}`}
                    >
                      {timeRemaining}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Release Date:</span>
                    <span className="text-sm">
                      {contract.autoReleaseDate.toLocaleDateString()}{" "}
                      {contract.autoReleaseDate.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Warnings Sent:</span>
                    <span>{contract.warningsSent}</span>
                  </div>
                  {isExpiringSoon && contract.status === "funded" && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Funds will be auto-released soon! Take action if needed.
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              ) : (
                <div className="text-center text-gray-500">
                  Auto-release is disabled for this contract
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Release Conditions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {contract.conditions.map((condition, index) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{condition}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          {contract.status === "pending" && (
            <Button
              onClick={() => {
                setContracts((prev) =>
                  prev.map((c) =>
                    c.id === contract.id
                      ? { ...c, status: "funded", fundedAt: new Date() }
                      : c,
                  ),
                );
              }}
              className="flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Fund Escrow
            </Button>
          )}

          {contract.status === "funded" && (
            <>
              <Button
                onClick={() => {
                  setContracts((prev) =>
                    prev.map((c) =>
                      c.id === contract.id
                        ? { ...c, status: "released", releasedAt: new Date() }
                        : c,
                    ),
                  );
                }}
                className="flex items-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                Release Funds
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowDispute(true)}
                className="flex items-center gap-2"
              >
                <Gavel className="w-4 h-4" />
                Raise Dispute
              </Button>
            </>
          )}

          {contract.status === "pending" && (
            <Button
              variant="destructive"
              onClick={() => {
                setContracts((prev) =>
                  prev.map((c) =>
                    c.id === contract.id ? { ...c, status: "cancelled" } : c,
                  ),
                );
              }}
              className="flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Cancel Contract
            </Button>
          )}
        </div>
      </div>
    );
  };

  const activeContracts = contracts.filter((c) =>
    ["pending", "funded"].includes(c.status),
  );
  const completedContracts = contracts.filter((c) =>
    ["released", "cancelled"].includes(c.status),
  );
  const disputedContracts = contracts.filter((c) => c.status === "disputed");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Escrow Management</h2>
          <p className="text-gray-600">
            Secure payments with auto-release functionality
          </p>
        </div>
        <Dialog open={showCreateContract} onOpenChange={setShowCreateContract}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Create Escrow Contract
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Escrow Contract</DialogTitle>
            </DialogHeader>
            <CreateContractForm />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Contracts
                </p>
                <p className="text-2xl font-bold">{activeContracts.length}</p>
              </div>
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Escrowed
                </p>
                <p className="text-2xl font-bold">
                  $
                  {activeContracts
                    .reduce((sum, c) => sum + c.amount, 0)
                    .toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Disputes</p>
                <p className="text-2xl font-bold">{disputedContracts.length}</p>
              </div>
              <Gavel className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Auto-Release Soon
                </p>
                <p className="text-2xl font-bold">
                  {
                    activeContracts.filter(
                      (c) =>
                        c.autoReleaseEnabled &&
                        c.autoReleaseDate.getTime() - Date.now() <
                          24 * 60 * 60 * 1000,
                    ).length
                  }
                </p>
              </div>
              <Timer className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">Active Contracts</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="disputed">Disputed</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeContracts.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No active escrow contracts</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {activeContracts.map((contract) => (
                <Card
                  key={contract.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                >
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold">
                          {contract.projectTitle}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Contract #{contract.id}
                        </p>
                      </div>
                      <Badge className={getStatusColor(contract.status)}>
                        {contract.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Amount</p>
                        <p className="font-semibold">
                          {getCurrencyIcon(contract.currency)}
                          {contract.amount.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Auto-Release</p>
                        <p className="font-semibold">
                          {contract.autoReleaseEnabled
                            ? formatTimeRemaining(contract.autoReleaseDate)
                            : "Disabled"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Created</p>
                        <p className="font-semibold">
                          {contract.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => setSelectedContract(contract)}
                      className="w-full"
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedContracts.map((contract) => (
            <Card key={contract.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{contract.projectTitle}</h3>
                    <p className="text-sm text-gray-600">
                      {contract.status === "released"
                        ? "Released"
                        : "Cancelled"}{" "}
                      on{" "}
                      {(
                        contract.releasedAt || contract.createdAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {getCurrencyIcon(contract.currency)}
                      {contract.amount.toFixed(2)}
                    </p>
                    <Badge className={getStatusColor(contract.status)}>
                      {contract.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="disputed" className="space-y-4">
          {disputedContracts.map((contract) => (
            <Card key={contract.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{contract.projectTitle}</h3>
                    <p className="text-sm text-gray-600">
                      Dispute ID: {contract.disputeId}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {getCurrencyIcon(contract.currency)}
                      {contract.amount.toFixed(2)}
                    </p>
                    <Badge className="bg-red-100 text-red-800">Disputed</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          {activities.map((activity) => (
            <Card key={activity.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <History className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.description}</p>
                    <p className="text-sm text-gray-600">
                      {activity.timestamp.toLocaleDateString()}{" "}
                      {activity.timestamp.toLocaleTimeString()}
                    </p>
                    {activity.amount && (
                      <p className="text-sm font-medium">
                        Amount: {getCurrencyIcon(activity.currency || "")}
                        {activity.amount.toFixed(2)}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline">{activity.type}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {selectedContract && (
        <Dialog
          open={!!selectedContract}
          onOpenChange={() => setSelectedContract(null)}
        >
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Escrow Contract Details</DialogTitle>
            </DialogHeader>
            <ContractDetails contract={selectedContract} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default EnhancedEscrowSystem;
