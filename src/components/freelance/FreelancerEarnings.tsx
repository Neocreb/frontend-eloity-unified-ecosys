import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Wallet,
  BarChart3,
  PieChart,
  Target,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FreelanceWithdrawalMethods from "./FreelanceWithdrawalMethods";
import FreelanceTaxDocuments from "./FreelanceTaxDocuments";
import FreelanceInvoicing from "./FreelanceInvoicing";
import { useFreelance } from "@/hooks/use-freelance";
import { useAuth } from "@/contexts/AuthContext";

interface EarningRecord {
  id: string;
  projectTitle: string;
  client: {
    name: string;
    avatar?: string;
  };
  amount: number;
  type: "milestone" | "hourly" | "fixed" | "bonus";
  status: "pending" | "completed" | "processing" | "failed";
  date: Date;
  description?: string;
  invoiceId?: string;
}

interface EarningsStats {
  totalEarnings: number;
  thisMonth: number;
  lastMonth: number;
  pending: number;
  averageProject: number;
  topClient: string;
  growthRate: number;
}

export const FreelancerEarnings: React.FC = () => {
  const [earnings, setEarnings] = useState<EarningRecord[]>([]);
  const [stats, setStats] = useState<EarningsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeModal, setActiveModal] = useState<"withdrawal" | "tax" | "invoicing" | null>(null);
  
  const { getFreelancerEarnings, getFreelancerEarningsStats } = useFreelance();
  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const [earningsData, statsData] = await Promise.all([
          getFreelancerEarnings(user.id),
          getFreelancerEarningsStats(user.id)
        ]);
        
        setEarnings(earningsData || []);
        setStats(statsData || null);
      } catch (error) {
        console.error("Error loading earnings data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user, getFreelancerEarnings, getFreelancerEarningsStats]);

  const getStatusColor = (status: EarningRecord["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status: EarningRecord["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "processing":
        return <CreditCard className="w-4 h-4" />;
      case "failed":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: EarningRecord["type"]) => {
    switch (type) {
      case "milestone":
        return "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300";
      case "hourly":
        return "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300";
      case "fixed":
        return "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300";
      case "bonus":
        return "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300";
      default:
        return "bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.floor((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  };

  const filteredEarnings = earnings.filter((earning) => {
    const matchesStatus = statusFilter === "all" || earning.status === statusFilter;
    
    let matchesTime = true;
    if (timeFilter === "thisMonth") {
      const thisMonth = new Date().getMonth();
      matchesTime = earning.date.getMonth() === thisMonth;
    } else if (timeFilter === "lastMonth") {
      const lastMonth = new Date().getMonth() - 1;
      matchesTime = earning.date.getMonth() === lastMonth;
    }
    
    return matchesStatus && matchesTime;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Earnings</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your income and payment history</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${stats.totalEarnings.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Month</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${stats.thisMonth.toLocaleString()}
                  </p>
                  <div className="flex items-center mt-1">
                    {stats.growthRate >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className={stats.growthRate >= 0 ? "text-green-600 text-sm" : "text-red-600 text-sm"}>
                      {stats.growthRate >= 0 ? '+' : ''}{stats.growthRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                  <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${stats.pending.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                  <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Project</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${stats.averageProject.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                  <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <CardTitle>Earning History</CardTitle>
                <div className="flex gap-2">
                  <Select value={timeFilter} onValueChange={setTimeFilter}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="thisMonth">This Month</SelectItem>
                      <SelectItem value="lastMonth">Last Month</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredEarnings.length > 0 ? (
                  filteredEarnings.map((earning) => (
                    <div key={earning.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={earning.client.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                            {earning.client.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{earning.projectTitle}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{earning.client.name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <Badge className={getTypeColor(earning.type)}>
                          {earning.type}
                        </Badge>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 dark:text-white">${earning.amount.toFixed(2)}</p>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(earning.status)}>
                              <span className="flex items-center gap-1">
                                {getStatusIcon(earning.status)}
                                {earning.status}
                              </span>
                            </Badge>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(earning.date)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <DollarSign className="w-12 h-12 mx-auto text-gray-400" />
                    <h3 className="mt-4 font-medium text-gray-900 dark:text-white">No earnings found</h3>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">Complete projects to start earning</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setActiveModal("withdrawal")}
              >
                <Wallet className="w-4 h-4 mr-2" />
                Withdraw Funds
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setActiveModal("invoicing")}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Create Invoice
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setActiveModal("tax")}
              >
                <PieChart className="w-4 h-4 mr-2" />
                Tax Documents
              </Button>
            </CardContent>
          </Card>
          
          {stats && (
            <Card>
              <CardHeader>
                <CardTitle>Top Client</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Client</span>
                  <span className="font-medium text-gray-900 dark:text-white">{stats.topClient}</span>
                </div>
                <div className="mt-4">
                  <Progress value={85} className="h-2" />
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                    <span>85% of earnings</span>
                    <span>${(stats.totalEarnings * 0.85).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {activeModal === "withdrawal" && (
        <Dialog open onOpenChange={() => setActiveModal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Withdraw Funds</DialogTitle>
            </DialogHeader>
            <FreelanceWithdrawalMethods />
          </DialogContent>
        </Dialog>
      )}
      
      {activeModal === "tax" && (
        <Dialog open onOpenChange={() => setActiveModal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tax Documents</DialogTitle>
            </DialogHeader>
            <FreelanceTaxDocuments />
          </DialogContent>
        </Dialog>
      )}
      
      {activeModal === "invoicing" && (
        <Dialog open onOpenChange={() => setActiveModal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Invoice</DialogTitle>
            </DialogHeader>
            <FreelanceInvoicing />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default FreelancerEarnings;