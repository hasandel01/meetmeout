import { useMap } from "react-leaflet";
import { useEffect, useRef } from "react";
import axios from "axios";
import L from "leaflet";
import { ORS_ROUTE_MAP, RouteType } from "../types/RouteType";

interface RouteProps {
  start: [number, number];
  end: [number, number];
  routeType: RouteType;
  isThereRoute: boolean;
  setRouteJson: (routeJson: string) => void;
}

const RouteDrawer: React.FC<RouteProps> = ({ setRouteJson, start, end, routeType, isThereRoute }) => {
  const map = useMap();
  const routeLayerRef = useRef<L.GeoJSON | null>(null)

  const orsType = ORS_ROUTE_MAP[routeType];

  useEffect(() => {
    const getRoute = async () => {

      if(!isThereRoute && routeLayerRef.current) {
        map.removeLayer(routeLayerRef.current);
        routeLayerRef.current = null;
        return null;
      }

      if(routeLayerRef.current) {
        map.removeLayer(routeLayerRef.current);
        routeLayerRef.current = null;
      }


      if (end[0] === 0 && end[1] === 0) {
        return;
      }

      try {
        const response = await axios({
          method: "post",
          url: `https://api.openrouteservice.org/v2/directions/${orsType}/geojson`,
          headers: {
            Authorization: "5b3ce3597851110001cf6248925c3fd514f949f398497969fac4a052",
            "Content-Type": "application/json"
          },
          data: {
            coordinates: [
              [start[1], start[0]], 
              [end[1], end[0]]
            ]
          }
        });

        const routeGeoJson = response.data;
        setRouteJson(routeGeoJson);
        
        const layer = L.geoJSON(routeGeoJson, {
          style: {
            color: "blue",
            weight: 4
          }
        }).addTo(map);

        routeLayerRef.current = layer;

        map.fitBounds(layer.getBounds());

      } catch (err) {
        console.error("Route fetch failed:", err);
      }
    };

      getRoute();

  }, [start, end, map, routeType, isThereRoute]);

  return null;
};

export default RouteDrawer;
