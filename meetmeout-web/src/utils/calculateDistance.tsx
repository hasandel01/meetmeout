import { Event } from "../types/Event";
import { useLocationContext } from "../context/LocationContex";


export default function calculateDistance (event: Event): number {
    
    const { userLatitude: lat, userLongitude: lng } = useLocationContext();

    if (lat === undefined || lng === undefined || !event.latitude || !event.longitude) {
        return Number.MAX_SAFE_INTEGER; 
    }

    const R = 6371;
    const toRad = (value: number) => value * Math.PI / 180;

    const dLat = toRad(event.latitude - lat);
    const dLon = toRad(event.longitude - lng);

    const lat1 = toRad(lat);
    const lat2 = toRad(event.latitude);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.asin(Math.sqrt(a));
    return R * c;
};


