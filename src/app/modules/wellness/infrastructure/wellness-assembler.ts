import {
  asArray,
  asRecord,
  textField,
  numberField,
} from '../../../shared/infrastructure/browser-storage';
import { WellnessData } from '../domain/model/wellness-data';
import { wellnessCheckIn } from '../domain/model/wellness-check-in.entity';
import { wellnessHabit } from '../domain/model/wellness-habit.entity';
import { WellnessDto } from './wellness.dto';
export const WellnessAssembler = {
  toDomain(value: unknown): WellnessData {
    const dto = asRecord(value);
    return {
      checkIns: asArray(dto['check_ins']).map((value) => {
        const row = asRecord(value);
        return wellnessCheckIn({
          id: textField(row, 'id'),
          date: textField(row, 'date'),
          mood: numberField(row, 'mood'),
          stress: numberField(row, 'stress'),
          discomfort: row['discomfort'] === true,
          notes: textField(row, 'notes'),
        });
      }),
      habits: asArray(dto['habits']).map((value) => {
        const row = asRecord(value);
        return wellnessHabit({
          id: textField(row, 'id'),
          name: textField(row, 'name'),
          weeklyTarget: numberField(row, 'weekly_target'),
        });
      }),
      logs: asArray(dto['logs']).map((value) => {
        const row = asRecord(value);
        return { habitId: textField(row, 'habit_id'), date: textField(row, 'date') };
      }),
    };
  },
  toDto(data: WellnessData): WellnessDto {
    return {
      check_ins: data.checkIns.map((row) => ({ ...row })),
      habits: data.habits.map((row) => ({
        id: row.id,
        name: row.name,
        weekly_target: row.weeklyTarget,
      })),
      logs: data.logs.map((row) => ({ habit_id: row.habitId, date: row.date })),
    };
  },
};
