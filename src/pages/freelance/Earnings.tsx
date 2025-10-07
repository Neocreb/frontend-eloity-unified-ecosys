// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Eye,
  Clock,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Wallet,
  BarChart3,
  PieChart,
  Target,
  Award,
  RefreshCw,
  Filter,
  Search,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  Banknote,
  Receipt,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface EarningsData {
  totalEarnings: number;
  currentMonthEarnings: number;
  previousMonthEarnings: number;
  availableBalance: number;
  pendingPayments: number;
  totalWithdrawn: number;
  averageHourlyRate: number;
  totalHoursWorked: number;
  projectsCompleted: number;
  activeProjects: number;
}

interface Transaction {
  id: string;
  type: "payment" | "withdrawal" | "refund" | "bonus";
  amount: number;
  status: "completed" | "pending" | "failed";
  description: string;
  projectTitle?: string;
  clientName?: string;
  date: Date;
  paymentMethod?: string;
  transactionFee?: number;
}

interface MonthlyEarning {
  month: string;
  amount: number;
  projects: number;
  hours: number;
}

const Earnings: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [viewMode, setViewMode] = useState<"overview" | "transactions" | "analytics">("overview");

  const [earningsData, setEarningsData] = useState<EarningsData>({
    totalEarnings: 45750,
    currentMonthEarnings: 8250,
    previousMonthEarnings: 6800,
    availableBalance: 12450,
    pendingPayments: 3200,
    totalWithdrawn: 30100,
    averageHourlyRate: 75,
    totalHoursWorked: 610,
    projectsCompleted: 23,
    activeProjects: 4,
  });

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "txn1",
      type: "payment",
      amount: 2500,
      status: "completed",
      description: "E-commerce Platform - Final Payment",
      projectTitle: "E-commerce Platform Development",
      clientName: "TechCorp Inc.",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      paymentMethod: "Bank Transfer",
    },
    {
      id: "txn2",
      type: "payment",
      amount: 1800,
      status: "pending",
      description: "Mobile App UI/UX - Milestone 2",
      projectTitle: "Mobile App Design",
      clientName: "FitLife Solutions",
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      paymentMethod: "PayPal",
    },
    {
      id: "txn3",
      type: "withdrawal",
      amount: -5000,
      status: "completed",
      description: "Bank Withdrawal",
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      paymentMethod: "Bank Transfer",
      transactionFee: 25,
    },
    {
      id: "txn4",
      type: "payment",
      amount: 3200,
      status: "completed",
      description: "Data Analysis Project - Full Payment",
      projectTitle: "Python Data Analysis",
      clientName: "DataDriven Co.",
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      paymentMethod: "Cryptocurrency",
    },
    {
      id: "txn5",
      type: "bonus",
      amount: 500,
      status: "completed",
      description: "Client Bonus for Outstanding Work",
      projectTitle: "Website Redesign",
      clientName: "Creative Studio",
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      id: "txn6",
      type: "payment",
      amount: 1200,
      status: "failed",
      description: "Content Writing - Monthly Payment",
      projectTitle: "Tech Blog Content",
      clientName: "TechInsights Media",
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      paymentMethod: "Credit Card",
    },
  ]);

  const [monthlyEarnings, setMonthlyEarnings] = useState<MonthlyEarning[]>([
    { month: "Jan", amount: 5200, projects: 3, hours: 68 },
    { month: "Feb", amount: 6800, projects: 4, hours: 89 },
    { month: "Mar", amount: 7200, projects: 3, hours: 95 },
    { month: "Apr", amount: 6500, projects: 2, hours: 85 },
    { month: "May", amount: 8100, projects: 5, hours: 105 },
    { month: "Jun", amount: 8250, projects: 4, hours: 108 },
  ]);

  const getEarningsGrowth = () => {
    const growth = ((earningsData.currentMonthEarnings - earningsData.previousMonthEarnings) / earningsData.previousMonthEarnings) * 100;
    return growth;
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "payment":
        return <ArrowUpRight className="w-4 h-4 text-green-500" />;
      case "withdrawal":
        return <ArrowDownRight className="w-4 h-4 text-red-500" />;
      case "bonus":
        return <Award className="w-4 h-4 text-purple-500" />;
      case "refund":
        return <RefreshCw className="w-4 h-4 text-blue-500" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number) => {
    const absAmount = Math.abs(amount);
    return `${amount < 0 ? "-" : ""}$${absAmount.toLocaleString()}`;
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };

  const StatCard: React.FC<{
    title: string;
    value: string;
    change?: number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
  }> = ({ title, value, change, icon, color, subtitle }) => (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
            <p className="text-2xl font-bold mb-2">{value}</p>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
            {change !== undefined && (
              <p className="text-sm font-medium">
                {change >= 0 ? (
                  <TrendingUp className="w-4 h-4 inline mr-1 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 inline mr-1 text-red-500" />
                )}
                <span className={change >= 0 ? "text-green-600" : "text-red-600"}>
                  {Math.abs(change).toFixed(1)}% this month
                </span>
              </p>
            )}
          </div>
          <div className={`p-4 rounded-xl ${color} shadow-lg`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );

  const TransactionCard: React.FC<{ transaction: Transaction }> = ({ transaction }) => (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              {getTransactionIcon(transaction.type)}
            </div>
            <div>
              <h4 className="font-medium">{transaction.description}</h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {transaction.clientName && (
                  <>
                    <span>{transaction.clientName}</span>
                    <span>•</span>
                  </>
                )}
                <span>{getTimeAgo(transaction.date)}</span>
                {transaction.paymentMethod && (
                  <>
                    <span>•</span>
                    <span>{transaction.paymentMethod}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-lg font-bold ${
              transaction.amount > 0 ? "text-green-600" : "text-red-600"
            }`}>
              {formatCurrency(transaction.amount)}
            </div>
            <Badge className={getStatusColor(transaction.status)}>
              {transaction.status}
            </Badge>
            {transaction.transactionFee && (
              <div className="text-xs text-muted-foreground mt-1">
                Fee: ${transaction.transactionFee}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="w-full sm:w-auto"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="w-full sm:w-auto">
          <h1 className="text-2xl sm:text-3xl font-bold">Earnings</h1>
          <p className="text-muted-foreground">Track your income and financial performance</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button>
            <Wallet className="w-4 h-4 mr-2" />
            Withdraw
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Earnings"
          value={formatCurrency(earningsData.totalEarnings)}
          change={getEarningsGrowth()}
          icon={<DollarSign className="w-6 h-6 text-white" />}
          color="bg-gradient-to-br from-green-500 to-emerald-600"
        />
        <StatCard
          title="Available Balance"
          value={formatCurrency(earningsData.availableBalance)}
          icon={<Wallet className="w-6 h-6 text-white" />}
          color="bg-gradient-to-br from-blue-500 to-cyan-600"
          subtitle="Ready to withdraw"
        />
        <StatCard
          title="Pending Payments"
          value={formatCurrency(earningsData.pendingPayments)}
          icon={<Clock className="w-6 h-6 text-white" />}
          color="bg-gradient-to-br from-yellow-500 to-orange-600"
          subtitle="Awaiting client approval"
        />
        <StatCard
          title="Average Rate"
          value={`$${earningsData.averageHourlyRate}/hr`}
          icon={<Target className="w-6 h-6 text-white" />}
          color="bg-gradient-to-br from-purple-500 to-violet-600"
          subtitle={`${earningsData.totalHoursWorked} hours worked`}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Transactions</CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="#transactions">
                      View All
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <p className="font-medium text-sm">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {transaction.clientName} • {getTimeAgo(transaction.date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${
                        transaction.amount > 0 ? "text-green-600" : "text-red-600"
                      }`}>
                        {formatCurrency(transaction.amount)}
                      </div>
                      <Badge className={`${getStatusColor(transaction.status)} text-xs`}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Earnings Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>This Month</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Gross Earnings</span>
                    <span className="font-bold">{formatCurrency(earningsData.currentMonthEarnings)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Platform Fees (5%)</span>
                    <span className="text-red-600">-{formatCurrency(earningsData.currentMonthEarnings * 0.05)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Payment Processing</span>
                    <span className="text-red-600">-$45</span>
                  </div>
                  <hr />
                  <div className="flex justify-between items-center font-bold">
                    <span>Net Earnings</span>
                    <span className="text-green-600">
                      {formatCurrency(earningsData.currentMonthEarnings * 0.95 - 45)}
                    </span>
                  </div>
                </div>

                <div className="pt-4">
                  <h4 className="font-medium mb-2">Projects This Month</h4>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-xl font-bold text-blue-600">{earningsData.activeProjects}</div>
                      <div className="text-sm text-muted-foreground">Active</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-xl font-bold text-green-600">2</div>
                      <div className="text-sm text-muted-foreground">Completed</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Monthly Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Month</span>
                    <span className="font-bold">{formatCurrency(earningsData.currentMonthEarnings)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Previous Month</span>
                    <span>{formatCurrency(earningsData.previousMonthEarnings)}</span>
                  </div>
                  <Progress value={75} className="h-2" />
                  <div className="text-sm text-center text-muted-foreground">
                    75% of monthly goal
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Time Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Hours</span>
                    <span className="font-bold">{earningsData.totalHoursWorked}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">This Month</span>
                    <span>108h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg/Day</span>
                    <span>5.2h</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Top Performer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm">5-Star Rating</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Rising Talent</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                      placeholder="Search transactions..."
                      className="w-full pl-10 pr-4 py-2 border rounded-md"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select className="px-3 py-2 border rounded-md">
                    <option value="all">All Types</option>
                    <option value="payment">Payments</option>
                    <option value="withdrawal">Withdrawals</option>
                    <option value="bonus">Bonuses</option>
                  </select>
                  <select className="px-3 py-2 border rounded-md">
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                  <Button variant="outline">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction List */}
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <TransactionCard key={transaction.id} transaction={transaction} />
            ))}
          </div>

          {/* Load More */}
          <div className="text-center">
            <Button variant="outline">Load More Transactions</Button>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Earnings Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Earnings Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monthlyEarnings.map((month, index) => (
                    <div key={month.month} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{month.month}</span>
                        <span className="font-bold">{formatCurrency(month.amount)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${(month.amount / Math.max(...monthlyEarnings.map(m => m.amount))) * 100}%`
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{month.projects} projects</span>
                        <span>{month.hours} hours</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Client Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Top Clients by Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "TechCorp Inc.", amount: 12500, percentage: 27 },
                    { name: "DataDriven Co.", amount: 8900, percentage: 19 },
                    { name: "FitLife Solutions", amount: 7200, percentage: 16 },
                    { name: "Creative Studio", amount: 5800, percentage: 13 },
                    { name: "Others", amount: 11350, percentage: 25 },
                  ].map((client) => (
                    <div key={client.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{client.name}</span>
                        <span className="font-bold">{formatCurrency(client.amount)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${client.percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-muted-foreground text-right">
                        {client.percentage}% of total
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <Receipt className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">{earningsData.projectsCompleted}</div>
                <div className="text-sm text-muted-foreground">Projects Completed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Clock className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold">{earningsData.totalHoursWorked}</div>
                <div className="text-sm text-muted-foreground">Total Hours</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <DollarSign className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-bold">${earningsData.averageHourlyRate}</div>
                <div className="text-sm text-muted-foreground">Average Rate</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                <div className="text-2xl font-bold">+{getEarningsGrowth().toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Growth Rate</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Earnings;
