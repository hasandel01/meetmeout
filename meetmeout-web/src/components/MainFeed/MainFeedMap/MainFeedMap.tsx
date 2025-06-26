import { useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Event } from "../../../types/Event";
import { useUserContext } from "../../../context/UserContext";
import styles from "./MainFeedMap.module.css"
import { getCategoryIconLabel } from "../../../mapper/CategoryMap";
import { useLocationContext } from "../../../context/LocationContex";

interface MainFeedMapProps {
  events: Event[];
}

const MainFeedMap = ({ events }: MainFeedMapProps) => {
  const map = useMap();
  const navigate = useNavigate();
  const { currentUser } = useUserContext();
  const routeLayers = useRef<L.LayerGroup[]>([]);

  const {userLatitude, userLongitude} = useLocationContext();

  useEffect(() => {
    
    routeLayers.current.forEach((layer) => {
      map.removeLayer(layer);
    });
    routeLayers.current = [];

    if (!map) return;

    const hasFlyTo = sessionStorage.getItem("flyTo");

    if(userLatitude && userLongitude) {
      if (!hasFlyTo) {
        map.setView([userLatitude, userLongitude], 13);
        sessionStorage.removeItem("flyTo");
      }
    }

    const allMarkerEls: HTMLDivElement[] = [];

    const loadEvents = async () => {
      for (const event of events) {
        if (!event.latitude || !event.longitude) continue;

        const { icon } = getCategoryIconLabel(event.category);

        const markerHTML = document.createElement("div");
        markerHTML.className = styles.markerImageWrapper;
        markerHTML.innerHTML = `
          <div class="${styles.markerInnerWrapper} ${styles.dimmedMarker}">
            <img src="${event.imageUrl}" />
          </div>
          <div class="${styles.markerIcons}">
            <span>${icon}</span>
            ${event.isPrivate ? '<p>🔒</p>' : ''}
          </div>
        `;

        allMarkerEls.push(markerHTML);

        const focusMarker = (el: HTMLDivElement) => {
          allMarkerEls.forEach((mEl) => {
            mEl.classList.add(styles.dimmedMarker);
            mEl.classList.remove(styles.focusedMarker);
          });
          el.classList.remove(styles.dimmedMarker);
          el.classList.add(styles.focusedMarker);
        };

        markerHTML.addEventListener("mouseenter", () => {
          focusMarker(markerHTML);
        });

        markerHTML.addEventListener("click", () => {
          allMarkerEls.forEach(el => {
            el.classList.add(styles.dimmedMarker);
            el.classList.remove(styles.focusedMarker);
            el.dataset.focused = "false";
          });

          markerHTML.classList.remove(styles.dimmedMarker);
          markerHTML.classList.add(styles.focusedMarker);
          markerHTML.setAttribute("data-event-id", event.id.toString());

          const alreadyFocused = markerHTML.dataset.focused === "true";
          markerHTML.dataset.focused = "true";

          if (alreadyFocused) {
            const canAccess = !event.isPrivate || (event.isPrivate && event.attendees.some(a => a.username === currentUser?.username));
            if (canAccess) {
              navigate(`/event/${event.id}`);
            }
          }
        });


        const marker = L.marker([event.latitude, event.longitude], {
          icon: L.divIcon({ html: markerHTML.outerHTML, className: "" }),
        }).addTo(map);

        marker.on("click", () => {
          
            setTimeout(() => {

                const icon = marker.getElement() as HTMLElement;
                if (!icon) return;

                const alreadyFocused = icon?.dataset.focused === "true";

                document.querySelectorAll(".leaflet-marker-icon").forEach(el => {
                  el.classList.remove(styles.focusedMarker);
                  el.classList.add(styles.dimmedMarker);
                  (el as HTMLElement).dataset.focused = "false";
                });

                focusMarker(icon as HTMLDivElement);

                icon.classList.remove(styles.dimmedMarker);
                icon.classList.add(styles.focusedMarker);
                icon.dataset.focused = "true";
                
                if (alreadyFocused) {
                  const canAccess = !event.isPrivate || (event.isPrivate && event.attendees.some(a => a.username === currentUser?.username));
                  if (canAccess) {
                    navigate(`/event/${event.id}`);
                  }
                }
            }, 0);

        });

        const emoji =
        event.routeType === "cycling-regular" ? "🚲" :
        event.routeType === "foot-walking" ? "🚶‍♂️" :
        event.routeType === "foot-hiking" ? "🥾" : "🚗";


        const feeText = event.isFeeRequired ? `${event.fee}$` : "Free";
        const date = new Date(event.startDate).toLocaleDateString("en-GB");

        const tooltipHtml = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          font-family: Arial, sans-serif;
          padding: 6px 8px;
          border-radius: 8px;
          background-color: white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          max-width: 200px;
        ">
          <div style="font-size: 24px;">${event.isThereRoute ? emoji : ""}</div>
          <div style="
              font-weight: bold;
              font-size: 16px;
              margin-top: 4px;
              text-align: center;
              word-break: break-word;
              white-space: normal;
            ">
              ${event.title}
            </div>
          <div style="font-size: 13px; color: #555; margin-top: 2px;">${date} | ${feeText}</div>
          <div style="font-size: 13px; color: #555;">👥 ${event.attendees.length} attendee${event.attendees.length !== 1 ? "s" : ""}</div>
        </div>
      `;


        marker.bindTooltip(tooltipHtml, {
          direction: "top",
          offset: [0, -10],
          permanent: false,
          opacity: 0.95,
          className: "custom-tooltip",
          sticky: true,
        });

        const layerGroup = L.layerGroup().addTo(map);
        layerGroup.addLayer(marker);

        if (event.endLatitude !== event.latitude && event.endLongitude !== event.longitude) {
          try {

            const routeLayer = L.geoJSON(JSON.parse(event.routeJson), {
              style: {
                color: "blue",
                weight: 3,
                opacity: 0.3,
              },
            });

            marker.on("mouseover", () => {
              routeLayer.setStyle({ opacity: 1 });
            });

            marker.on("mouseout", () => {
              routeLayer.setStyle({ opacity: 0.3 });
            });

            if (routeLayers.current.length === 0 && !hasFlyTo) {
              map.fitBounds(routeLayer.getBounds());
            }

            layerGroup.addLayer(routeLayer);

            const endMarkerDiv = document.createElement("div");
            endMarkerDiv.setAttribute("data-finish", event.id.toString());
            endMarkerDiv.className = styles.finishMarker;
            endMarkerDiv.innerHTML = `<img src="/end-flag.png" />`;

            const endMarker = L.marker([event.endLatitude, event.endLongitude], {
              icon: L.divIcon({ html: endMarkerDiv.outerHTML, className: "" , iconAnchor: [24,12]} ),
            }).addTo(map);

            endMarker.bindTooltip(`Finish | ${event.title}`, {
              direction: "top",
              offset: [20, -20],
              className: styles.markerToolTip,
            });

            endMarkerDiv.addEventListener("mouseenter", () => {
              endMarkerDiv.classList.add(styles.finishMarkerAnimated);
            });

            endMarkerDiv.addEventListener("mouseleave", () => {
              endMarkerDiv.classList.remove(styles.finishMarkerAnimated);
            });

            endMarkerDiv.addEventListener("click", () => {
              endMarkerDiv.classList.add(styles.finishMarkerAnimated);
              setTimeout(() => {
                endMarkerDiv.classList.remove(styles.finishMarkerAnimated);
              }, 4000);
            });

            layerGroup.addLayer(endMarker);
          } catch (err) {
            console.error("Route fetch failed:", err);
          }
        }

        routeLayers.current.push(layerGroup);

      marker.on("mouseover", () => {
        const finish = document.querySelector(`[data-finish="${event.id}"]`);
        if (finish) finish.classList.add(styles.finishMarkerVisible);
      });

      marker.on("mouseout", () => {
        const finish = document.querySelector(`[data-finish="${event.id}"]`);
        if (finish) finish.classList.remove(styles.finishMarkerVisible);
      });

      }

      if(userLatitude && userLongitude) {
      const userMarker = L.marker([userLatitude, userLongitude], {
        icon: L.divIcon({
          html: `<div class="${styles.userMarker}"><img src="${currentUser?.profilePictureUrl}" /></div>`,
          className: "",
        }),
      }).addTo(map);
      

      userMarker.bindTooltip("You", {
        direction: "top",
        offset: [20, -20],
        className: styles.userToolTip,
      });

      userMarker.on("click", () => {
        navigate(`/user-profile/${currentUser?.username}`);
      });
    };
  }

    loadEvents();
  }, [events, userLatitude, userLongitude, map, navigate]);
   

  return null;
};

export default MainFeedMap;
