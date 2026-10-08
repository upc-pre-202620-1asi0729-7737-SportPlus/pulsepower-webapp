import {
  asRecord,
  asArray,
  textField,
  numberField,
} from '../../../shared/infrastructure/browser-storage';
import { requireChoice } from '../../../shared/domain/validation';
import { UserProfile, userProfile } from '../domain/model/user-profile.entity';
import { UserProfileDto } from './user-profile.dto';
export const ProfileAssembler = {
  toDomain(value: unknown): UserProfile {
    const dto = asRecord(value);
    return userProfile({
      displayName: textField(dto, 'display_name'),
      focus: requireChoice(textField(dto, 'focus'), ['Athlete', 'Wellness Seeker'], 'focus'),
      age: dto['age'] === null ? null : numberField(dto, 'age'),
      weightKg: dto['weight_kg'] === null ? null : numberField(dto, 'weight_kg'),
      heightCm: dto['height_cm'] === null ? null : numberField(dto, 'height_cm'),
      mainSport: textField(dto, 'main_sport'),
      trainingRoutine: typeof dto['training_routine'] === 'string' ? dto['training_routine'] : '',
      physicalHistory: typeof dto['physical_history'] === 'string' ? dto['physical_history'] : '',
      goals: asArray(dto['goals']).map((value) => {
        const row = asRecord(value);
        return {
          id: textField(row, 'id'),
          description: textField(row, 'description'),
          completed: row['completed'] === true,
        };
      }),
    });
  },
  toDto(value: UserProfile): UserProfileDto {
    return {
      display_name: value.displayName,
      focus: value.focus,
      age: value.age,
      weight_kg: value.weightKg,
      height_cm: value.heightCm,
      main_sport: value.mainSport,
      training_routine: value.trainingRoutine ?? '',
      physical_history: value.physicalHistory ?? '',
      goals: value.goals.map((row) => ({ ...row })),
    };
  },
};
