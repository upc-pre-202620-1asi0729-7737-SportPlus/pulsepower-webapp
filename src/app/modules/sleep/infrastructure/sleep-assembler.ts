import {
  asArray,
  asRecord,
  textField,
  numberField,
} from '../../../shared/infrastructure/browser-storage';
import { requireChoice } from '../../../shared/domain/validation';
import { SleepData } from '../domain/model/sleep-data';
import { sleepRecord } from '../domain/model/sleep-record.entity';
import { sleepRoutine } from '../domain/model/sleep-routine';
import { SleepDto } from './sleep.dto';
export const SleepAssembler = {
  toDomain(value: unknown): SleepData {
    const dto = asRecord(value),
      routine = dto['routine'] === null ? null : asRecord(dto['routine']);
    return {
      records: asArray(dto['records']).map((value) => {
        const row = asRecord(value);
        return sleepRecord({
          id: textField(row, 'id'),
          startedAt: textField(row, 'started_at'),
          endedAt: textField(row, 'ended_at'),
          source: requireChoice(textField(row, 'source'), ['MANUAL', 'AIoTI'], 'source'),
          sleepScore: row['sleep_score'] === null ? null : numberField(row, 'sleep_score'),
          notes: textField(row, 'notes'),
        });
      }),
      routine: routine
        ? sleepRoutine({
          bedtime: textField(routine, 'bedtime'),
          wakeTime: textField(routine, 'wake_time'),
          targetHours: numberField(routine, 'target_hours'),
          reminderEnabled: routine['reminder_enabled'] === true,
        })
        : null,
    };
  },
  toDto(data: SleepData): SleepDto {
    return {
      records: data.records.map((row) => ({
        id: row.id,
        started_at: row.startedAt,
        ended_at: row.endedAt,
        source: row.source,
        sleep_score: row.sleepScore,
        notes: row.notes,
      })),
      routine: data.routine
        ? {
          bedtime: data.routine.bedtime,
          wake_time: data.routine.wakeTime,
          target_hours: data.routine.targetHours,
          reminder_enabled: data.routine.reminderEnabled,
        }
        : null,
    };
  },
};
