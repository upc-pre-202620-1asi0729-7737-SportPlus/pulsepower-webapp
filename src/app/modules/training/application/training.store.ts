import { setPlanPeriod, checkPlanDate } from '../domain/model/training-plan.entity';
import { Injectable, computed, inject, signal } from '@angular/core';
import { ActionState } from '../../../shared/application/action-state';
import { Clock } from '../../../shared/application/clock';
import { dayLabel, weekDays, lastDays } from '../../../shared/application/calendar';
import { DomainError } from '../../../shared/domain/validation';
import {
  PlannedActivity,
  plannedActivity,
  overlappingActivities,
} from '../domain/model/planned-activity.entity';
import { TrainingSession } from '../domain/model/training-session.entity';
import { emptyTraining, recordSession } from '../domain/model/training-data';
import { TrainingRepository } from './ports/training-repository';

export type SessionCommand = {
  -readonly [K in keyof Omit<TrainingSession, 'id'>]: TrainingSession[K];
};
export type ActivityCommand = {
  -readonly [K in keyof Omit<PlannedActivity, 'id' | 'status'>]: PlannedActivity[K];
};
export type { TrainingSession } from '../domain/model/training-session.entity';
export type { PlannedActivity } from '../domain/model/planned-activity.entity';

@Injectable({ providedIn: 'root' })
export class TrainingStore extends ActionState {
  readonly scheduleConflicts = signal<readonly PlannedActivity[]>([]);
  private readonly repository = inject(TrainingRepository);
  private readonly clock = inject(Clock);
  private readonly data = signal(emptyTraining());
  readonly period = computed(() => this.data().plan.period ?? null);
  setPeriod(from: string, to: string): Promise<boolean> {
    return this.execute(async () => {
      const next = { ...this.data(), plan: setPlanPeriod(this.data().plan, from, to) };
      await this.repository.save(next);
      this.data.set(next);
    });
  }
  readonly today = this.clock.today();
  readonly weekOffset = signal(0);
  readonly days = computed(() => weekDays(this.today, this.weekOffset()));
  readonly sessions = computed(() =>
    [...this.data().sessions].sort((a, b) => b.date.localeCompare(a.date)),
  );
  readonly activities = computed(() => this.data().plan.activities);
  readonly weeklyProgress = computed(() => {
    const days = this.days().filter((day) => day <= this.today);
    const training = new Set(this.sessions().map((session) => session.date));
    const rest = new Set(
      this.activities()
        .filter((activity) => activity.kind === 'Active rest' && activity.status !== 'Cancelled')
        .map((activity) => activity.date),
    );
    return {
      recorded: days.filter((day) => training.has(day)).length,
      activeRest: days.filter((day) => !training.has(day) && rest.has(day)).length,
      withoutRecord: days.filter((day) => !training.has(day) && !rest.has(day)).length,
    };
  });
  clearScheduleConflicts(): void {
    this.scheduleConflicts.set([]);
  }
  readonly weekSessions = computed(() =>
    this.sessions().filter((row) => weekDays(this.today).includes(row.date)),
  );
  readonly totalMinutes = computed(() =>
    this.weekSessions().reduce((sum, row) => sum + row.durationMinutes, 0),
  );
  readonly averageEffort = computed(() =>
    this.weekSessions().length
      ? (
          this.weekSessions().reduce((sum, row) => sum + row.perceivedEffort, 0) /
          this.weekSessions().length
        ).toFixed(1)
      : '—',
  );
  readonly chart = computed(() =>
    weekDays(this.today).map((date) => {
      const records = this.sessions().filter((row) => row.date === date);
      return {
        label: dayLabel(date),
        value: records.length ? records.reduce((sum, row) => sum + row.durationMinutes, 0) : null,
      };
    }),
  );
  readonly trendSeries = computed(() => [
    {
      label: 'Training',
      color: '#14b8a6',
      unit: 'min',
      points: lastDays(this.today, 8).map((date) => {
        const rows = this.sessions().filter((row) => row.date === date);
        return {
          label: date.slice(5),
          value: rows.length ? rows.reduce((sum, row) => sum + row.durationMinutes, 0) : null,
        };
      }),
    },
  ]);
  load(): Promise<boolean> {
    return this.read(async () => this.data.set(await this.repository.load()));
  }
  async addSession(command: SessionCommand): Promise<boolean> {
    return this.execute(async () => {
      const next = recordSession(this.data(), { ...command, id: this.clock.id() });
      await this.repository.save(next);
      this.data.set(next);
    }, 'Training session saved.');
  }
  async planActivity(command: ActivityCommand, acceptOverlap = false): Promise<boolean> {
    this.clearScheduleConflicts();
    return this.execute(async () => {
      const activity = plannedActivity({ ...command, id: this.clock.id(), status: 'Planned' });
      checkPlanDate(this.data().plan, activity.date);
      const conflicts = overlappingActivities(activity, this.activities());
      if (conflicts.length && !acceptOverlap) {
        this.scheduleConflicts.set(conflicts);
        throw new DomainError(
          'This activity overlaps another scheduled activity. Review the times before confirming.',
        );
      }
      const next = {
        ...this.data(),
        plan: { ...this.data().plan, activities: [...this.activities(), activity] },
      };
      await this.repository.save(next);
      this.data.set(next);
    }, 'Activity added to your plan.');
  }
  async cancelActivity(id: string): Promise<boolean> {
    return this.execute(async () => {
      const activity = this.activities().find((row) => row.id === id);
      if (!activity || activity.status !== 'Planned')
        throw new DomainError('Only a planned activity can be cancelled.');
      const next = {
        ...this.data(),
        plan: {
          ...this.data().plan,
          activities: this.activities().map((row) =>
            row.id === id ? { ...row, status: 'Cancelled' as const } : row,
          ),
        },
      };
      await this.repository.save(next);
      this.data.set(next);
    }, 'Activity cancelled.');
  }
  async reschedule(
    id: string,
    date: string,
    startTime?: string | null,
    acceptOverlap = false,
  ): Promise<boolean> {
    this.clearScheduleConflicts();
    return this.execute(async () => {
      const activity = this.activities().find((row) => row.id === id);
      if (!activity || activity.status !== 'Planned')
        throw new DomainError('Only a planned activity can be rescheduled.');
      const updated = plannedActivity({
        ...activity,
        date,
        startTime: startTime === undefined ? activity.startTime : startTime,
      });
      checkPlanDate(this.data().plan, updated.date);
      const conflicts = overlappingActivities(updated, this.activities());
      if (conflicts.length && !acceptOverlap) {
        this.scheduleConflicts.set(conflicts);
        throw new DomainError(
          'This activity overlaps another scheduled activity. Review the times before confirming.',
        );
      }
      const next = {
        ...this.data(),
        plan: {
          ...this.data().plan,
          activities: this.activities().map((row) => (row.id === id ? updated : row)),
        },
      };
      await this.repository.save(next);
      this.data.set(next);
    }, 'Activity rescheduled.');
  }
}
