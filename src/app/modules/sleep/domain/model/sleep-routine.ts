import { DomainError, requireNumber } from '../../../../shared/domain/validation';

export interface SleepRoutine {
  readonly bedtime: string;
  readonly wakeTime: string;
  readonly targetHours: number;
  readonly reminderEnabled: boolean;
}

export function sleepRoutine(value: SleepRoutine): SleepRoutine {
  if (
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(value.bedtime) ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(value.wakeTime)
  )
    throw new DomainError('Choose valid bedtime and wake-up times.');
  return Object.freeze({
    ...value,
    targetHours: requireNumber(value.targetHours, 'Sleep target', 1, 24),
  });
}
