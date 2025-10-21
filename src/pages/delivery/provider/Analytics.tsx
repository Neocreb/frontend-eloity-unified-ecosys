import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useOutletContext } from 'react-router-dom';
import { Timer, Target, Activity, Users } from 'lucide-react';

export default function Analytics(){
  const { stats } = useOutletContext() as any;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><Timer className="h-8 w-8 mx-auto mb-2 text-blue-600"/><p className="text-2xl font-bold">{stats.averageDeliveryTime} min</p><p className="text-sm text-gray-600">Avg Delivery Time</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Target className="h-8 w-8 mx-auto mb-2 text-green-600"/><p className="text-2xl font-bold">{stats.onTimeRate}%</p><p className="text-sm text-gray-600">On-Time Rate</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Activity className="h-8 w-8 mx-auto mb-2 text-purple-600"/><p className="text-2xl font-bold">{stats.completionRate}%</p><p className="text-sm text-gray-600">Completion Rate</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Users className="h-8 w-8 mx-auto mb-2 text-orange-600"/><p className="text-2xl font-bold">{stats.customerSatisfaction}</p><p className="text-sm text-gray-600">Customer Score</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Performance Insights</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">Your on-time delivery rate is above 90%.</div>
            <div className="p-4 bg-blue-50 rounded-lg">Customers consistently rate your service highly.</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
