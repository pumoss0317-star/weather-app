import type { CurrentWeather, WeatherDay } from "./weather-types";

export interface OutfitAdvice {
  emoji: string;
  label: string;
}

export function getOutfitAdvice(
  day: WeatherDay,
  current: CurrentWeather | null
): OutfitAdvice[] {
  const advice: OutfitAdvice[] = [];
  const weatherMain = current?.weatherMain ?? day.weatherMain;

  if (day.pop >= 50) {
    advice.push({ emoji: "☔", label: "傘を持って" });
  } else if (day.pop >= 30) {
    advice.push({ emoji: "🌂", label: "折りたたみ傘があると安心" });
  }

  if (day.tempMin <= 5) {
    advice.push({ emoji: "🧣", label: "厚手の上着で防寒を" });
  } else if (day.tempMin <= 12) {
    advice.push({ emoji: "🧥", label: "上着があると安心" });
  }

  if (day.tempMax >= 33) {
    advice.push({ emoji: "⚠️", label: "熱中症に注意" });
  } else if (day.tempMax >= 28) {
    advice.push({ emoji: "👕", label: "半袖で快適" });
  }

  if (weatherMain === "Clear" && day.tempMax >= 25) {
    advice.push({ emoji: "🧴", label: "日焼け対策を" });
  }

  return advice;
}

export type LaundryLevel = "great" | "good" | "normal" | "poor" | "bad";

export interface LaundryIndex {
  score: number;
  level: LaundryLevel;
  label: string;
}

const LAUNDRY_LABELS: Record<LaundryLevel, string> = {
  great: "絶好調",
  good: "良好",
  normal: "普通",
  poor: "微妙",
  bad: "やめとけ",
};

export function getLaundryIndex(day: WeatherDay): LaundryIndex {
  const raw = 100 - day.pop * 0.7 - Math.max(0, day.humidity - 50) * 0.6;
  const score = Math.round(Math.min(100, Math.max(0, raw)));

  let level: LaundryLevel;
  if (score >= 75) level = "great";
  else if (score >= 55) level = "good";
  else if (score >= 35) level = "normal";
  else if (score >= 15) level = "poor";
  else level = "bad";

  return { score, level, label: LAUNDRY_LABELS[level] };
}
