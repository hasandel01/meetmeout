import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from 'react-leaflet';
import { useCallback, useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import styles from "./EventLocationSelector.module.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import MapPanner from '../MapPanner';
import debounce from "lodash.debounce";
import RouteDrawer from '../RouteDrawer';
import { RouteType } from '../../types/RouteType';
import L from 'leaflet';

interface Props {
  setCoordinates: (coords: { latitude: number; longitude: number }) => void;
  setAddressName: (addressName: string) => void;
  setEndAddressName: (endAddressName: string) => void;
  isThereRoute: boolean;
  setEndCoordinates: (coords: { latitude: number; longitude: number }) => void;
  route: RouteType;
  latitude?: number;
  longitude?: number;
  endLatitude?: number;
  endLongitude?: number;
  setRouteJson: (routeJson: string) => void;
}



const EventLocationSelector: React.FC<Props> = ({ setCoordinates, 
  setAddressName, 
  setEndAddressName, 
  isThereRoute, 
  setEndCoordinates, 
  route,
  latitude, longitude, endLatitude, endLongitude,
  setRouteJson
 }) => {
  
  const [clickCount, setClickCount] = useState(0);

  const [position, setPosition] = useState<[number, number]>([
    latitude ?? 41.0082,
    longitude ?? 28.9784
  ]);
  const [endPosition, setEndPosition] = useState<[number, number]>([endLatitude ?? 0, endLongitude ?? 0]);

  const [address, setLocalAddress] = useState<string>('');
  const [endAdress, setLocalEndAddress] = useState<string>('');
  const [addressName, setLocalAddressName] = useState<string>('');
  const [endAddressName, setLocalEndAddressName] = useState<string>('');
  const [startQuery, setStartQuery] = useState('');
  const [endQuery, setEndQuery] = useState('');
  const [startSearchResults, setStartSearchResults] = useState<any[]>([]);
  const [endSearchResults, setEndSearchResults] = useState<any[]>([]);
  const [activeInput, setActiveInput] = useState<'start' | 'end' | null>(null);


  const getAddressFromCoords = async (
      latitude: number,
      longitude: number,
      type: 'start' | 'end'
    ) => {
      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        );

        const address = response.data.address as {
          road?: string;
          village?: string;
          town?: string;
          suburb?: string;
          neighbourhood?: string;
          city?: string;
          county?: string;
          state?: string;
          hamlet?: string;
        };

        let mostSpecific =
          address.road ||
          address.neighbourhood ||
          address.village ||
          address.hamlet ||
          '';

        let district = address.town || address.suburb || '';
        let city = address.city || address.county || address.state || '';
        const parts = [mostSpecific, district, city].filter(Boolean);
        const fallbackName = parts.join(', ');

        if (type === 'start') {
          setCoordinates({ latitude, longitude });
          setAddressName(fallbackName);
          setLocalAddress(response.data.display_name);
          setLocalAddressName(fallbackName);
        } else {
          setEndCoordinates({ latitude, longitude });
          setEndAddressName(fallbackName);
          setLocalEndAddress(response.data.display_name);
          setLocalEndAddressName(fallbackName);
        }
      } catch (error) {
        console.error('Error fetching address:', error);
      }
    };


    const debounceSearch = useCallback(
    debounce((q: string, type: 'start' | 'end') => {
      if (!q.trim()) return;

      axios.get("https://nominatim.openstreetmap.org/search", {
        params: {
          q,
          format: 'json',
          addressdetails: 1,
          limit: 5,
        },
      }).then(res => {
        if (type === 'start') setStartSearchResults(res.data);
        else setEndSearchResults(res.data);
      }).catch(err => console.error('Geocoding error:', err));
    }, 500), []
  );


  useEffect(() => {
    debounceSearch(startQuery, 'start');
  }, [startQuery]);

  useEffect(() => {
    debounceSearch(endQuery, 'end');
  }, [endQuery]);


  const handleStartClick = (result: any) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    setPosition([lat, lon]);
    setCoordinates({ latitude: lat, longitude: lon });
    getAddressFromCoords(lat, lon, 'start');
    setStartSearchResults([]);
  };

  const handleEndClick = (result: any) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    setEndPosition([lat, lon]);
    setEndCoordinates({ latitude: lat, longitude: lon });
    setEndAddressName(result.display_name || 'Unnamed');
    setEndSearchResults([]);
  };

  

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
    const { lat, lng } = e.latlng;

    if (!isThereRoute) {
      setPosition([lat, lng]);
      setCoordinates({ latitude: lat, longitude: lng });
      getAddressFromCoords(lat, lng, 'start');
      setEndCoordinates({ latitude: lat, longitude: lng })
      setEndPosition([0,0])
    } else {
      if (clickCount % 2 === 0) {
        setPosition([lat, lng]);
        setCoordinates({ latitude: lat, longitude: lng });
        setClickCount(prev => prev + 1);
        getAddressFromCoords(lat, lng, 'start');
      } else if (clickCount % 2 === 1) {
        setEndPosition([lat, lng]);
        setEndCoordinates({ latitude: lat, longitude: lng });
        setClickCount(prev => prev + 1);
        getAddressFromCoords(lat, lng, 'end');
      }
    }
  },
    });


    const finishIcon = new L.DivIcon({    
      className: '',
      html: `
        <div class="massive-finish-marker-wrapper">
          <div class="massive-finish-marker">
            <img class="flag-img" src="/end-flag.png" />
          </div>
        </div>
      `,
      iconSize: [48, 48],
      iconAnchor: [24, 48],
    });

    const pinIcon = new L.DivIcon({    
      className: '',
      html: `
        <div class="custom-marker-wrapper">
          <div class="animated-blue-marker">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" class="blue-pin-svg">
              <path fill="#1565C0" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [24, 48],
      popupAnchor: [0, -48]
    });

    return <div>
            {position[0] !== 41.0082 && position[1] !== 28.9784 &&
            <Marker position={position} icon={pinIcon}>
                <Popup>
                  {addressName ? (
                    <div>
                      <strong>{addressName}</strong>
                      <br />
                      {address}
                    </div>
                  ) : (
                    "Selected Location"
                  )}
                </Popup>
              </Marker>
              }
              {isThereRoute && endPosition[0] !== 0 && endPosition[1] !== 0 && (
                <Marker icon={finishIcon} position={endPosition}>
                  <Popup>
                    {endAddressName ? (
                    <div>
                      <strong>{endAddressName}</strong>
                      <br />
                      {endAdress}
                    </div>
                  ) : (
                    "Selected Location"
                  )}
                  </Popup>
                </Marker>
)}

      </div>;
  };


    const startWrapperRef = useRef<HTMLDivElement | null>(null);
    const endWrapperRef = useRef<HTMLDivElement | null>(null);


    useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Node;

    if (activeInput === 'start' && startWrapperRef.current && !startWrapperRef.current.contains(target)) {
      setActiveInput(null);
    }

    if (activeInput === 'end' && endWrapperRef.current && !endWrapperRef.current.contains(target)) {
      setActiveInput(null);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, [activeInput]);


  return (
    <div>
          <div className={styles.mapInputContainer}>
                <div className={styles.inputWrapper} ref={startWrapperRef}>
                  <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
                  <input
                    type='text'
                    placeholder='Search start location...'
                    value={startQuery}
                    onChange={(e) => setStartQuery(e.target.value)}
                    onFocus={() => {
                      setActiveInput('start');
                    }}
                  />
                </div>
                {activeInput === 'start' && startSearchResults.length > 0 && (
                  <div className={styles.searchResults}>
                    <ul>
                      {startSearchResults.map(result => (
                        <li key={result.place_id} onMouseDown={() => handleStartClick(result)}>
                            {result.display_name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            {isThereRoute && 
              <div className={styles.mapInputContainer}>
                              <div className={styles.inputWrapper} ref={endWrapperRef}>
                <FontAwesomeIcon icon={faSearch} className={styles.searchIcon}/>
                <input
                  type='text'
                  placeholder='Search end location...'
                  value={endQuery}
                  onChange={(e) => setEndQuery(e.target.value)}
                  onFocus={() => {
                    setActiveInput('end');
                  }}
                />
                {activeInput === 'end' && endSearchResults.length > 0 && (
                  <div className={styles.searchResults}>
                    <ul>
                      {endSearchResults.map(result => (
                        <li key={result.place_id} onClick={() => handleEndClick(result)}>
                          {result.display_name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            }
      <div style={{ height: '500px', width: '700px' }}>
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
          <MapPanner coords={position}/>
          <RouteDrawer setRouteJson={setRouteJson}isThereRoute={isThereRoute} start={position} end={endPosition} routeType={route}/>
        </MapContainer>
      </div>
    </div>
  );
};

export default EventLocationSelector;
