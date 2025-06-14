import React from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Event } from "../../../../../types/Event";
import  "./EventRoute.module.css";

interface EventRouteProps {
  event: Event;
}

const EventRoute: React.FC<EventRouteProps> = ({ event }) => {
  const routeCoords: [number, number][] = [];

  try {
        if (event.routeJson) {
        const routeData = JSON.parse(event.routeJson);
        const coords = routeData.features[0].geometry.coordinates;
        for (let coord of coords) {
            routeCoords.push([coord[1], coord[0]]);
        }
        }
    } catch (err) {
        console.error("Invalid route JSON", err);
    }

    if (routeCoords.length === 0) {
        return (
    <div style={{
        padding: "1.5rem",
        border: "2px dashed #e74c3c",
        backgroundColor: "#ffe6e6",
        color: "#c0392b",
        textAlign: "center",
        borderRadius: "10px",
        fontWeight: "bold",
        fontSize: "1rem",
        marginTop: "1rem"
    }}>
        ⚠️ No route defined for this event.
    </div>
);
    }

    const startCoord = routeCoords[0];
    const endCoord = routeCoords[routeCoords.length - 1];
    const midpointIndex = Math.floor(routeCoords.length / 2);
    const centerCoord =  routeCoords[midpointIndex];

    const startIcon = new L.Icon({
        iconUrl: "/start-flag.png",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
        className: "custom-marker start-marker"
    });

        const endIcon = new L.Icon({
        iconUrl: "/end-flag.png",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
        className: "custom-marker end-marker"
    });

  return (
    <MapContainer
      center={centerCoord}
      zoom={13}
      scrollWheelZoom={false}
      style={{ height: "400px", width: "400px", borderRadius: "10px", border: "2px solid #2C7DA0" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={startCoord} icon={startIcon}>
        <Popup>Start Point</Popup>
      </Marker>
      <Marker position={endCoord} icon={endIcon}>
        <Popup>End Point</Popup>
      </Marker>
      <Polyline positions={routeCoords} />
    </MapContainer>
  );
};

export default EventRoute;
