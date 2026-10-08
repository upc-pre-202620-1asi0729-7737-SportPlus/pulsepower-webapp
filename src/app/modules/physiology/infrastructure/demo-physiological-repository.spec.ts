import '@angular/compiler';
import { createEnvironmentInjector, runInInjectionContext } from '@angular/core';
import { afterEach, describe, expect, it } from 'vitest';
import { DemoPhysiologicalRepository } from './demo-physiological-repository';
import { RecoverySimulationStore } from '../application/recovery-simulation.store';
import { RecoverySource } from '../application/ports/recovery-source';
import { RecoveryInput } from '../domain/model/recovery-simulation';
import { BrowserStorage } from '../../../shared/infrastructure/browser-storage';
import { Clock } from '../../../shared/application/clock';
const cleanup: (() => void)[] = [];
afterEach(() => {
  cleanup.splice(0).forEach((dispose) => dispose());
});
function setup() {
  let rows: RecoveryInput[] = [];
  let sequence = 0;
  const saved = new Map<string, unknown>();
  const injector = createEnvironmentInjector(
    [
      {
        provide: Clock,
        useValue: {
          now: () => new Date('2026-10-08T12:00:00Z'),
          today: () => '2026-10-08',
          id: () => String(++sequence),
        },
      },
      {
        provide: RecoverySource,
        useValue: { read: async () => ({ rows, targetHours: 8, goal: '' }) },
      },
      { provide: RecoverySimulationStore, useFactory: () => new RecoverySimulationStore() },
      {
        provide: BrowserStorage,
        useValue: {
          read: (key: string, decode: (value: unknown) => unknown, fallback: () => unknown) =>
            saved.has(key) ? decode(structuredClone(saved.get(key))) : fallback(),
          write: (key: string, value: unknown) => saved.set(key, structuredClone(value)),
        },
      },
    ],
    null as never,
  );
  cleanup.push(() => injector.destroy());
  const create = () => runInInjectionContext(injector, () => new DemoPhysiologicalRepository());
  return {
    repository: create(),
    create,
    setRows: (value: RecoveryInput[]) => {
      rows = value;
    },
  };
}
function nights(hours: number | null, effort = 0, stress = 0): RecoveryInput[] {
  return ['2026-10-06', '2026-10-07', '2026-10-08'].map((date) => ({
    date,
    sleepHours: hours,
    effort,
    stress,
    planned: false,
  }));
}
describe('Simulated guidance alerts', () => {
  it('keeps healthy and missing histories empty instead of inventing alerts', async () => {
    const context = setup();
    for (const rows of [[], nights(null), nights(8)]) {
      context.setRows(rows);
      expect((await context.repository.load()).alerts).toEqual([]);
    }
  });
  it('generates sleep and training alerts from updated records and preserves history without daily duplicates', async () => {
    const context = setup();
    context.setRows(nights(8));
    expect((await context.repository.load()).alerts).toHaveLength(0);
    context.setRows(nights(4, 8, 8));
    const first = (await context.repository.load()).alerts;
    expect(first.map((alert) => alert.id).sort()).toEqual(['load-2026-10-08', 'sleep-2026-10-08']);
    expect((await context.repository.load()).alerts).toEqual(first);
    context.setRows(nights(8));
    expect((await context.create().load()).alerts).toEqual(first);
  });
  it('requires connection, warns below 15%, persists and rearms only above 15%', async () => {
    const { repository, create } = setup();
    expect((await repository.deviceScenario('disconnected', 10)).alerts).toHaveLength(0);
    expect((await repository.deviceScenario('success', 15)).alerts).toHaveLength(0);
    expect((await repository.deviceScenario('success', 10)).alerts).toHaveLength(1);
    expect((await create().load()).alerts).toHaveLength(1);
    await repository.deviceScenario('success', 15);
    expect((await repository.deviceScenario('success', 10)).alerts).toHaveLength(1);
    await repository.deviceScenario('success', 16);
    expect((await repository.deviceScenario('success', 10)).alerts).toHaveLength(2);
  });
});
