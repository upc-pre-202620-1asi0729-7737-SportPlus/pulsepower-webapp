import { Injectable } from '@angular/core';
import { LocalRecoveryRepository } from './local-recovery-repository';
import { PhysiologicalOverviewDto } from './physiological-overview.dto';
/** Personal recovery uses the records saved in this browser. */
@Injectable()
export class PersonalPhysiologicalRepository extends LocalRecoveryRepository {
  protected readonly provider = 'AIoTI — simulated';
  protected readonly basis = 'Calculated from your sleep, stress and perceived effort records.';
  protected override suggestion(score: number | null): string {
    return score === null
      ? 'No recovery data for today.'
      : score < 40
        ? 'simulator.guidance.rest'
        : score < 70
          ? 'simulator.guidance.reduce'
          : 'simulator.guidance.follow';
  }
  protected async measurements(): Promise<PhysiologicalOverviewDto['records']> {
    return [];
  }
}
