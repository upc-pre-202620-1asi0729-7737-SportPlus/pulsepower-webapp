import { describe, expect, it } from 'vitest';
import { addSleepRecord, emptySleep, replaceNight } from './sleep-data';
import { SleepRecord } from './sleep-record.entity';
const local = (value: string) => new Date(value).toISOString();
const manual: SleepRecord = {
  id: 'manual',
  startedAt: local('2026-10-23T23:00:00'),
  endedAt: local('2026-10-24T07:00:00'),
  source: 'MANUAL',
  sleepScore: null,
  notes: '',
};
describe('Wearable night synchronization', () => {
  it('replaces the night that ends the same day and keeps the others', () => {
    const previous = {
      ...manual,
      id: 'previous',
      startedAt: local('2026-10-22T23:00:00'),
      endedAt: local('2026-10-23T07:00:00'),
    };
    const data = addSleepRecord(addSleepRecord(emptySleep(), previous), manual);
    const next = replaceNight(data, {
      ...manual,
      id: 'device',
      startedAt: local('2026-10-24T02:00:00'),
      endedAt: local('2026-10-24T07:10:00'),
      source: 'AIoTI',
      sleepScore: 45,
    });
    expect(next.records.map((row) => row.id).sort()).toEqual(['device', 'previous']);
  });
});
