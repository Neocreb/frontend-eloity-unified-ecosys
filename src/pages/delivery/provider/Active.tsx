import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useOutletContext } from 'react-router-dom';
import { MapPin, Package, Navigation } from 'lucide-react';

export default function Active() {
  const { assignments } = useOutletContext() as any;

  const formatCurrency = (amount:number) => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(amount);

  return (
    <div className="space-y-4">
      {assignments.filter((a:any)=>["accepted","picked_up","in_transit"].includes(a.status)).map((assignment:any)=> (
        <Card key={assignment.id} className="cursor-pointer hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 p-2 rounded">
                  <Package className="h-5 w-5 text-gray-700" />
                </div>
                <div>
                  <p className="font-medium">#{assignment.orderNumber}</p>
                  <p className="text-sm text-gray-500">{assignment.deliveryAddress.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">{formatCurrency(assignment.deliveryFee)}</p>
                <p className="text-xs text-gray-500">Delivery fee</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-red-500 mt-1" />
                  <div>
                    <p className="font-medium text-sm">Pickup</p>
                    <p className="text-sm text-gray-600">{assignment.pickupAddress.name}</p>
                    <p className="text-xs text-gray-500">{assignment.pickupAddress.address}</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-green-500 mt-1" />
                  <div>
                    <p className="font-medium text-sm">Delivery</p>
                    <p className="text-sm text-gray-600">{assignment.deliveryAddress.name}</p>
                    <p className="text-xs text-gray-500">{assignment.deliveryAddress.address}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1"><Package className="h-4 w-4" />{assignment.packageDetails.weight}kg</span>
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />ETA</span>
              </div>
              <button className="btn" onClick={(e)=>{e.stopPropagation(); alert('Open navigation');}}>
                <Navigation className="h-4 w-4 mr-2"/>Navigate
              </button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
