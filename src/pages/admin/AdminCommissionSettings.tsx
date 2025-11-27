import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  Percent,
  Settings,
  Save,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Trash2,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface CommissionSetting {
  id: string;
  service_type: "airtime" | "data" | "utilities" | "gift_cards" | "all";
  operator_id?: number;
  commission_type: "percentage" | "fixed_amount" | "none";
  percentage_value?: string;
  fixed_amount?: string;
  currency_code: string;
  is_active: boolean;
}

interface CommissionStats {
  total_transactions: number;
  total_commission: number;
  by_service_type: Record<string, number>;
  by_commission_type: Record<string, number>;
}

const AdminCommissionSettings = () => {
  const { session } = useAuth();
  const [settings, setSettings] = useState<CommissionSetting[]>([]);
  const [stats, setStats] = useState<CommissionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("all");
  const [commissionType, setCommissionType] = useState<string>("percentage");
  const [percentageValue, setPercentageValue] = useState<string>("5");
  const [fixedAmount, setFixedAmount] = useState<string>("0");
  const [currencyCode, setCurrencyCode] = useState<string>("USD");
  const [operatorId, setOperatorId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
    fetchStats();
  }, []);

  const fetchSettings = async () => {
    try {
      setError(null);
      const token = session?.access_token;
      const response = await fetch("/api/commission/settings", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch commission settings");

      const data = await response.json();
      setSettings(data.settings || []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to load settings";
      setError(errorMsg);
      toast.error(errorMsg);
      console.error("Fetch settings error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = session?.access_token;
      const response = await fetch("/api/commission/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Fetch stats error:", err);
    }
  };

  const handleSaveSetting = async () => {
    try {
      if (!selectedService) {
        toast.error("Please select a service");
        return;
      }

      if (commissionType === "percentage" && !percentageValue) {
        toast.error("Please enter percentage value");
        return;
      }

      if (commissionType === "fixed_amount" && !fixedAmount) {
        toast.error("Please enter fixed amount");
        return;
      }

      setIsSaving(true);
      const token = session?.access_token;

      const payload: any = {
        serviceType: selectedService,
        commissionType: commissionType,
        currencyCode: currencyCode,
      };

      if (commissionType === "percentage") {
        payload.percentageValue = percentageValue;
      } else if (commissionType === "fixed_amount") {
        payload.fixedAmount = fixedAmount;
      }

      if (operatorId) {
        payload.operatorId = parseInt(operatorId);
      }

      const response = await fetch("/api/commission/settings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to save commission setting");

      const data = await response.json();
      toast.success("Commission setting saved successfully!");
      fetchSettings();
      fetchStats();

      // Reset form
      setSelectedService("all");
      setCommissionType("percentage");
      setPercentageValue("5");
      setFixedAmount("0");
      setOperatorId("");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to save setting";
      toast.error(errorMsg);
      console.error("Save setting error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisableSetting = async (settingId: string) => {
    try {
      const token = session?.access_token;

      const response = await fetch(`/api/commission/settings/${settingId}/disable`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to disable commission setting");

      toast.success("Commission setting disabled");
      fetchSettings();
      fetchStats();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to disable setting";
      toast.error(errorMsg);
      console.error("Disable setting error:", err);
    }
  };

  const getServiceLabel = (serviceType: string) => {
    const labels: Record<string, string> = {
      airtime: "Airtime",
      data: "Data Bundles",
      utilities: "Utilities",
      gift_cards: "Gift Cards",
      all: "All Services",
    };
    return labels[serviceType] || serviceType;
  };

  const getCommissionDisplay = (setting: CommissionSetting) => {
    if (setting.commission_type === "percentage") {
      return `${setting.percentage_value}%`;
    } else if (setting.commission_type === "fixed_amount") {
      return `${setting.currency_code} ${setting.fixed_amount}`;
    }
    return "None";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="h-8 w-8" />
            Commission Settings
          </h1>
          <p className="text-gray-600 mt-2">
            Configure how you earn commission from Airtime, Data, Utilities, and Gift Card sales
          </p>
        </div>

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="settings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="active">Active Rules</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Commission Rule</CardTitle>
                <CardDescription>
                  Set up commission for different services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Service Selection */}
                <div className="space-y-2">
                  <Label htmlFor="service">Service Type</Label>
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger id="service">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Services</SelectItem>
                      <SelectItem value="airtime">Airtime</SelectItem>
                      <SelectItem value="data">Data Bundles</SelectItem>
                      <SelectItem value="utilities">Utilities</SelectItem>
                      <SelectItem value="gift_cards">Gift Cards</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Commission Type Selection */}
                <div className="space-y-2">
                  <Label htmlFor="commissionType">Commission Type</Label>
                  <Select value={commissionType} onValueChange={setCommissionType}>
                    <SelectTrigger id="commissionType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">
                        <div className="flex items-center gap-2">
                          <Percent className="h-4 w-4" />
                          Percentage
                        </div>
                      </SelectItem>
                      <SelectItem value="fixed_amount">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Fixed Amount
                        </div>
                      </SelectItem>
                      <SelectItem value="none">No Commission</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Percentage Input */}
                {commissionType === "percentage" && (
                  <div className="space-y-2">
                    <Label htmlFor="percentage">Commission Percentage (%)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="percentage"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={percentageValue}
                        onChange={(e) => setPercentageValue(e.target.value)}
                        placeholder="e.g., 5"
                      />
                      <span className="text-gray-600 font-semibold">%</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Example: For a ₦1,000 transaction with 5% commission, you earn ₦50
                    </p>
                  </div>
                )}

                {/* Fixed Amount Input */}
                {commissionType === "fixed_amount" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select value={currencyCode} onValueChange={setCurrencyCode}>
                        <SelectTrigger id="currency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="NGN">Nigerian Naira (₦)</SelectItem>
                          <SelectItem value="EUR">Euro (€)</SelectItem>
                          <SelectItem value="GBP">British Pound (£)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fixedAmount">Commission Amount</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 font-semibold">
                          {currencyCode === "NGN" ? "₦" : currencyCode === "EUR" ? "€" : currencyCode === "GBP" ? "£" : "$"}
                        </span>
                        <Input
                          id="fixedAmount"
                          type="number"
                          min="0"
                          step="0.01"
                          value={fixedAmount}
                          onChange={(e) => setFixedAmount(e.target.value)}
                          placeholder="e.g., 50"
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        Fixed amount earned per transaction, regardless of sale size
                      </p>
                    </div>
                  </div>
                )}

                {/* Operator ID (Optional) */}
                <div className="space-y-2">
                  <Label htmlFor="operatorId">
                    Operator ID (Optional - for specific operator override)
                  </Label>
                  <Input
                    id="operatorId"
                    type="number"
                    value={operatorId}
                    onChange={(e) => setOperatorId(e.target.value)}
                    placeholder="Leave empty to apply to all operators"
                  />
                  <p className="text-xs text-gray-500">
                    Use this to set different commission rates for specific providers
                  </p>
                </div>

                {/* Save Button */}
                <Button
                  onClick={handleSaveSetting}
                  disabled={isSaving || !selectedService}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Commission Rule
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Active Rules Tab */}
          <TabsContent value="active" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Commission Rules</CardTitle>
                <CardDescription>
                  Currently configured commission rules for your platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                {settings.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No commission rules configured yet. Create one in the Settings tab.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {settings.map((setting) => (
                      <div
                        key={setting.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">
                              {getServiceLabel(setting.service_type)}
                            </h3>
                            {setting.is_active ? (
                              <Badge variant="default" className="bg-green-600">
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>
                              Commission:{" "}
                              <span className="font-semibold text-gray-900">
                                {getCommissionDisplay(setting)}
                              </span>
                            </span>
                            {setting.operator_id && (
                              <span>
                                Operator ID:{" "}
                                <span className="font-semibold text-gray-900">
                                  {setting.operator_id}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                        {setting.is_active && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDisableSetting(setting.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="stats" className="space-y-4">
            {stats && (
              <>
                {/* Overall Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>Commission Overview</CardTitle>
                    <CardDescription>
                      Commission earned from all transactions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Total Transactions</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stats.total_transactions}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Total Commission Earned</p>
                      <p className="text-3xl font-bold text-green-600">
                        ${stats.total_commission.toFixed(2)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* By Service Type */}
                <Card>
                  <CardHeader>
                    <CardTitle>Commission by Service Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(stats.by_service_type).length === 0 ? (
                        <p className="text-gray-500">No transactions yet</p>
                      ) : (
                        Object.entries(stats.by_service_type).map(([service, amount]) => (
                          <div
                            key={service}
                            className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                          >
                            <span className="font-medium text-gray-900">
                              {getServiceLabel(service)}
                            </span>
                            <span className="font-semibold text-green-600">
                              ${(amount as number).toFixed(2)}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* By Commission Type */}
                <Card>
                  <CardHeader>
                    <CardTitle>Commission by Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(stats.by_commission_type).length === 0 ? (
                        <p className="text-gray-500">No transactions yet</p>
                      ) : (
                        Object.entries(stats.by_commission_type).map(
                          ([type, amount]) => (
                            <div
                              key={type}
                              className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                            >
                              <span className="font-medium text-gray-900 capitalize">
                                {type.replace(/_/g, " ")}
                              </span>
                              <span className="font-semibold text-green-600">
                                ${(amount as number).toFixed(2)}
                              </span>
                            </div>
                          )
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminCommissionSettings;
