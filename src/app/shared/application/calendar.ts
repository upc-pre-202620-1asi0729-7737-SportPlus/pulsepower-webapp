export function localDate(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}
export function weekDays(today: string, offset = 0): string[] {
  const date = new Date(today + 'T12:00:00');
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7) + offset * 7);
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(date);
    day.setDate(date.getDate() + index);
    return localDate(day);
  });
}
export function lastDays(today: string, count = 7): string[] {
  return Array.from({ length: count }, (_, index) => {
    const day = new Date(today + 'T12:00:00');
    day.setDate(day.getDate() - count + 1 + index);
    return localDate(day);
  });
}
export function dayLabel(date: string): string {
  return new Intl.DateTimeFormat('en', { weekday: 'short' }).format(new Date(date + 'T12:00:00'));
}
