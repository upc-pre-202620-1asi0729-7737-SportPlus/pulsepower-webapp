import { Injectable, computed, inject } from '@angular/core';
import { SleepStore } from './sleep.store';
import { WorkspaceMode } from '../../../shared/application/workspace-mode';
import { Clock } from '../../../shared/application/clock';
import { lastDays, dayLabel, localDate } from '../../../shared/application/calendar';

@Injectable({ providedIn: 'root' })
export class SleepInsights {
  private readonly store = inject(SleepStore);
  private readonly clock = inject(Clock);
  readonly demo = inject(WorkspaceMode).mode === 'demo';
  readonly legend = [
    { label: 'Awake', color: '#f59e0b' },
    { label: 'Deep', color: '#101b35' },
    { label: 'Light', color: '#c4b5fd' },
    { label: 'REM', color: '#14b8a6' },
  ];
  readonly stages = computed(() => {
    const record = this.store.latest();
    if (!this.demo || !record) return [];
    const minutes = (Date.parse(record.endedAt) - Date.parse(record.startedAt)) / 60000;
    const pattern = [
      [5, 0, 55, 0],
      [3, 30, 27, 0],
      [0, 45, 15, 0],
      [0, 40, 10, 10],
      [0, 15, 5, 40],
      [5, 5, 5, 45],
      [3, 20, 17, 20],
      [5, 10, 10, 35],
    ];
    return Array.from({ length: Math.ceil(minutes / 60) }, (_, index) => {
      const date = new Date(Date.parse(record.startedAt) + index * 3600000);
      const duration = Math.min(60, minutes - index * 60);
      return {
        label:
          String(date.getHours()).padStart(2, '0') +
          ':' +
          String(date.getMinutes()).padStart(2, '0'),
        values: pattern[index % pattern.length]!.map(
          (value) => Math.round((value / 60) * duration * 10) / 10,
        ),
      };
    });
  });
  readonly scores = computed(() => this.scoreSeries(7));
  readonly monthScores = computed(() => this.scoreSeries(30));
  private scoreSeries(days: number) {
    return [
      {
        label: 'Sleep score',
        color: '#8b5cf6',
        unit: 'points',
        maximum: 100,
        points: lastDays(this.clock.today(), days).map((date) => {
          const records = this.store
            .records()
            .filter((r) => localDate(new Date(r.endedAt)) === date);
          return {
            label: days > 7 ? date.slice(5) : dayLabel(date),
            value: this.demo
              ? records.length
                ? Math.min(
                  100,
                  Math.round(
                    (records.reduce(
                        (sum, r) =>
                          sum + (Date.parse(r.endedAt) - Date.parse(r.startedAt)) / 3600000,
                        0,
                      ) /
                      (this.store.routine()?.targetHours ?? 8)) *
                    100,
                  ),
                )
                : null
              : records.filter((r) => r.sleepScore !== null).length
                ? Math.round(
                  records.reduce((sum, r) => sum + (r.sleepScore ?? 0), 0) /
                  records.filter((r) => r.sleepScore !== null).length,
                )
                : null,
          };
        }),
      },
    ];
  }
}
