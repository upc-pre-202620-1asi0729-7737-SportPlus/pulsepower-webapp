import { Injectable, computed, inject } from '@angular/core';
import { SleepStore } from '../../modules/sleep/application/sleep.store';
import { WellnessStore } from '../../modules/wellness/application/wellness.store';
import { Clock } from './clock';
import { lastDays, localDate } from './calendar';
@Injectable({ providedIn: 'root' })
export class StressSleepSummary {
  private readonly sleep = inject(SleepStore);
  private readonly wellness = inject(WellnessStore);
  private readonly clock = inject(Clock);
  readonly rows = computed(() =>
    lastDays(this.clock.today()).map((date) => {
      const night = this.sleep
        .records()
        .filter((record) => localDate(new Date(record.startedAt)) === date);
      return {
        date,
        stress: this.wellness.checkIns().find((checkIn) => checkIn.date === date)?.stress ?? null,
        hours: night.length
          ? Math.round(
              night.reduce(
                (sum, record) =>
                  sum + (Date.parse(record.endedAt) - Date.parse(record.startedAt)) / 3600000,
                0,
              ) * 10,
            ) / 10
          : null,
      };
    }),
  );
  async load(): Promise<void> {
    await this.sleep.load();
  }
}
