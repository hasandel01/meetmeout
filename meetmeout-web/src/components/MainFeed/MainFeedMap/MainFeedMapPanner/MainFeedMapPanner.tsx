import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

const MapPanner = ({ coords }: { coords?: { lat: number, lng: number } }) => {
  const map = useMap();

  useEffect(() => {
    if (coords) {
      map.flyTo([coords.lat, coords.lng], 15, {
      });
    }
  }, [coords]);

  return null;
};

export default MapPanner;
