export interface PhysiologicalRecord {
  readonly id: string;
  readonly metric: 'HRV' | 'RESTING_HR' | 'HEART_RATE' | 'STRAIN';
  readonly value: number;
  readonly unit: string;
  readonly recordedAt: string;
}
