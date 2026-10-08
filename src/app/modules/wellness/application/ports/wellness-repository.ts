import { WellnessData } from '../../domain/model/wellness-data';
export abstract class WellnessRepository {
  abstract load(): Promise<WellnessData>;
  abstract save(data: WellnessData): Promise<void>;
}
