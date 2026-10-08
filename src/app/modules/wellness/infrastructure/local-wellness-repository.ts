import { Injectable, inject } from '@angular/core';
import { BrowserStorage } from '../../../shared/infrastructure/browser-storage';
import { WellnessRepository } from '../application/ports/wellness-repository';
import { WellnessData, emptyWellness } from '../domain/model/wellness-data';
import { WellnessAssembler } from './wellness-assembler';
@Injectable()
export class LocalWellnessRepository extends WellnessRepository {
  private readonly storage = inject(BrowserStorage);
  async load(): Promise<WellnessData> {
    return this.storage.read('wellness', WellnessAssembler.toDomain, emptyWellness);
  }
  async save(data: WellnessData): Promise<void> {
    await this.load();
    this.storage.write('wellness', WellnessAssembler.toDto(data));
  }
}
