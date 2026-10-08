import { WellnessCheckIn, wellnessCheckIn } from './wellness-check-in.entity';
import { WellnessHabit } from './wellness-habit.entity';
import { HabitLog } from './habit-log';
import { requireDate, DomainError } from '../../../../shared/domain/validation';

export interface WellnessData {
  readonly checkIns: readonly WellnessCheckIn[];
  readonly habits: readonly WellnessHabit[];
  readonly logs: readonly HabitLog[];
}

export function saveCheckIn(data: WellnessData, value: WellnessCheckIn): WellnessData {
  const validated = wellnessCheckIn(value),
    existing = data.checkIns.find((row) => row.date === value.date);
  return {
    ...data,
    checkIns: [
      { ...validated, id: existing?.id ?? validated.id },
      ...data.checkIns.filter((row) => row.date !== value.date),
    ],
  };
}

export function toggleHabit(data: WellnessData, habitId: string, date: string): WellnessData {
  requireDate(date);
  if (!data.habits.some((habit) => habit.id === habitId))
    throw new DomainError('This habit no longer exists.');
  const exists = data.logs.some((log) => log.habitId === habitId && log.date === date);
  return {
    ...data,
    logs: exists
      ? data.logs.filter((log) => log.habitId !== habitId || log.date !== date)
      : [...data.logs, { habitId, date }],
  };
}

export function emptyWellness(): WellnessData {
  return { checkIns: [], habits: [], logs: [] };
}
