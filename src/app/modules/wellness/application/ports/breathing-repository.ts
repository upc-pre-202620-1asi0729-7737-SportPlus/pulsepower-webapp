import { BreathingSession } from '../../domain/model/breathing-session';
export abstract class BreathingRepository {
  abstract list(): Promise<readonly BreathingSession[]>;
  abstract save(session: BreathingSession): Promise<void>;
}
