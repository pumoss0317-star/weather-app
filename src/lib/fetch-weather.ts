import type { WeatherResponse } from "./weather-types";

export class WeatherFetchError extends Error {}

async function handleResponse(res: Response): Promise<WeatherResponse> {
  const body = await res.json();
  if (!res.ok) {
    throw new WeatherFetchError(body.error ?? "天気情報の取得に失敗しました");
  }
  return body as WeatherResponse;
}

export async function fetchWeatherByCity(city: string): Promise<WeatherResponse> {
  const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
  return handleResponse(res);
}

export async function fetchWeatherByCoords(
  lat: number,
  lon: number
): Promise<WeatherResponse> {
  const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
  return handleResponse(res);
}
