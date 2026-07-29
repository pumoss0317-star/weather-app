import type { CurrentWeather, WeatherDay } from "@/lib/weather-types";
import { formatDateJa } from "@/lib/format-date";

interface WeatherCardProps {
  cityLabel: string;
  day: WeatherDay;
  current: CurrentWeather | null; // 選択日が「今日」の場合のみ渡す
}

function iconUrl(icon: string) {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}

export default function WeatherCard({ cityLabel, day, current }: WeatherCardProps) {
  const icon = current?.icon ?? day.icon;
  const description = current?.description ?? day.description;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-zinc-500">{cityLabel}</p>
          <p className="text-lg font-semibold text-zinc-900">{formatDateJa(day.date)}</p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={iconUrl(icon)} alt={description} width={64} height={64} />
      </div>

      <div className="mt-4 flex items-end gap-3">
        {current ? (
          <span className="text-5xl font-bold text-zinc-900">{current.temp}°</span>
        ) : (
          <span className="text-5xl font-bold text-zinc-900">{day.tempMax}°</span>
        )}
        <span className="pb-1 text-sm text-zinc-500">
          最高 {day.tempMax}° / 最低 {day.tempMin}°
        </span>
      </div>
      <p className="mt-1 text-sm text-zinc-600">{description}</p>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-zinc-50 p-4">
          <p className="text-xs text-zinc-500">湿度</p>
          <p className="mt-1 text-xl font-semibold text-zinc-900">
            {current?.humidity ?? day.humidity}%
          </p>
        </div>
        <div className="rounded-xl bg-zinc-50 p-4">
          <p className="text-xs text-zinc-500">降水確率</p>
          <p className="mt-1 text-xl font-semibold text-zinc-900">{day.pop}%</p>
        </div>
      </div>

      {current && (
        <p className="mt-4 text-xs text-zinc-400">体感温度 {current.feelsLike}°</p>
      )}
    </div>
  );
}
