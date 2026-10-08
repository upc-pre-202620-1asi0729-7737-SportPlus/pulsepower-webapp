import { WearableConnection } from './wearable-connection.entity';
import { PhysiologicalRecord } from './physiological-record.entity';
import { RecoveryAssessment } from './recovery-assessment.entity';
import { Recommendation } from './recommendation.entity';
import { GuidanceAlert } from './guidance-alert.entity';

export interface PhysiologicalOverview {
  readonly connection: WearableConnection | null;
  readonly records: readonly PhysiologicalRecord[];
  readonly assessment: RecoveryAssessment | null;
  readonly recommendations: readonly Recommendation[];
  readonly alerts: readonly GuidanceAlert[];
  readonly available: boolean;
}
