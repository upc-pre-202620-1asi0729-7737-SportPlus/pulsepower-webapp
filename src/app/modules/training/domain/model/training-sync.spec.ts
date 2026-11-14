import { describe, expect, it } from 'vitest';
import { emptyTraining, replaceDaySession } from './training-data';
import { TrainingSession } from './training-session.entity';
const session: TrainingSession = {
  id: 'manual',
  date: '2026-10-24',
  activity: 'Running',
  durationMinutes: 30,
  perceivedEffort: 3,
  notes: '',
  plannedActivityId: null,
};
describe('Wearable session synchronization', () => {
  it("replaces that day's unplanned sessions and keeps planned ones and other days", () => {
    const data = {
      ...emptyTraining(),
      sessions: [
        session,
        { ...session, id: 'planned', plannedActivityId: 'activity-1' },
        { ...session, id: 'yesterday', date: '2026-10-23' },
      ],
    };
    const next = replaceDaySession(data, { ...session, id: 'device', perceivedEffort: 9 });
    expect(next.sessions.map((row) => row.id).sort()).toEqual(['device', 'planned', 'yesterday']);
  });
  it('does not let a wearable session complete a planned activity', () => {
    expect(() =>
      replaceDaySession(emptyTraining(), { ...session, plannedActivityId: 'activity-1' }),
    ).toThrow(/planned activity/);
  });
});
