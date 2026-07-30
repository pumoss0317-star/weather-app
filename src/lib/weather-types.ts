export interface WeatherDay {
  date: string; // "YYYY-MM-DD"（都市のローカル日付）
  tempMin: number;
  tempMax: number;
  humidity: number;
  pop: number; // 降水確率 0-100
  weatherMain: string;
  description: string;
  icon: string;
}

export interface CurrentWeather {
  temp: number;
  feelsLike: number;
  humidity: number;
  weatherMain: string;
  description: string;
  icon: string;
}

export interface WeatherResponse {
  city: {
    name: string;
    country: string;
    lat: number;
    lon: number;
  };
  current: CurrentWeather;
  days: WeatherDay[];
}

export interface WeatherErrorResponse {
  error: string;
}
