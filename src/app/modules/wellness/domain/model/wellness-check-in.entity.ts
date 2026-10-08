import { requireDate, requireNumber, optionalText } from '../../../../shared/domain/validation';

export interface WellnessCheckIn {
  readonly id: string;
  readonly date: string;
  readonly mood: number;
  readonly stress: number;
  readonly discomfort: boolean;
  readonly notes: string;
}

export function wellnessCheckIn(value: WellnessCheckIn): WellnessCheckIn {
  return Object.freeze({
    ...value,
    date: requireDate(value.date),
    mood: requireNumber(value.mood, 'Overall state', 1, 5),
    stress: requireNumber(value.stress, 'Stress', 1, 10),
    notes: optionalText(value.notes, 'Notes'),
  });
}
