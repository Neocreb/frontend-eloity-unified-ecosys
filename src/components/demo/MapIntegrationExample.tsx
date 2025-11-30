import React, { useState } from 'react';
import { MapComponent } from '@/components/shared';

// Example of how to integrate the map into an existing component
const MapIntegrationExample: React.FC = () => {
  const [location, setLocation] = useState<string>('');
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);

  // This would typically come from your existing data
  const existingLocations = [
    { name: "New York", coords: [40.7128, -74.0060] },
    { name: "London", coords: [51.5074, -0.1278] },
    { name: "Tokyo", coords: [35.6762, 139.6503] },
  ];

  const handleMapClick = (position: [number, number]) => {
    setCoordinates(position);
    setLocation(`Selected: ${position[0].toFixed(4)}, ${position[1].toFixed(4)}`);
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Map Integration Example</h2>
        <p className="mb-4">
          This shows how to integrate the MapComponent into your existing components.
        </p>
        
        {location && (
          <div className="mb-4 p-3 bg-white rounded border">
            <strong>Current Location:</strong> {location}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 h-96 rounded-lg overflow-hidden border">
          <MapComponent
            center={coordinates || [40.7128, -74.0060]}
            zoom={coordinates ? 15 : 10}
            markers={coordinates ? [{ position: coordinates, popupText: location }] : []}
            onLocationSelect={handleMapClick}
            height="100%"
          />
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Quick Locations</h3>
          <div className="space-y-2">
            {existingLocations.map((loc, index) => (
              <button
                key={index}
                className="w-full p-3 text-left border rounded hover:bg-gray-50 transition-colors"
                onClick={() => {
                  setCoordinates([loc.coords[0], loc.coords[1]] as [number, number]);
                  setLocation(loc.name);
                }}
              >
                <div className="font-medium">{loc.name}</div>
                <div className="text-sm text-gray-500">
                  {loc.coords[0]}, {loc.coords[1]}
                </div>
              </button>
            ))}
          </div>
          
          <div className="pt-4">
            <h3 className="text-lg font-semibold mb-2">Integration Points</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Click on map to select location</li>
              <li>Markers show selected positions</li>
              <li>Zoom adjusts automatically</li>
              <li>Fully responsive design</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapIntegrationExample;