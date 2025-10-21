import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useOutletContext } from 'react-router-dom';
import { MapPin, Package, Navigation, Clock } from 'lucide-react';

export default function Active() {
  const { assignments } = useOutletContext() as any;
  const navigate = useNavigate();

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const handleBack = () => {
    navigate('/app/delivery/provider/dashboard');
  };

  const activeDeliveries = assignments.filter((a: any) => ["accepted", "picked_up", "in_transit"].includes(a.status));

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h2 className="text-2xl font-bold">Active Deliveries</h2>
        </div>
        <span className="text-sm font-medium px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
          {activeDeliveries.length} Active
        </span>
      </div>

      {activeDeliveries.length > 0 ? (
        <div className="space-y-4">
          {activeDeliveries.map((assignment: any) => (
            <Card key={assignment.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer">
              <CardContent className="p-6">
                {/* Header with Order Info and Fee */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                      <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">Order #{assignment.orderNumber}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{assignment.deliveryAddress.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(assignment.deliveryFee)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Delivery fee</p>
                  </div>
                </div>

                {/* Location Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">Pickup Location</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{assignment.pickupAddress.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{assignment.pickupAddress.address}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">{assignment.pickupAddress.phone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">Delivery Location</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{assignment.deliveryAddress.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{assignment.deliveryAddress.address}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">{assignment.deliveryAddress.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Package Details */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6 grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Weight</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{assignment.packageDetails.weight} kg</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Tracking</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{assignment.trackingNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Status</p>
                    <p className="font-semibold text-blue-600 dark:text-blue-400 capitalize">{assignment.status.replace('_', ' ')}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600">
                    <Navigation className="h-4 w-4 mr-2" />
                    Start Navigation
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Clock className="h-4 w-4 mr-2" />
                    Update Status
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No Active Deliveries</p>
            <p className="text-gray-500 dark:text-gray-400">You don't have any active deliveries at the moment.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
