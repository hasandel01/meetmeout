import { useMap } from "react-leaflet";
import { useEffect } from "react";

interface Props {
  coords: [number, number];
}

const MapPanner: React.FC<Props> = ({ coords }) => {
  const map = useMap();

  useEffect(() => {
    if (map && coords[0] !== 0 && coords[1] !== 0) {
      map.setView(coords, 13, {
        animate: true,
        duration: 0.5
      });
    }
  }, [coords, map]);

  return null;
};

export default MapPanner;
