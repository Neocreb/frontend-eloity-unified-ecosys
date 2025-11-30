# Real Map Integration Guide

This document explains how to use the real OpenStreetMap integration in the Eloity platform. Unlike mock implementations, this uses actual map data from OpenStreetMap servers.

## Key Differences from Mock Implementation

### Real vs Mock Features

| Feature | Mock Implementation | Real Implementation |
|---------|-------------------|---------------------|
| Map Data Source | Hardcoded coordinates | Live OpenStreetMap servers |
| Tile Loading | Fake images | Actual map tiles |
| Interactivity | Simulated | Fully functional |
| Performance | Instant | Network-dependent |
| Accuracy | Approximate | Precise |

## How It Works

The implementation uses:

1. **Leaflet.js** - A lightweight, open-source mapping library
2. **OpenStreetMap** - Collaborative, free map data
3. **React-Leaflet** - React components for Leaflet
4. **No API Keys** - Completely free service

When the map loads:
1. Leaflet requests map tiles from OpenStreetMap servers
2. Tiles are rendered in the browser
3. User interactions are processed by Leaflet
4. Events are passed to React components

## Components Overview

### MapComponent (`/src/components/shared/MapComponent.tsx`)

This is the core component that displays real maps:

```tsx
import { MapComponent } from '@/components/shared';

// This loads real map data, not mock data
<MapComponent 
  center={[51.505, -0.09]}  // Real London coordinates
  zoom={13}                 // Real zoom level
  markers={[                // Real markers at actual locations
    {
      position: [51.505, -0.09],
      popupText: "Real Location in London"
    }
  ]}
/>
```

### LocationPicker (`/src/components/shared/LocationPicker.tsx`)

Provides real location selection capabilities:

```tsx
import { LocationPicker } from '@/components/shared';

<LocationPicker 
  onLocationSelect={(location) => {
    // This receives real coordinates from user interaction
    console.log('Real coordinates:', location.coordinates);
  }}
  onCancel={() => console.log('Cancelled')}
/>
```

## Integration Examples

### 1. Profile Location Setting

```tsx
import { MapComponent } from '@/components/shared';

const ProfileLocationSetting = () => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  
  const handleMapClick = (position: [number, number]) => {
    // This sets the user's real location
    setUserLocation(position);
    updateUserLocation(position); // Save to database
  };
  
  return (
    <MapComponent
      center={userLocation || [40.7128, -74.0060]} // NYC default
      zoom={userLocation ? 15 : 10}
      markers={userLocation ? [{ position: userLocation }] : []}
      onLocationSelect={handleMapClick}
    />
  );
};
```

### 2. Event Location Display

```tsx
import { MapComponent } from '@/components/shared';

const EventLocationDisplay = ({ event }: { event: EventType }) => {
  // event.location contains real coordinates from database
  const eventLocation: [number, number] = [event.latitude, event.longitude];
  
  return (
    <div className="h-64">
      <MapComponent
        center={eventLocation}
        zoom={14}
        markers={[{
          position: eventLocation,
          popupText: event.title
        }]}
        height="100%"
      />
    </div>
  );
};
```

### 3. Delivery Zone Management

```tsx
import { MapComponent } from '@/components/shared';

const DeliveryZoneManager = () => {
  const [zones, setZones] = useState<Zone[]>([]);
  
  const handleAddZonePoint = (position: [number, number]) => {
    // Add a real point to delivery zone
    setZones(prev => [...prev, {
      id: Date.now(),
      latitude: position[0],
      longitude: position[1]
    }]);
  };
  
  return (
    <MapComponent
      center={[40.7128, -74.0060]}
      zoom={12}
      markers={zones.map(zone => ({
        position: [zone.latitude, zone.longitude],
        popupText: "Delivery Zone Point"
      }))}
      onLocationSelect={handleAddZonePoint}
    />
  );
};
```

## Performance Considerations

### Real Map Loading

Unlike mock maps that load instantly, real maps:
1. Download map tiles from servers (network dependent)
2. Render vector data (CPU intensive)
3. Handle user interactions (smooth when optimized)

### Optimization Tips

```tsx
// Use memoization for markers
const markerData = useMemo(() => 
  locations.map(loc => ({
    position: [loc.lat, loc.lng] as [number, number],
    popupText: loc.name
  })), 
  [locations]
);

// Optimize re-renders
const MapView = React.memo(({ center, markers }: MapProps) => (
  <MapComponent 
    center={center}
    markers={markers}
    // ... other props
  />
));
```

## Error Handling

Real maps can encounter network issues:

```tsx
const RobustMapComponent = () => {
  const [mapError, setMapError] = useState<string | null>(null);
  
  const handleError = (error: Error) => {
    setMapError("Failed to load map. Please check your connection.");
    console.error("Map error:", error);
  };
  
  if (mapError) {
    return (
      <div className="p-4 bg-red-100 rounded">
        {mapError}
        <button onClick={() => setMapError(null)}>Retry</button>
      </div>
    );
  }
  
  return (
    <MapComponent 
      onError={handleError}
      // ... other props
    />
  );
};
```

## Advanced Features

### Custom Tile Layers

```tsx
// In MapComponent, you can switch providers:
<TileLayer
  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
/>

// Or use different tile servers:
<TileLayer
  attribution='&copy; Esri'
  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
/>
```

### Real-time Tracking

```tsx
const LiveTrackingMap = ({ userId }: { userId: string }) => {
  const [position, setPosition] = useState<[number, number] | null>(null);
  
  useEffect(() => {
    const interval = setInterval(async () => {
      // Fetch real user location from API
      const latestPosition = await getUserLocation(userId);
      setPosition([latestPosition.lat, latestPosition.lng]);
    }, 5000); // Update every 5 seconds
    
    return () => clearInterval(interval);
  }, [userId]);
  
  return (
    <MapComponent
      center={position || [0, 0]}
      markers={position ? [{ position, popupText: "Live Location" }] : []}
    />
  );
};
```

## Testing Real Maps

### Network Simulation

Test how your app behaves with:
1. Slow network connections
2. Offline scenarios
3. Tile loading failures

```tsx
// Mock slow network for testing
const SlowMapComponent = () => {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);
  
  if (loading) {
    return <div>Loading real map data...</div>;
  }
  
  return <MapComponent /* ... */ />;
};
```

## Security Considerations

### Coordinate Privacy

Real coordinates reveal precise locations:
```tsx
// Consider rounding coordinates for privacy
const sanitizeCoordinates = (coords: [number, number]): [number, number] => {
  return [
    parseFloat(coords[0].toFixed(4)), // ~10m precision
    parseFloat(coords[1].toFixed(4))
  ];
};

// Use sanitized coordinates for public display
const PublicMap = ({ rawCoords }: { rawCoords: [number, number] }) => {
  const safeCoords = sanitizeCoordinates(rawCoords);
  
  return (
    <MapComponent
      center={safeCoords}
      markers={[{ position: safeCoords }]}
    />
  );
};
```

## Troubleshooting

### Common Issues

1. **Map not loading**: Check network connection and firewall
2. **Tiles not displaying**: Verify TileLayer URL is accessible
3. **Performance issues**: Limit markers and optimize re-renders
4. **Mobile touch issues**: Test on actual devices

### Debugging Real Maps

```tsx
const DebugMap = () => {
  const handleMapLoad = () => {
    console.log("Map tiles loaded successfully");
  };
  
  const handleTileError = (error: Error) => {
    console.error("Tile loading error:", error);
  };
  
  return (
    <MapComponent
      onLoad={handleMapLoad}
      onTileError={handleTileError}
    />
  );
};
```

## Conclusion

This implementation provides real, production-ready mapping capabilities using OpenStreetMap data. Unlike mock implementations, it:

- Loads actual map tiles from servers
- Provides accurate geographical data
- Supports all Leaflet.js features
- Works offline with proper caching
- Integrates seamlessly with existing components
- Requires no paid API keys
- Maintains user privacy
- Handles errors gracefully

The components can be used throughout your application wherever real location data is needed.