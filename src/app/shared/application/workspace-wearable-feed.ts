import { Api } from '../infrastructure/api';
import { Injectable, inject } from '@angular/core';
import { WearableFeed } from '../../modules/physiology/application/ports/wearable-feed';
import { SimulatedDay } from '../../modules/physiology/domain/model/wearable-simulation';
import { SleepStore } from '../../modules/sleep/application/sleep.store';
import { TrainingStore } from '../../modules/training/application/training.store';
import { WellnessStore } from '../../modules/wellness/application/wellness.store';

const NOTE = 'Simulated wearable reading';

/** Sends simulated wearable readings to the Sleep, Training and Wellness records. */
@Injectable()
export class WorkspaceWearableFeed extends WearableFeed {
  private readonly api = inject(Api);
  private readonly sleep = inject(SleepStore);
  private readonly training = inject(TrainingStore);
  private readonly wellness = inject(WellnessStore);
  async sync(day: SimulatedDay): Promise<void> {
    // Load first: saving into a store that was never loaded would overwrite its records.
    const loaded = await Promise.all([
      this.sleep.load(),
      this.training.load(),
      this.wellness.load(),
    ]);
    if (loaded.some((ok) => !ok))
      throw new Error('Some records could not be loaded. Please retry.');
    if (day.night && !(await this.sleep.syncDeviceNight({ ...day.night, notes: NOTE })))
      throw new Error(this.sleep.error() ?? 'simulator.failed');
    if (
      day.workout &&
      !(await this.training.syncDeviceSession({ ...day.workout, date: day.date, notes: NOTE }))
    )
      throw new Error(this.training.error() ?? 'simulator.failed');
    if (
      day.wellness &&
      !(await this.wellness.saveCheckIn({
        ...day.wellness,
        date: day.date,
        discomfort: false,
        notes: NOTE,
      }))
    )
      throw new Error(this.wellness.error() ?? 'simulator.failed');
    const overview=await this.api.get('/physiology/overview');
    if(!overview.connection || overview.connection.status!=='connected')await this.api.post('/physiology/connection',{provider:'AIoTI simulated'});
    await this.api.post('/physiology/sync');
  }
}
