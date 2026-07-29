"use client";

import { useMemo, useState } from "react";

interface CalendarProps {
  availableDates: string[]; // "YYYY-MM-DD"
  selectedDate: string;
  todayDate: string; // 対象都市のローカル日付での「今日」
  onSelect: (date: string) => void;
}

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

function toMonthKey(date: string) {
  return date.slice(0, 7); // "YYYY-MM"
}

function buildMonthGrid(year: number, month: number) {
  const firstDay = new Date(Date.UTC(year, month, 1));
  const startWeekday = firstDay.getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  const cells: (string | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    cells.push(`${year}-${mm}-${dd}`);
  }
  return cells;
}

export default function Calendar({
  availableDates,
  selectedDate,
  todayDate,
  onSelect,
}: CalendarProps) {
  const availableSet = useMemo(() => new Set(availableDates), [availableDates]);
  const monthKeys = useMemo(
    () => Array.from(new Set(availableDates.map(toMonthKey))).sort(),
    [availableDates]
  );

  const [monthIndex, setMonthIndex] = useState(() => {
    const idx = monthKeys.indexOf(toMonthKey(selectedDate));
    return idx >= 0 ? idx : 0;
  });

  const currentMonthKey = monthKeys[monthIndex] ?? monthKeys[0] ?? toMonthKey(selectedDate);
  const [yearStr, monthStr] = currentMonthKey.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr) - 1;

  const cells = useMemo(() => buildMonthGrid(year, month), [year, month]);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonthIndex((i) => Math.max(0, i - 1))}
          disabled={monthIndex === 0}
          className="rounded-full px-3 py-1 text-sm text-zinc-500 hover:bg-zinc-100 disabled:opacity-30"
          aria-label="前の月"
        >
          ←
        </button>
        <span className="text-sm font-semibold text-zinc-900">
          {year}年{month + 1}月
        </span>
        <button
          type="button"
          onClick={() => setMonthIndex((i) => Math.min(monthKeys.length - 1, i + 1))}
          disabled={monthIndex >= monthKeys.length - 1}
          className="rounded-full px-3 py-1 text-sm text-zinc-500 hover:bg-zinc-100 disabled:opacity-30"
          aria-label="次の月"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-zinc-400">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={`blank-${i}`} />;
          const isAvailable = availableSet.has(date);
          const isSelected = date === selectedDate;
          const isToday = date === todayDate;
          const day = Number(date.slice(8, 10));

          return (
            <button
              key={date}
              type="button"
              disabled={!isAvailable}
              onClick={() => onSelect(date)}
              className={[
                "aspect-square rounded-lg text-sm transition-colors",
                isAvailable
                  ? "cursor-pointer text-zinc-900 hover:bg-sky-100"
                  : "cursor-not-allowed text-zinc-300",
                isSelected ? "bg-sky-500 text-white hover:bg-sky-500" : "",
                isToday && !isSelected ? "font-bold text-sky-600" : "",
              ].join(" ")}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
