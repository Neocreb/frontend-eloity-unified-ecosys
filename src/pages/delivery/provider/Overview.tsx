import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Truck, Timer, Eye } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

export default function Overview() {
  const { stats, assignments } = useOutletContext() as any;

  const formatCurrency = (amount:number) => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(amount);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Deliveries</p>
                <p className="text-2xl font-bold">{stats.completedToday}</p>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Orders</p>
                <p className="text-2xl font-bold">{stats.activeAssignments}</p>
              </div>
              <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Truck className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Delivery Time</p>
                <p className="text-2xl font-bold">{stats.averageDeliveryTime}m</p>
              </div>
              <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Timer className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">Active Deliveries <Badge variant="secondary">{stats.activeAssignments} active</Badge></CardTitle>
        </CardHeader>
        <CardContent>
          {assignments.filter((a:any)=>["accepted","picked_up","in_transit"].includes(a.status)).slice(0,3).map((assignment:any)=> (
            <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-3">
              <div className="flex items-center gap-3">
                <Badge>{assignment.status.replace('_',' ')}</Badge>
                <div>
                  <p className="font-medium">#{assignment.orderNumber}</p>
                  <p className="text-sm text-gray-500">{assignment.deliveryAddress.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">{formatCurrency(assignment.deliveryFee)}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
