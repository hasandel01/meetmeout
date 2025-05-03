import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useState } from 'react';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

interface Props {
  setCoordinates: (coords: { latitude: number; longitude: number }) => void;
  setAddress: (address: string) => void;
}

const EventLocationSelector: React.FC<Props> = ({ setCoordinates, setAddress }) => {
  
  const [position, setPosition] = useState<[number, number]>([41.015, 28.97]);

  
  const getAddressFromCoords = async (latitude: number, longitude: number) => {
    try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
        setAddress(response.data.display_name);
    }
    catch (error) {
        console.error("Error fetching address:", error);
        return null;
    }
}


  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        setCoordinates({ latitude: lat, longitude: lng });
        getAddressFromCoords(lat, lng);

      },
    });

    return <Marker position={position} />;
  };

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          attribution='&copy; OpenStreetMap contributors'
        />
        <LocationMarker />
      </MapContainer>
    </div>
  );
};

export default EventLocationSelector;
