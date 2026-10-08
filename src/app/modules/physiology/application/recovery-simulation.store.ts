import { Injectable, inject, signal, computed } from '@angular/core';
import { RecoverySource } from './ports/recovery-source';
import {
  simulateRecovery,
  compareRecovery,
  insufficientSleep,
  SimulatedRecovery,
} from '../domain/model/recovery-simulation';
@Injectable({ providedIn: 'root' })
export class RecoverySimulationStore {
  private readonly source = inject(RecoverySource);
  readonly rows = signal<readonly SimulatedRecovery[]>([]);
  readonly goal = signal('');
  readonly targetHours = signal(8);
  readonly comparison = computed(() => compareRecovery(this.rows()));
  readonly last = computed(() => this.rows().at(-1));
  readonly days = computed(() => this.rows().filter((r) => r.score !== null).length);
  readonly sleepAlert = computed(() => insufficientSleep(this.rows(), this.targetHours()));
  readonly missing = computed(() => Math.max(0, 7 - this.days()));
  readonly series = computed(() => [
    {
      label: 'Recovery simulation',
      color: '#14b8a6',
      unit: '%',
      maximum: 100,
      points: this.rows()
        .slice(-14)
        .map((r) => ({ label: r.date.slice(5), value: r.score })),
    },
  ]);
  async load(): Promise<void> {
    const value = await this.source.read();
    this.goal.set(value.goal);
    this.targetHours.set(value.targetHours);
    this.rows.set(simulateRecovery(value.rows));
  }
}
