// MainFeedMap.tsx
import { useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Event } from "../../../types/Event";
import { useUserContext } from "../../../context/UserContext";
import styles from "./MainFeedMap.module.css"

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

    map.setView([coords.lat, coords.lng], 13);

    events.forEach((event) => {
      if (!event.latitude || !event.longitude) return;

      const marker = L.marker([event.latitude, event.longitude], {
        icon: L.divIcon({
          html: `
            <div class="${styles.markerImageWrapper}">
            <img src="${event.imageUrl}" />
            </div>
          `,
          className: "",
        }),
      }).addTo(map);


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
