
import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../axios/axios';
import { useUserContext } from './UserContext';
interface LocationContextType {
    userLatitude: number | undefined;
    userLongitude: number | undefined;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);


export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const [userLatitude, setUserLatitude] = useState<number | undefined>();
    const [userLongitude, setUserLongitude] = useState<number | undefined>();

    const {currentUser} = useUserContext();

    useEffect(() => {
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setUserLatitude(pos.coords.latitude);
                    setUserLongitude(pos.coords.longitude);


                if(currentUser) {
                    axiosInstance.put(`/${currentUser.id}/location`, {
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude
                    });
                }

                }  
            )
        }
    },[currentUser])

    return (
        <LocationContext.Provider value={{userLatitude, userLongitude }}>
            {children}
        </LocationContext.Provider>
    );
}

export const useLocationContext = (): LocationContextType => {
    const context = useContext(LocationContext);
    if (!context) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
};