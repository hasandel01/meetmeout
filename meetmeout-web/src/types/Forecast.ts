export interface Forecast {
    city: City;
    cod: string;
    message: number;
    cnt: number;
    list: ForecastDay[];
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
    dt: number;
    temp: Temperature;
    feels_like: FeelsLike;
    pressure: number;
    humidity: number;
    weather: Weather[];
    speed: number;
    deg: number;
    gust: number;
    clouds: number;
    pop: number;
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
  