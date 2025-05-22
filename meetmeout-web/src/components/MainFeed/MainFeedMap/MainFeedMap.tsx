// MainFeedMap.tsx
import { useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useRef } from "react";
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
  const routeLayers = useRef<L.LayerGroup[]>([]);

    useEffect(() => {
      routeLayers.current.forEach((layer) => {
      map.removeLayer(layer);
    });
    routeLayers.current = [];

    if (!map || !coords.lat || !coords.lng) return;

    const hasFlyTo = sessionStorage.getItem("flyTo");
    if (!hasFlyTo) {
      map.setView([coords.lat, coords.lng], 13);
    }

    const loadEvents = async () => {
      for (const event of events) {
        if (!event.latitude || !event.longitude) continue;

        const { icon } = getCategoryIconLabel(event.category);

        const marker = L.marker([event.latitude, event.longitude], {
          icon: L.divIcon({
            html: `
              <div class="${styles.markerImageWrapper}">
                <span>${icon}</span>
                <img src="${event.imageUrl}" />
              </div>
            `,
            className: "",
          }),
        }).addTo(map);

        marker.bindTooltip(`${event.title} | ${event.addressName}`, {
          direction: 'top',
          offset: [20, -20],
          className: styles.markerToolTip
        });

        marker.on("click", () => {
          navigate(`/event/${event.id}`);
        });

        const layerGroup = L.layerGroup().addTo(map);

        layerGroup.addLayer(marker);

        if (
          event.endLatitude !== event.latitude &&
          event.endLongitude !== event.longitude
        ) {
          try {
            const orsType = ORS_ROUTE_MAP[event.routeType as keyof typeof ORS_ROUTE_MAP];
            const response = await axios.post(
              `https://api.openrouteservice.org/v2/directions/${orsType}/geojson`,
              {
                coordinates: [
                  [event.longitude, event.latitude],
                  [event.endLongitude, event.endLatitude],
                ],
              },
              {
                headers: {
                  Authorization: "5b3ce3597851110001cf6248925c3fd514f949f398497969fac4a052",
                  "Content-Type": "application/json",
                },
              }
            );

            const routeLayer = L.geoJSON(response.data, {
              style: {
                color: "blue",
                weight: 3,
              },
            }).addTo(map);

            if (routeLayers.current.length === 0) {
              map.fitBounds(routeLayer.getBounds());
            }

            layerGroup.addLayer(routeLayer);

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

            endMarker.bindTooltip(`Finish | ${event.title}`, {
              direction: 'top',
              offset: [20, -20],
              className: styles.markerToolTip
            });

            layerGroup.addLayer(endMarker);
          } catch (err) {
            console.error("Route fetch failed:", err);
          }
        }

        routeLayers.current.push(layerGroup);
      }

      const userMarker = L.marker([coords.lat, coords.lng], {
        icon: L.divIcon({
          html: `
            <div class="${styles.userMarker}">
              <img src="${currentUser?.profilePictureUrl}" />
            </div>
          `,
          className: "",
        }),
      }).addTo(map);

      userMarker.bindTooltip("You", {
        direction: 'top',
        offset: [20, -20],
        className: styles.userToolTip
      });

      userMarker.on("click", () => {
        navigate(`/user-profile/${currentUser?.username}`);
      });

    };

    loadEvents();
  }, [events, coords.lat, coords.lng, map, navigate]);

    return null;
  };

export default MainFeedMap;
