// @ts-nocheck
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Target,
  TrendingUp,
  Calendar,
  Trophy,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  DollarSign,
  Zap,
  BarChart3
} from "lucide-react";
import { formatCurrency, formatNumber } from "@/utils/formatters";
import { cn } from "@/lib/utils";

interface Goal {
  id: string;
  title: string;
  description: string;
  type: 'earning' | 'activity' | 'battle' | 'streak';
  target: number;
  current: number;
  period: 'daily' | 'weekly' | 'monthly';
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'paused' | 'failed';
  reward?: number;
  priority: 'low' | 'medium' | 'high';
}

interface GoalTrackingProps {
  className?: string;
}

const GoalTracking = ({ className }: GoalTrackingProps) => {
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: "1",
      title: "Weekly Earning Target",
      description: "Earn $500 this week through all activities",
      type: "earning",
      target: 500,
      current: 375.25,
      period: "weekly",
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: "active",
      reward: 50,
      priority: "high"
    },
    {
      id: "2",
      title: "Daily Activity Streak",
      description: "Complete at least 5 activities per day",
      type: "activity",
      target: 5,
      current: 3,
      period: "daily",
      startDate: new Date(),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      status: "active",
      priority: "medium"
    },
    {
      id: "3",
      title: "Battle Victory Challenge",
      description: "Win 10 battle votes this month",
      type: "battle",
      target: 10,
      current: 7,
      period: "monthly",
      startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      status: "active",
      reward: 100,
      priority: "medium"
    },
    {
      id: "4",
      title: "Monthly Earning Milestone",
      description: "Earn $2000 this month",
      type: "earning",
      target: 2000,
      current: 2150,
      period: "monthly",
      startDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      status: "completed",
      reward: 200,
      priority: "high"
    }
  ]);

  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const filteredGoals = filter === 'all' 
    ? goals 
    : goals.filter(goal => goal.status === filter);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'earning': return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'activity': return <Zap className="h-4 w-4 text-blue-500" />;
      case 'battle': return <Target className="h-4 w-4 text-red-500" />;
      case 'streak': return <Calendar className="h-4 w-4 text-purple-500" />;
      default: return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTimeRemaining = (endDate: Date) => {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diff < 0) return "Expired";
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;
    return "< 1h left";
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const activeGoalsCount = goals.filter(g => g.status === 'active').length;
  const completedGoalsCount = goals.filter(g => g.status === 'completed').length;
  const totalRewards = goals.filter(g => g.status === 'completed' && g.reward).reduce((sum, g) => sum + (g.reward || 0), 0);

  const CreateGoalForm = () => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      type: 'earning' as Goal['type'],
      target: '',
      period: 'weekly' as Goal['period'],
      priority: 'medium' as Goal['priority']
    });

    const handleCreate = () => {
      if (!formData.title || !formData.target) return;

      const now = new Date();
      let endDate = new Date();
      
      switch (formData.period) {
        case 'daily':
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'weekly':
          endDate.setDate(now.getDate() + 7);
          break;
        case 'monthly':
          endDate.setMonth(now.getMonth() + 1);
          break;
      }

      const newGoal: Goal = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        type: formData.type,
        target: parseFloat(formData.target),
        current: 0,
        period: formData.period,
        startDate: now,
        endDate,
        status: 'active',
        priority: formData.priority
      };

      setGoals(prev => [newGoal, ...prev]);
      setShowCreateGoal(false);
      setFormData({
        title: '',
        description: '',
        type: 'earning',
        target: '',
        period: 'weekly',
        priority: 'medium'
      });
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Goal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Goal Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Weekly Earning Target"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your goal..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Goal Type</Label>
              <Select value={formData.type} onValueChange={(value: Goal['type']) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="earning">Earning Goal</SelectItem>
                  <SelectItem value="activity">Activity Goal</SelectItem>
                  <SelectItem value="battle">Battle Goal</SelectItem>
                  <SelectItem value="streak">Streak Goal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="target">Target Value</Label>
              <Input
                id="target"
                type="number"
                value={formData.target}
                onChange={(e) => setFormData(prev => ({ ...prev, target: e.target.value }))}
                placeholder="100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="period">Time Period</Label>
              <Select value={formData.period} onValueChange={(value: Goal['period']) => setFormData(prev => ({ ...prev, period: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value: Goal['priority']) => setFormData(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => {
              handleCreate();
              // Notify about new goal created
              if (formData.title && formData.target) {
                rewardsNotificationService.addRewardsNotification({
                  type: 'goal',
                  title: 'New Goal Created! 🎯',
                  message: `${formData.title} - Target: ${formData.target}`,
                  priority: 'low',
                  actionUrl: '/app/rewards?tab=dashboard',
                  actionLabel: 'View Goals'
                });
              }
            }} className="flex-1">
              Create Goal
            </Button>
            <Button variant="outline" onClick={() => setShowCreateGoal(false)}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Goal Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Goals</p>
                <p className="text-2xl font-bold">{activeGoalsCount}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed Goals</p>
                <p className="text-2xl font-bold">{completedGoalsCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rewards Earned</p>
                <p className="text-2xl font-bold">{formatCurrency(totalRewards)}</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2">
          {[
            { value: 'all', label: 'All Goals' },
            { value: 'active', label: 'Active' },
            { value: 'completed', label: 'Completed' },
            { value: 'paused', label: 'Paused' }
          ].map((option) => (
            <Button
              key={option.value}
              variant={filter === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        <Button onClick={() => setShowCreateGoal(!showCreateGoal)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Goal
        </Button>
      </div>

      {/* Create Goal Form */}
      {showCreateGoal && <CreateGoalForm />}

      {/* Goals List */}
      <div className="space-y-4">
        {filteredGoals.map((goal) => (
          <Card 
            key={goal.id} 
            className={cn(
              "transition-all hover:shadow-md",
              getPriorityColor(goal.priority)
            )}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {getTypeIcon(goal.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{goal.title}</h3>
                      <Badge className={getStatusColor(goal.status)}>
                        {goal.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {goal.priority} priority
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {goal.description}
                    </p>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Progress: {formatNumber(goal.current)}/{formatNumber(goal.target)}</span>
                        <span className="font-medium">{getProgressPercentage(goal.current, goal.target).toFixed(1)}%</span>
                      </div>
                      
                      <Progress 
                        value={getProgressPercentage(goal.current, goal.target)} 
                        className="h-2"
                      />

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimeRemaining(goal.endDate)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {goal.period}
                        </div>
                        {goal.reward && (
                          <div className="flex items-center gap-1 text-green-600">
                            <Trophy className="h-3 w-3" />
                            {formatCurrency(goal.reward)} reward
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-100">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {goal.status === 'completed' && (
                <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Goal completed! 
                      {goal.reward && (
                        <span className="ml-1">
                          Earned {formatCurrency(goal.reward)} bonus reward!
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGoals.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No goals found</h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all' 
                ? "Create your first goal to start tracking your progress!" 
                : `No ${filter} goals found. Try a different filter or create a new goal.`}
            </p>
            {filter === 'all' && (
              <Button onClick={() => setShowCreateGoal(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Goal
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GoalTracking;
