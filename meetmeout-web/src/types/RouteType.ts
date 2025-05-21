export enum RouteType {
  CAR = "CAR",
  CYCLING = "CYCLING",
  WALKING = "WALKING",
  HIKING = "HIKING"
}

export const ORS_ROUTE_MAP: Record<RouteType, string> = {
  [RouteType.CAR]: "driving-car",
  [RouteType.CYCLING]: "cycling-regular",
  [RouteType.WALKING]: "foot-walking",
  [RouteType.HIKING]: "foot-hiking",
};
