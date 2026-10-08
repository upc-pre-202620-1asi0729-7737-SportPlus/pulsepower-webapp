import { SleepData } from '../../domain/model/sleep-data';
export abstract class SleepRepository {
  abstract load(): Promise<SleepData>;
  abstract save(data: SleepData): Promise<void>;
}
