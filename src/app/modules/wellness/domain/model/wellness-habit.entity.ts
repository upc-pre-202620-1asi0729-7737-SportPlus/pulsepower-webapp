import { DomainError, requireText, requireNumber } from '../../../../shared/domain/validation';

export interface WellnessHabit {
  readonly id: string;
  readonly name: string;
  readonly weeklyTarget: number;
}

export function wellnessHabit(value: WellnessHabit): WellnessHabit {
  if (!Number.isInteger(value.weeklyTarget))
    throw new DomainError('Weekly target must be a whole number of days.');
  return Object.freeze({
    ...value,
    name: requireText(value.name, 'Habit', 80),
    weeklyTarget: requireNumber(value.weeklyTarget, 'Weekly target', 1, 7),
  });
}
