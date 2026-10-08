import { DomainError, optionalText } from '../../../../shared/domain/validation';

export interface SleepRecord {
  readonly id: string;
  readonly startedAt: string;
  readonly endedAt: string;
  readonly source: 'MANUAL' | 'AIoTI';
  readonly sleepScore: number | null;
  readonly notes: string;
}

export function sleepRecord(record: SleepRecord): SleepRecord {
  const start = Date.parse(record.startedAt),
    end = Date.parse(record.endedAt);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start)
    throw new DomainError('Wake-up time must be after bedtime.');
  if (end - start > 24 * 60 * 60 * 1000)
    throw new DomainError('A sleep record cannot exceed 24 hours.');
  if (record.source === 'MANUAL' && record.sleepScore !== null)
    throw new DomainError('Manual records cannot contain a device sleep score.');
  if (record.source !== 'MANUAL' && record.source !== 'AIoTI')
    throw new DomainError('Unknown sleep record source.');
  return Object.freeze({ ...record, notes: optionalText(record.notes, 'Notes') });
}

export function durationHours(record: SleepRecord): number {
  return (Date.parse(record.endedAt) - Date.parse(record.startedAt)) / 3600000;
}
