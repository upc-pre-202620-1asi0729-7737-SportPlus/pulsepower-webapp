import { requireChoice } from '../../../shared/domain/validation';
import {
  asArray,
  asRecord,
  numberField,
  textField,
} from '../../../shared/infrastructure/browser-storage';
import { TrainingData } from '../domain/model/training-data';
import { plannedActivity } from '../domain/model/planned-activity.entity';
import { trainingSession } from '../domain/model/training-session.entity';
import { TrainingDto } from './training.dto';

export const TrainingAssembler = {
  toDomain(value: unknown): TrainingData {
    const dto = asRecord(value);
    const plan = asRecord(dto['plan']);
    return {
      sessions: asArray(dto['sessions']).map((value) => {
        const row = asRecord(value);
        return trainingSession({
          id: textField(row, 'id'),
          date: textField(row, 'date'),
          activity: textField(row, 'activity'),
          durationMinutes: numberField(row, 'duration_minutes'),
          perceivedEffort: numberField(row, 'perceived_effort'),
          notes: textField(row, 'notes'),
          plannedActivityId:
            row['planned_activity_id'] === null ? null : textField(row, 'planned_activity_id'),
        });
      }),
      plan: {
        id: textField(plan, 'id'),
        name: textField(plan, 'name'),
        period: plan['period']
          ? {
              from: textField(asRecord(plan['period']), 'from'),
              to: textField(asRecord(plan['period']), 'to'),
            }
          : (() => {
              const dates = asArray(plan['activities'])
                .map((a) => textField(asRecord(a), 'date'))
                .sort();
              return dates.length ? { from: dates[0]!, to: dates[dates.length - 1]! } : null;
            })(),
        activities: asArray(plan['activities']).map((value) => {
          const row = asRecord(value);
          return plannedActivity({
            startTime: row['start_time'] == null ? null : textField(row, 'start_time'),
            id: textField(row, 'id'),
            date: textField(row, 'date'),
            activity: textField(row, 'activity'),
            durationMinutes: numberField(row, 'duration_minutes'),
            intensity: requireChoice(
              textField(row, 'intensity'),
              ['Low', 'Medium', 'High'],
              'intensity',
            ),
            kind: requireChoice(textField(row, 'kind'), ['Workout', 'Active rest'], 'kind'),
            status: requireChoice(
              textField(row, 'status'),
              ['Planned', 'Completed', 'Cancelled'],
              'status',
            ),
          });
        }),
      },
    };
  },
  toDto(data: TrainingData): TrainingDto {
    return {
      sessions: data.sessions.map((row) => ({
        id: row.id,
        date: row.date,
        activity: row.activity,
        duration_minutes: row.durationMinutes,
        perceived_effort: row.perceivedEffort,
        notes: row.notes,
        planned_activity_id: row.plannedActivityId,
      })),
      plan: {
        id: data.plan.id,
        name: data.plan.name,
        period: data.plan.period ?? null,
        activities: data.plan.activities.map((row) => ({
          start_time: row.startTime ?? null,
          id: row.id,
          date: row.date,
          activity: row.activity,
          duration_minutes: row.durationMinutes,
          intensity: row.intensity,
          kind: row.kind,
          status: row.status,
        })),
      },
    };
  },
};
