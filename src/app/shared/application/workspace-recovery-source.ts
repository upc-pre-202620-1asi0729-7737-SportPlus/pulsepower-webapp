import { Injectable, inject } from '@angular/core';
import { RecoverySource } from '../../modules/physiology/application/ports/recovery-source';
import { TrainingStore } from '../../modules/training/application/training.store';
import { SleepStore } from '../../modules/sleep/application/sleep.store';
import { WellnessStore } from '../../modules/wellness/application/wellness.store';
import { ProfileStore } from '../../modules/iam/application/profile.store';
import { Clock } from './clock';
import { lastDays, localDate } from './calendar';
@Injectable()
export class WorkspaceRecoverySource extends RecoverySource {
  private readonly training = inject(TrainingStore);
  private readonly sleep = inject(SleepStore);
  private readonly wellness = inject(WellnessStore);
  private readonly profile = inject(ProfileStore);
  private readonly clock = inject(Clock);
  async read() {
    const results = await Promise.all([
      this.training.load(),
      this.sleep.load(),
      this.wellness.load(),
      this.profile.load(),
    ]);
    if (results.some((r) => !r)) throw Error('Some records could not be loaded. Please retry.');
    return {
      goal:
        this.profile
          .profile()
          ?.goals.filter((g) => !g.completed)
          .map((g) => g.description)
          .join('; ') ?? '',
      targetHours: this.sleep.routine()?.targetHours ?? 8,
      rows: lastDays(this.clock.today(), 30).map((date) => {
        const sleep = this.sleep.records().filter((r) => localDate(new Date(r.endedAt)) === date);
        const training = this.training.sessions().filter((r) => r.date === date);
        return {
          date,
          sleepHours: sleep.length
            ? sleep.reduce(
                (s, r) => s + (Date.parse(r.endedAt) - Date.parse(r.startedAt)) / 3600000,
                0,
              )
            : null,
          stress: this.wellness.checkIns().find((r) => r.date === date)?.stress ?? null,
          effort: training.length
            ? training.reduce((s, r) => s + r.perceivedEffort, 0) / training.length
            : null,
          planned: this.training
            .activities()
            .some((r) => r.date === date && r.kind === 'Workout' && r.status === 'Planned'),
        };
      }),
    };
  }
}
