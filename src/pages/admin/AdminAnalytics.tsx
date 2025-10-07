// @ts-nocheck
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { TrendingUp, Users, Activity, DollarSign } from "lucide-react";

const AdminAnalytics = () => {
  const userGrowthData = [
    { month: "Jan", users: 1200, active: 980 },
    { month: "Feb", users: 1350, active: 1100 },
    { month: "Mar", users: 1500, active: 1250 },
    { month: "Apr", users: 1680, active: 1400 },
    { month: "May", users: 1850, active: 1550 },
    { month: "Jun", users: 2100, active: 1780 },
  ];

  const revenueData = [
    { month: "Jan", marketplace: 12000, crypto: 8000, freelance: 6000 },
    { month: "Feb", marketplace: 15000, crypto: 9500, freelance: 7200 },
    { month: "Mar", marketplace: 18000, crypto: 11000, freelance: 8500 },
    { month: "Apr", marketplace: 22000, crypto: 13500, freelance: 9800 },
    { month: "May", marketplace: 25000, crypto: 15000, freelance: 11200 },
    { month: "Jun", marketplace: 28000, crypto: 17500, freelance: 12500 },
  ];

  const platformUsageData = [
    { name: "Marketplace", value: 35, color: "#8884d8" },
    { name: "Social Feed", value: 30, color: "#82ca9d" },
    { name: "Crypto Trading", value: 20, color: "#ffc658" },
    { name: "Freelance", value: 15, color: "#ff8042" },
  ];

  const activityData = [
    { hour: "00:00", posts: 45, trades: 23, sales: 12 },
    { hour: "04:00", posts: 32, trades: 15, sales: 8 },
    { hour: "08:00", posts: 78, trades: 45, sales: 23 },
    { hour: "12:00", posts: 120, trades: 67, sales: 34 },
    { hour: "16:00", posts: 95, trades: 52, sales: 28 },
    { hour: "20:00", posts: 85, trades: 38, sales: 19 },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Platform Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive insights and performance metrics
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="bg-blue-500/10 p-3 rounded-full mb-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold">24.5K</CardTitle>
            <CardDescription>Total Users</CardDescription>
            <div className="text-sm text-green-600 mt-1">+12% this month</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="bg-green-500/10 p-3 rounded-full mb-4">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">$458K</CardTitle>
            <CardDescription>Monthly Revenue</CardDescription>
            <div className="text-sm text-green-600 mt-1">+18% this month</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="bg-orange-500/10 p-3 rounded-full mb-4">
              <Activity className="h-6 w-6 text-orange-600" />
            </div>
            <CardTitle className="text-2xl font-bold">18.2K</CardTitle>
            <CardDescription>Daily Active Users</CardDescription>
            <div className="text-sm text-green-600 mt-1">+8% this week</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="bg-purple-500/10 p-3 rounded-full mb-4">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <CardTitle className="text-2xl font-bold">94.2%</CardTitle>
            <CardDescription>User Retention</CardDescription>
            <div className="text-sm text-green-600 mt-1">+2% this month</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Analytics</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>
                  Total and active users over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={userGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="users"
                        stackId="1"
                        stroke="#8884d8"
                        fill="#8884d8"
                        name="Total Users"
                      />
                      <Area
                        type="monotone"
                        dataKey="active"
                        stackId="2"
                        stroke="#82ca9d"
                        fill="#82ca9d"
                        name="Active Users"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Usage Distribution</CardTitle>
                <CardDescription>
                  How users engage with different features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={platformUsageData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {platformUsageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Engagement Metrics</CardTitle>
              <CardDescription>
                Detailed user behavior and engagement patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#8884d8"
                      strokeWidth={2}
                      name="Total Users"
                    />
                    <Line
                      type="monotone"
                      dataKey="active"
                      stroke="#82ca9d"
                      strokeWidth={2}
                      name="Active Users"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Platform</CardTitle>
              <CardDescription>
                Monthly revenue breakdown across all features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="marketplace"
                      stackId="a"
                      fill="#8884d8"
                      name="Marketplace"
                    />
                    <Bar
                      dataKey="crypto"
                      stackId="a"
                      fill="#82ca9d"
                      name="Crypto Trading"
                    />
                    <Bar
                      dataKey="freelance"
                      stackId="a"
                      fill="#ffc658"
                      name="Freelance"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Activity by Hour</CardTitle>
              <CardDescription>
                24-hour activity patterns across the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="posts"
                      stroke="#8884d8"
                      strokeWidth={2}
                      name="Posts"
                    />
                    <Line
                      type="monotone"
                      dataKey="trades"
                      stroke="#82ca9d"
                      strokeWidth={2}
                      name="Trades"
                    />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="#ffc658"
                      strokeWidth={2}
                      name="Sales"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAnalytics;
