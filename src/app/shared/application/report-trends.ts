import { Injectable, computed, inject } from '@angular/core';
import { TrainingStore } from '../../modules/training/application/training.store';
import { SleepStore } from '../../modules/sleep/application/sleep.store';
import { WellnessStore } from '../../modules/wellness/application/wellness.store';
import { Clock } from './clock';
import { dayLabel, lastDays, localDate } from './calendar';
import { WorkspaceMode } from './workspace-mode';
import { ChartSeries } from './chart-series';

@Injectable({ providedIn: 'root' })
export class ReportTrends {
  private readonly training = inject(TrainingStore);
  private readonly sleep = inject(SleepStore);
  private readonly wellness = inject(WellnessStore);
  private readonly clock = inject(Clock);
  readonly demo = inject(WorkspaceMode).mode === 'demo';
  readonly series = computed<readonly ChartSeries[]>(() => {
    const days = lastDays(this.clock.today());
    const points = (value: (date: string, i: number) => number | null) =>
      days.map((date, i) => ({ label: dayLabel(date), value: value(date, i) }));
    return [
      {
        label: 'Sleep',
        color: '#8b5cf6',
        unit: 'hours',
        points: points((date) => {
          const rows = this.sleep.records().filter((r) => localDate(new Date(r.endedAt)) === date);
          return rows.length
            ? Math.round(
                rows.reduce(
                  (sum, r) => sum + (Date.parse(r.endedAt) - Date.parse(r.startedAt)) / 3600000,
                  0,
                ) * 10,
              ) / 10
            : null;
        }),
      },
      {
        label: 'Training',
        color: '#14b8a6',
        unit: 'min',
        points: points((date) => {
          const rows = this.training.sessions().filter((r) => r.date === date);
          return rows.length ? rows.reduce((sum, r) => sum + r.durationMinutes, 0) : null;
        }),
      },
      this.demo
        ? {
            label: 'HRV · demo',
            color: '#10b981',
            unit: 'ms',
            points: points((_, i) => [65, 67, 64, 70, 62, 68, 68][i]!),
          }
        : {
            label: 'Stress (1–10)',
            color: '#f43f5e',
            unit: '/10',
            points: points(
              (date) => this.wellness.checkIns().find((r) => r.date === date)?.stress ?? null,
            ),
          },
    ];
  });
  async load(): Promise<void> {
    await Promise.all([this.training.load(), this.sleep.load(), this.wellness.load()]);
  }
}
