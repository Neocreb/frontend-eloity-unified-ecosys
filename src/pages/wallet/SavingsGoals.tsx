import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { WalletActionHeader } from "@/components/wallet/WalletActionHeader";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Target, Plus, Edit2, Trash2, TrendingUp, Calendar, CheckCircle, AlertCircle, DollarSign } from "lucide-react";

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: string;
  color: string;
  createdAt: Date;
  description?: string;
}

const SavingsGoals = () => {
  const navigate = useNavigate();
  const [goals, setGoals] = useState<SavingsGoal[]>([
    {
      id: "1",
      name: "Emergency Fund",
      targetAmount: 5000,
      currentAmount: 2500,
      targetDate: "2025-12-31",
      category: "Emergency",
      color: "#ef4444",
      createdAt: new Date("2024-01-01"),
      description: "Build a 6-month emergency fund",
    },
    {
      id: "2",
      name: "Vacation",
      targetAmount: 2000,
      currentAmount: 1200,
      targetDate: "2025-06-30",
      category: "Travel",
      color: "#3b82f6",
      createdAt: new Date("2024-02-01"),
      description: "Summer vacation to Europe",
    },
    {
      id: "3",
      name: "New Laptop",
      targetAmount: 1500,
      currentAmount: 800,
      targetDate: "2025-05-31",
      category: "Technology",
      color: "#8b5cf6",
      createdAt: new Date("2024-01-15"),
      description: "Professional laptop for work",
    },
  ]);

  const [newGoal, setNewGoal] = useState({
    name: "",
    targetAmount: "",
    targetDate: "",
    category: "Other",
    description: "",
  });

  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  const categoryColors: Record<string, string> = {
    Emergency: "#ef4444",
    Travel: "#3b82f6",
    Technology: "#8b5cf6",
    Education: "#10b981",
    Home: "#f59e0b",
    Other: "#6b7280",
  };

  const createGoal = () => {
    if (!newGoal.name || !newGoal.targetAmount || !newGoal.targetDate) {
      alert("Please fill in all required fields");
      return;
    }

    const goal: SavingsGoal = {
      id: String(Date.now()),
      name: newGoal.name,
      targetAmount: Number(newGoal.targetAmount),
      currentAmount: 0,
      targetDate: newGoal.targetDate,
      category: newGoal.category,
      color: categoryColors[newGoal.category as keyof typeof categoryColors] || categoryColors.Other,
      createdAt: new Date(),
      description: newGoal.description,
    };

    setGoals([...goals, goal]);
    setNewGoal({
      name: "",
      targetAmount: "",
      targetDate: "",
      category: "Other",
      description: "",
    });
  };

  const deleteGoal = (id: string) => {
    setGoals(goals.filter((g) => g.id !== id));
  };

  const updateGoalAmount = (id: string, amount: number) => {
    setGoals(
      goals.map((g) => {
        if (g.id === id) {
          return { ...g, currentAmount: Math.min(amount, g.targetAmount) };
        }
        return g;
      })
    );
  };

  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  const chartData = goals.map((goal) => ({
    name: goal.name,
    value: goal.currentAmount,
    target: goal.targetAmount,
    color: goal.color,
  }));

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <WalletActionHeader title="Savings Goals" />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {/* Overview Card */}
          <Card className="border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-900">
                <Target className="h-6 w-6" />
                Your Savings Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-emerald-700 font-medium">Total Target</p>
                  <p className="text-2xl font-bold text-emerald-900">${totalTarget.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-emerald-700 font-medium">Total Saved</p>
                  <p className="text-2xl font-bold text-emerald-900">${totalSaved.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-emerald-700 font-medium">Progress</p>
                  <p className="text-2xl font-bold text-emerald-900">{totalProgress.toFixed(0)}%</p>
                </div>
              </div>
              <div className="w-full bg-emerald-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all duration-300"
                  style={{ width: `${Math.min(totalProgress, 100)}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* Chart */}
          {goals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Goals Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${name}: $${value}`}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Create Goal Button */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12">
                <Plus className="h-5 w-5 mr-2" />
                Create New Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Savings Goal</DialogTitle>
                <DialogDescription>
                  Set a savings goal to stay motivated and track your progress.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="goal-name" className="text-sm font-medium">Goal Name *</Label>
                  <Input
                    id="goal-name"
                    placeholder="e.g., Emergency Fund, Vacation"
                    value={newGoal.name}
                    onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="target-amount" className="text-sm font-medium">Target Amount ($) *</Label>
                  <Input
                    id="target-amount"
                    type="number"
                    placeholder="5000"
                    value={newGoal.targetAmount}
                    onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="target-date" className="text-sm font-medium">Target Date *</Label>
                  <Input
                    id="target-date"
                    type="date"
                    value={newGoal.targetDate}
                    onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="category" className="text-sm font-medium">Category</Label>
                  <select
                    id="category"
                    value={newGoal.category}
                    onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Emergency">Emergency Fund</option>
                    <option value="Travel">Travel</option>
                    <option value="Technology">Technology</option>
                    <option value="Education">Education</option>
                    <option value="Home">Home</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="description" className="text-sm font-medium">Description (Optional)</Label>
                  <textarea
                    id="description"
                    placeholder="Why this goal matters to you..."
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 resize-none"
                    rows={3}
                  />
                </div>
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  onClick={createGoal}
                >
                  Create Goal
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Goals List */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">My Goals</h2>
            {goals.length > 0 ? (
              goals.map((goal) => {
                const progressPercent = (goal.currentAmount / goal.targetAmount) * 100;
                const daysLeft = Math.ceil(
                  (new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                );
                const isCompleted = progressPercent >= 100;

                return (
                  <Card key={goal.id} className="border-l-4" style={{ borderLeftColor: goal.color }}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: goal.color }}
                            ></div>
                            {goal.name}
                          </CardTitle>
                          {goal.description && (
                            <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                          )}
                        </div>
                        {isCompleted && <CheckCircle className="h-6 w-6 text-green-500" />}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Progress Bar */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            ${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
                          </span>
                          <span className="text-sm font-bold text-gray-900">
                            {progressPercent.toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-full transition-all duration-300"
                            style={{ width: `${Math.min(progressPercent, 100)}%`, backgroundColor: goal.color }}
                          ></div>
                        </div>
                      </div>

                      {/* Goal Info */}
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 font-medium">Category</p>
                          <p className="text-gray-900 font-semibold">{goal.category}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 font-medium flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Target Date
                          </p>
                          <p className="text-gray-900 font-semibold">
                            {new Date(goal.targetDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 font-medium">Days Left</p>
                          <p className={`font-semibold ${daysLeft > 0 ? "text-gray-900" : "text-red-600"}`}>
                            {daysLeft > 0 ? `${daysLeft}d` : "Overdue"}
                          </p>
                        </div>
                      </div>

                      {/* Add Money Section */}
                      {!isCompleted && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="w-full">
                              <DollarSign className="h-4 w-4 mr-2" />
                              Add Money to Goal
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Money to {goal.name}</DialogTitle>
                              <DialogDescription>
                                Current amount: ${goal.currentAmount.toFixed(2)}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div>
                                <Label htmlFor="add-amount" className="text-sm font-medium">
                                  Amount to Add ($)
                                </Label>
                                <Input
                                  id="add-amount"
                                  type="number"
                                  placeholder="100"
                                  defaultValue=""
                                  onBlur={(e) => {
                                    const amount = Number(e.target.value);
                                    if (amount > 0) {
                                      updateGoalAmount(goal.id, goal.currentAmount + amount);
                                    }
                                  }}
                                  className="mt-1"
                                />
                              </div>
                              <Button
                                className="w-full bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => {
                                  const input = document.getElementById("add-amount") as HTMLInputElement;
                                  const amount = Number(input.value);
                                  if (amount > 0) {
                                    updateGoalAmount(goal.id, goal.currentAmount + amount);
                                  }
                                }}
                              >
                                Add Money
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setEditingGoal(goal)}
                        >
                          <Edit2 className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => deleteGoal(goal.id)}
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
                <Target className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No savings goals yet</p>
                <p className="text-sm text-gray-400 mt-1">Create your first goal to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavingsGoals;
