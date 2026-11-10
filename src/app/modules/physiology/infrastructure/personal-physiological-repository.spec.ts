import '@angular/compiler';
import { createEnvironmentInjector, runInInjectionContext } from '@angular/core';
import { afterEach, describe, expect, it } from 'vitest';
import { PersonalPhysiologicalRepository } from './personal-physiological-repository';
import { RecoverySimulationStore } from '../application/recovery-simulation.store';
import { RecoverySource } from '../application/ports/recovery-source';
import { RecoveryInput } from '../domain/model/recovery-simulation';
import { BrowserStorage } from '../../../shared/infrastructure/browser-storage';
import { Clock } from '../../../shared/application/clock';
import { I18n } from '../../../shared/application/i18n';
const cleanup: (() => void)[] = [];
afterEach(() => cleanup.splice(0).forEach((dispose) => dispose()));
function setup() {
  const rows: RecoveryInput[] = ['2026-10-06', '2026-10-07', '2026-10-08'].map((date) => ({
    date,
    sleepHours: 5,
    stress: 9,
    effort: 9,
    planned: false,
  }));
  const saved = new Map<string, unknown>();
  let sequence = 0;
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
      { provide: I18n, useValue: { format: (key: string) => key } },
    ],
    null as never,
  );
  cleanup.push(() => injector.destroy());
  return runInInjectionContext(injector, () => new PersonalPhysiologicalRepository());
}
describe('Personal physiological repository', () => {
  it("calculates recovery from local records without inventing wearable measurements", async () => {
    const overview = await setup().load();
    expect(overview.records).toEqual([]);
    expect(overview.assessment?.level).toBe(27);
    expect(overview.alerts.map((alert) => alert.id).sort()).toEqual([
      'load-2026-10-08',
      'sleep-2026-10-08',
    ]);
    expect(overview.recommendations[0]?.title).toBe('simulator.guidance.rest');
  });
  it('answers from the records and declines unrelated questions', async () => {
    const repository = setup();
    const sleep = await repository.ask(null, '¿Dormí bien esta semana?');
    expect(sleep.messages.at(-1)?.content).toContain('guide.sleep.summary');
    const offTopic = await repository.ask(sleep, 'Cuéntame la historia del Perú');
    expect(offTopic.messages.at(-1)?.content).toBe('guide.outOfScope');
    expect(offTopic.messages).toHaveLength(4);
  });
});
