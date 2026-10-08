import { Injectable, inject } from '@angular/core';
import { BrowserStorage } from '../../../shared/infrastructure/browser-storage';
import { TrainingRepository } from '../application/ports/training-repository';
import { TrainingData, emptyTraining } from '../domain/model/training-data';
import { TrainingAssembler } from './training-assembler';

@Injectable()
export class LocalTrainingRepository extends TrainingRepository {
  private readonly storage = inject(BrowserStorage);
  async load(): Promise<TrainingData> {
    return this.storage.read('training', TrainingAssembler.toDomain, emptyTraining);
  }
  async save(data: TrainingData): Promise<void> {
    await this.load();
    this.storage.write('training', TrainingAssembler.toDto(data));
  }
}
