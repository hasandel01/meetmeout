export interface Weather {
    current: ForecastDay;
    daily: ForecastDay[];
    lat: number;
    lon: number;
    timezone: string;
    timezone_offset: string;
  }
  
  export interface City {
    id: number;
    name: string;
    coord: Coord;
    country: string;
    timezone: number;
  }
  
  export interface Coord {
    lon: number;
    lat: number;
  }
  
  export interface ForecastDay {
    clouds: number;
    dew_point: number;
    dt: number;
    feels_like: FeelsLike;
    humidity: number;
    pressure: number;
    sunrise: number;
    sunset: number;
    temp: Temperature;
    visibility: number;
    weather: Weather[];
    wind_deg: number;
    wind_speed: number;
    uvi: number
    summary: string
  }
  
  export interface Temperature {
    day: number;
    min: number;
    max: number;
    night: number;
    eve: number;
    morn: number;
  }
  
  export interface FeelsLike {
    day: number;
    night: number;
    eve: number;
    morn: number;
  }
  
  export interface Weather {
    id: number;
    main: string;
    description: string;
    icon: string;
  }
  