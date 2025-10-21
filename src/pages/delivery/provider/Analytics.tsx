import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useOutletContext } from 'react-router-dom';
import { Timer, Target, Activity, Users, TrendingUp, Award } from 'lucide-react';

export default function Analytics() {
  const { stats } = useOutletContext() as any;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Analytics & Performance</h2>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-2">Avg Delivery Time</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.averageDeliveryTime} min</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Per delivery</p>
              </div>
              <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Timer className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 dark:text-green-300 font-medium mb-2">On-Time Rate</p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100">{stats.onTimeRate}%</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">Excellent</p>
              </div>
              <div className="h-12 w-12 bg-green-600 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 dark:text-purple-300 font-medium mb-2">Completion Rate</p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{stats.completionRate}%</p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Very reliable</p>
              </div>
              <div className="h-12 w-12 bg-purple-600 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 dark:text-orange-300 font-medium mb-2">Customer Score</p>
                <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">{stats.customerSatisfaction}</p>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Out of 5</p>
              </div>
              <div className="h-12 w-12 bg-orange-600 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 rounded">
            <p className="font-semibold text-green-900 dark:text-green-100 mb-1">Outstanding On-Time Performance</p>
            <p className="text-sm text-green-800 dark:text-green-200">Your on-time delivery rate of {stats.onTimeRate}% is well above the platform average of 85%. Keep up the excellent work!</p>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 rounded">
            <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Strong Customer Satisfaction</p>
            <p className="text-sm text-blue-800 dark:text-blue-200">Customers consistently rate your service highly with an average score of {stats.customerSatisfaction}/5. This builds trust and increases repeat deliveries.</p>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-900/30 border-l-4 border-purple-500 rounded">
            <p className="font-semibold text-purple-900 dark:text-purple-100 mb-1">High Completion Rate</p>
            <p className="text-sm text-purple-800 dark:text-purple-200">Your {stats.completionRate}% completion rate shows excellent reliability. This is critical for customer retention.</p>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5" />
              Total Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="text-gray-700 dark:text-gray-300">Total Deliveries</span>
              <span className="font-bold text-gray-900 dark:text-gray-100">{stats.totalDeliveries}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="text-gray-700 dark:text-gray-300">Active Assignments</span>
              <span className="font-bold text-gray-900 dark:text-gray-100">{stats.activeAssignments}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="text-gray-700 dark:text-gray-300">Average Rating</span>
              <span className="font-bold text-yellow-600 dark:text-yellow-400">{stats.rating}★</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="text-gray-700 dark:text-gray-300">Customer Satisfaction</span>
              <span className="font-bold text-green-600 dark:text-green-400">{stats.customerSatisfaction}/5</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Performance Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">On-Time Rate</span>
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">{stats.onTimeRate}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-green-600 dark:bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(stats.onTimeRate, 100)}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">Completion Rate</span>
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{stats.completionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(stats.completionRate, 100)}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">Customer Rating</span>
                <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">{stats.rating}/5</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-yellow-600 dark:bg-yellow-500 h-2 rounded-full" style={{ width: `${(stats.rating / 5) * 100}%` }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
