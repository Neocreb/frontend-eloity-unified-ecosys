import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapComponentProps {
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    position: [number, number];
    popupText?: string;
  }>;
  onLocationSelect?: (position: [number, number]) => void;
  height?: string;
}

const MapComponent: React.FC<MapComponentProps> = ({
  center = [51.505, -0.09],
  zoom = 13,
  markers = [],
  onLocationSelect,
  height = '400px'
}) => {
  // Custom hook to handle map click events
  const MapClickHandler: React.FC = () => {
    const map = useMap();
    
    useEffect(() => {
      if (onLocationSelect) {
        const handleClick = (e: L.LeafletMouseEvent) => {
          onLocationSelect([e.latlng.lat, e.latlng.lng]);
        };
        
        map.on('click', handleClick);
        
        return () => {
          map.off('click', handleClick);
        };
      }
    }, [map, onLocationSelect]);
    
    return null;
  };

  return (
    <div style={{ height, width: '100%' }}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {markers.map((marker, index) => (
          <Marker key={index} position={marker.position}>
            {marker.popupText && <Popup>{marker.popupText}</Popup>}
          </Marker>
        ))}
        
        <MapClickHandler />
      </MapContainer>
    </div>
  );
};

export default MapComponent;