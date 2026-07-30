import type { CurrentWeather, WeatherDay } from "@/lib/weather-types";
import { formatDateJa } from "@/lib/format-date";
import { getLaundryIndex, getOutfitAdvice, type LaundryLevel } from "@/lib/advice";

interface WeatherCardProps {
  cityLabel: string;
  day: WeatherDay;
  current: CurrentWeather | null; // 選択日が「今日」の場合のみ渡す
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

function iconUrl(icon: string) {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}

const LAUNDRY_STYLES: Record<LaundryLevel, string> = {
  great: "bg-emerald-50 text-emerald-700",
  good: "bg-sky-50 text-sky-700",
  normal: "bg-zinc-100 text-zinc-700",
  poor: "bg-amber-50 text-amber-700",
  bad: "bg-red-50 text-red-700",
};

export default function WeatherCard({
  cityLabel,
  day,
  current,
  isFavorite = false,
  onToggleFavorite,
}: WeatherCardProps) {
  const icon = current?.icon ?? day.icon;
  const description = current?.description ?? day.description;
  const outfitAdvice = getOutfitAdvice(day, current);
  const laundry = getLaundryIndex(day);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-zinc-500">{cityLabel}</p>
            {onToggleFavorite && (
              <button
                type="button"
                onClick={onToggleFavorite}
                aria-label={isFavorite ? "お気に入りから削除" : "お気に入りに追加"}
                className={`text-base leading-none ${isFavorite ? "text-amber-500" : "text-zinc-300 hover:text-zinc-400"}`}
              >
                ★
              </button>
            )}
          </div>
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

      {outfitAdvice.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {outfitAdvice.map((a) => (
            <span
              key={a.label}
              className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700"
            >
              <span>{a.emoji}</span>
              {a.label}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3">
        <span className="text-xs text-zinc-500">洗濯・布団干し指数</span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${LAUNDRY_STYLES[laundry.level]}`}
        >
          {laundry.label}
        </span>
      </div>
    </div>
  );
}
