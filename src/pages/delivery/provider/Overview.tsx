import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Truck, Timer, Eye, ArrowLeft } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

export default function Overview() {
  const { stats, assignments } = useOutletContext() as any;

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Overview</h2>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Today's Deliveries</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">{stats.completedToday}</p>
              </div>
              <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">Active Orders</p>
                <p className="text-3xl font-bold text-orange-900 dark:text-orange-100 mt-2">{stats.activeAssignments}</p>
              </div>
              <div className="h-12 w-12 bg-orange-600 rounded-lg flex items-center justify-center">
                <Truck className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">Avg Delivery Time</p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-2">{stats.averageDeliveryTime}m</p>
              </div>
              <div className="h-12 w-12 bg-purple-600 rounded-lg flex items-center justify-center">
                <Timer className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Deliveries Section */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Active Deliveries
            </div>
            <Badge variant="secondary" className="text-sm">{stats.activeAssignments} active</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {assignments.filter((a: any) => ["accepted", "picked_up", "in_transit"].includes(a.status)).slice(0, 3).map((assignment: any) => (
            <div key={assignment.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
              <div className="flex items-center gap-4">
                <Badge className="capitalize bg-blue-600">{assignment.status.replace('_', ' ')}</Badge>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">#{assignment.orderNumber}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{assignment.deliveryAddress.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600 dark:text-green-400">{formatCurrency(assignment.deliveryFee)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Delivery fee</p>
              </div>
            </div>
          ))}
          {assignments.filter((a: any) => ["accepted", "picked_up", "in_transit"].includes(a.status)).length === 0 && (
            <div className="text-center py-8">
              <Truck className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No active deliveries at the moment</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">This Week</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(stats.weekEarnings)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">This Month</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(stats.monthEarnings)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Customer Rating</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.rating}★</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">On-Time Rate</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.onTimeRate}%</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
