import '@angular/compiler';
import { createEnvironmentInjector, runInInjectionContext, signal } from '@angular/core';
import { describe, expect, it } from 'vitest';
import { Clock } from '../../../shared/application/clock';
import { SimulatedDay } from '../domain/model/wearable-simulation';
import { WearableFeed } from './ports/wearable-feed';
import { PhysiologicalStore } from './physiological.store';
import { RecoverySimulationStore } from './recovery-simulation.store';
import { WearableSimulatorStore } from './wearable-simulator.store';
function setup(failing = false) {
  const synced: SimulatedDay[] = [];
  const score = signal<number | null>(null);
  const battery: number[] = [];
  let ids = 0;
  const injector = createEnvironmentInjector(
    [
      {
        provide: WearableFeed,
        useValue: {
          sync: async (day: SimulatedDay) => {
            if (failing) throw new Error('This period overlaps an existing sleep record.');
            synced.push(day);
          },
        },
      },
      { provide: Clock, useValue: { today: () => '2026-10-24', id: () => 'id-' + ++ids } },
      {
        provide: RecoverySimulationStore,
        useValue: { load: async () => score.set(31), last: () => ({ score: score() }) },
      },
      {
        provide: PhysiologicalStore,
        useValue: {
          deviceScenario: async (_outcome: string, level: number) => (battery.push(level), true),
          load: async () => true,
          error: () => null,
        },
      },
    ],
    null as never,
  );
  const store = runInInjectionContext(injector, () => new WearableSimulatorStore());
  store.random = () => 0.5;
  return { store, synced, battery };
}
describe('WearableSimulatorStore', () => {
  it('syncs a simulated day, refreshes recovery and keeps a history entry', async () => {
    const { store, synced } = setup();
    expect(await store.simulate('overloadDay')).toBe(true);
    expect(synced).toHaveLength(1);
    expect(synced[0]!.date).toBe('2026-10-24');
    expect(store.recoveryLevel()).toBe(31);
    expect(store.history()[0]!.day.scenario).toBe('overloadDay');
    expect(store.message()).toBe('simulator.saved');
  });
  it('syncs a full week in chronological order', async () => {
    const { store, synced } = setup();
    expect(await store.simulateWeek()).toBe(true);
    expect(synced.map((day) => day.date)).toEqual([
      '2026-10-18',
      '2026-10-19',
      '2026-10-20',
      '2026-10-21',
      '2026-10-22',
      '2026-10-23',
      '2026-10-24',
    ]);
    expect(store.history()[0]!.day.date).toBe('2026-10-24');
  });
  it('reports a failed sync without adding history', async () => {
    const { store } = setup(true);
    expect(await store.simulate('restfulNight')).toBe(false);
    expect(store.error()).toContain('overlaps');
    expect(store.history()).toEqual([]);
  });
  it('sends a low battery reading to the simulated device', async () => {
    const { store, battery } = setup();
    expect(await store.setBattery(10)).toBe(true);
    expect(battery).toEqual([10]);
    expect(store.message()).toBe('simulator.batteryLow');
  });
});
