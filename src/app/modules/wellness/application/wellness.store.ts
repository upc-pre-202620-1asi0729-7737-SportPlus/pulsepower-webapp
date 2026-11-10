import { Injectable, computed, inject, signal } from '@angular/core';
import { ActionState } from '../../../shared/application/action-state';
import { Clock } from '../../../shared/application/clock';
import { dayLabel, weekDays, lastDays } from '../../../shared/application/calendar';
import { WellnessRepository } from './ports/wellness-repository';
import { WellnessCheckIn } from '../domain/model/wellness-check-in.entity';
import { emptyWellness, saveCheckIn, toggleHabit } from '../domain/model/wellness-data';
import { wellnessHabit } from '../domain/model/wellness-habit.entity';
export type CheckInCommand = {
  -readonly [K in keyof Omit<WellnessCheckIn, 'id'>]: WellnessCheckIn[K];
};
@Injectable({ providedIn: 'root' })
export class WellnessStore extends ActionState {
  private readonly repository = inject(WellnessRepository);
  private readonly clock = inject(Clock);
  private readonly data = signal(emptyWellness());
  readonly today = this.clock.today();
  readonly checkIns = computed(() =>
    [...this.data().checkIns].sort((a, b) => b.date.localeCompare(a.date)),
  );
  readonly todayCheckIn = computed(
    () => this.checkIns().find((row) => row.date === this.today) ?? null,
  );
  readonly weekCheckIns = computed(() =>
    this.checkIns().filter((row) => weekDays(this.today).includes(row.date)),
  );
  readonly averageStress = computed(() => this.average('stress'));
  readonly averageMood = computed(() => this.average('mood'));
  readonly habits = computed(() =>
    this.data().habits.map((habit) => ({
      ...habit,
      completedToday: this.data().logs.some(
        (log) => log.habitId === habit.id && log.date === this.today,
      ),
      completedThisWeek: this.data().logs.filter(
        (log) => log.habitId === habit.id && weekDays(this.today).includes(log.date),
      ).length,
    })),
  );
  readonly chart = computed(() =>
    weekDays(this.today).map((date) => ({
      label: dayLabel(date),
      value: this.checkIns().find((row) => row.date === date)?.stress ?? null,
    })),
  );
  readonly trendSeries = computed(() => [
    {
      label: 'Mood (1–5)',
      color: '#14b8a6',
      unit: '/5',
      maximum: 10,
      points: lastDays(this.today).map((date) => ({
        label: dayLabel(date),
        value: this.checkIns().find((row) => row.date === date)?.mood ?? null,
      })),
    },
    {
      label: 'Stress (1–10)',
      color: '#f43f5e',
      unit: '/10',
      maximum: 10,
      points: lastDays(this.today).map((date) => ({
        label: dayLabel(date),
        value: this.checkIns().find((row) => row.date === date)?.stress ?? null,
      })),
    },
  ]);
  load(): Promise<boolean> {
    return this.read(async () => this.data.set(await this.repository.load()));
  }
  saveCheckIn(command: CheckInCommand): Promise<boolean> {
    return this.execute(async () => {
      const next = saveCheckIn(this.data(), { ...command, id: this.clock.id() });
      await this.repository.save(next);
      this.data.set(next);
    }, 'Check-in saved.');
  }
  addHabit(name: string, weeklyTarget: number): Promise<boolean> {
    return this.execute(async () => {
      const habit = wellnessHabit({ id: this.clock.id(), name, weeklyTarget });
      const next = { ...this.data(), habits: [...this.data().habits, habit] };
      await this.repository.save(next);
      this.data.set(next);
    }, 'Habit added.');
  }
  toggleHabit(id: string): Promise<boolean> {
    return this.execute(async () => {
      const next = toggleHabit(this.data(), id, this.today);
      await this.repository.save(next);
      this.data.set(next);
    }, 'Habit progress updated.');
  }
  private average(field: 'stress' | 'mood'): string {
    const rows = this.weekCheckIns();
    return rows.length
      ? (rows.reduce((sum, row) => sum + row[field], 0) / rows.length).toFixed(1)
      : '—';
  }
}

export type { WellnessCheckIn } from '../domain/model/wellness-check-in.entity';
