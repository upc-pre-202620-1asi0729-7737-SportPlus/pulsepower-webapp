import { describe, expect, it } from 'vitest';
import { emptyWellness, saveCheckIn, toggleHabit } from './wellness-data';
describe('Daily wellness records', () => {
  it('updates the check-in for the same day while retaining its identity', () => {
    const checkIn = {
      id: 'first',
      date: '2026-10-03',
      mood: 3,
      stress: 5,
      discomfort: false,
      notes: '',
    };
    const result = saveCheckIn(saveCheckIn(emptyWellness(), checkIn), {
      ...checkIn,
      id: 'second',
      mood: 4,
    });
    expect(result.checkIns).toEqual([{ ...checkIn, mood: 4 }]);
  });
  it('toggles a habit once per day and rejects an unknown habit', () => {
    const original = {
      ...emptyWellness(),
      habits: [{ id: 'habit-1', name: 'Walk', weeklyTarget: 5 }],
    };
    const completed = toggleHabit(original, 'habit-1', '2026-10-03');
    expect(completed.logs).toHaveLength(1);
    expect(toggleHabit(completed, 'habit-1', '2026-10-03').logs).toHaveLength(0);
    expect(() => toggleHabit(original, 'missing', '2026-10-03')).toThrow();
  });
});
