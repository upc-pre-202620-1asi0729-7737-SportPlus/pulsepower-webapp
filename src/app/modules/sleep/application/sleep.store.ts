import { Injectable, computed, inject, signal } from '@angular/core';
import { ActionState } from '../../../shared/application/action-state';
import { Clock } from '../../../shared/application/clock';
import { dayLabel, lastDays, localDate } from '../../../shared/application/calendar';
import { SleepRepository } from './ports/sleep-repository';
import { SleepRecord, durationHours } from '../domain/model/sleep-record.entity';
import { SleepRoutine, sleepRoutine } from '../domain/model/sleep-routine';
import { addSleepRecord, emptySleep } from '../domain/model/sleep-data';
export type SleepHistoryRow = SleepRecord & { readonly duration: string };
export interface SleepCommand {
  startedAt: string;
  endedAt: string;
  notes: string;
}
export type RoutineCommand = { -readonly [K in keyof SleepRoutine]: SleepRoutine[K] };
@Injectable({ providedIn: 'root' })
export class SleepStore extends ActionState {
  private readonly repository = inject(SleepRepository);
  private readonly clock = inject(Clock);
  private readonly data = signal(emptySleep());
  readonly today = this.clock.today();
  readonly records = computed(() =>
    [...this.data().records].sort((a, b) => b.endedAt.localeCompare(a.endedAt)),
  );
  readonly history = computed<readonly SleepHistoryRow[]>(() =>
    this.records().map((record) => ({
      ...record,
      duration: this.recordDuration(record.startedAt, record.endedAt),
    })),
  );
  readonly routine = computed(() => this.data().routine);
  readonly latest = computed<SleepRecord | null>(() => this.records()[0] ?? null);
  readonly latestDuration = computed(() =>
    this.latest() ? this.formatDuration(durationHours(this.latest()!)) : '—',
  );
  readonly average = computed(() => {
    const rows = this.records().filter((row) =>
      lastDays(this.today).includes(localDate(new Date(row.endedAt))),
    );
    return rows.length
      ? (rows.reduce((sum, row) => sum + durationHours(row), 0) / rows.length).toFixed(1)
      : '—';
  });
  readonly chart = computed(() =>
    lastDays(this.today).map((date) => {
      const rows = this.records().filter((row) => localDate(new Date(row.endedAt)) === date);
      return {
        label: dayLabel(date),
        value: rows.length
          ? Math.round(rows.reduce((sum, row) => sum + durationHours(row), 0) * 10) / 10
          : null,
      };
    }),
  );
  readonly monthDays = computed(() => lastDays(this.today, 30));
  readonly monthChart = computed(() =>
    this.monthDays().map((date) => {
      const records = this.records().filter(
        (record) => localDate(new Date(record.endedAt)) === date,
      );
      return {
        label: date.slice(5),
        value: records.length
          ? Math.round(records.reduce((sum, record) => sum + durationHours(record), 0) * 10) / 10
          : null,
      };
    }),
  );
  readonly recordedMonthDays = computed(
    () => this.monthChart().filter((point) => point.value !== null).length,
  );
  load(): Promise<boolean> {
    return this.read(async () => this.data.set(await this.repository.load()));
  }
  addRecord(command: SleepCommand): Promise<boolean> {
    return this.execute(async () => {
      const next = addSleepRecord(this.data(), {
        id: this.clock.id(),
        startedAt: new Date(command.startedAt).toISOString(),
        endedAt: new Date(command.endedAt).toISOString(),
        source: 'MANUAL',
        sleepScore: null,
        notes: command.notes,
      });
      await this.repository.save(next);
      this.data.set(next);
    }, 'Sleep record saved.');
  }
  saveRoutine(command: RoutineCommand): Promise<boolean> {
    return this.execute(async () => {
      const next = { ...this.data(), routine: sleepRoutine(command) };
      await this.repository.save(next);
      this.data.set(next);
    }, 'Sleep routine saved.');
  }
  recordDuration(start: string, end: string): string {
    return this.formatDuration((Date.parse(end) - Date.parse(start)) / 3600000);
  }
  private formatDuration(hours: number): string {
    const minutes = Math.round(hours * 60);
    return Math.floor(minutes / 60) + 'h ' + (minutes % 60) + 'm';
  }
}
