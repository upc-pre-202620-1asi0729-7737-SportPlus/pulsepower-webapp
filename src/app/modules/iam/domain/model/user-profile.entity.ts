import { PersonalGoal } from './personal-goal.entity';
import {
  requireText,
  requireChoice,
  requireNumber,
  optionalText,
} from '../../../../shared/domain/validation';

export interface UserProfile {
  readonly displayName: string;
  readonly focus: 'Athlete' | 'Wellness Seeker';
  readonly age: number | null;
  readonly weightKg: number | null;
  readonly heightCm: number | null;
  readonly mainSport: string;
  readonly trainingRoutine?: string;
  readonly physicalHistory?: string;
  readonly goals: readonly PersonalGoal[];
}

export function userProfile(value: UserProfile): UserProfile {
  return Object.freeze({
    ...value,
    displayName: requireText(value.displayName, 'Full name', 100),
    focus: requireChoice(value.focus, ['Athlete', 'Wellness Seeker'], 'focus'),
    age: value.age === null ? null : requireNumber(value.age, 'Age', 1, 130),
    weightKg: value.weightKg === null ? null : requireNumber(value.weightKg, 'Weight', 1, 500),
    heightCm: value.heightCm === null ? null : requireNumber(value.heightCm, 'Height', 1, 300),
    mainSport: optionalText(value.mainSport, 'Main sport', 80),
    trainingRoutine: optionalText(value.trainingRoutine ?? '', 'Training routine', 2000),
    physicalHistory: optionalText(value.physicalHistory ?? '', 'Physical history', 2000),
  });
}
