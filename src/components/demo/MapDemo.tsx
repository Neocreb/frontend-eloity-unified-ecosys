import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MapComponent from '@/components/shared/MapComponent';
import LocationPicker from '@/components/shared/LocationPicker';

interface Location {
  name: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

const MapDemo: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    setShowLocationPicker(false);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Map Component Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            This demo showcases the Leaflet map integration with OpenStreetMap for your Eloity platform.
            The map component can be used in various parts of your application where location features are needed.
          </p>
          
          <div className="h-96 mb-6">
            <MapComponent 
              center={[51.505, -0.09]} 
              zoom={13}
              markers={[
                {
                  position: [51.505, -0.09],
                  popupText: "Default marker"
                }
              ]}
              height="100%"
            />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Features:</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Fully free OpenStreetMap integration (no usage limits)</li>
              <li>Interactive map with zoom and pan controls</li>
              <li>Marker placement with popups</li>
              <li>Click-to-select location functionality</li>
              <li>Responsive design that works on all screen sizes</li>
              <li>TypeScript support with full type definitions</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Location Picker Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={() => setShowLocationPicker(true)}>
              Open Location Picker
            </Button>
            
            {selectedLocation && (
              <div className="p-4 bg-gray-100 rounded-lg">
                <h3 className="font-semibold mb-2">Selected Location:</h3>
                <p>Name: {selectedLocation.name}</p>
                {selectedLocation.coordinates && (
                  <p>
                    Coordinates: {selectedLocation.coordinates.lat.toFixed(4)}, {selectedLocation.coordinates.lng.toFixed(4)}
                  </p>
                )}
              </div>
            )}
            
            {showLocationPicker && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h3 className="text-lg font-semibold mb-4">Select Location</h3>
                  <LocationPicker 
                    onLocationSelect={handleLocationSelect}
                    onCancel={() => setShowLocationPicker(false)}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integration Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">How to use in your components:</h3>
            
            <div className="bg-gray-100 p-4 rounded-lg">
              <pre className="text-sm">
{`import MapComponent from '@/components/shared/MapComponent';

// Basic usage
<MapComponent 
  center={[51.505, -0.09]} 
  zoom={13}
  height="400px"
/>

// With markers
<MapComponent 
  center={[51.505, -0.09]} 
  zoom={13}
  markers={[
    {
      position: [51.505, -0.09],
      popupText: "Hello World!"
    }
  ]}
  onLocationSelect={(position) => {
    console.log('Selected position:', position);
  }}
/>`}
              </pre>
            </div>
            
            <h3 className="text-lg font-semibold">Installation:</h3>
            <p>The required dependencies have been installed:</p>
            <ul className="list-disc pl-5">
              <li><code>leaflet</code> - Core mapping library</li>
              <li><code>react-leaflet</code> - React components for Leaflet</li>
              <li><code>@types/leaflet</code> - TypeScript definitions</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MapDemo;