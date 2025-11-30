import React from 'react';
import { MapComponent } from '@/components/shared';

const MapTest: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Map Test</h1>
      <div className="h-96">
        <MapComponent 
          center={[51.505, -0.09]} 
          zoom={13}
          markers={[
            {
              position: [51.505, -0.09],
              popupText: "Hello from OpenStreetMap!"
            }
          ]}
          height="100%"
        />
      </div>
    </div>
  );
};

export default MapTest;