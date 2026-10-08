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

export function emptySleep(): SleepData {
  return { records: [], routine: null };
}
