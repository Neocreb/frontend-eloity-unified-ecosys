import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Lock, Unlock, Plus, Eye, EyeOff, AlertCircle, CheckCircle, Trash2, ArrowLeft, Shield, Key, Timer } from "lucide-react";

interface SafeBoxItem {
  id: string;
  name: string;
  amount: number;
  currency: string;
  lockedUntil: string;
  description?: string;
  lockPeriod: "1month" | "3months" | "6months" | "1year" | "custom";
  createdAt: Date;
  status: "active" | "unlocked" | "withdrawn";
}

const SafeBox = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<SafeBoxItem[]>([
    {
      id: "1",
      name: "Emergency Reserve",
      amount: 2500,
      currency: "USD",
      lockedUntil: "2025-12-31",
      lockPeriod: "6months",
      createdAt: new Date("2024-07-01"),
      description: "Emergency savings locked for stability",
      status: "active",
    },
    {
      id: "2",
      name: "Year-End Goal",
      amount: 5000,
      currency: "USD",
      lockedUntil: "2025-12-31",
      lockPeriod: "1year",
      createdAt: new Date("2024-01-01"),
      description: "Long-term savings goal",
      status: "active",
    },
  ]);

  const [newItem, setNewItem] = useState({
    name: "",
    amount: "",
    lockPeriod: "3months" as "1month" | "3months" | "6months" | "1year" | "custom",
    customDays: "",
    description: "",
  });

  const [showAmount, setShowAmount] = useState<Record<string, boolean>>({});

  const lockPeriods: Record<string, number> = {
    "1month": 30,
    "3months": 90,
    "6months": 180,
    "1year": 365,
  };

  const calculateLockDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split("T")[0];
  };

  const addToSafeBox = () => {
    if (!newItem.name || !newItem.amount) {
      alert("Please fill in all required fields");
      return;
    }

    const days =
      newItem.lockPeriod === "custom"
        ? Number(newItem.customDays)
        : lockPeriods[newItem.lockPeriod];

    if (days <= 0) {
      alert("Please enter a valid lock period");
      return;
    }

    const item: SafeBoxItem = {
      id: String(Date.now()),
      name: newItem.name,
      amount: Number(newItem.amount),
      currency: "USD",
      lockedUntil: calculateLockDate(days),
      lockPeriod: newItem.lockPeriod,
      createdAt: new Date(),
      description: newItem.description,
      status: "active",
    };

    setItems([...items, item]);
    setNewItem({
      name: "",
      amount: "",
      lockPeriod: "3months",
      customDays: "",
      description: "",
    });
  };

  const withdrawItem = (id: string) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, status: "withdrawn" as const } : item
      )
    );
  };

  const deleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const totalLocked = items
    .filter((item) => item.status === "active")
    .reduce((sum, item) => sum + item.amount, 0);

  const daysUntilUnlock = (lockedUntil: string) => {
    const days = Math.ceil(
      (new Date(lockedUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return days;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SafeBox</h1>
              <p className="text-sm text-gray-600">Lock away money to prevent unnecessary spending</p>
            </div>
          </div>
          <Shield className="h-8 w-8 text-slate-600" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {/* Overview Card */}
          <Card className="border-2 border-slate-200 bg-gradient-to-r from-slate-50 to-gray-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-6 w-6 text-slate-600" />
                Total Amount Locked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-slate-900">
                  ${totalLocked.toFixed(2)}
                </span>
                <span className="text-gray-600">USD</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Your money is secured and locked until the specified dates
              </p>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Why Use SafeBox?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex gap-3">
                  <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Prevent Overspending</p>
                    <p className="text-sm text-gray-600">Lock funds to avoid unnecessary purchases</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Key className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Full Control</p>
                    <p className="text-sm text-gray-600">Choose how long to lock your money</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Reach Goals</p>
                    <p className="text-sm text-gray-600">Build better financial habits</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add to SafeBox Button */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full bg-slate-600 hover:bg-slate-700 text-white h-12">
                <Plus className="h-5 w-5 mr-2" />
                Add Money to SafeBox
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Money to SafeBox</DialogTitle>
                <DialogDescription>
                  Lock away money to prevent unnecessary spending
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="box-name" className="text-sm font-medium">
                    SafeBox Name *
                  </Label>
                  <Input
                    id="box-name"
                    placeholder="e.g., Emergency Fund, Vacation"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="box-amount" className="text-sm font-medium">
                    Amount ($) *
                  </Label>
                  <Input
                    id="box-amount"
                    type="number"
                    placeholder="1000"
                    value={newItem.amount}
                    onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="lock-period" className="text-sm font-medium">
                    Lock Period *
                  </Label>
                  <select
                    id="lock-period"
                    value={newItem.lockPeriod}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        lockPeriod: e.target.value as any,
                      })
                    }
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  >
                    <option value="1month">1 Month</option>
                    <option value="3months">3 Months</option>
                    <option value="6months">6 Months</option>
                    <option value="1year">1 Year</option>
                    <option value="custom">Custom Days</option>
                  </select>
                </div>
                {newItem.lockPeriod === "custom" && (
                  <div>
                    <Label htmlFor="custom-days" className="text-sm font-medium">
                      Number of Days *
                    </Label>
                    <Input
                      id="custom-days"
                      type="number"
                      placeholder="45"
                      value={newItem.customDays}
                      onChange={(e) =>
                        setNewItem({ ...newItem, customDays: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="box-description" className="text-sm font-medium">
                    Description (Optional)
                  </Label>
                  <textarea
                    id="box-description"
                    placeholder="What is this money for?"
                    value={newItem.description}
                    onChange={(e) =>
                      setNewItem({ ...newItem, description: e.target.value })
                    }
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 resize-none"
                    rows={3}
                  />
                </div>
                <Button
                  className="w-full bg-slate-600 hover:bg-slate-700"
                  onClick={addToSafeBox}
                >
                  Add to SafeBox
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* SafeBox Items */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">My SafeBoxes</h2>
            {items.length > 0 ? (
              items.map((item) => {
                const daysLeft = daysUntilUnlock(item.lockedUntil);
                const isUnlocked = daysLeft <= 0;

                return (
                  <Card
                    key={item.id}
                    className={`border-l-4 ${
                      item.status === "withdrawn"
                        ? "border-l-gray-400 opacity-60"
                        : "border-l-slate-600"
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2 text-lg">
                            {item.status === "active" ? (
                              <Lock className="h-5 w-5 text-slate-600" />
                            ) : (
                              <Unlock className="h-5 w-5 text-green-600" />
                            )}
                            {item.name}
                          </CardTitle>
                          {item.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setShowAmount({ ...showAmount, [item.id]: !showAmount[item.id] })}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              {showAmount[item.id] ? (
                                <Eye className="h-4 w-4 text-gray-600" />
                              ) : (
                                <EyeOff className="h-4 w-4 text-gray-600" />
                              )}
                            </button>
                          </div>
                          <p className="text-2xl font-bold text-slate-900">
                            {showAmount[item.id] ? `$${item.amount.toFixed(2)}` : "••••"}
                          </p>
                          {item.status === "withdrawn" && (
                            <p className="text-xs text-gray-600 mt-1">Withdrawn</p>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Unlock Status */}
                      <div
                        className={`p-3 rounded-lg border flex items-center gap-2 ${
                          isUnlocked && item.status === "active"
                            ? "bg-green-50 border-green-200"
                            : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        {isUnlocked && item.status === "active" ? (
                          <>
                            <Unlock className="h-5 w-5 text-green-600 flex-shrink-0" />
                            <div>
                              <p className="font-semibold text-green-900">Ready to Withdraw</p>
                              <p className="text-xs text-green-700">
                                Your money is unlocked and ready
                              </p>
                            </div>
                          </>
                        ) : item.status === "withdrawn" ? (
                          <>
                            <CheckCircle className="h-5 w-5 text-gray-600 flex-shrink-0" />
                            <div>
                              <p className="font-semibold text-gray-900">Withdrawn</p>
                              <p className="text-xs text-gray-600">
                                Money has been withdrawn
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <Timer className="h-5 w-5 text-slate-600 flex-shrink-0" />
                            <div>
                              <p className="font-semibold text-slate-900">Locked</p>
                              <p className="text-xs text-slate-600">
                                {daysLeft} day{daysLeft !== 1 ? "s" : ""} remaining
                              </p>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Lock Date */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 font-medium">Created</p>
                          <p className="text-gray-900 font-semibold">
                            {item.createdAt.toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 font-medium">Unlock Date</p>
                          <p className="text-gray-900 font-semibold">
                            {new Date(item.lockedUntil).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2 border-t">
                        {isUnlocked && item.status === "active" && (
                          <Button
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={() => withdrawItem(item.id)}
                          >
                            <Unlock className="h-4 w-4 mr-1" />
                            Withdraw
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => deleteItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-12">
                <Shield className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No SafeBoxes yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Create your first SafeBox to lock away money
                </p>
              </div>
            )}
          </div>

          {/* Info Section */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <AlertCircle className="h-5 w-5" />
                How SafeBox Works
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-900 space-y-2">
              <p>
                • Once you add money to SafeBox, it will be locked until the specified unlock date
              </p>
              <p>
                • You cannot withdraw your money until the unlock date arrives
              </p>
              <p>
                • This helps you build better financial habits and reach your savings goals
              </p>
              <p>
                • Your money remains fully yours and earns interest while locked
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SafeBox;
