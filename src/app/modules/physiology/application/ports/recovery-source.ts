import { RecoveryInput } from '../../domain/model/recovery-simulation';
export abstract class RecoverySource {
  abstract read(): Promise<{ rows: readonly RecoveryInput[]; goal: string; targetHours: number }>;
}
