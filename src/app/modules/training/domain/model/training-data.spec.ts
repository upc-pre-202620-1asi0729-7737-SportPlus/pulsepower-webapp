import { describe, expect, it } from 'vitest';
import { emptyTraining, recordSession } from './training-data';
import { plannedActivity } from './planned-activity.entity';
import { TrainingSession } from './training-session.entity';
const session: TrainingSession = {
  id: 'session-1',
  date: '2026-10-03',
  activity: 'Running',
  durationMinutes: 30,
  perceivedEffort: 5,
  notes: '',
  plannedActivityId: 'activity-1',
};
describe('Recording a planned session', () => {
  const original = {
    ...emptyTraining(),
    plan: {
      id: 'plan-1',
      name: 'Personal plan',
      activities: [
        plannedActivity({
          id: 'activity-1',
          date: '2026-10-03',
          activity: 'Running',
          durationMinutes: 30,
          intensity: 'Medium',
          kind: 'Workout',
          status: 'Planned',
        }),
      ],
    },
  };
  it('completes the activity and records the session without modifying the original', () => {
    const result = recordSession(original, session);
    expect(result.sessions).toHaveLength(1);
    expect(result.plan.activities[0].status).toBe('Completed');
    expect(original.plan.activities[0].status).toBe('Planned');
    expect(original.sessions).toHaveLength(0);
    expect(() => recordSession(result, { ...session, id: 'session-2' })).toThrow();
  });
  it('rejects an invalid effort before changing the plan', () => {
    expect(() => recordSession(original, { ...session, perceivedEffort: 11 })).toThrow();
    expect(original.plan.activities[0].status).toBe('Planned');
  });
});
