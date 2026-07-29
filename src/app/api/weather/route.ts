import { NextRequest, NextResponse } from "next/server";
import type { WeatherDay, WeatherResponse } from "@/lib/weather-types";

const OWM_BASE = "https://api.openweathermap.org/data/2.5";

interface OwmWeatherPart {
  main: string;
  description: string;
  icon: string;
}

interface OwmForecastListItem {
  dt: number;
  main: { temp_min: number; temp_max: number; humidity: number };
  weather: OwmWeatherPart[];
  pop: number;
}

interface OwmForecastResponse {
  city: { name: string; country: string; timezone: number };
  list: OwmForecastListItem[];
}

interface OwmCurrentResponse {
  main: { temp: number; feels_like: number; humidity: number };
  weather: OwmWeatherPart[];
}

export async function GET(request: NextRequest) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "サーバーにAPIキーが設定されていません（.env.localを確認してください）" },
      { status: 500 }
    );
  }

  const { searchParams } = request.nextUrl;
  const city = searchParams.get("city");
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  let locationQuery: string;
  if (city) {
    locationQuery = `q=${encodeURIComponent(city)}`;
  } else if (lat && lon) {
    locationQuery = `lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`;
  } else {
    return NextResponse.json(
      { error: "city または lat/lon のいずれかを指定してください" },
      { status: 400 }
    );
  }

  const commonParams = `${locationQuery}&units=metric&lang=ja&appid=${apiKey}`;

  let currentRes: Response;
  let forecastRes: Response;
  try {
    [currentRes, forecastRes] = await Promise.all([
      fetch(`${OWM_BASE}/weather?${commonParams}`, { cache: "no-store" }),
      fetch(`${OWM_BASE}/forecast?${commonParams}`, { cache: "no-store" }),
    ]);
  } catch {
    return NextResponse.json(
      { error: "天気情報の取得中にネットワークエラーが発生しました" },
      { status: 502 }
    );
  }

  if (currentRes.status === 404 || forecastRes.status === 404) {
    return NextResponse.json(
      { error: "指定された都市が見つかりませんでした" },
      { status: 404 }
    );
  }

  if (currentRes.status === 401 || forecastRes.status === 401) {
    return NextResponse.json(
      {
        error:
          "APIキーが無効です。発行直後の場合は有効化まで最大2時間ほどかかることがあります",
      },
      { status: 401 }
    );
  }

  if (!currentRes.ok || !forecastRes.ok) {
    return NextResponse.json(
      { error: "天気情報の取得に失敗しました" },
      { status: 502 }
    );
  }

  const currentData: OwmCurrentResponse = await currentRes.json();
  const forecastData: OwmForecastResponse = await forecastRes.json();

  const timezoneOffsetSec = forecastData.city.timezone;

  const dayMap = new Map<
    string,
    { item: OwmForecastListItem; localHour: number }[]
  >();
  for (const item of forecastData.list) {
    const localDate = new Date((item.dt + timezoneOffsetSec) * 1000);
    const dateKey = localDate.toISOString().slice(0, 10);
    const localHour = localDate.getUTCHours();
    const arr = dayMap.get(dateKey) ?? [];
    arr.push({ item, localHour });
    dayMap.set(dateKey, arr);
  }

  const days: WeatherDay[] = Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, entries]) => {
      const items = entries.map((e) => e.item);
      const tempMin = Math.round(Math.min(...items.map((i) => i.main.temp_min)));
      const tempMax = Math.round(Math.max(...items.map((i) => i.main.temp_max)));
      const humidity = Math.round(
        items.reduce((sum, i) => sum + i.main.humidity, 0) / items.length
      );
      const pop = Math.round(Math.max(...items.map((i) => i.pop)) * 100);

      const representative = entries.reduce((closest, current) =>
        Math.abs(current.localHour - 12) < Math.abs(closest.localHour - 12)
          ? current
          : closest
      ).item;

      return {
        date,
        tempMin,
        tempMax,
        humidity,
        pop,
        weatherMain: representative.weather[0].main,
        description: representative.weather[0].description,
        icon: representative.weather[0].icon,
      };
    });

  const response: WeatherResponse = {
    city: { name: forecastData.city.name, country: forecastData.city.country },
    current: {
      temp: Math.round(currentData.main.temp),
      feelsLike: Math.round(currentData.main.feels_like),
      humidity: currentData.main.humidity,
      weatherMain: currentData.weather[0].main,
      description: currentData.weather[0].description,
      icon: currentData.weather[0].icon,
    },
    days,
  };

  return NextResponse.json(response);
}
