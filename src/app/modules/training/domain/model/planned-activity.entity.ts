import {
  requireText,
  requireDate,
  requireNumber,
  requireChoice,
  DomainError,
} from '../../../../shared/domain/validation';

export interface PlannedActivity {
  readonly id: string;
  readonly date: string;
  readonly startTime?: string | null;
  readonly activity: string;
  readonly durationMinutes: number;
  readonly intensity: 'Low' | 'Medium' | 'High';
  readonly kind: 'Workout' | 'Active rest';
  readonly status: 'Planned' | 'Completed' | 'Cancelled';
}

export function plannedActivity(data: PlannedActivity): PlannedActivity {
  if (data.startTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(data.startTime))
    throw new DomainError('Choose a valid start time.');
  return Object.freeze({
    ...data,
    id: requireText(data.id, 'Identifier'),
    date: requireDate(data.date),
    activity: requireText(data.activity, 'Activity', 80),
    durationMinutes: requireNumber(data.durationMinutes, 'Duration', 1, 1440),
    intensity: requireChoice(data.intensity, ['Low', 'Medium', 'High'], 'intensity'),
    kind: requireChoice(data.kind, ['Workout', 'Active rest'], 'activity type'),
    status: requireChoice(data.status, ['Planned', 'Completed', 'Cancelled'], 'status'),
  });
}

export function overlappingActivities(
  activity: PlannedActivity,
  others: readonly PlannedActivity[],
): readonly PlannedActivity[] {
  if (!activity.startTime) return [];
  const start = Date.parse(activity.date + 'T' + activity.startTime + ':00Z');
  const end = start + activity.durationMinutes * 60000;
  return others.filter((other) => {
    if (other.id === activity.id || other.status === 'Cancelled' || !other.startTime) return false;
    const otherStart = Date.parse(other.date + 'T' + other.startTime + ':00Z');
    return start < otherStart + other.durationMinutes * 60000 && end > otherStart;
  });
}
