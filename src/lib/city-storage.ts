export interface SavedCity {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

const FAVORITES_KEY = "weather-app:favorites";
const LAST_CITY_KEY = "weather-app:last-city";

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function isSameCity(a: SavedCity, b: SavedCity): boolean {
  return Math.abs(a.lat - b.lat) < 0.01 && Math.abs(a.lon - b.lon) < 0.01;
}

export function getFavorites(): SavedCity[] {
  return readJson<SavedCity[]>(FAVORITES_KEY) ?? [];
}

export function addFavorite(city: SavedCity): SavedCity[] {
  const current = getFavorites();
  if (current.some((c) => isSameCity(c, city))) return current;
  const next = [...current, city];
  writeJson(FAVORITES_KEY, next);
  return next;
}

export function removeFavorite(city: SavedCity): SavedCity[] {
  const next = getFavorites().filter((c) => !isSameCity(c, city));
  writeJson(FAVORITES_KEY, next);
  return next;
}

export function getLastCity(): SavedCity | null {
  return readJson<SavedCity>(LAST_CITY_KEY);
}

export function setLastCity(city: SavedCity) {
  writeJson(LAST_CITY_KEY, city);
}
