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

export function emptyTraining(): TrainingData {
  return {
    sessions: [],
    plan: { id: 'personal-plan', name: 'Your training plan', activities: [] },
  };
}
