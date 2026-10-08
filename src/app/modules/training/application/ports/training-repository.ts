import { TrainingData } from '../../domain/model/training-data';
export abstract class TrainingRepository {
  abstract load(): Promise<TrainingData>;
  abstract save(data: TrainingData): Promise<void>;
}
