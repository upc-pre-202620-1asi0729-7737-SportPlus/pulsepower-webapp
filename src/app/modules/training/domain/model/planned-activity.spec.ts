import { describe, expect, it } from 'vitest';
import { plannedActivity, overlappingActivities, PlannedActivity } from './planned-activity.entity';
const activity: PlannedActivity = {
  id: 'a',
  date: '2026-10-04',
  startTime: '23:30',
  durationMinutes: 60,
  activity: 'Walk',
  kind: 'Workout',
  intensity: 'Low',
  status: 'Planned',
};
describe('Planned activity overlap', () => {
  it('detects cross-midnight overlap, but allows adjacent sessions', () => {
    expect(
      overlappingActivities(activity, [
        { ...activity, id: 'b', date: '2026-10-05', startTime: '00:00' },
      ]),
    ).toHaveLength(1);
    expect(
      overlappingActivities(activity, [
        { ...activity, id: 'b', date: '2026-10-05', startTime: '00:30' },
      ]),
    ).toHaveLength(0);
  });
  it('ignores itself, cancelled activities and legacy plans without time', () => {
    expect(
      overlappingActivities(activity, [
        activity,
        { ...activity, id: 'b', status: 'Cancelled' },
        { ...activity, id: 'c', startTime: null },
      ]),
    ).toHaveLength(0);
  });
  it('rejects invalid times', () => {
    expect(() => plannedActivity({ ...activity, startTime: '25:00' })).toThrow();
  });
});
