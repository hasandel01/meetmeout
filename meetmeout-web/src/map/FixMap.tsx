import { useMap } from 'react-leaflet';
import { useEffect } from 'react';

const FixMap = () => {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize(); // 📌 en kritik kısım
    }, 300);
  }, [map]);

  return null;
};

export default FixMap;
