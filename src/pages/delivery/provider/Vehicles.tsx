import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Truck, Plus, MapPin, Fuel, Calendar, AlertCircle, CheckCircle2, Settings, Zap } from 'lucide-react';

interface Vehicle {
  id: string;
  type: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  status: 'active' | 'maintenance' | 'inactive';
  capacity: number;
  fuelType: string;
  lastService: string;
  nextService: string;
  mileage: number;
  documents: {
    registration: boolean;
    insurance: boolean;
    inspection: boolean;
  };
}

const mockVehicles: Vehicle[] = [
  {
    id: '1',
    type: 'Van',
    make: 'Ford',
    model: 'Transit',
    year: 2022,
    licensePlate: 'ABC-1234',
    status: 'active',
    capacity: 2500,
    fuelType: 'Diesel',
    lastService: '2024-01-10',
    nextService: '2024-04-10',
    mileage: 45230,
    documents: {
      registration: true,
      insurance: true,
      inspection: true,
    },
  },
  {
    id: '2',
    type: 'Motorcycle',
    make: 'Honda',
    model: 'CB500',
    year: 2023,
    licensePlate: 'XYZ-5678',
    status: 'active',
    capacity: 50,
    fuelType: 'Petrol',
    lastService: '2024-01-15',
    nextService: '2024-05-15',
    mileage: 12450,
    documents: {
      registration: true,
      insurance: true,
      inspection: true,
    },
  },
];

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'maintenance':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
      case 'inactive':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
      default:
        return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case 'maintenance':
        return <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
      default:
        return null;
    }
  };

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
          <h2 className="text-2xl font-bold">My Vehicles</h2>
        </div>
        <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600">
          <Plus className="h-4 w-4" />
          Add Vehicle
        </Button>
      </div>

      {/* Vehicle Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Truck className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{vehicles.length}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total Vehicles</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {vehicles.filter(v => v.status === 'active').length}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Active</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <AlertCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {vehicles.filter(v => v.status === 'maintenance').length}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Maintenance</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Fuel className="h-8 w-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {vehicles.reduce((sum, v) => sum + v.capacity, 0)}kg
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total Capacity</p>
          </CardContent>
        </Card>
      </div>

      {/* Vehicles List */}
      <div className="space-y-4">
        {vehicles.map((vehicle) => (
          <Card key={vehicle.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Vehicle Info */}
                <div className="lg:col-span-2 space-y-3">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Truck className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-lg text-gray-900 dark:text-gray-100">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">{vehicle.licensePlate}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className={`flex items-center gap-1 ${getStatusColor(vehicle.status)}`}>
                      {getStatusIcon(vehicle.status)}
                      <span className="capitalize">{vehicle.status}</span>
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Zap className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      <span>{vehicle.fuelType}</span>
                    </div>
                  </div>
                </div>

                {/* Service Details */}
                <div className="lg:col-span-2 space-y-3">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">Capacity</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{vehicle.capacity} kg</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">Current Mileage</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{vehicle.mileage.toLocaleString()} km</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Last Service
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{new Date(vehicle.lastService).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Documents & Actions */}
                <div className="lg:col-span-1 space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {vehicle.documents.registration ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-xs text-gray-600 dark:text-gray-400">Registration</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {vehicle.documents.insurance ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-xs text-gray-600 dark:text-gray-400">Insurance</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {vehicle.documents.inspection ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-xs text-gray-600 dark:text-gray-400">Inspection</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full flex items-center gap-2 justify-center mt-3"
                  >
                    <Settings className="h-4 w-4" />
                    Manage
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Maintenance Reminder */}
      <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-900 dark:text-yellow-100">
            <AlertCircle className="h-5 w-5" />
            Maintenance Reminders
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {vehicles.map((vehicle) => {
            const nextServiceDate = new Date(vehicle.nextService);
            const daysUntilService = Math.ceil(
              (nextServiceDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            );

            return (
              <div key={vehicle.id} className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Next service in {daysUntilService} days ({nextServiceDate.toLocaleDateString()})
                  </p>
                </div>
                {daysUntilService <= 7 && (
                  <Badge variant="destructive">Urgent</Badge>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Tips Section */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Maintenance Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border-l-4 border-blue-500">
            <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Regular Inspections</p>
            <p className="text-sm text-blue-800 dark:text-blue-200">Schedule regular vehicle inspections to ensure safety and compliance with regulations.</p>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border-l-4 border-green-500">
            <p className="font-semibold text-green-900 dark:text-green-100 mb-1">Keep Documents Updated</p>
            <p className="text-sm text-green-800 dark:text-green-200">Ensure registration, insurance, and inspection documents are always current and valid.</p>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg border-l-4 border-purple-500">
            <p className="font-semibold text-purple-900 dark:text-purple-100 mb-1">Monitor Fuel Efficiency</p>
            <p className="text-sm text-purple-800 dark:text-purple-200">Track fuel consumption to identify potential maintenance issues early.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
