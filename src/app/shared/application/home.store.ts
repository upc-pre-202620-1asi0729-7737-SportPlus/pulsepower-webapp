import { Injectable, inject, signal } from '@angular/core';
import { TrainingStore } from '../../modules/training/application/training.store';
import { SleepStore } from '../../modules/sleep/application/sleep.store';
import { WellnessStore, CheckInCommand } from '../../modules/wellness/application/wellness.store';
import { PhysiologicalStore } from '../../modules/physiology/application/physiological.store';
@Injectable({ providedIn: 'root' })
export class HomeStore {
  readonly training = inject(TrainingStore);
  readonly sleep = inject(SleepStore);
  readonly wellness = inject(WellnessStore);
  readonly physiology = inject(PhysiologicalStore);
  readonly loading = signal(false);
  async load(): Promise<void> {
    this.loading.set(true);
    try {
      await Promise.all([
        this.training.load(),
        this.sleep.load(),
        this.wellness.load(),
        this.physiology.load(),
      ]);
    } finally {
      this.loading.set(false);
    }
  }
  async saveCheckIn(command: CheckInCommand): Promise<void> {
    if (await this.wellness.saveCheckIn(command)) await this.physiology.load();
  }
}
