import { Injectable, inject } from '@angular/core';
import {
  BrowserStorage,
  asArray,
  asRecord,
  textField,
} from '../../../shared/infrastructure/browser-storage';
import { BreathingRepository } from '../application/ports/breathing-repository';
import { BreathingSession } from '../domain/model/breathing-session';
interface BreathingSessionDto {
  id: string;
  started_at: string;
  ended_at: string;
  completed: boolean;
}
function toDomain(value: unknown): BreathingSession {
  const row = asRecord(value);
  return {
    id: textField(row, 'id'),
    startedAt: textField(row, 'started_at'),
    endedAt: textField(row, 'ended_at'),
    completed: row['completed'] === true,
  };
}
function toDto(row: BreathingSession): BreathingSessionDto {
  return { id: row.id, started_at: row.startedAt, ended_at: row.endedAt, completed: row.completed };
}
@Injectable()
export class LocalBreathingRepository extends BreathingRepository {
  private readonly storage = inject(BrowserStorage);
  async list(): Promise<readonly BreathingSession[]> {
    return this.storage.read(
      'breathing',
      (v) => asArray(v).map(toDomain),
      () => [],
    );
  }
  async save(session: BreathingSession): Promise<void> {
    this.storage.write(
      'breathing',
      [session, ...(await this.list()).filter((r) => r.id !== session.id)].map(toDto),
    );
  }
}
