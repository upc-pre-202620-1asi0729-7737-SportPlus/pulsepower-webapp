import { TrainingSession, trainingSession } from './training-session.entity';
import { TrainingPlan } from './training-plan.entity';
import { DomainError } from '../../../../shared/domain/validation';

export interface TrainingData {
  readonly sessions: readonly TrainingSession[];
  readonly plan: TrainingPlan;
}

export function recordSession(data: TrainingData, session: TrainingSession): TrainingData {
  if (session.plannedActivityId) {
    const activity = data.plan.activities.find((item) => item.id === session.plannedActivityId);
    if (!activity || activity.status !== 'Planned')
      throw new DomainError('This planned activity is no longer available.');
  }
  return {
    sessions: [trainingSession(session), ...data.sessions],
    plan: {
      ...data.plan,
      activities: data.plan.activities.map((item) =>
        item.id === session.plannedActivityId ? { ...item, status: 'Completed' as const } : item,
      ),
    },
  };
}

/**
 * Records a session measured by the wearable. It replaces the other unplanned sessions of
 * that day, as a device synchronization does; sessions that completed a planned activity stay.
 */
export function replaceDaySession(data: TrainingData, session: TrainingSession): TrainingData {
  if (session.plannedActivityId)
    throw new DomainError('A wearable session cannot complete a planned activity.');
  return recordSession(
    {
      ...data,
      sessions: data.sessions.filter(
        (row) => row.date !== session.date || row.plannedActivityId !== null,
      ),
    },
    session,
  );
}

export function emptyTraining(): TrainingData {
  return {
    sessions: [],
    plan: { id: 'personal-plan', name: 'Your training plan', activities: [] },
  };
}
