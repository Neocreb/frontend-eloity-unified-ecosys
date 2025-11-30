import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search, Navigation, Map } from 'lucide-react';
import MapComponent from './MapComponent';

interface Location {
  name: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface LocationPickerProps {
  onLocationSelect: (location: Location) => void;
  onCancel: () => void;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ onLocationSelect, onCancel }) => {
  const [view, setView] = useState<'search' | 'map'>('search');
  const [locationSearch, setLocationSearch] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);

  const handleMapLocationSelect = (position: [number, number]) => {
    setSelectedPosition(position);
    // In a real app, you would reverse geocode the position to get address details
    const location: Location = {
      name: `Lat: ${position[0].toFixed(4)}, Lng: ${position[1].toFixed(4)}`,
      coordinates: {
        lat: position[0],
        lng: position[1]
      }
    };
    onLocationSelect(location);
  };

  const handleSearchLocation = () => {
    if (locationSearch.trim()) {
      // In a real app, you would geocode the search term to get coordinates
      // For now, we'll just use a default location
      const location: Location = {
        name: locationSearch,
        coordinates: {
          lat: 51.5074,
          lng: -0.1278
        }
      };
      onLocationSelect(location);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex rounded-lg border">
        <Button
          variant={view === 'search' ? 'default' : 'ghost'}
          className="flex-1 rounded-r-none rounded-l-lg h-10"
          onClick={() => setView('search')}
        >
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
        <Button
          variant={view === 'map' ? 'default' : 'ghost'}
          className="flex-1 rounded-l-none rounded-r-lg h-10"
          onClick={() => setView('map')}
        >
          <Map className="h-4 w-4 mr-2" />
          Map
        </Button>
      </div>

      {view === 'search' ? (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search for a place..."
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
              className="pl-10"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearchLocation();
                }
              }}
            />
          </div>
          
          <Button
            variant="outline"
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    const location: Location = {
                      name: "Current Location",
                      coordinates: {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                      }
                    };
                    onLocationSelect(location);
                  },
                  (error) => {
                    console.error("Error getting location:", error);
                  }
                );
              }
            }}
            className="w-full flex items-center gap-2"
          >
            <Navigation className="h-4 w-4" />
            <span>Use current location</span>
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSearchLocation}
              disabled={!locationSearch.trim()}
              className="flex-1"
            >
              Select
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="h-80">
            <MapComponent
              center={[51.505, -0.09]}
              zoom={13}
              onLocationSelect={handleMapLocationSelect}
              height="100%"
            />
          </div>
          <p className="text-sm text-gray-500 text-center">
            Tap on the map to select a location
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            {selectedPosition && (
              <Button 
                onClick={() => {
                  if (selectedPosition) {
                    handleMapLocationSelect(selectedPosition);
                  }
                }}
                className="flex-1"
              >
                Confirm Location
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;