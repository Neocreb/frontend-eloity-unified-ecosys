import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Truck } from 'lucide-react';

export default function Vehicles(){
  const [vehicles, setVehicles] = useState([{
    id:'v1', type:'motorcycle', make:'Honda', model:'PCX 150', year:2022, licensePlate:'ABC-1234', status:'Active'
  }]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Vehicle Management</h3>
        <button className="btn" onClick={()=> setVehicles(prev=>[...prev,{id: String(Date.now()), type:'bike', make:'New', model:'Model', year:2024, licensePlate:'NEW-000', status:'Pending'}])}>
          <PlusCircle className="h-4 w-4 mr-2"/>Add Vehicle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {vehicles.map(v=> (
          <Card key={v.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5"/> {v.make} {v.model} ({v.year})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-gray-600">License Plate</p><p className="font-medium">{v.licensePlate}</p></div>
                <div><p className="text-gray-600">Status</p><p className="font-medium">{v.status}</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
