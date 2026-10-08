import { requireDate } from '../../../../shared/domain/validation';

export interface Streak {
  readonly days: number;
  readonly lastRecordedDate: string | null;
}

export function currentStreak(dates: readonly string[], today: string): Streak {
  requireDate(today);
  const recorded = new Set(dates.map(requireDate));
  const cursor = new Date(today + 'T12:00:00Z');
  if (!recorded.has(today)) cursor.setUTCDate(cursor.getUTCDate() - 1);
  const latest = cursor.toISOString().slice(0, 10);
  let days = 0;
  while (recorded.has(cursor.toISOString().slice(0, 10))) {
    days++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return { days, lastRecordedDate: days ? latest : null };
}
