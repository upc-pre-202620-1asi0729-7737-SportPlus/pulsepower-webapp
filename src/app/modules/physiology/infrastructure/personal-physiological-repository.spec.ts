import '@angular/compiler';
import { Api } from '../../../shared/infrastructure/api';

import { createEnvironmentInjector, runInInjectionContext } from '@angular/core';
import { afterEach, describe, expect, it } from 'vitest';
import { PersonalPhysiologicalRepository } from './personal-physiological-repository';
import { HttpPhysiologicalRepository } from './http-physiological-repository';
import { PhysiologicalOverviewDto } from './physiological-overview.dto';
import { RecoverySimulationStore } from '../application/recovery-simulation.store';
import { RecoverySource } from '../application/ports/recovery-source';
import { RecoveryInput } from '../domain/model/recovery-simulation';
import { BrowserStorage } from '../../../shared/infrastructure/browser-storage';
import { Clock } from '../../../shared/application/clock';
import { I18n } from '../../../shared/application/i18n';
const cleanup: (() => void)[] = [];
afterEach(() => cleanup.splice(0).forEach((dispose) => dispose()));
const api: PhysiologicalOverviewDto = {
  integration_available: true,
  connection: null,
  records: [
    { id: 'hrv-old', metric: 'HRV', value: 60, unit: 'ms', recorded_at: '2026-10-01T11:00:00Z' },
    { id: 'hrv-new', metric: 'HRV', value: 71, unit: 'ms', recorded_at: '2026-10-07T11:00:00Z' },
    {
      id: 'rhr',
      metric: 'RESTING_HR',
      value: 55,
      unit: 'bpm',
      recorded_at: '2026-10-07T11:00:00Z',
    },
    { id: 'hr', metric: 'HEART_RATE', value: 74, unit: 'bpm', recorded_at: '2026-10-07T13:00:00Z' },
  ],
  recovery: { id: 'api', level: 72, calculated_at: '2026-10-08T12:00:00Z', explanation: '' },
  recommendations: [],
  alerts: [],
};
function setup(available = true) {
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
      {
        provide: HttpPhysiologicalRepository,
        useValue: {
          fetchOverview: async () => {
            if (!available) throw new Error('offline');
            return api;
          },
        },
      },
      { provide: Api, useValue: { post: async (path: string, body: {message:string}) => { expect(path).toBe('/assistant/messages'); expect(Object.keys(body)).toEqual(['message']); return {answer:body.message.includes('Perú') ? 'Fuera de mi alcance' : 'Datos de tu cuenta'}; } } },
      { provide: I18n, useValue: { format: (key: string) => key } },
    ],
    null as never,
  );
  cleanup.push(() => injector.destroy());
  return runInInjectionContext(injector, () => new PersonalPhysiologicalRepository());
}
describe('Personal physiological repository', () => {
  it("takes the latest wearable measurements from the API and recovery from the user's records", async () => {
    const overview = await setup().load();
    expect(overview.records.map((row) => row.id)).toEqual(['hrv-new', 'rhr']);
    expect(overview.assessment?.level).toBe(27);
    expect(overview.alerts.map((alert) => alert.id).sort()).toEqual([
      'load-2026-10-08',
      'sleep-2026-10-08',
    ]);
    expect(overview.recommendations[0]?.title).toBe('simulator.guidance.rest');
  });
  it('reports API failures instead of silently showing empty measurements', async () => {
    await expect(setup(false).load()).rejects.toThrow('offline');
  });
  it('answers from the records and declines unrelated questions', async () => {
    const repository = setup();
    const sleep = await repository.ask(null, '¿Dormí bien esta semana?');
    expect(sleep.messages.at(-1)?.content).toBe('Datos de tu cuenta');
    const offTopic = await repository.ask(sleep, 'Cuéntame la historia del Perú');
    expect(offTopic.messages.at(-1)?.content).toBe('Fuera de mi alcance');
    expect(offTopic.messages).toHaveLength(4);
  });
});
