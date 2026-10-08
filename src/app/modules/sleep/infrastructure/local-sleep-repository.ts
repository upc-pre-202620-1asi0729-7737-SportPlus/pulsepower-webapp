import { Injectable, inject } from '@angular/core';
import { BrowserStorage } from '../../../shared/infrastructure/browser-storage';
import { SleepRepository } from '../application/ports/sleep-repository';
import { SleepData, emptySleep } from '../domain/model/sleep-data';
import { SleepAssembler } from './sleep-assembler';
@Injectable()
export class LocalSleepRepository extends SleepRepository {
  private readonly storage = inject(BrowserStorage);
  async load(): Promise<SleepData> {
    return this.storage.read('sleep', SleepAssembler.toDomain, emptySleep);
  }
  async save(data: SleepData): Promise<void> {
    await this.load();
    this.storage.write('sleep', SleepAssembler.toDto(data));
  }
}
