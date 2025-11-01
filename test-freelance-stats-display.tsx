import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Briefcase, CheckCircle2, Star } from "lucide-react";

const TestFreelanceStatsDisplay: React.FC = () => {
  const [stats, setStats] = useState({
    totalProjects: 42,
    completedProjects: 38,
    totalEarnings: 21500.00,
    averageRating: 4.8,
    responseTime: 1,
    successRate: 92,
    repeatClients: 15
  });

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    change?: string;
    changeType?: "increase" | "decrease";
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, change, changeType = "increase", icon, color }) => (
    <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{value}</p>
            {change && (
              <div className="flex items-center text-sm">
                {changeType === "increase" ? (
                  <span className="text-green-600 dark:text-green-400">▲</span>
                ) : (
                  <span className="text-red-600 dark:text-red-400">▼</span>
                )}
                <span className={changeType === "increase" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                  {change}
                </span>
              </div>
            )}
          </div>
          <div className={`p-4 rounded-xl ${color} shadow-sm`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Test Freelance Stats Display</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Earnings"
          value={`$${stats.totalEarnings.toLocaleString()}`}
          change="+12% this month"
          icon={<DollarSign className="w-6 h-6 text-white" />}
          color="bg-gradient-to-br from-green-500 to-emerald-600"
        />
        <StatCard
          title="Active Projects"
          value={stats.totalProjects - stats.completedProjects}
          icon={<Briefcase className="w-6 h-6 text-white" />}
          color="bg-gradient-to-br from-blue-500 to-cyan-600"
        />
        <StatCard
          title="Completed Projects"
          value={stats.completedProjects}
          icon={<CheckCircle2 className="w-6 h-6 text-white" />}
          color="bg-gradient-to-br from-purple-500 to-violet-600"
        />
        <StatCard
          title="Success Rate"
          value={`${stats.successRate}%`}
          icon={<Star className="w-6 h-6 text-white" />}
          color="bg-gradient-to-br from-orange-500 to-amber-600"
        />
      </div>
    </div>
  );
};

export default TestFreelanceStatsDisplay;