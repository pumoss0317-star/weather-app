const WEEKDAYS_JA = ["日", "月", "火", "水", "木", "金", "土"];

export function formatDateJa(dateKey: string): string {
  const [, monthStr, dayStr] = dateKey.split("-");
  const date = new Date(`${dateKey}T00:00:00`);
  const weekday = WEEKDAYS_JA[date.getDay()];
  return `${Number(monthStr)}月${Number(dayStr)}日(${weekday})`;
}
