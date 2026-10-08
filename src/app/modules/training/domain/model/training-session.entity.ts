import {
  requireText,
  requireDate,
  requireNumber,
  optionalText,
} from '../../../../shared/domain/validation';

export interface TrainingSession {
  readonly id: string;
  readonly date: string;
  readonly activity: string;
  readonly durationMinutes: number;
  readonly perceivedEffort: number;
  readonly notes: string;
  readonly plannedActivityId: string | null;
}

export function trainingSession(data: TrainingSession): TrainingSession {
  return Object.freeze({
    ...data,
    id: requireText(data.id, 'Identifier'),
    date: requireDate(data.date),
    activity: requireText(data.activity, 'Activity', 80),
    durationMinutes: requireNumber(data.durationMinutes, 'Duration', 1, 1440),
    perceivedEffort: requireNumber(data.perceivedEffort, 'Perceived effort', 1, 10),
    notes: optionalText(data.notes, 'Notes'),
  });
}
