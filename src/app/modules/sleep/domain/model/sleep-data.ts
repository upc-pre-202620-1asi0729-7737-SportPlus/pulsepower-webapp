import { SleepRecord, sleepRecord } from './sleep-record.entity';
import { SleepRoutine } from './sleep-routine';
import { DomainError } from '../../../../shared/domain/validation';

export interface SleepData {
  readonly records: readonly SleepRecord[];
  readonly routine: SleepRoutine | null;
}

export function addSleepRecord(data: SleepData, record: SleepRecord): SleepData {
  const validated = sleepRecord(record);
  if (
    data.records.some(
      (row) =>
        Date.parse(row.startedAt) < Date.parse(validated.endedAt) &&
        Date.parse(row.endedAt) > Date.parse(validated.startedAt),
    )
  )
    throw new DomainError('This period overlaps an existing sleep record.');
  return { ...data, records: [validated, ...data.records] };
}

function wakeDay(iso: string): string {
  const date = new Date(iso);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

/** Replaces the night that ends on the same day, as a wearable synchronization does. */
export function replaceNight(data: SleepData, record: SleepRecord): SleepData {
  const validated = sleepRecord(record);
  const day = wakeDay(validated.endedAt);
  return addSleepRecord(
    { ...data, records: data.records.filter((row) => wakeDay(row.endedAt) !== day) },
    validated,
  );
}

export function emptySleep(): SleepData {
  return { records: [], routine: null };
}
