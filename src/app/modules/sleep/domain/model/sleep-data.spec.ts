import { describe, expect, it } from 'vitest';
import { addSleepRecord, emptySleep } from './sleep-data';
import { SleepRecord, sleepRecord } from './sleep-record.entity';
const night: SleepRecord = {
  id: 'night-1',
  startedAt: '2026-10-02T22:00:00Z',
  endedAt: '2026-10-03T06:00:00Z',
  source: 'MANUAL',
  sleepScore: null,
  notes: '',
};
describe('Sleep record boundaries', () => {
  it('rejects overlapping periods and accepts adjacent periods', () => {
    const data = addSleepRecord(emptySleep(), night);
    expect(() =>
      addSleepRecord(data, {
        ...night,
        id: 'night-2',
        startedAt: '2026-10-03T05:00:00Z',
        endedAt: '2026-10-03T07:00:00Z',
      }),
    ).toThrow(/overlaps/);
    expect(
      addSleepRecord(data, {
        ...night,
        id: 'night-3',
        startedAt: night.endedAt,
        endedAt: '2026-10-03T07:00:00Z',
      }).records,
    ).toHaveLength(2);
  });
  it('does not allow device scores on a manual entry', () => {
    expect(() => sleepRecord({ ...night, sleepScore: 90 })).toThrow(/Manual/);
  });
});
