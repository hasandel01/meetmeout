import { Event } from "../types/Event";

export const calculateDistance = (
  event: Event,
  userLat: number | undefined,
  userLng: number | undefined
): number => {
  if (
    userLat === undefined ||
    userLng === undefined ||
    !event.latitude ||
    !event.longitude
  ) {
    return Number.MAX_SAFE_INTEGER;
  }

  const R = 6371;
  const toRad = (value: number) => value * Math.PI / 180;

  const dLat = toRad(event.latitude - userLat);
  const dLon = toRad(event.longitude - userLng);

  const lat1 = toRad(userLat);
  const lat2 = toRad(event.latitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.asin(Math.sqrt(a));
  return R * c;
};
