// MainFeedMap.tsx
import { useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Event } from "../../../types/Event";
import { useUserContext } from "../../../context/UserContext";
import styles from "./MainFeedMap.module.css"
import axios from "axios";
import { ORS_ROUTE_MAP } from "../../../types/RouteType";
import { getCategoryIconLabel } from "../../../mapper/CategoryMap";

interface MainFeedMapProps {
  events: Event[];
  coords: { lat: number; lng: number };
}

const MainFeedMap = ({ events, coords }: MainFeedMapProps) => {
  const map = useMap();
  const navigate = useNavigate();
  const {currentUser} = useUserContext();

  useEffect(() => {
    
    if (!map || !coords.lat || !coords.lng) return;


    const hasFlyTo = sessionStorage.getItem("flyTo");

    if(!hasFlyTo) {
      map.setView([coords.lat, coords.lng], 13);
    }

    events.forEach(async (event) => {
      if (!event.latitude || !event.longitude) return;

      const {label, icon, color} = getCategoryIconLabel(event.category);

      const marker = L.marker([event.latitude, event.longitude], {
        icon: L.divIcon({
          html: `
            <div class="${styles.markerImageWrapper}">
            <span> ${icon} </span>
            <img src="${event.imageUrl}" />
            </div>
          `,
          className: "",
        }),
      }).addTo(map);

      try {

        const orsType = ORS_ROUTE_MAP[event.routeType as keyof typeof ORS_ROUTE_MAP];
        
        const response =  axios({
          method: "post",
          url: `https://api.openrouteservice.org/v2/directions/${orsType}/geojson`,
          headers: {
            Authorization: "5b3ce3597851110001cf6248925c3fd514f949f398497969fac4a052",
            "Content-Type": "application/json"
          },
          data: {
          coordinates: [
                  [event.longitude, event.latitude],   
                  [event.endLongitude, event.endLatitude]   
                ]
          }
        });

        const routeGeoJson = (await response).data;
        
                const layer = L.geoJSON(routeGeoJson, {
                  style: {
                    color: "blue",
                    weight: 3
                  }
                }).addTo(map);

        map.fitBounds(layer.getBounds());

    } catch (err) {
        console.error("Route fetch failed:", err);
      }

      if(event.endLatitude !== event.latitude && event.endLongitude !== event.longitude) {
      
      const endMarker = L.marker([event.endLatitude, event.endLongitude], {
        icon: L.divIcon({
          html: `
            <div class="${styles.markerImageWrapper}">
            <img src="/finish-flag.svg" />
            </div>
          `,
          className: "",
        }), 
      }).addTo(map);

      endMarker.bindTooltip("Finish" + " | " + event.title, {
        direction: 'top',
        offset: [20,-20],
        className: styles.markerToolTip
      })
      }
      
      
      marker.bindTooltip(event.title + " | " + event.addressName, {
        direction: 'top',
        offset: [20,-20],
        className: styles.markerToolTip
      })

      

      marker.on("click", () => {
        navigate(`/event/${event.id}`);
      });
    });

    const markerUser = L.marker([coords.lat, coords.lng], 
        {
            icon: L.divIcon({
                html: `
                            <div class="${styles.userMarker}">
                            <img src="${currentUser?.profilePictureUrl}" />
                            </div>
                `,
                className: "",

            })}
    ).addTo(map)


    markerUser.bindTooltip("You", {
      direction: 'top',
      offset: [20,-20],
      className: styles.userToolTip
    })

    markerUser.on("click", () => {
        navigate(`/user-profile/${currentUser?.username}`)
    })

    return () => {
      map.eachLayer((layer) => {
        if ((layer as any)._icon) {
          map.removeLayer(layer);
        }
      });
    };
  }, [events, coords, map, navigate]);

  return null;
};

export default MainFeedMap;
