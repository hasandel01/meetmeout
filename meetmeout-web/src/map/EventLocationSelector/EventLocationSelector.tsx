import { MapContainer, TileLayer, Marker, useMapEvents, Popup, useMap } from 'react-leaflet';
import { useCallback, useEffect, useState } from 'react';
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
  setAddress: (address: string) => void;
  setAddressName: (addressName: string) => void;
  isThereRoute: boolean;
  setEndCoordinates: (coords: { latitude: number; longitude: number }) => void;
  route: RouteType;
}



const EventLocationSelector: React.FC<Props> = ({ setCoordinates, setAddress, setAddressName, isThereRoute, setEndCoordinates, route }) => {
  
  const [position, setPosition] = useState<[number, number]>([41.015, 28.97]);
  const [address, setLocalAddress] = useState<string>('');
  const [addressName, setLocalAddressName] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [endPosition, setEndPosition] = useState<[number, number]>([0,0]);


  const getAddressFromCoords = async (latitude: number, longitude: number) => {
    try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
        
        const name = response.data.name;

        const address = response.data.address as {
          road? :string;
          village?: string;
          town?: string;
          suburb?: string;
          neighbourhood: string;
          city?: string;
        }


        const fallbackName = 
            name ||
            address.road ||
            address.village ||
            address.neighbourhood ||
            address.suburb ||
            address.town ||
            address.city ||
            "Unnamed Location" 
            
          setAddress(response.data.display_name);
          setAddressName(fallbackName);
          setLocalAddress(response.data.display_name);
          setLocalAddressName(fallbackName);
    }
    catch (error) {
        console.error("Error fetching address:", error);
        return null;
    }
}

  const debounceSearch = useCallback(
    debounce((q: string) => {
      if(!q.trim()) return;

      axios.get("https://nominatim.openstreetmap.org/search", {
                params: {
                  q: q,
                  format: 'json',
                  addressdetails: 1,
                  limit: 5,
                },
        }).then(res => {
          setSearchResults(res.data)
        }).catch(err => {
            console.error('Forward geocoding error:', err);
        });
    }, 500),
    []
  )

  useEffect(() => {
    if(query)
      debounceSearch(query)
  }, [query])


   useEffect(() => {
      
      const handleClickOutside = (event: MouseEvent) => {
        const menu = document.querySelector(`.${styles.searchResults}`);
        if (
          menu &&
          !menu.contains(event.target as Node)
        ) {
          setShowSearchResults(false);
        }

      }

      if (showSearchResults) {
        document.addEventListener("mousedown", handleClickOutside);
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    },[showSearchResults])


  const handleResultClick = (result: any) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);

    setPosition([lat,lon])
    setCoordinates({latitude: lat, longitude: lon})
    setAddress(result.display_name)
    setAddressName(result.display_name || 'Unnamed')
    setSearchResults([])
  }
  
  const [clickCount, setClickCount] = useState(0);

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
    const { lat, lng } = e.latlng;

    if (!isThereRoute) {
      setPosition([lat, lng]);
      setCoordinates({ latitude: lat, longitude: lng });
      getAddressFromCoords(lat, lng);
      setEndCoordinates({ latitude: lat, longitude: lng })
      setEndPosition([0,0])
    } else {
      if (clickCount % 2 === 0) {
        setPosition([lat, lng]);
        setCoordinates({ latitude: lat, longitude: lng });
        setClickCount(prev => prev + 1);
        console.log(clickCount)
      } else if (clickCount % 2 === 1) {
        setEndPosition([lat, lng]);
        setEndCoordinates({ latitude: lat, longitude: lng });
        setClickCount(prev => prev + 1);
      }
    }
  },
    });

    return <div>
        <Marker position={position}>
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
              {isThereRoute && endPosition[0] !== 0 && endPosition[1] !== 0 && (
                <Marker position={endPosition}>
                  <Popup>Route End</Popup>
                </Marker>
)}

      </div>;
  };

  return (
    <div>
          <div className={styles.mapInputContainer}>
            <FontAwesomeIcon icon={faSearch}></FontAwesomeIcon>
            <input
              type='text'
              placeholder='Search location...'
              value={query}
              onChange = {(e) => setQuery(e.target.value)}
              onKeyDown = {(e) => e.key === 'Enter' && debounceSearch(query)}
              onFocus={() => {
                  setShowSearchResults(true)
                  debounceSearch(query)
              }}
              onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}>
            </input>
            {showSearchResults && searchResults &&
              <div className={styles.searchResults}>
              <ul>
                {searchResults && searchResults.map(result => (
                    <li  
                        key={result.place_id}
                        onClick={() => handleResultClick(result)}
                        >
                        {result.display_name}
                  </li>
              ))}
              </ul>
            </div>
            }
          </div>
      <div style={{ height: '450px', width: '450px' }}>
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
          <RouteDrawer isThereRoute={isThereRoute} start={position} end={endPosition} routeType={route}/>
        </MapContainer>
      </div>
    </div>
  );
};

export default EventLocationSelector;
