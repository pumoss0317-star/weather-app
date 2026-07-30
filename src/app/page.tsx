"use client";

import { useEffect, useState } from "react";
import Calendar from "@/components/Calendar";
import FavoriteCities from "@/components/FavoriteCities";
import WeatherCard from "@/components/WeatherCard";
import { fetchWeatherByCity, fetchWeatherByCoords, WeatherFetchError } from "@/lib/fetch-weather";
import {
  addFavorite,
  getFavorites,
  getLastCity,
  isSameCity,
  removeFavorite,
  setLastCity,
  type SavedCity,
} from "@/lib/city-storage";
import type { WeatherResponse } from "@/lib/weather-types";

export default function Home() {
  const [cityInput, setCityInput] = useState("Tokyo");
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<SavedCity[]>([]);

  // localStorageはサーバーに存在しないため、初期stateではなくマウント後のeffectで復元する
  // （そうしないとSSR結果とクライアント初回描画が食い違いハイドレーションエラーになる）
  useEffect(() => {
    function restoreFavorites() {
      setFavorites(getFavorites());
    }
    restoreFavorites();

    const last = getLastCity();
    if (!last) return;
    let cancelled = false;
    async function restoreLastCity(city: SavedCity) {
      setLoading(true);
      try {
        const data = await fetchWeatherByCoords(city.lat, city.lon);
        if (cancelled) return;
        setCityInput(data.city.name);
        applyResult(data);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof WeatherFetchError ? err.message : "予期しないエラーが発生しました");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    restoreLastCity(last);
    return () => {
      cancelled = true;
    };
  }, []);

  function applyResult(data: WeatherResponse) {
    setWeather(data);
    setSelectedDate(data.days[0]?.date ?? "");
    setLastCity({
      name: data.city.name,
      country: data.city.country,
      lat: data.city.lat,
      lon: data.city.lon,
    });
  }

  function handleSelectFavorite(city: SavedCity) {
    setLoading(true);
    setError(null);
    fetchWeatherByCoords(city.lat, city.lon)
      .then((data) => {
        setCityInput(data.city.name);
        applyResult(data);
      })
      .catch((err) => {
        setError(err instanceof WeatherFetchError ? err.message : "予期しないエラーが発生しました");
      })
      .finally(() => setLoading(false));
  }

  function handleRemoveFavorite(city: SavedCity) {
    setFavorites(removeFavorite(city));
  }

  function handleToggleFavorite() {
    if (!weather) return;
    const current: SavedCity = {
      name: weather.city.name,
      country: weather.city.country,
      lat: weather.city.lat,
      lon: weather.city.lon,
    };
    if (favorites.some((c) => isSameCity(c, current))) {
      setFavorites(removeFavorite(current));
    } else {
      setFavorites(addFavorite(current));
    }
  }

  const isCurrentFavorite =
    weather != null &&
    favorites.some((c) =>
      isSameCity(c, { name: weather.city.name, country: weather.city.country, lat: weather.city.lat, lon: weather.city.lon })
    );

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!cityInput.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeatherByCity(cityInput.trim());
      applyResult(data);
    } catch (err) {
      setError(err instanceof WeatherFetchError ? err.message : "予期しないエラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  function handleUseLocation() {
    if (!navigator.geolocation) {
      setError("この端末では現在地情報を利用できません");
      return;
    }
    setGeoLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const data = await fetchWeatherByCoords(
            position.coords.latitude,
            position.coords.longitude
          );
          setCityInput(data.city.name);
          applyResult(data);
        } catch (err) {
          setError(err instanceof WeatherFetchError ? err.message : "予期しないエラーが発生しました");
        } finally {
          setGeoLoading(false);
        }
      },
      () => {
        setError("現在地の取得が許可されませんでした");
        setGeoLoading(false);
      }
    );
  }

  const selectedDay = weather?.days.find((d) => d.date === selectedDate);
  const isToday = weather ? selectedDate === weather.days[0]?.date : false;

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-6">
          <h1 className="text-xl font-bold tracking-tight">天気予報</h1>
          <form onSubmit={handleSearch} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              placeholder="都市名（例: Tokyo, Osaka, London）"
              className="flex-1 rounded-full border border-zinc-300 px-4 py-2 text-sm focus:border-sky-500 focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
              >
                検索
              </button>
              <button
                type="button"
                onClick={handleUseLocation}
                disabled={geoLoading}
                className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 disabled:opacity-50"
              >
                現在地から取得
              </button>
            </div>
          </form>
          <FavoriteCities
            favorites={favorites}
            onSelect={handleSelectFavorite}
            onRemove={handleRemoveFavorite}
          />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {(loading || geoLoading) && (
          <p className="text-sm text-zinc-500">読み込み中...</p>
        )}

        {!loading && !geoLoading && weather && selectedDay && (
          <div className="grid gap-6 sm:grid-cols-2">
            <Calendar
              availableDates={weather.days.map((d) => d.date)}
              selectedDate={selectedDate}
              todayDate={weather.days[0]?.date ?? ""}
              onSelect={setSelectedDate}
            />
            <WeatherCard
              cityLabel={`${weather.city.name}, ${weather.city.country}`}
              day={selectedDay}
              current={isToday ? weather.current : null}
              isFavorite={isCurrentFavorite}
              onToggleFavorite={handleToggleFavorite}
            />
          </div>
        )}

        {!loading && !geoLoading && !weather && !error && (
          <p className="text-sm text-zinc-500">
            都市名を入力するか、現在地ボタンから天気予報を取得してください。
          </p>
        )}
      </main>
    </div>
  );
}
