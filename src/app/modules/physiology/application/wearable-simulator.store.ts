import { Injectable, computed, inject, signal } from '@angular/core';
import { ActionState } from '../../../shared/application/action-state';
import { Clock } from '../../../shared/application/clock';
import {
  DayScenario,
  Random,
  SimulatedDay,
  simulateDay,
  simulateWeek,
} from '../domain/model/wearable-simulation';
import { WearableFeed } from './ports/wearable-feed';
import { PhysiologicalStore } from './physiological.store';
import { RecoverySimulationStore } from './recovery-simulation.store';
export interface SimulationEntry {
  readonly id: string;
  readonly day: SimulatedDay;
}
@Injectable({ providedIn: 'root' })
export class WearableSimulatorStore extends ActionState {
  private readonly feed = inject(WearableFeed);
  private readonly clock = inject(Clock);
  private readonly recovery = inject(RecoverySimulationStore);
  private readonly physiology = inject(PhysiologicalStore);
  random: Random = Math.random;
  readonly history = signal<readonly SimulationEntry[]>([]);
  readonly recoveryLevel = computed(() => this.recovery.last()?.score ?? null);
  load(): Promise<boolean> {
    return this.read(() => this.recovery.load());
  }
  simulate(scenario: DayScenario): Promise<boolean> {
    return this.execute(
      () => this.apply([simulateDay(scenario, this.clock.today(), this.random)]),
      'simulator.saved',
    );
  }
  simulateWeek(): Promise<boolean> {
    return this.execute(
      () => this.apply(simulateWeek(this.clock.today(), this.random)),
      'simulator.weekSaved',
    );
  }
  setBattery(level: number): Promise<boolean> {
    return this.execute(
      async () => {
        if (!(await this.physiology.deviceScenario('success', level)))
          throw new Error(this.physiology.error() ?? 'simulator.failed');
      },
      level < 15 ? 'simulator.batteryLow' : 'simulator.batteryRestored',
    );
  }
  private async apply(days: readonly SimulatedDay[]): Promise<void> {
    for (const day of days) await this.feed.sync(day);
    await this.recovery.load();
    // Recalculate alerts in the background; the API used for measurements may be slow.
    void this.physiology.load();
    const entries = days.map((day) => ({ id: this.clock.id(), day })).reverse();
    this.history.update((rows) => [...entries, ...rows].slice(0, 10));
  }
}
