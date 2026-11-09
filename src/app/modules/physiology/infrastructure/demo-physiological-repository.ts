import { Injectable } from '@angular/core';
import { LocalRecoveryRepository } from './local-recovery-repository';
import { PhysiologicalOverviewDto } from './physiological-overview.dto';
/** Demo workspace: illustrative wearable measurements and the shared local recovery rules. */
@Injectable()
export class DemoPhysiologicalRepository extends LocalRecoveryRepository {
  protected readonly provider = 'AIoTI — DEMO';
  protected readonly basis =
    'Demonstration only: sleep hours, stress and perceived effort are used, not wearable measurements.';
  protected async measurements(timestamp: string): Promise<PhysiologicalOverviewDto['records']> {
    return [
      { id: 'demo-hrv', metric: 'HRV', value: 68, unit: 'ms', recorded_at: timestamp },
      {
        id: 'demo-resting-hr',
        metric: 'RESTING_HR',
        value: 56,
        unit: 'bpm',
        recorded_at: timestamp,
      },
    ];
  }
}
